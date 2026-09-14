(() => {
  'use strict';

  const STORAGE = {
    invoices: 'rtbo_invoice_generator_invoices_v2_integrated',
    clients: 'rtbo_invoice_generator_clients_v2_integrated',
    services: 'rtbo_invoice_generator_services_v2_integrated',
    activity: 'rtbo_invoice_generator_activity_v2_integrated',
    theme: 'rtbo_invoice_generator_theme_v2_integrated',
    current: 'rtbo_invoice_generator_current_v2_integrated',
    sequence: 'rtbo_invoice_generator_sequence_v3_integrated'
  };

  const CURRENCY_SYMBOLS = {
    USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', JPY: '¥', MXN: 'MX$', CHF: 'CHF ', CNY: '¥'
  };

  const GAME_LEVELS = [
    'Youth', 'Middle School', 'High School', 'NJCAA Men', 'NJCAA Women', 'NAIA Men', 'NAIA Women',
    'NCAA Division III Men', 'NCAA Division III Women', 'NCAA Division II Men', 'NCAA Division II Women',
    'NCAA Division I Men', 'NCAA Division I Women', 'NBA G League', 'WNBA', 'USA Basketball Men',
    'USA Basketball Women', 'FIBA Men', 'FIBA Women', 'NBA', 'Semi-Pro', 'Professional',
    'Training or Clinic', 'Other'
  ];

  const PAYMENT_METHODS = ['Check', 'ACH / Bank Transfer', 'Stripe', 'PayPal', 'Apple Pay', 'Google Pay', 'Cash', 'Other'];

  const DEFAULT_INVOICE_HEADER_SETTINGS = {
    title: 'Raising The Bar Officiating',
    slogan: 'We Will Serve, And We Will Be Of Service To The Game',
    phone: '(501) 240-4961',
    email: 'mrbballref1775@yahoo.com',
    website: 'rtbofficating.com',
    invoicePrefix: 'RTBO',
    logo: 'rtbo',
    legalBusinessName: 'Raising The Bar Officiating Inc.',
    dbaRaisingTheBarLabel: 'Raising The Bar Officiating',
    dbaGotUNexRefLabel: 'Got U Nex Ref'
  };


  const US_STATES = [
    ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],['DC','District of Columbia']
  ];

  const DEFAULT_CLIENT = {
    id: '',
    type: '',
    organization: '',
    contact: '',
    email: '',
    phone: '',
    billingAddress: '',
    serviceAddress: '',
    taxExempt: false,
    paymentTerms: ''
  };

  const DEFAULT_SERVICE = {
    id: '',
    name: '',
    description: '',
    unit: 'Each',
    defaultRate: null,
    taxable: false
  };

  const REFERENCE_INVOICE = {
    id: '',
    invoiceNumber: '',
    invoiceDate: '',
    referenceNumber: '',
    dueDate: '',
    purchaseOrderNumber: '',
    event: '',
    gameLevel: '',
    eventStartDate: '',
    eventEndDate: '',
    eventLocation: '',
    servicePeriod: '',
    assignor: '',
    status: 'Draft',
    clientId: '',
    client: structuredClone(DEFAULT_CLIENT),
    shipSameAsBill: true,
    shipTo: { name: '', address: '' },
    mailTo: { name: '', mailingAddress: '', city: '', state: '', zip: '' },
    paymentLink: '',
    issuer: {
      businessName: 'Raising The Bar Officiating Inc.',
      dba: '',
      dbaTitles: [],
      headerTitle: DEFAULT_INVOICE_HEADER_SETTINGS.title,
      slogan: DEFAULT_INVOICE_HEADER_SETTINGS.slogan,
      website: DEFAULT_INVOICE_HEADER_SETTINGS.website,
      headerLogo: DEFAULT_INVOICE_HEADER_SETTINGS.logo,
      contactName: '',
      address: '',
      phone: DEFAULT_INVOICE_HEADER_SETTINGS.phone,
      email: DEFAULT_INVOICE_HEADER_SETTINGS.email
    },
    settings: {
      currency: 'USD',
      exchangeRateToUSD: 1,
      paymentTerms: '',
      taxEnabled: false,
      taxLabel: 'Sales Tax',
      taxRate: 0,
      lateFeeEnabled: false,
      lateFeeType: 'percent',
      lateFeeValue: 0,
      passProcessingFee: false,
      recurring: false,
      recurringSchedule: ''
    },
    lineItems: [],
    adjustments: {
      invoiceDiscountType: 'fixed',
      invoiceDiscountValue: 0,
      serviceFee: 0,
      processingFeeRate: 0,
      travelFee: 0,
      otherFeeLabel: 'Other Fee',
      otherFee: 0,
      deposit: 0,
      previousPayment: 0
    },
    terms: '',
    internalNotes: '',
    clientNotes: '',
    paymentMethods: [],
    customFields: [],
    attachments: [],
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    finalized: false,
    paperSize: 'letter',
    printFriendly: false
  };

  const isEmbedded = document.documentElement.dataset.embedded === 'true';
  let dashboardContext = { profile: {}, taxProfile: {}, schools: [], invoiceSettings: structuredClone(DEFAULT_INVOICE_HEADER_SETTINGS) };

  const state = {
    theme: isEmbedded ? 'dark' : (localStorage.getItem(STORAGE.theme) || 'dark'),
    invoices: loadJSON(STORAGE.invoices, []),
    clients: loadJSON(STORAGE.clients, []),
    services: loadJSON(STORAGE.services, []),
    activity: loadJSON(STORAGE.activity, []),
    currentInvoiceId: localStorage.getItem(STORAGE.current) || null,
    activeView: 'editor',
    dirty: false,
    autosaveTimer: null,
    currentTab: 'notes',
    search: ''
  };

  const els = {
    root: document.documentElement,
    viewContainer: document.getElementById('viewContainer'),
    pageTitle: document.getElementById('pageTitle'),
    sidebar: document.getElementById('sidebar'),
    menuToggle: document.getElementById('menuToggle'),
    themeToggle: document.getElementById('themeToggle'),
    toastStack: document.getElementById('toastStack'),
    confirmDialog: document.getElementById('confirmDialog'),
    confirmTitle: document.getElementById('confirmTitle'),
    confirmMessage: document.getElementById('confirmMessage'),
    confirmActionButton: document.getElementById('confirmActionButton'),
    printDialog: document.getElementById('printDialog'),
    printPreviewStage: document.getElementById('printPreviewStage'),
    paperSizeSelect: document.getElementById('paperSizeSelect'),
    closePrintPreview: document.getElementById('closePrintPreview'),
    printFromPreview: document.getElementById('printFromPreview'),
    attachmentInput: document.getElementById('attachmentInput')
  };

  init();

  function init() {
    applyTheme(state.theme);
    normalizeState();
    bindGlobalEvents();
    route('editor');
  }

  function normalizeState() {
    state.invoices = state.invoices.map((invoice) => normalizeInvoice(invoice));
    if (!state.invoices.some((invoice) => invoice.id === state.currentInvoiceId && !invoice.deletedAt)) {
      const available = state.invoices.find((invoice) => !invoice.deletedAt);
      state.currentInvoiceId = available ? available.id : null;
    }
    persistInvoices();
  }

  function normalizeInvoice(invoice) {
    return {
      ...structuredClone(REFERENCE_INVOICE),
      ...invoice,
      client: { ...structuredClone(DEFAULT_CLIENT), ...(invoice.client || {}) },
      shipTo: { name: '', address: '', ...(invoice.shipTo || {}) },
      mailTo: { name: '', mailingAddress: '', city: '', state: '', zip: '', ...(invoice.mailTo || {}) },
      paymentLink: invoice.paymentLink || '',
      issuer: { ...structuredClone(REFERENCE_INVOICE.issuer), ...(invoice.issuer || {}), dbaTitles: Array.isArray(invoice.issuer?.dbaTitles) ? invoice.issuer.dbaTitles : [] },
      settings: { ...structuredClone(REFERENCE_INVOICE.settings), ...(invoice.settings || {}) },
      adjustments: { ...structuredClone(REFERENCE_INVOICE.adjustments), ...(invoice.adjustments || {}) },
      lineItems: Array.isArray(invoice.lineItems) && invoice.lineItems.length ? invoice.lineItems : [blankLineItem()],
      customFields: Array.isArray(invoice.customFields) ? invoice.customFields : [],
      attachments: Array.isArray(invoice.attachments) ? invoice.attachments : [],
      paymentMethods: Array.isArray(invoice.paymentMethods) ? invoice.paymentMethods : []
    };
  }


  function dashboardProfileName() {
    const profile = dashboardContext.profile || {};
    return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
  }

  function dashboardIssuer() {
    const profile = dashboardContext.profile || {};
    const tax = dashboardContext.taxProfile || {};
    const invoiceSettings = { ...structuredClone(DEFAULT_INVOICE_HEADER_SETTINGS), ...(dashboardContext.invoiceSettings || {}) };
    const locationLine = [tax.city || profile.city, tax.region || profile.region, tax.postalCode].filter(Boolean).join(', ');
    const address = [tax.mailingAddress, locationLine].filter(Boolean).join('\n');
    return {
      ...structuredClone(REFERENCE_INVOICE.issuer),
      businessName: invoiceSettings.legalBusinessName || tax.businessName || 'Raising The Bar Officiating Inc.',
      headerTitle: invoiceSettings.title || DEFAULT_INVOICE_HEADER_SETTINGS.title,
      slogan: invoiceSettings.slogan || DEFAULT_INVOICE_HEADER_SETTINGS.slogan,
      phone: invoiceSettings.phone || profile.phone || DEFAULT_INVOICE_HEADER_SETTINGS.phone,
      email: invoiceSettings.email || profile.email || DEFAULT_INVOICE_HEADER_SETTINGS.email,
      website: invoiceSettings.website || DEFAULT_INVOICE_HEADER_SETTINGS.website,
      headerLogo: invoiceSettings.logo || DEFAULT_INVOICE_HEADER_SETTINGS.logo,
      contactName: dashboardProfileName(),
      address
    };
  }

  function invoiceHeaderSettings() {
    return { ...structuredClone(DEFAULT_INVOICE_HEADER_SETTINGS), ...(dashboardContext.invoiceSettings || {}) };
  }

  function schoolToClient(school, index) {
    const sourceId = String(school.id || index + 1);
    return {
      ...structuredClone(DEFAULT_CLIENT),
      id: `dashboard-school-${sourceId}`,
      sourceDashboardId: sourceId,
      source: 'dashboard',
      type: school.type || '',
      organization: school.name || '',
      contact: school.contactName || school.athleticDirector || school.headCoach || '',
      email: school.email || school.athleticDirectorEmail || school.headCoachEmail || '',
      phone: school.phone || school.athleticDirectorPhone || school.headCoachPhone || '',
      billingAddress: school.venueAddress || '',
      serviceAddress: school.venueAddress || '',
      taxExempt: false,
      paymentTerms: ''
    };
  }

  function updateInvoiceProfileChip() {
    const name = dashboardProfileName();
    const chip = document.querySelector('[data-invoice-profile]');
    if (!chip) return;
    chip.hidden = !name;
    if (!name) return;
    const initials = (dashboardContext.profile?.firstName?.[0] || '') + (dashboardContext.profile?.lastName?.[0] || '');
    const avatar = chip.querySelector('[data-invoice-profile-avatar]');
    const nameNode = chip.querySelector('[data-invoice-profile-name]');
    const roleNode = chip.querySelector('[data-invoice-profile-role]');
    if (avatar) avatar.textContent = initials.toUpperCase();
    if (nameNode) nameNode.textContent = name;
    if (roleNode) roleNode.textContent = dashboardContext.profile?.role || '';
  }

  function applyDashboardContext(payload = {}) {
    dashboardContext = {
      profile: payload.profile && typeof payload.profile === 'object' ? payload.profile : {},
      taxProfile: payload.taxProfile && typeof payload.taxProfile === 'object' ? payload.taxProfile : {},
      schools: Array.isArray(payload.schools) ? payload.schools : [],
      invoiceSettings: { ...structuredClone(DEFAULT_INVOICE_HEADER_SETTINGS), ...(payload.invoiceSettings && typeof payload.invoiceSettings === 'object' ? payload.invoiceSettings : {}) }
    };
    updateInvoiceProfileChip();

    const syncedClients = dashboardContext.schools.filter((school) => school && school.name).map(schoolToClient);
    const syncedIds = new Set(syncedClients.map((client) => client.sourceDashboardId));
    const retained = state.clients.filter((client) => client.source !== 'dashboard' || syncedIds.has(String(client.sourceDashboardId || '')));
    syncedClients.forEach((client) => {
      const index = retained.findIndex((item) => item.source === 'dashboard' && String(item.sourceDashboardId) === client.sourceDashboardId);
      if (index >= 0) retained[index] = { ...retained[index], ...client, id: retained[index].id || client.id };
      else retained.push(client);
    });
    state.clients = retained;

    const issuer = dashboardIssuer();
    const currentName = dashboardProfileName();
    state.invoices.forEach((invoice) => {
      invoice.issuer = invoice.issuer || {};
      Object.entries(issuer).forEach(([key, value]) => {
        const globalHeaderField = ['headerTitle','slogan','phone','email','website','headerLogo'].includes(key);
        if ((globalHeaderField && !invoice.finalized) || (!invoice.issuer[key] && value)) invoice.issuer[key] = value;
      });
      invoice.issuer.dbaTitles = Array.isArray(invoice.issuer.dbaTitles) ? invoice.issuer.dbaTitles : [];
      if (!invoice.assignor && currentName) invoice.assignor = currentName;
      const isBlankDraft = !invoice.finalized && String(invoice.status || '').toLowerCase() === 'draft' && !invoice.event && !invoice.client?.organization && !(invoice.lineItems || []).some((item) => String(item.description || '').trim());
      const prefix = String(invoiceHeaderSettings().invoicePrefix || 'RTBO').trim().replace(/[^A-Za-z0-9-]/g, '').toUpperCase() || 'RTBO';
      if (isBlankDraft && !String(invoice.invoiceNumber || '').startsWith(`${prefix}-`)) invoice.invoiceNumber = generateNextInvoiceNumber();
    });

    persistClients();
    persistInvoices();
    if (state.activeView) route(state.activeView);
  }

  function bindGlobalEvents() {
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'gunr-dashboard-context') applyDashboardContext(event.data.payload || {});
      if (event.data?.type === 'rtbo-invoice-route' && event.data.view) route(event.data.view);
    });
    if (window.parent !== window) window.parent.postMessage({ type: 'rtbo-invoice-ready' }, '*');
    els.menuToggle.addEventListener('click', () => els.sidebar.classList.toggle('open'));
    els.themeToggle.addEventListener('click', () => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      toast(`${capitalize(next)} theme enabled.`, 'info');
    });

    document.querySelectorAll('[data-view]').forEach((button) => {
      button.addEventListener('click', () => route(button.dataset.view));
    });

    document.addEventListener('click', (event) => {
      document.querySelectorAll('.dropdown.open').forEach((dropdown) => {
        if (!dropdown.contains(event.target)) dropdown.classList.remove('open');
      });
      if (window.innerWidth <= 920 && !els.sidebar.contains(event.target) && event.target !== els.menuToggle) {
        els.sidebar.classList.remove('open');
      }
    });

    els.closePrintPreview.addEventListener('click', () => els.printDialog.close());
    els.paperSizeSelect.addEventListener('change', () => {
      const invoice = currentInvoice();
      if (!invoice) return;
      invoice.paperSize = els.paperSizeSelect.value;
      markDirty();
      renderPrintPreview(invoice);
    });
    els.printFromPreview.addEventListener('click', () => window.print());

    els.attachmentInput.addEventListener('change', handleAttachmentSelection);

    window.addEventListener('beforeunload', (event) => {
      if (!state.dirty) return;
      event.preventDefault();
      event.returnValue = '';
    });
  }

  function applyTheme(theme) {
    state.theme = theme;
    els.root.dataset.theme = theme;
    localStorage.setItem(STORAGE.theme, theme);
    els.themeToggle.textContent = theme === 'light' ? '◐' : '☀';
    els.themeToggle.title = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
  }

  function route(view) {
    state.activeView = view;
    document.querySelectorAll('.nav-item, .sub-nav button, .embedded-invoice-nav button').forEach((item) => item.classList.remove('active', 'active-dot'));
    const matching = document.querySelectorAll(`[data-view="${view}"]`);
    matching.forEach((item, index) => item.classList.add(item.closest('.sub-nav') ? 'active-dot' : 'active'));
    els.sidebar.classList.remove('open');

    const titles = {
      dashboard: 'Invoice Dashboard', invoices: 'Invoices', editor: 'Invoice Generator', drafts: 'Draft Invoices',
      recurring: 'Recurring Invoices', payments: 'Payments', trash: 'Trash', clients: 'Clients', services: 'Services',
      reports: 'Reports', vault: 'The Vault / Safe', templates: 'Invoice Templates', email: 'Email Templates',
      settings: 'Settings', integrations: 'Integrations', activity: 'Activity Log', help: 'Help Center'
    };
    els.pageTitle.textContent = titles[view] || 'Invoice Generator';

    switch (view) {
      case 'editor': renderEditor(); break;
      case 'dashboard': renderDashboard(); break;
      case 'invoices': renderInvoiceList('all'); break;
      case 'drafts': renderInvoiceList('draft'); break;
      case 'trash': renderTrash(); break;
      case 'vault': renderVault(); break;
      case 'clients': renderClients(); break;
      case 'services': renderServices(); break;
      case 'recurring': renderRecurring(); break;
      case 'payments': renderPayments(); break;
      case 'reports': renderReports(); break;
      case 'activity': renderActivity(); break;
      default: renderPlaceholder(view);
    }
  }

  function currentInvoice() {
    return state.invoices.find((invoice) => invoice.id === state.currentInvoiceId) || null;
  }

  function createNewInvoice(navigate = true) {
    const nextNumber = generateNextInvoiceNumber();
    const today = new Date();
    const due = new Date(today);
    due.setDate(today.getDate() + 14);
    const invoice = normalizeInvoice({
      id: crypto.randomUUID ? crypto.randomUUID() : `invoice-${Date.now()}`,
      invoiceNumber: nextNumber,
      invoiceDate: toISODate(today),
      referenceNumber: '',
      dueDate: toISODate(due),
      purchaseOrderNumber: '',
      event: '',
      gameLevel: '',
      eventStartDate: '',
      eventEndDate: '',
      eventLocation: '',
      servicePeriod: '',
      assignor: dashboardProfileName(),
      status: 'Draft',
      clientId: '',
      client: {
        id: '', type: '', organization: '', contact: '', email: '', phone: '', billingAddress: '',
        serviceAddress: '', taxExempt: false, paymentTerms: ''
      },
      shipSameAsBill: true,
      shipTo: { name: '', address: '' },
      lineItems: [blankLineItem()],
      internalNotes: '',
      clientNotes: '',
      issuer: dashboardIssuer(),
      paymentMethods: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      finalized: false
    });
    state.invoices.unshift(invoice);
    state.currentInvoiceId = invoice.id;
    localStorage.setItem(STORAGE.current, invoice.id);
    persistInvoices();
    logActivity('Created invoice', invoice.invoiceNumber);
    state.dirty = false;
    if (navigate) route('editor');
    toast(`Created ${invoice.invoiceNumber}.`, 'success');
  }

  function generateNextInvoiceNumber() {
    const year = new Date().getFullYear();
    const prefix = String(invoiceHeaderSettings().invoicePrefix || 'RTBO').trim().replace(/[^A-Za-z0-9-]/g, '').toUpperCase() || 'RTBO';
    const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);
    const numbers = state.invoices.map((invoice) => {
      const match = String(invoice.invoiceNumber || '').match(pattern);
      return match ? Number(match[1]) : 0;
    });
    const counters = loadJSON(STORAGE.sequence, {});
    const counterKey = `${prefix}-${year}`;
    const lastReserved = Number(counters[counterKey] || 0);
    const next = Math.max(lastReserved, Math.max(0, ...numbers)) + 1;
    counters[counterKey] = next;
    localStorage.setItem(STORAGE.sequence, JSON.stringify(counters));
    return `${prefix}-${year}-${String(next).padStart(3, '0')}`;
  }

  function blankLineItem() {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `line-${Date.now()}-${Math.random()}`,
      description: '', serviceDate: '', rate: 0, quantity: 1, unit: 'Each', taxRate: 0, discount: 0, notes: ''
    };
  }

  function renderEditor() {
    let invoice = currentInvoice();
    if (!invoice) {
      createNewInvoice(false);
      invoice = currentInvoice();
    }

    els.viewContainer.innerHTML = `
      <div class="editor-view">
        <div class="actionbar">
          <button class="button secondary" id="backToInvoices">← Back to Invoices</button>
          <div class="actionbar-spacer"></div>
          <button class="button primary" id="createNewInvoice">⊕ Create New Invoice</button>
          <div class="dropdown" id="saveDropdown">
            <button class="button dark" id="saveInvoiceMain">▣ Save Invoice <span aria-hidden="true">⌄</span></button>
            <div class="dropdown-menu">
              <button data-save-mode="computer">⇩ Save to Computer</button>
              <button data-save-mode="vault">▣ Save to The Vault / Safe</button>
              <button data-save-mode="both">✓ Save to Computer + Vault / Safe</button>
              <div class="dropdown-note">Main Save button performs both actions.</div>
            </div>
          </div>
          <button class="button dark" id="printPreview">▤ Print Preview</button>
          <div class="dropdown" id="downloadDropdown">
            <button class="button dark" id="downloadPdf">⇩ Download PDF <span>⌄</span></button>
            <div class="dropdown-menu">
              <button data-download-paper="letter">US Letter PDF</button>
              <button data-download-paper="a4">A4 PDF</button>
              <button data-download-paper="printer">Printer-Friendly PDF</button>
            </div>
          </div>
          <div class="dropdown" id="sendDropdown">
            <button class="button dark" id="sendInvoice">➤ Send Invoice <span>⌄</span></button>
            <div class="dropdown-menu">
              <button data-send="email">Email Invoice</button>
              <button data-send="sms">Text Message Link</button>
              <button data-send="share">Share</button>
            </div>
          </div>
          <button class="button danger" id="deleteInvoice">♲ Delete Invoice</button>
        </div>

        <div class="status-row">
          <span class="pill"><strong>Status:</strong> ${escapeHTML(invoice.status)}</span>
          <span class="pill success" id="autosaveStatus">✓ Auto-saved: ${formatTime(invoice.updatedAt)}</span>
          ${invoice.finalized ? '<span class="pill">🔒 Finalized and locked</span>' : ''}
        </div>

        <div class="editor-grid">
          <section class="form-panel" aria-label="Invoice editor">
            ${renderInvoiceForm(invoice)}
          </section>
          <aside class="preview-panel" aria-label="Live invoice preview">
            <div class="preview-toolbar">
              <button id="previewZoomOut" aria-label="Zoom out">−</button>
              <span id="previewZoomLabel">100%</span>
              <button id="previewZoomIn" aria-label="Zoom in">+</button>
              <span>•</span><span>1 / ${Math.max(1, Math.ceil(invoice.lineItems.length / 8))}</span>
              <button id="previewFullscreen" aria-label="Open print preview">⛶</button>
            </div>
            <div class="preview-page-wrap">
              <div class="invoice-paper" id="liveInvoicePreview">${renderInvoiceDocument(invoice)}</div>
            </div>
          </aside>
        </div>
      </div>`;

    bindEditorEvents();
  }

  function renderInvoiceForm(invoice) {
    return `
      <div class="section">
        <div class="form-columns">
          <div>
            <h3 class="section-title">Client Information</h3>
            <h4 class="form-subtitle">Bill To</h4>
            ${fieldSelect('Client', 'clientId', invoice.clientId, state.clients.map((client) => ({ value: client.id, label: client.organization })), true, 'Select or enter a client')}
            ${fieldInput('Organization', 'client.organization', invoice.client.organization, true)}
            ${fieldInput('Contact', 'client.contact', invoice.client.contact, true)}
            ${fieldInput('Email', 'client.email', invoice.client.email, true, 'email')}
            ${fieldInput('Phone', 'client.phone', invoice.client.phone, true, 'tel')}
            ${fieldTextarea('Address', 'client.billingAddress', invoice.client.billingAddress, true)}
            <label class="checkbox-row"><input type="checkbox" data-field="saveClientProfile" /> Save changes to client profile</label>
          </div>
          <div>
            <h3 class="section-title">&nbsp;</h3>
            <h4 class="form-subtitle">Ship / Service To</h4>
            <label class="checkbox-row"><input type="checkbox" data-field="shipSameAsBill" ${invoice.shipSameAsBill ? 'checked' : ''} /> Same as Bill To</label>
            ${fieldInput('Name', 'shipTo.name', invoice.shipTo.name, true, 'text', invoice.shipSameAsBill)}
            ${fieldTextarea('Address', 'shipTo.address', invoice.shipTo.address, true, invoice.shipSameAsBill)}
          </div>
          <div>
            <h3 class="section-title">Invoice Details</h3>
            <div class="invoice-details-grid">
              ${fieldInput('Invoice # (Auto-generated)', 'invoiceNumber', invoice.invoiceNumber, true, 'text', true)}
              ${fieldInput('Invoice Date', 'invoiceDate', invoice.invoiceDate, true, 'date')}
              ${fieldInput('Reference #', 'referenceNumber', invoice.referenceNumber)}
              ${fieldInput('Due Date', 'dueDate', invoice.dueDate, true, 'date')}
              ${fieldInput('PO Number', 'purchaseOrderNumber', invoice.purchaseOrderNumber)}
              ${fieldInput('Event', 'event', invoice.event, true)}
              ${fieldSelect('Game Level', 'gameLevel', invoice.gameLevel, GAME_LEVELS.map((value) => ({ value, label: value })), true)}
              ${fieldInput('Event Start', 'eventStartDate', invoice.eventStartDate, false, 'date')}
              ${fieldInput('Event End', 'eventEndDate', invoice.eventEndDate, false, 'date')}
              ${fieldInput('Event Location', 'eventLocation', invoice.eventLocation)}
              ${fieldInput('Service Period', 'servicePeriod', invoice.servicePeriod)}
              ${fieldInput('Assignor / Coordinator', 'assignor', invoice.assignor)}
            </div>
            <button class="button secondary small" id="addCustomField" style="width:100%;margin-top:8px">＋ Add Custom Field</button>
            <div id="customFieldsWrap">${renderCustomFields(invoice)}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Mail-To & Payment Information</h3>
        <p class="section-help">Set the remittance address that prints on the invoice and the secure payment URL clients can click to pay online.</p>
        <div class="mail-to-grid">
          ${fieldInput('Mail To', 'mailTo.name', invoice.mailTo.name, true)}
          ${fieldInput('Mailing Address', 'mailTo.mailingAddress', invoice.mailTo.mailingAddress, true)}
          ${fieldInput('City', 'mailTo.city', invoice.mailTo.city, true)}
          ${fieldSelect('State', 'mailTo.state', invoice.mailTo.state, US_STATES.map(([value,label]) => ({ value, label })), true, 'Select state')}
          ${fieldInput('Zip', 'mailTo.zip', invoice.mailTo.zip, true)}
          ${fieldInput('Payment Link', 'paymentLink', invoice.paymentLink, false, 'url')}
        </div>
        <div class="dba-choice-panel">
          <div><strong>DBA Title(s) on This Invoice</strong><small>Select either, both, or neither. These labels can be changed in Admin Dashboard Settings.</small></div>
          <label class="checkbox-row"><input type="checkbox" data-dba-title="rtbo" ${invoice.issuer.dbaTitles.includes('rtbo') ? 'checked' : ''} /> DBA ${escapeHTML(invoiceHeaderSettings().dbaRaisingTheBarLabel || 'Raising The Bar Officiating')}</label>
          <label class="checkbox-row"><input type="checkbox" data-dba-title="gotunexref" ${invoice.issuer.dbaTitles.includes('gotunexref') ? 'checked' : ''} /> DBA ${escapeHTML(invoiceHeaderSettings().dbaGotUNexRefLabel || 'Got U Nex Ref')}</label>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Invoice Settings</h3>
        <div class="inline-fields">
          ${fieldSelect('Currency', 'settings.currency', invoice.settings.currency, Object.keys(CURRENCY_SYMBOLS).map((value) => ({ value, label: `${value} - ${currencyName(value)}` })), true)}
          ${fieldInput('Rate to USD', 'settings.exchangeRateToUSD', invoice.settings.exchangeRateToUSD, true, 'number')}
          ${fieldInput('Payment Terms', 'settings.paymentTerms', invoice.settings.paymentTerms, true)}
          ${fieldSelect('Tax Option', 'settings.taxEnabled', String(invoice.settings.taxEnabled), [{value:'false', label:'Tax Exempt / No Tax'}, {value:'true', label:'Taxable'}])}
        </div>
        <div class="inline-fields" style="margin-top:7px">
          ${fieldInput('Tax Label', 'settings.taxLabel', invoice.settings.taxLabel)}
          ${fieldInput('Default Tax Rate %', 'settings.taxRate', invoice.settings.taxRate, false, 'number')}
          ${fieldSelect('Late Fee Type', 'settings.lateFeeType', invoice.settings.lateFeeType, [{value:'percent',label:'Percentage'}, {value:'fixed',label:'Fixed Amount'}])}
          ${fieldInput('Late Fee Value', 'settings.lateFeeValue', invoice.settings.lateFeeValue, false, 'number')}
        </div>
        <label class="checkbox-row"><input type="checkbox" data-field="settings.passProcessingFee" ${invoice.settings.passProcessingFee ? 'checked' : ''} /> Pass payment-processing fees to the client where legally permitted</label>
        <label class="checkbox-row"><input type="checkbox" data-field="settings.lateFeeEnabled" ${invoice.settings.lateFeeEnabled ? 'checked' : ''} /> Enable late fees after the due date</label>
        <label class="checkbox-row"><input type="checkbox" data-field="settings.recurring" ${invoice.settings.recurring ? 'checked' : ''} /> Create as recurring invoice draft</label>
        ${invoice.settings.recurring ? fieldInput('Custom Recurring Schedule', 'settings.recurringSchedule', invoice.settings.recurringSchedule, true) : ''}
      </div>

      <div class="section">
        <h3 class="section-title">Line Items</h3>
        ${renderLineItems(invoice)}
      </div>

      <div>
        <div class="tabs" role="tablist">
          ${tabButton('notes', 'Notes')}
          ${tabButton('attachments', `Attachments (${invoice.attachments.length})`)}
          ${tabButton('paymentMethods', 'Payment Methods')}
          ${tabButton('additional', 'Additional Info')}
        </div>
        <div class="tab-panel ${state.currentTab === 'notes' ? 'active' : ''}" data-tab-panel="notes">
          <div class="notes-grid">
            ${fieldTextarea('Internal Notes (not visible to client)', 'internalNotes', invoice.internalNotes)}
            ${fieldTextarea('Client Notes (visible to client)', 'clientNotes', invoice.clientNotes)}
            ${renderTotalsEditor(invoice)}
          </div>
        </div>
        <div class="tab-panel ${state.currentTab === 'attachments' ? 'active' : ''}" data-tab-panel="attachments">
          <button class="button secondary" id="addAttachment">＋ Add Attachments</button>
          <div id="attachmentList" style="margin-top:10px">${renderAttachments(invoice)}</div>
        </div>
        <div class="tab-panel ${state.currentTab === 'paymentMethods' ? 'active' : ''}" data-tab-panel="paymentMethods">
          <div class="inline-fields">
            ${PAYMENT_METHODS.map((method) => `<label class="checkbox-row"><input type="checkbox" data-payment-method="${escapeAttr(method)}" ${invoice.paymentMethods.includes(method) ? 'checked' : ''} /> ${escapeHTML(method)}</label>`).join('')}
          </div>
        </div>
        <div class="tab-panel ${state.currentTab === 'additional' ? 'active' : ''}" data-tab-panel="additional">
          <div class="form-columns" style="grid-template-columns:1fr 1fr">
            <div>
              <h3 class="section-title">Issuer Information</h3>
              ${fieldInput('Business Name', 'issuer.businessName', invoice.issuer.businessName, true)}
              ${fieldInput('Invoice Header Title', 'issuer.headerTitle', invoice.issuer.headerTitle, true, 'text', true)}
              ${fieldInput('Website', 'issuer.website', invoice.issuer.website, true, 'url', true)}
              ${fieldInput('Contact Name', 'issuer.contactName', invoice.issuer.contactName, true)}
              ${fieldTextarea('Mailing Address', 'issuer.address', invoice.issuer.address, true)}
              ${fieldInput('Phone', 'issuer.phone', invoice.issuer.phone, true)}
              ${fieldInput('Email', 'issuer.email', invoice.issuer.email, true, 'email')}
            </div>
            <div>
              <h3 class="section-title">Terms & Conditions</h3>
              ${fieldTextarea('Terms', 'terms', invoice.terms, true)}
              ${fieldSelect('Paper Size', 'paperSize', invoice.paperSize, [{value:'letter', label:'US Letter'}, {value:'a4', label:'A4'}])}
              <label class="checkbox-row"><input type="checkbox" data-field="printFriendly" ${invoice.printFriendly ? 'checked' : ''} /> Printer-friendly output (reduced backgrounds)</label>
              <label class="checkbox-row"><input type="checkbox" data-field="finalized" ${invoice.finalized ? 'checked' : ''} /> Finalize and lock this invoice after saving</label>
            </div>
          </div>
        </div>
      </div>`;
  }

  function fieldInput(label, path, value, required = false, type = 'text', readonly = false) {
    return `<div class="field"><label class="${required ? 'required' : ''}" for="field-${cssSafe(path)}">${escapeHTML(label)}</label><input class="input" id="field-${cssSafe(path)}" type="${type}" data-field="${escapeAttr(path)}" value="${escapeAttr(value ?? '')}" ${readonly ? 'readonly' : ''} ${required ? 'required' : ''} ${type === 'number' ? 'step="0.01"' : ''}></div>`;
  }

  function fieldTextarea(label, path, value, required = false, readonly = false) {
    return `<div class="field"><label class="${required ? 'required' : ''}" for="field-${cssSafe(path)}">${escapeHTML(label)}</label><textarea class="textarea" id="field-${cssSafe(path)}" data-field="${escapeAttr(path)}" ${readonly ? 'readonly' : ''} ${required ? 'required' : ''}>${escapeHTML(value ?? '')}</textarea></div>`;
  }

  function fieldSelect(label, path, value, options, required = false, placeholder = '') {
    return `<div class="field"><label class="${required ? 'required' : ''}" for="field-${cssSafe(path)}">${escapeHTML(label)}</label><select class="select" id="field-${cssSafe(path)}" data-field="${escapeAttr(path)}" ${required ? 'required' : ''}>${placeholder ? `<option value="">${escapeHTML(placeholder)}</option>` : ''}${options.map((option) => `<option value="${escapeAttr(option.value)}" ${String(option.value) === String(value) ? 'selected' : ''}>${escapeHTML(option.label)}</option>`).join('')}</select></div>`;
  }

  function tabButton(id, label) {
    return `<button class="tab ${state.currentTab === id ? 'active' : ''}" data-tab="${id}" role="tab">${escapeHTML(label)}</button>`;
  }

  function renderCustomFields(invoice) {
    if (!invoice.customFields.length) return '';
    return invoice.customFields.map((field, index) => `
      <div style="display:grid;grid-template-columns:1fr 1fr 34px;gap:5px;margin-top:6px">
        <input class="input" data-custom-index="${index}" data-custom-field="label" value="${escapeAttr(field.label)}" aria-label="Custom field label" />
        <input class="input" data-custom-index="${index}" data-custom-field="value" value="${escapeAttr(field.value)}" aria-label="Custom field value" />
        <button class="button danger icon-only small" data-remove-custom="${index}" aria-label="Remove custom field">×</button>
      </div>`).join('');
  }

  function renderLineItems(invoice) {
    return `
      <div class="table-wrap">
        <table class="line-table">
          <thead><tr><th>#</th><th>Description</th><th>Service Date</th><th>Rate (${escapeHTML(invoice.settings.currency)})</th><th>Quantity</th><th>Unit</th><th>Tax %</th><th>Discount</th><th>Amount</th><th></th></tr></thead>
          <tbody>
            ${invoice.lineItems.map((item, index) => {
              const amount = lineTotal(item);
              return `<tr>
                <td>${index + 1}</td>
                <td><input class="input" data-line-index="${index}" data-line-field="description" value="${escapeAttr(item.description)}" /></td>
                <td><input class="input" type="date" data-line-index="${index}" data-line-field="serviceDate" value="${escapeAttr(item.serviceDate)}" /></td>
                <td><input class="input" type="number" step="0.01" data-line-index="${index}" data-line-field="rate" value="${escapeAttr(item.rate)}" /></td>
                <td><input class="input" type="number" step="0.01" data-line-index="${index}" data-line-field="quantity" value="${escapeAttr(item.quantity)}" /></td>
                <td><select class="select" data-line-index="${index}" data-line-field="unit">${['Each','Hour','Day','Game','Mile','Flat Fee','Other'].map((unit) => `<option ${item.unit === unit ? 'selected' : ''}>${unit}</option>`).join('')}</select></td>
                <td><input class="input" type="number" step="0.01" data-line-index="${index}" data-line-field="taxRate" value="${escapeAttr(item.taxRate)}" ${invoice.settings.taxEnabled ? '' : 'disabled'} /></td>
                <td><input class="input" type="number" step="0.01" data-line-index="${index}" data-line-field="discount" value="${escapeAttr(item.discount)}" /></td>
                <td class="money-cell" data-line-amount="${index}">${formatMoney(amount, invoice.settings.currency)}</td>
                <td><button class="button danger icon-only small" data-remove-line="${index}" aria-label="Delete line item">×</button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="table-actions">
        <button class="button secondary small" id="addLineItem">＋ Add Line Item</button>
        <button class="button secondary small" id="addSection">＋ Add Section</button>
        <span class="push"></span>
        <button class="button secondary small" id="importEvent">▣ Import from Event</button>
        <button class="button secondary small" id="importService">▤ Import from Service Catalog</button>
      </div>`;
  }

  function renderTotalsEditor(invoice) {
    const totals = calculateTotals(invoice);
    return `<div class="totals-card">
      <div class="field"><label>Invoice Discount Type</label><select class="select" data-field="adjustments.invoiceDiscountType"><option value="fixed" ${invoice.adjustments.invoiceDiscountType === 'fixed' ? 'selected' : ''}>Fixed</option><option value="percent" ${invoice.adjustments.invoiceDiscountType === 'percent' ? 'selected' : ''}>Percentage</option></select></div>
      ${fieldInput('Invoice Discount', 'adjustments.invoiceDiscountValue', invoice.adjustments.invoiceDiscountValue, false, 'number')}
      ${fieldInput('Service Fee', 'adjustments.serviceFee', invoice.adjustments.serviceFee, false, 'number')}
      ${fieldInput('Processing Fee %', 'adjustments.processingFeeRate', invoice.adjustments.processingFeeRate, false, 'number')}
      ${fieldInput('Travel Fee', 'adjustments.travelFee', invoice.adjustments.travelFee, false, 'number')}
      ${fieldInput('Other Fee Label', 'adjustments.otherFeeLabel', invoice.adjustments.otherFeeLabel)}
      ${fieldInput('Other Fee', 'adjustments.otherFee', invoice.adjustments.otherFee, false, 'number')}
      ${fieldInput('Deposit', 'adjustments.deposit', invoice.adjustments.deposit, false, 'number')}
      ${fieldInput('Previous Payment', 'adjustments.previousPayment', invoice.adjustments.previousPayment, false, 'number')}
      <div id="editorTotalsSummary">
        <div class="total-row"><span>Sub-total</span><span>${formatMoney(totals.subtotal, invoice.settings.currency)}</span></div>
        <div class="total-row"><span>Discount</span><span>-${formatMoney(totals.invoiceDiscount + totals.lineDiscounts, invoice.settings.currency)}</span></div>
        <div class="total-row"><span>Tax</span><span>${formatMoney(totals.tax, invoice.settings.currency)}</span></div>
        <div class="total-row"><span>Fees</span><span>${formatMoney(totals.fees, invoice.settings.currency)}</span></div>
        <div class="total-row"><strong>Total</strong><strong>${formatMoney(totals.total, invoice.settings.currency)}</strong></div>
        <div class="total-row"><span>Deposit / Payment</span><span>-${formatMoney(totals.appliedPayments, invoice.settings.currency)}</span></div>
        <div class="total-row balance"><span>Balance Due</span><span>${formatMoney(totals.balanceDue, invoice.settings.currency)}</span></div>
        ${invoice.settings.currency !== 'USD' ? `<div class="total-row"><span>USD Equivalent</span><strong>${formatMoney(totals.balanceDue * number(invoice.settings.exchangeRateToUSD, 1), 'USD')}</strong></div>` : ''}
      </div>
    </div>`;
  }

  function renderAttachments(invoice) {
    if (!invoice.attachments.length) return '<p style="color:var(--muted);font-size:16px">No attachments added.</p>';
    return invoice.attachments.map((attachment, index) => `<div class="data-panel-header" style="border:1px solid var(--border);border-radius:7px;margin-bottom:6px"><span><strong>${escapeHTML(attachment.name)}</strong><br><small>${formatFileSize(attachment.size)} • ${escapeHTML(attachment.type || 'File')}</small></span><button class="button danger small" data-remove-attachment="${index}">Remove</button></div>`).join('');
  }

  function bindEditorEvents() {
    document.getElementById('backToInvoices').addEventListener('click', () => route('invoices'));
    document.getElementById('createNewInvoice').addEventListener('click', () => confirmUnsavedThen(createNewInvoice));
    document.getElementById('saveInvoiceMain').addEventListener('click', (event) => {
      if (event.target.closest('span')) {
        document.getElementById('saveDropdown').classList.toggle('open');
      } else {
        saveInvoiceBoth();
      }
    });
    document.getElementById('saveDropdown').querySelectorAll('[data-save-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.saveMode;
        if (mode === 'computer') saveToComputer();
        if (mode === 'vault') saveToVault();
        if (mode === 'both') saveInvoiceBoth();
      });
    });
    document.getElementById('printPreview').addEventListener('click', openPrintPreview);
    document.getElementById('downloadPdf').addEventListener('click', () => document.getElementById('downloadDropdown').classList.toggle('open'));
    document.getElementById('downloadDropdown').querySelectorAll('[data-download-paper]').forEach((button) => {
      button.addEventListener('click', () => {
        const invoice = currentInvoice();
        if (button.dataset.downloadPaper === 'printer') {
          invoice.printFriendly = true;
          downloadInvoicePDF(invoice, invoice.paperSize || 'letter').finally(() => { invoice.printFriendly = false; });
        } else {
          invoice.paperSize = button.dataset.downloadPaper;
          downloadInvoicePDF(invoice, invoice.paperSize);
        }
      });
    });
    document.getElementById('sendInvoice').addEventListener('click', () => document.getElementById('sendDropdown').classList.toggle('open'));
    document.getElementById('sendDropdown').querySelectorAll('[data-send]').forEach((button) => button.addEventListener('click', () => sendInvoice(button.dataset.send)));
    document.getElementById('deleteInvoice').addEventListener('click', deleteCurrentInvoice);

    document.querySelectorAll('[data-field]').forEach((input) => {
      input.addEventListener(input.matches('select, input[type="checkbox"]') ? 'change' : 'input', handleFieldChange);
    });

    document.querySelectorAll('[data-line-index]').forEach((input) => input.addEventListener(input.matches('select') ? 'change' : 'input', handleLineChange));
    document.querySelectorAll('[data-remove-line]').forEach((button) => button.addEventListener('click', () => removeLineItem(Number(button.dataset.removeLine))));
    document.getElementById('addLineItem').addEventListener('click', addLineItem);
    document.getElementById('addSection').addEventListener('click', () => {
      const invoice = currentInvoice();
      invoice.lineItems.push({ ...blankLineItem(), description: '— New Section —', quantity: 0, rate: 0 });
      markDirty();
      renderEditor();
    });
    document.getElementById('importEvent').addEventListener('click', () => toast('Event import is ready for Supabase integration in the production phase.', 'info'));
    document.getElementById('importService').addEventListener('click', importFromServiceCatalog);

    document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.tab)));
    const addAttachment = document.getElementById('addAttachment');
    if (addAttachment) addAttachment.addEventListener('click', () => els.attachmentInput.click());
    document.querySelectorAll('[data-remove-attachment]').forEach((button) => button.addEventListener('click', () => removeAttachment(Number(button.dataset.removeAttachment))));
    document.querySelectorAll('[data-payment-method]').forEach((input) => input.addEventListener('change', handlePaymentMethodChange));
    document.querySelectorAll('[data-dba-title]').forEach((input) => input.addEventListener('change', handleDbaTitleChange));

    document.getElementById('addCustomField').addEventListener('click', () => {
      currentInvoice().customFields.push({ label: '', value: '' });
      markDirty();
      renderEditor();
    });
    document.querySelectorAll('[data-custom-index]').forEach((input) => input.addEventListener('input', handleCustomFieldChange));
    document.querySelectorAll('[data-remove-custom]').forEach((button) => button.addEventListener('click', () => {
      currentInvoice().customFields.splice(Number(button.dataset.removeCustom), 1);
      markDirty();
      renderEditor();
    }));

    let zoom = 100;
    document.getElementById('previewZoomOut').addEventListener('click', () => setPreviewZoom(Math.max(70, zoom -= 10)));
    document.getElementById('previewZoomIn').addEventListener('click', () => setPreviewZoom(Math.min(130, zoom += 10)));
    document.getElementById('previewFullscreen').addEventListener('click', openPrintPreview);
    function setPreviewZoom(value) {
      zoom = value;
      const preview = document.getElementById('liveInvoicePreview');
      preview.style.transform = `scale(${zoom / 100})`;
      preview.style.marginBottom = `${(zoom - 100) * 7.8}px`;
      document.getElementById('previewZoomLabel').textContent = `${zoom}%`;
    }
  }

  function handleFieldChange(event) {
    const invoice = currentInvoice();
    const input = event.currentTarget;
    const path = input.dataset.field;
    if (!path || path === 'saveClientProfile') return;
    let value = input.type === 'checkbox' ? input.checked : input.value;
    if (input.type === 'number') value = number(value, 0);
    if (path === 'settings.taxEnabled') value = value === true || value === 'true';
    setPath(invoice, path, value);

    if (path === 'clientId') {
      const client = state.clients.find((item) => item.id === value);
      if (client) {
        invoice.client = structuredClone(client);
        invoice.settings.paymentTerms = client.paymentTerms || 'Net 14';
        invoice.settings.taxEnabled = !client.taxExempt;
        if (invoice.shipSameAsBill) syncShipTo(invoice);
      }
      renderEditor();
      markDirty();
      return;
    }
    if (path.startsWith('client.') && invoice.shipSameAsBill) {
      syncShipTo(invoice);
      updateShipToInputs(invoice);
    }
    if (path === 'shipSameAsBill' && value) syncShipTo(invoice);
    if (path === 'invoiceDate' || path === 'settings.paymentTerms') {
      calculateDueDate(invoice);
      const dueInput = document.querySelector('[data-field="dueDate"]');
      if (dueInput) dueInput.value = invoice.dueDate;
    }
    if (path === 'finalized' && value) invoice.status = invoice.status === 'Draft' ? 'Approved' : invoice.status;

    markDirty();
    if (['shipSameAsBill', 'settings.recurring', 'settings.taxEnabled', 'settings.currency'].includes(path)) {
      renderEditor();
      return;
    }
    refreshEditorDerivedValues();
  }

  function handleLineChange(event) {
    const invoice = currentInvoice();
    const input = event.currentTarget;
    const index = Number(input.dataset.lineIndex);
    const field = input.dataset.lineField;
    let value = input.value;
    if (['rate', 'quantity', 'taxRate', 'discount'].includes(field)) value = number(value, 0);
    invoice.lineItems[index][field] = value;
    markDirty();
    refreshEditorDerivedValues();
  }

  function handleCustomFieldChange(event) {
    const input = event.currentTarget;
    currentInvoice().customFields[Number(input.dataset.customIndex)][input.dataset.customField] = input.value;
    markDirty();
    refreshPreviewOnly();
  }

  function handlePaymentMethodChange(event) {
    const method = event.currentTarget.dataset.paymentMethod;
    const invoice = currentInvoice();
    if (event.currentTarget.checked && !invoice.paymentMethods.includes(method)) invoice.paymentMethods.push(method);
    if (!event.currentTarget.checked) invoice.paymentMethods = invoice.paymentMethods.filter((item) => item !== method);
    markDirty();
  }

  function handleDbaTitleChange(event) {
    const invoice = currentInvoice();
    const key = event.currentTarget.dataset.dbaTitle;
    invoice.issuer.dbaTitles = Array.isArray(invoice.issuer.dbaTitles) ? invoice.issuer.dbaTitles : [];
    if (event.currentTarget.checked && !invoice.issuer.dbaTitles.includes(key)) invoice.issuer.dbaTitles.push(key);
    if (!event.currentTarget.checked) invoice.issuer.dbaTitles = invoice.issuer.dbaTitles.filter((item) => item !== key);
    markDirty();
    refreshPreviewOnly();
  }

  function syncShipTo(invoice) {
    invoice.shipTo.name = invoice.client.organization;
    invoice.shipTo.address = invoice.client.serviceAddress || invoice.client.billingAddress;
  }


  function updateShipToInputs(invoice) {
    const nameInput = document.querySelector('[data-field="shipTo.name"]');
    const addressInput = document.querySelector('[data-field="shipTo.address"]');
    if (nameInput) nameInput.value = invoice.shipTo.name;
    if (addressInput) addressInput.value = invoice.shipTo.address;
  }

  function calculateDueDate(invoice) {
    const match = String(invoice.settings.paymentTerms || '').match(/Net\s+(\d+)/i);
    if (!match || !invoice.invoiceDate) return;
    const date = new Date(`${invoice.invoiceDate}T12:00:00`);
    date.setDate(date.getDate() + Number(match[1]));
    invoice.dueDate = toISODate(date);
  }

  function refreshEditorDerivedValues() {
    const invoice = currentInvoice();
    invoice.lineItems.forEach((item, index) => {
      const cell = document.querySelector(`[data-line-amount="${index}"]`);
      if (cell) cell.textContent = formatMoney(lineTotal(item), invoice.settings.currency);
    });
    const totals = document.getElementById('editorTotalsSummary');
    if (totals) totals.outerHTML = renderTotalsSummaryOnly(invoice);
    refreshPreviewOnly();
  }

  function renderTotalsSummaryOnly(invoice) {
    const totals = calculateTotals(invoice);
    return `<div id="editorTotalsSummary">
      <div class="total-row"><span>Sub-total</span><span>${formatMoney(totals.subtotal, invoice.settings.currency)}</span></div>
      <div class="total-row"><span>Discount</span><span>-${formatMoney(totals.invoiceDiscount + totals.lineDiscounts, invoice.settings.currency)}</span></div>
      <div class="total-row"><span>Tax</span><span>${formatMoney(totals.tax, invoice.settings.currency)}</span></div>
      <div class="total-row"><span>Fees</span><span>${formatMoney(totals.fees, invoice.settings.currency)}</span></div>
      <div class="total-row"><strong>Total</strong><strong>${formatMoney(totals.total, invoice.settings.currency)}</strong></div>
      <div class="total-row"><span>Deposit / Payment</span><span>-${formatMoney(totals.appliedPayments, invoice.settings.currency)}</span></div>
      <div class="total-row balance"><span>Balance Due</span><span>${formatMoney(totals.balanceDue, invoice.settings.currency)}</span></div>
      ${invoice.settings.currency !== 'USD' ? `<div class="total-row"><span>USD Equivalent</span><strong>${formatMoney(totals.balanceDue * number(invoice.settings.exchangeRateToUSD, 1), 'USD')}</strong></div>` : ''}
    </div>`;
  }

  function refreshPreviewOnly() {
    const preview = document.getElementById('liveInvoicePreview');
    if (preview) preview.innerHTML = renderInvoiceDocument(currentInvoice());
  }

  function addLineItem() {
    currentInvoice().lineItems.push(blankLineItem());
    markDirty();
    renderEditor();
  }

  function removeLineItem(index) {
    const invoice = currentInvoice();
    if (invoice.lineItems.length === 1) {
      toast('An invoice must contain at least one line item.', 'error');
      return;
    }
    invoice.lineItems.splice(index, 1);
    markDirty();
    renderEditor();
  }

  function importFromServiceCatalog() {
    const invoice = currentInvoice();
    const service = state.services[0];
    if (!service) {
      toast('Add a service to the catalog first.', 'info');
      return;
    }
    invoice.lineItems.push({
      ...blankLineItem(),
      description: service.description || service.name,
      unit: service.unit || 'Each',
      rate: service.defaultRate || 0,
      taxRate: service.taxable ? number(invoice.settings.taxRate, 0) : 0
    });
    markDirty();
    renderEditor();
    toast(`${service.name} added from the service catalog.`, 'success');
  }

  function switchTab(tab) {
    state.currentTab = tab;
    document.querySelectorAll('.tab').forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
    document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.dataset.tabPanel === tab));
  }

  function handleAttachmentSelection(event) {
    const invoice = currentInvoice();
    const files = Array.from(event.target.files || []);
    files.forEach((file) => invoice.attachments.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `attachment-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      addedAt: new Date().toISOString()
    }));
    event.target.value = '';
    markDirty();
    renderEditor();
    if (files.length) toast(`${files.length} attachment${files.length === 1 ? '' : 's'} added.`, 'success');
  }

  function removeAttachment(index) {
    currentInvoice().attachments.splice(index, 1);
    markDirty();
    renderEditor();
  }

  function markDirty() {
    state.dirty = true;
    clearTimeout(state.autosaveTimer);
    const status = document.getElementById('autosaveStatus');
    if (status) status.textContent = '● Saving draft…';
    state.autosaveTimer = setTimeout(() => {
      saveToVault({ silent: true, autosave: true });
    }, 700);
  }

  function saveToVault(options = {}) {
    const invoice = currentInvoice();
    if (!invoice) return false;
    invoice.updatedAt = new Date().toISOString();
    if (invoice.finalized && invoice.status === 'Draft') invoice.status = 'Approved';
    persistInvoices();
    const saveClient = document.querySelector('[data-field="saveClientProfile"]');
    if (saveClient?.checked && invoice.client.organization) upsertClient(invoice.client);
    state.dirty = false;
    const status = document.getElementById('autosaveStatus');
    if (status) status.textContent = `✓ ${options.autosave ? 'Auto-saved' : 'Saved to Vault / Safe'}: ${formatTime(invoice.updatedAt)}`;
    if (!options.silent) {
      logActivity('Saved invoice to The Vault / Safe', invoice.invoiceNumber);
      toast(`${invoice.invoiceNumber} saved to The Vault / Safe.`, 'success');
    }
    return true;
  }

  async function saveToComputer(options = {}) {
    const invoice = currentInvoice();
    if (!invoice) return false;
    try {
      await downloadInvoicePDF(invoice, invoice.paperSize || 'letter');
      if (!options.silent) {
        logActivity('Saved invoice to computer', invoice.invoiceNumber);
        toast(`${invoice.invoiceNumber} saved to your computer.`, 'success');
      }
      return true;
    } catch (error) {
      console.error(error);
      toast('The invoice could not be saved to the computer. Please retry.', 'error');
      return false;
    }
  }

  async function saveInvoiceBoth() {
    if (!validateInvoice(currentInvoice())) return;
    const vaultSaved = saveToVault({ silent: true });
    const computerSaved = await saveToComputer({ silent: true });
    if (vaultSaved && computerSaved) {
      logActivity('Saved invoice to computer and The Vault / Safe', currentInvoice().invoiceNumber);
      toast('Saved to Computer and The Vault / Safe.', 'success');
    } else if (vaultSaved) {
      toast('Saved to The Vault / Safe, but the computer download failed.', 'error');
    } else if (computerSaved) {
      toast('Saved to the computer, but the Vault / Safe save failed.', 'error');
    }
  }

  function validateInvoice(invoice) {
    const required = [
      ['Client organization', invoice.client.organization], ['Client contact', invoice.client.contact],
      ['Client email', invoice.client.email], ['Invoice date', invoice.invoiceDate], ['Due date', invoice.dueDate],
      ['Event', invoice.event], ['Mail To name', invoice.mailTo.name], ['Mailing address', invoice.mailTo.mailingAddress], ['Mail To city', invoice.mailTo.city], ['Mail To state', invoice.mailTo.state], ['Mail To zip', invoice.mailTo.zip]
    ];
    const missing = required.filter(([, value]) => !String(value || '').trim()).map(([label]) => label);
    const hasLine = invoice.lineItems.some((item) => item.description.trim() && number(item.quantity, 0) > 0);
    if (!hasLine) missing.push('At least one valid line item');
    if (invoice.paymentLink && !/^https?:\/\//i.test(invoice.paymentLink)) missing.push('Payment Link must begin with http:// or https://');
    if (missing.length) {
      toast(`Complete the required fields: ${missing.join(', ')}.`, 'error');
      return false;
    }
    return true;
  }

  async function openPrintPreview() {
    const invoice = currentInvoice();
    if (!validateInvoice(invoice)) return;
    els.paperSizeSelect.value = invoice.paperSize || 'letter';
    renderPrintPreview(invoice);
    els.printDialog.showModal();
  }

  function renderPrintPreview(invoice) {
    const paperClass = invoice.paperSize === 'a4' ? 'a4' : 'letter';
    els.printPreviewStage.innerHTML = `<div class="invoice-paper ${paperClass}" style="aspect-ratio:${invoice.paperSize === 'a4' ? '210/297' : '8.5/11'}">${renderInvoiceDocument(invoice)}</div>`;
  }

  function renderInvoiceDocument(invoice) {
    const totals = calculateTotals(invoice);
    const displayItems = invoice.lineItems.filter((item) => item.description.trim());
    const header = invoiceHeaderSettings();
    const dbaLines = (invoice.issuer.dbaTitles || []).map((key) => key === 'rtbo'
      ? `DBA ${header.dbaRaisingTheBarLabel || 'Raising The Bar Officiating'}`
      : key === 'gotunexref' ? `DBA ${header.dbaGotUNexRefLabel || 'Got U Nex Ref'}` : '').filter(Boolean);
    const logoSrc = invoice.issuer.headerLogo === 'gotunexref' ? 'assets/approved-got-u-nex-ref-logo.png' : 'assets/approved-rtbo-logo.png';
    const footerAddress = invoice.issuer.address || invoice.mailTo.mailingAddress || '';
    const footerCityLine = [invoice.mailTo.city, invoice.mailTo.state, invoice.mailTo.zip].filter(Boolean).join(' ');
    const footerHome = [footerAddress, footerCityLine].filter(Boolean).join(footerAddress && footerCityLine ? '. ' : '');
    return `<div class="invoice-doc invoice-template-document">
      <header class="invoice-template-header">
        <div class="invoice-template-brand-copy">
          <h2>${escapeHTML(invoice.issuer.headerTitle || header.title || 'Raising The Bar Officiating')}</h2>
          <div class="invoice-template-slogan">${escapeHTML(invoice.issuer.slogan || header.slogan || 'We Will Serve, And We Will Be Of Service To The Game')}</div>
          ${dbaLines.length ? `<div class="invoice-template-dba">${dbaLines.map((line) => `<span>${escapeHTML(line)}</span>`).join('')}</div>` : ''}
        </div>
        <div class="invoice-template-logo"><img src="${logoSrc}" alt="Raising The Bar Officiating logo" /></div>
        <div class="invoice-template-contact" aria-label="Business contact information">
          <div><span class="contact-icon" aria-hidden="true">☎</span><span>${escapeHTML(invoice.issuer.phone || header.phone)}</span></div>
          <div><span class="contact-icon" aria-hidden="true">✉</span><span>${escapeHTML(invoice.issuer.email || header.email)}</span></div>
          <div><span class="contact-icon" aria-hidden="true">◎</span><span>${escapeHTML(invoice.issuer.website || header.website)}</span></div>
        </div>
      </header>

      <div class="invoice-template-body">
        <div class="invoice-watermark invoice-template-watermark"></div>

        <section class="invoice-template-info">
          <div class="invoice-template-left-details">
            <h3>Bill To:</h3>
            <p><strong>${escapeHTML(invoice.client.organization)}</strong><br>
              ${invoice.client.contact ? `Attn: ${escapeHTML(invoice.client.contact)}<br>` : ''}
              ${invoice.client.email ? `Email: ${escapeHTML(invoice.client.email)}<br>` : ''}
              ${invoice.client.phone ? `Phone: ${escapeHTML(invoice.client.phone)}<br>` : ''}
              ${nl2br(invoice.client.billingAddress)}</p>
            <h3>Ship To:</h3>
            <p><strong>${escapeHTML(invoice.shipTo.name || invoice.client.organization)}</strong><br>${nl2br(invoice.shipTo.address || invoice.client.serviceAddress || invoice.client.billingAddress)}</p>
          </div>

          <div class="invoice-template-right-details">
            <dl class="invoice-template-detail-list">
              <dt>Invoice #:</dt><dd>${escapeHTML(invoice.invoiceNumber)}</dd>
              <dt>Invoice Date:</dt><dd>${formatDate(invoice.invoiceDate)}</dd>
              <dt>Reference #:</dt><dd>${escapeHTML(invoice.referenceNumber || '—')}</dd>
              <dt>Due Date:</dt><dd>${formatDate(invoice.dueDate)}</dd>
              <dt>Event:</dt><dd>${escapeHTML(invoice.event)}</dd>
              <dt>Game Level:</dt><dd>${escapeHTML(invoice.gameLevel)}</dd>
              ${invoice.purchaseOrderNumber ? `<dt>PO #:</dt><dd>${escapeHTML(invoice.purchaseOrderNumber)}</dd>` : ''}
              ${invoice.eventLocation ? `<dt>Location:</dt><dd>${escapeHTML(invoice.eventLocation)}</dd>` : ''}
              ${invoice.customFields.filter((field) => field.label).map((field) => `<dt>${escapeHTML(field.label)}:</dt><dd>${escapeHTML(field.value)}</dd>`).join('')}
            </dl>
            <div class="invoice-template-mailto">
              <h3>Mail To:</h3>
              <p>${escapeHTML(invoice.mailTo.name)}<br>${escapeHTML(invoice.mailTo.mailingAddress)}<br>${escapeHTML(invoice.mailTo.city)}, ${escapeHTML(invoice.mailTo.state)} ${escapeHTML(invoice.mailTo.zip)}</p>
            </div>
          </div>
        </section>

        <table class="invoice-template-table">
          <thead><tr><th>Description</th><th>Price</th><th>Quantity</th><th>Amount</th></tr></thead>
          <tbody>${displayItems.map((item) => `<tr><td><strong>${escapeHTML(item.description)}</strong></td><td>${formatMoney(number(item.rate), invoice.settings.currency)}</td><td>${number(item.quantity)}</td><td>${formatMoney(lineTotal(item), invoice.settings.currency)}</td></tr>`).join('')}</tbody>
        </table>

        <section class="invoice-template-totals">
          <div class="invoice-template-total-row"><span>Sub-total</span><span>${formatMoney(totals.subtotal, invoice.settings.currency)}</span></div>
          ${totals.lineDiscounts + totals.invoiceDiscount > 0 ? `<div class="invoice-template-total-row"><span>Discount</span><span>-${formatMoney(totals.lineDiscounts + totals.invoiceDiscount, invoice.settings.currency)}</span></div>` : ''}
          ${totals.tax > 0 ? `<div class="invoice-template-total-row"><span>${escapeHTML(invoice.settings.taxLabel || 'Tax')}</span><span>${formatMoney(totals.tax, invoice.settings.currency)}</span></div>` : ''}
          ${totals.fees > 0 ? `<div class="invoice-template-total-row"><span>Fees</span><span>${formatMoney(totals.fees, invoice.settings.currency)}</span></div>` : ''}
          <div class="invoice-template-total-row total"><span>Total</span><span>${formatMoney(totals.total, invoice.settings.currency)}</span></div>
          ${totals.appliedPayments > 0 ? `<div class="invoice-template-total-row"><span>Deposit / Payments</span><span>-${formatMoney(totals.appliedPayments, invoice.settings.currency)}</span></div><div class="invoice-template-total-row balance"><span>Balance Due</span><span>${formatMoney(totals.balanceDue, invoice.settings.currency)}</span></div>` : ''}
        </section>

        <footer class="invoice-template-footer">
          <div class="invoice-template-terms">
            <h4>Terms &amp; Conditions</h4>
            <p>${nl2br(invoice.terms)}</p>
            ${invoice.paymentLink ? `<p class="invoice-template-payment"><strong>Pay Online:</strong> <a href="${escapeAttr(invoice.paymentLink)}" target="_blank" rel="noopener noreferrer">${escapeHTML(invoice.paymentLink)}</a></p>` : ''}
          </div>
          <div class="invoice-template-thankyou">
            <div>${escapeHTML(invoice.issuer.slogan || header.slogan)}</div>
            <div>${escapeHTML(invoice.clientNotes || 'Thank you for your trust!')}</div>
          </div>
          ${dbaLines.length ? `<div class="invoice-template-footer-dba">${dbaLines.map((line) => `<span>${escapeHTML(line)}</span>`).join('')}</div>` : ''}
          <div class="invoice-template-footer-contact">
            ${footerHome ? `<div><strong>Home:</strong> ${escapeHTML(footerHome)}</div>` : ''}
            <div><strong>Phone:</strong> ${escapeHTML(invoice.issuer.phone || header.phone)}</div>
            <div><strong>Email:</strong> ${escapeHTML(invoice.issuer.email || header.email)}</div>
            <div><strong>Website:</strong> ${escapeHTML(invoice.issuer.website || header.website)}</div>
          </div>
        </footer>
      </div>
      <div class="invoice-page-number">1/1</div>
    </div>`;
  }

  function lineTotal(item) {
    return Math.max(0, number(item.rate) * number(item.quantity) - number(item.discount));
  }

  function calculateTotals(invoice) {
    let subtotal = 0;
    let lineDiscounts = 0;
    let tax = 0;
    invoice.lineItems.forEach((item) => {
      const raw = number(item.rate) * number(item.quantity);
      const discount = Math.max(0, number(item.discount));
      const net = Math.max(0, raw - discount);
      subtotal += raw;
      lineDiscounts += discount;
      if (invoice.settings.taxEnabled) tax += net * number(item.taxRate || invoice.settings.taxRate) / 100;
    });
    const taxableAfterLineDiscounts = Math.max(0, subtotal - lineDiscounts);
    const invoiceDiscount = invoice.adjustments.invoiceDiscountType === 'percent'
      ? taxableAfterLineDiscounts * number(invoice.adjustments.invoiceDiscountValue) / 100
      : number(invoice.adjustments.invoiceDiscountValue);
    const serviceFee = number(invoice.adjustments.serviceFee);
    const travelFee = number(invoice.adjustments.travelFee);
    const otherFee = number(invoice.adjustments.otherFee);
    const baseBeforeProcessing = Math.max(0, subtotal - lineDiscounts - invoiceDiscount + tax + serviceFee + travelFee + otherFee);
    const processingFee = baseBeforeProcessing * number(invoice.adjustments.processingFeeRate) / 100;
    const fees = serviceFee + processingFee + travelFee + otherFee;
    const total = Math.max(0, subtotal - lineDiscounts - invoiceDiscount + tax + fees);
    const appliedPayments = number(invoice.adjustments.deposit) + number(invoice.adjustments.previousPayment);
    const balanceDue = Math.max(0, total - appliedPayments);
    return { subtotal, lineDiscounts, invoiceDiscount, tax, serviceFee, processingFee, travelFee, otherFee, fees, total, appliedPayments, balanceDue };
  }

  async function downloadInvoicePDF(invoice, paperSize = 'letter') {
    if (!validateInvoice(invoice)) throw new Error('Invoice validation failed');
    const canvases = await renderInvoiceCanvases(invoice, paperSize);
    const pdfBytes = buildPdfFromCanvases(canvases, paperSize, invoice.paymentLink || '');
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = invoiceFilename(invoice);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function renderInvoiceCanvases(invoice, paperSize) {
    const page = paperSize === 'a4' ? { width: 1240, height: 1754 } : { width: 1275, height: 1650 };
    const itemsPerPage = 10;
    const items = invoice.lineItems.filter((item) => item.description.trim());
    const chunks = [];
    for (let i = 0; i < Math.max(items.length, 1); i += itemsPerPage) chunks.push(items.slice(i, i + itemsPerPage));
    const [gunrLogo, rtboLogo] = await Promise.all([loadImage('assets/approved-got-u-nex-ref-logo.png'), loadImage('assets/approved-rtbo-logo.png')]);
    return chunks.map((chunk, index) => drawInvoiceCanvas(invoice, chunk, index, chunks.length, page, gunrLogo, rtboLogo));
  }

  function drawInvoiceCanvas(invoice, items, pageIndex, pageCount, page, gunrLogo, rtboLogo) {
    const canvas = document.createElement('canvas');
    canvas.width = page.width;
    canvas.height = page.height;
    const ctx = canvas.getContext('2d');
    const s = page.width / 850;
    const x = (value) => value * s;
    const y = (value) => value * s;
    const maxY = page.height / s;
    const totals = calculateTotals(invoice);
    const darkRed = '#9c1a2c';
    const burntOrange = '#c65f18';
    const header = invoiceHeaderSettings();
    const chosenLogo = invoice.issuer.headerLogo === 'gotunexref' ? gunrLogo : rtboLogo;
    const dbaLines = (invoice.issuer.dbaTitles || []).map((key) => key === 'rtbo'
      ? `DBA ${header.dbaRaisingTheBarLabel || 'Raising The Bar Officiating'}`
      : key === 'gotunexref' ? `DBA ${header.dbaGotUNexRefLabel || 'Got U Nex Ref'}` : '').filter(Boolean);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, page.width, page.height);

    // Black reference-template header with requested three-column branding.
    ctx.fillStyle = '#030303';
    ctx.fillRect(0, 0, page.width, y(168));

    ctx.textAlign = 'left';
    ctx.fillStyle = '#f3f4f3';
    ctx.font = `bold ${x(23)}px Arial`;
    const titleLines = wrapCanvasText(ctx, invoice.issuer.headerTitle || header.title || 'Raising The Bar Officiating', x(278));
    titleLines.slice(0,2).forEach((line,i)=>ctx.fillText(line,x(46),y(54+i*27)));

    ctx.fillStyle = burntOrange;
    ctx.font = `bold ${x(14)}px Arial`;
    const sloganLines = wrapCanvasText(ctx, invoice.issuer.slogan || header.slogan || 'We Will Serve, And We Will Be Of Service To The Game', x(285));
    sloganLines.slice(0,2).forEach((line,i)=>ctx.fillText(line,x(46),y(98+i*17)));

    if (dbaLines.length) {
      ctx.fillStyle = '#d9dcda';
      ctx.font = `bold ${x(10)}px Arial`;
      dbaLines.slice(0,2).forEach((line,i)=>ctx.fillText(line,x(46),y(137+i*13)));
    }

    const logoSize = 112;
    ctx.drawImage(chosenLogo, x(369), y(27), x(logoSize), y(logoSize));

    ctx.fillStyle = '#f3f4f3';
    ctx.textAlign = 'center';
    ctx.font = `bold ${x(10)}px Arial`;
    const contactCenterX = 690;
    drawPhoneIcon(ctx, x(574), y(57), x(10));
    ctx.fillText(invoice.issuer.phone || header.phone, x(contactCenterX), y(60));
    drawEmailIcon(ctx, x(574), y(84), x(10));
    ctx.fillText(invoice.issuer.email || header.email, x(contactCenterX), y(87));
    drawGlobeIcon(ctx, x(574), y(111), x(10));
    ctx.fillText(invoice.issuer.website || header.website, x(contactCenterX), y(114));
    ctx.textAlign = 'left';

    // Large centered faded watermark sized to match the provided reference invoice template.
    ctx.save();
    ctx.globalAlpha = invoice.printFriendly ? 0.035 : 0.075;
    ctx.drawImage(rtboLogo, x(210), y(338), x(430), y(430));
    ctx.restore();

    // Bill/Ship left column.
    ctx.fillStyle = '#111111';
    ctx.font = `bold ${x(14)}px Arial`;
    ctx.fillText('Bill To:', x(58), y(205));
    ctx.font = `${x(11)}px Arial`;
    let leftY = 226;
    const billLines = [
      invoice.client.organization,
      invoice.client.contact ? `Attn: ${invoice.client.contact}` : '',
      invoice.client.email ? `Email: ${invoice.client.email}` : '',
      invoice.client.phone ? `Phone: ${invoice.client.phone}` : '',
      ...String(invoice.client.billingAddress || '').split('\n')
    ].filter(Boolean);
    billLines.forEach((line)=>{wrapCanvasText(ctx,line,x(330)).forEach(part=>{ctx.fillText(part,x(58),y(leftY));leftY+=15;});});
    leftY += 10;
    ctx.font = `bold ${x(14)}px Arial`;
    ctx.fillText('Ship To:', x(58), y(leftY)); leftY += 21;
    ctx.font = `${x(11)}px Arial`;
    [invoice.shipTo.name || invoice.client.organization, ...String(invoice.shipTo.address || invoice.client.serviceAddress || invoice.client.billingAddress || '').split('\n')]
      .filter(Boolean).forEach((line)=>{wrapCanvasText(ctx,line,x(330)).forEach(part=>{ctx.fillText(part,x(58),y(leftY));leftY+=15;});});

    // Invoice details and Mail To right column.
    const labelX = 520;
    const valueX = 548;
    let detailY = 205;
    const detailRows = [
      ['Invoice #:', invoice.invoiceNumber],
      ['Invoice Date:', formatDate(invoice.invoiceDate)],
      ['Reference #:', invoice.referenceNumber || '—'],
      ['Due Date:', formatDate(invoice.dueDate)],
      ['Event:', invoice.event],
      ['Game Level:', invoice.gameLevel]
    ];
    if (invoice.purchaseOrderNumber) detailRows.splice(4,0,['PO #:',invoice.purchaseOrderNumber]);
    detailRows.forEach(([label,value])=>{
      ctx.textAlign='right';ctx.font=`bold ${x(12)}px Arial`;ctx.fillText(label,x(labelX),y(detailY));
      ctx.textAlign='left';ctx.font=`${x(12)}px Arial`;
      const lines=wrapCanvasText(ctx,String(value||''),x(245));
      (lines.length ? lines : ['']).forEach((line,i)=>ctx.fillText(line,x(valueX),y(detailY+i*15)));
      detailY += Math.max(18,lines.length*15);
    });
    detailY += 12;
    ctx.textAlign='right';ctx.font=`bold ${x(13)}px Arial`;ctx.fillText('Mail To:',x(labelX),y(detailY));
    ctx.textAlign='left';ctx.font=`${x(12)}px Arial`;
    const mailLines=[invoice.mailTo.name,invoice.mailTo.mailingAddress,[invoice.mailTo.city,invoice.mailTo.state,invoice.mailTo.zip].filter(Boolean).join(' ')].filter(Boolean);
    mailLines.forEach((line,i)=>ctx.fillText(line,x(valueX),y(detailY+i*16)));
    ctx.textAlign='left';

    // Maroon reference-template line item header.
    const tableY = 355;
    ctx.fillStyle = darkRed;
    ctx.fillRect(x(54), y(tableY), x(742), y(32));
    ctx.fillStyle = '#050505';
    ctx.font = `bold ${x(12)}px Arial`;
    ctx.fillText('Description', x(64), y(tableY + 21));
    ctx.textAlign='center'; ctx.fillText('Price', x(568), y(tableY + 21));
    ctx.fillText('Quantity', x(665), y(tableY + 21));
    ctx.textAlign='right'; ctx.fillText('Amount', x(785), y(tableY + 21));
    ctx.textAlign='left';

    let rowY = tableY + 62;
    ctx.fillStyle='#111';
    items.forEach((item)=>{
      ctx.font=`bold ${x(12)}px Arial`; ctx.fillText(item.description,x(64),y(rowY));
      ctx.font=`${x(12)}px Arial`; ctx.textAlign='center';ctx.fillText(formatMoney(number(item.rate),invoice.settings.currency),x(568),y(rowY));
      ctx.fillText(String(number(item.quantity)),x(665),y(rowY));
      ctx.textAlign='right';ctx.fillText(formatMoney(lineTotal(item),invoice.settings.currency),x(785),y(rowY));
      ctx.textAlign='left';rowY+=28;
    });

    if (pageIndex === pageCount - 1) {
      // Reference-template totals positioned to the lower right.
      let sumY = Math.max(690, rowY + 220);
      const totalLabelX = 660, totalAmountX = 785;
      ctx.font=`${x(11)}px Arial`;ctx.textAlign='left';ctx.fillText('Sub-total',x(575),y(sumY));
      ctx.textAlign='right';ctx.fillText(formatMoney(totals.subtotal,invoice.settings.currency),x(totalAmountX),y(sumY));
      sumY += 30;
      ctx.strokeStyle='#111';ctx.lineWidth=x(.8);ctx.beginPath();ctx.moveTo(x(565),y(sumY));ctx.lineTo(x(795),y(sumY));ctx.stroke();
      sumY += 28;
      ctx.font=`bold ${x(11)}px Arial`;ctx.textAlign='right';ctx.fillText('Total',x(totalLabelX),y(sumY));ctx.fillText(formatMoney(totals.total,invoice.settings.currency),x(totalAmountX),y(sumY));
      if (totals.appliedPayments > 0) {
        sumY += 24;ctx.font=`${x(10)}px Arial`;ctx.fillText('Payments',x(totalLabelX),y(sumY));ctx.fillText(`-${formatMoney(totals.appliedPayments,invoice.settings.currency)}`,x(totalAmountX),y(sumY));
        sumY += 22;ctx.font=`bold ${x(11)}px Arial`;ctx.fillText('Balance Due',x(totalLabelX),y(sumY));ctx.fillText(formatMoney(totals.balanceDue,invoice.settings.currency),x(totalAmountX),y(sumY));
      }
      ctx.textAlign='left';

      const footerY = Math.min(maxY - 225, Math.max(sumY + 62, 875));
      ctx.font=`bold ${x(13)}px Arial`;ctx.fillText('Terms & Conditions',x(54),y(footerY));
      ctx.font=`${x(11)}px Arial`;
      const termLines=wrapCanvasText(ctx,String(invoice.terms||'').replace(/\n/g,' '),x(500));
      termLines.slice(0,4).forEach((line,i)=>ctx.fillText(line,x(54),y(footerY+20+i*15)));
      let paymentOffset=0;
      if (invoice.paymentLink) {
        paymentOffset=18;
        ctx.fillStyle=darkRed;ctx.font=`bold ${x(10)}px Arial`;ctx.fillText('Pay Online:',x(54),y(footerY+84));
        ctx.fillStyle='#111';ctx.font=`${x(9)}px Arial`;ctx.fillText(invoice.paymentLink,x(112),y(footerY+84));
      }

      ctx.fillStyle='#111';ctx.textAlign='center';ctx.font=`bold italic ${x(15)}px Georgia`;
      const tagY=footerY+118+paymentOffset;
      const tagLines=wrapCanvasText(ctx,invoice.issuer.slogan||header.slogan,x(600));
      tagLines.slice(0,2).forEach((line,i)=>ctx.fillText(line,x(425),y(tagY+i*18)));
      ctx.fillText(invoice.clientNotes||'Thank you for your trust!',x(425),y(tagY+40));
      if (dbaLines.length) {
        ctx.font=`bold ${x(9)}px Arial`;
        dbaLines.slice(0,2).forEach((line,i)=>ctx.fillText(line,x(425),y(tagY+58+i*13)));
      }

      ctx.textAlign='left';ctx.font=`bold ${x(9)}px Arial`;
      const footerAddress=invoice.issuer.address||invoice.mailTo.mailingAddress||'';
      const footerCity=[invoice.mailTo.city,invoice.mailTo.state,invoice.mailTo.zip].filter(Boolean).join(' ');
      const home=[footerAddress,footerCity].filter(Boolean).join(footerAddress&&footerCity?'. ':'');
      let contactY=maxY-72;
      if(home){ctx.fillText(`Home: ${home}`,x(70),y(contactY));contactY+=13;}
      ctx.fillText(`Phone: ${invoice.issuer.phone||header.phone}`,x(70),y(contactY));contactY+=13;
      ctx.fillText(`Email: ${invoice.issuer.email||header.email}`,x(70),y(contactY));contactY+=13;
      ctx.fillText(`Website: ${invoice.issuer.website||header.website}`,x(70),y(contactY));
    } else {
      ctx.fillStyle='#111';ctx.font=`italic ${x(11)}px Arial`;ctx.fillText('Invoice line items continued on the next page.',x(54),y(rowY+30));
    }

    ctx.fillStyle='#111';ctx.font=`bold ${x(9)}px Arial`;ctx.textAlign='right';ctx.fillText(`${pageIndex+1}/${pageCount}`,x(790),page.height-y(28));ctx.textAlign='left';
    return canvas;
  }

  function drawPhoneIcon(ctx, cx, cy, size) {
    ctx.save(); ctx.strokeStyle='#f4f5f3'; ctx.lineWidth=Math.max(1,size*.12); ctx.lineCap='round';
    ctx.beginPath(); ctx.arc(cx-size*.12,cy-size*.12,size*.34,.55,2.55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-size*.42,cy-size*.38); ctx.lineTo(cx-size*.58,cy-size*.54); ctx.lineTo(cx-size*.45,cy-size*.68); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+size*.18,cy+size*.18); ctx.lineTo(cx+size*.38,cy+size*.42); ctx.lineTo(cx+size*.55,cy+size*.25); ctx.stroke();
    ctx.restore();
  }

  function drawEmailIcon(ctx, cx, cy, size) {
    ctx.save(); ctx.strokeStyle='#f4f5f3'; ctx.lineWidth=Math.max(1,size*.11);
    ctx.strokeRect(cx-size*.55,cy-size*.38,size*1.1,size*.76);
    ctx.beginPath(); ctx.moveTo(cx-size*.5,cy-size*.3); ctx.lineTo(cx,cy+size*.05); ctx.lineTo(cx+size*.5,cy-size*.3); ctx.stroke();
    ctx.restore();
  }

  function drawGlobeIcon(ctx, cx, cy, size) {
    ctx.save(); ctx.strokeStyle='#f4f5f3'; ctx.lineWidth=Math.max(1,size*.1);
    ctx.beginPath(); ctx.arc(cx,cy,size*.48,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx,cy,size*.22,size*.48,0,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-size*.44,cy); ctx.lineTo(cx+size*.44,cy); ctx.stroke();
    ctx.restore();
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = '';
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function buildPdfFromCanvases(canvases, paperSize, paymentLink = '') {
    const media = paperSize === 'a4' ? { width: 595.28, height: 841.89 } : { width: 612, height: 792 };
    const pageCount = canvases.length;
    const hasPaymentLink = /^https?:\/\//i.test(paymentLink);
    const annotationId = 3 + pageCount * 3;
    const objectCount = 2 + pageCount * 3 + (hasPaymentLink ? 1 : 0);
    const builder = new ByteBuilder();
    const offsets = new Array(objectCount + 1).fill(0);
    builder.writeString('%PDF-1.4\n%RTBO\n');

    offsets[1] = builder.length;
    builder.writeString('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    const kids = canvases.map((_, index) => `${3 + index * 3} 0 R`).join(' ');
    offsets[2] = builder.length;
    builder.writeString(`2 0 obj\n<< /Type /Pages /Count ${pageCount} /Kids [${kids}] >>\nendobj\n`);

    canvases.forEach((canvas, index) => {
      const pageId = 3 + index * 3;
      const contentId = pageId + 1;
      const imageId = pageId + 2;
      const jpegBytes = dataUrlToBytes(canvas.toDataURL('image/jpeg', 0.92));
      const content = `q\n${media.width} 0 0 ${media.height} 0 0 cm\n/Im0 Do\nQ\n`;

      offsets[pageId] = builder.length;
      const annots = hasPaymentLink && index === pageCount - 1 ? ` /Annots [${annotationId} 0 R]` : '';
      builder.writeString(`${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${media.width} ${media.height}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R${annots} >>\nendobj\n`);

      offsets[contentId] = builder.length;
      builder.writeString(`${contentId} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);

      offsets[imageId] = builder.length;
      builder.writeString(`${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
      builder.writeBytes(jpegBytes);
      builder.writeString('\nendstream\nendobj\n');
    });

    if (hasPaymentLink) {
      offsets[annotationId] = builder.length;
      const safeUrl = String(paymentLink).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      builder.writeString(`${annotationId} 0 obj
<< /Type /Annot /Subtype /Link /Rect [38 34 205 61] /Border [0 0 0] /A << /S /URI /URI (${safeUrl}) >> >>
endobj
`);
    }

    const xrefOffset = builder.length;
    builder.writeString(`xref\n0 ${objectCount + 1}\n`);
    builder.writeString('0000000000 65535 f \n');
    for (let id = 1; id <= objectCount; id += 1) builder.writeString(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
    builder.writeString(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
    return builder.toUint8Array();
  }

  class ByteBuilder {
    constructor() { this.chunks = []; this.length = 0; }
    writeString(value) { this.writeBytes(new TextEncoder().encode(value)); }
    writeBytes(bytes) { this.chunks.push(bytes); this.length += bytes.length; }
    toUint8Array() {
      const output = new Uint8Array(this.length);
      let offset = 0;
      this.chunks.forEach((chunk) => { output.set(chunk, offset); offset += chunk.length; });
      return output;
    }
  }

  function dataUrlToBytes(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function invoiceFilename(invoice) {
    const event = slugify(invoice.event || invoice.client.organization || 'Invoice');
    return `${invoice.invoiceNumber}-${event}.pdf`;
  }

  function sendInvoice(mode) {
    const invoice = currentInvoice();
    if (!validateInvoice(invoice)) return;
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from Raising The Bar Officiating`);
    const paymentLine = invoice.paymentLink ? `\n\nPay securely online: ${invoice.paymentLink}` : '';
    const body = encodeURIComponent(`Hello ${invoice.client.contact}\n\nPlease find invoice ${invoice.invoiceNumber} for ${invoice.event}. The balance due is ${formatMoney(calculateTotals(invoice).balanceDue, invoice.settings.currency)} by ${formatDate(invoice.dueDate)}.${paymentLine}\n\nThank you,\nRaising The Bar Officiating Inc.`);
    if (mode === 'email') {
      window.location.href = `mailto:${encodeURIComponent(invoice.client.email)}?subject=${subject}&body=${body}`;
      invoice.status = 'Sent';
      saveToVault({ silent: true });
      logActivity('Prepared invoice email', invoice.invoiceNumber);
      toast('Your email application has been opened. Attach the downloaded PDF before sending.', 'info');
    } else if (mode === 'sms') {
      window.location.href = `sms:${invoice.client.phone.replace(/[^\d+]/g, '')}?body=${body}`;
    } else if (navigator.share) {
      navigator.share({ title: `Invoice ${invoice.invoiceNumber}`, text: decodeURIComponent(body) }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(decodeURIComponent(body));
      toast('Invoice message copied to the clipboard.', 'success');
    }
  }

  async function deleteCurrentInvoice() {
    const invoice = currentInvoice();
    const confirmed = await confirmAction('Delete invoice?', `${invoice.invoiceNumber} will be moved to Trash and can be restored later.`, 'Move to Trash');
    if (!confirmed) return;
    invoice.deletedAt = new Date().toISOString();
    invoice.status = 'Canceled';
    persistInvoices();
    logActivity('Moved invoice to Trash', invoice.invoiceNumber);
    state.currentInvoiceId = state.invoices.find((item) => !item.deletedAt)?.id || null;
    localStorage.setItem(STORAGE.current, state.currentInvoiceId || '');
    state.dirty = false;
    route('invoices');
    toast(`${invoice.invoiceNumber} moved to Trash.`, 'success');
  }

  async function confirmUnsavedThen(action) {
    if (!state.dirty) return action();
    const confirmed = await confirmAction('Unsaved changes', 'Create a new invoice without saving the current changes?', 'Continue');
    if (confirmed) action();
  }

  function confirmAction(title, message, confirmLabel = 'Confirm') {
    return new Promise((resolve) => {
      els.confirmTitle.textContent = title;
      els.confirmMessage.textContent = message;
      els.confirmActionButton.textContent = confirmLabel;
      els.confirmDialog.showModal();
      els.confirmDialog.addEventListener('close', () => resolve(els.confirmDialog.returnValue === 'confirm'), { once: true });
    });
  }

  function renderDashboard() {
    const active = state.invoices.filter((invoice) => !invoice.deletedAt);
    const totals = active.reduce((acc, invoice) => {
      const t = calculateTotals(invoice);
      acc.invoiced += t.total;
      acc.outstanding += invoice.status === 'Paid' ? 0 : t.balanceDue;
      acc.paid += invoice.status === 'Paid' ? t.total : number(invoice.adjustments.previousPayment) + number(invoice.adjustments.deposit);
      if (isOverdue(invoice)) acc.overdue += t.balanceDue;
      return acc;
    }, { invoiced: 0, outstanding: 0, paid: 0, overdue: 0 });
    els.viewContainer.innerHTML = `<div class="generic-view">
      <div class="page-heading"><div><h2>Invoice Dashboard</h2><p>Financial activity calculated from invoices stored in this prototype.</p></div><button class="button primary" id="dashboardCreate">＋ Create New Invoice</button></div>
      <div class="metric-grid">
        ${metric('Total Invoiced', formatMoney(totals.invoiced, 'USD'))}
        ${metric('Collected', formatMoney(totals.paid, 'USD'))}
        ${metric('Outstanding', formatMoney(totals.outstanding, 'USD'))}
        ${metric('Overdue', formatMoney(totals.overdue, 'USD'))}
      </div>
      ${invoiceTablePanel(active.slice(0, 8), 'Recent Invoices')}
    </div>`;
    document.getElementById('dashboardCreate').addEventListener('click', createNewInvoice);
    bindInvoiceTableActions();
  }

  function metric(label, value) { return `<div class="metric-card"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong></div>`; }

  function renderInvoiceList(filter) {
    let invoices = state.invoices.filter((invoice) => !invoice.deletedAt);
    if (filter === 'draft') invoices = invoices.filter((invoice) => invoice.status === 'Draft');
    els.viewContainer.innerHTML = `<div class="generic-view">
      <div class="page-heading"><div><h2>${filter === 'draft' ? 'Draft Invoices' : 'All Invoices'}</h2><p>Create, search, review, save, print, send, and manage professional invoices.</p></div><button class="button primary" id="listCreate">＋ Create New Invoice</button></div>
      ${invoiceTablePanel(invoices, filter === 'draft' ? 'Draft Invoices' : 'Invoice Register')}
    </div>`;
    document.getElementById('listCreate').addEventListener('click', createNewInvoice);
    bindInvoiceTableActions();
  }

  function invoiceTablePanel(invoices, title) {
    return `<section class="data-panel">
      <div class="data-panel-header"><h3>${escapeHTML(title)}</h3><input class="input search-input" id="invoiceSearch" aria-label="Search invoices" /></div>
      <div id="invoiceTableHolder">${invoiceTable(invoices)}</div>
    </section>`;
  }

  function invoiceTable(invoices) {
    if (!invoices.length) return '<div class="empty-state"><h3>No invoices found</h3><p>Create a new invoice to get started.</p></div>';
    return `<div style="overflow-x:auto"><table class="data-table"><thead><tr><th>Invoice</th><th>Client</th><th>Event</th><th>Due Date</th><th>Status</th><th>Balance</th><th>Actions</th></tr></thead><tbody>
      ${invoices.map((invoice) => `<tr>
        <td><strong>${escapeHTML(invoice.invoiceNumber)}</strong><br><small>${formatDate(invoice.invoiceDate)}</small></td>
        <td>${escapeHTML(invoice.client.organization)}</td>
        <td>${escapeHTML(invoice.event || '—')}</td>
        <td>${formatDate(invoice.dueDate)}</td>
        <td><span class="status-badge ${statusClass(invoice)}">${escapeHTML(displayStatus(invoice))}</span></td>
        <td>${formatMoney(calculateTotals(invoice).balanceDue, invoice.settings.currency)}</td>
        <td><button class="button secondary small" data-open-invoice="${invoice.id}">Open</button> <button class="button secondary small" data-duplicate-invoice="${invoice.id}">Duplicate</button></td>
      </tr>`).join('')}</tbody></table></div>`;
  }

  function bindInvoiceTableActions() {
    const input = document.getElementById('invoiceSearch');
    if (input) input.addEventListener('input', () => {
      const query = input.value.toLowerCase();
      const invoices = state.invoices.filter((invoice) => !invoice.deletedAt && [invoice.invoiceNumber, invoice.client.organization, invoice.event, invoice.status].join(' ').toLowerCase().includes(query));
      document.getElementById('invoiceTableHolder').innerHTML = invoiceTable(invoices);
      bindInvoiceTableActions();
    });
    document.querySelectorAll('[data-open-invoice]').forEach((button) => button.addEventListener('click', () => openInvoice(button.dataset.openInvoice)));
    document.querySelectorAll('[data-duplicate-invoice]').forEach((button) => button.addEventListener('click', () => duplicateInvoice(button.dataset.duplicateInvoice)));
  }

  function openInvoice(id) {
    state.currentInvoiceId = id;
    localStorage.setItem(STORAGE.current, id);
    state.dirty = false;
    route('editor');
  }

  function duplicateInvoice(id) {
    const original = state.invoices.find((invoice) => invoice.id === id);
    if (!original) return;
    const duplicate = structuredClone(original);
    duplicate.id = crypto.randomUUID ? crypto.randomUUID() : `invoice-${Date.now()}`;
    duplicate.invoiceNumber = generateNextInvoiceNumber();
    duplicate.referenceNumber = '';
    duplicate.status = 'Draft';
    duplicate.finalized = false;
    duplicate.createdAt = new Date().toISOString();
    duplicate.updatedAt = duplicate.createdAt;
    duplicate.deletedAt = null;
    state.invoices.unshift(duplicate);
    persistInvoices();
    logActivity('Duplicated invoice', `${original.invoiceNumber} → ${duplicate.invoiceNumber}`);
    openInvoice(duplicate.id);
    toast(`Created duplicate ${duplicate.invoiceNumber}.`, 'success');
  }

  function renderTrash() {
    const invoices = state.invoices.filter((invoice) => invoice.deletedAt);
    els.viewContainer.innerHTML = `<div class="generic-view"><div class="page-heading"><div><h2>Trash</h2><p>Deleted invoices remain recoverable until permanently removed.</p></div></div><section class="data-panel"><div class="data-panel-header"><h3>Deleted Invoices</h3></div>${invoices.length ? `<div style="overflow-x:auto"><table class="data-table"><thead><tr><th>Invoice</th><th>Client</th><th>Deleted</th><th>Actions</th></tr></thead><tbody>${invoices.map((invoice) => `<tr><td>${invoice.invoiceNumber}</td><td>${escapeHTML(invoice.client.organization)}</td><td>${formatDateTime(invoice.deletedAt)}</td><td><button class="button secondary small" data-restore="${invoice.id}">Restore</button> <button class="button danger small" data-permanent-delete="${invoice.id}">Delete Permanently</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty-state"><h3>Trash is empty</h3></div>'}</section></div>`;
    document.querySelectorAll('[data-restore]').forEach((button) => button.addEventListener('click', () => restoreInvoice(button.dataset.restore)));
    document.querySelectorAll('[data-permanent-delete]').forEach((button) => button.addEventListener('click', () => permanentDeleteInvoice(button.dataset.permanentDelete)));
  }

  function restoreInvoice(id) {
    const invoice = state.invoices.find((item) => item.id === id);
    invoice.deletedAt = null;
    invoice.status = 'Draft';
    persistInvoices();
    logActivity('Restored invoice from Trash', invoice.invoiceNumber);
    renderTrash();
    toast(`${invoice.invoiceNumber} restored.`, 'success');
  }

  async function permanentDeleteInvoice(id) {
    const invoice = state.invoices.find((item) => item.id === id);
    const confirmed = await confirmAction('Permanently delete invoice?', 'This action cannot be undone.', 'Delete Permanently');
    if (!confirmed) return;
    state.invoices = state.invoices.filter((item) => item.id !== id);
    persistInvoices();
    logActivity('Permanently deleted invoice', invoice.invoiceNumber);
    renderTrash();
    toast(`${invoice.invoiceNumber} permanently deleted.`, 'success');
  }

  function renderVault() {
    const invoices = state.invoices.filter((invoice) => !invoice.deletedAt);
    els.viewContainer.innerHTML = `<div class="generic-view"><div class="page-heading"><div><h2>The Vault / Safe</h2><p>Secure prototype storage for invoice records, metadata, and saved attachments.</p></div></div>
      <div class="metric-grid">${metric('Stored Invoices', String(invoices.length))}${metric('Attachments', String(invoices.reduce((sum, invoice) => sum + invoice.attachments.length, 0)))}${metric('Finalized', String(invoices.filter((invoice) => invoice.finalized).length))}${metric('Local Storage', 'Active')}</div>
      ${invoiceTablePanel(invoices, 'Vault Invoice Records')}
    </div>`;
    bindInvoiceTableActions();
  }

  function renderClients() {
    els.viewContainer.innerHTML = `<div class="generic-view"><div class="page-heading"><div><h2>Client Directory</h2><p>Reusable billing, service-address, contact, tax, and payment-term records.</p></div><button class="button primary" id="addClient">＋ Add Client</button></div>
      <section class="data-panel"><div class="data-panel-header"><h3>Clients</h3></div>${state.clients.length ? `<div style="overflow-x:auto"><table class="data-table"><thead><tr><th>Organization</th><th>Contact</th><th>Email</th><th>Phone</th><th>Tax Status</th><th>Actions</th></tr></thead><tbody>${state.clients.map((client) => `<tr><td><strong>${escapeHTML(client.organization)}</strong><br><small>${escapeHTML(client.type || '')}</small></td><td>${escapeHTML(client.contact)}</td><td>${escapeHTML(client.email)}</td><td>${escapeHTML(client.phone)}</td><td>${client.taxExempt ? 'Tax Exempt' : 'Taxable'}</td><td><button class="button secondary small" data-use-client="${client.id}">Create Invoice</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty-state"><h3>No clients saved</h3></div>'}</section></div>`;
    document.getElementById('addClient').addEventListener('click', addClientPrompt);
    document.querySelectorAll('[data-use-client]').forEach((button) => button.addEventListener('click', () => createInvoiceForClient(button.dataset.useClient)));
  }

  function addClientPrompt() {
    const organization = prompt('Client organization name:');
    if (!organization) return;
    const contact = prompt('Primary contact name:') || '';
    const email = prompt('Email address:') || '';
    const client = { id: `client-${Date.now()}`, type: 'Other Organization', organization, contact, email, phone: '', billingAddress: '', serviceAddress: '', taxExempt: false, paymentTerms: '' };
    state.clients.push(client);
    persistClients();
    renderClients();
    toast(`${organization} added to the client directory.`, 'success');
  }

  function createInvoiceForClient(id) {
    createNewInvoice();
    const invoice = currentInvoice();
    const client = state.clients.find((item) => item.id === id);
    invoice.clientId = id;
    invoice.client = structuredClone(client);
    invoice.shipSameAsBill = true;
    syncShipTo(invoice);
    markDirty();
    renderEditor();
  }

  function upsertClient(client) {
    const existingIndex = state.clients.findIndex((item) => item.id === client.id || (client.email && item.email === client.email));
    const saved = { ...structuredClone(client), id: client.id || `client-${Date.now()}` };
    if (existingIndex >= 0) state.clients[existingIndex] = saved;
    else state.clients.push(saved);
    persistClients();
  }

  function renderServices() {
    els.viewContainer.innerHTML = `<div class="generic-view"><div class="page-heading"><div><h2>Service Catalog</h2><p>Save reusable services without forcing a default price.</p></div><button class="button primary" id="addService">＋ Add Service</button></div>
      <section class="data-panel"><div class="data-panel-header"><h3>Services</h3></div>${state.services.length ? `<div style="overflow-x:auto"><table class="data-table"><thead><tr><th>Service</th><th>Unit</th><th>Default Rate</th><th>Tax</th></tr></thead><tbody>${state.services.map((service) => `<tr><td><strong>${escapeHTML(service.name)}</strong><br><small>${escapeHTML(service.description)}</small></td><td>${escapeHTML(service.unit)}</td><td>${service.defaultRate === null ? 'Entered per invoice' : formatMoney(service.defaultRate, 'USD')}</td><td>${service.taxable ? 'Taxable' : 'Optional / Exempt'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty-state"><h3>No services saved</h3></div>'}</section></div>`;
    document.getElementById('addService').addEventListener('click', () => {
      const name = prompt('Service name:');
      if (!name) return;
      state.services.push({ id: `service-${Date.now()}`, name, description: name, unit: 'Each', defaultRate: null, taxable: false });
      persistServices();
      renderServices();
      toast(`${name} added to the service catalog.`, 'success');
    });
  }

  function renderRecurring() {
    const invoices = state.invoices.filter((invoice) => !invoice.deletedAt && invoice.settings.recurring);
    els.viewContainer.innerHTML = `<div class="generic-view"><div class="page-heading"><div><h2>Recurring Invoice Drafts</h2><p>Recurring schedules create drafts for approval before delivery.</p></div></div>${invoiceTablePanel(invoices, 'Recurring Invoice Templates')}</div>`;
    bindInvoiceTableActions();
  }

  function renderPayments() {
    const invoices = state.invoices.filter((invoice) => !invoice.deletedAt && (number(invoice.adjustments.deposit) > 0 || number(invoice.adjustments.previousPayment) > 0 || invoice.status === 'Paid'));
    els.viewContainer.innerHTML = `<div class="generic-view"><div class="page-heading"><div><h2>Payments</h2><p>Deposits, recorded offline payments, and paid invoice balances.</p></div></div>${invoiceTablePanel(invoices, 'Payment Activity')}</div>`;
    bindInvoiceTableActions();
  }

  function renderReports() {
    const invoices = state.invoices.filter((invoice) => !invoice.deletedAt);
    const byClient = new Map();
    invoices.forEach((invoice) => byClient.set(invoice.client.organization || 'Unassigned', (byClient.get(invoice.client.organization || 'Unassigned') || 0) + calculateTotals(invoice).total));
    const rows = [...byClient.entries()].sort((a, b) => b[1] - a[1]);
    els.viewContainer.innerHTML = `<div class="generic-view"><div class="page-heading"><div><h2>Reports</h2><p>Revenue reporting calculated from saved invoices.</p></div><button class="button secondary" id="exportCsv">⇩ Export CSV</button></div>
      <section class="data-panel"><div class="data-panel-header"><h3>Revenue by Client</h3></div>${rows.length ? `<table class="data-table"><thead><tr><th>Client</th><th>Invoice Revenue</th></tr></thead><tbody>${rows.map(([client, amount]) => `<tr><td>${escapeHTML(client)}</td><td>${formatMoney(amount, 'USD')}</td></tr>`).join('')}</tbody></table>` : '<div class="empty-state"><h3>No report data</h3></div>'}</section></div>`;
    document.getElementById('exportCsv').addEventListener('click', exportInvoicesCSV);
  }

  function exportInvoicesCSV() {
    const header = ['Invoice Number','Invoice Date','Due Date','Client','Event','Status','Currency','Total','Balance Due'];
    const rows = state.invoices.filter((invoice) => !invoice.deletedAt).map((invoice) => {
      const totals = calculateTotals(invoice);
      return [invoice.invoiceNumber, invoice.invoiceDate, invoice.dueDate, invoice.client.organization, invoice.event, displayStatus(invoice), invoice.settings.currency, totals.total, totals.balanceDue];
    });
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
    downloadTextFile('rtbo-invoice-report.csv', csv, 'text/csv');
    toast('Invoice report exported as CSV.', 'success');
  }

  function renderActivity() {
    els.viewContainer.innerHTML = `<div class="generic-view"><div class="page-heading"><div><h2>Activity Log</h2><p>Local prototype audit trail for invoice actions.</p></div></div><section class="data-panel"><div class="data-panel-header"><h3>Recent Activity</h3></div>${state.activity.length ? `<table class="data-table"><thead><tr><th>Time</th><th>Action</th><th>Details</th></tr></thead><tbody>${state.activity.slice().reverse().map((item) => `<tr><td>${formatDateTime(item.at)}</td><td>${escapeHTML(item.action)}</td><td>${escapeHTML(item.details)}</td></tr>`).join('')}</tbody></table>` : '<div class="empty-state"><h3>No activity recorded yet</h3></div>'}</section></div>`;
  }

  function renderPlaceholder(view) {
    const labels = {
      templates: 'Invoice Templates', email: 'Email Templates', settings: 'Settings', integrations: 'Integrations', help: 'Help Center'
    };
    els.viewContainer.innerHTML = `<div class="generic-view"><div class="page-heading"><div><h2>${escapeHTML(labels[view] || capitalize(view))}</h2><p>This approved module is represented in the standalone prototype and will connect to Supabase and the RTBO platform during production integration.</p></div></div><div class="panel empty-state"><h3>Production integration point</h3><p>The working invoice editor, PDF generation, local Vault / Safe, client directory, service catalog, reporting, themes, and invoice lifecycle are available now.</p></div></div>`;
  }

  function statusClass(invoice) {
    const status = displayStatus(invoice).toLowerCase();
    if (status === 'paid') return 'paid';
    if (status === 'overdue') return 'overdue';
    if (status === 'sent') return 'sent';
    return 'draft';
  }

  function displayStatus(invoice) {
    if (invoice.status === 'Paid') return 'Paid';
    if (isOverdue(invoice)) return 'Overdue';
    return invoice.status || 'Draft';
  }

  function isOverdue(invoice) {
    if (!invoice.dueDate || ['Paid','Voided','Canceled','Refunded'].includes(invoice.status)) return false;
    const due = new Date(`${invoice.dueDate}T23:59:59`);
    return due < new Date() && calculateTotals(invoice).balanceDue > 0;
  }

  function persistInvoices() { localStorage.setItem(STORAGE.invoices, JSON.stringify(state.invoices)); }
  function persistClients() { localStorage.setItem(STORAGE.clients, JSON.stringify(state.clients)); }
  function persistServices() { localStorage.setItem(STORAGE.services, JSON.stringify(state.services)); }

  function logActivity(action, details = '') {
    state.activity.push({ id: `activity-${Date.now()}`, action, details, at: new Date().toISOString() });
    if (state.activity.length > 500) state.activity = state.activity.slice(-500);
    localStorage.setItem(STORAGE.activity, JSON.stringify(state.activity));
  }

  function toast(message, type = 'info') {
    const item = document.createElement('div');
    item.className = `toast ${type}`;
    item.textContent = message;
    els.toastStack.appendChild(item);
    setTimeout(() => item.remove(), 4200);
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : structuredClone(fallback);
    } catch {
      return structuredClone(fallback);
    }
  }

  function setPath(object, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((current, key) => current[key], object);
    target[last] = value;
  }

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function formatMoney(value, currency = 'USD') {
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(number(value)); }
    catch { return `${CURRENCY_SYMBOLS[currency] || ''}${number(value).toFixed(2)}`; }
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).format(date);
  }

  function formatDateTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  function formatTime(value) {
    const date = new Date(value || Date.now());
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
  }

  function toISODate(date) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function currencyName(code) {
    return { USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', CAD: 'Canadian Dollar', AUD: 'Australian Dollar', JPY: 'Japanese Yen', MXN: 'Mexican Peso', CHF: 'Swiss Franc', CNY: 'Chinese Yuan' }[code] || code;
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function slugify(value) {
    return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'Invoice';
  }

  function csvCell(value) {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  }

  function downloadTextFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function capitalize(value) { return String(value).charAt(0).toUpperCase() + String(value).slice(1); }
  function cssSafe(value) { return String(value).replace(/[^a-zA-Z0-9_-]/g, '-'); }
  function nl2br(value) { return escapeHTML(value || '').replace(/\n/g, '<br>'); }
  function escapeHTML(value) { return String(value ?? '').replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character])); }
  function escapeAttr(value) { return escapeHTML(value).replace(/'/g, '&#39;'); }
})();
