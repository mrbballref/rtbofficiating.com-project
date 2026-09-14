
(()=>{
'use strict';
const ADMIN_KEY='gotUNexRef.adminDashboard.v1';
const ASSIGN_KEY='gotUNexRef.adminAssignments.v1';
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=v=>JSON.parse(JSON.stringify(v));
function load(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')||clone(fallback)}catch{return clone(fallback)}}

let admin=load(ADMIN_KEY,{users:[],options:{},notifications:[],messages:[]});
let store=load(ASSIGN_KEY,{assignments:[],drafts:[]});
admin.options=admin.options||{};
admin.notifications=Array.isArray(admin.notifications)?admin.notifications:[];
admin.messages=Array.isArray(admin.messages)?admin.messages:[];
store.assignments=Array.isArray(store.assignments)?store.assignments:[];
store.drafts=Array.isArray(store.drafts)?store.drafts:[];
let state={
  page:1, perPage:10, menuOpenId:'', selected:new Set(),
  filters:{dateRange:'',sport:'',level:'',status:'',school:'',conference:'',gender:'',crewType:'',publish:'',fromDate:'',toDate:'',search:''}
};
let toastTimer;

function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2200)}
function saveStore(){localStorage.setItem(ASSIGN_KEY, JSON.stringify(store))}
function records(){const a=(store.assignments||[]).map(x=>({...x,_source:'assignments'})); const d=(store.drafts||[]).map(x=>({...x,_source:'drafts'})); return [...a,...d].sort((x,y)=>`${y.date||''}T${y.time||'00:00'}`.localeCompare(`${x.date||''}T${x.time||'00:00'}`))}
function schools(){return admin.options.schoolsTeams||admin.options.schools||[]}
function schoolById(id){return schools().find(s=>String(s.id||s.value||s.name)===String(id))||null}
function recordSport(r){return r.sport || schoolById(r.homeTeamId)?.sport || admin.options.defaultSport || 'Basketball'}
function recordConference(r){return r.conference || schoolById(r.homeTeamId)?.conference || schoolById(r.homeTeamId)?.conferenceLevel || ''}
function publishedState(r){
  const raw=String(r.publishStatus||r.status||'').toLowerCase();
  if(raw) return raw;
  if(r.published===true) return 'published';
  if(r._source==='drafts' || r.lifecycle==='draft') return 'draft';
  return 'unpublished';
}
function topAdmin(){
  const current=admin.options.currentAdmin||admin.currentAdmin||{};
  const name=current.name || [current.firstName,current.lastName].filter(Boolean).join(' ') || 'Administrator';
  const role=current.role || current.title || 'Administrator';
  const avatar=current.photo || current.profilePhoto || current.avatar || 'assets/profile-placeholder.svg';
  $('#topUserName').textContent=name;
  $('#topUserRole').textContent=role;
  $('#topUserAvatar').src=avatar;
  $('#topBellCount').textContent=admin.notifications.length||0;
  $('#sidebarNotificationCount').textContent=admin.notifications.length||0;
  $('#sidebarMessageCount').textContent=admin.messages.length||0;
}
function populateSelect(sel, items, label){
  const current=sel.value;
  sel.innerHTML=`<option value="">${label}</option>`+items.map(item=>`<option value="${esc(item.value)}">${esc(item.label)}</option>`).join('');
  if([...sel.options].some(o=>o.value===current)) sel.value=current;
}
function itemsFromSettings(key, deriveFn){
  const from=admin.options[key];
  if(Array.isArray(from) && from.length){
    return from.map(v=>typeof v==='string'?{label:v,value:v}:{label:v.label||v.name||v.value||v.id, value:v.value||v.id||v.name||v.label});
  }
  const values=[...new Set(records().map(deriveFn).filter(Boolean))].sort();
  return values.map(v=>({label:v,value:v}));
}
function populateFilters(){
  $('#filterDateRange').innerHTML='<option value="">All Dates</option><option value="this-week">This Week</option><option value="next-7">Next 7 Days</option><option value="this-month">This Month</option><option value="custom">Custom Range</option>';
  populateSelect($('#filterSport'), itemsFromSettings('sports', recordSport), 'All Sports');
  populateSelect($('#filterLevel'), itemsFromSettings('levels', r=>r.level), 'All Levels');
  $('#filterStatus').innerHTML='<option value="">All Statuses</option><option value="published">Published</option><option value="pending">Pending</option><option value="unpublished">Unpublished</option><option value="draft">Draft</option>';
  populateSelect($('#filterSchool'), schools().map(s=>({label:s.name||s.label||s.value||s.id, value:s.name||s.label||s.value||s.id})), 'All Schools');
  populateSelect($('#filterConference'), itemsFromSettings('conferences', recordConference), 'All Conference Levels');
  populateSelect($('#filterGender'), itemsFromSettings('genders', r=>r.gender), 'All Genders');
}
function applyDateRange(list){
  const range=state.filters.dateRange;
  if(!range) return list;
  const start=new Date(); start.setHours(0,0,0,0);
  let end=new Date(start);
  if(range==='custom'){
    return list.filter(r=>{
      if(!r.date) return false;
      const d=new Date(r.date+'T00:00:00');
      if(state.filters.fromDate && d<new Date(state.filters.fromDate+'T00:00:00')) return false;
      if(state.filters.toDate && d>new Date(state.filters.toDate+'T23:59:59')) return false;
      return true;
    });
  }
  if(range==='this-week'){const day=start.getDay(); start.setDate(start.getDate()-day); end=new Date(start); end.setDate(end.getDate()+6);}
  else if(range==='next-7'){end.setDate(end.getDate()+6);}
  else if(range==='this-month'){start.setDate(1); end=new Date(start.getFullYear(), start.getMonth()+1, 0);}
  return list.filter(r=>{if(!r.date) return false; const d=new Date(r.date+'T00:00:00'); return d>=start && d<=end;});
}
function filteredRecords(){
  let list=records().filter(r=>{
    if(state.filters.sport && recordSport(r)!==state.filters.sport) return false;
    if(state.filters.level && String(r.level||'')!==state.filters.level) return false;
    if(state.filters.status && publishedState(r)!==state.filters.status) return false;
    if(state.filters.school && String(r.homeTeam||'')!==state.filters.school) return false;
    if(state.filters.conference && recordConference(r)!==state.filters.conference) return false;
    if(state.filters.gender && String(r.gender||'')!==state.filters.gender) return false;
    if(state.filters.crewType && String(r.crewSize||'')!==state.filters.crewType) return false;
    if(state.filters.publish && publishedState(r)!==state.filters.publish) return false;
    return true;
  });
  list=applyDateRange(list);
  const q=state.filters.search.trim().toLowerCase();
  if(q){
    list=list.filter(r=>[r.homeTeam,r.visitingTeam,r.awayTeam,r.venue,r.address,r.level,r.gender,recordSport(r),recordConference(r),...(Array.isArray(r.crew)?r.crew.map(m=>m.name):[])].join(' ').toLowerCase().includes(q));
  }
  return list;
}
function conflictIds(){
  const ids=new Set(); const seen={};
  records().forEach(r=>{
    const req=Number(r.crewSize||2);
    const members=(r.crew||[]).filter(m=>m.role!=='Alternate');
    if(members.length<req) ids.add(r.id);
    members.filter(m=>m.officialId).forEach(m=>{
      const key=`${r.date||''}|${r.time||''}|${m.officialId}`;
      if(seen[key]){ids.add(r.id); ids.add(seen[key]);}
      else seen[key]=r.id;
    });
  });
  return ids;
}
function renderStats(list){
  const total=list.length;
  const assignments=list.reduce((sum,r)=>sum+Number(r.crewSize||2),0);
  const published=list.filter(r=>publishedState(r)==='published').length;
  const pending=list.filter(r=>publishedState(r)==='pending').length;
  const draft=list.filter(r=>['draft','unpublished'].includes(publishedState(r))).length;
  const conflicts=list.filter(r=>conflictIds().has(r.id)).length;
  const pct=total?Math.round((published/total)*100):0;
  $('#statTotalGames').textContent=total;
  $('#statAssignments').textContent=assignments;
  $('#statPublished').textContent=published;
  $('#statPending').textContent=pending;
  $('#statDraft').textContent=draft;
  $('#statConflicts').textContent=conflicts;
  $('#statPublishedPct').textContent=`${pct}% Published`;
}
function formatDate(dateStr){if(!dateStr)return '—'; const d=new Date(dateStr+'T12:00:00'); return Number.isNaN(d.getTime())?dateStr:d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});}
function formatTime(t){if(!t)return '—'; const [h,m='00']=String(t).split(':'); const hh=Number(h); if(!Number.isFinite(hh)) return t; return `${hh%12||12}:${String(m).padStart(2,'0')} ${hh>=12?'PM':'AM'} CT`;}
function initials(name){return String(name||'').split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase()||'?';}
function teamLogo(name, school){const url=school?.logo||school?.logoUrl||school?.image||''; return url?`<span class="team-logo"><img src="${esc(url)}" alt=""></span>`:`<span class="team-logo">${esc(initials(name))}</span>`;}
function crewStatus(r){const assigned=(r.crew||[]).filter(m=>m.role!=='Alternate').length; const req=Number(r.crewSize||2); const pct=Math.round((Math.min(assigned,req)/req)*100); return {assigned,req,pct,label:assigned>=req?'Assigned':'Pending',detail:`${assigned}/${req} Filled`};}
function publishLabels(st){if(st==='published')return['PUBLISHED','Published to officials']; if(st==='pending')return['PENDING','Awaiting publish']; if(st==='draft')return['DRAFT','Not published']; if(st==='conflict')return['CONFLICT','Needs resolution']; return['UNPUBLISHED','Not scheduled'];}
function rowHtml(r){
  const home=schoolById(r.homeTeamId), away=schoolById(r.visitingTeamId);
  const conf=recordConference(r)||'—';
  const crew=crewStatus(r);
  const conflict=conflictIds().has(r.id);
  const status=conflict?'conflict':publishedState(r);
  const labels=publishLabels(status);
  const members=(r.crew||[]).filter(m=>m.role!=='Alternate');
  const crewMarkup=members.length?`<div class="crew-stack">${members.map(m=>`<div class="crew-member">${m.photo?`<img src="${esc(m.photo)}" alt="">`:`<span class="avatar">${esc(initials(m.name))}</span>`}<div><strong>${esc(m.name||'Official')}</strong><span>${esc(m.role||'Crew')}</span></div></div>`).join('')}</div>`:'<span class="muted">No officials assigned</span>';
  return `<tr data-row-id="${esc(r.id)}">
    <td><input class="row-check" type="checkbox" data-check-id="${esc(r.id)}" ${state.selected.has(r.id)?'checked':''}></td>
    <td>${esc(formatDate(r.date))}</td>
    <td>${esc(formatTime(r.time))}</td>
    <td class="center"><span class="sport-ball" title="${esc(recordSport(r))}"></span></td>
    <td>${esc(r.level||'—')}</td>
    <td>${esc(r.gender||'—')}</td>
    <td>${esc(conf)}</td>
    <td><div class="team-cell">${teamLogo(r.homeTeam,home)}<div><strong>${esc(r.homeTeam||'—')}</strong></div></div></td>
    <td><div class="team-cell">${teamLogo(r.visitingTeam||r.awayTeam,away)}<div><strong>${esc(r.visitingTeam||r.awayTeam||'—')}</strong></div></div></td>
    <td><div class="location-copy"><strong>${esc(r.venue||'—')}</strong><div class="muted">${esc(r.address||'')}</div></div></td>
    <td>${crewMarkup}</td>
    <td><div class="progress-cell"><div class="progress-ring" style="--pct:${crew.pct}" data-pct="${crew.pct}"></div><span class="crew-status-badge"><span>${esc(crew.label)}</span><em>${esc(crew.detail)}</em></span></div></td>
    <td><span class="publish-badge ${esc(status)}"><span>${esc(labels[0])}</span><em>${esc(labels[1])}</em></span></td>
    <td><div class="row-actions"><button class="action-btn" type="button" data-action-toggle="${esc(r.id)}">ACTIONS <svg><use href="#i-chevron"/></svg></button><div class="row-menu ${state.menuOpenId===r.id?'open':''}"><button type="button" data-row-action="publish" data-row-id="${esc(r.id)}">Publish</button><button type="button" data-row-action="unpublish" data-row-id="${esc(r.id)}">Unpublish</button><button type="button" data-row-action="edit" data-row-id="${esc(r.id)}">Edit Assignment</button><button type="button" data-row-action="delete" data-row-id="${esc(r.id)}">Delete</button></div></div></td>
  </tr>`;
}
function renderTable(){
  const list=filteredRecords();
  renderStats(list);
  const total=list.length;
  const pages=Math.max(1,Math.ceil(total/state.perPage));
  if(state.page>pages) state.page=pages;
  const start=(state.page-1)*state.perPage;
  const pageItems=list.slice(start,start+state.perPage);
  $('#scheduleRows').innerHTML=pageItems.map(rowHtml).join('');
  $('#tableEmpty').classList.toggle('show', pageItems.length===0);
  $('#tableSummary').textContent=total?`Showing ${start+1} to ${Math.min(total,start+state.perPage)} of ${total} games`:'Showing 0 games';
  $('#pageIndicator').textContent=String(state.page);
  $('#prevPageBtn').disabled=state.page<=1;
  $('#nextPageBtn').disabled=state.page>=pages;
  $('#selectAllRows').checked=pageItems.length>0 && pageItems.every(r=>state.selected.has(r.id));
}
function findRecord(id){
  let record=store.assignments.find(r=>r.id===id);
  if(record) return {record,list:'assignments'};
  record=store.drafts.find(r=>r.id===id);
  if(record) return {record,list:'drafts'};
  return null;
}
function publishRecord(id){const hit=findRecord(id); if(!hit)return; hit.record.publishStatus='published'; hit.record.status='published'; hit.record.published=true; hit.record.publishedAt=new Date().toISOString();}
function unpublishRecord(id){const hit=findRecord(id); if(!hit)return; hit.record.publishStatus='unpublished'; hit.record.status='unpublished'; hit.record.published=false;}
function deleteRecord(id){store.assignments=store.assignments.filter(r=>r.id!==id); store.drafts=store.drafts.filter(r=>r.id!==id); state.selected.delete(id);}
function rowAction(action,id){
  if(action==='publish'){publishRecord(id); saveStore(); toast('Assignment published.');}
  else if(action==='unpublish'){unpublishRecord(id); saveStore(); toast('Assignment unpublished.');}
  else if(action==='delete'){deleteRecord(id); saveStore(); toast('Assignment deleted.');}
  else if(action==='edit'){sessionStorage.setItem('gotUNexRef.editAssignmentId',id); const hit=findRecord(id); location.href=`admin-create-assignment.html?crew=${hit?.record?.crewSize===3?3:2}&edit=${encodeURIComponent(id)}`; return;}
  state.menuOpenId=''; renderTable();
}
function runBulk(action){
  const ids=[...state.selected];
  if(!ids.length){toast('Select at least one game first.');return;}
  if(action==='publish'){ids.forEach(publishRecord); toast('Selected games published.');}
  else if(action==='unpublish'){ids.forEach(unpublishRecord); toast('Selected games unpublished.');}
  else if(action==='delete'){ids.forEach(deleteRecord); toast('Selected games deleted.');}
  saveStore(); renderTable();
}
function exportCsv(){
  const list=filteredRecords();
  const rows=[['Date','Time','Sport','Level','Gender','Conference','Home Team','Away Team','Venue','Address','Crew Size','Publish Status']];
  list.forEach(r=>rows.push([r.date||'',r.time||'',recordSport(r),r.level||'',r.gender||'',recordConference(r),r.homeTeam||'',r.visitingTeam||r.awayTeam||'',r.venue||'',r.address||'',String(r.crewSize||''),publishedState(r)]));
  const csv=rows.map(row=>row.map(cell=>`"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='master-schedule.csv'; a.click(); URL.revokeObjectURL(url);
}
function importData(items){
  if(!Array.isArray(items)) throw new Error('Imported file must contain an array.');
  const normalized=items.map((item,i)=>({
    id:item.id||`import-${Date.now()}-${i}`,
    type:'game', assignmentType:'game',
    title:item.title||item.matchup||`${item.homeTeam||''} vs ${item.visitingTeam||item.awayTeam||''}`.trim(),
    matchup:item.matchup||`${item.homeTeam||''} vs ${item.visitingTeam||item.awayTeam||''}`.trim(),
    crewSize:Number(item.crewSize||2), date:item.date||'', time:item.time||'', level:item.level||'', gender:item.gender||'',
    sport:item.sport||'Basketball', conference:item.conference||'', homeTeam:item.homeTeam||'', visitingTeam:item.visitingTeam||item.awayTeam||'',
    venue:item.venue||'', address:item.address||'', crew:Array.isArray(item.crew)?item.crew:[], publishStatus:(item.publishStatus||'unpublished').toLowerCase(),
    status:(item.status||item.publishStatus||'unpublished').toLowerCase(), published:!!item.published
  }));
  store.assignments=[...normalized,...store.assignments];
  saveStore(); renderTable(); toast('Schedule imported.');
}
function parseCsv(text){
  const lines=text.trim().split(/\r?\n/).filter(Boolean);
  if(!lines.length) return [];
  const headers=lines[0].split(',').map(h=>h.trim().replace(/^"|"$/g,''));
  return lines.slice(1).map(line=>{
    const cells=[]; let cur='', inQuotes=false;
    for(let i=0;i<line.length;i++){
      const ch=line[i];
      if(ch==='"'){ if(inQuotes && line[i+1]==='"'){cur+='"'; i++;} else inQuotes=!inQuotes; }
      else if(ch===',' && !inQuotes){cells.push(cur); cur='';}
      else cur+=ch;
    }
    cells.push(cur);
    const obj={}; headers.forEach((h,idx)=>obj[h]=cells[idx]?.trim()); return obj;
  }).map(row=>({
    date:row.Date||row.date||'', time:row.Time||row.time||'', sport:row.Sport||row.sport||'Basketball', level:row.Level||row.level||'',
    gender:row.Gender||row.gender||'', conference:row.Conference||row['Conference Level']||row.conference||'', homeTeam:row['Home Team']||row.homeTeam||'',
    awayTeam:row['Away Team']||row['Visiting Team']||row.awayTeam||'', venue:row.Venue||row['Gym Location']||row.venue||'', address:row.Address||row.address||'',
    crewSize:Number(row['Crew Size']||row.crewSize||2), publishStatus:String(row['Publish Status']||row.publishStatus||'unpublished').toLowerCase()
  }));
}
function bindFilters(){
  const mapping={filterDateRange:'dateRange',filterSport:'sport',filterLevel:'level',filterStatus:'status',filterSchool:'school',filterConference:'conference',filterGender:'gender',filterCrewType:'crewType',filterPublish:'publish',filterFromDate:'fromDate',filterToDate:'toDate',scheduleSearch:'search'};
  Object.entries(mapping).forEach(([id,key])=>{
    $('#'+id).addEventListener(id==='scheduleSearch'?'input':'change',e=>{state.filters[key]=e.target.value; if(id==='scheduleSearch') renderTable();});
  });
  $('#applyFiltersBtn').addEventListener('click',()=>{state.page=1; renderTable();});
  $('#clearFiltersBtn').addEventListener('click',()=>{
    Object.keys(mapping).forEach(id=>{const el=$('#'+id); if(el) el.value='';});
    state.filters={dateRange:'',sport:'',level:'',status:'',school:'',conference:'',gender:'',crewType:'',publish:'',fromDate:'',toDate:'',search:''};
    state.page=1; renderTable();
  });
}
document.addEventListener('click',e=>{
  const toggle=e.target.closest('[data-action-toggle]');
  if(toggle){const id=toggle.getAttribute('data-action-toggle'); state.menuOpenId=state.menuOpenId===id?'':id; renderTable(); return;}
  const action=e.target.closest('[data-row-action]');
  if(action){rowAction(action.getAttribute('data-row-action'), action.getAttribute('data-row-id')); return;}
  if(!e.target.closest('.row-actions') && state.menuOpenId){state.menuOpenId=''; renderTable();}
});
document.addEventListener('change',e=>{
  const rowCheck=e.target.closest('[data-check-id]');
  if(rowCheck){const id=rowCheck.getAttribute('data-check-id'); rowCheck.checked?state.selected.add(id):state.selected.delete(id); renderTable(); return;}
  if(e.target.id==='selectAllRows'){
    const pageIds=filteredRecords().slice((state.page-1)*state.perPage, (state.page-1)*state.perPage+state.perPage).map(r=>r.id);
    pageIds.forEach(id=>e.target.checked?state.selected.add(id):state.selected.delete(id));
    renderTable(); return;
  }
  if(e.target.id==='bulkActionSelect' && e.target.value){runBulk(e.target.value); e.target.value=''; return;}
  if(e.target.id==='perPageSelect'){state.perPage=Number(e.target.value)||10; state.page=1; renderTable();}
});
$('#toggleAdvancedBtn').addEventListener('click',()=>$('#advancedPanel').classList.toggle('open'));
$('#publishSelectedBtn').addEventListener('click',()=>runBulk('publish'));
$('#exportBtn').addEventListener('click',exportCsv);
$('#prevPageBtn').addEventListener('click',()=>{if(state.page>1){state.page--; renderTable();}});
$('#nextPageBtn').addEventListener('click',()=>{const pages=Math.max(1,Math.ceil(filteredRecords().length/state.perPage)); if(state.page<pages){state.page++; renderTable();}});
$('#importScheduleBtn').addEventListener('click',()=>$('#importFileInput').click());
$('#topBellBtn').addEventListener('click',()=>location.href='admin-dashboard.html#notifications');
$('.user-chip')?.addEventListener('click',()=>location.href='admin-profile.html');
$('#importFileInput').addEventListener('change', async e=>{
  const file=e.target.files?.[0]; if(!file) return;
  try{
    const text=await file.text();
    if(file.name.toLowerCase().endsWith('.json')) importData(JSON.parse(text));
    else importData(parseCsv(text));
  }catch(err){console.error(err); toast('Unable to import the selected schedule file.');}
  e.target.value='';
});
window.addEventListener('storage',e=>{
  if(e.key===ASSIGN_KEY){store=load(ASSIGN_KEY,{assignments:[],drafts:[]}); renderTable();}
  if(e.key===ADMIN_KEY){admin=load(ADMIN_KEY,{users:[],options:{},notifications:[],messages:[]}); topAdmin(); populateFilters(); renderTable();}
});
topAdmin(); populateFilters(); bindFilters(); renderTable();
})();
