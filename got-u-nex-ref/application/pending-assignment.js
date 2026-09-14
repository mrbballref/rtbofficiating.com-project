import { supabase, getSession } from '../../assets/auth.js';

const session = await getSession();
if (!session) { window.location.href = '/account/index.html?view=signin'; }
else (async () => {
  'use strict';

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  const DECLINE_REASONS=[
    {code:'scheduling-conflict',label:'Scheduling Conflict',description:'I have another commitment at this time.',icon:'i-schedule-conflict'},
    {code:'personal-commitment',label:'Personal Commitment',description:'A personal or family obligation.',icon:'i-personal'},
    {code:'work-commitment',label:'Work Commitment',description:'Work or business related obligation.',icon:'i-work'},
    {code:'medical-reason',label:'Medical Reason',description:'Medical appointment or health related.',icon:'i-medical'},
    {code:'school-class',label:'School / Class',description:'School, class or tutoring commitment.',icon:'i-school'},
    {code:'travel',label:'Travel',description:'Out of town travel or vacation.',icon:'i-travel'},
    {code:'not-enough-notice',label:'Not Enough Notice',description:'Not enough time to prepare.',icon:'i-notice'},
    {code:'pay-distance',label:'Pay / Distance',description:'Pay or distance is not acceptable.',icon:'i-money'},
    {code:'other',label:'Other',description:'Other reason (you can add a note).',icon:'i-more'}
  ];

  // "id" is the assignment_officials_id — the row identifying THIS official's
  // slot on a crew, which is also what official_respond_to_assignment expects.
  const id=new URLSearchParams(location.search).get('id')||sessionStorage.getItem('gotUNexRef.selectedAssignmentId')||'';
  let assignment=null;
  const { data: notifData } = id ? await supabase.rpc('list_my_gunr_notifications') : { data: [] };
  const { data: messageData } = id ? await supabase.rpc('list_my_gunr_messages') : { data: [] };
  const state = { messages: messageData || [], notifications: notifData || [], profile: {} };

  if (id) {
    const { data: detail, error } = await supabase.rpc('official_get_assignment_detail', { target_assignment_officials_id: id });
    if (!error && detail) {
      assignment = {
        id: detail.assignment_officials_id,
        gameId: detail.id,
        status: detail.my_status === 'assigned' ? 'pending' : detail.my_status,
        workflowStatus: detail.my_status === 'assigned' ? 'pending' : detail.my_status,
        date: detail.game_date,
        time: detail.game_time,
        homeSchool: detail.home_team_name || '',
        homeTeam: detail.home_team_name || '',
        awaySchool: detail.visiting_team_name || '',
        awayTeam: detail.visiting_team_name || '',
        venue: detail.venue_name || '',
        address: detail.venue_address || '',
        venuePhone: detail.venue_phone || '',
        pay: typeof detail.my_pay_cents === 'number' ? detail.my_pay_cents / 100 : undefined,
        notes: detail.notes || '',
        crew: (detail.crew || []).map(c => ({ name: c.name, position: c.position, id: c.official_id })),
      };
    }
  }
  let selectedReason='';
  let toastTimer=null;

  const dateValue=a=>String(a?.date||a?.gameDate||a?.dueDate||'').slice(0,10);
  const timeValue=a=>a?.time||a?.gameTime||a?.dueTime||'';
  const statusValue=a=>String(a?.status||a?.workflowStatus||'').toLowerCase();
  const teams=a=>{
    const home=a?.homeTeam||a?.homeSchool||a?.teamHome||'';
    const away=a?.awayTeam||a?.awaySchool||a?.teamAway||'';
    if(home||away)return{home,away};
    const m=String(a?.matchup||a?.title||'').match(/^(.*?)\s+(?:vs\.?|versus)\s+(.*?)$/i);
    return m?{home:m[1].trim(),away:m[2].trim()}:{home:'',away:''};
  };

  function initials(name){return String(name||'').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'—'}
  function dateText(v){if(!v)return'Not provided';const d=new Date(`${v}T12:00:00`);return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}
  function mark(el,name,url){if(url){el.innerHTML=`<img src="${esc(url)}" alt="${esc(name||'Team')} logo">`;return}el.innerHTML=`<b>${esc(initials(name))}</b>`}
  function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1900)}
  function goBack(){location.href='my-profile.html#assignments'}
  function activeCrew(a){const raw=Array.isArray(a?.crew)?a.crew:Array.isArray(a?.officials)?a.officials:[];return raw}
  function crewSize(a){
    const members=activeCrew(a);
    const active=members.filter(m=>!String(m.position||m.role||'').toLowerCase().includes('alternate')).length;
    return Number(a?.crewCount??a?.officialsCount??active)||0;
  }

  function renderCrew(){
    const crew=activeCrew(assignment);
    const profileId=String(state.profile?.officialId||'');
    const userId=String(state.profile?.id||'');
    const userName=`${state.profile?.firstName||''} ${state.profile?.lastName||''}`.trim().toLowerCase();
    $('#crewList').innerHTML=crew.length?crew.map((o,i)=>{
      const photo=o.photo||o.photoUrl||o.image||'';
      const name=o.name||'Official not provided';
      const isMe=(profileId&&String(o.officialId||o.id||'')===profileId)||(userId&&String(o.userId||o.id||'')===userId)||(userName&&name.toLowerCase()===userName);
      const role=o.position||o.role||(i===0?'Referee':`Umpire ${i}`);
      return `<div class="crew-row ${isMe?'me':''}">
        <div class="crew-photo">${photo?`<img src="${esc(photo)}" alt="${esc(name)}">`:'<svg><use href="#i-user"/></svg>'}</div>
        <div><span>${esc(role)}${isMe?' (You)':''}</span><strong>${esc(name)}</strong></div>
      </div>`;
    }).join(''):'<div class="crew-row"><div class="crew-photo"><svg><use href="#i-user"/></svg></div><div><span>Crew</span><strong>Crew details not provided</strong></div></div>';
  }

  function render(){
    if(!assignment||statusValue(assignment)!=='pending'){
      $('#emptyState').hidden=false;
      return;
    }
    const t=teams(assignment),date=dateValue(assignment),time=timeValue(assignment);
    $('#assignmentStatus').textContent='PENDING';
    $('#gameId').textContent=`Game ID: ${assignment.gameId||assignment.id||'Not provided'}`;
    $('#gameDate').textContent=dateText(date);
    $('#gameTime').textContent=time||'Not provided';
    $('#homeSchool').textContent=assignment.homeSchool||t.home||'Home school not provided';
    $('#homeTeam').textContent=assignment.homeMascot||assignment.homeNickname||t.home||'Home team not provided';
    $('#awaySchool').textContent=assignment.awaySchool||t.away||'Visiting school not provided';
    $('#awayTeam').textContent=assignment.awayMascot||assignment.awayNickname||t.away||'Visiting team not provided';
    mark($('#homeMark'),t.home,assignment.homeLogo||assignment.homeTeamLogo);
    mark($('#awayMark'),t.away,assignment.awayLogo||assignment.awayTeamLogo);
    $('#gameVenue').textContent=assignment.venue||assignment.location||assignment.siteName||'Location not provided';
    $('#gameAddress').textContent=assignment.address||assignment.venueAddress||assignment.siteAddress||'';
    $('#venuePhone').textContent=assignment.venuePhone||assignment.sitePhone||'Phone not provided';
    const pay=assignment.pay??assignment.gamePay??assignment.fee;
    $('#gamePay').textContent=pay!==undefined&&pay!==null&&pay!==''?(typeof pay==='number'?`$${pay.toFixed(2)}`:String(pay)):'Not provided';
    const count=crewSize(assignment);
    $('#crewLabel').textContent=count?`${count}-Man Crew`:'Crew size not provided';
    $('#assignmentNotes').textContent=assignment.notes||assignment.adminNote||assignment.assignmentNotes||'No notes for this assignment.';
    renderCrew();
    updateBadges();
  }

  function updateBadges(){
    const messages=(state.messages||[]).filter(m=>!m.read&&m.direction!=='sent').length;
    const notifications=(state.notifications||[]).filter(n=>!n.read).length;
    const mb=$('#messageBadge'),nb=$('#notificationBadge');
    if(mb){mb.textContent=messages;mb.hidden=messages===0}
    if(nb){nb.textContent=notifications;nb.hidden=notifications===0}
  }

  function renderReasons(){
    $('#reasonMenu').innerHTML=DECLINE_REASONS.map(r=>`<button class="reason-option ${selectedReason===r.code?'active':''}" type="button" data-decline-reason="${r.code}">
      <svg><use href="#${r.icon}"/></svg>
      <span><strong>${esc(r.label)}</strong><small>${esc(r.description)}</small></span>
    </button>`).join('');
  }

  function openReasonMenu(open=true){
    $('#reasonMenu').hidden=!open;
    $('#reasonTrigger').setAttribute('aria-expanded',String(open));
  }

  function selectReason(code){
    selectedReason=code;
    const r=DECLINE_REASONS.find(x=>x.code===code);
    $('#reasonTriggerText').textContent=r?r.label:'Select a reason...';
    $('#reasonTrigger').classList.toggle('selected',!!r);
    renderReasons();
    openReasonMenu(false);
  }

  function openDecline(){
    if(!assignment)return;
    selectedReason='';
    $('#declineNote').value='';
    $('#noteCount').textContent='0';
    $('#reasonTriggerText').textContent='Select a reason...';
    $('#reasonTrigger').classList.remove('selected');
    renderReasons();
    $('#declineDialog').showModal();
    setTimeout(()=>openReasonMenu(true),40);
  }

  function closeDecline(){openReasonMenu(false);$('#declineDialog').close()}

  async function acceptAssignment(){
    if(!assignment)return;
    const { error } = await supabase.rpc('official_respond_to_assignment', {
      target_assignment_official_id: assignment.id, response: 'accepted',
    });
    if (error) { toast(`Could not accept: ${error.message}`); return; }
    assignment.status='accepted';
    assignment.workflowStatus='accepted';
    toast('Assignment accepted.');
    setTimeout(goBack,550);
  }

  async function declineAssignment(event){
    event.preventDefault();
    if(!assignment)return;
    if(!selectedReason){openReasonMenu(true);toast('Select a decline reason.');return}
    const reason=DECLINE_REASONS.find(r=>r.code===selectedReason);
    const note=$('#declineNote').value.trim();
    if(selectedReason==='other'&&!note){toast('Add a note when selecting Other.');$('#declineNote').focus();return}

    const { error } = await supabase.rpc('official_respond_to_assignment', {
      target_assignment_official_id: assignment.id, response: 'declined',
      p_decline_reason: reason.code, p_decline_note: note,
    });
    if (error) { toast(`Could not decline: ${error.message}`); return; }

    assignment.status='declined';
    assignment.workflowStatus='declined';

    closeDecline();
    toast('Assignment declined and availability report updated.');
    setTimeout(goBack,650);
  }

  function openCalendar(){
    const date=dateValue(assignment);
    location.href=date?`calendar.html?date=${encodeURIComponent(date)}`:'calendar.html';
  }

  $('#backBtn').addEventListener('click',goBack);
  $('#emptyBackBtn').addEventListener('click',goBack);
  $('#calendarBtn').addEventListener('click',openCalendar);
  $('#acceptBtn').addEventListener('click',acceptAssignment);
  $('#reasonTrigger').addEventListener('click',()=>openReasonMenu($('#reasonMenu').hidden));
  $('#closeDeclineDialog').addEventListener('click',closeDecline);
  $('#cancelDeclineBtn').addEventListener('click',closeDecline);
  $('#declineForm').addEventListener('submit',declineAssignment);
  $('#declineNote').addEventListener('input',e=>$('#noteCount').textContent=String(e.target.value.length));

  document.addEventListener('click',e=>{
    const reason=e.target.closest('[data-decline-reason]');
    if(reason){selectReason(reason.dataset.declineReason);return}
    if(!e.target.closest('.reason-menu')&&!e.target.closest('#reasonTrigger')&&!$('#declineDialog').open)return;
  });

  // Clicking the pending status in the heading or pressing D provides the decline action.
  $('#assignmentStatus').addEventListener('click',openDecline);
  document.addEventListener('keydown',e=>{
    if((e.key==='d'||e.key==='D')&&!$('#declineDialog').open&&assignment){openDecline()}
    if(e.key==='Escape'&&$('#declineDialog').open){closeDecline()}
  });

  // Add an explicit Decline button next to Accept while preserving the reference structure.
  const declineHeader=document.createElement('button');
  declineHeader.type='button';
  declineHeader.className='outline-btn';
  declineHeader.innerHTML='<svg><use href="#i-close"/></svg><span>Decline Assignment</span>';
  declineHeader.addEventListener('click',openDecline);
  $('#acceptBtn').before(declineHeader);

  renderReasons();
  render();
})();