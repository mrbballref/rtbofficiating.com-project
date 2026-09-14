(() => {
  'use strict';

  const STORAGE_KEY = 'jub-catalog-v1';
  const AUDIO_KEY = 'jub-audio-state-v1';
  const TYPES = ['shows','episodes','articles','live','films','clips','guests','hosts','events','topics'];
  const emptyCatalog = () => Object.fromEntries(TYPES.map(type => [type, []]));

  function readCatalog(){
    try{
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if(!stored) return emptyCatalog();
      return {...emptyCatalog(), ...stored};
    }catch(_){ return emptyCatalog(); }
  }

  function writeCatalog(catalog){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
    window.dispatchEvent(new CustomEvent('jub:catalog-change', {detail: catalog}));
  }

  function escapeHTML(value=''){
    return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function slugify(value=''){
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  }

  function published(items){
    return items.filter(item => (item.status || 'draft') === 'published');
  }

  function itemMeta(item){
    return [item.sport,item.level,item.governingBody,item.publishedAt].filter(Boolean).map(escapeHTML).join(' · ');
  }

  function platformPrefix(){ return document.body.dataset.platformDepth === '1' ? '../' : ''; }

  function cardHTML(item, type){
    const media = item.imageUrl
      ? `<img src="${escapeHTML(item.imageUrl)}" alt="">`
      : `<span class="muted">${escapeHTML(type.slice(0,-1) || type)}</span>`;
    const audioButton = item.audioUrl ? `<button class="btn btn--small js-audio-play" data-audio-src="${escapeHTML(item.audioUrl)}" data-audio-title="${escapeHTML(item.title)}" data-audio-subtitle="${escapeHTML(item.show || 'The Jammed Up Bar!')}">Listen</button>` : '';
    const videoLink = item.videoUrl ? `<a class="btn btn--small" href="${platformPrefix()}player/index.html?src=${encodeURIComponent(item.videoUrl)}&title=${encodeURIComponent(item.title || '')}">Watch</a>` : '';
    const external = item.url ? `<a class="btn btn--small" href="${escapeHTML(item.url)}">Open</a>` : '';
    return `<article class="content-card">
      <div class="content-card__media">${media}</div>
      <div class="content-card__body">
        <div class="content-card__meta">${itemMeta(item)}</div>
        <h3>${escapeHTML(item.title || 'Untitled')}</h3>
        <p>${escapeHTML(item.summary || '')}</p>
        <div class="content-card__actions">${audioButton}${videoLink}${external}</div>
      </div>
    </article>`;
  }

  function emptyHTML(type){
    const labels = {
      episodes:'No episodes have been published yet.', shows:'No shows have been published yet.', articles:'No newsroom stories have been published yet.', live:'No broadcast is live right now.', films:'No films have been published yet.', clips:'No clips have been published yet.', guests:'No guest profiles have been published yet.', hosts:'No host profiles have been published yet.', events:'No events have been published yet.', topics:'No topics have been published yet.'
    };
    return `<div class="empty-card"><strong>${labels[type] || 'No content has been published yet.'}</strong><p>The platform is intentionally showing an empty state instead of fabricated content. Authorized editors can add real material in the CMS.</p></div>`;
  }

  function renderGrids(){
    const catalog = readCatalog();
    document.querySelectorAll('[data-content-grid]').forEach(grid => {
      const type = grid.dataset.contentGrid;
      let items = published(catalog[type] || []);
      const limit = Number(grid.dataset.limit || 0);
      if(limit) items = items.slice(0, limit);
      grid.innerHTML = items.length ? items.map(item => cardHTML(item,type)).join('') : emptyHTML(type);
    });

    document.querySelectorAll('[data-live-status]').forEach(box => {
      const active = published(catalog.live || []).find(item => item.broadcastStatus === 'live');
      const orb = box.querySelector('.live-orb');
      const title = box.querySelector('[data-live-title]');
      const text = box.querySelector('[data-live-copy]');
      const action = box.querySelector('[data-live-action]');
      if(active){
        orb?.classList.add('is-live');
        if(title) title.textContent = active.title || 'Live now';
        if(text) text.textContent = active.summary || 'The Jammed Up Bar! is live.';
        if(action){ action.textContent = 'Watch Live'; action.href = active.videoUrl ? `${platformPrefix()}player/index.html?src=${encodeURIComponent(active.videoUrl)}&title=${encodeURIComponent(active.title || '')}` : `${platformPrefix()}live/`; }
      }else{
        orb?.classList.remove('is-live');
        if(title) title.textContent = 'The network is currently offline.';
        if(text) text.textContent = 'A live indicator will appear here only when an authorized broadcast is published as live.';
        if(action){ action.textContent = 'View Schedule'; action.href = 'index.html'; }
      }
    });
  }

  // Generic filtering for listing pages.
  function initFilters(){
    document.querySelectorAll('[data-filter-scope]').forEach(scope => {
      const type = scope.dataset.filterScope;
      const search = scope.querySelector('[data-filter-search]');
      const sport = scope.querySelector('[data-filter-sport]');
      const status = scope.querySelector('[data-filter-status]');
      const grid = scope.querySelector('[data-filter-grid]');
      if(!grid) return;
      const rerender = () => {
        const catalog = readCatalog();
        let items = published(catalog[type] || []);
        const q = (search?.value || '').trim().toLowerCase();
        if(q) items = items.filter(item => JSON.stringify(item).toLowerCase().includes(q));
        if(sport?.value) items = items.filter(item => item.sport === sport.value);
        if(status?.value) items = items.filter(item => item.broadcastStatus === status.value);
        grid.innerHTML = items.length ? items.map(item => cardHTML(item,type)).join('') : emptyHTML(type);
      };
      [search,sport,status].filter(Boolean).forEach(el => el.addEventListener('input',rerender));
      rerender();
    });
  }

  // Search across real CMS records only.
  function initSearch(){
    const form = document.querySelector('[data-search-form]');
    const input = document.querySelector('[data-search-input]');
    const results = document.querySelector('[data-search-results]');
    const summary = document.querySelector('[data-search-summary]');
    if(!form || !input || !results) return;
    const execute = () => {
      const q = input.value.trim().toLowerCase();
      if(!q){ results.innerHTML = emptyHTML('search'); if(summary) summary.textContent = 'Search published episodes, shows, guests, topics, articles, clips, films and events.'; return; }
      const catalog = readCatalog();
      const matches = [];
      TYPES.forEach(type => published(catalog[type] || []).forEach(item => {
        if(JSON.stringify(item).toLowerCase().includes(q)) matches.push({...item,_type:type});
      }));
      if(summary) summary.textContent = `${matches.length} published result${matches.length === 1 ? '' : 's'} for “${input.value.trim()}”.`;
      results.innerHTML = matches.length ? matches.map(item => cardHTML(item,item._type)).join('') : `<div class="empty-card"><strong>No search results.</strong><p>No published content matched “${escapeHTML(input.value.trim())}”.</p></div>`;
    };
    form.addEventListener('submit', e => {e.preventDefault(); execute();});
    input.addEventListener('input', execute);
  }

  // Persistent audio state. Playback position is restored after page navigation; browsers may require a fresh play gesture.
  const audioBar = document.querySelector('[data-audio-bar]');
  const audio = audioBar?.querySelector('audio');
  const audioTitle = audioBar?.querySelector('[data-audio-title]');
  const audioSubtitle = audioBar?.querySelector('[data-audio-subtitle]');

  function saveAudioState(){
    if(!audio || !audio.src) return;
    const state = {src:audio.src,title:audioTitle?.textContent || '',subtitle:audioSubtitle?.textContent || '',time:audio.currentTime || 0};
    sessionStorage.setItem(AUDIO_KEY, JSON.stringify(state));
  }
  function loadAudio(src,title,subtitle,time=0){
    if(!audioBar || !audio) return;
    audioBar.classList.add('is-active');
    audio.src = src;
    if(audioTitle) audioTitle.textContent = title || 'Audio';
    if(audioSubtitle) audioSubtitle.textContent = subtitle || 'The Jammed Up Bar!';
    audio.addEventListener('loadedmetadata', () => { if(Number.isFinite(time) && time > 0 && time < audio.duration) audio.currentTime = time; }, {once:true});
  }
  document.addEventListener('click', e => {
    const btn = e.target.closest('.js-audio-play');
    if(!btn) return;
    e.preventDefault();
    loadAudio(btn.dataset.audioSrc, btn.dataset.audioTitle, btn.dataset.audioSubtitle);
    audio?.play().catch(()=>{});
  });
  audio?.addEventListener('timeupdate', saveAudioState);
  window.addEventListener('beforeunload', saveAudioState);
  try{
    const state = JSON.parse(sessionStorage.getItem(AUDIO_KEY) || 'null');
    if(state?.src) loadAudio(state.src,state.title,state.subtitle,state.time);
  }catch(_){ }

  // CMS — functional local CRUD for frontend staging. Production schema is included separately for Supabase.
  function initCMS(){
    const app = document.querySelector('[data-cms]');
    if(!app) return;
    const tabs = [...app.querySelectorAll('[data-cms-type]')];
    const form = app.querySelector('[data-cms-form]');
    const list = app.querySelector('[data-cms-list]');
    const heading = app.querySelector('[data-cms-heading]');
    const idInput = form.querySelector('[name="id"]');
    let activeType = 'episodes';

    function clearForm(){ form.reset(); idInput.value=''; form.querySelector('[name="status"]').value='draft'; form.querySelector('[name="broadcastStatus"]').value='offline'; }
    function renderList(){
      const catalog = readCatalog();
      const items = catalog[activeType] || [];
      list.innerHTML = items.length ? items.map(item => `<article class="cms-record" data-id="${escapeHTML(item.id)}"><div><h3>${escapeHTML(item.title || 'Untitled')}</h3><p>${escapeHTML(item.status || 'draft')} · ${escapeHTML(item.slug || '')}</p></div><div class="cms-record__actions"><button class="btn btn--small" type="button" data-edit>Edit</button><button class="btn btn--small btn--ghost" type="button" data-delete>Delete</button></div></article>`).join('') : `<div class="empty-card"><strong>No ${escapeHTML(activeType)} records.</strong><p>Create the first real record using the form above. No sample data has been inserted.</p></div>`;
    }
    function setType(type){
      activeType = type;
      tabs.forEach(tab => tab.setAttribute('aria-selected', String(tab.dataset.cmsType === type)));
      if(heading) heading.textContent = type.charAt(0).toUpperCase()+type.slice(1);
      clearForm(); renderList();
    }
    tabs.forEach(tab => tab.addEventListener('click',()=>setType(tab.dataset.cmsType)));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if(!data.title.trim()) return;
      const catalog = readCatalog();
      const items = catalog[activeType] || [];
      const record = {...data, id:data.id || (crypto.randomUUID ? crypto.randomUUID() : `jub-${Date.now()}`), slug:data.slug.trim() || slugify(data.title), updatedAt:new Date().toISOString()};
      const idx = items.findIndex(item => item.id === record.id);
      if(idx >= 0) items[idx] = {...items[idx],...record}; else items.unshift(record);
      catalog[activeType]=items; writeCatalog(catalog); clearForm(); renderList();
    });
    list.addEventListener('click', e => {
      const recordEl = e.target.closest('.cms-record'); if(!recordEl) return;
      const catalog = readCatalog(); const items = catalog[activeType] || []; const record = items.find(item => item.id === recordEl.dataset.id); if(!record) return;
      if(e.target.closest('[data-delete]')){
        if(confirm(`Delete “${record.title || 'this record'}”?`)){ catalog[activeType] = items.filter(item => item.id !== record.id); writeCatalog(catalog); renderList(); }
      }
      if(e.target.closest('[data-edit]')){
        Object.entries(record).forEach(([key,value]) => { const field=form.elements.namedItem(key); if(field) field.value=value ?? ''; });
        form.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
    app.querySelector('[data-cms-export]')?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(readCatalog(),null,2)], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='jammed-up-bar-content.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500);
    });
    const importInput = app.querySelector('[data-cms-import]');
    importInput?.addEventListener('change', async () => {
      const file=importInput.files?.[0]; if(!file) return;
      try{ const parsed=JSON.parse(await file.text()); writeCatalog({...emptyCatalog(),...parsed}); renderList(); alert('Content imported.'); }catch(_){ alert('That JSON file could not be imported.'); }
      importInput.value='';
    });
    app.querySelector('[data-cms-clear]')?.addEventListener('click', () => { if(confirm('Clear all locally stored CMS records from this browser?')){ localStorage.removeItem(STORAGE_KEY); clearForm(); renderList(); } });
    setType(activeType);
  }

  renderGrids(); initFilters(); initSearch(); initCMS();
  window.addEventListener('jub:catalog-change', () => {renderGrids(); initFilters();});
})();


// Frontend-only form persistence for page prototypes. No network request is made.
document.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-local-form]');
  if (!form) return;
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form).entries());
  const key = `jub:form:${form.dataset.localForm}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.push({ ...data, savedAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(existing));
  const status = form.querySelector('.form-status');
  if (status) status.textContent = 'Saved in this browser.';
});
