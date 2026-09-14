(() => {
  'use strict';

  const APP_VERSION = '1.1.0';
  const STORAGE_KEY = 'refshop-commerce-os-v1';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const money = (value, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value || 0));
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const esc = (value = '') => String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  const CATEGORY_CONFIG = [
    { id: 'officiating', name: 'Officiating', detail: 'Uniforms, game equipment and professional tools for sports officials.' },
    { id: 'apparel', name: 'Apparel', detail: 'Professional shirts, pants, jackets, warm-ups, socks and accessories.' },
    { id: 'equipment', name: 'Equipment', detail: 'Whistles, lanyards, flags, timers, bags and game-day equipment.' },
    { id: 'training', name: 'Training', detail: 'Rule study, education, video learning and officiating development.' },
    { id: 'technology', name: 'Technology', detail: 'Cameras, communication tools, tablets, software and digital services.' },
    { id: 'digital', name: 'Digital Products', detail: 'Courses, downloads, memberships, licenses, streaming and API products.' },
    { id: 'rtbo', name: 'RTBO Collection', detail: 'Official Raising The Bar Officiating ecosystem products and experiences.' },
    { id: 'schools', name: 'Schools & Teams', detail: 'Institutional purchasing, team packages and organization-ready collections.' }
  ];

  const portalConfig = {
    seller: {
      title: 'Seller Central',
      items: ['dashboard','catalog','add-product','inventory','orders','returns','fulfillment','pricing','promotions','advertising','brand-management','store-builder','messages','reviews','performance','account-health','analytics','finance','payouts','reports','tax-documents','settings','support']
    },
    business: {
      title: 'RefShop Business',
      items: ['home','organization-setup','users','groups','departments','cost-centers','buying-policies','approvals','purchase-requests','purchase-orders','quotes','rfqs','business-catalog','business-pricing','orders','invoices','payments','tax-exemption','spend-analytics','settings']
    },
    supplier: {
      title: 'Supplier Portal',
      items: ['dashboard','products','contracts','purchase-orders','shipments','receipts','invoices','forecasts','compliance','performance','documents','settings','support']
    },
    admin: {
      title: 'Admin Control Center',
      items: ['executive-dashboard','orders','products','catalog','categories','brands','sellers','suppliers','customers','organizations','inventory','warehouses','procurement','fulfillment','transportation','returns','refunds','disputes','fraud','trust-safety','brand-protection','advertising','promotions','memberships','subscriptions','gift-cards','rewards','finance','ledger','payouts','tax','analytics','reports','cms','notifications','support','integrations','api-management','ai-control-plane','automation','rules','roles','permissions','feature-flags','audit-logs','system-health','settings']
    }
  };

  const customerPageMeta = {
    'new-releases':['New Releases','Newly published products and launches from RefShop and approved marketplace sellers.'],
    'best-sellers':['Best Sellers','High-performing products can appear here when real order data exists.'],
    'deals':['Deals','Current promotions, coupons and time-bound offers managed by the promotion engine.'],
    'rtbo-exclusives':['RTBO Exclusives','Products and experiences exclusive to the Raising The Bar Officiating ecosystem.'],
    'digital-products':['Digital Products','Software, courses, downloads, streaming access, memberships, licenses and digital bundles.'],
    'marketplace':['RefShop Marketplace','Discover products from verified sellers, brands, creators and RefShop first-party retail.'],
    'brand-stores':['Brand Stores','Verified brand storefronts and enhanced product collections.'],
    'creator-commerce':['Creator Commerce','Creator storefronts, curated collections, affiliate products, short-form video and livestream commerce.'],
    'advertising':['RefShop Ads','Retail media for sponsored products, brands, categories, search, display and video advertising.'],
    'gift-cards':['Gift Cards','Digital and physical RefShop gift card architecture.'],
    'membership':['RefShop+','Configurable premium commerce membership benefits without imitating third-party membership branding.'],
    'services':['Services Marketplace','Training, consulting, clinics, film review, evaluation, assigning and production services.'],
    'developer':['Developer Portal','Versioned APIs, OAuth, API keys, webhooks, usage analytics, sandbox and developer documentation.'],
    'help':['Help Center','CMS-managed assistance for orders, shipping, returns, payments, accounts, memberships, sellers, business, privacy and security.'],
    'returns-policy':['Returns Policy','Policy-managed returns and reverse-logistics information.'],
    'privacy':['Privacy','Consent, data controls, export, deletion, communication preferences and regional privacy rules.'],
    'terms':['Terms','Versioned commerce, marketplace and account terms managed by the policy system.']
  };

  function emptyState() {
    return {
      version: APP_VERSION,
      products: [], cart: [], wishlist: [], orders: [], returns: [], reviews: [],
      sellers: [], suppliers: [], organizations: [], supportTickets: [], newsletter: [],
      location: '', audit: [], featureFlags: {}, cms: {}, pendingPayment: null,
      preferences: { currency: 'USD' }
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...emptyState(), ...JSON.parse(raw) } : emptyState();
    } catch { return emptyState(); }
  }

  let state = loadState();
  const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const audit = (action, entity, details = {}) => {
    state.audit.unshift({ id: uid(), action, entity, details, at: new Date().toISOString() });
    state.audit = state.audit.slice(0, 300);
    saveState();
  };

  const app = $('#app');
  const header = $('[data-header]');
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const desktopDropdowns = $$('.has-dropdown');
  const desktopToggles = $$('.dropdown-toggle');
  const mobileItems = $$('.mobile-item');
  const mobileDropdownToggles = $$('.mobile-dropdown-toggle');

  function closeDesktopDropdowns() {
    desktopDropdowns.forEach(item => {
      item.classList.remove('is-open');
      $('.dropdown-toggle', item)?.setAttribute('aria-expanded', 'false');
    });
  }
  function closeMobileDropdowns() {
    mobileItems.forEach(item => item.classList.remove('is-open'));
    mobileDropdownToggles.forEach(toggle => toggle.setAttribute('aria-expanded','false'));
  }
  function setMenuOpen(open) {
    header.classList.toggle('menu-open', open);
    menuToggle?.setAttribute('aria-expanded', String(open));
    menuToggle?.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    mobileMenu?.setAttribute('aria-hidden', String(!open));
    if (!open) closeMobileDropdowns();
  }
  menuToggle?.addEventListener('click', () => setMenuOpen(!header.classList.contains('menu-open')));
  desktopToggles.forEach(toggle => toggle.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    const parent = toggle.closest('.has-dropdown');
    const shouldOpen = !parent.classList.contains('is-open');
    closeDesktopDropdowns();
    if (shouldOpen) { parent.classList.add('is-open'); toggle.setAttribute('aria-expanded','true'); }
  }));
  mobileDropdownToggles.forEach(toggle => toggle.addEventListener('click', e => {
    e.preventDefault();
    const item = toggle.closest('.mobile-item');
    const shouldOpen = !item.classList.contains('is-open');
    closeMobileDropdowns();
    if (shouldOpen) { item.classList.add('is-open'); toggle.setAttribute('aria-expanded','true'); }
  }));
  document.addEventListener('click', e => {
    if (!header.contains(e.target)) { closeDesktopDropdowns(); setMenuOpen(false); }
    if (e.target.closest('[data-route-link]')) { closeDesktopDropdowns(); setMenuOpen(false); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDesktopDropdowns(); setMenuOpen(false); } });

  function toast(message, title = 'RefShop') {
    const region = $('#toast-region');
    const item = document.createElement('div');
    item.className = 'toast';
    item.innerHTML = `<strong>${esc(title)}</strong><div>${esc(message)}</div>`;
    region.appendChild(item);
    setTimeout(() => item.remove(), 3200);
  }

  function updateGlobalUI() {
    $$('[data-cart-count]').forEach(el => el.textContent = state.cart.reduce((s, item) => s + Number(item.qty || 1), 0));
    $('[data-location-label]').textContent = state.location || 'Set location';
    $('[data-year]').textContent = new Date().getFullYear();
  }

  function routePath() {
    return (location.hash.replace(/^#\/?/, '') || 'home').replace(/\/$/,'');
  }

  function linkTitle(slug) {
    return slug.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  function breadcrumb(items) {
    return `<div class="breadcrumb"><a href="#/home">Home</a>${items.map(item => `<span>›</span>${item.href ? `<a href="${item.href}">${esc(item.label)}</a>` : `<span>${esc(item.label)}</span>`}`).join('')}</div>`;
  }

  function transition() { return `<div class="section-transition" aria-hidden="true"></div>`; }

  function productCard(product) {
    const inWishlist = state.wishlist.includes(product.id);
    const inventory = Number(product.inventory || 0);
    const media = product.image ? `<img src="${esc(product.image)}" alt="${esc(product.name)}">` : `<span class="media-placeholder" aria-hidden="true">◈</span>`;
    return `<article class="product-card" data-product-id="${product.id}">
      <div class="product-media">${media}${product.badge ? `<span class="badge">${esc(product.badge)}</span>` : ''}<button class="wishlist-button ${inWishlist ? 'active' : ''}" type="button" data-action="wishlist" data-id="${product.id}" aria-label="${inWishlist ? 'Remove from' : 'Add to'} wishlist">♥</button></div>
      <div class="product-body">
        <span class="product-brand">${esc(product.brand || 'RefShop Marketplace')}</span>
        <a class="product-title" href="#/product/${product.id}">${esc(product.name)}</a>
        <div class="product-meta"><span>${esc(linkTitle(product.category || 'uncategorized'))}</span><span>${inventory > 0 ? `${inventory} available` : 'Unavailable'}</span></div>
        <div class="product-price">${money(product.price, product.currency || 'USD')}</div>
        <div class="product-actions"><button class="button primary" type="button" data-action="add-cart" data-id="${product.id}" ${inventory < 1 ? 'disabled title="Inventory unavailable"' : ''}>Add to Cart</button><a class="icon-button" href="#/product/${product.id}" aria-label="View product">→</a></div>
      </div>
    </article>`;
  }

  function homePage() {
    const products = state.products.filter(p => p.status !== 'archived').slice(0,6);
    return `<section class="hero">
      <div class="hero-grid">
        <div>
          <p class="eyebrow">The Commerce Home of Raising The Bar Officiating</p>
          <h1>BUILT FOR <span>THE GAME.</span><br>READY FOR BUSINESS.</h1>
          <p class="hero-copy">The RefShop brings officials, schools, teams, brands, creators and marketplace sellers into one premium commerce ecosystem—designed for retail today and enterprise operations tomorrow.</p>
          <div class="hero-actions"><a class="button primary" href="#/shop">Shop RefShop</a><a class="button ghost" href="#/sell">Sell on RefShop</a><a class="button ghost" href="#/business">RefShop Business</a></div>
        </div>
        <div class="hero-logo-stage"><img src="assets/refshop-logo.png" alt="The RefShop by Raising The Bar Officiating"></div>
      </div>
    </section>
    <div class="trust-strip"><div class="trust-item"><strong>Multi-Channel Commerce</strong><span>B2C · B2B · D2C · Wholesale</span></div><div class="trust-item"><strong>Marketplace Ready</strong><span>Seller, brand and creator commerce</span></div><div class="trust-item"><strong>Digital + Physical</strong><span>Products, subscriptions and entitlements</span></div><div class="trust-item"><strong>Enterprise Operations</strong><span>Procurement, fulfillment, data and AI</span></div></div>
    ${transition()}
    <section class="section dark"><div class="page-shell"><div class="section-head"><div><p class="eyebrow">Shop by Department</p><h2>Everything officials need.</h2></div><p>Department structure is CMS-ready and can expand without changing application code.</p></div><div class="category-grid">${CATEGORY_CONFIG.map(c => `<a class="category-card" href="#/category/${c.id}"><span>Department</span><h3>${esc(c.name)}</h3><p>${esc(c.detail)}</p></a>`).join('')}</div></div></section>
    ${transition()}
    <section class="section graphite"><div class="page-shell"><div class="section-head"><div><p class="eyebrow">Commerce Discovery</p><h2>Featured products</h2></div><a class="button ghost" href="#/shop">View all products</a></div>${products.length ? `<div class="product-grid">${products.map(productCard).join('')}</div>` : `<div class="empty-state"><div><div class="empty-icon">◫</div><h3>No production products have been published yet.</h3><p>The storefront intentionally uses an empty state instead of fabricated product data. Add real products from Admin Control Center or Seller Central and they will appear here automatically.</p><a class="button primary" href="#/admin/products">Manage Products</a></div></div>`}</div></section>
    ${transition()}
    <section class="section dark"><div class="page-shell"><div class="section-head"><div><p class="eyebrow">Enterprise Commerce</p><h2>One platform. Multiple operating models.</h2></div><p>The storefront is only one experience layer. The same commerce foundation supports sellers, suppliers, business purchasing, retail media and logistics operations.</p></div><div class="feature-grid"><div class="feature-card"><div class="feature-icon">◎</div><h3>Seller Marketplace</h3><p>Seller onboarding, offer management, account health, payouts, analytics and trust workflows.</p><a class="button ghost small" href="#/seller">Open Seller Central</a></div><div class="feature-card"><div class="feature-icon">▦</div><h3>RefShop Business</h3><p>Organization accounts, departments, approvals, POs, contract pricing, quotes and spend analytics.</p><a class="button ghost small" href="#/business">Open Business</a></div><div class="feature-card"><div class="feature-icon">⌘</div><h3>Admin Control Center</h3><p>Commerce operations, product CRUD, marketplace governance, fraud, finance, rules and platform controls.</p><a class="button ghost small" href="#/admin">Open Admin</a></div></div></div></section>
    ${transition()}
    <section class="section graphite"><div class="page-shell"><div class="section-head"><div><p class="eyebrow">Broadcast Commerce</p><h2>Live Shopping Studio</h2></div><p>The approved RTBO iPad video player is integrated as the commerce video experience for livestream shopping, product films and creator content.</p></div><div class="feature-grid"><div class="feature-card"><h3>Product Film</h3><p>Pair detailed product storytelling with the approved broadcast player.</p></div><div class="feature-card"><h3>Creator Commerce</h3><p>Support creator-hosted product discovery and shoppable video experiences.</p></div><div class="feature-card"><h3>Livestream Shopping</h3><p>Future commerce events can tag products without forcing users to leave playback.</p></div></div><div class="hero-actions"><a class="button primary" href="#/live-shopping">Open Live Shopping Studio</a></div></div></section>`;
  }

  function shopPage(categoryId = null, searchTerm = '') {
    let products = state.products.filter(p => p.status !== 'archived');
    if (categoryId && categoryId !== 'all') products = products.filter(p => p.category === categoryId);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      products = products.filter(p => [p.name,p.brand,p.description,p.sku,p.category].some(v => String(v || '').toLowerCase().includes(q)));
    }
    const category = CATEGORY_CONFIG.find(c => c.id === categoryId);
    const title = searchTerm ? `Search: ${searchTerm}` : category ? category.name : 'Shop RefShop';
    return `<section class="page-hero"><div class="page-shell">${breadcrumb([{label:title}])}<p class="eyebrow">Commerce Discovery</p><h1>${esc(title)}</h1><p>${category ? esc(category.detail) : 'Search and browse the RefShop catalog across physical, digital, marketplace and service commerce.'}</p></div></section>
    <section class="section dark"><div class="page-shell"><div class="content-layout"><aside class="filter-panel"><h2>Refine</h2><div class="filter-group"><label for="catalog-filter-search">Search results</label><input id="catalog-filter-search" type="search" value="${esc(searchTerm)}" placeholder="Filter products" data-action="catalog-search"></div><div class="filter-group"><strong>Category</strong>${CATEGORY_CONFIG.map(c => `<label><input type="radio" name="category-filter" data-action="category-filter" value="${c.id}" ${categoryId===c.id?'checked':''}> ${esc(c.name)}</label>`).join('')}<label><input type="radio" name="category-filter" data-action="category-filter" value="all" ${!categoryId?'checked':''}> All</label></div></aside><div><div class="result-toolbar"><span><strong>${products.length}</strong> product${products.length===1?'':'s'}</span><select data-action="sort-products" aria-label="Sort products"><option value="recent">Recently added</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name</option></select></div><div id="catalog-results">${products.length ? `<div class="product-grid">${products.map(productCard).join('')}</div>` : `<div class="empty-state"><div><div class="empty-icon">⌕</div><h3>No products match this view.</h3><p>RefShop does not inject fake product records. Publish a real product or adjust the search/filter.</p><a class="button primary" href="#/admin/products">Add Products</a></div></div>`}</div></div></div></div></section>`;
  }

  function productPage(id) {
    const p = state.products.find(x => x.id === id);
    if (!p) return notFound('Product not found', 'The requested product does not exist or has been removed from this browser workspace.');
    const inventory = Number(p.inventory || 0);
    return `<section class="page-hero"><div class="page-shell">${breadcrumb([{label:'Shop',href:'#/shop'},{label:p.name}])}</div></section><section class="section dark"><div class="page-shell"><div class="product-detail"><div class="product-gallery"><div class="thumbs"><div class="thumb"></div><div class="thumb"></div><div class="thumb"></div></div><div class="product-main-media">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}">` : `<div class="empty-state" style="width:100%;border:0"><div><div class="empty-icon">◈</div><h3>Product image not uploaded</h3></div></div>`}</div></div><aside class="detail-panel"><p class="eyebrow">${esc(p.brand || 'RefShop Marketplace')}</p><h1>${esc(p.name)}</h1><p class="subtle">SKU: ${esc(p.sku || 'Not assigned')}</p><div class="price">${money(p.price,p.currency||'USD')}</div><p class="subtle">${inventory > 0 ? `${inventory} unit${inventory===1?'':'s'} currently available` : 'Currently unavailable'}</p><div class="detail-block"><p>${esc(p.description || 'Product description has not yet been published.')}</p></div><div class="detail-block"><div class="quantity-row"><label for="detail-qty">Quantity</label><select id="detail-qty">${Array.from({length:Math.max(1,Math.min(10,inventory))},(_,i)=>`<option>${i+1}</option>`).join('')}</select></div></div><div class="detail-actions"><button class="button primary" data-action="add-cart" data-id="${p.id}" ${inventory<1?'disabled':''}>Add to Cart</button><button class="button ghost" data-action="wishlist" data-id="${p.id}">Wishlist</button></div><div class="detail-block"><strong>Fulfillment</strong><p class="subtle">${esc(p.fulfillment || 'Seller / fulfillment routing not configured')}</p></div><div class="detail-block"><strong>Seller</strong><p class="subtle">${esc(p.seller || 'RefShop / seller not assigned')}</p></div></aside></div></div></section>${transition()}<section class="section graphite"><div class="page-shell"><div class="section-head"><div><p class="eyebrow">Product Information</p><h2>Specifications</h2></div></div><table class="spec-table"><tbody><tr><th>Category</th><td>${esc(linkTitle(p.category || 'uncategorized'))}</td></tr><tr><th>Product type</th><td>${esc(p.type || 'Physical')}</td></tr><tr><th>SKU</th><td>${esc(p.sku || 'Not assigned')}</td></tr><tr><th>Seller</th><td>${esc(p.seller || 'Not assigned')}</td></tr><tr><th>Status</th><td>${esc(p.status || 'draft')}</td></tr></tbody></table></div></section>`;
  }

  function cartPage() {
    const lines = state.cart.map(line => ({...line, product: state.products.find(p => p.id === line.productId)})).filter(x => x.product);
    const subtotal = lines.reduce((s,l)=>s + Number(l.product.price||0)*Number(l.qty||1),0);
    return `<section class="page-hero"><div class="page-shell">${breadcrumb([{label:'Cart'}])}<p class="eyebrow">Checkout Journey</p><h1>Your Cart</h1><p>Persistent cart state is stored locally in this build and synchronizes across RefShop views in this browser.</p></div></section><section class="section dark"><div class="page-shell">${lines.length ? `<div class="cart-layout"><div>${lines.map(l=>`<article class="cart-item"><div class="cart-image">${l.product.image?`<img src="${esc(l.product.image)}" alt="">`:'◈'}</div><div><h3><a href="#/product/${l.product.id}">${esc(l.product.name)}</a></h3><p>${esc(l.product.brand || '')}</p><div class="cart-controls"><select data-action="cart-qty" data-id="${l.product.id}" aria-label="Quantity for ${esc(l.product.name)}">${Array.from({length:Math.max(1,Math.min(10,Number(l.product.inventory||10)))},(_,i)=>`<option value="${i+1}" ${Number(l.qty)==i+1?'selected':''}>Qty ${i+1}</option>`).join('')}</select><button class="button ghost small" data-action="remove-cart" data-id="${l.product.id}">Remove</button><button class="button ghost small" data-action="move-wishlist" data-id="${l.product.id}">Save for later</button></div></div><strong>${money(Number(l.product.price)*Number(l.qty))}</strong></article>`).join('')}</div><aside class="summary-card"><h2>Order Summary</h2><div class="summary-row"><span>Items</span><span>${money(subtotal)}</span></div><div class="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div><div class="summary-row"><span>Tax</span><span>Calculated at checkout</span></div><div class="summary-row total"><span>Subtotal</span><span>${money(subtotal)}</span></div><a class="button primary" href="#/checkout">Proceed to Checkout</a></aside></div>` : `<div class="empty-state"><div><div class="empty-icon">🛒</div><h3>Your cart is empty.</h3><p>Browse the catalog and add an available product to begin checkout.</p><a class="button primary" href="#/shop">Shop RefShop</a></div></div>`}</div></section>`;
  }

  function checkoutPage() {
    const lines = state.cart.map(line => ({...line, product: state.products.find(p => p.id === line.productId)})).filter(x => x.product);
    if (!lines.length) return `<section class="page-hero"><div class="page-shell"><p class="eyebrow">Checkout</p><h1>No items to checkout.</h1><p>Add products to your cart before beginning checkout.</p><a class="button primary" href="#/shop">Shop RefShop</a></div></section>`;
    const subtotal = lines.reduce((sum,line)=>sum+Number(line.product.price||0)*Number(line.qty||1),0);
    return `<section class="page-hero"><div class="page-shell">${breadcrumb([{label:'Cart',href:'#/cart'},{label:'Checkout'}])}<p class="eyebrow">Secure Checkout</p><h1>Checkout</h1><p>RefShop now includes a provider-abstraction payment layer for Stripe Checkout, Apple Pay, Google Pay, ACH, PayPal and approved business/offline payment workflows.</p></div></section>
    <section class="section dark"><div class="page-shell"><div class="cart-layout">
      <form class="form-card checkout-form" data-checkout-form>
        <div class="notice info"><strong>Secure gateway architecture:</strong> Payment credentials stay on the server. The browser never stores Stripe secret keys, PayPal secrets or raw card numbers. Merchant credentials are required before live charging is enabled.</div>
        <h2>Contact & Delivery</h2>
        <div class="form-grid">
          <label>Email<input name="email" type="email" autocomplete="email" required></label>
          <label>Full name<input name="name" autocomplete="name" required></label>
          <label class="full">Address<input name="address" autocomplete="street-address" required></label>
          <label>City<input name="city" autocomplete="address-level2" required></label>
          <label>State/Region<input name="region" autocomplete="address-level1" required></label>
          <label>Postal code<input name="postal" autocomplete="postal-code" required></label>
          <label>Country<select name="country"><option value="US">United States</option></select></label>
        </div>
        <div class="checkout-divider"></div>
        <fieldset class="payment-fieldset">
          <legend>Payment Method</legend>
          <div class="payment-method-grid">
            <label class="payment-method-card"><input type="radio" name="payment" value="stripe" checked><span class="payment-method-icon">▰</span><span><strong>Card & Digital Wallets</strong><small>Stripe Checkout · Apple Pay · Google Pay · Link</small></span><em data-payment-status="stripe">Checking gateway…</em></label>
            <label class="payment-method-card"><input type="radio" name="payment" value="paypal"><span class="payment-method-icon">P</span><span><strong>PayPal</strong><small>PayPal wallet and eligible PayPal methods</small></span><em data-payment-status="paypal">Checking gateway…</em></label>
            <label class="payment-method-card"><input type="radio" name="payment" value="ach"><span class="payment-method-icon">⌁</span><span><strong>ACH / Bank Debit</strong><small>US bank payment through the configured Stripe account</small></span><em data-payment-status="ach">Checking gateway…</em></label>
            <label class="payment-method-card"><input type="radio" name="payment" value="bank-transfer"><span class="payment-method-icon">▦</span><span><strong>Bank Transfer</strong><small>Invoice / remittance instructions for approved accounts</small></span><em class="available">Workflow ready</em></label>
            <label class="payment-method-card"><input type="radio" name="payment" value="purchase-order"><span class="payment-method-icon">PO</span><span><strong>Purchase Order</strong><small>RefShop Business approval and PO workflow</small></span><em class="available">Business accounts</em></label>
            <label class="payment-method-card"><input type="radio" name="payment" value="store-value"><span class="payment-method-icon">◆</span><span><strong>Gift Card / Store Credit</strong><small>Internal stored-value ledger integration point</small></span><em class="available">Ledger required</em></label>
          </div>
        </fieldset>
        <div id="payment-stage" class="payment-stage" aria-live="polite"></div>
        <div class="form-actions"><button class="button primary payment-submit" type="submit">Continue to Secure Payment</button></div>
      </form>
      <aside class="summary-card"><h2>Order Summary</h2>${lines.map(l=>`<div class="summary-row"><span>${esc(l.product.name)} × ${l.qty}</span><span>${money(Number(l.product.price)*Number(l.qty))}</span></div>`).join('')}<div class="summary-row"><span>Shipping</span><span>Calculated by commerce services</span></div><div class="summary-row"><span>Tax</span><span>Calculated by tax service</span></div><div class="summary-row total"><span>Current subtotal</span><span>${money(subtotal)}</span></div><div class="payment-security"><strong>Payment security</strong><p>Card data is collected by the selected PCI-scoped payment provider. RefShop retains provider transaction references and ledger events, not raw PAN data.</p></div></aside>
    </div></div></section>`;
  }

  function paymentSuccessPage() {
    return `<section class="page-hero"><div class="page-shell">${breadcrumb([{label:'Checkout',href:'#/checkout'},{label:'Payment Status'}])}<p class="eyebrow">Payment Verification</p><h1>Verifying Payment</h1><p>RefShop is confirming the payment result with the server-side gateway before creating an order record.</p></div></section><section class="section dark"><div class="page-shell"><div class="payment-result-card" data-payment-result><div class="payment-spinner" aria-hidden="true"></div><h2>Confirming gateway response…</h2><p>Do not close this page until verification completes.</p></div></div></section>`;
  }

  function accountPage() {
    return `<section class="page-hero"><div class="page-shell">${breadcrumb([{label:'Account'}])}<p class="eyebrow">Customer Experience</p><h1>Your RefShop</h1><p>Orders, returns, digital entitlements, lists, memberships, subscriptions and account controls converge here.</p></div></section><section class="section dark"><div class="page-shell"><div class="feature-grid"><a class="feature-card" href="#/orders"><div class="feature-icon">▤</div><h3>Orders</h3><p>Track orders, shipments, returns and reorders.</p></a><a class="feature-card" href="#/wishlist"><div class="feature-icon">♥</div><h3>Wishlist</h3><p>Save products and move them into cart later.</p></a><a class="feature-card" href="#/digital-library"><div class="feature-icon">▶</div><h3>Digital Library</h3><p>Future entitlements, downloads, licenses and streaming access.</p></a><a class="feature-card" href="#/membership"><div class="feature-icon">✦</div><h3>Membership</h3><p>Manage RefShop+ plans, benefits and renewal preferences.</p></a><a class="feature-card" href="#/subscriptions"><div class="feature-icon">↻</div><h3>Subscriptions</h3><p>Recurring products and services, skip/pause/cancel controls.</p></a><a class="feature-card" href="#/support"><div class="feature-icon">?</div><h3>Support</h3><p>Open and track customer support requests.</p></a></div></div></section>`;
  }

  function ordersPage() {
    return `<section class="page-hero"><div class="page-shell">${breadcrumb([{label:'Account',href:'#/account'},{label:'Orders'}])}<p class="eyebrow">Order Management</p><h1>Orders</h1><p>Production orders will appear here after they are created by a connected order service.</p></div></section><section class="section dark"><div class="page-shell">${state.orders.length ? `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Order</th><th>Status</th><th>Total</th><th>Created</th></tr></thead><tbody>${state.orders.map(o=>`<tr><td>${esc(o.id)}</td><td><span class="status-pill">${esc(o.status)}</span></td><td>${money(o.total)}</td><td>${new Date(o.createdAt).toLocaleString()}</td></tr>`).join('')}</tbody></table></div>` : `<div class="empty-state"><div><div class="empty-icon">▤</div><h3>No orders yet.</h3><p>No fabricated order history is shown. Real orders will populate this view after checkout and payment services are connected.</p><a class="button primary" href="#/shop">Start Shopping</a></div></div>`}</div></section>`;
  }

  function wishlistPage() {
    const products = state.wishlist.map(id=>state.products.find(p=>p.id===id)).filter(Boolean);
    return `<section class="page-hero"><div class="page-shell">${breadcrumb([{label:'Account',href:'#/account'},{label:'Wishlist'}])}<p class="eyebrow">Saved Products</p><h1>Wishlist</h1></div></section><section class="section dark"><div class="page-shell">${products.length ? `<div class="product-grid">${products.map(productCard).join('')}</div>` : `<div class="empty-state"><div><div class="empty-icon">♡</div><h3>Your wishlist is empty.</h3><p>Use the heart control on any real product to save it here.</p><a class="button primary" href="#/shop">Browse Products</a></div></div>`}</div></section>`;
  }

  function supportPage() {
    return `<section class="page-hero"><div class="page-shell">${breadcrumb([{label:'Help',href:'#/help'},{label:'Contact Support'}])}<p class="eyebrow">Customer Support</p><h1>Contact Support</h1><p>Create a local support case in this build. A production deployment would route this to the authorized support domain and customer-service console.</p></div></section><section class="section dark"><div class="page-shell"><div class="content-layout"><form class="form-card" data-support-form><h2>Open a case</h2><div class="form-grid"><label>Email<input name="email" type="email" required></label><label>Topic<select name="topic"><option>Order</option><option>Shipping</option><option>Return</option><option>Account</option><option>Marketplace</option><option>Business</option><option>Digital Product</option></select></label><label class="full">Subject<input name="subject" required></label><label class="full">Message<textarea name="message" required></textarea></label></div><div class="form-actions"><button class="button primary" type="submit">Create Support Case</button></div></form><aside class="side-panel"><h2>Open cases</h2>${state.supportTickets.length ? state.supportTickets.map(t=>`<div class="detail-block"><strong>${esc(t.subject)}</strong><p class="subtle">${esc(t.topic)} · ${new Date(t.createdAt).toLocaleString()}</p><span class="status-pill">Open</span></div>`).join('') : `<p class="subtle">No support cases have been created in this browser workspace.</p>`}</aside></div></div></section>`;
  }

  function sellPage() {
    return `<section class="page-hero"><div class="page-shell">${breadcrumb([{label:'Marketplace',href:'#/marketplace'},{label:'Sell on RefShop'}])}<p class="eyebrow">Marketplace Seller Onboarding</p><h1>Sell on RefShop</h1><p>Seller onboarding captures business, store, verification and marketplace information before production approval workflows.</p></div></section><section class="section dark"><div class="page-shell"><div class="content-layout"><form class="form-card" data-seller-form><h2>Seller application</h2><div class="form-grid"><label>Business name<input name="business" required></label><label>Store name<input name="store" required></label><label>Contact email<input name="email" type="email" required></label><label>Business type<select name="type"><option>Brand owner</option><option>Manufacturer</option><option>Distributor</option><option>Retail seller</option><option>Creator</option></select></label><label class="full">Primary categories<input name="categories" placeholder="e.g. Officiating equipment, apparel"></label><label class="full">Business summary<textarea name="summary" required></textarea></label></div><div class="notice"><strong>Verification:</strong> Identity, business, tax, banking and compliance verification require secure backend integrations. This local application does not collect sensitive identity or bank data.</div><div class="form-actions"><button class="button primary" type="submit">Save Seller Application</button></div></form><aside class="side-panel"><h2>Marketplace onboarding</h2><div class="detail-block"><strong>1. Business profile</strong><p class="subtle">Company and storefront information.</p></div><div class="detail-block"><strong>2. Verification</strong><p class="subtle">Identity, beneficial ownership, tax and banking checks.</p></div><div class="detail-block"><strong>3. Category approval</strong><p class="subtle">Policy and restricted-product eligibility.</p></div><div class="detail-block"><strong>4. Launch</strong><p class="subtle">Catalog, inventory, fulfillment and account health.</p></div></aside></div></div></section>`;
  }

  function genericCustomerPage(key) {
    const [title, description] = customerPageMeta[key] || [linkTitle(key), 'This commerce capability is part of The RefShop operating system.'];
    const related = {
      'digital-products':['Entitlements','License Management','Downloads','Streaming Access','Subscriptions','API Products'],
      'marketplace':['Seller Verification','Featured Offer','Trust Scores','Seller Stores','Reviews','Marketplace Support'],
      'brand-stores':['Brand Registry','Enhanced Content','Store Builder','Brand Analytics','IP Protection','Approved Assets'],
      'creator-commerce':['Creator Profiles','Collections','Livestreams','Short-form Video','Affiliate Tracking','Creator Analytics'],
      'advertising':['Sponsored Products','Sponsored Brands','Sponsored Search','Display','Video','ROAS Analytics'],
      'membership':['Configurable Benefits','Monthly / Annual','Student Plans','Organization Plans','Member Deals','Digital Benefits'],
      'developer':['Public API','Partner API','Seller API','Webhooks','OAuth','Sandbox'],
      'help':['Orders','Shipping','Returns','Refunds','Accounts','Security']
    }[key] || ['Personalization','Search & Discovery','Commerce Rules','Analytics','Notifications','Operational Controls'];
    return `<section class="page-hero"><div class="page-shell">${breadcrumb([{label:title}])}<p class="eyebrow">The RefShop Commerce OS</p><h1>${esc(title)}</h1><p>${esc(description)}</p></div></section><section class="section dark"><div class="page-shell"><div class="feature-grid">${related.map((x,i)=>`<div class="feature-card"><div class="feature-icon">${['◆','▦','◉','↗','◎','⌘'][i%6]}</div><h3>${esc(x)}</h3><p>${capabilityCopy(x)}</p></div>`).join('')}</div></div></section>`;
  }

  function capabilityCopy(name) {
    const map = {
      'Entitlements':'Grant, expire, revoke and track access to purchased digital products.',
      'License Management':'Architecture for activation, device limits, versions and revocation.',
      'Downloads':'Controlled delivery with entitlement validation and download policy.',
      'Streaming Access':'Secure access-control foundation for premium media products.',
      'Subscriptions':'Recurring billing state and benefit assignment as a dedicated domain.',
      'API Products':'Metered product access through governed API credentials.',
      'Seller Verification':'Identity and business verification orchestration with human review.',
      'Featured Offer':'Configurable selection signals separated from clearly labeled advertising.',
      'Trust Scores':'Marketplace integrity signals across seller, product and transaction risk.',
      'Seller Stores':'Original marketplace storefronts for approved seller organizations.',
      'Reviews':'Verified purchase, moderation, abuse reporting and fraud-detection architecture.',
      'Marketplace Support':'Case workflows for buyers, sellers and marketplace operations.',
      'Public API':'Versioned commerce endpoints with scoped authentication and rate limits.',
      'Partner API':'Partner integrations isolated from internal service implementation.',
      'Seller API':'Programmatic listings, inventory, pricing, order and report workflows.',
      'Webhooks':'Signed event delivery with retries, event IDs and delivery history.',
      'OAuth':'Scoped authorization for customer, seller, partner and developer applications.',
      'Sandbox':'Controlled development environment without production data exposure.'
    };
    return map[name] || `${name} is represented as a configurable capability within the RefShop domain architecture.`;
  }

  function liveShoppingPage() {
    return `<section class="page-hero"><div class="page-shell">${breadcrumb([{label:'Live Shopping'}])}<p class="eyebrow">Approved RTBO Video Experience</p><h1>Live Shopping Studio</h1><p>The player below is the supplied approved iPad 13 video player preserved as its own component. Upload video through the player's native controls for local playback and product-film review.</p></div></section><section class="video-page"><div class="video-note"><div class="notice info"><strong>Commerce integration:</strong> Product tagging and transaction APIs are prepared as experience-layer extensions; no fake product tags are injected into the approved player.</div></div><div class="video-shell"><iframe src="components/ipad-player/index.html" title="Approved RTBO iPad video player" allow="fullscreen; picture-in-picture" loading="eager"></iframe></div></section>`;
  }

  function portalPage(type, subpage = '') {
    const cfg = portalConfig[type];
    if (!cfg) return notFound();
    const current = subpage || cfg.items[0];
    const title = linkTitle(current);
    const nav = cfg.items.map(item => `<a class="${item===current?'active':''}" href="#/${type}/${item}">${esc(linkTitle(item))}</a>`).join('');
    return `<section class="page-hero"><div class="page-shell">${breadcrumb([{label:cfg.title},{label:title}])}<p class="eyebrow">Enterprise Operations</p><h1>${esc(cfg.title)}</h1><p>${portalDescription(type)}</p></div></section><section class="dark"><div class="page-shell"><div class="portal-layout"><aside class="portal-sidebar"><p class="portal-title">${esc(cfg.title)}</p><nav aria-label="${esc(cfg.title)} navigation">${nav}</nav></aside><div class="portal-content">${portalContent(type,current)}</div></div></div></section>`;
  }

  function portalDescription(type) {
    return {
      seller:'Marketplace selling, catalog, inventory, orders, fulfillment, advertising, analytics, finance and account health.',
      business:'Organization purchasing, policies, approvals, contract pricing, POs, invoices and spend analytics.',
      supplier:'Supplier onboarding, catalogs, contracts, procurement, shipments, invoices, compliance and performance.',
      admin:'Commerce operations, marketplace governance, finance, trust & safety, platform configuration, rules, AI and system health.'
    }[type];
  }

  function portalContent(type, current) {
    if (type === 'admin' && ['products','catalog'].includes(current)) return adminProductsContent(current);
    if (type === 'seller' && ['catalog','add-product','inventory'].includes(current)) return sellerCatalogContent(current);
    if (type === 'admin' && current === 'audit-logs') return auditContent();
    if (type === 'admin' && current === 'feature-flags') return featureFlagContent();
    if (type === 'admin' && current === 'integrations') return paymentIntegrationContent();
    if (type === 'business' && current === 'organization-setup') return organizationSetupContent();
    if (type === 'supplier' && ['dashboard','products'].includes(current)) return supplierContent(current);

    const metrics = portalMetrics(type);
    return `<div class="portal-head"><div><p class="eyebrow">${esc(type)} workspace</p><h1>${esc(linkTitle(current))}</h1></div><span class="status-pill">Local workspace</span></div><div class="kpi-grid">${metrics.map(m=>`<div class="kpi-card"><small>${esc(m.label)}</small><strong>${esc(String(m.value))}</strong></div>`).join('')}</div><div class="workspace-grid"><div class="workspace-card"><h2>Operational workspace</h2><p>${esc(workspaceExplanation(type,current))}</p><div class="notice info"><strong>No fake metrics:</strong> All counters shown above come from actual records stored in this browser workspace.</div></div><div class="workspace-card"><h2>Production connection status</h2><p>This interface is ready to connect to scoped domain APIs. External authentication, payments, tax, KYC, carrier and cloud services are not represented as connected until real credentials and backend services exist.</p><span class="status-pill warn">Integration required</span></div></div>`;
  }

  function portalMetrics(type) {
    if (type === 'seller') return [{label:'Products',value:state.products.length},{label:'Orders',value:state.orders.length},{label:'Returns',value:state.returns.length},{label:'Applications',value:state.sellers.length}];
    if (type === 'business') return [{label:'Organizations',value:state.organizations.length},{label:'Orders',value:state.orders.length},{label:'Purchase Requests',value:0},{label:'Invoices',value:0}];
    if (type === 'supplier') return [{label:'Suppliers',value:state.suppliers.length},{label:'Products',value:state.products.length},{label:'Purchase Orders',value:0},{label:'Receipts',value:0}];
    return [{label:'Products',value:state.products.length},{label:'Customers',value:0},{label:'Sellers',value:state.sellers.length},{label:'Orders',value:state.orders.length}];
  }

  function workspaceExplanation(type,current) {
    return `${linkTitle(current)} is implemented as part of the ${portalConfig[type].title} navigation and shares the same tenant-aware, API-first operating model defined by the supplied RefShop specification.`;
  }

  function productForm(product = {}) {
    const isEdit = !!product.id;
    return `<form class="form-card" data-product-form data-product-id="${esc(product.id || '')}"><h2>${isEdit ? 'Edit Product' : 'Create Product'}</h2><div class="form-grid"><label>Product name<input name="name" value="${esc(product.name || '')}" required></label><label>Brand<input name="brand" value="${esc(product.brand || '')}"></label><label>SKU<input name="sku" value="${esc(product.sku || '')}" required></label><label>Category<select name="category" required><option value="">Choose category</option>${CATEGORY_CONFIG.map(c=>`<option value="${c.id}" ${product.category===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label><label>Price<input name="price" type="number" min="0" step="0.01" value="${esc(product.price ?? '')}" required></label><label>Inventory<input name="inventory" type="number" min="0" step="1" value="${esc(product.inventory ?? 0)}" required></label><label>Product type<select name="type"><option ${product.type==='Physical'?'selected':''}>Physical</option><option ${product.type==='Digital'?'selected':''}>Digital</option><option ${product.type==='Service'?'selected':''}>Service</option><option ${product.type==='Subscription'?'selected':''}>Subscription</option></select></label><label>Status<select name="status"><option value="published" ${product.status==='published'?'selected':''}>Published</option><option value="draft" ${(!product.status||product.status==='draft')?'selected':''}>Draft</option><option value="archived" ${product.status==='archived'?'selected':''}>Archived</option></select></label><label>Seller<input name="seller" value="${esc(product.seller || 'RefShop')}"></label><label>Fulfillment<input name="fulfillment" value="${esc(product.fulfillment || '')}" placeholder="RefShop, seller fulfilled, digital"></label><label class="full">Image URL<input name="image" value="${esc(product.image || '')}" placeholder="Use a real hosted product image URL when available"></label><label class="full">Description<textarea name="description">${esc(product.description || '')}</textarea></label></div><div class="form-actions">${isEdit?`<button class="button danger" type="button" data-action="delete-product" data-id="${product.id}">Delete</button>`:''}<button class="button primary" type="submit">${isEdit?'Save Changes':'Create Product'}</button></div></form>`;
  }

  function adminProductsContent() {
    return `<div class="portal-head"><div><p class="eyebrow">Catalog Operations</p><h1>Products</h1></div><span class="status-pill">${state.products.length} records</span></div><div class="workspace-grid"><div>${productForm()}</div><div class="workspace-card"><h2>Product / Offer Model</h2><p>This workspace creates canonical product records. Marketplace seller offers should remain separate in the production service model so multiple sellers can compete on one canonical product without duplicate product pages.</p><div class="notice info"><strong>Media:</strong> Use real product media URLs only. The interface does not generate fake catalog imagery.</div></div></div><div style="height:20px"></div>${productTable()}`;
  }

  function sellerCatalogContent(current) {
    return `<div class="portal-head"><div><p class="eyebrow">Seller Catalog</p><h1>${esc(linkTitle(current))}</h1></div><a class="button primary" href="#/seller/add-product">Add Product</a></div>${current==='add-product'?productForm():productTable()}`;
  }

  function productTable() {
    return state.products.length ? `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Inventory</th><th>Status</th><th>Actions</th></tr></thead><tbody>${state.products.map(p=>`<tr><td><strong>${esc(p.name)}</strong><br><small>${esc(p.brand||'')}</small></td><td>${esc(p.sku||'')}</td><td>${esc(linkTitle(p.category||'uncategorized'))}</td><td>${money(p.price)}</td><td>${Number(p.inventory||0)}</td><td><span class="status-pill ${p.status==='published'?'good':'warn'}">${esc(p.status||'draft')}</span></td><td><div class="table-actions"><button class="button ghost small" data-action="edit-product" data-id="${p.id}">Edit</button><a class="button ghost small" href="#/product/${p.id}">View</a></div></td></tr>`).join('')}</tbody></table></div>` : `<div class="empty-state"><div><div class="empty-icon">▦</div><h3>No product records.</h3><p>Create the first real product using the product form. No sample catalog data has been fabricated.</p></div></div>`;
  }

  function auditContent() {
    return `<div class="portal-head"><div><p class="eyebrow">Governance</p><h1>Audit Logs</h1></div><span class="status-pill">${state.audit.length} events</span></div>${state.audit.length?`<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead><tbody>${state.audit.map(x=>`<tr><td>${new Date(x.at).toLocaleString()}</td><td>${esc(x.action)}</td><td>${esc(x.entity)}</td><td><code>${esc(JSON.stringify(x.details))}</code></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty-state"><div><h3>No audited changes yet.</h3><p>Create or update a record and the local audit trail will appear here.</p></div></div>`}`;
  }

  function featureFlagContent() {
    const known = ['ai-shopping-assistant','new-search','live-shopping-tags','refshop-plus','retail-media','creator-commerce'];
    return `<div class="portal-head"><div><p class="eyebrow">Release Governance</p><h1>Feature Flags</h1></div></div><div class="form-card"><div class="form-grid">${known.map(key=>`<label><span>${esc(linkTitle(key))}</span><select data-action="feature-flag" data-flag="${key}"><option value="off" ${!state.featureFlags[key]?'selected':''}>Off</option><option value="on" ${state.featureFlags[key]?'selected':''}>On</option></select></label>`).join('')}</div></div>`;
  }

  function paymentIntegrationContent() {
    const cfg = window.RefShopPayments?.config || {};
    const reachable = !!cfg.reachable;
    const stripe = !!cfg.stripe?.configured;
    const paypal = !!cfg.paypal?.configured;
    const status = (ok, textReady='Connected') => `<span class="status-pill ${ok?'good':'warn'}">${ok?textReady:'Configuration required'}</span>`;
    return `<div class="portal-head"><div><p class="eyebrow">Payment Orchestration</p><h1>Payment Gateways</h1></div>${reachable?`<span class="status-pill good">Payment API online</span>`:`<span class="status-pill warn">Payment API offline</span>`}</div>
    <div class="gateway-admin-grid">
      <article class="gateway-admin-card"><div class="gateway-card-head"><div><span class="gateway-mark">S</span><h2>Stripe</h2></div>${status(stripe)}</div><p>Primary card and hosted checkout gateway. Stripe-hosted checkout can surface supported wallets such as Apple Pay and Google Pay when the merchant account, domain, browser and customer wallet are eligible.</p><ul><li>Cards</li><li>Apple Pay</li><li>Google Pay</li><li>Link / supported dynamic methods</li><li>ACH / bank methods when enabled</li></ul><code>STRIPE_SECRET_KEY</code><code>STRIPE_WEBHOOK_SECRET</code></article>
      <article class="gateway-admin-card"><div class="gateway-card-head"><div><span class="gateway-mark">P</span><h2>PayPal</h2></div>${status(paypal)}</div><p>PayPal Checkout uses the PayPal JavaScript SDK in the storefront and server-side Orders API calls for order creation and capture.</p><ul><li>PayPal wallet</li><li>Eligible PayPal checkout methods</li><li>Server capture</li><li>Webhook-ready architecture</li></ul><code>PAYPAL_CLIENT_ID</code><code>PAYPAL_CLIENT_SECRET</code></article>
      <article class="gateway-admin-card"><div class="gateway-card-head"><div><span class="gateway-mark">⌁</span><h2>Business Payments</h2></div><span class="status-pill good">Workflow installed</span></div><p>Enterprise payment methods remain policy-controlled rather than treated like consumer card gateways.</p><ul><li>ACH / bank debit</li><li>Bank transfer</li><li>Purchase orders</li><li>Invoice / net terms architecture</li></ul><p class="subtle">Approval, credit-limit, invoice and reconciliation services must authorize these methods before production fulfillment.</p></article>
      <article class="gateway-admin-card"><div class="gateway-card-head"><div><span class="gateway-mark">◆</span><h2>Stored Value</h2></div><span class="status-pill good">Ledger interface ready</span></div><p>Gift cards, promotional credit and store credit are modeled as internal stored value and should settle against RefShop's financial ledger.</p><ul><li>Gift cards</li><li>Store credit</li><li>Promotional credit</li><li>Partial redemption architecture</li></ul><p class="subtle">No fabricated balance is created in this frontend workspace.</p></article>
    </div>
    <div class="notice info payment-admin-note"><strong>Credential rule:</strong> Secret credentials are configured only in the server environment. They are intentionally not editable or stored in browser localStorage. Copy <code>server/.env.example</code> to <code>server/.env</code>, add sandbox/test merchant credentials, and start the payment server.</div>`;
  }

  function organizationSetupContent() {
    return `<div class="portal-head"><div><p class="eyebrow">B2B Administration</p><h1>Organization Setup</h1></div></div><div class="content-layout"><form class="form-card" data-organization-form><h2>Create organization</h2><div class="form-grid"><label>Organization name<input name="name" required></label><label>Organization type<select name="type"><option>School</option><option>College / University</option><option>League</option><option>Association</option><option>Company</option><option>Government</option><option>Nonprofit</option></select></label><label>Admin email<input name="email" type="email" required></label><label>Default currency<select name="currency"><option>USD</option></select></label></div><div class="form-actions"><button class="button primary" type="submit">Create Organization</button></div></form><aside class="side-panel"><h2>Organizations</h2>${state.organizations.length?state.organizations.map(o=>`<div class="detail-block"><strong>${esc(o.name)}</strong><p class="subtle">${esc(o.type)} · ${esc(o.email)}</p></div>`).join(''):`<p class="subtle">No organizations created.</p>`}</aside></div>`;
  }

  function supplierContent(current) {
    return `<div class="portal-head"><div><p class="eyebrow">Supplier Operations</p><h1>${esc(linkTitle(current))}</h1></div></div><div class="workspace-grid"><form class="form-card" data-supplier-form><h2>Supplier profile</h2><div class="form-grid"><label>Supplier name<input name="name" required></label><label>Contact email<input name="email" type="email" required></label><label class="full">Catalog / capabilities<textarea name="summary"></textarea></label></div><div class="form-actions"><button class="button primary">Save Supplier</button></div></form><div class="workspace-card"><h2>Current suppliers</h2>${state.suppliers.length?state.suppliers.map(s=>`<div class="detail-block"><strong>${esc(s.name)}</strong><p class="subtle">${esc(s.email)}</p></div>`).join(''):`<p>No supplier records yet.</p>`}</div></div>`;
  }

  function notFound(title='Page not found', message='The requested RefShop route does not exist.') {
    return `<section class="page-hero"><div class="page-shell"><p class="eyebrow">404</p><h1>${esc(title)}</h1><p>${esc(message)}</p><a class="button primary" href="#/home">Return Home</a></div></section>`;
  }

  function render() {
    const path = routePath();
    const [a,b,...rest] = path.split('/');
    let html = '';
    if (a === 'home') html = homePage();
    else if (a === 'shop') html = shopPage();
    else if (a === 'search') html = shopPage(b || null, decodeURIComponent(rest.join('/') || ''));
    else if (a === 'category') html = shopPage(b);
    else if (a === 'product') html = productPage(b);
    else if (a === 'cart') html = cartPage();
    else if (a === 'checkout') html = checkoutPage();
    else if (a === 'payment-success') html = paymentSuccessPage();
    else if (a === 'account') html = accountPage();
    else if (a === 'orders') html = ordersPage();
    else if (a === 'wishlist') html = wishlistPage();
    else if (a === 'support') html = supportPage();
    else if (a === 'sell') html = sellPage();
    else if (a === 'live-shopping') html = liveShoppingPage();
    else if (['seller','business','supplier','admin'].includes(a)) html = portalPage(a,b);
    else if (customerPageMeta[a]) html = genericCustomerPage(a);
    else if (['subscriptions','digital-library','wallet','addresses','payment-methods','lists','registries','reviews','track-order','returns','return-detail','order-detail'].includes(a)) html = genericCustomerPage(a);
    else html = notFound();
    app.innerHTML = html;
    updateGlobalUI();
    bindPageEvents();
    updateActiveNav(path);
    window.scrollTo({top:0,behavior:'instant'});
    $('#main-content')?.focus({preventScroll:true});
  }

  function updateActiveNav(path) {
    $$('.nav-link.active,.mobile-nav-link.active,.dropdown-toggle.active').forEach(x=>x.classList.remove('active'));
    let target = 'home';
    if (['shop','category','product','search','new-releases','best-sellers','digital-products'].includes(path.split('/')[0])) target='shop';
    else if (['marketplace','sell','brand-stores','creator-commerce','advertising'].includes(path.split('/')[0])) target='marketplace';
    else target = path.split('/')[0];
    const direct = $$(`[href="#/${target}"]`).find(x=>x.classList.contains('nav-link')||x.classList.contains('mobile-nav-link'));
    if (direct) direct.classList.add('active');
    if (target==='shop') $$('#shop-menu').forEach(()=>{}), $('#shop-menu')?.closest('.has-dropdown')?.querySelector('.dropdown-toggle')?.classList.add('active');
    if (target==='marketplace') $('#marketplace-menu')?.closest('.has-dropdown')?.querySelector('.dropdown-toggle')?.classList.add('active');
  }

  function bindPageEvents() {
    $$('[data-action="add-cart"]').forEach(btn=>btn.addEventListener('click',()=>addToCart(btn.dataset.id)));
    $$('[data-action="wishlist"]').forEach(btn=>btn.addEventListener('click',()=>toggleWishlist(btn.dataset.id)));
    $$('[data-action="remove-cart"]').forEach(btn=>btn.addEventListener('click',()=>removeFromCart(btn.dataset.id)));
    $$('[data-action="move-wishlist"]').forEach(btn=>btn.addEventListener('click',()=>moveToWishlist(btn.dataset.id)));
    $$('[data-action="cart-qty"]').forEach(sel=>sel.addEventListener('change',()=>updateCartQty(sel.dataset.id,Number(sel.value))));
    $$('[data-action="edit-product"]').forEach(btn=>btn.addEventListener('click',()=>openProductEditor(btn.dataset.id)));
    $$('[data-action="delete-product"]').forEach(btn=>btn.addEventListener('click',()=>deleteProduct(btn.dataset.id)));
    $$('[data-action="feature-flag"]').forEach(sel=>sel.addEventListener('change',()=>{state.featureFlags[sel.dataset.flag]=sel.value==='on';audit('feature_flag_changed',sel.dataset.flag,{enabled:state.featureFlags[sel.dataset.flag]});toast('Feature flag updated.');}));
    $('[data-product-form]')?.addEventListener('submit', handleProductSubmit);
    $('[data-support-form]')?.addEventListener('submit', handleSupportSubmit);
    $('[data-seller-form]')?.addEventListener('submit', handleSellerSubmit);
    $('[data-organization-form]')?.addEventListener('submit', handleOrganizationSubmit);
    $('[data-supplier-form]')?.addEventListener('submit', handleSupplierSubmit);
    $('[data-checkout-form]')?.addEventListener('submit', handleCheckoutSubmit);
    hydratePaymentGatewayStatus();
    if ($('[data-payment-result]')) handlePaymentReturn();
    $('[data-action="sort-products"]')?.addEventListener('change', e => sortProductsInView(e.target.value));
    $$('[data-action="category-filter"]').forEach(r=>r.addEventListener('change',()=>location.hash = r.value==='all' ? '#/shop' : `#/category/${r.value}`));
    $('[data-action="catalog-search"]')?.addEventListener('keydown', e=>{if(e.key==='Enter'){location.hash=`#/search/all/${encodeURIComponent(e.target.value)}`;}});
  }

  function addToCart(id) {
    const p = state.products.find(x=>x.id===id);
    if (!p || Number(p.inventory||0)<1) return toast('This product is currently unavailable.','Inventory');
    const existing = state.cart.find(x=>x.productId===id);
    if (existing) existing.qty = Math.min(Number(p.inventory), Number(existing.qty)+1); else state.cart.push({productId:id,qty:1});
    audit('cart_item_added',id,{qty:existing?.qty||1});
    updateGlobalUI();
    toast(`${p.name} added to cart.`,'Cart');
  }
  function removeFromCart(id) { state.cart = state.cart.filter(x=>x.productId!==id); audit('cart_item_removed',id); render(); }
  function updateCartQty(id,qty) { const line=state.cart.find(x=>x.productId===id); if(line){line.qty=qty;audit('cart_quantity_changed',id,{qty});render();} }
  function toggleWishlist(id) { const exists=state.wishlist.includes(id); state.wishlist=exists?state.wishlist.filter(x=>x!==id):[...state.wishlist,id]; audit(exists?'wishlist_removed':'wishlist_added',id); render(); }
  function moveToWishlist(id) { if(!state.wishlist.includes(id))state.wishlist.push(id);state.cart=state.cart.filter(x=>x.productId!==id);audit('cart_item_moved_to_wishlist',id);render(); }

  function handleProductSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const id = e.currentTarget.dataset.productId || uid();
    const existing = state.products.find(p=>p.id===id);
    const record = {
      id,
      name:String(fd.get('name')).trim(), brand:String(fd.get('brand')).trim(), sku:String(fd.get('sku')).trim(), category:String(fd.get('category')),
      price:Number(fd.get('price')), inventory:Number(fd.get('inventory')), type:String(fd.get('type')), status:String(fd.get('status')), seller:String(fd.get('seller')).trim(),
      fulfillment:String(fd.get('fulfillment')).trim(), image:String(fd.get('image')).trim(), description:String(fd.get('description')).trim(), currency:'USD', updatedAt:new Date().toISOString(), createdAt:existing?.createdAt||new Date().toISOString()
    };
    if (existing) Object.assign(existing,record); else state.products.unshift(record);
    audit(existing?'product_updated':'product_created',id,{sku:record.sku,name:record.name,status:record.status});
    toast(existing?'Product updated.':'Product created.','Catalog');
    render();
  }
  function openProductEditor(id) {
    const p=state.products.find(x=>x.id===id); if(!p)return;
    const container=$('.portal-content'); if(container){container.innerHTML=`<div class="portal-head"><div><p class="eyebrow">Catalog Operations</p><h1>Edit Product</h1></div><button class="button ghost" type="button" data-action="back-products">Back</button></div>${productForm(p)}`; $('[data-product-form]')?.addEventListener('submit',handleProductSubmit); $('[data-action="delete-product"]')?.addEventListener('click',()=>deleteProduct(id)); $('[data-action="back-products"]')?.addEventListener('click',render);}
  }
  function deleteProduct(id) {
    const p=state.products.find(x=>x.id===id); if(!p)return;
    if(!confirm(`Delete ${p.name}? This will also remove it from cart and wishlist in this workspace.`))return;
    state.products=state.products.filter(x=>x.id!==id);state.cart=state.cart.filter(x=>x.productId!==id);state.wishlist=state.wishlist.filter(x=>x!==id);audit('product_deleted',id,{name:p.name});toast('Product deleted.','Catalog');render();
  }

  function handleSupportSubmit(e){e.preventDefault();const fd=new FormData(e.currentTarget);const t={id:uid(),email:String(fd.get('email')),topic:String(fd.get('topic')),subject:String(fd.get('subject')),message:String(fd.get('message')),createdAt:new Date().toISOString(),status:'open'};state.supportTickets.unshift(t);audit('support_case_created',t.id,{topic:t.topic});toast('Support case saved in this workspace.','Support');render();}
  function handleSellerSubmit(e){e.preventDefault();const fd=new FormData(e.currentTarget);const s={id:uid(),business:String(fd.get('business')),store:String(fd.get('store')),email:String(fd.get('email')),type:String(fd.get('type')),categories:String(fd.get('categories')),summary:String(fd.get('summary')),createdAt:new Date().toISOString(),status:'application_saved'};state.sellers.unshift(s);audit('seller_application_saved',s.id,{business:s.business});toast('Seller application saved. Verification integrations are still required.','Marketplace');render();}
  function handleOrganizationSubmit(e){e.preventDefault();const fd=new FormData(e.currentTarget);const o={id:uid(),name:String(fd.get('name')),type:String(fd.get('type')),email:String(fd.get('email')),currency:String(fd.get('currency')),createdAt:new Date().toISOString()};state.organizations.unshift(o);audit('organization_created',o.id,{name:o.name});toast('Organization created in local workspace.','Business');render();}
  function handleSupplierSubmit(e){e.preventDefault();const fd=new FormData(e.currentTarget);const s={id:uid(),name:String(fd.get('name')),email:String(fd.get('email')),summary:String(fd.get('summary')),createdAt:new Date().toISOString()};state.suppliers.unshift(s);audit('supplier_created',s.id,{name:s.name});toast('Supplier saved in local workspace.','Supplier');render();}
  async function handleCheckoutSubmit(e){
    e.preventDefault();
    const form=e.currentTarget;
    const fd=new FormData(form);
    const method=String(fd.get('payment')||'stripe');
    const stage=$('#payment-stage');
    const submit=$('.payment-submit',form);
    const lines=state.cart.map(line=>({...line,product:state.products.find(p=>p.id===line.productId)})).filter(x=>x.product);
    if(!lines.length){toast('Your cart is empty.','Checkout');return;}
    const checkoutId=uid();
    const payload={
      checkoutId,
      currency:state.preferences?.currency||'USD',
      customer:{email:String(fd.get('email')),name:String(fd.get('name')),address:String(fd.get('address')),city:String(fd.get('city')),region:String(fd.get('region')),postal:String(fd.get('postal')),country:String(fd.get('country'))},
      items:lines.map(line=>({id:line.product.id,name:line.product.name,sku:line.product.sku||'',unitAmount:Number(line.product.price||0),quantity:Number(line.qty||1)}))
    };
    stage.innerHTML='';
    try{
      if(!window.RefShopPayments)throw new Error('Payment gateway client failed to load.');
      if(method==='stripe' || method==='ach'){
        state.pendingPayment={...payload,method,createdAt:new Date().toISOString()};saveState();
        submit.disabled=true;submit.textContent='Opening secure payment…';
        stage.innerHTML=`<div class="notice info"><strong>Connecting to Stripe:</strong> You will leave RefShop temporarily for provider-hosted secure payment and return after authorization.</div>`;
        payload.requestedMethod=method==='ach'?'ach':'dynamic';
        await window.RefShopPayments.startStripeCheckout(payload);
        return;
      }
      if(method==='paypal'){
        state.pendingPayment={...payload,method,createdAt:new Date().toISOString()};saveState();
        submit.disabled=true;submit.textContent='PayPal buttons ready below';
        stage.innerHTML=`<div class="paypal-stage"><p><strong>Complete payment securely with PayPal.</strong></p><div data-paypal-buttons></div></div>`;
        await window.RefShopPayments.mountPayPal($('[data-paypal-buttons]',stage),payload);
        return;
      }
      if(method==='bank-transfer') throw new Error('Bank transfer is installed as an enterprise workflow, but account approval, remittance instructions and ledger reconciliation must be configured before it can create a payable order.');
      if(method==='purchase-order') throw new Error('Purchase Orders require an authenticated RefShop Business account, buying policy and approval chain before checkout can submit the PO.');
      if(method==='store-value') throw new Error('Gift card and store-credit checkout requires the RefShop stored-value ledger and balance service before redemption can be enabled.');
    }catch(error){
      if(submit){submit.disabled=false;submit.textContent='Continue to Secure Payment';}
      stage.innerHTML=`<div class="notice payment-error"><strong>Payment setup required:</strong> ${esc(error.message||'Unable to initialize the selected payment method.')}</div>`;
      toast(error.message||'Unable to initialize payment.','Payment');
    }
  }

  function hydratePaymentGatewayStatus(){
    const cfg=window.RefShopPayments?.config;
    $$('[data-payment-status]').forEach(el=>{
      const key=el.dataset.paymentStatus;
      let configured=false;
      if(key==='stripe'||key==='ach')configured=!!cfg?.stripe?.configured;
      if(key==='paypal')configured=!!cfg?.paypal?.configured;
      el.textContent=configured?(cfg?.environment==='production'?'Live gateway':'Sandbox/Test ready'):(cfg?.loaded?'Merchant setup required':'Checking gateway…');
      el.classList.toggle('available',configured);
    });
  }

  function recordVerifiedPayment(payment,gateway){
    const transactionId=String(payment.gatewayId||payment.id||payment.orderId||'');
    if(!transactionId)throw new Error('Verified payment did not include a transaction identifier.');
    if(state.orders.some(o=>o.paymentTransactionId===transactionId))return state.orders.find(o=>o.paymentTransactionId===transactionId);
    const pending=state.pendingPayment;
    if(payment.checkoutId&&pending?.checkoutId&&String(payment.checkoutId)!==String(pending.checkoutId))throw new Error('Payment verification did not match the pending RefShop checkout.');
    if(payment.checkoutId&&!pending)throw new Error('The verified payment has no matching pending RefShop checkout in this browser.');
    const snapshotItems=Array.isArray(pending?.items)?pending.items:state.cart.map(line=>{const product=state.products.find(p=>p.id===line.productId);return product?{id:product.id,name:product.name,unitAmount:Number(product.price||0),quantity:Number(line.qty||1)}:null;}).filter(Boolean);
    const localTotal=snapshotItems.reduce((sum,item)=>sum+Number(item.unitAmount||0)*Number(item.quantity||1),0);
    const total=Number.isFinite(Number(payment.amount))?Number(payment.amount):localTotal;
    const captured=String(payment.status||'').toLowerCase()==='paid';
    const order={id:`RS-${Date.now().toString(36).toUpperCase()}`,status:captured?'Payment Captured':'Payment Processing',total,currency:String(payment.currency||pending?.currency||'USD').toUpperCase(),createdAt:new Date().toISOString(),paymentGateway:gateway,paymentTransactionId:transactionId,paymentEnvironment:String(payment.environment||window.RefShopPayments?.config?.environment||'unknown'),checkoutId:String(payment.checkoutId||pending?.checkoutId||''),items:snapshotItems.map(item=>({productId:item.id,name:item.name,qty:Number(item.quantity||1),unitAmount:Number(item.unitAmount||0)}))};
    state.orders.unshift(order);state.cart=[];state.pendingPayment=null;audit(captured?'payment_captured':'payment_processing',order.id,{gateway,transactionId,checkoutId:order.checkoutId,total:order.total,currency:order.currency,environment:order.paymentEnvironment});saveState();updateGlobalUI();return order;
  }

  async function handlePaymentReturn(){
    const card=$('[data-payment-result]');if(!card)return;
    const params=new URLSearchParams(location.search);
    const gateway=params.get('payment_gateway');
    const sessionId=params.get('session_id');
    try{
      if(gateway!=='stripe'||!sessionId)throw new Error('No verifiable Stripe session was supplied on this return URL.');
      if(!window.RefShopPayments)throw new Error('Payment gateway client is unavailable.');
      const result=await window.RefShopPayments.verifyStripeSession(sessionId);
      const paid=result.status==='paid';
      const processing=!paid && result.checkoutStatus==='complete';
      if(!paid&&!processing)throw new Error(`Stripe session is not complete (payment status: ${result.status||'unknown'}).`);
      const order=recordVerifiedPayment({...result,status:paid?'paid':'processing'},'stripe');
      card.innerHTML=`<div class="payment-success-mark">✓</div><h2>${paid?'Payment verified':'Payment submitted'}</h2><p>${paid?'Your payment was confirmed by the gateway.':'Your bank payment was submitted and is still processing; fulfillment should wait for the verified payment webhook.'} RefShop created order <strong>${esc(order.id)}</strong>.</p><div class="form-actions"><a class="button primary" href="#/orders">View Orders</a><a class="button ghost" href="#/shop">Continue Shopping</a></div>`;
      const clean=`${location.pathname}#/payment-success`;
      history.replaceState({},'',clean);
    }catch(error){
      card.innerHTML=`<div class="payment-failure-mark">!</div><h2>Payment could not be verified</h2><p>${esc(error.message||'Gateway verification failed.')}</p><div class="form-actions"><a class="button primary" href="#/checkout">Return to Checkout</a></div>`;
    }
  }

  window.RefShopPaymentCompleted=(payment,gateway)=>{
    try{const order=recordVerifiedPayment(payment,gateway);toast(`Payment verified. Order ${order.id} created.`,'Payment complete');location.hash='#/orders';}
    catch(error){toast(error.message||'Payment was captured but order recording failed.','Order');}
  };


  function sortProductsInView(mode){
    const box=$('#catalog-results'); if(!box)return; let items=state.products.filter(p=>p.status!=='archived');
    if(mode==='price-asc')items.sort((a,b)=>a.price-b.price);if(mode==='price-desc')items.sort((a,b)=>b.price-a.price);if(mode==='name')items.sort((a,b)=>a.name.localeCompare(b.name));if(mode==='recent')items.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    box.innerHTML=items.length?`<div class="product-grid">${items.map(productCard).join('')}</div>`:`<div class="empty-state"><div><h3>No products.</h3></div></div>`;bindPageEvents();
  }

  $('[data-search-form]')?.addEventListener('submit', e => {
    e.preventDefault(); const q=$('#global-search-input').value.trim(); const scope=$('#global-search-scope').value;
    location.hash = q ? `#/search/${scope}/${encodeURIComponent(q)}` : (scope==='all'?'#/shop':`#/category/${scope}`);
  });

  $('[data-action="set-location"]')?.addEventListener('click',()=>$('#location-dialog')?.showModal());
  $('[data-location-form]')?.addEventListener('submit', e => {
    const submitter = e.submitter;
    if (submitter?.dataset.locationSave !== undefined || submitter?.value === 'default') {
      const value = new FormData(e.currentTarget).get('location');
      if (value) { state.location=String(value).trim(); audit('delivery_location_set','customer_preference',{location:state.location}); updateGlobalUI(); toast('Delivery location preference saved.'); }
    }
  });

  window.addEventListener('refshop:payments-config', hydratePaymentGatewayStatus);
  window.addEventListener('refshop:payment-message', e=>{
    const message=e.detail?.message||'Payment gateway update.';
    toast(message,e.detail?.type==='error'?'Payment error':'Payment');
  });
  window.RefShopPayments?.loadConfig().then(hydratePaymentGatewayStatus);

  window.addEventListener('hashchange',render);
  window.addEventListener('storage', e=>{if(e.key===STORAGE_KEY){state=loadState();render();}});
  if(!location.hash) location.hash='#/home'; else render();
  updateGlobalUI();
})();
