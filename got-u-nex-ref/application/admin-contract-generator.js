(()=>{
'use strict';
const ADMIN_KEY='gotUNexRef.adminDashboard.v1';
const PORTAL_KEY='gotUNexRef.officialPortal.v3';
const frame=document.getElementById('contractGeneratorFrame');
function load(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback}}
function context(){
  const admin=load(ADMIN_KEY,{users:[],options:{},documents:[]});
  const portal=load(PORTAL_KEY,{profile:{},taxProfile:{},schools:[],documents:[]});
  const current=admin.options?.currentAdmin||admin.currentAdmin||portal.profile||{};
  return {profile:current,taxProfile:portal.taxProfile||{},schools:admin.options?.schoolsTeams||admin.options?.schools||portal.schools||[],users:Array.isArray(admin.users)?admin.users:[],officials:(Array.isArray(admin.users)?admin.users:[]).filter(u=>String(u.role||u.roleLabel||'').toLowerCase()==='official')};
}
function sendContext(){if(frame?.contentWindow)frame.contentWindow.postMessage({type:'gunr-dashboard-context',payload:context()},'*')}
function saveGeneratedDocument(payload){
  if(!payload||payload.source!=='contract-generator')return;
  const admin=load(ADMIN_KEY,{users:[],options:{},documents:[]});
  admin.documents=Array.isArray(admin.documents)?admin.documents:[];
  const doc={...payload,id:payload.sourceId||`contract-${Date.now()}`,updatedAt:new Date().toISOString()};
  const idx=admin.documents.findIndex(x=>x.id===doc.id||x.sourceId===doc.sourceId);
  if(idx>=0)admin.documents[idx]={...admin.documents[idx],...doc};else admin.documents.unshift(doc);
  localStorage.setItem(ADMIN_KEY,JSON.stringify(admin));
}
function updateHeader(){const c=context().profile||{};const name=c.name||[c.firstName,c.lastName].filter(Boolean).join(' ')||'Super Admin';document.getElementById('adminName').textContent=name;document.getElementById('adminInitials').textContent=(name.split(/\s+/).slice(0,2).map(s=>s[0]).join('')||'SA').toUpperCase()}
window.addEventListener('message',e=>{if(e.data?.type==='rtbo-contract-ready')sendContext();if(e.data?.type==='gunr-document-save')saveGeneratedDocument(e.data.payload)});
window.addEventListener('storage',e=>{if(e.key===ADMIN_KEY||e.key===PORTAL_KEY){updateHeader();sendContext()}});
frame.addEventListener('load',sendContext);updateHeader();
})();
