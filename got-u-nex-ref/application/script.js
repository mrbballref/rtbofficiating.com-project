(() => {
  'use strict';

  const STORAGE_KEY = 'gotUNexRef.officialPortal.v3';
  const ADMIN_ASSIGNMENTS_KEY = 'gotUNexRef.adminAssignments.v1';
  const ADMIN_DASHBOARD_KEY = 'gotUNexRef.adminDashboard.v1';
  const PAYROLL_KEY = 'gotUNexRef.payroll.v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value = '') => String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const uid = (prefix = 'item') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // My Profile is the authenticated user's home page after login.
  const DEFAULT_LANDING_VIEW = 'profile';

  const DEFAULT_STATE = {
    profile: {
      firstName:'', lastName:'', preferredName:'', dateOfBirth:'', officialId:'', role:'',
      email:'', phone:'', streetAddress:'', address2:'', city:'', state:'', postalCode:'', country:'', timezone:'',
      primarySport:'', yearsExperience:'', preferredLevel:'', uniformSize:'', nfhsNumber:'',
      accountStatus:'', backgroundStatus:'', backgroundDate:'', safeSportStatus:'', safeSportDate:'', idExpiry:'', photoDataUrl:''
    },
    accountStats:{ total:0, completed:0, upcoming:0, cancelled:0, rating:null, reviews:0 },
    assignments:[],
    availability:{ values:[
      ['unset','unset','unset','unset','unset','unset','unset'],
      ['unset','unset','unset','unset','unset','unset','unset'],
      ['unset','unset','unset','unset','unset','unset','unset']
    ], savedAt:'' },
    documents:[], requiredForms:[], uploads:[], evaluations:[], incidents:[], messages:[], notifications:[], schools:[], whiteboard:[], supportTickets:[],
    permissions:[],
    authorization:{ canCreateAssignments:false },
    settings:{ emailAssignmentAlerts:false, smsAssignmentAlerts:false, documentReminders:false, evaluationNotifications:false, crewPhoneVisibility:false }
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function mergeState(base, incoming) {
    if (!incoming || typeof incoming !== 'object') return base;
    const out = Array.isArray(base) ? [...base] : { ...base };
    Object.keys(incoming).forEach(key => {
      if (incoming[key] && typeof incoming[key] === 'object' && !Array.isArray(incoming[key]) && base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) out[key] = mergeState(base[key], incoming[key]);
      else out[key] = incoming[key];
    });
    return out;
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return mergeState(clone(DEFAULT_STATE), saved || {});
    } catch (error) {
      console.warn('Could not read portal state.', error);
      return clone(DEFAULT_STATE);
    }
  }

  function syncAdminAssignmentsForCurrentOfficial(targetState) {
    try {
      const shared = JSON.parse(localStorage.getItem(ADMIN_ASSIGNMENTS_KEY) || 'null');
      const allAdminAssignments = Array.isArray(shared?.assignments) ? shared.assignments : [];
      const published = allAdminAssignments.filter(a => String(a.publishStatus || a.status || '').toLowerCase() === 'published' || a.published === true);
      const officialId = String(targetState.profile?.officialId || '');
      const existing = Array.isArray(targetState.assignments) ? targetState.assignments : [];
      const nonAdmin = existing.filter(a => !a.adminAssignmentId);
      if (!officialId) {
        targetState.assignments = nonAdmin;
        return targetState;
      }
      const mine = [];
      published.forEach(a => {
        const crew = Array.isArray(a.crew) ? a.crew : [];
        const member = crew.find(c => c.role !== 'Alternate' && String(c.officialId || '') === officialId);
        if (!member) return;
        mine.push({
          ...a,
          id: `${a.id}:${officialId}`,
          adminAssignmentId: a.id,
          officialId,
          assigneeId: officialId,
          assignedToMe: true,
          position: member.role,
          status: a.status === 'draft' ? 'draft' : (a.status || 'pending'),
          workflowStatus: a.workflowStatus === 'draft' ? 'draft' : (a.workflowStatus || a.status || 'pending')
        });
      });
      targetState.assignments = [...mine, ...nonAdmin];
      return targetState;
    } catch (error) {
      console.warn('Could not synchronize admin game assignments.', error);
      return targetState;
    }
  }

  function syncAdminEvaluationsForCurrentOfficial(targetState) {
    try {
      const admin = JSON.parse(localStorage.getItem(ADMIN_DASHBOARD_KEY) || 'null') || {};
      const users = Array.isArray(admin.users) ? admin.users : [];
      const byUser = admin.options?.officialEvaluationsByUser && typeof admin.options.officialEvaluationsByUser === 'object' ? admin.options.officialEvaluationsByUser : {};
      const officialId = String(targetState.profile?.officialId || '');
      const email = String(targetState.profile?.email || '').toLowerCase();
      const existing = Array.isArray(targetState.evaluations) ? targetState.evaluations : [];
      const nonAdmin = existing.filter(item => item.source !== 'adminEvaluation');
      if (!officialId && !email) { targetState.evaluations = nonAdmin; return targetState; }
      const user = users.find(u => officialId && [u.id,u.userId,u.officialId].some(v => String(v || '') === officialId)) || users.find(u => email && String(u.email || '').toLowerCase() === email);
      const keys = [user?.id,user?.userId,user?.officialId,officialId,email].filter(Boolean).map(String);
      const records = [];
      if (Array.isArray(user?.evaluations)) records.push(...user.evaluations);
      keys.forEach(key => { if (Array.isArray(byUser[key])) records.push(...byUser[key]); });
      const seen = new Set();
      const finalized = records.filter(item => String(item.status || '').toLowerCase() === 'finalized').filter(item => { const id=String(item.id||''); if (!id || seen.has(id)) return false; seen.add(id); return true; }).map(item => ({...item, source:'adminEvaluation'}));
      targetState.evaluations = [...finalized, ...nonAdmin];
      return targetState;
    } catch (error) {
      console.warn('Could not synchronize finalized referee evaluations.', error);
      return targetState;
    }
  }


  function syncAdminIncidentsForCurrentOfficial(targetState) {
    try {
      const admin = JSON.parse(localStorage.getItem(ADMIN_DASHBOARD_KEY) || 'null') || {};
      const records = Array.isArray(admin.options?.incidentReports) ? admin.options.incidentReports : [];
      const officialId = String(targetState.profile?.officialId || '');
      const email = String(targetState.profile?.email || '').toLowerCase();
      const local = Array.isArray(targetState.incidents) ? targetState.incidents : [];
      const localById = new Map(local.map(item => [String(item.id || item.incidentNumber || ''), item]));
      records.filter(item => {
        const submitterId = String(item.submittedByOfficialId || item.officialId || '');
        const submitterEmail = String(item.submittedByEmail || item.email || '').toLowerCase();
        return (officialId && submitterId === officialId) || (email && submitterEmail === email);
      }).forEach(item => {
        const key = String(item.id || item.incidentNumber || '');
        const current = localById.get(key) || {};
        localById.set(key, { ...current, ...item, source:'adminIncident' });
      });
      targetState.incidents = [...localById.values()].filter(Boolean);
      return targetState;
    } catch (error) {
      console.warn('Could not synchronize incident reports.', error);
      targetState.incidents = Array.isArray(targetState.incidents) ? targetState.incidents : [];
      return targetState;
    }
  }

  let state = syncAdminIncidentsForCurrentOfficial(syncAdminEvaluationsForCurrentOfficial(syncAdminAssignmentsForCurrentOfficial(loadState())));
  let assignmentFilter = 'all';
  let assignmentSearch = '';
  let assignmentStatusFilter = '';
  let assignmentTypeFilter = '';
  let assignmentTeamFilter = '';
  let assignmentMonthFilter = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
  let assignmentSortDirection = 'asc';
  let assignmentPage = 1;
  const assignmentPageSize = 8;
  let myGamesFilter = 'upcoming';
  let myGamesSort = 'soonest';
  let myGamesPage = 1;
  const myGamesPageSize = 4;
  let myGamesFromDate = '';
  let myGamesToDate = '';
  let myGamesLevel = '';
  let myGamesLocation = '';
  let documentFilter = 'all';
  let documentSearch = '';
  let documentCategory = 'all';
  let documentType = 'all';
  let documentDateRange = 'all';
  let documentSort = 'newest';
  let documentSelectedId = '';
  let documentPage = 1;
  let documentZoom = 1;
  let documentActivityExpanded = false;
  const documentPageSize = 8;
  let incidentFilter = 'all';
  let incidentStatusFilter = '';
  let incidentSelectedId = '';
  let incidentPage = 1;
  const incidentPageSize = 8;
  let calendarCursor = new Date();
  let activeView = 'profile';
  let modalContext = null;
  let photoPreviewDataUrl = '';

  const toast = $('#toast');
  const modal = $('#modalBackdrop');
  const modalBody = $('#modalBody');
  const modalTitle = $('#modalTitle');
  const modalEyebrow = $('#modalEyebrow');
  let toastTimer;

  const BRIDGE = {
    async call(action, payload = {}) {
      const external = window.GotUNexRefAdminAPI;
      if (external && typeof external[action] === 'function') {
        try { return await external[action](payload); }
        catch (error) { console.error(`Admin adapter action ${action} failed`, error); }
      }
      window.dispatchEvent(new CustomEvent('gotunexref:portal-action', { detail: { action, payload, officialId: state.profile.officialId, timestamp: new Date().toISOString() } }));
      return { localOnly: true };
    }
  };

  function persist(action = 'stateUpdated', payload = {}) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    BRIDGE.call(action, payload);
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function formatDisplayDate(iso) {
    if (!iso) return '';
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString('en-US', { month:'2-digit', day:'2-digit', year:'numeric' });
  }
  function formatLongDate(iso) {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
  }
  function dayParts(iso) {
    const d = new Date(`${iso}T12:00:00`);
    return {
      month: d.toLocaleDateString('en-US',{month:'short'}).toUpperCase(),
      day: d.getDate(),
      weekday: d.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase()
    };
  }
  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function normalizedPortalRole() {
    return String(state.profile?.role || '').trim().toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ');
  }

  function portalPermissionSet() {
    const permissions = new Set();
    const sources = [
      state.permissions,
      state.profile?.permissions,
      state.authorization?.permissions
    ];
    sources.forEach(source => {
      if (Array.isArray(source)) source.forEach(value => permissions.add(String(value).trim().toLowerCase()));
      else if (source && typeof source === 'object') {
        Object.entries(source).forEach(([key,value]) => { if (value === true) permissions.add(String(key).trim().toLowerCase()); });
      }
    });
    return permissions;
  }

  function canCreateAssignments() {
    const role = normalizedPortalRole();
    if (role === 'super admin' || role === 'superadmin') return true;
    if (state.authorization?.canCreateAssignments === true) return true;
    const permissions = portalPermissionSet();
    return permissions.has('assignments.create')
      || permissions.has('assignment.create')
      || permissions.has('create_assignments')
      || permissions.has('create assignments');
  }

  function renderPermissionGates() {
    $$('[data-requires-permission="assignments.create"]').forEach(element => {
      element.hidden = !canCreateAssignments();
      element.setAttribute('aria-hidden', String(!canCreateAssignments()));
    });
  }

  function showView(view, pushHash = true) {
    if (view === 'notifications' && !location.pathname.endsWith('/notifications.html') && !location.pathname.endsWith('notifications.html')) {
      location.href = 'notifications.html';
      return;
    }
    if (view === 'calendar' && !location.pathname.endsWith('/calendar.html') && !location.pathname.endsWith('calendar.html')) {
      location.href = 'calendar.html';
      return;
    }
    if (view === 'availability' && !location.pathname.endsWith('/calendar.html') && !location.pathname.endsWith('calendar.html')) {
      location.href = 'calendar.html#availability';
      return;
    }
    const valid = $('[data-view-panel="' + CSS.escape(view) + '"]') ? view : 'profile';
    activeView = valid;
    document.body.classList.toggle('evaluation-review-active', valid === 'evaluations');
    document.body.classList.toggle('incident-center-active', valid === 'incidents');
    document.body.classList.toggle('documents-center-active', valid === 'documents');
    document.body.classList.toggle('payment-center-active', valid === 'payments');
    $$('[data-view-panel]').forEach(panel => {
      const active = panel.dataset.viewPanel === valid;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    $$('.side-link').forEach(link => link.classList.toggle('active', link.dataset.view === valid));
    if (pushHash) history.replaceState(null, '', `#${valid}`);
    window.scrollTo({ top:0, behavior:'smooth' });
    renderAll();
  }

  function profileCityLine() {
    return [state.profile.city, state.profile.state, state.profile.postalCode, state.profile.country].filter(Boolean).join(', ').replace(/, ([0-9]{5}(?:-[0-9]{4})?),/, ' $1,');
  }

  function renderProfile() {
    const p = state.profile;
    const rawName = `${p.firstName || ''} ${p.lastName || ''}`.trim();
    const fullName = rawName || 'Profile not completed';
    const roleDisplay = p.role || 'Role not provided';
    const values = {
      fullName,
      officialId:p.officialId || 'Not issued',
      role:roleDisplay,
      roleUpper:roleDisplay.toUpperCase(),
      utilityName:fullName,
      email:p.email || 'Not provided',
      phone:p.phone || 'Not provided',
      streetAddress:[p.streetAddress,p.address2].filter(Boolean).join(', ') || 'Not provided',
      cityLine:profileCityLine() || 'Not provided',
      timezone:p.timezone || 'Not provided',
      primarySport:p.primarySport || 'Not provided',
      yearsExperience:p.yearsExperience || 'Not provided',
      preferredLevel:p.preferredLevel || 'Not provided',
      uniformSize:p.uniformSize || 'Not provided',
      nfhsNumber:p.nfhsNumber || 'Not provided',
      accountStatus:p.accountStatus || 'Not on file',
      backgroundStatus:p.backgroundStatus || 'Not on file',
      backgroundDate:p.backgroundDate ? `(${p.backgroundDate})` : '',
      safeSportStatus:p.safeSportStatus || 'Not on file',
      safeSportDate:p.safeSportDate ? `(${p.safeSportDate})` : '',
      idExpiry:p.idExpiry || 'Not issued',
      cardName:rawName ? `${esc(p.firstName).toUpperCase()}<br/>${esc(p.lastName).toUpperCase()}` : 'PROFILE<br/>NOT SET'
    };
    $$('[data-profile-display]').forEach(el => {
      const key = el.dataset.profileDisplay;
      if (key === 'cardName') el.innerHTML = values[key];
      else el.textContent = values[key] ?? '';
    });
    $$('[data-profile-photo]').forEach(img => img.src = p.photoDataUrl || 'assets/profile-placeholder.svg');
  }

  function renderProfileAssignments() {
    const target = $('#profileAssignmentList');
    const accepted = state.assignments.filter(a => a.status === 'accepted').slice(0,3);
    if (!accepted.length) {
      target.innerHTML = '<div class="compact-empty">No accepted upcoming assignments.</div>';
      return;
    }
    target.innerHTML = accepted.map(a => {
      const d = dayParts(a.date);
      return `<button class="assignment-item assignment-button" data-assignment-id="${esc(a.id)}">
        <div class="date-tile"><span>${d.month}</span><strong>${d.day}</strong><small>${d.weekday}</small></div>
        <div class="assignment-copy"><h3>${esc(a.matchup)}</h3><p>${esc(a.level)}</p><div class="meta"><span><svg><use href="#i-clock"/></svg>${esc(a.time)}</span><span><svg><use href="#i-pin"/></svg>${esc(a.location)}</span></div></div>
        <span class="status-pill">CONFIRMED</span>
      </button>`;
    }).join('');
  }

  function renderProfileDocuments() {
    const target = $('#profileDocumentList');
    if (!target) return;
    const docs = collectOfficialDocuments().sort((a,b)=>documentDate(b)-documentDate(a)).slice(0,5);
    target.innerHTML = docs.length ? docs.map(doc => `<div class="document-row"><svg class="doc-icon"><use href="#i-file"/></svg><button class="doc-name doc-link" data-document-id="${esc(doc.id)}">${esc(doc.name)}</button><span class="doc-status">${esc(doc.status)}</span><time>${esc(documentDateLabel(doc))}</time><button class="download-btn" data-download-document="${esc(doc.id)}" aria-label="Download ${esc(doc.name)}"><svg><use href="#i-download"/></svg></button></div>`).join('') : '<div class="compact-empty">No completed documents yet.</div>';
  }

  function renderProfileAvailability() {
    const target = $('#profileAvailabilityTable');
    if (!target) return;
    const week = getCurrentWeekDates();
    const labels = ['Morning','Afternoon','Evening'];
    const times = ['6AM - 12PM','12PM - 5PM','5PM - 11PM'];
    let html = '<div class="day-head blank"></div>' + week.map(d => `<div class="day-head">${d.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase()}<small>${d.getMonth()+1}/${d.getDate()}</small></div>`).join('');
    state.availability.values.forEach((row, rowIndex) => {
      html += `<div class="time-label">${labels[rowIndex]}<small>${times[rowIndex]}</small></div>`;
      row.forEach(status => { html += `<div class="slot ${status}">${status === 'available' ? '✓' : status === 'limited' ? '•' : status === 'unavailable' ? '—' : '○'}</div>`; });
    });
    target.innerHTML = html;
  }

  function renderAccountOverview() {
    const target = $('#profileAccountOverview');
    const s = state.accountStats;
    const hasRating = s.rating !== null && s.rating !== undefined && s.rating !== '';
    target.innerHTML = `<div><span>Total Assignments</span><strong>${esc(s.total ?? 0)}</strong></div><div><span>Completed</span><strong>${esc(s.completed ?? 0)}</strong></div><div><span>Upcoming</span><strong>${esc(s.upcoming ?? 0)}</strong></div><div><span>Cancelled</span><strong>${esc(s.cancelled ?? 0)}</strong></div><div class="rating-row"><span>Rating</span><strong><b>${hasRating ? esc(s.rating) : '—'}</b>${hasRating ? `<em>★ ★ ★ ★ ★</em><small>(${esc(s.reviews ?? 0)})</small>` : '<small>No evaluation rating on file</small>'}</strong></div>`;
  }

  function renderDashboard() {
    const accepted = state.assignments.filter(a => a.status === 'accepted').length;
    const pending = state.assignments.filter(a => a.status === 'pending').length;
    const declined = state.assignments.filter(a => a.status === 'declined').length;
    const incomplete = state.requiredForms.filter(f => !['Completed','Signed'].includes(f.status) && !f.conditional).length;
    $('#dashboardSummary').innerHTML = [
      ['Accepted Assignments', accepted, 'assignments'],
      ['Pending Assignments', pending, 'assignments'],
      ['Required Forms', incomplete, 'documents'],
      ['Rating', state.accountStats.rating ?? '—', 'evaluations']
    ].map(([label,value,route]) => `<button class="summary-card" data-route="${route}"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>Open →</small></button>`).join('');
    $('#dashboardAssignmentStatus').innerHTML = `<button class="stack-row" data-route="assignments"><span><strong>Accepted</strong><small>Confirmed game assignments</small></span><b>${accepted}</b></button><button class="stack-row" data-route="assignments"><span><strong>Pending</strong><small>Assignments awaiting your response</small></span><b>${pending}</b></button><button class="stack-row" data-route="assignments"><span><strong>Declined</strong><small>Assignments you declined</small></span><b>${declined}</b></button>`;
    const required = state.requiredForms.filter(f => !['Completed','Signed'].includes(f.status) && !f.conditional);
    $('#dashboardRequiredActions').innerHTML = required.length ? required.map(f => `<button class="stack-row" data-form-id="${esc(f.id)}"><span><strong>${esc(f.name)}</strong><small>${esc(f.status)}</small></span><b>Open</b></button>`).join('') : '<div class="empty-state compact">No required profile forms are currently outstanding.</div>';
  }

  function assignmentCounts() {
    // Kept for compatibility with profile/dashboard summary counters.
    ['accepted','pending','declined'].forEach(status => {
      const el = $(`#${status}Count`);
      if (el) el.textContent = state.assignments.filter(a => String(a.status || '').toLowerCase() === status).length;
    });
  }

  function assignmentTitle(a) {
    return a.title || a.assignment || a.matchup || '';
  }

  function assignmentSubtitle(a) {
    return a.subtitle || a.description || a.level || '';
  }

  function assignmentType(a) {
    return a.type || a.assignmentType || '';
  }

  function assignmentTeam(a) {
    return a.classTeam || a.team || a.class || a.level || '';
  }

  function assignmentDateValue(a) {
    return a.dueDate || a.date || '';
  }

  function assignmentTimeValue(a) {
    return a.dueTime || a.time || '';
  }

  function assignmentStatusValue(a) {
    return String(a.workflowStatus || a.status || '').toLowerCase();
  }

  function assignmentIsMine(a) {
    if (a.assignedToMe === false) return false;
    const owner = a.officialId || a.assigneeId || a.userId || '';
    if (!owner) return true;
    return !state.profile.officialId || String(owner) === String(state.profile.officialId);
  }

  function assignmentIconId(a) {
    const type = assignmentType(a).toLowerCase();
    if (type.includes('quiz') || type.includes('evaluation')) return 'i-star';
    if (type.includes('film') || type.includes('analysis')) return 'i-eye';
    if (type.includes('document') || type.includes('report')) return 'i-file';
    if (type.includes('plan') || type.includes('form')) return 'i-calendar';
    return 'i-file';
  }

  function formatAssignmentDate(dateValue) {
    if (!dateValue) return { main:'—', sub:'' };
    const d = new Date(`${dateValue}T12:00:00`);
    if (Number.isNaN(d.getTime())) return { main:String(dateValue), sub:'' };
    return {
      main:d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
      sub:''
    };
  }

  function assignmentMonthKey(a) {
    const value = assignmentDateValue(a);
    if (!value) return '';
    const m = String(value).match(/^(\d{4})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}`;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  }

  function updateAssignmentMonthLabel() {
    const label = $('#assignmentDateRangeLabel');
    if (!label) return;
    if (!assignmentMonthFilter) {
      label.textContent = 'All Dates';
      return;
    }
    const [year,month] = assignmentMonthFilter.split('-').map(Number);
    const first = new Date(year,month-1,1);
    const last = new Date(year,month,0);
    const monthName = first.toLocaleDateString('en-US',{month:'short'});
    label.textContent = `${monthName} ${first.getDate()} – ${monthName} ${last.getDate()}, ${year}`;
  }

  function setSelectOptions(select, values, label) {
    if (!select) return;
    const current = select.value;
    const clean = [...new Set(values.filter(Boolean).map(v => String(v)))].sort((a,b)=>a.localeCompare(b));
    select.innerHTML = `<option value="">${esc(label)}</option>` + clean.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    if (clean.includes(current)) select.value = current;
  }

  function assignmentFilteredItems() {
    const query = assignmentSearch.trim().toLowerCase();
    return state.assignments.filter(a => {
      const status = assignmentStatusValue(a);
      const type = assignmentType(a);
      const team = assignmentTeam(a);
      const title = assignmentTitle(a);
      const subtitle = assignmentSubtitle(a);

      if (assignmentFilter === 'mine' && !assignmentIsMine(a)) return false;
      if (assignmentFilter === 'completed' && !(status === 'completed' || a.completed === true)) return false;
      if (assignmentStatusFilter && status !== assignmentStatusFilter.toLowerCase()) return false;
      if (assignmentTypeFilter && type !== assignmentTypeFilter) return false;
      if (assignmentTeamFilter && team !== assignmentTeamFilter) return false;
      if (assignmentMonthFilter && assignmentMonthKey(a) !== assignmentMonthFilter) return false;
      if (query) {
        const haystack = [title,subtitle,type,team,status,a.location,a.position].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    }).sort((a,b) => {
      const av = assignmentDateValue(a);
      const bv = assignmentDateValue(b);
      const at = av ? new Date(`${av}T12:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
      const bt = bv ? new Date(`${bv}T12:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
      return assignmentSortDirection === 'asc' ? at-bt : bt-at;
    });
  }

  function gameAssignmentDate(a) {
    return a.date || a.gameDate || a.dueDate || '';
  }

  function gameAssignmentTime(a) {
    return a.time || a.gameTime || a.dueTime || '';
  }

  function gameAssignmentStatus(a) {
    return String(a.status || a.workflowStatus || '').toLowerCase();
  }

  function gameAssignmentLocation(a) {
    return a.venue || a.location || a.siteName || '';
  }

  function gameAssignmentAddress(a) {
    return a.address || a.venueAddress || a.siteAddress || '';
  }

  function parseMatchupTeams(a) {
    const home = a.homeTeam || a.homeSchool || a.teamHome || '';
    const away = a.awayTeam || a.awaySchool || a.teamAway || '';
    if (home || away) return { home, away };
    const matchup = a.matchup || a.title || '';
    const vs = matchup.match(/^(.*?)\s+(?:vs\.?|versus)\s+(.*?)$/i);
    if (vs) return { home:vs[1].trim(), away:vs[2].trim() };
    const at = matchup.match(/^(.*?)\s+@\s+(.*?)$/);
    if (at) return { away:at[1].trim(), home:at[2].trim() };
    return { home:matchup || 'Team', away:'' };
  }

  function gameTeamInitials(name) {
    return String(name || '').split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join('').toUpperCase() || '—';
  }

  function gameDateParts(value) {
    if (!value) return {month:'—',day:'—',weekday:'—'};
    const d = new Date(`${value}T12:00:00`);
    if (Number.isNaN(d.getTime())) return {month:'—',day:'—',weekday:'—'};
    return {
      month:d.toLocaleDateString('en-US',{month:'short'}).toUpperCase(),
      day:String(d.getDate()).padStart(2,'0'),
      weekday:d.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase()
    };
  }

  function gameDateTimestamp(a) {
    const value = gameAssignmentDate(a);
    if (!value) return Number.MAX_SAFE_INTEGER;
    const d = new Date(`${value}T12:00:00`);
    return Number.isNaN(d.getTime()) ? Number.MAX_SAFE_INTEGER : d.getTime();
  }

  function isGamePast(a) {
    const dateValue = gameAssignmentDate(a);
    if (!dateValue) return gameAssignmentStatus(a) === 'completed' || gameAssignmentStatus(a) === 'past';
    const today = new Date();
    today.setHours(0,0,0,0);
    const d = new Date(`${dateValue}T00:00:00`);
    return !Number.isNaN(d.getTime()) && d < today;
  }

  function myGameAssignments() {
    return state.assignments.filter(a => assignmentIsMine(a) && (
      a.homeTeam || a.awayTeam || a.homeSchool || a.awaySchool || a.matchup ||
      String(a.type || '').toLowerCase().includes('game') ||
      String(a.assignmentType || '').toLowerCase().includes('game')
    ));
  }

  function populateMyGamesLevels(items) {
    const select = $('#myGamesLevelFilter');
    if (!select) return;
    const values = [...new Set(items.map(a=>a.level || a.classTeam || a.competitionLevel || '').filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b)));
    const current = myGamesLevel;
    select.innerHTML = '<option value="">All Levels</option>' + values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
    if (values.includes(current)) select.value = current;
  }

  function filteredMyGames() {
    const q = assignmentSearch.trim().toLowerCase();
    return myGameAssignments().filter(a => {
      const status = gameAssignmentStatus(a);
      const date = gameAssignmentDate(a);
      const teams = parseMatchupTeams(a);
      const level = a.level || a.classTeam || a.competitionLevel || '';
      const location = [gameAssignmentLocation(a),gameAssignmentAddress(a)].filter(Boolean).join(' ');
      if (myGamesFilter === 'upcoming' && isGamePast(a)) return false;
      if (myGamesFilter === 'accepted' && status !== 'accepted') return false;
      if (myGamesFilter === 'pending' && status !== 'pending') return false;
      if (myGamesFilter === 'declined' && status !== 'declined') return false;
      if (myGamesFilter === 'past' && !isGamePast(a) && status !== 'completed' && status !== 'past') return false;
      if (myGamesFromDate && date && date < myGamesFromDate) return false;
      if (myGamesToDate && date && date > myGamesToDate) return false;
      if (myGamesLevel && level !== myGamesLevel) return false;
      if (myGamesLocation && !location.toLowerCase().includes(myGamesLocation.toLowerCase())) return false;
      if (q) {
        const haystack = [
          teams.home,teams.away,a.matchup,a.title,a.level,a.classTeam,a.eventName,
          a.round,gameAssignmentLocation(a),gameAssignmentAddress(a),status
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    }).sort((a,b)=>{
      const at = gameDateTimestamp(a), bt = gameDateTimestamp(b);
      return myGamesSort === 'latest' ? bt-at : at-bt;
    });
  }

  function gameTeamMark(name,logo) {
    if (logo) return `<span class="my-game-team-mark"><img src="${esc(logo)}" alt="${esc(name || 'Team')} logo" /></span>`;
    return `<span class="my-game-team-mark fallback" aria-hidden="true"><b>${esc(gameTeamInitials(name))}</b></span>`;
  }

  function renderMyGames() {
    const panel = $('#myGamesPanel');
    if (!panel) return;

    const allMine = myGameAssignments();
    const total = allMine.length;
    const accepted = allMine.filter(a=>gameAssignmentStatus(a)==='accepted').length;
    const pending = allMine.filter(a=>gameAssignmentStatus(a)==='pending').length;
    const miles = allMine.reduce((sum,a)=>{
      const value = Number(a.travelMiles ?? a.mileage ?? a.distanceMiles ?? 0);
      return sum + (Number.isFinite(value) ? value : 0);
    },0);

    $('#myGamesTotal').textContent = total;
    $('#myGamesAccepted').textContent = accepted;
    $('#myGamesPending').textContent = pending;
    $('#myGamesMiles').textContent = Math.round(miles).toLocaleString('en-US');
    $('#myGamesAcceptedPct').textContent = total ? `${Math.round((accepted/total)*100)}%` : '0%';
    $('#myGamesPendingPct').textContent = total ? `${Math.round((pending/total)*100)}%` : '0%';

    $$('.my-games-tab[data-game-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.gameFilter===myGamesFilter));
    const sort = $('#myGamesSort'); if (sort) sort.value = myGamesSort;
    const from = $('#myGamesFromDate'); if (from && from.value !== myGamesFromDate) from.value = myGamesFromDate;
    const to = $('#myGamesToDate'); if (to && to.value !== myGamesToDate) to.value = myGamesToDate;
    const location = $('#myGamesLocationFilter'); if (location && location.value !== myGamesLocation) location.value = myGamesLocation;
    populateMyGamesLevels(allMine);
    const level = $('#myGamesLevelFilter'); if (level) level.value = myGamesLevel;

    const timezone = $('#myGamesTimezone');
    if (timezone) timezone.textContent = state.profile.timezone ? `All times shown in ${state.profile.timezone}.` : 'Times display in the timezone supplied by your profile.';

    const items = filteredMyGames();
    const totalPages = Math.max(1,Math.ceil(items.length/myGamesPageSize));
    if (myGamesPage > totalPages) myGamesPage = totalPages;
    const start = (myGamesPage-1)*myGamesPageSize;
    const pageItems = items.slice(start,start+myGamesPageSize);

    const list = $('#myGamesList');
    const empty = $('#myGamesEmpty');
    if (!list || !empty) return;

    list.innerHTML = pageItems.map(a=>{
      const teams = parseMatchupTeams(a);
      const parts = gameDateParts(gameAssignmentDate(a));
      const homeMascot = a.homeMascot || a.homeNickname || '';
      const awayMascot = a.awayMascot || a.awayNickname || '';
      const homeRecord = a.homeRecord || '';
      const awayRecord = a.awayRecord || '';
      const time = gameAssignmentTime(a) || 'Time not provided';
      const venue = gameAssignmentLocation(a) || 'Location not provided';
      const address = gameAssignmentAddress(a);
      const crewCount = Number(a.crewCount ?? a.officialsCount ?? (Array.isArray(a.crew)?a.crew.length:0));
      const status = gameAssignmentStatus(a) || 'pending';
      const assignedDate = a.assignedDate || a.createdAt || '';
      const assignedLabel = assignedDate ? `Assigned on ${String(assignedDate).slice(0,10)}` : 'Assignment date not provided';
      const competition = a.level || a.classTeam || a.competitionLevel || '';
      const round = a.round || a.eventName || a.competition || '';
      return `<article class="my-game-card">
        <div class="my-game-matchup">
          <div class="my-game-date"><b>${esc(parts.month)}</b><strong>${esc(parts.day)}</strong><small>${esc(parts.weekday)}</small></div>
          <div class="my-game-team">
            ${gameTeamMark(teams.home,a.homeLogo || a.homeTeamLogo)}
            <div class="my-game-team-copy"><strong>${esc(teams.home || 'Home team not provided')}</strong>${homeMascot?`<span>${esc(homeMascot)}</span>`:''}${homeRecord?`<small>${esc(homeRecord)}</small>`:''}</div>
          </div>
          <div class="my-game-vs">VS</div>
          <div class="my-game-team away">
            ${gameTeamMark(teams.away,a.awayLogo || a.awayTeamLogo)}
            <div class="my-game-team-copy"><strong>${esc(teams.away || 'Away team not provided')}</strong>${awayMascot?`<span>${esc(awayMascot)}</span>`:''}${awayRecord?`<small>${esc(awayRecord)}</small>`:''}</div>
          </div>
        </div>

        <div class="my-game-details">
          <div class="my-game-detail-row"><svg><use href="#i-clock"/></svg><div><strong>${esc(time)}</strong></div></div>
          <div class="my-game-detail-row"><svg><use href="#i-pin"/></svg><div><strong>${esc(venue)}</strong>${address?`<small>${esc(address)}</small>`:''}</div></div>
          <div class="my-game-detail-row"><svg><use href="#i-users"/></svg><div><strong>${crewCount ? `${crewCount} Official${crewCount===1?'':'s'}` : 'Crew not provided'}</strong>${a.crewPartnered===false?'':crewCount?'<small>(Crews Partnered)</small>':''}</div></div>
        </div>

        <div class="my-game-status">
          <span class="my-game-status-pill ${esc(status)}">${esc(status)}</span>
          <p>${esc(assignedLabel)}</p>
          ${competition?`<strong>${esc(competition)}</strong>`:''}
          ${round?`<strong>${esc(round)}</strong>`:''}
        </div>

        <div class="my-game-actions">
          <button class="my-game-action" type="button" data-game-action="details" data-assignment-id="${esc(a.id)}"><svg><use href="#i-eye"/></svg><span>View Details</span><svg><use href="#i-chevron-right"/></svg></button>
          <button class="my-game-action" type="button" data-game-action="calendar" data-assignment-id="${esc(a.id)}"><svg><use href="#i-calendar"/></svg><span>Add to Calendar</span><svg><use href="#i-chevron-right"/></svg></button>
          <button class="my-game-action" type="button" data-game-action="crew" data-assignment-id="${esc(a.id)}"><svg><use href="#i-users"/></svg><span>Contact Crew</span><svg><use href="#i-chevron-right"/></svg></button>
          <button class="my-game-action" type="button" data-game-action="directions" data-assignment-id="${esc(a.id)}"><svg><use href="#i-send"/></svg><span>Get Directions</span><svg><use href="#i-chevron-right"/></svg></button>
          ${(status==='completed'||status==='past'||isGamePast(a))?`<button class="my-game-action incident-game-action" type="button" data-game-action="incident" data-assignment-id="${esc(a.id)}"><svg><use href="#i-alert"/></svg><span>File Incident Report</span><svg><use href="#i-chevron-right"/></svg></button>`:''}
        </div>
      </article>`;
    }).join('');

    empty.hidden = pageItems.length > 0;

    const prev = $('#myGamesPrev'), next = $('#myGamesNext'), numbers = $('#myGamesPageNumbers');
    if (prev) prev.disabled = myGamesPage <= 1;
    if (next) next.disabled = myGamesPage >= totalPages || items.length === 0;
    if (numbers) numbers.innerHTML = Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1)
      .map(page=>`<button type="button" class="${page===myGamesPage?'active':''}" data-my-games-page="${page}">${page}</button>`).join('');
  }

  function gameCalendarDateTime(a) {
    const date = gameAssignmentDate(a);
    if (!date) return null;
    const rawTime = gameAssignmentTime(a);
    const timeMatch = String(rawTime||'').match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    let hours = 12, minutes = 0;
    if (timeMatch) {
      hours = Number(timeMatch[1]); minutes = Number(timeMatch[2]);
      const meridiem = (timeMatch[3]||'').toUpperCase();
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
    }
    const start = new Date(`${date}T${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:00`);
    if (Number.isNaN(start.getTime())) return null;
    const end = new Date(start.getTime()+2*60*60*1000);
    const fmt = d => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}00`;
    return {start:fmt(start),end:fmt(end)};
  }

  function addGameToCalendar(a) {
    const dt = gameCalendarDateTime(a);
    if (!dt) return showToast('A game date is required before this assignment can be added to a calendar.');
    const teams = parseMatchupTeams(a);
    const summary = [teams.home,teams.away].filter(Boolean).join(' vs. ') || assignmentTitle(a) || 'Game Assignment';
    const location = [gameAssignmentLocation(a),gameAssignmentAddress(a)].filter(Boolean).join(' — ');
    const ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Got U Nex Ref//Game Assignment//EN',
      'BEGIN:VEVENT',`UID:${a.id || uid('game')}@gotunexref.local`,`DTSTART:${dt.start}`,`DTEND:${dt.end}`,
      `SUMMARY:${summary.replace(/[,\n]/g,' ')}`,`LOCATION:${location.replace(/[,\n]/g,' ')}`,
      `DESCRIPTION:${String(a.level || a.classTeam || '').replace(/[,\n]/g,' ')}`,'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics],{type:'text/calendar'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${summary.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'game-assignment'}.ics`;
    link.click();
    setTimeout(()=>URL.revokeObjectURL(link.href),600);
    showToast('Calendar file created.');
  }

  function openCrewContacts(a) {
    const crew = Array.isArray(a.crew) ? a.crew : [];
    if (!crew.length) {
      return openModal('Contact Crew', `<div class="empty-state"><svg><use href="#i-users"/></svg><h3>No crew contacts available</h3><p>Crew contact information will appear when an authorized assignor provides it and your visibility settings allow access.</p><div class="form-actions"><button class="outline-btn" data-action="close-modal">Close</button></div></div>`,{eyebrow:'MY GAME'});
    }
    openModal('Contact Crew', `<div class="stack-list">${crew.map(member=>`<div class="stack-row"><span><strong>${esc(member.name || 'Crew member')}</strong><small>${esc(member.position || member.role || '')}</small></span><span>${member.phone?`<a href="tel:${esc(member.phone)}">${esc(member.phone)}</a>`:''}${member.email?`<br><a href="mailto:${esc(member.email)}">${esc(member.email)}</a>`:''}</span></div>`).join('')}</div><div class="form-actions"><button class="outline-btn" data-action="close-modal">Close</button></div>`,{eyebrow:'MY GAME'});
  }

  function openGameDirections(a) {
    const destination = gameAssignmentAddress(a) || gameAssignmentLocation(a);
    if (!destination) return showToast('No venue address is available for this assignment.');
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`,'_blank','noopener');
  }

  function renderAssignments() {
    assignmentCounts();

    const topSearch = $('#assignmentTopSearch');
    const tableSearch = $('#assignmentTableSearch');
    if (topSearch && topSearch.value !== assignmentSearch) topSearch.value = assignmentSearch;
    if (tableSearch && tableSearch.value !== assignmentSearch) tableSearch.value = assignmentSearch;

    const monthInput = $('#assignmentMonthFilter');
    if (monthInput && monthInput.value !== assignmentMonthFilter) monthInput.value = assignmentMonthFilter;
    updateAssignmentMonthLabel();

    setSelectOptions($('#assignmentStatusFilter'), state.assignments.map(assignmentStatusValue).filter(Boolean), 'All Statuses');
    setSelectOptions($('#assignmentTypeFilter'), state.assignments.map(assignmentType).filter(Boolean), 'All Types');
    setSelectOptions($('#assignmentTeamFilter'), state.assignments.map(assignmentTeam).filter(Boolean), 'All Classes/Teams');

    const statusSelect = $('#assignmentStatusFilter');
    const typeSelect = $('#assignmentTypeFilter');
    const teamSelect = $('#assignmentTeamFilter');
    if (statusSelect) statusSelect.value = assignmentStatusFilter;
    if (typeSelect) typeSelect.value = assignmentTypeFilter;
    if (teamSelect) teamSelect.value = assignmentTeamFilter;

    $$('.assignment-primary-tab[data-assignment-view]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.assignmentView === assignmentFilter);
    });

    const generalPanel = $('#assignmentGeneralPanel');
    const myGamesPanel = $('#myGamesPanel');
    if (generalPanel) generalPanel.hidden = assignmentFilter === 'mine';
    if (myGamesPanel) myGamesPanel.hidden = assignmentFilter !== 'mine';
    if (assignmentFilter === 'mine') {
      renderMyGames();
      return;
    }

    const items = assignmentFilteredItems();
    const totalPages = Math.max(1, Math.ceil(items.length / assignmentPageSize));
    if (assignmentPage > totalPages) assignmentPage = totalPages;
    const startIndex = (assignmentPage - 1) * assignmentPageSize;
    const pageItems = items.slice(startIndex, startIndex + assignmentPageSize);

    const body = $('#assignmentsTableBody');
    const empty = $('#assignmentsTableEmpty');
    if (!body || !empty) return;

    body.innerHTML = pageItems.map(a => {
      const title = assignmentTitle(a) || 'Assignment';
      const subtitle = assignmentSubtitle(a);
      const type = assignmentType(a) || '—';
      const team = assignmentTeam(a) || '—';
      const due = formatAssignmentDate(assignmentDateValue(a));
      const dueTime = assignmentTimeValue(a);
      const submitted = a.submittedCount ?? a.submissionsSubmitted ?? null;
      const submissionTotal = a.submissionTotal ?? a.submissionsTotal ?? null;
      const status = assignmentStatusValue(a) || 'pending';
      const submissionMain = submitted !== null && submissionTotal !== null ? `${submitted} / ${submissionTotal}` : '—';
      const submissionSub = a.submissionLabel || (submitted !== null ? 'Submitted' : '');
      return `<tr>
        <td>
          <div class="assignment-name-cell">
            <span class="assignment-type-icon"><svg><use href="#${assignmentIconId(a)}"/></svg></span>
            <span class="assignment-name-copy"><strong>${esc(title)}</strong>${subtitle ? `<small>${esc(subtitle)}</small>` : '<small>&nbsp;</small>'}</span>
          </div>
        </td>
        <td>${esc(type)}</td>
        <td>${esc(team)}</td>
        <td><span class="assignment-due-date"><strong>${esc(due.main)}</strong>${dueTime ? `<small>${esc(dueTime)}</small>` : due.sub ? `<small>${esc(due.sub)}</small>` : ''}</span></td>
        <td><span class="assignment-submissions"><strong>${esc(submissionMain)}</strong>${submissionSub ? `<small>${esc(submissionSub)}</small>` : ''}</span></td>
        <td><span class="assignment-status-pill ${esc(status)}">${esc(status || 'Pending')}</span></td>
        <td><button class="assignment-row-actions" type="button" data-assignment-id="${esc(a.id)}" aria-label="Open assignment actions"><svg><use href="#i-dots"/></svg></button></td>
      </tr>`;
    }).join('');

    empty.hidden = pageItems.length > 0;

    const showing = $('#assignmentShowingText');
    if (showing) {
      const from = items.length ? startIndex + 1 : 0;
      const to = items.length ? Math.min(startIndex + pageItems.length, items.length) : 0;
      showing.textContent = `Showing ${from} to ${to} of ${items.length} assignments`;
    }

    const prev = $('#assignmentPagePrev');
    const next = $('#assignmentPageNext');
    if (prev) prev.disabled = assignmentPage <= 1;
    if (next) next.disabled = assignmentPage >= totalPages || items.length === 0;

    const numbers = $('#assignmentPageNumbers');
    if (numbers) {
      numbers.innerHTML = Array.from({length:totalPages},(_,i)=>i+1)
        .slice(Math.max(0,assignmentPage-3),Math.max(0,assignmentPage-3)+5)
        .map(page => `<button type="button" class="${page===assignmentPage?'active':''}" data-assignment-page="${page}">${page}</button>`).join('');
    }
  }

  function getCurrentWeekDates() {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
    return Array.from({length:7}, (_,i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate()+i));
  }

  function renderAvailabilityEditor() {
    const target = $('#availabilityEditor');
    if (!target) return;
    const dates = getCurrentWeekDates();
    const labels = ['Morning','Afternoon','Evening'];
    const times = ['6AM - 12PM','12PM - 5PM','5PM - 11PM'];
    let html = '<div class="availability-edit-grid"><div class="day-head blank"></div>' + dates.map(d => `<div class="day-head">${d.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase()}<small>${d.getMonth()+1}/${d.getDate()}</small></div>`).join('');
    state.availability.values.forEach((row,rowIndex) => {
      html += `<div class="time-label">${labels[rowIndex]}<small>${times[rowIndex]}</small></div>`;
      row.forEach((status,colIndex) => { html += `<button class="availability-cell ${status}" data-availability-row="${rowIndex}" data-availability-col="${colIndex}" aria-label="${labels[rowIndex]} ${dates[colIndex].toLocaleDateString()}: ${status}">${status === 'available' ? '✓' : status === 'limited' ? '•' : status === 'unavailable' ? '—' : '○'}<small>${esc(status)}</small></button>`; });
    });
    html += '</div>';
    if (state.availability.savedAt) html += `<p class="save-meta">Last saved ${new Date(state.availability.savedAt).toLocaleString()}</p>`;
    target.innerHTML = html;
  }

  function renderCalendar() {
    const label = $('#calendarMonthLabel');
    const grid = $('#calendarGrid');
    if (!label || !grid) return;
    const year = calendarCursor.getFullYear();
    const month = calendarCursor.getMonth();
    label.textContent = calendarCursor.toLocaleDateString('en-US',{month:'long',year:'numeric'});
    const first = new Date(year,month,1);
    const last = new Date(year,month+1,0);
    const leading = first.getDay();
    let html = ['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => `<div class="calendar-day-head">${d}</div>`).join('');
    for (let i=0;i<leading;i++) html += '<div class="calendar-cell outside"></div>';
    for (let day=1;day<=last.getDate();day++) {
      const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const events = state.assignments.filter(a => a.status === 'accepted' && a.date === iso);
      html += `<div class="calendar-cell ${iso === todayISO() ? 'today' : ''}"><span class="calendar-number">${day}</span>${events.map(e => `<button class="calendar-event" data-assignment-id="${esc(e.id)}">${esc(e.time.replace(' CT',''))} · ${esc(e.matchup)}</button>`).join('')}</div>`;
    }
    grid.innerHTML = html;
  }

  function unreadMessageCount() { return state.messages.filter(m => !m.read && m.direction !== 'sent').length; }
  function unreadNotificationCount() { return (state.notifications || []).filter(n => !n.read).length; }

  function updateAlertBadges() {
    const messageUnread = unreadMessageCount();
    const notificationUnread = unreadNotificationCount();
    const total = messageUnread + notificationUnread;
    const messageBadge = $('#messageBadge');
    if (messageBadge) { messageBadge.textContent = messageUnread; messageBadge.hidden = messageUnread === 0; }
    const notificationSidebarBadge = $('#notificationSidebarBadge');
    if (notificationSidebarBadge) {
      notificationSidebarBadge.textContent = notificationUnread > 99 ? '99+' : notificationUnread;
      notificationSidebarBadge.hidden = notificationUnread === 0;
    }
    const assignmentMessageBadge = $('#assignmentMessageBadge');
    if (assignmentMessageBadge) { assignmentMessageBadge.textContent = messageUnread > 99 ? '99+' : messageUnread; assignmentMessageBadge.hidden = messageUnread === 0; }
    const assignmentNotificationBadge = $('#assignmentNotificationBadge');
    if (assignmentNotificationBadge) { assignmentNotificationBadge.textContent = notificationUnread > 99 ? '99+' : notificationUnread; assignmentNotificationBadge.hidden = notificationUnread === 0; }
    const evalNotificationBadge = $('#evalNotificationBadge');
    if (evalNotificationBadge) { evalNotificationBadge.textContent = notificationUnread > 99 ? '99+' : notificationUnread; evalNotificationBadge.hidden = notificationUnread === 0; }
    const heroBadge = $('#heroAlertBadge');
    if (heroBadge) { heroBadge.textContent = total > 99 ? '99+' : total; heroBadge.hidden = total === 0; }
    const messageCount = $('#profileMessageCount');
    if (messageCount) messageCount.textContent = messageUnread;
    const notificationCount = $('#profileNotificationCount');
    if (notificationCount) notificationCount.textContent = notificationUnread;
  }

  function communicationItemTime(item) { return item.date || item.createdAt || ''; }

  function renderCommunicationSummaries() {
    const messageTarget = $('#profileMessageSummary');
    if (messageTarget) {
      const unread = state.messages.filter(m => !m.read && m.direction !== 'sent');
      const source = (unread.length ? unread : state.messages.filter(m => m.direction !== 'sent')).slice(0, 3);
      messageTarget.innerHTML = source.length ? source.map(m => `<button class="communication-summary-item ${m.read ? '' : 'unread'}" data-message-id="${esc(m.id)}"><span class="summary-icon"><svg><use href="#i-mail"/></svg></span><span class="summary-copy"><strong>${esc(m.subject || 'Message')}</strong><small>${esc(m.from || m.sender || 'Authorized administrator')}</small></span><time>${esc(communicationItemTime(m))}</time></button>`).join('') : '<div class="communication-empty"><svg><use href="#i-mail"/></svg><span><strong>No unread messages</strong><small>Messages from users, assignors, the super admin, and authorized administrators will appear here.</small></span></div>';
    }
    const notificationTarget = $('#profileNotificationSummary');
    if (notificationTarget) {
      const notifications = state.notifications || [];
      const unread = notifications.filter(n => !n.read);
      const source = (unread.length ? unread : notifications).slice(0, 3);
      notificationTarget.innerHTML = source.length ? source.map(n => `<button class="communication-summary-item ${n.read ? '' : 'unread'}" data-notification-id="${esc(n.id)}"><span class="summary-icon"><svg><use href="#i-bell"/></svg></span><span class="summary-copy"><strong>${esc(n.title || 'Notification')}</strong><small>${esc(n.sender || n.from || n.category || 'Got U Nex Ref')}</small></span><time>${esc(communicationItemTime(n))}</time></button>`).join('') : '<div class="communication-empty"><svg><use href="#i-bell"/></svg><span><strong>No new notifications</strong><small>Assignment, document, account, and administrative alerts will appear here when received.</small></span></div>';
    }
    updateAlertBadges();
  }

  function renderMessages() {
    const list = $('#messageList');
    if (list) {
      list.innerHTML = state.messages.length ? state.messages.map(m => `<button class="message-row ${m.read ? '' : 'unread'}" data-message-id="${esc(m.id)}"><span><strong>${esc(m.subject)}</strong><small>${esc(m.from || m.to || 'Authorized administrator')}</small></span><time>${esc(m.date || '')}</time></button>`).join('') : '<div class="empty-state compact"><svg><use href="#i-mail"/></svg><h3>No messages</h3><p>Messages from users, assignors, the super admin, and authorized administrators will appear here when connected to the messaging service.</p></div>';
    }
    renderCommunicationSummaries();
  }

  function renderNotifications() {
    const target = $('#notificationList');
    if (target) {
      const notifications = state.notifications || [];
      target.innerHTML = notifications.length ? notifications.map(n => `<button class="notification-row ${n.read ? '' : 'unread'}" data-notification-id="${esc(n.id)}"><span class="notification-row-icon"><svg><use href="#i-bell"/></svg></span><span class="notification-row-copy"><strong>${esc(n.title || 'Notification')}</strong><small>${esc(n.sender || n.from || n.category || 'Got U Nex Ref')}</small><p>${esc(n.body || n.message || '')}</p></span><time>${esc(communicationItemTime(n))}</time></button>`).join('') : '<div class="empty-state"><svg><use href="#i-bell"/></svg><h3>No notifications</h3><p>Assignment, document, evaluation, account, and administrator notifications will appear here when received.</p></div>';
    }
    const alertMessages = $('#alertMessageList');
    if (alertMessages) {
      const unreadMessages = state.messages.filter(m => !m.read && m.direction !== 'sent');
      alertMessages.innerHTML = unreadMessages.length ? unreadMessages.map(m => `<button class="message-row unread" data-message-id="${esc(m.id)}"><span><strong>${esc(m.subject || 'Message')}</strong><small>${esc(m.from || m.sender || 'Authorized administrator')}</small></span><time>${esc(m.date || '')}</time></button>`).join('') : '<div class="empty-state compact"><svg><use href="#i-mail"/></svg><h3>No unread messages</h3><p>Unread message alerts will appear here.</p></div>';
    }
    renderCommunicationSummaries();
  }

  function renderSchools() {
    const target = $('#schoolsList');
    if (!target) return;
    target.innerHTML = state.schools.length ? state.schools.map(s => `<article class="info-card"><h3>${esc(s.name)}</h3><p>${esc(s.type || '')}</p><button class="outline-btn" data-school-id="${esc(s.id)}">View School</button></article>`).join('') : '<div class="empty-state"><svg><use href="#i-home"/></svg><h3>No schools linked yet</h3><p>Schools will appear here when the admin dashboard associates them with your official account or game assignments.</p></div>';
  }

  const FORM_SCHEMAS = {
    vendor: {
      title:'Vendor Information Form', eyebrow:'VENDOR ONBOARDING',
      fields:[
        ['legalName','Legal Name','text',true],['businessName','Business / DBA Name','text',false],['email','Email','email',true],['phone','Phone','tel',true],['streetAddress','Street Address','text',true],['address2','Address Line 2','text',false],['city','City','text',true],['state','State','text',true],['postalCode','ZIP / Postal Code','text',true],['paymentMethod','Preferred Payment Method','select',true,['Direct Deposit','Check','Other']],['signature','Typed Signature','text',true],['signedDate','Date','date',true]
      ]
    },
    'tax-w9': {
      title:'Tax / W-9 Information', eyebrow:'TAX CENTER',
      notice:'This portal worksheet captures W-9 information for the admin workflow. In production, connect it to the organization’s approved tax-document/e-sign process.',
      fields:[
        ['name','Name (as shown on tax return)','text',true],['businessName','Business name / disregarded entity','text',false],['taxClassification','Federal tax classification','select',true,['Individual / sole proprietor','C corporation','S corporation','Partnership','Trust / estate','LLC','Other']],['streetAddress','Street Address','text',true],['cityStateZip','City, State, ZIP','text',true],['tinType','Taxpayer ID Type','select',true,['SSN','EIN']],['tin','Taxpayer Identification Number','password',true],['certification','I certify the information is accurate','checkbox',true],['signature','Typed Signature','text',true],['signedDate','Date','date',true]
      ]
    },
    contract: {
      title:'Independent Contractor / Season Contract', eyebrow:'CONTRACTS',
      notice:'Contract terms are supplied by the admin dashboard. This frontend captures acknowledgment and signature after the actual contract text is synchronized.',
      fields:[
        ['contractTitle','Contract Title','text',true],['season','Season / Term','text',true],['acknowledgment','I have reviewed and agree to the synchronized contract terms','checkbox',true],['signature','Typed Signature','text',true],['signedDate','Date','date',true]
      ]
    },
    'game-report': {
      title:'Game Report', eyebrow:'POST-GAME REPORT',
      fields:[
        ['assignmentId','Game Assignment','assignment',true],['crew','Crew / Partners','text',false],['finalScore','Final Score','text',false],['overtime','Overtime','select',true,['No','Yes']],['difficulty','Game Difficulty','select',true,['1 - Low','2','3 - Moderate','4','5 - High']],['sportsmanship','Sportsmanship','select',true,['Excellent','Good','Fair','Poor']],['tableConduct','Table / Game Administration','select',true,['Excellent','Good','Fair','Poor','Not Applicable']],['technicalFouls','Technical / Intentional / Flagrant Fouls','textarea',false],['notes','Game Notes','textarea',false],['signature','Typed Signature','text',true],['submittedDate','Report Date','date',true]
      ]
    },
    'incident-report': {
      title:'Incident Report', eyebrow:'INCIDENT DOCUMENTATION',
      fields:[
        ['assignmentId','Game Assignment','assignment',true],['incidentType','Incident Type','select',true,['Player Conduct','Coach Conduct','Spectator Conduct','Facility / Security','Injury / Safety','Table / Game Administration','Other']],['incidentTime','Approximate Time / Game Clock','text',false],['peopleInvolved','People Involved','text',true],['description','Detailed Description','textarea',true],['actionsTaken','Actions Taken','textarea',true],['witnesses','Witnesses','text',false],['reportedTo','Reported To','text',false],['signature','Typed Signature','text',true],['submittedDate','Report Date','date',true]
      ]
    }
  };

  const FORM_LIBRARY = [
    { id:'library-vendor', type:'vendor', name:'Vendor Information Form', status:'Available', conditional:false },
    { id:'library-tax-w9', type:'tax-w9', name:'Tax / W-9 Information', status:'Available', conditional:false },
    { id:'library-game-report', type:'game-report', name:'Game Report', status:'Available', conditional:true },
    { id:'library-incident-report', type:'incident-report', name:'Incident Report', status:'Available', conditional:true }
  ];

  function getRequiredForm(id) { return state.requiredForms.find(f => f.id === id) || FORM_LIBRARY.find(f => f.id === id); }
  function linkedDocForForm(form) { return form?.linkedDocumentId ? state.documents.find(d => d.id === form.linkedDocumentId) : null; }

  const DOCUMENT_CATEGORY_DEFS = [
    { key:'all', label:'All Documents', icon:'i-folder' },
    { key:'contracts', label:'Contracts', icon:'i-file' },
    { key:'tax-forms', label:'Tax Forms', icon:'i-file' },
    { key:'evaluations', label:'Evaluations', icon:'i-star' },
    { key:'game-records', label:'Game Records', icon:'i-calendar' },
    { key:'incident-reports', label:'Incident Reports', icon:'i-alert' },
    { key:'invoices', label:'Invoices', icon:'i-file' },
    { key:'receipts', label:'Receipts', icon:'i-file' },
    { key:'certifications', label:'Certifications', icon:'i-shield' },
    { key:'id-card', label:'ID Card Files', icon:'i-card' },
    { key:'signed-documents', label:'Signed Documents', icon:'i-file' },
    { key:'uploads', label:'Uploads', icon:'i-upload' },
    { key:'other', label:'Other', icon:'i-file' }
  ];

  function documentDate(record) {
    const raw = record.updatedAt || record.completedAt || record.finalizedAt || record.submittedAt || record.date || record.createdAt || record.gameDate || '';
    const parsed = raw ? new Date(raw.length === 10 ? `${raw}T12:00:00` : raw) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date(0);
  }
  function documentDateLabel(record) {
    const date = documentDate(record);
    return date.getTime() ? date.toLocaleDateString('en-US',{month:'2-digit',day:'2-digit',year:'numeric'}) : '';
  }
  function documentCategoryLabel(key) { return DOCUMENT_CATEGORY_DEFS.find(item=>item.key===key)?.label || 'Other'; }
  function documentTypeLabel(record) {
    const explicit = String(record.fileType || record.extension || record.type || record.mimeType || '').toLowerCase();
    if (explicit.includes('pdf') || /\.pdf$/i.test(record.name||'')) return 'PDF';
    if (explicit.includes('word') || /\.(docx?|rtf)$/i.test(record.name||'')) return 'DOC';
    if (explicit.includes('sheet') || /\.(xlsx?|csv)$/i.test(record.name||'')) return 'XLS';
    if (explicit.includes('image') || /\.(png|jpe?g|webp|gif)$/i.test(record.name||'')) return 'IMG';
    if (explicit.includes('html') || /\.html?$/i.test(record.name||'')) return 'HTML';
    if (explicit.includes('json') || /\.json$/i.test(record.name||'')) return 'JSON';
    return 'DOC';
  }
  function documentFileIconClass(record) {
    const type=documentTypeLabel(record).toLowerCase();
    return ['pdf','doc','xls','img','html','json'].includes(type)?type:'doc';
  }
  function documentSizeLabel(record) {
    if (record.size) return formatBytes(Number(record.size)||0);
    if (record.fileSize) return formatBytes(Number(record.fileSize)||0);
    if (record.content) return formatBytes(new Blob([String(record.content)]).size);
    return '';
  }
  function normalizeDocumentRecord(record, extra={}) {
    const id=String(extra.id || record.id || record.sourceId || uid('doc'));
    const hint=`${record.type||''} ${record.name||record.title||''} ${record.status||''}`.toLowerCase();
    const inferred=hint.includes('contract')?'contracts':hint.includes('w-9')||hint.includes('w9')||hint.includes('tax')?'tax-forms':hint.includes('evaluation')?'evaluations':hint.includes('game report')||hint.includes('game record')?'game-records':hint.includes('incident')?'incident-reports':hint.includes('invoice')?'invoices':hint.includes('receipt')?'receipts':hint.includes('certif')?'certifications':hint.includes('id card')?'id-card':hint.includes('signed')?'signed-documents':'other';
    const category=extra.category || record.category || record.documentCategory || inferred;
    const name=extra.name || record.name || record.title || 'Completed Document';
    const status=extra.status || record.status || 'Completed';
    return {
      ...record,
      ...extra,
      id,
      name,
      category,
      categoryLabel:documentCategoryLabel(category),
      status,
      date:extra.date || record.date || record.completedAt || record.finalizedAt || record.submittedAt || record.updatedAt || record.createdAt || '',
      fileType:extra.fileType || record.fileType || record.type || record.mimeType || '',
      tags:Array.isArray(extra.tags)?extra.tags:(Array.isArray(record.tags)?record.tags:[]),
      description:extra.description || record.description || '',
      source:extra.source || record.source || 'portal'
    };
  }
  function currentOfficialIdentity() {
    return {
      id:String(state.profile.officialId||''),
      email:String(state.profile.email||'').trim().toLowerCase(),
      name:`${state.profile.firstName||''} ${state.profile.lastName||''}`.trim().toLowerCase()
    };
  }
  function completedAssignmentRecord(a) {
    const status=String(a.status||a.workflowStatus||'').toLowerCase();
    return status==='completed' || status==='past' || (status==='accepted' && isGamePast(a));
  }
  function contractRecordsForCurrentOfficial() {
    let contracts=[]; try{const parsed=JSON.parse(localStorage.getItem('gunr-contract-generator-v1')||'[]'); if(Array.isArray(parsed))contracts=parsed;}catch{}
    const identity=currentOfficialIdentity();
    return contracts.filter(c=>{
      const signed=Boolean(c.partyOneSignature||c.partyTwoSignature||String(c.status||'').toLowerCase()==='signed');
      if(!signed)return false;
      const emails=[c.partyOneEmail,c.partyTwoEmail].map(v=>String(v||'').toLowerCase()).filter(Boolean);
      const names=[c.partyOneName,c.partyTwoName,c.partyOneSigner,c.partyTwoSigner].map(v=>String(v||'').trim().toLowerCase()).filter(Boolean);
      return (identity.email&&emails.includes(identity.email)) || (identity.name&&names.includes(identity.name));
    }).map(c=>normalizeDocumentRecord(c,{
      id:`contract:${c.id}`,
      name:c.title || c.contractNumber || 'Signed Contract',
      category:'contracts',
      status:'Signed',
      date:c.partyTwoSignedDate||c.partyOneSignedDate||c.updatedAt||c.effectiveDate||'',
      fileType:'text/html',
      description:[c.partyOneName,c.partyTwoName].filter(Boolean).join(' ↔ '),
      tags:[c.contractNumber,c.governingState].filter(Boolean),
      data:{contractNumber:c.contractNumber,effectiveDate:c.effectiveDate,endDate:c.endDate,partyOne:c.partyOneName,partyTwo:c.partyTwoName,status:'Signed'},
      source:'contractGenerator'
    }));
  }
  function explicitAdminDocumentsForCurrentOfficial() {
    let admin={};try{admin=JSON.parse(localStorage.getItem(ADMIN_DASHBOARD_KEY)||'null')||{};}catch{}
    const docs=Array.isArray(admin.documents)?admin.documents:[];
    const identity=currentOfficialIdentity();
    return docs.filter(doc=>{
      const ids=[doc.officialId,doc.userId,doc.recipientId].map(v=>String(v||'')).filter(Boolean);
      const emails=[doc.email,doc.officialEmail,doc.recipientEmail].map(v=>String(v||'').toLowerCase()).filter(Boolean);
      return (identity.id&&ids.includes(identity.id)) || (identity.email&&emails.includes(identity.email));
    }).filter(doc=>String(doc.status||'').toLowerCase()!=='draft').map(doc=>normalizeDocumentRecord(doc,{id:`admin:${doc.id||doc.sourceId}`,source:'adminDocument'}));
  }

  function loadPayrollStore() {
    try {
      const parsed=JSON.parse(localStorage.getItem(PAYROLL_KEY)||'null')||{};
      return {
        payments:Array.isArray(parsed.payments)?parsed.payments:[],
        batches:Array.isArray(parsed.batches)?parsed.batches:[],
        bankProfiles:Array.isArray(parsed.bankProfiles)?parsed.bankProfiles:[],
        directDepositForms:Array.isArray(parsed.directDepositForms)?parsed.directDepositForms:[],
        reimbursements:Array.isArray(parsed.reimbursements)?parsed.reimbursements:[]
      };
    } catch { return {payments:[],batches:[],bankProfiles:[],directDepositForms:[],reimbursements:[]}; }
  }
  function savePayrollStore(store) { localStorage.setItem(PAYROLL_KEY,JSON.stringify(store)); }
  function payrollMatchesCurrentOfficial(record={}) {
    const identity=currentOfficialIdentity();
    const id=String(record.officialId||record.userId||'');
    const email=String(record.officialEmail||record.email||'').trim().toLowerCase();
    return (identity.id&&id===identity.id)||(identity.email&&email===identity.email);
  }
  function currentOfficialPayments() {
    return loadPayrollStore().payments.filter(payrollMatchesCurrentOfficial).filter(p=>String(p.status||'').toLowerCase()!=='void').sort((a,b)=>documentDate(b)-documentDate(a));
  }
  function currentOfficialReimbursements() {
    return loadPayrollStore().reimbursements.filter(payrollMatchesCurrentOfficial).filter(r=>String(r.status||'').toLowerCase()!=='void').sort((a,b)=>documentDate(b)-documentDate(a));
  }
  function currentOfficialBankProfile() {
    return loadPayrollStore().bankProfiles.find(payrollMatchesCurrentOfficial)||null;
  }
  function paymentDocumentsForCurrentOfficial() {
    const store=loadPayrollStore(); const docs=[];
    store.payments.filter(payrollMatchesCurrentOfficial).filter(p=>p.receiptId).forEach(p=>docs.push(normalizeDocumentRecord(p,{
      id:`payment-receipt:${p.id}`,name:`${p.receiptId} — Payment Receipt`,category:'receipts',status:p.status||'Recorded',date:p.paidAt||p.payoutDate||p.createdAt||'',fileType:'text/plain',description:`Payment receipt for ${p.game||'completed game'}`,tags:[p.organization,p.method,p.transactionId].filter(Boolean),data:{receipt:p.receiptId,transaction:p.transactionId,game:p.game,gameDate:p.gameDate,organization:p.organization,paymentMethod:p.method,status:p.status,amount:moneyValue(p.amount),payoutDate:p.payoutDate},source:'payrollReceipt'
    })));
    store.directDepositForms.filter(payrollMatchesCurrentOfficial).forEach(f=>docs.push(normalizeDocumentRecord(f,{
      id:`direct-deposit:${f.id}`,name:'Direct Deposit Authorization',category:'signed-documents',status:f.status||'Submitted',date:f.submittedAt||f.updatedAt||'',fileType:'application/json',description:'Official direct deposit authorization and banking update record',tags:[f.bankName,f.accountType,'Direct Deposit'].filter(Boolean),data:{accountHolder:f.accountHolder,bankName:f.bankName,accountType:f.accountType,routingEnding:f.routingLast4?`•••• ${f.routingLast4}`:'',accountEnding:f.accountLast4?`•••• ${f.accountLast4}`:'',status:f.status||'Submitted',submitted:f.submittedAt||''},source:'directDeposit'
    })));
    return docs;
  }
  function moneyValue(value){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value)||0);}
  function collectOfficialDocuments() {
    const docs=[];
    (state.documents||[]).filter(doc=>!['draft','not started'].includes(String(doc.status||'').toLowerCase())).forEach(doc=>docs.push(normalizeDocumentRecord(doc)));
    (state.uploads||[]).forEach(file=>docs.push(normalizeDocumentRecord(file,{
      id:`upload:${file.id}`,name:file.name,category:'uploads',status:'Uploaded',date:file.date||file.createdAt||'',fileType:file.type||'',size:file.size||0,dataUrl:file.dataUrl||'',description:'Uploaded file',source:'upload',uploadId:file.id
    })));
    (state.evaluations||[]).filter(e=>String(e.status||'').toLowerCase()==='finalized').forEach(e=>docs.push(normalizeDocumentRecord(e,{
      id:`evaluation:${e.id}`,name:`${e.gameTitle||e.matchup||[e.homeTeam,e.awayTeam].filter(Boolean).join(' vs ')||'Game'} — Evaluation`,category:'evaluations',status:'Completed',date:e.evaluationDate||e.gameDate||e.finalizedAt||'',fileType:'application/json',description:'Finalized referee evaluation',tags:[e.level,e.gender].filter(Boolean),data:{game:e.gameTitle||e.matchup||[e.homeTeam,e.awayTeam].filter(Boolean).join(' vs '),date:e.gameDate||e.evaluationDate||'',overallScore:e.overallScore||e.rating||'',evaluator:e.evaluatorName||e.evaluator||'',comments:e.commentsAvailableToOfficials||e.officialComments||e.comments||''},source:'evaluation'
    })));
    (state.incidents||[]).filter(r=>String(r.status||'').toLowerCase()!=='draft' && r.incidentNumber).forEach(r=>docs.push(normalizeDocumentRecord(r,{
      id:`incident:${r.id}`,name:`${r.incidentNumber} — Incident Report`,category:'incident-reports',status:incidentStatusLabel(r.status),date:r.submittedAt||r.submittedDate||r.updatedAt||'',fileType:'application/json',description:incidentGameTitle(r),tags:[prettyLabel(String(r.incidentType||r.category||'Incident').replace(/-/g,' ')),r.status].filter(Boolean),data:{incidentNumber:r.incidentNumber,game:incidentGameTitle(r),gameDate:r.gameDate||'',gameTime:r.gameTime||'',location:r.gameLocation||r.location||'',incidentType:prettyLabel(String(r.incidentType||r.category||'Incident').replace(/-/g,' ')),summary:r.summary||'',details:r.description||r.details||'',actionsTaken:r.actionsTaken||'',status:incidentStatusLabel(r.status)},source:'incident'
    })));
    (state.assignments||[]).filter(completedAssignmentRecord).forEach(a=>docs.push(normalizeDocumentRecord(a,{
      id:`game:${a.id}`,name:`${a.matchup||[a.homeTeam,a.visitingTeam||a.awayTeam].filter(Boolean).join(' vs ')||'Completed Game'} — Game Record`,category:'game-records',status:'Completed',date:a.date||'',fileType:'application/json',description:'Completed game assignment record',tags:[a.level,a.position].filter(Boolean),data:{game:a.matchup||[a.homeTeam,a.visitingTeam||a.awayTeam].filter(Boolean).join(' vs '),date:a.date||'',time:a.time||'',location:a.location||a.venue||'',level:a.level||'',position:a.position||'',crew:Array.isArray(a.crew)?a.crew.map(m=>m.name||m.officialName||m.role).filter(Boolean).join(', '):''},source:'gameRecord'
    })));
    docs.push(...contractRecordsForCurrentOfficial(),...explicitAdminDocumentsForCurrentOfficial(),...paymentDocumentsForCurrentOfficial());
    if(state.profile.officialId){docs.push(normalizeDocumentRecord({id:`id-card:${state.profile.officialId}`},{name:'Official ID Card Record',category:'id-card',status:'Active',date:state.profile.idExpiry||'',fileType:'application/json',description:'Got U Nex Ref official credential record',tags:[state.profile.role,state.profile.officialId].filter(Boolean),data:{official:`${state.profile.firstName||''} ${state.profile.lastName||''}`.trim(),officialId:state.profile.officialId,role:state.profile.role||'',expires:state.profile.idExpiry||''},source:'idCard'}));}
    const unique=new Map();
    docs.forEach(doc=>{const key=String(doc.sourceId||doc.id||`${doc.name}|${doc.date}`);if(!unique.has(key))unique.set(key,doc);});
    return [...unique.values()];
  }
  function filteredOfficialDocuments() {
    let docs=collectOfficialDocuments();
    const query=documentSearch.trim().toLowerCase();
    if(query)docs=docs.filter(doc=>[doc.name,doc.categoryLabel,doc.status,doc.description,(doc.tags||[]).join(' ')].join(' ').toLowerCase().includes(query));
    if(documentCategory!=='all')docs=docs.filter(doc=>doc.category===documentCategory);
    if(documentType!=='all')docs=docs.filter(doc=>documentTypeLabel(doc)===documentType);
    if(documentDateRange!=='all'){
      const cutoff=Date.now()-Number(documentDateRange)*86400000;
      docs=docs.filter(doc=>documentDate(doc).getTime()>=cutoff);
    }
    docs.sort((a,b)=>{
      if(documentSort==='oldest')return documentDate(a)-documentDate(b);
      if(documentSort==='name')return String(a.name).localeCompare(String(b.name));
      if(documentSort==='category')return String(a.categoryLabel).localeCompare(String(b.categoryLabel))||String(a.name).localeCompare(String(b.name));
      return documentDate(b)-documentDate(a);
    });
    return docs;
  }
  function findOfficialDocument(id){return collectOfficialDocuments().find(doc=>String(doc.id)===String(id));}
  function renderDocumentFormsDrawer(){
    const target=$('#documentFormsList'); if(!target)return;
    const assigned=(state.requiredForms||[]).map(form=>({ ...form,assigned:true }));
    const assignedTypes=new Set(assigned.map(f=>f.type));
    const available=FORM_LIBRARY.filter(f=>!assignedTypes.has(f.type));
    const rows=[...assigned,...available];
    target.innerHTML=rows.length?rows.map(form=>`<div class="document-form-row"><div><strong>${esc(form.name)}</strong><span>${esc(form.status||'Available')}${form.conditional?' · Complete when applicable':''}</span></div><button data-form-id="${esc(form.id)}" type="button">${['Completed','Signed'].includes(form.status)?'Update':'Open Form'}</button></div>`).join(''):'<div class="document-empty-state"><div><h3>No forms available</h3><p>Authorized forms will appear here when they are assigned.</p></div></div>';
  }
  function renderDocumentCategoryControls(allDocs){
    const counts={all:allDocs.length};allDocs.forEach(doc=>counts[doc.category]=(counts[doc.category]||0)+1);
    const track=$('#documentCategoryTrack'); if(track)track.innerHTML=DOCUMENT_CATEGORY_DEFS.map(cat=>`<button class="document-category-button ${documentCategory===cat.key?'active':''}" data-document-category="${esc(cat.key)}" type="button"><div class="document-folder-icon"><svg><use href="#${esc(cat.icon)}"></use></svg></div><strong>${esc(cat.label)}</strong><small>${counts[cat.key]||0}</small></button>`).join('');
    const select=$('#documentCategoryFilter'); if(select){select.innerHTML=DOCUMENT_CATEGORY_DEFS.map(cat=>`<option value="${esc(cat.key)}" ${documentCategory===cat.key?'selected':''}>${esc(cat.label)}</option>`).join('');}
    const types=[...new Set(allDocs.map(documentTypeLabel))].sort(); const type=$('#documentTypeFilter'); if(type){type.innerHTML='<option value="all">All Types</option>'+types.map(v=>`<option value="${esc(v)}" ${documentType===v?'selected':''}>${esc(v)}</option>`).join('');}
  }
  function renderDocumentPreview(doc){
    const panel=$('#documentPreviewPanel'),stage=$('#documentPreviewStage'),details=$('#documentPreviewDetails'); if(!panel||!stage||!details)return;
    if(!doc){panel.classList.add('is-empty');stage.innerHTML='<div class="document-preview-placeholder"><div><svg><use href="#i-file"></use></svg><strong>Select a document</strong><p>Choose a completed document to preview its saved record and details.</p></div></div>';details.innerHTML='';return;}
    panel.classList.remove('is-empty');
    let body='';
    if(doc.dataUrl&&String(doc.fileType||'').startsWith('image/'))body=`<img class="document-preview-image" src="${doc.dataUrl}" alt="${esc(doc.name)}">`;
    else if(doc.content&&String(doc.fileType||'').includes('html'))body=`<iframe title="${esc(doc.name)} preview" srcdoc="${esc(doc.content)}" style="width:100%;height:500px;border:0;background:#fff"></iframe>`;
    else {
      const data=doc.data&&typeof doc.data==='object'?doc.data:{}; const rows=Object.entries(data).filter(([k,v])=>v!==''&&v!==null&&v!==undefined&&k!=='content').slice(0,18).map(([k,v])=>`<div><dt>${esc(prettyLabel(k))}</dt><dd>${esc(Array.isArray(v)?v.join(', '):(typeof v==='boolean'?(v?'Yes':'No'):String(v)))}</dd></div>`).join('');
      body=`<div class="document-preview-sheet" style="transform:scale(${documentZoom});transform-origin:top center"><div class="preview-brand"><img src="assets/got-u-nex-ref-logo.png" alt="Got U Nex Ref"></div><h3>${esc(doc.name)}</h3>${rows?`<dl>${rows}</dl>`:`<p class="preview-note">${esc(doc.description||'This completed record is stored in your Got U Nex Ref documents library. The original file body will appear here when supplied by the connected document service.')}</p>`}</div>`;
    }
    stage.innerHTML=body;
    const tags=(doc.tags||[]).filter(Boolean);
    details.innerHTML=`<div class="document-preview-titleline"><h3>${esc(doc.name)}</h3><span class="document-preview-category">${esc(doc.categoryLabel)}</span></div><div class="document-preview-meta"><strong>File Type:</strong><span>${esc(documentTypeLabel(doc))} Document</span><strong>File Size:</strong><span>${esc(documentSizeLabel(doc)||'Record data')}</span><strong>Recorded:</strong><span>${esc(documentDateLabel(doc)||'Date not recorded')}</span><strong>Status:</strong><span>${esc(doc.status||'Completed')}</span>${doc.description?`<strong>Description:</strong><span>${esc(doc.description)}</span>`:''}</div>${tags.length?`<div class="document-preview-tags">${tags.map(tag=>`<span>${esc(tag)}</span>`).join('')}</div>`:''}`;
    const zoom=$('#documentZoomValue');if(zoom)zoom.textContent=`${Math.round(documentZoom*100)}%`;
  }
  function renderDocumentActivity(docs){
    const target=$('#documentRecentActivity');if(!target)return;
    const limit=documentActivityExpanded?Math.max(6,docs.length):6;const rows=docs.slice(0,limit);
    target.innerHTML=rows.length?rows.map(doc=>`<button class="document-activity-item" data-document-select="${esc(doc.id)}" type="button" style="border-top:0;border-left:0;border-bottom:0;background:transparent;color:inherit;text-align:left"><svg><use href="#i-file"></use></svg><span><strong>${esc(doc.name)}</strong><span>${esc(doc.status||'Completed')}</span><time>${esc(documentDateLabel(doc)||'')}</time></span></button>`).join(''):'<div class="document-empty-state"><div><h3>No document activity</h3><p>Completed and uploaded documents will appear here.</p></div></div>';
    const toggle=$('#documentActivityToggle');if(toggle)toggle.textContent=documentActivityExpanded?'Show Recent Activity':'View All Activity ›';
  }
  function renderDocuments() {
    const target=$('#documentsFullList'); if(!target)return;
    const allDocs=collectOfficialDocuments();renderDocumentCategoryControls(allDocs);renderDocumentFormsDrawer();
    const badge=$('#documentNotificationBadge');if(badge){const count=(state.notifications||[]).filter(n=>!n.read).length;badge.textContent=count>99?'99+':count;badge.hidden=count===0;}
    const search=$('#documentSearchInput');if(search&&search.value!==documentSearch)search.value=documentSearch;
    const dateFilter=$('#documentDateFilter');if(dateFilter)dateFilter.value=documentDateRange;
    const sort=$('#documentSortSelect');if(sort)sort.value=documentSort;
    let docs=filteredOfficialDocuments();
    const pages=Math.max(1,Math.ceil(docs.length/documentPageSize));if(documentPage>pages)documentPage=pages;
    const start=(documentPage-1)*documentPageSize;const slice=docs.slice(start,start+documentPageSize);
    const listTitle=$('#documentListTitle');if(listTitle)listTitle.textContent=documentCategory==='all'?'All Documents':documentCategoryLabel(documentCategory);
    const count=$('#documentListCount');if(count)count.textContent=`${docs.length} document${docs.length===1?'':'s'}`;
    target.innerHTML=slice.length?slice.map(doc=>`<article class="official-document-card ${documentSelectedId===doc.id?'selected':''}" data-document-select="${esc(doc.id)}"><div class="official-document-fileicon ${documentFileIconClass(doc)}">${esc(documentTypeLabel(doc))}</div><div class="official-document-title"><strong>${esc(doc.name)}</strong><span>${esc(doc.categoryLabel)}</span></div><div></div><div class="official-document-meta"><span>${esc(doc.status||'Completed')}</span><span>•</span><span>${esc(documentDateLabel(doc)||'Date unavailable')}</span>${documentSizeLabel(doc)?`<span>•</span><span>${esc(documentSizeLabel(doc))}</span>`:''}</div><div class="official-document-actions"><button type="button" data-download-document="${esc(doc.id)}" aria-label="Download ${esc(doc.name)}"><svg><use href="#i-download"></use></svg></button><button class="doc-card-dots" type="button" data-document-select="${esc(doc.id)}" aria-label="Preview ${esc(doc.name)}"><svg><use href="#i-dots"></use></svg></button></div></article>`).join(''):'<div class="document-empty-state"><div><svg><use href="#i-folder"></use></svg><h3>No documents found</h3><p>Completed games, submitted incident reports, finalized evaluations, signed contracts, tax forms, uploads, and other saved records will appear here automatically.</p></div></div>';
    const summary=$('#documentPageSummary');if(summary)summary.textContent=docs.length?`Showing ${start+1} to ${Math.min(start+documentPageSize,docs.length)} of ${docs.length} documents`:'Showing 0 documents';
    const controls=$('#documentPageControls');if(controls){let html=`<button type="button" data-document-page="${Math.max(1,documentPage-1)}" ${documentPage<=1?'disabled':''}>‹</button>`;for(let i=1;i<=Math.min(pages,5);i++)html+=`<button type="button" data-document-page="${i}" class="${i===documentPage?'active':''}">${i}</button>`;if(pages>5)html+=`<span>…</span><button type="button" data-document-page="${pages}" class="${pages===documentPage?'active':''}">${pages}</button>`;html+=`<button type="button" data-document-page="${Math.min(pages,documentPage+1)}" ${documentPage>=pages?'disabled':''}>›</button>`;controls.innerHTML=html;}
    if(documentSelectedId&&!allDocs.some(doc=>doc.id===documentSelectedId))documentSelectedId='';
    if(!documentSelectedId&&slice.length)documentSelectedId=slice[0].id;
    renderDocumentPreview(findOfficialDocument(documentSelectedId));renderDocumentActivity(allDocs.sort((a,b)=>documentDate(b)-documentDate(a)));
  }

  function renderIdCard() {
    const full = $('#fullIdCardStage');
    const source = $('#profileIdCardStage');
    if (full && source) full.innerHTML = source.innerHTML;
  }

  const EVALUATION_CATEGORY_DEFS = [
    { key:'mechanics', label:'Mechanics', match:key => key.startsWith('mechanics.') || key === 'knowledge.properMechanics' },
    { key:'positioning', label:'Positioning', match:key => ['mechanics.positioning','application.position','coverage.primary','coverage.secondary','coverage.offBall'].includes(key) },
    { key:'communication', label:'Communication', match:key => key === 'presence.communication' || /Communication$/i.test(key) },
    { key:'professionalism', label:'Professionalism', match:key => ['presence.professionalism','presence.demeanor','presence.attitude','comportment.poise','comportment.dignified','comportment.uniform','comportment.grooming','comportment.teamwork'].includes(key) },
    { key:'rules', label:'Rules Knowledge', match:key => key.startsWith('rulesKnowledge.') || ['knowledge.rules','application.appliesRules'].includes(key) }
  ];

  function evaluationNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
  }

  function evaluationDateValue(record) {
    return String(record.evaluationDate || record.gameDate || record.date || record.finalizedAt || '').slice(0,10);
  }

  function evaluationSeasonLabel(record) {
    const raw = evaluationDateValue(record);
    const date = raw ? new Date(`${raw}T12:00:00`) : null;
    if (!date || Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const start = month >= 7 ? year : year - 1;
    return `${start}-${start+1}`;
  }

  function evaluationGameLabel(record) {
    return record.game || record.matchup || [record.homeTeam,record.visitingTeam || record.awayTeam].filter(Boolean).join(' vs. ') || record.title || 'Finalized Evaluation';
  }

  function evaluationLevelLabel(record) {
    return record.levelGender || record.level || record.sport || '';
  }

  function evaluationVisibleComment(record) {
    return record.visibleComments || record.commentsAvailableToOfficials || record.notes || record.overallSummary || record.strengths || '';
  }

  function evaluationScoreObject(record) {
    return record.scores && typeof record.scores === 'object' ? record.scores : {};
  }

  function evaluationCategoryAverages(records) {
    return EVALUATION_CATEGORY_DEFS.map(def => {
      const values = [];
      records.forEach(record => {
        const scores = evaluationScoreObject(record);
        Object.entries(scores).forEach(([key,value]) => {
          const score = evaluationNumber(value);
          if (score && def.match(key)) values.push(score);
        });
        if (!Object.keys(scores).length) {
          const legacy = def.key === 'mechanics' ? record.mechanics : def.key === 'communication' ? record.communication : def.key === 'rules' ? record.rulesKnowledge : def.key === 'professionalism' ? record.professionalism : def.key === 'positioning' ? record.positioning : '';
          const score = evaluationNumber(legacy);
          if (score) values.push(score);
        }
      });
      return {...def, value: values.length ? values.reduce((sum,value)=>sum+value,0)/values.length : 0, count:values.length};
    });
  }

  function evaluationStars(score, className='') {
    const value = evaluationNumber(score);
    return `<span class="${className}">${[1,2,3,4,5].map(i => `<svg class="${value >= i - .25 ? 'is-filled' : ''}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-star"></use></svg>`).join('')}</span>`;
  }

  function evaluationStatusLabel(record) {
    return String(record.status || record.workflowStatus || 'Finalized').toLowerCase() === 'finalized' ? 'Finalized' : (record.status || 'Finalized');
  }

  function evaluationGrade(average) {
    if (!average) return '—';
    if (average >= 4.5) return 'A';
    if (average >= 4.0) return 'B';
    if (average >= 3.0) return 'C';
    if (average >= 2.0) return 'D';
    return 'Needs Review';
  }

  function evaluationCurrentSeasonRecords() {
    const selected = $('#evaluationSeasonFilter')?.value || 'all';
    const records = (state.evaluations || []).filter(record => String(record.status || record.workflowStatus || 'finalized').toLowerCase() === 'finalized');
    return selected === 'all' ? records : records.filter(record => evaluationSeasonLabel(record) === selected);
  }

  function populateEvaluationSeasonFilter() {
    const filter = $('#evaluationSeasonFilter');
    if (!filter) return;
    const current = filter.value || 'all';
    const seasons = [...new Set((state.evaluations || []).map(evaluationSeasonLabel).filter(Boolean))].sort().reverse();
    filter.innerHTML = `<option value="all">All Seasons</option>${seasons.map(season => `<option value="${esc(season)}">Season ${esc(season)}</option>`).join('')}`;
    filter.value = seasons.includes(current) || current === 'all' ? current : 'all';
  }

  function renderEvaluationRadar(categories) {
    const svg = $('#evaluationRadar');
    if (!svg) return;
    const cx=160, cy=142, radius=96, count=categories.length;
    const point=(index,scale=1)=>{const angle=(-Math.PI/2)+(index*2*Math.PI/count);return [cx+Math.cos(angle)*radius*scale,cy+Math.sin(angle)*radius*scale]};
    const polygons=[.2,.4,.6,.8,1].map(scale=>`<polygon class="radar-grid" points="${categories.map((_,i)=>point(i,scale).join(',')).join(' ')}"></polygon>`).join('');
    const axes=categories.map((_,i)=>{const [x,y]=point(i,1);return `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"></line>`}).join('');
    const hasData=categories.some(c=>c.value>0);
    const dataPoints=categories.map((c,i)=>point(i,(c.value||0)/5));
    const data=hasData?`<polygon class="radar-data" points="${dataPoints.map(p=>p.join(',')).join(' ')}"></polygon>${dataPoints.map(([x,y])=>`<circle class="radar-point" cx="${x}" cy="${y}" r="3.5"></circle>`).join('')}`:'';
    const labels=categories.map((c,i)=>{const [x,y]=point(i,1.29); const value=c.value?c.value.toFixed(2):'—'; return `<text x="${x}" y="${y-3}">${esc(c.label)}</text><text class="radar-value" x="${x}" y="${y+13}">${value}</text>`}).join('');
    svg.innerHTML=`${polygons}${axes}${data}${labels}`;
  }

  function renderEvaluationTrend(records) {
    const target=$('#evaluationTrendChart');
    if (!target) return;
    const points=records.slice().sort((a,b)=>evaluationDateValue(a).localeCompare(evaluationDateValue(b))).map(record=>({date:evaluationDateValue(record),score:evaluationNumber(record.rating || record.overallScore)})).filter(item=>item.date&&item.score);
    if (!points.length) { target.innerHTML='<div class="evaluation-empty-state"><svg><use href="#i-star"></use></svg><h3>No trend data</h3><p>Finalized evaluation scores will create your performance trend.</p></div>'; return; }
    const w=650,h=175,left=34,right=18,top=20,bottom=30,min=1,max=5;
    const x=i=>left+(points.length===1?(w-left-right)/2:i*(w-left-right)/(points.length-1));
    const y=v=>top+(max-v)*(h-top-bottom)/(max-min);
    const poly=points.map((p,i)=>`${x(i)},${y(p.score)}`).join(' ');
    const area=`${left},${y(min)} ${poly} ${x(points.length-1)},${y(min)}`;
    const grid=[1,2,3,4,5].map(v=>`<line class="trend-grid" x1="${left}" x2="${w-right}" y1="${y(v)}" y2="${y(v)}"></line><text x="2" y="${y(v)+4}">${v.toFixed(2)}</text>`).join('');
    const labels=points.map((p,i)=>{const date=new Date(`${p.date}T12:00:00`); const label=date.toLocaleDateString('en-US',{month:'short'}); return `<text x="${x(i)}" y="${h-6}" text-anchor="middle">${esc(label)}</text><text class="trend-score" x="${x(i)}" y="${y(p.score)-10}" text-anchor="middle">${p.score.toFixed(2)}</text><circle class="trend-point" cx="${x(i)}" cy="${y(p.score)}" r="4"></circle>`}).join('');
    target.innerHTML=`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Finalized evaluation score trend"><defs><linearGradient id="evalTrendGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3824" stop-opacity=".18"></stop><stop offset="1" stop-color="#ff3824" stop-opacity="0"></stop></linearGradient></defs>${grid}<line class="trend-benchmark" x1="${left}" x2="${w-right}" y1="${y(4)}" y2="${y(4)}"></line><polygon class="trend-area" points="${area}"></polygon><polyline class="trend-line" points="${poly}"></polyline>${labels}</svg>`;
  }

  function evaluationOrganizationRank(records) {
    try {
      const admin = JSON.parse(localStorage.getItem(ADMIN_DASHBOARD_KEY) || 'null') || {};
      const byUser = admin.options?.officialEvaluationsByUser;
      if (!byUser || typeof byUser !== 'object') return null;
      const selected=$('#evaluationSeasonFilter')?.value || 'all';
      const groups=new Map(); const seen=new Set();
      Object.entries(byUser).forEach(([key,list])=>{
        if (!Array.isArray(list)) return;
        list.forEach(record=>{
          if (String(record.status || record.workflowStatus || '').toLowerCase() !== 'finalized') return;
          if (selected!=='all' && evaluationSeasonLabel(record)!==selected) return;
          const id=String(record.id||''); if(!id || seen.has(id)) return; seen.add(id);
          const userKey=String(record.officialId || record.officialEmail || key || ''); if(!userKey) return;
          const score=evaluationNumber(record.rating || record.overallScore); if(!score) return;
          if(!groups.has(userKey)) groups.set(userKey,[]); groups.get(userKey).push(score);
        });
      });
      if (groups.size < 2) return null;
      const p=state.profile||{}; const currentKeys=[p.officialId,p.email].filter(Boolean).map(v=>String(v).toLowerCase());
      const ranked=[...groups.entries()].map(([key,values])=>({key:key.toLowerCase(),avg:values.reduce((a,b)=>a+b,0)/values.length})).sort((a,b)=>b.avg-a.avg);
      let index=ranked.findIndex(item=>currentKeys.includes(item.key));
      if(index<0){const currentAvg=records.map(r=>evaluationNumber(r.rating||r.overallScore)).filter(Boolean); if(currentAvg.length){const avg=currentAvg.reduce((a,b)=>a+b,0)/currentAvg.length; index=ranked.findIndex(item=>Math.abs(item.avg-avg)<.0001)}}
      return index>=0?{rank:index+1,total:ranked.length}:null;
    } catch { return null; }
  }

  function renderEvaluations() {
    populateEvaluationSeasonFilter();
    const records=evaluationCurrentSeasonRecords().slice().sort((a,b)=>`${evaluationDateValue(b)}${b.finalizedAt||''}`.localeCompare(`${evaluationDateValue(a)}${a.finalizedAt||''}`));
    const scores=records.map(r=>evaluationNumber(r.rating || r.overallScore)).filter(Boolean);
    const average=scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:0;
    const latest=records[0]||null;
    const overall=$('#evaluationOverallAverage'); if(overall) overall.textContent=average?average.toFixed(2):'—';
    const overallStars=$('#evaluationOverallStars'); if(overallStars) overallStars.innerHTML=evaluationStars(average,'evaluation-stars-inner');
    const overallLabel=$('#evaluationOverallLabel'); if(overallLabel) overallLabel.textContent=average?`${evaluationGrade(average)} performance level`:'No finalized evaluations';
    const total=$('#evaluationTotalCount'); if(total) total.textContent=String(records.length);
    const countMeta=$('#evaluationCountMeta'); if(countMeta) countMeta.textContent=`${records.length} finalized`;
    const latestScore=$('#evaluationLatestScore'); if(latestScore) latestScore.textContent=latest?((evaluationNumber(latest.rating||latest.overallScore)||0).toFixed(2).replace(/^0\.00$/,'—')):'—';
    const latestMeta=$('#evaluationLatestMeta'); if(latestMeta) latestMeta.textContent=latest?[formatLongDate(evaluationDateValue(latest)),evaluationStatusLabel(latest)].filter(Boolean).join(' · '):'No evaluation on file';

    const rank=evaluationOrganizationRank(records); const rankEl=$('#evaluationSeasonRank'); const rankMeta=$('#evaluationRankMeta');
    if(rankEl) rankEl.textContent=rank?`#${rank.rank}`:'—'; if(rankMeta) rankMeta.textContent=rank?`of ${rank.total} evaluated officials`:'Rank unavailable';

    const seasonFilter=$('#evaluationSeasonFilter');
    const improvementEl=$('#evaluationImprovement'); const improvementMeta=$('#evaluationImprovementMeta');
    if(improvementEl){improvementEl.classList.remove('is-positive','is-negative'); improvementEl.textContent='—'}
    if(improvementMeta) improvementMeta.textContent='Previous season unavailable';
    if(seasonFilter && seasonFilter.value!=='all' && average){
      const [start]=seasonFilter.value.split('-').map(Number); const previous=`${start-1}-${start}`;
      const previousScores=(state.evaluations||[]).filter(r=>evaluationSeasonLabel(r)===previous && String(r.status||r.workflowStatus||'finalized').toLowerCase()==='finalized').map(r=>evaluationNumber(r.rating||r.overallScore)).filter(Boolean);
      if(previousScores.length){const prev=previousScores.reduce((a,b)=>a+b,0)/previousScores.length; const delta=average-prev; if(improvementEl){improvementEl.textContent=`${delta>=0?'+':''}${delta.toFixed(2)}`; improvementEl.classList.add(delta>=0?'is-positive':'is-negative')} if(improvementMeta) improvementMeta.textContent='vs previous season';}
    }

    const categories=evaluationCategoryAverages(records); renderEvaluationRadar(categories);
    const categoryList=$('#evaluationCategoryList');
    if(categoryList) categoryList.innerHTML=categories.some(c=>c.value)?categories.map(c=>`<div class="evaluation-category-row"><strong>${esc(c.label)}</strong><span>${c.value?c.value.toFixed(2):'—'}</span>${evaluationStars(c.value,'evaluation-category-stars')}</div>`).join(''):'<div class="evaluation-category-empty">Category scores will appear when finalized evaluations include scored criteria.</div>';

    const target=$('#evaluationsList');
    if(target) target.innerHTML=records.length?records.slice(0,5).map(record=>{const score=evaluationNumber(record.rating||record.overallScore);return `<button class="evaluation-review-row" data-evaluation-id="${esc(record.id)}" type="button"><span class="evaluation-game-main"><span class="evaluation-game-icon">◉</span><span class="evaluation-game-copy"><strong>${esc(evaluationGameLabel(record))}</strong><small>${esc(evaluationLevelLabel(record))}${evaluationDateValue(record)?` · ${esc(formatLongDate(evaluationDateValue(record)))}`:''}</small></span></span><span class="evaluation-review-score">${score?score.toFixed(2):'—'}</span>${evaluationStars(score,'evaluation-row-stars')}<span class="evaluation-finalized-pill">${esc(evaluationStatusLabel(record))}</span><svg class="evaluation-row-chevron"><use href="#i-chevron-right"></use></svg></button>`}).join(''):'<div class="evaluation-empty-state"><svg><use href="#i-star"></use></svg><h3>No finalized evaluations</h3><p>Evaluations finalized and released to your profile by an authorized evaluator or administrator will appear here.</p></div>';

    renderEvaluationTrend(records);
    const commentTarget=$('#evaluationLatestComment');
    if(commentTarget){
      const commentRecord=records.find(record=>evaluationVisibleComment(record));
      if(commentRecord){const score=evaluationNumber(commentRecord.rating||commentRecord.overallScore); const evaluator=commentRecord.evaluator||commentRecord.evaluatorName||'Evaluator'; const initials=evaluator.split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join('').toUpperCase()||'EV'; commentTarget.innerHTML=`<div class="evaluation-comment-quote"><span class="evaluation-comment-mark">“</span><div class="evaluation-comment-body"><p>${esc(evaluationVisibleComment(commentRecord))}</p></div></div><div class="evaluation-comment-footer"><div class="evaluation-comment-evaluator"><span class="evaluation-comment-initials">${esc(initials)}</span><span><strong>${esc(evaluator)}</strong><small>Evaluator</small></span></div><div class="evaluation-comment-score"><time>${esc(evaluationDateValue(commentRecord)?formatLongDate(evaluationDateValue(commentRecord)):'')}</time><strong>${score?score.toFixed(2):'—'}</strong>${evaluationStars(score,'evaluation-row-stars')}</div></div>`}
      else commentTarget.innerHTML='<div class="evaluation-empty-state"><svg><use href="#i-chat"></use></svg><h3>No official-facing comments</h3><p>Evaluator comments marked as available to officials will appear here after finalization.</p></div>';
    }
  }

  function renderWhiteboard() {
    const target = $('#whiteboardList');
    if (!target) return;
    target.innerHTML = state.whiteboard.length ? state.whiteboard.map(item => `<article class="info-card"><span class="record-status">${esc(item.type || 'POST')}</span><h3>${esc(item.title)}</h3><p>${esc(item.summary || '')}</p><button class="outline-btn" data-whiteboard-id="${esc(item.id)}">Open</button></article>`).join('') : '<div class="empty-state"><svg><use href="#i-board"/></svg><h3>No published whiteboard items</h3><p>Admin bulletins and resources will appear here when published.</p></div>';
  }

  function renderVault() {
    const target = $('#vaultSummary');
    if (!target) return;
    const signed = state.documents.filter(d => /Signed|Completed|Paid/.test(d.status)).length;
    target.innerHTML = [
      ['Completed Documents', signed, 'documents'],['Uploaded Files', state.uploads.length, 'documents'],['Evaluations', state.evaluations.length, 'evaluations'],['Accepted Assignments', state.assignments.filter(a=>a.status==='accepted').length, 'assignments']
    ].map(([label,value,route]) => `<button class="summary-card" data-route="${route}"><span>${label}</span><strong>${value}</strong><small>Open →</small></button>`).join('');
  }

  function renderSafe() {
    const target = $('#safeStatus');
    if (!target) return;
    const p = state.profile;
    target.innerHTML = `<article class="compliance-card"><span>Account Status</span><strong><i class="status-dot"></i>${esc(p.accountStatus)}</strong><button class="outline-btn" data-action="edit-profile">Edit</button></article><article class="compliance-card"><span>Background Check</span><strong><i class="status-dot"></i>${esc(p.backgroundStatus)}</strong><small>${esc(p.backgroundDate)}</small><button class="outline-btn" data-action="edit-profile">Edit</button></article><article class="compliance-card"><span>SafeSport Status</span><strong><i class="status-dot"></i>${esc(p.safeSportStatus)}</strong><small>${esc(p.safeSportDate)}</small><button class="outline-btn" data-action="edit-profile">Edit</button></article>`;
  }

  function renderSettings() {
    const form = $('#settingsForm');
    if (!form) return;
    Object.entries(state.settings).forEach(([key,value]) => { if (form.elements[key]) form.elements[key].checked = !!value; });
  }


  function incidentStatusLabel(value) {
    const status = String(value || 'under-review').toLowerCase();
    return status === 'closed' ? 'Closed' : status === 'needs-info' ? 'Needs Information' : status === 'draft' ? 'Draft' : 'Under Review';
  }
  function incidentCategoryClass(value) {
    const v = String(value || '').toLowerCase();
    if (v.includes('fight')) return 'fight';
    if (v.includes('altercation')) return 'altercation';
    if (v.includes('player')) return 'player';
    if (v.includes('coach')) return 'coach';
    if (v.includes('spectator')) return 'spectator';
    if (v.includes('facility')) return 'facility';
    if (v.includes('injury')) return 'injury';
    if (v.includes('safety') || v.includes('security')) return 'safety';
    return 'other';
  }
  function incidentCategoryGroup(value) {
    const v = String(value || '').toLowerCase();
    if (v.includes('fight') || v.includes('altercation')) return 'fight';
    if (v.includes('player') || v.includes('coach')) return 'conduct';
    if (v.includes('spectator')) return 'spectator';
    if (v.includes('facility') || v.includes('safety') || v.includes('security') || v.includes('injury')) return 'facility';
    return 'other';
  }
  function incidentDateTime(record) {
    const date = record.incidentDate || record.gameDate || '';
    const time = record.incidentTime || record.gameTime || '';
    return { date, time };
  }
  function incidentGameTitle(record) {
    return record.event || [record.homeTeam,record.awayTeam].filter(Boolean).join(' vs. ') || record.gameTitle || 'Game details not provided';
  }
  function incidentFilteredRecords() {
    return (state.incidents || []).filter(record => {
      if (incidentFilter !== 'all' && incidentCategoryGroup(record.category) !== incidentFilter) return false;
      if (incidentStatusFilter && String(record.status || 'under-review').toLowerCase() !== incidentStatusFilter) return false;
      return true;
    }).sort((a,b) => String(b.submittedAt || b.incidentDate || '').localeCompare(String(a.submittedAt || a.incidentDate || '')));
  }
  function incidentResolutionAverage(records) {
    const values = records.filter(r => r.status === 'closed' && r.closedAt && r.submittedAt).map(r => {
      const diff = new Date(r.closedAt).getTime() - new Date(r.submittedAt).getTime();
      return diff >= 0 ? diff / 86400000 : NaN;
    }).filter(Number.isFinite);
    return values.length ? (values.reduce((a,b)=>a+b,0)/values.length).toFixed(1) : '—';
  }
  function incidentFileSize(bytes=0) {
    const n = Number(bytes)||0;
    if (n < 1024) return `${n} B`;
    if (n < 1048576) return `${(n/1024).toFixed(1)} KB`;
    return `${(n/1048576).toFixed(1)} MB`;
  }
  function renderIncidentDetail(record) {
    const panel = $('#incidentDetailPanel'); if (!panel) return;
    if (!record) { panel.innerHTML='<div class="incident-detail-placeholder"><svg><use href="#i-alert"></use></svg><h3>Select an incident report</h3><p>Report details and review status will appear here.</p></div>'; return; }
    const attachments = Array.isArray(record.attachments) ? record.attachments : [];
    const dt = incidentDateTime(record);
    panel.innerHTML = `<div class="incident-detail-head"><div><h2>Incident Details</h2><div class="incident-detail-number">${esc(record.incidentNumber || 'Incident')}</div></div><span class="incident-status-pill ${esc(record.status || 'under-review')}">${esc(incidentStatusLabel(record.status))}</span></div>
      <dl class="incident-detail-list">
        <div class="incident-detail-row"><dt>Category:</dt><dd><span class="incident-category-pill ${esc(incidentCategoryClass(record.category))}">${esc(record.category || 'Not provided')}</span></dd></div>
        <div class="incident-detail-row"><dt>Date / Time:</dt><dd>${esc(dt.date ? formatLongDate(dt.date) : 'Not provided')} ${dt.time ? `• ${esc(dt.time)}` : ''}</dd></div>
        <div class="incident-detail-row"><dt>Event:</dt><dd>${esc(incidentGameTitle(record))}</dd></div>
        <div class="incident-detail-row"><dt>Location:</dt><dd>${esc(record.location || 'Not provided')}</dd></div>
        <div class="incident-detail-row"><dt>Submitted By:</dt><dd>${esc(record.submittedByName || `${state.profile.firstName||''} ${state.profile.lastName||''}`.trim() || 'Official')}</dd></div>
        <div class="incident-detail-row"><dt>Status:</dt><dd>${esc(incidentStatusLabel(record.status))}</dd></div>
        <div class="incident-detail-row"><dt>Submitted:</dt><dd>${esc(record.submittedAt ? new Date(record.submittedAt).toLocaleString('en-US') : 'Not submitted')}</dd></div>
      </dl>
      <section class="incident-detail-section"><h3>Summary</h3><p>${esc(record.summary || 'No summary provided.')}</p></section>
      <section class="incident-detail-section"><h3>Details</h3><p>${esc(record.details || 'No detailed narrative provided.')}</p></section>
      ${record.actionsTaken ? `<section class="incident-detail-section"><h3>Actions Taken</h3><p>${esc(record.actionsTaken)}</p></section>` : ''}
      ${record.peopleInvolved ? `<section class="incident-detail-section"><h3>People Involved</h3><p>${esc(record.peopleInvolved)}</p></section>` : ''}
      ${record.adminPublicResponse ? `<section class="incident-detail-section"><h3>Administrator Response</h3><p>${esc(record.adminPublicResponse)}</p></section>` : ''}
      <section class="incident-detail-section"><h3>Attachments (${attachments.length})</h3><div class="incident-attachment-list">${attachments.length ? attachments.map((file,index)=>`<div class="incident-attachment"><svg><use href="#i-file"></use></svg><div><strong>${esc(file.name || `Attachment ${index+1}`)}</strong><small>${esc(file.type || 'File')} • ${esc(incidentFileSize(file.size))}</small></div>${file.dataUrl ? `<a href="${esc(file.dataUrl)}" download="${esc(file.name||'attachment')}">⇩</a>` : '<span></span>'}</div>`).join('') : '<p>No attachments submitted.</p>'}</div></section>
      <div class="incident-detail-actions"><button class="incident-outline-btn" type="button" data-incident-open="${esc(record.id)}">View / Update Report</button></div>`;
  }
  function renderIncidents() {
    const totalRecords = state.incidents || [];
    const totalEl=$('#incidentMetricTotal'), reviewEl=$('#incidentMetricReview'), closedEl=$('#incidentMetricClosed'), avgEl=$('#incidentMetricResolution');
    if (!totalEl) return;
    totalEl.textContent=totalRecords.filter(r=>r.status!=='draft').length;
    reviewEl.textContent=totalRecords.filter(r=>r.status==='under-review' || r.status==='needs-info').length;
    closedEl.textContent=totalRecords.filter(r=>r.status==='closed').length;
    avgEl.textContent=incidentResolutionAverage(totalRecords);
    const badge=$('#incidentNotificationBadge'); if(badge){const count=(state.notifications||[]).filter(n=>!n.read).length;badge.textContent=count;badge.hidden=count===0;}
    $$('#incidentTabs [data-incident-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.incidentFilter===incidentFilter));
    const statusSelect=$('#incidentStatusFilter'); if(statusSelect) statusSelect.value=incidentStatusFilter;
    const records=incidentFilteredRecords(); const pages=Math.max(1,Math.ceil(records.length/incidentPageSize)); if(incidentPage>pages)incidentPage=pages; const start=(incidentPage-1)*incidentPageSize; const pageItems=records.slice(start,start+incidentPageSize);
    const body=$('#incidentReportTableBody'), empty=$('#incidentReportEmpty'); if(body) body.innerHTML=pageItems.map(record=>{const dt=incidentDateTime(record); return `<tr class="${incidentSelectedId===record.id?'is-selected':''}" data-incident-select="${esc(record.id)}"><td><strong>${esc(record.incidentNumber || 'Draft')}</strong></td><td>${esc(dt.date || '—')}${dt.time?`<br><small>${esc(dt.time)}</small>`:''}</td><td><span class="incident-category-pill ${esc(incidentCategoryClass(record.category))}">${esc(record.category || 'Not provided')}</span></td><td>${esc(incidentGameTitle(record))}</td><td><span class="incident-status-pill ${esc(record.status || 'under-review')}">${esc(incidentStatusLabel(record.status))}</span></td><td><button class="incident-eye-btn" data-incident-select="${esc(record.id)}" type="button" aria-label="View ${esc(record.incidentNumber || 'incident')}"><svg><use href="#i-eye"></use></svg></button></td></tr>`}).join('');
    if(empty) empty.hidden=pageItems.length>0;
    const showing=$('#incidentShowingText'); if(showing) showing.textContent=records.length ? `Showing ${start+1} to ${Math.min(start+incidentPageSize,records.length)} of ${records.length} reports` : 'Showing 0 reports';
    const pageIndicator=$('#incidentPageIndicator'); if(pageIndicator)pageIndicator.textContent=incidentPage; const prev=$('#incidentPrevPage'),next=$('#incidentNextPage');if(prev)prev.disabled=incidentPage<=1;if(next)next.disabled=incidentPage>=pages||!records.length;
    const selected=totalRecords.find(r=>r.id===incidentSelectedId) || pageItems[0] || null; if(selected && !incidentSelectedId) incidentSelectedId=selected.id; renderIncidentDetail(selected);
  }
  function completedIncidentGames() {
    return myGameAssignments().filter(a => {
      const status=gameAssignmentStatus(a); return status==='completed' || status==='past' || isGamePast(a);
    }).sort((a,b)=>gameDateTimestamp(b)-gameDateTimestamp(a));
  }
  function incidentCrewText(a) {
    const crew=Array.isArray(a?.crew)?a.crew:(Array.isArray(a?.officials)?a.officials:[]);
    return crew.map(member=>[member.position||member.role,member.name].filter(Boolean).join(': ')).filter(Boolean).join('\n');
  }
  function populateIncidentGameFields(form, assignmentId) {
    const a=state.assignments.find(item=>String(item.id)===String(assignmentId)); if(!a||!form)return;
    const teams=parseMatchupTeams(a); const set=(name,value)=>{const input=form.elements[name];if(input)input.value=value||''};
    set('assignmentId',a.id); set('gameDate',gameAssignmentDate(a)); set('gameTime',gameAssignmentTime(a)); set('event',[teams.home,teams.away].filter(Boolean).join(' vs. ')||assignmentTitle(a)); set('location',[gameAssignmentLocation(a),gameAssignmentAddress(a)].filter(Boolean).join(' — ')); set('gameCrew',incidentCrewText(a)); set('homeTeam',teams.home); set('awayTeam',teams.away); set('competitionLevel',a.level||a.classTeam||a.competitionLevel||'');
  }
  function incidentFormMarkup(record={},seedAssignmentId='') {
    const games=completedIncidentGames(); const selectedId=record.assignmentId || seedAssignmentId || '';
    const gameOptions=games.map(a=>{const teams=parseMatchupTeams(a); const label=`${gameAssignmentDate(a)||'Date not provided'} — ${[teams.home,teams.away].filter(Boolean).join(' vs. ')||assignmentTitle(a)||'Game'} — ${gameAssignmentLocation(a)||'Location not provided'}`;return `<option value="${esc(a.id)}" ${String(selectedId)===String(a.id)?'selected':''}>${esc(label)}</option>`}).join('');
    return `<form class="incident-form" id="incidentReportForm" data-report-id="${esc(record.id||'')}"><div class="incident-form-notice">Incident reports are available for completed or past games. Submit a factual account of what occurred. Completed reports are sent to the Super Admin Reports section for review.</div>
      <section class="incident-form-section"><h3>1. Game Information</h3><div class="incident-form-grid"><label class="span-2">Completed Game<select name="assignmentId" id="incidentGameSelect" required><option value="">Select a completed game</option>${gameOptions}</select></label><label>Game Date<input name="gameDate" type="date" readonly value="${esc(record.gameDate||'')}"></label><label>Game Time<input name="gameTime" readonly value="${esc(record.gameTime||'')}"></label><label class="span-2">Game / Event<input name="event" readonly value="${esc(record.event||'')}"></label><label class="span-2">Location<input name="location" readonly value="${esc(record.location||'')}"></label><label>Competition / Level<input name="competitionLevel" readonly value="${esc(record.competitionLevel||'')}"></label><label class="span-2">Game Crew<textarea name="gameCrew" rows="3" readonly>${esc(record.gameCrew||'')}</textarea></label><input type="hidden" name="homeTeam" value="${esc(record.homeTeam||'')}"><input type="hidden" name="awayTeam" value="${esc(record.awayTeam||'')}"></div></section>
      <section class="incident-form-section"><h3>2. Incident Classification</h3><div class="incident-form-grid"><label>Incident Category<select name="category" required><option value="">Select category</option>${['Altercation / Fight','Player Ejection','Player Conduct','Coach Conduct','Spectator Issue','Facility / Security','Injury / Safety','Game Administration','Other'].map(v=>`<option ${record.category===v?'selected':''}>${esc(v)}</option>`).join('')}</select></label><label>Incident Time / Game Clock<input name="incidentTime" value="${esc(record.incidentTime||'')}" placeholder="Example: 5:34 remaining, 3rd quarter"></label><label>Quarter / Period<input name="period" value="${esc(record.period||'')}" placeholder="Quarter, half, period, inning..."></label><label>Location Within Venue<input name="incidentLocation" value="${esc(record.incidentLocation||'')}" placeholder="Court, bench area, hallway, stands..."></label></div></section>
      <section class="incident-form-section"><h3>3. What Happened</h3><div class="incident-form-grid"><label class="span-2">Short Summary<textarea name="summary" rows="3" required placeholder="Brief factual summary">${esc(record.summary||'')}</textarea></label><label class="span-2">Detailed Description<textarea name="details" rows="8" required placeholder="Describe the incident in chronological order, including what was observed and heard.">${esc(record.details||'')}</textarea></label><label class="span-2">People Involved<textarea name="peopleInvolved" rows="4" required placeholder="Names, jersey numbers, team/organization, roles">${esc(record.peopleInvolved||'')}</textarea></label><label class="span-2">Witnesses<textarea name="witnesses" rows="3" placeholder="Crew members, table personnel, security, staff, others">${esc(record.witnesses||'')}</textarea></label></div></section>
      <section class="incident-form-section"><h3>4. Actions and Outcomes</h3><div class="incident-form-grid"><label class="span-2">Actions Taken<textarea name="actionsTaken" rows="5" required placeholder="Warnings, technicals, ejections, game suspension, security involvement, medical response, etc.">${esc(record.actionsTaken||'')}</textarea></label><label>Reported To<input name="reportedTo" value="${esc(record.reportedTo||'')}" placeholder="Assignor, AD, site director, security..."></label><label>Related Rule / Policy<input name="relatedRule" value="${esc(record.relatedRule||'')}" placeholder="Optional rule or policy reference"></label></div><div class="incident-check-grid"><label><input type="checkbox" name="ejectionOccurred" ${record.ejectionOccurred?'checked':''}>Ejection occurred</label><label><input type="checkbox" name="fightAltercation" ${record.fightAltercation?'checked':''}>Fight / altercation occurred</label><label><input type="checkbox" name="injuryOccurred" ${record.injuryOccurred?'checked':''}>Injury / medical attention</label><label><input type="checkbox" name="securityInvolved" ${record.securityInvolved?'checked':''}>Security / law enforcement involved</label><label><input type="checkbox" name="gameStopped" ${record.gameStopped?'checked':''}>Game stopped / suspended</label><label><input type="checkbox" name="followUpNeeded" ${record.followUpNeeded?'checked':''}>Follow-up requested</label></div></section>
      <section class="incident-form-section"><h3>5. Attachments and Certification</h3><div class="incident-form-grid"><label class="span-2">Attachments<input name="attachments" id="incidentAttachments" type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt"><small>Attach supporting documents or photos when appropriate. Files up to 1.5 MB each are retained in this offline prototype; larger files retain metadata for backend upload integration.</small></label><label class="span-2">Typed Signature<input name="signature" required value="${esc(record.signature||(`${state.profile.firstName||''} ${state.profile.lastName||''}`.trim()))}"></label><label class="span-2" style="flex-direction:row;align-items:flex-start"><input type="checkbox" name="certification" required ${record.certification?'checked':''} style="width:auto;min-height:auto;margin-top:4px">I certify that this report is accurate to the best of my knowledge and reflects my direct observations and actions.</label></div></section>
      <div class="incident-form-actions"><button type="button" class="save-draft" data-action="save-incident-draft">Save Draft</button><button type="submit" class="submit-report">Complete & Submit Report</button></div></form>`;
  }
  function openIncidentForm(assignmentId='',reportId='') {
    const record=(state.incidents||[]).find(r=>r.id===reportId)||{};
    const games=completedIncidentGames(); if(!games.length && !record.assignmentId){showToast('Incident reports can be filed after a completed or past game is available on your profile.');return;}
    openModal(record.id ? `Incident Report — ${record.incidentNumber || 'Draft'}` : 'File New Incident Report',incidentFormMarkup(record,assignmentId),{eyebrow:'INCIDENT CENTER',context:'incident-report'});
    const form=$('#incidentReportForm'); if(form){const selected=form.elements.assignmentId.value;if(selected)populateIncidentGameFields(form,selected);}
  }
  function nextIncidentNumber() {
    const year=new Date().getFullYear(); let max=0;
    const collect=(items=[])=>items.forEach(item=>{const m=String(item.incidentNumber||'').match(/^INC-(\d{4})-(\d+)$/);if(m&&Number(m[1])===year)max=Math.max(max,Number(m[2]));});
    collect(state.incidents||[]); try{const admin=JSON.parse(localStorage.getItem(ADMIN_DASHBOARD_KEY)||'null')||{};collect(admin.options?.incidentReports||[]);}catch{}
    return `INC-${year}-${String(max+1).padStart(4,'0')}`;
  }
  async function incidentAttachmentsFromForm(form,existing=[]) {
    const files=[...(form.elements.attachments?.files||[])]; if(!files.length)return existing||[];
    return Promise.all(files.map(file=>new Promise(resolve=>{const base={id:uid('incident-file'),name:file.name,type:file.type||'File',size:file.size,dataUrl:''};if(file.size<=1500000){const reader=new FileReader();reader.onload=()=>resolve({...base,dataUrl:reader.result});reader.onerror=()=>resolve(base);reader.readAsDataURL(file);}else resolve(base);}))).then(newFiles=>[...(existing||[]),...newFiles]);
  }
  function pushIncidentToAdmin(record) {
    let admin={}; try{admin=JSON.parse(localStorage.getItem(ADMIN_DASHBOARD_KEY)||'null')||{};}catch{}
    admin.options=admin.options||{}; const reports=Array.isArray(admin.options.incidentReports)?admin.options.incidentReports:[]; const idx=reports.findIndex(r=>r.id===record.id); if(idx>=0)reports[idx]={...reports[idx],...record};else reports.unshift({...record});admin.options.incidentReports=reports;
    admin.notifications=Array.isArray(admin.notifications)?admin.notifications:[];
    if(record.status==='under-review'&&!admin.notifications.some(n=>n.incidentId===record.id&&n.type==='incident-submitted'))admin.notifications.unshift({id:uid('admin-notification'),type:'incident-submitted',incidentId:record.id,title:'New incident report submitted',message:`${record.incidentNumber} — ${incidentGameTitle(record)}`,createdAt:new Date().toISOString(),read:false});
    localStorage.setItem(ADMIN_DASHBOARD_KEY,JSON.stringify(admin));
  }
  async function saveIncidentReport(form,complete) {
    if(complete&&!form.reportValidity())return; const data=serializeForm(form); const existing=(state.incidents||[]).find(r=>r.id===form.dataset.reportId); const assignment=state.assignments.find(a=>String(a.id)===String(data.assignmentId));
    if(complete&&!assignment){showToast('Select a completed game before submitting the incident report.');return;}
    const attachments=await incidentAttachmentsFromForm(form,existing?.attachments||[]); const now=new Date().toISOString(); const record={...(existing||{}),...data,id:existing?.id||uid('incident'),incidentNumber:existing?.incidentNumber||(complete?nextIncidentNumber():''),status:complete?'under-review':'draft',attachments,submittedAt:complete?(existing?.submittedAt||now):(existing?.submittedAt||''),updatedAt:now,submittedByOfficialId:state.profile.officialId||'',submittedByEmail:state.profile.email||'',submittedByName:`${state.profile.firstName||''} ${state.profile.lastName||''}`.trim()||'Official',source:'officialPortal'};
    record.certification=!!form.elements.certification?.checked; ['ejectionOccurred','fightAltercation','injuryOccurred','securityInvolved','gameStopped','followUpNeeded'].forEach(k=>record[k]=!!form.elements[k]?.checked);
    const idx=(state.incidents||[]).findIndex(r=>r.id===record.id);if(idx>=0)state.incidents[idx]=record;else state.incidents.unshift(record); if(complete)pushIncidentToAdmin(record);persist(complete?'incidentReportSubmitted':'incidentReportDraftSaved',{incident:record}); closeModal();incidentSelectedId=record.id;renderAll();showView('incidents',false);showToast(complete?`${record.incidentNumber} submitted for Super Admin review.`:'Incident report draft saved.');
  }


  function paymentReceiptText(payment) {
    return `GOT U NEX REF PAYMENT RECEIPT\n\nReceipt: ${payment.receiptId||''}\nTransaction: ${payment.transactionId||''}\nOfficial: ${payment.officialName||`${state.profile.firstName||''} ${state.profile.lastName||''}`.trim()}\nGame: ${payment.game||''}\nGame Date: ${payment.gameDate||''}\nOrganization: ${payment.organization||''}\nPayment Method: ${payment.method||''}\nStatus: ${payment.status||''}\nAmount: ${moneyValue(payment.amount)}\nPayout Date: ${payment.payoutDate||''}\n`;
  }
  function downloadOfficialPaymentReceipt(id) {
    const payment=currentOfficialPayments().find(p=>String(p.id)===String(id)); if(!payment)return;
    downloadBlob(`${sanitizeFilename(payment.receiptId||'payment-receipt')}.txt`,new Blob([paymentReceiptText(payment)],{type:'text/plain'}));
    showToast('Payment receipt downloaded.');
  }
  function exportOfficialPayments() {
    const rows=[['Payout Date','Game','Payment Method','Status','Amount','Transaction ID','Organization','Receipt ID'],...currentOfficialPayments().map(p=>[p.payoutDate||'',p.game||'',p.method||'',p.status||'',p.amount||0,p.transactionId||'',p.organization||'',p.receiptId||''])];
    const csv=rows.map(row=>row.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
    downloadBlob('Got_U_Nex_Ref_Payment_History.csv',new Blob([csv],{type:'text/csv'})); showToast('Payment history exported.');
  }
  function renderOfficialPayments() {
    const holder=$('#officialPayoutHistoryBody'); if(!holder)return;
    const store=loadPayrollStore(); const payments=currentOfficialPayments(); const reimbursements=currentOfficialReimbursements(); const year=String(new Date().getFullYear());
    const paid=payments.filter(p=>String(p.status||'').toLowerCase()==='paid');
    const pending=payments.filter(p=>['scheduled','processing','pending','pending banking setup'].includes(String(p.status||'').toLowerCase()));
    const ytd=payments.filter(p=>String(p.payoutDate||p.paidAt||p.createdAt||'').startsWith(year));
    const ytdPaid=ytd.reduce((sum,p)=>sum+Number(p.amount||0),0); const ytdReimburse=reimbursements.filter(r=>String(r.date||r.paidAt||r.createdAt||'').startsWith(year)).reduce((sum,r)=>sum+Number(r.amount||0),0);
    $('#officialWalletBalance').textContent=moneyValue(paid.reduce((sum,p)=>sum+Number(p.amount||0),0));
    $('#officialPendingPayouts').textContent=moneyValue(pending.reduce((sum,p)=>sum+Number(p.amount||0),0));
    $('#officialPendingPayoutCount').textContent=`${pending.length} payout${pending.length===1?'':'s'} scheduled`;
    $('#officialYtdEarnings').textContent=moneyValue(ytdPaid); $('#officialYtdAssignmentCount').textContent=`Across ${new Set(ytd.map(p=>p.assignmentId).filter(Boolean)).size} assignment${new Set(ytd.map(p=>p.assignmentId).filter(Boolean)).size===1?'':'s'}`;
    $('#officialYtdReimbursements').textContent=moneyValue(ytdReimburse);
    const recent=$('#officialRecentPayments'); recent.innerHTML=payments.length?payments.slice(0,5).map(p=>`<div class="payment-list-row"><div><strong>${esc(p.game||'Payment')}</strong><span>${esc(p.method||'Payment')} · ${esc(formatDisplayDate((p.payoutDate||p.paidAt||'').slice(0,10)))}</span></div><b>${moneyValue(p.amount)}</b></div>`).join(''):'<div class="payment-empty"><svg><use href="#i-card"></use></svg><h3>No recent payments</h3><p>Completed-game payments will appear here after payroll submits them.</p></div>';
    const categories=new Map(); reimbursements.forEach(r=>{const key=r.category||r.type||'Other';categories.set(key,(categories.get(key)||0)+Number(r.amount||0));}); const reimb=$('#officialReimbursementSummary'); reimb.innerHTML=categories.size?[...categories.entries()].map(([name,amount])=>`<div class="payment-list-row"><div><strong>${esc(name)}</strong><span>Recorded reimbursement</span></div><b>${moneyValue(amount)}</b></div>`).join(''):'<div class="payment-empty"><svg><use href="#i-file"></use></svg><h3>No reimbursements</h3><p>Approved mileage, lodging, meals, tolls, or other reimbursements will appear here.</p></div>';
    const receipts=$('#officialPaymentReceipts'); const receiptPayments=payments.filter(p=>p.receiptId); receipts.innerHTML=receiptPayments.length?receiptPayments.slice(0,5).map(p=>`<div class="payment-list-row"><div><strong>${esc(p.receiptId)}</strong><span>${esc(p.game||'Payment')} · ${esc(formatDisplayDate((p.payoutDate||'').slice(0,10)))}</span></div><button type="button" data-official-payment-receipt="${esc(p.id)}" aria-label="Download receipt"><svg><use href="#i-download"></use></svg></button></div>`).join(''):'<div class="payment-empty"><svg><use href="#i-download"></use></svg><h3>No receipts yet</h3><p>Downloadable payment receipts appear after a payout is recorded.</p></div>';
    holder.innerHTML=payments.map(p=>`<tr><td>${esc(formatDisplayDate((p.payoutDate||p.paidAt||p.createdAt||'').slice(0,10))||'—')}</td><td>${esc(p.game||'Completed Game')}</td><td>${esc(p.method||'—')}${p.accountLast4?` (•••• ${esc(p.accountLast4)})`:''}</td><td><span class="payout-status ${String(p.status||'').toLowerCase()==='paid'?'':'pending'}">${esc(p.status||'Recorded')}</span></td><td class="payout-amount">${moneyValue(p.amount)}</td><td>${esc(p.transactionId||'—')}</td><td>${esc(p.organization||'—')}</td><td>${p.receiptId?`<button class="payment-download" type="button" data-official-payment-receipt="${esc(p.id)}"><svg><use href="#i-download"></use></svg></button>`:'—'}</td></tr>`).join('');
    $('#officialPayoutHistoryEmpty').hidden=payments.length>0; $('#officialPayoutHistorySummary').textContent=payments.length?`Showing 1 to ${payments.length} of ${payments.length} payouts`:'Showing 0 payouts';
    const bank=currentOfficialBankProfile(); const methodStatus=$('#paymentMethodStatus'); const summary=$('#paymentMethodSummary');
    if(bank){const status=String(bank.status||'submitted');methodStatus.textContent=prettyLabel(status);methodStatus.classList.toggle('verified',status.toLowerCase()==='verified');summary.textContent=`${bank.bankName||'Bank account'} · ${bank.accountType||'Account'} ending in ${bank.accountLast4||'—'}. Full routing and account numbers are not stored in this browser.`;}else{methodStatus.textContent='Not Submitted';methodStatus.classList.remove('verified');summary.textContent='No direct-deposit method has been submitted.';}
    const badge=$('#paymentNotificationBadge'); if(badge){const count=(state.notifications||[]).filter(n=>!n.read).length;badge.textContent=count>99?'99+':count;badge.hidden=count===0;}
  }
  function openDirectDepositForm() {
    const bank=currentOfficialBankProfile();
    openModal('Direct Deposit & Banking',`<div class="direct-deposit-modal"><div class="bank-security-note">For this HTML/CSS/JS prototype, full routing and account numbers are used only to validate this form and are not persisted in browser storage. Only the final four digits and payment-method status are saved.</div><form id="directDepositForm" class="portal-form"><div class="form-grid">
      ${field('Account Holder Name','accountHolder',bank?.accountHolder||`${state.profile.firstName||''} ${state.profile.lastName||''}`.trim(),'text',true)}
      ${field('Bank / Financial Institution','bankName',bank?.bankName||'','text',true)}
      ${field('Account Type','accountType',bank?.accountType||'Checking','select',true,['Checking','Savings'])}
      <label>Routing Number<input name="routingNumber" inputmode="numeric" autocomplete="off" minlength="9" maxlength="9" required placeholder="9 digits"></label>
      <label>Confirm Routing Number<input name="confirmRoutingNumber" inputmode="numeric" autocomplete="off" minlength="9" maxlength="9" required placeholder="Re-enter routing number"></label>
      <label>Account Number<input name="accountNumber" inputmode="numeric" autocomplete="off" minlength="4" maxlength="20" required placeholder="Account number"></label>
      <label>Confirm Account Number<input name="confirmAccountNumber" inputmode="numeric" autocomplete="off" minlength="4" maxlength="20" required placeholder="Re-enter account number"></label>
      <label class="checkbox-field span-2"><input name="authorize" type="checkbox" required><span>I authorize organizations using Got U Nex Ref to deposit approved officiating payments to this account and certify that the banking information entered is accurate.</span></label>
      </div><div class="form-actions"><button type="button" class="outline-btn" data-action="close-modal">Cancel</button><button type="submit" class="primary-btn">Submit Direct Deposit Form</button></div></form></div>`,{eyebrow:'PAYMENTS'});
  }
  function saveDirectDepositForm(form) {
    const data=serializeForm(form); const routing=String(data.routingNumber||'').replace(/\D/g,''); const routing2=String(data.confirmRoutingNumber||'').replace(/\D/g,''); const account=String(data.accountNumber||'').replace(/\D/g,''); const account2=String(data.confirmAccountNumber||'').replace(/\D/g,'');
    if(routing.length!==9){showToast('Enter a valid 9-digit routing number.');return;} if(routing!==routing2){showToast('Routing numbers do not match.');return;} if(account.length<4||account!==account2){showToast('Account numbers do not match.');return;}
    const store=loadPayrollStore(); const identity=currentOfficialIdentity(); if(!identity.id&&!identity.email){showToast('Complete your Official ID or email in My Profile before submitting direct deposit information.');return;} const now=new Date().toISOString(); let bank=store.bankProfiles.find(payrollMatchesCurrentOfficial); const bankId=bank?.id||uid('bank-profile');
    bank={...(bank||{}),id:bankId,officialId:identity.id,officialEmail:identity.email,officialName:`${state.profile.firstName||''} ${state.profile.lastName||''}`.trim(),accountHolder:data.accountHolder,bankName:data.bankName,accountType:data.accountType,routingLast4:routing.slice(-4),accountLast4:account.slice(-4),status:'submitted',updatedAt:now,submittedAt:bank?.submittedAt||now};
    store.bankProfiles=store.bankProfiles.filter(x=>x.id!==bankId);store.bankProfiles.push(bank);
    const auth={id:uid('direct-deposit-form'),officialId:identity.id,officialEmail:identity.email,officialName:bank.officialName,accountHolder:data.accountHolder,bankName:data.bankName,accountType:data.accountType,routingLast4:routing.slice(-4),accountLast4:account.slice(-4),status:'Submitted',submittedAt:now,updatedAt:now};store.directDepositForms.unshift(auth);savePayrollStore(store);
    state.documents=Array.isArray(state.documents)?state.documents:[];state.documents.unshift({id:`direct-deposit:${auth.id}`,name:'Direct Deposit Authorization',type:'Direct Deposit Form',category:'signed-documents',status:'Submitted',date:now,description:'Direct deposit authorization submitted through Got U Nex Ref.',tags:['Direct Deposit',data.bankName,data.accountType].filter(Boolean),data:{bankName:data.bankName,accountType:data.accountType,routingEnding:`•••• ${routing.slice(-4)}`,accountEnding:`•••• ${account.slice(-4)}`}});persist('directDepositSubmitted',{officialId:identity.id,formId:auth.id});
    closeModal();renderOfficialPayments();renderDocuments();showToast('Direct deposit form submitted.');
  }
  function renderAll() {
    renderPermissionGates();
    renderProfile();
    renderProfileAssignments();
    renderProfileDocuments();
    renderProfileAvailability();
    renderAccountOverview();
    renderDashboard();
    renderAssignments();
    if ($('#myGamesPanel') && assignmentFilter !== 'mine') renderMyGames();
    renderAvailabilityEditor();
    renderCalendar();
    renderMessages();
    renderNotifications();
    renderCommunicationSummaries();
    renderSchools();
    renderDocuments();
    renderIdCard();
    renderOfficialPayments();
    renderEvaluations();
    renderIncidents();
    renderWhiteboard();
    renderVault();
    renderSafe();
    renderSettings();
  }

  function openModal(title, html, options = {}) {
    modalTitle.textContent = title;
    modalEyebrow.textContent = options.eyebrow || 'GOT U NEX REF';
    modalBody.innerHTML = html;
    modalContext = options.context || null;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    setTimeout(() => $('input,select,textarea,button', modalBody)?.focus(), 30);
  }
  function closeModal() {
    modal.hidden = true;
    modalBody.innerHTML = '';
    modalContext = null;
    photoPreviewDataUrl = '';
    document.body.classList.remove('modal-open');
  }

  function field(label, name, value, type='text', required=false, options=[]) {
    if (type === 'select') return `<label>${esc(label)}<select name="${esc(name)}" ${required?'required':''}>${options.map(o => `<option ${String(o)===String(value)?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`;
    if (type === 'textarea') return `<label class="span-2">${esc(label)}<textarea name="${esc(name)}" rows="5" ${required?'required':''}>${esc(value||'')}</textarea></label>`;
    if (type === 'checkbox') return `<label class="checkbox-field span-2"><input type="checkbox" name="${esc(name)}" ${value?'checked':''} ${required?'required':''}/><span>${esc(label)}</span></label>`;
    return `<label>${esc(label)}<input type="${esc(type)}" name="${esc(name)}" value="${esc(value||'')}" ${required?'required':''}/></label>`;
  }

  function openProfileEditor() {
    const p = state.profile;
    openModal('Edit Profile', `<form id="profileEditForm" class="portal-form">
      <div class="modal-section"><h3>Identity & Photo</h3><div class="form-grid">${field('First Name','firstName',p.firstName,'text',true)}${field('Last Name','lastName',p.lastName,'text',true)}${field('Official ID','officialId',p.officialId,'text',true)}${field('ID Card Expiration','idExpiry',dateInputFromUS(p.idExpiry),'date',false)}<label class="span-2">Profile Photo<input type="file" id="profilePhotoInput" accept="image/*" /></label></div></div>
      <div class="modal-section"><h3>Contact & Street Address</h3><div class="form-grid">${field('Email','email',p.email,'email',true)}${field('Phone','phone',p.phone,'tel',true)}${field('Street Address','streetAddress',p.streetAddress,'text',false)}${field('Address Line 2','address2',p.address2,'text',false)}${field('City','city',p.city,'text',true)}${field('State','state',p.state,'text',true)}${field('ZIP / Postal Code','postalCode',p.postalCode,'text',false)}${field('Country','country',p.country,'text',true)}${field('Time Zone','timezone',p.timezone,'text',true)}</div></div>
      <div class="modal-section"><h3>Officiating Profile</h3><div class="form-grid">${field('Primary Sport','primarySport',p.primarySport,'text',true)}${field('Years of Experience','yearsExperience',p.yearsExperience,'text',true)}${field('Preferred Level','preferredLevel',p.preferredLevel,'text',true)}${field('Uniform Size','uniformSize',p.uniformSize,'text',true)}${field('NFHS Number','nfhsNumber',p.nfhsNumber,'text',false)}</div></div>
      <div class="modal-section"><h3>Account & Compliance</h3><div class="form-grid">${field('Account Status','accountStatus',p.accountStatus,'select',true,['Active','Inactive','Pending'])}${field('Background Check Status','backgroundStatus',p.backgroundStatus,'select',true,['Cleared','Pending','Expired','Not Submitted'])}${field('Background Check Date','backgroundDate',dateInputFromUS(p.backgroundDate),'date',false)}${field('SafeSport Status','safeSportStatus',p.safeSportStatus,'select',true,['Complete','Pending','Expired','Not Required'])}${field('SafeSport Date','safeSportDate',dateInputFromUS(p.safeSportDate),'date',false)}</div></div>
      <div class="form-actions sticky-actions"><button type="button" class="outline-btn" data-action="close-modal">Cancel</button><button type="submit" class="primary-btn"><svg><use href="#i-save"/></svg>Save Profile</button></div>
    </form>`, { eyebrow:'PROFILE MANAGEMENT', context:'profile-edit' });
  }

  function dateInputFromUS(value) {
    const m = String(value||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return m ? `${m[3]}-${m[1]}-${m[2]}` : '';
  }
  function usFromDateInput(value) {
    if (!value) return '';
    const [y,m,d] = value.split('-');
    return `${m}/${d}/${y}`;
  }

  function openAssignmentDetails(id) {
    const a = state.assignments.find(item => item.id === id);
    if (!a) return;
    const teams = parseMatchupTeams(a);
    const title = [teams.home,teams.away].filter(Boolean).join(' vs. ') || assignmentTitle(a) || 'Assignment';
    const date = gameAssignmentDate(a);
    const status = gameAssignmentStatus(a) || 'pending';
    const location = gameAssignmentLocation(a);
    const address = gameAssignmentAddress(a);
    const position = a.position || a.crewPosition || '';
    openModal('Assignment Details', `<div class="detail-sheet">
      <span class="record-status ${esc(status)}">${esc(status.toUpperCase())}</span>
      <h3>${esc(title)}</h3>
      <dl>
        <div><dt>Date</dt><dd>${date ? esc(formatLongDate(date)) : 'Not provided'}</dd></div>
        <div><dt>Time</dt><dd>${esc(gameAssignmentTime(a) || 'Not provided')}</dd></div>
        <div><dt>Level</dt><dd>${esc(a.level || a.classTeam || a.competitionLevel || 'Not provided')}</dd></div>
        <div><dt>Location</dt><dd>${esc(location || 'Not provided')}${address ? `<br><small>${esc(address)}</small>` : ''}</dd></div>
        <div><dt>Position</dt><dd>${esc(position || 'Not assigned')}</dd></div>
      </dl>
      ${a.adminNote ? `<div class="notice-box"><strong>Admin Note</strong><p>${esc(a.adminNote)}</p></div>` : ''}
      <div class="form-actions">
        <button class="outline-btn" data-action="close-modal">Close</button>
        ${status === 'pending' ? `<button class="primary-btn" data-assignment-response="accept" data-assignment-id="${esc(a.id)}">Accept Assignment</button><button class="danger-btn" data-assignment-response="decline" data-assignment-id="${esc(a.id)}">Decline</button>` : ''}
      </div>
    </div>`, { eyebrow:'GAME ASSIGNMENT' });
  }

  function openDocumentForm(formId) {
    const formMeta = getRequiredForm(formId);
    if (!formMeta) return;
    if (formMeta.type === 'incident-report') { closeModal(); showView('incidents'); setTimeout(() => openIncidentForm(), 60); return; }
    const schema = FORM_SCHEMAS[formMeta.type];
    if (!schema) return showToast('This document type is managed by the admin dashboard.');
    const linked = linkedDocForForm(formMeta);
    const savedData = linked?.data || {};
    const p = state.profile;
    const defaults = {
      legalName:`${p.firstName} ${p.lastName}`.trim(), name:`${p.firstName} ${p.lastName}`.trim(), email:p.email, phone:p.phone, streetAddress:p.streetAddress, address2:p.address2, city:p.city, state:p.state, postalCode:p.postalCode, cityStateZip:[p.city,p.state,p.postalCode].filter(Boolean).join(', '), signedDate:todayISO(), submittedDate:todayISO()
    };
    const data = { ...defaults, ...savedData };
    const inputs = schema.fields.map(([name,label,type,required,options]) => {
      if (type === 'assignment') {
        const accepted = state.assignments.filter(a => a.status === 'accepted');
        return `<label>${esc(label)}<select name="${esc(name)}" ${required?'required':''}><option value="">Select an accepted assignment</option>${accepted.map(a => `<option value="${esc(a.id)}" ${data[name]===a.id?'selected':''}>${esc(formatLongDate(a.date))} — ${esc(a.matchup)}</option>`).join('')}</select></label>`;
      }
      return field(label,name,data[name],type,required,options||[]);
    }).join('');
    openModal(schema.title, `<form id="documentForm" class="portal-form" data-form-id="${esc(formId)}">${schema.notice ? `<div class="notice-box">${esc(schema.notice)}</div>` : ''}<div class="form-grid">${inputs}</div><div class="form-actions sticky-actions"><button type="button" class="outline-btn" data-action="save-document-draft">Save Draft</button><button type="submit" class="primary-btn">Complete & Save</button></div></form>`, { eyebrow:schema.eyebrow, context:'document-form' });
  }

  function serializeForm(form) {
    const data = {};
    new FormData(form).forEach((value,key) => { data[key] = value; });
    $$('input[type="checkbox"]', form).forEach(input => data[input.name] = input.checked);
    return data;
  }

  function saveDocumentForm(form, complete) {
    const formId = form.dataset.formId;
    let meta = getRequiredForm(formId);
    if (!meta) return;
    if (!state.requiredForms.includes(meta)) {
      meta = { ...meta, id:uid('form'), status:'Not Started' };
      state.requiredForms.unshift(meta);
      form.dataset.formId = meta.id;
    }
    const data = serializeForm(form);
    if (complete && !form.reportValidity()) return;
    let doc = meta.linkedDocumentId ? state.documents.find(d => d.id === meta.linkedDocumentId) : null;
    if (!doc) {
      doc = { id:uid('doc'), type:meta.type, name:meta.name, status:complete ? (meta.type === 'contract' ? 'Signed' : 'Completed') : 'Draft', date:new Date().toLocaleDateString('en-US'), source:'portal', data };
      state.documents.unshift(doc);
      meta.linkedDocumentId = doc.id;
    } else {
      doc.data = data;
      doc.source = 'portal';
      if (complete) {
        doc.status = meta.type === 'contract' ? 'Signed' : 'Completed';
        doc.date = new Date().toLocaleDateString('en-US');
      }
    }
    meta.status = complete ? (meta.type === 'contract' ? 'Signed' : 'Completed') : 'Draft';
    persist(complete ? 'documentCompleted' : 'documentDraftSaved', { formId, document:doc });
    closeModal();
    renderAll();
    showToast(complete ? `${meta.name} completed and saved.` : `${meta.name} draft saved.`);
  }

  function openDocument(id) {
    const doc = findOfficialDocument(id) || state.documents.find(d => d.id === id);
    if (!doc) return;
    let content = '';
    if (doc.data && Object.keys(doc.data).length) {
      content = `<dl class="document-detail-list">${Object.entries(doc.data).filter(([key])=>key!=='content').map(([key,value]) => `<div><dt>${esc(prettyLabel(key))}</dt><dd>${key.toLowerCase().includes('tin') && key !== 'tinType' ? '•••••••••' : esc(typeof value === 'boolean' ? (value?'Yes':'No') : Array.isArray(value)?value.join(', '):value)}</dd></div>`).join('')}</dl>`;
    } else {
      content = `<div class="notice-box"><strong>Saved document record</strong><p>${esc(doc.description || 'This document is stored in your Got U Nex Ref records. The original file body will appear here when supplied by the connected document service.')}</p></div>`;
    }
    openModal(doc.name, `<div class="detail-sheet"><span class="record-status accepted">${esc(doc.status)}</span><p class="document-meta">${esc(documentDateLabel(doc))} · ${esc(doc.categoryLabel||documentCategoryLabel(doc.category))}</p>${content}<div class="form-actions"><button class="outline-btn" data-action="close-modal">Close</button><button class="primary-btn" data-download-document="${esc(doc.id)}"><svg><use href="#i-download"/></svg>Download Record</button></div></div>`, { eyebrow:'COMPLETED DOCUMENT' });
  }

  function prettyLabel(key) { return key.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase()); }

  function downloadDocument(id) {
    const doc = findOfficialDocument(id) || state.documents.find(d => d.id === id);
    if (!doc) return;
    if(doc.source==='upload' && doc.dataUrl){ const a=document.createElement('a');a.href=doc.dataUrl;a.download=doc.name||'document';document.body.appendChild(a);a.click();a.remove();showToast('Document downloaded.');return; }
    if(doc.content && String(doc.fileType||'').includes('html')){ downloadBlob(sanitizeFilename(doc.name)+'.html',new Blob([doc.content],{type:'text/html'}));showToast('Document downloaded.');return; }
    const rows = doc.data && Object.keys(doc.data).length ? Object.entries(doc.data).filter(([k])=>k!=='content').map(([k,v]) => `<tr><th>${esc(prettyLabel(k))}</th><td>${k.toLowerCase().includes('tin') && k !== 'tinType' ? 'REDACTED' : esc(typeof v === 'boolean' ? (v?'Yes':'No') : Array.isArray(v)?v.join(', '):v)}</td></tr>`).join('') : `<tr><th>Description</th><td>${esc(doc.description||'Saved Got U Nex Ref document record.')}</td></tr>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(doc.name)}</title><style>body{font-family:Arial,sans-serif;max-width:850px;margin:40px auto;color:#111}h1{border-bottom:3px solid #d63a18;padding-bottom:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #bbb;padding:10px;text-align:left;vertical-align:top}th{width:35%;background:#f4f4f4}.meta{color:#555}</style></head><body><h1>${esc(doc.name)}</h1><p class="meta">Category: ${esc(doc.categoryLabel||documentCategoryLabel(doc.category))} · Status: ${esc(doc.status)} · Date: ${esc(documentDateLabel(doc))}</p><table>${rows}</table></body></html>`;
    downloadBlob(`${sanitizeFilename(doc.name)}.html`, new Blob([html],{type:'text/html'}));
    showToast('Document record downloaded.');
  }

  async function shareOfficialDocument(id) {
    const doc=findOfficialDocument(id);if(!doc)return;
    const shareData={title:doc.name,text:`${doc.name} — ${doc.categoryLabel||documentCategoryLabel(doc.category)} — ${doc.status||'Completed'}`};
    if(navigator.share){try{await navigator.share(shareData);showToast('Document share opened.');return;}catch(error){if(error?.name==='AbortError')return;}}
    try{await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);showToast('Document details copied for sharing.');}catch{showToast('Sharing is not available in this browser.');}
  }

  function sanitizeFilename(name) { return String(name).replace(/[^a-z0-9-_]+/gi,'_').replace(/^_+|_+$/g,'') || 'document'; }
  function downloadBlob(filename, blob) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
  function formatBytes(bytes=0) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`; return `${(bytes/1048576).toFixed(1)} MB`; }

  function openUpload(id) {
    const upload = state.uploads.find(u => u.id === id);
    if (!upload) return;
    const preview = upload.dataUrl ? (upload.type.startsWith('image/') ? `<img class="upload-preview" src="${upload.dataUrl}" alt="${esc(upload.name)}"/>` : `<a class="primary-btn inline-button" href="${upload.dataUrl}" download="${esc(upload.name)}">Download Uploaded File</a>`) : '<div class="notice-box">The file metadata is saved locally, but the file body was too large for offline browser storage. The connected admin upload API should store the production file.</div>';
    openModal(upload.name, `<div class="detail-sheet"><p>${esc(upload.type || 'File')} · ${formatBytes(upload.size)}</p>${preview}<div class="form-actions"><button class="outline-btn" data-action="close-modal">Close</button></div></div>`,{eyebrow:'UPLOADED DOCUMENT'});
  }

  function openEvaluation(id) {
    const e = state.evaluations.find(item => item.id === id);
    if (!e) return;
    const score=evaluationNumber(e.rating || e.overallScore);
    const categories=evaluationCategoryAverages([e]).filter(item=>item.value);
    const visible=evaluationVisibleComment(e);
    const details=[
      ['Status',evaluationStatusLabel(e)],['Game Date',evaluationDateValue(e)?formatLongDate(evaluationDateValue(e)):'Not provided'],['Game Time',e.gameTime||'Not provided'],['Game / Event',evaluationGameLabel(e)],['Location',e.site||e.location||'Not provided'],['Game Crew',e.gameCrew||e.partners||'Not provided'],['Evaluator',e.evaluator||e.evaluatorName||'Not provided']
    ];
    openModal('Finalized Evaluation', `<div class="detail-sheet"><div class="evaluation-hero-score"><strong>${score?score.toFixed(2):'—'}</strong>${evaluationStars(score,'evaluation-row-stars')}</div><div class="evaluation-detail-game"><strong>${esc(evaluationGameLabel(e))}</strong><span>${esc(evaluationLevelLabel(e))}</span></div><dl>${details.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>${categories.length?`<div class="evaluation-detail-scores">${categories.map(c=>`<div><span>${esc(c.label)}</span><strong>${c.value.toFixed(2)}</strong></div>`).join('')}</div>`:''}${visible?`<div class="evaluation-visible-comments"><strong>Evaluator Comments Available to You</strong><p>${esc(visible)}</p></div>`:''}<div class="evaluation-detail-summary">${e.strengths?`<section><h4>Strengths</h4><p>${esc(e.strengths)}</p></section>`:''}${e.areasForImprovement?`<section><h4>Areas for Improvement</h4><p>${esc(e.areasForImprovement)}</p></section>`:''}${e.overallSummary?`<section><h4>Overall Summary</h4><p>${esc(e.overallSummary)}</p></section>`:''}</div><div class="form-actions"><button class="outline-btn" data-action="close-modal">Close</button></div></div>`,{eyebrow:'EVALUATION REVIEW'});
  }

  function composeMessage() {
    openModal('New Message', `<form id="messageComposeForm" class="portal-form"><div class="form-grid"><label>To<select name="to" required><option>Assigning Administrator</option><option>Assignor</option><option>Super Admin</option><option>Authorized Administrator</option><option>Support</option><option>Other User / Crew Member</option></select></label><label>Subject<input name="subject" required/></label><label class="span-2">Message<textarea name="body" rows="8" required></textarea></label></div><div class="form-actions"><button type="button" class="outline-btn" data-action="close-modal">Cancel</button><button class="primary-btn" type="submit">Send Message</button></div></form>`,{eyebrow:'MESSAGES'});
  }

  function openNewAssignmentForm() {
    if (!canCreateAssignments()) {
      showToast('You do not have permission to create assignments.');
      return;
    }
    openModal('New Assignment', `<form id="newAssignmentForm" class="portal-form">
      <div class="form-grid">
        <label>Assignment Name<input name="title" required /></label>
        <label>Type<input name="type" placeholder="Game, Report, Plan, Quiz…" /></label>
        <label>Class / Team<input name="classTeam" /></label>
        <label>Due Date<input name="dueDate" type="date" required /></label>
        <label>Due Time<input name="dueTime" type="time" /></label>
        <label>Status<select name="status"><option value="pending">Pending</option><option value="active">Active</option><option value="reviewing">Reviewing</option><option value="completed">Completed</option></select></label>
        <label class="span-2">Description<textarea name="description" rows="4"></textarea></label>
      </div>
      <div class="form-actions">
        <button type="button" class="outline-btn" data-action="close-modal">Cancel</button>
        <button type="submit" class="primary-btn">Create Assignment</button>
      </div>
    </form>`, { eyebrow:'ASSIGNMENTS' });
  }

  function requestEvaluation() {
    const accepted = state.assignments.filter(a => a.status === 'accepted');
    openModal('Request Evaluation', `<form id="evaluationRequestForm" class="portal-form"><div class="form-grid"><label>Assignment<select name="assignmentId" required><option value="">Select an assignment</option>${accepted.map(a=>`<option value="${esc(a.id)}">${esc(formatLongDate(a.date))} — ${esc(a.matchup)}</option>`).join('')}</select></label><label>Request Type<select name="requestType"><option>Game Evaluation</option><option>Film Review</option><option>Development Feedback</option></select></label><label class="span-2">Message<textarea name="note" rows="5"></textarea></label></div><div class="form-actions"><button type="button" class="outline-btn" data-action="close-modal">Cancel</button><button type="submit" class="primary-btn">Send Request</button></div></form>`,{eyebrow:'PERFORMANCE'});
  }

  function renderContextMenu(button) {
    const menu = button.dataset.menu;
    const routeMap = { assignments:'assignments', documents:'documents', 'id-card':'id-card', availability:'availability', quick:'dashboard' };
    const route = routeMap[menu] || 'profile';
    openModal('More Options', `<div class="menu-list"><button data-route="${route}">Open full section</button><button data-action="refresh-sync">Refresh from admin</button>${menu === 'availability' ? '<button data-action="save-availability">Save availability</button>' : ''}</div>`,{eyebrow:'QUICK MENU'});
  }

  function downloadIdCard() {
    const stage = $('#profileIdCardStage');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Got U Nex Ref ID Card</title><style>body{background:#000;color:#fff;font-family:Arial,sans-serif;display:flex;justify-content:center;padding:40px}.wrap{display:flex;gap:24px}.card{width:320px;min-height:200px;border:1px solid #a45d00;border-radius:12px;padding:18px;background:#080808}img{max-width:100px}.name{font-size:28px;font-weight:800}.orange{color:#ff3a20}</style></head><body><div class="wrap"><div class="card"><div class="name">${esc(state.profile.firstName)} ${esc(state.profile.lastName)}</div><p>${esc((state.profile.role||'Role not provided').toUpperCase())}</p><p class="orange">ID: ${esc(state.profile.officialId)}</p><p>Expires: ${esc(state.profile.idExpiry)}</p></div><div class="card"><h2>AUTHORIZED ${esc((state.profile.role||'Role not provided').toUpperCase())}</h2><p>GOT U NEX REF</p><p>RAISING THE BAR OFFICIATING</p><p>www.gotunexref.com</p></div></div></body></html>`;
    downloadBlob(`Got_U_Nex_Ref_ID_${sanitizeFilename(state.profile.officialId)}.html`, new Blob([html],{type:'text/html'}));
    showToast('ID card downloaded.');
  }

  async function refreshSync() {
    showToast('Requesting latest admin data…');
    const result = await BRIDGE.call('getOfficialPortalData', { officialId:state.profile.officialId });
    if (result && result.data) {
      state = mergeState(state, result.data);
      persist('syncApplied',{source:'admin-adapter'});
      renderAll();
      showToast('Portal synchronized.');
    } else if (result?.localOnly) {
      showToast('Admin adapter not attached yet; local portal data is current.');
    }
  }

  function handleAssignmentResponse(id, response) {
    const a = state.assignments.find(item => item.id === id);
    if (!a) return;
    if (response === 'accept') {
      a.status = 'accepted';
      persist('assignmentAccepted',{assignmentId:id});
      closeModal(); renderAll(); showToast('Assignment accepted.');
    } else {
      openModal('Decline Assignment', `<form id="declineAssignmentForm" data-assignment-id="${esc(id)}" class="portal-form"><label>Reason<select name="reason" required><option value="">Select a reason</option><option>Unavailable</option><option>Conflict</option><option>Travel / Distance</option><option>Work / Family Commitment</option><option>Other</option></select></label><label>Additional Note<textarea name="note" rows="5"></textarea></label><div class="form-actions"><button type="button" class="outline-btn" data-action="close-modal">Cancel</button><button class="danger-btn" type="submit">Confirm Decline</button></div></form>`,{eyebrow:'ASSIGNMENT RESPONSE'});
    }
  }

  function cycleAvailability(row,col) {
    const order = ['unset','available','limited','unavailable'];
    const current = state.availability.values[row][col];
    state.availability.values[row][col] = order[(order.indexOf(current)+1)%order.length];
    renderAvailabilityEditor();
    renderProfileAvailability();
  }

  function saveAvailability() {
    state.availability.savedAt = new Date().toISOString();
    persist('availabilityUpdated',{availability:state.availability});
    renderAll();
    showToast('Availability saved and ready to sync with admin.');
  }

  function handleFileUploads(files) {
    [...files].forEach(file => {
      const record = { id:uid('upload'), name:file.name, type:file.type, size:file.size, date:new Date().toLocaleDateString('en-US'), dataUrl:'' };
      const finish = () => { state.uploads.unshift(record); persist('documentUploaded',{file:{...record,dataUrl:undefined}}); renderAll(); showToast(`${file.name} added to Documents.`); };
      if (file.size <= 1500000) {
        const reader = new FileReader();
        reader.onload = () => { record.dataUrl = reader.result; finish(); };
        reader.onerror = finish;
        reader.readAsDataURL(file);
      } else finish();
    });
  }

  function calendarMove(offset) { calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth()+offset, 1); renderCalendar(); }

  function attachEvents() {
    document.addEventListener('click', e => {
      const route = e.target.closest('[data-route]');
      if (route) { e.preventDefault(); closeModal(); showView(route.dataset.route); return; }
      const side = e.target.closest('.side-link[data-view]');
      if (side) { e.preventDefault(); showView(side.dataset.view); return; }

      const actionEl = e.target.closest('[data-action]');
      if (actionEl) {
        const action = actionEl.dataset.action;
        if (action === 'edit-profile') window.location.href = 'edit-profile.html';
        else if (action === 'close-modal') closeModal();
        else if (action === 'upload-document') $('#documentUploadInput').click();
        else if (action === 'message-admin' || action === 'compose-message') composeMessage();
        else if (action === 'request-evaluation') requestEvaluation();
        else if (action === 'save-availability') { closeModal(); saveAvailability(); }
        else if (action === 'refresh-sync') { closeModal(); refreshSync(); }
        else if (action === 'new-assignment') {
          if (!canCreateAssignments()) { showToast('You do not have permission to create assignments.'); return; }
          openNewAssignmentForm();
        }
        else if (action === 'sort-assignments-date') { assignmentSortDirection = assignmentSortDirection === 'asc' ? 'desc' : 'asc'; assignmentPage = 1; renderAssignments(); }
        else if (action === 'toggle-game-filters') {
          const drawer=$('#myGamesFilterDrawer'); if(drawer){drawer.hidden=!drawer.hidden;actionEl.setAttribute('aria-expanded',String(!drawer.hidden));}
        }
        else if (action === 'clear-game-filters') {
          myGamesFromDate=''; myGamesToDate=''; myGamesLevel=''; myGamesLocation=''; myGamesPage=1; renderMyGames();
        }
        else if (action === 'calendar-prev') calendarMove(-1);
        else if (action === 'calendar-next') calendarMove(1);
        else if (action === 'calendar-today') { calendarCursor = new Date(); renderCalendar(); }
        else if (action === 'mark-all-read') { state.messages.forEach(m=>m.read=true); persist('messagesMarkedRead',{}); renderMessages(); showToast('Messages marked as read.'); }
        else if (action === 'mark-all-notifications-read') { (state.notifications||[]).forEach(n=>n.read=true); persist('notificationsMarkedRead',{}); renderNotifications(); showToast('Notifications marked as read.'); }
        else if (action === 'print-id') window.print();
        else if (action === 'download-id') downloadIdCard();
        else if (action === 'save-settings') {
          const form = $('#settingsForm'); Object.keys(state.settings).forEach(key => state.settings[key] = !!form.elements[key]?.checked); persist('settingsUpdated',{settings:state.settings}); showToast('Settings saved.');
        }
        else if (action === 'save-document-draft') { const form = $('#documentForm'); if (form) saveDocumentForm(form,false); }
        else if (action === 'save-incident-draft') { const form = $('#incidentReportForm'); if (form) saveIncidentReport(form,false); }
        return;
      }


      if (e.target.closest('#updatePaymentMethodBtn') || e.target.closest('#directDepositFormBtn')) { openDirectDepositForm(); return; }
      if (e.target.closest('#officialExportPaymentsBtn')) { exportOfficialPayments(); return; }
      const paymentReceipt=e.target.closest('[data-official-payment-receipt]'); if(paymentReceipt){downloadOfficialPaymentReceipt(paymentReceipt.dataset.officialPaymentReceipt);return;}
      if (e.target.closest('#officialPaymentsViewAll')) { $('#officialPayoutHistoryPanel')?.scrollIntoView({behavior:'smooth'}); return; }
      if (e.target.closest('#officialPaymentsViewAllBottom') || e.target.closest('#officialViewPaymentHistory') || e.target.closest('#officialViewPayoutSchedule')) { $('#officialPayoutHistoryPanel')?.scrollIntoView({behavior:'smooth'}); return; }
      if (e.target.closest('#officialViewReimbursements')) { $('#officialReimbursementSummary')?.scrollIntoView({behavior:'smooth'}); return; }
      if (e.target.closest('#officialUploadReimbursementReceipt')) { $('#documentUploadInput').click(); showToast('Upload the reimbursement receipt; it will be saved in Documents.'); return; }
      if (e.target.closest('#officialReimbursementsViewAll')) { showToast('All recorded reimbursements are included in the summary.'); return; }

      if (e.target.closest('#newIncidentReportBtn')) { openIncidentForm(); return; }
      const incidentTab=e.target.closest('[data-incident-filter]'); if(incidentTab){incidentFilter=incidentTab.dataset.incidentFilter;incidentPage=1;renderIncidents();return;}
      const incidentSelect=e.target.closest('[data-incident-select]'); if(incidentSelect){incidentSelectedId=incidentSelect.dataset.incidentSelect;renderIncidents();return;}
      const incidentOpen=e.target.closest('[data-incident-open]'); if(incidentOpen){openIncidentForm('',incidentOpen.dataset.incidentOpen);return;}
      if(e.target.closest('#incidentPrevPage')){incidentPage=Math.max(1,incidentPage-1);renderIncidents();return;}
      if(e.target.closest('#incidentNextPage')){incidentPage+=1;renderIncidents();return;}

      const assignmentTab = e.target.closest('[data-assignment-view]');
      if (assignmentTab) { assignmentFilter = assignmentTab.dataset.assignmentView; assignmentPage = 1; renderAssignments(); return; }
      const assignmentPageButton = e.target.closest('[data-assignment-page]');
      if (assignmentPageButton) { assignmentPage = Number(assignmentPageButton.dataset.assignmentPage) || 1; renderAssignments(); return; }
      if (e.target.closest('#assignmentPagePrev')) { assignmentPage = Math.max(1,assignmentPage-1); renderAssignments(); return; }
      if (e.target.closest('#assignmentPageNext')) { assignmentPage += 1; renderAssignments(); return; }
      const documentTab = e.target.closest('[data-document-filter]');
      if (documentTab) { documentFilter = documentTab.dataset.documentFilter; renderDocuments(); return; }
      const documentSelect = e.target.closest('[data-document-select]');
      if (documentSelect && !e.target.closest('[data-download-document]')) { documentSelectedId=documentSelect.dataset.documentSelect; renderDocuments(); return; }
      const documentCategoryButton = e.target.closest('[data-document-category]');
      if (documentCategoryButton) { documentCategory=documentCategoryButton.dataset.documentCategory; documentPage=1; renderDocuments(); return; }
      const documentPageButton = e.target.closest('[data-document-page]');
      if (documentPageButton && !documentPageButton.disabled) { documentPage=Number(documentPageButton.dataset.documentPage)||1; renderDocuments(); return; }
      if (e.target.closest('#documentFormsToggle')) { const drawer=$('#documentFormsDrawer'); if(drawer){drawer.hidden=!drawer.hidden;$('#documentFormsToggle').setAttribute('aria-expanded',String(!drawer.hidden));} return; }
      if (e.target.closest('#documentFormsClose')) { const drawer=$('#documentFormsDrawer'); if(drawer)drawer.hidden=true;$('#documentFormsToggle')?.setAttribute('aria-expanded','false');return; }
      if (e.target.closest('#documentPreviewClose')) { documentSelectedId='';renderDocumentPreview(null);$$('.official-document-card').forEach(card=>card.classList.remove('selected'));return; }
      if (e.target.closest('#documentZoomIn')) { documentZoom=Math.min(1.5,documentZoom+.1);renderDocumentPreview(findOfficialDocument(documentSelectedId));return; }
      if (e.target.closest('#documentZoomOut')) { documentZoom=Math.max(.7,documentZoom-.1);renderDocumentPreview(findOfficialDocument(documentSelectedId));return; }
      if (e.target.closest('#documentPreviewDownload')) { if(documentSelectedId)downloadDocument(documentSelectedId);return; }
      if (e.target.closest('#documentPreviewShare')) { shareOfficialDocument(documentSelectedId);return; }
      if (e.target.closest('#documentActivityToggle')) { documentActivityExpanded=!documentActivityExpanded;renderDocuments();return; }
      const availabilityCell = e.target.closest('[data-availability-row]');
      if (availabilityCell) { cycleAvailability(Number(availabilityCell.dataset.availabilityRow),Number(availabilityCell.dataset.availabilityCol)); return; }
      const responseBtn = e.target.closest('[data-assignment-response]');
      if (responseBtn) { handleAssignmentResponse(responseBtn.dataset.assignmentId,responseBtn.dataset.assignmentResponse); return; }
      const gameTab = e.target.closest('[data-game-filter]');
      if (gameTab) { myGamesFilter=gameTab.dataset.gameFilter; myGamesPage=1; renderMyGames(); return; }
      const myGamesPageButton = e.target.closest('[data-my-games-page]');
      if (myGamesPageButton) { myGamesPage=Number(myGamesPageButton.dataset.myGamesPage)||1; renderMyGames(); return; }
      if (e.target.closest('#myGamesPrev')) { myGamesPage=Math.max(1,myGamesPage-1); renderMyGames(); return; }
      if (e.target.closest('#myGamesNext')) { myGamesPage+=1; renderMyGames(); return; }
      const gameAction = e.target.closest('[data-game-action][data-assignment-id]');
      if (gameAction) {
        const a=state.assignments.find(item=>item.id===gameAction.dataset.assignmentId); if(!a)return;
        const action=gameAction.dataset.gameAction;
        if(action==='details') {
          const crewMembers = Array.isArray(a.crew) ? a.crew : (Array.isArray(a.officials) ? a.officials : []);
          const activeCrewCountFromArray = crewMembers.filter(member => !String(member.position || member.role || '').toLowerCase().includes('alternate')).length;
          const crewSize = Number(a.crewCount ?? a.officialsCount ?? activeCrewCountFromArray);
          const currentStatus = String(a.status || a.workflowStatus || '').toLowerCase();
          sessionStorage.setItem('gotUNexRef.selectedAssignmentId',a.id);
          if (currentStatus === 'pending') location.href = `pending-assignment.html?id=${encodeURIComponent(a.id)}`;
          else if (crewSize === 2) location.href = `assignment-2man.html?id=${encodeURIComponent(a.id)}`;
          else if (crewSize === 3) location.href = `assignment-3man.html?id=${encodeURIComponent(a.id)}`;
          else openAssignmentDetails(a.id);
        }
        else if(action==='calendar') addGameToCalendar(a);
        else if(action==='crew') openCrewContacts(a);
        else if(action==='directions') openGameDirections(a);
        else if(action==='incident') openIncidentForm(a.id);
        return;
      }
      const assignment = e.target.closest('[data-assignment-id]');
      if (assignment) { openAssignmentDetails(assignment.dataset.assignmentId); return; }
      const formBtn = e.target.closest('[data-form-id]');
      if (formBtn) { openDocumentForm(formBtn.dataset.formId); return; }
      const docBtn = e.target.closest('[data-document-id]');
      if (docBtn) { openDocument(docBtn.dataset.documentId); return; }
      const downloadBtn = e.target.closest('[data-download-document]');
      if (downloadBtn) { downloadDocument(downloadBtn.dataset.downloadDocument); return; }
      const uploadBtn = e.target.closest('[data-upload-id]');
      if (uploadBtn) { openUpload(uploadBtn.dataset.uploadId); return; }
      const deleteUpload = e.target.closest('[data-delete-upload]');
      if (deleteUpload) { state.uploads = state.uploads.filter(u=>u.id!==deleteUpload.dataset.deleteUpload); persist('uploadDeleted',{uploadId:deleteUpload.dataset.deleteUpload}); renderAll(); showToast('Uploaded file removed.'); return; }
      const evalBtn = e.target.closest('[data-evaluation-id]');
      if (evalBtn) { openEvaluation(evalBtn.dataset.evaluationId); return; }
      const messageBtn = e.target.closest('[data-message-id]');
      if (messageBtn) {
        const m = state.messages.find(x=>x.id===messageBtn.dataset.messageId); if (!m) return;
        m.read=true; persist('messageRead',{messageId:m.id});
        showView('messages'); renderMessages();
        const reader = $('#messageReader');
        if (reader) reader.innerHTML=`<div class="message-content"><span>${esc(m.from||m.sender||'Authorized administrator')}</span><h2>${esc(m.subject||'Message')}</h2><time>${esc(m.date||'')}</time><p>${esc(m.body||'')}</p></div>`;
        return;
      }
      const notificationBtn = e.target.closest('[data-notification-id]');
      if (notificationBtn) {
        const n = (state.notifications||[]).find(x=>x.id===notificationBtn.dataset.notificationId); if (!n) return;
        n.read=true; persist('notificationRead',{notificationId:n.id}); renderNotifications();
        const routeButton = n.route ? `<button class="primary-btn" data-route="${esc(n.route)}">Open Related Area</button>` : '';
        openModal(n.title || 'Notification', `<div class="detail-sheet"><span class="record-status ${n.read ? 'accepted' : 'pending'}">${esc(n.category || 'NOTIFICATION')}</span><p class="document-meta">${esc(n.sender || n.from || 'Got U Nex Ref')} · ${esc(communicationItemTime(n))}</p><p>${esc(n.body || n.message || '')}</p><div class="form-actions"><button class="outline-btn" data-action="close-modal">Close</button>${routeButton}</div></div>`, { eyebrow:'NOTIFICATION CENTER' });
        return;
      }
      const menuBtn = e.target.closest('[data-menu]');
      if (menuBtn) { renderContextMenu(menuBtn); return; }
      const schoolBtn = e.target.closest('[data-school-id]');
      if (schoolBtn) { const s=state.schools.find(x=>x.id===schoolBtn.dataset.schoolId); if(s) openModal(s.name,`<div class="detail-sheet"><p>${esc(s.type||'')}</p><p>${esc(s.address||'No address supplied')}</p><div class="form-actions"><button class="outline-btn" data-action="close-modal">Close</button></div></div>`,{eyebrow:'MY SCHOOLS'}); return; }
      const whiteBtn = e.target.closest('[data-whiteboard-id]');
      if (whiteBtn) { const w=state.whiteboard.find(x=>x.id===whiteBtn.dataset.whiteboardId); if(w) openModal(w.title,`<div class="detail-sheet"><p>${esc(w.body||w.summary||'')}</p><div class="form-actions"><button class="outline-btn" data-action="close-modal">Close</button></div></div>`,{eyebrow:'WHITEBOARD'}); return; }
    });

    document.addEventListener('submit', e => {
      e.preventDefault();
      if (e.target.id === 'profileEditForm') {
        const data = serializeForm(e.target);
        const dateKeys = ['backgroundDate','safeSportDate','idExpiry'];
        dateKeys.forEach(k => data[k] = usFromDateInput(data[k]));
        state.profile = { ...state.profile, ...data, photoDataUrl: photoPreviewDataUrl || state.profile.photoDataUrl };
        persist('profileUpdated',{profile:state.profile}); closeModal(); renderAll(); showToast('Profile updated.');
      } else if (e.target.id === 'documentForm') {
        saveDocumentForm(e.target,true);
      } else if (e.target.id === 'incidentReportForm') {
        saveIncidentReport(e.target,true);
      } else if (e.target.id === 'directDepositForm') {
        saveDirectDepositForm(e.target);
      } else if (e.target.id === 'messageComposeForm') {
        const data = serializeForm(e.target);
        const outgoing = { id:uid('message'), from:'You', to:data.to, subject:data.subject, body:data.body, date:new Date().toLocaleString('en-US'), read:true, direction:'sent' };
        state.messages.unshift(outgoing); persist('messageSent',{message:outgoing}); closeModal(); renderMessages(); showToast('Message sent to admin workflow.');
      } else if (e.target.id === 'newAssignmentForm') {
        if (!canCreateAssignments()) {
          closeModal();
          showToast('You do not have permission to create assignments.');
          return;
        }
        const data = serializeForm(e.target);
        const assignment = {
          id:uid('assignment'),
          title:data.title,
          description:data.description || '',
          type:data.type || '',
          classTeam:data.classTeam || '',
          dueDate:data.dueDate || '',
          dueTime:data.dueTime || '',
          status:data.status || 'pending',
          assignedToMe:true,
          createdAt:new Date().toISOString()
        };
        state.assignments.unshift(assignment);
        persist('assignmentCreatedFromProfile',{assignment});
        closeModal();
        assignmentPage=1;
        renderAll();
        showView('assignments',false);
        showToast('Assignment created.');
      } else if (e.target.id === 'evaluationRequestForm') {
        const data = serializeForm(e.target); persist('evaluationRequested',data); closeModal(); showToast('Evaluation request sent.');
      } else if (e.target.id === 'declineAssignmentForm') {
        const data = serializeForm(e.target); const id=e.target.dataset.assignmentId; const a=state.assignments.find(x=>x.id===id); if(a){a.status='declined';a.declineReason=data.reason;a.declineNote=data.note;persist('assignmentDeclined',{assignmentId:id,reason:data.reason,note:data.note});} closeModal(); renderAll(); showToast('Assignment declined.');
      } else if (e.target.id === 'supportForm') {
        const data = serializeForm(e.target); const ticket={id:uid('ticket'),...data,date:new Date().toISOString(),status:'Submitted'}; state.supportTickets.unshift(ticket); persist('supportTicketCreated',{ticket}); e.target.reset(); showToast('Support request submitted.');
      }
    });


    document.addEventListener('change', e => {
      if(e.target.id==='incidentGameSelect'){const form=e.target.closest('#incidentReportForm');populateIncidentGameFields(form,e.target.value);return;}
      if(e.target.id==='incidentStatusFilter'){incidentStatusFilter=e.target.value;incidentPage=1;renderIncidents();return;}
    });

    document.addEventListener('input', e => {
      if (e.target.id === 'myGamesLocationFilter') { myGamesLocation=e.target.value; myGamesPage=1; renderMyGames(); return; }
      if (e.target.id === 'assignmentTopSearch' || e.target.id === 'assignmentTableSearch') {
        assignmentSearch = e.target.value;
        assignmentPage = 1;
        const other = e.target.id === 'assignmentTopSearch' ? $('#assignmentTableSearch') : $('#assignmentTopSearch');
        if (other && other.value !== assignmentSearch) other.value = assignmentSearch;
        renderAssignments();
      }
    });

    document.addEventListener('change', e => {
      if (e.target.id === 'myGamesSort') { myGamesSort=e.target.value; myGamesPage=1; renderMyGames(); return; }
      if (e.target.id === 'myGamesFromDate') { myGamesFromDate=e.target.value; myGamesPage=1; renderMyGames(); return; }
      if (e.target.id === 'myGamesToDate') { myGamesToDate=e.target.value; myGamesPage=1; renderMyGames(); return; }
      if (e.target.id === 'myGamesLevelFilter') { myGamesLevel=e.target.value; myGamesPage=1; renderMyGames(); return; }
      if (e.target.id === 'assignmentStatusFilter') { assignmentStatusFilter = e.target.value; assignmentPage=1; renderAssignments(); return; }
      if (e.target.id === 'assignmentTypeFilter') { assignmentTypeFilter = e.target.value; assignmentPage=1; renderAssignments(); return; }
      if (e.target.id === 'assignmentTeamFilter') { assignmentTeamFilter = e.target.value; assignmentPage=1; renderAssignments(); return; }
      if (e.target.id === 'assignmentMonthFilter') { assignmentMonthFilter = e.target.value; assignmentPage=1; renderAssignments(); return; }
      if (e.target.id === 'profilePhotoInput' && e.target.files?.[0]) {
        const file=e.target.files[0]; const reader=new FileReader(); reader.onload=()=>{photoPreviewDataUrl=reader.result;showToast('New profile photo selected. Save Profile to apply it.');}; reader.readAsDataURL(file);
      }
    });

    $('#documentSearchInput')?.addEventListener('input', e => { documentSearch=e.target.value;documentPage=1;renderDocuments(); });
    $('#documentCategoryFilter')?.addEventListener('change', e => { documentCategory=e.target.value;documentPage=1;renderDocuments(); });
    $('#documentTypeFilter')?.addEventListener('change', e => { documentType=e.target.value;documentPage=1;renderDocuments(); });
    $('#documentDateFilter')?.addEventListener('change', e => { documentDateRange=e.target.value;documentPage=1;renderDocuments(); });
    $('#documentSortSelect')?.addEventListener('change', e => { documentSort=e.target.value;documentPage=1;renderDocuments(); });
    $('#documentUploadInput').addEventListener('change', e => { if (e.target.files?.length) handleFileUploads(e.target.files); e.target.value=''; });
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
    const evaluationSeasonFilter = $('#evaluationSeasonFilter');
    if (evaluationSeasonFilter) evaluationSeasonFilter.addEventListener('change', renderEvaluations);
    const evaluationViewAllBtn = $('#evaluationViewAllBtn');
    if (evaluationViewAllBtn) evaluationViewAllBtn.addEventListener('click', () => {
      const records = evaluationCurrentSeasonRecords().slice().sort((a,b)=>evaluationDateValue(b).localeCompare(evaluationDateValue(a)));
      openModal('All Finalized Evaluations', records.length ? `<div class="evaluation-recent-list">${records.map(record=>{const score=evaluationNumber(record.rating||record.overallScore);return `<button class="evaluation-review-row" data-evaluation-id="${esc(record.id)}" type="button"><span class="evaluation-game-main"><span class="evaluation-game-icon">◉</span><span class="evaluation-game-copy"><strong>${esc(evaluationGameLabel(record))}</strong><small>${esc(evaluationDateValue(record)?formatLongDate(evaluationDateValue(record)):'')}</small></span></span><span class="evaluation-review-score">${score?score.toFixed(2):'—'}</span>${evaluationStars(score,'evaluation-row-stars')}<span class="evaluation-finalized-pill">Finalized</span><svg class="evaluation-row-chevron"><use href="#i-chevron-right"></use></svg></button>`}).join('')}</div>` : '<div class="evaluation-empty-state"><h3>No finalized evaluations</h3></div>', {eyebrow:'EVALUATION HISTORY'});
    });
    const evaluationCategoryBreakdownBtn = $('#evaluationCategoryBreakdownBtn');
    if (evaluationCategoryBreakdownBtn) evaluationCategoryBreakdownBtn.addEventListener('click', () => {
      const categories=evaluationCategoryAverages(evaluationCurrentSeasonRecords());
      openModal('Category Breakdown', `<div class="evaluation-detail-scores">${categories.map(c=>`<div><span>${esc(c.label)}</span><strong>${c.value?c.value.toFixed(2):'—'}</strong></div>`).join('')}</div>`, {eyebrow:'PERFORMANCE'});
    });
    window.addEventListener('hashchange', () => showView(location.hash.replace('#','') || DEFAULT_LANDING_VIEW, false));
    window.addEventListener('gotunexref:admin-sync', e => {
      if (!e.detail) return;
      state = mergeState(state,e.detail); localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); renderAll(); showToast('Admin dashboard update received.');
    });
  }

  window.GotUNexRefPortal = {
    defaultLandingView: DEFAULT_LANDING_VIEW,
    loginLandingUrl: 'my-profile.html#profile',
    canCreateAssignments: () => canCreateAssignments(),
    getState: () => clone(state),
    setState: incoming => { state = mergeState(state,incoming||{}); localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); renderAll(); },
    receiveAdminSync: incoming => window.dispatchEvent(new CustomEvent('gotunexref:admin-sync',{detail:incoming})),
    openView: view => showView(view),
    resetLocalState: () => { localStorage.removeItem(STORAGE_KEY); state=clone(DEFAULT_STATE); renderAll(); showView(DEFAULT_LANDING_VIEW,false); }
  };

  window.addEventListener('storage', e => { if (e.key === PAYROLL_KEY && activeView === 'payments') { renderOfficialPayments(); renderDocuments(); } });

  attachEvents();
  renderAll();
  const initial = location.hash.replace('#','') || DEFAULT_LANDING_VIEW;
  showView(initial,false);
window.addEventListener('storage', e => {
    if (![ADMIN_ASSIGNMENTS_KEY, ADMIN_DASHBOARD_KEY].includes(e.key)) return;
    state = syncAdminIncidentsForCurrentOfficial(syncAdminEvaluationsForCurrentOfficial(syncAdminAssignmentsForCurrentOfficial(loadState())));
    renderAll();
  });
  })();
