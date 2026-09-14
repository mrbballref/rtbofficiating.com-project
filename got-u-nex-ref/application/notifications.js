import { supabase, getSession } from '../../assets/auth.js';

(async () => {
  'use strict';

  const session = await getSession();
  if (!session) { window.location.href = '/account/index.html?view=signin'; return; }

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  // Notification PREFERENCES (which categories to email/text about) aren't
  // backed by a real table yet — kept as a local, per-device convenience.
  // Notification CONTENT below is real (public.gunr_notifications).
  const SETTINGS_KEY = 'gotUNexRef.notificationSettings.v1';
  const EMPTY_SETTINGS = {
    emailAssignmentAlerts:false,
    smsAssignmentAlerts:false,
    assignmentAlerts:false,
    scheduleChanges:false,
    messageNotifications:false,
    systemUpdates:false
  };

  function loadSettings(){
    try{
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
      return saved && typeof saved === 'object' ? {...EMPTY_SETTINGS, ...saved} : structuredClone(EMPTY_SETTINGS);
    }catch{
      return structuredClone(EMPTY_SETTINGS);
    }
  }

  async function loadState(){
    const { data, error } = await supabase.rpc('list_my_gunr_notifications');
    const notifications = error ? [] : (data || []).map(n => ({
      id: n.id,
      title: n.title,
      body: n.body,
      category: n.category,
      priority: n.priority,
      read: n.read,
      createdAt: n.created_at,
    }));
    return { profile: {}, notifications, settings: loadSettings() };
  }

  let state = await loadState();
  let activeTab = 'all';
  let activeFilters = {type:'',priority:'',days:'30'};
  let currentPage = 1;
  let pageSize = 25;
  let toastTimer = null;

  const categoryAliases = {
    assignment:'assignments', assignments:'assignments', game:'assignments',
    schedule:'schedule', scheduling:'schedule', availability:'schedule',
    message:'messages', messages:'messages',
    official:'officials', officials:'officials', user:'officials',
    report:'reports', reports:'reports', document:'reports',
    system:'system', account:'system', maintenance:'system', update:'system',
    warning:'warning', conflict:'warning'
  };

async function persist(action,payload={}){
    if (action === 'notificationRead' && payload.notificationId) {
      await supabase.rpc('mark_gunr_notification_read', { target_id: payload.notificationId });
    } else if (action === 'notificationsMarkedRead') {
      await Promise.all(state.notifications.filter(n => !n.read).map(n =>
        supabase.rpc('mark_gunr_notification_read', { target_id: n.id })));
    } else if (action === 'notificationSettingsUpdated') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    }
    window.dispatchEvent(new CustomEvent('gotunexref:portal-action',{
      detail:{action,payload,timestamp:new Date().toISOString()}
    }));
  }

  function toast(message){
    const el = $('#notificationToast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>el.classList.remove('show'),1800);
  }

  function normalizeCategory(n){
    const raw = String(n.category || n.type || n.notificationType || '').trim().toLowerCase();
    if (categoryAliases[raw]) return categoryAliases[raw];
    for (const [key,value] of Object.entries(categoryAliases)) if(raw.includes(key)) return value;
    const title = String(n.title || '').toLowerCase();
    if(title.includes('assign')) return 'assignments';
    if(title.includes('schedule') || title.includes('availability') || title.includes('confirm')) return 'schedule';
    if(title.includes('message')) return 'messages';
    if(title.includes('official') || title.includes('user')) return 'officials';
    if(title.includes('report') || title.includes('document')) return 'reports';
    if(title.includes('conflict') || title.includes('warning')) return 'warning';
    return 'system';
  }

  function normalizePriority(n){
    const raw = String(n.priority || 'normal').toLowerCase();
    return ['high','normal','low'].includes(raw) ? raw : 'normal';
  }

  function notificationDate(n){
    const raw = n.createdAt || n.date || n.timestamp || n.updatedAt || '';
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function relativeTime(n){
    if(n.relativeTime) return String(n.relativeTime);
    const d = notificationDate(n);
    if(!d) return n.date || '';
    const diff = Date.now()-d.getTime();
    if(diff < 60_000) return 'Just now';
    if(diff < 3_600_000) return `${Math.max(1,Math.floor(diff/60_000))} minutes ago`;
    if(diff < 86_400_000) return `${Math.max(1,Math.floor(diff/3_600_000))} hour${Math.floor(diff/3_600_000)===1?'':'s'} ago`;
    if(diff < 172_800_000) return `Yesterday at ${d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}`;
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  }

  function detailLine(n){
    if(n.detail) return String(n.detail);
    if(n.eventDate){
      const d = new Date(`${n.eventDate}T12:00:00`);
      if(!Number.isNaN(d.getTime())){
        const dateText = d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
        return n.eventTime ? `${dateText} at ${n.eventTime}` : dateText;
      }
    }
    return '';
  }

  function iconFor(category){
    return ({
      assignments:'n-calendar',
      schedule:'n-calendar',
      messages:'n-chat',
      officials:'n-user-plus',
      warning:'n-warning',
      reports:'n-report',
      system:'n-system'
    })[category] || 'n-bell';
  }

  function countBy(category){
    if(category==='all') return state.notifications.length;
    if(category==='unread') return state.notifications.filter(n=>!n.read).length;
    return state.notifications.filter(n=>normalizeCategory(n)===category).length;
  }

  function updateCounts(){
    $('#notificationCountAll').textContent = countBy('all');
    $('#notificationCountUnread').textContent = countBy('unread');
    $('#notificationCountAssignments').textContent = countBy('assignments');
    $('#notificationCountSchedule').textContent = countBy('schedule');
    $('#notificationCountSystem').textContent = countBy('system');
  }

  function withinDateRange(n){
    if(activeFilters.days==='all') return true;
    const d = notificationDate(n);
    if(!d) return true;
    const days = Number(activeFilters.days);
    const cutoff = new Date();
    cutoff.setHours(0,0,0,0);
    if(days===1) return d >= cutoff;
    cutoff.setDate(cutoff.getDate()-(days-1));
    return d >= cutoff;
  }

  function filteredNotifications(){
    return state.notifications.filter(n=>{
      const category = normalizeCategory(n);
      if(activeTab==='unread' && n.read) return false;
      if(!['all','unread'].includes(activeTab) && category!==activeTab) return false;
      if(activeFilters.type && category!==activeFilters.type) return false;
      if(activeFilters.priority && normalizePriority(n)!==activeFilters.priority) return false;
      if(!withinDateRange(n)) return false;
      return true;
    }).sort((a,b)=>{
      const ad = notificationDate(a)?.getTime() || 0;
      const bd = notificationDate(b)?.getTime() || 0;
      return bd-ad;
    });
  }

  function renderRows(){
    updateCounts();

    $$('.notification-tab').forEach(btn=>btn.classList.toggle('active',btn.dataset.notificationTab===activeTab));

    const items = filteredNotifications();
    const totalPages = Math.max(1,Math.ceil(items.length/pageSize));
    if(currentPage>totalPages) currentPage=totalPages;
    const start = (currentPage-1)*pageSize;
    const pageItems = items.slice(start,start+pageSize);

    const rows = $('#notificationRows');
    rows.innerHTML = pageItems.map(n=>{
      const category = normalizeCategory(n);
      const body = n.body || n.message || n.description || '';
      const detail = detailLine(n);
      return `<button class="notification-row ${n.read?'':'unread'}" type="button" data-notification-id="${esc(n.id)}">
        <span class="notification-icon ${esc(category)}"><svg><use href="#${iconFor(category)}"/></svg></span>
        <span class="notification-copy">
          <strong>${esc(n.title || 'Notification')}</strong>
          ${body ? `<p>${esc(body)}</p>` : ''}
          ${detail ? `<small>${esc(detail)}</small>` : ''}
        </span>
        <time class="notification-time">${esc(relativeTime(n))}</time>
        <svg class="notification-chevron"><use href="#n-chevron"/></svg>
      </button>`;
    }).join('');

    $('#notificationEmpty').hidden = pageItems.length > 0;

    const from = items.length ? start+1 : 0;
    const to = items.length ? Math.min(start+pageItems.length,items.length) : 0;
    $('#notificationShowingText').textContent = `Showing ${from} to ${to} of ${items.length} notifications`;

    $('#notificationPrevPage').disabled = currentPage<=1;
    $('#notificationNextPage').disabled = currentPage>=totalPages || items.length===0;
    $('#notificationPageNumbers').innerHTML = Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1)
      .map(page=>`<button class="${page===currentPage?'active':''}" type="button" data-notification-page="${page}">${page}</button>`).join('');
  }

  function renderSettings(){
    $$('[data-setting]').forEach(input=>{
      input.checked = !!state.settings[input.dataset.setting];
    });
  }

  function openNotification(id){
    const n = state.notifications.find(item=>String(item.id)===String(id));
    if(!n) return;
    if(!n.read){
      n.read=true;
      persist('notificationRead',{notificationId:n.id});
      renderRows();
    }
    const category = normalizeCategory(n);
    $('#dialogNotificationType').textContent = category.toUpperCase();
    $('#dialogNotificationTitle').textContent = n.title || 'Notification';
    $('#dialogNotificationMeta').textContent = [n.sender || n.from || '', relativeTime(n)].filter(Boolean).join(' · ');
    $('#dialogNotificationBody').textContent = n.body || n.message || n.description || '';
    const related = $('#dialogRelatedAction');
    related.hidden = !n.route;
    related.dataset.route = n.route || '';
    $('#notificationDialog').showModal();
  }

  function routeToRelated(route){
    const safe = String(route || '').replace(/^#/,'');
    if(!safe) return;
    if(safe==='notifications') return;
    location.href = `my-profile.html#${encodeURIComponent(safe)}`;
  }

  document.addEventListener('click',e=>{
    const tab = e.target.closest('[data-notification-tab]');
    if(tab){ activeTab=tab.dataset.notificationTab; currentPage=1; renderRows(); return; }

    const row = e.target.closest('[data-notification-id]');
    if(row){ openNotification(row.dataset.notificationId); return; }

    const page = e.target.closest('[data-notification-page]');
    if(page){ currentPage=Number(page.dataset.notificationPage)||1; renderRows(); return; }

    if(e.target.closest('#notificationPrevPage')){ currentPage=Math.max(1,currentPage-1); renderRows(); return; }
    if(e.target.closest('#notificationNextPage')){ currentPage+=1; renderRows(); return; }

    if(e.target.closest('#markAllReadBtn')){
      state.notifications.forEach(n=>n.read=true);
      persist('notificationsMarkedRead',{});
      renderRows();
      toast('Notifications marked as read.');
      return;
    }

    if(e.target.closest('#jumpToSettingsBtn')){
      $('#notificationSettingsCard').scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }

    if(e.target.closest('#applyNotificationFilters')){
      activeFilters = {
        type:$('#notificationTypeFilter').value,
        priority:$('#notificationPriorityFilter').value,
        days:$('#notificationDateFilter').value
      };
      currentPage=1;
      renderRows();
      toast('Filters applied.');
      return;
    }

    if(e.target.closest('#clearNotificationFilters')){
      $('#notificationTypeFilter').value='';
      $('#notificationPriorityFilter').value='';
      $('#notificationDateFilter').value='30';
      activeFilters={type:'',priority:'',days:'30'};
      currentPage=1;
      renderRows();
      toast('Filters cleared.');
      return;
    }

    if(e.target.closest('#manageNotificationPreferences')){
      location.href='my-profile.html#settings';
      return;
    }

    if(e.target.closest('#dialogRelatedAction')){
      routeToRelated($('#dialogRelatedAction').dataset.route);
    }
  });

  document.addEventListener('change',e=>{
    if(e.target.id==='notificationPageSize'){
      pageSize=Number(e.target.value)||25;
      currentPage=1;
      renderRows();
      return;
    }
    if(e.target.matches('[data-setting]')){
      state.settings[e.target.dataset.setting]=e.target.checked;
      persist('notificationSettingsUpdated',{settings:state.settings});
      toast('Notification preference saved.');
    }
  });

  window.addEventListener('storage',e=>{
    if(e.key!==SETTINGS_KEY) return;
    state.settings = loadSettings();
    renderSettings();
  });

  renderSettings();
  renderRows();
})();
