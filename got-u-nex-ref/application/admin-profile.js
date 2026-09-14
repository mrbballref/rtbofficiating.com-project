(()=>{
'use strict';
const KEY='gotUNexRef.adminDashboard.v1';
const ASSIGNMENTS_KEY='gotUNexRef.adminAssignments.v1';
const OFFICIAL_PORTAL_KEY='gotUNexRef.officialPortal.v3';
const $=(s,r=document)=>r.querySelector(s);
const state=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||{users:[],drafts:[],options:{}}}catch{return{users:[],drafts:[],options:{}}}})();
state.users=Array.isArray(state.users)?state.users:[];state.options=state.options||{};state.notifications=Array.isArray(state.notifications)?state.notifications:[];state.messages=Array.isArray(state.messages)?state.messages:[];state.auditLog=Array.isArray(state.auditLog)?state.auditLog:[];
let toastTimer;
let adminAssignmentFilter='all';
function toast(m){const e=$('#toast');if(!e)return;e.textContent=m;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),1800)}
function persist(){localStorage.setItem(KEY,JSON.stringify(state))}
function roleText(u){return String(u?.roleLabel||u?.role||'').toLowerCase()}
function superAdminUser(){return state.users.find(u=>roleText(u).replace(/[_-]/g,' ').includes('super admin'))||null}
function baseProfile(){
 const saved=state.options.currentAdmin||state.currentAdmin||{}; const linked=superAdminUser()||{};
 const address=linked.address||{};
 return {
  id:saved.id||saved.userId||linked.id||linked.userId||'', firstName:saved.firstName||linked.firstName||'', lastName:saved.lastName||linked.lastName||'', displayName:saved.displayName||saved.name||'', email:saved.email||linked.email||'', phone:saved.phone||saved.mobilePhone||linked.mobilePhone||linked.phone||'', username:saved.username||linked.username||'', organization:saved.organization||saved.organizationName||linked.organizationLabel||linked.organization||'', title:saved.title||saved.position||linked.positionTitle||linked.position||'', department:saved.department||linked.department||'', city:saved.city||address.city||linked.city||'', state:saved.state||address.state||linked.state||'', timezone:saved.timezone||'', bio:saved.bio||'', photo:saved.photo||saved.profilePhoto||saved.avatar||linked.profilePhoto||linked.photoDataUrl||'', accountActive:saved.accountActive!==undefined?saved.accountActive:(linked.security?.accountActive!==false), twoFactor:saved.twoFactor!==undefined?saved.twoFactor:!!linked.security?.twoFactor, lastLogin:saved.lastLogin||linked.lastLogin||'', updatedAt:saved.updatedAt||'', role:'Super Admin'
 };
}
let profile=baseProfile();
function fullName(){return [profile.firstName,profile.lastName].filter(Boolean).join(' ').trim()}
function displayName(){return profile.displayName||fullName()||profile.username||'Profile not configured'}
function initials(){const parts=displayName().split(/\s+/).filter(Boolean);return (parts.slice(0,2).map(p=>p[0]).join('')||'—').toUpperCase()}
function fmtDate(v){if(!v)return'Not available';const d=new Date(v);return Number.isNaN(d.getTime())?v:d.toLocaleString([], {dateStyle:'medium',timeStyle:'short'})}
function setText(id,val,fallback='Not provided'){const e=$('#'+id);if(e)e.textContent=val||fallback}
function render(){
 const name=displayName(), active=profile.accountActive!==false, location=[profile.city,profile.state].filter(Boolean).join(', ');
 $('#profileDisplayName').textContent=name;$('#topAdminName').textContent=name;$('#topAdminInitials').textContent=initials();$('#profileAvatar').src=profile.photo||'assets/profile-placeholder.svg';
 $('#profileRoleLine').textContent=[profile.title,profile.organization].filter(Boolean).join(' • ')||'Full platform administration';
 $('#profileStatusBadge').textContent=active?'Active':'Inactive';$('#profileStatusBadge').classList.toggle('inactive',!active);$('#summaryStatus').textContent=active?'Active':'Inactive';$('#summarySecurity').textContent=active?'Account enabled':'Account disabled';
 const n=state.notifications.length,m=state.messages.length;$('#summaryNotifications').textContent=n;$('#summaryMessages').textContent=m;
 const nb=$('#profileNotificationBadge'),mb=$('#profileMessageBadge');nb.textContent=n;mb.textContent=m;nb.hidden=n===0;mb.hidden=m===0;
 setText('detailName',fullName());setText('detailDisplayName',profile.displayName);setText('detailEmail',profile.email);setText('detailPhone',profile.phone);setText('detailUsername',profile.username);setText('detailLocation',location);setText('detailOrganization',profile.organization);setText('detailTitle',profile.title);setText('detailDepartment',profile.department);setText('detailTimezone',profile.timezone);$('#detailBio').textContent=profile.bio||'No profile description has been added.';
 $('#securityAccount').textContent=active?'Active':'Inactive';$('#security2fa').textContent=profile.twoFactor?'Enabled':'Not configured';$('#securityLastLogin').textContent=fmtDate(profile.lastLogin);$('#securityUpdated').textContent=fmtDate(profile.updatedAt);
 renderActivity();
 renderPersonalGameAssignments();
}

function assignmentStores(){
  let assignments={assignments:[],drafts:[]}, portal={profile:{},assignments:[]};
  try{assignments=JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY)||'null')||assignments}catch{}
  try{portal=JSON.parse(localStorage.getItem(OFFICIAL_PORTAL_KEY)||'null')||portal}catch{}
  assignments.assignments=Array.isArray(assignments.assignments)?assignments.assignments:[];
  portal.assignments=Array.isArray(portal.assignments)?portal.assignments:[];
  return {assignments,portal};
}
function normalizeIdentity(v){return String(v||'').trim().toLowerCase()}
function currentAdminIdentity(){
  const linked=superAdminUser()||{};
  const ids=[profile.id,linked.id,linked.userId,linked.officialId].filter(Boolean).map(String);
  const emails=[profile.email,linked.email].filter(Boolean).map(normalizeIdentity);
  const names=[
    fullName(),
    profile.displayName,
    linked.name,
    [linked.firstName,linked.lastName].filter(Boolean).join(' ')
  ].filter(Boolean).map(normalizeIdentity).filter(n=>!['super admin','super administrator','administrator','profile not configured'].includes(n));
  return {ids:new Set(ids),emails:new Set(emails),names:new Set(names)};
}
function crewMemberForAdmin(assignment,identity){
  const crew=Array.isArray(assignment?.crew)?assignment.crew:(Array.isArray(assignment?.officials)?assignment.officials:[]);
  const member=crew.find(item=>{
    const ids=[item?.officialId,item?.userId,item?.id].filter(Boolean).map(String);
    if(ids.some(id=>identity.ids.has(id)))return true;
    const email=normalizeIdentity(item?.email);
    if(email&&identity.emails.has(email))return true;
    const name=normalizeIdentity(item?.name||item?.officialName||[item?.firstName,item?.lastName].filter(Boolean).join(' '));
    return !!name&&identity.names.has(name);
  });
  if(member)return member;
  const officialIds=Array.isArray(assignment?.officialIds)?assignment.officialIds.map(String):[];
  if(officialIds.some(id=>identity.ids.has(id)))return {officialId:officialIds.find(id=>identity.ids.has(id)),role:'Official'};
  return null;
}
function portalResponseForAdmin(assignment,identity,portal){
  const portalProfile=portal?.profile||{};
  const portalIds=[portalProfile.officialId,portalProfile.id,portalProfile.userId].filter(Boolean).map(String);
  const portalEmail=normalizeIdentity(portalProfile.email);
  const sameAdmin=portalIds.some(id=>identity.ids.has(id)) || (portalEmail&&identity.emails.has(portalEmail));
  if(!sameAdmin)return null;
  return (portal.assignments||[]).find(item=>{
    const adminId=String(item?.adminAssignmentId||'');
    const itemId=String(item?.id||'');
    const baseId=String(assignment?.id||'');
    if(adminId&&adminId===baseId)return true;
    return itemId===baseId || itemId.startsWith(`${baseId}:`);
  })||null;
}
function normalizedAssignmentResponse(value){
  const v=normalizeIdentity(value);
  if(['accepted','accept','confirmed','approved'].includes(v))return'accepted';
  if(['declined','decline','rejected'].includes(v))return'declined';
  if(['pending','assigned','published','unpublished',''].includes(v))return'pending';
  return '';
}
function responseStatusForAdmin(assignment,member,identity,portal){
  const portalItem=portalResponseForAdmin(assignment,identity,portal);
  const portalStatus=normalizedAssignmentResponse(portalItem?.status||portalItem?.workflowStatus||portalItem?.responseStatus);
  if(portalStatus)return portalStatus;

  if(member?.accepted===true)return'accepted';
  if(member?.declined===true)return'declined';
  const memberStatus=normalizedAssignmentResponse(member?.responseStatus||member?.response||member?.status||member?.workflowStatus);
  if(memberStatus)return memberStatus;

  const maps=[assignment?.officialResponses,assignment?.responses,assignment?.crewResponses];
  for(const map of maps){
    if(!map||typeof map!=='object')continue;
    for(const id of identity.ids){
      const response=map[id];
      const status=normalizedAssignmentResponse(response?.status||response?.response||response);
      if(status)return status;
    }
  }

  const assignmentStatus=normalizedAssignmentResponse(assignment?.officialResponseStatus||assignment?.responseStatus);
  return assignmentStatus||'pending';
}
function assignmentDateTimeLabel(assignment){
  const date=assignment?.date||assignment?.gameDate||assignment?.dueDate||'';
  const time=assignment?.time||assignment?.gameTime||assignment?.dueTime||'';
  let dateLabel='Date not provided';
  if(date){
    const d=new Date(`${date}T12:00:00`);
    dateLabel=Number.isNaN(d.getTime())?String(date):d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  }
  let timeLabel=time||'Time not provided';
  if(/^\d{1,2}:\d{2}$/.test(time)){
    const [h,m]=time.split(':').map(Number);
    timeLabel=`${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;
  }
  return {dateLabel,timeLabel};
}
function personalGameAssignments(){
  const stores=assignmentStores();
  const identity=currentAdminIdentity();
  if(!identity.ids.size&&!identity.emails.size&&!identity.names.size)return[];
  return stores.assignments.assignments.map(assignment=>{
    const member=crewMemberForAdmin(assignment,identity);
    if(!member)return null;
    const status=responseStatusForAdmin(assignment,member,identity,stores.portal);
    const game=assignment.matchup||assignment.title||[assignment.homeTeam,assignment.visitingTeam||assignment.awayTeam].filter(Boolean).join(' vs ')||'Game Assignment';
    const dt=assignmentDateTimeLabel(assignment);
    return {
      assignment,
      member,
      status,
      game,
      dateLabel:dt.dateLabel,
      timeLabel:dt.timeLabel,
      level:assignment.level||assignment.competitionLevel||assignment.classTeam||'Not provided',
      position:member.role||member.position||assignment.position||'Official',
      location:assignment.venue||assignment.location||assignment.siteName||'Not provided'
    };
  }).filter(Boolean).sort((a,b)=>{
    const ad=a.assignment?.date?new Date(`${a.assignment.date}T${a.assignment.time||'00:00'}`).getTime():0;
    const bd=b.assignment?.date?new Date(`${b.assignment.date}T${b.assignment.time||'00:00'}`).getTime():0;
    return bd-ad;
  });
}
function renderPersonalGameAssignments(){
  const body=$('#adminMyAssignmentsBody'),empty=$('#adminMyAssignmentsEmpty');
  if(!body||!empty)return;
  const items=personalGameAssignments();
  const counts={
    all:items.length,
    pending:items.filter(x=>x.status==='pending').length,
    accepted:items.filter(x=>x.status==='accepted').length,
    declined:items.filter(x=>x.status==='declined').length
  };
  setText('adminMyAssignmentsTotal',String(counts.all),'0');
  setText('adminMyAssignmentsPending',String(counts.pending),'0');
  setText('adminMyAssignmentsAccepted',String(counts.accepted),'0');
  setText('adminMyAssignmentsDeclined',String(counts.declined),'0');
  setText('adminMyAssignmentsAllBadge',String(counts.all),'0');
  setText('adminMyAssignmentsPendingBadge',String(counts.pending),'0');
  setText('adminMyAssignmentsAcceptedBadge',String(counts.accepted),'0');
  setText('adminMyAssignmentsDeclinedBadge',String(counts.declined),'0');

  document.querySelectorAll('[data-admin-assignment-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.adminAssignmentFilter===adminAssignmentFilter));
  const filtered=adminAssignmentFilter==='all'?items:items.filter(x=>x.status===adminAssignmentFilter);
  body.innerHTML=filtered.map(item=>`<tr>
    <td><div class="admin-personal-assignment-date"><strong>${escapeHtml(item.dateLabel)}</strong><span>${escapeHtml(item.timeLabel)}</span></div></td>
    <td><div class="admin-personal-assignment-game"><strong>${escapeHtml(item.game)}</strong><span>${escapeHtml(item.assignment.sport||'')}</span></div></td>
    <td>${escapeHtml(item.level)}</td>
    <td>${escapeHtml(item.position)}</td>
    <td>${escapeHtml(item.location)}</td>
    <td><span class="admin-personal-assignment-status ${escapeHtml(item.status)}">${escapeHtml(item.status)}</span></td>
  </tr>`).join('');
  empty.hidden=filtered.length>0;
  if(!filtered.length){
    empty.textContent=items.length
      ? `No ${adminAssignmentFilter} game assignments are currently assigned to this Super Admin account.`
      : 'No game assignments are currently assigned to this Super Admin account.';
  }
}

function renderActivity(){const host=$('#recentAdminActivity');const items=state.auditLog.filter(x=>{const uid=String(x.userId||x.actorId||'');return !profile.id||!uid||uid===String(profile.id)}).slice(-6).reverse();if(!items.length){host.innerHTML='<div class="activity-empty">No administrator activity has been recorded yet.</div>';return}host.innerHTML=items.map(x=>`<div class="activity-row"><span class="activity-dot"></span><div><strong>${escapeHtml(x.action||x.event||x.description||'Administrator activity')}</strong><span>${escapeHtml(fmtDate(x.createdAt||x.timestamp||x.date))}</span></div></div>`).join('')}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function fillForm(){const map={profileFirstName:profile.firstName,profileLastName:profile.lastName,profileDisplayNameInput:profile.displayName,profileEmail:profile.email,profilePhone:profile.phone,profileUsername:profile.username,profileOrganization:profile.organization,profileTitle:profile.title,profileDepartment:profile.department,profileCity:profile.city,profileState:profile.state,profileTimezone:profile.timezone,profileBio:profile.bio};Object.entries(map).forEach(([id,v])=>{const e=$('#'+id);if(e)e.value=v||''})}
function openEdit(){fillForm();$('#profileEditModal').hidden=false;document.body.style.overflow='hidden'}
function closeEdit(){$('#profileEditModal').hidden=true;document.body.style.overflow=''}
function readForm(){return {...profile,firstName:$('#profileFirstName').value.trim(),lastName:$('#profileLastName').value.trim(),displayName:$('#profileDisplayNameInput').value.trim(),email:$('#profileEmail').value.trim(),phone:$('#profilePhone').value.trim(),username:$('#profileUsername').value.trim(),organization:$('#profileOrganization').value.trim(),title:$('#profileTitle').value.trim(),department:$('#profileDepartment').value.trim(),city:$('#profileCity').value.trim(),state:$('#profileState').value.trim().toUpperCase(),timezone:$('#profileTimezone').value,bio:$('#profileBio').value.trim(),updatedAt:new Date().toISOString(),role:'Super Admin'} }
function syncLinkedUser(){const u=profile.id?state.users.find(x=>String(x.id||x.userId||'')===String(profile.id)):superAdminUser();if(!u)return;u.firstName=profile.firstName;u.lastName=profile.lastName;u.email=profile.email;u.mobilePhone=profile.phone;u.username=profile.username;u.organization=profile.organization;u.organizationLabel=profile.organization;u.positionTitle=profile.title;u.department=profile.department;u.address={...(u.address||{}),city:profile.city,state:profile.state};if(profile.photo){u.profilePhoto=profile.photo;u.photoDataUrl=profile.photo}}

document.querySelectorAll('[data-admin-assignment-filter]').forEach(btn=>btn.addEventListener('click',()=>{
  adminAssignmentFilter=btn.dataset.adminAssignmentFilter||'all';
  renderPersonalGameAssignments();
}));

$('#editProfileBtn').addEventListener('click',openEdit);document.querySelectorAll('[data-edit-profile]').forEach(b=>b.addEventListener('click',openEdit));document.querySelectorAll('[data-close-profile]').forEach(b=>b.addEventListener('click',closeEdit));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#profileEditModal').hidden)closeEdit()});
$('#profileEditForm').addEventListener('submit',e=>{e.preventDefault();profile=readForm();state.options.currentAdmin={...profile,name:displayName(),profilePhoto:profile.photo};state.currentAdmin={...state.options.currentAdmin};syncLinkedUser();persist();render();closeEdit();toast('Super Admin profile saved.')});
$('#changePhotoBtn').addEventListener('click',()=>$('#profilePhotoInput').click());$('#profilePhotoInput').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>3*1024*1024){toast('Please choose an image smaller than 3 MB.');e.target.value='';return}const reader=new FileReader();reader.onload=()=>{profile.photo=String(reader.result||'');state.options.currentAdmin={...profile,name:displayName(),profilePhoto:profile.photo};state.currentAdmin={...state.options.currentAdmin};syncLinkedUser();persist();render();toast('Profile photo updated.')};reader.readAsDataURL(f);e.target.value=''});
window.addEventListener('storage',e=>{if([KEY,ASSIGNMENTS_KEY,OFFICIAL_PORTAL_KEY].includes(e.key))location.reload()});render();
})();