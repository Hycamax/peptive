const { db } = require('./db');

try { db.exec("ALTER TABLE products ADD COLUMN name_en TEXT NOT NULL DEFAULT ''"); } catch (_) {}
try { db.exec("ALTER TABLE products ADD COLUMN short_description_en TEXT NOT NULL DEFAULT ''"); } catch (_) {}
try { db.exec("ALTER TABLE categories ADD COLUMN name_en TEXT NOT NULL DEFAULT ''"); } catch (_) {}
try { db.exec("ALTER TABLE categories ADD COLUMN description_en TEXT NOT NULL DEFAULT ''"); } catch (_) {}

const set = (k, v) => db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(k, v);
set('default_lang', 'en');
set('shipping_note_es', 'Envíos internacionales. 2-5 días hábiles.');
set('legal_disclaimer_es', 'Productos exclusivamente para uso de investigación. No aptos para consumo humano ni veterinario.');

const cats = [
  ['Metabólicos',            'Metabolic',         'GLP-1 analogs and compounds for metabolic and body composition research.'],
  ['Recuperación',           'Recovery',          'Tissue repair peptides and inflammatory modulation.'],
  ['Cognitivos',             'Cognitive',         'Research on cognitive function, memory, sleep, and focus.'],
  ['Longevidad',             'Longevity',         'Research on cellular aging and energy metabolism.'],
  ['Inmunidad',              'Immunity',          'Modulation of the immune response.'],
  ['Hormona de crecimiento', 'Growth Hormone',    'Secretagogues and GHRH analogs for endocrine research.'],
  ['Reproductivos',          'Reproductive',      'Hypothalamic and melanocortin analogs for endocrine research.'],
  ['Combos',                 'Stacks',            'Peptide combinations for research protocols.'],
  ['Estética y piel',        'Skin & Aesthetics', 'Research on skin regeneration, pigmentation, and hair growth.'],
  ['Accesorios',             'Accessories',       'Solutions for reconstituting lyophilized peptides.']
];
const upCat = db.prepare('UPDATE categories SET name_en=?, description_en=? WHERE name=?');
for (const [es, en, descEn] of cats) upCat.run(en, descEn, es);

const products = [
  ['Tirzepatide', 'Tirzepatide', 'Dual GLP-1 / GIP analog. Leading compound for research on glycemic control and body composition.'],
  ['Semaglutide', 'Semaglutide', 'GLP-1 analog. Foundational compound for research on glucose metabolism and appetite regulation.'],
  ['Retatrutide', 'Retatrutide', 'Triple GLP-1 / GIP / glucagon agonist. Next-generation metabolic research.'],
  ['Cagrilintide', 'Cagrilintide', 'Amylin analog. Research on satiety and body composition.'],
  ['Survodutide', 'Survodutide', 'Dual GLP-1 / glucagon agonist. Metabolic research.'],
  ['Mazdutide', 'Mazdutide', 'Dual GLP-1 / glucagon agonist. Metabolic research.'],
  ['AOD9604', 'AOD9604', '176-191 fragment of HGH. Research on lipid metabolism.'],
  ['5-amino-1MQ', '5-amino-1MQ', 'Selective NNMT inhibitor. Research on NAD+ regulation and lipid metabolism.'],
  ['AICAR', 'AICAR', 'AMPK activator. Research on energy metabolism and mitochondrial biogenesis.'],
  ['Adipotide', 'Adipotide', 'Proapoptotic peptide targeting adipose tissue vasculature. Obesity research.'],
  ['SLU-PP-332', 'SLU-PP-332', 'Pan-ERR agonist. Research on mitochondrial biogenesis and performance.'],
  ['Lipo-C', 'Lipo-C', 'Lipotropic compound (MIC). Research on lipid metabolism.'],
  ['L-Carnitina', 'L-Carnitine', 'Injectable amino acid. Research on fatty acid transport and energy metabolism.'],
  ['Vitamina B12', 'Vitamin B12', 'Injectable cobalamin. Research on energy metabolism and neurological function.'],

  ['BPC-157', 'BPC-157', 'Pentadecapeptide for research on gastrointestinal and musculoskeletal tissue repair.'],
  ['TB-500 (Thymosin β-4)', 'TB-500 (Thymosin β-4)', 'Thymosin Beta-4 fragment. Research on angiogenesis and cellular migration.'],
  ['KPV', 'KPV', 'α-MSH-derived tripeptide. Research on local anti-inflammation.'],
  ['ARA-290 (Cibinetide)', 'ARA-290 (Cibinetide)', 'Erythropoietin analog without hematopoietic activity. Anti-inflammatory research.'],
  ['VIP', 'VIP', 'Vasoactive intestinal peptide. Research on immune and respiratory function.'],
  ['Dermorfina', 'Dermorphin', 'Opioid heptapeptide. Research on μ-opioid receptors.'],
  ['PEG-MGF', 'PEG-MGF', 'Pegylated mechano growth factor. Research on muscle repair.'],
  ['MGF', 'MGF', 'Mechano growth factor. Research on muscle repair.'],

  ['Semax', 'Semax', 'ACTH(4-10) analog heptapeptide. Research on neuroprotection and cognitive function.'],
  ['Selank', 'Selank', 'Tuftsin-derived tetrapeptide. Research on anxiety and mental focus.'],
  ['DSIP', 'DSIP', 'Delta-Sleep Inducing Peptide. Research on sleep architecture.'],
  ['Pinealon', 'Pinealon', 'Pineal tripeptide. Research on cognitive function and anti-aging.'],

  ['Epitalon', 'Epitalon', 'Pineal tetrapeptide. Research on telomere regulation and circadian rhythm.'],
  ['MOTS-c', 'MOTS-c', 'Mitochondrial-derived peptide. Research on energy metabolism and insulin sensitivity.'],
  ['NAD+', 'NAD+', 'Essential coenzyme for redox reactions. Research on energy metabolism and cellular longevity.'],
  ['SS-31 (Elamipretide)', 'SS-31 (Elamipretide)', 'Peptide targeting mitochondrial cardiolipin. Research on mitochondrial function.'],
  ['FOXO4-DRI', 'FOXO4-DRI', 'Senolytic peptide. Research on senescent cell elimination.'],
  ['Glutatión', 'Glutathione', 'Endogenous injectable antioxidant. Research on detoxification and oxidative stress.'],

  ['Thymosin α-1 (Tα1)', 'Thymosin α-1 (Tα1)', '28-amino-acid thymic peptide. Research on immune modulation.'],
  ['Thymalin', 'Thymalin', 'Thymic polypeptide. Research on immune modulation.'],
  ['LL-37', 'LL-37', 'Antimicrobial cathelicidin peptide. Research on innate immunity.'],

  ['Ipamorelin', 'Ipamorelin', 'Selective secretagogue pentapeptide. GH/IGF-1 axis research without affecting prolactin or cortisol.'],
  ['CJC-1295 sin DAC', 'CJC-1295 No DAC', 'Short-acting GHRH analog. Research on GH pulses.'],
  ['CJC-1295 con DAC', 'CJC-1295 with DAC', 'Long-acting GHRH analog (~7-day half-life).'],
  ['Sermorelin', 'Sermorelin', 'GHRH (1-29) analog. Research on endogenous GH stimulation.'],
  ['Tesamorelin', 'Tesamorelin', 'GHRH (1-44) analog. Research on body composition and visceral fat.'],
  ['GHRP-2', 'GHRP-2', 'GH secretagogue hexapeptide. Research on the GH axis.'],
  ['GHRP-6', 'GHRP-6', 'GH secretagogue hexapeptide with effects on appetite.'],
  ['Hexarelin', 'Hexarelin', 'Potent GH secretagogue hexapeptide. Endocrine research.'],
  ['IGF-1 LR3', 'IGF-1 LR3', 'Long-R3 IGF-1 analog with extended half-life.'],
  ['HGH 191AA', 'HGH 191AA', 'Recombinant human growth hormone (somatropin).'],

  ['PT-141 (Bremelanotide)', 'PT-141 (Bremelanotide)', 'Melanocortin analog. Research on sexual function and the MC4 receptor.'],
  ['Kisspeptin-10', 'Kisspeptin-10', 'KISS1-derived peptide. Research on the hypothalamic-pituitary-gonadal axis.'],
  ['Oxitocina', 'Oxytocin', 'Pituitary nonapeptide. Research on social bonding and behavior.'],
  ['HCG', 'HCG', 'Human chorionic gonadotropin. Research on the HPG axis.'],
  ['HMG (Menotropina)', 'HMG (Menotropin)', 'Human menopausal gonadotropin. Research on follicular stimulation.'],

  ['Glow (TB-500 + BPC-157 + GHK-Cu)', 'Glow (TB-500 + BPC-157 + GHK-Cu)', 'TB-500 + BPC-157 + GHK-Cu combo, 70mg total. Research on tissue and skin regeneration.'],
  ['Klow (TB-500 + BPC-157 + GHK-Cu + KPV)', 'Klow (TB-500 + BPC-157 + GHK-Cu + KPV)', 'TB-500 + BPC-157 + GHK-Cu + KPV combo, 80mg total. Complete repair and inflammation protocol.'],
  ['GHK-Cu', 'GHK-Cu', 'Copper tripeptide. Research on skin regeneration and gene expression modulation.'],
  ['AHK-Cu', 'AHK-Cu', 'GHK-analog copper tripeptide. Research on hair growth.'],
  ['Melanotan I', 'Melanotan I', 'α-MSH analog. Research on skin pigmentation.'],
  ['Melanotan II', 'Melanotan II', 'Non-selective α-MSH analog. Research on pigmentation and sexual function.'],
  ['Snap-8', 'Snap-8', 'SNAP-25-derived octapeptide. Topical research on cutaneous muscle relaxation.'],
  ['Lemon Bottle', 'Lemon Bottle', 'Injectable lipotropic. Research on localized adipocyte dissolution.'],

  ['Stack BPC-157 + TB-500', 'BPC-157 + TB-500 Stack', 'Classic combination for accelerated tissue repair research protocols.'],
  ['Stack CJC-1295 + Ipamorelin', 'CJC-1295 + Ipamorelin Stack', 'Reference combination for GH pulse research.'],
  ['Stack Cagrilintide + Semaglutide', 'Cagrilintide + Semaglutide Stack', 'GLP-1 / amylin analog combination for advanced metabolic research.'],

  ['Agua bacteriostática', 'Bacteriostatic Water', 'Sterile solution with 0.9% benzyl alcohol for reconstituting lyophilized peptides.'],
  ['Ácido acético (agua)', 'Acetic Acid Water', 'Sterile 0.6% acetic acid solution for peptides sensitive to neutral pH.']
];

const upProd = db.prepare('UPDATE products SET name_en=?, short_description_en=? WHERE name=?');
let updated = 0;
for (const [esName, enName, enShort] of products) {
  const r = upProd.run(enName, enShort, esName);
  if (r.changes) updated++;
}

console.log(`✓ Translated ${updated}/${products.length} products`);
console.log(`✓ Translated ${cats.length} categories`);
console.log(`✓ default_lang = en`);
