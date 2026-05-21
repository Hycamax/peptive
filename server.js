const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const { db, getSetting, setSetting, getAllSettings, applyDiscount } = require('./db');
const { t: translate, buildDescription } = require('./i18n');

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function localizeProduct(p, lang) {
  if (!p) return p;
  if (lang === 'en' && p.name_en) p.name = p.name_en;
  if (lang === 'en' && p.short_description_en) p.short_description = p.short_description_en;
  return p;
}

function localizeCategory(c, lang) {
  if (!c) return c;
  if (lang === 'en' && c.name_en) c.name = c.name_en;
  if (lang === 'en' && c.description_en) c.description = c.description_en;
  return c;
}

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

if (!process.env.SESSION_SECRET) {
  console.warn('  ⚠️  SESSION_SECRET no está configurado — usando valor por defecto. Cámbialo en producción.\n');
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'cambia-este-secreto-en-produccion',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD
  }
}));

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, safe);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = /\.(jpe?g|png|webp|gif)$/i.test(file.originalname);
    cb(ok ? null : new Error('Formato de imagen no soportado'), ok);
  }
});

const fmtMoney = (n, sym) => `${sym}${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const slug = s => slugify(s, { lower: true, strict: true, locale: 'es' });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseSizes(p) {
  if (!p.sizes) return null;
  try { const s = JSON.parse(p.sizes); return Array.isArray(s) && s.length ? s : null; } catch { return null; }
}

function findSize(sizesArr, label) {
  if (!sizesArr) return null;
  return sizesArr.find(s => s.label === label) || null;
}

function hydrateCart(sessionCart, pct) {
  const out = [];
  let dirty = false;
  for (const entry of sessionCart) {
    const p = db.prepare('SELECT id, name, slug, price, stock, image, active, sizes FROM products WHERE id = ?').get(entry.id);
    if (!p || !p.active) { dirty = true; continue; }
    const sizes = parseSizes(p);
    let unitBase, sizeStock, sizeLabel = entry.size || '';
    if (sizes) {
      const sz = findSize(sizes, sizeLabel) || sizes[0];
      if (!sz) { dirty = true; continue; }
      unitBase = sz.price;
      sizeStock = sz.stock;
      sizeLabel = sz.label;
      if (sizeLabel !== entry.size) dirty = true;
    } else {
      unitBase = p.price;
      sizeStock = p.stock;
      sizeLabel = '';
    }
    const qty = Math.max(0, Math.min(entry.quantity, sizeStock));
    if (qty === 0) { dirty = true; continue; }
    if (qty !== entry.quantity) dirty = true;
    const unit = applyDiscount(unitBase, pct);
    out.push({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      size: sizeLabel,
      basePrice: unitBase,
      stock: sizeStock,
      quantity: qty,
      unitPrice: unit,
      lineTotal: Math.round(unit * qty * 100) / 100,
      displayName: sizeLabel ? `${p.name} · ${sizeLabel}` : p.name
    });
  }
  return { items: out, dirty };
}

app.use((req, res, next) => {
  const settings = getAllSettings();
  const pct = parseFloat(settings.discount_percent) || 0;
  const cookies = parseCookies(req.headers.cookie);
  const lang = (cookies.lang === 'es' ? 'es' : 'en');
  const cart = req.session.cart || [];
  res.locals.lang = lang;
  res.locals.t = (key, vars) => translate(key, lang, vars);
  res.locals.buildDescription = (short, sizes) => buildDescription(short, sizes, lang);
  res.locals.settings = settings;
  if (lang === 'es') {
    settings.shipping_note = settings.shipping_note_es || settings.shipping_note;
    settings.legal_disclaimer = settings.legal_disclaimer_es || settings.legal_disclaimer;
  }
  res.locals.discountPct = pct;
  res.locals.applyDiscount = price => applyDiscount(price, pct);
  res.locals.fmt = n => fmtMoney(n, settings.currency_symbol || '$');
  res.locals.cartCount = cart.reduce((s, i) => s + (i.quantity || 0), 0);
  res.locals.currentPath = req.path;
  res.locals.flash = req.session.flash || null;
  req.session.flash = null;
  const cats = db.prepare('SELECT * FROM categories ORDER BY sort_order, name').all();
  for (const c of cats) localizeCategory(c, lang);
  res.locals.categories = cats;
  next();
});

app.get('/lang/:code', (req, res) => {
  const code = req.params.code === 'es' ? 'es' : 'en';
  res.setHeader('Set-Cookie', `lang=${code}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`);
  const back = req.get('referer') || '/';
  res.redirect(back);
});

function requireAdmin(req, res, next) {
  if (req.session.adminId) return next();
  res.redirect('/admin/login');
}

app.get('/', (req, res) => {
  const featured = db.prepare(`
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.active = 1 AND p.featured = 1
    ORDER BY p.created_at DESC LIMIT 8
  `).all();
  for (const p of featured) { p.sizesArr = parseSizes(p); localizeProduct(p, res.locals.lang); }
  res.render('index', { featured });
});

app.get('/products', (req, res) => {
  const { category: categoria, q, sort: orden } = req.query;
  let sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.active = 1
  `;
  const params = [];
  if (categoria) { sql += ' AND c.slug = ?'; params.push(categoria); }
  if (q) { sql += ' AND (p.name LIKE ? OR p.short_description LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  switch (orden) {
    case 'price_asc': case 'precio_asc': sql += ' ORDER BY p.price ASC'; break;
    case 'price_desc': case 'precio_desc': sql += ' ORDER BY p.price DESC'; break;
    case 'name': case 'nombre': sql += ' ORDER BY p.name ASC'; break;
    default: sql += ' ORDER BY p.featured DESC, p.created_at DESC';
  }
  const products = db.prepare(sql).all(...params);
  for (const p of products) { p.sizesArr = parseSizes(p); localizeProduct(p, res.locals.lang); }
  res.render('products', { products, filter: { categoria, q, orden } });
});

app.get('/product/:slug', (req, res) => {
  const p = db.prepare(`
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.slug = ? AND p.active = 1
  `).get(req.params.slug);
  if (!p) return res.status(404).render('404');
  p.sizesArr = parseSizes(p);
  localizeProduct(p, res.locals.lang);
  const related = db.prepare(`
    SELECT * FROM products WHERE category_id = ? AND id != ? AND active = 1 LIMIT 4
  `).all(p.category_id, p.id);
  for (const r of related) { r.sizesArr = parseSizes(r); localizeProduct(r, res.locals.lang); }
  res.render('product', { p, related });
});

app.get('/category/:slug', (req, res) => {
  res.redirect(`/products?category=${encodeURIComponent(req.params.slug)}`);
});

app.post('/cart/add', (req, res) => {
  const productId = parseInt(req.body.product_id, 10);
  const reqQty = Math.max(1, parseInt(req.body.quantity, 10) || 1);
  const requestedSize = (req.body.size || '').trim();
  const p = db.prepare('SELECT id, name, name_en, stock, sizes FROM products WHERE id = ? AND active = 1').get(productId);
  if (!p) {
    req.session.flash = { type: 'error', message: res.locals.t('flash.notFound') };
    return res.redirect('/products');
  }
  const displayName = res.locals.lang === 'en' && p.name_en ? p.name_en : p.name;
  const sizes = parseSizes(p);
  let sizeLabel = '', availStock;
  if (sizes) {
    const sz = findSize(sizes, requestedSize) || sizes[0];
    sizeLabel = sz.label;
    availStock = sz.stock;
  } else {
    availStock = p.stock;
  }
  const fullName = sizeLabel ? `${displayName} ${sizeLabel}` : displayName;
  if (availStock <= 0) {
    req.session.flash = { type: 'error', message: res.locals.t('flash.soldOut', { name: fullName }) };
    return res.redirect(req.body.redirect || '/cart');
  }
  req.session.cart = req.session.cart || [];
  const existing = req.session.cart.find(i => i.id === p.id && (i.size || '') === sizeLabel);
  const currentQty = existing ? existing.quantity : 0;
  const desiredQty = currentQty + reqQty;
  const finalQty = Math.min(desiredQty, availStock);
  if (existing) existing.quantity = finalQty;
  else req.session.cart.push({ id: p.id, size: sizeLabel, quantity: finalQty });
  if (finalQty < desiredQty) {
    req.session.flash = { type: 'success', message: res.locals.t('flash.addedCapped', { name: fullName, n: finalQty }) };
  } else {
    req.session.flash = { type: 'success', message: res.locals.t('flash.added', { name: fullName }) };
  }
  res.redirect(req.body.redirect || '/cart');
});

app.post('/cart/update', (req, res) => {
  const cart = req.session.cart || [];
  const qty = req.body.quantity || {};
  req.session.cart = cart
    .map((i, idx) => ({ id: i.id, size: i.size || '', quantity: Math.max(0, parseInt(qty[idx], 10) || 0) }))
    .filter(i => i.quantity > 0);
  res.redirect('/cart');
});

app.post('/cart/remove', (req, res) => {
  const id = parseInt(req.body.product_id, 10);
  const size = (req.body.size || '').trim();
  req.session.cart = (req.session.cart || []).filter(i => !(i.id === id && (i.size || '') === size));
  res.redirect('/cart');
});

app.get('/cart', (req, res) => {
  const { items, dirty } = hydrateCart(req.session.cart || [], res.locals.discountPct);
  if (dirty) req.session.cart = items.map(i => ({ id: i.id, size: i.size || '', quantity: i.quantity }));
  const subtotalBase = items.reduce((s, i) => s + i.basePrice * i.quantity, 0);
  const total = items.reduce((s, i) => s + i.lineTotal, 0);
  const savings = Math.round((subtotalBase - total) * 100) / 100;
  res.render('cart', { items, subtotalBase, total, savings });
});

app.get('/checkout', (req, res) => {
  const { items, dirty } = hydrateCart(req.session.cart || [], res.locals.discountPct);
  if (!items.length) {
    if (dirty) req.session.cart = [];
    return res.redirect('/cart');
  }
  if (dirty) req.session.cart = items.map(i => ({ id: i.id, size: i.size || '', quantity: i.quantity }));
  const total = items.reduce((s, i) => s + i.lineTotal, 0);
  res.render('checkout', { items, total, errors: [], form: {} });
});

app.post('/checkout', (req, res) => {
  const { items, dirty } = hydrateCart(req.session.cart || [], res.locals.discountPct);
  if (!items.length) {
    if (dirty) req.session.cart = [];
    return res.redirect('/cart');
  }
  if (dirty) {
    req.session.cart = items.map(i => ({ id: i.id, size: i.size || '', quantity: i.quantity }));
    req.session.flash = { type: 'error', message: res.locals.t('flash.cartChanged') };
    return res.redirect('/cart');
  }

  const b = req.body;
  const name = (b.name || '').trim();
  const email = (b.email || '').trim();
  const errors = [];
  if (!name) errors.push(res.locals.t('checkout.err.name'));
  if (!email) errors.push(res.locals.t('checkout.err.email'));
  else if (!EMAIL_RE.test(email)) errors.push(res.locals.t('checkout.err.emailFormat'));

  const subtotal = Math.round(items.reduce((s, i) => s + i.basePrice * i.quantity, 0) * 100) / 100;
  const total = Math.round(items.reduce((s, i) => s + i.lineTotal, 0) * 100) / 100;
  const discount = Math.round((subtotal - total) * 100) / 100;

  if (errors.length) {
    return res.render('checkout', { items, total, errors, form: b });
  }

  let orderId;
  db.exec('BEGIN');
  try {
    const liveById = new Map();
    for (const i of items) {
      const live = db.prepare('SELECT id, stock, active, sizes FROM products WHERE id = ?').get(i.id);
      if (!live || !live.active) throw new Error(`"${i.displayName}" ya no está disponible`);
      const liveSizes = parseSizes(live);
      if (liveSizes) {
        const sz = findSize(liveSizes, i.size);
        if (!sz || sz.stock < i.quantity) throw new Error(`Stock insuficiente para "${i.displayName}"`);
      } else if (live.stock < i.quantity) {
        throw new Error(`Stock insuficiente para "${i.displayName}"`);
      }
      liveById.set(i.id, { row: live, sizes: liveSizes });
    }
    const result = db.prepare(`
      INSERT INTO orders (customer_name, customer_email, customer_phone, shipping_address, city, state, zip, notes, subtotal, discount, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, email, b.phone || '', b.address || '', b.city || '', b.state || '', b.zip || '', b.notes || '', subtotal, discount, total);
    orderId = result.lastInsertRowid;
    const insItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total, size)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const decFlat = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
    const decSized = db.prepare('UPDATE products SET sizes = ?, stock = ? WHERE id = ?');
    for (const i of items) {
      insItem.run(orderId, i.id, i.displayName, i.unitPrice, i.quantity, i.lineTotal, i.size || '');
      const liveEntry = liveById.get(i.id);
      if (liveEntry.sizes) {
        const sz = findSize(liveEntry.sizes, i.size);
        sz.stock -= i.quantity;
        const newTotal = liveEntry.sizes.reduce((s, x) => s + x.stock, 0);
        decSized.run(JSON.stringify(liveEntry.sizes), newTotal, i.id);
      } else {
        const r = decFlat.run(i.quantity, i.id, i.quantity);
        if (r.changes !== 1) throw new Error(`Stock insuficiente para "${i.displayName}"`);
      }
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    req.session.flash = { type: 'error', message: e.message };
    return res.redirect('/cart');
  }

  req.session.cart = [];
  res.render('checkout_ok', { orderId, total, customerName: name });
});

app.get('/admin/login', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin');
  res.render('admin/login', { error: null });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.render('admin/login', { error: 'Credenciales inválidas' });
  }
  req.session.adminId = user.id;
  req.session.adminUser = user.username;
  res.redirect('/admin');
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

app.get('/admin', requireAdmin, (req, res) => {
  const stats = {
    products: db.prepare('SELECT COUNT(*) c FROM products').get().c,
    activeProducts: db.prepare('SELECT COUNT(*) c FROM products WHERE active = 1').get().c,
    categories: db.prepare('SELECT COUNT(*) c FROM categories').get().c,
    orders: db.prepare('SELECT COUNT(*) c FROM orders').get().c,
    pending: db.prepare("SELECT COUNT(*) c FROM orders WHERE status = 'pendiente'").get().c,
    revenue: db.prepare("SELECT COALESCE(SUM(total),0) s FROM orders WHERE status != 'cancelado'").get().s,
    lowStock: db.prepare('SELECT COUNT(*) c FROM products WHERE active = 1 AND stock > 0 AND stock <= 5').get().c,
    outOfStock: db.prepare('SELECT COUNT(*) c FROM products WHERE active = 1 AND stock <= 0').get().c
  };
  const recent = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all();
  res.render('admin/dashboard', { stats, recent });
});

app.get('/admin/products', requireAdmin, (req, res) => {
  const products = db.prepare(`
    SELECT p.*, c.name AS category_name
    FROM products p LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.created_at DESC
  `).all();
  res.render('admin/products', { products });
});

app.get('/admin/products/nuevo', requireAdmin, (req, res) => {
  res.render('admin/producto_form', { p: null });
});

app.get('/admin/products/:id/editar', requireAdmin, (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.redirect('/admin/products');
  res.render('admin/producto_form', { p });
});

app.post('/admin/products/guardar', requireAdmin, upload.single('image'), (req, res) => {
  const b = req.body;
  const name = (b.name || '').trim();
  if (!name) {
    req.session.flash = { type: 'error', message: 'El nombre es requerido' };
    return res.redirect(b.id ? `/admin/products/${b.id}/editar` : '/admin/products/nuevo');
  }
  const slugVal = b.slug ? slug(b.slug) : slug(name);
  const featured = b.featured ? 1 : 0;
  const active = b.active ? 1 : 0;
  const categoryId = b.category_id ? parseInt(b.category_id, 10) : null;
  let image = b.existing_image || '';
  if (req.file) image = `/uploads/${req.file.filename}`;
  try {
    if (b.id) {
      db.prepare(`
        UPDATE products SET name=?, slug=?, category_id=?, short_description=?, description=?,
          presentation=?, purity=?, price=?, stock=?, image=?, featured=?, active=?, updated_at=CURRENT_TIMESTAMP
        WHERE id=?
      `).run(name, slugVal, categoryId, b.short_description || '', b.description || '',
        b.presentation || '', b.purity || '', parseFloat(b.price) || 0, parseInt(b.stock, 10) || 0,
        image, featured, active, b.id);
      req.session.flash = { type: 'success', message: 'Producto actualizado' };
    } else {
      db.prepare(`
        INSERT INTO products (name, slug, category_id, short_description, description, presentation, purity, price, stock, image, featured, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, slugVal, categoryId, b.short_description || '', b.description || '',
        b.presentation || '', b.purity || '', parseFloat(b.price) || 0, parseInt(b.stock, 10) || 0,
        image, featured, active);
      req.session.flash = { type: 'success', message: 'Producto creado' };
    }
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) {
      req.session.flash = { type: 'error', message: 'Ese slug ya existe — usa uno distinto' };
      return res.redirect(b.id ? `/admin/products/${b.id}/editar` : '/admin/products/nuevo');
    }
    throw e;
  }
  res.redirect('/admin/products');
});

app.post('/admin/products/:id/eliminar', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  req.session.flash = { type: 'success', message: 'Producto eliminado' };
  res.redirect('/admin/products');
});

app.get('/admin/categorias', requireAdmin, (req, res) => {
  const cats = db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
    FROM categories c ORDER BY sort_order, name
  `).all();
  res.render('admin/categorias', { cats });
});

app.post('/admin/categorias/guardar', requireAdmin, (req, res) => {
  const b = req.body;
  const name = (b.name || '').trim();
  if (!name) {
    req.session.flash = { type: 'error', message: 'El nombre es requerido' };
    return res.redirect('/admin/categorias');
  }
  const slugVal = b.slug ? slug(b.slug) : slug(name);
  try {
    if (b.id) {
      db.prepare('UPDATE categories SET name=?, slug=?, description=?, sort_order=? WHERE id=?')
        .run(name, slugVal, b.description || '', parseInt(b.sort_order, 10) || 0, b.id);
    } else {
      db.prepare('INSERT INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)')
        .run(name, slugVal, b.description || '', parseInt(b.sort_order, 10) || 0);
    }
    req.session.flash = { type: 'success', message: 'Categoría guardada' };
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) {
      req.session.flash = { type: 'error', message: 'Ya existe una categoría con ese nombre o slug' };
    } else throw e;
  }
  res.redirect('/admin/categorias');
});

app.post('/admin/categorias/:id/eliminar', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  req.session.flash = { type: 'success', message: 'Categoría eliminada' };
  res.redirect('/admin/categorias');
});

app.get('/admin/pedidos', requireAdmin, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.render('admin/pedidos', { orders });
});

app.get('/admin/pedidos/:id', requireAdmin, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.redirect('/admin/pedidos');
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.render('admin/pedido_detalle', { order, items });
});

app.post('/admin/pedidos/:id/estado', requireAdmin, (req, res) => {
  const allowed = ['pendiente', 'pagado', 'enviado', 'cancelado'];
  if (!allowed.includes(req.body.status)) {
    req.session.flash = { type: 'error', message: 'Estado inválido' };
    return res.redirect('/admin/pedidos/' + req.params.id);
  }
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
  req.session.flash = { type: 'success', message: 'Estado actualizado' };
  res.redirect('/admin/pedidos/' + req.params.id);
});

app.get('/admin/ajustes', requireAdmin, (req, res) => {
  res.render('admin/ajustes', { all: getAllSettings() });
});

app.post('/admin/ajustes', requireAdmin, (req, res) => {
  const fields = [
    'store_name', 'store_tagline', 'currency', 'currency_symbol', 'discount_percent',
    'contact_email', 'contact_phone', 'whatsapp', 'shipping_note', 'legal_disclaimer',
    'primary_color', 'theme',
    'payment_spei_enabled', 'payment_spei_clabe', 'payment_spei_bank', 'payment_spei_holder',
    'payment_oxxo_enabled', 'payment_oxxo_note',
    'payment_zelle_enabled', 'payment_zelle_email', 'payment_zelle_name',
    'payment_wise_enabled', 'payment_wise_email', 'payment_wise_wisetag', 'payment_wise_note',
    'payment_eth_enabled', 'payment_eth_address', 'payment_eth_network', 'payment_eth_currencies',
    'payment_btc_enabled', 'payment_btc_address',
    'payment_mercadopago_enabled', 'payment_mercadopago_link',
    'payment_clip_enabled', 'payment_clip_link',
    'payment_nowpayments_enabled', 'payment_nowpayments_link'
  ];
  for (const f of fields) {
    if (f.endsWith('_enabled') && req.body[f] === undefined) req.body[f] = '0';
  }
  for (const f of fields) if (req.body[f] !== undefined) setSetting(f, req.body[f]);
  req.session.flash = { type: 'success', message: 'Ajustes guardados' };
  res.redirect('/admin/ajustes');
});

app.post('/admin/password', requireAdmin, (req, res) => {
  const { current, next, confirm } = req.body;
  const user = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.session.adminId);
  if (!bcrypt.compareSync(current, user.password_hash)) {
    req.session.flash = { type: 'error', message: 'Contraseña actual incorrecta' };
    return res.redirect('/admin/ajustes');
  }
  if (!next || next.length < 6 || next !== confirm) {
    req.session.flash = { type: 'error', message: 'Las contraseñas no coinciden o son muy cortas' };
    return res.redirect('/admin/ajustes');
  }
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(next, 10), user.id);
  req.session.flash = { type: 'success', message: 'Contraseña actualizada' };
  res.redirect('/admin/ajustes');
});

app.use((req, res) => res.status(404).render('404'));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || /Formato de imagen no soportado/.test(err.message || '')) {
    req.session.flash = { type: 'error', message: err.message };
    return res.redirect(req.get('referer') || '/admin/products');
  }
  console.error('[error]', err);
  res.status(500).render('500', { message: IS_PROD ? null : err.message });
});

app.listen(PORT, () => {
  console.log(`\n  Tienda activa: http://localhost:${PORT}`);
  console.log(`  Admin:         http://localhost:${PORT}/admin/login`);
  console.log(`  (Por defecto: usuario "admin" contraseña "admin123" — cámbialos)\n`);
});
