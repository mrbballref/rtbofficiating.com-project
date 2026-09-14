(() => {
  'use strict';

  const STORAGE_KEY = 'gunr-dashboard-state-v3';
  const DB_NAME = 'gunr-dashboard-files-v1';
  const DB_STORE = 'files';
  const moduleView = document.getElementById('module-view');
  const shell = document.querySelector('[data-app-shell]');
  const sidebar = document.getElementById('dashboard-sidebar');
  const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
  const toast = document.querySelector('[data-toast]');
  let toastTimer;
  let activeConversationId = null;
  const messagesUi = { query: '', tab: 'all', filtersOpen: false, onlyAttachments: false, showArchived: false, sort: 'newest' };
  let profilePhotoUrl = '';
  const memoryFiles = new Map();
  const assignmentUi = { section: 'tasks', tab: 'all', query: '', status: '', type: '', group: '', startDate: '', endDate: '', page: 1, pageSize: 8, datePanelOpen: false };
  const createGameUiDefaults = (crewSize) => ({ crewSize: Number(crewSize) === 3 ? 3 : 2, draftId: '', selectedRole: 'refereeId', officialTab: 'available', unavailableLimit: 3, officialQuery: '', officialType: '', officialLevel: '', officialGender: '', date: '', startTime: '', sport: '', level: '', gender: '', homeTeam: '', awayTeam: '', gymName: '', address: '', venuePhone: '', notes: '', refereeId: '', umpire1Id: '', umpire2Id: '', alternateId: '' });
  const createGameUiByCrew = { 2: createGameUiDefaults(2), 3: createGameUiDefaults(3) };
  let createGameUi = createGameUiByCrew[2];
  const masterScheduleUi = { query: '', startDate: '', endDate: '', sport: '', level: '', status: '', school: '', conferenceLevel: '', gender: '', venue: '', conflictsOnly: false, advancedOpen: false, page: 1, pageSize: 10, selected: new Set() };
  const unpublishedScheduleUi = { query: '', startDate: '', endDate: '', level: '', venue: '', status: '', sport: '', gender: '', school: '', conflictsOnly: false, filtersOpen: false, sortKey: 'date', sortDir: 'asc', page: 1, pageSize: 10 };
  const quickAssignUi = { tab: 'games', startDate: '', endDate: '', sport: '', level: '', timeBand: '', venue: '', officialsNeeded: '', role: '', certification: '', gender: '', status: '', school: '', radius: '', location: null, locationLabel: '', filtersOpen: false, query: '', page: 1, pageSize: 10, sortKey: 'date', sortDir: 'asc', sessionAssignments: 0, lastRunMs: 0, officialId: '' };
  const tbaGamesUi = { tab: 'all', query: '', startDate: '', endDate: '', sport: '', level: '', status: '', crewSize: '', gender: '', school: '', filtersOpen: false, page: 1, pageSize: 10, sortKey: 'date', sortDir: 'asc', lastSyncedAt: 0 };
  const publishedGamesUi = { tab: 'all', query: '', startDate: '', endDate: '', sport: '', level: '', crewSize: '', page: 1, pageSize: 10, sortKey: 'date', sortDir: 'asc', selected: new Set(), detailId: '' };
  const formsUi = { section: 'records' };
  const schoolsUi = { section: 'directory', selectedId: '', editingContactId: '', pair: { homeId: '', visitingId: '' }, drafts: { home: schoolTeamDraftDefaults('home'), visiting: schoolTeamDraftDefaults('visiting') }, logoPreviewUrls: { home: '', visiting: '' } };
  const myGamesUi = { tab: 'upcoming', query: '', startDate: '', endDate: '', sport: '', level: '', response: '', sort: 'soonest', filtersOpen: false, page: 1, pageSize: 4, detailId: '' };
  const calendarNow = new Date();
  const calendarUi = { section: 'calendar', view: 'month', year: calendarNow.getFullYear(), month: calendarNow.getMonth(), selectedDate: '' };
  const reportStartDate = new Date(calendarNow.getFullYear(), calendarNow.getMonth(), 1, 12);
  const reportEndDate = new Date(calendarNow.getFullYear(), calendarNow.getMonth() + 1, 0, 12);
  const availabilityReportUi = { startDate: dateKey(reportStartDate), endDate: dateKey(reportEndDate), level: '', gender: '', officialType: '', status: '', query: '', page: 1, pageSize: 10 };
  const usersUi = { mode: 'list', query: '', editingId: '', tab: 'all', status: '', certification: '', position: '', organization: '', region: '', joinedFrom: '', joinedTo: '', filtersOpen: false, page: 1, pageSize: 25, sortKey: 'name', sortDir: 'asc', menuId: '', columns: new Set(['email','phone','positions','certification','status','joined']) };
  let userPhotoPreviewUrl = '';
  const USER_PERMISSIONS = [
    ['dashboard','Dashboard Access'], ['assignments','Assignments'], ['availability','Availability Calendar'], ['schools','Schools'],
    ['payments','Payments'], ['documents','Documents'], ['whiteboard','Whiteboard'], ['lab','Lab'], ['tax','Tax Center'],
    ['shop','Shop'], ['reports','Reports'], ['notifications','Notifications'], ['messages','Messages'], ['users','User Management']
  ];
  const USER_ROLES = [
    { value: 'official', label: 'Official', permissions: ['dashboard','assignments','availability','payments','documents','lab','tax','shop','notifications','messages'] },
    { value: 'assignor', label: 'Assignor', permissions: ['dashboard','assignments','availability','schools','payments','documents','whiteboard','lab','reports','notifications','messages','users'] },
    { value: 'school-admin', label: 'School Admin', permissions: ['dashboard','assignments','availability','schools','payments','documents','reports','notifications','messages','users'] },
    { value: 'website-admin', label: 'Website Admin', permissions: USER_PERMISSIONS.map(([value]) => value) },
    { value: 'coach', label: 'Coach', permissions: ['dashboard','assignments','availability','schools','documents','lab','notifications','messages'] },
    { value: 'athletic-director', label: 'Athletic Director', permissions: ['dashboard','assignments','availability','schools','payments','documents','reports','notifications','messages','users'] },
    { value: 'vendor', label: 'Vendor', permissions: ['dashboard','payments','documents','shop','notifications','messages'] },
    { value: 'super-admin', label: 'Super Admin', permissions: USER_PERMISSIONS.map(([value]) => value) }
  ];
  const BLOCK_REASONS = [
    { value: 'officiating', label: 'Officiating another game', description: 'I will be officiating another game.', icon: 'i-calendar' },
    { value: 'family', label: 'Family commitment', description: 'A personal or family obligation.', icon: 'i-user' },
    { value: 'work', label: 'Work commitment', description: 'Work or business related obligation.', icon: 'i-card' },
    { value: 'school', label: 'School / Class', description: 'School, class or tutoring.', icon: 'i-school' },
    { value: 'medical', label: 'Medical appointment', description: 'Doctor, dentist or medical appointment.', icon: 'i-plus' },
    { value: 'travel', label: 'Vacation / Travel', description: 'Vacation, travel or out of town.', icon: 'i-pin' },
    { value: 'unavailable', label: 'Not available — No reason provided', description: 'I am not available.', icon: 'i-close' },
    { value: 'other', label: 'Other', description: 'Other reason (you can add a note).', icon: 'i-dots' }
  ];

  const GAME_DECLINE_REASONS = [
    { value: 'scheduling-conflict', label: 'Scheduling Conflict', description: 'I have another commitment at this time.', icon: 'i-calendar' },
    { value: 'personal-commitment', label: 'Personal Commitment', description: 'A personal or family obligation.', icon: 'i-user' },
    { value: 'work-commitment', label: 'Work Commitment', description: 'Work or business related obligation.', icon: 'i-card' },
    { value: 'medical-reason', label: 'Medical Reason', description: 'Medical appointment or health related.', icon: 'i-plus' },
    { value: 'school-class', label: 'School / Class', description: 'School, class or tutoring commitment.', icon: 'i-school' },
    { value: 'travel-conflict', label: 'Travel', description: 'Out of town travel or vacation.', icon: 'i-pin' },
    { value: 'not-enough-notice', label: 'Not Enough Notice', description: 'Not enough time to prepare.', icon: 'i-clock' },
    { value: 'pay-distance', label: 'Pay / Distance', description: 'Pay or distance is not acceptable.', icon: 'i-card' },
    { value: 'other', label: 'Other', description: 'Other reason (you can add a note).', icon: 'i-dots' }
  ];

  const emptyState = () => ({
    profile: {
      firstName: '', lastName: '', email: '', phone: '', role: '', city: '', region: '', country: '', timeZone: '',
      yearsExperience: '', emergencyContact: '', officialId: '', primarySport: '', preferredLevel: '', uniformSize: '',
      membershipNumber: '', accountStatus: '', backgroundCheckStatus: '', backgroundCheckDate: '',
      safeSportStatus: '', safeSportDate: '', verificationStatus: '', profilePhotoId: ''
    },
    assignments: [], masterGames: [], schools: [], payments: [], forms: [], resources: [], products: [], cart: [], conversations: [], reviews: [], supportTickets: [], notifications: [],
    users: [], userDrafts: [], invitations: [],
    officials: [], officialAvailability: [],
    availability: {}, calendarAvailability: {}, calendarBlocks: [],
    taxProfile: { legalName: '', businessName: '', taxClassification: '', mailingAddress: '', city: '', region: '', postalCode: '', electronicDelivery: false },
    settings: { assignmentAlerts: false, messageAlerts: false, paymentAlerts: false, profileVisible: false, reducedMotion: false }
  });

  let state = loadState();

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return parsed && typeof parsed === 'object' ? { ...emptyState(), ...parsed, assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [], masterGames: Array.isArray(parsed.masterGames) ? parsed.masterGames : [], schools: Array.isArray(parsed.schools) ? parsed.schools : [], conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [], users: Array.isArray(parsed.users) ? parsed.users : [], userDrafts: Array.isArray(parsed.userDrafts) ? parsed.userDrafts : [], invitations: Array.isArray(parsed.invitations) ? parsed.invitations : [], officials: Array.isArray(parsed.officials) ? parsed.officials : [], officialAvailability: Array.isArray(parsed.officialAvailability) ? parsed.officialAvailability : [], calendarBlocks: Array.isArray(parsed.calendarBlocks) ? parsed.calendarBlocks : [], settings: { ...emptyState().settings, ...(parsed.settings || {}) }, profile: { ...emptyState().profile, ...(parsed.profile || {}) }, taxProfile: { ...emptyState().taxProfile, ...(parsed.taxProfile || {}) } } : emptyState();
    } catch { return emptyState(); }
  }

  function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} updateChrome(); }
  function uid(prefix = 'item') { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
  function esc(value = '') { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
  function fmtDate(value) { if (!value) return ''; const date = new Date(`${value}T12:00:00`); return Number.isNaN(date.getTime()) ? esc(value) : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date); }
  function fmtDateTime(value) { if (!value) return ''; const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date); }
  function money(value) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0)); }
  function safeUrl(value = '') { try { const url = new URL(value, window.location.href); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } }
  function icon(id) { return `<svg aria-hidden="true"><use href="#${id}"/></svg>`; }
  function showToast(message) { clearTimeout(toastTimer); toast.textContent = message; toast.hidden = false; toastTimer = setTimeout(() => { toast.hidden = true; }, 2600); }
  function notify(text) { state.notifications.unshift({ id: uid('notice'), text, at: new Date().toISOString(), read: false }); state.notifications = state.notifications.slice(0, 50); saveState(); }
  function emptyMessage(title, copy) { return `<div class="empty-state"><strong>${esc(title)}</strong><p>${esc(copy)}</p></div>`; }
  function actionButton(label, action, extra = '', iconId = '') { return `<button class="module-button ${extra}" type="button" data-action="${action}">${iconId ? icon(iconId) : ''}${esc(label)}</button>`; }
  function routeHeader(title, description, actions = '') { return `<header class="module-hero"><div class="module-hero__copy"><p class="module-kicker">Got U Nex Ref Dashboard</p><h1>${esc(title)}</h1><p>${esc(description)}</p></div><div class="module-hero__actions">${actions}</div></header>`; }
  function field(label, name, type = 'text', value = '', required = false, options = '') {
    if (type === 'select') return `<label><span>${esc(label)}</span><select name="${name}" ${required ? 'required' : ''}>${options}</select></label>`;
    if (type === 'textarea') return `<label class="is-full"><span>${esc(label)}</span><textarea name="${name}" ${required ? 'required' : ''}>${esc(value)}</textarea></label>`;
    const step = type === 'number' ? (['amount','price'].includes(name) ? ' step="0.01" min="0"' : ' step="1" min="0"') : '';
    return `<label><span>${esc(label)}</span><input name="${name}" type="${type}" value="${esc(value)}"${step} ${required ? 'required' : ''}></label>`;
  }
  function option(value, selected, label = value) { return `<option value="${esc(value)}" ${value === selected ? 'selected' : ''}>${esc(label)}</option>`; }

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(DB_STORE)) request.result.createObjectStore(DB_STORE, { keyPath: 'id' }); };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function dbPutFile(file, category) {
    const record = { id: uid('file'), category, name: file.name, type: file.type, size: file.size, createdAt: new Date().toISOString(), blob: file };
    try {
      const db = await openDB();
      await new Promise((resolve, reject) => { const tx = db.transaction(DB_STORE, 'readwrite'); tx.objectStore(DB_STORE).put(record); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); });
      db.close();
    } catch { memoryFiles.set(record.id, record); }
    return record;
  }
  async function dbListFiles(category) {
    let records = [];
    try {
      const db = await openDB();
      records = await new Promise((resolve, reject) => { const tx = db.transaction(DB_STORE, 'readonly'); const req = tx.objectStore(DB_STORE).getAll(); req.onsuccess = () => resolve(req.result.filter((item) => item.category === category)); req.onerror = () => reject(req.error); });
      db.close();
    } catch { records = [...memoryFiles.values()].filter((item) => item.category === category); }
    return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async function dbGetFile(id) {
    try { const db = await openDB(); const item = await new Promise((resolve, reject) => { const req = db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(id); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); db.close(); return item; }
    catch { return memoryFiles.get(id); }
  }
  async function dbDeleteFile(id) {
    try { const db = await openDB(); await new Promise((resolve, reject) => { const tx = db.transaction(DB_STORE, 'readwrite'); tx.objectStore(DB_STORE).delete(id); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); db.close(); }
    catch { memoryFiles.delete(id); }
  }
  async function dbClearFiles() {
    try { const db = await openDB(); await new Promise((resolve, reject) => { const tx = db.transaction(DB_STORE, 'readwrite'); tx.objectStore(DB_STORE).clear(); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); db.close(); }
    catch { memoryFiles.clear(); }
  }

  const routes = {
    home: renderHome,
    assignments: renderAssignments,
    calendar: renderCalendar,
    schools: renderSchools,
    lab: () => renderFilesModule('Lab', 'Upload game film, clips, training video, or supporting material for review.', 'lab', 'Upload Lab File'),
    payments: renderPayments,
    'tax-center': renderTaxCenter,
    forms: renderForms,
    resources: renderResources,
    shop: renderShop,
    messages: renderMessages,
    users: renderUsers,
    profile: renderProfile,
    documents: () => renderFilesModule('Documents', 'Store account documents in this browser and download them when needed.', 'documents', 'Upload Document'),
    'id-card': renderIdCard,
    reviews: renderReviews,
    support: renderSupport,
    settings: renderSettings
  };

  function renderHome() {
    const name = [state.profile.firstName, state.profile.lastName].filter(Boolean).join(' ');
    const activeAssignments = state.assignments.filter((a) => ['Active','Confirmed'].includes(a.status)).length;
    const pending = state.assignments.filter((a) => a.status === 'Pending').length;
    const unpaid = state.payments.filter((p) => p.status !== 'Paid').reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const recentAssignments = state.assignments.map(normalizeAssignment).sort((a, b) => `${b.dueDate}${b.dueTime}`.localeCompare(`${a.dueDate}${a.dueTime}`)).slice(0, 3);
    const recentNotices = state.notifications.slice(0, 4);
    return `${routeHeader(name ? `Welcome, ${name}` : 'Assign. Connect. Elevate.', 'This standalone dashboard contains only information you enter. No records are preloaded.', `<a class="module-button module-button--primary" href="#assignments" data-route="assignments">Add Assignment</a><a class="module-button" href="#profile" data-route="profile">${name ? 'Update Profile' : 'Set Up Profile'}</a>`)}
      <div class="home-metrics">
        <article><span>${icon('i-calendar')}</span><strong>${state.assignments.length}</strong><p>Assignments</p></article>
        <article><span>${icon('i-school')}</span><strong>${state.schools.length}</strong><p>Schools</p></article>
        <article><span>${icon('i-card')}</span><strong>${money(unpaid)}</strong><p>Unpaid Amount</p></article>
        <article><span>${icon('i-star')}</span><strong>${state.reviews.length}</strong><p>Reviews</p></article>
      </div>
      <div class="module-grid">
        <section class="module-card module-card--wide"><h2>${icon('i-calendar')}Assignment Overview</h2><div class="metric-row"><div class="metric"><strong>${activeAssignments}</strong><span>Active</span></div><div class="metric"><strong>${pending}</strong><span>Pending</span></div><div class="metric"><strong>${state.assignments.length - activeAssignments - pending}</strong><span>Other</span></div></div><div class="module-list home-list">${recentAssignments.length ? recentAssignments.map((a) => assignmentItem(a, false)).join('') : emptyMessage('No assignments', 'Add an assignment to begin building your schedule.')}</div></section>
        <aside class="module-card"><h2>${icon('i-bell')}Recent Activity</h2><div class="module-list">${recentNotices.length ? recentNotices.map((n) => `<article class="module-list__item"><div><h3>${esc(n.text)}</h3><small>${fmtDateTime(n.at)}</small></div></article>`).join('') : emptyMessage('No activity', 'Saved actions will appear here.')}</div></aside>
        <section class="module-card module-card--full"><h2>${icon('i-settings')}Quick Actions</h2><div class="quick-actions"><a href="#assignments" data-route="assignments">${icon('i-calendar')}Assignments</a><a href="#lab" data-route="lab">${icon('i-lab')}Lab</a><a href="#payments" data-route="payments">${icon('i-card')}Payments</a><a href="#documents" data-route="documents">${icon('i-file')}Documents</a><a href="#messages" data-route="messages">${icon('i-mail')}Messages</a><a href="#support" data-route="support">${icon('i-help')}Support</a></div></section>
      </div>`;
  }

  function normalizeAssignment(record = {}) {
    const legacyTitle = [record.homeTeam, record.awayTeam].filter(Boolean).join(record.awayTeam ? ' vs. ' : '');
    return {
      ...record,
      title: record.title || legacyTitle || '',
      description: record.description || record.notes || '',
      type: record.type || (legacyTitle ? 'Game Assignment' : ''),
      classTeam: record.classTeam || record.location || '',
      dueDate: record.dueDate || record.date || '',
      dueTime: record.dueTime || record.time || '',
      submittedCount: record.submittedCount ?? '',
      expectedCount: record.expectedCount ?? '',
      scope: record.scope || 'my',
      status: record.status || ''
    };
  }

  function assignmentItem(record, includeActions = true) {
    const a = normalizeAssignment(record);
    return `<article class="module-list__item" data-search-item><div><h3>${esc(a.title)}</h3><p>${a.dueDate ? fmtDate(a.dueDate) : ''}${a.dueTime ? ` · ${esc(a.dueTime)}` : ''}${a.type ? ` · ${esc(a.type)}` : ''}</p><small>${esc(a.classTeam || '')}</small></div><div class="item-actions"><span class="status-pill">${esc(a.status || 'Not set')}</span>${includeActions ? `<button type="button" data-action="edit-assignment" data-id="${a.id}" aria-label="Edit assignment">${icon('i-edit')}</button><button type="button" data-action="delete-assignment" data-id="${a.id}" aria-label="Delete assignment">${icon('i-trash')}</button>` : ''}</div></article>`;
  }

  function assignmentStatusClass(value) {
    return `assignment-status--${String(value || 'unset').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }

  function assignmentTypeIcon(type) {
    const normalized = String(type || '').toLowerCase();
    if (normalized.includes('quiz')) return 'i-form';
    if (normalized.includes('film') || normalized.includes('analysis')) return 'i-lab';
    if (normalized.includes('evaluation')) return 'i-user';
    if (normalized.includes('plan') || normalized.includes('calendar')) return 'i-calendar';
    if (normalized.includes('team') || normalized.includes('group')) return 'i-school';
    return 'i-file';
  }

  function uniqueAssignmentValues(key) {
    return [...new Set(state.assignments.map((item) => normalizeAssignment(item)[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function filteredAssignments() {
    const query = assignmentUi.query.trim().toLowerCase();
    return state.assignments.map(normalizeAssignment).filter((a) => {
      if (assignmentUi.tab === 'my' && a.scope !== 'my') return false;
      if (assignmentUi.tab === 'completed' && a.status !== 'Completed') return false;
      if (assignmentUi.status && a.status !== assignmentUi.status) return false;
      if (assignmentUi.type && a.type !== assignmentUi.type) return false;
      if (assignmentUi.group && a.classTeam !== assignmentUi.group) return false;
      if (assignmentUi.startDate && (!a.dueDate || a.dueDate < assignmentUi.startDate)) return false;
      if (assignmentUi.endDate && (!a.dueDate || a.dueDate > assignmentUi.endDate)) return false;
      if (query) {
        const haystack = [a.title, a.description, a.type, a.classTeam, a.status].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    }).sort((a, b) => `${b.dueDate || ''}${b.dueTime || ''}`.localeCompare(`${a.dueDate || ''}${a.dueTime || ''}`));
  }

  function assignmentSubmissions(a) {
    const submitted = a.submittedCount === '' || a.submittedCount == null ? '' : Number(a.submittedCount);
    const expected = a.expectedCount === '' || a.expectedCount == null ? '' : Number(a.expectedCount);
    if (submitted === '' && expected === '') return '<span class="assignment-empty-value">—</span>';
    if (submitted !== '' && expected !== '') return `<strong>${submitted} / ${expected}</strong><small>Submitted</small>`;
    return `<strong>${submitted !== '' ? submitted : expected}</strong><small>${submitted !== '' ? 'Submitted' : 'Expected'}</small>`;
  }

  function assignmentTableRow(a) {
    return `<tr>
      <td data-label="Assignment"><div class="assignment-title-cell"><span class="assignment-type-icon">${icon(assignmentTypeIcon(a.type))}</span><span><strong>${esc(a.title)}</strong>${a.description ? `<small>${esc(a.description)}</small>` : ''}</span></div></td>
      <td data-label="Type">${a.type ? esc(a.type) : '<span class="assignment-empty-value">—</span>'}</td>
      <td data-label="Class or Team">${a.classTeam ? esc(a.classTeam) : '<span class="assignment-empty-value">—</span>'}</td>
      <td data-label="Due Date"><div class="assignment-date-cell">${a.dueDate ? `<strong>${fmtDate(a.dueDate)}</strong>${a.dueTime ? `<small>${esc(a.dueTime)}</small>` : ''}` : '<span class="assignment-empty-value">—</span>'}</div></td>
      <td data-label="Submissions"><div class="assignment-submission-cell">${assignmentSubmissions(a)}</div></td>
      <td data-label="Status"><div class="assignment-status-cell">${a.status ? `<span class="assignment-status ${assignmentStatusClass(a.status)}">${esc(a.status)}</span>` : '<span class="assignment-empty-value">—</span>'}${a.status === 'Declined' && a.declineReason ? `<small>${esc(blockReasonDisplay({ declineReason: a.declineReason, declineReasonDetails: a.declineReasonDetails }))}</small>` : ''}</div></td>
      <td data-label="Actions"><details class="assignment-row-menu"><summary aria-label="Open actions for ${esc(a.title)}">${icon('i-dots')}</summary><div><button type="button" data-action="edit-assignment" data-id="${a.id}">${icon('i-edit')}Edit</button><button type="button" data-action="duplicate-assignment" data-id="${a.id}">${icon('i-copy')}Duplicate</button>${a.status === 'Declined' ? `<button type="button" data-action="decline-assignment" data-id="${a.id}">${icon('i-edit')}Change decline reason</button><button type="button" data-action="restore-assignment" data-id="${a.id}">${icon('i-sync')}Restore assignment</button>` : !['Completed','Canceled'].includes(a.status) ? `<button type="button" data-action="decline-assignment" data-id="${a.id}">${icon('i-close')}Decline assignment</button>` : ''}<button type="button" data-action="toggle-assignment-complete" data-id="${a.id}">${icon('i-check')}${a.status === 'Completed' ? 'Reopen' : 'Mark completed'}</button><button type="button" data-action="delete-assignment" data-id="${a.id}">${icon('i-trash')}Delete</button></div></details></td>
    </tr>`;
  }

  function assignmentDateLabel() {
    if (!assignmentUi.startDate && !assignmentUi.endDate) return 'All due dates';
    const start = assignmentUi.startDate ? fmtDate(assignmentUi.startDate) : 'Beginning';
    const end = assignmentUi.endDate ? fmtDate(assignmentUi.endDate) : 'Open ended';
    return `${start} – ${end}`;
  }

  function assignmentFormDialog() {
    const typeOptions = ['', 'Report', 'Plan', 'Analysis', 'Quiz', 'Evaluation', 'Document', 'Form', 'Task', 'Game Assignment', 'Other'];
    const statuses = ['', 'Draft', 'Active', 'Pending', 'Reviewing', 'Completed', 'Declined', 'Canceled'];
    const scopes = ['', 'all', 'my'];
    return `<dialog class="assignment-dialog" data-assignment-dialog aria-labelledby="assignment-dialog-title">
      <form class="assignment-dialog__form" data-form="assignment">
        <header><div><p>Assignment Management</p><h2 id="assignment-dialog-title" data-assignment-dialog-title>New Assignment</h2></div><button type="button" data-action="close-assignment-dialog" aria-label="Close assignment form">${icon('i-close')}</button></header>
        <input type="hidden" name="id">
        <div class="assignment-form-grid">
          <label class="assignment-field assignment-field--wide"><span>Assignment Title</span><input name="title" type="text" required></label>
          <label class="assignment-field assignment-field--wide"><span>Description</span><textarea name="description" rows="3"></textarea></label>
          <label class="assignment-field"><span>Type</span><select name="type" required>${typeOptions.map((value) => option(value, '', value || 'Select type')).join('')}</select></label>
          <label class="assignment-field"><span>Class or Team</span><input name="classTeam" type="text"></label>
          <label class="assignment-field"><span>Due Date</span><input name="dueDate" type="date" required></label>
          <label class="assignment-field"><span>Due Time</span><input name="dueTime" type="time"></label>
          <label class="assignment-field"><span>Assignment Scope</span><select name="scope" required>${scopes.map((value) => option(value, '', value === 'all' ? 'All Assignments' : value === 'my' ? 'My Assignments' : 'Select scope')).join('')}</select></label>
          <label class="assignment-field"><span>Status</span><select name="status" required>${statuses.map((value) => option(value, '', value || 'Select status')).join('')}</select></label>
          <label class="assignment-field"><span>Submitted Count</span><input name="submittedCount" type="number" min="0" step="1"></label>
          <label class="assignment-field"><span>Expected Count</span><input name="expectedCount" type="number" min="0" step="1"></label>
        </div>
        <footer><button class="assignment-secondary-button" type="button" data-action="close-assignment-dialog">Cancel</button><button class="assignment-primary-button" type="submit">Save Assignment</button></footer>
      </form>
    </dialog>`;
  }

  function assignmentDeclineDialog() {
    return `<dialog class="calendar-block-dialog assignment-decline-dialog" data-assignment-decline-dialog aria-labelledby="assignment-decline-title"><form data-form="assignment-decline"><header><div><p>Assignment Response</p><h2 id="assignment-decline-title">Decline Assignment</h2><span data-assignment-decline-summary></span></div><button type="button" data-action="close-assignment-decline-dialog" aria-label="Close">${icon('i-close')}</button></header><input type="hidden" name="id"><div class="calendar-block-fields assignment-decline-fields"><div class="is-wide assignment-decline-record"><strong data-assignment-decline-name></strong><span data-assignment-decline-date></span></div><div class="is-wide">${blockReasonPicker()}</div><label class="is-wide block-note-field" data-block-note-field><span data-block-note-label>Note <small>(optional)</small></span><textarea name="notes" rows="3" aria-describedby="assignment-decline-note-help"></textarea><small id="assignment-decline-note-help" data-block-note-help>Add details when needed. Details are required when Other is selected.</small></label><label class="assignment-decline-calendar-toggle is-wide"><input name="addToCalendar" type="checkbox"><span>Add this decline reason to the Availability Calendar</span></label><label><span>Calendar Date</span><input name="date" type="date"></label><label><span>Start Time</span><input name="startTime" type="time"></label><label><span>End Time <small>(optional)</small></span><input name="endTime" type="time"></label></div><footer><button type="button" class="calendar-secondary-button" data-action="close-assignment-decline-dialog">Cancel</button><button type="submit" class="calendar-block-submit">Decline Assignment</button></footer></form></dialog>`;
  }

  function openAssignmentDeclineDialog(record) {
    const dialog = moduleView.querySelector('[data-assignment-decline-dialog]');
    if (!dialog || !record) return;
    const a = normalizeAssignment(record);
    const form = dialog.querySelector('form');
    const linkedBlock = (state.calendarBlocks || []).find((item) => item.sourceAssignmentId === a.id);
    form.reset();
    form.elements.id.value = a.id;
    form.elements.notes.value = a.declineReasonDetails || linkedBlock?.notes || '';
    form.elements.date.value = linkedBlock?.date || a.dueDate || '';
    form.elements.startTime.value = linkedBlock?.startTime || a.dueTime || '';
    form.elements.endTime.value = linkedBlock?.endTime || '';
    form.elements.addToCalendar.checked = Boolean(linkedBlock || a.dueDate);
    dialog.querySelector('[data-assignment-decline-name]').textContent = a.title;
    dialog.querySelector('[data-assignment-decline-date]').textContent = [a.dueDate ? fmtDate(a.dueDate) : '', a.dueTime ? calendarTime(a.dueTime) : ''].filter(Boolean).join(' · ') || 'No assignment date or time has been entered.';
    dialog.querySelector('[data-assignment-decline-summary]').textContent = a.status === 'Declined' ? 'Update the decline reason and calendar block.' : 'Choose the reason this assignment cannot be accepted.';
    updateBlockReasonPicker(dialog, a.declineReason || linkedBlock?.reason || '');
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open','');
    requestAnimationFrame(() => dialog.querySelector('.block-reason-trigger')?.focus());
  }


  function assignmentSectionTabs() {
    const tasks = [
      ['tasks', 'Assignment Tasks', 'Review and manage assignment records'],
      ['tba-games', 'TBA Games', 'Games with open crew positions'],
      ['quick-assign', 'Quick Assign', 'Match available officials to games'],
      ['create-game-2', 'Create 2-Man Assignment', 'Build a two-official crew'],
      ['create-game-3', 'Create 3-Man Assignment', 'Build a three-official crew'],
      ['master', 'Master Schedule', 'Manage the complete game schedule'],
      ['published', 'Published Games', 'View, unpublish, or edit published games'],
      ['unpublished', 'Unpublished Games', 'Review games before publishing'],
      ['my-games', 'My Games', 'Assignments for the signed-in official']
    ];
    const active = tasks.find(([value]) => value === assignmentUi.section) || tasks[0];
    return `<div class="assignment-task-dropdown-wrap"><details class="assignment-task-dropdown"><summary><span><small>Assignment Tasks</small><strong>${esc(active[1])}</strong></span>${icon('i-chevron')}</summary><div class="assignment-task-dropdown__menu" role="menu">${tasks.map(([value, label, description]) => `<button type="button" role="menuitem" class="${assignmentUi.section === value ? 'is-active' : ''}" data-action="set-assignment-section" data-section="${esc(value)}"><span>${esc(label)}</span><small>${esc(description)}</small>${assignmentUi.section === value ? icon('i-check') : ''}</button>`).join('')}</div></details></div>`;
  }
  function normalizeMasterGame(record = {}) {
    return {
      ...record,
      id: record.id || '',
      crewSize: Number(record.crewSize) === 2 ? 2 : 3,
      date: record.date || '',
      startTime: record.startTime || '',
      timeZone: record.timeZone || '',
      sport: record.sport || '',
      level: record.level || '',
      gender: record.gender || '',
      conferenceLevel: record.conferenceLevel || '',
      school: record.school || '',
      homeTeam: record.homeTeam || '',
      awayTeam: record.awayTeam || '',
      gymName: record.gymName || '',
      address: record.address || '',
      venuePhone: record.venuePhone || '',
      status: record.status || 'Draft',
      refereeId: record.refereeId || '',
      umpire1Id: record.umpire1Id || '',
      umpire2Id: record.umpire2Id || '',
      alternateId: record.alternateId || '',
      travelMiles: record.travelMiles === '' || record.travelMiles == null ? '' : Math.max(0, Number(record.travelMiles) || 0),
      officialResponses: record.officialResponses && typeof record.officialResponses === 'object' ? record.officialResponses : {},
      assignmentMethod: record.assignmentMethod || '',
      autoAssignedAt: record.autoAssignedAt || '',
      notes: record.notes || ''
    };
  }

  function masterPrimaryRoleKeys(game) {
    return normalizeMasterGame(game).crewSize === 2 ? ['refereeId', 'umpire1Id'] : ['refereeId', 'umpire1Id', 'umpire2Id'];
  }

  function masterAllRoleKeys(game) {
    return [...masterPrimaryRoleKeys(game), 'alternateId'];
  }
  function masterScheduleRoster() {
    const roster = [];
    const add = (id, firstName, lastName, email = '', source = '') => {
      const name = [firstName, lastName].filter(Boolean).join(' ').trim();
      if (!id || !name) return;
      roster.push({ id, name, email: String(email || '').trim(), source });
    };
    (state.officials || []).forEach((official) => add(`official:${official.id}`, official.firstName, official.lastName, official.email, 'Availability Report'));
    (state.users || []).filter((user) => user.role === 'official').forEach((user) => add(`user:${user.id}`, user.firstName, user.lastName, user.email, 'Users'));
    if (String(state.profile.role || '').toLowerCase().includes('official')) add('profile:self', state.profile.firstName, state.profile.lastName, state.profile.email, 'My Profile');
    const seen = new Set();
    return roster.filter((item) => {
      const key = (item.email || item.name).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  function masterCrewName(id) {
    if (!id) return '';
    return masterScheduleRoster().find((item) => item.id === id)?.name || '';
  }

  function masterCrewOptions(selected = '') {
    return `<option value="">Unassigned</option>${masterScheduleRoster().map((item) => option(item.id, selected, item.name)).join('')}`;
  }

  function masterUniqueValues(key) {
    return [...new Set((state.masterGames || []).map((item) => normalizeMasterGame(item)[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function masterGameConflictReasons(record) {
    const game = normalizeMasterGame(record);
    const reasons = [];
    const required = masterPrimaryRoleKeys(game).map((role) => game[role]);
    const missing = required.filter((value) => !value).length;
    if (missing) reasons.push(`${missing} required crew position${missing === 1 ? '' : 's'} unassigned`);
    const allCrew = masterAllRoleKeys(game).map((role) => game[role]).filter(Boolean);
    if (new Set(allCrew).size !== allCrew.length) reasons.push('The same official is assigned to more than one position');
    if (game.date && game.startTime) {
      const duplicateCrew = new Set();
      (state.masterGames || []).map(normalizeMasterGame).filter((other) => other.id !== game.id && other.status !== 'Canceled' && other.date === game.date && other.startTime === game.startTime).forEach((other) => {
        const otherCrew = masterAllRoleKeys(other).map((role) => other[role]).filter(Boolean);
        allCrew.filter((id) => otherCrew.includes(id)).forEach((id) => duplicateCrew.add(masterCrewName(id) || 'An official'));
      });
      duplicateCrew.forEach((name) => reasons.push(`${name} is assigned to another game at the same time`));
    }
    return reasons;
  }
  function masterCrewPercent(game) {
    const normalized = normalizeMasterGame(game);
    const roles = masterPrimaryRoleKeys(normalized);
    const filled = roles.filter((role) => normalized[role]).length;
    return Math.round((filled / roles.length) * 100);
  }
  function filteredMasterGames() {
    const query = masterScheduleUi.query.trim().toLowerCase();
    return (state.masterGames || []).map(normalizeMasterGame).filter((game) => {
      if (masterScheduleUi.startDate && (!game.date || game.date < masterScheduleUi.startDate)) return false;
      if (masterScheduleUi.endDate && (!game.date || game.date > masterScheduleUi.endDate)) return false;
      if (masterScheduleUi.sport && game.sport !== masterScheduleUi.sport) return false;
      if (masterScheduleUi.level && game.level !== masterScheduleUi.level) return false;
      if (masterScheduleUi.status && game.status !== masterScheduleUi.status) return false;
      if (masterScheduleUi.conferenceLevel && game.conferenceLevel !== masterScheduleUi.conferenceLevel) return false;
      if (masterScheduleUi.gender && game.gender !== masterScheduleUi.gender) return false;
      if (masterScheduleUi.school) {
        const schoolText = [game.school, game.homeTeam, game.awayTeam].join(' ').toLowerCase();
        if (!schoolText.includes(masterScheduleUi.school.toLowerCase())) return false;
      }
      if (masterScheduleUi.venue && ![game.gymName, game.address].join(' ').toLowerCase().includes(masterScheduleUi.venue.toLowerCase())) return false;
      if (masterScheduleUi.conflictsOnly && !masterGameConflictReasons(game).length) return false;
      if (query) {
        const haystack = [game.date, game.startTime, game.sport, game.level, game.gender, game.conferenceLevel, game.school, game.homeTeam, game.awayTeam, game.gymName, game.address, game.status, game.notes, masterCrewName(game.refereeId), masterCrewName(game.umpire1Id), masterCrewName(game.umpire2Id), masterCrewName(game.alternateId)].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    }).sort((a, b) => `${a.date}${a.startTime}${a.homeTeam}`.localeCompare(`${b.date}${b.startTime}${b.homeTeam}`));
  }

  function masterScheduleMetrics(games) {
    const requiredAssigned = games.reduce((sum, game) => sum + masterPrimaryRoleKeys(game).filter((role) => game[role]).length, 0);
    const crewSlots = games.reduce((sum, game) => sum + masterPrimaryRoleKeys(game).length, 0);
    return {
      total: games.length,
      crewAssigned: requiredAssigned,
      crewSlots,
      published: games.filter((game) => game.status === 'Published').length,
      pending: games.filter((game) => game.status === 'Pending').length,
      unpublished: games.filter((game) => ['Draft', 'Unpublished'].includes(game.status)).length,
      conflicts: games.filter((game) => masterGameConflictReasons(game).length).length
    };
  }
  function masterStatusClass(status = '') {
    return `master-status--${String(status).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }

  function masterGameCrewMarkup(game) {
    const normalized = normalizeMasterGame(game);
    const positions = normalized.crewSize === 2
      ? [['R', normalized.refereeId], ['U', normalized.umpire1Id], ['ALT', normalized.alternateId]]
      : [['R', normalized.refereeId], ['U1', normalized.umpire1Id], ['U2', normalized.umpire2Id], ['ALT', normalized.alternateId]];
    return `<div class="master-crew-list">${positions.map(([role, id]) => `<span class="${id ? '' : 'is-unassigned'}"><b>${role}</b><em>${esc(masterCrewName(id) || 'Unassigned')}</em></span>`).join('')}</div>`;
  }
  function masterGameRow(game) {
    const conflicts = masterGameConflictReasons(game);
    const crewPercent = masterCrewPercent(game);
    const venue = [game.gymName, game.address].filter(Boolean).join(' · ');
    const primaryRoles = masterPrimaryRoleKeys(game);
    const assignedCount = primaryRoles.filter((role) => game[role]).length;
    return `<tr class="${conflicts.length ? 'has-conflict' : ''}">
      <td data-label="Select"><input type="checkbox" data-master-select value="${esc(game.id)}" ${masterScheduleUi.selected.has(game.id) ? 'checked' : ''} aria-label="Select ${esc([game.homeTeam, game.awayTeam].filter(Boolean).join(' versus '))}"></td>
      <td data-label="Date"><div class="master-date-cell"><strong>${game.date ? fmtDate(game.date) : 'Date not entered'}</strong><span>${game.startTime ? calendarTime(game.startTime) : 'Time not entered'}${game.timeZone ? ` · ${esc(game.timeZone)}` : ''}</span></div></td>
      <td data-label="Sport"><strong>${esc(game.sport || 'Not entered')}</strong><small>${esc([`${game.crewSize}-man crew`, game.level, game.gender, game.conferenceLevel].filter(Boolean).join(' · ') || 'Classification not entered')}</small></td>
      <td data-label="Teams"><div class="master-matchup"><strong>${esc(game.homeTeam || 'Home team not entered')}</strong><span>vs.</span><strong>${esc(game.awayTeam || 'Away team not entered')}</strong>${game.school ? `<small>${esc(game.school)}</small>` : ''}</div></td>
      <td data-label="Venue"><div class="master-venue-cell">${icon('i-pin')}<span>${esc(venue || 'Venue not entered')}</span></div></td>
      <td data-label="Crew">${masterGameCrewMarkup(game)}</td>
      <td data-label="Crew Status"><div class="master-crew-status"><strong>${crewPercent}%</strong><span>${assignedCount} / ${primaryRoles.length} assigned</span></div></td>
      <td data-label="Publish Status"><div class="master-publish-cell"><span class="master-status ${masterStatusClass(game.status)}">${esc(game.status)}</span>${game.publishedAt ? `<small>${fmtDateTime(game.publishedAt)}</small>` : ''}${conflicts.length ? `<button type="button" class="master-conflict-button" data-action="show-master-conflicts" data-id="${game.id}">${conflicts.length} conflict${conflicts.length === 1 ? '' : 's'}</button>` : ''}</div></td>
      <td data-label="Actions"><details class="assignment-row-menu"><summary aria-label="Open game actions">${icon('i-dots')}</summary><div><button type="button" data-action="edit-master-game" data-id="${game.id}">${icon('i-edit')}Edit game</button><button type="button" data-action="duplicate-master-game" data-id="${game.id}">${icon('i-copy')}Duplicate</button><button type="button" data-action="toggle-master-publish" data-id="${game.id}">${icon(game.status === 'Published' ? 'i-close' : 'i-check')}${game.status === 'Published' ? 'Unpublish' : 'Publish'}</button><button type="button" data-action="delete-master-game" data-id="${game.id}">${icon('i-trash')}Delete</button></div></details></td>
    </tr>`;
  }
  function masterGameDialog() {
    const rosterOptions = masterCrewOptions();
    const schoolValues = [...new Set((state.schools || []).map((item) => item.name || item.organization || item.schoolName).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return `<dialog class="master-game-dialog" data-master-game-dialog aria-labelledby="master-game-dialog-title"><form data-form="master-game"><header><div><p>Master Schedule</p><h2 id="master-game-dialog-title" data-master-game-dialog-title>Add Game</h2></div><button type="button" data-action="close-master-game-dialog" aria-label="Close game form">${icon('i-close')}</button></header><input type="hidden" name="id"><div class="master-game-form-grid">
      <label><span>Date</span><input name="date" type="date" required></label><label><span>Start Time</span><input name="startTime" type="time" required></label><label><span>Time Zone</span><input name="timeZone" type="text"></label>
      <label><span>Sport</span><input name="sport" type="text"></label><label><span>Level</span><input name="level" type="text" required></label><label><span>Gender</span><input name="gender" type="text"></label>
      <label><span>Crew Size</span><select name="crewSize">${option('2', '3', '2-Man Crew')}${option('3', '3', '3-Man Crew')}</select></label><label><span>Conference Level</span><input name="conferenceLevel" type="text"></label><label><span>School / Organization</span><input name="school" type="text" list="master-school-values"></label><label><span>Status</span><select name="status">${['Draft','Pending','Published','Unpublished','Canceled'].map((value) => option(value, 'Draft')).join('')}</select></label>
      <label><span>Home Team</span><input name="homeTeam" type="text" required></label><label><span>Away Team</span><input name="awayTeam" type="text" required></label><label><span>Gym / Venue</span><input name="gymName" type="text" required></label>
      <label class="is-wide"><span>Venue Address</span><input name="address" type="text"></label><label><span>Venue Phone</span><input name="venuePhone" type="tel"></label>
      <label><span>Round-Trip Travel Miles <small>(optional)</small></span><input name="travelMiles" type="number" min="0" step="0.1"></label>
      <fieldset class="is-wide"><legend>Officiating Crew</legend><label><span>Referee</span><select name="refereeId">${rosterOptions}</select></label><label><span>Umpire</span><select name="umpire1Id">${rosterOptions}</select></label><label data-master-umpire2-wrapper><span>Umpire 2</span><select name="umpire2Id">${rosterOptions}</select></label><label><span>Alternate</span><select name="alternateId">${rosterOptions}</select></label></fieldset>
      <label class="is-wide"><span>Internal Notes</span><textarea name="notes" rows="4"></textarea></label>
      <datalist id="master-school-values">${schoolValues.map((value) => `<option value="${esc(value)}"></option>`).join('')}</datalist>
    </div><footer><button type="button" class="assignment-secondary-button" data-action="close-master-game-dialog">Cancel</button><button type="submit" class="assignment-primary-button">Save Game</button></footer></form></dialog>`;
  }
  function masterConflictDialog() {
    return `<dialog class="master-conflict-dialog" data-master-conflict-dialog aria-labelledby="master-conflict-title"><header><div><p>Schedule Conflict</p><h2 id="master-conflict-title">Conflict Details</h2></div><button type="button" data-action="close-master-conflict-dialog" aria-label="Close conflict details">${icon('i-close')}</button></header><div data-master-conflict-body></div><footer><button type="button" data-action="close-master-conflict-dialog">Close</button></footer></dialog>`;
  }

  function unpublishedScheduleBaseGames() {
    return (state.masterGames || []).map(normalizeMasterGame).filter((game) => game.crewSize === 3 && !['Published', 'Canceled'].includes(game.status));
  }

  function unpublishedGamePay(game) {
    const normalized = normalizeMasterGame(game);
    const records = masterPrimaryRoleKeys(normalized).map((role) => createGameOfficialById(normalized[role]));
    if (records.length !== 3 || records.some((record) => !record || !(record.payRate > 0))) return null;
    return records.reduce((sum, record) => sum + record.payRate, 0);
  }

  function unpublishedScheduleValues(key) {
    return [...new Set(unpublishedScheduleBaseGames().map((game) => game[key]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
  }

  function unpublishedScheduleFilteredGames() {
    const query = unpublishedScheduleUi.query.trim().toLowerCase();
    const direction = unpublishedScheduleUi.sortDir === 'desc' ? -1 : 1;
    const games = unpublishedScheduleBaseGames().filter((game) => {
      if (unpublishedScheduleUi.startDate && (!game.date || game.date < unpublishedScheduleUi.startDate)) return false;
      if (unpublishedScheduleUi.endDate && (!game.date || game.date > unpublishedScheduleUi.endDate)) return false;
      if (unpublishedScheduleUi.level && game.level !== unpublishedScheduleUi.level) return false;
      if (unpublishedScheduleUi.venue && game.gymName !== unpublishedScheduleUi.venue) return false;
      if (unpublishedScheduleUi.status && game.status !== unpublishedScheduleUi.status) return false;
      if (unpublishedScheduleUi.sport && game.sport !== unpublishedScheduleUi.sport) return false;
      if (unpublishedScheduleUi.gender && game.gender !== unpublishedScheduleUi.gender) return false;
      if (unpublishedScheduleUi.school) {
        const schoolText = [game.school, game.homeTeam, game.awayTeam].join(' ').toLowerCase();
        if (!schoolText.includes(unpublishedScheduleUi.school.toLowerCase())) return false;
      }
      if (unpublishedScheduleUi.conflictsOnly && !masterGameConflictReasons(game).length) return false;
      if (query) {
        const haystack = [game.date, game.startTime, game.level, game.gender, game.sport, game.homeTeam, game.awayTeam, game.gymName, game.address, game.status, masterCrewName(game.refereeId), masterCrewName(game.umpire1Id), masterCrewName(game.umpire2Id)].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    const keyValue = (game) => {
      if (unpublishedScheduleUi.sortKey === 'matchup') return `${game.homeTeam} ${game.awayTeam}`.toLowerCase();
      if (unpublishedScheduleUi.sortKey === 'level') return `${game.level} ${game.gender}`.toLowerCase();
      if (unpublishedScheduleUi.sortKey === 'location') return `${game.gymName} ${game.address}`.toLowerCase();
      if (unpublishedScheduleUi.sortKey === 'status') return game.status.toLowerCase();
      if (unpublishedScheduleUi.sortKey === 'pay') return unpublishedGamePay(game) ?? -1;
      return `${game.date}${game.startTime}${game.homeTeam}`.toLowerCase();
    };
    return games.sort((a, b) => {
      const left = keyValue(a), right = keyValue(b);
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction;
      return String(left).localeCompare(String(right)) * direction;
    });
  }

  function unpublishedScheduleDateLabel() {
    const baseDates = unpublishedScheduleBaseGames().map((game) => game.date).filter(Boolean).sort();
    const start = unpublishedScheduleUi.startDate || baseDates[0] || '';
    const end = unpublishedScheduleUi.endDate || baseDates[baseDates.length - 1] || '';
    if (!start && !end) return 'All game dates';
    if (start && end && start !== end) return `${fmtDate(start)} – ${fmtDate(end)}`;
    return fmtDate(start || end);
  }

  function unpublishedScheduleMetrics(games) {
    const today = dateKey(new Date());
    const payValues = games.map(unpublishedGamePay).filter((value) => value != null);
    return {
      total: games.length,
      upcoming: games.filter((game) => game.date && game.date >= today).length,
      unpublished: games.filter((game) => ['Draft', 'Pending', 'Unpublished'].includes(game.status)).length,
      officials: games.reduce((sum, game) => sum + masterPrimaryRoleKeys(game).filter((role) => game[role]).length, 0),
      payTotal: payValues.reduce((sum, value) => sum + value, 0),
      payRecorded: payValues.length
    };
  }

  function unpublishedTeamMark(teamName = '') {
    const logo = createGameSchoolLogo(teamName);
    return logo ? `<span class="unpublished-team-mark"><img src="${esc(logo)}" alt=""></span>` : `<span class="unpublished-team-mark is-monogram">${esc(teamMonogram(teamName))}</span>`;
  }

  function unpublishedMatchup(game) {
    return `<div class="unpublished-matchup"><div>${unpublishedTeamMark(game.homeTeam)}<span><strong>${esc(game.homeTeam || 'Home team not recorded')}</strong><small>Home</small></span></div><b>vs</b><div>${unpublishedTeamMark(game.awayTeam)}<span><strong>${esc(game.awayTeam || 'Visiting team not recorded')}</strong><small>Visiting</small></span></div></div>`;
  }

  function unpublishedCrewMember(role, id) {
    const record = createGameOfficialById(id);
    const name = record?.name || masterCrewName(id);
    return `<div class="unpublished-crew-member ${name ? '' : 'is-unassigned'}"><span class="unpublished-crew-avatar">${name ? esc(createGameInitials(name)) : icon('i-user')}</span><span><small>${esc(role)}</small><strong>${esc(name || 'Unassigned')}</strong></span></div>`;
  }

  function unpublishedCrew(game) {
    return `<div class="unpublished-crew-grid">${unpublishedCrewMember('Referee', game.refereeId)}${unpublishedCrewMember('Umpire 1', game.umpire1Id)}${unpublishedCrewMember('Umpire 2', game.umpire2Id)}</div>`;
  }

  function unpublishedSortButton(label, key) {
    const active = unpublishedScheduleUi.sortKey === key;
    const direction = active && unpublishedScheduleUi.sortDir === 'desc' ? 'descending' : 'ascending';
    return `<button type="button" class="unpublished-sort ${active ? 'is-active' : ''}" data-action="sort-unpublished" data-key="${key}" aria-label="Sort ${esc(label)} ${direction}">${esc(label)}<span aria-hidden="true">${active ? (unpublishedScheduleUi.sortDir === 'desc' ? '↓' : '↑') : '↕'}</span></button>`;
  }

  function unpublishedGameRow(game) {
    const pay = unpublishedGamePay(game);
    const conflicts = masterGameConflictReasons(game);
    const addressLines = String(game.address || '').split(',').map((part) => part.trim()).filter(Boolean);
    return `<tr class="${conflicts.length ? 'has-conflict' : ''}">
      <td data-label="Date & Time"><time datetime="${esc([game.date, game.startTime].filter(Boolean).join('T'))}"><strong>${game.date ? esc(fmtDate(game.date)) : 'Date not recorded'}</strong><span>${game.startTime ? esc(calendarTime(game.startTime)) : 'Time not recorded'}</span></time></td>
      <td data-label="Matchup">${unpublishedMatchup(game)}</td>
      <td data-label="Level"><div class="unpublished-level"><span>${esc(game.level || 'Not recorded')}</span>${game.gender ? `<span>${esc(game.gender)}</span>` : ''}${game.sport ? `<small>${esc(game.sport)}</small>` : ''}</div></td>
      <td data-label="Location"><div class="unpublished-location">${icon('i-pin')}<span><strong>${esc(game.gymName || 'Venue not recorded')}</strong>${addressLines.map((line) => `<small>${esc(line)}</small>`).join('')}</span></div></td>
      <td data-label="Crew">${unpublishedCrew(game)}</td>
      <td data-label="Status"><div class="unpublished-status-wrap"><span class="unpublished-status ${masterStatusClass(game.status)}">${esc(game.status)}</span>${conflicts.length ? `<button type="button" data-action="show-master-conflicts" data-id="${esc(game.id)}">${conflicts.length} conflict${conflicts.length === 1 ? '' : 's'}</button>` : ''}</div></td>
      <td data-label="Estimated Pay"><strong class="unpublished-pay">${pay == null ? 'Not recorded' : esc(money(pay))}</strong></td>
      <td data-label="Actions"><details class="assignment-row-menu unpublished-row-menu"><summary aria-label="Open game actions">${icon('i-dots')}</summary><div><button type="button" data-action="edit-master-game" data-id="${esc(game.id)}">${icon('i-edit')}Edit game</button><button type="button" data-action="toggle-master-publish" data-id="${esc(game.id)}">${icon('i-upload')}Publish game</button><button type="button" data-action="duplicate-master-game" data-id="${esc(game.id)}">${icon('i-copy')}Duplicate</button>${conflicts.length ? `<button type="button" data-action="show-master-conflicts" data-id="${esc(game.id)}">${icon('i-help')}View conflicts</button>` : ''}<button type="button" data-action="delete-master-game" data-id="${esc(game.id)}">${icon('i-trash')}Delete</button></div></details></td>
    </tr>`;
  }

  function unpublishedPagination(pageCount) {
    const current = unpublishedScheduleUi.page;
    const pages = [];
    const start = Math.max(1, Math.min(current - 2, pageCount - 4));
    const end = Math.min(pageCount, Math.max(5, current + 2));
    for (let page = start; page <= end; page += 1) pages.push(page);
    return `<div class="unpublished-pagination"><button type="button" data-action="unpublished-page" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''} aria-label="Previous page">‹</button>${pages.map((page) => `<button type="button" class="${page === current ? 'is-active' : ''}" data-action="unpublished-page" data-page="${page}">${page}</button>`).join('')}<button type="button" data-action="unpublished-page" data-page="${current + 1}" ${current >= pageCount ? 'disabled' : ''} aria-label="Next page">›</button></div>`;
  }

  function exportUnpublishedSchedule() {
    const games = unpublishedScheduleFilteredGames();
    const rows = games.map((game) => ({
      date: game.date,
      startTime: game.startTime,
      sport: game.sport,
      level: game.level,
      gender: game.gender,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      venue: game.gymName,
      address: game.address,
      referee: masterCrewName(game.refereeId),
      umpire1: masterCrewName(game.umpire1Id),
      umpire2: masterCrewName(game.umpire2Id),
      status: game.status,
      estimatedPay: unpublishedGamePay(game) ?? '',
      conflicts: masterGameConflictReasons(game).join(' | ')
    }));
    exportCSV('got-u-nex-ref-unpublished-3-man-games.csv', rows, ['date','startTime','sport','level','gender','homeTeam','awayTeam','venue','address','referee','umpire1','umpire2','status','estimatedPay','conflicts']);
  }

  function renderUnpublishedSchedule() {
    const games = unpublishedScheduleFilteredGames();
    const pageCount = Math.max(1, Math.ceil(games.length / unpublishedScheduleUi.pageSize));
    unpublishedScheduleUi.page = Math.min(Math.max(unpublishedScheduleUi.page, 1), pageCount);
    const startIndex = (unpublishedScheduleUi.page - 1) * unpublishedScheduleUi.pageSize;
    const pageGames = games.slice(startIndex, startIndex + unpublishedScheduleUi.pageSize);
    const firstShown = games.length ? startIndex + 1 : 0;
    const lastShown = Math.min(startIndex + unpublishedScheduleUi.pageSize, games.length);
    const metrics = unpublishedScheduleMetrics(games);
    const levels = unpublishedScheduleValues('level');
    const venues = unpublishedScheduleValues('gymName');
    const statuses = unpublishedScheduleValues('status');
    const sports = unpublishedScheduleValues('sport');
    const genders = unpublishedScheduleValues('gender');
    const schools = [...new Set(unpublishedScheduleBaseGames().flatMap((game) => [game.school, game.homeTeam, game.awayTeam]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const payLabel = metrics.payRecorded ? money(metrics.payTotal) : 'Not recorded';
    return `<section class="unpublished-schedule-page" aria-labelledby="unpublished-schedule-title">
      <header class="unpublished-heading"><div><h1 id="unpublished-schedule-title"><span>Unpublished</span> Master Schedule</h1><p>3-Man crews assigned. Officials will not see these games until published.</p></div><div><button type="button" class="unpublished-export" data-action="export-unpublished-schedule">${icon('i-download')}Export</button><button type="button" class="unpublished-publish" data-action="publish-unpublished-games">${icon('i-upload')}Publish Games</button></div></header>
      <section class="unpublished-toolbar" aria-label="Unpublished schedule filters">
        <details class="unpublished-date-range"><summary>${icon('i-calendar')}<span>${esc(unpublishedScheduleDateLabel())}</span>${icon('i-chevron')}</summary><div><label><span>Start Date</span><input type="date" value="${esc(unpublishedScheduleUi.startDate)}" data-unpublished-filter="startDate"></label><label><span>End Date</span><input type="date" value="${esc(unpublishedScheduleUi.endDate)}" data-unpublished-filter="endDate"></label><button type="button" data-action="clear-unpublished-dates">Clear Dates</button></div></details>
        <label><span class="sr-only">Level</span><select data-unpublished-filter="level"><option value="">All Levels</option>${levels.map((value) => option(value, unpublishedScheduleUi.level)).join('')}</select></label>
        <label><span class="sr-only">Venue</span><select data-unpublished-filter="venue"><option value="">All Venues</option>${venues.map((value) => option(value, unpublishedScheduleUi.venue)).join('')}</select></label>
        <label><span class="sr-only">Status</span><select data-unpublished-filter="status"><option value="">All Statuses</option>${statuses.map((value) => option(value, unpublishedScheduleUi.status)).join('')}</select></label>
        <label class="unpublished-search">${icon('i-search')}<span class="sr-only">Search games</span><input type="search" value="${esc(unpublishedScheduleUi.query)}" data-unpublished-query aria-label="Search games"></label>
        <button type="button" class="unpublished-filter-button ${unpublishedScheduleUi.filtersOpen ? 'is-active' : ''}" data-action="toggle-unpublished-filters" aria-expanded="${unpublishedScheduleUi.filtersOpen}">${icon('i-filter')}Filters</button>
      </section>
      <section class="unpublished-advanced-filters" ${unpublishedScheduleUi.filtersOpen ? '' : 'hidden'}><label><span>Sport</span><select data-unpublished-filter="sport"><option value="">All Sports</option>${sports.map((value) => option(value, unpublishedScheduleUi.sport)).join('')}</select></label><label><span>Gender</span><select data-unpublished-filter="gender"><option value="">All Genders</option>${genders.map((value) => option(value, unpublishedScheduleUi.gender)).join('')}</select></label><label><span>School / Team</span><select data-unpublished-filter="school"><option value="">All Schools / Teams</option>${schools.map((value) => option(value, unpublishedScheduleUi.school)).join('')}</select></label><label class="unpublished-conflict-toggle"><input type="checkbox" data-unpublished-filter="conflictsOnly" ${unpublishedScheduleUi.conflictsOnly ? 'checked' : ''}><span>Only games with conflicts</span></label><button type="button" data-action="clear-unpublished-filters">Clear Filters</button></section>
      <section class="unpublished-metrics" aria-label="Unpublished schedule totals">
        <article><span>${icon('i-calendar')}</span><div><small>Total Games</small><strong>${metrics.total}</strong><p>${esc(unpublishedScheduleDateLabel())}</p></div></article>
        <article><span>${icon('i-clock')}</span><div><small>Upcoming Games</small><strong>${metrics.upcoming}</strong><p>${metrics.total ? `${Math.round((metrics.upcoming / metrics.total) * 100)}%` : '0%'}</p></div></article>
        <article><span>${icon('i-eye')}</span><div><small>Unpublished</small><strong>${metrics.unpublished}</strong><p>${metrics.total ? `${Math.round((metrics.unpublished / metrics.total) * 100)}%` : '0%'}</p></div></article>
        <article><span>${icon('i-user')}</span><div><small>Assigned Officials</small><strong>${metrics.officials}</strong><p>${metrics.total ? `${(metrics.officials / metrics.total).toFixed(1)} per game (avg)` : 'No games in view'}</p></div></article>
        <article><span>${icon('i-card')}</span><div><small>Est. Total Pay</small><strong>${esc(payLabel)}</strong><p>${metrics.payRecorded} of ${metrics.total} games have complete rates</p></div></article>
      </section>
      <section class="unpublished-table-panel"><div class="unpublished-table-scroll"><table class="unpublished-table"><thead><tr><th>${unpublishedSortButton('Date & Time', 'date')}</th><th>${unpublishedSortButton('Matchup', 'matchup')}</th><th>${unpublishedSortButton('Level', 'level')}</th><th>${unpublishedSortButton('Location', 'location')}</th><th>${unpublishedSortButton('Crew (3-Man)', 'crew')}</th><th>${unpublishedSortButton('Status', 'status')}</th><th>${unpublishedSortButton('Est. Pay', 'pay')}</th><th>Actions</th></tr></thead><tbody>${pageGames.length ? pageGames.map(unpublishedGameRow).join('') : `<tr><td colspan="8"><div class="unpublished-empty">${icon('i-calendar')}<strong>No unpublished 3-man games match this view.</strong><p>Games appear here after they are created or saved without being published.</p><div><button type="button" data-action="set-assignment-section" data-section="create-game-3">Create 3-Man Assignment</button><button type="button" data-action="set-assignment-section" data-section="master">Open Master Schedule</button></div></div></td></tr>`}</tbody></table></div><footer><p>Showing ${firstShown} to ${lastShown} of ${games.length} games</p><div>${unpublishedPagination(pageCount)}<label><span class="sr-only">Games per page</span><select data-unpublished-page-size>${[10,25,50].map((value) => option(String(value), String(unpublishedScheduleUi.pageSize), `${value} per page`)).join('')}</select></label></div></footer></section>
      ${masterGameDialog()}${masterConflictDialog()}
    </section>`;
  }

  function renderMasterSchedule() {
    const games = filteredMasterGames();
    const pageCount = Math.max(1, Math.ceil(games.length / masterScheduleUi.pageSize));
    masterScheduleUi.page = Math.min(Math.max(masterScheduleUi.page, 1), pageCount);
    const startIndex = (masterScheduleUi.page - 1) * masterScheduleUi.pageSize;
    const pageGames = games.slice(startIndex, startIndex + masterScheduleUi.pageSize);
    const firstShown = games.length ? startIndex + 1 : 0;
    const lastShown = Math.min(startIndex + masterScheduleUi.pageSize, games.length);
    const metrics = masterScheduleMetrics(games);
    const sports = masterUniqueValues('sport');
    const levels = masterUniqueValues('level');
    const statuses = masterUniqueValues('status');
    const schools = [...new Set((state.masterGames || []).flatMap((item) => [item.school, item.homeTeam, item.awayTeam]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const conferenceLevels = masterUniqueValues('conferenceLevel');
    const genders = masterUniqueValues('gender');
    const allPageSelected = pageGames.length && pageGames.every((game) => masterScheduleUi.selected.has(game.id));
    return `<section class="master-schedule-page">
      <header class="master-schedule-heading"><div><h1>Master Schedule</h1><p>Manage, assign, publish, import, and export games created by authorized dashboard users.</p></div><div><input type="file" accept=".csv,text/csv" data-master-import hidden><button type="button" class="master-secondary-action" data-action="import-master-schedule">${icon('i-upload')}Import Schedule</button><button type="button" class="master-primary-action" data-action="new-master-game">${icon('i-plus')}Add Game</button></div></header>
      <section class="master-filter-panel" aria-label="Master schedule filters"><div class="master-filter-grid">
        <label><span>Start Date</span><input type="date" value="${esc(masterScheduleUi.startDate)}" data-master-filter="startDate"></label><label><span>End Date</span><input type="date" value="${esc(masterScheduleUi.endDate)}" data-master-filter="endDate"></label>
        <label><span>Sport</span><select data-master-filter="sport"><option value="">All Sports</option>${sports.map((value) => option(value, masterScheduleUi.sport)).join('')}</select></label><label><span>Level</span><select data-master-filter="level"><option value="">All Levels</option>${levels.map((value) => option(value, masterScheduleUi.level)).join('')}</select></label>
        <label><span>Status</span><select data-master-filter="status"><option value="">All Statuses</option>${statuses.map((value) => option(value, masterScheduleUi.status)).join('')}</select></label><label><span>School / Team</span><select data-master-filter="school"><option value="">All Schools / Teams</option>${schools.map((value) => option(value, masterScheduleUi.school)).join('')}</select></label>
        <label><span>Conference Level</span><select data-master-filter="conferenceLevel"><option value="">All Conference Levels</option>${conferenceLevels.map((value) => option(value, masterScheduleUi.conferenceLevel)).join('')}</select></label><label><span>Gender</span><select data-master-filter="gender"><option value="">All Genders</option>${genders.map((value) => option(value, masterScheduleUi.gender)).join('')}</select></label>
      </div><div class="master-search-row"><label>${icon('i-search')}<span class="sr-only">Search games</span><input type="search" value="${esc(masterScheduleUi.query)}" data-master-query aria-label="Search games"></label><button type="button" data-action="toggle-master-advanced" aria-expanded="${masterScheduleUi.advancedOpen}">${icon('i-filter')}Advanced Filters</button><button type="button" data-action="clear-master-filters">Clear All</button><button type="button" class="is-primary" data-action="apply-master-filters">Apply Filters</button></div>
      <div class="master-advanced-filters" ${masterScheduleUi.advancedOpen ? '' : 'hidden'}><label><span>Venue contains</span><input type="text" value="${esc(masterScheduleUi.venue)}" data-master-filter="venue"></label><label class="master-conflict-toggle"><input type="checkbox" data-master-filter="conflictsOnly" ${masterScheduleUi.conflictsOnly ? 'checked' : ''}><span>Show only games with conflicts</span></label></div></section>
      <section class="master-metrics" aria-label="Schedule totals"><article>${icon('i-calendar')}<div><strong>${metrics.total}</strong><span>Total Games</span><small>Matching filters</small></div></article><article>${icon('i-user')}<div><strong>${metrics.crewAssigned}</strong><span>Crew Assignments</span><small>${metrics.crewSlots} required slots</small></div></article><article>${icon('i-check')}<div><strong>${metrics.published}</strong><span>Published</span><small>${metrics.total ? Math.round((metrics.published / metrics.total) * 100) : 0}% of filtered games</small></div></article><article>${icon('i-clock')}<div><strong>${metrics.pending}</strong><span>Pending</span><small>Awaiting action</small></div></article><article>${icon('i-file')}<div><strong>${metrics.unpublished}</strong><span>Draft / Unpublished</span><small>Not public</small></div></article><article class="${metrics.conflicts ? 'has-alert' : ''}">${icon('i-help')}<div><strong>${metrics.conflicts}</strong><span>Conflicts</span><small>${metrics.conflicts ? 'Needs resolution' : 'No conflicts detected'}</small></div></article></section>
      <section class="master-table-panel"><div class="master-table-toolbar"><div><select data-master-bulk-action aria-label="Bulk action"><option value="">Bulk Actions</option><option value="publish">Publish selected</option><option value="unpublish">Unpublish selected</option><option value="delete">Delete selected</option></select><button type="button" data-action="apply-master-bulk">Apply</button></div><div><button type="button" class="master-publish-button" data-action="publish-master-schedule">${icon('i-check')}Publish Schedule</button><button type="button" data-action="export-master-schedule">${icon('i-download')}Export</button></div></div>
      <div class="master-table-scroll"><table class="master-table"><thead><tr><th><input type="checkbox" data-master-select-all ${allPageSelected ? 'checked' : ''} aria-label="Select all games on this page"></th><th>Date</th><th>Sport</th><th>Home Team / Away Team</th><th>Gym Location</th><th>Officiating Crew</th><th>Crew Status</th><th>Publish Status</th><th>Actions</th></tr></thead><tbody>${pageGames.length ? pageGames.map(masterGameRow).join('') : `<tr><td colspan="9"><div class="master-empty-state">${icon('i-calendar')}<strong>No games match this schedule view.</strong><p>Add a game, import a CSV schedule, or adjust the filters.</p><div><button type="button" data-action="new-master-game">Add Game</button><button type="button" data-action="import-master-schedule">Import Schedule</button></div></div></td></tr>`}</tbody></table></div>
      <footer class="master-table-footer"><p>Showing ${firstShown} to ${lastShown} of ${games.length} games</p><div><button type="button" data-action="master-page" data-page="${masterScheduleUi.page - 1}" ${masterScheduleUi.page <= 1 ? 'disabled' : ''} aria-label="Previous page">‹</button><span>${masterScheduleUi.page}</span><button type="button" data-action="master-page" data-page="${masterScheduleUi.page + 1}" ${masterScheduleUi.page >= pageCount ? 'disabled' : ''} aria-label="Next page">›</button><label><span class="sr-only">Rows per page</span><select data-master-page-size>${[10,25,50].map((value) => option(String(value), String(masterScheduleUi.pageSize), `${value} per page`)).join('')}</select></label></div></footer></section>
      ${masterGameDialog()}${masterConflictDialog()}
    </section>`;
  }


  function currentProfileRosterIds() {
    const profile = state.profile || {};
    const email = String(profile.email || '').trim().toLowerCase();
    const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim().toLowerCase();
    if (!email && !name) return new Set();
    const ids = new Set(['profile:self']);
    (state.officials || []).forEach((official) => {
      const officialName = [official.firstName, official.lastName].filter(Boolean).join(' ').trim().toLowerCase();
      if ((email && String(official.email || '').trim().toLowerCase() === email) || (name && officialName === name)) ids.add(`official:${official.id}`);
    });
    (state.users || []).filter((user) => user.role === 'official').forEach((user) => {
      const userName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim().toLowerCase();
      if ((email && String(user.email || '').trim().toLowerCase() === email) || (name && userName === name)) ids.add(`user:${user.id}`);
    });
    return ids;
  }

  function myGameAssignmentKey(game) {
    const ids = currentProfileRosterIds();
    return [game.refereeId, game.umpire1Id, game.umpire2Id, game.alternateId].find((id) => ids.has(id)) || '';
  }

  function myGamePosition(game) {
    const normalized = normalizeMasterGame(game);
    const ids = currentProfileRosterIds();
    const positions = normalized.crewSize === 2
      ? [['Referee', normalized.refereeId], ['Umpire', normalized.umpire1Id], ['Alternate', normalized.alternateId]]
      : [['Referee', normalized.refereeId], ['Umpire 1', normalized.umpire1Id], ['Umpire 2', normalized.umpire2Id], ['Alternate', normalized.alternateId]];
    return positions.filter(([, id]) => ids.has(id)).map(([label]) => label).join(' / ');
  }
  function myGameResponseRecord(game) {
    const key = myGameAssignmentKey(game);
    return key ? (game.officialResponses?.[key] || null) : null;
  }

  function myGameResponseStatus(game) {
    if (game.status === 'Canceled') return 'Canceled';
    return myGameResponseRecord(game)?.status || 'Pending';
  }

  function myGameDateTime(game) {
    if (!game.date) return null;
    const value = `${game.date}T${game.startTime || '00:00'}:00`;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function myGameIsPast(game) {
    const date = myGameDateTime(game);
    return date ? date.getTime() < Date.now() : false;
  }

  function myGameRecords() {
    const hasProfile = currentProfileRosterIds().size > 0;
    if (!hasProfile) return [];
    const query = myGamesUi.query.trim().toLowerCase();
    const visible = (state.masterGames || []).map(normalizeMasterGame).filter((game) => {
      if (!myGameAssignmentKey(game)) return false;
      const response = myGameResponseStatus(game);
      if (!['Published', 'Canceled'].includes(game.status) && !myGameResponseRecord(game)) return false;
      if (myGamesUi.tab === 'upcoming' && (myGameIsPast(game) || ['Declined', 'Canceled'].includes(response))) return false;
      if (myGamesUi.tab === 'accepted' && response !== 'Accepted') return false;
      if (myGamesUi.tab === 'pending' && response !== 'Pending') return false;
      if (myGamesUi.tab === 'declined' && response !== 'Declined') return false;
      if (myGamesUi.tab === 'past' && !myGameIsPast(game)) return false;
      if (myGamesUi.startDate && (!game.date || game.date < myGamesUi.startDate)) return false;
      if (myGamesUi.endDate && (!game.date || game.date > myGamesUi.endDate)) return false;
      if (myGamesUi.sport && game.sport !== myGamesUi.sport) return false;
      if (myGamesUi.level && game.level !== myGamesUi.level) return false;
      if (myGamesUi.response && response !== myGamesUi.response) return false;
      if (query) {
        const haystack = [game.homeTeam, game.awayTeam, game.school, game.gymName, game.address, game.sport, game.level, game.gender, game.conferenceLevel, response, myGamePosition(game)].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    const direction = myGamesUi.sort === 'latest' ? -1 : 1;
    return visible.sort((a, b) => direction * `${a.date || ''}${a.startTime || ''}${a.homeTeam || ''}`.localeCompare(`${b.date || ''}${b.startTime || ''}${b.homeTeam || ''}`));
  }

  function myGameAllRecords() {
    if (!currentProfileRosterIds().size) return [];
    return (state.masterGames || []).map(normalizeMasterGame).filter((game) => myGameAssignmentKey(game) && (['Published', 'Canceled'].includes(game.status) || myGameResponseRecord(game)));
  }

  function teamMonogram(value = '') {
    const letters = String(value).trim().split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
    return letters || '—';
  }

  function myGameDateBadge(game) {
    if (!game.date) return `<time class="my-game-date"><span>DATE</span><strong>—</strong><small>Not entered</small></time>`;
    const date = dateFromKey(game.date);
    return `<time class="my-game-date" datetime="${esc(game.date)}"><span>${date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span><strong>${String(date.getDate()).padStart(2, '0')}</strong><small>${date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</small></time>`;
  }

  function myGameCrew(game) {
    const normalized = normalizeMasterGame(game);
    const positions = normalized.crewSize === 2
      ? [['R', normalized.refereeId], ['U', normalized.umpire1Id], ['ALT', normalized.alternateId]]
      : [['R', normalized.refereeId], ['U1', normalized.umpire1Id], ['U2', normalized.umpire2Id], ['ALT', normalized.alternateId]];
    return positions.filter(([, id]) => id).map(([position, id]) => `<span><b>${position}</b><em>${esc(masterCrewName(id))}</em></span>`).join('');
  }
  function myGameResponseClass(status = '') {
    return `is-${String(status || 'pending').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }

  function myGameCard(game) {
    const response = myGameResponseStatus(game);
    const responseRecord = myGameResponseRecord(game);
    const venue = [game.gymName, game.address].filter(Boolean).join(' · ');
    const crewCount = masterAllRoleKeys(game).filter((role) => game[role]).length;
    const classification = [game.level, game.gender, game.sport, game.conferenceLevel].filter(Boolean).join(' · ');
    return `<article class="my-game-card" data-my-game-id="${esc(game.id)}">
      ${myGameDateBadge(game)}
      <div class="my-game-matchup"><div class="my-game-team"><span class="my-game-monogram">${esc(teamMonogram(game.homeTeam))}</span><p><strong>${esc(game.homeTeam || 'Home team not entered')}</strong>${game.school ? `<small>${esc(game.school)}</small>` : ''}</p></div><span class="my-game-versus">VS</span><div class="my-game-team is-away"><p><strong>${esc(game.awayTeam || 'Away team not entered')}</strong>${game.school ? `<small>${esc(game.school)}</small>` : ''}</p><span class="my-game-monogram">${esc(teamMonogram(game.awayTeam))}</span></div></div>
      <div class="my-game-logistics"><p>${icon('i-clock')}<span><strong>${game.startTime ? esc(calendarTime(game.startTime)) : 'Time not entered'}</strong>${game.timeZone ? `<small>${esc(game.timeZone)}</small>` : ''}</span></p><p>${icon('i-pin')}<span><strong>${esc(game.gymName || 'Venue not entered')}</strong>${game.address ? `<small>${esc(game.address)}</small>` : ''}</span></p><p>${icon('i-user')}<span><strong>${crewCount} official${crewCount === 1 ? '' : 's'}</strong><small>${esc(myGamePosition(game) || 'Position not assigned')}</small></span></p></div>
      <div class="my-game-status"><span class="my-game-response ${myGameResponseClass(response)}">${esc(response)}</span>${game.publishedAt ? `<small>Assigned ${fmtDate(game.publishedAt.slice(0, 10))}</small>` : ''}<p>${esc(classification || 'Game classification not entered')}</p>${response === 'Declined' && responseRecord?.reason ? `<em>${esc(blockReasonDisplay({ reason: responseRecord.reason, notes: responseRecord.details }))}</em>` : ''}${response === 'Pending' ? `<div class="my-game-response-actions"><button type="button" data-action="accept-my-game" data-id="${game.id}">Accept</button><button type="button" data-action="decline-my-game" data-id="${game.id}">Decline</button></div>` : ''}</div>
      <div class="my-game-actions"><button type="button" data-action="view-my-game" data-id="${game.id}">${icon('i-eye')}View Details${icon('i-chevron')}</button><button type="button" data-action="add-my-game-calendar" data-id="${game.id}">${icon('i-calendar')}Add to Calendar${icon('i-chevron')}</button><button type="button" data-action="contact-my-game-crew" data-id="${game.id}">${icon('i-user')}Contact Crew${icon('i-chevron')}</button><button type="button" data-action="directions-my-game" data-id="${game.id}" ${game.address ? '' : 'disabled'}>${icon('i-pin')}Get Directions${icon('i-chevron')}</button></div>
    </article>`;
  }

  function myGameDetailsDialog() {
    return `<dialog class="my-game-dialog" data-my-game-dialog aria-labelledby="my-game-dialog-title"><header><div><p>Game Assignment</p><h2 id="my-game-dialog-title" data-my-game-dialog-title>Game Details</h2></div><button type="button" data-action="close-my-game-dialog" aria-label="Close game details">${icon('i-close')}</button></header><div data-my-game-dialog-body></div><footer><button type="button" data-action="close-my-game-dialog">Close</button></footer></dialog>`;
  }

  function gameDeclineReason(value = '') {
    return GAME_DECLINE_REASONS.find((item) => item.value === value) || null;
  }

  function gameDeclineReasonPicker(selected = '') {
    const current = gameDeclineReason(selected);
    return `<div class="game-decline-reason-picker" data-game-decline-reason-picker><label>Decline Reason</label><input type="hidden" name="reason" value="${esc(selected)}" required><button type="button" class="game-decline-reason-trigger" data-action="toggle-game-decline-reasons" aria-expanded="false"><span data-game-decline-reason-label>${current ? esc(current.label) : 'Select a reason...'}</span>${icon('i-chevron')}</button><div class="game-decline-reason-menu" data-game-decline-reason-menu hidden>${GAME_DECLINE_REASONS.map((reason) => `<button type="button" data-action="select-game-decline-reason" data-value="${esc(reason.value)}">${icon(reason.icon)}<span><strong>${esc(reason.label)}</strong><small>${esc(reason.description)}</small></span></button>`).join('')}</div></div>`;
  }

  function myGameDeclineDialog() {
    return `<dialog class="game-decline-dialog" data-my-game-decline-dialog aria-labelledby="my-game-decline-title"><form data-form="my-game-decline"><header><div><h2 id="my-game-decline-title">Decline Game Assignment</h2><p>Please let us know why you are declining this assignment.</p></div><button type="button" data-action="close-my-game-decline-dialog" aria-label="Close decline assignment dialog">${icon('i-close')}</button></header><input type="hidden" name="id"><input type="hidden" name="date"><input type="hidden" name="startTime"><input type="checkbox" name="addToCalendar" checked hidden><div class="game-decline-dialog__body">${gameDeclineReasonPicker()}<label class="game-decline-note"><span data-game-decline-note-label>Add a Note <small>(Optional)</small></span><textarea name="notes" rows="4" maxlength="250" data-my-game-decline-note placeholder="Add any additional details..."></textarea><small><span data-game-decline-note-count>0</span> / 250</small></label></div><footer><button type="button" class="game-decline-cancel" data-action="close-my-game-decline-dialog">Cancel</button><button type="submit" class="game-decline-submit">Decline Assignment</button></footer></form></dialog>`;
  }

  function updateGameDeclineReasonPicker(dialog, value = '') {
    const reason = gameDeclineReason(value);
    const hidden = dialog?.querySelector('input[name="reason"]');
    const label = dialog?.querySelector('[data-game-decline-reason-label]');
    const trigger = dialog?.querySelector('.game-decline-reason-trigger');
    const menu = dialog?.querySelector('[data-game-decline-reason-menu]');
    const note = dialog?.querySelector('textarea[name="notes"]');
    const noteLabel = dialog?.querySelector('[data-game-decline-note-label]');
    if (hidden) hidden.value = value;
    if (label) label.textContent = reason?.label || 'Select a reason...';
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (menu) menu.hidden = true;
    const required = value === 'other';
    if (note) { note.required = required; note.setAttribute('aria-required', String(required)); }
    if (noteLabel) noteLabel.innerHTML = required ? 'Add a Note <small>(Required)</small>' : 'Add a Note <small>(Optional)</small>';
  }

  function myGameTeamMark(teamName = '') {
    const logo = createGameSchoolLogo(teamName);
    return logo ? `<span class="game-detail-team-logo"><img src="${esc(logo)}" alt=""></span>` : `<span class="game-detail-team-logo is-monogram">${esc(teamMonogram(teamName))}</span>`;
  }

  function myGameCrewRows(game) {
    const normalized = normalizeMasterGame(game);
    const positions = normalized.crewSize === 2
      ? [['Referee', normalized.refereeId], ['Umpire', normalized.umpire1Id], ['Alternate', normalized.alternateId]]
      : [['Referee', normalized.refereeId], ['Umpire 1', normalized.umpire1Id], ['Umpire 2', normalized.umpire2Id], ['Alternate', normalized.alternateId]];
    const currentIds = currentProfileRosterIds();
    return positions.filter(([, id]) => id).map(([position, id]) => {
      const official = createGameOfficialById(id);
      const name = official?.name || masterCrewName(id);
      const isCurrent = currentIds.has(id);
      const supporting = [official?.city, official?.region].filter(Boolean).join(', ');
      return `<article class="game-detail-crew-row ${isCurrent ? 'is-current' : ''}"><span class="game-detail-crew-avatar">${esc(createGameInitials(name))}</span><div><small>${esc(position)}${isCurrent ? ' (You)' : ''}</small><strong>${esc(name)}</strong>${supporting ? `<em>${esc(supporting)}</em>` : ''}</div></article>`;
    }).join('');
  }

  function myGameRecordedPay(game) {
    const assignmentKey = myGameAssignmentKey(game);
    const official = createGameOfficialById(assignmentKey);
    return official?.payRate > 0 ? official.payRate : 0;
  }

  function myGameStatusLabel(game) {
    return String(game.status || 'Unpublished').toUpperCase();
  }

  function publishedAssignmentSchool(teamName = '') {
    return createGameSchoolRecord(teamName) || {};
  }

  function publishedAssignmentVenueRecord(game) {
    const normalized = normalizeMasterGame(game);
    const venueName = String(normalized.gymName || '').trim().toLowerCase();
    const venueAddress = String(normalized.address || '').trim().toLowerCase();
    return (state.schools || []).find((school) => {
      const savedName = String(school.venueName || '').trim().toLowerCase();
      const savedAddress = String(school.venueAddress || '').trim().toLowerCase();
      return (venueName && savedName === venueName) || (venueAddress && savedAddress === venueAddress);
    }) || publishedAssignmentSchool(normalized.homeTeam) || {};
  }

  function publishedAssignmentTeam(game, side) {
    const teamName = side === 'home' ? game.homeTeam : game.awayTeam;
    const school = publishedAssignmentSchool(teamName);
    const logo = safeUrl(school.logoUrl || school.logo || school.imageUrl || '');
    const schoolName = String(school.name || school.organization || school.schoolName || teamName || '').trim();
    const mascot = String(school.mascotName || school.teamName || '').trim();
    const displayName = mascot || schoolName;
    const showSchoolName = Boolean(mascot && schoolName && mascot.toLowerCase() !== schoolName.toLowerCase());
    const record = String(school.seasonRecord || school.teamRecord || '').trim();
    return `<div class="published-team published-team--${side}">${side === 'home' ? publishedAssignmentTeamMark(logo, schoolName) : ''}<div>${showSchoolName ? `<span>${esc(schoolName)}</span>` : ''}<strong>${esc(displayName)}</strong>${record ? `<small>${esc(record)}</small>` : ''}</div>${side === 'away' ? publishedAssignmentTeamMark(logo, schoolName) : ''}</div>`;
  }

  function publishedAssignmentTeamMark(logo = '', name = '') {
    return `<span class="published-team-mark">${logo ? `<img src="${esc(logo)}" alt="${esc(name)} logo">` : `<b>${esc(teamMonogram(name))}</b>`}</span>`;
  }

  function publishedAssignmentOfficialSource(id = '') {
    if (id === 'profile:self') return { ...state.profile, photoId: state.profile.profilePhotoId || state.profile.photoId || '' };
    if (id.startsWith('user:')) {
      const rawId = id.slice(5);
      return (state.users || []).find((item) => item.id === rawId) || (state.userDrafts || []).find((item) => item.id === rawId) || {};
    }
    if (id.startsWith('official:')) return (state.officials || []).find((item) => item.id === id.slice(9)) || {};
    return {};
  }

  function publishedAssignmentPhoto(id, name, className = '') {
    const source = publishedAssignmentOfficialSource(id);
    const direct = safeUrl(source.photoUrl || source.profilePhotoUrl || source.imageUrl || source.avatarUrl || '');
    const photoId = source.photoId || source.profilePhotoId || '';
    return `<span class="published-person-photo ${className}" data-published-photo-source="${esc(id)}" data-published-photo-id="${esc(photoId)}">${direct ? `<img src="${esc(direct)}" alt="${esc(name)}">` : `<b>${esc(createGameInitials(name))}</b>`}</span>`;
  }

  async function hydratePublishedAssignmentMedia() {
    const targets = [...moduleView.querySelectorAll('[data-published-photo-source]')];
    for (const target of targets) {
      if (target.querySelector('img')) continue;
      const source = publishedAssignmentOfficialSource(target.dataset.publishedPhotoSource || '');
      const photoId = target.dataset.publishedPhotoId || source.photoId || source.profilePhotoId || '';
      if (!photoId) continue;
      const file = await dbGetFile(photoId);
      if (!file?.blob || !target.isConnected) continue;
      const url = URL.createObjectURL(file.blob);
      const image = document.createElement('img');
      image.src = url;
      image.alt = target.closest('[data-published-person-name]')?.dataset.publishedPersonName || '';
      image.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
      image.addEventListener('error', () => URL.revokeObjectURL(url), { once: true });
      target.replaceChildren(image);
    }
  }

  function publishedAssignmentCrew(game) {
    const normalized = normalizeMasterGame(game);
    const positions = normalized.crewSize === 2
      ? [['Referee', normalized.refereeId], ['Umpire', normalized.umpire1Id], ['Alternate', normalized.alternateId]]
      : [['Crew Chief', normalized.refereeId], ['Umpire 1', normalized.umpire1Id], ['Umpire 2', normalized.umpire2Id], ['Alternate', normalized.alternateId]];
    return positions.filter(([, id]) => id).map(([position, id]) => {
      const official = createGameOfficialById(id);
      const source = publishedAssignmentOfficialSource(id);
      const name = official?.name || masterCrewName(id);
      if (!name) return '';
      const location = [official?.city || source.city, official?.region || source.region].filter(Boolean).join(', ');
      const gamesWorked = Number(official?.gamesWorked || source.gamesWorked || 0);
      return `<article class="published-official" data-published-person-name="${esc(name)}"><small>${esc(position)}</small>${publishedAssignmentPhoto(id, name, 'published-official__photo')}<div><strong>${esc(name)}</strong>${location ? `<span>${esc(location)}</span>` : ''}${gamesWorked > 0 ? `<em>${gamesWorked}+ Games</em>` : ''}</div></article>`;
    }).filter(Boolean).join('');
  }

  function publishedAssignmentContact(school, role, side) {
    const isCoach = role === 'coach';
    const name = String(isCoach ? school.headCoach : (school.athleticDirector || school.adName) || '').trim();
    if (!name) return '';
    const email = String(isCoach ? (school.headCoachEmail || '') : (school.athleticDirectorEmail || school.adEmail || '')).trim();
    const phone = String(isCoach ? (school.headCoachPhone || '') : (school.athleticDirectorPhone || school.adPhone || '')).trim();
    const photo = safeUrl(isCoach ? (school.headCoachPhotoUrl || '') : (school.athleticDirectorPhotoUrl || school.adPhotoUrl || ''));
    const label = `${side === 'home' ? 'Home' : 'Visiting'} ${isCoach ? 'Coach' : 'Athletic Director'}`;
    return `<article class="published-contact"><h3>${esc(label)}</h3><div><span class="published-contact__photo">${photo ? `<img src="${esc(photo)}" alt="${esc(name)}">` : `<b>${esc(createGameInitials(name))}</b>`}</span><p><strong>${esc(name)}</strong>${email ? `<a href="mailto:${esc(email)}">${esc(email)}</a>` : ''}${phone ? `<a href="tel:${esc(phone.replace(/[^+\d]/g, ''))}">${esc(phone)}</a>` : ''}</p></div></article>`;
  }

  function publishedAssignmentContactSection(game) {
    const home = publishedAssignmentSchool(game.homeTeam);
    const away = publishedAssignmentSchool(game.awayTeam);
    const contacts = [
      publishedAssignmentContact(home, 'coach', 'home'),
      publishedAssignmentContact(away, 'coach', 'away'),
      publishedAssignmentContact(home, 'ad', 'home'),
      publishedAssignmentContact(away, 'ad', 'away')
    ].filter(Boolean);
    return contacts.length ? `<section class="published-contacts">${contacts.join('')}</section>` : '';
  }

  function publishedAssignmentVenueDetails(game) {
    const venue = publishedAssignmentVenueRecord(game);
    const photo = safeUrl(venue.venuePhotoUrl || venue.gymPhotoUrl || venue.facilityPhotoUrl || '');
    const address = String(game.address || venue.venueAddress || '').trim();
    const phone = String(game.venuePhone || venue.venuePhone || '').trim();
    const parking = String(venue.parkingDetails || venue.parkingInformation || '').trim();
    const entrance = String(venue.entranceInstructions || venue.entryInstructions || '').trim();
    const arrival = String(venue.arrivalInstructions || venue.arrivalTime || '').trim();
    const details = [
      phone ? `<li>${icon('i-phone')}<span>${esc(phone)}</span></li>` : '',
      parking ? `<li><b class="published-letter-icon">P</b><span>${esc(parking)}</span></li>` : '',
      entrance ? `<li>${icon('i-school')}<span>${esc(entrance)}</span></li>` : '',
      arrival ? `<li>${icon('i-info')}<span>${esc(arrival)}</span></li>` : ''
    ].filter(Boolean).join('');
    return `<div class="published-venue ${photo ? 'has-photo' : ''}">${photo ? `<figure><img src="${esc(photo)}" alt="${esc(game.gymName || 'Game venue')}"></figure>` : ''}<div class="published-venue__address"><h3>Gym Address</h3><strong>${esc(game.gymName || venue.venueName || '')}</strong>${address ? `<p>${esc(address)}</p>` : ''}${address ? `<button type="button" data-action="directions-my-game" data-id="${esc(game.id)}">${icon('i-pin')}View on Map</button>` : ''}</div>${details ? `<ul>${details}</ul>` : ''}</div>`;
  }

  function publishedAssignmentAdditionalInfo(game) {
    const venue = publishedAssignmentVenueRecord(game);
    const rows = [];
    const concessions = String(venue.concessionsInformation || venue.concessions || '').trim();
    const pets = String(venue.petPolicy || venue.petsAllowed || '').trim();
    const streaming = String(venue.streamingInformation || venue.replayStreaming || venue.streaming || '').trim();
    if (concessions) rows.push(`${icon('i-shop')}<span>${esc(concessions)}</span>`);
    if (pets) rows.push(`${icon('i-close')}<span>${esc(pets)}</span>`);
    if (streaming) rows.push(`${icon('i-form')}<span>${esc(streaming)}</span>`);
    return rows.length ? `<article class="published-lower-card"><h2>Additional Information</h2><ul>${rows.map((row) => `<li>${row}</li>`).join('')}</ul></article>` : '';
  }

  function publishedAssignmentDownload(game) {
    const normalized = normalizeMasterGame(game);
    const home = publishedAssignmentSchool(normalized.homeTeam);
    const away = publishedAssignmentSchool(normalized.awayTeam);
    const venue = publishedAssignmentVenueRecord(normalized);
    const crew = publishedAssignmentCrew(normalized).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const contactText = [
      ['Home Coach', home.headCoach, home.headCoachEmail, home.headCoachPhone],
      ['Visiting Coach', away.headCoach, away.headCoachEmail, away.headCoachPhone],
      ['Home Athletic Director', home.athleticDirector || home.adName, home.athleticDirectorEmail || home.adEmail, home.athleticDirectorPhone || home.adPhone],
      ['Visiting Athletic Director', away.athleticDirector || away.adName, away.athleticDirectorEmail || away.adEmail, away.athleticDirectorPhone || away.adPhone]
    ].filter(([, name]) => name).map(([label, name, email, phone]) => `<li><strong>${esc(label)}:</strong> ${esc([name, email, phone].filter(Boolean).join(' · '))}</li>`).join('');
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Game Assignment ${esc(normalized.id)}</title><style>body{font-family:Arial,sans-serif;max-width:850px;margin:40px auto;padding:0 24px;color:#151515}h1{font-size:30px}h2{margin-top:28px;border-bottom:2px solid #c00;padding-bottom:6px}dl{display:grid;grid-template-columns:180px 1fr;gap:8px 18px}dt{font-weight:700}dd{margin:0}li{margin:8px 0}.status{display:inline-block;padding:5px 9px;border:1px solid #17852b;color:#17852b;font-weight:700}</style></head><body><p class="status">${esc(myGameStatusLabel(normalized))}</p><h1>${esc(normalized.homeTeam)} vs ${esc(normalized.awayTeam)}</h1><dl><dt>Game ID</dt><dd>${esc(normalized.id)}</dd><dt>Date</dt><dd>${esc(normalized.date ? fmtDate(normalized.date) : '')}</dd><dt>Time</dt><dd>${esc(normalized.startTime ? calendarTime(normalized.startTime) : '')}</dd><dt>Level</dt><dd>${esc([normalized.level, normalized.gender, normalized.sport].filter(Boolean).join(' · '))}</dd><dt>Venue</dt><dd>${esc([normalized.gymName || venue.venueName, normalized.address || venue.venueAddress].filter(Boolean).join(' · '))}</dd><dt>Crew</dt><dd>${esc(crew)}</dd><dt>Notes</dt><dd>${esc(normalized.notes || '')}</dd></dl>${contactText ? `<h2>School Contacts</h2><ul>${contactText}</ul>` : ''}</body></html>`;
    const slug = [normalized.date, normalized.homeTeam, normalized.awayTeam].filter(Boolean).join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || normalized.id || 'game-assignment';
    downloadText(`${slug}.html`, html, 'text/html');
  }

  function renderMyGameDetailPage(game) {
    const normalized = normalizeMasterGame(game);
    const response = myGameResponseStatus(normalized);
    const payRate = myGameRecordedPay(normalized);
    const classification = [normalized.level, normalized.gender].filter(Boolean).join(' ');
    const published = normalized.status === 'Published';
    const responseLabel = response === 'Accepted' ? 'Confirmed' : response;
    const notes = String(normalized.notes || '').trim();
    const crew = publishedAssignmentCrew(normalized);
    const contacts = publishedAssignmentContactSection(normalized);
    const additional = publishedAssignmentAdditionalInfo(normalized);
    return `<section class="published-assignment-page">
      <header class="published-assignment-head"><div class="published-assignment-intro"><button type="button" data-action="back-to-my-games">${icon('i-chevron')}Back to All Assignments</button><h1>${published ? '<span>Published</span> ' : ''}Game Assignment</h1><div><p>${published ? 'This assignment has been published and is visible to all assigned officials.' : 'Review the current game assignment details.'}</p><strong class="published-response is-${esc(responseLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}">${esc(responseLabel)}</strong></div></div><div class="published-assignment-head__actions"><div><button type="button" data-action="view-my-game-calendar" data-id="${esc(normalized.id)}" ${normalized.date ? '' : 'disabled'}>${icon('i-calendar')}View Schedule</button><button class="is-primary" type="button" data-action="published-game-details">Game Details${icon('i-external')}</button></div><article><div><span>Game Time</span><strong>${normalized.startTime ? esc(calendarTime(normalized.startTime)) : ''}</strong><small>${normalized.date ? esc(fmtDate(normalized.date)) : ''}</small></div><div>${icon('i-trophy')}<span>Level</span><strong>${esc(classification)}</strong></div></article></div></header>
      <article class="published-assignment-card" data-published-assignment-card>
        <section class="published-matchup">${publishedAssignmentTeam(normalized, 'home')}<b>VS</b>${publishedAssignmentTeam(normalized, 'away')}</section>
        <section class="published-game-facts"><div>${icon('i-calendar')}<span><small>Date</small><strong>${normalized.date ? esc(fmtDate(normalized.date)) : ''}</strong></span></div><div>${icon('i-clock')}<span><small>Time</small><strong>${normalized.startTime ? esc(calendarTime(normalized.startTime)) : ''}</strong></span></div><div>${icon('i-pin')}<span><small>Location</small><strong>${esc(normalized.gymName || '')}</strong></span></div><div>${icon('i-card')}<span><small>Pay</small><strong>${payRate ? esc(money(payRate)) : 'Not recorded'}</strong><em>${normalized.crewSize}-Official Crew</em></span></div></section>
        ${publishedAssignmentVenueDetails(normalized)}
        <section class="published-officials"><h2>Officials</h2><div>${crew || '<p class="published-empty-record">No officials are assigned to this game.</p>'}</div></section>
      </article>
      ${contacts}
      <section class="published-lower-grid"><article class="published-lower-card"><h2>Assignment Notes</h2><p>${notes ? esc(notes) : 'No assignment notes have been recorded.'}</p></article>${additional}</section>
      <footer class="published-assignment-footer"><span>${icon('i-shield')}</span><p><strong>Thank you for being a valued part of Got U Nex Ref.</strong><small>Your professionalism makes the game better.</small></p><button type="button" data-action="download-published-assignment" data-id="${esc(normalized.id)}">${icon('i-download')}Download Assignment</button></footer>
      ${myGameDeclineDialog()}
    </section>`;
  }

  function renderMyGames() {
    if (myGamesUi.detailId) {
      const detailGame = (state.masterGames || []).find((item) => item.id === myGamesUi.detailId);
      if (detailGame && myGameAssignmentKey(detailGame)) return renderMyGameDetailPage(detailGame);
      myGamesUi.detailId = '';
    }
    const all = myGameAllRecords();
    const filtered = myGameRecords();
    const pageCount = Math.max(1, Math.ceil(filtered.length / myGamesUi.pageSize));
    myGamesUi.page = Math.min(Math.max(1, myGamesUi.page), pageCount);
    const start = (myGamesUi.page - 1) * myGamesUi.pageSize;
    const pageItems = filtered.slice(start, start + myGamesUi.pageSize);
    const accepted = all.filter((game) => myGameResponseStatus(game) === 'Accepted').length;
    const pending = all.filter((game) => myGameResponseStatus(game) === 'Pending').length;
    const mileageValues = all.map((game) => game.travelMiles).filter((value) => value !== '' && Number.isFinite(Number(value)));
    const mileage = mileageValues.length ? mileageValues.reduce((sum, value) => sum + Number(value), 0) : null;
    const sports = [...new Set(all.map((game) => game.sport).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const levels = [...new Set(all.map((game) => game.level).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const profileReady = currentProfileRosterIds().size > 0;
    return `<section class="my-games-page">
      <header class="my-games-heading"><div>${icon('i-calendar')}<div><h1>My Games</h1><p>View, respond to, and manage game assignments published to your official profile.</p></div></div></header>
      <section class="my-games-metrics" aria-label="My game totals"><article>${icon('i-file')}<div><span>Total Assignments</span><strong>${all.length}</strong><small>Published to your profile</small></div></article><article>${icon('i-check')}<div><span>Accepted</span><strong>${accepted}</strong><small>${all.length ? Math.round((accepted / all.length) * 100) : 0}% of assignments</small></div></article><article>${icon('i-clock')}<div><span>Pending</span><strong>${pending}</strong><small>Awaiting your response</small></div></article><article>${icon('i-pin')}<div><span>Travel Miles</span><strong>${mileage === null ? '—' : mileage.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong><small>${mileage === null ? 'Enter mileage in the Master Schedule' : 'Published assignment total'}</small></div></article></section>
      <div class="my-games-toolbar"><nav aria-label="My game views">${[['upcoming','Upcoming'],['accepted','Accepted'],['pending','Pending'],['declined','Declined'],['past','Past']].map(([value,label]) => `<button type="button" class="${myGamesUi.tab === value ? 'is-active' : ''}" data-action="set-my-game-tab" data-tab="${value}">${label}</button>`).join('')}</nav><div><button type="button" data-action="toggle-my-game-filters" aria-expanded="${myGamesUi.filtersOpen}">${icon('i-filter')}Filters</button><label><span class="sr-only">Sort games</span><select data-my-game-sort><option value="soonest" ${myGamesUi.sort === 'soonest' ? 'selected' : ''}>Date: Soonest</option><option value="latest" ${myGamesUi.sort === 'latest' ? 'selected' : ''}>Date: Latest</option></select></label></div></div>
      <section class="my-games-filter-panel" ${myGamesUi.filtersOpen ? '' : 'hidden'}><label>${icon('i-search')}<span class="sr-only">Search games</span><input type="search" value="${esc(myGamesUi.query)}" data-my-game-query aria-label="Search my games"></label><label><span>Start Date</span><input type="date" value="${esc(myGamesUi.startDate)}" data-my-game-filter="startDate"></label><label><span>End Date</span><input type="date" value="${esc(myGamesUi.endDate)}" data-my-game-filter="endDate"></label><label><span>Sport</span><select data-my-game-filter="sport"><option value="">All Sports</option>${sports.map((value) => option(value, myGamesUi.sport)).join('')}</select></label><label><span>Level</span><select data-my-game-filter="level"><option value="">All Levels</option>${levels.map((value) => option(value, myGamesUi.level)).join('')}</select></label><label><span>Response</span><select data-my-game-filter="response"><option value="">All Responses</option>${['Accepted','Pending','Declined','Canceled'].map((value) => option(value, myGamesUi.response)).join('')}</select></label><button type="button" data-action="clear-my-game-filters">Clear Filters</button></section>
      <div class="my-games-list">${pageItems.length ? pageItems.map(myGameCard).join('') : `<div class="my-games-empty">${icon('i-calendar')}<strong>${profileReady ? 'No game assignments match this view.' : 'Set up your official profile to view game assignments.'}</strong><p>${profileReady ? 'Published games assigned to your profile will appear here automatically.' : 'Enter your name, email, and official role in My Profile. The information must match the official selected in the Master Schedule.'}</p>${profileReady ? '' : '<a href="#profile" data-route="profile">Open My Profile</a>'}</div>`}</div>
      <footer class="my-games-pagination"><p>Showing ${filtered.length ? start + 1 : 0} to ${Math.min(start + myGamesUi.pageSize, filtered.length)} of ${filtered.length} games</p><div><button type="button" data-action="my-game-page" data-page="${myGamesUi.page - 1}" ${myGamesUi.page <= 1 ? 'disabled' : ''} aria-label="Previous page">‹</button><span>${myGamesUi.page}</span><button type="button" data-action="my-game-page" data-page="${myGamesUi.page + 1}" ${myGamesUi.page >= pageCount ? 'disabled' : ''} aria-label="Next page">›</button></div></footer>
      ${myGameDeclineDialog()}
    </section>`;
  }

  function openMyGameDetails(game) {
    const dialog = moduleView.querySelector('[data-my-game-dialog]');
    if (!dialog || !game) return;
    const response = myGameResponseStatus(game);
    const details = dialog.querySelector('[data-my-game-dialog-body]');
    dialog.querySelector('[data-my-game-dialog-title]').textContent = [game.homeTeam, game.awayTeam].filter(Boolean).join(' vs. ') || 'Game Details';
    details.innerHTML = `<div class="my-game-detail-grid"><section><h3>Game</h3><dl><div><dt>Date</dt><dd>${game.date ? fmtDate(game.date) : 'Not entered'}</dd></div><div><dt>Time</dt><dd>${game.startTime ? esc(calendarTime(game.startTime)) : 'Not entered'}${game.timeZone ? ` · ${esc(game.timeZone)}` : ''}</dd></div><div><dt>Sport / Level</dt><dd>${esc([game.sport, game.level, game.gender, game.conferenceLevel].filter(Boolean).join(' · ') || 'Not entered')}</dd></div><div><dt>Your Position</dt><dd>${esc(myGamePosition(game) || 'Not assigned')}</dd></div><div><dt>Response</dt><dd><span class="my-game-response ${myGameResponseClass(response)}">${esc(response)}</span></dd></div></dl></section><section><h3>Location</h3><dl><div><dt>Venue</dt><dd>${esc(game.gymName || 'Not entered')}</dd></div><div><dt>Address</dt><dd>${esc(game.address || 'Not entered')}</dd></div><div><dt>Travel Miles</dt><dd>${game.travelMiles === '' ? 'Not entered' : `${esc(game.travelMiles)} miles`}</dd></div></dl></section><section class="is-wide"><h3>Officiating Crew</h3><div class="my-game-detail-crew">${myGameCrew(game) || '<p>No crew members have been assigned.</p>'}</div></section>${game.notes ? `<section class="is-wide"><h3>Assignment Notes</h3><p>${esc(game.notes)}</p></section>` : ''}</div>`;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }

  function openMyGameDeclineDialog(game) {
    const dialog = moduleView.querySelector('[data-my-game-decline-dialog]');
    if (!dialog || !game) return;
    const form = dialog.querySelector('form');
    const response = myGameResponseRecord(game);
    form.reset();
    form.elements.id.value = game.id;
    form.elements.date.value = game.date || '';
    form.elements.startTime.value = game.startTime || '';
    form.elements.notes.value = String(response?.details || '').slice(0, 250);
    updateGameDeclineReasonPicker(dialog, response?.reason || '');
    const count = dialog.querySelector('[data-game-decline-note-count]');
    if (count) count.textContent = String(form.elements.notes.value.length);
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    requestAnimationFrame(() => {
      const trigger = dialog.querySelector('.game-decline-reason-trigger');
      const menu = dialog.querySelector('[data-game-decline-reason-menu]');
      if (trigger && menu) { menu.hidden = false; trigger.setAttribute('aria-expanded', 'true'); trigger.focus(); }
    });
  }

  function acceptMyGame(game) {
    const key = myGameAssignmentKey(game);
    if (!game || !key) { showToast('This game is not assigned to the current profile.'); return; }
    game.officialResponses = game.officialResponses && typeof game.officialResponses === 'object' ? game.officialResponses : {};
    game.officialResponses[key] = { status: 'Accepted', respondedAt: new Date().toISOString() };
    state.calendarBlocks = (state.calendarBlocks || []).filter((block) => block.sourceMasterGameId !== game.id);
    notify(`Game accepted: ${[game.homeTeam, game.awayTeam].filter(Boolean).join(' vs. ') || 'game assignment'}.`);
    saveState();
  }

  function exportMyGameCalendar(game) {
    if (!game?.date) { showToast('A game date is required before calendar export.'); return; }
    const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const title = [game.homeTeam, game.awayTeam].filter(Boolean).join(' vs. ') || 'Game Assignment';
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Got U Nex Ref//My Games//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${escapeIcs(game.id)}@gotunexref.local`,`DTSTAMP:${stamp()}`,game.startTime ? `DTSTART:${formatIcsDate(game.date, game.startTime)}` : `DTSTART;VALUE=DATE:${formatIcsDate(game.date)}`,`SUMMARY:${escapeIcs(title)}`,game.address ? `LOCATION:${escapeIcs([game.gymName, game.address].filter(Boolean).join(' - '))}` : '',game.notes ? `DESCRIPTION:${escapeIcs(game.notes)}` : '','END:VEVENT','END:VCALENDAR'].filter(Boolean);
    downloadText(`game-${game.date}.ics`, lines.join('\r\n'), 'text/calendar');
  }

  function createGameDistinct(values) {
    return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function createGameTeams() {
    return createGameDistinct([
      ...(state.schools || []).map((item) => item.name || item.organization || item.schoolName),
      ...(state.masterGames || []).flatMap((item) => [item.homeTeam, item.awayTeam])
    ]);
  }

  function createGameVenues() {
    const map = new Map();
    const addVenue = (name, address = '', phone = '') => {
      if (!name) return;
      const key = String(name).trim().toLowerCase();
      const existing = map.get(key) || { name: String(name).trim(), address: '', phone: '' };
      if (!existing.address && address) existing.address = String(address).trim();
      if (!existing.phone && phone) existing.phone = String(phone).trim();
      map.set(key, existing);
    };
    (state.schools || []).forEach((item) => addVenue(item.venueName || item.gymName, item.venueAddress || item.address, item.venuePhone || item.phone));
    (state.masterGames || []).forEach((item) => {
      const game = normalizeMasterGame(item);
      addVenue(game.gymName, game.address, game.venuePhone || item.venuePhone);
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }
  function createGameKnownValues(key) {
    const values = (state.masterGames || []).map((item) => normalizeMasterGame(item)[key]);
    if (key === 'sport' && state.profile.primarySport) values.push(state.profile.primarySport);
    if (key === 'level' && state.profile.preferredLevel) values.push(state.profile.preferredLevel);
    if (key === 'level') values.push(...(state.officials || []).map((item) => item.level));
    if (key === 'gender') values.push(...(state.officials || []).map((item) => item.gender));
    return createGameDistinct(values);
  }

  function createGameDatalist(id, values) {
    return `<datalist id="${id}">${values.map((value) => `<option value="${esc(value)}"></option>`).join('')}</datalist>`;
  }

  function createGamePrimaryRoles(size = createGameUi.crewSize) {
    return Number(size) === 2 ? ['refereeId', 'umpire1Id'] : ['refereeId', 'umpire1Id', 'umpire2Id'];
  }

  function createGameAllRoles(size = createGameUi.crewSize) {
    return [...createGamePrimaryRoles(size), 'alternateId'];
  }

  function createGameSchoolRecord(teamName = '') {
    const target = String(teamName || '').trim().toLowerCase();
    if (!target) return null;
    return (state.schools || []).find((item) => String(item.name || item.organization || item.schoolName || '').trim().toLowerCase() === target) || null;
  }

  function createGameSchoolLogo(teamName = '') {
    const record = createGameSchoolRecord(teamName);
    return safeUrl(record?.logoUrl || record?.logo || record?.imageUrl || '');
  }

  function createGameSelectOptions(values, selected = '') {
    return `<option value=""></option>${values.map((value) => option(value, selected)).join('')}`;
  }

  function createGameTeamField(label, name, values, selected) {
    const logo = createGameSchoolLogo(selected);
    return `<label class="create-game-team-field"><span>${esc(label)}</span><span class="create-game-team-control"><span class="create-game-team-mark">${logo ? `<img src="${esc(logo)}" alt="">` : icon('i-school')}</span><select name="${name}" data-create-game-field required aria-label="${esc(label)}">${createGameSelectOptions(values, selected)}</select></span></label>`;
  }

  function createGameVenueField(values, selected) {
    return `<label><span>Venue</span><select name="gymName" data-create-game-field required aria-label="Venue">${createGameSelectOptions(values, selected)}</select></label>`;
  }
  function createGameOfficialRecords() {
    const records = [];
    const add = (record) => {
      if (!record.id || !record.name) return;
      const gamesWorked = (state.masterGames || []).map(normalizeMasterGame).filter((game) => game.status !== 'Canceled' && masterAllRoleKeys(game).some((role) => game[role] === record.id)).length;
      records.push({
        id: record.id,
        name: record.name,
        email: String(record.email || '').trim(),
        city: String(record.city || '').trim(),
        region: String(record.region || '').trim(),
        officialType: String(record.officialType || '').trim(),
        level: String(record.level || '').trim(),
        gender: String(record.gender || '').trim(),
        payRate: Number(record.payRate || 0) || 0,
        gamesWorked,
        rawOfficialId: record.rawOfficialId || '',
        source: record.source || ''
      });
    };
    (state.officials || []).forEach((official) => add({
      id: `official:${official.id}`,
      rawOfficialId: official.id,
      name: [official.firstName, official.lastName].filter(Boolean).join(' ').trim(),
      email: official.email,
      city: official.city,
      region: official.region,
      officialType: official.officialType,
      level: official.level,
      gender: official.gender,
      payRate: official.payRate || official.gameFee,
      source: 'Availability Report'
    }));
    (state.users || []).filter((user) => user.role === 'official' && user.active !== false).forEach((user) => add({
      id: `user:${user.id}`,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
      email: user.email,
      city: user.city,
      region: user.region,
      officialType: user.positionTitle || user.role,
      level: user.level || user.preferredLevel,
      gender: user.gender,
      payRate: user.payRate || user.gameFee,
      source: 'Users'
    }));
    if (String(state.profile.role || '').toLowerCase().includes('official')) add({
      id: 'profile:self',
      name: [state.profile.firstName, state.profile.lastName].filter(Boolean).join(' ').trim(),
      email: state.profile.email,
      city: state.profile.city,
      region: state.profile.region,
      officialType: state.profile.role,
      level: state.profile.preferredLevel,
      gender: state.profile.gender,
      payRate: state.profile.payRate || state.profile.gameFee,
      source: 'My Profile'
    });
    const seen = new Set();
    return records.filter((record) => {
      const key = (record.email || record.name).toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }
  function createGameOfficialById(id) {
    return createGameOfficialRecords().find((record) => record.id === id) || null;
  }

  function createGameInitials(name = '') {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    return (parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2) || '').toUpperCase();
  }

  function createGameOfficialConflict(record) {
    if (!record || !createGameUi.date) return '';
    if (record.rawOfficialId) {
      const availability = (state.officialAvailability || []).find((item) => item.officialId === record.rawOfficialId && item.date === createGameUi.date);
      if (availability?.status === 'Unavailable') return availability.notes || 'Recorded as unavailable';
      if (availability?.status === 'Pending') return availability.notes || 'Availability is pending';
    }
    if (record.id === 'profile:self') {
      const calendarStatus = state.calendarAvailability?.[createGameUi.date];
      if (calendarStatus?.status === 'Unavailable') return calendarStatus.notes || 'Recorded as unavailable';
      const block = (state.calendarBlocks || []).find((item) => {
        if (item.date !== createGameUi.date) return false;
        if (!createGameUi.startTime || !item.startTime) return true;
        if (!item.endTime) return item.startTime === createGameUi.startTime;
        return createGameUi.startTime >= item.startTime && createGameUi.startTime < item.endTime;
      });
      if (block) return blockReasonDisplay(block);
    }
    if (createGameUi.startTime) {
      const otherGame = (state.masterGames || []).map(normalizeMasterGame).find((game) => {
        if (game.id === createGameUi.draftId || game.status === 'Canceled') return false;
        if (game.date !== createGameUi.date || game.startTime !== createGameUi.startTime) return false;
        return [game.refereeId, game.umpire1Id, game.umpire2Id, game.alternateId].includes(record.id);
      });
      if (otherGame) return 'Assigned to another game at the same time';
    }
    return '';
  }

  function createGameFilteredOfficials() {
    const query = createGameUi.officialQuery.trim().toLowerCase();
    const records = createGameOfficialRecords().filter((record) => {
      if (createGameUi.officialType && record.officialType !== createGameUi.officialType) return false;
      if (createGameUi.officialLevel && record.level !== createGameUi.officialLevel) return false;
      if (createGameUi.officialGender && record.gender !== createGameUi.officialGender) return false;
      if (query) {
        const haystack = [record.name, record.email, record.city, record.region, record.officialType, record.level, record.gender, record.source].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    return {
      available: records.filter((record) => !createGameOfficialConflict(record)),
      unavailable: records.filter((record) => createGameOfficialConflict(record))
    };
  }

  function createGameRoleLabel(role, size = createGameUi.crewSize) {
    const labels = Number(size) === 2
      ? { refereeId: 'Referee', umpire1Id: 'Umpire', alternateId: 'Alternate' }
      : { refereeId: 'Referee', umpire1Id: 'Umpire 1', umpire2Id: 'Umpire 2', alternateId: 'Alternate' };
    return labels[role] || 'Official';
  }
  function createGameCrewSlot(role) {
    const record = createGameOfficialById(createGameUi[role]);
    const active = createGameUi.selectedRole === role;
    return `<article class="create-crew-slot ${record ? 'is-filled' : ''} ${active ? 'is-active' : ''}">
      <header>${icon('i-user')}<span>${createGameRoleLabel(role)}${role === 'alternateId' ? ' (Optional)' : ''}</span></header>
      <button type="button" class="create-crew-slot__select" data-action="select-create-role" data-role="${role}" aria-pressed="${active}">
        ${record ? `<span class="create-official-avatar">${esc(createGameInitials(record.name))}</span><span><strong>${esc(record.name)}</strong><small>${esc([record.city, record.region].filter(Boolean).join(', ') || record.email || record.source)}</small></span>` : `${icon('i-plus')}<span>Select Official</span>`}
      </button>
      ${record ? `<button type="button" class="create-crew-slot__remove" data-action="remove-create-official" data-role="${role}" aria-label="Remove ${esc(record.name)} from ${createGameRoleLabel(role)}">${icon('i-close')}</button>` : ''}
    </article>`;
  }
  function createGameOfficialBadges(record) {
    return [
      [record.level, 'is-level'],
      [record.officialType, 'is-type'],
      [record.gender, 'is-gender']
    ].filter(([value]) => value).map(([value, className]) => `<span class="${className}">${esc(value)}</span>`).join('');
  }
  function createGameOfficialCard(record, unavailable = false) {
    const assignedRole = createGameAllRoles().find((role) => createGameUi[role] === record.id);
    const conflict = unavailable ? createGameOfficialConflict(record) : '';
    return `<article class="create-official-card ${unavailable ? 'is-unavailable' : ''}">
      <span class="create-official-avatar">${esc(createGameInitials(record.name))}</span>
      <div class="create-official-card__identity"><strong>${esc(record.name)}</strong><div>${createGameOfficialBadges(record)}</div><small>${esc([record.city, record.region].filter(Boolean).join(', ') || record.email || record.source)}</small></div>
      <div class="create-official-card__meta">${unavailable ? `<strong>Unavailable</strong><small>${esc(conflict)}</small>` : `<strong>${record.gamesWorked}</strong><small>Game${record.gamesWorked === 1 ? '' : 's'} worked</small>`}</div>
      ${unavailable ? '' : `<button type="button" data-action="assign-create-official" data-id="${esc(record.id)}" ${assignedRole ? 'disabled' : ''}>${assignedRole ? esc(createGameRoleLabel(assignedRole)) : 'Assign'}</button>`}
    </article>`;
  }
  function createGamePaySummary() {
    const roles = createGamePrimaryRoles();
    const selected = roles.map((role) => createGameOfficialById(createGameUi[role])).filter(Boolean);
    const hasCompleteRates = selected.length === roles.length && selected.every((record) => record.payRate > 0);
    return { count: selected.length, required: roles.length, label: hasCompleteRates ? money(selected.reduce((sum, record) => sum + record.payRate, 0)) : 'Not recorded' };
  }
  function createGameVenueSummary() {
    const venue = createGameVenues().find((item) => item.name.toLowerCase() === createGameUi.gymName.trim().toLowerCase());
    return {
      address: createGameUi.address || venue?.address || '',
      phone: createGameUi.venuePhone || venue?.phone || ''
    };
  }

  function renderCreateGameAssignment() {
    const teams = createGameTeams();
    const venues = createGameVenues();
    const levels = createGameKnownValues('level');
    const genders = createGameKnownValues('gender');
    const officialRecords = createGameOfficialRecords();
    const officialTypes = createGameDistinct(officialRecords.map((item) => item.officialType));
    const officialLevels = createGameDistinct(officialRecords.map((item) => item.level));
    const officialGenders = createGameDistinct(officialRecords.map((item) => item.gender));
    const officials = createGameFilteredOfficials();
    const venueSummary = createGameVenueSummary();
    const pay = createGamePaySummary();
    const assignorName = [state.profile.firstName, state.profile.lastName].filter(Boolean).join(' ').trim();
    const homeSchool = createGameSchoolRecord(createGameUi.homeTeam) || {};
    const crewSize = createGameUi.crewSize === 2 ? 2 : 3;
    const primaryRoles = createGamePrimaryRoles(crewSize);
    const unavailableVisible = officials.unavailable.slice(0, createGameUi.unavailableLimit);
    const teamValues = teams;
    const venueValues = venues.map((item) => item.name);
    const availableEmpty = `<div class="create-official-empty"><strong>No available officials match the current game details.</strong><p>Availability is calculated from records stored in this dashboard.</p></div>`;
    const unavailableEmpty = `<div class="create-official-empty is-compact"><strong>No unavailable officials match the current game details.</strong></div>`;
    return `<section class="create-game-page ${crewSize === 2 ? 'is-two-man' : 'is-three-man'}" aria-labelledby="create-game-title">
      <form data-form="create-game-assignment" novalidate>
        <header class="create-game-header">
          <div><button type="button" class="create-game-back" data-action="set-assignment-section" data-section="master">${icon('i-chevron')}Back to Master Schedule</button><h1 id="create-game-title">Create Game Assignment <span>(${crewSize}-Man Crew)</span></h1><p>Fill in game details and assign a ${crewSize}-man officiating crew.</p></div>
          <div class="create-game-actions"><button type="button" data-action="save-create-game-draft">${icon('i-file')}Save as Draft</button><button type="submit" class="is-primary">${icon('i-check')}Create Assignment</button></div>
        </header>

        <div class="create-game-layout">
          <div class="create-game-left">
            <section class="create-game-panel create-game-details" aria-labelledby="create-game-details-title">
              <header><b>1</b><h2 id="create-game-details-title">Game Details</h2></header>
              <div class="create-game-fields create-game-fields--primary">
                <label><span>Date</span><input name="date" type="date" value="${esc(createGameUi.date)}" data-create-game-field required></label>
                <label><span>Time</span><input name="startTime" type="time" value="${esc(createGameUi.startTime)}" data-create-game-field required></label>
                <label><span>Level</span><select name="level" data-create-game-field required aria-label="Level">${createGameSelectOptions(levels, createGameUi.level)}</select></label>
                <label><span>Gender</span><select name="gender" data-create-game-field aria-label="Gender">${createGameSelectOptions(genders, createGameUi.gender)}</select></label>
              </div>
              <div class="create-game-fields create-game-fields--teams">
                ${createGameTeamField('Home Team', 'homeTeam', teamValues, createGameUi.homeTeam)}
                <span class="create-game-versus">VS</span>
                ${createGameTeamField('Visiting Team', 'awayTeam', teamValues, createGameUi.awayTeam)}
                ${createGameVenueField(venueValues, createGameUi.gymName)}
              </div>
              <div class="create-game-contact-strip">
                <div>${icon('i-user')}<span><small>Head Coach</small><strong>${homeSchool.headCoach ? esc(homeSchool.headCoach) : '<span class="create-game-empty-value">—</span>'}</strong></span></div>
                <div>${icon('i-id')}<span><small>Athletic Director</small><strong>${homeSchool.athleticDirector || homeSchool.adName ? esc(homeSchool.athleticDirector || homeSchool.adName) : '<span class="create-game-empty-value">—</span>'}</strong></span></div>
              </div>
              <div class="create-game-fields create-game-fields--venue">
                <div class="create-game-summary-item">${icon('i-pin')}<span><small>Gym Address</small><strong>${venueSummary.address ? esc(venueSummary.address) : '<span class="create-game-empty-value">—</span>'}</strong></span></div>
                <div class="create-game-summary-item">${icon('i-phone')}<span><small>Gym Phone</small><strong>${venueSummary.phone ? esc(venueSummary.phone) : '<span class="create-game-empty-value">—</span>'}</strong></span></div>
                <div class="create-game-assignor">${icon('i-user')}<span><small>Assigning Official (You)</small><strong>${assignorName ? esc(assignorName) : '<span class="create-game-empty-value">—</span>'}</strong></span></div>
                <input name="address" type="hidden" value="${esc(venueSummary.address)}" data-create-game-field><input name="venuePhone" type="hidden" value="${esc(venueSummary.phone)}" data-create-game-field><input name="sport" type="hidden" value="${esc(createGameUi.sport || state.profile.primarySport || '')}" data-create-game-field>
              </div>
            </section>

            <section class="create-game-panel create-game-crew" aria-labelledby="create-game-crew-title">
              <header><b>2</b><h2 id="create-game-crew-title">Assign Crew <span>(${crewSize}-Man Crew Required)</span></h2></header>
              <div class="create-crew-grid">${primaryRoles.map(createGameCrewSlot).join('')}</div>
              <div class="create-crew-alternate">${createGameCrewSlot('alternateId')}</div>
            </section>

            <section class="create-game-panel create-game-notes">
              <label><span>${icon('i-mail')}Assignment Notes (Optional)</span><textarea name="notes" rows="4" data-create-game-field>${esc(createGameUi.notes)}</textarea></label>
              <aside><small>Est. Total Pay</small><strong>${esc(pay.label)}</strong><span>${pay.count} of ${pay.required} primary officials selected</span></aside>
            </section>
          </div>

          <aside class="create-game-panel create-game-officials" aria-labelledby="create-game-officials-title">
            <header><b>3</b><h2 id="create-game-officials-title">Officials</h2></header>
            <nav aria-label="Official availability"><button type="button" class="${createGameUi.officialTab === 'available' ? 'is-active' : ''}" data-action="set-create-official-tab" data-tab="available">Available (${officials.available.length})</button><button type="button" class="${createGameUi.officialTab === 'unavailable' ? 'is-active' : ''}" data-action="set-create-official-tab" data-tab="unavailable">Unavailable (${officials.unavailable.length})</button></nav>
            <div class="create-official-tools">
              <label>${icon('i-search')}<span class="sr-only">Search officials</span><input type="search" value="${esc(createGameUi.officialQuery)}" data-create-official-query aria-label="Search officials"></label>
              <details class="create-official-filters"><summary>${icon('i-filter')}Filters</summary><div>
                <label><span>Official Type</span><select data-create-official-filter="officialType"><option value=""></option>${officialTypes.map((value) => option(value, createGameUi.officialType)).join('')}</select></label>
                <label><span>Level</span><select data-create-official-filter="officialLevel"><option value=""></option>${officialLevels.map((value) => option(value, createGameUi.officialLevel)).join('')}</select></label>
                <label><span>Gender</span><select data-create-official-filter="officialGender"><option value=""></option>${officialGenders.map((value) => option(value, createGameUi.officialGender)).join('')}</select></label>
                <button type="button" data-action="clear-create-official-filters">Clear Filters</button>
              </div></details>
            </div>
            <section class="create-official-group" data-create-official-group="available"><div class="create-official-list create-official-list--available">${officials.available.length ? officials.available.map((record) => createGameOfficialCard(record, false)).join('') : availableEmpty}</div></section>
            <section class="create-official-group create-official-group--unavailable" data-create-official-group="unavailable"><h3>Unavailable (${officials.unavailable.length})</h3><div class="create-official-list create-official-list--unavailable">${unavailableVisible.length ? unavailableVisible.map((record) => createGameOfficialCard(record, true)).join('') : unavailableEmpty}</div>${officials.unavailable.length > unavailableVisible.length ? `<button type="button" class="create-official-load-more" data-action="load-more-create-unavailable">${icon('i-download')}Load More Unavailable</button>` : ''}</section>
          </aside>
        </div>
      </form>
    </section>`;
  }
  function captureCreateGameForm() {
    const form = moduleView.querySelector('form[data-form="create-game-assignment"]');
    if (!form) return;
    ['date','startTime','sport','level','gender','homeTeam','awayTeam','gymName','address','venuePhone','notes'].forEach((key) => {
      if (form.elements[key]) createGameUi[key] = String(form.elements[key].value || '').trim();
    });
  }

  function resetCreateGameUi(size = createGameUi.crewSize) {
    Object.assign(createGameUi, { crewSize: Number(size) === 3 ? 3 : 2, draftId: '', selectedRole: 'refereeId', officialTab: 'available', unavailableLimit: 3, officialQuery: '', officialType: '', officialLevel: '', officialGender: '', date: '', startTime: '', sport: state.profile.primarySport || '', level: '', gender: '', homeTeam: '', awayTeam: '', gymName: '', address: '', venuePhone: '', notes: '', refereeId: '', umpire1Id: '', umpire2Id: '', alternateId: '' });
  }
  function createGameRecord(status) {
    captureCreateGameForm();
    const now = new Date().toISOString();
    const existing = (state.masterGames || []).find((item) => item.id === createGameUi.draftId);
    const crewSize = createGameUi.crewSize === 2 ? 2 : 3;
    return {
      ...(existing || {}),
      id: createGameUi.draftId || uid('game'),
      crewSize,
      date: createGameUi.date,
      startTime: createGameUi.startTime,
      timeZone: state.profile.timeZone || existing?.timeZone || '',
      sport: createGameUi.sport || state.profile.primarySport || existing?.sport || '',
      level: createGameUi.level,
      gender: createGameUi.gender,
      conferenceLevel: existing?.conferenceLevel || '',
      school: existing?.school || createGameUi.homeTeam || '',
      homeTeam: createGameUi.homeTeam,
      awayTeam: createGameUi.awayTeam,
      gymName: createGameUi.gymName,
      address: createGameUi.address,
      venuePhone: createGameUi.venuePhone,
      status,
      refereeId: createGameUi.refereeId,
      umpire1Id: createGameUi.umpire1Id,
      umpire2Id: crewSize === 3 ? createGameUi.umpire2Id : '',
      alternateId: createGameUi.alternateId,
      travelMiles: existing?.travelMiles || '',
      officialResponses: existing?.officialResponses && typeof existing.officialResponses === 'object' ? existing.officialResponses : {},
      notes: createGameUi.notes,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      publishedAt: ''
    };
  }
  function saveCreateGame(status) {
    captureCreateGameForm();
    const primaryRoles = createGamePrimaryRoles();
    if (createGameUi.crewSize === 2) createGameUi.umpire2Id = '';
    const values = ['date','startTime','sport','level','gender','homeTeam','awayTeam','gymName','address','venuePhone','notes',...createGameAllRoles()].map((key) => createGameUi[key]);
    if (status === 'Draft' && !values.some(Boolean)) { showToast('Enter game or crew information before saving a draft.'); return false; }
    if (status !== 'Draft') {
      const required = [['date','Date'],['startTime','Time'],['level','Level'],['homeTeam','Home Team'],['awayTeam','Visiting Team'],['gymName','Venue'],...primaryRoles.map((role) => [role, createGameRoleLabel(role)])];
      const missing = required.filter(([key]) => !createGameUi[key]).map(([, label]) => label);
      if (missing.length) { showToast(`Complete: ${missing.join(', ')}.`); return false; }
      if (createGameUi.homeTeam.trim().toLowerCase() === createGameUi.awayTeam.trim().toLowerCase()) { showToast('Home and visiting teams must be different.'); return false; }
    }
    const crew = createGameAllRoles().map((role) => createGameUi[role]).filter(Boolean);
    if (new Set(crew).size !== crew.length) { showToast('Each crew position must use a different official.'); return false; }
    if (status !== 'Draft') {
      const conflict = crew.map((id) => createGameOfficialById(id)).filter(Boolean).map((record) => ({ record, reason: createGameOfficialConflict(record) })).find((item) => item.reason);
      if (conflict) { showToast(`${conflict.record.name}: ${conflict.reason}.`); return false; }
    }
    const record = createGameRecord(status);
    state.masterGames = state.masterGames || [];
    upsert(state.masterGames, record);
    createGameUi.draftId = record.id;
    notify(status === 'Draft' ? `${record.crewSize}-man game assignment draft saved.` : `${record.crewSize}-man game assignment created and added to the master schedule.`);
    saveState();
    if (status !== 'Draft') {
      const crewSize = createGameUi.crewSize;
      resetCreateGameUi(crewSize);
      assignmentUi.section = 'master';
    }
    refreshAssignments();
    return true;
  }

  function quickAssignRoleLabel(role, game) {
    const normalized = normalizeMasterGame(game);
    const labels = normalized.crewSize === 2
      ? { refereeId: 'Referee', umpire1Id: 'Umpire', alternateId: 'Alternate' }
      : { refereeId: 'Referee', umpire1Id: 'Umpire 1', umpire2Id: 'Umpire 2', alternateId: 'Alternate' };
    return labels[role] || 'Official';
  }

  function quickAssignMissingRoles(game) {
    const normalized = normalizeMasterGame(game);
    return masterPrimaryRoleKeys(normalized).filter((role) => !normalized[role]);
  }

  function quickAssignBaseGames() {
    return (state.masterGames || []).map(normalizeMasterGame).filter((game) => game.status !== 'Canceled' && quickAssignMissingRoles(game).length);
  }

  function quickAssignSourceRecord(id = '') {
    const [source, rawId] = String(id).split(':');
    if (source === 'official') return (state.officials || []).find((item) => String(item.id) === rawId) || null;
    if (source === 'user') return (state.users || []).find((item) => String(item.id) === rawId) || null;
    if (id === 'profile:self') return state.profile || null;
    return null;
  }

  function quickAssignList(value) {
    if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
    return String(value || '').split(/[|,;/]/).map((item) => item.trim()).filter(Boolean);
  }

  function quickAssignNumber(...values) {
    for (const value of values) {
      if (value === '' || value == null) continue;
      const number = Number(value);
      if (Number.isFinite(number)) return number;
    }
    return null;
  }

  function quickAssignOfficials() {
    return createGameOfficialRecords().map((record) => {
      const source = quickAssignSourceRecord(record.id) || {};
      const certifications = quickAssignList(source.certifications || source.certification || source.certificationLabel || source.certificationStatus);
      const positions = quickAssignList(source.positionsList || source.positions || source.position || source.positionTitle || source.officialType || record.officialType);
      const sports = quickAssignList(source.sports || source.primarySport || source.sport);
      const latitude = quickAssignNumber(source.latitude, source.lat, source.location?.latitude, source.location?.lat);
      const longitude = quickAssignNumber(source.longitude, source.lng, source.lon, source.location?.longitude, source.location?.lng, source.location?.lon);
      const certificationExpires = source.certificationExpires || source.certificationExpiration || source.certificationExpiry || '';
      return {
        ...record,
        certifications,
        positions,
        sports,
        certificationExpires,
        latitude,
        longitude,
        maxTravelMiles: quickAssignNumber(source.maxTravelMiles, source.travelRadius, source.locationRadius),
        active: source.active !== false && !['inactive','suspended'].includes(String(source.status || source.directoryStatus || '').toLowerCase())
      };
    }).filter((record) => record.active);
  }

  function quickAssignSchoolCandidates(game) {
    const normalized = normalizeMasterGame(game);
    return [normalized.school, normalized.homeTeam, normalized.awayTeam].map((value) => String(value || '').trim().toLowerCase()).filter(Boolean);
  }

  function quickAssignGameCoordinates(game) {
    const normalized = normalizeMasterGame(game);
    const directLat = quickAssignNumber(normalized.latitude, normalized.lat, normalized.venueLatitude, normalized.venueLat);
    const directLng = quickAssignNumber(normalized.longitude, normalized.lng, normalized.lon, normalized.venueLongitude, normalized.venueLng, normalized.venueLon);
    if (directLat != null && directLng != null) return { latitude: directLat, longitude: directLng };
    const venueName = String(normalized.gymName || '').trim().toLowerCase();
    const teams = quickAssignSchoolCandidates(normalized);
    const school = (state.schools || []).find((item) => {
      const names = [item.name, item.organization, item.schoolName, item.venueName, item.gymName].map((value) => String(value || '').trim().toLowerCase()).filter(Boolean);
      return names.some((name) => name === venueName || teams.includes(name));
    });
    if (!school) return null;
    const latitude = quickAssignNumber(school.venueLatitude, school.venueLat, school.latitude, school.lat, school.location?.latitude, school.location?.lat);
    const longitude = quickAssignNumber(school.venueLongitude, school.venueLng, school.venueLon, school.longitude, school.lng, school.lon, school.location?.longitude, school.location?.lng, school.location?.lon);
    return latitude != null && longitude != null ? { latitude, longitude } : null;
  }

  function quickAssignMilesBetween(first, second) {
    if (!first || !second) return null;
    const values = [first.latitude, first.longitude, second.latitude, second.longitude];
    if (values.some((value) => !Number.isFinite(Number(value)))) return null;
    const radians = (degrees) => Number(degrees) * Math.PI / 180;
    const earthRadiusMiles = 3958.7613;
    const lat1 = radians(first.latitude), lat2 = radians(second.latitude);
    const dLat = radians(second.latitude - first.latitude), dLng = radians(second.longitude - first.longitude);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function quickAssignGameDistance(game) {
    return quickAssignMilesBetween(quickAssignUi.location, quickAssignGameCoordinates(game));
  }

  function quickAssignGameTimestamp(game) {
    if (!game?.date) return null;
    const time = game.startTime || '00:00';
    const value = new Date(`${game.date}T${time}${/^\d{1,2}:\d{2}$/.test(time) ? ':00' : ''}`);
    return Number.isNaN(value.getTime()) ? null : value.getTime();
  }

  function quickAssignOfficialConflict(official, game) {
    if (!official || !game) return 'Official or game record is missing';
    const normalized = normalizeMasterGame(game);
    if (masterAllRoleKeys(normalized).some((role) => normalized[role] === official.id)) return 'Already assigned to this game';
    if (official.certificationExpires && normalized.date && official.certificationExpires < normalized.date) return 'Certification is expired for this game date';
    if (official.rawOfficialId) {
      const availability = (state.officialAvailability || []).find((item) => String(item.officialId) === String(official.rawOfficialId) && item.date === normalized.date);
      if (availability && ['Unavailable','Pending'].includes(availability.status)) return availability.notes || `Availability is ${String(availability.status).toLowerCase()}`;
    }
    if (official.id === 'profile:self' && normalized.date) {
      const calendarStatus = state.calendarAvailability?.[normalized.date];
      if (calendarStatus?.status === 'Unavailable') return calendarStatus.notes || 'Recorded as unavailable';
      const block = (state.calendarBlocks || []).find((item) => {
        if (item.date !== normalized.date) return false;
        if (!normalized.startTime || !item.startTime) return true;
        if (!item.endTime) return item.startTime === normalized.startTime;
        return normalized.startTime >= item.startTime && normalized.startTime < item.endTime;
      });
      if (block) return blockReasonDisplay(block);
    }
    const targetTime = quickAssignGameTimestamp(normalized);
    const targetSchools = new Set(quickAssignSchoolCandidates(normalized));
    for (const otherRaw of (state.masterGames || [])) {
      const other = normalizeMasterGame(otherRaw);
      if (other.id === normalized.id || other.status === 'Canceled') continue;
      if (!masterAllRoleKeys(other).some((role) => other[role] === official.id)) continue;
      const otherTime = quickAssignGameTimestamp(other);
      if (targetTime != null && otherTime != null) {
        const minutes = Math.abs(targetTime - otherTime) / 60000;
        if (minutes === 0) return 'Assigned to another game at the same time';
        if (minutes <= 120) return 'Two hours or less between game starts';
      }
      if (normalized.date && other.date) {
        const days = Math.abs(new Date(`${normalized.date}T12:00:00`) - new Date(`${other.date}T12:00:00`)) / 86400000;
        if (days < 5) {
          const otherSchools = quickAssignSchoolCandidates(other);
          if (otherSchools.some((school) => targetSchools.has(school))) return 'Assigned to the same school within five days';
        }
      }
    }
    const gameCoordinates = quickAssignGameCoordinates(normalized);
    if (official.maxTravelMiles != null && official.latitude != null && official.longitude != null && gameCoordinates) {
      const distance = quickAssignMilesBetween({ latitude: official.latitude, longitude: official.longitude }, gameCoordinates);
      if (distance != null && distance > official.maxTravelMiles) return `Venue is outside the recorded ${official.maxTravelMiles}-mile travel radius`;
    }
    return '';
  }

  function quickAssignRoleAliases(role, game) {
    const isTwo = normalizeMasterGame(game).crewSize === 2;
    if (role === 'refereeId') return ['r','referee','crew chief'];
    if (role === 'umpire1Id') return isTwo ? ['u','umpire','u1','umpire 1'] : ['u1','umpire 1','umpire'];
    if (role === 'umpire2Id') return ['u2','umpire 2','umpire'];
    if (role === 'alternateId') return ['alt','alternate'];
    return [];
  }

  function quickAssignOfficialSupportsRole(official, role, game) {
    if (!official.positions.length) return null;
    const normalized = official.positions.map((value) => value.toLowerCase());
    return quickAssignRoleAliases(role, game).some((alias) => normalized.includes(alias) || normalized.some((value) => value.includes(alias)));
  }

  function quickAssignCertificationMatches(official, value = quickAssignUi.certification) {
    if (!value) return true;
    return official.certifications.some((item) => item.toLowerCase().includes(String(value).toLowerCase()));
  }

  function quickAssignMatchScore(official, game, role) {
    let earned = 0;
    let possible = 0;
    const add = (applicable, matched, weight) => { if (!applicable) return; possible += weight; if (matched) earned += weight; };
    const sport = String(game.sport || '').trim().toLowerCase();
    const level = String(game.level || '').trim().toLowerCase();
    const gender = String(game.gender || '').trim().toLowerCase();
    add(Boolean(official.sports.length && sport), official.sports.some((item) => item.toLowerCase() === sport), 25);
    add(Boolean(official.level && level), official.level.toLowerCase() === level, 25);
    add(Boolean(official.gender && gender), official.gender.toLowerCase() === gender, 10);
    const roleSupport = quickAssignOfficialSupportsRole(official, role, game);
    add(roleSupport != null, roleSupport === true, 25);
    const gameCoordinates = quickAssignGameCoordinates(game);
    const officialCoordinates = official.latitude != null && official.longitude != null ? { latitude: official.latitude, longitude: official.longitude } : null;
    const distance = quickAssignMilesBetween(officialCoordinates, gameCoordinates);
    add(distance != null && official.maxTravelMiles != null, distance <= official.maxTravelMiles, 15);
    if (!possible) return { score: null, label: 'Available', stars: 0 };
    const score = Math.round((earned / possible) * 100);
    const stars = Math.max(1, Math.min(5, Math.round(score / 20)));
    return { score, label: score >= 85 ? 'Excellent' : score >= 70 ? 'Strong' : score >= 50 ? 'Good' : 'Limited data match', stars };
  }

  function quickAssignEligibleOfficials(game, role) {
    return quickAssignOfficials().filter((official) => {
      if (!quickAssignCertificationMatches(official)) return false;
      if (quickAssignUi.officialId && official.id !== quickAssignUi.officialId) return false;
      if (quickAssignOfficialSupportsRole(official, role, game) === false) return false;
      return !quickAssignOfficialConflict(official, game);
    }).map((official) => ({ official, match: quickAssignMatchScore(official, game, role) })).sort((a, b) => {
      const scoreA = a.match.score == null ? -1 : a.match.score;
      const scoreB = b.match.score == null ? -1 : b.match.score;
      return scoreB - scoreA || a.official.gamesWorked - b.official.gamesWorked || a.official.name.localeCompare(b.official.name);
    });
  }

  function quickAssignSuggestion(game, onlyRole = '') {
    const draft = { ...normalizeMasterGame(game) };
    const roles = onlyRole ? [onlyRole] : quickAssignMissingRoles(draft);
    const assignments = [];
    for (const role of roles) {
      if (!masterPrimaryRoleKeys(draft).includes(role) || draft[role]) continue;
      const candidate = quickAssignEligibleOfficials(draft, role).find(({ official }) => !masterAllRoleKeys(draft).some((key) => draft[key] === official.id));
      if (!candidate) continue;
      draft[role] = candidate.official.id;
      assignments.push({ role, ...candidate });
    }
    return { game: draft, assignments };
  }

  function quickAssignDistinct(values) {
    return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function quickAssignTimeBand(game) {
    const hour = Number(String(game.startTime || '').split(':')[0]);
    if (!Number.isFinite(hour)) return '';
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  function quickAssignFilteredGames() {
    const query = quickAssignUi.query.trim().toLowerCase();
    const radius = Number(quickAssignUi.radius || 0);
    const direction = quickAssignUi.sortDir === 'desc' ? -1 : 1;
    const result = quickAssignBaseGames().filter((game) => {
      if (quickAssignUi.startDate && (!game.date || game.date < quickAssignUi.startDate)) return false;
      if (quickAssignUi.endDate && (!game.date || game.date > quickAssignUi.endDate)) return false;
      if (quickAssignUi.sport && game.sport !== quickAssignUi.sport) return false;
      if (quickAssignUi.level && game.level !== quickAssignUi.level) return false;
      if (quickAssignUi.timeBand && quickAssignTimeBand(game) !== quickAssignUi.timeBand) return false;
      if (quickAssignUi.venue && game.gymName !== quickAssignUi.venue) return false;
      if (quickAssignUi.status && game.status !== quickAssignUi.status) return false;
      if (quickAssignUi.gender && game.gender !== quickAssignUi.gender) return false;
      if (quickAssignUi.officialsNeeded && quickAssignMissingRoles(game).length !== Number(quickAssignUi.officialsNeeded)) return false;
      if (quickAssignUi.role && !quickAssignMissingRoles(game).includes(quickAssignUi.role)) return false;
      if (quickAssignUi.school) {
        const schoolText = [game.school, game.homeTeam, game.awayTeam].join(' ').toLowerCase();
        if (!schoolText.includes(quickAssignUi.school.toLowerCase())) return false;
      }
      if (quickAssignUi.officialId && !quickAssignMissingRoles(game).some((role) => quickAssignEligibleOfficials(game, role).some(({ official }) => official.id === quickAssignUi.officialId))) return false;
      if (radius > 0 && quickAssignUi.location) {
        const distance = quickAssignGameDistance(game);
        if (distance == null || distance > radius) return false;
      }
      if (query) {
        const haystack = [game.date, game.startTime, game.sport, game.level, game.gender, game.school, game.homeTeam, game.awayTeam, game.gymName, game.address, game.status].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    const sortValue = (game) => {
      if (quickAssignUi.sortKey === 'game') return `${game.homeTeam} ${game.awayTeam}`.toLowerCase();
      if (quickAssignUi.sortKey === 'sport') return `${game.sport} ${game.level} ${game.gender}`.toLowerCase();
      if (quickAssignUi.sortKey === 'venue') return `${game.gymName} ${game.address}`.toLowerCase();
      if (quickAssignUi.sortKey === 'needed') return quickAssignMissingRoles(game).length;
      if (quickAssignUi.sortKey === 'distance') return quickAssignGameDistance(game) ?? Number.MAX_SAFE_INTEGER;
      if (quickAssignUi.sortKey === 'match') return quickAssignGameMatchQuality(game).score ?? -1;
      return `${game.date}${game.startTime}`;
    };
    return result.sort((a, b) => {
      const av = sortValue(a), bv = sortValue(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * direction;
      return String(av).localeCompare(String(bv)) * direction;
    });
  }

  function quickAssignMatchedOfficials(games = quickAssignFilteredGames()) {
    return quickAssignOfficials().map((official) => {
      const matches = [];
      games.forEach((game) => {
        quickAssignMissingRoles(game).forEach((role) => {
          if (!quickAssignCertificationMatches(official) || quickAssignOfficialConflict(official, game)) return;
          matches.push({ game, role, match: quickAssignMatchScore(official, game, role) });
        });
      });
      const scores = matches.map((item) => item.match.score).filter((value) => value != null);
      return { official, matches, averageScore: scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null };
    }).filter((item) => item.matches.length).sort((a, b) => (b.averageScore ?? -1) - (a.averageScore ?? -1) || b.matches.length - a.matches.length || a.official.name.localeCompare(b.official.name));
  }

  function quickAssignGameMatchQuality(game) {
    const suggestion = quickAssignSuggestion(game);
    if (!suggestion.assignments.length) return { score: null, label: 'No eligible officials', stars: 0 };
    const scores = suggestion.assignments.map((item) => item.match.score).filter((value) => value != null);
    if (!scores.length) return { score: null, label: 'Eligible crew found', stars: 0 };
    const score = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
    return { score, label: score >= 85 ? 'Excellent' : score >= 70 ? 'Strong' : score >= 50 ? 'Good' : 'Limited data match', stars: Math.max(1, Math.min(5, Math.round(score / 20))) };
  }

  function quickAssignStars(match) {
    if (match.score == null) return `<span class="quick-match-text">${esc(match.label)}</span>`;
    return `<span class="quick-match-stars" aria-label="${esc(match.score)} percent match">${Array.from({ length: 5 }, (_, index) => `<span class="${index < match.stars ? 'is-filled' : ''}">★</span>`).join('')}</span><small>${esc(match.label)} · ${match.score}%</small>`;
  }

  function quickAssignSortButton(label, key) {
    const active = quickAssignUi.sortKey === key;
    const arrow = active ? (quickAssignUi.sortDir === 'desc' ? '↓' : '↑') : '↕';
    return `<button type="button" class="quick-sort ${active ? 'is-active' : ''}" data-action="sort-quick-assign" data-key="${key}">${esc(label)}<span aria-hidden="true">${arrow}</span></button>`;
  }

  function quickAssignTeamMark(name) {
    return unpublishedTeamMark(name);
  }

  function quickAssignGameRow(game) {
    const missing = quickAssignMissingRoles(game);
    const distance = quickAssignGameDistance(game);
    const quality = quickAssignGameMatchQuality(game);
    const matchup = [game.homeTeam, game.awayTeam].filter(Boolean);
    return `<tr>
      <td data-label="Date & Time"><time datetime="${esc([game.date, game.startTime].filter(Boolean).join('T'))}"><strong>${esc(game.date ? fmtDate(game.date) : 'Date not recorded')}</strong><span>${esc(game.startTime ? calendarTime(game.startTime) : 'Time not recorded')}</span></time></td>
      <td data-label="Game"><div class="quick-game-matchup"><div>${quickAssignTeamMark(game.homeTeam)}<strong>${esc(game.homeTeam || 'Home team not recorded')}</strong></div><span>vs</span><div>${quickAssignTeamMark(game.awayTeam)}<strong>${esc(game.awayTeam || 'Visiting team not recorded')}</strong></div></div></td>
      <td data-label="Sport / Level"><div class="quick-stack"><strong>${esc(game.sport || 'Sport not recorded')}</strong><span>${esc([game.level, game.gender].filter(Boolean).join(' · ') || 'Level not recorded')}</span></div></td>
      <td data-label="Venue"><div class="quick-stack"><strong>${esc(game.gymName || 'Venue not recorded')}</strong><span>${esc(game.address || '')}</span></div></td>
      <td data-label="Crew Needed"><div class="quick-crew-needed"><strong>${missing.length} Official${missing.length === 1 ? '' : 's'}</strong><span>${missing.map((role) => esc(quickAssignRoleLabel(role, game))).join(', ')}</span></div></td>
      <td data-label="Distance"><strong>${distance == null ? 'Not recorded' : `${distance.toFixed(1)} mi`}</strong></td>
      <td data-label="Match Quality"><div class="quick-match-quality">${quickAssignStars(quality)}</div></td>
      <td data-label="Actions"><div class="quick-row-actions"><button type="button" data-action="quick-assign-game" data-id="${esc(game.id)}" ${quality.label === 'No eligible officials' ? 'disabled' : ''}>${icon('i-user')}Quick Assign</button><details><summary aria-label="More quick assign actions">${icon('i-chevron')}</summary><div>${missing.map((role) => `<button type="button" data-action="quick-assign-role" data-role="${role}" data-id="${esc(game.id)}">Assign ${esc(quickAssignRoleLabel(role, game))}</button>`).join('')}<button type="button" data-action="edit-master-game" data-id="${esc(game.id)}">Open Game</button></div></details></div></td>
    </tr>`;
  }

  function quickAssignOfficialsView(games) {
    const records = quickAssignMatchedOfficials(games);
    return `<div class="quick-official-grid">${records.length ? records.map(({ official, matches, averageScore }) => {
      const source = quickAssignSourceRecord(official.id) || {};
      const location = [official.city, official.region].filter(Boolean).join(', ');
      const certification = official.certifications.join(', ');
      return `<article class="quick-official-card"><span class="create-official-avatar">${esc(createGameInitials(official.name))}</span><div><h3>${esc(official.name)}</h3><p>${esc([certification, official.positions.join(', ')].filter(Boolean).join(' · ') || official.source)}</p><small>${esc(location || official.email)}</small></div><dl><div><dt>Matching openings</dt><dd>${matches.length}</dd></div><div><dt>Games worked</dt><dd>${official.gamesWorked}</dd></div><div><dt>Average match</dt><dd>${averageScore == null ? 'Available' : `${averageScore}%`}</dd></div></dl><button type="button" data-action="quick-view-official-games" data-id="${esc(official.id)}">View Matching Games</button></article>`;
    }).join('') : `<div class="quick-empty-state">${icon('i-user')}<strong>No officials match the current games and filters.</strong><p>Add active official records and availability information, or adjust the filters.</p><button type="button" data-action="clear-quick-filters">Clear Filters</button></div>`}</div>`;
  }

  function quickAssignSuggestionsView(games) {
    const suggestions = games.map((game) => ({ game, suggestion: quickAssignSuggestion(game) }));
    return `<div class="quick-suggestion-list">${suggestions.length ? suggestions.map(({ game, suggestion }) => `<article class="quick-suggestion-card"><div class="quick-suggestion-game"><time><strong>${esc(game.date ? fmtDate(game.date) : 'Date not recorded')}</strong><span>${esc(game.startTime ? calendarTime(game.startTime) : 'Time not recorded')}</span></time><div><h3>${esc([game.homeTeam, game.awayTeam].filter(Boolean).join(' vs. ') || 'Game teams not recorded')}</h3><p>${esc([game.sport, game.level, game.gender].filter(Boolean).join(' · '))}</p><small>${esc([game.gymName, game.address].filter(Boolean).join(' · '))}</small></div></div><div class="quick-suggested-crew">${quickAssignMissingRoles(game).map((role) => { const assigned = suggestion.assignments.find((item) => item.role === role); return `<div class="${assigned ? 'has-match' : ''}"><span>${esc(quickAssignRoleLabel(role, game))}</span><strong>${esc(assigned?.official.name || 'No eligible official')}</strong>${assigned ? `<small>${assigned.match.score == null ? assigned.match.label : `${assigned.match.score}% match`}</small>` : ''}</div>`; }).join('')}</div><button type="button" data-action="apply-quick-suggestion" data-id="${esc(game.id)}" ${suggestion.assignments.length ? '' : 'disabled'}>${icon('i-check')}Apply Suggestion</button></article>`).join('') : `<div class="quick-empty-state">${icon('i-calendar')}<strong>No games need a crew under the current filters.</strong><p>Create or import games with open crew positions to generate suggestions.</p><button type="button" data-action="set-assignment-section" data-section="create-game-3">Create 3-Man Assignment</button></div>`}</div>`;
  }

  function quickAssignPagination(pageCount) {
    const current = quickAssignUi.page;
    const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter((page) => page === 1 || page === pageCount || Math.abs(page - current) <= 2);
    return `<div class="quick-pagination"><button type="button" data-action="quick-page" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''} aria-label="Previous page">‹</button>${pages.map((page, index) => `${index && page - pages[index - 1] > 1 ? '<span>…</span>' : ''}<button type="button" class="${page === current ? 'is-active' : ''}" data-action="quick-page" data-page="${page}">${page}</button>`).join('')}<button type="button" data-action="quick-page" data-page="${current + 1}" ${current >= pageCount ? 'disabled' : ''} aria-label="Next page">›</button></div>`;
  }

  function quickAssignApply(gameId, role = '') {
    const record = (state.masterGames || []).find((item) => item.id === gameId);
    if (!record) { showToast('Game record not found.'); return 0; }
    const started = performance.now();
    const suggestion = quickAssignSuggestion(record, role);
    if (!suggestion.assignments.length) { showToast('No eligible officials are available for the selected opening.'); return 0; }
    suggestion.assignments.forEach(({ role: targetRole, official }) => { record[targetRole] = official.id; });
    record.assignmentMethod = 'quick-assign';
    record.autoAssignedAt = new Date().toISOString();
    record.updatedAt = record.autoAssignedAt;
    quickAssignUi.sessionAssignments += suggestion.assignments.length;
    quickAssignUi.lastRunMs = Math.max(1, Math.round(performance.now() - started));
    notify(`${suggestion.assignments.length} crew position${suggestion.assignments.length === 1 ? '' : 's'} assigned for ${[record.homeTeam, record.awayTeam].filter(Boolean).join(' vs. ') || 'a master schedule game'}.`);
    saveState();
    return suggestion.assignments.length;
  }

  function quickAssignAutoAssign() {
    const games = quickAssignFilteredGames();
    if (!games.length) { showToast('No games need crews under the current filters.'); return; }
    const started = performance.now();
    let assignments = 0;
    games.forEach((game) => {
      const record = (state.masterGames || []).find((item) => item.id === game.id);
      if (!record) return;
      const suggestion = quickAssignSuggestion(record);
      suggestion.assignments.forEach(({ role, official }) => { record[role] = official.id; assignments += 1; });
      if (suggestion.assignments.length) { record.assignmentMethod = 'quick-assign'; record.autoAssignedAt = new Date().toISOString(); record.updatedAt = record.autoAssignedAt; }
    });
    quickAssignUi.sessionAssignments += assignments;
    quickAssignUi.lastRunMs = Math.max(1, Math.round(performance.now() - started));
    if (assignments) {
      notify(`${assignments} crew position${assignments === 1 ? '' : 's'} assigned through Quick Assign.`);
      saveState();
      showToast(`${assignments} crew position${assignments === 1 ? '' : 's'} assigned.`);
    } else showToast('No eligible officials were available for the filtered games.');
  }

  function quickAssignRunTime() {
    if (!quickAssignUi.lastRunMs) return { value: '—', note: 'Run Quick Assign to measure' };
    if (quickAssignUi.lastRunMs < 1000) return { value: `${quickAssignUi.lastRunMs} ms`, note: 'Last assignment run' };
    return { value: `${(quickAssignUi.lastRunMs / 1000).toFixed(2)} s`, note: 'Last assignment run' };
  }

  function tbaGameDateTime(game) {
    if (!game?.date || !game?.startTime) return null;
    const value = new Date(`${game.date}T${game.startTime}:00`);
    return Number.isNaN(value.getTime()) ? null : value;
  }

  function tbaDateKeyOffset(days = 0) {
    const value = new Date();
    value.setHours(12, 0, 0, 0);
    value.setDate(value.getDate() + Number(days || 0));
    return dateKey(value);
  }

  function tbaUrgency(game) {
    const gameTime = tbaGameDateTime(game);
    if (!gameTime) return { key: 'incomplete', label: 'Schedule Incomplete', note: 'Date or time is not recorded', rank: 4 };
    const hours = (gameTime.getTime() - Date.now()) / 3600000;
    if (hours < 0) return { key: 'overdue', label: 'Past Due', note: 'Game time has passed', rank: 0 };
    if (hours <= 24) return { key: 'urgent', label: 'Urgent', note: 'Within 24 hrs', rank: 1 };
    if (hours <= 48) return { key: 'soon', label: 'Soon', note: 'Within 48 hrs', rank: 2 };
    return { key: 'standard', label: 'Standard', note: 'More than 48 hrs', rank: 3 };
  }

  function tbaBaseGames() {
    return (state.masterGames || []).map(normalizeMasterGame).filter((game) => !['Canceled', 'Completed'].includes(game.status) && quickAssignMissingRoles(game).length);
  }

  function tbaMatchesCommonFilters(game) {
    const query = tbaGamesUi.query.trim().toLowerCase();
    if (tbaGamesUi.startDate && (!game.date || game.date < tbaGamesUi.startDate)) return false;
    if (tbaGamesUi.endDate && (!game.date || game.date > tbaGamesUi.endDate)) return false;
    if (tbaGamesUi.sport && game.sport !== tbaGamesUi.sport) return false;
    if (tbaGamesUi.level && game.level !== tbaGamesUi.level) return false;
    if (tbaGamesUi.crewSize && String(game.crewSize) !== String(tbaGamesUi.crewSize)) return false;
    if (tbaGamesUi.gender && game.gender !== tbaGamesUi.gender) return false;
    if (tbaGamesUi.school) {
      const schoolText = [game.school, game.homeTeam, game.awayTeam].join(' ').toLowerCase();
      if (!schoolText.includes(tbaGamesUi.school.toLowerCase())) return false;
    }
    const urgency = tbaUrgency(game);
    if (tbaGamesUi.status && urgency.key !== tbaGamesUi.status) return false;
    if (query) {
      const haystack = [game.id, game.date, game.startTime, game.sport, game.level, game.gender, game.school, game.homeTeam, game.awayTeam, game.gymName, game.address, game.status].join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  }

  function tbaCommonFilteredGames() {
    return tbaBaseGames().filter(tbaMatchesCommonFilters);
  }

  function tbaFilteredGames() {
    const today = tbaDateKeyOffset(0);
    const tomorrow = tbaDateKeyOffset(1);
    const direction = tbaGamesUi.sortDir === 'desc' ? -1 : 1;
    const games = tbaCommonFilteredGames().filter((game) => {
      const urgency = tbaUrgency(game);
      if (tbaGamesUi.tab === 'urgent' && !['overdue', 'urgent', 'soon'].includes(urgency.key)) return false;
      if (tbaGamesUi.tab === 'today' && game.date !== today) return false;
      if (tbaGamesUi.tab === 'tomorrow' && game.date !== tomorrow) return false;
      return true;
    });
    const sortValue = (game) => {
      if (tbaGamesUi.sortKey === 'game') return `${game.homeTeam} ${game.awayTeam}`.toLowerCase();
      if (tbaGamesUi.sortKey === 'sport') return `${game.sport} ${game.level} ${game.gender}`.toLowerCase();
      if (tbaGamesUi.sortKey === 'venue') return `${game.gymName} ${game.address}`.toLowerCase();
      if (tbaGamesUi.sortKey === 'status') return tbaUrgency(game).rank;
      if (tbaGamesUi.sortKey === 'crew') return quickAssignMissingRoles(game).length;
      return `${game.date || '9999-99-99'}${game.startTime || '99:99'}${game.homeTeam}`;
    };
    return games.sort((a, b) => {
      const av = sortValue(a), bv = sortValue(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * direction;
      return String(av).localeCompare(String(bv)) * direction;
    });
  }

  function tbaReadyForReviewGames() {
    return (state.masterGames || []).map(normalizeMasterGame).filter((game) => {
      if (['Canceled', 'Completed', 'Published'].includes(game.status)) return false;
      if (!game.autoAssignedAt || game.assignmentMethod !== 'quick-assign') return false;
      if (quickAssignMissingRoles(game).length) return false;
      return tbaMatchesCommonFilters(game);
    });
  }

  function tbaFilterValues(key) {
    return quickAssignDistinct(tbaBaseGames().map((game) => game[key]));
  }

  function tbaSchoolValues() {
    return quickAssignDistinct(tbaBaseGames().flatMap((game) => [game.school, game.homeTeam, game.awayTeam]));
  }

  function tbaDateRangeLabel() {
    const sourceDates = tbaBaseGames().map((game) => game.date).filter(Boolean).sort();
    const start = tbaGamesUi.startDate || sourceDates[0] || '';
    const end = tbaGamesUi.endDate || sourceDates[sourceDates.length - 1] || '';
    if (!start && !end) return 'All scheduled dates';
    if (start && end && start === end) return fmtDate(start);
    return [start ? fmtDate(start) : 'Beginning', end ? fmtDate(end) : 'Open ended'].join(' – ');
  }

  function tbaRelativeDate(game) {
    if (!game.date) return '';
    if (game.date === tbaDateKeyOffset(0)) return 'Today';
    if (game.date === tbaDateKeyOffset(1)) return 'Tomorrow';
    return '';
  }

  function tbaSortButton(label, key) {
    const active = tbaGamesUi.sortKey === key;
    const arrow = active ? (tbaGamesUi.sortDir === 'desc' ? '↓' : '↑') : '↕';
    return `<button type="button" class="tba-sort ${active ? 'is-active' : ''}" data-action="sort-tba-games" data-key="${key}">${esc(label)}<span aria-hidden="true">${arrow}</span></button>`;
  }

  function tbaGameRow(game) {
    const urgency = tbaUrgency(game);
    const relative = tbaRelativeDate(game);
    const assigned = masterPrimaryRoleKeys(game).filter((role) => game[role]).length;
    const missing = quickAssignMissingRoles(game);
    const canQuickAssign = withNeutralQuickAssignFilters(() => quickAssignSuggestion(game).assignments.length > 0);
    return `<tr class="tba-row is-${esc(urgency.key)}">
      <td data-label="Date & Time"><time datetime="${esc([game.date, game.startTime].filter(Boolean).join('T'))}">${relative ? `<b>${esc(relative)}</b>` : ''}<strong>${game.date ? esc(fmtDate(game.date)) : '—'}</strong><span>${game.startTime ? esc(calendarTime(game.startTime)) : '—'}</span></time></td>
      <td data-label="Game"><div class="tba-matchup"><div>${unpublishedTeamMark(game.homeTeam)}<strong>${esc(game.homeTeam || '—')}</strong></div><span>vs</span><div>${unpublishedTeamMark(game.awayTeam)}<strong>${esc(game.awayTeam || '—')}</strong></div></div></td>
      <td data-label="Sport / Level"><div class="tba-stack"><strong>${esc(game.sport || '—')}</strong><span>${esc([game.level, game.gender].filter(Boolean).join(' · ') || '—')}</span></div></td>
      <td data-label="Venue"><div class="tba-stack"><strong>${esc(game.gymName || '—')}</strong><span>${esc(game.address || '')}</span></div></td>
      <td data-label="Status"><div class="tba-urgency is-${esc(urgency.key)}"><strong>${esc(urgency.label)}</strong><span>${esc(urgency.note)}</span></div></td>
      <td data-label="Crew Needed"><div class="tba-crew"><strong>${game.crewSize} Officials</strong><span>${assigned} Assigned</span><small>${missing.map((role) => esc(quickAssignRoleLabel(role, game))).join(', ')}</small></div></td>
      <td data-label="Actions"><div class="tba-actions"><button type="button" data-action="tba-assign-game" data-id="${esc(game.id)}">${icon('i-user')}Assign</button><details><summary aria-label="More actions for ${esc([game.homeTeam, game.awayTeam].filter(Boolean).join(' versus ') || 'game')}">${icon('i-chevron')}</summary><div><button type="button" data-action="tba-quick-assign-game" data-id="${esc(game.id)}" ${canQuickAssign ? '' : 'disabled'}>${icon('i-bolt')}Quick Assign Openings</button><button type="button" data-action="edit-master-game" data-id="${esc(game.id)}">${icon('i-edit')}Edit Schedule Record</button><button type="button" data-action="tba-view-master" data-id="${esc(game.id)}">${icon('i-calendar')}View Master Schedule</button></div></details></div></td>
    </tr>`;
  }

  function tbaPagination(pageCount) {
    const current = tbaGamesUi.page;
    const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter((page) => page === 1 || page === pageCount || Math.abs(page - current) <= 2);
    return `<div class="tba-pagination"><button type="button" data-action="tba-page" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''} aria-label="Previous page">‹</button>${pages.map((page, index) => `${index && page - pages[index - 1] > 1 ? '<span>…</span>' : ''}<button type="button" class="${page === current ? 'is-active' : ''}" data-action="tba-page" data-page="${page}">${page}</button>`).join('')}<button type="button" data-action="tba-page" data-page="${current + 1}" ${current >= pageCount ? 'disabled' : ''} aria-label="Next page">›</button></div>`;
  }

  function tbaExportGames() {
    const rows = tbaFilteredGames().map((game) => {
      const urgency = tbaUrgency(game);
      return {
        gameId: game.id,
        date: game.date,
        startTime: game.startTime,
        sport: game.sport,
        level: game.level,
        gender: game.gender,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        venue: game.gymName,
        address: game.address,
        urgency: urgency.label,
        crewSize: game.crewSize,
        assignedOfficials: masterPrimaryRoleKeys(game).filter((role) => game[role]).length,
        openings: quickAssignMissingRoles(game).map((role) => quickAssignRoleLabel(role, game)).join('|'),
        referee: masterCrewName(game.refereeId),
        umpire1: masterCrewName(game.umpire1Id),
        umpire2: masterCrewName(game.umpire2Id)
      };
    });
    exportCSV('got-u-nex-ref-tba-games.csv', rows, ['gameId','date','startTime','sport','level','gender','homeTeam','awayTeam','venue','address','urgency','crewSize','assignedOfficials','openings','referee','umpire1','umpire2']);
  }

  function withNeutralQuickAssignFilters(callback) {
    const snapshot = { officialId: quickAssignUi.officialId, certification: quickAssignUi.certification };
    quickAssignUi.officialId = '';
    quickAssignUi.certification = '';
    try { return callback(); }
    finally { quickAssignUi.officialId = snapshot.officialId; quickAssignUi.certification = snapshot.certification; }
  }

  function tbaQuickAssignOne(gameId) {
    const record = (state.masterGames || []).find((game) => game.id === gameId);
    if (!record) { showToast('Game record not found.'); return 0; }
    const started = performance.now();
    const suggestion = withNeutralQuickAssignFilters(() => quickAssignSuggestion(record));
    if (!suggestion.assignments.length) { showToast('No eligible recorded officials are available for this game.'); return 0; }
    suggestion.assignments.forEach(({ role, official }) => { record[role] = official.id; });
    record.assignmentMethod = 'quick-assign';
    record.autoAssignedAt = new Date().toISOString();
    record.updatedAt = record.autoAssignedAt;
    quickAssignUi.sessionAssignments += suggestion.assignments.length;
    quickAssignUi.lastRunMs = Math.max(1, Math.round(performance.now() - started));
    notify(`${suggestion.assignments.length} crew position${suggestion.assignments.length === 1 ? '' : 's'} assigned for ${[record.homeTeam, record.awayTeam].filter(Boolean).join(' vs. ') || 'a scheduled game'}.`);
    saveState();
    return suggestion.assignments.length;
  }

  function tbaQuickAssignFiltered() {
    const games = tbaFilteredGames();
    if (!games.length) { showToast('No TBA games match the current view.'); return 0; }
    const started = performance.now();
    let assignments = 0;
    let updatedGames = 0;
    withNeutralQuickAssignFilters(() => {
      games.forEach((game) => {
        const record = (state.masterGames || []).find((item) => item.id === game.id);
        if (!record) return;
        const suggestion = quickAssignSuggestion(record);
        if (!suggestion.assignments.length) return;
        suggestion.assignments.forEach(({ role, official }) => { record[role] = official.id; assignments += 1; });
        record.assignmentMethod = 'quick-assign';
        record.autoAssignedAt = new Date().toISOString();
        record.updatedAt = record.autoAssignedAt;
        updatedGames += 1;
      });
    });
    quickAssignUi.sessionAssignments += assignments;
    quickAssignUi.lastRunMs = Math.max(1, Math.round(performance.now() - started));
    if (assignments) {
      notify(`${assignments} crew position${assignments === 1 ? '' : 's'} assigned across ${updatedGames} TBA game${updatedGames === 1 ? '' : 's'}.`);
      saveState();
      showToast(`${assignments} crew position${assignments === 1 ? '' : 's'} assigned.`);
    } else showToast('No eligible recorded officials were available for the selected TBA games.');
    return assignments;
  }

  function openTbaAssignmentWorkspace(gameId) {
    const record = (state.masterGames || []).find((game) => game.id === gameId);
    if (!record) { showToast('Game record not found.'); return; }
    const game = normalizeMasterGame(record);
    const crewSize = game.crewSize === 2 ? 2 : 3;
    const workspace = createGameUiByCrew[crewSize];
    Object.assign(workspace, {
      crewSize,
      draftId: game.id,
      selectedRole: quickAssignMissingRoles(game)[0] || 'alternateId',
      officialTab: 'available',
      unavailableLimit: 3,
      officialQuery: '',
      officialType: '',
      officialLevel: '',
      officialGender: '',
      date: game.date,
      startTime: game.startTime,
      sport: game.sport,
      level: game.level,
      gender: game.gender,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      gymName: game.gymName,
      address: game.address,
      venuePhone: game.venuePhone,
      notes: game.notes,
      refereeId: game.refereeId,
      umpire1Id: game.umpire1Id,
      umpire2Id: crewSize === 3 ? game.umpire2Id : '',
      alternateId: game.alternateId
    });
    createGameUi = workspace;
    assignmentUi.section = crewSize === 3 ? 'create-game-3' : 'create-game-2';
    myGamesUi.detailId = '';
    refreshAssignments();
  }

  function renderTbaGames() {
    const commonGames = tbaCommonFilteredGames();
    const games = tbaFilteredGames();
    const pageCount = Math.max(1, Math.ceil(games.length / tbaGamesUi.pageSize));
    tbaGamesUi.page = Math.min(Math.max(1, tbaGamesUi.page), pageCount);
    const startIndex = (tbaGamesUi.page - 1) * tbaGamesUi.pageSize;
    const pageGames = games.slice(startIndex, startIndex + tbaGamesUi.pageSize);
    const firstShown = games.length ? startIndex + 1 : 0;
    const lastShown = Math.min(startIndex + pageGames.length, games.length);
    const urgentCount = commonGames.filter((game) => ['overdue','urgent','soon'].includes(tbaUrgency(game).key)).length;
    const todayCount = commonGames.filter((game) => game.date === tbaDateKeyOffset(0)).length;
    const tomorrowCount = commonGames.filter((game) => game.date === tbaDateKeyOffset(1)).length;
    const venues = new Set(commonGames.map((game) => game.gymName.trim()).filter(Boolean)).size;
    const readyForReview = tbaReadyForReviewGames().length;
    const sports = tbaFilterValues('sport');
    const levels = tbaFilterValues('level');
    const genders = tbaFilterValues('gender');
    const schools = tbaSchoolValues();
    return `<section class="tba-page">
      <header class="tba-heading"><div><h1>TBA Games</h1><p>Games in the Master Schedule that still need one or more required officials.</p></div><div><button type="button" class="tba-sync" data-action="sync-tba-games">${icon('i-sync')}Sync from Schedule</button><button type="button" class="tba-quick" data-action="quick-assign-tba-games">${icon('i-bolt')}Quick Assign TBA Games</button></div></header>
      <section class="tba-metrics" aria-label="TBA game totals"><article><span>${icon('i-calendar')}</span><div><strong>${commonGames.length}</strong><b>TBA Games</b><small>Total games needing crews</small></div></article><article><span>${icon('i-clock')}</span><div><strong>${urgentCount}</strong><b>Urgent</b><small>Within 48 hours or past due</small></div></article><article><span>${icon('i-pin')}</span><div><strong>${venues}</strong><b>Venues</b><small>Venues represented in this view</small></div></article><article><span>${icon('i-bolt')}</span><div><strong>${readyForReview}</strong><b>Auto Assigned</b><small>Complete crews ready for review</small></div></article></section>
      <section class="tba-filter-panel"><div class="tba-filter-grid"><label class="tba-search"><span class="sr-only">Search TBA games</span>${icon('i-search')}<input type="search" value="${esc(tbaGamesUi.query)}" data-tba-query placeholder="Search by team, venue, or game ID" autocomplete="off"></label><details class="tba-date-range"><summary>${icon('i-calendar')}<span>${esc(tbaDateRangeLabel())}</span>${icon('i-chevron')}</summary><div><label><span>Date From</span><input type="date" value="${esc(tbaGamesUi.startDate)}" data-tba-filter="startDate"></label><label><span>Date Through</span><input type="date" value="${esc(tbaGamesUi.endDate)}" data-tba-filter="endDate"></label><button type="button" data-action="clear-tba-dates">Clear Date Range</button></div></details><label><span class="sr-only">Sport</span><select data-tba-filter="sport"><option value="">All Sports</option>${sports.map((value) => option(value, tbaGamesUi.sport)).join('')}</select></label><label><span class="sr-only">Level</span><select data-tba-filter="level"><option value="">All Levels</option>${levels.map((value) => option(value, tbaGamesUi.level)).join('')}</select></label><label><span class="sr-only">Status</span><select data-tba-filter="status"><option value="">All Statuses</option><option value="overdue" ${tbaGamesUi.status === 'overdue' ? 'selected' : ''}>Past Due</option><option value="urgent" ${tbaGamesUi.status === 'urgent' ? 'selected' : ''}>Urgent</option><option value="soon" ${tbaGamesUi.status === 'soon' ? 'selected' : ''}>Soon</option><option value="standard" ${tbaGamesUi.status === 'standard' ? 'selected' : ''}>Standard</option><option value="incomplete" ${tbaGamesUi.status === 'incomplete' ? 'selected' : ''}>Schedule Incomplete</option></select></label><div class="tba-filter-actions"><button type="button" class="${tbaGamesUi.filtersOpen ? 'is-active' : ''}" data-action="toggle-tba-filters" aria-expanded="${tbaGamesUi.filtersOpen}">${icon('i-filter')}Filters</button><button type="button" data-action="clear-tba-filters">${icon('i-sync')}Clear</button></div></div><div class="tba-extra-filters" ${tbaGamesUi.filtersOpen ? '' : 'hidden'}><label><span>Crew Size</span><select data-tba-filter="crewSize"><option value="">All Crew Sizes</option><option value="2" ${String(tbaGamesUi.crewSize) === '2' ? 'selected' : ''}>2-Man Crew</option><option value="3" ${String(tbaGamesUi.crewSize) === '3' ? 'selected' : ''}>3-Man Crew</option></select></label><label><span>Gender</span><select data-tba-filter="gender"><option value="">All Genders</option>${genders.map((value) => option(value, tbaGamesUi.gender)).join('')}</select></label><label><span>School / Team</span><select data-tba-filter="school"><option value="">All Schools / Teams</option>${schools.map((value) => option(value, tbaGamesUi.school)).join('')}</select></label></div></section>
      <section class="tba-list-panel"><nav class="tba-tabs" aria-label="TBA game views"><button type="button" class="${tbaGamesUi.tab === 'all' ? 'is-active' : ''}" data-action="set-tba-tab" data-tab="all">All TBA Games <span>${commonGames.length}</span></button><button type="button" class="${tbaGamesUi.tab === 'urgent' ? 'is-active' : ''}" data-action="set-tba-tab" data-tab="urgent">Urgent <span>${urgentCount}</span></button><button type="button" class="${tbaGamesUi.tab === 'today' ? 'is-active' : ''}" data-action="set-tba-tab" data-tab="today">Today <span>${todayCount}</span></button><button type="button" class="${tbaGamesUi.tab === 'tomorrow' ? 'is-active' : ''}" data-action="set-tba-tab" data-tab="tomorrow">Tomorrow <span>${tomorrowCount}</span></button><button type="button" class="tba-export" data-action="export-tba-games">${icon('i-download')}Export</button></nav><div class="tba-table-scroll"><table class="tba-table"><thead><tr><th>${tbaSortButton('Date & Time','date')}</th><th>${tbaSortButton('Game','game')}</th><th>${tbaSortButton('Sport / Level','sport')}</th><th>${tbaSortButton('Venue','venue')}</th><th>${tbaSortButton('Status','status')}</th><th>${tbaSortButton('Crew Needed','crew')}</th><th>Actions</th></tr></thead><tbody>${pageGames.length ? pageGames.map(tbaGameRow).join('') : `<tr><td colspan="7"><div class="tba-empty">${icon('i-calendar')}<strong>${tbaBaseGames().length ? 'No TBA games match the current view.' : 'No scheduled games are waiting for a crew.'}</strong><p>${tbaBaseGames().length ? 'Adjust or clear the filters to see other games.' : 'Games with open required crew positions will appear here automatically from the Master Schedule.'}</p><div>${tbaBaseGames().length ? '<button type="button" data-action="clear-tba-filters">Clear Filters</button>' : '<button type="button" data-action="set-assignment-section" data-section="create-game-2">Create 2-Man Assignment</button><button type="button" data-action="set-assignment-section" data-section="create-game-3">Create 3-Man Assignment</button>'}</div></div></td></tr>`}</tbody></table></div><footer><p>Showing ${firstShown} to ${lastShown} of ${games.length} TBA game${games.length === 1 ? '' : 's'}</p><div><label><span class="sr-only">Rows per page</span><select data-tba-page-size>${[10,25,50].map((value) => option(String(value), String(tbaGamesUi.pageSize), `${value} per page`)).join('')}</select></label>${tbaPagination(pageCount)}</div></footer></section>
    </section>`;
  }

  function renderQuickAssign() {
    const games = quickAssignFilteredGames();
    const pageCount = Math.max(1, Math.ceil(games.length / quickAssignUi.pageSize));
    quickAssignUi.page = Math.min(Math.max(1, quickAssignUi.page), pageCount);
    const startIndex = (quickAssignUi.page - 1) * quickAssignUi.pageSize;
    const pageGames = games.slice(startIndex, startIndex + quickAssignUi.pageSize);
    const officials = quickAssignMatchedOfficials(games);
    const suggestions = games.filter((game) => quickAssignSuggestion(game).assignments.length);
    const baseGames = quickAssignBaseGames();
    const sports = quickAssignDistinct(baseGames.map((game) => game.sport));
    const levels = quickAssignDistinct(baseGames.map((game) => game.level));
    const venues = quickAssignDistinct(baseGames.map((game) => game.gymName));
    const statuses = quickAssignDistinct(baseGames.map((game) => game.status));
    const genders = quickAssignDistinct(baseGames.map((game) => game.gender));
    const schools = quickAssignDistinct(baseGames.flatMap((game) => [game.school, game.homeTeam, game.awayTeam]));
    const certifications = quickAssignDistinct(quickAssignOfficials().flatMap((official) => official.certifications));
    const runTime = quickAssignRunTime();
    const firstShown = games.length ? startIndex + 1 : 0;
    const lastShown = Math.min(startIndex + pageGames.length, games.length);
    const locationNote = quickAssignUi.location ? (quickAssignUi.locationLabel || 'Current location is active') : 'Location filtering is off';
    return `<section class="quick-assign-page">
      <header class="quick-assign-heading"><div><h1>${icon('i-bolt')}<span>Quick Assign</span></h1><p>Assign recorded, available officials to open crew positions using your schedule criteria and official preferences.</p></div><div><button type="button" class="quick-secondary-action" data-action="quick-view-unassigned">${icon('i-calendar')}View Unassigned Games</button><button type="button" class="quick-primary-action" data-action="auto-quick-assign">${icon('i-bolt')}Auto Assign</button></div></header>
      <section class="quick-metrics" aria-label="Quick Assign totals"><article><span>${icon('i-calendar')}</span><div><strong>${games.length}</strong><b>Games Needing Crews</b><small>Matching current filters</small></div></article><article><span>${icon('i-user')}</span><div><strong>${officials.length}</strong><b>Available Officials</b><small>Eligible for at least one opening</small></div></article><article><span>${icon('i-check')}</span><div><strong>${quickAssignUi.sessionAssignments}</strong><b>Assignments Made</b><small>This browser session</small></div></article><article><span>${icon('i-clock')}</span><div><strong>${esc(runTime.value)}</strong><b>Run Time</b><small>${esc(runTime.note)}</small></div></article></section>
      <section class="quick-filter-panel"><div class="quick-filter-grid"><label><span>Date From</span><input type="date" value="${esc(quickAssignUi.startDate)}" data-quick-filter="startDate"></label><label><span>Date Through</span><input type="date" value="${esc(quickAssignUi.endDate)}" data-quick-filter="endDate"></label><label><span>Sport</span><select data-quick-filter="sport"><option value="">All Sports</option>${sports.map((value) => option(value, quickAssignUi.sport)).join('')}</select></label><label><span>Level</span><select data-quick-filter="level"><option value="">All Levels</option>${levels.map((value) => option(value, quickAssignUi.level)).join('')}</select></label><label><span>Game Time</span><select data-quick-filter="timeBand"><option value="">All Times</option>${['Morning','Afternoon','Evening'].map((value) => option(value, quickAssignUi.timeBand)).join('')}</select></label><label><span>Venue</span><select data-quick-filter="venue"><option value="">All Venues</option>${venues.map((value) => option(value, quickAssignUi.venue)).join('')}</select></label><label><span>Officials Needed</span><select data-quick-filter="officialsNeeded"><option value="">Any Openings</option>${[1,2,3].map((value) => option(String(value), String(quickAssignUi.officialsNeeded), String(value))).join('')}</select></label><label><span>Official Role</span><select data-quick-filter="role"><option value="">All Roles</option><option value="refereeId" ${quickAssignUi.role === 'refereeId' ? 'selected' : ''}>Referee</option><option value="umpire1Id" ${quickAssignUi.role === 'umpire1Id' ? 'selected' : ''}>Umpire / Umpire 1</option><option value="umpire2Id" ${quickAssignUi.role === 'umpire2Id' ? 'selected' : ''}>Umpire 2</option></select></label><label><span>Certification</span><select data-quick-filter="certification"><option value="">All Certifications</option>${certifications.map((value) => option(value, quickAssignUi.certification)).join('')}</select></label><label><span>Location Radius</span><select data-quick-filter="radius"><option value="">All Distances</option>${[10,25,50,100].map((value) => option(String(value), String(quickAssignUi.radius), `${value} miles`)).join('')}</select></label><button type="button" class="quick-location-button ${quickAssignUi.location ? 'is-active' : ''}" data-action="quick-use-location">${icon('i-pin')}Use My Location</button><button type="button" class="quick-more-filters ${quickAssignUi.filtersOpen ? 'is-active' : ''}" data-action="toggle-quick-filters" aria-expanded="${quickAssignUi.filtersOpen}">${icon('i-filter')}More Filters</button></div><p class="quick-location-note">${esc(locationNote)}</p><div class="quick-extra-filters" ${quickAssignUi.filtersOpen ? '' : 'hidden'}><label><span>Gender</span><select data-quick-filter="gender"><option value="">All Genders</option>${genders.map((value) => option(value, quickAssignUi.gender)).join('')}</select></label><label><span>Game Status</span><select data-quick-filter="status"><option value="">All Statuses</option>${statuses.map((value) => option(value, quickAssignUi.status)).join('')}</select></label><label><span>School / Team</span><select data-quick-filter="school"><option value="">All Schools / Teams</option>${schools.map((value) => option(value, quickAssignUi.school)).join('')}</select></label><label class="quick-filter-search"><span>Search Games</span><input type="search" value="${esc(quickAssignUi.query)}" data-quick-query></label><button type="button" data-action="clear-quick-filters">Clear Filters</button></div>${quickAssignUi.officialId ? `<div class="quick-active-official-filter"><span>Showing games matched to ${esc(quickAssignOfficials().find((item) => item.id === quickAssignUi.officialId)?.name || 'selected official')}</span><button type="button" data-action="clear-quick-official-filter">Clear</button></div>` : ''}</section>
      <nav class="quick-view-tabs" aria-label="Quick Assign views"><button type="button" class="${quickAssignUi.tab === 'games' ? 'is-active' : ''}" data-action="set-quick-tab" data-tab="games">Games Needing Crews <span>${games.length}</span></button><button type="button" class="${quickAssignUi.tab === 'officials' ? 'is-active' : ''}" data-action="set-quick-tab" data-tab="officials">Officials Matched <span>${officials.length}</span></button><button type="button" class="${quickAssignUi.tab === 'suggestions' ? 'is-active' : ''}" data-action="set-quick-tab" data-tab="suggestions">Suggested Assignments <span>${suggestions.length}</span></button><div><button type="button" data-action="clear-quick-filters">${icon('i-close')}Clear All</button><button type="button" data-action="refresh-quick-assign">${icon('i-sync')}Refresh</button></div></nav>
      ${quickAssignUi.tab === 'officials' ? quickAssignOfficialsView(games) : quickAssignUi.tab === 'suggestions' ? quickAssignSuggestionsView(games) : `<section class="quick-table-panel"><div class="quick-table-scroll"><table class="quick-table"><thead><tr><th>${quickAssignSortButton('Date & Time','date')}</th><th>${quickAssignSortButton('Game','game')}</th><th>${quickAssignSortButton('Sport / Level','sport')}</th><th>${quickAssignSortButton('Venue','venue')}</th><th>${quickAssignSortButton('Crew Needed','needed')}</th><th>${quickAssignSortButton('Distance','distance')}</th><th>${quickAssignSortButton('Match Quality','match')}</th><th>Actions</th></tr></thead><tbody>${pageGames.length ? pageGames.map(quickAssignGameRow).join('') : `<tr><td colspan="8"><div class="quick-empty-state">${icon('i-calendar')}<strong>No games need crews under the current filters.</strong><p>Create or import games with open required crew positions, or adjust the filters.</p><button type="button" data-action="set-assignment-section" data-section="create-game-3">Create 3-Man Assignment</button></div></td></tr>`}</tbody></table></div><footer><p>Showing ${firstShown} to ${lastShown} of ${games.length} games</p><div><label><span class="sr-only">Rows per page</span><select data-quick-page-size>${[10,25,50].map((value) => option(String(value), String(quickAssignUi.pageSize), `${value} per page`)).join('')}</select></label>${quickAssignPagination(pageCount)}</div></footer></section>`}
    </section>`;
  }


  function publishedGameBaseRecords() {
    return (state.masterGames || []).map(normalizeMasterGame).filter((game) => game.status === 'Published');
  }

  function publishedGameReviewReasons(record) {
    const game = normalizeMasterGame(record);
    const reasons = [...masterGameConflictReasons(game)];
    if (!game.date) reasons.push('Game date is not recorded');
    if (!game.startTime) reasons.push('Start time is not recorded');
    if (!game.homeTeam) reasons.push('Home team is not recorded');
    if (!game.awayTeam) reasons.push('Visiting team is not recorded');
    if (!game.gymName) reasons.push('Venue is not recorded');
    if (!game.level) reasons.push('Competition level is not recorded');
    return [...new Set(reasons)];
  }

  function publishedGameTotalPay(record) {
    const game = normalizeMasterGame(record);
    const roles = masterPrimaryRoleKeys(game);
    const rates = roles.map((role) => createGameOfficialById(game[role])?.payRate || 0);
    return roles.length && rates.every((rate) => Number(rate) > 0) ? rates.reduce((sum, rate) => sum + Number(rate), 0) : null;
  }

  function publishedGameFilteredRecords() {
    const today = dateKey(new Date());
    const query = publishedGamesUi.query.trim().toLowerCase();
    const direction = publishedGamesUi.sortDir === 'desc' ? -1 : 1;
    const records = publishedGameBaseRecords().filter((game) => {
      if (publishedGamesUi.startDate && (!game.date || game.date < publishedGamesUi.startDate)) return false;
      if (publishedGamesUi.endDate && (!game.date || game.date > publishedGamesUi.endDate)) return false;
      if (publishedGamesUi.sport && game.sport !== publishedGamesUi.sport) return false;
      if (publishedGamesUi.level && game.level !== publishedGamesUi.level) return false;
      if (publishedGamesUi.crewSize && String(game.crewSize) !== String(publishedGamesUi.crewSize)) return false;
      const reviewReasons = publishedGameReviewReasons(game);
      if (publishedGamesUi.tab === 'needs-editing' && !reviewReasons.length) return false;
      if (publishedGamesUi.tab === 'upcoming' && (!game.date || game.date < today)) return false;
      if (publishedGamesUi.tab === 'past' && (!game.date || game.date >= today)) return false;
      if (query) {
        const crew = masterAllRoleKeys(game).map((role) => masterCrewName(game[role])).filter(Boolean).join(' ');
        const haystack = [game.id, game.date, game.startTime, game.homeTeam, game.awayTeam, game.sport, game.level, game.gender, game.gymName, game.address, crew, reviewReasons.join(' ')].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    const value = (game) => {
      if (publishedGamesUi.sortKey === 'matchup') return `${game.homeTeam} ${game.awayTeam}`.toLowerCase();
      if (publishedGamesUi.sortKey === 'level') return `${game.sport} ${game.level} ${game.gender}`.toLowerCase();
      if (publishedGamesUi.sortKey === 'venue') return `${game.gymName} ${game.address}`.toLowerCase();
      if (publishedGamesUi.sortKey === 'crew') return masterPrimaryRoleKeys(game).map((role) => masterCrewName(game[role])).join(' ').toLowerCase();
      if (publishedGamesUi.sortKey === 'review') return publishedGameReviewReasons(game).length;
      return `${game.date}${game.startTime}${game.homeTeam}`.toLowerCase();
    };
    return records.sort((a, b) => {
      const left = value(a);
      const right = value(b);
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction;
      return String(left).localeCompare(String(right)) * direction;
    });
  }

  function publishedGameTeamCell(game) {
    const renderTeam = (name) => {
      const logo = createGameSchoolLogo(name);
      return `<span class="published-list-team">${logo ? `<img src="${esc(logo)}" alt="">` : `<b>${esc(teamMonogram(name))}</b>`}<em>${esc(name || '')}</em></span>`;
    };
    return `<div class="published-list-matchup">${renderTeam(game.homeTeam)}<small>vs</small>${renderTeam(game.awayTeam)}</div>`;
  }

  function publishedGameCrewCell(game) {
    const labels = game.crewSize === 2 ? [['R', game.refereeId], ['U', game.umpire1Id]] : [['R', game.refereeId], ['U1', game.umpire1Id], ['U2', game.umpire2Id]];
    return `<div class="published-list-crew">${labels.map(([label, id]) => `<span class="${id ? '' : 'is-empty'}"><b>${esc(label)}</b><em>${esc(masterCrewName(id) || '')}</em></span>`).join('')}</div>`;
  }

  function publishedGameSortButton(label, key) {
    const active = publishedGamesUi.sortKey === key;
    const symbol = active ? (publishedGamesUi.sortDir === 'desc' ? '↓' : '↑') : '↕';
    return `<button type="button" class="published-list-sort ${active ? 'is-active' : ''}" data-action="sort-published-games" data-key="${esc(key)}">${esc(label)}<span aria-hidden="true">${symbol}</span></button>`;
  }

  function publishedGameRow(game) {
    const reasons = publishedGameReviewReasons(game);
    const pay = publishedGameTotalPay(game);
    return `<tr class="${reasons.length ? 'needs-editing' : ''}">
      <td data-label="Select"><input type="checkbox" data-published-select value="${esc(game.id)}" ${publishedGamesUi.selected.has(game.id) ? 'checked' : ''} aria-label="Select published game"></td>
      <td data-label="Date & Time"><time><strong>${game.date ? esc(fmtDate(game.date)) : ''}</strong><span>${game.startTime ? esc(calendarTime(game.startTime)) : ''}</span></time></td>
      <td data-label="Game">${publishedGameTeamCell(game)}</td>
      <td data-label="Sport / Level"><div class="published-list-level"><strong>${esc(game.sport || '')}</strong><span>${esc([game.level, game.gender].filter(Boolean).join(' · '))}</span><small>${game.crewSize}-Official Crew</small></div></td>
      <td data-label="Venue"><div class="published-list-venue">${icon('i-pin')}<span><strong>${esc(game.gymName || '')}</strong><small>${esc(game.address || '')}</small></span></div></td>
      <td data-label="Crew">${publishedGameCrewCell(game)}</td>
      <td data-label="Review"><div class="published-list-review ${reasons.length ? 'has-alert' : ''}"><strong>${reasons.length ? 'Needs Editing' : 'Published'}</strong>${reasons.length ? `<button type="button" data-action="show-published-review" data-id="${esc(game.id)}">${reasons.length} item${reasons.length === 1 ? '' : 's'}</button>` : `<small>${game.publishedAt ? esc(fmtDate(game.publishedAt.slice(0, 10))) : ''}</small>`}</div></td>
      <td data-label="Est. Total Pay"><strong class="published-list-pay">${pay == null ? '' : esc(money(pay))}</strong></td>
      <td data-label="Actions"><div class="published-list-actions"><button type="button" data-action="view-published-game" data-id="${esc(game.id)}">${icon('i-eye')}View</button><details><summary aria-label="More published game actions">${icon('i-chevron')}</summary><div><button type="button" data-action="published-edit-game" data-id="${esc(game.id)}">${icon('i-edit')}Unpublish & Edit</button><button type="button" data-action="unpublish-published-game" data-id="${esc(game.id)}">${icon('i-close')}Unpublish</button><button type="button" data-action="download-published-assignment" data-id="${esc(game.id)}">${icon('i-download')}Download</button></div></details></div></td>
    </tr>`;
  }

  function publishedGamePagination(pageCount) {
    const current = publishedGamesUi.page;
    const pages = [];
    for (let page = Math.max(1, current - 2); page <= Math.min(pageCount, current + 2); page += 1) pages.push(page);
    return `<nav class="published-list-pagination" aria-label="Published games pagination"><button type="button" data-action="published-page" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''} aria-label="Previous page">‹</button>${pages.map((page) => `<button type="button" class="${page === current ? 'is-active' : ''}" data-action="published-page" data-page="${page}">${page}</button>`).join('')}<button type="button" data-action="published-page" data-page="${current + 1}" ${current >= pageCount ? 'disabled' : ''} aria-label="Next page">›</button></nav>`;
  }

  function renderPublishedGameAdminDetailPage(game) {
    const normalized = normalizeMasterGame(game);
    const classification = [normalized.level, normalized.gender].filter(Boolean).join(' ');
    const totalPay = publishedGameTotalPay(normalized);
    const notes = String(normalized.notes || '').trim();
    const crew = publishedAssignmentCrew(normalized);
    const contacts = publishedAssignmentContactSection(normalized);
    const additional = publishedAssignmentAdditionalInfo(normalized);
    return `<section class="published-assignment-page published-assignment-admin-detail">
      <header class="published-assignment-head"><div class="published-assignment-intro"><button type="button" data-action="back-to-published-games">${icon('i-chevron')}Back to Published Games</button><h1><span>Published</span> Game Assignment</h1><div><p>This game is published and visible to every assigned official.</p><strong class="published-response is-confirmed">Published</strong></div></div><div class="published-assignment-head__actions"><div><button type="button" data-action="published-view-master" data-id="${esc(normalized.id)}">${icon('i-calendar')}View Schedule</button><button class="is-primary" type="button" data-action="published-edit-game" data-id="${esc(normalized.id)}">${icon('i-edit')}Unpublish & Edit</button></div><article><div><span>Game Time</span><strong>${normalized.startTime ? esc(calendarTime(normalized.startTime)) : ''}</strong><small>${normalized.date ? esc(fmtDate(normalized.date)) : ''}</small></div><div>${icon('i-trophy')}<span>Level</span><strong>${esc(classification)}</strong></div></article></div></header>
      <article class="published-assignment-card"><section class="published-matchup">${publishedAssignmentTeam(normalized, 'home')}<b>VS</b>${publishedAssignmentTeam(normalized, 'away')}</section><section class="published-game-facts"><div>${icon('i-calendar')}<span><small>Date</small><strong>${normalized.date ? esc(fmtDate(normalized.date)) : ''}</strong></span></div><div>${icon('i-clock')}<span><small>Time</small><strong>${normalized.startTime ? esc(calendarTime(normalized.startTime)) : ''}</strong></span></div><div>${icon('i-pin')}<span><small>Location</small><strong>${esc(normalized.gymName || '')}</strong></span></div><div>${icon('i-card')}<span><small>Total Pay</small><strong>${totalPay == null ? 'Not recorded' : esc(money(totalPay))}</strong><em>${normalized.crewSize}-Official Crew</em></span></div></section>${publishedAssignmentVenueDetails(normalized)}<section class="published-officials"><h2>Officials</h2><div>${crew || '<p class="published-empty-record">No officials are assigned to this game.</p>'}</div></section></article>
      ${contacts}
      <section class="published-lower-grid"><article class="published-lower-card"><h2>Assignment Notes</h2><p>${notes ? esc(notes) : 'No assignment notes have been recorded.'}</p></article>${additional}</section>
      <footer class="published-assignment-footer published-assignment-footer--admin"><span>${icon('i-shield')}</span><p><strong>Published assignment management</strong><small>Unpublishing removes the game from officials while keeping the schedule record available for editing.</small></p><div><button type="button" data-action="unpublish-published-game" data-id="${esc(normalized.id)}">${icon('i-close')}Unpublish Game</button><button type="button" data-action="download-published-assignment" data-id="${esc(normalized.id)}">${icon('i-download')}Download Assignment</button></div></footer>
    </section>`;
  }

  function renderPublishedGames() {
    if (publishedGamesUi.detailId) {
      const game = (state.masterGames || []).find((item) => item.id === publishedGamesUi.detailId && item.status === 'Published');
      if (game) return renderPublishedGameAdminDetailPage(game);
      publishedGamesUi.detailId = '';
    }
    const all = publishedGameBaseRecords();
    const filtered = publishedGameFilteredRecords();
    const pageCount = Math.max(1, Math.ceil(filtered.length / publishedGamesUi.pageSize));
    publishedGamesUi.page = Math.min(Math.max(1, publishedGamesUi.page), pageCount);
    const start = (publishedGamesUi.page - 1) * publishedGamesUi.pageSize;
    const pageGames = filtered.slice(start, start + publishedGamesUi.pageSize);
    const today = dateKey(new Date());
    const upcoming = all.filter((game) => game.date && game.date >= today).length;
    const needsEditing = all.filter((game) => publishedGameReviewReasons(game).length).length;
    const assignedOfficials = all.reduce((sum, game) => sum + masterPrimaryRoleKeys(game).filter((role) => game[role]).length, 0);
    const sports = createGameDistinct(all.map((game) => game.sport));
    const levels = createGameDistinct(all.map((game) => game.level));
    const selectedVisible = filtered.filter((game) => publishedGamesUi.selected.has(game.id)).length;
    return `<section class="published-games-page">
      <header class="published-games-heading"><div><p>Assignment Management</p><h1><span>Published</span> Game Assignments</h1><small>View every published game, inspect assignment details, and unpublish records that require changes.</small></div><div><button type="button" data-action="published-view-master">${icon('i-calendar')}Master Schedule</button><button type="button" class="is-primary" data-action="unpublish-selected-published" ${publishedGamesUi.selected.size ? '' : 'disabled'}>${icon('i-edit')}Unpublish Selected</button></div></header>
      <section class="published-games-metrics"><article>${icon('i-check')}<div><span>Published Games</span><strong>${all.length}</strong><small>Visible to assigned officials</small></div></article><article>${icon('i-calendar')}<div><span>Upcoming</span><strong>${upcoming}</strong><small>On or after today</small></div></article><article class="${needsEditing ? 'has-alert' : ''}">${icon('i-edit')}<div><span>Needs Editing</span><strong>${needsEditing}</strong><small>Incomplete or conflicted records</small></div></article><article>${icon('i-user')}<div><span>Assigned Officials</span><strong>${assignedOfficials}</strong><small>Required crew positions filled</small></div></article></section>
      <section class="published-games-toolbar"><label class="published-games-search">${icon('i-search')}<span>Search Published Games</span><input type="search" value="${esc(publishedGamesUi.query)}" data-published-query aria-label="Search published games"></label><label><span>Date From</span><input type="date" value="${esc(publishedGamesUi.startDate)}" data-published-filter="startDate"></label><label><span>Date Through</span><input type="date" value="${esc(publishedGamesUi.endDate)}" data-published-filter="endDate"></label><label><span>Sport</span><select data-published-filter="sport"><option value="">All Sports</option>${sports.map((value) => option(value, publishedGamesUi.sport)).join('')}</select></label><label><span>Level</span><select data-published-filter="level"><option value="">All Levels</option>${levels.map((value) => option(value, publishedGamesUi.level)).join('')}</select></label><label><span>Crew</span><select data-published-filter="crewSize"><option value="">All Crews</option><option value="2" ${String(publishedGamesUi.crewSize) === '2' ? 'selected' : ''}>2-Man</option><option value="3" ${String(publishedGamesUi.crewSize) === '3' ? 'selected' : ''}>3-Man</option></select></label><button type="button" data-action="clear-published-filters">${icon('i-sync')}Clear</button></section>
      <nav class="published-games-tabs" aria-label="Published game views">${[['all','All Published',all.length],['needs-editing','Needs Editing',needsEditing],['upcoming','Upcoming',upcoming],['past','Past',Math.max(0, all.length - upcoming)]].map(([value,label,count]) => `<button type="button" class="${publishedGamesUi.tab === value ? 'is-active' : ''}" data-action="set-published-tab" data-tab="${value}">${label}<span>${count}</span></button>`).join('')}</nav>
      <section class="published-games-table-panel"><header><div><label><input type="checkbox" data-published-select-all ${pageGames.length && pageGames.every((game) => publishedGamesUi.selected.has(game.id)) ? 'checked' : ''}><span>Select page</span></label><strong>${publishedGamesUi.selected.size} selected${selectedVisible ? ` · ${selectedVisible} in current view` : ''}</strong></div><button type="button" data-action="unpublish-selected-published" ${publishedGamesUi.selected.size ? '' : 'disabled'}>${icon('i-edit')}Unpublish Selected for Editing</button></header><div class="published-games-table-scroll"><table><thead><tr><th><span class="sr-only">Select</span></th><th>${publishedGameSortButton('Date & Time','date')}</th><th>${publishedGameSortButton('Game','matchup')}</th><th>${publishedGameSortButton('Sport / Level','level')}</th><th>${publishedGameSortButton('Venue','venue')}</th><th>${publishedGameSortButton('Crew','crew')}</th><th>${publishedGameSortButton('Status','review')}</th><th>Est. Total Pay</th><th>Actions</th></tr></thead><tbody>${pageGames.length ? pageGames.map(publishedGameRow).join('') : `<tr><td colspan="9"><div class="published-games-empty">${icon('i-calendar')}<strong>${all.length ? 'No published games match this view.' : 'No games are currently published.'}</strong><p>${all.length ? 'Clear or adjust the filters to view other published games.' : 'Publish a completed Master Schedule game to make it available here.'}</p><div><button type="button" data-action="published-view-master">Open Master Schedule</button><button type="button" data-action="set-assignment-section" data-section="unpublished">Open Unpublished Games</button></div></div></td></tr>`}</tbody></table></div><footer><p>Showing ${filtered.length ? start + 1 : 0} to ${Math.min(start + publishedGamesUi.pageSize, filtered.length)} of ${filtered.length} published games</p><div><label><span class="sr-only">Rows per page</span><select data-published-page-size>${[10,25,50].map((value) => option(String(value), String(publishedGamesUi.pageSize), `${value} per page`)).join('')}</select></label>${publishedGamePagination(pageCount)}</div></footer></section>
    </section>`;
  }

  function renderAssignments() {
    const createCrewSize = assignmentUi.section === 'create-game-3' ? 3 : assignmentUi.section === 'create-game-2' ? 2 : 0;
    if (createCrewSize && createGameUi !== createGameUiByCrew[createCrewSize]) createGameUi = createGameUiByCrew[createCrewSize];
    const content = createCrewSize ? renderCreateGameAssignment() : assignmentUi.section === 'tba-games' ? renderTbaGames() : assignmentUi.section === 'quick-assign' ? renderQuickAssign() : assignmentUi.section === 'master' ? renderMasterSchedule() : assignmentUi.section === 'published' ? renderPublishedGames() : assignmentUi.section === 'unpublished' ? renderUnpublishedSchedule() : assignmentUi.section === 'my-games' ? renderMyGames() : renderAssignmentTasks();
    const showSectionTabs = !((assignmentUi.section === 'my-games' && myGamesUi.detailId) || (assignmentUi.section === 'published' && publishedGamesUi.detailId));
    return `<div class="assignment-module-shell">${showSectionTabs ? assignmentSectionTabs() : ''}${content}</div>`;
  }

  function syncMasterCrewSizeField(form) {
    if (!form) return;
    const isTwo = Number(form.elements.crewSize?.value) === 2;
    const wrapper = form.querySelector('[data-master-umpire2-wrapper]');
    if (wrapper) wrapper.hidden = isTwo;
    if (isTwo && form.elements.umpire2Id) form.elements.umpire2Id.value = '';
    const umpireLabel = form.elements.umpire1Id?.closest('label')?.querySelector('span');
    if (umpireLabel) umpireLabel.textContent = isTwo ? 'Umpire' : 'Umpire 1';
  }

  function openMasterGameDialog(record = null) {
    const dialog = moduleView.querySelector('[data-master-game-dialog]');
    if (!dialog) return;
    const form = dialog.querySelector('form');
    form.reset();
    const game = record ? normalizeMasterGame(record) : normalizeMasterGame({ status: 'Draft', crewSize: 3, timeZone: state.profile.timeZone || '' });
    dialog.querySelector('[data-master-game-dialog-title]').textContent = record ? 'Edit Game' : 'Add Game';
    ['id','crewSize','date','startTime','timeZone','sport','level','gender','conferenceLevel','school','homeTeam','awayTeam','gymName','address','venuePhone','travelMiles','status','refereeId','umpire1Id','umpire2Id','alternateId','notes'].forEach((key) => { if (form.elements[key]) form.elements[key].value = game[key] ?? ''; });
    syncMasterCrewSizeField(form);
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    requestAnimationFrame(() => form.elements.date?.focus());
  }
  function parseCsvRows(textValue) {
    const rows = [];
    let row = [], cell = '', quoted = false;
    const text = String(textValue || '').replace(/^\uFEFF/, '');
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index], next = text[index + 1];
      if (char === '"' && quoted && next === '"') { cell += '"'; index += 1; continue; }
      if (char === '"') { quoted = !quoted; continue; }
      if (char === ',' && !quoted) { row.push(cell); cell = ''; continue; }
      if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && next === '\n') index += 1;
        row.push(cell); if (row.some((value) => value.trim())) rows.push(row); row = []; cell = ''; continue;
      }
      cell += char;
    }
    row.push(cell); if (row.some((value) => value.trim())) rows.push(row);
    return rows;
  }

  function masterRosterIdByEmail(email = '') {
    const normalized = String(email).trim().toLowerCase();
    if (!normalized) return '';
    return masterScheduleRoster().find((item) => item.email.toLowerCase() === normalized)?.id || '';
  }

  async function importMasterScheduleFile(file) {
    const rows = parseCsvRows(await file.text());
    if (rows.length < 2) { showToast('The CSV file does not contain schedule rows.'); return; }
    const headers = rows[0].map((value) => value.trim());
    const required = ['date','startTime','sport','level','homeTeam','awayTeam','gymName'];
    if (required.some((header) => !headers.includes(header))) { showToast(`CSV headers required: ${required.join(', ')}.`); return; }
    let imported = 0;
    rows.slice(1).forEach((cells) => {
      const data = Object.fromEntries(headers.map((header, index) => [header, String(cells[index] || '').trim()]));
      if (required.some((header) => !data[header])) return;
      const now = new Date().toISOString();
      const crewSize = Number(data.crewSize) === 2 ? 2 : 3; state.masterGames.unshift({ id: uid('game'), crewSize, date: data.date, startTime: data.startTime, timeZone: data.timeZone || '', sport: data.sport, level: data.level, gender: data.gender || '', conferenceLevel: data.conferenceLevel || '', school: data.school || '', homeTeam: data.homeTeam, awayTeam: data.awayTeam, gymName: data.gymName, address: data.address || '', venuePhone: data.venuePhone || '', status: ['Draft','Pending','Published','Unpublished','Canceled'].includes(data.status) ? data.status : 'Draft', refereeId: masterRosterIdByEmail(data.refereeEmail), umpire1Id: masterRosterIdByEmail(data.umpire1Email), umpire2Id: crewSize === 3 ? masterRosterIdByEmail(data.umpire2Email) : '', alternateId: masterRosterIdByEmail(data.alternateEmail), travelMiles: data.travelMiles === '' || data.travelMiles == null ? '' : Math.max(0, Number(data.travelMiles) || 0), notes: data.notes || '', officialResponses: {}, createdAt: now, updatedAt: now, publishedAt: data.status === 'Published' ? now : '' });
      imported += 1;
    });
    if (!imported) { showToast('No complete game rows were found in the CSV file.'); return; }
    notify(`${imported} game${imported === 1 ? '' : 's'} imported into the master schedule.`);
    saveState();
    refreshAssignments();
  }

  function csvCell(value) { const textValue = String(value ?? ''); return /[",\n\r]/.test(textValue) ? `"${textValue.replace(/"/g, '""')}"` : textValue; }

  function exportMasterSchedule() {
    const games = filteredMasterGames();
    const headers = ['crewSize','date','startTime','timeZone','sport','level','gender','conferenceLevel','school','homeTeam','awayTeam','gymName','address','venuePhone','travelMiles','status','referee','umpire1','umpire2','alternate','notes','conflicts'];
    const rows = games.map((game) => [game.crewSize, game.date, game.startTime, game.timeZone, game.sport, game.level, game.gender, game.conferenceLevel, game.school, game.homeTeam, game.awayTeam, game.gymName, game.address, game.venuePhone, game.travelMiles, game.status, masterCrewName(game.refereeId), masterCrewName(game.umpire1Id), game.crewSize === 3 ? masterCrewName(game.umpire2Id) : '', masterCrewName(game.alternateId), game.notes, masterGameConflictReasons(game).join(' | ')]);
    downloadText('got-u-nex-ref-master-schedule.csv', [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n'), 'text/csv');
  }

  function publishMasterGames(games) {
    const now = new Date().toISOString();
    let published = 0, blocked = 0;
    games.forEach((game) => {
      const target = state.masterGames.find((item) => item.id === game.id);
      if (!target) return;
      if (masterGameConflictReasons(target).length) { blocked += 1; return; }
      target.status = 'Published'; target.publishedAt = now; target.updatedAt = now; published += 1;
    });
    if (published) notify(`${published} game${published === 1 ? '' : 's'} published.`);
    if (blocked) showToast(`${blocked} game${blocked === 1 ? '' : 's'} could not be published until conflicts are resolved.`);
    saveState();
  }

  function renderAssignmentTasks() {
    const filtered = filteredAssignments();
    const pageCount = Math.max(1, Math.ceil(filtered.length / assignmentUi.pageSize));
    assignmentUi.page = Math.min(Math.max(1, assignmentUi.page), pageCount);
    const startIndex = (assignmentUi.page - 1) * assignmentUi.pageSize;
    const pageItems = filtered.slice(startIndex, startIndex + assignmentUi.pageSize);
    const firstShown = filtered.length ? startIndex + 1 : 0;
    const lastShown = Math.min(startIndex + assignmentUi.pageSize, filtered.length);
    const statuses = uniqueAssignmentValues('status');
    const types = uniqueAssignmentValues('type');
    const groups = uniqueAssignmentValues('classTeam');

    return `<div class="assignments-admin">
      <header class="assignments-page-header">
        <div><h1>Assignments</h1><p>Create, manage, and track assignment submissions using records entered into this dashboard.</p></div>
        <label class="assignments-global-search">${icon('i-search')}<span class="sr-only">Search assignments</span><input type="search" value="${esc(assignmentUi.query)}" data-assignment-query data-query-slot="header" aria-label="Search assignments"></label>
      </header>

      <div class="assignments-date-row">
        <div class="assignment-date-filter">
          <button type="button" data-action="toggle-assignment-date" aria-expanded="${assignmentUi.datePanelOpen}">${icon('i-calendar')}<span>${esc(assignmentDateLabel())}</span>${icon('i-chevron')}</button>
          <div class="assignment-date-popover" ${assignmentUi.datePanelOpen ? '' : 'hidden'}>
            <label><span>Start Date</span><input type="date" value="${esc(assignmentUi.startDate)}" data-assignment-start-date></label>
            <label><span>End Date</span><input type="date" value="${esc(assignmentUi.endDate)}" data-assignment-end-date></label>
            <div><button type="button" data-action="clear-assignment-date">Clear</button><button type="button" data-action="apply-assignment-date">Apply</button></div>
          </div>
        </div>
      </div>

      <nav class="assignment-tabs" aria-label="Assignment views">
        <button type="button" class="${assignmentUi.tab === 'all' ? 'is-active' : ''}" data-action="set-assignment-tab" data-tab="all">All Assignments</button>
        <button type="button" class="${assignmentUi.tab === 'my' ? 'is-active' : ''}" data-action="set-assignment-tab" data-tab="my">My Assignments</button>
        <button type="button" class="${assignmentUi.tab === 'completed' ? 'is-active' : ''}" data-action="set-assignment-tab" data-tab="completed">Completed</button>
      </nav>

      <section class="assignment-filter-bar" aria-label="Assignment filters">
        <label class="assignment-filter-search">${icon('i-search')}<span class="sr-only">Search assignment records</span><input type="search" value="${esc(assignmentUi.query)}" data-assignment-query data-query-slot="filters" aria-label="Search assignment records"></label>
        <label><span class="sr-only">Filter by status</span><select data-assignment-filter="status"><option value="">All Statuses</option>${statuses.map((value) => option(value, assignmentUi.status)).join('')}</select></label>
        <label><span class="sr-only">Filter by type</span><select data-assignment-filter="type"><option value="">All Types</option>${types.map((value) => option(value, assignmentUi.type)).join('')}</select></label>
        <label><span class="sr-only">Filter by class or team</span><select data-assignment-filter="group"><option value="">All Classes / Teams</option>${groups.map((value) => option(value, assignmentUi.group)).join('')}</select></label>
        <button class="assignment-new-button" type="button" data-action="new-assignment">${icon('i-plus')}New Assignment</button>
      </section>

      <section class="assignment-table-panel" aria-label="Assignment records">
        <div class="assignment-table-scroll">
          <table class="assignment-table">
            <thead><tr><th>Assignment</th><th>Type</th><th>Class / Team</th><th>Due Date</th><th>Submissions</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead>
            <tbody>${pageItems.length ? pageItems.map(assignmentTableRow).join('') : `<tr><td colspan="7"><div class="assignment-empty-state">${icon('i-calendar')}<strong>No assignment records match this view.</strong><p>Create an assignment or change the active filters.</p><button type="button" data-action="new-assignment">Create Assignment</button></div></td></tr>`}</tbody>
          </table>
        </div>
        <footer class="assignment-table-footer"><p>Showing ${firstShown} to ${lastShown} of ${filtered.length} assignments</p><div><button type="button" data-action="assignment-page" data-page="${assignmentUi.page - 1}" ${assignmentUi.page <= 1 ? 'disabled' : ''} aria-label="Previous page">‹</button><span>${assignmentUi.page}</span><button type="button" data-action="assignment-page" data-page="${assignmentUi.page + 1}" ${assignmentUi.page >= pageCount ? 'disabled' : ''} aria-label="Next page">›</button></div></footer>
      </section>
      ${assignmentFormDialog()}
      ${assignmentDeclineDialog()}
    </div>`;
  }

  function refreshAssignments(focusSlot = '') {
    moduleView.innerHTML = renderAssignments();
    shell.classList.toggle('is-published-assignment-view', (assignmentUi.section === 'my-games' && Boolean(myGamesUi.detailId)) || (assignmentUi.section === 'published' && Boolean(publishedGamesUi.detailId)));
    hydratePublishedAssignmentMedia();
    if (focusSlot) {
      const input = moduleView.querySelector(`[data-assignment-query][data-query-slot="${focusSlot}"]`);
      if (input) { input.focus(); const length = input.value.length; input.setSelectionRange(length, length); }
    }
  }

  function openAssignmentDialog(record = null) {
    const dialog = moduleView.querySelector('[data-assignment-dialog]');
    if (!dialog) return;
    const form = dialog.querySelector('form[data-form="assignment"]');
    form.reset();
    dialog.querySelector('[data-assignment-dialog-title]').textContent = record?.id ? 'Edit Assignment' : 'New Assignment';
    if (record) {
      const data = normalizeAssignment(record);
      ['id','title','description','type','classTeam','dueDate','dueTime','scope','status','submittedCount','expectedCount'].forEach((key) => {
        if (form.elements[key]) form.elements[key].value = data[key] ?? '';
      });
    }
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    requestAnimationFrame(() => form.elements.title?.focus());
  }


  function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function dateFromKey(value) {
    const [year, month, day] = String(value || '').split('-').map(Number);
    return new Date(year || calendarUi.year, (month || calendarUi.month + 1) - 1, day || 1, 12, 0, 0, 0);
  }

  function calendarMonthDate() { return new Date(calendarUi.year, calendarUi.month, 1, 12, 0, 0, 0); }
  function calendarMonthLabel(date = calendarMonthDate()) { return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date); }
  function calendarLongDate(value) { return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(dateFromKey(value)); }
  function calendarShortDate(value) { return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(dateFromKey(value)); }
  function startOfWeek(date) { const output = new Date(date); output.setDate(output.getDate() - output.getDay()); output.setHours(12, 0, 0, 0); return output; }
  function addDays(date, days) { const output = new Date(date); output.setDate(output.getDate() + days); return output; }
  function isSameMonth(value, date = calendarMonthDate()) { const current = dateFromKey(value); return current.getFullYear() === date.getFullYear() && current.getMonth() === date.getMonth(); }
  function isCalendarClinic(a) { const haystack = `${a.type || ''} ${a.title || ''}`.toLowerCase(); return /clinic|event|training|workshop|camp/.test(haystack); }
  function isCalendarPending(a) { return ['Pending', 'Draft', 'Reviewing'].includes(a.status); }
  function calendarAssignmentsForDate(value) { return state.assignments.map(normalizeAssignment).filter((item) => item.dueDate === value).sort((a, b) => String(a.dueTime || '').localeCompare(String(b.dueTime || ''))); }
  function calendarAvailabilityForDate(value) { return state.calendarAvailability?.[value] || null; }
  function calendarBlocksForDate(value) { return (state.calendarBlocks || []).filter((item) => item.date === value).sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || ''))); }
  function calendarEntryClass(a) { return isCalendarClinic(a) ? 'is-clinic' : isCalendarPending(a) ? 'is-pending' : 'is-assignment'; }
  function calendarAvailabilityClass(status = '') { return `is-${status.toLowerCase().replace(/[^a-z]+/g, '-')}`; }
  function calendarTime(value) { if (!value) return ''; const [hourString, minuteString] = value.split(':'); let hour = Number(hourString); const suffix = hour >= 12 ? 'PM' : 'AM'; hour = hour % 12 || 12; return `${hour}:${minuteString || '00'} ${suffix}`; }
  function blockReason(value = '') { return [...BLOCK_REASONS, ...GAME_DECLINE_REASONS].find((item) => item.value === value) || null; }
  function blockReasonLabel(value = '') { return blockReason(value)?.label || 'Blocked time'; }
  function blockReasonDisplay(record = {}) {
    const label = blockReasonLabel(record.reason || record.declineReason || '');
    const details = String(record.reasonDetails || record.declineReasonDetails || record.notes || '').trim();
    return (record.reason === 'other' || record.declineReason === 'other') && details ? `${label}: ${details}` : label;
  }
  function blockTimeLabel(record) { const start = calendarTime(record.startTime); const end = calendarTime(record.endTime); return [start, end].filter(Boolean).join(' – ') || 'Time not entered'; }
  function blockAvailabilityStatus(record) { return record.startTime === '00:00' && (!record.endTime || record.endTime === '23:59') ? 'Unavailable' : 'Partially Available'; }

  function calendarGridDates(date = calendarMonthDate()) {
    const first = new Date(date.getFullYear(), date.getMonth(), 1, 12);
    const start = startOfWeek(first);
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }

  function calendarEventButton(a) {
    const label = [a.title, a.type, a.dueTime ? calendarTime(a.dueTime) : ''].filter(Boolean).join(', ');
    return `<button class="calendar-event ${calendarEntryClass(a)}" type="button" data-action="edit-assignment" data-id="${a.id}" aria-label="Edit ${esc(label)}"><strong>${esc(a.title)}</strong>${a.type ? `<span>${esc(a.type)}</span>` : ''}${a.dueTime ? `<small>${esc(calendarTime(a.dueTime))}</small>` : ''}</button>`;
  }

  function calendarAvailabilityButton(value, record) {
    if (!record?.status) return '';
    return `<button class="calendar-availability-chip ${calendarAvailabilityClass(record.status)}" type="button" data-action="open-calendar-day" data-date="${value}"><strong>${esc(record.status)}</strong>${record.notes ? `<small>${esc(record.notes)}</small>` : '<small>All day</small>'}</button>`;
  }

  function calendarBlockButton(record) {
    const status = blockAvailabilityStatus(record);
    return `<button class="calendar-block-chip ${calendarAvailabilityClass(status)}" type="button" data-action="edit-calendar-block" data-id="${record.id}" aria-label="Edit blocked time on ${esc(calendarLongDate(record.date))}"><strong>${esc(status)}</strong><span>${esc(blockReasonDisplay(record))}</span><small>${esc(blockTimeLabel(record))}</small></button>`;
  }

  function renderCalendarMonth() {
    const today = dateKey(new Date());
    const selected = calendarUi.selectedDate;
    const dates = calendarGridDates();
    return `<div class="availability-calendar-weekdays">${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day) => `<span>${day}</span>`).join('')}</div><div class="availability-calendar-grid">${dates.map((date) => {
      const value = dateKey(date); const assignments = calendarAssignmentsForDate(value); const availability = calendarAvailabilityForDate(value); const blocks = calendarBlocksForDate(value);
      const visibleItems = `${calendarAvailabilityButton(value, availability)}${blocks.slice(0, 2).map(calendarBlockButton).join('')}${assignments.slice(0, 2).map(calendarEventButton).join('')}`;
      const totalItems = (availability?.status ? 1 : 0) + blocks.length + assignments.length;
      return `<article class="availability-calendar-day ${isSameMonth(value) ? '' : 'is-outside'} ${value === today ? 'is-today' : ''} ${value === selected ? 'is-selected' : ''}">
        <button class="availability-calendar-day-number" type="button" data-action="open-calendar-day" data-date="${value}" aria-label="Manage ${esc(calendarLongDate(value))}">${date.getDate()}</button>
        <div class="availability-calendar-day-items">${visibleItems}${totalItems > 4 ? `<button class="calendar-more" type="button" data-action="set-calendar-view" data-view="list" data-date="${value}">+${totalItems - 4} more</button>` : ''}</div>
      </article>`;
    }).join('')}</div>`;
  }

  function renderCalendarWeek() {
    const selected = calendarUi.selectedDate ? dateFromKey(calendarUi.selectedDate) : calendarMonthDate();
    const start = startOfWeek(selected);
    const today = dateKey(new Date());
    return `<div class="calendar-week-view">${Array.from({length:7},(_,index)=>addDays(start,index)).map((date)=>{
      const value=dateKey(date); const assignments=calendarAssignmentsForDate(value); const availability=calendarAvailabilityForDate(value); const blocks=calendarBlocksForDate(value);
      const records = `${calendarAvailabilityButton(value,availability)}${blocks.map(calendarBlockButton).join('')}${assignments.map(calendarEventButton).join('')}`;
      return `<article class="calendar-week-day ${value===today?'is-today':''}"><header><button type="button" data-action="open-calendar-day" data-date="${value}"><span>${date.toLocaleDateString('en-US',{weekday:'short'})}</span><strong>${date.getDate()}</strong></button></header><div>${records || '<p class="calendar-no-records">No records</p>'}</div></article>`;
    }).join('')}</div>`;
  }

  function renderCalendarList() {
    const prefix = `${calendarUi.year}-${String(calendarUi.month + 1).padStart(2,'0')}`;
    const entries = [];
    Object.entries(state.calendarAvailability || {}).forEach(([date, record]) => { if (date.startsWith(prefix) && record?.status) entries.push({ kind:'availability', date, time:'', title:record.status, detail:record.notes || 'All day', record }); });
    (state.calendarBlocks || []).filter((record)=>record.date?.startsWith(prefix)).forEach((record)=>entries.push({ kind:'block', date:record.date, time:record.startTime || '', title:blockReasonDisplay(record), detail:blockTimeLabel(record), record }));
    state.assignments.map(normalizeAssignment).filter((record)=>record.dueDate?.startsWith(prefix)).forEach((record)=>entries.push({ kind:'assignment', date:record.dueDate, time:record.dueTime || '', title:record.title, detail:[record.type,record.classTeam].filter(Boolean).join(' · '), record }));
    entries.sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    if (!entries.length) return emptyMessage('No availability records for this month', 'Use Block Date / Time, set a date status, or add an assignment.');
    return `<div class="calendar-list-view">${entries.map((entry)=>{
      const action = entry.kind === 'block' ? 'edit-calendar-block' : entry.kind === 'assignment' ? 'edit-assignment' : 'open-calendar-day';
      const idAttr = entry.kind === 'availability' ? `data-date="${entry.date}"` : `data-id="${entry.record.id}"`;
      return `<button type="button" class="calendar-list-item is-${entry.kind}" data-action="${action}" ${idAttr}><time datetime="${entry.date}"><strong>${dateFromKey(entry.date).getDate()}</strong><span>${dateFromKey(entry.date).toLocaleDateString('en-US',{month:'short',weekday:'short'})}</span></time><div><strong>${esc(entry.title)}</strong><p>${esc(entry.detail || 'Record')}</p></div><span>${entry.time ? esc(calendarTime(entry.time)) : 'All day'}</span></button>`;
    }).join('')}</div>`;
  }

  function miniCalendarMarkup() {
    const today = dateKey(new Date()); const selected = calendarUi.selectedDate; const monthDate = calendarMonthDate();
    return `<div class="mini-calendar-weekdays">${['S','M','T','W','T','F','S'].map((day)=>`<span>${day}</span>`).join('')}</div><div class="mini-calendar-grid">${calendarGridDates(monthDate).map((date)=>{
      const value=dateKey(date); const hasAssignment=calendarAssignmentsForDate(value).length>0; const availability=calendarAvailabilityForDate(value); const hasBlock=calendarBlocksForDate(value).length>0;
      return `<button type="button" data-action="calendar-select-date" data-date="${value}" class="${isSameMonth(value,monthDate)?'':'is-outside'} ${value===today?'is-today':''} ${value===selected?'is-selected':''} ${hasAssignment?'has-assignment':''} ${availability?.status==='Available'?'has-availability':''} ${hasBlock?'has-block':''}" aria-label="Select ${esc(calendarLongDate(value))}">${date.getDate()}</button>`;
    }).join('')}</div>`;
  }

  function calendarUpcomingAssignments() {
    const today = dateKey(new Date());
    return state.assignments.map(normalizeAssignment).filter((a)=>a.dueDate && a.dueDate >= today && !['Canceled','Declined'].includes(a.status)).sort((a,b)=>`${a.dueDate}${a.dueTime||''}`.localeCompare(`${b.dueDate}${b.dueTime||''}`)).slice(0,4);
  }

  function calendarUpcomingMarkup() {
    const items = calendarUpcomingAssignments();
    if (!items.length) return emptyMessage('No upcoming records', 'Assignments and events with future due dates will appear here.');
    return items.map((a)=>{ const date=dateFromKey(a.dueDate); return `<button type="button" class="calendar-upcoming-item" data-action="edit-assignment" data-id="${a.id}"><span><b>${date.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase()}</b><strong>${date.getDate()}</strong><small>${date.toLocaleDateString('en-US',{month:'short'}).toUpperCase()}</small></span><div><strong>${esc(a.title)}</strong>${a.type?`<p>${esc(a.type)}</p>`:''}<small>${a.dueTime?`${icon('i-clock')}${esc(calendarTime(a.dueTime))}`:''}${a.classTeam?`${icon('i-pin')}${esc(a.classTeam)}`:''}</small></div></button>`; }).join('');
  }

  function calendarStats() {
    const prefix = `${calendarUi.year}-${String(calendarUi.month + 1).padStart(2,'0')}`;
    const monthAssignments = state.assignments.map(normalizeAssignment).filter((a)=>a.dueDate?.startsWith(prefix));
    return {
      assigned: monthAssignments.filter((a)=>!isCalendarClinic(a) && !['Canceled','Draft'].includes(a.status)).length,
      available: Object.entries(state.calendarAvailability || {}).filter(([key,value])=>key.startsWith(prefix) && value?.status==='Available').length,
      blocks: (state.calendarBlocks || []).filter((record)=>record.date?.startsWith(prefix)).length,
      pending: monthAssignments.filter(isCalendarPending).length
    };
  }

  function calendarDialog() {
    return `<dialog class="calendar-dialog" data-calendar-dialog aria-labelledby="calendar-dialog-title"><form data-form="calendar-availability"><header><div><p>Availability Calendar</p><h2 id="calendar-dialog-title">Manage Date</h2><span data-calendar-dialog-date></span></div><button type="button" data-action="close-calendar-dialog" aria-label="Close">${icon('i-close')}</button></header><input type="hidden" name="date"><div class="calendar-dialog-fields"><label><span>Availability Status</span><select name="status"><option value="">Not set</option><option value="Available">Available</option><option value="Partially Available">Partially Available</option><option value="Unavailable">Unavailable</option><option value="Preferred">Preferred</option></select></label><label><span>Notes</span><textarea name="notes" rows="4"></textarea></label></div><footer><button type="button" class="calendar-danger-button" data-action="clear-calendar-availability">Clear Availability</button><button type="button" class="calendar-secondary-button" data-action="open-block-from-date">Block Date / Time</button><button type="submit" class="calendar-primary-button">Save Date</button></footer></form></dialog>`;
  }

  function blockReasonPicker(selected = '') {
    const current = blockReason(selected);
    return `<div class="block-reason-picker" data-block-reason-picker><span>Block Reason</span><input type="hidden" name="reason" value="${esc(selected)}" required><button type="button" class="block-reason-trigger" data-action="toggle-block-reasons" aria-expanded="false"><span data-block-reason-label>${current ? esc(current.label) : 'Choose a reason'}</span>${icon('i-chevron')}</button><div class="block-reason-menu" data-block-reason-menu hidden>${BLOCK_REASONS.map((reason)=>`<button type="button" data-action="select-block-reason" data-value="${reason.value}">${icon(reason.icon)}<span><strong>${esc(reason.label)}</strong><small>${esc(reason.description)}</small></span></button>`).join('')}</div></div>`;
  }

  function calendarBlockDialog() {
    return `<dialog class="calendar-block-dialog" data-calendar-block-dialog aria-labelledby="calendar-block-title"><form data-form="calendar-block"><header><div><p>My Availability</p><h2 id="calendar-block-title" data-calendar-block-title>Block Date / Time</h2><span>Select the date and time you cannot accept assignments.</span></div><button type="button" data-action="close-calendar-block-dialog" aria-label="Close">${icon('i-close')}</button></header><input type="hidden" name="id"><div class="calendar-block-fields"><label><span>Date</span><input name="date" type="date" required></label><label><span>Start Time</span><input name="startTime" type="time" required></label><label><span>End Time <small>(optional)</small></span><input name="endTime" type="time"></label><div class="is-wide">${blockReasonPicker()}</div><label class="is-wide block-note-field" data-block-note-field><span data-block-note-label>Note <small>(optional)</small></span><textarea name="notes" rows="3" aria-describedby="block-note-help"></textarea><small id="block-note-help" data-block-note-help>Add details when needed. A note is required when Other is selected.</small></label></div><footer><button type="button" class="calendar-block-delete" data-action="delete-calendar-block" hidden>Delete Block</button><button type="button" class="calendar-secondary-button" data-action="close-calendar-block-dialog">Cancel</button><button type="submit" class="calendar-block-submit">Block Date / Time</button></footer></form></dialog>`;
  }


  function calendarSectionTabs() {
    return `<nav class="availability-section-tabs" aria-label="Availability tools"><button type="button" class="${calendarUi.section === 'calendar' ? 'is-active' : ''}" data-action="set-calendar-section" data-section="calendar">Calendar</button><button type="button" class="${calendarUi.section === 'report' ? 'is-active' : ''}" data-action="set-calendar-section" data-section="report">Availability Report</button></nav>`;
  }

  function reportDateRange() {
    const start = availabilityReportUi.startDate ? dateFromKey(availabilityReportUi.startDate) : null;
    const end = availabilityReportUi.endDate ? dateFromKey(availabilityReportUi.endDate) : null;
    if (start && end && start > end) return { start: end, end: start };
    return { start, end };
  }

  function reportDateInRange(value) {
    if (!value) return false;
    const date = dateFromKey(value);
    const { start, end } = reportDateRange();
    return (!start || date >= start) && (!end || date <= end);
  }

  function reportOfficialName(official) {
    return [official.firstName, official.lastName].filter(Boolean).join(' ').trim();
  }

  function reportOfficialInitials(official) {
    return `${official.firstName?.[0] || ''}${official.lastName?.[0] || ''}`.toUpperCase() || 'GU';
  }

  function reportUniqueOfficialValues(key) {
    return [...new Set((state.officials || []).map((item) => String(item[key] || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function reportEntriesForOfficial(officialId) {
    return (state.officialAvailability || []).filter((entry) => entry.officialId === officialId && reportDateInRange(entry.date)).sort((a, b) => `${b.date}${b.updatedAt || ''}`.localeCompare(`${a.date}${a.updatedAt || ''}`));
  }

  function reportCounts(entries) {
    return entries.reduce((counts, entry) => {
      if (entry.status === 'Available') counts.available += 1;
      else if (entry.status === 'Unavailable') counts.unavailable += 1;
      else counts.pending += 1;
      counts.total += 1;
      return counts;
    }, { available: 0, unavailable: 0, pending: 0, total: 0 });
  }

  function reportOfficialSummary(official) {
    const entries = reportEntriesForOfficial(official.id);
    const counts = reportCounts(entries);
    const latest = entries[0] || null;
    return {
      official,
      entries,
      ...counts,
      currentStatus: latest?.status || 'No Data',
      lastUpdated: latest?.updatedAt || official.updatedAt || official.createdAt || ''
    };
  }

  function filteredAvailabilityReportRows() {
    const query = availabilityReportUi.query.trim().toLowerCase();
    return (state.officials || []).map(reportOfficialSummary).filter((row) => {
      const official = row.official;
      if (availabilityReportUi.level && official.level !== availabilityReportUi.level) return false;
      if (availabilityReportUi.gender && official.gender !== availabilityReportUi.gender) return false;
      if (availabilityReportUi.officialType && official.officialType !== availabilityReportUi.officialType) return false;
      if (availabilityReportUi.status && row.currentStatus !== availabilityReportUi.status) return false;
      if (query) {
        const haystack = [reportOfficialName(official), official.email, official.city, official.region, official.level, official.gender, official.officialType].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    }).sort((a, b) => reportOfficialName(a.official).localeCompare(reportOfficialName(b.official)));
  }

  function availabilityReportMetrics(rows) {
    const totals = rows.reduce((summary, row) => {
      summary.available += row.available;
      summary.unavailable += row.unavailable;
      summary.pending += row.pending;
      summary.total += row.total;
      return summary;
    }, { available: 0, unavailable: 0, pending: 0, total: 0 });
    const assignmentDates = [...new Set(state.assignments.map(normalizeAssignment).filter((item) => item.dueDate && reportDateInRange(item.dueDate) && item.status !== 'Canceled').map((item) => item.dueDate))];
    const officialIds = new Set(rows.map((row) => row.official.id));
    const averageAvailable = assignmentDates.length ? assignmentDates.reduce((sum, date) => sum + (state.officialAvailability || []).filter((entry) => entry.date === date && entry.status === 'Available' && officialIds.has(entry.officialId)).length, 0) / assignmentDates.length : null;
    return { ...totals, officials: rows.length, assignmentDates: assignmentDates.length, averageAvailable };
  }

  function reportPercent(value, total) {
    return total ? Math.round((value / total) * 100) : 0;
  }

  function reportStatusClass(status) {
    return `is-${String(status || 'no-data').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }

  function reportSummaryCell(value, total, tone) {
    return `<span class="report-count ${tone}">${value} <small>(${reportPercent(value, total)}%)</small></span>`;
  }

  function reportTableRow(row) {
    const official = row.official;
    const location = [official.city, official.region].filter(Boolean).join(', ');
    return `<tr>
      <td data-label="Official"><div class="report-official-cell"><span class="report-avatar">${esc(reportOfficialInitials(official))}</span><div><strong>${esc(reportOfficialName(official))}</strong>${location ? `<small>${esc(location)}</small>` : ''}${official.email ? `<small>${esc(official.email)}</small>` : ''}</div></div></td>
      <td data-label="Type">${official.officialType ? esc(official.officialType) : '<span class="report-empty-value">—</span>'}</td>
      <td data-label="Level">${official.level ? esc(official.level) : '<span class="report-empty-value">—</span>'}</td>
      <td data-label="Gender">${official.gender ? esc(official.gender) : '<span class="report-empty-value">—</span>'}</td>
      <td data-label="Available">${reportSummaryCell(row.available, row.total, 'is-available')}</td>
      <td data-label="Unavailable">${reportSummaryCell(row.unavailable, row.total, 'is-unavailable')}</td>
      <td data-label="Pending">${reportSummaryCell(row.pending, row.total, 'is-pending')}</td>
      <td data-label="Total"><strong>${row.total}</strong></td>
      <td data-label="Status"><span class="report-status ${reportStatusClass(row.currentStatus)}">${esc(row.currentStatus)}</span></td>
      <td data-label="Last Updated">${row.lastUpdated ? `<span class="report-updated">${esc(fmtDateTime(row.lastUpdated))}</span>` : '<span class="report-empty-value">—</span>'}</td>
      <td data-label="Actions"><details class="report-row-menu"><summary aria-label="Actions for ${esc(reportOfficialName(official))}">${icon('i-dots')}</summary><div><button type="button" data-action="record-report-availability" data-id="${official.id}">${icon('i-calendar')}Record Availability</button><button type="button" data-action="edit-report-official" data-id="${official.id}">${icon('i-edit')}Edit Official</button><button type="button" data-action="delete-report-official" data-id="${official.id}">${icon('i-trash')}Delete Official</button></div></details></td>
    </tr>`;
  }

  function reportOfficialDialog() {
    const types = ['', 'Referee', 'Umpire', 'Alternate', 'Observer', 'Coordinator', 'Assignor', 'Other'];
    const levels = ['', 'Youth', 'Middle School', 'Junior Varsity', 'Varsity', 'NJCAA', 'NAIA', 'NCAA Division III', 'NCAA Division II', 'NCAA Division I', 'Professional', 'Other'];
    const genders = ['', 'Female', 'Male', 'Nonbinary', 'Prefer not to say', 'Other'];
    return `<dialog class="availability-report-dialog" data-report-official-dialog aria-labelledby="report-official-title"><form data-form="report-official"><header><div><p>Availability Report</p><h2 id="report-official-title" data-report-official-title>Add Official</h2></div><button type="button" data-action="close-report-dialog" aria-label="Close">${icon('i-close')}</button></header><input type="hidden" name="id"><div class="availability-report-dialog-grid"><label><span>First Name</span><input name="firstName" required></label><label><span>Last Name</span><input name="lastName" required></label><label class="is-wide"><span>Email</span><input name="email" type="email"></label><label><span>City</span><input name="city"></label><label><span>State / Region</span><input name="region"></label><label><span>Official Type</span><select name="officialType" required>${types.map((value) => option(value, '', value || 'Select type')).join('')}</select></label><label><span>Level</span><select name="level" required>${levels.map((value) => option(value, '', value || 'Select level')).join('')}</select></label><label><span>Gender</span><select name="gender" required>${genders.map((value) => option(value, '', value || 'Select gender')).join('')}</select></label></div><footer><button type="button" class="calendar-secondary-button" data-action="close-report-dialog">Cancel</button><button type="submit" class="availability-report-primary">Save Official</button></footer></form></dialog>`;
  }

  function reportAvailabilityDialog() {
    const officialOptions = (state.officials || []).map((official) => option(official.id, '', reportOfficialName(official))).join('');
    return `<dialog class="availability-report-dialog" data-report-availability-dialog aria-labelledby="report-availability-title"><form data-form="report-availability"><header><div><p>Availability Report</p><h2 id="report-availability-title">Record Availability</h2></div><button type="button" data-action="close-report-dialog" aria-label="Close">${icon('i-close')}</button></header><div class="availability-report-dialog-grid"><label class="is-wide"><span>Official</span><select name="officialId" required><option value="">Select official</option>${officialOptions}</select></label><label><span>Start Date</span><input name="startDate" type="date" required value="${esc(availabilityReportUi.startDate)}"></label><label><span>End Date</span><input name="endDate" type="date" required value="${esc(availabilityReportUi.endDate)}"></label><label class="is-wide"><span>Status</span><select name="status" required><option value="">Select status</option><option value="Available">Available</option><option value="Unavailable">Unavailable</option><option value="Pending">Pending</option></select></label><label class="is-wide"><span>Notes</span><textarea name="notes" rows="4"></textarea></label></div><footer><button type="button" class="calendar-secondary-button" data-action="close-report-dialog">Cancel</button><button type="submit" class="availability-report-primary">Save Availability</button></footer></form></dialog>`;
  }

  function availabilityReportPageButtons(pageCount) {
    const pages = [];
    for (let page = 1; page <= pageCount; page += 1) {
      if (page === 1 || page === pageCount || Math.abs(page - availabilityReportUi.page) <= 1) pages.push(`<button type="button" class="${page === availabilityReportUi.page ? 'is-active' : ''}" data-action="report-page" data-page="${page}">${page}</button>`);
      else if (!pages.at(-1)?.includes('report-ellipsis')) pages.push('<span class="report-ellipsis">…</span>');
    }
    return pages.join('');
  }

  function renderAvailabilityReport() {
    const rows = filteredAvailabilityReportRows();
    const metrics = availabilityReportMetrics(rows);
    const pageCount = Math.max(1, Math.ceil(rows.length / availabilityReportUi.pageSize));
    availabilityReportUi.page = Math.min(Math.max(1, availabilityReportUi.page), pageCount);
    const startIndex = (availabilityReportUi.page - 1) * availabilityReportUi.pageSize;
    const pageRows = rows.slice(startIndex, startIndex + availabilityReportUi.pageSize);
    const levels = reportUniqueOfficialValues('level');
    const genders = reportUniqueOfficialValues('gender');
    const officialTypes = reportUniqueOfficialValues('officialType');
    const totalRecorded = metrics.available + metrics.unavailable + metrics.pending;
    const availableShare = totalRecorded ? `${reportPercent(metrics.available, totalRecorded)}%` : '—';
    const unavailableShare = totalRecorded ? `${reportPercent(metrics.unavailable, totalRecorded)}%` : '—';
    const pendingShare = totalRecorded ? `${reportPercent(metrics.pending, totalRecorded)}%` : '—';
    const firstShown = rows.length ? startIndex + 1 : 0;
    const lastShown = Math.min(startIndex + availabilityReportUi.pageSize, rows.length);
    return `<section class="availability-report-page" aria-labelledby="availability-report-heading">
      <header class="availability-report-heading"><div><p>Availability Management</p><h1 id="availability-report-heading">Availability Report</h1><span>View official availability for a selected date range using only records entered into this dashboard.</span></div><div class="availability-report-heading-actions"><button type="button" data-action="new-report-official">${icon('i-user')}Add Official</button><button type="button" data-action="new-report-availability">${icon('i-calendar')}Record Availability</button><button type="button" data-action="export-availability-report">${icon('i-download')}Export (Excel)</button><button class="is-primary" type="button" data-action="print-availability-report">${icon('i-form')}Print Report</button></div></header>

      <section class="availability-report-filters" aria-label="Availability report filters">
        <label><span>Date From</span><input type="date" value="${esc(availabilityReportUi.startDate)}" data-report-filter="startDate"></label>
        <label><span>Date To</span><input type="date" value="${esc(availabilityReportUi.endDate)}" data-report-filter="endDate"></label>
        <label><span>Level</span><select data-report-filter="level"><option value="">All Levels</option>${levels.map((value) => option(value, availabilityReportUi.level)).join('')}</select></label>
        <label><span>Gender</span><select data-report-filter="gender"><option value="">All Genders</option>${genders.map((value) => option(value, availabilityReportUi.gender)).join('')}</select></label>
        <label><span>Official Type</span><select data-report-filter="officialType"><option value="">All Types</option>${officialTypes.map((value) => option(value, availabilityReportUi.officialType)).join('')}</select></label>
        <label><span>Status</span><select data-report-filter="status"><option value="">All Statuses</option>${['Available','Unavailable','Pending','No Data'].map((value) => option(value, availabilityReportUi.status)).join('')}</select></label>
        <label class="report-search-field"><span>Search</span><div>${icon('i-search')}<input type="search" value="${esc(availabilityReportUi.query)}" data-report-search aria-label="Search officials"></div></label>
        <button class="report-reset-filter" type="button" data-action="reset-report-filters">${icon('i-filter')}Clear Filters</button>
      </section>

      <section class="availability-report-metrics" aria-label="Availability report totals">
        <article class="is-available"><span>${icon('i-calendar')}</span><div><strong>${metrics.available}</strong><p>Available<small>${availableShare}</small></p></div></article>
        <article class="is-unavailable"><span>${icon('i-calendar')}</span><div><strong>${metrics.unavailable}</strong><p>Unavailable<small>${unavailableShare}</small></p></div></article>
        <article class="is-pending"><span>${icon('i-clock')}</span><div><strong>${metrics.pending}</strong><p>Pending<small>${pendingShare}</small></p></div></article>
        <article class="is-officials"><span>${icon('i-user')}</span><div><strong>${metrics.officials}</strong><p>Total Officials<small>Matching filters</small></p></div></article>
        <article class="is-average"><span>${icon('i-calendar')}</span><div><strong>${metrics.averageAvailable === null ? '—' : metrics.averageAvailable.toFixed(1)}</strong><p>Avg. Available / Game<small>${metrics.assignmentDates ? `${metrics.assignmentDates} assignment date${metrics.assignmentDates === 1 ? '' : 's'}` : 'No assignment dates'}</small></p></div></article>
      </section>

      <section class="availability-report-table-panel" aria-label="Official availability summary">
        <div class="availability-report-table-scroll"><table class="availability-report-table"><thead><tr><th rowspan="2">Official</th><th rowspan="2">Type</th><th rowspan="2">Level</th><th rowspan="2">Gender</th><th colspan="4">Availability Summary</th><th rowspan="2">Status</th><th rowspan="2">Last Updated</th><th rowspan="2"><span class="sr-only">Actions</span></th></tr><tr><th>Available</th><th>Unavailable</th><th>Pending</th><th>Total</th></tr></thead><tbody>${pageRows.length ? pageRows.map(reportTableRow).join('') : `<tr><td colspan="11"><div class="availability-report-empty">${icon('i-calendar')}<strong>No officials match this report.</strong><p>Add an official and record availability, or adjust the active filters.</p><div><button type="button" data-action="new-report-official">Add Official</button><button type="button" data-action="new-report-availability" ${state.officials.length ? '' : 'disabled'}>Record Availability</button></div></div></td></tr>`}</tbody></table></div>
        <footer class="availability-report-footer"><p>Showing ${firstShown} to ${lastShown} of ${rows.length} officials</p><div class="availability-report-pagination"><button type="button" data-action="report-page" data-page="${availabilityReportUi.page - 1}" ${availabilityReportUi.page <= 1 ? 'disabled' : ''} aria-label="Previous page">‹</button>${availabilityReportPageButtons(pageCount)}<button type="button" data-action="report-page" data-page="${availabilityReportUi.page + 1}" ${availabilityReportUi.page >= pageCount ? 'disabled' : ''} aria-label="Next page">›</button></div><label><span class="sr-only">Rows per page</span><select data-report-page-size>${[10,25,50].map((value) => option(String(value), String(availabilityReportUi.pageSize), `${value} per page`)).join('')}</select></label></footer>
      </section>
      ${reportOfficialDialog()}${reportAvailabilityDialog()}
    </section>`;
  }

  function openReportOfficialDialog(record = null) {
    const dialog = moduleView.querySelector('[data-report-official-dialog]');
    if (!dialog) return;
    const form = dialog.querySelector('form');
    form.reset();
    dialog.querySelector('[data-report-official-title]').textContent = record ? 'Edit Official' : 'Add Official';
    if (record) ['id','firstName','lastName','email','city','region','officialType','level','gender'].forEach((key) => { if (form.elements[key]) form.elements[key].value = record[key] || ''; });
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    requestAnimationFrame(() => form.elements.firstName?.focus());
  }

  function openReportAvailabilityDialog(officialId = '') {
    if (!(state.officials || []).length) { showToast('Add an official before recording availability.'); return; }
    const dialog = moduleView.querySelector('[data-report-availability-dialog]');
    if (!dialog) return;
    const form = dialog.querySelector('form');
    form.reset();
    form.elements.startDate.value = availabilityReportUi.startDate;
    form.elements.endDate.value = availabilityReportUi.endDate;
    form.elements.officialId.value = officialId || '';
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    requestAnimationFrame(() => (officialId ? form.elements.status : form.elements.officialId)?.focus());
  }

  function exportAvailabilityReportExcel() {
    const rows = filteredAvailabilityReportRows();
    const headers = ['Official','Email','City','State / Region','Type','Level','Gender','Available','Unavailable','Pending','Total Recorded','Current Status','Last Updated'];
    const body = rows.map((row) => { const official = row.official; return [reportOfficialName(official), official.email || '', official.city || '', official.region || '', official.officialType || '', official.level || '', official.gender || '', row.available, row.unavailable, row.pending, row.total, row.currentStatus, row.lastUpdated ? fmtDateTime(row.lastUpdated) : '']; });
    const cell = (value) => `<td>${String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Availability Report</title></head><body><table border="1"><thead><tr>${headers.map((value) => `<th>${value}</th>`).join('')}</tr></thead><tbody>${body.map((row) => `<tr>${row.map(cell).join('')}</tr>`).join('')}</tbody></table></body></html>`;
    downloadText('got-u-nex-ref-availability-report.xls', html, 'application/vnd.ms-excel');
  }

  function renderCalendar() {
    if (calendarUi.section === 'report') return `<div class="availability-hub">${calendarSectionTabs()}${renderAvailabilityReport()}</div>`;
    const selectedDate = calendarUi.selectedDate || dateKey(new Date());
    const view = calendarUi.view === 'week' ? renderCalendarWeek() : calendarUi.view === 'list' ? renderCalendarList() : renderCalendarMonth();
    return `<div class="availability-hub">${calendarSectionTabs()}<div class="my-availability-page">
      <header class="my-availability-heading"><div><h1>My Availability</h1><p>Manage availability, blocked dates, assignments, and calendar exports using records you enter.</p></div><div class="my-availability-actions"><button type="button" data-action="sync-calendar">${icon('i-sync')}Export Calendar</button><button class="is-primary" type="button" data-action="open-calendar-block">${icon('i-plus')}Block Date / Time</button><button type="button" data-action="print-calendar">${icon('i-download')}Print Calendar</button></div></header>
      <section class="my-availability-controls"><div class="my-availability-month-nav"><button type="button" data-action="calendar-prev" aria-label="Previous period">‹</button><button type="button" data-action="calendar-today">Today</button><h2>${esc(calendarMonthLabel())}</h2><button type="button" data-action="calendar-next" aria-label="Next period">›</button></div><div class="calendar-view-switch" role="group" aria-label="Calendar view"><button type="button" class="${calendarUi.view==='month'?'is-active':''}" data-action="set-calendar-view" data-view="month">Month</button><button type="button" class="${calendarUi.view==='week'?'is-active':''}" data-action="set-calendar-view" data-view="week">Week</button><button type="button" class="${calendarUi.view==='list'?'is-active':''}" data-action="set-calendar-view" data-view="list">List</button></div></section>
      <section class="my-availability-calendar" id="full-availability-calendar"><div class="availability-calendar-canvas">${view}</div><div class="availability-calendar-legend"><span><i class="is-available"></i>Available</span><span><i class="is-partially-available"></i>Partially Available</span><span><i class="is-unavailable"></i>Unavailable</span><span><i class="is-preferred"></i>Preferred</span><span><i class="is-assignment"></i>Assigned</span></div></section>
      ${calendarDialog()}${calendarBlockDialog()}${assignmentFormDialog()}
    </div></div>`;
  }


  function refreshCalendar() { moduleView.innerHTML = renderCalendar(); }

  function openCalendarDialog(value) {
    calendarUi.selectedDate = value;
    const dialog = moduleView.querySelector('[data-calendar-dialog]'); if (!dialog) return;
    const record = calendarAvailabilityForDate(value) || {};
    const form = dialog.querySelector('form'); form.elements.date.value = value; form.elements.status.value = record.status || ''; form.elements.notes.value = record.notes || '';
    dialog.querySelector('[data-calendar-dialog-date]').textContent = calendarLongDate(value);
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open','');
    requestAnimationFrame(()=>form.elements.status.focus());
  }


  function updateBlockReasonPicker(dialog, value = '') {
    const reason = blockReason(value);
    const hidden = dialog.querySelector('input[name="reason"]');
    const label = dialog.querySelector('[data-block-reason-label]');
    const trigger = dialog.querySelector('.block-reason-trigger');
    const menu = dialog.querySelector('[data-block-reason-menu]');
    if (hidden) hidden.value = value;
    if (label) label.textContent = reason?.label || 'Choose a reason';
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (menu) menu.hidden = true;
    const note = dialog.querySelector('textarea[name="notes"]');
    const noteLabel = dialog.querySelector('[data-block-note-label]');
    const noteHelp = dialog.querySelector('[data-block-note-help]');
    const requiresDetails = value === 'other';
    if (note) {
      note.required = requiresDetails;
      note.setAttribute('aria-required', String(requiresDetails));
    }
    if (noteLabel) noteLabel.innerHTML = requiresDetails ? 'Reason details <small>(required)</small>' : 'Note <small>(optional)</small>';
    if (noteHelp) noteHelp.textContent = requiresDetails ? 'Describe the reason for this block.' : 'Add details when needed. A note is required when Other is selected.';
  }

  function openCalendarBlockDialog(record = null, date = '') {
    const dialog = moduleView.querySelector('[data-calendar-block-dialog]');
    if (!dialog) return;
    const form = dialog.querySelector('form');
    form.reset();
    const value = date || record?.date || calendarUi.selectedDate || dateKey(new Date());
    form.elements.id.value = record?.id || '';
    form.elements.date.value = value;
    form.elements.startTime.value = record?.startTime || '';
    form.elements.endTime.value = record?.endTime || '';
    form.elements.notes.value = record?.notes || '';
    updateBlockReasonPicker(dialog, record?.reason || '');
    dialog.querySelector('[data-calendar-block-title]').textContent = record ? 'Edit Blocked Date / Time' : 'Block Date / Time';
    const deleteButton = dialog.querySelector('[data-action="delete-calendar-block"]');
    if (deleteButton) deleteButton.hidden = !record;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open','');
    requestAnimationFrame(()=>form.elements.date.focus());
  }

  function shiftCalendar(amount) {
    if (calendarUi.view === 'month') { const next = new Date(calendarUi.year, calendarUi.month + amount, 1, 12); calendarUi.year=next.getFullYear(); calendarUi.month=next.getMonth(); return; }
    const base = calendarUi.selectedDate ? dateFromKey(calendarUi.selectedDate) : calendarMonthDate();
    const next = addDays(base, calendarUi.view === 'week' ? amount * 7 : amount);
    calendarUi.selectedDate=dateKey(next); calendarUi.year=next.getFullYear(); calendarUi.month=next.getMonth();
  }

  function exportCalendarIcs() {
    const escapeIcs = (value='') => String(value).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
    const formatIcsDate = (value,time='') => { const clean=value.replace(/-/g,''); return time ? `${clean}T${time.replace(':','')}00` : clean; };
    const stamp = () => new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Got U Nex Ref//Availability Calendar//EN','CALSCALE:GREGORIAN'];
    state.assignments.map(normalizeAssignment).filter((a)=>a.dueDate).forEach((a)=>{ lines.push('BEGIN:VEVENT',`UID:${escapeIcs(a.id)}@gotunexref.local`,`DTSTAMP:${stamp()}`,a.dueTime?`DTSTART:${formatIcsDate(a.dueDate,a.dueTime)}`:`DTSTART;VALUE=DATE:${formatIcsDate(a.dueDate)}`,`SUMMARY:${escapeIcs(a.title || 'Assignment')}`,a.description?`DESCRIPTION:${escapeIcs(a.description)}`:'',a.classTeam?`LOCATION:${escapeIcs(a.classTeam)}`:'','END:VEVENT'); });
    Object.entries(state.calendarAvailability || {}).forEach(([value,record])=>{ if(!record?.status)return; lines.push('BEGIN:VEVENT',`UID:availability-${value}@gotunexref.local`,`DTSTAMP:${stamp()}`,`DTSTART;VALUE=DATE:${formatIcsDate(value)}`,`SUMMARY:${escapeIcs(`Availability: ${record.status}`)}`,record.notes?`DESCRIPTION:${escapeIcs(record.notes)}`:'','TRANSP:TRANSPARENT','END:VEVENT'); });
    (state.calendarBlocks || []).forEach((record)=>{ if(!record.date || !record.startTime)return; lines.push('BEGIN:VEVENT',`UID:${escapeIcs(record.id)}@gotunexref.local`,`DTSTAMP:${stamp()}`,`DTSTART:${formatIcsDate(record.date,record.startTime)}`,record.endTime?`DTEND:${formatIcsDate(record.date,record.endTime)}`:'',`SUMMARY:${escapeIcs(`Blocked: ${blockReasonDisplay(record)}`)}`,record.notes?`DESCRIPTION:${escapeIcs(record.notes)}`:'','STATUS:CONFIRMED','TRANSP:OPAQUE','END:VEVENT'); });
    lines.push('END:VCALENDAR'); downloadText('got-u-nex-ref-calendar.ics',lines.filter(Boolean).join('\r\n'),'text/calendar');
  }


  function availabilityGrid() {
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const periods = ['Morning','Afternoon','Evening'];
    return `<div class="availability-editor"><div class="availability-editor__head"><span>Time</span>${days.map((d) => `<span>${d.slice(0,3)}</span>`).join('')}</div>${periods.map((p) => `<div class="availability-editor__row"><strong>${p}</strong>${days.map((d) => { const key = `${d}-${p}`; const value = state.availability[key] || 'Unset'; return `<button type="button" data-action="cycle-availability" data-key="${key}" data-value="${value}">${value}</button>`; }).join('')}</div>`).join('')}</div>`;
  }


  function schoolTeamDraftDefaults(side = 'home') {
    return { side, mode: 'existing', schoolId: '', name: '', mascotName: '', primaryColor: '', secondaryColor: '', teamLevel: '', logoFileId: '', logoUrl: '', removeLogo: false, pendingLogoFile: null };
  }

  function resetSchoolTeamDrafts() {
    Object.values(schoolsUi.logoPreviewUrls || {}).forEach((url) => { if (url) URL.revokeObjectURL(url); });
    schoolsUi.logoPreviewUrls = { home: '', visiting: '' };
    schoolsUi.drafts = { home: schoolTeamDraftDefaults('home'), visiting: schoolTeamDraftDefaults('visiting') };
    schoolsUi.pair = { homeId: '', visitingId: '' };
  }

  function schoolPairDraft(side) {
    if (!schoolsUi.drafts || !schoolsUi.drafts[side]) {
      schoolsUi.drafts = schoolsUi.drafts || {};
      schoolsUi.drafts[side] = schoolTeamDraftDefaults(side);
    }
    return schoolsUi.drafts[side];
  }

  function schoolDraftFromRecord(side, school) {
    const draft = schoolTeamDraftDefaults(side);
    if (!school) return draft;
    return {
      ...draft,
      mode: 'existing',
      schoolId: school.id || '',
      name: schoolDisplayName(school),
      mascotName: String(school.mascotName || school.teamName || '').trim(),
      primaryColor: schoolSafeColor(school.primaryColor) || '#000000',
      secondaryColor: schoolSafeColor(school.secondaryColor) || '#ffffff',
      teamLevel: String(school.teamLevel || '').trim(),
      logoFileId: String(school.logoFileId || '').trim(),
      logoUrl: String(school.logoUrl || school.logo || '').trim(),
      removeLogo: false,
      pendingLogoFile: null
    };
  }

  function schoolPairExistingOptions(selectedId = '') {
    const records = [...(state.schools || [])].sort((a, b) => schoolDisplayName(a).localeCompare(schoolDisplayName(b)));
    return `<option value=""></option>${records.map((school) => `<option value="${esc(school.id)}" ${school.id === selectedId ? 'selected' : ''}>${esc(schoolDisplayName(school))}${school.mascotName ? ` — ${esc(school.mascotName)}` : ''}</option>`).join('')}`;
  }

  function schoolPairLogoPreview(side, draft) {
    const objectUrl = schoolsUi.logoPreviewUrls?.[side] || '';
    if (objectUrl) return `<img src="${esc(objectUrl)}" alt="Selected ${side === 'home' ? 'home' : 'visiting'} team logo">`;
    if (draft.logoFileId) return `<span data-school-logo-id="${esc(draft.logoFileId)}" data-school-logo-preview-target="${esc(side)}"></span>`;
    const remote = safeUrl(draft.logoUrl || '');
    if (remote) return `<img src="${esc(remote)}" alt="Saved ${side === 'home' ? 'home' : 'visiting'} team logo">`;
    return `<span class="school-pair-logo-empty">${icon('i-school')}<small>No logo selected</small></span>`;
  }

  function schoolPairPanel(side) {
    const draft = schoolPairDraft(side);
    const isHome = side === 'home';
    const title = isHome ? 'Home Team' : 'Visiting Team';
    const accentIcon = isHome ? 'i-home' : 'i-send';
    const modeName = `${side}Mode`;
    const selectedSchool = (state.schools || []).find((school) => school.id === draft.schoolId);
    const currentName = draft.name || schoolDisplayName(selectedSchool || {});
    return `<section class="school-pair-panel ${isHome ? 'is-home' : 'is-visiting'}" data-school-pair-panel="${side}">
      <header>${icon(accentIcon)}<h2>${title}</h2></header>
      <div class="school-pair-panel__body">
        <fieldset class="school-pair-mode"><legend>Select Existing or Add New</legend><label><input type="radio" name="${modeName}" value="existing" data-school-pair-mode data-side="${side}" ${draft.mode !== 'new' ? 'checked' : ''}><span>Existing School/Team</span></label><label><input type="radio" name="${modeName}" value="new" data-school-pair-mode data-side="${side}" ${draft.mode === 'new' ? 'checked' : ''}><span>Add New School/Team</span></label></fieldset>
        <div class="school-pair-existing" ${draft.mode === 'new' ? 'hidden' : ''}><label><span>School / Team <b>*</b></span><select name="${side}SchoolId" data-school-pair-select data-side="${side}" ${draft.mode === 'new' ? 'disabled' : 'required'} aria-label="Select ${title.toLowerCase()}">${schoolPairExistingOptions(draft.schoolId)}</select></label></div>
        <div class="school-pair-new" ${draft.mode === 'new' ? '' : 'hidden'}><label><span>School / Team Name <b>*</b></span><input name="${side}Name" type="text" value="${esc(draft.mode === 'new' ? currentName : '')}" data-school-pair-field="name" data-side="${side}" ${draft.mode === 'new' ? 'required' : 'disabled'} autocomplete="organization"></label></div>
        <label><span>Team Nickname <b>*</b></span><input name="${side}MascotName" type="text" value="${esc(draft.mascotName)}" data-school-pair-field="mascotName" data-side="${side}" required></label>
        <div class="school-pair-logo-row"><label class="school-pair-logo-upload"><span>Team Logo <b>*</b></span><input name="${side}Logo" type="file" accept="image/png,image/jpeg,image/svg+xml" data-school-team-logo-input data-side="${side}"><strong>${icon('i-upload')}<b>Click to upload logo</b><small>PNG, JPG or SVG · 2 MB maximum</small></strong></label><div class="school-pair-logo-preview"><span>Preview</span><div data-school-pair-logo-preview="${side}">${schoolPairLogoPreview(side, draft)}</div><button type="button" data-action="remove-school-pair-logo" data-side="${side}" ${draft.logoFileId || draft.logoUrl || schoolsUi.logoPreviewUrls?.[side] ? '' : 'hidden'}>Remove</button></div></div>
        <fieldset class="school-pair-colors"><legend>Team Colors <small>(Optional)</small></legend><label><span>Primary Color</span><div><input name="${side}PrimaryColorPicker" type="color" value="${esc(schoolSafeColor(draft.primaryColor) || '#000000')}" data-school-color-picker data-side="${side}" data-color-key="primaryColor"><input name="${side}PrimaryColor" type="text" value="${esc(schoolSafeColor(draft.primaryColor))}" pattern="#[0-9A-Fa-f]{6}" data-school-pair-field="primaryColor" data-side="${side}" aria-label="${title} primary color hex value"></div></label><label><span>Secondary Color</span><div><input name="${side}SecondaryColorPicker" type="color" value="${esc(schoolSafeColor(draft.secondaryColor) || '#ffffff')}" data-school-color-picker data-side="${side}" data-color-key="secondaryColor"><input name="${side}SecondaryColor" type="text" value="${esc(schoolSafeColor(draft.secondaryColor))}" pattern="#[0-9A-Fa-f]{6}" data-school-pair-field="secondaryColor" data-side="${side}" aria-label="${title} secondary color hex value"></div></label></fieldset>
        <label><span>School / Team Level <b>*</b></span><select name="${side}TeamLevel" data-school-pair-field="teamLevel" data-side="${side}" required><option value=""></option>${['Varsity','Junior Varsity','Middle School','College','Professional','Youth','Other'].map((value) => option(value, draft.teamLevel)).join('')}</select></label>
      </div>
    </section>`;
  }

  function renderAddSchoolTeamPair() {
    return `<section class="school-pair-page"><header class="school-pair-page__header"><div><h1>Add School / Team</h1><p>Add the home team and visiting team records used by game assignments.</p></div><button type="button" data-action="cancel-school-pair">${icon('i-close')}Cancel</button></header>${schoolProgress(1)}<form data-form="school-pair" novalidate><div class="school-pair-grid">${schoolPairPanel('home')}${schoolPairPanel('visiting')}</div><footer><button class="is-primary" type="submit">${icon('i-chevron')}Next: Add Contacts (Optional)</button></footer></form></section>`;
  }

  async function hydrateSchoolLogos() {
    const targets = [...moduleView.querySelectorAll('[data-school-logo-id]')];
    await Promise.all(targets.map(async (target) => {
      const id = target.dataset.schoolLogoId;
      if (!id) return;
      const record = await dbGetFile(id);
      if (!record?.blob) return;
      const url = URL.createObjectURL(record.blob);
      const img = document.createElement('img');
      img.alt = '';
      img.src = url;
      img.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
      target.replaceChildren(img);
    }));
  }

  function schoolPairContactSwitcher() {
    const pair = schoolsUi.pair || {};
    const home = (state.schools || []).find((school) => school.id === pair.homeId);
    const visiting = (state.schools || []).find((school) => school.id === pair.visitingId);
    if (!home || !visiting) return '';
    const teamButton = (school, label) => `<button type="button" class="${schoolsUi.selectedId === school.id ? 'is-active' : ''}" data-action="select-school-pair-contact" data-id="${esc(school.id)}"><small>${esc(label)}</small>${schoolMark(school)}<span><strong>${esc(schoolDisplayName(school))}</strong><em>${esc(school.mascotName || '')}</em></span>${schoolsUi.selectedId === school.id ? icon('i-check') : icon('i-chevron')}</button>`;
    return `<nav class="school-pair-contact-switcher" aria-label="Choose team contacts to edit">${teamButton(home, 'Home Team')}${teamButton(visiting, 'Visiting Team')}</nav>`;
  }

  function schoolPairReviewCard(school, label) {
    const contacts = schoolContacts(school);
    return `<article class="school-pair-review-card"><header><small>${esc(label)}</small><h2>${esc(schoolDisplayName(school))}</h2>${school.mascotName ? `<p>${esc(school.mascotName)}</p>` : ''}</header>${schoolTeamInformation(school)}<section><h3>Saved Contacts</h3>${contacts.length ? contacts.map(schoolContactListItem).join('') : `<div class="school-contacts-empty">${icon('i-user')}<strong>No contacts saved.</strong><p>Contacts may be added now or later from the Schools section.</p></div>`}</section></article>`;
  }

  function renderSchoolPairReview() {
    const pair = schoolsUi.pair || {};
    const home = (state.schools || []).find((school) => school.id === pair.homeId);
    const visiting = (state.schools || []).find((school) => school.id === pair.visitingId);
    if (!home || !visiting) return '';
    return `<section class="school-review-page school-pair-review-page"><header class="school-contacts-page__header"><button type="button" data-action="set-schools-view" data-view="contacts">${icon('i-chevron')}Back to Contacts</button><div><h1>Review School / Team</h1><p>Review both saved team records and their contact information.</p></div>${schoolProgress(3)}</header><div class="school-pair-review-grid">${schoolPairReviewCard(home, 'Home Team')}${schoolPairReviewCard(visiting, 'Visiting Team')}</div><footer class="school-contact-footer"><button type="button" data-action="set-schools-view" data-view="contacts">${icon('i-chevron')}Back: Add Contacts</button><span></span><button class="is-primary" type="button" data-action="school-save-exit">${icon('i-check')}Save & Exit</button></footer></section>`;
  }

  const SCHOOL_CONTACT_ROLES = [
    { value: 'head-coach', label: 'Head Coach', icon: 'i-trophy', schoolRequired: true },
    { value: 'athletic-director', label: 'Athletic Director', icon: 'i-user', schoolRequired: true },
    { value: 'assistant-athletic-director', label: 'Assistant Athletic Director', icon: 'i-user' },
    { value: 'game-day-administrator', label: 'Game Day Administrator', icon: 'i-calendar' },
    { value: 'sports-information-director', label: 'Sports Information Director', icon: 'i-send' },
    { value: 'conference-commissioner', label: 'Conference Commissioner', icon: 'i-school' },
    { value: 'other', label: 'Other Contact', icon: 'i-user' }
  ];

  function schoolDisplayName(school = {}) {
    return String(school.name || school.organization || school.schoolName || '').trim();
  }

  function schoolContactRole(value = '') {
    return SCHOOL_CONTACT_ROLES.find((role) => role.value === value) || SCHOOL_CONTACT_ROLES[SCHOOL_CONTACT_ROLES.length - 1];
  }

  function splitContactName(value = '') {
    const parts = String(value).trim().split(/\s+/).filter(Boolean);
    return { firstName: parts.slice(0, -1).join(' ') || parts[0] || '', lastName: parts.length > 1 ? parts.at(-1) : '' };
  }

  function contactFullName(contact = {}) {
    return [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim() || String(contact.name || '').trim();
  }

  function normalizeSchoolContact(contact = {}, fallbackRole = 'other') {
    const legacyName = splitContactName(contact.name || '');
    return {
      ...contact,
      id: contact.id || uid('school-contact'),
      role: contact.role || fallbackRole,
      firstName: String(contact.firstName || legacyName.firstName || '').trim(),
      lastName: String(contact.lastName || legacyName.lastName || '').trim(),
      email: String(contact.email || '').trim(),
      phone: String(contact.phone || '').trim(),
      extension: String(contact.extension || contact.ext || '').trim(),
      fax: String(contact.fax || '').trim(),
      address1: String(contact.address1 || contact.street || '').trim(),
      address2: String(contact.address2 || '').trim(),
      city: String(contact.city || '').trim(),
      region: String(contact.region || contact.state || '').trim(),
      postalCode: String(contact.postalCode || contact.zipCode || '').trim(),
      country: String(contact.country || '').trim()
    };
  }

  function schoolContacts(school = {}) {
    const records = Array.isArray(school.contacts) ? school.contacts.map((contact, index) => normalizeSchoolContact({ ...contact, id: contact.id || `school-contact-${school.id || 'school'}-${index + 1}` })) : [];
    const hasRole = (role) => records.some((contact) => contact.role === role);
    if (!hasRole('head-coach') && (school.headCoach || school.headCoachEmail || school.headCoachPhone)) {
      const name = splitContactName(school.headCoach || '');
      records.push(normalizeSchoolContact({ id: 'legacy-head-coach', role: 'head-coach', ...name, email: school.headCoachEmail, phone: school.headCoachPhone }, 'head-coach'));
    }
    if (!hasRole('athletic-director') && (school.athleticDirector || school.athleticDirectorEmail || school.athleticDirectorPhone)) {
      const name = splitContactName(school.athleticDirector || '');
      records.push(normalizeSchoolContact({ id: 'legacy-athletic-director', role: 'athletic-director', ...name, email: school.athleticDirectorEmail, phone: school.athleticDirectorPhone }, 'athletic-director'));
    }
    if (!records.length && (school.contactName || school.email || school.phone)) {
      const name = splitContactName(school.contactName || '');
      records.push(normalizeSchoolContact({ id: 'legacy-primary-contact', role: 'other', ...name, email: school.email, phone: school.phone }, 'other'));
    }
    return records.slice(0, 7);
  }

  function syncSchoolLegacyContacts(school) {
    const contacts = Array.isArray(school.contacts) ? school.contacts.map((contact) => normalizeSchoolContact(contact)) : [];
    const headCoach = contacts.find((contact) => contact.role === 'head-coach');
    const athleticDirector = contacts.find((contact) => contact.role === 'athletic-director');
    school.headCoach = headCoach ? contactFullName(headCoach) : '';
    school.headCoachEmail = headCoach?.email || '';
    school.headCoachPhone = headCoach?.phone || '';
    school.athleticDirector = athleticDirector ? contactFullName(athleticDirector) : '';
    school.athleticDirectorEmail = athleticDirector?.email || '';
    school.athleticDirectorPhone = athleticDirector?.phone || '';
    const primary = headCoach || athleticDirector || contacts[0];
    school.contactName = primary ? contactFullName(primary) : '';
    school.email = primary?.email || '';
    school.phone = primary?.phone || '';
  }

  function selectedSchoolRecord() {
    return (state.schools || []).find((school) => school.id === schoolsUi.selectedId) || null;
  }

  function schoolSafeColor(value = '') {
    const color = String(value).trim();
    return /^#[0-9a-f]{6}$/i.test(color) ? color : '';
  }

  function schoolMark(school, className = '') {
    const logoFileId = String(school.logoFileId || '').trim();
    const logo = safeUrl(school.logoUrl || school.logo || '');
    const initials = schoolDisplayName(school).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
    const content = logoFileId ? `<span data-school-logo-id="${esc(logoFileId)}"></span>` : logo ? `<img src="${esc(logo)}" alt="">` : `<span>${esc(initials || '•')}</span>`;
    return `<span class="school-team-mark ${className}">${content}</span>`;
  }

  function schoolsTaskNavigation() {
    return `<nav class="schools-task-navigation" aria-label="Schools tools">
      <button type="button" data-action="set-schools-view" data-view="directory" class="${schoolsUi.section === 'directory' ? 'is-active' : ''}">${icon('i-school')}Schools & Teams</button>
      <button type="button" data-action="set-schools-view" data-view="add-teams" class="${schoolsUi.section === 'add-teams' ? 'is-active' : ''}">${icon('i-plus')}Add School / Team</button>
      <button type="button" data-action="set-schools-view" data-view="contacts" class="${schoolsUi.section === 'contacts' ? 'is-active' : ''}">${icon('i-user')}Team Contacts</button>
      <button type="button" data-action="set-schools-view" data-view="review" class="${schoolsUi.section === 'review' ? 'is-active' : ''}" ${schoolsUi.selectedId ? '' : 'disabled'}>${icon('i-check')}Review & Save</button>
    </nav>`;
  }

  function schoolDirectoryCard(school) {
    const contacts = schoolContacts(school);
    const details = [school.type, school.teamLevel, school.teamType, school.mascotName].filter(Boolean).join(' · ');
    const location = [school.venueName, school.city, school.region].filter(Boolean).join(' · ');
    return `<article class="school-directory-card" data-search-item>
      ${schoolMark(school)}
      <div class="school-directory-card__copy"><p>${esc(school.type || 'Organization')}</p><h3>${esc(schoolDisplayName(school))}</h3>${details ? `<span>${esc(details)}</span>` : ''}${location ? `<small>${esc(location)}</small>` : ''}</div>
      <div class="school-directory-card__contacts"><strong>${contacts.length}</strong><span>${contacts.length === 1 ? 'Contact' : 'Contacts'}</span></div>
      <div class="school-directory-card__actions"><button type="button" data-action="manage-school-contacts" data-id="${esc(school.id)}">${icon('i-user')}Manage Contacts</button><button type="button" data-action="edit-school" data-id="${esc(school.id)}" aria-label="Edit ${esc(schoolDisplayName(school))}">${icon('i-edit')}</button><button type="button" data-action="delete-school" data-id="${esc(school.id)}" aria-label="Delete ${esc(schoolDisplayName(school))}">${icon('i-trash')}</button></div>
    </article>`;
  }

  function renderSchoolDirectory() {
    return `${routeHeader('Schools & Teams', 'Maintain the schools, leagues, tournaments, program contacts, and venue records you actually work with.', `<button class="module-button module-button--primary" type="button" data-action="set-schools-view" data-view="add-teams">${icon('i-plus')} Add School / Team</button>`)}
      ${schoolsTaskNavigation()}
      <div class="school-directory-layout"><section class="school-directory-panel"><header><div><p>Organization Directory</p><h2>${icon('i-school')}Schools and Teams</h2></div><label class="school-directory-search">${icon('i-search')}<span class="sr-only">Search schools and teams</span><input type="search" data-search aria-label="Search schools and teams"></label></header><div class="school-directory-list">${state.schools.length ? state.schools.map(schoolDirectoryCard).join('') : `<div class="school-empty-state">${icon('i-school')}<strong>No schools or teams have been added.</strong><p>Use Add School / Team to create actual organization records before adding contacts.</p><button type="button" data-action="set-schools-view" data-view="add-teams">Add School / Team</button></div>`}</div></section>
      <aside class="school-organization-editor"><header><p>Step 1</p><h2>${icon('i-plus')}Add or Update School / Team</h2></header><form data-form="school"><input type="hidden" name="id"><div class="school-editor-grid"><label class="is-wide"><span>Organization Name <b>*</b></span><input name="name" type="text" required></label><label><span>Organization Type</span><select name="type"><option value="">Select type</option><option value="School">School</option><option value="League">League</option><option value="Tournament">Tournament</option><option value="Conference">Conference</option><option value="Other">Other</option></select></label><label><span>Mascot / Team Name</span><input name="mascotName" type="text"></label><label><span>Team Level</span><input name="teamLevel" type="text"></label><label><span>Team Type</span><input name="teamType" type="text"></label><label class="is-wide"><span>Logo URL</span><input name="logoUrl" type="url"></label><label><span>Primary Color</span><input name="primaryColor" type="text" pattern="#[0-9A-Fa-f]{6}" aria-describedby="school-primary-color-format"><small id="school-primary-color-format">Use six-digit hexadecimal format.</small></label><label><span>Secondary Color</span><input name="secondaryColor" type="text" pattern="#[0-9A-Fa-f]{6}" aria-describedby="school-secondary-color-format"><small id="school-secondary-color-format">Use six-digit hexadecimal format.</small></label><label class="is-wide"><span>Venue Name</span><input name="venueName" type="text"></label><label class="is-wide"><span>Venue Address</span><input name="venueAddress" type="text"></label><label class="is-wide"><span>Venue Phone</span><input name="venuePhone" type="tel"></label><label class="is-wide"><span>Mailing Address Line 1</span><input name="address1" type="text"></label><label class="is-wide"><span>Mailing Address Line 2</span><input name="address2" type="text"></label><label><span>City</span><input name="city" type="text"></label><label><span>State / Region</span><input name="region" type="text"></label><label><span>Postal Code</span><input name="postalCode" type="text"></label><label class="is-wide"><span>Country</span><input name="country" type="text"></label><label class="is-wide"><span>Notes</span><textarea name="notes" rows="4"></textarea></label></div><div class="school-editor-actions"><button type="reset">Clear</button><button class="is-primary" type="submit">${icon('i-check')}Save School / Team</button></div></form></aside></div>`;
  }

  function schoolTeamInformation(school) {
    const primary = schoolSafeColor(school.primaryColor);
    const secondary = schoolSafeColor(school.secondaryColor);
    const details = [school.teamLevel, school.teamType, school.mascotName].filter(Boolean);
    return `<section class="school-team-information"><header><h2>Team Information</h2></header><div class="school-team-information__body">${schoolMark(school, 'school-team-mark--large')}<div><h3>${esc(schoolDisplayName(school))}</h3>${school.mascotName ? `<strong>${esc(school.mascotName)}</strong>` : ''}${details.length ? `<p>${esc(details.join(' · '))}</p>` : ''}</div><dl><dt>Team Colors</dt>${primary ? `<dd><span style="--team-color:${esc(primary)}"></span><b>Primary</b><code>${esc(primary)}</code></dd>` : ''}${secondary ? `<dd><span style="--team-color:${esc(secondary)}"></span><b>Secondary</b><code>${esc(secondary)}</code></dd>` : ''}${!primary && !secondary ? '<dd class="is-empty">No team colors recorded.</dd>' : ''}</dl></div></section>`;
  }

  function schoolContactListItem(contact) {
    const role = schoolContactRole(contact.role);
    return `<article class="school-contact-list-item"><span class="school-contact-role-icon">${icon(role.icon)}</span><div><p>${esc(role.label)}${role.schoolRequired ? '<b aria-label="Required contact">*</b>' : ''}</p><strong>${esc(contactFullName(contact))}</strong></div><div class="school-contact-list-item__details">${contact.email ? `<span>${esc(contact.email)}</span>` : ''}${contact.phone ? `<small>${esc(contact.phone)}${contact.extension ? ` · Ext. ${esc(contact.extension)}` : ''}</small>` : ''}</div><div><button type="button" data-action="edit-school-contact" data-id="${esc(contact.id)}" aria-label="Edit ${esc(contactFullName(contact))}">${icon('i-edit')}</button><button type="button" data-action="delete-school-contact" data-id="${esc(contact.id)}" aria-label="Delete ${esc(contactFullName(contact))}">${icon('i-trash')}</button></div></article>`;
  }

  function schoolContactForm(school, contact = null) {
    const value = contact ? normalizeSchoolContact(contact) : normalizeSchoolContact({ role: 'head-coach', address1: school.address1 || '', address2: school.address2 || '', city: school.city || '', region: school.region || '', postalCode: school.postalCode || '', country: school.country || '' }, 'head-coach');
    const options = SCHOOL_CONTACT_ROLES.map((role) => `<option value="${role.value}" ${value.role === role.value ? 'selected' : ''}>${esc(role.label)}</option>`).join('');
    return `<section class="school-contact-editor"><header><h2>Contact Details</h2><p>Enter contact information for the selected role.</p></header><form data-form="school-contact"><input type="hidden" name="schoolId" value="${esc(school.id)}"><input type="hidden" name="id" value="${esc(contact?.id || '')}"><div class="school-contact-form-grid"><label class="is-wide"><span>Role <b>*</b></span><select name="role" required>${options}</select></label><label><span>First Name <b>*</b></span><input name="firstName" type="text" value="${esc(value.firstName)}" required></label><label><span>Last Name <b>*</b></span><input name="lastName" type="text" value="${esc(value.lastName)}" required></label><label class="is-wide"><span>Email <b>*</b></span><input name="email" type="email" value="${esc(value.email)}" required></label><label><span>Phone <b>*</b></span><input name="phone" type="tel" value="${esc(value.phone)}" required></label><label><span>Extension</span><input name="extension" type="text" value="${esc(value.extension)}"></label><label><span>Fax</span><input name="fax" type="tel" value="${esc(value.fax)}"></label><div class="school-contact-form-divider"><span>Mailing Address</span></div><label class="is-wide"><span>Address Line 1</span><input name="address1" type="text" value="${esc(value.address1)}"></label><label class="is-wide"><span>Address Line 2</span><input name="address2" type="text" value="${esc(value.address2)}"></label><label><span>City</span><input name="city" type="text" value="${esc(value.city)}"></label><label><span>State / Region</span><input name="region" type="text" value="${esc(value.region)}"></label><label><span>Postal Code</span><input name="postalCode" type="text" value="${esc(value.postalCode)}"></label><label class="is-wide"><span>Country</span><input name="country" type="text" value="${esc(value.country)}"></label><label class="school-contact-apply-all is-wide"><input name="applyAddressToAll" type="checkbox"><span>Use this address for all team contacts</span>${icon('i-info')}</label></div><button class="school-contact-submit" type="submit">${icon('i-plus')}${contact ? 'Update Contact' : 'Add Contact'}</button></form></section>`;
  }

  function schoolSelectionPanel() {
    return `${routeHeader('School / Team Contacts', 'Select an actual school or team before adding its contact records.', `<button class="module-button" type="button" data-action="set-schools-view" data-view="directory">${icon('i-chevron')} Schools & Teams</button>`)}${schoolsTaskNavigation()}<section class="school-selection-panel"><header><p>Step 2</p><h2>Select a School or Team</h2><span>Contact records are stored with the organization you choose.</span></header>${state.schools.length ? `<div>${state.schools.map((school) => `<button type="button" data-action="manage-school-contacts" data-id="${esc(school.id)}">${schoolMark(school)}<span><strong>${esc(schoolDisplayName(school))}</strong><small>${esc([school.type, school.mascotName].filter(Boolean).join(' · '))}</small></span>${icon('i-chevron')}</button>`).join('')}</div>` : `<div class="school-empty-state">${icon('i-school')}<strong>No schools or teams are available.</strong><p>Add an actual school or team before creating contact records.</p><button type="button" data-action="set-schools-view" data-view="directory">Add School / Team</button></div>`}</section>`;
  }

  function schoolProgress(step = 2) {
    const items = [['1', 'Add Teams'], ['2', 'Add Contacts'], ['3', 'Review & Save']];
    return `<ol class="school-contact-progress" aria-label="School setup progress">${items.map(([number, label], index) => `<li class="${step > index + 1 ? 'is-complete' : step === index + 1 ? 'is-current' : ''}"><span>${step > index + 1 ? icon('i-check') : number}</span><b>${label}</b></li>`).join('')}</ol>`;
  }

  function renderSchoolContacts() {
    if (!state.schools.length || !schoolsUi.selectedId) return schoolSelectionPanel();
    const school = selectedSchoolRecord();
    if (!school) { schoolsUi.selectedId = ''; return schoolSelectionPanel(); }
    const contacts = schoolContacts(school);
    const editing = contacts.find((contact) => contact.id === schoolsUi.editingContactId) || null;
    const hasPair = Boolean(schoolsUi.pair?.homeId && schoolsUi.pair?.visitingId);
    return `<section class="school-contacts-page"><header class="school-contacts-page__header"><button type="button" data-action="set-schools-view" data-view="${hasPair ? 'add-teams' : 'directory'}">${icon('i-chevron')}Back to Add School / Team</button><div><h1>Add School / Team Contacts</h1><p>Add contacts for ${esc(schoolDisplayName(school))}.</p></div>${schoolProgress(2)}</header>${schoolsTaskNavigation()}${schoolPairContactSwitcher()}<div class="school-contact-workspace"><div class="school-contact-workspace__main">${schoolTeamInformation(school)}<section class="school-contacts-list"><header><h2>Contacts List</h2><p>Add the primary contacts for this school or team. You can add up to 7 contacts.</p></header><div class="school-contacts-list__head"><span>Role</span><span>Contact</span><span>Contact Information</span><span>Actions</span></div><div class="school-contacts-list__body">${contacts.length ? contacts.map(schoolContactListItem).join('') : `<div class="school-contacts-empty">${icon('i-user')}<strong>No contact records have been added.</strong><p>Use the Contact Details form to add an actual contact.</p></div>`}</div><button class="school-add-contact" type="button" data-action="add-school-contact" ${contacts.length >= 7 ? 'disabled' : ''}>${icon('i-plus')}<span><strong>Add Additional Contact</strong><small>${contacts.length >= 7 ? 'The maximum of 7 contacts has been reached.' : 'Add another saved contact for this school or team.'}</small></span></button>${hasPair ? '<p class="school-required-note">Contacts are optional during this setup step.</p>' : '<p class="school-required-note"><b>*</b> Required contact for school teams</p>'}</section></div>${schoolContactForm(school, editing)}</div><footer class="school-contact-footer"><button type="button" data-action="set-schools-view" data-view="${hasPair ? 'add-teams' : 'directory'}">${icon('i-chevron')}Back: Add Teams</button><span></span><button type="button" data-action="school-save-exit">${icon('i-check')}Save & Exit</button><button class="is-primary" type="button" data-action="review-school-contacts">Next: Review & Save${icon('i-chevron')}</button></footer></section>`;
  }

  function schoolRequiredContactStatus(school, contacts) {
    if (String(school.type || '').toLowerCase() !== 'school') return [];
    return SCHOOL_CONTACT_ROLES.filter((role) => role.schoolRequired && !contacts.some((contact) => contact.role === role.value)).map((role) => role.label);
  }

  function renderSchoolReview() {
    if (schoolsUi.pair?.homeId && schoolsUi.pair?.visitingId) return renderSchoolPairReview();
    const school = selectedSchoolRecord();
    if (!school) return schoolSelectionPanel();
    const contacts = schoolContacts(school);
    const missing = schoolRequiredContactStatus(school, contacts);
    return `<section class="school-review-page"><header class="school-contacts-page__header"><button type="button" data-action="set-schools-view" data-view="contacts">${icon('i-chevron')}Back to Contacts</button><div><h1>Review School / Team</h1><p>Review the actual organization and contact records before leaving this workflow.</p></div>${schoolProgress(3)}</header>${schoolsTaskNavigation()}<div class="school-review-grid"><section>${schoolTeamInformation(school)}<article class="school-review-venue"><header><h2>${icon('i-pin')}Organization & Venue</h2></header><dl>${[['Organization Type', school.type], ['Venue', school.venueName], ['Venue Address', school.venueAddress], ['Venue Phone', school.venuePhone], ['Mailing Address', [school.address1, school.address2, school.city, school.region, school.postalCode, school.country].filter(Boolean).join(', ')]].map(([label, value]) => value ? `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>` : '').join('') || '<div class="is-empty"><dd>No venue or mailing details have been recorded.</dd></div>'}</dl></article></section><section class="school-review-contacts"><header><div><p>Step 3</p><h2>Saved Contacts</h2></div><button type="button" data-action="set-schools-view" data-view="contacts">${icon('i-edit')}Edit Contacts</button></header>${missing.length ? `<div class="school-review-warning">${icon('i-info')}<span><strong>Required contacts are missing.</strong><p>${esc(missing.join(' and '))}${missing.length > 1 ? ' are' : ' is'} required for a school team.</p></span></div>` : ''}<div>${contacts.length ? contacts.map((contact) => { const role = schoolContactRole(contact.role); return `<article>${schoolContactListItem(contact)}<dl>${contact.extension ? `<div><dt>Extension</dt><dd>${esc(contact.extension)}</dd></div>` : ''}${contact.fax ? `<div><dt>Fax</dt><dd>${esc(contact.fax)}</dd></div>` : ''}${[contact.address1, contact.address2, contact.city, contact.region, contact.postalCode, contact.country].some(Boolean) ? `<div><dt>Mailing Address</dt><dd>${esc([contact.address1, contact.address2, contact.city, contact.region, contact.postalCode, contact.country].filter(Boolean).join(', '))}</dd></div>` : ''}</dl></article>`; }).join('') : `<div class="school-contacts-empty">${icon('i-user')}<strong>No contacts have been saved.</strong><p>Return to the contact step to add actual contact records.</p></div>`}</div></section></div><footer class="school-contact-footer"><button type="button" data-action="set-schools-view" data-view="contacts">${icon('i-chevron')}Back: Add Contacts</button><span></span><button class="is-primary" type="button" data-action="school-save-exit" ${missing.length ? 'disabled' : ''}>${icon('i-check')}Save & Exit</button></footer></section>`;
  }

  function renderSchools() {
    if (schoolsUi.section === 'add-teams') return renderAddSchoolTeamPair();
    if (schoolsUi.section === 'contacts') return renderSchoolContacts();
    if (schoolsUi.section === 'review') return renderSchoolReview();
    return renderSchoolDirectory();
  }

  function fileItem(file) { return `<article class="module-list__item"><div><h3>${esc(file.name)}</h3><p>${esc(file.type || 'File')} · ${formatBytes(file.size)}</p><small>${fmtDateTime(file.createdAt)}</small></div><div class="item-actions"><button type="button" data-action="download-file" data-id="${file.id}" aria-label="Download file">${icon('i-download')}</button><button type="button" data-action="delete-file" data-id="${file.id}" aria-label="Delete file">${icon('i-trash')}</button></div></article>`; }
  function formatBytes(bytes) { if (!bytes) return '0 B'; const units = ['B','KB','MB','GB']; const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1); return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`; }

  function renderPayments() {
    const total = state.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const paid = state.payments.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return `${routeHeader('Payments', 'Record actual earnings, payment status, methods, and related assignment details.', actionButton('Export CSV','export-payments','', 'i-download'))}<div class="home-metrics compact"><article><strong>${money(total)}</strong><p>Total Recorded</p></article><article><strong>${money(paid)}</strong><p>Paid</p></article><article><strong>${money(total-paid)}</strong><p>Outstanding</p></article></div>
      <div class="module-grid"><section class="module-card module-card--wide"><h2>${icon('i-card')}Payment Records</h2><div class="module-list">${state.payments.length ? state.payments.map((p) => `<article class="module-list__item"><div><h3>${esc(p.payer)}</h3><p>${fmtDate(p.date)}${p.assignment ? ` · ${esc(p.assignment)}` : ''}</p><small>${esc([p.method,p.notes].filter(Boolean).join(' · '))}</small></div><div class="item-actions"><strong>${money(p.amount)}</strong><span class="status-pill">${esc(p.status)}</span><button type="button" data-action="edit-payment" data-id="${p.id}" aria-label="Edit payment">${icon('i-edit')}</button><button type="button" data-action="delete-payment" data-id="${p.id}" aria-label="Delete payment">${icon('i-trash')}</button></div></article>`).join('') : emptyMessage('No payment records', 'Add a payment record to begin tracking earnings.')}</div></section>
      <aside class="module-card"><h2>${icon('i-plus')}Add or Update Payment</h2><form class="module-form stacked-form" data-form="payment"><input type="hidden" name="id">${field('Date','date','date','',true)}${field('Payer','payer','text','',true)}${field('Assignment','assignment')}${field('Amount','amount','number','',true)}${field('Method','method')}${field('Status','status','select','',true,[option('Pending','Pending'),option('Paid',''),option('Canceled','')].join(''))}${field('Notes','notes','textarea')}<div class="form-actions"><button class="module-button module-button--primary" type="submit">Save Payment</button><button class="module-button module-button--quiet" type="reset">Clear</button></div></form></aside></div>`;
  }

  async function renderTaxCenter() {
    const files = await dbListFiles('tax');
    const t = state.taxProfile;
    return `${routeHeader('Tax Center', 'Maintain your tax profile and store actual tax documents locally in this browser.')}
      <div class="module-grid"><section class="module-card module-card--half"><h2>${icon('i-tax')}Tax Profile</h2><form class="module-form" data-form="tax-profile">${field('Legal Name','legalName','text',t.legalName,true)}${field('Business Name','businessName','text',t.businessName)}${field('Tax Classification','taxClassification','select',t.taxClassification,false,[option('','', 'Select classification'),option('Individual',t.taxClassification),option('Sole Proprietor',t.taxClassification),option('LLC',t.taxClassification),option('Corporation',t.taxClassification),option('Other',t.taxClassification)].join(''))}${field('Mailing Address','mailingAddress','text',t.mailingAddress)}${field('City','city','text',t.city)}${field('State / Province','region','text',t.region)}${field('Postal Code','postalCode','text',t.postalCode)}<label class="check-field is-full"><input name="electronicDelivery" type="checkbox" ${t.electronicDelivery ? 'checked' : ''}><span>Use electronic document delivery</span></label><button class="module-button module-button--primary" type="submit">Save Tax Profile</button></form></section>
      <section class="module-card module-card--half"><h2>${icon('i-file')}Tax Documents</h2><div class="module-list">${files.length ? files.map(fileItem).join('') : emptyMessage('No tax documents', 'Upload your W-9, 1099, or other tax document.')}</div><form class="module-form stacked-form file-form" data-form="file-upload" data-category="tax"><label class="is-full"><span>Select Tax Document</span><input name="file" type="file" required></label><button class="module-button module-button--primary" type="submit">Upload Tax Document</button></form></section></div>`;
  }

  function formsSectionNavigation() {
    return `<nav class="forms-section-navigation" aria-label="Forms tools">
      <button type="button" data-action="set-forms-view" data-view="records" class="${formsUi.section === 'records' ? 'is-active' : ''}">${icon('i-form')}Form Records</button>
      <button type="button" data-action="set-forms-view" data-view="invoice" class="${formsUi.section === 'invoice' ? 'is-active' : ''}">${icon('i-card')}RTBO Invoice Generator</button>
      <button type="button" data-action="set-forms-view" data-view="contract" class="${formsUi.section === 'contract' ? 'is-active' : ''}">${icon('i-file')}Contract Generator</button>
    </nav>`;
  }

  function renderForms() {
    if (formsUi.section === 'invoice') {
      return `${routeHeader('RTBO Invoice Generator', 'Create, calculate, save, print, download, and manage invoices from the dashboard Forms section.', `<button class="module-button" type="button" data-action="set-forms-view" data-view="records">${icon('i-chevron')} Form Records</button>`)}
        ${formsSectionNavigation()}
        <section class="form-tool-integration" aria-label="Raising The Bar Officiating invoice generator">
          <iframe src="forms/invoice-generator/index.html?embed=1" title="RTBO Invoice Generator" data-invoice-generator-frame></iframe>
        </section>`;
    }
    if (formsUi.section === 'contract') {
      return `${routeHeader('Contract Generator', 'Create, review, save, print, and download contracts from actual dashboard profile, school, user, and official records.', `<button class="module-button" type="button" data-action="set-forms-view" data-view="records">${icon('i-chevron')} Form Records</button>`)}
        ${formsSectionNavigation()}
        <section class="form-tool-integration form-tool-integration--contract" aria-label="Got U Nex Ref contract generator">
          <iframe src="forms/contract-generator/index.html?embed=1" title="Got U Nex Ref Contract Generator" data-contract-generator-frame scrolling="yes"></iframe>
        </section>`;
    }
    return `${routeHeader('Forms', 'Create, complete, and track forms that are actually required for your work.', `<div class="module-hero-button-group"><button class="module-button" type="button" data-action="set-forms-view" data-view="contract">${icon('i-file')} Open Contract Generator</button><button class="module-button module-button--primary" type="button" data-action="set-forms-view" data-view="invoice">${icon('i-card')} Open Invoice Generator</button></div>`)}
      ${formsSectionNavigation()}
      <div class="forms-tool-grid">
        <div class="forms-tool-card" role="group" aria-label="Invoice generator">
          <img src="forms/invoice-generator/assets/rtbo-logo.png" alt="Raising The Bar Officiating">
          <div><p>Financial Form</p><h2>RTBO Invoice Generator</h2><span>Create invoices from actual dashboard profile and school records. Invoice records remain saved in this browser until a production backend is connected.</span></div>
          <button class="module-button module-button--primary" type="button" data-action="set-forms-view" data-view="invoice">Open Invoice Generator</button>
        </div>
        <div class="forms-tool-card" role="group" aria-label="Contract generator">
          <img src="assets/rtbo-logo.webp" alt="Raising The Bar Officiating">
          <div><p>Agreement Form</p><h2>Contract Generator</h2><span>Create contracts from actual dashboard profile, school, organization, official, and user records. Contract records remain saved in this browser until a production backend is connected.</span></div>
          <button class="module-button module-button--primary" type="button" data-action="set-forms-view" data-view="contract">Open Contract Generator</button>
        </div>
      </div>
      <div class="module-grid"><section class="module-card module-card--wide"><h2>${icon('i-form')}Saved Forms</h2><div class="module-list">${state.forms.length ? state.forms.map((f) => `<article class="module-list__item"><div><h3>${esc(f.title)}</h3><p>${f.dueDate ? `Due ${fmtDate(f.dueDate)} · ` : ''}${esc(f.status)}</p><small>${esc(f.response || '')}</small></div><div class="item-actions"><button type="button" data-action="edit-form-record" data-id="${f.id}" aria-label="Edit form">${icon('i-edit')}</button><button type="button" data-action="delete-form-record" data-id="${f.id}" aria-label="Delete form">${icon('i-trash')}</button></div></article>`).join('') : emptyMessage('No forms', 'Create a form record and save the information you need to track.')}</div></section>
      <aside class="module-card"><h2>${icon('i-plus')}Add or Update Form</h2><form class="module-form stacked-form" data-form="form-record"><input type="hidden" name="id">${field('Form Title','title','text','',true)}${field('Due Date','dueDate','date')}${field('Status','status','select','',true,[option('Not Started','Not Started'),option('In Progress',''),option('Complete','')].join(''))}${field('Response or Notes','response','textarea')}<div class="form-actions"><button class="module-button module-button--primary" type="submit">Save Form</button><button class="module-button module-button--quiet" type="reset">Clear</button></div></form></aside></div>`;
  }

  function formsDashboardPayload() {
    return {
      profile: { ...state.profile },
      taxProfile: { ...state.taxProfile },
      schools: (state.schools || []).map((school) => ({ ...school })),
      users: (state.users || []).map((user) => ({ ...user })),
      officials: (state.officials || []).map((official) => ({ ...official }))
    };
  }

  function sendFormsDashboardContext(targetWindow) {
    if (!targetWindow) return;
    targetWindow.postMessage({ type: 'gunr-dashboard-context', payload: formsDashboardPayload() }, '*');
  }

  function hydrateFormsTools() {
    const frames = moduleView.querySelectorAll('[data-invoice-generator-frame], [data-contract-generator-frame]');
    frames.forEach((frame) => {
      frame.addEventListener('load', () => sendFormsDashboardContext(frame.contentWindow), { once: true });
      try { sendFormsDashboardContext(frame.contentWindow); } catch {}
    });
  }

  async function renderResources() {
    const files = await dbListFiles('resources');
    return `${routeHeader('Resources', 'Save actual links and files for mechanics, rules, policies, travel, or platform support.')}
      <div class="module-grid"><section class="module-card module-card--wide"><h2>${icon('i-book')}Resource Library</h2><div class="module-list">${state.resources.length || files.length ? `${state.resources.map((r) => `<article class="module-list__item"><div><h3>${esc(r.title)}</h3><p>${esc(r.description || '')}</p><small>${esc(r.url)}</small></div><div class="item-actions"><a class="icon-link" href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener" aria-label="Open resource">${icon('i-chevron')}</a><button type="button" data-action="edit-resource" data-id="${r.id}" aria-label="Edit resource">${icon('i-edit')}</button><button type="button" data-action="delete-resource" data-id="${r.id}" aria-label="Delete resource">${icon('i-trash')}</button></div></article>`).join('')}${files.map(fileItem).join('')}` : emptyMessage('No resources', 'Add a link or upload a resource file.')}</div></section>
      <aside class="module-card"><h2>${icon('i-plus')}Add Resource Link</h2><form class="module-form stacked-form" data-form="resource"><input type="hidden" name="id">${field('Title','title','text','',true)}${field('URL','url','url','',true)}${field('Description','description','textarea')}<div class="form-actions"><button class="module-button module-button--primary" type="submit">Save Link</button><button class="module-button module-button--quiet" type="reset">Clear</button></div></form><hr class="card-divider"><h2>${icon('i-upload')}Upload Resource File</h2><form class="module-form stacked-form" data-form="file-upload" data-category="resources"><label class="is-full"><span>Select Resource File</span><input name="file" type="file" required></label><button class="module-button module-button--primary" type="submit">Upload File</button></form></aside></div>`;
  }

  function renderShop() {
    const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    return `${routeHeader('Shop', 'Use actual product records only. Add products to the local catalog, then test the cart workflow.', `<button class="module-button" type="button" data-action="view-cart">Cart (${cartCount})</button>`)}
      <div class="module-grid"><section class="module-card module-card--wide"><h2>${icon('i-shop')}Product Catalog</h2><div class="product-grid">${state.products.length ? state.products.map((p) => `<article class="product-card"><div class="product-card__media">${safeUrl(p.imageUrl) ? `<img src="${esc(safeUrl(p.imageUrl))}" alt="">` : icon('i-shop')}</div><h3>${esc(p.name)}</h3><p>${esc(p.description || '')}</p><strong>${money(p.price)}</strong><div class="form-actions"><button class="module-button module-button--primary" type="button" data-action="add-to-cart" data-id="${p.id}">Add to Cart</button><button class="icon-button" type="button" data-action="edit-product" data-id="${p.id}" aria-label="Edit product">${icon('i-edit')}</button><button class="icon-button" type="button" data-action="delete-product" data-id="${p.id}" aria-label="Delete product">${icon('i-trash')}</button></div></article>`).join('') : emptyMessage('No products', 'Add actual products before using the cart.')}</div></section>
      <aside class="module-card"><h2>${icon('i-plus')}Add or Update Product</h2><form class="module-form stacked-form" data-form="product"><input type="hidden" name="id">${field('Product Name','name','text','',true)}${field('Price','price','number','',true)}${field('Image URL','imageUrl','url')}${field('Description','description','textarea')}<div class="form-actions"><button class="module-button module-button--primary" type="submit">Save Product</button><button class="module-button module-button--quiet" type="reset">Clear</button></div></form><div class="cart-summary"><h2>Cart</h2>${renderCart()}</div></aside></div>`;
  }

  function renderCart() {
    if (!state.cart.length) return emptyMessage('Cart is empty', 'Add a product to the cart.');
    return `<div class="module-list">${state.cart.map((item) => { const p = state.products.find((x) => x.id === item.productId); if (!p) return ''; return `<article class="module-list__item"><div><h3>${esc(p.name)}</h3><p>${item.quantity} × ${money(p.price)}</p></div><button type="button" data-action="remove-cart" data-id="${p.id}" aria-label="Remove from cart">${icon('i-trash')}</button></article>`; }).join('')}</div><p class="cart-total"><strong>Total</strong><span>${money(state.cart.reduce((sum, item) => { const p = state.products.find((x) => x.id === item.productId); return sum + (p ? Number(p.price) * item.quantity : 0); }, 0))}</span></p><button class="module-button module-button--primary" type="button" data-action="checkout">Create Order Summary</button>`;
  }

  function messageCurrentUserName() {
    return [state.profile?.firstName, state.profile?.lastName].filter(Boolean).join(' ').trim() || 'You';
  }

  function messageCategoryForRole(role = '', source = '') {
    const value = String(role || '').toLowerCase();
    if (source === 'school' || /school|coach|athletic director/.test(value)) return 'schools';
    if (/assignor|admin|director|super/.test(value)) return 'admin';
    if (/official|referee|umpire/.test(value)) return 'crew';
    return 'direct';
  }

  function messageContactRecords() {
    const records = [];
    const seen = new Set();
    const profileEmail = String(state.profile?.email || '').trim().toLowerCase();
    const add = (record) => {
      const name = String(record.name || '').trim();
      if (!record.key || !name || seen.has(record.key)) return;
      if (profileEmail && String(record.email || '').trim().toLowerCase() === profileEmail) return;
      seen.add(record.key);
      records.push({
        key: record.key,
        source: record.source || '',
        sourceId: record.sourceId || '',
        name,
        email: String(record.email || '').trim(),
        phone: String(record.phone || '').trim(),
        role: String(record.role || '').trim(),
        organization: String(record.organization || '').trim(),
        category: record.category || messageCategoryForRole(record.role, record.source),
        photoId: record.photoId || '',
        imageUrl: safeUrl(record.imageUrl || ''),
        videoUrl: safeUrl(record.videoUrl || ''),
        online: record.online === true
      });
    };

    (state.users || []).filter((user) => user.recordStatus !== 'Draft' && user.active !== false).forEach((user) => add({
      key: `user:${user.id}`,
      source: 'user',
      sourceId: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.username || user.email,
      email: user.email,
      phone: user.mobilePhone || user.alternatePhone,
      role: userRoleLabel(user.role) || user.positionTitle,
      organization: user.organizationName || user.schoolTeam,
      photoId: user.photoId,
      videoUrl: user.videoUrl || user.meetingUrl,
      online: user.online === true
    }));

    (state.officials || []).forEach((official) => add({
      key: `official:${official.id}`,
      source: 'official',
      sourceId: official.id,
      name: [official.firstName, official.lastName].filter(Boolean).join(' ').trim() || official.email,
      email: official.email,
      phone: official.phone || official.mobilePhone,
      role: official.officialType || official.position || 'Official',
      organization: official.organization || official.school,
      photoId: official.photoId,
      imageUrl: official.photoUrl,
      videoUrl: official.videoUrl || official.meetingUrl,
      online: official.online === true
    }));

    (state.schools || []).forEach((school) => {
      const schoolName = school.name || school.organization || school.schoolName;
      add({
        key: `school:${school.id}`,
        source: 'school',
        sourceId: school.id,
        name: schoolName,
        email: school.email || school.contactEmail || school.athleticDirectorEmail || school.coachEmail,
        phone: school.phone || school.contactPhone || school.athleticDirectorPhone || school.coachPhone,
        role: 'School',
        organization: schoolName,
        category: 'schools',
        imageUrl: school.logoUrl || school.logo || school.imageUrl,
        videoUrl: school.videoUrl || school.meetingUrl,
        online: school.online === true
      });
    });

    return records.sort((a, b) => a.name.localeCompare(b.name));
  }

  function messageContactByKey(key = '') {
    return messageContactRecords().find((contact) => contact.key === key) || null;
  }

  function normalizeConversation(record = {}) {
    const linked = messageContactByKey(record.contactKey || '');
    const messages = Array.isArray(record.messages) ? record.messages.map((message) => ({
      id: message.id || uid('message'),
      body: String(message.body || '').trim(),
      at: message.at || message.createdAt || record.updatedAt || record.createdAt || new Date().toISOString(),
      direction: message.direction === 'incoming' || message.sender === 'them' || message.incoming === true ? 'incoming' : 'outgoing',
      read: message.read !== false,
      attachmentId: message.attachmentId || '',
      attachmentName: message.attachmentName || '',
      attachmentType: message.attachmentType || '',
      attachmentSize: Number(message.attachmentSize || 0) || 0
    })) : [];
    const latest = messages.reduce((value, item) => !value || item.at > value ? item.at : value, record.updatedAt || record.createdAt || '');
    const unreadFromMessages = messages.filter((message) => message.direction === 'incoming' && message.read === false).length;
    return {
      ...record,
      id: record.id || uid('conversation'),
      contactKey: record.contactKey || '',
      name: linked?.name || String(record.name || '').trim(),
      email: linked?.email || String(record.email || '').trim(),
      phone: linked?.phone || String(record.phone || '').trim(),
      role: linked?.role || String(record.role || '').trim(),
      organization: linked?.organization || String(record.organization || '').trim(),
      category: record.category || linked?.category || messageCategoryForRole(record.role, record.source),
      photoId: linked?.photoId || record.photoId || '',
      imageUrl: linked?.imageUrl || safeUrl(record.imageUrl || ''),
      videoUrl: linked?.videoUrl || safeUrl(record.videoUrl || ''),
      online: linked ? linked.online : record.online === true,
      subject: String(record.subject || '').trim(),
      relatedGameId: record.relatedGameId || '',
      archived: record.archived === true,
      unreadCount: Math.max(Number(record.unreadCount || 0) || 0, unreadFromMessages),
      messages,
      updatedAt: latest || new Date(0).toISOString()
    };
  }

  function messageInitials(name = '') {
    return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'M';
  }

  function messageAvatarMarkup(record, extraClass = '') {
    const imageUrl = safeUrl(record.imageUrl || '');
    const photoId = record.photoId || '';
    return `<span class="messages-avatar ${extraClass}" ${photoId ? `data-message-avatar-id="${esc(photoId)}"` : ''}>${imageUrl ? `<img src="${esc(imageUrl)}" alt="">` : `<span>${esc(messageInitials(record.name))}</span>`}</span>`;
  }

  function messageDateLabel(value = '') {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    if (sameDay) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    if (date.getFullYear() === now.getFullYear()) return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function messageCategoryLabel(value = '') {
    return ({ assignments: 'Assignments', crew: 'Crew Chat', admin: 'Admin', schools: 'Schools', direct: 'Direct' })[value] || 'Direct';
  }

  function messageLastActivity(conversation) {
    const message = conversation.messages[conversation.messages.length - 1];
    if (!message) return conversation.subject || 'Conversation created';
    if (message.body) return message.body;
    if (message.attachmentName) return message.attachmentName;
    return 'Attachment';
  }

  function filteredMessageConversations() {
    const query = messagesUi.query.trim().toLowerCase();
    const records = (state.conversations || []).map(normalizeConversation).filter((conversation) => {
      if (!messagesUi.showArchived && conversation.archived) return false;
      if (messagesUi.tab === 'unread' && !conversation.unreadCount) return false;
      if (['assignments', 'crew', 'admin', 'schools'].includes(messagesUi.tab) && conversation.category !== messagesUi.tab) return false;
      if (messagesUi.onlyAttachments && !conversation.messages.some((message) => message.attachmentId)) return false;
      if (query) {
        const haystack = [conversation.name, conversation.email, conversation.role, conversation.organization, conversation.subject, ...conversation.messages.map((message) => message.body)].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    records.sort((a, b) => messagesUi.sort === 'oldest' ? a.updatedAt.localeCompare(b.updatedAt) : b.updatedAt.localeCompare(a.updatedAt));
    return records;
  }

  function messageTabCount(tab) {
    const records = (state.conversations || []).map(normalizeConversation).filter((conversation) => !conversation.archived);
    if (tab === 'all') return records.length;
    if (tab === 'unread') return records.filter((conversation) => conversation.unreadCount).length;
    return records.filter((conversation) => conversation.category === tab).length;
  }

  function messageConversationItem(conversation) {
    const selected = conversation.id === activeConversationId;
    return `<button class="messages-list-item ${selected ? 'is-selected' : ''} ${conversation.unreadCount ? 'is-unread' : ''}" type="button" data-action="open-conversation" data-id="${esc(conversation.id)}">
      ${messageAvatarMarkup(conversation)}
      <span class="messages-list-item__copy"><span><strong>${esc(conversation.name || conversation.email || 'Unnamed contact')}</strong>${conversation.role ? `<em>${esc(conversation.role)}</em>` : ''}</span><b>${esc(conversation.subject || messageCategoryLabel(conversation.category))}</b><small>${esc(messageLastActivity(conversation))}</small></span>
      <span class="messages-list-item__meta"><time>${esc(messageDateLabel(conversation.updatedAt))}</time>${conversation.unreadCount ? `<i>${conversation.unreadCount}</i>` : ''}</span>
    </button>`;
  }

  function messageAttachmentMarkup(message) {
    if (!message.attachmentId) return '';
    const size = message.attachmentSize ? ` · ${Math.max(1, Math.round(message.attachmentSize / 1024))} KB` : '';
    return `<button class="message-attachment" type="button" data-action="download-message-attachment" data-id="${esc(message.attachmentId)}">${icon('i-download')}<span><strong>${esc(message.attachmentName || 'Attachment')}</strong><small>${esc((message.attachmentType || 'File') + size)}</small></span></button>`;
  }

  function messageBubbleMarkup(message, conversation) {
    const outgoing = message.direction !== 'incoming';
    const speaker = outgoing ? messageCurrentUserName() : conversation.name;
    const avatar = outgoing
      ? messageAvatarMarkup({ name: messageCurrentUserName(), photoId: state.profile?.profilePhotoId || '' }, 'messages-avatar--small')
      : messageAvatarMarkup(conversation, 'messages-avatar--small');
    return `<article class="message-chat-row ${outgoing ? 'is-outgoing' : 'is-incoming'}">
      ${outgoing ? '' : avatar}
      <div class="message-chat-bubble"><header><strong>${esc(speaker)}${outgoing ? ' (You)' : ''}</strong><time>${esc(messageDateLabel(message.at))}</time></header>${message.body ? `<p>${esc(message.body)}</p>` : ''}${messageAttachmentMarkup(message)}</div>
      ${outgoing ? avatar : ''}
    </article>`;
  }

  function messageContactOptions() {
    const contacts = messageContactRecords();
    if (!contacts.length) return '<option value="">No saved recipients are available</option>';
    return `<option value="">Select a saved recipient</option>${contacts.map((contact) => `<option value="${esc(contact.key)}">${esc(contact.name)}${contact.role ? ` — ${esc(contact.role)}` : ''}${contact.organization && contact.organization !== contact.name ? ` — ${esc(contact.organization)}` : ''}</option>`).join('')}`;
  }

  function messageGameOptions() {
    const games = (state.masterGames || []).map(normalizeMasterGame).filter((game) => game.id).sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));
    return `<option value="">No related game</option>${games.map((game) => `<option value="${esc(game.id)}">${esc([game.date ? fmtDate(game.date) : '', [game.homeTeam, game.awayTeam].filter(Boolean).join(' vs ')].filter(Boolean).join(' — '))}</option>`).join('')}`;
  }

  function messageNewDialog() {
    const contacts = messageContactRecords();
    return `<dialog class="messages-dialog" data-new-message-dialog aria-labelledby="new-message-title"><form data-form="conversation">
      <header><div><p>Messaging</p><h2 id="new-message-title">New Message</h2></div><button type="button" data-action="close-new-message-dialog" aria-label="Close new message form">${icon('i-close')}</button></header>
      <div class="messages-dialog__body">
        ${contacts.length ? '' : `<div class="messages-dialog__notice">${icon('i-user')}<p>Add actual users, officials, or schools before starting a conversation.</p><a href="#users" data-route="users">Open Users</a></div>`}
        <label><span>Recipient</span><select name="contactKey" ${contacts.length ? 'required' : 'disabled'}>${messageContactOptions()}</select></label>
        <div class="messages-dialog__grid"><label><span>Conversation Type</span><select name="category"><option value="">Use recipient type</option><option value="assignments">Assignments</option><option value="crew">Crew Chat</option><option value="admin">Admin</option><option value="schools">Schools</option><option value="direct">Direct</option></select></label><label><span>Related Game</span><select name="relatedGameId">${messageGameOptions()}</select></label></div>
        <label><span>Subject</span><input name="subject" type="text"></label>
        <label><span>Message</span><textarea name="body" rows="6" required></textarea></label>
        <label class="messages-file-field"><span>Attachment</span><input name="attachment" type="file" data-message-attachment><small data-message-file-name>No file selected</small></label>
      </div>
      <footer><button type="button" data-action="close-new-message-dialog">Cancel</button><button class="is-primary" type="submit" ${contacts.length ? '' : 'disabled'}>${icon('i-send')}Send Message</button></footer>
    </form></dialog>`;
  }

  function messageConversationInfo(conversation) {
    if (!conversation) return '';
    const related = conversation.relatedGameId ? (state.masterGames || []).map(normalizeMasterGame).find((game) => game.id === conversation.relatedGameId) : null;
    return `<aside class="message-info-panel" data-message-info-panel hidden><header><h2>Conversation Details</h2><button type="button" data-action="toggle-message-info" aria-label="Close conversation details">${icon('i-close')}</button></header>
      <div class="message-info-contact">${messageAvatarMarkup(conversation, 'messages-avatar--large')}<strong>${esc(conversation.name || conversation.email)}</strong>${conversation.role ? `<span>${esc(conversation.role)}</span>` : ''}${conversation.organization ? `<small>${esc(conversation.organization)}</small>` : ''}</div>
      <dl>${conversation.email ? `<div><dt>Email</dt><dd><a href="mailto:${esc(conversation.email)}">${esc(conversation.email)}</a></dd></div>` : ''}${conversation.phone ? `<div><dt>Phone</dt><dd><a href="tel:${esc(conversation.phone)}">${esc(conversation.phone)}</a></dd></div>` : ''}<div><dt>Conversation</dt><dd>${esc(messageCategoryLabel(conversation.category))}</dd></div>${conversation.subject ? `<div><dt>Subject</dt><dd>${esc(conversation.subject)}</dd></div>` : ''}${related ? `<div><dt>Related Game</dt><dd>${esc([related.date ? fmtDate(related.date) : '', [related.homeTeam, related.awayTeam].filter(Boolean).join(' vs ')].filter(Boolean).join(' — '))}</dd></div>` : ''}</dl>
      <div class="message-info-actions"><button type="button" data-action="mark-conversation-unread" data-id="${esc(conversation.id)}">${icon('i-mail')}Mark Unread</button><button type="button" data-action="export-conversation" data-id="${esc(conversation.id)}">${icon('i-download')}Export Conversation</button><button type="button" data-action="archive-conversation" data-id="${esc(conversation.id)}">${icon('i-file')}${conversation.archived ? 'Restore Conversation' : 'Archive Conversation'}</button><button class="is-danger" type="button" data-action="delete-conversation" data-id="${esc(conversation.id)}">${icon('i-trash')}Delete Conversation</button></div>
      <form class="message-incoming-form" data-form="incoming-message"><h3>Record Received Message</h3><p>Use this only for a message that was actually received outside this standalone dashboard.</p><textarea name="body" rows="4" required></textarea><button type="submit">Save Received Message</button></form>
    </aside>`;
  }

  function renderMessages() {
    const visible = filteredMessageConversations();
    if (!activeConversationId || !visible.some((item) => item.id === activeConversationId)) activeConversationId = visible[0]?.id || null;
    const activeRecord = activeConversationId ? (state.conversations || []).find((item) => item.id === activeConversationId) : null;
    const active = activeRecord ? normalizeConversation(activeRecord) : null;
    const quickReplies = active ? [...new Set(active.messages.filter((message) => message.direction === 'outgoing' && message.body).map((message) => message.body))].slice(-5).reverse() : [];
    const tabs = [['all','All'],['unread','Unread'],['assignments','Assignments'],['crew','Crew Chat'],['admin','Admin'],['schools','Schools']];
    return `<section class="messages-page">
      <header class="messages-page__header"><div>${icon('i-chat')}<span><h1>Messaging — Inbox</h1><p>Communicate with your crews, assignors, and schools.</p></span></div><button type="button" data-action="open-new-message-dialog">${icon('i-edit')}New Message</button></header>
      <div class="messages-workspace">
        <aside class="messages-inbox-panel">
          <div class="messages-search-row"><label>${icon('i-search')}<span class="sr-only">Search messages</span><input type="search" value="${esc(messagesUi.query)}" data-message-search aria-label="Search messages"></label><button type="button" data-action="toggle-message-filters" aria-expanded="${messagesUi.filtersOpen}">${icon('i-filter')}<span class="sr-only">Message filters</span></button></div>
          <div class="messages-filter-panel" ${messagesUi.filtersOpen ? '' : 'hidden'}><label><span>Sort</span><select data-message-filter="sort"><option value="newest" ${messagesUi.sort === 'newest' ? 'selected' : ''}>Newest activity</option><option value="oldest" ${messagesUi.sort === 'oldest' ? 'selected' : ''}>Oldest activity</option></select></label><label class="messages-filter-check"><input type="checkbox" data-message-filter="onlyAttachments" ${messagesUi.onlyAttachments ? 'checked' : ''}><span>Has attachments</span></label><label class="messages-filter-check"><input type="checkbox" data-message-filter="showArchived" ${messagesUi.showArchived ? 'checked' : ''}><span>Show archived</span></label><button type="button" data-action="clear-message-filters">Clear</button></div>
          <nav class="messages-tabs" aria-label="Conversation filters">${tabs.map(([value,label]) => `<button type="button" data-action="set-message-tab" data-tab="${value}" class="${messagesUi.tab === value ? 'is-active' : ''}">${esc(label)}${messageTabCount(value) ? `<b>${messageTabCount(value)}</b>` : ''}</button>`).join('')}</nav>
          <div class="messages-list" role="list">${visible.length ? visible.map(messageConversationItem).join('') : `<div class="messages-empty-list">${icon('i-mail')}<strong>No conversations match this view.</strong><p>Start a new message with a saved user, official, or school.</p></div>`}</div>
        </aside>
        <section class="messages-thread-panel">
          ${active ? `<header class="messages-thread-header"><div>${messageAvatarMarkup(active, 'messages-avatar--header')}<span><h2>${esc(active.name || active.email || 'Conversation')}</h2>${active.online ? '<small><i></i>Online</small>' : `<small>${esc(active.organization || active.email || messageCategoryLabel(active.category))}</small>`}<em>${active.role ? `<b>${esc(active.role)}</b>` : ''}<b>${esc(messageCategoryLabel(active.category))}</b></em></span></div><nav>${active.phone ? `<a href="tel:${esc(active.phone)}" aria-label="Call ${esc(active.name)}">${icon('i-phone')}</a>` : ''}${active.email ? `<a href="mailto:${esc(active.email)}" aria-label="Email ${esc(active.name)}">${icon('i-mail')}</a>` : ''}${active.videoUrl ? `<a href="${esc(active.videoUrl)}" target="_blank" rel="noopener" aria-label="Open video meeting with ${esc(active.name)}">${icon('i-video')}</a>` : ''}<button type="button" data-action="toggle-message-info" aria-label="Conversation details">${icon('i-info')}</button></nav></header>
          <div class="messages-thread-scroll" data-message-thread-scroll>${active.messages.length ? active.messages.map((message) => messageBubbleMarkup(message, active)).join('') : `<div class="messages-thread-empty">${icon('i-chat')}<strong>No messages have been recorded.</strong><p>Send the first message or record an actual received message from the details panel.</p></div>`}</div>
          <form class="messages-composer" data-form="message"><label><span class="sr-only">Message</span><textarea name="body" rows="3" aria-label="Message"></textarea></label><div class="messages-composer__footer"><div><label class="messages-tool-button">${icon('i-paperclip')}<span>Attach</span><input name="attachment" type="file" data-message-attachment></label><button class="messages-tool-button" type="button" data-action="toggle-message-emoji">${icon('i-smile')}<span>Emoji</span></button><button class="messages-tool-button" type="button" data-action="toggle-message-quick-replies" ${quickReplies.length ? '' : 'disabled'}>${icon('i-bolt')}<span>Quick Reply</span></button><small data-message-file-name></small></div><button class="messages-send-button" type="submit">${icon('i-send')}Send</button></div><div class="messages-emoji-panel" data-message-emoji-panel hidden>${['👍','✅','🏀','👏','🙌'].map((emoji) => `<button type="button" data-action="insert-message-emoji" data-value="${esc(emoji)}">${esc(emoji)}</button>`).join('')}</div><div class="messages-quick-replies" data-message-quick-replies hidden>${quickReplies.map((reply) => `<button type="button" data-action="use-message-quick-reply" data-value="${esc(reply)}">${esc(reply)}</button>`).join('')}</div></form>
          ${messageConversationInfo(active)}` : `<div class="messages-no-thread">${icon('i-chat')}<strong>Select a conversation</strong><p>Choose a conversation from the inbox or start a new message.</p><button type="button" data-action="open-new-message-dialog">New Message</button></div>`}
        </section>
      </div>
      ${messageNewDialog()}
    </section>`;
  }

  async function hydrateMessageMedia() {
    const nodes = [...moduleView.querySelectorAll('[data-message-avatar-id]')];
    await Promise.all(nodes.map(async (node) => {
      const record = await dbGetFile(node.dataset.messageAvatarId);
      if (!record?.blob || node.querySelector('img')) return;
      const url = URL.createObjectURL(record.blob);
      const img = document.createElement('img');
      img.alt = '';
      img.src = url;
      img.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
      node.replaceChildren(img);
    }));
    const scroller = moduleView.querySelector('[data-message-thread-scroll]');
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }

  function userRoleLabel(value) {
    return USER_ROLES.find((role) => role.value === value)?.label || '';
  }

  function userInitials(record = {}) {
    return [record.firstName, record.lastName].filter(Boolean).map((part) => part.trim().charAt(0).toUpperCase()).join('').slice(0, 2) || 'U';
  }

  function selectedPermissions(form) {
    return [...form.querySelectorAll('input[name="permissions"]:checked')].map((input) => input.value);
  }

  function permissionLabels(values = []) {
    const selected = new Set(values);
    return USER_PERMISSIONS.filter(([value]) => selected.has(value)).map(([, label]) => label);
  }

  function userOrganizationOptions(selected = '') {
    const names = [...new Set(state.schools.map((item) => item.name || item.organization || item.schoolName).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return `<option value="">Choose a saved organization</option>${names.map((name) => option(name, selected)).join('')}`;
  }

  function userRoleButtons(selected = '') {
    return USER_ROLES.map((role) => `<label class="user-role-chip ${selected === role.value ? 'is-selected' : ''}"><input type="radio" name="role" value="${role.value}" ${selected === role.value ? 'checked' : ''}><span>${icon(role.value === 'official' ? 'i-user' : role.value === 'school-admin' || role.value === 'athletic-director' ? 'i-school' : role.value === 'coach' ? 'i-star' : role.value === 'vendor' ? 'i-shop' : 'i-settings')}${esc(role.label)}</span></label>`).join('');
  }

  function userPermissionControls(selected = []) {
    const chosen = new Set(selected);
    return USER_PERMISSIONS.map(([value, label]) => `<label class="user-permission-item"><input type="checkbox" name="permissions" value="${value}" ${chosen.has(value) ? 'checked' : ''}><span>${icon('i-check')}${esc(label)}</span></label>`).join('');
  }

  async function userPhotoUrl(record) {
    if (!record?.photoId) return '';
    const file = await dbGetFile(record.photoId);
    if (!file?.blob) return '';
    return URL.createObjectURL(file.blob);
  }

  function officialDirectoryStatus(user) {
    if (user.recordStatus === 'Draft') return 'Draft';
    const explicit = String(user.directoryStatus || user.accountStatus || '').trim();
    if (explicit) return explicit;
    if (user.active === false) return 'Inactive';
    if (/pending|ready to send/i.test(String(user.inviteStatus || ''))) return 'Pending';
    return 'Active';
  }

  function officialDirectoryPositions(user) {
    const values = Array.isArray(user.positions) ? user.positions : String(user.positions || '').split(/[|,;/]+/);
    return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
  }

  function officialDirectoryRecords() {
    return [...state.users, ...state.userDrafts]
      .filter((user) => user.role === 'official')
      .map((user) => ({
        ...user,
        fullName: [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
        statusLabel: officialDirectoryStatus(user),
        positionsList: officialDirectoryPositions(user),
        certificationLabel: String(user.certification || '').trim(),
        certificationExpires: user.certificationExpires || user.certificationExpiry || '',
        joinedValue: user.joinedDate || user.createdAt || ''
      }));
  }

  function officialDirectoryCounts(records) {
    const count = (status) => records.filter((record) => record.statusLabel.toLowerCase() === status).length;
    return { all: records.length, active: count('active'), inactive: count('inactive'), pending: count('pending'), draft: count('draft') };
  }

  function officialDirectoryDate(value) {
    if (!value) return '';
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  }

  function officialDirectorySort(records) {
    const direction = usersUi.sortDir === 'desc' ? -1 : 1;
    const value = (record, key) => {
      if (key === 'name') return record.fullName;
      if (key === 'positions') return record.positionsList.join(' ');
      if (key === 'certification') return record.certificationLabel;
      if (key === 'status') return record.statusLabel;
      if (key === 'joined') return record.joinedValue;
      return String(record[key] || '');
    };
    return records.sort((a, b) => value(a, usersUi.sortKey).localeCompare(value(b, usersUi.sortKey), undefined, { numeric: true, sensitivity: 'base' }) * direction);
  }

  function officialDirectoryFiltered() {
    const query = usersUi.query.trim().toLowerCase();
    const from = usersUi.joinedFrom ? new Date(`${usersUi.joinedFrom}T00:00:00`) : null;
    const to = usersUi.joinedTo ? new Date(`${usersUi.joinedTo}T23:59:59`) : null;
    return officialDirectorySort(officialDirectoryRecords().filter((record) => {
      if (usersUi.tab !== 'all' && record.statusLabel.toLowerCase() !== usersUi.tab) return false;
      if (usersUi.status && record.statusLabel !== usersUi.status) return false;
      if (usersUi.certification && record.certificationLabel !== usersUi.certification) return false;
      if (usersUi.position && !record.positionsList.includes(usersUi.position)) return false;
      if (usersUi.organization && record.organizationName !== usersUi.organization) return false;
      if (usersUi.region && record.region !== usersUi.region) return false;
      if (from || to) {
        const joined = record.joinedValue ? new Date(record.joinedValue) : null;
        if (!joined || Number.isNaN(joined.getTime())) return false;
        if (from && joined < from) return false;
        if (to && joined > to) return false;
      }
      if (!query) return true;
      return [record.fullName, record.email, record.mobilePhone, record.officialId, record.organizationName, record.region, record.certificationLabel, record.positionsList.join(' '), record.statusLabel].join(' ').toLowerCase().includes(query);
    }));
  }

  function officialDirectoryDistinct(records, getter) {
    return [...new Set(records.flatMap((record) => {
      const value = getter(record);
      return Array.isArray(value) ? value : [value];
    }).map((value) => String(value || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function officialDirectorySortButton(key, label) {
    const active = usersUi.sortKey === key;
    return `<button type="button" data-action="sort-officials" data-key="${key}" aria-label="Sort by ${esc(label)}">${esc(label)}<span aria-hidden="true">${active ? (usersUi.sortDir === 'asc' ? '↑' : '↓') : '↕'}</span></button>`;
  }

  function officialDirectoryCell(record, column) {
    if (column === 'email') return `<td data-column="email">${record.email ? `<a href="mailto:${esc(record.email)}">${esc(record.email)}</a>` : ''}</td>`;
    if (column === 'phone') return `<td data-column="phone">${record.mobilePhone ? `<a href="tel:${esc(record.mobilePhone)}">${esc(record.mobilePhone)}</a>` : ''}</td>`;
    if (column === 'positions') return `<td data-column="positions"><div class="official-position-list">${record.positionsList.map((position) => `<span>${esc(position)}</span>`).join('')}</div></td>`;
    if (column === 'certification') return `<td data-column="certification"><div class="official-certification">${record.certificationLabel ? `<strong>${esc(record.certificationLabel)}</strong>` : ''}${record.certificationExpires ? `<small>Expires: ${esc(officialDirectoryDate(record.certificationExpires))}</small>` : ''}</div></td>`;
    if (column === 'status') return `<td data-column="status"><span class="official-status official-status--${record.statusLabel.toLowerCase().replace(/[^a-z]+/g, '-')}">${esc(record.statusLabel)}</span></td>`;
    if (column === 'joined') return `<td data-column="joined">${esc(officialDirectoryDate(record.joinedValue))}</td>`;
    return '';
  }

  function officialDirectoryRow(record) {
    const identityMeta = [record.officialId ? `ID: ${record.officialId}` : '', record.organizationName || ''].filter(Boolean).join(' · ');
    return `<tr>
      <td><div class="official-identity"><span class="official-avatar" aria-hidden="true">${esc(userInitials(record))}</span><div><strong>${esc(record.fullName)}</strong>${identityMeta ? `<small>${esc(identityMeta)}</small>` : ''}</div></div></td>
      ${usersUi.columns.has('email') ? officialDirectoryCell(record, 'email') : ''}
      ${usersUi.columns.has('phone') ? officialDirectoryCell(record, 'phone') : ''}
      ${usersUi.columns.has('positions') ? officialDirectoryCell(record, 'positions') : ''}
      ${usersUi.columns.has('certification') ? officialDirectoryCell(record, 'certification') : ''}
      ${usersUi.columns.has('status') ? officialDirectoryCell(record, 'status') : ''}
      ${usersUi.columns.has('joined') ? officialDirectoryCell(record, 'joined') : ''}
      <td class="official-actions-cell"><button type="button" class="official-more-button" data-action="toggle-official-menu" data-id="${record.id}" aria-expanded="${usersUi.menuId === record.id}" aria-label="Actions for ${esc(record.fullName)}">${icon('i-dots')}</button>${usersUi.menuId === record.id ? `<div class="official-row-menu"><button type="button" data-action="edit-user" data-id="${record.id}">${icon('i-user')}Edit Profile</button><button type="button" data-action="edit-user-account" data-id="${record.id}">${icon('i-settings')}Account &amp; Access</button>${record.email ? `<button type="button" data-action="email-official" data-id="${record.id}">${icon('i-mail')}Email Official</button>` : ''}<button type="button" data-action="toggle-official-status" data-id="${record.id}">${icon('i-check')}${record.active === false ? 'Activate Account' : 'Deactivate Account'}</button><button type="button" class="is-danger" data-action="delete-user" data-id="${record.id}" data-draft="${record.recordStatus === 'Draft' ? 'true' : 'false'}">${icon('i-trash')}Delete Official</button></div>` : ''}</td>
    </tr>`;
  }

  function officialDirectoryPagination(total, page, pages) {
    if (!total) return '';
    const buttons = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(pages, start + 4);
    for (let value = start; value <= end; value += 1) buttons.push(`<button type="button" data-action="official-page" data-page="${value}" class="${value === page ? 'is-active' : ''}" aria-current="${value === page ? 'page' : 'false'}">${value}</button>`);
    return `<div class="official-directory-footer"><p>Showing ${Math.min((page - 1) * usersUi.pageSize + 1, total)} to ${Math.min(page * usersUi.pageSize, total)} of ${total} official${total === 1 ? '' : 's'}</p><div><label><span class="sr-only">Officials per page</span><select data-official-page-size>${[10,25,50,100].map((value) => option(String(value), String(usersUi.pageSize), `${value} per page`)).join('')}</select></label><nav aria-label="Official directory pages"><button type="button" data-action="official-page" data-page="1" ${page === 1 ? 'disabled' : ''} aria-label="First page">|‹</button><button type="button" data-action="official-page" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="Previous page">‹</button>${buttons.join('')}<button type="button" data-action="official-page" data-page="${page + 1}" ${page === pages ? 'disabled' : ''} aria-label="Next page">›</button><button type="button" data-action="official-page" data-page="${pages}" ${page === pages ? 'disabled' : ''} aria-label="Last page">›|</button></nav></div></div>`;
  }

  function officialDirectoryColumnMenu() {
    const labels = { email: 'Email', phone: 'Phone', positions: 'Position(s)', certification: 'Certification', status: 'Status', joined: 'Joined' };
    return `<details class="official-columns-menu"><summary>${icon('i-settings')}Columns</summary><div>${Object.entries(labels).map(([value, label]) => `<label><input type="checkbox" value="${value}" data-official-column ${usersUi.columns.has(value) ? 'checked' : ''}><span>${esc(label)}</span></label>`).join('')}</div></details>`;
  }

  function userListView() {
    const allRecords = officialDirectoryRecords();
    const counts = officialDirectoryCounts(allRecords);
    const filtered = officialDirectoryFiltered();
    const pages = Math.max(1, Math.ceil(filtered.length / usersUi.pageSize));
    usersUi.page = Math.min(usersUi.page, pages);
    const pageRecords = filtered.slice((usersUi.page - 1) * usersUi.pageSize, usersUi.page * usersUi.pageSize);
    const certifications = officialDirectoryDistinct(allRecords, (record) => record.certificationLabel);
    const positions = officialDirectoryDistinct(allRecords, (record) => record.positionsList);
    const organizations = officialDirectoryDistinct(allRecords, (record) => record.organizationName);
    const regions = officialDirectoryDistinct(allRecords, (record) => record.region);
    const statuses = officialDirectoryDistinct(allRecords, (record) => record.statusLabel);
    const tabs = [['all','All Officials',counts.all],['active','Active',counts.active],['inactive','Inactive',counts.inactive],['pending','Pending',counts.pending],['draft','Draft',counts.draft]].filter(([key,,count]) => key !== 'draft' || count);
    return `<div class="official-directory-page">
      <header class="official-directory-header"><div><h1>Officials</h1><p>View, add, and manage officials in your organization.</p></div><div><label class="official-import-button">${icon('i-upload')}Import Officials<input type="file" accept=".csv,text/csv,application/json" data-import-officials></label><button class="official-add-button" type="button" data-action="set-users-mode" data-mode="add">${icon('i-plus')}Add Official</button></div></header>
      <section class="official-directory-tools" aria-label="Official filters">
        <label class="official-search">${icon('i-search')}<span class="sr-only">Search officials</span><input type="search" data-users-search value="${esc(usersUi.query)}" placeholder="Search officials by name, email, phone, ID, or organization"></label>
        <label><span>Status</span><select data-official-filter="status"><option value="">All Statuses</option>${statuses.map((value) => option(value, usersUi.status)).join('')}</select></label>
        <label><span>Certification</span><select data-official-filter="certification"><option value="">All Certifications</option>${certifications.map((value) => option(value, usersUi.certification)).join('')}</select></label>
        <label><span>Position</span><select data-official-filter="position"><option value="">All Positions</option>${positions.map((value) => option(value, usersUi.position)).join('')}</select></label>
        <button type="button" class="official-filter-toggle" data-action="toggle-official-filters" aria-expanded="${usersUi.filtersOpen}">${icon('i-filter')}More Filters</button>
      </section>
      ${usersUi.filtersOpen ? `<section class="official-advanced-filters"><label><span>Organization</span><select data-official-filter="organization"><option value="">All Organizations</option>${organizations.map((value) => option(value, usersUi.organization)).join('')}</select></label><label><span>State / Province</span><select data-official-filter="region"><option value="">All Locations</option>${regions.map((value) => option(value, usersUi.region)).join('')}</select></label><label><span>Joined From</span><input type="date" value="${esc(usersUi.joinedFrom)}" data-official-filter="joinedFrom"></label><label><span>Joined To</span><input type="date" value="${esc(usersUi.joinedTo)}" data-official-filter="joinedTo"></label><button type="button" data-action="clear-official-filters">Clear Filters</button></section>` : ''}
      <section class="official-directory-tabs-row"><nav aria-label="Official status">${tabs.map(([key,label,count]) => `<button type="button" class="${usersUi.tab === key ? 'is-active' : ''}" data-action="set-official-tab" data-tab="${key}">${esc(label)}<span>${count}</span></button>`).join('')}</nav><div>${officialDirectoryColumnMenu()}<button type="button" data-action="export-officials">${icon('i-download')}Export</button></div></section>
      <section class="official-directory-table-card">
        ${pageRecords.length ? `<div class="official-table-scroll"><table class="official-table"><thead><tr><th>${officialDirectorySortButton('name','Name')}</th>${usersUi.columns.has('email') ? `<th>${officialDirectorySortButton('email','Email')}</th>` : ''}${usersUi.columns.has('phone') ? `<th>${officialDirectorySortButton('mobilePhone','Phone')}</th>` : ''}${usersUi.columns.has('positions') ? `<th>${officialDirectorySortButton('positions','Position(s)')}</th>` : ''}${usersUi.columns.has('certification') ? `<th>${officialDirectorySortButton('certification','Certification')}</th>` : ''}${usersUi.columns.has('status') ? `<th>${officialDirectorySortButton('status','Status')}</th>` : ''}${usersUi.columns.has('joined') ? `<th>${officialDirectorySortButton('joined','Joined')}</th>` : ''}<th>Actions</th></tr></thead><tbody>${pageRecords.map(officialDirectoryRow).join('')}</tbody></table></div>` : `<div class="official-directory-empty">${icon('i-user')}<h2>No officials found</h2><p>${allRecords.length ? 'No saved official records match the current filters.' : 'Add an official or import an authorized official roster to populate this section.'}</p>${allRecords.length ? `<button type="button" data-action="clear-official-filters">Clear Filters</button>` : `<button type="button" data-action="set-users-mode" data-mode="add">${icon('i-plus')}Add Official</button>`}</div>`}
      </section>
      ${officialDirectoryPagination(filtered.length, usersUi.page, pages)}
    </div>`;
  }


  async function userBuilderView() {
    const source = usersUi.editingId ? (state.users.find((item) => item.id === usersUi.editingId) || state.userDrafts.find((item) => item.id === usersUi.editingId)) : null;
    if (userPhotoPreviewUrl) { URL.revokeObjectURL(userPhotoPreviewUrl); userPhotoPreviewUrl = ''; }
    userPhotoPreviewUrl = await userPhotoUrl(source);
    const selectedPermissions = source?.permissions || USER_ROLES.find((role) => role.value === 'official')?.permissions || [];
    const fullName = [source?.firstName, source?.lastName].filter(Boolean).join(' ');
    const roleLabel = 'Official';
    const selectedPositions = new Set(officialDirectoryPositions(source || {}));
    return `<div class="user-builder-page">
      <header class="user-builder-title"><button type="button" class="user-back-button" data-action="set-users-mode" data-mode="list">${icon('i-chevron')}Back to Officials</button><div><h1>${source ? 'Edit Official' : 'Add Official'}</h1><p>${source ? 'Update the official account and officiating profile.' : 'Create an official account using verified organization information.'}</p></div></header>
      <form class="user-builder-layout" data-form="user-account" novalidate>
        <input type="hidden" name="id" value="${esc(source?.id || '')}">
        <input type="hidden" name="recordStatus" value="${esc(source?.recordStatus || '')}">
        <div class="user-builder-main">
          <input type="hidden" name="role" value="official"><section class="user-form-section user-form-section--roles"><div class="user-step"><b>1</b><span>${icon('i-user')}Account Type</span></div><div class="official-account-type">${icon('i-user')}<div><strong>Official</strong><small>This account appears in the Officials directory and assignment roster.</small></div></div></section>

          <section class="user-form-section"><div class="user-step"><b>2</b><span>${icon('i-id')}Personal Information</span></div><div class="user-form-grid user-form-grid--three">
            <label><span>First Name <b aria-hidden="true">*</b></span><input name="firstName" type="text" value="${esc(source?.firstName || '')}" autocomplete="given-name"></label>
            <label><span>Last Name <b aria-hidden="true">*</b></span><input name="lastName" type="text" value="${esc(source?.lastName || '')}" autocomplete="family-name"></label>
            <label><span>Email <b aria-hidden="true">*</b></span><input name="email" type="email" value="${esc(source?.email || '')}" autocomplete="email"></label>
            <label><span>Mobile Phone</span><input name="mobilePhone" type="tel" value="${esc(source?.mobilePhone || '')}" autocomplete="tel"></label>
            <label><span>Alternate Phone</span><input name="alternatePhone" type="tel" value="${esc(source?.alternatePhone || '')}"></label>
            <label><span>Date of Birth</span><input name="dateOfBirth" type="date" value="${esc(source?.dateOfBirth || '')}"></label>
          </div></section>

          <section class="user-form-section"><div class="user-step"><b>3</b><span>${icon('i-school')}Organization Details</span></div><div class="user-form-grid user-form-grid--two">
            <label><span>Organization Name</span><select name="organizationName">${userOrganizationOptions(source?.organizationName || '')}</select><small>Organizations come from the Schools section.</small></label>
            <label><span>School / Team</span><select name="schoolTeam">${userOrganizationOptions(source?.schoolTeam || '')}</select></label>
            <label><span>Department</span><input name="department" type="text" value="${esc(source?.department || '')}"></label>
            <label><span>Position Title</span><input name="positionTitle" type="text" value="${esc(source?.positionTitle || '')}"></label>
          </div></section>

          <section class="user-form-section"><div class="user-step"><b>4</b><span>${icon('i-pin')}Address Details</span></div><div class="user-form-grid user-form-grid--address">
            <label class="user-field-wide"><span>Street</span><input name="street" type="text" value="${esc(source?.street || '')}" autocomplete="street-address"></label>
            <label><span>City</span><input name="city" type="text" value="${esc(source?.city || '')}" autocomplete="address-level2"></label>
            <label><span>State / Province</span><input name="region" type="text" value="${esc(source?.region || '')}" autocomplete="address-level1"></label>
            <label><span>Postal Code</span><input name="postalCode" type="text" value="${esc(source?.postalCode || '')}" autocomplete="postal-code"></label>
          </div></section>

          <section class="user-form-section"><div class="user-step"><b>5</b><span>${icon('i-star')}Officiating Details</span></div><div class="official-profile-fields">
            <div class="user-form-grid user-form-grid--three"><label><span>Official ID</span><input name="officialId" type="text" value="${esc(source?.officialId || '')}"></label><label><span>Certification</span><input name="certification" type="text" value="${esc(source?.certification || '')}"></label><label><span>Certification Expiration</span><input name="certificationExpires" type="date" value="${esc(source?.certificationExpires || source?.certificationExpiry || '')}"></label><label><span>Joined Date</span><input name="joinedDate" type="date" value="${esc(source?.joinedDate || '')}"></label><label><span>Directory Status</span><select name="directoryStatus"><option value=""></option>${['Active','Inactive','Pending'].map((value) => option(value, source?.directoryStatus || '')).join('')}</select></label></div>
            <fieldset class="official-position-picker"><legend>Eligible Positions</legend>${['R','U1','U2','Alternate'].map((value) => `<label><input type="checkbox" name="positions" value="${value}" ${selectedPositions.has(value) ? 'checked' : ''}><span>${value}</span></label>`).join('')}</fieldset>
          </div></section>

          <section class="user-form-section"><div class="user-step"><b>6</b><span>${icon('i-settings')}Access & Permissions</span></div><div><div class="user-permission-tools"><button type="button" data-action="select-all-user-permissions">Enable All</button><button type="button" data-action="clear-user-permissions">Clear All</button></div><div class="user-permission-grid">${userPermissionControls(selectedPermissions)}</div></div></section>

          <section class="user-form-section"><div class="user-step"><b>7</b><span>${icon('i-card')}Security & Login</span></div><div class="user-security-grid">
            <label><span>Username <b aria-hidden="true">*</b></span><input name="username" type="text" value="${esc(source?.username || '')}" autocomplete="username"></label>
            <label class="user-password-field"><span>Temporary Password ${source ? '' : '<b aria-hidden="true">*</b>'}</span><div><input name="temporaryPassword" type="password" autocomplete="new-password"><button type="button" data-action="generate-user-password">Generate</button><button type="button" data-action="toggle-user-password" aria-label="Show or hide password">${icon('i-eye')}</button></div><small>The temporary password is never stored in this browser.</small></label>
            <div class="user-toggle-row"><label><input name="sendInviteEmail" type="checkbox" ${source?.sendInviteEmail !== false ? 'checked' : ''}><span>Send Invite Email</span></label><label><input name="requirePasswordReset" type="checkbox" ${source?.requirePasswordReset !== false ? 'checked' : ''}><span>Require Password Reset</span></label><label><input name="twoFactorEnabled" type="checkbox" ${source?.twoFactorEnabled ? 'checked' : ''}><span>Two-Factor Authentication</span></label><label><input name="active" type="checkbox" ${source?.active !== false ? 'checked' : ''}><span>Account Active</span></label></div>
          </div></section>

          <section class="user-form-section"><div class="user-step"><b>8</b><span>${icon('i-user')}Profile Photo</span></div><div class="user-photo-upload"><div class="user-photo-preview" data-user-photo-preview>${userPhotoPreviewUrl ? `<img src="${userPhotoPreviewUrl}" alt="Selected profile photo">` : `<span>${esc(userInitials(source || {}))}</span>`}</div><label><span>Choose Image</span><input name="profilePhoto" type="file" accept="image/png,image/jpeg,image/webp"></label><small>PNG, JPG, or WebP. Maximum 5 MB.</small></div></section>

          <section class="user-form-section"><div class="user-step"><b>9</b><span>${icon('i-form')}Notes / Internal Comments</span></div><label class="user-notes-field"><span class="sr-only">Notes or internal comments</span><textarea name="notes" rows="4" maxlength="500">${esc(source?.notes || '')}</textarea><small><span data-user-note-count>${String(source?.notes || '').length}</span> / 500</small></label></section>
        </div>

        <aside class="user-builder-aside">
          <section class="user-preview-card"><h2>${icon('i-user')}Official Preview</h2><div class="user-preview-content"><div class="user-preview-avatar" data-user-preview-avatar>${userPhotoPreviewUrl ? `<img src="${userPhotoPreviewUrl}" alt="">` : `<span>${esc(userInitials(source || {}))}</span>`}</div><div><div class="user-preview-name-line"><strong data-user-preview-name>${esc(fullName || 'Enter user information')}</strong><span data-user-preview-role>${esc(roleLabel || 'No role selected')}</span><b data-user-preview-status class="${source?.active === false ? 'is-inactive' : 'is-active'}">${source?.active === false ? 'Inactive' : 'Active'}</b></div><p data-user-preview-email>${esc(source?.email || '')}</p><p data-user-preview-phone>${esc(source?.mobilePhone || '')}</p><dl><dt>Organization</dt><dd data-user-preview-organization>${esc(source?.organizationName || '')}</dd><dt>Position</dt><dd data-user-preview-position>${esc(source?.positionTitle || '')}</dd><dt>Department</dt><dd data-user-preview-department>${esc(source?.department || '')}</dd><dt>Username</dt><dd data-user-preview-username>${esc(source?.username || '')}</dd></dl></div></div></section>

          <section class="user-permission-summary"><h2>${icon('i-settings')}Permissions Summary <b data-user-permission-count>${selectedPermissions.length} of ${USER_PERMISSIONS.length} Enabled</b></h2><div data-user-permission-summary>${permissionLabels(selectedPermissions).length ? permissionLabels(selectedPermissions).map((label) => `<span>${icon('i-check')}${esc(label)}</span>`).join('') : '<p>No permissions selected.</p>'}</div></section>

          <section class="user-invite-summary"><h2>${icon('i-mail')}Invitation Delivery</h2><dl><dt>Send Invite Email</dt><dd data-user-invite-enabled>${source?.sendInviteEmail !== false ? 'Yes' : 'No'}</dd><dt>Delivery Method</dt><dd>Email application</dd><dt>Invite Status</dt><dd data-user-invite-status>${esc(source?.inviteStatus || 'Not requested')}</dd></dl><p>${icon('i-help')}When requested, the dashboard opens a prefilled message in the administrator’s email application. A production email service is not connected.</p></section>
        </aside>

        <footer class="user-builder-actions"><button class="module-button" type="submit" name="intent" value="draft" formnovalidate>${icon('i-file')}Save Draft</button><button class="module-button" type="submit" name="intent" value="create">${icon('i-user')}${source ? 'Update Official' : 'Create Official'}</button><button class="module-button module-button--primary" type="submit" name="intent" value="invite">${icon('i-mail')}${source ? 'Update & Send Invite' : 'Create Official & Send Invite'}</button></footer>
      </form>
    </div>`;
  }

  function parseOfficialsCsv(text) {
    const rows = [];
    let row = [], cell = '', quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      if (char === '"' && quoted && text[index + 1] === '"') { cell += '"'; index += 1; continue; }
      if (char === '"') { quoted = !quoted; continue; }
      if (char === ',' && !quoted) { row.push(cell); cell = ''; continue; }
      if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && text[index + 1] === '\n') index += 1;
        row.push(cell); cell = '';
        if (row.some((value) => String(value).trim())) rows.push(row);
        row = [];
        continue;
      }
      cell += char;
    }
    row.push(cell); if (row.some((value) => String(value).trim())) rows.push(row);
    if (rows.length < 2) return [];
    const headers = rows.shift().map((value) => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, ''));
    return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, String(values[index] || '').trim()])));
  }

  function importOfficialRecords(rows) {
    let added = 0, skipped = 0;
    const read = (row, keys) => {
      for (const key of keys) {
        const direct = row[key];
        if (direct != null && String(direct).trim()) return String(direct).trim();
        const normalized = Object.entries(row).find(([name]) => String(name).toLowerCase().replace(/[^a-z0-9]+/g, '') === key.toLowerCase().replace(/[^a-z0-9]+/g, ''));
        if (normalized && String(normalized[1] || '').trim()) return String(normalized[1]).trim();
      }
      return '';
    };
    rows.forEach((row) => {
      const firstName = read(row, ['firstname','first']);
      const lastName = read(row, ['lastname','last']);
      const email = read(row, ['email','emailaddress']).toLowerCase();
      if (!firstName || !lastName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { skipped += 1; return; }
      if (state.users.some((user) => String(user.email || '').toLowerCase() === email) || state.userDrafts.some((user) => String(user.email || '').toLowerCase() === email)) { skipped += 1; return; }
      const status = read(row, ['status','accountstatus']);
      const positions = read(row, ['positions','position']).split(/[|,;/]+/).map((value) => value.trim()).filter(Boolean);
      const now = new Date().toISOString();
      state.users.push({
        id: uid('user'), role: 'official', firstName, lastName, email,
        mobilePhone: read(row, ['mobilephone','phone','telephone']), alternatePhone: '', dateOfBirth: '',
        organizationName: read(row, ['organizationname','organization','school']), schoolTeam: '', department: '', positionTitle: '',
        street: '', city: read(row, ['city']), region: read(row, ['state','region','province']), postalCode: '',
        permissions: USER_ROLES.find((role) => role.value === 'official')?.permissions || [], username: read(row, ['username']) || email,
        sendInviteEmail: false, requirePasswordReset: true, twoFactorEnabled: false,
        active: status.toLowerCase() !== 'inactive', photoId: '', notes: '', passwordConfigured: false,
        officialId: read(row, ['officialid','id']), certification: read(row, ['certification','certificationstatus']),
        certificationExpires: read(row, ['certificationexpires','certificationexpiration','expirationdate']), joinedDate: read(row, ['joineddate','joined']),
        directoryStatus: status, positions, createdAt: now, updatedAt: now, recordStatus: 'User', inviteStatus: 'Not requested'
      });
      added += 1;
    });
    return { added, skipped };
  }


  function officialProfileRecord() {
    return state.users.find((item) => item.id === usersUi.editingId) || state.userDrafts.find((item) => item.id === usersUi.editingId) || null;
  }

  function officialProfileDisplayValue(value) {
    return String(value == null ? '' : value).trim();
  }

  function officialProfileStatusClass(value) {
    return ['active','cleared','complete','verified','certified'].includes(String(value || '').trim().toLowerCase()) ? 'is-positive' : '';
  }

  function officialProfilePreviewRow(iconId, label, value, status = false) {
    const displayed = officialProfileDisplayValue(value);
    if (!displayed) return '';
    return `<div class="official-profile-preview-row">${icon(iconId)}<span>${esc(label)}</span><strong class="${status ? officialProfileStatusClass(displayed) : ''}">${status && officialProfileStatusClass(displayed) ? '<i></i>' : ''}${esc(displayed)}</strong></div>`;
  }

  function officialProfileComplianceRows(source) {
    const rows = [];
    const add = (label, status, date, iconId = 'i-check') => {
      const cleanStatus = officialProfileDisplayValue(status);
      const cleanDate = officialProfileDisplayValue(date);
      if (!cleanStatus && !cleanDate) return;
      rows.push(`<div class="official-profile-compliance-row">${icon(iconId)}<strong>${esc(label)}</strong><span class="${officialProfileStatusClass(cleanStatus)}">${officialProfileStatusClass(cleanStatus) ? '<i></i>' : ''}${esc(cleanStatus)}</span><time>${cleanDate ? esc(officialDirectoryDate(cleanDate)) : ''}</time></div>`);
    };
    add('Background Check', source.backgroundCheckStatus, source.backgroundCheckDate, 'i-check');
    add('SafeSport Status', source.safeSportStatus, source.safeSportDate, 'i-star');
    add('Certification', source.certification, source.certificationExpires, 'i-id');
    const records = Array.isArray(source.complianceRecords) ? source.complianceRecords : [];
    records.forEach((record) => add(record.name || record.label || 'Document', record.status || '', record.date || record.updatedAt || '', 'i-file'));
    return rows.length ? rows.join('') : `<div class="official-profile-compliance-empty">${icon('i-file')}<strong>No compliance records saved</strong><p>Compliance details will appear after they are entered for this official.</p></div>`;
  }

  function officialProfileSelect(name, label, selected, values) {
    return `<label><span>${esc(label)}</span><select name="${name}"><option value=""></option>${values.map((value) => option(value, selected)).join('')}</select></label>`;
  }

  function officialProfileInput(name, label, type, value, required = false, extra = '') {
    return `<label${extra ? ` class="${extra}"` : ''}><span>${esc(label)}${required ? ' <b aria-hidden="true">*</b>' : ''}</span><input name="${name}" type="${type}" value="${esc(value || '')}" ${required ? 'required' : ''}></label>`;
  }

  function officialProfileCurrentAvailability(source) {
    const today = dateKey(new Date());
    const saved = (state.officialAvailability || []).find((entry) => entry.officialId === source.id && entry.date === today);
    return saved?.status || '';
  }

  async function officialProfileEditorView() {
    const source = officialProfileRecord();
    if (!source) return `<div class="official-profile-editor-missing">${icon('i-user')}<h1>Official record not found</h1><p>Return to the Officials directory and choose an existing official.</p><button type="button" data-action="set-users-mode" data-mode="list">Back to Officials</button></div>`;
    if (userPhotoPreviewUrl) { URL.revokeObjectURL(userPhotoPreviewUrl); userPhotoPreviewUrl = ''; }
    userPhotoPreviewUrl = await userPhotoUrl(source);
    const initials = userInitials(source);
    const fullName = [source.firstName, source.lastName].filter(Boolean).join(' ').trim();
    const displayName = [source.preferredName || '', source.lastName || ''].filter(Boolean).join(' ').trim() || fullName;
    const roleLabel = userRoleLabel(source.role) || 'Official';
    const availability = officialProfileCurrentAvailability(source);
    const previewRows = [
      officialProfilePreviewRow('i-lab', 'Primary Sport', source.primarySport),
      officialProfilePreviewRow('i-calendar', 'Years of Experience', source.yearsExperience ? `${source.yearsExperience} Years` : ''),
      officialProfilePreviewRow('i-star', 'Preferred Level', source.preferredLevel),
      officialProfilePreviewRow('i-id', 'Membership Number', source.membershipNumber),
      officialProfilePreviewRow('i-calendar', 'Availability', availability, true),
      officialProfilePreviewRow('i-check', 'Background Check', source.backgroundCheckStatus, true),
      officialProfilePreviewRow('i-star', 'SafeSport Status', source.safeSportStatus, true)
    ].join('');
    const photoContent = userPhotoPreviewUrl ? `<img src="${userPhotoPreviewUrl}" alt="${esc(fullName ? `${fullName} profile photo` : 'Official profile photo')}">` : `<span>${esc(initials)}</span>`;
    return `<div class="official-profile-editor-page">
      <header class="official-profile-editor-heading">
        <div><button type="button" class="official-profile-editor-back" data-action="set-users-mode" data-mode="list">${icon('i-chevron')}Officials</button><h1>${icon('i-user')}Edit Profile</h1><p>Update personal, contact, and officiating information for this official.</p></div>
        <div><button type="button" class="official-profile-editor-cancel" data-action="set-users-mode" data-mode="list">Cancel</button><button type="submit" class="official-profile-editor-save" form="official-profile-editor-form">${icon('i-check')}Save Changes</button></div>
      </header>
      <form id="official-profile-editor-form" class="official-profile-editor-layout" data-form="official-profile" novalidate>
        <input type="hidden" name="id" value="${esc(source.id)}">
        <div class="official-profile-editor-left">
          <section class="official-profile-section official-profile-photo-section">
            <h2>Profile Photo</h2>
            <label class="official-profile-photo-drop" data-official-photo-drop>
              <input name="profilePhoto" type="file" accept="image/png,image/jpeg,image/webp">
              <span class="official-profile-photo-frame" data-user-photo-preview>${photoContent}</span>
              <strong>${icon('i-upload')}Choose or drop an image</strong>
              <small>JPG, PNG, or WebP · Maximum 5 MB</small>
            </label>
          </section>
          <section class="official-profile-section official-profile-contact-section">
            <h2>${icon('i-id')}Contact Information</h2>
            <div class="official-profile-contact-fields">
              ${officialProfileInput('email','Email Address','email',source.email,true)}
              ${officialProfileInput('mobilePhone','Phone Number','tel',source.mobilePhone)}
              ${officialProfileInput('street','Address','text',source.street)}
              <div class="official-profile-contact-row">${officialProfileInput('city','City','text',source.city)}${officialProfileInput('region','State / Province','text',source.region)}${officialProfileInput('postalCode','Postal Code','text',source.postalCode)}</div>
            </div>
          </section>
        </div>
        <div class="official-profile-editor-main">
          <section class="official-profile-section official-profile-personal-section">
            <h2>${icon('i-user')}Personal Information</h2>
            <div class="official-profile-form-grid">
              ${officialProfileInput('firstName','First Name','text',source.firstName,true)}
              ${officialProfileInput('lastName','Last Name','text',source.lastName,true)}
              ${officialProfileInput('preferredName','Preferred Name','text',source.preferredName)}
              ${officialProfileInput('dateOfBirth','Date of Birth','date',source.dateOfBirth)}
              ${officialProfileInput('yearsExperience','Years of Experience','number',source.yearsExperience)}
              ${officialProfileSelect('preferredLevel','Preferred Level',source.preferredLevel,['Youth','Middle School','Junior Varsity','Varsity','College','Professional'])}
              ${officialProfileSelect('primarySport','Primary Sport',source.primarySport,['Basketball','Baseball','Football','Soccer','Softball','Volleyball','Other'])}
              ${officialProfileSelect('uniformSize','Uniform Size',source.uniformSize,['XS','Small','Medium','Large','XL','2XL','3XL','4XL'])}
              ${officialProfileInput('membershipNumber','Membership Number','text',source.membershipNumber,false,'is-wide')}
              ${officialProfileInput('officialId','Official ID','text',source.officialId,false,'is-wide')}
            </div>
          </section>
          <section class="official-profile-section official-profile-officiating-section">
            <h2>${icon('i-star')}Officiating Information</h2>
            <div class="official-profile-compliance-controls">
              ${officialProfileSelect('backgroundCheckStatus','Background Check',source.backgroundCheckStatus,['Not Submitted','Pending','Cleared','Expired'])}
              ${officialProfileInput('backgroundCheckDate','Background Check Date','date',source.backgroundCheckDate)}
              ${officialProfileSelect('safeSportStatus','SafeSport Status',source.safeSportStatus,['Not Submitted','Pending','Complete','Expired'])}
              ${officialProfileInput('safeSportDate','SafeSport Date','date',source.safeSportDate)}
            </div>
            <div class="official-profile-compliance-list">${officialProfileComplianceRows(source)}</div>
            <a class="official-profile-manage-documents" href="#documents" data-route="documents">${icon('i-file')}Manage Documents</a>
          </section>
        </div>
        <aside class="official-profile-preview-panel" data-official-profile-preview-panel>
          <header><h2>Profile Preview</h2><div><button type="button" class="is-active" data-action="set-profile-preview-mode" data-mode="mobile" aria-label="Mobile preview">${icon('i-card')}</button><button type="button" data-action="set-profile-preview-mode" data-mode="desktop" aria-label="Desktop preview">${icon('i-home')}</button></div></header>
          <div class="official-profile-device" data-profile-device>
            <div class="official-profile-device-screen">
              <img class="official-profile-device-logo" src="assets/rtbo-logo.webp" alt="Raising The Bar Officiating">
              <div class="official-profile-preview-avatar" data-user-preview-avatar>${photoContent}</div>
              <section class="official-profile-preview-card">
                <h3 data-official-preview-name>${esc(displayName)}</h3>
                <p data-official-preview-role>${esc(roleLabel)}</p>
                <strong data-official-preview-id>${source.officialId ? `ID: ${esc(source.officialId)}` : ''}</strong>
                <div data-official-preview-rows>${previewRows || `<p class="official-profile-preview-empty">Profile details will appear after they are entered.</p>`}</div>
              </section>
              <p class="official-profile-preview-tagline">Raising The Bar. Officiating Excellence.</p>
              <div class="official-profile-preview-stars"><i></i><span>★</span><span>★</span><span>★</span><i></i></div>
            </div>
          </div>
          <p>This preview is generated only from the official’s saved profile record.</p>
        </aside>
      </form>
    </div>`;
  }

  function updateOfficialProfilePreview() {
    const form = moduleView.querySelector('form[data-form="official-profile"]');
    if (!form) return;
    const value = (name) => String(form.elements[name]?.value || '').trim();
    const name = [value('preferredName') || value('firstName'), value('lastName')].filter(Boolean).join(' ');
    const nameNode = moduleView.querySelector('[data-official-preview-name]');
    if (nameNode) nameNode.textContent = name;
    const idNode = moduleView.querySelector('[data-official-preview-id]');
    if (idNode) idNode.textContent = value('officialId') ? `ID: ${value('officialId')}` : '';
    const source = officialProfileRecord() || {};
    const availability = officialProfileCurrentAvailability(source);
    const rows = [
      officialProfilePreviewRow('i-lab', 'Primary Sport', value('primarySport')),
      officialProfilePreviewRow('i-calendar', 'Years of Experience', value('yearsExperience') ? `${value('yearsExperience')} Years` : ''),
      officialProfilePreviewRow('i-star', 'Preferred Level', value('preferredLevel')),
      officialProfilePreviewRow('i-id', 'Membership Number', value('membershipNumber')),
      officialProfilePreviewRow('i-calendar', 'Availability', availability, true),
      officialProfilePreviewRow('i-check', 'Background Check', value('backgroundCheckStatus'), true),
      officialProfilePreviewRow('i-star', 'SafeSport Status', value('safeSportStatus'), true)
    ].join('');
    const rowsNode = moduleView.querySelector('[data-official-preview-rows]');
    if (rowsNode) rowsNode.innerHTML = rows || `<p class="official-profile-preview-empty">Profile details will appear after they are entered.</p>`;
  }

  async function renderUsers() {
    if (usersUi.mode === 'list') return userListView();
    if (usersUi.mode === 'profile') return await officialProfileEditorView();
    return await userBuilderView();
  }

  function updateUserBuilderPreview() {
    const form = moduleView.querySelector('form[data-form="user-account"]');
    if (!form) return;
    const get = (name) => String(form.elements[name]?.value || '').trim();
    const set = (selector, value) => { const element = moduleView.querySelector(selector); if (element) element.textContent = value; };
    const firstName = get('firstName'); const lastName = get('lastName');
    set('[data-user-preview-name]', [firstName, lastName].filter(Boolean).join(' ') || 'Enter user information');
    set('[data-user-preview-role]', userRoleLabel(get('role')) || 'No role selected');
    set('[data-user-preview-email]', get('email'));
    set('[data-user-preview-phone]', get('mobilePhone'));
    set('[data-user-preview-organization]', get('organizationName'));
    set('[data-user-preview-position]', get('positionTitle'));
    set('[data-user-preview-department]', get('department'));
    set('[data-user-preview-username]', get('username'));
    set('[data-user-invite-enabled]', form.elements.sendInviteEmail.checked ? 'Yes' : 'No');
    const status = moduleView.querySelector('[data-user-preview-status]');
    if (status) { status.textContent = form.elements.active.checked ? 'Active' : 'Inactive'; status.className = form.elements.active.checked ? 'is-active' : 'is-inactive'; }
    const permissions = selectedPermissions(form); const labels = permissionLabels(permissions);
    set('[data-user-permission-count]', `${permissions.length} of ${USER_PERMISSIONS.length} Enabled`);
    const summary = moduleView.querySelector('[data-user-permission-summary]');
    if (summary) summary.innerHTML = labels.length ? labels.map((label) => `<span>${icon('i-check')}${esc(label)}</span>`).join('') : '<p>No permissions selected.</p>';
    const count = moduleView.querySelector('[data-user-note-count]'); if (count) count.textContent = String(form.elements.notes.value.length);
    moduleView.querySelectorAll('.user-role-chip').forEach((chip) => chip.classList.toggle('is-selected', chip.querySelector('input')?.checked));
  }

  function validateUserRecord(form, intent) {
    if (intent === 'draft') return '';
    const required = [['role','Choose a user role.'],['firstName','Enter the first name.'],['lastName','Enter the last name.'],['email','Enter a valid email address.'],['username','Enter a username.']];
    for (const [name, message] of required) if (!String(form.elements[name]?.value || '').trim()) return message;
    if (!form.elements.email.checkValidity()) return 'Enter a valid email address.';
    if (!form.elements.id.value && !form.elements.temporaryPassword.value) return 'Create a temporary password.';
    const id = form.elements.id.value;
    const email = form.elements.email.value.trim().toLowerCase(); const username = form.elements.username.value.trim().toLowerCase();
    if (state.users.some((user) => user.id !== id && String(user.email).toLowerCase() === email)) return 'That email address is already assigned to a user.';
    if (state.users.some((user) => user.id !== id && String(user.username).toLowerCase() === username)) return 'That username is already assigned to a user.';
    return '';
  }

  function createInviteMailto(record, temporaryPassword) {
    const name = [record.firstName, record.lastName].filter(Boolean).join(' ');
    const subject = 'Your Got U Nex Ref account';
    const body = [`Hello ${name},`, '', 'Your Got U Nex Ref account has been prepared.', `Username: ${record.username}`, temporaryPassword ? `Temporary password: ${temporaryPassword}` : '', record.requirePasswordReset ? 'You will be required to choose a new password after signing in.' : '', '', 'This invitation was prepared by an authorized platform administrator.'].filter(Boolean).join('\n');
    window.location.href = `mailto:${encodeURIComponent(record.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function renderProfile() {
    const p = state.profile;
    const name = [p.firstName, p.lastName].filter(Boolean).join(' ');
    const initials = `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase() || 'GU';
    const photoUrl = await getProfilePhotoUrl();
    const documents = [...await dbListFiles('documents'), ...await dbListFiles('tax')]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    const today = new Date(); today.setHours(0,0,0,0);
    const upcomingAll = [...state.assignments]
      .map(normalizeAssignment)
      .filter((a) => a.dueDate && new Date(`${a.dueDate}T12:00:00`) >= today && !['Completed','Canceled','Declined'].includes(a.status))
      .sort((a,b) => `${a.dueDate}${a.dueTime || ''}`.localeCompare(`${b.dueDate}${b.dueTime || ''}`));
    const upcoming = upcomingAll.slice(0,3);
    const completed = state.assignments.filter((a) => a.status === 'Completed').length;
    const canceled = state.assignments.filter((a) => a.status === 'Canceled').length;
    const average = state.reviews.length ? state.reviews.reduce((sum, r) => sum + Number(r.overall || 0), 0) / state.reviews.length : 0;
    const verified = p.verificationStatus === 'Verified';
    const profileReady = Boolean(p.firstName && p.lastName && p.email && p.role);
    const location = [p.city, p.region, p.country].filter(Boolean).join(', ');

    return `<div class="profile-dashboard">
      <section class="profile-overview-panel">
        <div class="profile-identity-block">
          <div class="profile-photo-ring">${photoUrl ? `<img src="${photoUrl}" alt="${esc(name || 'Profile photo')}">` : `<span>${esc(initials)}</span>`}</div>
          <div class="profile-identity-copy">
            <h1>${esc(name || 'My Profile')}</h1>
            ${p.officialId ? `<p class="profile-official-id">Official ID: ${esc(p.officialId)}</p>` : ''}
            <div class="profile-contact-list">
              ${p.email ? `<span>${icon('i-mail')}${esc(p.email)}</span>` : ''}
              ${p.phone ? `<span>${icon('i-card')}${esc(p.phone)}</span>` : ''}
              ${location ? `<span>${icon('i-school')}${esc(location)}</span>` : ''}
              ${p.timeZone ? `<span>${icon('i-calendar')}${esc(p.timeZone)}</span>` : ''}
            </div>
            <button class="profile-edit-button" type="button" data-action="toggle-profile-editor">${icon('i-edit')}${profileReady ? 'Edit Profile' : 'Set Up Profile'}</button>
          </div>
        </div>

        <dl class="profile-fact-list">
          ${profileFact('Primary Sport', p.primarySport)}
          ${profileFact('Years of Experience', p.yearsExperience ? `${p.yearsExperience} years` : '')}
          ${profileFact('Preferred Level', p.preferredLevel)}
          ${profileFact('Uniform Size', p.uniformSize)}
          ${profileFact('Membership Number', p.membershipNumber)}
        </dl>

        <div class="profile-status-block">
          ${profileStatus('Account Status', p.accountStatus)}
          ${profileStatus('Background Check', p.backgroundCheckStatus, p.backgroundCheckDate)}
          ${profileStatus('SafeSport Status', p.safeSportStatus, p.safeSportDate)}
          ${verified ? `<div class="verified-official-badge">${icon('i-star')}Verified Official</div>` : ''}
        </div>
        <img class="profile-overview-logo" src="assets/rtbo-logo.webp" alt="Raising The Bar Officiating">
      </section>

      <section class="profile-editor-panel" data-profile-editor hidden>
        <div class="profile-panel-heading"><div><p>Profile Management</p><h2>Account and officiating information</h2></div><button type="button" data-action="toggle-profile-editor" aria-label="Close profile editor">×</button></div>
        <form class="profile-editor-form" data-form="profile">
          <fieldset><legend>Personal Information</legend>
            ${field('First Name','firstName','text',p.firstName,true)}${field('Last Name','lastName','text',p.lastName,true)}
            ${field('Email','email','email',p.email,true)}${field('Phone','phone','tel',p.phone)}
            ${field('City','city','text',p.city)}${field('State / Province','region','text',p.region)}
            ${field('Country','country','text',p.country)}${field('Time Zone','timeZone','text',p.timeZone)}
            ${field('Emergency Contact','emergencyContact','text',p.emergencyContact)}
          </fieldset>
          <fieldset><legend>Officiating Profile</legend>
            ${field('Role','role','select',p.role,true,[option('','', 'Select role'),option('Official',p.role),option('Assignor',p.role),option('School Administrator',p.role),option('Observer',p.role),option('Coach',p.role),option('Other',p.role)].join(''))}
            ${field('Official ID','officialId','text',p.officialId)}${field('Primary Sport','primarySport','text',p.primarySport)}
            ${field('Years of Experience','yearsExperience','number',p.yearsExperience)}${field('Preferred Level','preferredLevel','text',p.preferredLevel)}
            ${field('Uniform Size','uniformSize','text',p.uniformSize)}${field('Membership Number','membershipNumber','text',p.membershipNumber)}
          </fieldset>
          <fieldset><legend>Account and Compliance Status</legend>
            ${field('Account Status','accountStatus','select',p.accountStatus,false,[option('','', 'Select status'),option('Active',p.accountStatus),option('Pending',p.accountStatus),option('Inactive',p.accountStatus)].join(''))}
            ${field('Verification Status','verificationStatus','select',p.verificationStatus,false,[option('','', 'Select status'),option('Not Verified',p.verificationStatus),option('Pending',p.verificationStatus),option('Verified',p.verificationStatus)].join(''))}
            ${field('Background Check Status','backgroundCheckStatus','select',p.backgroundCheckStatus,false,[option('','', 'Select status'),option('Not Submitted',p.backgroundCheckStatus),option('Pending',p.backgroundCheckStatus),option('Cleared',p.backgroundCheckStatus),option('Expired',p.backgroundCheckStatus)].join(''))}
            ${field('Background Check Date','backgroundCheckDate','date',p.backgroundCheckDate)}
            ${field('SafeSport Status','safeSportStatus','select',p.safeSportStatus,false,[option('','', 'Select status'),option('Not Submitted',p.safeSportStatus),option('Pending',p.safeSportStatus),option('Complete',p.safeSportStatus),option('Expired',p.safeSportStatus)].join(''))}
            ${field('SafeSport Date','safeSportDate','date',p.safeSportDate)}
          </fieldset>
          <fieldset class="profile-photo-fieldset"><legend>Profile Photo</legend>
            <label class="is-full"><span>Upload Photo</span><input name="profilePhoto" type="file" accept="image/png,image/jpeg,image/webp"></label>
            ${p.profilePhotoId ? `<button class="module-button module-button--quiet" type="button" data-action="remove-profile-photo">Remove Current Photo</button>` : ''}
          </fieldset>
          <div class="profile-editor-actions"><button class="module-button module-button--primary" type="submit">Save Profile</button><button class="module-button" type="button" data-action="toggle-profile-editor">Cancel</button></div>
        </form>
      </section>

      <div class="profile-grid profile-grid--top">
        <section class="profile-card profile-card--assignments">
          ${profileCardHeader('i-calendar','Upcoming Assignments','assignments')}
          <div class="profile-card-body">${upcoming.length ? upcoming.map(profileAssignmentItem).join('') : profileEmpty('No upcoming assignments','Assignments you add will appear here automatically.')}</div>
          <p class="profile-time-note">Times are displayed exactly as entered in your assignment records.</p>
        </section>
        <section class="profile-card profile-card--documents">
          ${profileCardHeader('i-file','Recent Documents','documents')}
          <div class="profile-card-body">${documents.length ? documents.map(profileDocumentItem).join('') : profileEmpty('No documents uploaded','Upload a document to display it here.')}</div>
          <a class="profile-card-action" href="#documents" data-route="documents">${icon('i-file')}Go to Documents</a>
        </section>
        <section class="profile-card profile-card--id">
          ${profileCardHeader('i-id','ID Card Summary','id-card')}
          <div class="profile-id-preview">${profileReady ? renderProfileIdCards(p, photoUrl, initials) : profileEmpty('Profile information required','Complete your name, email, and role to generate the ID card summary.')}</div>
          <a class="profile-card-action" href="#id-card" data-route="id-card">${icon('i-id')}View / Manage ID Card</a>
        </section>
      </div>

      <div class="profile-grid profile-grid--bottom">
        <section class="profile-card profile-card--availability">
          ${profileCardHeader('i-calendar','Availability This Week','assignments')}
          <div class="profile-availability">${profileAvailabilityGrid()}</div>
          <div class="availability-key"><span class="is-available">✓ Available</span><span class="is-unavailable">— Unavailable</span><span class="is-limited">● Limited</span><span class="is-unset">· Not set</span></div>
        </section>
        <section class="profile-card profile-card--account">
          ${profileCardHeader('i-user','Account Overview')}
          <dl class="profile-account-list">
            <div><dt>Total Assignments</dt><dd>${state.assignments.length}</dd></div>
            <div><dt>Completed</dt><dd>${completed}</dd></div>
            <div><dt>Upcoming</dt><dd>${upcomingAll.length}</dd></div>
            <div><dt>Canceled</dt><dd>${canceled}</dd></div>
            <div><dt>Rating</dt><dd>${average ? `${average.toFixed(1)} <span aria-label="${average.toFixed(1)} out of 5">★</span> <small>(${state.reviews.length})</small>` : '—'}</dd></div>
          </dl>
        </section>
        <section class="profile-card profile-card--actions">
          ${profileCardHeader('i-plus','Quick Actions')}
          <div class="profile-quick-actions">
            ${profileQuickAction('i-upload','Upload Document','Add or update your documents','documents')}
            ${profileQuickAction('i-mail','Message Admin','Open your messages','messages')}
            ${profileQuickAction('i-calendar','Submit Availability','Update your availability calendar','calendar')}
            ${profileQuickAction('i-lab','Visit The Lab','Upload game film or clips','lab')}
            ${profileQuickAction('i-star','Request Evaluation','Create or review evaluations','reviews')}
            ${profileQuickAction('i-help','Contact Support','Open a support request','support')}
          </div>
        </section>
      </div>
    </div>`;
  }

  function profileFact(label, value) {
    return `<div><dt>${esc(label)}</dt><dd>${value ? esc(value) : '—'}</dd></div>`;
  }

  function profileStatus(label, value, date = '') {
    const positive = ['Active','Cleared','Complete','Verified'].includes(value);
    return `<div class="profile-status-row"><span>${esc(label)}</span><strong class="${positive ? 'is-positive' : ''}">${value ? `${positive ? '<i></i>' : ''}${esc(value)}` : '—'}</strong>${date ? `<small>${fmtDate(date)}</small>` : ''}</div>`;
  }

  function profileCardHeader(iconId, title, route = '') {
    return `<header class="profile-card-header"><h2>${icon(iconId)}${esc(title)}</h2>${route ? `<a href="#${route}" data-route="${route}">View All</a>` : ''}</header>`;
  }

  function profileEmpty(title, copy) { return `<div class="profile-empty"><strong>${esc(title)}</strong><p>${esc(copy)}</p></div>`; }

  function profileAssignmentItem(record) {
    const a = normalizeAssignment(record);
    const d = new Date(`${a.dueDate}T12:00:00`);
    const month = Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('en-US',{month:'short'}).format(d).toUpperCase();
    const day = Number.isNaN(d.getTime()) ? '' : d.getDate();
    const weekday = Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('en-US',{weekday:'short'}).format(d).toUpperCase();
    return `<article class="profile-assignment-row"><time datetime="${esc(a.dueDate)}"><span>${month}</span><strong>${day}</strong><small>${weekday}</small></time><div><h3>${esc(a.title)}</h3><p>${[a.type,a.classTeam,a.dueTime].filter(Boolean).map(esc).join(' · ')}</p></div><span class="profile-status-pill">${esc(a.status || 'Not set')}</span></article>`;
  }

  function profileDocumentItem(file) {
    return `<article class="profile-document-row"><span>${icon('i-file')}</span><div><h3>${esc(file.name)}</h3><p>${formatBytes(file.size)} · ${fmtDateTime(file.createdAt)}</p></div><button type="button" data-action="download-file" data-id="${file.id}" aria-label="Download ${esc(file.name)}">${icon('i-download')}</button></article>`;
  }

  function renderProfileIdCards(p, photoUrl, initials) {
    const name = `${p.firstName} ${p.lastName}`.trim();
    return `<div class="profile-id-card profile-id-card--front"><img class="profile-id-logo" src="assets/rtbo-logo.webp" alt=""><div class="profile-id-photo">${photoUrl ? `<img src="${photoUrl}" alt="">` : `<span>${esc(initials)}</span>`}</div><strong>${esc(name)}</strong><span>${esc(p.role)}</span>${p.officialId ? `<small>ID: ${esc(p.officialId)}</small>` : ''}</div><div class="profile-id-card profile-id-card--back"><img src="assets/rtbo-logo.webp" alt=""><strong>Got U Nex Ref Account</strong><span>Got U Nex Ref</span><small>Raising The Bar Officiating</small></div>`;
  }

  function profileAvailabilityGrid() {
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const periods = [['Morning','6 AM – 12 PM'],['Afternoon','12 PM – 5 PM'],['Evening','5 PM – 11 PM']];
    const start = new Date(); const day = start.getDay(); const diff = start.getDate() - day + (day === 0 ? -6 : 1); start.setDate(diff); start.setHours(12,0,0,0);
    const headers = days.map((label,index)=>{const date=new Date(start);date.setDate(start.getDate()+index);return `<span><b>${label.slice(0,3).toUpperCase()}</b><small>${date.getMonth()+1}/${date.getDate()}</small></span>`;}).join('');
    return `<div class="profile-availability-grid"><div class="profile-availability-head"><span></span>${headers}</div>${periods.map(([period,time])=>`<div class="profile-availability-row"><strong>${period}<small>${time}</small></strong>${days.map((dayName)=>{const key=`${dayName}-${period}`;const value=state.availability[key]||'Unset';const symbol=value==='Available'?'✓':value==='Unavailable'?'—':value==='Limited'?'●':'·';return `<button type="button" data-action="cycle-profile-availability" data-key="${key}" data-value="${value}" aria-label="${dayName} ${period}: ${value}">${symbol}</button>`;}).join('')}</div>`).join('')}</div>`;
  }

  function profileQuickAction(iconId, title, copy, route) {
    return `<a href="#${route}" data-route="${route}">${icon(iconId)}<span><strong>${esc(title)}</strong><small>${esc(copy)}</small></span></a>`;
  }

  async function getProfilePhotoUrl() {
    if (profilePhotoUrl) { URL.revokeObjectURL(profilePhotoUrl); profilePhotoUrl = ''; }
    if (!state.profile.profilePhotoId) return '';
    const record = await dbGetFile(state.profile.profilePhotoId);
    if (!record?.blob) return '';
    profilePhotoUrl = URL.createObjectURL(record.blob);
    return profilePhotoUrl;
  }

  function renderIdCard() {
    const p = state.profile; const complete = p.firstName && p.lastName && p.email && p.role;
    return `${routeHeader('Digital ID Card', 'Generate an identification card from the profile information you entered.', complete ? actionButton('Download ID Card','download-id','module-button--primary','i-download') : '')}<div class="module-grid"><section class="module-card module-card--full"><h2>${icon('i-id')}Current Card</h2>${complete ? `<article class="digital-id" data-id-card><img src="assets/rtbo-logo.webp" alt="Raising The Bar Officiating"><div><p class="module-kicker">Got U Nex Ref</p><h2>${esc(`${p.firstName} ${p.lastName}`)}</h2><dl><dt>Role</dt><dd>${esc(p.role)}</dd><dt>Email</dt><dd>${esc(p.email)}</dd><dt>Location</dt><dd>${esc([p.city,p.region].filter(Boolean).join(', '))}</dd><dt>Experience</dt><dd>${p.yearsExperience ? `${esc(p.yearsExperience)} years` : 'Not entered'}</dd></dl></div></article>` : emptyMessage('Profile required', 'Complete your first name, last name, email, and role before generating an ID card.')}</section></div>`;
  }

  function renderReviews() {
    const average = state.reviews.length ? state.reviews.reduce((sum, r) => sum + Number(r.overall), 0) / state.reviews.length : 0;
    return `${routeHeader('Reviews', 'Record actual evaluation scores and feedback. Dashboard averages are calculated from your entries.')}
      <div class="home-metrics compact"><article><strong>${state.reviews.length}</strong><p>Reviews</p></article><article><strong>${average ? average.toFixed(1) : '—'}</strong><p>Overall Average</p></article></div><div class="module-grid"><section class="module-card module-card--wide"><h2>${icon('i-star')}Evaluation History</h2><div class="module-list">${state.reviews.length ? state.reviews.map((r) => `<article class="module-list__item"><div><h3>${esc(r.game)}</h3><p>${fmtDate(r.date)}${r.evaluator ? ` · ${esc(r.evaluator)}` : ''}</p><small>${esc(r.comments || '')}</small></div><div class="item-actions"><strong>${esc(r.overall)}/5</strong><button type="button" data-action="edit-review" data-id="${r.id}" aria-label="Edit review">${icon('i-edit')}</button><button type="button" data-action="delete-review" data-id="${r.id}" aria-label="Delete review">${icon('i-trash')}</button></div></article>`).join('') : emptyMessage('No reviews', 'Add an evaluation to begin tracking feedback.')}</div></section>
      <aside class="module-card"><h2>${icon('i-plus')}Add or Update Review</h2><form class="module-form stacked-form" data-form="review"><input type="hidden" name="id">${field('Game or Event','game','text','',true)}${field('Date','date','date','',true)}${field('Evaluator','evaluator')}${field('Overall Score','overall','select','',true,[option('','', 'Select score'),option('1',''),option('2',''),option('3',''),option('4',''),option('5','')].join(''))}${field('Mechanics Score','mechanics','select','',false,[option('','', 'Select score'),option('1',''),option('2',''),option('3',''),option('4',''),option('5','')].join(''))}${field('Judgment Score','judgment','select','',false,[option('','', 'Select score'),option('1',''),option('2',''),option('3',''),option('4',''),option('5','')].join(''))}${field('Communication Score','communication','select','',false,[option('','', 'Select score'),option('1',''),option('2',''),option('3',''),option('4',''),option('5','')].join(''))}${field('Comments','comments','textarea')}<div class="form-actions"><button class="module-button module-button--primary" type="submit">Save Review</button><button class="module-button module-button--quiet" type="reset">Clear</button></div></form></aside></div>`;
  }

  function renderSupport() {
    return `${routeHeader('Support', 'Create and track support requests locally. Connect this module to the production support service when the backend is ready.')}
      <div class="module-grid"><section class="module-card module-card--wide"><h2>${icon('i-help')}Support Requests</h2><div class="module-list">${state.supportTickets.length ? state.supportTickets.map((t) => `<article class="module-list__item"><div><h3>${esc(t.subject)}</h3><p>${esc(t.category)} · ${fmtDateTime(t.createdAt)}</p><small>${esc(t.message)}</small></div><div class="item-actions"><span class="status-pill">${esc(t.status)}</span><button type="button" data-action="toggle-ticket" data-id="${t.id}">${t.status === 'Open' ? 'Close' : 'Reopen'}</button><button type="button" data-action="delete-ticket" data-id="${t.id}" aria-label="Delete support request">${icon('i-trash')}</button></div></article>`).join('') : emptyMessage('No support requests', 'Submit a request when you need assistance.')}</div></section>
      <aside class="module-card"><h2>${icon('i-plus')}New Support Request</h2><form class="module-form stacked-form" data-form="support">${field('Subject','subject','text','',true)}${field('Category','category','select','',true,[option('Technical','Technical'),option('Account',''),option('Assignments',''),option('Payments',''),option('Documents',''),option('Other','')].join(''))}${field('Message','message','textarea','',true)}<button class="module-button module-button--primary" type="submit">Save Request</button></form></aside></div>`;
  }

  function renderSettings() {
    const s = state.settings;
    return `${routeHeader('Settings', 'Control local dashboard preferences, export your records, or permanently clear this browser data.')}
      <div class="module-grid"><section class="module-card module-card--half"><h2>${icon('i-settings')}Preferences</h2><div class="preference-list">${preference('Assignment alerts','assignmentAlerts',s.assignmentAlerts)}${preference('Message alerts','messageAlerts',s.messageAlerts)}${preference('Payment alerts','paymentAlerts',s.paymentAlerts)}${preference('Profile visible to connected organizations','profileVisible',s.profileVisible)}${preference('Reduce motion','reducedMotion',s.reducedMotion)}</div></section><section class="module-card module-card--half"><h2>${icon('i-download')}Data Management</h2><div class="settings-actions"><button class="module-button" type="button" data-action="export-data">Export Dashboard Data</button><label class="module-button import-button">Import Dashboard Data<input type="file" accept="application/json" data-import-data></label><button class="module-button danger-button" type="button" data-action="reset-data">Clear All Dashboard Data</button></div><p class="local-storage-note">Records are stored in localStorage. Uploaded files are stored in IndexedDB on this device.</p></section></div>`;
  }
  function preference(label, key, pressed) { return `<div class="preference"><span>${esc(label)}</span><button type="button" data-action="toggle-setting" data-key="${key}" aria-pressed="${pressed}"><span class="sr-only">Toggle ${esc(label)}</span></button></div>`; }

  function updateChrome() {
    const p = state.profile; const name = [p.firstName,p.lastName].filter(Boolean).join(' ');
    document.querySelector('[data-profile-name]').textContent = name || 'Set up profile';
    document.querySelector('[data-profile-role]').textContent = p.role || 'Account';
    document.querySelector('[data-profile-avatar]').textContent = name ? `${p.firstName[0] || ''}${p.lastName[0] || ''}`.toUpperCase() : 'GU';
    const unread = state.notifications.filter((n) => !n.read).length;
    const badge = document.querySelector('[data-notification-badge]'); badge.hidden = !unread; badge.textContent = unread || '';
    const messageUnread = (state.conversations || []).map(normalizeConversation).reduce((sum, conversation) => sum + conversation.unreadCount, 0);
    const messageBadge = document.querySelector('[data-message-badge]'); if (messageBadge) { messageBadge.hidden = !messageUnread; messageBadge.textContent = messageUnread || ''; }
    const list = document.querySelector('[data-notification-list]');
    list.innerHTML = state.notifications.length ? state.notifications.slice(0, 10).map((n) => `<article class="notification-item ${n.read ? '' : 'is-unread'}"><p>${esc(n.text)}</p><small>${fmtDateTime(n.at)}</small></article>`).join('') : `<p class="notification-empty">No notifications.</p>`;
    document.body.classList.toggle('reduce-motion', Boolean(state.settings.reducedMotion));
  }

  async function renderRoute(route) {
    const safeRoute = routes[route] ? route : 'home';
    document.querySelectorAll('[data-route]').forEach((link) => link.classList.toggle('is-active', link.dataset.route === safeRoute));
    const output = routes[safeRoute](); moduleView.innerHTML = output instanceof Promise ? await output : output;
    shell.classList.toggle('is-published-assignment-view', safeRoute === 'assignments' && ((assignmentUi.section === 'my-games' && Boolean(myGamesUi.detailId)) || (assignmentUi.section === 'published' && Boolean(publishedGamesUi.detailId))));
    if (safeRoute === 'assignments') hydratePublishedAssignmentMedia();
    if (safeRoute === 'users') updateUserBuilderPreview();
    if (safeRoute === 'forms') hydrateFormsTools();
    if (safeRoute === 'messages') hydrateMessageMedia();
    if (safeRoute === 'schools') hydrateSchoolLogos();
    document.title = `Got U Nex Ref | ${safeRoute === 'home' ? 'Dashboard' : safeRoute.replace(/(^|-)(\w)/g, (_, __, char) => char.toUpperCase())}`;
    shell.classList.remove('is-sidebar-open'); sidebarToggle.setAttribute('aria-expanded','false');
    moduleView.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: state.settings.reducedMotion ? 'auto' : 'smooth' });
  }

  function formData(form) { return Object.fromEntries(new FormData(form).entries()); }
  function upsert(collection, item) { const index = collection.findIndex((x) => x.id === item.id); if (index >= 0) collection[index] = item; else collection.unshift(item); }
  function fillForm(formSelector, data) { const form = moduleView.querySelector(formSelector); if (!form) return; Object.entries(data).forEach(([key,value]) => { const input = form.elements.namedItem(key); if (!input) return; if (input.type === 'checkbox') input.checked = Boolean(value); else input.value = value ?? ''; }); form.scrollIntoView({ behavior: state.settings.reducedMotion ? 'auto' : 'smooth', block: 'center' }); }

  moduleView.addEventListener('submit', async (event) => {
    const form = event.target.closest('form[data-form]'); if (!form) return; event.preventDefault(); if (!event.submitter?.formNoValidate && !form.reportValidity()) return;
    const data = formData(form); const type = form.dataset.form;
    if (type === 'create-game-assignment') { saveCreateGame('Pending'); return; }
    if (type === 'master-game') {
      const existing = (state.masterGames || []).find((item) => item.id === data.id);
      data.crewSize = Number(data.crewSize) === 2 ? 2 : 3;
      if (data.crewSize === 2) data.umpire2Id = '';
      const roleKeys = data.crewSize === 2 ? ['refereeId','umpire1Id','alternateId'] : ['refereeId','umpire1Id','umpire2Id','alternateId'];
      const crew = roleKeys.map((role) => data[role]).filter(Boolean);
      if (new Set(crew).size !== crew.length) { showToast('Each crew position must use a different official.'); return; }
      const now = new Date().toISOString();
      const crewIds = new Set(crew);
      const previousResponses = existing?.officialResponses && typeof existing.officialResponses === 'object' ? existing.officialResponses : {};
      const officialResponses = Object.fromEntries(Object.entries(previousResponses).filter(([officialId]) => crewIds.has(officialId)));
      const record = { ...(existing || {}), ...data, id: data.id || uid('game'), travelMiles: data.travelMiles === '' ? '' : Math.max(0, Number(data.travelMiles) || 0), officialResponses, createdAt: existing?.createdAt || now, updatedAt: now };
      if (record.status === 'Published') record.publishedAt = existing?.publishedAt || now; else record.publishedAt = '';
      state.masterGames = state.masterGames || [];
      upsert(state.masterGames, record);
      notify(data.id ? 'Master schedule game updated.' : 'Game added to the master schedule.');
    }
    if (type === 'assignment') {
      const existing = state.assignments.find((item) => item.id === data.id);
      if (data.status === 'Declined' && !existing?.declineReason) { showToast('Use Decline assignment so a reason is recorded.'); return; }
      const now = new Date().toISOString();
      const record = {
        ...(existing || {}), ...data, id: data.id || uid('assignment'),
        submittedCount: data.submittedCount === '' ? '' : Math.max(0, Number(data.submittedCount)),
        expectedCount: data.expectedCount === '' ? '' : Math.max(0, Number(data.expectedCount)),
        createdAt: existing?.createdAt || now, updatedAt: now
      };
      if (record.status !== 'Declined') { delete record.declineReason; delete record.declineReasonDetails; delete record.declinedAt; }
      upsert(state.assignments, record); notify(data.id ? 'Assignment updated.' : 'Assignment added.');
    }
    if (type === 'assignment-decline') {
      const assignment = state.assignments.find((item) => item.id === data.id);
      if (!assignment) { showToast('Assignment not found.'); return; }
      if (!data.reason) { showToast('Choose a decline reason.'); return; }
      const details = String(data.notes || '').trim();
      if (data.reason === 'other' && !details) { showToast('Enter the Other reason.'); return; }
      const addToCalendar = form.elements.addToCalendar.checked;
      if (addToCalendar && (!data.date || !data.startTime)) { showToast('Enter the calendar date and start time.'); return; }
      if (addToCalendar && data.endTime && data.endTime <= data.startTime) { showToast('End time must be later than start time.'); return; }
      const now = new Date().toISOString();
      assignment.status = 'Declined';
      assignment.declineReason = data.reason;
      assignment.declineReasonDetails = details;
      assignment.declinedAt = now;
      assignment.updatedAt = now;
      state.calendarBlocks = state.calendarBlocks || [];
      const linkedBlock = state.calendarBlocks.find((item) => item.sourceAssignmentId === assignment.id);
      if (addToCalendar) {
        const blockRecord = { ...(linkedBlock || {}), id: linkedBlock?.id || uid('block'), sourceAssignmentId: assignment.id, date: data.date, startTime: data.startTime, endTime: data.endTime || '', reason: data.reason, notes: details, createdAt: linkedBlock?.createdAt || now, updatedAt: now };
        upsert(state.calendarBlocks, blockRecord);
      } else if (linkedBlock) {
        state.calendarBlocks = state.calendarBlocks.filter((item) => item.id !== linkedBlock.id);
      }
      notify(`Assignment declined: ${blockReasonDisplay({ reason: data.reason, notes: details })}.`);
    }
    if (type === 'my-game-decline') {
      const game = (state.masterGames || []).find((item) => item.id === data.id);
      const key = game ? myGameAssignmentKey(game) : '';
      if (!game || !key) { showToast('This game is not assigned to the current profile.'); return; }
      if (!data.reason) { showToast('Choose a decline reason.'); return; }
      const details = String(data.notes || '').trim();
      if (data.reason === 'other' && !details) { showToast('Enter the Other reason.'); return; }
      const now = new Date().toISOString();
      game.officialResponses = game.officialResponses && typeof game.officialResponses === 'object' ? game.officialResponses : {};
      game.officialResponses[key] = { status: 'Declined', reason: data.reason, details, respondedAt: now };
      state.calendarBlocks = state.calendarBlocks || [];
      const linkedBlock = state.calendarBlocks.find((item) => item.sourceMasterGameId === game.id);
      if (form.elements.addToCalendar.checked && game.date && game.startTime) {
        const block = { ...(linkedBlock || {}), id: linkedBlock?.id || uid('block'), sourceMasterGameId: game.id, date: game.date, startTime: game.startTime, endTime: '', reason: data.reason, reasonDetails: data.reason === 'other' ? details : '', notes: details, createdAt: linkedBlock?.createdAt || now, updatedAt: now };
        upsert(state.calendarBlocks, block);
      } else if (linkedBlock) {
        state.calendarBlocks = state.calendarBlocks.filter((item) => item.id !== linkedBlock.id);
      }
      notify(`Game declined: ${blockReasonDisplay({ reason: data.reason, notes: details })}.`);
    }
    if (type === 'calendar-availability') {
      if (data.status) state.calendarAvailability[data.date] = { status: data.status, notes: String(data.notes || '').trim(), updatedAt: new Date().toISOString() };
      else delete state.calendarAvailability[data.date];
      calendarUi.selectedDate = data.date; notify(data.status ? 'Availability date updated.' : 'Availability date cleared.');
    }
    if (type === 'calendar-block') {
      if (data.endTime && data.startTime && data.endTime <= data.startTime) { showToast('End time must be later than start time.'); return; }
      if (!data.reason) { showToast('Choose a block reason.'); return; }
      const details = String(data.notes || '').trim();
      if (data.reason === 'other' && !details) { showToast('Enter the Other reason.'); return; }
      const existing = (state.calendarBlocks || []).find((item) => item.id === data.id);
      const now = new Date().toISOString();
      const record = { ...(existing || {}), id: data.id || uid('block'), date: data.date, startTime: data.startTime, endTime: data.endTime || '', reason: data.reason, reasonDetails: data.reason === 'other' ? details : '', notes: details, createdAt: existing?.createdAt || now, updatedAt: now };
      state.calendarBlocks = state.calendarBlocks || [];
      upsert(state.calendarBlocks, record);
      calendarUi.selectedDate = data.date;
      notify(data.id ? 'Blocked time updated.' : 'Date and time blocked.');
    }
    if (type === 'report-official') {
      const existing = state.officials.find((item) => item.id === data.id);
      const now = new Date().toISOString();
      const record = { ...(existing || {}), ...data, id: data.id || uid('official'), createdAt: existing?.createdAt || now, updatedAt: now };
      upsert(state.officials, record); notify(data.id ? 'Official updated.' : 'Official added.');
    }
    if (type === 'report-availability') {
      const start = dateFromKey(data.startDate); const end = dateFromKey(data.endDate);
      if (start > end) { showToast('The end date must be on or after the start date.'); return; }
      const now = new Date().toISOString();
      for (let date = new Date(start); date <= end; date = addDays(date, 1)) {
        const value = dateKey(date);
        const existing = state.officialAvailability.find((item) => item.officialId === data.officialId && item.date === value);
        const record = { ...(existing || {}), id: existing?.id || uid('availability'), officialId: data.officialId, date: value, status: data.status, notes: String(data.notes || '').trim(), updatedAt: now, createdAt: existing?.createdAt || now };
        upsert(state.officialAvailability, record);
      }
      notify('Official availability recorded.');
    }
    if (type === 'official-profile') {
      const existing = state.users.find((item) => item.id === data.id) || state.userDrafts.find((item) => item.id === data.id);
      if (!existing) { showToast('Official record not found.'); return; }
      const firstName = String(data.firstName || '').trim();
      const lastName = String(data.lastName || '').trim();
      const email = String(data.email || '').trim();
      if (!firstName || !lastName || !email) { showToast('First name, last name, and email are required.'); return; }
      if (!form.elements.email.checkValidity()) { showToast('Enter a valid email address.'); return; }
      if ([...state.users, ...state.userDrafts].some((item) => item.id !== existing.id && String(item.email || '').trim().toLowerCase() === email.toLowerCase())) { showToast('That email address is already assigned to another official.'); return; }
      const photo = form.elements.profilePhoto?.files?.[0];
      let photoId = existing.photoId || '';
      if (photo) {
        if (!photo.type.startsWith('image/')) { showToast('Choose a JPG, PNG, or WebP image.'); return; }
        if (photo.size > 5 * 1024 * 1024) { showToast('Profile photos must be 5 MB or smaller.'); return; }
        if (photoId) await dbDeleteFile(photoId);
        const stored = await dbPutFile(photo, 'user-photo');
        photoId = stored.id;
      }
      const now = new Date().toISOString();
      const updated = {
        ...existing,
        firstName,
        lastName,
        preferredName: String(data.preferredName || '').trim(),
        email,
        mobilePhone: String(data.mobilePhone || '').trim(),
        dateOfBirth: data.dateOfBirth || '',
        street: String(data.street || '').trim(),
        city: String(data.city || '').trim(),
        region: String(data.region || '').trim(),
        postalCode: String(data.postalCode || '').trim(),
        yearsExperience: data.yearsExperience === '' ? '' : Math.max(0, Number(data.yearsExperience) || 0),
        preferredLevel: data.preferredLevel || '',
        primarySport: data.primarySport || '',
        uniformSize: data.uniformSize || '',
        membershipNumber: String(data.membershipNumber || '').trim(),
        officialId: String(data.officialId || '').trim(),
        backgroundCheckStatus: data.backgroundCheckStatus || '',
        backgroundCheckDate: data.backgroundCheckDate || '',
        safeSportStatus: data.safeSportStatus || '',
        safeSportDate: data.safeSportDate || '',
        photoId,
        updatedAt: now
      };
      const target = existing.recordStatus === 'Draft' ? state.userDrafts : state.users;
      upsert(target, updated);
      saveState();
      notify('Official profile updated.');
      await renderRoute('users');
      return;
    }
    if (type === 'user-account') {
      const intent = event.submitter?.value || 'create';
      const validationMessage = validateUserRecord(form, intent);
      if (validationMessage) { showToast(validationMessage); return; }
      const existing = state.users.find((item) => item.id === data.id) || state.userDrafts.find((item) => item.id === data.id);
      const permissions = selectedPermissions(form);
      const photo = form.elements.profilePhoto?.files?.[0];
      let photoId = existing?.photoId || '';
      if (photo) {
        if (photo.size > 5 * 1024 * 1024) { showToast('Profile photos must be 5 MB or smaller.'); return; }
        if (photoId) await dbDeleteFile(photoId);
        const stored = await dbPutFile(photo, 'user-photo'); photoId = stored.id;
      }
      const now = new Date().toISOString();
      const record = {
        ...(existing || {}), id: data.id || uid('user'), role: data.role || '', firstName: data.firstName.trim(), lastName: data.lastName.trim(), email: data.email.trim(),
        mobilePhone: data.mobilePhone.trim(), alternatePhone: data.alternatePhone.trim(), dateOfBirth: data.dateOfBirth || '', organizationName: data.organizationName || '',
        schoolTeam: data.schoolTeam || '', department: data.department.trim(), positionTitle: data.positionTitle.trim(), street: data.street.trim(), city: data.city.trim(), region: data.region.trim(),
        postalCode: data.postalCode.trim(), permissions, username: data.username.trim(), sendInviteEmail: form.elements.sendInviteEmail.checked, requirePasswordReset: form.elements.requirePasswordReset.checked,
        twoFactorEnabled: form.elements.twoFactorEnabled.checked, active: data.directoryStatus === 'Inactive' ? false : form.elements.active.checked, photoId, notes: data.notes.trim(), passwordConfigured: Boolean(data.temporaryPassword || existing?.passwordConfigured),
        officialId: String(data.officialId || '').trim(), certification: String(data.certification || '').trim(), certificationExpires: data.certificationExpires || '', joinedDate: data.joinedDate || '', directoryStatus: data.directoryStatus || '', positions: [...form.querySelectorAll('input[name="positions"]:checked')].map((input) => input.value),
        createdAt: existing?.createdAt || now, updatedAt: now, recordStatus: intent === 'draft' ? 'Draft' : 'User', inviteStatus: existing?.inviteStatus || 'Not requested'
      };
      state.users = state.users.filter((item) => item.id !== record.id); state.userDrafts = state.userDrafts.filter((item) => item.id !== record.id);
      if (intent === 'draft') {
        state.userDrafts.unshift(record); notify(existing ? 'Official draft updated.' : 'Official draft saved.');
      } else {
        if (intent === 'invite' && record.sendInviteEmail) {
          record.inviteStatus = 'Ready to send'; record.invitePreparedAt = now;
          state.invitations.unshift({ id: uid('invite'), userId: record.id, email: record.email, status: 'Ready to send', preparedAt: now });
        }
        state.users.unshift(record); notify(existing ? 'Official account updated.' : 'Official account created.');
      }
      saveState();
      if (intent === 'invite' && record.sendInviteEmail) createInviteMailto(record, data.temporaryPassword || '');
      usersUi.mode = 'list'; usersUi.editingId = ''; await renderRoute('users'); return;
    }
    if (type === 'school-pair') {
      const readSide = (side) => {
        const mode = form.elements[`${side}Mode`]?.value === 'new' ? 'new' : 'existing';
        const schoolId = mode === 'existing' ? String(form.elements[`${side}SchoolId`]?.value || '').trim() : '';
        const existing = schoolId ? (state.schools || []).find((school) => school.id === schoolId) : null;
        const name = mode === 'new' ? String(form.elements[`${side}Name`]?.value || '').trim() : schoolDisplayName(existing || {});
        return {
          side,
          mode,
          schoolId,
          existing,
          name,
          mascotName: String(form.elements[`${side}MascotName`]?.value || '').trim(),
          teamLevel: String(form.elements[`${side}TeamLevel`]?.value || '').trim(),
          primaryColor: schoolSafeColor(form.elements[`${side}PrimaryColor`]?.value || ''),
          secondaryColor: schoolSafeColor(form.elements[`${side}SecondaryColor`]?.value || ''),
          logo: form.elements[`${side}Logo`]?.files?.[0] || schoolPairDraft(side).pendingLogoFile || null,
          removeLogo: Boolean(schoolPairDraft(side).removeLogo)
        };
      };
      const homeInput = readSide('home');
      const visitingInput = readSide('visiting');
      for (const item of [homeInput, visitingInput]) {
        if (item.mode === 'existing' && !item.existing) { showToast(`Select an existing ${item.side === 'home' ? 'home' : 'visiting'} school or team.`); return; }
        if (!item.name || !item.mascotName || !item.teamLevel) { showToast(`Complete the required ${item.side === 'home' ? 'home' : 'visiting'} team fields.`); return; }
        if (item.logo && !['image/png','image/jpeg','image/svg+xml'].includes(item.logo.type)) { showToast('Team logos must be PNG, JPG, or SVG files.'); return; }
        if (item.logo && item.logo.size > 2 * 1024 * 1024) { showToast('Team logos must be 2 MB or smaller.'); return; }
        const hasSavedLogo = Boolean(item.existing && !item.removeLogo && (item.existing.logoFileId || item.existing.logoUrl || item.existing.logo));
        if (!item.logo && !hasSavedLogo) { showToast(`Upload an actual ${item.side === 'home' ? 'home' : 'visiting'} team logo.`); return; }
        if (item.mode === 'new') {
          const duplicate = (state.schools || []).find((school) => schoolDisplayName(school).toLowerCase() === item.name.toLowerCase());
          if (duplicate) { showToast(`${item.name} already exists. Choose it from the existing school/team list.`); return; }
        }
      }
      if ((homeInput.schoolId && homeInput.schoolId === visitingInput.schoolId) || homeInput.name.toLowerCase() === visitingInput.name.toLowerCase()) { showToast('The home team and visiting team must be different organizations.'); return; }
      const saveSide = async (item) => {
        const now = new Date().toISOString();
        const existing = item.existing;
        let logoFileId = String(existing?.logoFileId || '').trim();
        let logoUrl = String(existing?.logoUrl || existing?.logo || '').trim();
        if (item.removeLogo && logoFileId) { await dbDeleteFile(logoFileId); logoFileId = ''; logoUrl = ''; }
        if (item.logo) {
          if (logoFileId) await dbDeleteFile(logoFileId);
          const stored = await dbPutFile(item.logo, 'school-logo');
          logoFileId = stored.id;
          logoUrl = '';
        }
        const record = {
          ...(existing || {}),
          id: existing?.id || uid('school'),
          name: item.name,
          type: existing?.type || 'School / Team',
          mascotName: item.mascotName,
          teamLevel: item.teamLevel,
          primaryColor: item.primaryColor,
          secondaryColor: item.secondaryColor,
          logoFileId,
          logoUrl,
          contacts: Array.isArray(existing?.contacts) ? existing.contacts : [],
          createdAt: existing?.createdAt || now,
          updatedAt: now
        };
        state.schools = state.schools || [];
        upsert(state.schools, record);
        return record;
      };
      const home = await saveSide(homeInput);
      const visiting = await saveSide(visitingInput);
      schoolsUi.pair = { homeId: home.id, visitingId: visiting.id };
      schoolsUi.selectedId = home.id;
      schoolsUi.editingContactId = '';
      schoolsUi.drafts = { home: schoolDraftFromRecord('home', home), visiting: schoolDraftFromRecord('visiting', visiting) };
      schoolsUi.section = 'contacts';
      createGameUiByCrew[2].homeTeam = schoolDisplayName(home);
      createGameUiByCrew[2].awayTeam = schoolDisplayName(visiting);
      createGameUiByCrew[3].homeTeam = schoolDisplayName(home);
      createGameUiByCrew[3].awayTeam = schoolDisplayName(visiting);
      notify('Home and visiting team records saved.');
    }
    if (type === 'school') {
      const existing = (state.schools || []).find((item) => item.id === data.id);
      const now = new Date().toISOString();
      const record = { ...(existing || {}), ...data, id: data.id || uid('school'), contacts: Array.isArray(existing?.contacts) ? existing.contacts : [], createdAt: existing?.createdAt || now, updatedAt: now };
      state.schools = state.schools || [];
      upsert(state.schools, record);
      schoolsUi.selectedId = record.id;
      notify(data.id ? 'School or team updated.' : 'School or team added.');
    }
    if (type === 'school-contact') {
      const school = (state.schools || []).find((item) => item.id === data.schoolId);
      if (!school) { showToast('Select a school or team before saving a contact.'); return; }
      let contacts = schoolContacts(school).map((contact) => ({ ...contact }));
      const existing = contacts.find((contact) => contact.id === data.id);
      if (!existing && contacts.length >= 7) { showToast('A school or team can have no more than 7 contacts.'); return; }
      if (data.role !== 'other' && contacts.some((contact) => contact.id !== data.id && contact.role === data.role)) { showToast(`${schoolContactRole(data.role).label} has already been added.`); return; }
      const now = new Date().toISOString();
      const record = normalizeSchoolContact({ ...(existing || {}), ...data, id: data.id || uid('school-contact'), createdAt: existing?.createdAt || now, updatedAt: now });
      delete record.schoolId;
      delete record.applyAddressToAll;
      upsert(contacts, record);
      if (form.elements.applyAddressToAll.checked) {
        const address = { address1: record.address1, address2: record.address2, city: record.city, region: record.region, postalCode: record.postalCode, country: record.country };
        contacts = contacts.map((contact) => ({ ...contact, ...address, updatedAt: now }));
        school.address1 = record.address1;
        school.address2 = record.address2;
        school.city = record.city;
        school.region = record.region;
        school.postalCode = record.postalCode;
        school.country = record.country;
      }
      school.contacts = contacts;
      school.updatedAt = now;
      syncSchoolLegacyContacts(school);
      schoolsUi.selectedId = school.id;
      schoolsUi.editingContactId = '';
      schoolsUi.section = 'contacts';
      notify(existing ? 'Team contact updated.' : 'Team contact added.');
    }
    if (type === 'payment') { upsert(state.payments,{...data,id:data.id||uid('payment'),amount:Number(data.amount)}); notify(data.id ? 'Payment record updated.' : 'Payment record added.'); }
    if (type === 'tax-profile') { state.taxProfile = {...state.taxProfile,...data,electronicDelivery:form.elements.electronicDelivery.checked}; notify('Tax profile updated.'); }
    if (type === 'form-record') { upsert(state.forms,{...data,id:data.id||uid('form')}); notify(data.id ? 'Form record updated.' : 'Form record added.'); }
    if (type === 'resource') { upsert(state.resources,{...data,id:data.id||uid('resource')}); notify(data.id ? 'Resource link updated.' : 'Resource link added.'); }
    if (type === 'product') { upsert(state.products,{...data,id:data.id||uid('product'),price:Number(data.price)}); notify(data.id ? 'Product updated.' : 'Product added.'); }
    if (type === 'conversation') {
      const contact = messageContactByKey(data.contactKey);
      if (!contact) { showToast('Select a saved recipient.'); return; }
      const attachment = form.elements.attachment?.files?.[0];
      if (attachment && attachment.size > 10 * 1024 * 1024) { showToast('Message attachments must be 10 MB or smaller.'); return; }
      let attachmentRecord = null;
      if (attachment) attachmentRecord = await dbPutFile(attachment, 'message-attachment');
      const now = new Date().toISOString();
      const relatedGame = data.relatedGameId ? (state.masterGames || []).map(normalizeMasterGame).find((game) => game.id === data.relatedGameId) : null;
      const derivedSubject = relatedGame ? [relatedGame.homeTeam, relatedGame.awayTeam].filter(Boolean).join(' vs ') : '';
      let conversation = (state.conversations || []).find((item) => item.contactKey === data.contactKey && !item.archived);
      const outgoing = { id: uid('message'), body: String(data.body || '').trim(), at: now, direction: 'outgoing', read: true, attachmentId: attachmentRecord?.id || '', attachmentName: attachmentRecord?.name || '', attachmentType: attachmentRecord?.type || '', attachmentSize: attachmentRecord?.size || 0 };
      if (conversation) {
        conversation.messages = Array.isArray(conversation.messages) ? conversation.messages : [];
        conversation.messages.push(outgoing);
        conversation.subject = String(data.subject || '').trim() || conversation.subject || derivedSubject;
        conversation.relatedGameId = data.relatedGameId || conversation.relatedGameId || '';
        conversation.category = data.category || conversation.category || (relatedGame ? 'assignments' : contact.category);
        conversation.updatedAt = now;
      } else {
        conversation = { id: uid('conversation'), contactKey: contact.key, source: contact.source, sourceId: contact.sourceId, name: contact.name, email: contact.email, phone: contact.phone, role: contact.role, organization: contact.organization, category: data.category || (relatedGame ? 'assignments' : contact.category), subject: String(data.subject || '').trim() || derivedSubject, relatedGameId: data.relatedGameId || '', photoId: contact.photoId, imageUrl: contact.imageUrl, videoUrl: contact.videoUrl, online: contact.online, unreadCount: 0, archived: false, messages: [outgoing], createdAt: now, updatedAt: now };
        state.conversations.unshift(conversation);
      }
      activeConversationId = conversation.id;
      notify('Message saved.');
      saveState();
      updateChrome();
      await renderRoute('messages');
      return;
    }
    if (type === 'message') {
      const conversation = state.conversations.find((item) => item.id === activeConversationId);
      if (!conversation) { showToast('Select a conversation first.'); return; }
      const body = String(data.body || '').trim();
      const attachment = form.elements.attachment?.files?.[0];
      if (!body && !attachment) { showToast('Enter a message or attach a file.'); return; }
      if (attachment && attachment.size > 10 * 1024 * 1024) { showToast('Message attachments must be 10 MB or smaller.'); return; }
      let attachmentRecord = null;
      if (attachment) attachmentRecord = await dbPutFile(attachment, 'message-attachment');
      const now = new Date().toISOString();
      conversation.messages = Array.isArray(conversation.messages) ? conversation.messages : [];
      conversation.messages.push({ id: uid('message'), body, at: now, direction: 'outgoing', read: true, attachmentId: attachmentRecord?.id || '', attachmentName: attachmentRecord?.name || '', attachmentType: attachmentRecord?.type || '', attachmentSize: attachmentRecord?.size || 0 });
      conversation.updatedAt = now;
      conversation.unreadCount = 0;
      notify('Message saved.');
      saveState();
      updateChrome();
      await renderRoute('messages');
      return;
    }
    if (type === 'incoming-message') {
      const conversation = state.conversations.find((item) => item.id === activeConversationId);
      const body = String(data.body || '').trim();
      if (!conversation || !body) return;
      const now = new Date().toISOString();
      conversation.messages = Array.isArray(conversation.messages) ? conversation.messages : [];
      conversation.messages.push({ id: uid('message'), body, at: now, direction: 'incoming', read: true });
      conversation.updatedAt = now;
      conversation.unreadCount = 0;
      notify('Received message recorded.');
      saveState();
      updateChrome();
      await renderRoute('messages');
      return;
    }
    if (type === 'profile') {
      const photo = form.elements.profilePhoto?.files?.[0];
      if (photo) {
        if (state.profile.profilePhotoId) await dbDeleteFile(state.profile.profilePhotoId);
        const record = await dbPutFile(photo, 'profile-photo');
        data.profilePhotoId = record.id;
      } else {
        data.profilePhotoId = state.profile.profilePhotoId || '';
      }
      delete data.profilePhoto;
      state.profile={...state.profile,...data}; notify('Profile updated.');
    }
    if (type === 'review') { upsert(state.reviews,{...data,id:data.id||uid('review')}); notify(data.id ? 'Review updated.' : 'Review added.'); }
    if (type === 'support') { state.supportTickets.unshift({...data,id:uid('ticket'),status:'Open',createdAt:new Date().toISOString()}); notify('Support request saved.'); }
    if (type === 'file-upload') { const file=form.elements.file.files[0]; if (!file) return; await dbPutFile(file,form.dataset.category); notify(`${file.name} uploaded.`); }
    saveState(); await renderRoute(location.hash.slice(1)||'home');
  });

  moduleView.addEventListener('input', (event) => {
    if (event.target.matches('[data-school-pair-field]')) {
      const side = event.target.dataset.side;
      const key = event.target.dataset.schoolPairField;
      const draft = schoolPairDraft(side);
      if (draft && key) draft[key] = event.target.value;
      if (key === 'primaryColor' || key === 'secondaryColor') {
        const valid = schoolSafeColor(event.target.value);
        if (valid) {
          const picker = event.target.closest('label')?.querySelector('[data-school-color-picker]');
          if (picker) picker.value = valid;
        }
      }
      return;
    }
    if (event.target.matches('[data-message-search]')) {
      messagesUi.query = event.target.value;
      moduleView.innerHTML = renderMessages();
      hydrateMessageMedia();
      const input = moduleView.querySelector('[data-message-search]');
      if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
      return;
    }
    if (event.target.matches('[data-my-game-decline-note]')) { const counter = event.target.closest('dialog')?.querySelector('[data-game-decline-note-count]'); if (counter) counter.textContent = String(event.target.value.length); return; }
    if (event.target.matches('[data-create-game-field]')) { createGameUi[event.target.name] = event.target.value; return; }
    if (event.target.matches('[data-create-official-query]')) { createGameUi.officialQuery = event.target.value; refreshAssignments(); const input = moduleView.querySelector('[data-create-official-query]'); if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } return; }
    if (event.target.matches('[data-tba-query]')) { tbaGamesUi.query = event.target.value; tbaGamesUi.page = 1; refreshAssignments(); const input = moduleView.querySelector('[data-tba-query]'); if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } return; }
    if (event.target.matches('[data-published-query]')) { publishedGamesUi.query = event.target.value; publishedGamesUi.page = 1; refreshAssignments(); const input = moduleView.querySelector('[data-published-query]'); if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } return; }
    if (event.target.matches('[data-quick-query]')) { quickAssignUi.query = event.target.value; quickAssignUi.page = 1; refreshAssignments(); const input = moduleView.querySelector('[data-quick-query]'); if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } return; }
    if (event.target.matches('[data-users-search]')) { usersUi.query = event.target.value; usersUi.page = 1; moduleView.innerHTML = userListView(); const input = moduleView.querySelector('[data-users-search]'); if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } return; }
    if (event.target.closest('form[data-form="official-profile"]')) { updateOfficialProfilePreview(); return; }
    if (event.target.closest('form[data-form="user-account"]')) { updateUserBuilderPreview(); return; }
    if (event.target.matches('[data-unpublished-query]')) { unpublishedScheduleUi.query = event.target.value; unpublishedScheduleUi.page = 1; refreshAssignments(); const input = moduleView.querySelector('[data-unpublished-query]'); if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } return; }
    if (event.target.matches('[data-master-query]')) {
      masterScheduleUi.query = event.target.value;
      masterScheduleUi.page = 1;
      refreshAssignments('master-query');
      const input = moduleView.querySelector('[data-master-query]');
      if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
      return;
    }
    if (event.target.matches('[data-report-search]')) {
      availabilityReportUi.query = event.target.value;
      availabilityReportUi.page = 1;
      moduleView.innerHTML = renderCalendar();
      const input = moduleView.querySelector('[data-report-search]');
      if (input) { input.focus(); const length = input.value.length; input.setSelectionRange(length, length); }
      return;
    }
    if (event.target.matches('[data-my-game-query]')) {
      myGamesUi.query = event.target.value; myGamesUi.page = 1; refreshAssignments();
      const input = moduleView.querySelector('[data-my-game-query]'); if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
      return;
    }
    if (event.target.matches('[data-assignment-query]')) {
      assignmentUi.query = event.target.value;
      assignmentUi.page = 1;
      refreshAssignments(event.target.dataset.querySlot || 'filters');
      return;
    }
    if (!event.target.matches('[data-search]')) return;
    const term=event.target.value.trim().toLowerCase();
    moduleView.querySelectorAll('[data-search-item]').forEach((item)=>{item.hidden=!item.textContent.toLowerCase().includes(term);});
  });

  moduleView.addEventListener('change', async (event) => {
    if (event.target.matches('[data-school-pair-mode]')) {
      const side = event.target.dataset.side;
      const draft = schoolPairDraft(side);
      draft.mode = event.target.value === 'new' ? 'new' : 'existing';
      if (draft.mode === 'new') {
        draft.schoolId = '';
        draft.name = '';
        draft.mascotName = '';
        draft.teamLevel = '';
        draft.logoFileId = '';
        draft.logoUrl = '';
        draft.removeLogo = false;
        draft.pendingLogoFile = null;
      }
      if (schoolsUi.logoPreviewUrls?.[side]) { URL.revokeObjectURL(schoolsUi.logoPreviewUrls[side]); schoolsUi.logoPreviewUrls[side] = ''; }
      await renderRoute('schools');
      return;
    }
    if (event.target.matches('[data-school-pair-select]')) {
      const side = event.target.dataset.side;
      const school = (state.schools || []).find((record) => record.id === event.target.value);
      schoolsUi.drafts[side] = school ? schoolDraftFromRecord(side, school) : schoolTeamDraftDefaults(side);
      schoolsUi.drafts[side].mode = 'existing';
      await renderRoute('schools');
      return;
    }
    if (event.target.matches('[data-school-color-picker]')) {
      const side = event.target.dataset.side;
      const key = event.target.dataset.colorKey;
      const draft = schoolPairDraft(side);
      draft[key] = event.target.value;
      const textName = `${side}${key === 'primaryColor' ? 'PrimaryColor' : 'SecondaryColor'}`;
      const text = event.target.form?.elements?.[textName];
      if (text) text.value = event.target.value.toUpperCase();
      return;
    }
    if (event.target.matches('[data-school-team-logo-input]')) {
      const side = event.target.dataset.side;
      const file = event.target.files?.[0];
      if (!file) return;
      if (!['image/png','image/jpeg','image/svg+xml'].includes(file.type)) { showToast('Team logos must be PNG, JPG, or SVG files.'); event.target.value = ''; return; }
      if (file.size > 2 * 1024 * 1024) { showToast('Team logos must be 2 MB or smaller.'); event.target.value = ''; return; }
      if (schoolsUi.logoPreviewUrls?.[side]) URL.revokeObjectURL(schoolsUi.logoPreviewUrls[side]);
      const url = URL.createObjectURL(file);
      schoolsUi.logoPreviewUrls[side] = url;
      const draft = schoolPairDraft(side);
      draft.removeLogo = false;
      draft.pendingLogoFile = file;
      const preview = moduleView.querySelector(`[data-school-pair-logo-preview="${side}"]`);
      if (preview) preview.innerHTML = `<img src="${esc(url)}" alt="Selected ${side === 'home' ? 'home' : 'visiting'} team logo">`;
      const remove = moduleView.querySelector(`[data-action="remove-school-pair-logo"][data-side="${side}"]`);
      if (remove) remove.hidden = false;
      return;
    }
    if (event.target.matches('[data-message-filter]')) {
      const key = event.target.dataset.messageFilter;
      messagesUi[key] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      moduleView.innerHTML = renderMessages();
      hydrateMessageMedia();
      return;
    }
    if (event.target.matches('[data-message-attachment]')) {
      const name = event.target.files?.[0]?.name || 'No file selected';
      const output = event.target.closest('form')?.querySelector('[data-message-file-name]');
      if (output) output.textContent = name;
      return;
    }
    if (event.target.matches('[data-tba-filter]')) { const key = event.target.dataset.tbaFilter; tbaGamesUi[key] = event.target.value; tbaGamesUi.page = 1; refreshAssignments(); return; }
    if (event.target.matches('[data-published-filter]')) { const key = event.target.dataset.publishedFilter; publishedGamesUi[key] = event.target.value; publishedGamesUi.page = 1; refreshAssignments(); return; }
    if (event.target.matches('[data-published-page-size]')) { publishedGamesUi.pageSize = Math.max(1, Number(event.target.value) || 10); publishedGamesUi.page = 1; refreshAssignments(); return; }
    if (event.target.matches('[data-published-select]')) { if (event.target.checked) publishedGamesUi.selected.add(event.target.value); else publishedGamesUi.selected.delete(event.target.value); refreshAssignments(); return; }
    if (event.target.matches('[data-published-select-all]')) { const checked = event.target.checked; const start = (publishedGamesUi.page - 1) * publishedGamesUi.pageSize; publishedGameFilteredRecords().slice(start, start + publishedGamesUi.pageSize).forEach((game) => { if (checked) publishedGamesUi.selected.add(game.id); else publishedGamesUi.selected.delete(game.id); }); refreshAssignments(); return; }
    if (event.target.matches('[data-tba-page-size]')) { tbaGamesUi.pageSize = Math.max(1, Number(event.target.value) || 10); tbaGamesUi.page = 1; refreshAssignments(); return; }
    if (event.target.matches('[data-quick-filter]')) { const key = event.target.dataset.quickFilter; quickAssignUi[key] = event.target.value; quickAssignUi.page = 1; refreshAssignments(); return; }
    if (event.target.matches('[data-quick-page-size]')) { quickAssignUi.pageSize = Math.max(1, Number(event.target.value) || 10); quickAssignUi.page = 1; refreshAssignments(); return; }
    if (event.target.matches('[data-official-filter]')) {
      const key = event.target.dataset.officialFilter;
      if (key && Object.prototype.hasOwnProperty.call(usersUi, key)) usersUi[key] = event.target.value;
      usersUi.page = 1;
      moduleView.innerHTML = userListView();
      return;
    }
    if (event.target.matches('[data-official-page-size]')) {
      usersUi.pageSize = Math.max(1, Number(event.target.value) || 25);
      usersUi.page = 1;
      moduleView.innerHTML = userListView();
      return;
    }
    if (event.target.matches('[data-official-column]')) {
      if (event.target.checked) usersUi.columns.add(event.target.value); else usersUi.columns.delete(event.target.value);
      moduleView.innerHTML = userListView();
      return;
    }
    if (event.target.matches('[data-import-officials]')) {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const rows = /json/i.test(file.type) || file.name.toLowerCase().endsWith('.json') ? JSON.parse(text) : parseOfficialsCsv(text);
        const records = Array.isArray(rows) ? rows : Array.isArray(rows?.officials) ? rows.officials : [];
        const result = importOfficialRecords(records);
        saveState();
        moduleView.innerHTML = userListView();
        showToast(`${result.added} official${result.added === 1 ? '' : 's'} imported${result.skipped ? `; ${result.skipped} skipped` : ''}.`);
      } catch (error) {
        showToast('The selected official roster could not be imported.');
      }
      return;
    }
    if (event.target.matches('form[data-form="master-game"] select[name="crewSize"]')) { syncMasterCrewSizeField(event.target.form); return; }
    if (event.target.matches('[data-create-game-field]')) { createGameUi[event.target.name] = event.target.value; if (event.target.name === 'gymName') { const venue = createGameVenues().find((item) => item.name.toLowerCase() === event.target.value.trim().toLowerCase()); createGameUi.address = venue?.address || ''; createGameUi.venuePhone = venue?.phone || ''; } if (event.target.name === 'homeTeam' && !createGameUi.gymName) { const school = createGameSchoolRecord(event.target.value); const venueName = school?.venueName || school?.gymName || ''; if (venueName) { const venue = createGameVenues().find((item) => item.name.toLowerCase() === venueName.toLowerCase()); createGameUi.gymName = venueName; createGameUi.address = venue?.address || school?.venueAddress || school?.address || ''; createGameUi.venuePhone = venue?.phone || school?.venuePhone || school?.phone || ''; } } refreshAssignments(); return; }
    if (event.target.matches('[data-create-official-filter]')) { createGameUi[event.target.dataset.createOfficialFilter] = event.target.value; refreshAssignments(); return; }
    if (event.target.matches('form[data-form="user-account"] input[name="role"]')) {
      const role = USER_ROLES.find((item) => item.value === event.target.value); const form = event.target.form;
      if (role && form) form.querySelectorAll('input[name="permissions"]').forEach((input) => { input.checked = role.permissions.includes(input.value); });
      updateUserBuilderPreview(); return;
    }
    if (event.target.matches('form[data-form="user-account"] input[name="profilePhoto"], form[data-form="official-profile"] input[name="profilePhoto"]')) {
      const file = event.target.files?.[0]; if (!file) return;
      if (!file.type.startsWith('image/')) { showToast('Choose an image file.'); event.target.value = ''; return; }
      if (file.size > 5 * 1024 * 1024) { showToast('Profile photos must be 5 MB or smaller.'); event.target.value = ''; return; }
      if (userPhotoPreviewUrl) URL.revokeObjectURL(userPhotoPreviewUrl); userPhotoPreviewUrl = URL.createObjectURL(file);
      moduleView.querySelectorAll('[data-user-photo-preview], [data-user-preview-avatar]').forEach((preview) => { preview.innerHTML = `<img src="${userPhotoPreviewUrl}" alt="Selected profile photo">`; });
      return;
    }
    if (event.target.matches('[data-report-page-size]')) {
      availabilityReportUi.pageSize = Number(event.target.value) || 10;
      availabilityReportUi.page = 1;
      refreshCalendar();
      return;
    }
    const reportFilter = event.target.dataset.reportFilter;
    if (reportFilter) {
      availabilityReportUi[reportFilter] = event.target.value;
      availabilityReportUi.page = 1;
      refreshCalendar();
      return;
    }
    if (event.target.matches('[data-my-game-sort]')) { myGamesUi.sort = event.target.value; myGamesUi.page = 1; refreshAssignments(); return; }
    if (event.target.matches('[data-my-game-filter]')) { const key = event.target.dataset.myGameFilter; myGamesUi[key] = event.target.value; myGamesUi.page = 1; refreshAssignments(); return; }
    if (event.target.matches('[data-unpublished-filter]')) { const key = event.target.dataset.unpublishedFilter; unpublishedScheduleUi[key] = event.target.type === 'checkbox' ? event.target.checked : event.target.value; unpublishedScheduleUi.page = 1; refreshAssignments(); return; }
    if (event.target.matches('[data-unpublished-page-size]')) { unpublishedScheduleUi.pageSize = Number(event.target.value) || 10; unpublishedScheduleUi.page = 1; refreshAssignments(); return; }
    if (event.target.matches('[data-master-filter]')) {
      const key = event.target.dataset.masterFilter;
      masterScheduleUi[key] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      masterScheduleUi.page = 1;
      refreshAssignments();
      return;
    }
    if (event.target.matches('[data-master-page-size]')) { masterScheduleUi.pageSize = Number(event.target.value) || 10; masterScheduleUi.page = 1; refreshAssignments(); return; }
    if (event.target.matches('[data-master-select]')) { if (event.target.checked) masterScheduleUi.selected.add(event.target.value); else masterScheduleUi.selected.delete(event.target.value); return; }
    if (event.target.matches('[data-master-select-all]')) { const checked = event.target.checked; moduleView.querySelectorAll('[data-master-select]').forEach((box) => { box.checked = checked; if (checked) masterScheduleUi.selected.add(box.value); else masterScheduleUi.selected.delete(box.value); }); return; }
    if (event.target.matches('[data-master-import]')) { const file = event.target.files?.[0]; if (file) await importMasterScheduleFile(file); event.target.value = ''; return; }
    const filter = event.target.dataset.assignmentFilter;
    if (!filter) return;
    assignmentUi[filter] = event.target.value;
    assignmentUi.page = 1;
    refreshAssignments();
  });

  moduleView.addEventListener('click', async (event) => {
    const control=event.target.closest('[data-action]'); if (!control) return; const action=control.dataset.action; const id=control.dataset.id;
    if (action === 'set-schools-view') {
      const view = ['directory', 'add-teams', 'contacts', 'review'].includes(control.dataset.view) ? control.dataset.view : 'directory';
      if (view === 'add-teams' && schoolsUi.section !== 'add-teams' && !(schoolsUi.pair?.homeId || schoolsUi.pair?.visitingId)) resetSchoolTeamDrafts();
      schoolsUi.section = view;
      if (view !== 'contacts') schoolsUi.editingContactId = '';
      await renderRoute('schools'); return;
    }
    if (action === 'cancel-school-pair') {
      resetSchoolTeamDrafts();
      schoolsUi.section = 'directory';
      schoolsUi.selectedId = '';
      schoolsUi.editingContactId = '';
      await renderRoute('schools'); return;
    }
    if (action === 'select-school-pair-contact') {
      if (!(state.schools || []).some((school) => school.id === id)) return;
      schoolsUi.selectedId = id;
      schoolsUi.editingContactId = '';
      schoolsUi.section = 'contacts';
      await renderRoute('schools'); return;
    }
    if (action === 'remove-school-pair-logo') {
      const side = control.dataset.side;
      const draft = schoolPairDraft(side);
      if (schoolsUi.logoPreviewUrls?.[side]) { URL.revokeObjectURL(schoolsUi.logoPreviewUrls[side]); schoolsUi.logoPreviewUrls[side] = ''; }
      draft.logoFileId = '';
      draft.logoUrl = '';
      draft.removeLogo = true;
      draft.pendingLogoFile = null;
      const input = moduleView.querySelector(`[data-school-team-logo-input][data-side="${side}"]`);
      if (input) input.value = '';
      const preview = moduleView.querySelector(`[data-school-pair-logo-preview="${side}"]`);
      if (preview) preview.innerHTML = `<span class="school-pair-logo-empty">${icon('i-school')}<small>No logo selected</small></span>`;
      control.hidden = true;
      return;
    }
    if (action === 'manage-school-contacts') {
      if (!(state.schools || []).some((school) => school.id === id)) return;
      schoolsUi.selectedId = id;
      schoolsUi.section = 'contacts';
      schoolsUi.editingContactId = '';
      await renderRoute('schools'); return;
    }
    if (action === 'edit-school-contact') {
      schoolsUi.editingContactId = id || '';
      schoolsUi.section = 'contacts';
      await renderRoute('schools'); return;
    }
    if (action === 'add-school-contact') {
      schoolsUi.editingContactId = '';
      schoolsUi.section = 'contacts';
      await renderRoute('schools');
      moduleView.querySelector('form[data-form="school-contact"]')?.scrollIntoView({ behavior: state.settings.reducedMotion ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    if (action === 'delete-school-contact') {
      const school = selectedSchoolRecord();
      if (!school) return;
      const contact = schoolContacts(school).find((item) => item.id === id);
      if (!contact || !confirm(`Delete ${contactFullName(contact)} from this school's contact list?`)) return;
      school.contacts = schoolContacts(school).filter((item) => item.id !== id);
      school.updatedAt = new Date().toISOString();
      syncSchoolLegacyContacts(school);
      if (schoolsUi.editingContactId === id) schoolsUi.editingContactId = '';
      saveState();
      await renderRoute('schools');
      showToast('Team contact deleted.');
      return;
    }
    if (action === 'review-school-contacts') {
      schoolsUi.section = 'review';
      schoolsUi.editingContactId = '';
      await renderRoute('schools'); return;
    }
    if (action === 'school-save-exit') {
      schoolsUi.section = 'directory';
      schoolsUi.editingContactId = '';
      resetSchoolTeamDrafts();
      saveState();
      await renderRoute('schools');
      showToast('School and team contact records saved.');
      return;
    }
    if (action === 'open-new-message-dialog') { moduleView.querySelector('[data-new-message-dialog]')?.showModal(); return; }
    if (action === 'close-new-message-dialog') { control.closest('dialog')?.close(); return; }
    if (action === 'set-message-tab') { messagesUi.tab = control.dataset.tab || 'all'; moduleView.innerHTML = renderMessages(); hydrateMessageMedia(); return; }
    if (action === 'toggle-message-filters') { messagesUi.filtersOpen = !messagesUi.filtersOpen; moduleView.innerHTML = renderMessages(); hydrateMessageMedia(); return; }
    if (action === 'clear-message-filters') { Object.assign(messagesUi, { query: '', tab: 'all', onlyAttachments: false, showArchived: false, sort: 'newest', filtersOpen: false }); moduleView.innerHTML = renderMessages(); hydrateMessageMedia(); return; }
    if (action === 'open-conversation') {
      const conversation = (state.conversations || []).find((item) => item.id === id);
      if (!conversation) return;
      activeConversationId = id;
      conversation.unreadCount = 0;
      (conversation.messages || []).forEach((message) => { if (message.direction === 'incoming' || message.sender === 'them') message.read = true; });
      saveState(); updateChrome(); await renderRoute('messages'); return;
    }
    if (action === 'toggle-message-info') { const panel = moduleView.querySelector('[data-message-info-panel]'); if (panel) panel.hidden = !panel.hidden; return; }
    if (action === 'mark-conversation-unread') {
      const conversation = (state.conversations || []).find((item) => item.id === id);
      if (!conversation) return;
      const incoming = [...(conversation.messages || [])].reverse().find((message) => message.direction === 'incoming' || message.sender === 'them');
      if (incoming) incoming.read = false;
      conversation.unreadCount = Math.max(1, Number(conversation.unreadCount || 0));
      saveState(); updateChrome(); await renderRoute('messages'); return;
    }
    if (action === 'archive-conversation') {
      const conversation = (state.conversations || []).find((item) => item.id === id);
      if (!conversation) return;
      conversation.archived = !conversation.archived;
      conversation.updatedAt = new Date().toISOString();
      if (conversation.archived && !messagesUi.showArchived) activeConversationId = null;
      saveState(); await renderRoute('messages'); showToast(conversation.archived ? 'Conversation archived.' : 'Conversation restored.'); return;
    }
    if (action === 'export-conversation') {
      const conversation = normalizeConversation((state.conversations || []).find((item) => item.id === id) || {});
      if (!conversation.id) return;
      const lines = ['Got U Nex Ref Conversation', '', `Contact: ${conversation.name}`, conversation.role ? `Role: ${conversation.role}` : '', conversation.organization ? `Organization: ${conversation.organization}` : '', conversation.email ? `Email: ${conversation.email}` : '', conversation.phone ? `Phone: ${conversation.phone}` : '', conversation.subject ? `Subject: ${conversation.subject}` : '', '', ...conversation.messages.map((message) => `${fmtDateTime(message.at)} | ${message.direction === 'incoming' ? conversation.name : messageCurrentUserName()}
${message.body || ''}${message.attachmentName ? `
Attachment: ${message.attachmentName}` : ''}
`)].filter(Boolean);
      downloadText(`conversation-${conversation.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'record'}.txt`, lines.join('\n'));
      return;
    }
    if (action === 'delete-conversation') {
      const conversation = (state.conversations || []).find((item) => item.id === id);
      if (!conversation || !confirm('Delete this conversation and its locally stored attachments?')) return;
      for (const message of conversation.messages || []) if (message.attachmentId) await dbDeleteFile(message.attachmentId);
      state.conversations = state.conversations.filter((item) => item.id !== id);
      activeConversationId = state.conversations.find((item) => !item.archived)?.id || null;
      saveState(); updateChrome(); await renderRoute('messages'); showToast('Conversation deleted.'); return;
    }
    if (action === 'toggle-message-emoji') { const panel = moduleView.querySelector('[data-message-emoji-panel]'); const quick = moduleView.querySelector('[data-message-quick-replies]'); if (quick) quick.hidden = true; if (panel) panel.hidden = !panel.hidden; return; }
    if (action === 'insert-message-emoji') { const textarea = moduleView.querySelector('.messages-composer textarea[name="body"]'); if (!textarea) return; const value = control.dataset.value || ''; const start = textarea.selectionStart ?? textarea.value.length; textarea.setRangeText(value, start, textarea.selectionEnd ?? start, 'end'); textarea.focus(); return; }
    if (action === 'toggle-message-quick-replies') { const panel = moduleView.querySelector('[data-message-quick-replies]'); const emoji = moduleView.querySelector('[data-message-emoji-panel]'); if (emoji) emoji.hidden = true; if (panel) panel.hidden = !panel.hidden; return; }
    if (action === 'use-message-quick-reply') { const textarea = moduleView.querySelector('.messages-composer textarea[name="body"]'); if (!textarea) return; textarea.value = control.dataset.value || ''; textarea.focus(); moduleView.querySelector('[data-message-quick-replies]')?.setAttribute('hidden', ''); return; }
    if (action === 'download-message-attachment') { const file = await dbGetFile(id); if (!file?.blob) { showToast('Attachment is not available on this device.'); return; } const url = URL.createObjectURL(file.blob); const link = document.createElement('a'); link.href = url; link.download = file.name || 'attachment'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); return; }
    if (action==='set-assignment-section') { captureCreateGameForm(); const requestedSection = control.dataset.section || 'tasks'; assignmentUi.section = ['tba-games','create-game-2','create-game-3','quick-assign','master','published','unpublished','my-games'].includes(requestedSection) ? requestedSection : 'tasks'; if (assignmentUi.section === 'create-game-2' || assignmentUi.section === 'create-game-3') { const crewSize = assignmentUi.section === 'create-game-3' ? 3 : 2; createGameUi = createGameUiByCrew[crewSize]; createGameUi.crewSize = crewSize; } if (assignmentUi.section !== 'my-games') myGamesUi.detailId = ''; if (assignmentUi.section !== 'published') publishedGamesUi.detailId = ''; refreshAssignments(); return; }
    if (action==='set-published-tab') { publishedGamesUi.tab = ['all','needs-editing','upcoming','past'].includes(control.dataset.tab) ? control.dataset.tab : 'all'; publishedGamesUi.page = 1; refreshAssignments(); return; }
    if (action==='clear-published-filters') { Object.assign(publishedGamesUi, { tab:'all', query:'', startDate:'', endDate:'', sport:'', level:'', crewSize:'', page:1 }); refreshAssignments(); return; }
    if (action==='sort-published-games') { const key = control.dataset.key || 'date'; if (publishedGamesUi.sortKey === key) publishedGamesUi.sortDir = publishedGamesUi.sortDir === 'asc' ? 'desc' : 'asc'; else { publishedGamesUi.sortKey = key; publishedGamesUi.sortDir = 'asc'; } publishedGamesUi.page = 1; refreshAssignments(); return; }
    if (action==='published-page') { publishedGamesUi.page = Math.max(1, Number(control.dataset.page) || 1); refreshAssignments(); return; }
    if (action==='view-published-game') { const game = (state.masterGames || []).find((item) => item.id === id && item.status === 'Published'); if (!game) { showToast('Published game not found.'); return; } publishedGamesUi.detailId = game.id; refreshAssignments(); return; }
    if (action==='back-to-published-games') { publishedGamesUi.detailId = ''; refreshAssignments(); return; }
    if (action==='show-published-review') { const game = (state.masterGames || []).find((item) => item.id === id); const reasons = game ? publishedGameReviewReasons(game) : []; if (reasons.length) alert(`This published game needs editing:\n\n${reasons.map((reason) => `• ${reason}`).join('\n')}`); return; }
    if (action==='published-view-master') { const game = id ? (state.masterGames || []).find((item) => item.id === id) : null; masterScheduleUi.query = game ? [game.id, game.homeTeam, game.awayTeam].filter(Boolean).join(' ') : ''; masterScheduleUi.page = 1; publishedGamesUi.detailId = ''; assignmentUi.section = 'master'; refreshAssignments(); return; }
    if (action==='unpublish-published-game') { const game = (state.masterGames || []).find((item) => item.id === id && item.status === 'Published'); if (!game) { showToast('Published game not found.'); return; } if (!confirm('Unpublish this game? Assigned officials will no longer see it until it is published again.')) return; game.status = 'Unpublished'; game.publishedAt = ''; game.updatedAt = new Date().toISOString(); publishedGamesUi.selected.delete(game.id); publishedGamesUi.detailId = ''; notify('Game unpublished for editing.'); saveState(); refreshAssignments(); return; }
    if (action==='published-edit-game') { const game = (state.masterGames || []).find((item) => item.id === id && item.status === 'Published'); if (!game) { showToast('Published game not found.'); return; } if (!confirm('Unpublish this game and open it for editing? Assigned officials will no longer see it until it is published again.')) return; game.status = 'Unpublished'; game.publishedAt = ''; game.updatedAt = new Date().toISOString(); publishedGamesUi.selected.delete(game.id); publishedGamesUi.detailId = ''; masterScheduleUi.query = game.id || [game.homeTeam, game.awayTeam].filter(Boolean).join(' '); masterScheduleUi.page = 1; assignmentUi.section = 'master'; notify('Game unpublished and opened for editing.'); saveState(); refreshAssignments(); openMasterGameDialog(game); return; }
    if (action==='unpublish-selected-published') { const games = (state.masterGames || []).filter((game) => game.status === 'Published' && publishedGamesUi.selected.has(game.id)); if (!games.length) { showToast('Select at least one published game.'); return; } if (!confirm(`Unpublish ${games.length} selected game${games.length === 1 ? '' : 's'} for editing? Assigned officials will no longer see the selected game${games.length === 1 ? '' : 's'}.`)) return; const now = new Date().toISOString(); games.forEach((game) => { game.status = 'Unpublished'; game.publishedAt = ''; game.updatedAt = now; }); publishedGamesUi.selected.clear(); notify(`${games.length} game${games.length === 1 ? '' : 's'} unpublished for editing.`); saveState(); refreshAssignments(); return; }
    if (action==='set-tba-tab') { tbaGamesUi.tab = ['all','urgent','today','tomorrow'].includes(control.dataset.tab) ? control.dataset.tab : 'all'; tbaGamesUi.page = 1; refreshAssignments(); return; }
    if (action==='toggle-tba-filters') { tbaGamesUi.filtersOpen = !tbaGamesUi.filtersOpen; refreshAssignments(); return; }
    if (action==='clear-tba-dates') { tbaGamesUi.startDate = ''; tbaGamesUi.endDate = ''; tbaGamesUi.page = 1; refreshAssignments(); return; }
    if (action==='clear-tba-filters') { Object.assign(tbaGamesUi, { tab:'all', query:'', startDate:'', endDate:'', sport:'', level:'', status:'', crewSize:'', gender:'', school:'', page:1 }); refreshAssignments(); return; }
    if (action==='sort-tba-games') { const key = control.dataset.key || 'date'; if (tbaGamesUi.sortKey === key) tbaGamesUi.sortDir = tbaGamesUi.sortDir === 'asc' ? 'desc' : 'asc'; else { tbaGamesUi.sortKey = key; tbaGamesUi.sortDir = 'asc'; } tbaGamesUi.page = 1; refreshAssignments(); return; }
    if (action==='tba-page') { tbaGamesUi.page = Math.max(1, Number(control.dataset.page) || 1); refreshAssignments(); return; }
    if (action==='sync-tba-games') { tbaGamesUi.lastSyncedAt = Date.now(); refreshAssignments(); showToast(`${tbaBaseGames().length} TBA game${tbaBaseGames().length === 1 ? '' : 's'} synced from the Master Schedule.`); return; }
    if (action==='export-tba-games') { tbaExportGames(); return; }
    if (action==='tba-assign-game') { openTbaAssignmentWorkspace(id); return; }
    if (action==='tba-quick-assign-game') { const count = tbaQuickAssignOne(id); if (count) { showToast(`${count} crew position${count === 1 ? '' : 's'} assigned.`); refreshAssignments(); } return; }
    if (action==='quick-assign-tba-games') { if (confirm('Assign the best eligible recorded officials to open positions in the current TBA Games view?')) { tbaQuickAssignFiltered(); refreshAssignments(); } return; }
    if (action==='tba-view-master') { const game=(state.masterGames||[]).find((item)=>item.id===id); masterScheduleUi.query = game ? [game.homeTeam,game.awayTeam].filter(Boolean).join(' ') : ''; masterScheduleUi.page = 1; assignmentUi.section = 'master'; refreshAssignments(); return; }
    if (action==='set-quick-tab') { quickAssignUi.tab = ['games','officials','suggestions'].includes(control.dataset.tab) ? control.dataset.tab : 'games'; quickAssignUi.page = 1; refreshAssignments(); return; }
    if (action==='toggle-quick-filters') { quickAssignUi.filtersOpen = !quickAssignUi.filtersOpen; refreshAssignments(); return; }
    if (action==='clear-quick-filters') { Object.assign(quickAssignUi, { startDate:'', endDate:'', sport:'', level:'', timeBand:'', venue:'', officialsNeeded:'', role:'', certification:'', gender:'', status:'', school:'', radius:'', query:'', page:1, officialId:'' }); refreshAssignments(); return; }
    if (action==='clear-quick-official-filter') { quickAssignUi.officialId = ''; quickAssignUi.page = 1; refreshAssignments(); return; }
    if (action==='sort-quick-assign') { const key = control.dataset.key || 'date'; if (quickAssignUi.sortKey === key) quickAssignUi.sortDir = quickAssignUi.sortDir === 'asc' ? 'desc' : 'asc'; else { quickAssignUi.sortKey = key; quickAssignUi.sortDir = 'asc'; } quickAssignUi.page = 1; refreshAssignments(); return; }
    if (action==='quick-page') { quickAssignUi.page = Math.max(1, Number(control.dataset.page) || 1); refreshAssignments(); return; }
    if (action==='quick-view-unassigned') { quickAssignUi.tab = 'games'; quickAssignUi.officialId = ''; quickAssignUi.page = 1; refreshAssignments(); return; }
    if (action==='refresh-quick-assign') { refreshAssignments(); showToast('Quick Assign refreshed from current dashboard records.'); return; }
    if (action==='quick-assign-game' || action==='apply-quick-suggestion') { const count = quickAssignApply(id); if (count) { showToast(`${count} crew position${count === 1 ? '' : 's'} assigned.`); refreshAssignments(); } return; }
    if (action==='quick-assign-role') { const count = quickAssignApply(id, control.dataset.role || ''); if (count) { showToast(`${quickAssignRoleLabel(control.dataset.role, (state.masterGames || []).find((item) => item.id === id))} assigned.`); refreshAssignments(); } return; }
    if (action==='auto-quick-assign') { if (confirm('Assign the best eligible recorded officials to all filtered open crew positions?')) { quickAssignAutoAssign(); refreshAssignments(); } return; }
    if (action==='quick-view-official-games') { quickAssignUi.officialId = id; quickAssignUi.tab = 'games'; quickAssignUi.page = 1; refreshAssignments(); return; }
    if (action==='quick-use-location') { if (!navigator.geolocation) { showToast('Location services are not available in this browser.'); return; } control.disabled = true; navigator.geolocation.getCurrentPosition((position) => { quickAssignUi.location = { latitude: position.coords.latitude, longitude: position.coords.longitude }; quickAssignUi.locationLabel = position.coords.accuracy ? `Current location active · accuracy ${Math.round(position.coords.accuracy)} m` : 'Current location active'; quickAssignUi.page = 1; refreshAssignments(); showToast('Current location applied to distance filtering.'); }, (error) => { control.disabled = false; showToast(error.code === 1 ? 'Location permission was not granted.' : 'Current location could not be determined.'); }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }); return; }
    if (action==='set-create-crew-size') { captureCreateGameForm(); const nextSize = Number(control.dataset.size) === 3 ? 3 : 2; createGameUi = createGameUiByCrew[nextSize]; createGameUi.crewSize = nextSize; assignmentUi.section = nextSize === 3 ? 'create-game-3' : 'create-game-2'; const roles = createGameAllRoles(nextSize); if (!roles.includes(createGameUi.selectedRole)) createGameUi.selectedRole = roles.find((role) => !createGameUi[role]) || 'refereeId'; refreshAssignments(); return; }
    if (action==='save-create-game-draft') { saveCreateGame('Draft'); return; }
    if (action==='set-create-official-tab') { createGameUi.officialTab = control.dataset.tab === 'unavailable' ? 'unavailable' : 'available'; refreshAssignments(); requestAnimationFrame(() => moduleView.querySelector(`[data-create-official-group="${createGameUi.officialTab}"]`)?.scrollIntoView({ behavior: state.settings.reducedMotion ? 'auto' : 'smooth', block: 'nearest' })); return; }
    if (action==='load-more-create-unavailable') { createGameUi.unavailableLimit += 3; refreshAssignments(); return; }
    if (action==='clear-create-official-filters') { Object.assign(createGameUi, { officialType: '', officialLevel: '', officialGender: '', unavailableLimit: 3 }); refreshAssignments(); return; }
    if (action==='select-create-role') { const role = control.dataset.role || 'refereeId'; if (createGameAllRoles().includes(role)) createGameUi.selectedRole = role; refreshAssignments(); return; }
    if (action==='remove-create-official') { const role = control.dataset.role; if (role && createGameAllRoles().includes(role)) createGameUi[role] = ''; createGameUi.selectedRole = role || 'refereeId'; refreshAssignments(); return; }
    if (action==='assign-create-official') { const record = createGameOfficialById(id); if (!record) { showToast('Official record not found.'); return; } const roles = createGameAllRoles(); const openRole = [createGameUi.selectedRole, ...roles].find((role, index, list) => role && roles.includes(role) && list.indexOf(role) === index && !createGameUi[role]); if (!openRole) { showToast('Select or clear a crew position before assigning another official.'); return; } createGameUi[openRole] = record.id; createGameUi.selectedRole = roles.find((role) => !createGameUi[role]) || openRole; refreshAssignments(); return; }
    if (action==='toggle-game-decline-reasons') { const picker=control.closest('[data-game-decline-reason-picker]');const menu=picker?.querySelector('[data-game-decline-reason-menu]');if(menu){menu.hidden=!menu.hidden;control.setAttribute('aria-expanded',String(!menu.hidden));}return; }
    if (action==='select-game-decline-reason') { const dialog=control.closest('[data-my-game-decline-dialog]');if(dialog){updateGameDeclineReasonPicker(dialog,control.dataset.value||'');dialog.querySelector('textarea[name="notes"]')?.focus();}return; }
    if (action==='set-my-game-tab') { myGamesUi.tab=control.dataset.tab||'upcoming';myGamesUi.page=1;myGamesUi.detailId='';refreshAssignments();return; }
    if (action==='toggle-my-game-filters') { myGamesUi.filtersOpen=!myGamesUi.filtersOpen;refreshAssignments();return; }
    if (action==='clear-my-game-filters') { Object.assign(myGamesUi,{query:'',startDate:'',endDate:'',sport:'',level:'',response:'',page:1});refreshAssignments();return; }
    if (action==='my-game-page') { myGamesUi.page=Math.max(1,Number(control.dataset.page)||1);refreshAssignments();return; }
    if (action==='view-my-game') { const game=(state.masterGames||[]).find((item)=>item.id===id);if(!game){showToast('Game assignment not found.');return;}myGamesUi.detailId=game.id;refreshAssignments();return; }
    if (action==='back-to-my-games') { myGamesUi.detailId='';refreshAssignments();return; }
    if (action==='view-my-game-calendar') { const game=(state.masterGames||[]).find((item)=>item.id===id);if(!game?.date){showToast('A game date is required to view this assignment on the calendar.');return;}const selected=dateFromKey(game.date);calendarUi.section='calendar';calendarUi.selectedDate=game.date;calendarUi.year=selected.getFullYear();calendarUi.month=selected.getMonth();location.hash='calendar';return; }
    if (action==='published-game-details') { moduleView.querySelector('[data-published-assignment-card]')?.scrollIntoView({ behavior: state.settings.reducedMotion ? 'auto' : 'smooth', block: 'start' }); return; }
    if (action==='download-published-assignment') { const game=(state.masterGames||[]).find((item)=>item.id===id);if(!game){showToast('Game assignment not found.');return;}publishedAssignmentDownload(game);return; }
    if (action==='close-my-game-dialog') { control.closest('dialog')?.close();return; }
    if (action==='decline-my-game') { openMyGameDeclineDialog((state.masterGames||[]).find((item)=>item.id===id));return; }
    if (action==='close-my-game-decline-dialog') { control.closest('dialog')?.close();return; }
    if (action==='accept-my-game') { const game=(state.masterGames||[]).find((item)=>item.id===id);acceptMyGame(game);refreshAssignments();return; }
    if (action==='add-my-game-calendar') { exportMyGameCalendar((state.masterGames||[]).find((item)=>item.id===id));return; }
    if (action==='contact-my-game-crew') { const game=normalizeMasterGame((state.masterGames||[]).find((item)=>item.id===id)||{});const current=currentProfileRosterIds();const emails=[game.refereeId,game.umpire1Id,game.umpire2Id,game.alternateId].filter((crewId)=>crewId&&!current.has(crewId)).map((crewId)=>masterScheduleRoster().find((person)=>person.id===crewId)?.email).filter(Boolean);if(!emails.length){showToast('No crew email addresses are available.');return;}window.location.href=`mailto:${emails.join(',')}?subject=${encodeURIComponent([game.homeTeam,game.awayTeam].filter(Boolean).join(' vs. ')||'Game assignment')}`;return; }
    if (action==='directions-my-game') { const game=(state.masterGames||[]).find((item)=>item.id===id);if(!game?.address){showToast('No venue address has been entered.');return;}window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([game.gymName,game.address].filter(Boolean).join(', '))}`,'_blank','noopener,noreferrer');return; }
    if (action==='toggle-unpublished-filters') { unpublishedScheduleUi.filtersOpen = !unpublishedScheduleUi.filtersOpen; refreshAssignments(); return; }
    if (action==='clear-unpublished-dates') { unpublishedScheduleUi.startDate = ''; unpublishedScheduleUi.endDate = ''; unpublishedScheduleUi.page = 1; refreshAssignments(); return; }
    if (action==='clear-unpublished-filters') { Object.assign(unpublishedScheduleUi, { query: '', startDate: '', endDate: '', level: '', venue: '', status: '', sport: '', gender: '', school: '', conflictsOnly: false, page: 1 }); refreshAssignments(); return; }
    if (action==='sort-unpublished') { const key = control.dataset.key || 'date'; if (unpublishedScheduleUi.sortKey === key) unpublishedScheduleUi.sortDir = unpublishedScheduleUi.sortDir === 'asc' ? 'desc' : 'asc'; else { unpublishedScheduleUi.sortKey = key; unpublishedScheduleUi.sortDir = 'asc'; } unpublishedScheduleUi.page = 1; refreshAssignments(); return; }
    if (action==='unpublished-page') { unpublishedScheduleUi.page = Math.max(1, Number(control.dataset.page) || 1); refreshAssignments(); return; }
    if (action==='export-unpublished-schedule') { exportUnpublishedSchedule(); showToast('Unpublished schedule exported.'); return; }
    if (action==='publish-unpublished-games') { const games = unpublishedScheduleFilteredGames(); if (!games.length) { showToast('No unpublished 3-man games are available to publish.'); return; } publishMasterGames(games); refreshAssignments(); return; }
    if (action==='new-master-game') { openMasterGameDialog(); return; }
    if (action==='edit-master-game') { openMasterGameDialog((state.masterGames || []).find((item) => item.id === id)); return; }
    if (action==='close-master-game-dialog') { control.closest('dialog')?.close(); return; }
    if (action==='duplicate-master-game') { const original=(state.masterGames||[]).find((item)=>item.id===id); if(original){const now=new Date().toISOString();state.masterGames.unshift({...original,id:uid('game'),status:'Draft',publishedAt:'',officialResponses:{},createdAt:now,updatedAt:now});notify('Master schedule game duplicated.');saveState();refreshAssignments();} return; }
    if (action==='toggle-master-publish') { const game=(state.masterGames||[]).find((item)=>item.id===id); if(game){if(game.status==='Published'){game.status='Unpublished';game.publishedAt='';game.updatedAt=new Date().toISOString();notify('Game unpublished.');saveState();}else publishMasterGames([normalizeMasterGame(game)]);refreshAssignments();} return; }
    if (action==='delete-master-game' && confirm('Delete this game from the master schedule?')) { state.masterGames=(state.masterGames||[]).filter((item)=>item.id!==id);state.calendarBlocks=(state.calendarBlocks||[]).filter((item)=>item.sourceMasterGameId!==id);masterScheduleUi.selected.delete(id);notify('Master schedule game deleted.');saveState();refreshAssignments();return; }
    if (action==='show-master-conflicts') { const game=(state.masterGames||[]).find((item)=>item.id===id);const dialog=moduleView.querySelector('[data-master-conflict-dialog]');if(game&&dialog){const reasons=masterGameConflictReasons(game);dialog.querySelector('[data-master-conflict-body]').innerHTML=`<h3>${esc([game.homeTeam,game.awayTeam].filter(Boolean).join(' vs. '))}</h3><ul>${reasons.map((reason)=>`<li>${esc(reason)}</li>`).join('')}</ul>`;if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}return; }
    if (action==='close-master-conflict-dialog') { control.closest('dialog')?.close(); return; }
    if (action==='import-master-schedule') { moduleView.querySelector('[data-master-import]')?.click(); return; }
    if (action==='export-master-schedule') { exportMasterSchedule(); showToast('Master schedule exported.'); return; }
    if (action==='toggle-master-advanced') { masterScheduleUi.advancedOpen=!masterScheduleUi.advancedOpen;refreshAssignments();return; }
    if (action==='clear-master-filters') { Object.assign(masterScheduleUi,{query:'',startDate:'',endDate:'',sport:'',level:'',status:'',school:'',conferenceLevel:'',gender:'',venue:'',conflictsOnly:false,page:1});refreshAssignments();return; }
    if (action==='apply-master-filters') { masterScheduleUi.advancedOpen=false;masterScheduleUi.page=1;refreshAssignments();return; }
    if (action==='master-page') { masterScheduleUi.page=Math.max(1,Number(control.dataset.page)||1);refreshAssignments();return; }
    if (action==='publish-master-schedule') { const selected=filteredMasterGames().filter((game)=>masterScheduleUi.selected.has(game.id));publishMasterGames(selected.length?selected:filteredMasterGames());masterScheduleUi.selected.clear();refreshAssignments();return; }
    if (action==='apply-master-bulk') { const operation=moduleView.querySelector('[data-master-bulk-action]')?.value||'';const selected=(state.masterGames||[]).filter((game)=>masterScheduleUi.selected.has(game.id));if(!operation){showToast('Choose a bulk action.');return;}if(!selected.length){showToast('Select at least one game.');return;}if(operation==='publish'){publishMasterGames(selected.map(normalizeMasterGame));}if(operation==='unpublish'){selected.forEach((game)=>{game.status='Unpublished';game.publishedAt='';game.updatedAt=new Date().toISOString();});notify(`${selected.length} game${selected.length===1?'':'s'} unpublished.`);saveState();}if(operation==='delete'&&confirm(`Delete ${selected.length} selected game${selected.length===1?'':'s'}?`)){state.masterGames=(state.masterGames||[]).filter((game)=>!masterScheduleUi.selected.has(game.id));notify(`${selected.length} game${selected.length===1?'':'s'} deleted.`);saveState();}masterScheduleUi.selected.clear();refreshAssignments();return; }
    if (action==='set-official-tab') { usersUi.tab=control.dataset.tab||'all'; usersUi.page=1; usersUi.menuId=''; moduleView.innerHTML=userListView(); return; }
    if (action==='toggle-official-filters') { usersUi.filtersOpen=!usersUi.filtersOpen; moduleView.innerHTML=userListView(); return; }
    if (action==='clear-official-filters') { Object.assign(usersUi,{query:'',tab:'all',status:'',certification:'',position:'',organization:'',region:'',joinedFrom:'',joinedTo:'',page:1,menuId:''}); moduleView.innerHTML=userListView(); return; }
    if (action==='sort-officials') { const key=control.dataset.key||'name'; if(usersUi.sortKey===key)usersUi.sortDir=usersUi.sortDir==='asc'?'desc':'asc';else{usersUi.sortKey=key;usersUi.sortDir='asc';} usersUi.page=1; moduleView.innerHTML=userListView(); return; }
    if (action==='official-page') { usersUi.page=Math.max(1,Number(control.dataset.page)||1); usersUi.menuId=''; moduleView.innerHTML=userListView(); return; }
    if (action==='toggle-official-menu') { usersUi.menuId=usersUi.menuId===id?'':id; moduleView.innerHTML=userListView(); return; }
    if (action==='email-official') { const user=state.users.find((item)=>item.id===id)||state.userDrafts.find((item)=>item.id===id); if(user?.email)window.location.href=`mailto:${encodeURIComponent(user.email)}`; return; }
    if (action==='toggle-official-status') { const user=state.users.find((item)=>item.id===id)||state.userDrafts.find((item)=>item.id===id); if(user){user.active=user.active===false;user.directoryStatus=user.active?'Active':'Inactive';user.updatedAt=new Date().toISOString();notify(`${[user.firstName,user.lastName].filter(Boolean).join(' ')} account ${user.active?'activated':'deactivated'}.`);saveState();usersUi.menuId='';moduleView.innerHTML=userListView();} return; }
    if (action==='export-officials') { const rows=officialDirectoryFiltered().map((user)=>({firstName:user.firstName,lastName:user.lastName,email:user.email,phone:user.mobilePhone,officialId:user.officialId,positions:user.positionsList.join('|'),certification:user.certificationLabel,certificationExpires:user.certificationExpires,status:user.statusLabel,joined:user.joinedValue,organization:user.organizationName,city:user.city,region:user.region})); exportCSV('officials.csv',rows,['firstName','lastName','email','phone','officialId','positions','certification','certificationExpires','status','joined','organization','city','region']); return; }
    if (action==='set-users-mode') { usersUi.mode=control.dataset.mode||'list'; usersUi.editingId=''; usersUi.menuId=''; await renderRoute('users'); return; }
    if (action==='edit-user') { usersUi.mode='profile'; usersUi.editingId=id; usersUi.menuId=''; await renderRoute('users'); return; }
    if (action==='edit-user-account') { usersUi.mode='add'; usersUi.editingId=id; usersUi.menuId=''; await renderRoute('users'); return; }
    if (action==='set-profile-preview-mode') { const panel=control.closest('[data-official-profile-preview-panel]'); if(panel){panel.dataset.previewMode=control.dataset.mode||'mobile';panel.querySelectorAll('[data-action="set-profile-preview-mode"]').forEach((button)=>button.classList.toggle('is-active',button===control));} return; }
    if (action==='delete-user' && confirm('Delete this official record?')) { const target=(control.dataset.draft==='true'?state.userDrafts:state.users).find((item)=>item.id===id); if(target?.photoId) await dbDeleteFile(target.photoId); state.users=state.users.filter((item)=>item.id!==id); state.userDrafts=state.userDrafts.filter((item)=>item.id!==id); state.invitations=state.invitations.filter((item)=>item.userId!==id); notify('Official record deleted.'); saveState(); await renderRoute('users'); return; }
    if (action==='select-all-user-permissions') { control.closest('form')?.querySelectorAll('input[name="permissions"]').forEach((input)=>input.checked=true); updateUserBuilderPreview(); return; }
    if (action==='clear-user-permissions') { control.closest('form')?.querySelectorAll('input[name="permissions"]').forEach((input)=>input.checked=false); updateUserBuilderPreview(); return; }
    if (action==='generate-user-password') { const input=control.closest('form')?.elements.temporaryPassword; if(input){const bytes=new Uint32Array(4);crypto.getRandomValues(bytes);input.value=`GU-${[...bytes].map((value)=>value.toString(36)).join('').slice(0,16)}!`;input.type='text';showToast('Temporary password generated.');} return; }
    if (action==='toggle-user-password') { const input=control.closest('form')?.elements.temporaryPassword; if(input) input.type=input.type==='password'?'text':'password'; return; }
    if (action==='export-users') { const rows=officialDirectoryRecords().map((user)=>({...user,positions:user.positionsList.join('|'),status:user.statusLabel})); exportCSV('officials.csv',rows,['firstName','lastName','email','mobilePhone','officialId','positions','certification','certificationExpires','status','joinedDate','organizationName']); return; }
    if (action==='set-calendar-section') { calendarUi.section=control.dataset.section||'calendar'; refreshCalendar(); return; }
    if (action==='new-report-official') { openReportOfficialDialog(); return; }
    if (action==='edit-report-official') { openReportOfficialDialog(state.officials.find((item)=>item.id===id)); return; }
    if (action==='delete-report-official' && confirm('Delete this official and all related availability records?')) { state.officials=state.officials.filter((item)=>item.id!==id); state.officialAvailability=state.officialAvailability.filter((item)=>item.officialId!==id); notify('Official deleted.'); saveState(); refreshCalendar(); return; }
    if (action==='new-report-availability') { openReportAvailabilityDialog(); return; }
    if (action==='record-report-availability') { openReportAvailabilityDialog(id); return; }
    if (action==='close-report-dialog') { control.closest('dialog')?.close(); return; }
    if (action==='report-page') { availabilityReportUi.page=Math.max(1,Number(control.dataset.page)||1); refreshCalendar(); return; }
    if (action==='reset-report-filters') { Object.assign(availabilityReportUi,{startDate:dateKey(reportStartDate),endDate:dateKey(reportEndDate),level:'',gender:'',officialType:'',status:'',query:'',page:1}); refreshCalendar(); return; }
    if (action==='export-availability-report') { exportAvailabilityReportExcel(); showToast('Availability report exported.'); return; }
    if (action==='print-availability-report') { window.print(); return; }
    if (action==='set-calendar-view') { calendarUi.view=control.dataset.view||'month'; if(control.dataset.date){const selected=dateFromKey(control.dataset.date);calendarUi.selectedDate=control.dataset.date;calendarUi.year=selected.getFullYear();calendarUi.month=selected.getMonth();} if(!calendarUi.selectedDate)calendarUi.selectedDate=dateKey(new Date()); refreshCalendar(); return; }
    if (action==='calendar-prev') { shiftCalendar(-1); refreshCalendar(); return; }
    if (action==='calendar-next') { shiftCalendar(1); refreshCalendar(); return; }
    if (action==='calendar-today') { const today=new Date(); calendarUi.year=today.getFullYear(); calendarUi.month=today.getMonth(); calendarUi.selectedDate=dateKey(today); refreshCalendar(); return; }
    if (action==='calendar-select-date') { const date=control.dataset.date; const selected=dateFromKey(date); calendarUi.selectedDate=date; calendarUi.year=selected.getFullYear(); calendarUi.month=selected.getMonth(); if(calendarUi.view==='day')refreshCalendar(); else openCalendarDialog(date); return; }
    if (action==='open-calendar-day') { openCalendarDialog(control.dataset.date); return; }
    if (action==='open-calendar-block') { openCalendarBlockDialog(); return; }
    if (action==='open-block-from-date') { const date=control.closest('form')?.elements.date.value||calendarUi.selectedDate; control.closest('dialog')?.close(); openCalendarBlockDialog(null,date); return; }
    if (action==='edit-calendar-block') { openCalendarBlockDialog((state.calendarBlocks || []).find((item)=>item.id===id)); return; }
    if (action==='close-calendar-block-dialog') { control.closest('dialog')?.close(); return; }
    if (action==='toggle-block-reasons') { const picker=control.closest('[data-block-reason-picker]'); const menu=picker?.querySelector('[data-block-reason-menu]'); if(menu){menu.hidden=!menu.hidden;control.setAttribute('aria-expanded',String(!menu.hidden));} return; }
    if (action==='select-block-reason') { const dialog=control.closest('[data-calendar-block-dialog]'); if(dialog)updateBlockReasonPicker(dialog,control.dataset.value||''); return; }
    if (action==='delete-calendar-block') { const form=control.closest('form'); const blockId=form?.elements.id.value; if(blockId&&confirm('Delete this blocked date and time?')){state.calendarBlocks=(state.calendarBlocks||[]).filter((item)=>item.id!==blockId);saveState();control.closest('dialog')?.close();refreshCalendar();showToast('Blocked time deleted.');} return; }
    if (action==='close-calendar-dialog') { control.closest('dialog')?.close(); return; }
    if (action==='clear-calendar-availability') { const form=control.closest('form'); const date=form?.elements.date.value; if(date){delete state.calendarAvailability[date]; saveState(); control.closest('dialog')?.close(); refreshCalendar(); showToast('Availability cleared.');} return; }
    if (action==='calendar-add-assignment') { const form=control.closest('form'); const date=form?.elements.date.value||calendarUi.selectedDate; control.closest('dialog')?.close(); openAssignmentDialog({dueDate:date}); return; }
    if (action==='sync-calendar') { exportCalendarIcs(); showToast('Calendar file exported.'); return; }
    if (action==='print-calendar') { window.print(); return; }
    if (action==='view-full-calendar') { document.getElementById('full-availability-calendar')?.scrollIntoView({behavior:state.settings.reducedMotion?'auto':'smooth'}); return; }
    if (action==='new-assignment') { openAssignmentDialog(); return; }
    if (action==='close-assignment-dialog') { control.closest('dialog')?.close(); return; }
    if (action==='close-assignment-decline-dialog') { control.closest('dialog')?.close(); return; }
    if (action==='decline-assignment') { openAssignmentDeclineDialog(state.assignments.find((x)=>x.id===id)); return; }
    if (action==='restore-assignment') { const item=state.assignments.find((x)=>x.id===id); if(item){item.status='Active';delete item.declineReason;delete item.declineReasonDetails;delete item.declinedAt;item.updatedAt=new Date().toISOString();state.calendarBlocks=(state.calendarBlocks||[]).filter((block)=>block.sourceAssignmentId!==item.id);notify('Assignment restored and its decline block was removed.');saveState();refreshAssignments();} return; }
    if (action==='edit-assignment') { openAssignmentDialog(state.assignments.find((x)=>x.id===id)); return; }
    if (action==='duplicate-assignment') {
      const original=state.assignments.find((x)=>x.id===id);
      if(original){const copy={...original,id:uid('assignment'),title:`${normalizeAssignment(original).title} — Copy`,status:'Draft',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};state.assignments.unshift(copy);notify('Assignment duplicated.');}
    }
    if (action==='toggle-assignment-complete') { const item=state.assignments.find((x)=>x.id===id); if(item){item.status=item.status==='Completed'?'Active':'Completed';item.updatedAt=new Date().toISOString();notify(item.status==='Completed'?'Assignment completed.':'Assignment reopened.');} }
    if (action==='delete-assignment'&&confirm('Delete this assignment?')) { state.assignments=state.assignments.filter((x)=>x.id!==id); notify('Assignment deleted.'); }
    if (action==='set-assignment-tab') { assignmentUi.tab=control.dataset.tab||'all';assignmentUi.page=1;refreshAssignments();return; }
    if (action==='assignment-page') { assignmentUi.page=Math.max(1,Number(control.dataset.page)||1);refreshAssignments();return; }
    if (action==='toggle-assignment-date') { assignmentUi.datePanelOpen=!assignmentUi.datePanelOpen;refreshAssignments();return; }
    if (action==='apply-assignment-date') { assignmentUi.startDate=moduleView.querySelector('[data-assignment-start-date]')?.value||'';assignmentUi.endDate=moduleView.querySelector('[data-assignment-end-date]')?.value||'';assignmentUi.datePanelOpen=false;assignmentUi.page=1;refreshAssignments();return; }
    if (action==='clear-assignment-date') { assignmentUi.startDate='';assignmentUi.endDate='';assignmentUi.datePanelOpen=false;assignmentUi.page=1;refreshAssignments();return; }
    if (action==='edit-school') {
      schoolsUi.section = 'directory';
      schoolsUi.selectedId = id || schoolsUi.selectedId;
      await renderRoute('schools');
      const record = state.schools.find((item) => item.id === id);
      if (record) fillForm('form[data-form="school"]', record);
      return;
    }
    if (action==='delete-school'&&confirm('Delete this organization and its saved contact records?')) {
      const record = state.schools.find((item) => item.id === id);
      if (record?.logoFileId) await dbDeleteFile(record.logoFileId);
      state.schools=state.schools.filter((x)=>x.id!==id);
      if (schoolsUi.selectedId === id) { schoolsUi.selectedId = ''; schoolsUi.editingContactId = ''; schoolsUi.section = 'directory'; }
      if (schoolsUi.pair?.homeId === id || schoolsUi.pair?.visitingId === id) resetSchoolTeamDrafts();
      notify('Organization deleted.');
    }
    if (action==='edit-payment') fillForm('form[data-form="payment"]',state.payments.find((x)=>x.id===id));
    if (action==='delete-payment'&&confirm('Delete this payment record?')) { state.payments=state.payments.filter((x)=>x.id!==id); notify('Payment record deleted.'); }
    if (action==='set-forms-view') { formsUi.section=['invoice','contract'].includes(control.dataset.view)?control.dataset.view:'records'; await renderRoute('forms'); return; }
    if (action==='edit-form-record') fillForm('form[data-form="form-record"]',state.forms.find((x)=>x.id===id));
    if (action==='delete-form-record'&&confirm('Delete this form record?')) { state.forms=state.forms.filter((x)=>x.id!==id); notify('Form record deleted.'); }
    if (action==='edit-resource') fillForm('form[data-form="resource"]',state.resources.find((x)=>x.id===id));
    if (action==='delete-resource'&&confirm('Delete this resource link?')) { state.resources=state.resources.filter((x)=>x.id!==id); notify('Resource link deleted.'); }
    if (action==='edit-product') fillForm('form[data-form="product"]',state.products.find((x)=>x.id===id));
    if (action==='delete-product'&&confirm('Delete this product?')) { state.products=state.products.filter((x)=>x.id!==id); state.cart=state.cart.filter((x)=>x.productId!==id); notify('Product deleted.'); }
    if (action==='add-to-cart') { const item=state.cart.find((x)=>x.productId===id); if(item)item.quantity+=1; else state.cart.push({productId:id,quantity:1}); notify('Product added to cart.'); }
    if (action==='remove-cart') { state.cart=state.cart.filter((x)=>x.productId!==id); notify('Product removed from cart.'); }
    if (action==='checkout') { downloadText('order-summary.txt', createOrderSummary()); showToast('Order summary downloaded.'); return; }
    if (action==='edit-review') fillForm('form[data-form="review"]',state.reviews.find((x)=>x.id===id));
    if (action==='delete-review'&&confirm('Delete this review?')) { state.reviews=state.reviews.filter((x)=>x.id!==id); notify('Review deleted.'); }
    if (action==='toggle-ticket') { const ticket=state.supportTickets.find((x)=>x.id===id); if(ticket){ticket.status=ticket.status==='Open'?'Closed':'Open'; notify(`Support request ${ticket.status.toLowerCase()}.`);} }
    if (action==='delete-ticket'&&confirm('Delete this support request?')) { state.supportTickets=state.supportTickets.filter((x)=>x.id!==id); notify('Support request deleted.'); }
    if (action==='cycle-availability' || action==='cycle-profile-availability') { const values=['Unset','Available','Limited','Unavailable']; const current=values.indexOf(state.availability[control.dataset.key]||'Unset'); state.availability[control.dataset.key]=values[(current+1)%values.length]; saveState(); await renderRoute(location.hash.slice(1)||'assignments'); return; }
    if (action==='toggle-profile-editor') { const editor=moduleView.querySelector('[data-profile-editor]'); if(editor){editor.hidden=!editor.hidden;if(!editor.hidden)editor.scrollIntoView({behavior:state.settings.reducedMotion?'auto':'smooth',block:'start'});} return; }
    if (action==='remove-profile-photo') { if(state.profile.profilePhotoId) await dbDeleteFile(state.profile.profilePhotoId); state.profile.profilePhotoId=''; saveState(); await renderRoute('profile'); showToast('Profile photo removed.'); return; }
    if (action==='toggle-setting') { const key=control.dataset.key; state.settings[key]=!state.settings[key]; saveState(); await renderRoute('settings'); return; }
    if (action==='download-file') { const file=await dbGetFile(id); if(file){const url=URL.createObjectURL(file.blob); const a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);} return; }
    if (action==='delete-file'&&confirm('Delete this file?')) { await dbDeleteFile(id); notify('File deleted.'); saveState(); await renderRoute(location.hash.slice(1)); return; }
    if (action==='export-assignments') { exportCSV('assignments.csv',state.assignments.map(normalizeAssignment),['title','description','type','classTeam','dueDate','dueTime','submittedCount','expectedCount','scope','status']); return; }
    if (action==='export-payments') { exportCSV('payments.csv',state.payments,['date','payer','assignment','amount','method','status','notes']); return; }
    if (action==='download-id') { downloadIdCard(); return; }
    if (action==='export-data') { exportData(); return; }
    if (action==='reset-data'&&confirm('Permanently clear all dashboard records and uploaded files from this browser?')) { state=emptyState(); try { localStorage.removeItem(STORAGE_KEY); } catch {} await dbClearFiles(); activeConversationId=null; updateChrome(); await renderRoute('home'); showToast('All local dashboard data cleared.'); return; }
    saveState(); await renderRoute(location.hash.slice(1)||'home');
  });

  window.addEventListener('message', (event) => {
    if (!['rtbo-invoice-ready','rtbo-contract-ready'].includes(event.data?.type)) return;
    const frame = moduleView.querySelector('[data-invoice-generator-frame], [data-contract-generator-frame]');
    if (frame?.contentWindow === event.source) sendFormsDashboardContext(event.source);
  });

  function exportCSV(filename, rows, columns) { const csv=[columns.join(','),...rows.map((row)=>columns.map((key)=>`"${String(row[key]??'').replace(/"/g,'""')}"`).join(','))].join('\n'); downloadText(filename,csv,'text/csv'); }
  function downloadText(filename,text,type='text/plain') { const blob=new Blob([text],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
  function exportData() { downloadText('got-u-nex-ref-dashboard-data.json',JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2),'application/json'); }
  function createOrderSummary() { const lines=['Got U Nex Ref Shop Order Summary','']; state.cart.forEach((item)=>{const p=state.products.find((x)=>x.id===item.productId);if(p)lines.push(`${p.name} | ${item.quantity} | ${money(Number(p.price)*item.quantity)}`);}); lines.push('',`Total: ${money(state.cart.reduce((sum,item)=>{const p=state.products.find((x)=>x.id===item.productId);return sum+(p?Number(p.price)*item.quantity:0);},0))}`); return lines.join('\n'); }
  function downloadIdCard() { const p=state.profile; const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="700" viewBox="0 0 1100 700"><rect width="1100" height="700" rx="40" fill="#090a0b"/><rect x="20" y="20" width="1060" height="660" rx="30" fill="none" stroke="#ef5b12" stroke-width="6"/><text x="70" y="110" fill="#ef5b12" font-family="Arial" font-size="38" font-weight="700">GOT U NEX REF</text><text x="70" y="240" fill="#fff" font-family="Arial" font-size="74" font-weight="800">${esc(`${p.firstName} ${p.lastName}`)}</text><text x="70" y="325" fill="#ddd" font-family="Arial" font-size="42">${esc(p.role)}</text><text x="70" y="420" fill="#999" font-family="Arial" font-size="30">${esc(p.email)}</text><text x="70" y="475" fill="#999" font-family="Arial" font-size="30">${esc([p.city,p.region].filter(Boolean).join(', '))}</text><text x="70" y="610" fill="#ef5b12" font-family="Arial" font-size="28">Raising The Bar Officiating</text></svg>`; downloadText('got-u-nex-ref-id-card.svg',svg,'image/svg+xml'); }

  document.addEventListener('click', (event) => {
    const routeLink=event.target.closest('[data-route]'); if(routeLink){event.preventDefault(); const route=routeLink.dataset.route; if(location.hash!==`#${route}`)history.pushState(null,'',`#${route}`); renderRoute(route);}
  });
  sidebarToggle.addEventListener('click',()=>{const open=shell.classList.toggle('is-sidebar-open');sidebarToggle.setAttribute('aria-expanded',String(open));});
  document.addEventListener('click',(event)=>{if(shell.classList.contains('is-sidebar-open')&&!sidebar.contains(event.target)&&!sidebarToggle.contains(event.target)){shell.classList.remove('is-sidebar-open');sidebarToggle.setAttribute('aria-expanded','false');}});

  const notificationToggle=document.querySelector('[data-notification-toggle]'); const notificationPopover=document.getElementById('notification-popover'); const profileToggle=document.querySelector('[data-profile-toggle]'); const profileMenu=document.getElementById('profile-menu');
  function togglePanel(button,panel,open){panel.hidden=!open;button.setAttribute('aria-expanded',String(open));}
  notificationToggle.addEventListener('click',()=>{togglePanel(notificationToggle,notificationPopover,notificationPopover.hidden);togglePanel(profileToggle,profileMenu,false);});
  profileToggle.addEventListener('click',()=>{togglePanel(profileToggle,profileMenu,profileMenu.hidden);togglePanel(notificationToggle,notificationPopover,false);});
  document.querySelector('[data-clear-notifications]').addEventListener('click',()=>{state.notifications.forEach((n)=>n.read=true);saveState();updateChrome();});
  document.querySelector('[data-export-data]').addEventListener('click',exportData);

  moduleView.addEventListener('dragover', (event) => {
    const drop = event.target.closest('[data-official-photo-drop]');
    if (!drop) return;
    event.preventDefault();
    drop.classList.add('is-dragging');
  });

  moduleView.addEventListener('dragleave', (event) => {
    const drop = event.target.closest('[data-official-photo-drop]');
    if (!drop || drop.contains(event.relatedTarget)) return;
    drop.classList.remove('is-dragging');
  });

  moduleView.addEventListener('drop', (event) => {
    const drop = event.target.closest('[data-official-photo-drop]');
    if (!drop) return;
    event.preventDefault();
    drop.classList.remove('is-dragging');
    const file = event.dataTransfer?.files?.[0];
    const input = drop.querySelector('input[type="file"]');
    if (!file || !input) return;
    if (!file.type.startsWith('image/')) { showToast('Choose a JPG, PNG, or WebP image.'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('Profile photos must be 5 MB or smaller.'); return; }
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  document.addEventListener('change',async(event)=>{if(!event.target.matches('[data-import-data]'))return;const file=event.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());state={...emptyState(),...parsed,assignments:Array.isArray(parsed.assignments)?parsed.assignments:[],masterGames:Array.isArray(parsed.masterGames)?parsed.masterGames:[],schools:Array.isArray(parsed.schools)?parsed.schools:[],users:Array.isArray(parsed.users)?parsed.users:[],userDrafts:Array.isArray(parsed.userDrafts)?parsed.userDrafts:[],invitations:Array.isArray(parsed.invitations)?parsed.invitations:[],officials:Array.isArray(parsed.officials)?parsed.officials:[],officialAvailability:Array.isArray(parsed.officialAvailability)?parsed.officialAvailability:[],calendarAvailability:{...(parsed.calendarAvailability||{})},calendarBlocks:Array.isArray(parsed.calendarBlocks)?parsed.calendarBlocks:[],settings:{...emptyState().settings,...(parsed.settings||{})},profile:{...emptyState().profile,...(parsed.profile||{})},taxProfile:{...emptyState().taxProfile,...(parsed.taxProfile||{})}};saveState();await renderRoute('settings');showToast('Dashboard data imported.');}catch{showToast('The selected file is not a valid dashboard export.');}});
  window.addEventListener('popstate',()=>renderRoute(location.hash.slice(1)||'home'));
  window.addEventListener('hashchange',()=>renderRoute(location.hash.slice(1)||'home'));

  const __adminParams=new URLSearchParams(location.search);
  const __adminRoute=__adminParams.get('route')||location.hash.slice(1)||'home';
  const __adminSub=__adminParams.get('sub')||'';
  if(__adminRoute==='schools'&&__adminSub&&typeof schoolsUi!=='undefined'){schoolsUi.section=__adminSub;}
  if(__adminRoute==='games'&&__adminSub&&typeof gamesUi!=='undefined'){gamesUi.section=__adminSub;}
  if(location.hash.slice(1)!==__adminRoute) history.replaceState(null,'',`#${__adminRoute}`);
  updateChrome(); renderRoute(__adminRoute);
})();
