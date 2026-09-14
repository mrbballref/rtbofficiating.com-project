import { supabase, requireRole } from '../../assets/auth.js';

(async () => {
'use strict';

const session = await requireRole(['site_admin']);
if (!session) return;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let rawGames=[];
let officials=[];
let interestCache={}; // tba_game_id -> [{official_id,name,email}]
let state={page:1,perPage:10,tab:'all',search:'',sport:'',level:'',status:'',audience:'',crew:'',wish:'',menuGameId:'',activeGameId:null};
let toastTimer;

function toast(msg){const el=$('#toast'); if(!el) return; el.textContent=msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2200)}
function formatDate(date){if(!date)return'TBA';const d=new Date(date+'T12:00:00'); return Number.isNaN(d.getTime())?date:d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}
function formatTime(time){if(!time)return'';const [h,m='00']=String(time||'').split(':'); const hh=Number(h); return Number.isFinite(hh)?`${hh%12||12}:${String(m).padStart(2,'0')} ${hh>=12?'PM':'AM'}`:time}
function fullDate(date){if(!date)return'TBA';const d=new Date(date+'T12:00:00'); return Number.isNaN(d.getTime())?date:d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
function initials(name){return String(name||'').split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join('').toUpperCase()||'?'}
function topCounts(){
  $('#topUserName').textContent=[session.user.user_metadata?.first_name,session.user.user_metadata?.last_name].filter(Boolean).join(' ')||'Administrator';
  $('#topUserRole').textContent='Administrator';
}

async function loadOfficials(){
  const { data } = await supabase.rpc('admin_list_officials', { search_text: null });
  officials = (data||[]).filter(u=>u.approved_role==='official').map(u=>({
    id: u.id, name: [u.first_name,u.last_name].filter(Boolean).join(' ')||u.email, role:'Official', level:u.preferred_level||'', location:'',
  }));
}

function computedDayLabel(date){
  if(!date)return'TBA';
  const d=new Date(date+'T12:00:00'),today=new Date();today.setHours(12,0,0,0);
  if(Number.isNaN(d.getTime()))return date;
  const diff=Math.round((d-today)/86400000);
  if(diff===0)return'Today';if(diff===1)return'Tomorrow';
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
}

async function loadGames(){
  const { data, error } = await supabase.rpc('admin_list_tba_games_detailed');
  if (error) { toast(`Could not load TBA games: ${error.message}`); rawGames=[]; return; }
  rawGames=(data||[]).map(g=>({
    id:g.id, date:g.game_date, time:g.game_time,
    homeTeam:g.home_team_name, awayTeam:g.visiting_team_name,
    homeMark:initials(g.home_team_name), awayMark:initials(g.visiting_team_name),
    homeColor:'#bd2318', awayColor:'#3b6adf',
    sport:g.sport, level:g.level, venue:g.venue_name, location:g.venue_location,
    status:g.status, statusText: g.status==='urgent' ? 'Needs officials soon' : 'Open for interest',
    crewNeeded:g.crew_needed, interested:g.interested_count,
    releasedTo:g.released_to, wishLimit:g.wish_limit, eligibleUsers:g.eligible_official_ids||[],
  }));
}

function games(){return rawGames.map(g=>({...g,dayLabel:computedDayLabel(g.date)})).sort((a,b)=>`${a.date||''}T${a.time||''}`.localeCompare(`${b.date||''}T${b.time||''}`))}
function filteredGames(){
  let list=games();
  if(state.tab==='urgent') list=list.filter(g=>g.status==='urgent');
  if(state.tab==='today') list=list.filter(g=>g.dayLabel==='Today');
  if(state.tab==='tomorrow') list=list.filter(g=>g.dayLabel==='Tomorrow');
  if(state.search){const q=state.search.toLowerCase(); list=list.filter(g=>[g.id,g.homeTeam,g.awayTeam,g.venue,g.location,g.sport,g.level].join(' ').toLowerCase().includes(q));}
  if(state.sport) list=list.filter(g=>g.sport===state.sport);
  if(state.level) list=list.filter(g=>g.level===state.level);
  if(state.status) list=list.filter(g=>g.status===state.status);
  if(state.audience) list=list.filter(g=>state.audience==='unreleased'?g.releasedTo==='unreleased':g.releasedTo===state.audience);
  if(state.crew) list=list.filter(g=>String(g.crewNeeded)===String(state.crew));
  if(state.wish) list=list.filter(g=>String(g.wishLimit)===String(state.wish));
  return list;
}
function renderStats(){
  const list=games();
  $('#statTotal').textContent=list.length; $('#countAll').textContent=list.length;
  const urgent=list.filter(g=>g.status==='urgent').length; $('#statUrgent').textContent=urgent; $('#countUrgent').textContent=urgent;
  const venues=[...new Set(list.map(g=>g.venue))].length; $('#statVenues').textContent=venues;
  $('#statAuto').textContent=0;
  $('#countToday').textContent=list.filter(g=>g.dayLabel==='Today').length;
  $('#countTomorrow').textContent=list.filter(g=>g.dayLabel==='Tomorrow').length;
}
function renderFilters(){
  const sports=[...new Set(games().map(g=>g.sport))].sort();
  const levels=[...new Set(games().map(g=>g.level))].sort();
  $('#sportFilter').innerHTML='<option value="">All Sports</option>'+sports.map(s=>`<option ${state.sport===s?'selected':''}>${esc(s)}</option>`).join('');
  $('#levelFilter').innerHTML='<option value="">All Levels</option>'+levels.map(s=>`<option ${state.level===s?'selected':''}>${esc(s)}</option>`).join('');
  $('#statusFilter').value=state.status; $('#audienceFilter').value=state.audience; $('#crewNeededFilter').value=state.crew; $('#wishLimitFilter').value=state.wish;
}
function teamBadge(mark,color){return `<span class="team-badge" style="background:${esc(color)}">${esc(mark)}</span>`}
function statusBlock(game){return `<span class="status-badge ${esc(game.status)}"><strong>${esc(game.status.charAt(0).toUpperCase()+game.status.slice(1))}</strong><small>${esc(game.statusText)}</small></span>`}
function dayClass(game){return game.dayLabel==='Today'?'today':(game.dayLabel==='Tomorrow'?'tomorrow':'')}
function rowHtml(game){
  return `<tr data-row-id="${esc(game.id)}">
    <td><div class="date-cell"><span class="date-bar ${dayClass(game)}"></span><div class="date-copy"><strong>${esc(game.dayLabel)}</strong><span>${esc(formatDate(game.date))}</span><span>${esc(formatTime(game.time))}</span></div></div></td>
    <td><div class="game-cell">${teamBadge(game.homeMark,game.homeColor)}<div class="team-copy"><strong>${esc(game.homeTeam)}</strong></div><span class="versus">vs</span>${teamBadge(game.awayMark,game.awayColor)}<div class="team-copy"><strong>${esc(game.awayTeam)}</strong></div></div></td>
    <td><div class="sport-copy"><strong>${esc(game.sport)}</strong><span>${esc(game.level)}</span></div></td>
    <td><div class="venue-copy"><strong>${esc(game.venue)}</strong><span>${esc(game.location)}</span></div></td>
    <td>${statusBlock(game)}</td>
    <td><div class="crew-copy"><strong>${esc(game.crewNeeded)} Officials</strong><span>${esc(game.interested)} Interested</span></div></td>
    <td><div class="row-actions"><button class="assign-btn" type="button" data-open-release="${esc(game.id)}"><svg><use href="#i-users"/></svg>Assign</button><div class="menu-wrap"><button class="menu-btn" type="button" data-toggle-menu="${esc(game.id)}"><svg><use href="#i-chevron"/></svg></button><div class="row-menu ${state.menuGameId===game.id?'open':''}" id="menu-${esc(game.id)}"><button type="button" data-row-action="release" data-id="${esc(game.id)}">Release Game</button><button type="button" data-row-action="notify" data-id="${esc(game.id)}">Notify Eligible Users</button><button type="button" data-row-action="convert" data-id="${esc(game.id)}">Convert to Assignment</button><button type="button" data-row-action="remove" data-id="${esc(game.id)}">Remove from TBA</button></div></div></div></td>
  </tr>`;
}
function renderTable(){
  const list=filteredGames();
  const pages=Math.max(1,Math.ceil(list.length/state.perPage)); if(state.page>pages) state.page=pages;
  const start=(state.page-1)*state.perPage; const pageItems=list.slice(start,start+state.perPage);
  $('#gameRows').innerHTML=pageItems.map(rowHtml).join('');
  $('#emptyState').hidden=pageItems.length!==0;
  $('#tableSummary').textContent=list.length?`Showing ${start+1} to ${Math.min(start+state.perPage,list.length)} of ${list.length} TBA games`:'Showing 0 TBA games';
  $('#pageIndicator').textContent=String(state.page); $('#prevPageBtn').disabled=state.page<=1; $('#nextPageBtn').disabled=state.page>=pages;
}
function setCountsAndRender(){renderStats(); renderFilters(); renderTable();}
function findGame(id){return rawGames.find(g=>g.id===id)}

async function openReleaseModal(id){
  const game=findGame(id); if(!game) return;
  state.activeGameId=id; $('#releaseModal').hidden=false;
  $('#modalGameTitle').textContent=`${game.homeTeam} vs ${game.awayTeam}`;
  $('#modalGameMeta').textContent=`${fullDate(game.date)} • ${formatTime(game.time)} • ${game.sport} / ${game.level}`;
  $('#modalGameVenue').textContent=`${game.venue} • ${game.location}`;
  $('#releaseAudience').value=game.releasedTo==='selected'?'selected':'all';
  $('#releaseCrewNeeded').value=String(game.crewNeeded); $('#releaseWishLimit').value=String(game.wishLimit||5); $('#releaseNotify').value='yes'; $('#sendMessageCheck').checked=true; $('#allowWaitlistCheck').checked=true;
  renderEligibleUsers(game);
  await renderInterestList(game);
  toggleEligibleUsers();
}
function closeReleaseModal(){ $('#releaseModal').hidden=true; state.activeGameId=null; }
function renderEligibleUsers(game){
  const wrap=$('#eligibleUsersList');
  wrap.innerHTML=officials.map(u=>`<label><input type="checkbox" value="${esc(u.id)}" ${game.eligibleUsers.includes(u.id)?'checked':''}> ${esc(u.name)}</label>`).join('');
}
async function renderInterestList(game){
  if (!interestCache[game.id]) {
    const { data } = await supabase.rpc('admin_list_tba_interests', { target_tba_id: game.id });
    interestCache[game.id] = data || [];
  }
  const list = interestCache[game.id];
  $('#interestList').innerHTML=list.map((u,idx)=>`<div class="interest-row"><div class="interest-person"><span class="interest-avatar">${esc(initials(u.name))}</span><div class="interest-copy"><strong>${esc(u.name)}</strong><span>${esc(u.email)}</span></div></div><div class="interest-actions"><span class="pill ${idx<game.crewNeeded?'green':'orange'}">${idx<game.crewNeeded?'Preferred':'Waitlist'}</span><button class="assign-btn" type="button" data-assign-official="${esc(u.official_id)}">Select</button></div></div>`).join('') || '<div class="table-empty">No officials have expressed interest yet.</div>';
}
function toggleEligibleUsers(){ $('#selectedUsersWrap').hidden = $('#releaseAudience').value!=='selected'; }

async function saveReleaseSettings(){
  const game=findGame(state.activeGameId); if(!game) return;
  const audience=$('#releaseAudience').value;
  const crewNeeded=Number($('#releaseCrewNeeded').value||game.crewNeeded||2);
  const wishLimit=Number($('#releaseWishLimit').value||5);
  const selectedUsers=$$('#eligibleUsersList input:checked').map(i=>i.value);
  const notify=$('#releaseNotify').value==='yes';
  const sendMessage=$('#sendMessageCheck').checked;

  const { error } = await supabase.rpc('admin_release_tba_game', {
    target_tba_id: game.id, audience, p_crew_needed: crewNeeded, p_wish_limit: wishLimit,
    eligible_ids: audience==='selected' ? selectedUsers : null,
    should_notify: notify, notify_message: sendMessage,
  });
  if (error) { toast(`Could not save: ${error.message}`); return; }
  await loadGames();
  setCountsAndRender(); closeReleaseModal(); toast('TBA release settings saved.');
}

function exportCsv(){
  const rows=[['Game ID','Date','Time','Home Team','Away Team','Sport','Level','Venue','Location','Status','Crew Needed','Interested','Release Audience','Wish Limit']];
  filteredGames().forEach(g=>rows.push([g.id,g.date,g.time,g.homeTeam,g.awayTeam,g.sport,g.level,g.venue,g.location,g.status,g.crewNeeded,g.interested,g.releasedTo,g.wishLimit]));
  const csv=rows.map(r=>r.map(cell=>`"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='tba-games.csv'; a.click(); URL.revokeObjectURL(url);
}
function quickAssign(){
  const target=games().find(g=>g.status==='urgent')||games()[0];
  if(!target){toast('No TBA games available.');return;}
  openReleaseModal(target.id);
}
async function convertAssignment(id){
  const game=findGame(id||state.activeGameId); if(!game) return;
  const { data, error } = await supabase.rpc('admin_convert_tba_to_assignment', { target_tba_id: game.id });
  if (error) { toast(`Could not convert: ${error.message}`); return; }
  toast('Converted to a game assignment.');
  window.location.href = `admin-create-assignment.html?assignment=${encodeURIComponent(data)}`;
}
async function removeGame(id){
  const { error } = await supabase.rpc('admin_delete_tba_game', { target_id: id });
  if (error) { toast(`Could not remove: ${error.message}`); return; }
  await loadGames();
  setCountsAndRender();
  toast('TBA game removed.');
}
function bind(){
  $('#searchInput').addEventListener('input',e=>{state.search=e.target.value.trim(); state.page=1; renderTable()});
  $('#sportFilter').addEventListener('change',e=>{state.sport=e.target.value; state.page=1; renderTable()});
  $('#levelFilter').addEventListener('change',e=>{state.level=e.target.value; state.page=1; renderTable()});
  $('#statusFilter').addEventListener('change',e=>{state.status=e.target.value; state.page=1; renderTable()});
  $('#audienceFilter').addEventListener('change',e=>{state.audience=e.target.value; state.page=1; renderTable()});
  $('#crewNeededFilter').addEventListener('change',e=>{state.crew=e.target.value; state.page=1; renderTable()});
  $('#wishLimitFilter').addEventListener('change',e=>{state.wish=e.target.value; state.page=1; renderTable()});
  $('#clearFiltersBtn').addEventListener('click',()=>{state.search=''; state.sport=''; state.level=''; state.status=''; state.audience=''; state.crew=''; state.wish=''; state.page=1; $('#searchInput').value=''; setCountsAndRender();});
  $('#toggleFiltersBtn').addEventListener('click',()=>{const panel=$('#advancedFilters'); panel.hidden=!panel.hidden;});
  $('#syncScheduleBtn').addEventListener('click',()=>toast('Sync from schedule is not available yet — add games to the TBA pool directly.'));
  $('#quickAssignBtn').addEventListener('click',quickAssign); $('#exportBtn').addEventListener('click',exportCsv);
  $('#perPageSelect').addEventListener('change',e=>{state.perPage=Number(e.target.value||10); state.page=1; renderTable()});
  $('#prevPageBtn').addEventListener('click',()=>{if(state.page>1){state.page--; renderTable()}}); $('#nextPageBtn').addEventListener('click',()=>{const max=Math.max(1,Math.ceil(filteredGames().length/state.perPage)); if(state.page<max){state.page++; renderTable()}});
  $$('#tabRow .tab').forEach(btn=>btn.addEventListener('click',()=>{$$('#tabRow .tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); state.tab=btn.dataset.tab; state.page=1; renderTable();}));
  document.addEventListener('click',async e=>{
    const toggle=e.target.closest('[data-toggle-menu]');
    const open=e.target.closest('[data-open-release]');
    const rowAction=e.target.closest('[data-row-action]');
    const assignOfficial=e.target.closest('[data-assign-official]');
    const close=e.target.closest('[data-close-modal]');
    if(toggle){ state.menuGameId = state.menuGameId===toggle.dataset.toggleMenu ? '' : toggle.dataset.toggleMenu; renderTable(); return; }
    if(open){ await openReleaseModal(open.dataset.openRelease); return; }
    if(rowAction){ const id=rowAction.dataset.id; const action=rowAction.dataset.rowAction; state.menuGameId=''; renderTable(); if(action==='release') await openReleaseModal(id); else if(action==='notify'){ const game=findGame(id); if(game){ await supabase.rpc('admin_release_tba_game',{target_tba_id:id,audience:game.releasedTo,p_crew_needed:game.crewNeeded,p_wish_limit:game.wishLimit,eligible_ids:game.eligibleUsers,should_notify:true,notify_message:true}); toast('Eligible users notified.');} } else if(action==='convert') await convertAssignment(id); else if(action==='remove') await removeGame(id); return; }
    if(assignOfficial){ toast('Official marked for super admin assignment review.'); return; }
    if(close){ closeReleaseModal(); return; }
    if(!e.target.closest('.menu-wrap')){ state.menuGameId=''; renderTable(); }
  });
  $('#releaseAudience').addEventListener('change',toggleEligibleUsers); $('#saveReleaseBtn').addEventListener('click',saveReleaseSettings); $('#convertAssignmentBtn').addEventListener('click',()=>convertAssignment());
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') {state.menuGameId=''; renderTable(); closeReleaseModal();} });
}

topCounts(); bind();
await Promise.all([loadGames(), loadOfficials()]);
setCountsAndRender();
})();
