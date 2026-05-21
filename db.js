const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'shop.db'));
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id INTEGER,
    short_description TEXT DEFAULT '',
    description TEXT DEFAULT '',
    presentation TEXT DEFAULT '',
    purity TEXT DEFAULT '',
    price REAL NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    image TEXT DEFAULT '',
    featured INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT DEFAULT '',
    shipping_address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    state TEXT DEFAULT '',
    zip TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    subtotal REAL NOT NULL,
    discount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    unit_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    line_total REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const defaults = {
  store_name: 'PEPTIVE',
  store_tagline: 'SCIENCE. PURITY. POWER.',
  currency: 'USD',
  currency_symbol: '$',
  discount_percent: '0',
  contact_email: 'info@peptivelab.com',
  contact_phone: '+1 (888) 555-0199',
  whatsapp: '18885550199',
  shipping_note: 'Worldwide shipping. 2-5 business days.',
  legal_disclaimer: 'Research compounds for laboratory use only. Not for human or veterinary consumption.',
  primary_color: '#B8860B',
  theme: 'dark',

  payment_spei_enabled: '0',
  payment_spei_clabe: '',
  payment_spei_bank: '',
  payment_spei_holder: '',
  payment_oxxo_enabled: '0',
  payment_oxxo_note: 'Deposita en cualquier OXXO usando los datos SPEI desde la app de tu banco.',
  payment_zelle_enabled: '0',
  payment_zelle_email: '',
  payment_zelle_name: '',
  payment_wise_enabled: '0',
  payment_wise_email: '',
  payment_wise_wisetag: '',
  payment_wise_note: '',
  payment_eth_enabled: '0',
  payment_eth_address: '',
  payment_eth_network: 'Ethereum (ERC-20)',
  payment_eth_currencies: 'USDT, USDC, ETH',
  payment_btc_enabled: '0',
  payment_btc_address: '',
  payment_mercadopago_enabled: '0',
  payment_mercadopago_link: '',
  payment_clip_enabled: '0',
  payment_clip_link: '',
  payment_nowpayments_enabled: '0',
  payment_nowpayments_link: ''
};

const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const [k, v] of Object.entries(defaults)) insertSetting.run(k, v);

function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

function setSetting(key, value) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(key, String(value));
}

function getAllSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const out = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

function applyDiscount(price, pct) {
  if (pct === undefined) pct = parseFloat(getSetting('discount_percent', '0')) || 0;
  return Math.round(price * (1 - pct / 100) * 100) / 100;
}

module.exports = { db, getSetting, setSetting, getAllSettings, applyDiscount };
