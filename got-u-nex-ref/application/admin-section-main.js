(()=>{
'use strict';
const ADMIN_KEY='gotUNexRef.adminDashboard.v1';
const $=(s,r=document)=>r.querySelector(s);
function load(){try{return JSON.parse(localStorage.getItem(ADMIN_KEY)||'null')||{}}catch{return{}}}
function info(){const a=load(),c=a.options?.currentAdmin||a.currentAdmin||{};return{admin:a,name:c.name||[c.firstName,c.lastName].filter(Boolean).join(' ')||'Super Admin',role:c.role||c.title||'Administrator',photo:c.photo||c.profilePhoto||c.avatar||'assets/profile-placeholder.svg'}}
function hydrate(){const x=info();const n=$('#sectionUserName'),r=$('#sectionUserRole'),p=$('#sectionUserAvatar'),b=$('#sectionBellCount');if(n)n.textContent=x.name;if(r)r.textContent=x.role;if(p)p.src=x.photo;if(b){const count=Array.isArray(x.admin.notifications)?x.admin.notifications.length:0;b.textContent=count;b.hidden=count===0}const sn=$('#sidebarNotificationCount'),sm=$('#sidebarMessageCount');if(sn){const c=Array.isArray(x.admin.notifications)?x.admin.notifications.length:0;sn.textContent=c;sn.hidden=c===0}if(sm){const c=Array.isArray(x.admin.messages)?x.admin.messages.length:0;sm.textContent=c;sm.hidden=c===0}}
document.addEventListener('click',e=>{if(e.target.closest('#sectionBellBtn'))location.href='admin-notifications.html';if(e.target.closest('#sectionUserChip'))location.href='admin-profile.html'});
hydrate();
window.addEventListener('storage',e=>{if(e.key===ADMIN_KEY)hydrate()});
})();
