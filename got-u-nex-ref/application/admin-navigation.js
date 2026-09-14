(()=>{
'use strict';


const LEGACY_DEMO_ID = /^(?:tba-100[1-7]|qa-100[1-5]|demo[-_:]|sample[-_:]|fake[-_:]|test[-_:])/i;

function isLegacyDemoRecord(record){
  if(!record || typeof record!=='object') return false;
  const id=String(record.id||record.userId||record.officialId||record.assignmentId||record.adminAssignmentId||'');
  if(LEGACY_DEMO_ID.test(id)) return true;
  const source=String(record.source||record.dataSource||record.origin||'').toLowerCase();
  if(['demo','sample','fake','mock','test-data'].includes(source)) return true;
  const email=String(record.email||'').toLowerCase();
  if(email.endsWith('@example.com') || email.endsWith('@example.org') || email.endsWith('@test.com')) return true;
  const userId=String(record.id||record.userId||'');
  if(/^u(?:10|[1-9])$/i.test(userId) && !record.email && !record.username && !record.createdAt && !record.updatedAt) return true;
  return false;
}

function filterCollection(obj,key){
  if(Array.isArray(obj?.[key])) obj[key]=obj[key].filter(item=>!isLegacyDemoRecord(item));
}

function sanitizeStoredAdminData(){
  const configs=[
    {key:'gotUNexRef.adminDashboard.v1', collections:['users','drafts','notifications','messages','auditLog']},
    {key:'gotUNexRef.adminAssignments.v1', collections:['assignments','drafts']},
    {key:'gotUNexRef.tbaGames.v1', collections:['games']},
    {key:'gotUNexRef.officialPortal.v3', collections:['assignments','notifications','messages','documents','evaluations']},
    {key:'gunr-dashboard-state-v3', collections:['assignments','masterGames','schools','venues','payments','forms','resources','products','conversations','reviews','gameEvaluations','gameReports','supportTickets','notifications','taxDeadlines','documentActivity','labVideos','labDiscussions','labAnnouncements','labFilms','labClipFolders','labFilmClips','users','userDrafts','invitations','officials','officialAvailability','calendarBlocks']}
  ];
  configs.forEach(({key,collections})=>{
    let raw;
    try{raw=localStorage.getItem(key); if(!raw) return;}catch{return;}
    let obj;
    try{obj=JSON.parse(raw);}catch{return;}
    if(!obj || typeof obj!=='object') return;
    const before=JSON.stringify(obj);
    collections.forEach(name=>filterCollection(obj,name));
    const after=JSON.stringify(obj);
    if(before!==after){
      try{localStorage.setItem(key,after);}catch{}
    }
  });
}

sanitizeStoredAdminData();

const LOCAL_NAV_SELECTOR = [
  '.admin-sidebar a[href]',
  '.sidebar a[href]',
  '.admin-nav a[href]',
  '.side-nav a[href]',
  '.quick-actions a[href]',
  '.page-actions a[href]',
  '.head-actions a[href]',
  '.report-card-grid a[href]',
  '.section-menu a[href]',
  '.directory-row a[href]',
  '[data-admin-href]'
].join(',');

function isModifiedClick(event){
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function resolveDestination(element){
  if(!element) return '';
  return element.getAttribute('data-admin-href') || element.getAttribute('href') || '';
}

function isLocalDestination(href){
  if(!href) return false;
  const h=href.trim();
  if(!h || h==='#' || h.startsWith('javascript:') || h.startsWith('mailto:') || h.startsWith('tel:')) return false;
  if(/^https?:\/\//i.test(h)){
    try{return new URL(h,location.href).origin===location.origin}catch{return false}
  }
  return true;
}

function go(href){
  if(!isLocalDestination(href)) return false;
  const target = new URL(href, document.baseURI).href;
  if(target === location.href) return true;
  window.location.assign(target);
  return true;
}

function hrefPathAndQuery(anchor){
  try{
    const u=new URL(anchor.getAttribute('href'),document.baseURI);
    return `${u.pathname.split('/').pop()}${u.search}`;
  }catch{return ''}
}

function setActiveAnchor(match){
  const anchors=[...document.querySelectorAll('.admin-sidebar a[href],.sidebar a[href]')];
  anchors.forEach(a=>a.classList.remove('active','current'));
  const target=anchors.find(a=>hrefPathAndQuery(a)===match) || anchors.find(a=>hrefPathAndQuery(a).split('?')[0]===match.split('?')[0]);
  if(target){
    if(target.closest('.admin-subnav,.side-subnav')) target.classList.add('current');
    else target.classList.add('active');
  }
  return target;
}

function closeAllDropdowns(){
  document.querySelectorAll('.admin-sidebar details,.sidebar details').forEach(d=>{
    d.removeAttribute('open');
    d.classList.remove('active');
  });
}

function openParentDropdown(anchor){
  const details=anchor?.closest('details');
  if(details){
    details.setAttribute('open','');
    details.classList.add('active');
  }
}



function readCurrentAdminForTopbar(){
  let admin={};
  try{admin=JSON.parse(localStorage.getItem('gotUNexRef.adminDashboard.v1')||'{}')||{}}catch{}
  const c=admin.options?.currentAdmin||admin.currentAdmin||{};
  const name=c.name||[c.firstName,c.lastName].filter(Boolean).join(' ')||'Super Admin';
  const role=c.role||c.title||'Administrator';
  const photo=c.photo||c.profilePhoto||c.avatar||'assets/profile-placeholder.svg';
  return {name,role,photo};
}

function createGlobalUserChip(){
  const info=readCurrentAdminForTopbar();
  const chip=document.createElement('a');
  chip.className='admin-global-user-chip';
  chip.href='admin-profile.html';
  chip.setAttribute('aria-label','Open Super Admin profile');
  const img=document.createElement('img');
  img.src=info.photo;
  img.alt='';
  const copy=document.createElement('span');
  copy.className='admin-global-user-copy';
  const strong=document.createElement('strong');
  strong.textContent=info.name;
  const role=document.createElement('span');
  role.textContent=info.role;
  copy.append(strong,role);
  chip.append(img,copy);
  return chip;
}

function findNativeUserControl(){
  return document.querySelector(
    '.section-topbar-tools .section-user-chip,'+
    '.workspace-toolbar .user-chip,'+
    '.utility-bar .user-chip,'+
    '.admin-topbar .admin-profile,'+
    '.admin-topbar .section-user-chip,'+
    '.admin-topbar .user-chip,'+
    '.admin-profile'
  );
}

function findWorkspaceForUtility(){
  return document.querySelector('.admin-workspace,.admin-add-workspace,.main,.module-workspace,.assignment-page') || document.body;
}

function placeDashboardCtaAtTopRight(){
  const cta=document.querySelector('.admin-dashboard-cta-global');
  if(!cta) return;
  cta.textContent='← ADMIN DASHBOARD';
  cta.setAttribute('aria-label','Back to Admin Dashboard');

  const nativeUser=findNativeUserControl();
  if(nativeUser){
    // Keep the dashboard CTA and Super Admin user control in one right-side group.
    // This prevents flex containers that use justify-content:space-between from
    // pushing the CTA to the far left while leaving the user control on the far right.
    let group=nativeUser.closest('.admin-dashboard-user-group');
    if(!group){
      const parent=nativeUser.parentElement;
      if(parent){
        group=document.createElement('div');
        group.className='admin-dashboard-user-group';
        parent.insertBefore(group,nativeUser);
        group.appendChild(nativeUser);
      }
    }
    if(group){
      group.insertBefore(cta,nativeUser);
      return;
    }
  }

  // Some detailed tools have no native user control. Create a single top-right utility row
  // so every admin section still has the Dashboard CTA immediately beside the Super Admin icon.
  let row=document.querySelector('.admin-global-utility-row');
  if(!row){
    row=document.createElement('div');
    row.className='admin-global-utility-row';
    const workspace=findWorkspaceForUtility();
    if(workspace===document.body){
      document.body.insertBefore(row,document.body.firstChild);
    }else{
      workspace.insertBefore(row,workspace.firstChild);
    }
  }
  let group=row.querySelector('.admin-dashboard-user-group');
  if(!group){
    group=document.createElement('div');
    group.className='admin-dashboard-user-group';
    row.appendChild(group);
  }
  group.appendChild(cta);
  if(!group.querySelector('.admin-global-user-chip')) group.appendChild(createGlobalUserChip());
}

function normalizeActiveState(){
  const file=location.pathname.split('/').pop()||'index.html';
  const qs=new URLSearchParams(location.search);
  const module=qs.get('module')||'';

  document.querySelectorAll('.admin-sidebar a[href],.sidebar a[href]').forEach(a=>a.classList.remove('active','current'));

  let match='';
  if(file==='admin-dashboard.html' || file==='index.html') match='admin-dashboard.html';
  else if(file==='admin-profile.html' || file==='edit-profile.html') match='admin-profile.html';
  else if(['admin-assignments.html','admin-master-schedule.html','tba-games.html','quick-assign.html','admin-game-assignments.html','admin-create-assignment.html'].includes(file)) match='admin-assignments.html';
  else if(file==='admin-schools.html' || (file==='admin-module.html' && ['schools','add-school-team','school-contacts'].includes(module))) match='admin-schools.html';
  else if(['admin-officials.html','admin-users.html','admin-add-user.html'].includes(file)) match='admin-officials.html';
  else if(file==='admin-availability.html' || file==='availability-report.html' || (file==='admin-module.html' && module==='availability')) match='admin-availability.html';
  else if(file==='admin-contracts.html' || file==='admin-contract-generator.html') match='admin-contracts.html';
  else if(file==='admin-invoices.html' || file==='admin-invoice-generator.html') match='admin-invoices.html';
  else if(file==='admin-payments.html' || (file==='admin-module.html' && module==='payments')) match='admin-payments.html';
  else if(file==='admin-tax-center.html' || (file==='admin-module.html' && module==='tax-center')) match='admin-tax-center.html';
  else if(file==='admin-reports.html' || (file==='admin-module.html' && ['reports','game-reports','referee-evaluations'].includes(module))) match='admin-reports.html';
  else if(file==='admin-resources.html' || (file==='admin-module.html' && module==='resources')) match='admin-resources.html';
  else if(file==='admin-messages.html' || (file==='admin-module.html' && module==='messages')) match='admin-messages.html';
  else if(file==='admin-notifications.html' || file==='notifications.html' || (file==='admin-module.html' && module==='notifications')) match='admin-notifications.html';
  else if(file==='admin-settings.html') match='admin-settings.html';
  else if(file==='admin-support.html' || (file==='admin-module.html' && module==='support')) match='admin-support.html';

  if(!match) return;
  setActiveAnchor(match);
}

// Capture navigation before page-specific bubble handlers can redirect to a wrong section.
document.addEventListener('click',event=>{
  if(isModifiedClick(event)) return;

  const navTarget = event.target.closest(LOCAL_NAV_SELECTOR);
  if(navTarget){
    const href=resolveDestination(navTarget);
    if(isLocalDestination(href)){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      go(href);
      return;
    }
  }

  const bell=event.target.closest('#topBellBtn');
  if(bell){
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    go('admin-notifications.html');
    return;
  }

  const profile=event.target.closest('.user-chip,.admin-profile');
  if(profile && !event.target.closest('input,select,textarea,button,a')){
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    go('admin-profile.html');
  }
},true);

document.addEventListener('DOMContentLoaded',()=>{placeDashboardCtaAtTopRight();normalizeActiveState();});
if(document.readyState!=='loading'){placeDashboardCtaAtTopRight();normalizeActiveState();}

window.GotUNexRefAdminNavigation={go,normalizeActiveState,placeDashboardCtaAtTopRight};
})();
