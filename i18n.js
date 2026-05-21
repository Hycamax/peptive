const STRINGS = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.searchPlaceholder': 'Search...',
    'nav.cart': 'Cart',
    'nav.themeToggle': 'Toggle theme',

    // Promo / flash
    'promo.discount': '⚡ <strong>{pct}% off</strong> on the entire catalog · Worldwide shipping',

    // Hero
    'hero.eyebrow': 'Research-grade peptides · HPLC >99%',
    'hero.tagline': 'Science. Purity. Power.',
    'hero.promo': '⚡ {pct}% off applied to the entire catalog',
    'hero.cta.catalog': 'View catalog',
    'hero.cta.whatsapp': 'WhatsApp',
    'hero.f1': 'HPLC purity >99%',
    'hero.f2': 'Per-lot COA',
    'hero.f3': 'Worldwide shipping',

    // Trust strip
    'trust.purity.title': 'HPLC purity',
    'trust.purity.sub': 'Certified >99%',
    'trust.ship.title': 'Fast shipping',
    'trust.ship.sub': '2-5 business days',
    'trust.support.title': 'Direct support',
    'trust.support.sub': 'WhatsApp 1-on-1',
    'trust.stock.title': 'Stock on hand',
    'trust.stock.sub': 'Ready to ship',

    // Sections
    'section.categories': 'Explore by category',
    'section.featured': 'Featured products',
    'section.viewAll': 'See all →',

    // Product card
    'card.from': 'from',
    'card.sizes': 'sizes',
    'card.featured': '★ Top',
    'card.soldOut': 'Sold out',

    // Catalog
    'catalog.title': 'Catalog',
    'catalog.empty': 'No products match.',
    'catalog.allCategories': 'All',
    'catalog.sortLabel': 'Sort:',
    'catalog.sort.relevance': 'Relevance',
    'catalog.sort.priceAsc': 'Price ↑',
    'catalog.sort.priceDesc': 'Price ↓',
    'catalog.sort.name': 'Name',

    // Product detail
    'detail.size': 'Size',
    'detail.presentation': 'Presentation',
    'detail.purity': 'Purity',
    'detail.availability': 'Availability',
    'detail.inStock': 'In stock ({n})',
    'detail.outStock': 'Sold out',
    'detail.qty': 'Quantity',
    'detail.addCart': 'Add to cart',
    'detail.unit': '/ vial',
    'detail.save': 'You save {amount}',
    'detail.related': 'Related products',
    'detail.description': 'Description',

    // Cart
    'cart.title': 'Your cart',
    'cart.empty': 'Your cart is empty.',
    'cart.viewProducts': 'View products',
    'cart.col.product': 'Product',
    'cart.col.size': 'Size',
    'cart.col.price': 'Price',
    'cart.col.qty': 'Quantity',
    'cart.col.subtotal': 'Subtotal',
    'cart.update': 'Update cart',
    'cart.checkout': 'Checkout →',
    'cart.subtotalRaw': 'Subtotal (no discount):',
    'cart.discount': 'Discount ({pct}%):',
    'cart.total': 'Total:',
    'cart.remove': 'Remove',

    // Checkout
    'checkout.title': 'Checkout',
    'checkout.customer': 'Customer details',
    'checkout.name': 'Full name',
    'checkout.email': 'Email',
    'checkout.phone': 'Phone',
    'checkout.shipping': 'Shipping address',
    'checkout.address': 'Address',
    'checkout.city': 'City',
    'checkout.state': 'State',
    'checkout.zip': 'ZIP',
    'checkout.notes': 'Additional notes',
    'checkout.confirm': 'Confirm order',
    'checkout.note': 'Payment instructions will be sent by email.',
    'checkout.summary': 'Order summary',
    'checkout.discount': 'Discount applied:',
    'checkout.total': 'Total:',
    'checkout.errors': 'Please check:',
    'checkout.err.name': 'Name required',
    'checkout.err.email': 'Email required',
    'checkout.err.emailFormat': 'Invalid email',

    // Order confirmation + payments
    'ok.title': '✓ Order received',
    'ok.orderNumber': 'Your order number is',
    'ok.totalToPay': 'Total to pay:',
    'ok.holdNote': "We're holding your order for 24 hours. Choose your preferred payment method and confirm by WhatsApp.",
    'ok.choose': 'Choose how to pay',
    'ok.intro': 'Showing total: <strong>{total}</strong> · Order <strong>#{id}</strong>',
    'pm.noneConfigured': 'No payment methods configured yet.',
    'pm.coordinateWa': 'Coordinate payment by WhatsApp →',
    'pm.payNow': 'Pay {amount} →',
    'pm.foot.portal': "We'll open the secure processor portal in a new tab.",
    'pm.copy': 'Copy',
    'pm.copied': '✓ Copied',
    'pm.confirmPaid': "After paying, send us the receipt by WhatsApp to process shipping:",
    'pm.paidWa': "I've paid — confirm by WhatsApp",
    'pm.method.card.foot': "We'll open the secure processor portal in a new tab.",
    'pm.method.spei.bank': 'Bank',
    'pm.method.spei.holder': 'Account holder',
    'pm.method.spei.clabe': 'CLABE',
    'pm.method.spei.amount': 'Amount',
    'pm.method.spei.ref': 'Concept / reference',
    'pm.method.oxxo.foot': 'OXXO charges ~$11 commission per cash deposit.',
    'pm.method.zelle.beneficiary': 'Beneficiary',
    'pm.method.zelle.email': 'Email / Phone',
    'pm.method.zelle.concept': 'Concept',
    'pm.method.zelle.foot': "Convert the total to USD at today's rate. Zelle will display the recipient name when you enter the email.",
    'pm.method.wise.tag': 'Wisetag',
    'pm.method.wise.email': 'Wise email',
    'pm.method.wise.details': 'Details',
    'pm.method.wise.concept': 'Concept',
    'pm.method.wise.foot': 'Wisetag is the fastest — Wise will show the recipient when you enter it.',
    'pm.method.crypto.network': 'Network',
    'pm.method.crypto.coins': 'Coins',
    'pm.method.crypto.warn': '⚠️ Send only from <strong>{network}</strong>. Sending from another network (Ethereum, Polygon, Arbitrum, etc.) may result in lost funds.',
    'pm.method.crypto.foot': 'Send the equivalent of <strong>{total}</strong> in {coins} at today\'s rate. Share the transaction hash by WhatsApp.',
    'pm.method.crypto.copyAddr': 'Copy address',

    // Footer
    'footer.contact': 'Contact',
    'footer.shipping': 'Shipping',
    'footer.categories': 'Categories',
    'footer.admin': 'Admin',
    'footer.copyright': '© {year} {brand}',

    // 404 / 500
    '404.title': 'Page not found',
    '404.body': "The page you're looking for doesn't exist.",
    '404.cta': 'Back to home',
    '500.title': 'Something went wrong',
    '500.body': 'There was an error processing your request.',

    // Description template
    'tpl.sizes': 'Sizes',
    'tpl.purity': 'Purity',
    'tpl.disclaimer': 'Research compound for laboratory use only. Not for human or veterinary consumption. Store refrigerated at 2-8 °C. Keep out of reach of children.',
    'tpl.kit': '10 vials / kit',
    'tpl.viewWhatsapp': 'Chat on WhatsApp',

    // Cart hydration messages (flash)
    'flash.added': '"{name}" added to cart',
    'flash.addedCapped': 'Added "{name}" — capped at {n} due to available stock',
    'flash.notFound': 'Product not found',
    'flash.soldOut': '"{name}" is sold out',
    'flash.cartChanged': 'Your cart changed due to availability. Please review before confirming.'
  },

  es: {
    'nav.home': 'Inicio',
    'nav.products': 'Productos',
    'nav.categories': 'Categorías',
    'nav.searchPlaceholder': 'Buscar...',
    'nav.cart': 'Carrito',
    'nav.themeToggle': 'Cambiar tema',

    'promo.discount': '⚡ <strong>{pct}% de descuento</strong> en todo el catálogo · Envíos internacionales',

    'hero.eyebrow': 'Péptidos de grado investigación · HPLC >99%',
    'hero.tagline': 'Science. Purity. Power.',
    'hero.promo': '⚡ {pct}% de descuento en todo el catálogo',
    'hero.cta.catalog': 'Ver catálogo',
    'hero.cta.whatsapp': 'WhatsApp',
    'hero.f1': 'Pureza HPLC >99%',
    'hero.f2': 'COA por lote',
    'hero.f3': 'Envíos internacionales',

    'trust.purity.title': 'Pureza HPLC',
    'trust.purity.sub': 'Certificada >99%',
    'trust.ship.title': 'Envíos rápidos',
    'trust.ship.sub': '2-5 días hábiles',
    'trust.support.title': 'Atención directa',
    'trust.support.sub': 'WhatsApp 1 a 1',
    'trust.stock.title': 'Stock disponible',
    'trust.stock.sub': 'Listo para enviar',

    'section.categories': 'Explora por categoría',
    'section.featured': 'Productos destacados',
    'section.viewAll': 'Ver todo →',

    'card.from': 'desde',
    'card.sizes': 'tallas',
    'card.featured': '★ Top',
    'card.soldOut': 'Agotado',

    'catalog.title': 'Catálogo',
    'catalog.empty': 'No hay productos que coincidan.',
    'catalog.allCategories': 'Todas',
    'catalog.sortLabel': 'Ordenar:',
    'catalog.sort.relevance': 'Relevancia',
    'catalog.sort.priceAsc': 'Precio ↑',
    'catalog.sort.priceDesc': 'Precio ↓',
    'catalog.sort.name': 'Nombre',

    'detail.size': 'Presentación',
    'detail.presentation': 'Presentación',
    'detail.purity': 'Pureza',
    'detail.availability': 'Disponibilidad',
    'detail.inStock': 'En existencia ({n})',
    'detail.outStock': 'Agotado',
    'detail.qty': 'Cantidad',
    'detail.addCart': 'Agregar al carrito',
    'detail.unit': '/ vial',
    'detail.save': 'Ahorras {amount}',
    'detail.related': 'Productos relacionados',
    'detail.description': 'Descripción',

    'cart.title': 'Tu carrito',
    'cart.empty': 'Tu carrito está vacío.',
    'cart.viewProducts': 'Ver productos',
    'cart.col.product': 'Producto',
    'cart.col.size': 'Talla',
    'cart.col.price': 'Precio',
    'cart.col.qty': 'Cantidad',
    'cart.col.subtotal': 'Subtotal',
    'cart.update': 'Actualizar carrito',
    'cart.checkout': 'Finalizar compra →',
    'cart.subtotalRaw': 'Subtotal sin descuento:',
    'cart.discount': 'Descuento ({pct}%):',
    'cart.total': 'Total:',
    'cart.remove': 'Eliminar',

    'checkout.title': 'Finalizar compra',
    'checkout.customer': 'Datos del cliente',
    'checkout.name': 'Nombre completo',
    'checkout.email': 'Correo electrónico',
    'checkout.phone': 'Teléfono',
    'checkout.shipping': 'Dirección de envío',
    'checkout.address': 'Dirección',
    'checkout.city': 'Ciudad',
    'checkout.state': 'Estado',
    'checkout.zip': 'C.P.',
    'checkout.notes': 'Notas adicionales',
    'checkout.confirm': 'Confirmar pedido',
    'checkout.note': 'Recibirás instrucciones de pago por correo electrónico.',
    'checkout.summary': 'Resumen del pedido',
    'checkout.discount': 'Descuento aplicado:',
    'checkout.total': 'Total:',
    'checkout.errors': 'Revisa los datos:',
    'checkout.err.name': 'Nombre requerido',
    'checkout.err.email': 'Correo requerido',
    'checkout.err.emailFormat': 'Correo inválido',

    'ok.title': '✓ Pedido recibido',
    'ok.orderNumber': 'Tu número de pedido es',
    'ok.totalToPay': 'Total a pagar:',
    'ok.holdNote': 'Apartamos tu pedido por 24 horas. Elige tu método de pago preferido y confírmanos por WhatsApp.',
    'ok.choose': 'Elige cómo pagar',
    'ok.intro': 'Mostramos el monto total: <strong>{total}</strong> · Pedido <strong>#{id}</strong>',
    'pm.noneConfigured': 'Aún no hay métodos de pago configurados.',
    'pm.coordinateWa': 'Coordinar pago por WhatsApp →',
    'pm.payNow': 'Pagar {amount} →',
    'pm.foot.portal': 'Te abriremos el portal seguro del procesador en otra pestaña.',
    'pm.copy': 'Copiar',
    'pm.copied': '✓ Copiado',
    'pm.confirmPaid': 'Después de pagar, envíanos el comprobante por WhatsApp para procesar el envío:',
    'pm.paidWa': 'Ya pagué — confirmar por WhatsApp',
    'pm.method.card.foot': 'Te abriremos el portal seguro del procesador en otra pestaña.',
    'pm.method.spei.bank': 'Banco',
    'pm.method.spei.holder': 'Titular',
    'pm.method.spei.clabe': 'CLABE',
    'pm.method.spei.amount': 'Monto',
    'pm.method.spei.ref': 'Concepto / referencia',
    'pm.method.oxxo.foot': 'OXXO cobra una comisión de ~$11 por depósito en efectivo.',
    'pm.method.zelle.beneficiary': 'Beneficiario',
    'pm.method.zelle.email': 'Email / Teléfono',
    'pm.method.zelle.concept': 'Concepto',
    'pm.method.zelle.foot': 'Convierte el total a USD al tipo de cambio del día. Tu app de Zelle te mostrará el nombre del titular al ingresar el email.',
    'pm.method.wise.tag': 'Wisetag',
    'pm.method.wise.email': 'Email Wise',
    'pm.method.wise.details': 'Detalles',
    'pm.method.wise.concept': 'Concepto',
    'pm.method.wise.foot': 'El Wisetag es la forma más rápida — Wise te mostrará el titular al ingresarlo.',
    'pm.method.crypto.network': 'Red',
    'pm.method.crypto.coins': 'Monedas',
    'pm.method.crypto.warn': '⚠️ Envía únicamente desde <strong>{network}</strong>. Enviar desde otra red (Ethereum, Polygon, Arbitrum, etc.) puede causar pérdida de fondos.',
    'pm.method.crypto.foot': 'Envía el equivalente a <strong>{total}</strong> en {coins} al tipo de cambio del día. Confirma el hash por WhatsApp.',
    'pm.method.crypto.copyAddr': 'Copiar dirección',

    'footer.contact': 'Contacto',
    'footer.shipping': 'Envíos',
    'footer.categories': 'Categorías',
    'footer.admin': 'Admin',
    'footer.copyright': '© {year} {brand}',

    '404.title': 'Página no encontrada',
    '404.body': 'La página que buscas no existe.',
    '404.cta': 'Volver al inicio',
    '500.title': 'Algo salió mal',
    '500.body': 'Ocurrió un error procesando tu solicitud.',

    'tpl.sizes': 'Presentaciones',
    'tpl.purity': 'Pureza',
    'tpl.disclaimer': 'Producto destinado exclusivamente a uso de investigación científica en laboratorio. No apto para consumo humano ni veterinario. Almacenar refrigerado entre 2-8 °C. Manténgase fuera del alcance de los niños.',
    'tpl.kit': '10 viales / kit',
    'tpl.viewWhatsapp': 'Chatear por WhatsApp',

    'flash.added': '"{name}" agregado al carrito',
    'flash.addedCapped': 'Agregado "{name}" — limitado a {n} por stock disponible',
    'flash.notFound': 'Producto no encontrado',
    'flash.soldOut': '"{name}" está agotado',
    'flash.cartChanged': 'Tu carrito cambió por disponibilidad. Revisa antes de confirmar.'
  }
};

function interp(s, vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));
}

function t(key, lang, vars) {
  const dict = STRINGS[lang] || STRINGS.en;
  const fallback = STRINGS.en;
  const raw = dict[key] !== undefined ? dict[key] : (fallback[key] !== undefined ? fallback[key] : key);
  return interp(raw, vars);
}

function buildDescription(short, sizes, lang) {
  const sizeList = sizes && sizes.length ? sizes.map(s => s.label).join(' · ') : '';
  return [
    short,
    '',
    sizeList ? `${t('tpl.sizes', lang)}: ${sizeList} (${t('tpl.kit', lang)})` : '',
    `${t('tpl.purity', lang)}: HPLC >99%`,
    '',
    t('tpl.disclaimer', lang)
  ].filter(Boolean).join('\n');
}

module.exports = { t, STRINGS, buildDescription };
