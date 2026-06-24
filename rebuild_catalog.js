// Seeds the catalog from the real PDF product line (63 products, 105 size variants).
// Each size carries its own SKU-coded vial image. Tier-3 (highest) USD pricing per vial.
// Idempotent: only wipes + reseeds products when the table is empty, or when run
// with `node rebuild_catalog.js --force`. Safe to run on every deploy.
const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const { db } = require('./db');
const fs = require('fs'), path = require('path');
const slug = s => slugify(s, { lower: true, strict: true, locale: 'es' });
const FORCE = process.argv.includes('--force');

// Schema (idempotent)
try { db.exec("ALTER TABLE products ADD COLUMN sizes TEXT NOT NULL DEFAULT ''"); } catch (_) {}
try { db.exec("ALTER TABLE products ADD COLUMN name_en TEXT NOT NULL DEFAULT ''"); } catch (_) {}
try { db.exec("ALTER TABLE products ADD COLUMN short_description_en TEXT NOT NULL DEFAULT ''"); } catch (_) {}
try { db.exec("ALTER TABLE categories ADD COLUMN name_en TEXT NOT NULL DEFAULT ''"); } catch (_) {}
try { db.exec("ALTER TABLE categories ADD COLUMN description_en TEXT NOT NULL DEFAULT ''"); } catch (_) {}
try { db.exec("ALTER TABLE order_items ADD COLUMN size TEXT NOT NULL DEFAULT ''"); } catch (_) {}

// One-time clean permalink (idempotent): rename the acetic-acid product's auto-slug
// 'acido-acetico-agua' to the cleaner permanent 'acetic-acid'. Runs on every deploy and no-ops once
// applied. Done BEFORE its QR label is printed, so no installed label is affected. After this, the
// slug is frozen like every other (see the slug-preservation snapshot below).
try { db.exec("UPDATE products SET slug='acetic-acid' WHERE slug='acido-acetico-agua'"); } catch (_) {}

// One-time backfill (idempotent): write the Lipo-C (LC216) blend formula into its description, but
// ONLY while it still has the original generic text — so a later admin edit is never clobbered.
try {
  db.prepare("UPDATE products SET short_description = ?, short_description_en = ? WHERE sizes LIKE '%\"code\":\"LC216\"%' AND short_description LIKE 'Compuesto lipotrópico%'")
    .run('Inyección lipotrópica (MIC). L-Carnitina 20mg · L-Arginina 20mg · Metionina 25mg · Inositol 50mg · Colina 50mg · B6 25mg · B5 25mg.',
         'Lipotropic (MIC) injection. L-Carnitine 20mg · L-Arginine 20mg · Methionine 25mg · Inositol 50mg · Choline 50mg · B6 25mg · B5 25mg.');
} catch (_) {}

// Wire the generated vial images onto the 5 new blends once their PNGs exist (idempotent — only sets
// when the product's image is still empty, so it never fights a later admin image change).
for (const code of ['LC120', 'LC526', 'LC553', 'SHB', 'HHB']) {
  try {
    const file = code.toLowerCase() + '.png';
    if (!fs.existsSync(path.join(__dirname, 'public', 'uploads', file))) continue;
    const url = '/uploads/' + file;
    const row = db.prepare("SELECT id, sizes FROM products WHERE sizes LIKE ? AND (image IS NULL OR image = '')").get(`%"code":"${code}"%`);
    if (!row) continue;
    let szs = JSON.parse(row.sizes);
    szs = szs.map(s => (s && String(s.code).toUpperCase() === code) ? Object.assign({}, s, { img: url }) : s);
    db.prepare('UPDATE products SET image = ?, sizes = ? WHERE id = ?').run(url, JSON.stringify(szs), row.id);
  } catch (_) {}
}

// Admin (only if missing)
if (!db.prepare('SELECT id FROM admins WHERE username = ?').get('admin')) {
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', bcrypt.hashSync('admin123', 10));
  console.log('✓ Created default admin (admin / admin123)');
}

// Categories (idempotent, with EN translations)
const CATS = [
  ['Metabólicos','Metabolic','Análogos GLP-1 y compuestos para investigación metabólica y composición corporal.','GLP-1 analogs and compounds for metabolic and body-composition research.',0],
  ['Recuperación','Recovery','Péptidos de reparación tisular y modulación inflamatoria.','Tissue-repair peptides and inflammatory modulation.',1],
  ['Cognitivos','Cognitive','Investigación en función cognitiva, memoria, sueño y enfoque.','Research on cognitive function, memory, sleep, and focus.',2],
  ['Longevidad','Longevity','Investigación en envejecimiento celular y metabolismo energético.','Research on cellular aging and energy metabolism.',3],
  ['Inmunidad','Immunity','Modulación de la respuesta inmune.','Immune-response modulation.',4],
  ['Hormona de crecimiento','Growth Hormone','Secretagogos y análogos de GHRH para investigación endocrina.','Secretagogues and GHRH analogs for endocrine research.',5],
  ['Reproductivos','Reproductive','Análogos hipotalámicos y de melanocortina para investigación endocrina.','Hypothalamic and melanocortin analogs for endocrine research.',6],
  ['Combos','Stacks','Combinaciones de péptidos para protocolos de investigación.','Peptide combinations for research protocols.',7],
  ['Estética y piel','Skin & Aesthetics','Investigación en regeneración cutánea, pigmentación y crecimiento capilar.','Research on skin regeneration, pigmentation, and hair growth.',8],
  ['Accesorios','Accessories','Soluciones para reconstitución de péptidos liofilizados.','Solutions for reconstituting lyophilized peptides.',9]
];
const insCat = db.prepare('INSERT OR IGNORE INTO categories (name, slug, description, sort_order, name_en, description_en) VALUES (?, ?, ?, ?, ?, ?)');
// Key on slug, not name: a prior seed may have created the same slug under a
// different name. Insert if the slug is new, otherwise correct the row in place.
const upCat  = db.prepare('UPDATE categories SET name=?, description=?, sort_order=?, name_en=?, description_en=? WHERE slug=?');
for (const [es, en, dEs, dEn, ord] of CATS) {
  const s = slug(es);
  insCat.run(es, s, dEs, ord, en, dEn);
  try { upCat.run(es, dEs, ord, en, dEn, s); } catch (_) {} // name is UNIQUE; ignore rare collisions, slug lookup still resolves
}

// Spanish-language ES settings (idempotent — don't clobber live values)
const insSet = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
insSet.run('shipping_note_es', 'Envíos internacionales. 2-5 días hábiles.');
insSet.run('legal_disclaimer_es', 'Productos exclusivamente para uso de investigación. No aptos para consumo humano ni veterinario.');

// New blend products (added 2026-06-23, $80 / 10ml each). Defined once here and spread into P below,
// so --force and a fresh DB seed them too. Shape matches P: [cat, name_es, name_en, short_es, short_en, [[code,label,price,stock]], featured]
const NEW_BLENDS = [
  ['Metabólicos','Lipo-C 120 (Clear)','Lipo-C 120 (Clear)','Inyección lipotrópica (versión clear). Metionina 15mg · Cloruro de colina 50mg · Carnitina 50mg.','Lipotropic injection (clear). Methionine 15mg · Choline Chloride 50mg · Carnitine 50mg.',[['LC120','10ml',80,20]],0],
  ['Metabólicos','Lipo-C Fat Blaster','Lipo-C Fat Blaster','Lipotrópico de alta potencia. L-Carnitina 300mg · Metionina 25mg · Inositol 50mg · Colina 50mg · B12 1mg · B6 50mg.','High-strength lipotropic. L-Carnitine 300mg · Methionine 25mg · Inositol 50mg · Choline 50mg · B12 1mg · B6 50mg.',[['LC526','10ml',80,20]],0],
  ['Metabólicos','Super Shred','Super Shred','Mezcla avanzada para definición. L-Carnitina 400mg · Mezcla MIC 100mg · ATP 50mg · Albuterol 2mg · B12 1mg.','Advanced shred blend. L-Carnitine 400mg · MIC Blend 100mg · ATP 50mg · Albuterol 2mg · B12 1mg.',[['LC553','10ml',80,20]],0],
  ['Recuperación','Super Human Blend','Super Human Blend','Mezcla de aminoácidos para rendimiento y recuperación. L-Arginina 110mg · L-Ornitina 110mg · L-Citrulina 120mg · L-Lisina 70mg · L-Glutamina 40mg · L-Prolina 60mg · L-Taurina 60mg · L-Carnitina 220mg · NAC 75mg.','Amino blend for performance and recovery. L-Arginine 110mg · L-Ornithine 110mg · L-Citrulline 120mg · L-Lysine 70mg · L-Glutamine 40mg · L-Proline 60mg · L-Taurine 60mg · L-Carnitine 220mg · NAC 75mg.',[['SHB','10ml',80,20]],0],
  ['Estética y piel','Healthy Hair, Skin & Nails','Healthy Hair, Skin & Nails','Mezcla de vitaminas para cabello, piel y uñas. Niacinamida 50mg · Tiamina HCL 50mg · Ácido pantoténico 25mg · Colina 10mg · Inositol 10mg.','Vitamin blend for hair, skin & nails. Niacinamide 50mg · Thiamine HCL 50mg · Pantothenic Acid 25mg · Choline 10mg · Inositol 10mg.',[['HHB','10ml',80,20]],0,'healthy-hair-skin-nails'],
];

const existingCount = db.prepare('SELECT COUNT(*) c FROM products').get().c;

// Idempotent ADD: when the catalog is already populated, INSERT any NEW_BLENDS product whose vial
// code is missing — so new products go live on a NORMAL deploy WITHOUT --force (which would wipe
// admin price edits). Existing rows are never touched. On a fresh/empty DB the full reseed below
// (P already includes NEW_BLENDS) covers them, so this guard skips it.
if (existingCount > 0) {
  const _insBlend = db.prepare(`INSERT INTO products
    (name, name_en, slug, category_id, short_description, short_description_en, presentation, purity, price, stock, image, sizes, featured, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`);
  let _added = 0;
  for (const [cat, nameEs, nameEn, sEs, sEn, rawSizes, featured, slugOverride] of NEW_BLENDS) {
    const code = rawSizes[0][0];
    if (db.prepare('SELECT 1 FROM products WHERE sizes LIKE ?').get(`%"code":"${code}"%`)) continue;
    try {
      const catRow = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug(cat));
      const sizes = rawSizes.map(([c, label, price, stock]) => ({ label, price, stock, code: c, img: '' }));
      const presentation = sizes.length === 1 ? `Vial ${sizes[0].label} · 10 viales / kit` : `${sizes.length} presentaciones · 10 viales / kit`;
      _insBlend.run(nameEs, nameEn, slugOverride || slug(nameEs), catRow ? catRow.id : null, sEs, sEn, presentation, 'HPLC >99%',
        Math.min(...sizes.map(s => s.price)), sizes.reduce((a, s) => a + s.stock, 0), '', JSON.stringify(sizes), featured ? 1 : 0);
      _added++;
    } catch (e) { console.error('blend add skip', code, e.message); }
  }
  if (_added) console.log(`✓ Added ${_added} new blend product(s)`);
}

if (existingCount > 0 && !FORCE) {
  console.log(`Catalog has ${existingCount} products — kept as-is; use --force to fully rebuild.`);
  process.exit(0);
}

const img = code => {
  const file = code.toLowerCase() + '.png';
  return fs.existsSync(path.join(__dirname, 'public', 'uploads', file)) ? `/uploads/${file}` : '';
};

// [category, name_es, name_en, short_es, short_en, [[code,label,price,stock]...], featured]
const P = [
  ['Metabólicos','Tirzepatide','Tirzepatide','Análogo dual GLP-1 / GIP para control glucémico y composición corporal.','Dual GLP-1 / GIP analog for glycemic control and body composition.',
    [['TR5','5mg',48,30],['TR10','10mg',102,28],['TR15','15mg',81,22],['TR20','20mg',108,18],['TR30','30mg',164,12],['TR60','60mg',228,8]],1],
  ['Metabólicos','Semaglutide','Semaglutide','Análogo GLP-1 para investigación en metabolismo de glucosa y apetito.','GLP-1 analog for glucose-metabolism and appetite research.',
    [['SM5','5mg',92,30],['SM10','10mg',81,24],['SM15','15mg',79,18],['SM20','20mg',118,12]],1],
  ['Metabólicos','Retatrutide','Retatrutide','Agonista triple GLP-1 / GIP / glucagón de última generación.','Next-gen triple GLP-1 / GIP / glucagon agonist.',
    [['RT5','5mg',79,24],['RT10','10mg',98,28],['RT20','20mg',180,14],['RT30','30mg',219,10],['RT50','50mg',403,6],['RT60','60mg',518,5]],1],
  ['Metabólicos','Cagrilintide','Cagrilintide','Análogo de amilina para investigación en saciedad y composición corporal.','Amylin analog for satiety and body-composition research.',
    [['CGL5','5mg',102,16],['CGL10','10mg',222,8]],0],
  ['Metabólicos','Lipo-C','Lipo-C','Inyección lipotrópica (MIC). L-Carnitina 20mg · L-Arginina 20mg · Metionina 25mg · Inositol 50mg · Colina 50mg · B6 25mg · B5 25mg.','Lipotropic (MIC) injection. L-Carnitine 20mg · L-Arginine 20mg · Methionine 25mg · Inositol 50mg · Choline 50mg · B6 25mg · B5 25mg.',
    [['LC216','10ml',78,22]],0],
  ['Metabólicos','Vitamina B12','Vitamin B12','Cobalamina inyectable para metabolismo energético y función neurológica.','Injectable cobalamin for energy metabolism and neurological function.',
    [['B12','10mg',87,30]],0],
  ['Metabólicos','AOD9604','AOD9604','Fragmento 176-191 de la HGH para investigación lipolítica.','176-191 HGH fragment for lipolytic research.',
    [['5AD','5mg',88,20],['10AD','10mg',161,12]],0],
  ['Metabólicos','5-Amino-1MQ','5-Amino-1MQ','Inhibidor selectivo de NNMT para regulación de NAD+ y metabolismo.','Selective NNMT inhibitor for NAD+ regulation and metabolism.',
    [['10AM','10mg',155,10]],0],
  ['Metabólicos','AICAR','AICAR','Activador de AMPK para metabolismo energético y biogénesis mitocondrial.','AMPK activator for energy metabolism and mitochondrial biogenesis.',
    [['AR50','50mg',58,18]],0],
  ['Metabólicos','Adipotide','Adipotide','Péptido proapoptótico dirigido a la vasculatura del tejido adiposo.','Proapoptotic peptide targeting adipose-tissue vasculature.',
    [['AP5','5mg',136,8]],0],
  ['Metabólicos','SLU-PP-332','SLU-PP-332','Agonista pan-ERR para biogénesis mitocondrial y rendimiento.','Pan-ERR agonist for mitochondrial biogenesis and performance.',
    [['PP332','10mg',122,10]],0],
  ['Metabólicos','Survodutide','Survodutide','Agonista dual GLP-1 / glucagón para investigación metabólica.','Dual GLP-1 / glucagon agonist for metabolic research.',
    [['SUR10','10mg',257,10]],0],
  ['Metabólicos','Mazdutide','Mazdutide','Agonista dual GLP-1 / glucagón para investigación metabólica.','Dual GLP-1 / glucagon agonist for metabolic research.',
    [['MDT10','10mg',208,12]],0],
  ['Metabólicos','L-Carnitina','L-Carnitine','Aminoácido inyectable para transporte de ácidos grasos.','Injectable amino acid for fatty-acid transport.',
    [['LC600','600mg / 10ml',40,28],['LC1200','1200mg / 10ml',74,18]],0],

  ['Recuperación','TB-500 (Thymosin β-4)','TB-500 (Thymosin β-4)','Fragmento de Timosina Beta-4 para angiogénesis y migración celular.','Thymosin Beta-4 fragment for angiogenesis and cellular migration.',
    [['BT5','5mg',77,30],['BT10','10mg',146,18]],1],
  ['Recuperación','BPC-157','BPC-157','Pentadecapéptido para reparación tisular gastrointestinal y musculoesquelética.','Pentadecapeptide for gastrointestinal and musculoskeletal tissue repair.',
    [['BC5','5mg',58,40],['BC10','10mg',81,28]],1],
  ['Recuperación','KPV','KPV','Tripéptido derivado de α-MSH para investigación antiinflamatoria local.','α-MSH-derived tripeptide for local anti-inflammation research.',
    [['KP10','10mg',81,20]],0],
  ['Recuperación','ARA-290 (Cibinetide)','ARA-290 (Cibinetide)','Análogo de EPO sin actividad hematopoyética; investigación antiinflamatoria.','EPO analog without hematopoietic activity; anti-inflammatory research.',
    [['RA10','10mg',72,15]],0],
  ['Recuperación','VIP','VIP','Péptido vasoactivo intestinal para función inmune y respiratoria.','Vasoactive intestinal peptide for immune and respiratory function.',
    [['VP10','10mg',155,8]],0],
  ['Recuperación','Dermorfina','Dermorphin','Heptapéptido opioide para investigación en receptores μ-opioides.','Opioid heptapeptide for μ-opioid receptor research.',
    [['DR5','10mg',35,15]],0],
  ['Recuperación','PEG-MGF','PEG-MGF','Factor de crecimiento mecánico pegilado para reparación muscular.','Pegylated mechano growth factor for muscle repair.',
    [['FMP2','2mg',78,18]],0],
  ['Recuperación','MGF','MGF','Factor de crecimiento mecánico para reparación muscular.','Mechano growth factor for muscle repair.',
    [['FM2','2mg',61,18]],0],

  ['Cognitivos','Semax','Semax','Heptapéptido análogo de ACTH(4-10) para neuroprotección y cognición.','ACTH(4-10) analog heptapeptide for neuroprotection and cognition.',
    [['SX5','5mg',39,22],['SX10','10mg',72,18]],0],
  ['Cognitivos','Selank','Selank','Tetrapéptido derivado de la tuftsina para ansiedad y enfoque.','Tuftsin-derived tetrapeptide for anxiety and focus.',
    [['SK5','5mg',40,22],['SK10','10mg',63,18]],0],
  ['Cognitivos','DSIP','DSIP','Péptido inductor de sueño delta para arquitectura del sueño.','Delta-sleep inducing peptide for sleep-architecture research.',
    [['DS5','5mg',68,15]],0],
  ['Cognitivos','Pinealon','Pinealon','Tripéptido pineal para función cognitiva y antienvejecimiento.','Pineal tripeptide for cognitive function and anti-aging.',
    [['PL10','10mg',54,18],['PL20','20mg',84,12]],0],

  ['Longevidad','Epitalon','Epitalon','Tetrapéptido pineal para regulación de telómeros y ritmo circadiano.','Pineal tetrapeptide for telomere regulation and circadian rhythm.',
    [['ET10','10mg',33,25],['ET50','50mg',141,12]],0],
  ['Longevidad','MOTS-c','MOTS-c','Péptido mitocondrial para metabolismo energético y sensibilidad a insulina.','Mitochondrial-derived peptide for energy metabolism and insulin sensitivity.',
    [['MS10','10mg',81,18],['MS40','40mg',142,10]],0],
  ['Longevidad','NAD+','NAD+','Coenzima esencial redox para metabolismo energético y longevidad celular.','Essential redox coenzyme for energy metabolism and cellular longevity.',
    [['NJ100','100mg',44,30],['NJ500','500mg',90,18],['NJ1000','1000mg',131,10]],0],
  ['Longevidad','SS-31 (Elamipretide)','SS-31 (Elamipretide)','Péptido dirigido a cardiolipina mitocondrial.','Peptide targeting mitochondrial cardiolipin.',
    [['2S10','10mg',103,12],['2S50','50mg',403,5]],0],
  ['Longevidad','FOXO4-DRI','FOXO4-DRI','Péptido senolítico para eliminación de células senescentes.','Senolytic peptide for senescent-cell elimination.',
    [['F410','10mg',435,4]],0],
  ['Longevidad','Glutatión','Glutathione','Antioxidante endógeno inyectable para detox y estrés oxidativo.','Endogenous injectable antioxidant for detox and oxidative stress.',
    [['GTT600','600mg',52,20]],0],

  ['Inmunidad','Thymosin α-1 (Tα1)','Thymosin α-1 (Tα1)','Péptido tímico de 28 aminoácidos para modulación inmune.','28-amino-acid thymic peptide for immune modulation.',
    [['TA10','10mg',146,10]],0],
  ['Inmunidad','Thymalin','Thymalin','Polipéptido tímico para modulación inmune.','Thymic polypeptide for immune modulation.',
    [['TY10','10mg',62,15]],0],
  ['Inmunidad','LL-37','LL-37','Péptido catelicidina antimicrobiana para inmunidad innata.','Antimicrobial cathelicidin peptide for innate immunity.',
    [['375','5mg',94,12]],0],

  ['Hormona de crecimiento','Ipamorelin','Ipamorelin','Pentapéptido secretagogo selectivo del eje GH/IGF-1.','Selective secretagogue pentapeptide of the GH/IGF-1 axis.',
    [['IP5','5mg',40,30],['IP10','10mg',74,22]],0],
  ['Hormona de crecimiento','CJC-1295 sin DAC','CJC-1295 No DAC','Análogo de GHRH de acción corta para pulsos de GH.','Short-acting GHRH analog for GH pulses.',
    [['CND5','5mg',94,20],['CND10','10mg',161,12]],0],
  ['Hormona de crecimiento','CJC-1295 con DAC','CJC-1295 with DAC','Análogo de GHRH de acción prolongada (~7 días).','Long-acting GHRH analog (~7-day half-life).',
    [['CD2','2mg',72,18],['CD5','5mg',150,10]],0],
  ['Hormona de crecimiento','Sermorelin','Sermorelin','Análogo de GHRH (1-29) para estimulación de GH endógena.','GHRH (1-29) analog for endogenous GH stimulation.',
    [['SMO5','5mg',74,20],['SMO10','10mg',139,12]],0],
  ['Hormona de crecimiento','Tesamorelin','Tesamorelin','Análogo de GHRH (1-44) para composición corporal y grasa visceral.','GHRH (1-44) analog for body composition and visceral fat.',
    [['TSM5','5mg',114,12],['TSM10','10mg',142,8]],0],
  ['Hormona de crecimiento','GHRP-2','GHRP-2','Hexapéptido secretagogo de GH.','GH secretagogue hexapeptide.',
    [['G210','10mg',53,20]],0],
  ['Hormona de crecimiento','GHRP-6','GHRP-6','Hexapéptido secretagogo de GH con efecto sobre apetito.','GH secretagogue hexapeptide with appetite effects.',
    [['G610','10mg',53,20]],0],
  ['Hormona de crecimiento','Hexarelin','Hexarelin','Hexapéptido secretagogo de GH potente.','Potent GH secretagogue hexapeptide.',
    [['HX5','5mg',76,15]],0],
  ['Hormona de crecimiento','IGF-1 LR3','IGF-1 LR3','Análogo de IGF-1 long-R3 con vida media prolongada.','Long-R3 IGF-1 analog with extended half-life.',
    [['IG01','0.1mg',44,20],['IG1','1mg',191,8]],0],
  ['Hormona de crecimiento','HGH 191AA','HGH 191AA','Hormona de crecimiento humana recombinante (somatropina).','Recombinant human growth hormone (somatropin).',
    [['H10','10 IU',52,18],['H15','15 IU',74,12],['H24','24 IU',121,8]],0],

  ['Reproductivos','PT-141 (Bremelanotide)','PT-141 (Bremelanotide)','Análogo de melanocortina para función sexual y receptor MC4.','Melanocortin analog for sexual function and the MC4 receptor.',
    [['P41','10mg',70,18]],0],
  ['Reproductivos','Kisspeptin-10','Kisspeptin-10','Péptido derivado de KISS1 para el eje hipotálamo-hipófisis-gónadas.','KISS1-derived peptide for the hypothalamic-pituitary-gonadal axis.',
    [['KS5','5mg',87,15],['KS10','10mg',102,10]],0],
  ['Reproductivos','Oxitocina','Oxytocin','Nonapéptido hipofisario para vínculo social y comportamiento.','Pituitary nonapeptide for social bonding and behavior.',
    [['OT2','2mg',34,18],['OT5','5mg',54,12]],0],
  ['Reproductivos','HCG','HCG','Gonadotropina coriónica humana para el eje HPG.','Human chorionic gonadotropin for the HPG axis.',
    [['HC5K','5000 IU',95,15],['HC10K','10000 IU',177,8]],0],
  ['Reproductivos','HMG (Menotropina)','HMG (Menotropin)','Gonadotropina menopáusica humana para estimulación folicular.','Human menopausal gonadotropin for follicular stimulation.',
    [['G75','75 IU',83,12]],0],

  ['Estética y piel','Glow (TB-500 + BPC-157 + GHK-Cu)','Glow (TB-500 + BPC-157 + GHK-Cu)','Combo 70mg para regeneración tisular y cutánea.','70mg combo for tissue and skin regeneration.',
    [['BBG70','70mg',222,12]],1],
  ['Estética y piel','Klow (TB-500 + BPC-157 + GHK-Cu + KPV)','Klow (TB-500 + BPC-157 + GHK-Cu + KPV)','Combo 80mg: protocolo completo de reparación e inflamación.','80mg combo: complete repair and inflammation protocol.',
    [['Klow80','80mg',235,10]],0],
  ['Estética y piel','GHK-Cu','GHK-Cu','Tripéptido cobre para regeneración cutánea y expresión génica.','Copper tripeptide for skin regeneration and gene expression.',
    [['CU50','50mg',29,30],['CU100','100mg',76,18]],0],
  ['Estética y piel','AHK-Cu','AHK-Cu','Tripéptido cobre análogo de GHK para crecimiento capilar.','GHK-analog copper tripeptide for hair growth.',
    [['AHK100','100mg',58,20],['AHK500','500mg',113,10]],0],
  ['Estética y piel','Melanotan I','Melanotan I','Análogo de α-MSH para pigmentación cutánea.','α-MSH analog for skin pigmentation.',
    [['MT1','10mg',76,18]],0],
  ['Estética y piel','Melanotan II','Melanotan II','Análogo de α-MSH no selectivo para pigmentación y función sexual.','Non-selective α-MSH analog for pigmentation and sexual function.',
    [['ML10','10mg',59,22]],0],
  ['Estética y piel','Snap-8','Snap-8','Octapéptido derivado de SNAP-25 para relajación muscular cutánea.','SNAP-25-derived octapeptide for cutaneous muscle relaxation.',
    [['NP810','10mg',40,18]],0],
  ['Estética y piel','Lemon Bottle','Lemon Bottle','Lipotrópico inyectable para disolución localizada de adipocitos.','Injectable lipotropic for localized adipocyte dissolution.',
    [['LB','10ml',88,12]],0],

  ['Combos','Stack BPC-157 + TB-500','BPC-157 + TB-500 Stack','Combinación clásica para reparación tisular acelerada.','Classic combination for accelerated tissue repair.',
    [['BB10','10mg (BPC5+TB5)',102,16],['BB20','20mg (BPC10+TB10)',171,10]],0],
  ['Combos','Stack CJC-1295 + Ipamorelin','CJC-1295 + Ipamorelin Stack','Combinación de referencia para pulsos de hormona de crecimiento.','Reference combination for GH pulse research.',
    [['CP10','10mg',113,16]],0],
  ['Combos','Stack Cagrilintide + Semaglutide','Cagrilintide + Semaglutide Stack','Combinación GLP-1 / amilina para investigación metabólica avanzada.','GLP-1 / amylin combination for advanced metabolic research.',
    [['CS10','10mg',164,10]],0],

  ['Accesorios','Agua bacteriostática','Bacteriostatic Water','Solución estéril con 0.9% alcohol bencílico para reconstitución.','Sterile 0.9% benzyl-alcohol solution for reconstitution.',
    [['WA3','3ml',15,40],['WA10','10ml',10,40]],0],
  ['Accesorios','Ácido acético (agua)','Acetic Acid Water','Solución estéril de ácido acético 0.6% para péptidos sensibles a pH.','Sterile 0.6% acetic-acid solution for pH-sensitive peptides.',
    [['ADW3','3ml',20,25],['ADW10','10ml',22,20]],0,'acetic-acid'],   // explicit clean slug (see migration above) — keeps it on a fresh DB too

  ...NEW_BLENDS   // the 5 new blend products defined near the top — included so --force / a fresh DB seed them too
];

const catId = name => {
  const row = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug(name));
  if (!row) throw new Error(`Category not found for "${name}" (slug ${slug(name)})`);
  return row.id;
};

// PERMANENT LINKS: snapshot every existing vial CODE -> its product slug BEFORE wiping, so the
// rebuild REUSES the slug each printed QR already points to (/product/<slug>) instead of
// regenerating it from a possibly-changed name. Protects every already-installed vial label.
const codeToSlug = {};
try {
  for (const row of db.prepare('SELECT slug, sizes FROM products').all()) {
    let szs = []; try { szs = JSON.parse(row.sizes || '[]'); } catch (_) {}
    for (const s of (Array.isArray(szs) ? szs : [])) {
      if (s && s.code) codeToSlug[String(s.code).toUpperCase()] = row.slug;
    }
  }
} catch (_) {}

db.exec('DELETE FROM products');
db.exec("DELETE FROM sqlite_sequence WHERE name = 'products'");

const ins = db.prepare(`
  INSERT INTO products
    (name, name_en, slug, category_id, short_description, short_description_en, presentation, purity, price, stock, image, sizes, featured, active)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

db.exec('BEGIN');
let nProducts = 0, nImages = 0;
for (const [cat, nameEs, nameEn, shortEs, shortEn, rawSizes, featured, slugOverride] of P) {
  const sizes = rawSizes.map(([code, label, price, stock]) => {
    nImages++;
    return { label, price, stock, code, img: img(code) };
  });
  const minPrice = Math.min(...sizes.map(s => s.price));
  const totalStock = sizes.reduce((a, s) => a + s.stock, 0);
  const presentation = sizes.length === 1
    ? `Vial ${sizes[0].label} · 10 viales / kit`
    : `${sizes.length} presentaciones · 10 viales / kit`;
  // Reuse the existing slug if any of this product's codes already had one (keeps printed QR links
  // stable across rebuilds); only mint a fresh slug for genuinely new products.
  let prodSlug = null;
  for (const s of sizes) { const k = String(s.code).toUpperCase(); if (codeToSlug[k]) { prodSlug = codeToSlug[k]; break; } }
  if (!prodSlug) prodSlug = slugOverride || slug(nameEs);
  ins.run(nameEs, nameEn, prodSlug, catId(cat), shortEs, shortEn,
    presentation, 'HPLC >99%', minPrice, totalStock,
    sizes[0].img, JSON.stringify(sizes), featured ? 1 : 0);
  nProducts++;
}
db.exec('COMMIT');

console.log(`✓ ${nProducts} products rebuilt, ${nImages} size-images wired`);
console.log(`✓ Featured: ${db.prepare('SELECT COUNT(*) c FROM products WHERE featured=1').get().c}`);
