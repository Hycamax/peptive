const { db, setSetting } = require('./db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const imageForSlug = (slug) => {
  const rel = `/uploads/${slug}.png`;
  return fs.existsSync(path.join(UPLOADS_DIR, `${slug}.png`)) ? rel : '';
};

// Set PEPTIVE brand settings
setSetting('store_name', 'PEPTIVE');
setSetting('store_tagline', 'SCIENCE. PURITY. POWER.');
setSetting('primary_color', '#B8860B');
setSetting('theme', 'dark');
setSetting('currency', 'USD');
setSetting('currency_symbol', '$');
setSetting('discount_percent', '0');
setSetting('contact_email', 'info@peptivelab.com');
setSetting('contact_phone', '+1 (888) 555-0199');
setSetting('whatsapp', '18885550199');
setSetting('shipping_note', 'Worldwide shipping. 2-5 business days.');
setSetting('shipping_note_es', 'Envíos internacionales. 2-5 días hábiles.');
setSetting('legal_disclaimer', 'Research compounds for laboratory use only. Not for human or veterinary consumption.');
setSetting('legal_disclaimer_es', 'Productos exclusivamente para uso de investigación. No aptos para consumo humano ni veterinario.');

// Create admin user
const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
if (!existing) {
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', bcrypt.hashSync('admin123', 10));
}

// Categories
const categories = [
  { name: 'Metabólicos', name_en: 'Metabolic', slug: 'metabolicos', description: 'Péptidos para regulación metabólica y control de peso', description_en: 'Peptides for metabolic regulation and weight management', sort_order: 1 },
  { name: 'Recuperación', name_en: 'Recovery', slug: 'recuperacion', description: 'Péptidos para recuperación tisular y muscular', description_en: 'Peptides for tissue and muscle recovery', sort_order: 2 },
  { name: 'Cognitivos', name_en: 'Cognitive', slug: 'cognitivos', description: 'Péptidos para función cognitiva y neuroprotección', description_en: 'Peptides for cognitive function and neuroprotection', sort_order: 3 },
  { name: 'Longevidad', name_en: 'Longevity', slug: 'longevidad', description: 'Péptidos para anti-envejecimiento y longevidad celular', description_en: 'Peptides for anti-aging and cellular longevity', sort_order: 4 },
  { name: 'Inmunidad', name_en: 'Immunity', slug: 'inmunidad', description: 'Péptidos para modulación inmunológica', description_en: 'Peptides for immune modulation', sort_order: 5 },
  { name: 'Hormona de Crecimiento', name_en: 'Growth Hormone', slug: 'hormona-de-crecimiento', description: 'Secretagogos y análogos de GH', description_en: 'GH secretagogues and analogs', sort_order: 6 },
  { name: 'Reproductivos', name_en: 'Reproductive', slug: 'reproductivos', description: 'Péptidos para función sexual y reproductiva', description_en: 'Peptides for sexual and reproductive function', sort_order: 7 },
  { name: 'Combos', name_en: 'Stacks', slug: 'combos', description: 'Combinaciones sinérgicas de péptidos', description_en: 'Synergistic peptide combinations', sort_order: 8 },
  { name: 'Estética y Piel', name_en: 'Skin & Aesthetics', slug: 'estetica-y-piel', description: 'Péptidos para piel, cabello y estética', description_en: 'Peptides for skin, hair, and aesthetics', sort_order: 9 },
  { name: 'Accesorios', name_en: 'Accessories', slug: 'accesorios', description: 'Jeringas, agua bacteriostática y accesorios', description_en: 'Syringes, bacteriostatic water, and accessories', sort_order: 10 }
];

// Add name_en and description_en columns if they don't exist
try { db.exec('ALTER TABLE categories ADD COLUMN name_en TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE categories ADD COLUMN description_en TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE products ADD COLUMN name_en TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE products ADD COLUMN short_description_en TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE products ADD COLUMN sizes TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE order_items ADD COLUMN size TEXT DEFAULT ""'); } catch(e) {}

const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name, slug, description, sort_order, name_en, description_en) VALUES (?, ?, ?, ?, ?, ?)');
for (const c of categories) {
  insertCat.run(c.name, c.slug, c.description, c.sort_order, c.name_en, c.description_en);
}

// Get category IDs
const catMap = {};
db.prepare('SELECT id, slug FROM categories').all().forEach(c => { catMap[c.slug] = c.id; });

// Products data
const products = [
  // Metabolic
  { name: 'Tirzepatide', name_en: 'Tirzepatide', slug: 'tirzepatide', cat: 'metabolicos', short: 'Agonista dual GIP/GLP-1 de última generación', short_en: 'Next-gen dual GIP/GLP-1 agonist', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '5mg', price: 89.99, stock: 50 }, { label: '10mg', price: 159.99, stock: 40 }, { label: '15mg', price: 219.99, stock: 30 }], featured: 1 },
  { name: 'Semaglutide', name_en: 'Semaglutide', slug: 'semaglutide', cat: 'metabolicos', short: 'Análogo de GLP-1 para investigación metabólica', short_en: 'GLP-1 analog for metabolic research', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '2mg', price: 59.99, stock: 60 }, { label: '5mg', price: 129.99, stock: 45 }, { label: '10mg', price: 229.99, stock: 25 }], featured: 1 },
  { name: 'Retatrutide', name_en: 'Retatrutide', slug: 'retatrutide', cat: 'metabolicos', short: 'Triple agonista GIP/GLP-1/Glucagón', short_en: 'Triple GIP/GLP-1/Glucagon agonist', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '3mg', price: 79.99, stock: 35 }, { label: '5mg', price: 119.99, stock: 30 }, { label: '10mg', price: 209.99, stock: 20 }], featured: 1 },
  { name: 'Tesofensine', name_en: 'Tesofensine', slug: 'tesofensine', cat: 'metabolicos', short: 'Inhibidor triple de recaptación de monoaminas', short_en: 'Triple monoamine reuptake inhibitor', presentation: 'Capsules', purity: 'HPLC >98%', sizes: [{ label: '500mcg x30', price: 69.99, stock: 40 }], featured: 0 },
  { name: 'AOD-9604', name_en: 'AOD-9604', slug: 'aod-9604', cat: 'metabolicos', short: 'Fragmento modificado de hGH para investigación lipolítica', short_en: 'Modified hGH fragment for lipolytic research', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '2mg', price: 34.99, stock: 55 }, { label: '5mg', price: 74.99, stock: 40 }], featured: 0 },
  { name: '5-Amino-1MQ', name_en: '5-Amino-1MQ', slug: '5-amino-1mq', cat: 'metabolicos', short: 'Inhibidor selectivo de NNMT', short_en: 'Selective NNMT inhibitor', presentation: 'Capsules', purity: 'HPLC >98%', sizes: [{ label: '50mg x30', price: 54.99, stock: 45 }], featured: 0 },

  // Recovery
  { name: 'BPC-157', name_en: 'BPC-157', slug: 'bpc-157', cat: 'recuperacion', short: 'Pentadecapéptido gástrico para investigación de recuperación', short_en: 'Gastric pentadecapeptide for recovery research', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '5mg', price: 44.99, stock: 80 }, { label: '10mg', price: 79.99, stock: 50 }], featured: 1 },
  { name: 'TB-500', name_en: 'TB-500', slug: 'tb-500', cat: 'recuperacion', short: 'Timosina Beta-4 para investigación de reparación tisular', short_en: 'Thymosin Beta-4 for tissue repair research', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '2mg', price: 29.99, stock: 70 }, { label: '5mg', price: 64.99, stock: 55 }, { label: '10mg', price: 109.99, stock: 35 }], featured: 1 },
  { name: 'BPC-157 + TB-500 Blend', name_en: 'BPC-157 + TB-500 Blend', slug: 'bpc157-tb500-blend', cat: 'recuperacion', short: 'Mezcla sinérgica para recuperación acelerada', short_en: 'Synergistic blend for accelerated recovery', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '10mg', price: 89.99, stock: 40 }], featured: 0 },
  { name: 'Pentosan Polysulfate', name_en: 'Pentosan Polysulfate', slug: 'pentosan-polysulfate', cat: 'recuperacion', short: 'Polisacárido semi-sintético para investigación articular', short_en: 'Semi-synthetic polysaccharide for joint research', presentation: 'Solution vial', purity: 'USP grade', sizes: [{ label: '6ml', price: 49.99, stock: 30 }], featured: 0 },
  { name: 'GHK-Cu', name_en: 'GHK-Cu', slug: 'ghk-cu', cat: 'recuperacion', short: 'Tripéptido de cobre para investigación de regeneración', short_en: 'Copper tripeptide for regeneration research', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '50mg', price: 39.99, stock: 60 }, { label: '100mg', price: 69.99, stock: 40 }, { label: '200mg', price: 119.99, stock: 25 }], featured: 1 },

  // Cognitive
  { name: 'Semax', name_en: 'Semax', slug: 'semax', cat: 'cognitivos', short: 'Neuropéptido sintético análogo de ACTH', short_en: 'Synthetic ACTH-analog neuropeptide', presentation: 'Nasal spray', purity: 'HPLC >99%', sizes: [{ label: '30mg', price: 44.99, stock: 35 }], featured: 0 },
  { name: 'Selank', name_en: 'Selank', slug: 'selank', cat: 'cognitivos', short: 'Péptido ansiolítico derivado de tuftsina', short_en: 'Anxiolytic peptide derived from tuftsin', presentation: 'Nasal spray', purity: 'HPLC >99%', sizes: [{ label: '30mg', price: 44.99, stock: 35 }], featured: 0 },
  { name: 'Dihexa', name_en: 'Dihexa', slug: 'dihexa', cat: 'cognitivos', short: 'Oligopéptido derivado de angiotensina IV', short_en: 'Angiotensin IV-derived oligopeptide', presentation: 'Capsules', purity: 'HPLC >98%', sizes: [{ label: '10mg x30', price: 59.99, stock: 25 }], featured: 0 },
  { name: 'P21 (Cerebrolysin peptide)', name_en: 'P21 (Cerebrolysin peptide)', slug: 'p21', cat: 'cognitivos', short: 'Péptido neurotrófico para investigación cognitiva', short_en: 'Neurotrophic peptide for cognitive research', presentation: 'Lyophilized vial', purity: 'HPLC >98%', sizes: [{ label: '50mg', price: 54.99, stock: 30 }], featured: 0 },
  { name: 'NSI-189', name_en: 'NSI-189', slug: 'nsi-189', cat: 'cognitivos', short: 'Molécula neurogénica para investigación de neuroplasticidad', short_en: 'Neurogenic molecule for neuroplasticity research', presentation: 'Capsules', purity: 'HPLC >98%', sizes: [{ label: '40mg x30', price: 49.99, stock: 30 }], featured: 0 },

  // Longevity
  { name: 'NAD+', name_en: 'NAD+', slug: 'nad-plus', cat: 'longevidad', short: 'Nicotinamida adenina dinucleótido para investigación de longevidad', short_en: 'Nicotinamide adenine dinucleotide for longevity research', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '100mg', price: 49.99, stock: 50 }, { label: '250mg', price: 99.99, stock: 35 }, { label: '500mg', price: 179.99, stock: 20 }], featured: 1 },
  { name: 'Epitalon', name_en: 'Epitalon', slug: 'epitalon', cat: 'longevidad', short: 'Tetrapéptido regulador de telomerasa', short_en: 'Telomerase-regulating tetrapeptide', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '10mg', price: 34.99, stock: 45 }, { label: '50mg', price: 139.99, stock: 25 }], featured: 0 },
  { name: 'FOXO4-DRI', name_en: 'FOXO4-DRI', slug: 'foxo4-dri', cat: 'longevidad', short: 'Péptido senolítico de interferencia FOXO4-p53', short_en: 'FOXO4-p53 interference senolytic peptide', presentation: 'Lyophilized vial', purity: 'HPLC >95%', sizes: [{ label: '10mg', price: 189.99, stock: 15 }], featured: 0 },
  { name: 'SS-31 (Elamipretide)', name_en: 'SS-31 (Elamipretide)', slug: 'ss-31', cat: 'longevidad', short: 'Péptido mitocondrial cardiolipina-targeting', short_en: 'Cardiolipin-targeting mitochondrial peptide', presentation: 'Lyophilized vial', purity: 'HPLC >98%', sizes: [{ label: '5mg', price: 59.99, stock: 30 }, { label: '10mg', price: 99.99, stock: 20 }], featured: 0 },
  { name: 'MOTS-c', name_en: 'MOTS-c', slug: 'mots-c', cat: 'longevidad', short: 'Péptido derivado mitocondrial para investigación metabólica', short_en: 'Mitochondria-derived peptide for metabolic research', presentation: 'Lyophilized vial', purity: 'HPLC >98%', sizes: [{ label: '5mg', price: 54.99, stock: 30 }], featured: 0 },
  { name: 'Humanin', name_en: 'Humanin', slug: 'humanin', cat: 'longevidad', short: 'Péptido citoprotector mitocondrial', short_en: 'Mitochondrial cytoprotective peptide', presentation: 'Lyophilized vial', purity: 'HPLC >98%', sizes: [{ label: '5mg', price: 64.99, stock: 25 }], featured: 0 },

  // Immunity
  { name: 'Thymosin Alpha-1', name_en: 'Thymosin Alpha-1', slug: 'thymosin-alpha-1', cat: 'inmunidad', short: 'Péptido tímico inmunomodulador', short_en: 'Immunomodulatory thymic peptide', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '5mg', price: 39.99, stock: 40 }], featured: 0 },
  { name: 'LL-37', name_en: 'LL-37', slug: 'll-37', cat: 'inmunidad', short: 'Catelicidina humana antimicrobiana', short_en: 'Human antimicrobial cathelicidin', presentation: 'Lyophilized vial', purity: 'HPLC >98%', sizes: [{ label: '5mg', price: 49.99, stock: 30 }], featured: 0 },
  { name: 'KPV', name_en: 'KPV', slug: 'kpv', cat: 'inmunidad', short: 'Tripéptido antiinflamatorio derivado de α-MSH', short_en: 'Anti-inflammatory tripeptide derived from α-MSH', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '5mg', price: 34.99, stock: 45 }], featured: 0 },
  { name: 'Larazotide', name_en: 'Larazotide', slug: 'larazotide', cat: 'inmunidad', short: 'Péptido regulador de uniones estrechas', short_en: 'Tight junction regulatory peptide', presentation: 'Capsules', purity: 'HPLC >98%', sizes: [{ label: '500mcg x30', price: 44.99, stock: 30 }], featured: 0 },

  // Growth Hormone
  { name: 'HGH Fragment 176-191', name_en: 'HGH Fragment 176-191', slug: 'hgh-fragment-176-191', cat: 'hormona-de-crecimiento', short: 'Fragmento lipolítico de hormona de crecimiento', short_en: 'Lipolytic growth hormone fragment', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '2mg', price: 29.99, stock: 50 }, { label: '5mg', price: 64.99, stock: 35 }], featured: 0 },
  { name: 'CJC-1295 (no DAC)', name_en: 'CJC-1295 (no DAC)', slug: 'cjc-1295', cat: 'hormona-de-crecimiento', short: 'Análogo de GHRH de acción prolongada', short_en: 'Long-acting GHRH analog', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '2mg', price: 29.99, stock: 60 }, { label: '5mg', price: 59.99, stock: 45 }], featured: 1 },
  { name: 'CJC-1295 + Ipamorelin Blend', name_en: 'CJC-1295 + Ipamorelin Blend', slug: 'cjc-ipamorelin-blend', cat: 'hormona-de-crecimiento', short: 'Mezcla sinérgica GHRH + GHRP', short_en: 'Synergistic GHRH + GHRP blend', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '5mg', price: 54.99, stock: 40 }, { label: '10mg', price: 94.99, stock: 25 }], featured: 0 },
  { name: 'Ipamorelin', name_en: 'Ipamorelin', slug: 'ipamorelin', cat: 'hormona-de-crecimiento', short: 'Secretagogo selectivo de GH', short_en: 'Selective GH secretagogue', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '2mg', price: 24.99, stock: 60 }, { label: '5mg', price: 49.99, stock: 45 }], featured: 0 },
  { name: 'Tesamorelin', name_en: 'Tesamorelin', slug: 'tesamorelin', cat: 'hormona-de-crecimiento', short: 'Análogo de GHRH para investigación de composición corporal', short_en: 'GHRH analog for body composition research', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '2mg', price: 39.99, stock: 45 }, { label: '5mg', price: 84.99, stock: 30 }], featured: 1 },
  { name: 'Sermorelin', name_en: 'Sermorelin', slug: 'sermorelin', cat: 'hormona-de-crecimiento', short: 'Análogo de GHRH (1-29) para investigación', short_en: 'GHRH (1-29) analog for research', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '2mg', price: 24.99, stock: 55 }, { label: '5mg', price: 49.99, stock: 40 }], featured: 1 },
  { name: 'MK-677 (Ibutamoren)', name_en: 'MK-677 (Ibutamoren)', slug: 'mk-677', cat: 'hormona-de-crecimiento', short: 'Secretagogo oral de GH no peptídico', short_en: 'Non-peptide oral GH secretagogue', presentation: 'Capsules', purity: 'HPLC >99%', sizes: [{ label: '25mg x30', price: 49.99, stock: 50 }, { label: '25mg x60', price: 89.99, stock: 30 }], featured: 0 },
  { name: 'HGH 191aa', name_en: 'HGH 191aa', slug: 'hgh-191aa', cat: 'hormona-de-crecimiento', short: 'Hormona de crecimiento humana recombinante 191aa', short_en: 'Recombinant human growth hormone 191aa', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '10IU', price: 44.99, stock: 40 }, { label: '36IU', price: 139.99, stock: 25 }, { label: '100IU', price: 349.99, stock: 15 }], featured: 1 },
  { name: 'GHRP-6', name_en: 'GHRP-6', slug: 'ghrp-6', cat: 'hormona-de-crecimiento', short: 'Hexapéptido liberador de GH', short_en: 'GH releasing hexapeptide', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '5mg', price: 24.99, stock: 50 }, { label: '10mg', price: 44.99, stock: 35 }], featured: 0 },
  { name: 'GHRP-2', name_en: 'GHRP-2', slug: 'ghrp-2', cat: 'hormona-de-crecimiento', short: 'Secretagogo de GH de segunda generación', short_en: 'Second-gen GH secretagogue', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '5mg', price: 24.99, stock: 50 }, { label: '10mg', price: 44.99, stock: 35 }], featured: 0 },
  { name: 'Hexarelin', name_en: 'Hexarelin', slug: 'hexarelin', cat: 'hormona-de-crecimiento', short: 'Potente secretagogo de GH hexapeptídico', short_en: 'Potent hexapeptide GH secretagogue', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '2mg', price: 24.99, stock: 45 }, { label: '5mg', price: 49.99, stock: 30 }], featured: 0 },

  // Reproductive
  { name: 'PT-141 (Bremelanotide)', name_en: 'PT-141 (Bremelanotide)', slug: 'pt-141', cat: 'reproductivos', short: 'Agonista de receptor de melanocortina para investigación sexual', short_en: 'Melanocortin receptor agonist for sexual research', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '2mg', price: 29.99, stock: 50 }, { label: '10mg', price: 119.99, stock: 30 }], featured: 1 },
  { name: 'Kisspeptin-10', name_en: 'Kisspeptin-10', slug: 'kisspeptin-10', cat: 'reproductivos', short: 'Péptido regulador del eje HPG', short_en: 'HPG axis regulatory peptide', presentation: 'Lyophilized vial', purity: 'HPLC >98%', sizes: [{ label: '5mg', price: 39.99, stock: 30 }], featured: 0 },
  { name: 'Melanotan II', name_en: 'Melanotan II', slug: 'melanotan-ii', cat: 'reproductivos', short: 'Análogo de α-MSH para investigación de melanogénesis', short_en: 'α-MSH analog for melanogenesis research', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '10mg', price: 29.99, stock: 60 }], featured: 0 },
  { name: 'Gonadorelin', name_en: 'Gonadorelin', slug: 'gonadorelin', cat: 'reproductivos', short: 'GnRH sintético para investigación endocrina', short_en: 'Synthetic GnRH for endocrine research', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '2mg', price: 24.99, stock: 45 }], featured: 0 },

  // Skin & Aesthetics
  { name: 'GHK-Cu (Topical)', name_en: 'GHK-Cu (Topical)', slug: 'ghk-cu-topical', cat: 'estetica-y-piel', short: 'Tripéptido de cobre para investigación dermatológica tópica', short_en: 'Copper tripeptide for topical dermatological research', presentation: 'Cream / Serum', purity: 'Cosmetic grade', sizes: [{ label: '30ml', price: 49.99, stock: 40 }], featured: 0 },
  { name: 'Copper Peptide AHK-Cu', name_en: 'Copper Peptide AHK-Cu', slug: 'ahk-cu', cat: 'estetica-y-piel', short: 'Péptido de cobre para investigación capilar', short_en: 'Copper peptide for hair research', presentation: 'Lyophilized vial', purity: 'HPLC >98%', sizes: [{ label: '50mg', price: 44.99, stock: 30 }], featured: 0 },
  { name: 'Snap-8', name_en: 'Snap-8', slug: 'snap-8', cat: 'estetica-y-piel', short: 'Octapéptido anti-arrugas tipo botox', short_en: 'Botox-like anti-wrinkle octapeptide', presentation: 'Solution', purity: 'Cosmetic grade', sizes: [{ label: '30ml', price: 39.99, stock: 35 }], featured: 0 },
  { name: 'Matrixyl 3000', name_en: 'Matrixyl 3000', slug: 'matrixyl-3000', cat: 'estetica-y-piel', short: 'Complejo peptídico estimulador de colágeno', short_en: 'Collagen-stimulating peptide complex', presentation: 'Solution', purity: 'Cosmetic grade', sizes: [{ label: '30ml', price: 34.99, stock: 40 }], featured: 0 },

  // Stacks / Combos
  { name: 'Weight Loss Stack', name_en: 'Weight Loss Stack', slug: 'weight-loss-stack', cat: 'combos', short: 'Combo Tirzepatide + AOD-9604 + 5-Amino-1MQ', short_en: 'Tirzepatide + AOD-9604 + 5-Amino-1MQ combo', presentation: 'Kit (3 vials)', purity: 'HPLC >99%', sizes: [{ label: 'Kit', price: 199.99, stock: 20 }], featured: 0 },
  { name: 'Recovery Stack', name_en: 'Recovery Stack', slug: 'recovery-stack', cat: 'combos', short: 'Combo BPC-157 + TB-500 + GHK-Cu', short_en: 'BPC-157 + TB-500 + GHK-Cu combo', presentation: 'Kit (3 vials)', purity: 'HPLC >99%', sizes: [{ label: 'Kit', price: 149.99, stock: 25 }], featured: 0 },
  { name: 'Anti-Aging Stack', name_en: 'Anti-Aging Stack', slug: 'anti-aging-stack', cat: 'combos', short: 'Combo NAD+ + Epitalon + SS-31', short_en: 'NAD+ + Epitalon + SS-31 combo', presentation: 'Kit (3 vials)', purity: 'HPLC >99%', sizes: [{ label: 'Kit', price: 179.99, stock: 15 }], featured: 0 },
  { name: 'GH Optimization Stack', name_en: 'GH Optimization Stack', slug: 'gh-optimization-stack', cat: 'combos', short: 'Combo CJC-1295 + Ipamorelin + MK-677', short_en: 'CJC-1295 + Ipamorelin + MK-677 combo', presentation: 'Kit', purity: 'HPLC >99%', sizes: [{ label: 'Kit', price: 129.99, stock: 20 }], featured: 0 },

  // Accessories
  { name: 'Bacteriostatic Water', name_en: 'Bacteriostatic Water', slug: 'bacteriostatic-water', cat: 'accesorios', short: 'Agua bacteriostática para reconstitución', short_en: 'Bacteriostatic water for reconstitution', presentation: '10ml vial', purity: 'USP grade', sizes: [{ label: '10ml', price: 9.99, stock: 100 }, { label: '30ml', price: 19.99, stock: 60 }], featured: 0 },
  { name: 'Insulin Syringes (100pk)', name_en: 'Insulin Syringes (100pk)', slug: 'insulin-syringes', cat: 'accesorios', short: 'Jeringas de insulina 1ml 29G', short_en: '1ml 29G insulin syringes', presentation: 'Box of 100', purity: 'Sterile', sizes: [{ label: '100 pack', price: 24.99, stock: 50 }], featured: 0 },
  { name: 'Alcohol Prep Pads', name_en: 'Alcohol Prep Pads', slug: 'alcohol-prep-pads', cat: 'accesorios', short: 'Toallitas de alcohol isopropílico 70%', short_en: '70% isopropyl alcohol wipes', presentation: 'Box of 200', purity: 'Medical grade', sizes: [{ label: '200 pack', price: 12.99, stock: 80 }], featured: 0 },

  // Additional products to reach 60+
  { name: 'Liraglutide', name_en: 'Liraglutide', slug: 'liraglutide', cat: 'metabolicos', short: 'Análogo de GLP-1 de acción prolongada', short_en: 'Long-acting GLP-1 analog', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '3mg', price: 69.99, stock: 35 }, { label: '6mg', price: 119.99, stock: 25 }], featured: 0 },
  { name: 'DSIP (Delta Sleep)', name_en: 'DSIP (Delta Sleep)', slug: 'dsip', cat: 'cognitivos', short: 'Péptido inductor de sueño delta', short_en: 'Delta sleep-inducing peptide', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '5mg', price: 34.99, stock: 40 }], featured: 0 },
  { name: 'Cerebrolysin', name_en: 'Cerebrolysin', slug: 'cerebrolysin', cat: 'cognitivos', short: 'Mezcla de péptidos neurotroficos', short_en: 'Neurotrophic peptide mixture', presentation: 'Solution', purity: 'Pharmaceutical grade', sizes: [{ label: '5ml x5', price: 79.99, stock: 20 }], featured: 0 },
  { name: 'Thymulin', name_en: 'Thymulin', slug: 'thymulin', cat: 'inmunidad', short: 'Nonapéptido tímico inmunomodulador', short_en: 'Immunomodulatory thymic nonapeptide', presentation: 'Lyophilized vial', purity: 'HPLC >98%', sizes: [{ label: '10mg', price: 44.99, stock: 30 }], featured: 0 },
  { name: 'Palmitoyl Pentapeptide-4', name_en: 'Palmitoyl Pentapeptide-4', slug: 'palmitoyl-pentapeptide-4', cat: 'estetica-y-piel', short: 'Péptido señalizador de colágeno para investigación dérmica', short_en: 'Collagen-signaling peptide for dermal research', presentation: 'Solution', purity: 'Cosmetic grade', sizes: [{ label: '30ml', price: 34.99, stock: 35 }], featured: 0 },
  { name: 'Oxytocin', name_en: 'Oxytocin', slug: 'oxytocin', cat: 'reproductivos', short: 'Neuropéptido para investigación de comportamiento social', short_en: 'Neuropeptide for social behavior research', presentation: 'Nasal spray', purity: 'HPLC >99%', sizes: [{ label: '30IU/ml', price: 39.99, stock: 30 }], featured: 0 },
  { name: 'Ipamorelin + GHRP-2 Blend', name_en: 'Ipamorelin + GHRP-2 Blend', slug: 'ipamorelin-ghrp2-blend', cat: 'hormona-de-crecimiento', short: 'Mezcla dual de secretagogos de GH', short_en: 'Dual GH secretagogue blend', presentation: 'Lyophilized vial', purity: 'HPLC >99%', sizes: [{ label: '10mg', price: 54.99, stock: 35 }], featured: 0 },
  { name: 'Pinealon', name_en: 'Pinealon', slug: 'pinealon', cat: 'cognitivos', short: 'Tripéptido regulador de la glándula pineal', short_en: 'Pineal gland regulatory tripeptide', presentation: 'Capsules', purity: 'HPLC >98%', sizes: [{ label: '20mg x30', price: 39.99, stock: 30 }], featured: 0 },
  { name: 'VIP (Vasoactive Intestinal Peptide)', name_en: 'VIP', slug: 'vip', cat: 'inmunidad', short: 'Péptido intestinal vasoactivo para investigación inmune', short_en: 'Vasoactive intestinal peptide for immune research', presentation: 'Lyophilized vial', purity: 'HPLC >98%', sizes: [{ label: '5mg', price: 59.99, stock: 25 }], featured: 0 },
  { name: 'IGF-1 LR3', name_en: 'IGF-1 LR3', slug: 'igf-1-lr3', cat: 'hormona-de-crecimiento', short: 'Factor de crecimiento insulínico tipo 1 de larga acción', short_en: 'Long-acting insulin-like growth factor 1', presentation: 'Lyophilized vial', purity: 'HPLC >98%', sizes: [{ label: '100mcg', price: 49.99, stock: 35 }, { label: '1mg', price: 199.99, stock: 15 }], featured: 0 },
  { name: 'IGF-1 DES', name_en: 'IGF-1 DES', slug: 'igf-1-des', cat: 'hormona-de-crecimiento', short: 'Variante truncada de IGF-1 de alta potencia', short_en: 'High-potency truncated IGF-1 variant', presentation: 'Lyophilized vial', purity: 'HPLC >98%', sizes: [{ label: '100mcg', price: 44.99, stock: 30 }, { label: '1mg', price: 179.99, stock: 15 }], featured: 0 },
  { name: 'Follistatin 344', name_en: 'Follistatin 344', slug: 'follistatin-344', cat: 'hormona-de-crecimiento', short: 'Proteína inhibidora de miostatina', short_en: 'Myostatin-inhibiting protein', presentation: 'Lyophilized vial', purity: 'HPLC >97%', sizes: [{ label: '1mg', price: 89.99, stock: 20 }], featured: 0 },
  { name: 'ACE-031', name_en: 'ACE-031', slug: 'ace-031', cat: 'hormona-de-crecimiento', short: 'Proteína de fusión inhibidora de miostatina', short_en: 'Myostatin-inhibiting fusion protein', presentation: 'Lyophilized vial', purity: 'HPLC >97%', sizes: [{ label: '1mg', price: 99.99, stock: 15 }], featured: 0 },
];

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (name, name_en, slug, category_id, short_description, short_description_en, presentation, purity, price, stock, image, sizes, featured, active)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);
const backfillImage = db.prepare(`
  UPDATE products SET image = ? WHERE slug = ? AND (image IS NULL OR image = '')
`);

for (const p of products) {
  const catId = catMap[p.cat] || null;
  const totalStock = p.sizes.reduce((s, sz) => s + sz.stock, 0);
  const basePrice = p.sizes[0].price;
  const img = imageForSlug(p.slug);
  insertProduct.run(
    p.name, p.name_en, p.slug, catId, p.short, p.short_en,
    p.presentation, p.purity, basePrice, totalStock,
    img, JSON.stringify(p.sizes), p.featured
  );
  if (img) backfillImage.run(img, p.slug);
}

console.log(`Seeded ${products.length} products across ${categories.length} categories.`);
console.log('Admin credentials: admin / admin123');
