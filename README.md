# PEPTIVE — Luxury Research Peptide E-Commerce

**Domain:** peptivelab.com  
**Brand:** PEPTIVE — "SCIENCE. PURITY. POWER."  
**Stack:** Node.js 22+ · Express 4 · EJS · SQLite (no build step, no frameworks)

---

## 🔒 Permanent product links (printed QR labels) — DO NOT BREAK

Physical vial labels carry a **QR code that points to `https://peptivelab.com/product/<slug>`**.
Those labels are already printed and installed on vials in the field, so **a product's slug must
never change** — if it changes, every printed QR for that product 404s.

Guarantees built into the code (keep them):

- **Admin edits never change a slug.** `POST /admin/products/guardar` sets the slug only when a
  product is *created*; editing the name/price/etc. leaves the slug untouched (`server.js`).
- **Catalog rebuilds preserve slugs.** `rebuild_catalog.js` snapshots each vial **code → slug**
  before wiping and reuses it, so `node rebuild_catalog.js --force` keeps existing URLs even if a
  display name changes. New products get a fresh slug.
- **Bonus permalink:** `GET /p/<CODE>` resolves a product by its immutable vial code (e.g.
  `/p/ADW10`) — even more change-proof than the slug. Optional; the slug URL is the canonical one.

**RULES for anyone editing the catalog:**
1. Never rename a `slug` or change a vial `code` once a label is printed.
2. To rebrand a product's display name, change `name`/`name_en` — the slug stays frozen on purpose.
3. New product → its slug/code is now permanent the moment its label is printed.

---

## Quick Start

```bash
npm install
node seed.js    # Seeds database with 65 products, 10 categories, admin user
npm start       # Starts on http://localhost:3000
```

**Admin panel:** http://localhost:3000/admin/login  
**Credentials:** `admin` / `admin123` (change immediately in production)

---

## Brand Identity

| Element | Value |
|---------|-------|
| Name | PEPTIVE |
| Tagline | SCIENCE. PURITY. POWER. |
| Logo | `public/img/peptive-seal.png` (gold DNA helix + fleur-de-lis on navy) |
| Primary Gold | `#B8860B` (18K Warm Gold) |
| Background | `#0A0A14` (Midnight Navy-Black) |
| Text/Platinum | `#F5F0E8` (Warm Platinum-White) |
| Ivory | `#FAF7F2` (Warm Ivory) |
| Aesthetic | Luxury peptide science meets haute couture cosmetics |

---

## Project Structure

```
peptive-website/
├── server.js              ← Express routes (storefront + admin)
├── db.js                  ← SQLite schema, settings helpers
├── i18n.js                ← EN/ES string dictionary + helpers
├── seed.js                ← Database seeder (65 products, 10 categories)
├── package.json           ← Dependencies
├── views/
│   ├── partials/
│   │   ├── header.ejs     ← Shared head + nav + lang toggle
│   │   ├── footer.ejs     ← Shared footer + script include
│   │   └── product_card.ejs ← Product card with branded SVG vial
│   ├── admin/             ← Admin panel views
│   │   ├── _layout_head.ejs / _layout_foot.ejs
│   │   ├── dashboard.ejs, productos.ejs, producto_form.ejs
│   │   ├── categorias.ejs, pedidos.ejs, pedido_detalle.ejs
│   │   ├── ajustes.ejs, login.ejs
│   ├── index.ejs          ← Homepage (hero, trust, categories, featured)
│   ├── productos.ejs      ← Catalog (sidebar filter, sort, grid)
│   ├── producto.ejs       ← Product detail (size chips, live price, vial)
│   ├── carrito.ejs        ← Cart
│   ├── checkout.ejs       ← Checkout form
│   ├── checkout_ok.ejs    ← Order confirmation + payment methods
│   ├── 404.ejs / 500.ejs  ← Error pages
├── public/
│   ├── css/styles.css     ← Complete design system (gold/navy tokens)
│   ├── js/app.js          ← Theme toggle + clipboard
│   ├── img/               ← Brand assets (seal, logos)
│   └── uploads/           ← 65 AI-generated product vial images
├── data/                  ← Created at runtime (shop.db)
└── source-products.pdf    ← Original product spec reference
```

---

## What Was Done (Rebrand Summary)

### Full PEPTYX → PEPTIVE Rebrand
- All views, CSS, i18n strings, database defaults updated
- New luxury navy/gold color palette (was navy/blue)
- Gold gradient wordmark in header with shimmer animation
- Updated SVG vial fallbacks with gold cap + PEPTIVE label
- Favicon updated to peptive-seal.png

### Design System Enhancements
- **Hero section:** Animated gradient glow, molecular SVG decorations, gold pulse effects, staggered fade-in animations
- **Product cards:** Hover lift with gold border glow, image zoom on hover
- **Size chips:** Gold active state with shadow, tactile hover feedback
- **Buttons:** Gold gradient with depth shadow, press animation
- **Trust strip:** Gold-accented icon boxes
- **Category tiles:** Gold letter watermark, gradient hover overlay
- **Typography:** Space Grotesk display + Inter body, gradient text on prices
- **Animations:** `@keyframes` for shimmer, float, pulse-gold, fade-in-up, gradient-shift, rotate-slow

### AI-Generated Product Images (65 total)
- Every product has a unique branded vial image
- Consistent luxury aesthetic: gold cap, PEPTIVE label, dark studio background
- Stored in `public/uploads/{slug}.png`
- Database `image` column pre-populated with paths

### Preserved Functionality
- Full cart + checkout flow with transactional stock management
- Size variants with live price/dose updates (detailVialDose hook)
- i18n (EN/ES) with cookie-based language switching
- Admin panel (products, categories, orders, settings)
- Payment methods (Zelle, Wise, BTC, SPEI, etc.)
- Light/dark theme toggle
- Responsive breakpoints (980px, 600px)
- All CSS class names and ID hooks preserved

---

## Key Technical Notes

### CSS Class Hooks (preserved — do not rename)
- `#themeToggle` — theme switch button
- `.btn-copy` — clipboard copy buttons
- `.size-chip` — size variant buttons
- `#detailVialDose` — live-updating dose label on product detail SVG
- `#priceNew`, `#priceOld`, `#saveBadge`, `#stockIndicator` — live price elements
- `#sizeField`, `#qtyField`, `#addBtn` — form controls

### i18n
- All UI strings in `i18n.js` (both `en` and `es` dictionaries)
- Products have `name_en` and `short_description_en` columns
- Categories have `name_en` and `description_en` columns
- The tagline "SCIENCE. PURITY. POWER." stays English in both languages
- Any new copy must be added to BOTH `en` and `es` in i18n.js

### Database
- SQLite via Node.js built-in `node:sqlite` (requires Node 22+)
- WAL mode enabled
- Run `node seed.js` to create fresh database with all products
- Database file: `data/shop.db` (created at runtime, not in repo)

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `SESSION_SECRET` | (insecure default) | Session encryption key — SET IN PRODUCTION |
| `NODE_ENV` | development | Set to `production` for secure cookies |

---

## Deployment

1. Ensure Node.js 22+ is available
2. `npm install`
3. Set environment variables:
   ```bash
   export SESSION_SECRET="$(openssl rand -hex 32)"
   export NODE_ENV=production
   export PORT=3000
   ```
4. `node seed.js` (first run only — creates database)
5. `node server.js` to start

For production, consider:
- A reverse proxy (nginx/caddy) for SSL termination
- PM2 or systemd for process management
- Changing the default admin password immediately after first login

---

## Color Palette Reference

```css
:root {
  --primary: #B8860B;          /* 18K Warm Gold */
  --primary-2: #0A0A14;        /* Midnight Navy-Black */
  --gold: #B8860B;
  --gold-light: #D4A017;       /* Lighter gold for hover states */
  --gold-dark: #8B6914;        /* Darker gold for depth */
  --ivory: #FAF7F2;            /* Warm Ivory (light mode bg) */
  --platinum: #F5F0E8;         /* Warm Platinum-White */
}
```

---

Built with care. The bones are solid — make it sing.
