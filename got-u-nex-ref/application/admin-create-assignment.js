(()=>{
'use strict';
const ADMIN_KEY='gotUNexRef.adminDashboard.v1', ASSIGN_KEY='gotUNexRef.adminAssignments.v1', PORTAL_KEY='gotUNexRef.officialPortal.v3';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=v=>JSON.parse(JSON.stringify(v));
function load(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')||clone(fallback)}catch{return clone(fallback)}}
let admin=load(ADMIN_KEY,{users:[],drafts:[],options:{}}), store=load(ASSIGN_KEY,{assignments:[],drafts:[]});
admin.options=admin.options||{}; admin.users=Array.isArray(admin.users)?admin.users:[];
store.assignments=Array.isArray(store.assignments)?store.assignments:[]; store.drafts=Array.isArray(store.drafts)?store.drafts:[];
const urlParams=new URLSearchParams(location.search);
const crewSize=urlParams.get('crew')==='3'?3:2;
const editAssignmentId=urlParams.get('edit')||sessionStorage.getItem('gotUNexRef.editAssignmentId')||'';
let selectedTab='available', search='', levelFilter='', stateFilter='', selectedSlot='', selectedCrew={}, toastTimer;
const roles=crewSize===3?['Referee','Umpire 1','Umpire 2']:['Referee','Umpire'];
$('#pageTitle').textContent=`${editAssignmentId?'EDIT':'CREATE'} GAME ASSIGNMENT (${crewSize}-MAN CREW)`;
$('#pageSubtitle').textContent=`Fill in game details and assign a ${crewSize}-man officiating crew.`;
$('#crewHeader').textContent=`ASSIGN CREW (${crewSize}-MAN CREW REQUIRED)`;

function toast(m){const el=$('#toast');el.textContent=m;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2300)}
function labelOf(item){return typeof item==='string'?item:String(item?.name||item?.label||item?.value||item?.id||'')}
function valueOf(item){return typeof item==='string'?item:String(item?.id||item?.value||item?.name||item?.label||'')}
function populate(select,items,placeholder){
  const cur=select.value; select.innerHTML=`<option value="">${esc(placeholder)}</option>`+(items||[]).map(x=>`<option value="${esc(valueOf(x))}">${esc(labelOf(x))}</option>`).join('');
  if([...select.options].some(o=>o.value===cur))select.value=cur;
}
function fillTimes(){
 let out='<option value="">Select start time</option>';
 for(let h=0;h<24;h++)for(const m of [0,30]){const value=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,h12=h%12||12,ap=h<12?'AM':'PM';out+=`<option value="${value}">${h12}:${String(m).padStart(2,'0')} ${ap}</option>`}
 $('#gameTime').innerHTML=out;
}
function schoolItems(){return admin.options.schoolsTeams||admin.options.schools||[]}
function venueItems(){return admin.options.venues||[]}
function hydrateGameOptions(){populate($('#homeTeam'),schoolItems(),'Select home school');populate($('#visitingTeam'),schoolItems(),'Select visiting school');populate($('#venue'),venueItems(),'Select venue')}
function findItem(items,value){return (items||[]).find(x=>valueOf(x)===String(value))||null}
function updateSchoolMeta(){
 const school=findItem(schoolItems(),$('#homeTeam').value);
 $('#headCoach').textContent=school?.headCoach||school?.coach||'Not available';
 $('#athleticDirector').textContent=school?.athleticDirector||school?.ad||'Not available';
 if(school?.venueId && !$('#venue').value){$('#venue').value=school.venueId;updateVenueMeta()}
}
function updateVenueMeta(){
 const venue=findItem(venueItems(),$('#venue').value);
 $('#venueAddress').textContent=venue?.address||venue?.streetAddress||'Not available';
 $('#venuePhone').textContent=venue?.phone||venue?.gymPhone||'Not available';
}
function officialName(u){if(!u)return'';return [u.firstName,u.lastName].filter(Boolean).join(' ')||u.email||u.username||'Unnamed Official'}
function officialId(u){return u?String(u.officialId||u.id||u.userId||''):''}
function officialLevel(u){return u?(u.preferredLevel||u.level||u.class||u.classification||''):''}
function officialState(u){return u?(u.address?.state||u.state||''):''}
function officialCity(u){return u?(u.address?.city||u.city||''):''}
function officialPhoto(u){return u?(u.profilePhoto||u.photoDataUrl||'assets/profile-placeholder.svg'):'assets/profile-placeholder.svg'}
function officialSkill(u){return u?(u.skillBadge||u.skillLevel||u.ratingLabel||''):''}
function officialGames(u){if(!u)return'';const n=u.gamesWorked??u.accountStats?.total??'';return n===''?'':String(n)}
function isOfficial(u){return !!u&&(String(u.role||'').toLowerCase()==='official' || String(u.roleLabel||'').toLowerCase()==='official')}
function blockForDate(u,date){
 const blocks=u.availability?.blocksByDate?.[date];
 if(Array.isArray(blocks))return blocks[0]||null;
 if(blocks&&typeof blocks==='object')return blocks;
 return null;
}
function timeMinutes(t){if(!t)return null;const [h,m]=String(t).split(':').map(Number);return Number.isFinite(h)&&Number.isFinite(m)?h*60+m:null}
function unavailableInfo(u){
 const date=$('#gameDate').value,time=$('#gameTime').value;
 if(!date)return null;
 const block=blockForDate(u,date);
 const status=u.availability?.byDate?.[date];
 if(!block && status!=='unavailable' && status!=='partial')return null;
 if(block){
   if(block.fullDay)return {reason:block.reasonLabel||block.reason||'Unavailable'};
   if(time){
     const gm=timeMinutes(time),start=timeMinutes(block.startTime),end=timeMinutes(block.endTime||block.startTime);
     if(gm!==null&&start!==null&&end!==null&&gm>=start&&gm<=end)return {reason:block.reasonLabel||block.reason||'Unavailable'};
     if(status==='unavailable')return {reason:block.reasonLabel||block.reason||'Unavailable'};
     return null;
   }
   return {reason:block.reasonLabel||block.reason||'Partially unavailable'};
 }
 return {reason:status==='unavailable'?'Unavailable':'Partially unavailable'};
}
function officials(){
 const list=admin.users.filter(isOfficial).filter(u=>u.security?.accountActive!==false);
 return list.map(u=>({u,unavailable:unavailableInfo(u)}));
}
function populateFilters(){
 const list=admin.users.filter(isOfficial);
 const levels=[...new Set(list.map(officialLevel).filter(Boolean))].sort();
 const states=[...new Set(list.map(officialState).filter(Boolean))].sort();
 const l=$('#officialLevelFilter'),s=$('#officialStateFilter');
 l.innerHTML='<option value="">All levels</option>'+levels.map(v=>`<option>${esc(v)}</option>`).join('');
 s.innerHTML='<option value="">All states</option>'+states.map(v=>`<option>${esc(v)}</option>`).join('');
}
function availableOfficialIds(){return Object.values(selectedCrew).filter(Boolean).map(officialId)}
function chooseDefaultSlot(){
 const unfilled=roles.find(r=>!selectedCrew[r]);
 if(unfilled)return unfilled;
 return !selectedCrew.Alternate?'Alternate':'';
}
function renderCrew(){
 const grid=$('#crewGrid');grid.className=`crew-grid ${crewSize===3?'three':'two'}`;
 grid.innerHTML=roles.map(role=>slotHtml(role)).join('');
 const alt=$('#alternateSlot');alt.outerHTML=slotButtonHtml('Alternate','alternateSlot');
 $('#assignedCount').textContent=Object.values(selectedCrew).filter(Boolean).length;
 updatePay();
}
function slotHtml(role){return `<div class="crew-slot"><label><svg><use href="#a-person"/></svg>${esc(role)}</label>${slotButtonHtml(role)}</div>`}
function slotButtonHtml(role,id=''){
 const u=selectedCrew[role];
 if(!u)return `<button ${id?`id="${id}"`:''} class="slot-box" type="button" data-slot-role="${esc(role)}"><svg><use href="#a-plus"/></svg><span>Select Official</span></button>`;
 return `<button ${id?`id="${id}"`:''} class="slot-box assigned" type="button" data-slot-role="${esc(role)}"><img class="slot-avatar" src="${esc(officialPhoto(u))}" alt=""><span class="slot-name"><b>${esc(officialName(u))}</b><small>${esc(officialLevel(u)||'Official')}</small></span><span class="slot-remove" data-remove-role="${esc(role)}">×</span></button>`
}
function updatePay(){
 const fee=admin.options.gameFees?.[$('#gameLevel').value]?.[$('#gameGender').value] ?? admin.options.gameFees?.[$('#gameLevel').value] ?? null;
 const count=Object.values(selectedCrew).filter(Boolean).length;
 if(fee!==null && Number.isFinite(Number(fee)))$('#estimatedPay').textContent=`$${(Number(fee)*count).toFixed(2)}`;
 else {
   const rates=Object.values(selectedCrew).filter(Boolean).map(u=>Number(u.payRate??u.gameFee)).filter(Number.isFinite);
   $('#estimatedPay').textContent=rates.length===count&&count?`$${rates.reduce((a,b)=>a+b,0).toFixed(2)}`:'Not configured';
 }
}
function renderOfficials(){
 const list=officials();
 const available=list.filter(x=>!x.unavailable), unavailable=list.filter(x=>x.unavailable);
 $('#availableCount').textContent=available.length;$('#unavailableCount').textContent=unavailable.length;
 let shown=selectedTab==='available'?available:unavailable;
 const q=search.trim().toLowerCase();
 if(q)shown=shown.filter(({u})=>[officialName(u),u.email,officialCity(u),officialState(u),officialLevel(u),officialSkill(u)].join(' ').toLowerCase().includes(q));
 if(levelFilter)shown=shown.filter(({u})=>officialLevel(u)===levelFilter);
 if(stateFilter)shown=shown.filter(({u})=>officialState(u)===stateFilter);
 const assignedIds=availableOfficialIds();
 const target=$('#officialList');
 if(!shown.length){target.innerHTML=`<div class="official-empty">${selectedTab==='available'?'No available officials match the selected date, time, and filters.':'No unavailable officials match the selected date, time, and filters.'}</div>`;$('#unavailableFooter').hidden=true;return}
 target.innerHTML=shown.map(({u,unavailable})=>{
   const id=officialId(u),assigned=assignedIds.includes(id);
   return `<div class="official-row"><img class="official-avatar" src="${esc(officialPhoto(u))}" alt=""><div class="official-copy"><strong>${esc(officialName(u))}</strong><div class="badges">${officialLevel(u)?`<span class="badge">${esc(officialLevel(u))}</span>`:''}${officialSkill(u)?`<span class="badge skill">${esc(officialSkill(u))}</span>`:''}</div><small>${esc([officialCity(u),officialState(u)].filter(Boolean).join(', ')||'Location not provided')}</small></div>${unavailable?`<div></div><div class="unavailable-reason"><b>Unavailable</b><span>${esc(unavailable.reason)}</span></div>`:`<div class="games-worked">${officialGames(u)?`${esc(officialGames(u))} Games Worked`:''}</div><button class="assign-btn" type="button" data-assign-official="${esc(id)}" ${assigned?'disabled':''}>${assigned?'Assigned':'Assign'}</button>`}</div>`
 }).join('');
 $('#unavailableFooter').hidden=selectedTab!=='unavailable';
}
function assignOfficial(id){
 const u=admin.users.find(x=>officialId(x)===id);if(!u)return;
 const role=selectedSlot||chooseDefaultSlot();if(!role){toast('All crew positions are filled. Remove an official to make a change.');return}
 Object.keys(selectedCrew).forEach(r=>{if(officialId(selectedCrew[r])===id)delete selectedCrew[r]});
 selectedCrew[role]=u;selectedSlot='';renderCrew();renderOfficials();toast(`${officialName(u)} assigned as ${role}.`);
}
function requiredFilled(){return roles.every(r=>selectedCrew[r])}
function selectedSchoolLabel(select){const o=select.options[select.selectedIndex];return o&&select.value?o.text:''}
function assigningOfficialName(){
 const configured=admin.options.currentAdmin?.name||admin.currentAdmin?.name||'Super Admin';
 return configured;
}
$('#assigningOfficial').textContent=assigningOfficialName();
function buildRecord(status){
 const date=$('#gameDate').value,time=$('#gameTime').value,level=$('#gameLevel').value,gender=$('#gameGender').value,home=$('#homeTeam').value,away=$('#visitingTeam').value,venueId=$('#venue').value;
 const homeLabel=selectedSchoolLabel($('#homeTeam')),awayLabel=selectedSchoolLabel($('#visitingTeam')),venue=findItem(venueItems(),venueId);
 const crew=roles.map(role=>{const u=selectedCrew[role];return {role,officialId:officialId(u),name:officialName(u),email:u?.email||'',phone:u?.mobilePhone||u?.phone||'',photo:u?.profilePhoto||u?.photoDataUrl||''}}).filter(c=>c.officialId);
 if(selectedCrew.Alternate){const u=selectedCrew.Alternate;crew.push({role:'Alternate',officialId:officialId(u),name:officialName(u),email:u?.email||'',phone:u?.mobilePhone||u?.phone||'',photo:u?.profilePhoto||u?.photoDataUrl||''})}
 const id=editAssignmentId||`game-${crypto.randomUUID?.()||Date.now()}`;
 const homeSchool=findItem(schoolItems(),home), awaySchool=findItem(schoolItems(),away);
 return {id,type:'game',assignmentType:'game',sport:homeSchool?.sport||awaySchool?.sport||admin.options.defaultSport||'Basketball',conference:homeSchool?.conference||homeSchool?.conferenceLevel||awaySchool?.conference||awaySchool?.conferenceLevel||'',title:`${homeLabel} vs ${awayLabel}`,matchup:`${homeLabel} vs ${awayLabel}`,crewSize,date,time,level,gender,homeTeam:homeLabel,homeTeamId:home,visitingTeam:awayLabel,awayTeam:awayLabel,visitingTeamId:away,venue:labelOf(venue)||selectedSchoolLabel($('#venue')),venueId,location:labelOf(venue)||selectedSchoolLabel($('#venue')),address:venue?.address||venue?.streetAddress||'',phone:venue?.phone||venue?.gymPhone||'',headCoach:$('#headCoach').textContent==='Not available'?'':$('#headCoach').textContent,athleticDirector:$('#athleticDirector').textContent==='Not available'?'':$('#athleticDirector').textContent,assigningOfficial:assigningOfficialName(),notes:$('#assignmentNotes').value.trim(),crew,officialIds:crew.map(c=>c.officialId).filter(Boolean),status,workflowStatus:status,published:status==='pending',createdAt:new Date().toISOString(),estimatedTotalPay:$('#estimatedPay').textContent==='Not configured'?'':$('#estimatedPay').textContent};
}
function validateGame(requireCrew=true){
 const req=[['gameDate','Date'],['gameTime','Time'],['gameLevel','Level'],['gameGender','Gender'],['homeTeam','Home Team'],['visitingTeam','Visiting Team'],['venue','Venue']];
 for(const [id,label] of req)if(!$('#'+id).value){toast(`${label} is required.`);$('#'+id).focus();return false}
 if($('#homeTeam').value===$('#visitingTeam').value){toast('Home Team and Visiting Team must be different.');return false}
 if(requireCrew&&!requiredFilled()){toast(`Assign all ${crewSize} required crew positions before creating the assignment.`);return false}
 return true;
}
function persistStore(){localStorage.setItem(ASSIGN_KEY,JSON.stringify(store))}
function publishToProfile(record){
 let portal=load(PORTAL_KEY,{profile:{},assignments:[],notifications:[]});portal.assignments=Array.isArray(portal.assignments)?portal.assignments:[];
 // Remove any prior copy of the same admin assignment.
 portal.assignments=portal.assignments.filter(a=>a.adminAssignmentId!==record.id);
 record.crew.forEach(c=>{
   if(c.role==='Alternate'||!c.officialId)return;
   portal.assignments.unshift({...record,id:`${record.id}:${c.officialId}`,adminAssignmentId:record.id,officialId:c.officialId,assigneeId:c.officialId,assignedToMe:true,status:'pending',workflowStatus:'pending',position:c.role});
 });
 localStorage.setItem(PORTAL_KEY,JSON.stringify(portal));
 window.dispatchEvent(new CustomEvent('gotunexref:admin-assignment-published',{detail:{assignment:record}}));
}
function upsertRecord(list, record){const idx=list.findIndex(r=>r.id===record.id); if(idx>=0) list[idx]=record; else list.unshift(record)}
function removeRecordEverywhere(id){store.assignments=store.assignments.filter(r=>r.id!==id); store.drafts=store.drafts.filter(r=>r.id!==id)}
function saveDraft(){
 if(!validateGame(false))return;
 const record=buildRecord('draft');
 removeRecordEverywhere(record.id);
 upsertRecord(store.drafts, record);
 persistStore();
 if(window.GotUNexRefAdminAPI?.saveGameAssignmentDraft)Promise.resolve(window.GotUNexRefAdminAPI.saveGameAssignmentDraft({assignment:record})).catch(console.error);
 toast(editAssignmentId?'Draft updated.':'Game assignment saved as draft.');
 setTimeout(()=>location.href='admin-master-schedule.html',650);
}
async function createAssignment(){
 if(!validateGame(true))return;
 const record=buildRecord('pending');store.assignments.unshift(record);persistStore();publishToProfile(record);
 try{
   if(window.GotUNexRefAdminAPI?.createGameAssignment)await window.GotUNexRefAdminAPI.createGameAssignment({assignment:record});
   if(window.GotUNexRefAdminAPI?.publishGameAssignment)await window.GotUNexRefAdminAPI.publishGameAssignment({assignmentId:record.id,officialIds:record.officialIds});
 }catch(err){console.error(err);toast('Assignment was saved locally; backend publishing needs attention.');return}
 toast('Assignment created and published to the Master Schedule and officials.');
 setTimeout(()=>location.href='admin-master-schedule.html',700);
}
async function loadBackend(){
 if(window.GotUNexRefAdminAPI?.getGameAssignmentOptions){
  try{const result=await window.GotUNexRefAdminAPI.getGameAssignmentOptions({crewSize});if(result?.data){admin.options={...admin.options,...result.data.options};if(Array.isArray(result.data.officials))admin.users=result.data.officials;localStorage.setItem(ADMIN_KEY,JSON.stringify(admin));hydrateGameOptions();populateFilters();renderOfficials()}}catch(err){console.error(err)}
 }
}

function loadTbaSeed(){
 const seedRaw=sessionStorage.getItem('gotUNexRef.tbaAssignmentSeed');
 if(!seedRaw || editAssignmentId) return;
 try{
   const seed=JSON.parse(seedRaw);
   if(seed.date) $('#gameDate').value=seed.date;
   if(seed.time) $('#gameTime').value=seed.time;
   if(seed.level) $('#gameLevel').value=seed.level;
   if(seed.homeTeam){
     const home=(schoolItems()||[]).find(x=>labelOf(x)===seed.homeTeam || valueOf(x)===String(seed.homeTeamId||''));
     if(home) $('#homeTeam').value=String(valueOf(home));
   }
   if(seed.awayTeam||seed.visitingTeam){
     const awayLabel=seed.awayTeam||seed.visitingTeam;
     const away=(schoolItems()||[]).find(x=>labelOf(x)===awayLabel || valueOf(x)===String(seed.visitingTeamId||''));
     if(away) $('#visitingTeam').value=String(valueOf(away));
   }
   if(seed.venue){
     const venue=(venueItems()||[]).find(x=>labelOf(x)===seed.venue || valueOf(x)===String(seed.venueId||''));
     if(venue) $('#venue').value=String(valueOf(venue));
   }
   updateSchoolMeta(); updateVenueMeta();
 }catch(err){console.error(err)}
 finally{sessionStorage.removeItem('gotUNexRef.tbaAssignmentSeed')}
}

function loadExistingAssignment(){
 const id=editAssignmentId;
 if(!id) return;
 const found=store.assignments.find(r=>r.id===id) || store.drafts.find(r=>r.id===id);
 if(!found) return;
 if(found.date) $('#gameDate').value=found.date;
 if(found.time) $('#gameTime').value=found.time;
 if(found.level) $('#gameLevel').value=found.level;
 if(found.gender) $('#gameGender').value=found.gender;
 if(found.homeTeamId) $('#homeTeam').value=String(found.homeTeamId);
 if(found.visitingTeamId) $('#visitingTeam').value=String(found.visitingTeamId);
 if(found.venueId) $('#venue').value=String(found.venueId);
 $('#assignmentNotes').value=found.notes||'';
 updateSchoolMeta(); updateVenueMeta();
 const byId={}; admin.users.filter(isOfficial).forEach(u=>{byId[officialId(u)]=u});
 (found.crew||[]).forEach(member=>{ if(byId[member.officialId]) selectedCrew[member.role]=byId[member.officialId]; });
}
fillTimes();hydrateGameOptions();populateFilters();loadExistingAssignment();loadTbaSeed();renderCrew();renderOfficials();
$('#homeTeam').addEventListener('change',updateSchoolMeta);$('#venue').addEventListener('change',updateVenueMeta);
['gameDate','gameTime'].forEach(id=>$('#'+id).addEventListener('change',renderOfficials));
['gameLevel','gameGender'].forEach(id=>$('#'+id).addEventListener('change',()=>{updatePay();renderOfficials()}));
$$('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{selectedTab=btn.dataset.tab;$$('[data-tab]').forEach(b=>b.classList.toggle('active',b===btn));renderOfficials()}));
$('#officialSearch').addEventListener('input',e=>{search=e.target.value;renderOfficials()});
$('#filterBtn').addEventListener('click',()=>$('#filterPanel').classList.toggle('open'));
$('#officialLevelFilter').addEventListener('change',e=>{levelFilter=e.target.value;renderOfficials()});$('#officialStateFilter').addEventListener('change',e=>{stateFilter=e.target.value;renderOfficials()});
document.addEventListener('click',e=>{
 const slot=e.target.closest('[data-slot-role]');if(slot&&!e.target.closest('[data-remove-role]')){selectedSlot=slot.dataset.slotRole;toast(`Select an available official for ${selectedSlot}.`);return}
 const rem=e.target.closest('[data-remove-role]');if(rem){delete selectedCrew[rem.dataset.removeRole];selectedSlot='';renderCrew();renderOfficials();return}
 const assign=e.target.closest('[data-assign-official]');if(assign){assignOfficial(assign.dataset.assignOfficial);return}
});
$('#saveDraftBtn').addEventListener('click',saveDraft);$('#createAssignmentBtn').addEventListener('click',createAssignment);
window.addEventListener('storage',e=>{if(e.key===ADMIN_KEY){admin=load(ADMIN_KEY,{users:[],options:{}});hydrateGameOptions();populateFilters();renderOfficials()}});
loadBackend();
})();

// -------- Availability report modal --------
function loadAvailabilityAdmin(){try{return JSON.parse(localStorage.getItem('gotUNexRef.adminDashboard.v1')||'null')||{users:[]}}catch{return{users:[]}}}
function avIsOfficial(u){return String(u?.role||u?.roleLabel||'').toLowerCase().includes('official')}
function avName(u){return [u.firstName,u.lastName].filter(Boolean).join(' ')||u.name||u.email||u.username||'Official'}
function avCity(u){return [u.address?.city||u.city,u.address?.state||u.state].filter(Boolean).join(', ')}
function avType(u){return u.officialType||u.position||u.preferredPosition||u.assignmentPosition||'Official'}
function avLevel(u){return u.preferredLevel||u.level||u.classification||u.class||'Not Set'}
function avGender(u){return u.gender||u.profile?.gender||'Not Set'}
function avPhoto(u){return u.profilePhoto||u.photoDataUrl||u.avatar||'assets/profile-placeholder.svg'}
function avDateISO(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function avDates(mode){const now=new Date();now.setHours(0,0,0,0);let start=new Date(now),end=new Date(now);if(mode==='month'){start=new Date(now.getFullYear(),now.getMonth(),1);end=new Date(now.getFullYear(),now.getMonth()+1,0)}else{const days=Number(mode)||28;end.setDate(end.getDate()+days-1)}const out=[];for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1))out.push(avDateISO(d));return out}
function avStatus(u,date){const explicit=u.availability?.byDate?.[date];if(explicit)return explicit;const blocks=u.availability?.blocksByDate?.[date];const block=Array.isArray(blocks)?blocks[0]:blocks;if(block?.fullDay)return'unavailable';if(block)return'partial';return'pending'}
function availabilityPct(n,d){return d?Math.round((n/d)*100):0}
function availabilityDataset(){const adminState=loadAvailabilityAdmin();const dates=avDates(document.getElementById('embedFilterDate')?.value||'28');return (adminState.users||[]).filter(avIsOfficial).map(u=>{let available=0,unavailable=0,pending=0;dates.forEach(date=>{const s=avStatus(u,date);if(s==='available'||s==='preferred')available++;else if(s==='unavailable')unavailable++;else pending++});const today=avStatus(u,avDateISO(new Date()));return{name:avName(u),city:avCity(u),type:avType(u),level:avLevel(u),gender:avGender(u),available,unavailable,pending,total:dates.length,status:today==='unavailable'?'Unavailable':today==='available'||today==='preferred'?'Available':'Pending',updated:u.availability?.savedAt||u.updatedAt||u.modifiedAt||'',photo:avPhoto(u)}})}
function avFill(id,values,allLabel){const el=document.getElementById(id);if(!el)return;const current=el.value;const vals=[...new Set(values.filter(Boolean))].sort();el.innerHTML=`<option>${allLabel}</option>`+vals.map(v=>`<option>${v}</option>`).join('');if([...el.options].some(o=>o.value===current))el.value=current}
function availabilityFilterData(){const all=availabilityDataset();avFill('embedFilterLevel',all.map(r=>r.level),'All Levels');avFill('embedFilterGender',all.map(r=>r.gender),'All Genders');avFill('embedFilterType',all.map(r=>r.type),'All Types');const level=document.getElementById('embedFilterLevel')?.value||'All Levels',gender=document.getElementById('embedFilterGender')?.value||'All Genders',type=document.getElementById('embedFilterType')?.value||'All Types',status=document.getElementById('embedFilterStatus')?.value||'All Statuses',q=(document.getElementById('embedFilterSearch')?.value||'').trim().toLowerCase();return{all,data:all.filter(r=>{if(level!=='All Levels'&&r.level!==level)return false;if(gender!=='All Genders'&&r.gender!==gender)return false;if(type!=='All Types'&&r.type!==type)return false;if(status!=='All Statuses'&&r.status!==status)return false;if(q&&!(r.name+' '+r.city+' '+r.type+' '+r.level).toLowerCase().includes(q))return false;return true})}}
function renderAvailabilityEmbed(){const result=availabilityFilterData(),data=result.data,all=result.all,rows=document.getElementById('embedAvailabilityRows'),stats=document.getElementById('embedStats');if(!rows||!stats)return;rows.innerHTML=data.length?data.map(r=>`<tr><td><div class="embed-official"><img src="${r.photo}" alt=""><div><strong>${r.name}</strong><span>${r.city||'Location not provided'}</span></div></div></td><td>${r.type}</td><td>${r.level}</td><td>${r.gender}</td><td class="embed-green">${r.available} (${availabilityPct(r.available,r.total)}%)</td><td class="embed-red">${r.unavailable} (${availabilityPct(r.unavailable,r.total)}%)</td><td class="embed-yellow">${r.pending} (${availabilityPct(r.pending,r.total)}%)</td><td>${r.total}</td><td><span class="embed-status ${r.status.toLowerCase()}">${r.status}</span></td><td>${r.updated?new Date(r.updated).toLocaleString():'Not yet reported'}</td></tr>`).join(''):`<tr><td colspan="10">No official availability records match these filters.</td></tr>`;const source=data.length?data:all,available=source.reduce((a,b)=>a+b.available,0),unavailable=source.reduce((a,b)=>a+b.unavailable,0),pending=source.reduce((a,b)=>a+b.pending,0),officials=source.length,total=available+unavailable+pending,avg=officials?Math.round(available/officials):0;stats.innerHTML=`<div class="item green"><strong>AVAILABLE</strong><b>${available}</b><small>${availabilityPct(available,total)}%</small></div><div class="item red"><strong>UNAVAILABLE</strong><b>${unavailable}</b><small>${availabilityPct(unavailable,total)}%</small></div><div class="item yellow"><strong>PENDING</strong><b>${pending}</b><small>${availabilityPct(pending,total)}%</small></div><div class="item white"><strong>TOTAL OFFICIALS</strong><b>${officials}</b><small>&nbsp;</small></div><div class="item blue"><strong>AVG. AVAILABLE / OFFICIAL</strong><b>${avg}</b><small>SELECTED RANGE</small></div>`}
const availabilityModal=document.getElementById('availabilityModal'),openAvailabilityBtn=document.getElementById('viewAvailabilityBtn'),closeAvailabilityBtn=document.getElementById('availabilityCloseBtn'),availabilityBackdrop=document.getElementById('availabilityBackdrop'),availabilityOpenPageBtn=document.getElementById('availabilityOpenPageBtn');
function openAvailabilityModal(){if(!availabilityModal)return;availabilityModal.hidden=false;document.body.style.overflow='hidden';renderAvailabilityEmbed()}
function closeAvailabilityModal(){if(!availabilityModal)return;availabilityModal.hidden=true;document.body.style.overflow=''}
openAvailabilityBtn?.addEventListener('click',openAvailabilityModal);closeAvailabilityBtn?.addEventListener('click',closeAvailabilityModal);availabilityBackdrop?.addEventListener('click',closeAvailabilityModal);availabilityOpenPageBtn?.addEventListener('click',()=>window.open('availability-report.html','_blank'));['embedFilterDate','embedFilterLevel','embedFilterGender','embedFilterType','embedFilterStatus','embedFilterSearch'].forEach(id=>document.getElementById(id)?.addEventListener(id==='embedFilterSearch'?'input':'change',renderAvailabilityEmbed));
window.addEventListener('storage',e=>{if(e.key==='gotUNexRef.adminDashboard.v1'&&!availabilityModal?.hidden)renderAvailabilityEmbed()});
