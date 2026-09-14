(()=>{
'use strict';
const ADMIN_KEY='gotUNexRef.adminDashboard.v1', PORTAL_KEY='gotUNexRef.officialPortal.v3';
const frame=document.getElementById('invoiceGeneratorFrame');
const requestedView=new URLSearchParams(location.search).get('view')||'editor';
function load(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback}}
function context(){const admin=load(ADMIN_KEY,{users:[],options:{}}),portal=load(PORTAL_KEY,{profile:{},taxProfile:{},schools:[]});const current=admin.options?.currentAdmin||admin.currentAdmin||portal.profile||{};return{profile:current,taxProfile:portal.taxProfile||{},schools:admin.options?.schoolsTeams||admin.options?.schools||portal.schools||[],invoiceSettings:admin.options?.invoiceSettings||{}}}
function sendContext(){if(!frame?.contentWindow)return;frame.contentWindow.postMessage({type:'gunr-dashboard-context',payload:context()},'*');frame.contentWindow.postMessage({type:'rtbo-invoice-route',view:requestedView},'*')}
function updateHeader(){const c=context().profile||{};const name=c.name||[c.firstName,c.lastName].filter(Boolean).join(' ')||'Super Admin';document.getElementById('adminName').textContent=name;document.getElementById('adminInitials').textContent=(name.split(/\s+/).slice(0,2).map(s=>s[0]).join('')||'SA').toUpperCase();document.querySelectorAll('[data-invoice-view]').forEach(a=>a.classList.toggle('current',a.dataset.invoiceView===requestedView))}
window.addEventListener('message',e=>{if(e.data?.type==='rtbo-invoice-ready')sendContext()});
window.addEventListener('storage',e=>{if(e.key===ADMIN_KEY||e.key===PORTAL_KEY){updateHeader();sendContext()}});
frame.addEventListener('load',sendContext);updateHeader();
})();