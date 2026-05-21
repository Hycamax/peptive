# PEPTIVE — Claude Code Handoff Package

**Domain:** peptivelab.com  
**Brand:** PEPTIVE — "SCIENCE. PURITY. POWER."  
**Stack:** Node.js 22+ · Express 4 · EJS · SQLite (no build step, no frameworks)

---

## ⚡ Quick Start

```bash
npm install
node seed.js    # Creates database, 65 products, 10 categories, admin user
export SESSION_SECRET="$(openssl rand -hex 32)"
export NODE_ENV=production
node server.js  # http://localhost:3000
```

Admin: http://localhost:3000/admin/login — `admin` / `admin123`

---

## 🚨 CRITICAL — LIGHT THEME IS DEFAULT

The approved design uses the **LIGHT THEME** as default. Set `data-theme="light"` in `views/partials/header.ejs`.

| Token | Light Theme (DEFAULT) | Dark Theme (toggle) |
|-------|----------------------|---------------------|
| Background | #FAF7F2 (warm ivory) | #0A0A14 (navy-black) |
| Surface | #FFFFFF | #12121E |
| Text Primary | #1A1A2E | #F5F0E8 |
| Text Secondary | #4A4A5A | #A0A0B0 |
| Gold Accent | #B8860B | #D4A843 |
| Border | #E8E0D4 | #2A2A3E |

Reference mockup: `public/img/homepage-mockup-light.png`

---

## 🎯 What This Handoff Needs (Your Tasks)

This codebase is a fully rebranded PEPTIVE e-commerce site. The code works end-to-end. Your job is to elevate it further in three specific areas:

### Task 1 — Hero Section Logo (PRIORITY)
The homepage hero section (`views/index.ejs`) currently shows the text wordmark "PEPTIVE" in a gradient font. **The user wants a large, prominent visual logo** in the hero, specifically:

- **Use `public/img/peptive-wordmark.png`** — this is the elegant serif PEPTIVE wordmark with the gold DNA helix integrated as the letter I, and "SCIENCE. PURITY. POWER." tagline below it (cream/ivory background with gold accents)
- Display it large and centered in the hero section
- The hero should feel like a luxury brand landing page — think Chanel, Tom Ford, La Mer
- Alternatively, use `public/img/peptive-seal-dark.png` (the circular gold seal on navy) as a secondary element
- The hero currently has a molecular animation background — keep that, just add the logo image prominently

**In `views/index.ejs`, the hero section:**
```html
<section class="hero hero-peptive">
  <div class="hero-molecules" aria-hidden="true"></div>
  <div class="hero-content">
    <span class="hero-eyebrow">...</span>
    <h1 class="hero-title">
      <span class="hero-wordmark">PEPTIVE</span>  <!-- Replace or supplement this -->
    </h1>
    ...
  </div>
</section>
```

Consider replacing the text wordmark with an `<img>` of `peptive-wordmark.png`, or placing the seal above the text, or both. Make it stunning.

### Task 2 — Size-Toggle Image Switching (Images Already Done ✅)
All 65 product vial images are ALREADY GENERATED and placed in `public/uploads/{slug}.png`. No generation needed.

**IMPORTANT — QR CODE ON THE VIAL:** The QR code is part of the actual vial label design (printed on the label itself). It is NOT a separate floating overlay on the product image. The QR code appears as a small element in the bottom-right area of the cream label on the vial. Do NOT add any separate QR code overlay on top of the product images.

**YOUR TASK:** Implement size-toggle image switching on the product detail page. When a customer toggles between sizes (e.g., 5mg, 10mg, 30mg), the vial image should visually update to show the correct dosage. Options:
- Use CSS/JS to overlay the dosage text dynamically on the base vial image
- Or generate size-specific variants from the base images

The original approved vial style for reference:

**Approved vial style spec:**
- Silver/aluminum crimp cap (no gold cap)
- Clear glass body with slight liquid
- Cream/ivory rectangular label
- **PEPTIVE wordmark** (elegant serif, gold DNA helix as the letter I) at top of label
- "SCIENCE. PURITY. POWER." in small spaced gold caps below wordmark
- Decorative thin gold horizontal rule with center ornament
- Product name in bold dark pharmaceutical font (large)
- Product classification in small italics (e.g., "GLP-1 / GIP / GCGR Triple Agonist")
- Dose/size in medium dark text
- "Purity ≥ 99%" in a gold pill-shaped badge
- "Research Use Only" in small dark text
- "Pharmacy Grade" in small gold italic text
- Small QR code in bottom-right corner (links to https://peptivelab.com)
- Deep navy blue background
- Warm gold rim light on right edge, warm glow reflection on surface below

**Reference images available in `public/img/`:**
- `vial-proof-approved.png` — the exact approved final style
- `peptive-wordmark.png` — the wordmark to render on labels
- `qr-peptivelab.png` — the actual QR code for peptivelab.com

**Product list with classifications** (get full list from database or `seed.js`):

| Product | Classification |
|---------|---------------|
| Tirzepatide | GLP-1 / GIP Dual Agonist |
| Semaglutide | GLP-1 Receptor Agonist |
| Retatrutide | GLP-1 / GIP / GCGR Triple Agonist |
| Tesofensine | Triple Monoamine Reuptake Inhibitor |
| AOD-9604 | hGH Fragment (176-191) |
| 5-Amino-1MQ | NNMT Inhibitor |
| BPC-157 | Gastric Pentadecapeptide |
| TB-500 | Thymosin Beta-4 |
| BPC-157 + TB-500 Blend | Recovery Peptide Blend |
| Pentosan Polysulfate | Glycosaminoglycan Analog |
| GHK-Cu | Copper Tripeptide |
| Semax | ACTH(4-10) Analog |
| Selank | Tuftsin Analog |
| Dihexa | Angiotensin IV Analog |
| P21 | Neurotrophic Peptide |
| NSI-189 | Neurogenic Compound |
| NAD+ | Nicotinamide Adenine Dinucleotide |
| Epitalon | Telomerase Activator |
| FOXO4-DRI | Senolytic Peptide |
| SS-31 (Elamipretide) | Mitochondrial Peptide |
| MOTS-c | Mitochondria-Derived Peptide |
| Humanin | Cytoprotective Peptide |
| Thymosin Alpha-1 | Immunomodulatory Peptide |
| LL-37 | Antimicrobial Cathelicidin |
| KPV | α-MSH Tripeptide |
| Larazotide | Tight Junction Peptide |
| HGH Fragment 176-191 | GH Lipolytic Fragment |
| CJC-1295 (no DAC) | GHRH Analog |
| CJC-1295 + Ipamorelin Blend | GHRH + GHRP Blend |
| Ipamorelin | Selective GH Secretagogue |
| Tesamorelin | GHRH Analog |
| Sermorelin | GHRH(1-29) Analog |
| MK-677 (Ibutamoren) | Oral GH Secretagogue |
| HGH 191aa | Recombinant Human GH |
| GHRP-6 | GH Releasing Hexapeptide |
| GHRP-2 | GH Releasing Peptide-2 |
| Hexarelin | Hexapeptide GH Secretagogue |
| PT-141 (Bremelanotide) | Melanocortin Receptor Agonist |
| Kisspeptin-10 | HPG Axis Regulator |
| Melanotan II | α-MSH Analog |
| Gonadorelin | Synthetic GnRH |
| GHK-Cu (Topical) | Topical Copper Tripeptide |
| Copper Peptide AHK-Cu | Copper Peptide |
| Snap-8 | Botox-Like Octapeptide |
| Matrixyl 3000 | Collagen-Stimulating Peptide |
| Weight Loss Stack | Metabolic Peptide Stack |
| Recovery Stack | Recovery Peptide Stack |
| Anti-Aging Stack | Longevity Peptide Stack |
| GH Optimization Stack | GH Peptide Stack |
| Bacteriostatic Water | Reconstitution Solvent |
| Insulin Syringes (100pk) | Research Accessory |
| Alcohol Prep Pads | Research Accessory |
| Liraglutide | GLP-1 Receptor Agonist |
| DSIP (Delta Sleep) | Delta Sleep-Inducing Peptide |
| Cerebrolysin | Neurotrophic Peptide Mixture |
| Thymulin | Thymic Nonapeptide |
| Palmitoyl Pentapeptide-4 | Collagen-Signaling Peptide |
| Oxytocin | Neuropeptide |
| Ipamorelin + GHRP-2 Blend | Dual GH Secretagogue Blend |
| Pinealon | Pineal Regulatory Tripeptide |
| VIP (Vasoactive Intestinal Peptide) | Neuropeptide |
| IGF-1 LR3 | Long-Acting IGF-1 |
| IGF-1 DES | Truncated IGF-1 Variant |
| Follistatin 344 | Myostatin Inhibitor |
| ACE-031 | Myostatin-Inhibiting Fusion Protein |

**Images already at:** `public/uploads/{slug}.png` — all 65 done with real QR codes ✅

### Task 3 — FULL MOCKUP MATCHING (NOT optional polish — this is a REQUIREMENT)
The site MUST match the approved mockup at `public/img/homepage-mockup-light.png` EXACTLY. This is not vague polish — it's a specific visual target. Here's what must match:

1. **Header:** Small PEPTIVE wordmark logo (not large text) in the nav bar, with Home/Products/Categories links, search bar, EN|ES toggle, theme toggle, cart icon
2. **Hero:** Large PEPTIVE serif wordmark with gold DNA helix I, gold ornamental divider with molecular endpoints, "SCIENCE. PURITY. POWER." tagline, pill badge "Research-grade peptides · HPLC ≥99%", two CTA buttons ("View Catalog →" and "WhatsApp"), three trust badges below (HPLC Purity >99%, Per-lot COA, Worldwide Shipping)
3. **Trust bar:** 4 icon cards in a row (HPLC PURITY, FAST SHIPPING, DIRECT SUPPORT, STOCK ON HAND) with gold icons
4. **Category section:** "Explore by category" with 5 icon-card tiles (Metabolic Health, Performance & Recovery, Anti-Aging & Longevity, Cognitive Support, Research Tools) — each with a gold icon, letter watermark, title, and description
5. **Featured products:** Dark navy luxury product cards with the vial images, product name, category tag, price, "Purity ≥ 99%" badge — 4 per row
6. **Footer:** 4-column layout (Brand + socials, Contact info, Shipping info, Categories list)
7. **Overall feel:** Warm ivory (#FAF7F2) background, gold accents, elegant serif headings, clean sans-serif body text, subtle molecule line-art decorations (NOT gold orbs or heavy gradients)

Do NOT interpret this as optional suggestions. The mockup IS the spec.

---

## 🗂 Project Structure

```
peptive-website/
├── server.js              ← All Express routes
├── db.js                  ← SQLite schema + settings helpers
├── i18n.js                ← EN/ES string dictionary
├── seed.js                ← Database seeder (run first!)
├── package.json
├── source-products.pdf    ← Original 63-product spec with Tier-3 pricing
├── views/
│   ├── partials/
│   │   ├── header.ejs     ← Shared head + nav (PEPTIVE wordmark here)
│   │   ├── footer.ejs     ← Shared footer
│   │   └── product_card.ejs ← Product card with SVG vial fallback
│   ├── admin/             ← Admin panel (lower priority)
│   ├── index.ejs          ← Homepage ← HERO LOGO GOES HERE
│   ├── products.ejs       ← Catalog (sidebar filter, sort, grid)
│   ├── product.ejs        ← Product detail (size chips, live price)
│   ├── cart.ejs           ← Cart
│   ├── checkout.ejs       ← Checkout form
│   ├── checkout_ok.ejs    ← Order confirmation + payment methods
│   ├── 404.ejs / 500.ejs
├── public/
│   ├── css/styles.css     ← Complete design system (gold/navy tokens)
│   ├── js/app.js          ← Theme toggle + clipboard
│   ├── img/
│   │   ├── peptive-seal.png          ← Circular gold seal logo (navy bg)
│   │   ├── peptive-seal-dark.png     ← Same seal (dark bg version)
│   │   ├── peptive-wordmark.png      ← Serif wordmark with DNA helix I
│   │   ├── vial-proof-approved.png   ← APPROVED vial style reference
│   │   ├── qr-peptivelab.png         ← QR code for peptivelab.com
│   │   ├── horizontal_transparent.png
│   │   ├── horizontal_white_bg.png
│   │   ├── seal_transparent.png
│   │   └── seal_white_bg.png
│   └── uploads/           ← 65 product vial images with QR codes (DONE ✅)
└── data/                  ← Created at runtime (shop.db)
```

---

## 🌐 Routes (English)

| Route | View | Description |
|-------|------|-------------|
| `GET /` | `index.ejs` | Homepage |
| `GET /products` | `products.ejs` | Catalog (query: `?category=`, `?q=`, `?sort=`) |
| `GET /product/:slug` | `product.ejs` | Product detail |
| `GET /cart` | `cart.ejs` | Cart |
| `GET /checkout` | `checkout.ejs` | Checkout form |
| `POST /checkout` | `checkout_ok.ejs` | Order confirmation |
| `POST /cart/add` | — | Add to cart |
| `POST /cart/update` | — | Update quantities |
| `POST /cart/remove` | — | Remove item |
| `GET /category/:slug` | — | Redirects to `/products?category=` |
| `GET /lang/:code` | — | Sets language cookie (en/es) |
| `GET /admin/*` | `admin/` | Admin panel |

---

## 🎨 Design Tokens (CSS)

```css
:root {
  --primary: #B8860B;          /* 18K Warm Gold */
  --primary-2: #0A0A14;        /* Midnight Navy-Black */
  --gold: #B8860B;
  --gold-light: #D4A017;
  --gold-dark: #8B6914;
  --ivory: #FAF7F2;
  --platinum: #F5F0E8;
  --accent-gradient: linear-gradient(135deg, #D4A017 0%, #8B6914 50%, #B8860B 100%);
}
```

Dark theme surfaces: `#06060C` → `#0E0E1A` → `#121220` → `#1A1A2E`

---

## 🔒 Preserved JS Hooks (do NOT rename)

| Hook | Location | Purpose |
|------|----------|---------|
| `#themeToggle` | header.ejs | Theme switch |
| `.btn-copy` | checkout_ok.ejs | Clipboard copy |
| `.size-chip` | product.ejs | Size variant selector |
| `#detailVialDose` | product.ejs SVG | Live dose label update |
| `#priceNew` | product.ejs | Live price display |
| `#priceOld` | product.ejs | Live original price |
| `#saveBadge` | product.ejs | Live savings badge |
| `#stockIndicator` | product.ejs | Live stock status |
| `#sizeField` | product.ejs | Hidden size input |
| `#qtyField` | product.ejs | Quantity input |
| `#addBtn` | product.ejs | Add to cart button |

---

## 🌍 i18n Notes

- Default language: **English** (cookie `lang=en`)
- Spanish toggle: sets `lang=es` cookie, valid 1 year
- All strings in `i18n.js` — both `en` and `es` dictionaries
- Tagline "SCIENCE. PURITY. POWER." stays English in both languages
- Any new copy must be added to BOTH `en` and `es`
- Products have `name_en` / `short_description_en` columns
- Categories have `name_en` / `description_en` columns

---

## 🚀 Deployment

```bash
npm install
node seed.js
export SESSION_SECRET="$(openssl rand -hex 32)"
export NODE_ENV=production
node server.js
```

Requires Node.js 22+ (uses built-in `node:sqlite`).

---

## 📦 What's Already Done

- ✅ Full PEPTYX → PEPTIVE rebrand (all files)
- ✅ Luxury navy/gold color palette (`#B8860B` gold, `#0A0A14` navy)
- ✅ Premium CSS animations (gradient shimmer, float, pulse-gold, fade-in-up)
- ✅ English routes (`/products`, `/product/:slug`, `/cart`, `/checkout`)
- ✅ Spanish as toggle option (preserved)
- ✅ 65 products seeded across 10 categories with size variants
- ✅ Storefront catalog view rebuilt
- ✅ SVG vial fallbacks updated to gold/navy PEPTIVE branding
- ✅ All brand assets in `public/img/`
- ✅ ALL 65 PRODUCT VIAL IMAGES with real scannable QR codes in `public/uploads/`
- ✅ Approved vial proof with QR: `public/img/vial-proof-approved-scannable.png`
- ✅ Real scannable QR code: `public/img/qr-peptivelab-real.png`
- ✅ Approved seal logo: `public/img/peptive-seal-approved.png`
- ✅ Approved wordmark logo: `public/img/peptive-wordmark-approved.png`
- ✅ Homepage mockups: `public/img/homepage-mockup-light.png` (DEFAULT) + `homepage-mockup-dark.png`
- ✅ All functionality preserved (cart, checkout, admin, i18n, size variants)

---

## 🎯 REMAINING TASKS FOR CLAUDE CODE (SUMMARY)

1. **Set light theme as default** — `data-theme="light"` in header.ejs
2. **Fill hero with large PEPTIVE wordmark** — use `public/img/peptive-wordmark-approved.png`, NO empty space
3. **Implement size-toggle image switching** — vial image updates when toggling dosage sizes
4. **FULL MOCKUP MATCH** — rebuild the homepage to EXACTLY match `public/img/homepage-mockup-light.png` (header, hero, trust bar, categories, featured products with dark cards, footer). This is NOT optional polish.
5. **QR codes are ON the vial labels** — do NOT add separate QR overlays on product images. The QR is already part of the printed label in the vial images.
6. **Deploy to peptivelab.com** when ready

---

*Built with care. The bones are solid — make it sing. ✦*
