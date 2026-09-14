(() => {
  'use strict';

  const STORAGE_KEY = 'gotUNexRef.officialPortal.v3';
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => Array.from(r.querySelectorAll(s));
  const esc = v => String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const clone = v => JSON.parse(JSON.stringify(v));

  const BASE = {
    profile:{},
    assignments:[],
    messages:[],
    notifications:[],
    availability:{
      values:[
        ['unset','unset','unset','unset','unset','unset','unset'],
        ['unset','unset','unset','unset','unset','unset','unset'],
        ['unset','unset','unset','unset','unset','unset','unset']
      ],
      byDate:{},
      notesByDate:{},
      blocksByDate:{},
      reportRows:[],
      savedAt:''
    }
  };

  const REASONS = [
    {code:'officiating-other-game',label:'Officiating another game',description:'I will be officiating another game.',icon:'i-whistle'},
    {code:'family-commitment',label:'Family commitment',description:'A personal or family obligation.',icon:'i-family'},
    {code:'work-commitment',label:'Work commitment',description:'Work or business related obligation.',icon:'i-work'},
    {code:'school-class',label:'School / Class',description:'School, class or tutoring.',icon:'i-school'},
    {code:'medical-appointment',label:'Medical appointment',description:'Doctor, dentist or medical appointment.',icon:'i-medical'},
    {code:'vacation-travel',label:'Vacation / Travel',description:'Vacation, travel or out of town.',icon:'i-travel'},
    {code:'not-available-no-reason',label:'Not available – No reason provided',description:'I am not available.',icon:'i-ban'},
    {code:'other',label:'Other',description:'Other reason (you can add a note).',icon:'i-more'}
  ];

  function merge(a,b){
    if(!b || typeof b!=='object') return a;
    const out = Array.isArray(a) ? [...a] : {...a};
    for(const k of Object.keys(b)){
      if(b[k] && typeof b[k]==='object' && !Array.isArray(b[k]) && a[k] && typeof a[k]==='object' && !Array.isArray(a[k])) out[k]=merge(a[k],b[k]);
      else out[k]=b[k];
    }
    return out;
  }

  function load(){
    try{return merge(clone(BASE),JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')||{})}
    catch{return clone(BASE)}
  }

  let state = load();
  if(!state.availability.byDate) state.availability.byDate={};
  if(!state.availability.notesByDate) state.availability.notesByDate={};
  if(!state.availability.blocksByDate) state.availability.blocksByDate={};
  if(!Array.isArray(state.availability.reportRows)) state.availability.reportRows=[];

  let cursor = new Date();
  cursor.setDate(1);
  let view = 'month';
  let selectedDate = '';
  let selectedReason = '';
  let pendingOtherGameBlock = null;
  let quickMenuDate = '';
  let toastTimer = null;

  const today = new Date();
  today.setHours(0,0,0,0);

  const fmtISO = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const parseDate = v => {
    if(!v) return null;
    const raw = String(v).slice(0,10);
    const d = new Date(`${raw}T12:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  function toast(message){
    const el=$('#calendarToast');
    el.textContent=message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>el.classList.remove('show'),1900);
  }

  function normalizeStatus(status){
    const s=String(status||'').toLowerCase();
    if(s==='limited' || s==='partial' || s==='partially available') return 'partial';
    if(['available','unavailable','preferred','assigned'].includes(s)) return s;
    return 'unset';
  }

  function assignmentDate(a){return String(a.date||a.gameDate||a.dueDate||'').slice(0,10)}
  function assignmentStatus(a){return String(a.status||a.workflowStatus||'').toLowerCase()}

  function assignmentOnDate(iso){
    return (state.assignments||[]).some(a=>{
      const status=assignmentStatus(a);
      return assignmentDate(a)===iso && !['declined','cancelled','canceled'].includes(status);
    });
  }

  function blocksFor(iso){
    const value=state.availability.blocksByDate?.[iso];
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  function availabilityStatus(iso){
    if(assignmentOnDate(iso)) return 'assigned';
    const explicit=normalizeStatus(state.availability.byDate?.[iso]);
    if(explicit!=='unset') return explicit;
    const blocks=blocksFor(iso);
    if(blocks.length){
      const full=blocks.some(b=>b.fullDay || (b.startTime==='00:00' && b.endTime==='23:59'));
      return full ? 'unavailable' : 'partial';
    }
    return 'unset';
  }

  function statusLabel(status){
    return ({
      available:'Available',
      partial:'Partially Available',
      unavailable:'Unavailable',
      preferred:'Preferred',
      assigned:'Assigned'
    })[status] || '';
  }

  function reasonLabelForDate(iso){
    const block=blocksFor(iso)[0];
    if(!block) return state.availability.notesByDate?.[iso] || '';
    return block.reasonLabel || REASONS.find(r=>r.code===block.reason)?.label || block.note || '';
  }

  function monthCells(){
    const first=new Date(cursor.getFullYear(),cursor.getMonth(),1);
    const start=new Date(first);
    start.setDate(1-first.getDay());
    return Array.from({length:42},(_,i)=>{
      const d=new Date(start); d.setDate(start.getDate()+i); return d;
    });
  }

  function renderMonth(){
    let html='<div class="month-grid">';
    html += ['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d=>`<div class="weekday">${d}</div>`).join('');
    for(const d of monthCells()){
      const iso=fmtISO(d),outside=d.getMonth()!==cursor.getMonth(),status=availabilityStatus(iso);
      const note=reasonLabelForDate(iso);
      html += `<button type="button" class="day-cell ${outside?'outside':''} ${iso===fmtISO(today)?'today':''}" data-date="${iso}">
        <span class="day-number">${d.getDate()}</span>
        ${status!=='unset'?`<span class="day-status ${status}">${statusLabel(status)}</span>`:''}
        ${note && status!=='assigned'?`<small class="day-note">${esc(note)}</small>`:''}
      </button>`;
    }
    return html+'</div>';
  }

  function startOfWeek(d){
    const x=new Date(d); x.setDate(x.getDate()-x.getDay()); return x;
  }

  function renderWeek(){
    const start=startOfWeek(cursor);
    let html='<div class="week-board">';
    for(let i=0;i<7;i++){
      const d=new Date(start); d.setDate(start.getDate()+i);
      const iso=fmtISO(d),status=availabilityStatus(iso),note=reasonLabelForDate(iso);
      html+=`<section class="week-column">
        <header><strong>${d.toLocaleDateString('en-US',{weekday:'short'})}</strong><small>${d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</small></header>
        <button class="week-body day-cell" type="button" data-date="${iso}">
          ${status!=='unset'?`<span class="day-status ${status}">${statusLabel(status)}</span>`:'<span class="day-note">Select to update availability</span>'}
          ${note && status!=='assigned'?`<small class="day-note">${esc(note)}</small>`:''}
        </button>
      </section>`;
    }
    return html+'</div>';
  }

  function allVisibleAvailability(){
    const month=cursor.getMonth(),year=cursor.getFullYear();
    const dates=new Set();
    Object.keys(state.availability.byDate||{}).forEach(d=>dates.add(d));
    Object.keys(state.availability.blocksByDate||{}).forEach(d=>dates.add(d));
    (state.assignments||[]).forEach(a=>{const d=assignmentDate(a);if(d)dates.add(d)});
    return [...dates]
      .map(iso=>({iso,date:parseDate(iso),status:availabilityStatus(iso),note:reasonLabelForDate(iso)}))
      .filter(x=>x.date && x.date.getFullYear()===year && x.date.getMonth()===month)
      .sort((a,b)=>a.date-b.date);
  }

  function renderList(){
    const items=allVisibleAvailability();
    if(!items.length) return '<div class="list-board"><div class="day-note">No availability entries are set for this month.</div></div>';
    return `<div class="list-board">${items.map(x=>`<button type="button" class="list-item" data-date="${x.iso}">
      <time>${x.date.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</time>
      <div><strong>${statusLabel(x.status)||'Not Set'}</strong>${x.note?`<small>${esc(x.note)}</small>`:''}</div>
      ${x.status!=='unset'?`<span class="day-status ${x.status}">${statusLabel(x.status)}</span>`:''}
    </button>`).join('')}</div>`;
  }

  function renderBoard(){
    $('#calendarPeriodTitle').textContent=cursor.toLocaleDateString('en-US',{month:'long',year:'numeric'});
    $('#monthPicker').value=`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}`;
    $('#calendarBoard').innerHTML=view==='month'?renderMonth():view==='week'?renderWeek():renderList();
    $$('[data-calendar-view]').forEach(btn=>btn.classList.toggle('active',btn.dataset.calendarView===view));
  }

  function updateBadges(){
    const messageUnread=(state.messages||[]).filter(m=>!m.read&&m.direction!=='sent').length;
    const notificationUnread=(state.notifications||[]).filter(n=>!n.read).length;
    const mb=$('#messageBadge'),nb=$('#notificationBadge');
    if(mb){mb.textContent=messageUnread;mb.hidden=messageUnread===0}
    if(nb){nb.textContent=notificationUnread;nb.hidden=notificationUnread===0}
  }

  function updateSidebarActive(){
    const availabilityMode=location.hash==='#availability';
    $$('[data-calendar-sidebar]').forEach(a=>a.classList.toggle('active',a.dataset.calendarSidebar===(availabilityMode?'availability':'calendar')));
  }

  function renderReasons(){
    $('#reasonMenu').innerHTML=REASONS.map(r=>`<button class="reason-option ${selectedReason===r.code?'active':''}" type="button" data-reason="${r.code}">
      <svg><use href="#${r.icon}"/></svg><span><strong>${esc(r.label)}</strong><small>${esc(r.description)}</small></span>
    </button>`).join('');
  }

  function fillTimeOptions(){
    const options=[];
    for(let h=0;h<24;h++){
      for(const m of [0,30]){
        const value=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        const hour12=h%12||12,ampm=h<12?'AM':'PM';
        options.push(`<option value="${value}">${hour12}:${String(m).padStart(2,'0')} ${ampm}</option>`);
      }
    }
    options.push('<option value="23:59">11:59 PM</option>');
    $('#blockStartTime').innerHTML=options.join('');
    $('#blockEndTime').innerHTML='<option value="">No end time</option>'+options.join('');
  }

  function openReasonMenu(open=true){
    $('#reasonMenu').hidden=!open;
    $('#reasonTrigger').setAttribute('aria-expanded',String(open));
  }

  function selectReason(code){
    selectedReason=code;
    const r=REASONS.find(x=>x.code===code);
    $('#reasonTriggerText').textContent=r?r.label:'Select a reason...';
    $('#reasonTrigger').classList.toggle('selected',!!r);
    $('#otherNoteWrap').hidden=code!=='other';
    if(code!=='officiating-other-game') pendingOtherGameBlock=null;
    const saveButton=$('#saveBlockBtn');
    if(saveButton) saveButton.textContent='Block Date / Time';
    renderReasons();
    openReasonMenu(false);

    // Officiating another game is a required two-step workflow. Selecting the
    // reason immediately replaces the first window with the game-detail window.
    // The official should never remain on the reason dropdown and mistake it
    // for the second step.
    if(code==='officiating-other-game'){
      requestAnimationFrame(()=>prepareOtherGameWindow());
    }
  }

  function existingBlockForDate(iso){
    return blocksFor(iso)[0] || null;
  }

  function openBlockDialog(iso){
    selectedDate=iso || fmtISO(new Date());
    const block=existingBlockForDate(selectedDate);
    $('#blockDate').value=selectedDate;
    $('#blockStartTime').value=block?.startTime || '12:00';
    $('#blockEndTime').value=block?.endTime || '23:59';
    $('#blockNote').value=block?.note || '';
    selectedReason=block?.reason || '';
    pendingOtherGameBlock=block?.otherGameDetails ? {...block} : null;
    const reason=REASONS.find(r=>r.code===selectedReason);
    $('#reasonTriggerText').textContent=reason?reason.label:'Select a reason...';
    $('#reasonTrigger').classList.toggle('selected',!!reason);
    $('#otherNoteWrap').hidden=selectedReason!=='other';
    const saveButton=$('#saveBlockBtn');
    if(saveButton) saveButton.textContent=selectedReason==='officiating-other-game'?'Continue':'Block Date / Time';
    renderReasons();
    $('#blockDialog').showModal();
    if(selectedReason==='officiating-other-game'){
      setTimeout(()=>prepareOtherGameWindow(),40);
    }else{
      setTimeout(()=>openReasonMenu(!selectedReason),40);
    }
  }

  function closeBlockDialog(){
    openReasonMenu(false);
    $('#blockDialog').close();
  }

  function quickMenuAt(iso,button){
    quickMenuDate=iso;
    const menu=$('#availabilityQuickMenu');
    const d=parseDate(iso);
    $('#quickMenuDate').textContent=d?d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}):iso;
    const rect=button.getBoundingClientRect();
    const width=205;
    const left=Math.min(window.innerWidth-width-10,Math.max(10,rect.left+12));
    const top=Math.min(window.innerHeight-190,Math.max(10,rect.top+32));
    menu.style.left=`${left}px`; menu.style.top=`${top}px`;
    menu.hidden=false;
  }

  function closeQuickMenu(){$('#availabilityQuickMenu').hidden=true}

  function buildReportRows(){
    const dates=new Set([...Object.keys(state.availability.byDate||{}),...Object.keys(state.availability.blocksByDate||{})]);
    return [...dates].sort().map(date=>{
      const block=blocksFor(date)[0]||null;
      return {
        officialId:state.profile.officialId||'',
        date,
        status:availabilityStatus(date),
        startTime:block?.startTime||'',
        endTime:block?.endTime||'',
        reason:block?.reason||'',
        reasonLabel:block?.reasonLabel||'',
        reasonDescription:block?.reasonDescription||'',
        note:block?.note||state.availability.notesByDate?.[date]||'',
        otherGameDetails:block?.otherGameDetails||null,
        otherGameLevel:block?.otherGameDetails?.level||'',
        otherGameLocation:block?.otherGameDetails?.location||'',
        otherGameHomeTeam:block?.otherGameDetails?.homeTeam||'',
        otherGameAwayTeam:block?.otherGameDetails?.awayTeam||'',
        otherGameTime:block?.otherGameDetails?.gameTime||'',
        otherGameConference:block?.otherGameDetails?.conference||'',
        otherGameSupervisor:block?.otherGameDetails?.supervisorName||'',
        updatedAt:block?.updatedAt||state.availability.savedAt||''
      };
    });
  }

  function persistAvailability(action,date,status,extra={}){
    state.availability.savedAt=new Date().toISOString();
    state.availability.reportRows=buildReportRows();
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    const reportRow=state.availability.reportRows.find(r=>r.date===date)||null;
    const detail={
      action,
      officialId:state.profile.officialId||'',
      date,
      status,
      availability:state.availability,
      availabilityReport:state.availability.reportRows,
      reportRow,
      ...extra,
      timestamp:new Date().toISOString()
    };
    window.dispatchEvent(new CustomEvent('gotunexref:portal-action',{detail}));
    window.dispatchEvent(new CustomEvent('gotunexref:availability-report-updated',{detail}));
    if(window.GotUNexRefAdminAPI){
      if(typeof window.GotUNexRefAdminAPI.availabilityUpdated==='function'){
        Promise.resolve(window.GotUNexRefAdminAPI.availabilityUpdated({
          officialId:state.profile.officialId||'',
          availability:state.availability,
          availabilityReport:state.availability.reportRows,
          reportRow
        })).catch(console.error);
      }
      if(typeof window.GotUNexRefAdminAPI.availabilityCalendarUpdated==='function'){
        Promise.resolve(window.GotUNexRefAdminAPI.availabilityCalendarUpdated({
          officialId:state.profile.officialId||'',
          date,status,
          block:extra.block||null,
          reportRow
        })).catch(console.error);
      }
    }
  }

  function setSimpleAvailability(date,status){
    if(!date) return;
    if(status==='available' || status==='preferred'){
      state.availability.byDate[date]=status;
      delete state.availability.blocksByDate[date];
      delete state.availability.notesByDate[date];
    }else if(status==='clear'){
      delete state.availability.byDate[date];
      delete state.availability.blocksByDate[date];
      delete state.availability.notesByDate[date];
      status='unset';
    }
    persistAvailability('availabilityUpdated',date,status);
    renderAll();
    toast(status==='unset'?'Availability cleared.':`${statusLabel(status)} saved for the assigning report.`);
  }

  function formatTimeLabel(value){
    if(!value)return'Not provided';
    const [hRaw,mRaw]=String(value).split(':');
    const h=Number(hRaw),m=Number(mRaw||0);
    if(!Number.isFinite(h))return value;
    return `${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`;
  }

  function prepareOtherGameWindow(){
    const date=$('#blockDate').value;
    if(!date){toast('Choose a date to block.');return}
    const startTime=$('#blockStartTime').value||'';
    const endTime=$('#blockEndTime').value||'';
    const existing=existingBlockForDate(date);
    const existingDetails=existing?.otherGameDetails || pendingOtherGameBlock?.otherGameDetails || {};

    pendingOtherGameBlock={
      id:existing?.id || `block-${Date.now()}`,
      date,
      startTime,
      endTime,
      fullDay:startTime==='00:00' && endTime==='23:59',
      reason:'officiating-other-game',
      reasonLabel:'Officiating another game',
      reasonDescription:'I will be officiating another game.',
      note:'',
      updatedAt:new Date().toISOString(),
      otherGameDetails:{...existingDetails}
    };

    const d=parseDate(date);
    $('#otherGameDateDisplay').textContent=d?d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}):date;
    $('#otherGameBlockTimeDisplay').textContent=endTime
      ? `${formatTimeLabel(startTime)} – ${formatTimeLabel(endTime)}`
      : formatTimeLabel(startTime);

    $('#otherGameLevel').value=existingDetails.level||'';
    $('#otherGameTime').value=existingDetails.gameTime||startTime||'';
    $('#otherGameLocation').value=existingDetails.location||'';
    $('#otherGameHomeTeam').value=existingDetails.homeTeam||'';
    $('#otherGameAwayTeam').value=existingDetails.awayTeam||'';
    $('#otherGameConference').value=existingDetails.conference||'';
    $('#otherGameSupervisor').value=existingDetails.supervisorName||'';

    openReasonMenu(false);
    if($('#blockDialog').open) $('#blockDialog').close();
    const overlay=$('#otherGameOverlay');
    overlay.hidden=false;
    document.body.style.overflow='hidden';
    setTimeout(()=>$('#otherGameLevel').focus(),25);
  }

  function closeOtherGameDialog(returnToBlock=false){
    const overlay=$('#otherGameOverlay');
    overlay.hidden=true;
    document.body.style.overflow='';
    if(returnToBlock){
      $('#blockDialog').showModal();
      const saveButton=$('#saveBlockBtn');
      if(saveButton) saveButton.textContent='Continue';
      setTimeout(()=>openReasonMenu(false),25);
    }
  }

  function saveOtherGameDetails(event){
    event.preventDefault();
    if(!pendingOtherGameBlock){toast('Return to the availability form and choose a date.');return}

    const details={
      level:$('#otherGameLevel').value,
      location:$('#otherGameLocation').value.trim(),
      homeTeam:$('#otherGameHomeTeam').value.trim(),
      awayTeam:$('#otherGameAwayTeam').value.trim(),
      gameTime:$('#otherGameTime').value,
      conference:$('#otherGameConference').value.trim(),
      supervisorName:$('#otherGameSupervisor').value.trim()
    };

    if(Object.values(details).some(value=>!value)){
      toast('Complete all officiating-game details.');
      return;
    }

    const block={
      ...pendingOtherGameBlock,
      startTime:pendingOtherGameBlock.startTime || details.gameTime,
      otherGameDetails:details,
      note:`${details.level}: ${details.homeTeam} vs. ${details.awayTeam} — ${details.location}`,
      updatedAt:new Date().toISOString()
    };

    const date=block.date;
    const fullDay=block.fullDay;
    const status=fullDay?'unavailable':'partial';

    state.availability.blocksByDate[date]=[block];
    state.availability.byDate[date]=status;
    state.availability.notesByDate[date]=`Officiating another game — ${details.level}: ${details.homeTeam} vs. ${details.awayTeam}`;
    pendingOtherGameBlock=null;

    persistAvailability('availabilityBlocked',date,status,{block,otherGameDetails:details});
    cursor=parseDate(date)||cursor;
    cursor.setDate(1);

    closeOtherGameDialog(false);
    renderAll();
    toast('Officiating conflict saved with game details for the assigning report.');
  }

  function saveBlock(event){
    event.preventDefault();
    const date=$('#blockDate').value;
    if(!date){toast('Choose a date to block.');return}
    if(!selectedReason){openReasonMenu(true);toast('Select a block reason.');return}
    if(selectedReason==='officiating-other-game'){
      prepareOtherGameWindow();
      return;
    }
    const startTime=$('#blockStartTime').value||'00:00';
    const endTime=$('#blockEndTime').value||'23:59';
    const reason=REASONS.find(r=>r.code===selectedReason);
    const note=$('#blockNote').value.trim();
    const fullDay=startTime==='00:00' && endTime==='23:59';
    const block={
      id:`block-${Date.now()}`,
      date,startTime,endTime,
      fullDay,
      reason:selectedReason,
      reasonLabel:reason?.label||selectedReason,
      reasonDescription:reason?.description||'',
      note,
      updatedAt:new Date().toISOString()
    };

    state.availability.blocksByDate[date]=[block];
    state.availability.byDate[date]=fullDay?'unavailable':'partial';
    if(note) state.availability.notesByDate[date]=note;
    else if(reason?.label) state.availability.notesByDate[date]=reason.label;

    const status=fullDay?'unavailable':'partial';
    persistAvailability('availabilityBlocked',date,status,{block});
    cursor=parseDate(date)||cursor; cursor.setDate(1);
    closeBlockDialog();
    renderAll();
    toast(`${statusLabel(status)} saved with reason for the assigning report.`);
  }

  async function syncCalendar(){
    toast('Requesting latest availability and assignments…');
    if(window.GotUNexRefAdminAPI && typeof window.GotUNexRefAdminAPI.getOfficialPortalData==='function'){
      try{
        const result=await window.GotUNexRefAdminAPI.getOfficialPortalData({officialId:state.profile.officialId||''});
        if(result?.data){
          state=merge(state,result.data);
          if(!state.availability.byDate) state.availability.byDate={};
          if(!state.availability.blocksByDate) state.availability.blocksByDate={};
          if(!state.availability.notesByDate) state.availability.notesByDate={};
          state.availability.reportRows=buildReportRows();
          localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
          renderAll();
          toast('Availability calendar synchronized.');
          return;
        }
      }catch(err){console.error(err)}
    }
    window.dispatchEvent(new CustomEvent('gotunexref:calendar-sync-request',{detail:{officialId:state.profile.officialId||'',timestamp:new Date().toISOString()}}));
    toast('Calendar sync request sent.');
  }

  function renderAll(){
    renderBoard();
    updateBadges();
    updateSidebarActive();
  }

  fillTimeOptions();
  renderReasons();

  document.addEventListener('click',event=>{
    const viewBtn=event.target.closest('[data-calendar-view]');
    if(viewBtn){view=viewBtn.dataset.calendarView;renderBoard();return}

    const dateBtn=event.target.closest('[data-date]');
    if(dateBtn && !event.target.closest('.quick-menu')){
      quickMenuAt(dateBtn.dataset.date,dateBtn);
      return;
    }

    const quick=event.target.closest('[data-quick-action]');
    if(quick){
      const action=quick.dataset.quickAction;
      const date=quickMenuDate;
      closeQuickMenu();
      if(action==='available' || action==='preferred') setSimpleAvailability(date,action);
      else if(action==='block') openBlockDialog(date);
      else if(action==='clear') setSimpleAvailability(date,'clear');
      return;
    }

    const reasonBtn=event.target.closest('[data-reason]');
    if(reasonBtn){selectReason(reasonBtn.dataset.reason);return}

    if(!event.target.closest('#availabilityQuickMenu')) closeQuickMenu();
  });

  $('#calendarPrev').addEventListener('click',()=>{cursor.setMonth(cursor.getMonth()-1);renderAll()});
  $('#calendarToday').addEventListener('click',()=>{cursor=new Date();cursor.setDate(1);renderAll()});
  $('#monthTitleBtn').addEventListener('click',()=>{$('#monthPicker').showPicker?.();});
  $('#monthPicker').addEventListener('change',event=>{
    if(!event.target.value)return;
    const [y,m]=event.target.value.split('-').map(Number);
    cursor=new Date(y,m-1,1);renderAll();
  });

  $('#blockDateBtn').addEventListener('click',()=>openBlockDialog(fmtISO(new Date())));
  $('#reasonTrigger').addEventListener('click',()=>openReasonMenu($('#reasonMenu').hidden));
  $('#closeBlockDialog').addEventListener('click',closeBlockDialog);
  $('#cancelBlockBtn').addEventListener('click',closeBlockDialog);
  $('#blockAvailabilityForm').addEventListener('submit',saveBlock);
  $('#otherGameForm').addEventListener('submit',saveOtherGameDetails);
  $('#closeOtherGameDialog').addEventListener('click',()=>closeOtherGameDialog(true));
  $('#backToBlockDialog').addEventListener('click',()=>closeOtherGameDialog(true));
  $('#otherGameOverlay').addEventListener('click',event=>{ if(event.target.id==='otherGameOverlay') closeOtherGameDialog(true); });
  document.addEventListener('keydown',event=>{ if(event.key==='Escape' && !$('#otherGameOverlay').hidden){ event.preventDefault(); closeOtherGameDialog(true); } });
  $('#syncCalendarBtn').addEventListener('click',syncCalendar);
  $('#printCalendarBtn').addEventListener('click',()=>window.print());

  window.addEventListener('hashchange',updateSidebarActive);
  window.addEventListener('storage',event=>{if(event.key!==STORAGE_KEY)return;state=load();renderAll()});
  window.addEventListener('gotunexref:admin-sync',event=>{
    if(!event.detail)return;
    state=merge(state,event.detail);
    if(!state.availability.byDate)state.availability.byDate={};
    if(!state.availability.blocksByDate)state.availability.blocksByDate={};
    if(!state.availability.notesByDate)state.availability.notesByDate={};
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    renderAll();
    toast('Calendar updated from the admin system.');
  });

  renderAll();

  const launchParams=new URLSearchParams(location.search);
  if(launchParams.get('block')==='1'){
    setTimeout(()=>{
      openBlockDialog(launchParams.get('date')||fmtISO(new Date()));
      if(launchParams.get('reason')==='officiating-other-game'){
        setTimeout(()=>selectReason('officiating-other-game'),90);
      }
    },80);
  }
})();