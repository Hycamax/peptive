const slugify = require('slugify');
const { db } = require('./db');
const slug = s => slugify(s, { lower: true, strict: true, locale: 'es' });

// ---- Schema migration ----
try { db.exec("ALTER TABLE products ADD COLUMN sizes TEXT NOT NULL DEFAULT ''"); } catch (_) {}
try { db.exec("ALTER TABLE order_items ADD COLUMN size TEXT NOT NULL DEFAULT ''"); } catch (_) {}

// ---- Brand settings ----
const set = (k, v) => db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(k, v);
set('store_name', 'Peptyx');
set('store_tagline', 'Science. Purity. Power.');
set('currency', 'USD');
set('currency_symbol', '$');
set('primary_color', '#1F6FEB');
set('shipping_note', 'Shipping nationwide. 2-5 business days.');
set('legal_disclaimer', 'Research compounds for laboratory use only. Not for human or veterinary consumption.');

// ---- Categories ----
const insCat = db.prepare('INSERT OR IGNORE INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)');
const upCat  = db.prepare('UPDATE categories SET description=?, sort_order=? WHERE name=?');
const cats = [
  ['Metabólicos',           'Análogos GLP-1 y compuestos para investigación metabólica y composición corporal.', 0],
  ['Recuperación',          'Péptidos de reparación tisular y modulación inflamatoria.', 1],
  ['Cognitivos',            'Investigación en función cognitiva, memoria, sueño y enfoque.', 2],
  ['Longevidad',            'Investigación en envejecimiento celular y metabolismo energético.', 3],
  ['Inmunidad',             'Modulación de la respuesta inmune.', 4],
  ['Hormona de crecimiento','Secretagogos y análogos de GHRH para investigación endocrina.', 5],
  ['Reproductivos',         'Análogos hipotalámicos y de melanocortina para investigación endocrina.', 6],
  ['Combos',                'Combinaciones de péptidos para protocolos de investigación.', 7],
  ['Estética y piel',       'Investigación en regeneración cutánea, pigmentación y crecimiento capilar.', 8],
  ['Accesorios',            'Soluciones para reconstitución de péptidos liofilizados.', 9]
];
for (const [n, d, o] of cats) { insCat.run(n, slug(n), d, o); upCat.run(d, o, n); }
const catId = name => db.prepare('SELECT id FROM categories WHERE name = ?').get(name).id;

// ---- Wipe and reseed products ----
db.exec('DELETE FROM products');
db.exec("DELETE FROM sqlite_sequence WHERE name = 'products'");

// Each entry: [category, name, short_description, sizes[], featured]
// sizes = [{label, price, stock}] — price is Tier 3 (+10% upsell), USD per vial
const products = [
  ['Metabólicos', 'Tirzepatide', 'Análogo dual GLP-1 / GIP. Compuesto líder en investigación de control glucémico y composición corporal.',
    [['5mg',48,20],['10mg',102,25],['15mg',81,18],['20mg',108,15],['30mg',164,12],['60mg',228,8]], true],
  ['Metabólicos', 'Semaglutide', 'Análogo GLP-1. Compuesto base para investigación en metabolismo de la glucosa y regulación del apetito.',
    [['5mg',92,30],['10mg',81,22],['15mg',79,18],['20mg',118,12]], true],
  ['Metabólicos', 'Retatrutide', 'Agonista triple GLP-1 / GIP / glucagón. Investigación metabólica de última generación.',
    [['5mg',79,22],['10mg',98,28],['20mg',180,14],['30mg',219,10],['50mg',403,6],['60mg',518,5]], true],
  ['Metabólicos', 'Cagrilintide', 'Análogo de amilina. Investigación en saciedad y composición corporal.',
    [['5mg',102,16],['10mg',222,8]], false],
  ['Metabólicos', 'Survodutide', 'Agonista dual GLP-1 / glucagón. Investigación metabólica.',
    [['10mg',257,10]], false],
  ['Metabólicos', 'Mazdutide', 'Agonista dual GLP-1 / glucagón. Investigación metabólica.',
    [['10mg',208,12]], false],
  ['Metabólicos', 'AOD9604', 'Fragmento 176-191 de la HGH. Investigación en metabolismo lipídico.',
    [['5mg',88,20],['10mg',161,12]], false],
  ['Metabólicos', '5-amino-1MQ', 'Inhibidor selectivo de NNMT. Investigación en regulación de NAD+ y metabolismo lipídico.',
    [['10mg',155,10]], false],
  ['Metabólicos', 'AICAR', 'Activador de AMPK. Investigación en metabolismo energético y biogénesis mitocondrial.',
    [['50mg',58,18]], false],
  ['Metabólicos', 'Adipotide', 'Péptido proapoptótico dirigido a vasculatura del tejido adiposo. Investigación en obesidad.',
    [['5mg',136,8]], false],
  ['Metabólicos', 'SLU-PP-332', 'Agonista pan-ERR. Investigación en biogénesis mitocondrial y rendimiento.',
    [['10mg',122,10]], false],
  ['Metabólicos', 'Lipo-C', 'Compuesto lipotrópico (MIC). Investigación en metabolismo lipídico.',
    [['10ml',78,22]], false],
  ['Metabólicos', 'L-Carnitina', 'Aminoácido inyectable. Investigación en transporte de ácidos grasos.',
    [['600mg',40,28],['1200mg',74,18]], false],
  ['Metabólicos', 'Vitamina B12', 'Cobalamina inyectable. Investigación en metabolismo energético y función neurológica.',
    [['10mg',87,30]], false],

  ['Recuperación', 'BPC-157', 'Pentadecapéptido para investigación en reparación tisular gastrointestinal y musculoesquelética.',
    [['5mg',58,40],['10mg',81,28]], true],
  ['Recuperación', 'TB-500 (Thymosin β-4)', 'Fragmento de Timosina Beta-4. Investigación en angiogénesis y migración celular.',
    [['5mg',77,30],['10mg',146,18]], true],
  ['Recuperación', 'KPV', 'Tripéptido derivado de α-MSH. Investigación antiinflamatoria local.',
    [['10mg',81,20]], false],
  ['Recuperación', 'ARA-290 (Cibinetide)', 'Análogo de eritropoyetina sin actividad hematopoyética. Investigación antiinflamatoria.',
    [['10mg',72,15]], false],
  ['Recuperación', 'VIP', 'Péptido vasoactivo intestinal. Investigación en función inmune y respiratoria.',
    [['10mg',155,8]], false],
  ['Recuperación', 'Dermorfina', 'Heptapéptido opioide. Investigación en receptores μ-opioides.',
    [['10mg',35,15]], false],
  ['Recuperación', 'PEG-MGF', 'Factor de crecimiento mecánico pegilado. Investigación en reparación muscular.',
    [['2mg',78,18]], false],
  ['Recuperación', 'MGF', 'Factor de crecimiento mecánico. Investigación en reparación muscular.',
    [['2mg',61,18]], false],

  ['Cognitivos', 'Semax', 'Heptapéptido análogo de ACTH(4-10). Investigación en neuroprotección y función cognitiva.',
    [['5mg',39,22],['10mg',72,18]], false],
  ['Cognitivos', 'Selank', 'Tetrapéptido derivado de la tuftsina. Investigación en ansiedad y enfoque mental.',
    [['5mg',40,22],['10mg',63,18]], false],
  ['Cognitivos', 'DSIP', 'Delta-Sleep Inducing Peptide. Investigación en arquitectura del sueño.',
    [['5mg',68,15]], false],
  ['Cognitivos', 'Pinealon', 'Tripéptido pineal. Investigación en función cognitiva y antienvejecimiento.',
    [['10mg',54,18],['20mg',84,12]], false],

  ['Longevidad', 'Epitalon', 'Tetrapéptido pineal. Investigación en regulación de telómeros y ritmo circadiano.',
    [['10mg',33,25],['50mg',141,12]], false],
  ['Longevidad', 'MOTS-c', 'Péptido derivado mitocondrial. Investigación en metabolismo energético y sensibilidad a la insulina.',
    [['10mg',81,18],['40mg',142,10]], false],
  ['Longevidad', 'NAD+', 'Coenzima esencial en reacciones redox. Investigación en metabolismo energético y longevidad celular.',
    [['100mg',44,30],['500mg',90,18],['1000mg',131,10]], false],
  ['Longevidad', 'SS-31 (Elamipretide)', 'Péptido dirigido a cardiolipina mitocondrial. Investigación en función mitocondrial.',
    [['10mg',103,12],['50mg',403,5]], false],
  ['Longevidad', 'FOXO4-DRI', 'Péptido senolítico. Investigación en eliminación de células senescentes.',
    [['10mg',435,4]], false],
  ['Longevidad', 'Glutatión', 'Antioxidante endógeno inyectable. Investigación en detoxificación y estrés oxidativo.',
    [['600mg',52,20]], false],

  ['Inmunidad', 'Thymosin α-1 (Tα1)', 'Péptido tímico de 28 aminoácidos. Investigación en modulación inmune.',
    [['10mg',146,10]], false],
  ['Inmunidad', 'Thymalin', 'Polipéptido tímico. Investigación en modulación inmune.',
    [['10mg',62,15]], false],
  ['Inmunidad', 'LL-37', 'Péptido catelicidina antimicrobiana. Investigación en inmunidad innata.',
    [['5mg',94,12]], false],

  ['Hormona de crecimiento', 'Ipamorelin', 'Pentapéptido secretagogo selectivo. Investigación en eje GH/IGF-1 sin afectar prolactina ni cortisol.',
    [['5mg',40,30],['10mg',74,22]], false],
  ['Hormona de crecimiento', 'CJC-1295 sin DAC', 'Análogo de GHRH de acción corta. Investigación en pulsos de GH.',
    [['5mg',94,20],['10mg',161,12]], false],
  ['Hormona de crecimiento', 'CJC-1295 con DAC', 'Análogo de GHRH de acción prolongada (vida media ~7 días).',
    [['2mg',72,18],['5mg',150,10]], false],
  ['Hormona de crecimiento', 'Sermorelin', 'Análogo de GHRH (1-29). Investigación en estimulación de GH endógena.',
    [['5mg',74,20],['10mg',139,12]], false],
  ['Hormona de crecimiento', 'Tesamorelin', 'Análogo de GHRH (1-44). Investigación en composición corporal y grasa visceral.',
    [['5mg',114,12],['10mg',142,8]], false],
  ['Hormona de crecimiento', 'GHRP-2', 'Hexapéptido secretagogo de GH. Investigación en eje GH.',
    [['10mg',53,20]], false],
  ['Hormona de crecimiento', 'GHRP-6', 'Hexapéptido secretagogo de GH con efecto sobre apetito.',
    [['10mg',53,20]], false],
  ['Hormona de crecimiento', 'Hexarelin', 'Hexapéptido secretagogo de GH potente. Investigación endocrina.',
    [['5mg',76,15]], false],
  ['Hormona de crecimiento', 'IGF-1 LR3', 'Análogo de IGF-1 long-R3 con vida media prolongada.',
    [['0.1mg',44,20],['1mg',191,8]], false],
  ['Hormona de crecimiento', 'HGH 191AA', 'Hormona de crecimiento humana recombinante (somatropina).',
    [['10iu',52,18],['15iu',74,12],['24iu',121,8]], false],

  ['Reproductivos', 'PT-141 (Bremelanotide)', 'Análogo de melanocortina. Investigación en función sexual y receptor MC4.',
    [['10mg',70,18]], false],
  ['Reproductivos', 'Kisspeptin-10', 'Péptido derivado de KISS1. Investigación en eje hipotálamo-hipófisis-gónadas.',
    [['5mg',87,15],['10mg',102,10]], false],
  ['Reproductivos', 'Oxitocina', 'Nonapéptido hipofisario. Investigación en vínculo social y comportamiento.',
    [['2mg',34,18],['5mg',54,12]], false],
  ['Reproductivos', 'HCG', 'Gonadotropina coriónica humana. Investigación en eje hipotálamo-hipófisis-gónadas.',
    [['5000iu',95,15],['10000iu',177,8]], false],
  ['Reproductivos', 'HMG (Menotropina)', 'Gonadotropina menopáusica humana. Investigación en estimulación folicular.',
    [['75iu',83,12]], false],

  ['Estética y piel', 'Glow (TB-500 + BPC-157 + GHK-Cu)', 'Combo 70mg total. Investigación en regeneración tisular y cutánea.',
    [['70mg',222,12]], true],
  ['Estética y piel', 'Klow (TB-500 + BPC-157 + GHK-Cu + KPV)', 'Combo 80mg total. Protocolo completo de reparación e inflamación.',
    [['80mg',235,10]], false],
  ['Estética y piel', 'GHK-Cu', 'Tripéptido cobre. Investigación en regeneración cutánea y modulación de expresión génica.',
    [['50mg',29,30],['100mg',76,18]], false],
  ['Estética y piel', 'AHK-Cu', 'Tripéptido cobre análogo de GHK. Investigación en crecimiento capilar.',
    [['100mg',58,20],['500mg',113,10]], false],
  ['Estética y piel', 'Melanotan I', 'Análogo de α-MSH. Investigación en pigmentación cutánea.',
    [['10mg',76,18]], false],
  ['Estética y piel', 'Melanotan II', 'Análogo de α-MSH no selectivo. Investigación en pigmentación y función sexual.',
    [['10mg',59,22]], false],
  ['Estética y piel', 'Snap-8', 'Octapéptido derivado de SNAP-25. Investigación tópica en relajación muscular cutánea.',
    [['10mg',40,18]], false],
  ['Estética y piel', 'Lemon Bottle', 'Compuesto lipotrópico inyectable. Investigación en disolución localizada de adipocitos.',
    [['10ml',88,12]], false],

  ['Combos', 'Stack BPC-157 + TB-500', 'Combinación clásica para protocolos de investigación en reparación tisular acelerada.',
    [['10mg',102,16],['20mg',171,10]], false],
  ['Combos', 'Stack CJC-1295 + Ipamorelin', 'Combinación de referencia para investigación de pulsos de GH.',
    [['10mg',113,16]], false],
  ['Combos', 'Stack Cagrilintide + Semaglutide', 'Combinación de análogos GLP-1/amilina para investigación metabólica avanzada.',
    [['10mg',164,10]], false],

  ['Accesorios', 'Agua bacteriostática', 'Solución estéril con 0.9% de alcohol bencílico para reconstitución de péptidos liofilizados.',
    [['3ml',15,40],['10ml',10,40]], false],
  ['Accesorios', 'Ácido acético (agua)', 'Solución estéril de ácido acético al 0.6% para péptidos sensibles a pH neutro.',
    [['3ml',20,25],['10ml',22,20]], false]
];

const insProd = db.prepare(`
  INSERT INTO products
    (name, slug, category_id, short_description, description, presentation, purity, price, stock, image, sizes, featured, active)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, 1)
`);

const longDesc = (short, sizes) => `${short}

Presentaciones: ${sizes.map(s => s[0]).join(' · ')} (10 viales / kit)
Pureza: HPLC >99%

Producto destinado exclusivamente a uso de investigación científica en laboratorio. No apto para consumo humano ni veterinario. Almacenar refrigerado entre 2-8 °C. Manténgase fuera del alcance de los niños.`;

db.exec('BEGIN');
for (const [catName, name, short, rawSizes, featured] of products) {
  const sizes = rawSizes.map(([label, price, stock]) => ({ label, price, stock }));
  const minPrice = Math.min(...sizes.map(s => s.price));
  const totalStock = sizes.reduce((acc, s) => acc + s.stock, 0);
  const presentation = sizes.length === 1
    ? `Vial liofilizado ${sizes[0].label} · 10 viales / kit`
    : `${sizes.length} presentaciones · 10 viales / kit`;
  insProd.run(
    name, slug(name), catId(catName), short, longDesc(short, sizes),
    presentation, 'HPLC >99%', minPrice, totalStock,
    JSON.stringify(sizes), featured ? 1 : 0
  );
}
db.exec('COMMIT');

const total = db.prepare('SELECT COUNT(*) c FROM products').get().c;
const featuredCount = db.prepare('SELECT COUNT(*) c FROM products WHERE featured = 1').get().c;
console.log(`✓ ${total} products seeded, ${featuredCount} featured`);
console.log(`✓ Brand: Peptyx · Science. Purity. Power.`);
console.log(`✓ Currency: USD`);
console.log(`✓ Categories: ${db.prepare('SELECT COUNT(*) c FROM categories').get().c}`);
