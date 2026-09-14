(()=>{
'use strict';
const KEY='gotUNexRef.adminDashboard.v1';
const $=(s,r=document)=>r.querySelector(s);
const state=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||{users:[],drafts:[],options:{}}}catch{return{users:[],drafts:[],options:{}}}})();
state.options=state.options||{};
const DEFAULT_INVOICE_SETTINGS={
  title:'Raising The Bar Officiating',
  slogan:'We Will Serve, And We Will Be Of Service To The Game',
  phone:'(501) 240-4961',
  email:'mrbballref1775@yahoo.com',
  website:'rtbofficating.com',
  invoicePrefix:'RTBO',
  logo:'rtbo',
  legalBusinessName:'Raising The Bar Officiating Inc.',
  dbaRaisingTheBarLabel:'Raising The Bar Officiating',
  dbaGotUNexRefLabel:'Got U Nex Ref'
};
state.options.invoiceSettings={...DEFAULT_INVOICE_SETTINGS,...(state.options.invoiceSettings||{})};
let timer;
function toast(m){const e=$('#toast');if(!e)return;e.textContent=m;e.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>e.classList.remove('show'),1700)}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function users(){return Array.isArray(state.users)?state.users:[]}
function persist(){localStorage.setItem(KEY,JSON.stringify(state))}
function initOverview(){
  const list=users();
  $('#statUsers').textContent=list.length;
  $('#statActive').textContent=list.filter(u=>u.security?.accountActive!==false).length;
  $('#statInvites').textContent=list.filter(u=>u.invitation?.status==='pending').length;
  $('#statDrafts').textContent=Array.isArray(state.drafts)?state.drafts.length:0;
  const body=$('#recentUsersBody'),empty=$('#recentUsersEmpty');
  const recent=[...list].sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||''))).slice(0,6);
  body.innerHTML=recent.map(u=>`<tr><td>${esc([u.firstName,u.lastName].filter(Boolean).join(' ')||u.email||'User')}</td><td>${esc(u.roleLabel||u.role||'')}</td><td>${esc(u.organizationLabel||u.organization||'')}</td><td><span class="status-pill ${u.security?.accountActive===false?'inactive':''}">${u.security?.accountActive===false?'Inactive':'Active'}</span></td></tr>`).join('');
  empty.hidden=recent.length>0;
  const counts=new Map();
  list.forEach(u=>{const r=u.roleLabel||u.role||'Unassigned';counts.set(r,(counts.get(r)||0)+1)});
  $('#roleDistribution').innerHTML=counts.size?[...counts.entries()].sort((a,b)=>b[1]-a[1]).map(([r,n])=>`<div class="role-row"><span>${esc(r)}</span><b>${n}</b></div>`).join(''):'<div class="role-empty">Role distribution will appear after users are created.</div>';
  document.querySelectorAll('[data-admin-hook]').forEach(btn=>btn.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('gotunexref:admin-navigation',{detail:{destination:btn.dataset.adminHook}}));toast(`${btn.textContent.trim()} workflow selected.`)}));
}
function invoiceSettings(){return state.options.invoiceSettings}
function fillSettingsForm(){
  const s=invoiceSettings();
  const map={
    settingInvoiceTitle:s.title,settingInvoiceSlogan:s.slogan,settingInvoicePhone:s.phone,settingInvoiceEmail:s.email,
    settingInvoiceWebsite:s.website,settingInvoicePrefix:s.invoicePrefix,settingInvoiceLogo:s.logo,
    settingLegalBusinessName:s.legalBusinessName,settingDbaRtbo:s.dbaRaisingTheBarLabel,settingDbaGunr:s.dbaGotUNexRefLabel
  };
  Object.entries(map).forEach(([id,value])=>{const el=$('#'+id);if(el)el.value=value||''});
  updateSettingsPreview();
}
function readSettingsForm(){
  return {
    title:$('#settingInvoiceTitle').value.trim(),
    slogan:$('#settingInvoiceSlogan').value.trim(),
    phone:$('#settingInvoicePhone').value.trim(),
    email:$('#settingInvoiceEmail').value.trim(),
    website:$('#settingInvoiceWebsite').value.trim(),
    invoicePrefix:$('#settingInvoicePrefix').value.trim().replace(/[^A-Za-z0-9-]/g,'').toUpperCase()||'RTBO',
    logo:$('#settingInvoiceLogo').value==='gotunexref'?'gotunexref':'rtbo',
    legalBusinessName:$('#settingLegalBusinessName').value.trim(),
    dbaRaisingTheBarLabel:$('#settingDbaRtbo').value.trim(),
    dbaGotUNexRefLabel:$('#settingDbaGunr').value.trim()
  };
}
function updateSettingsPreview(){
  if(!$('#settingsPreviewTitle'))return;
  const values={...invoiceSettings(),...readSettingsForm()};
  $('#settingsPreviewTitle').textContent=values.title;
  $('#settingsPreviewSlogan').textContent=values.slogan;
  $('#settingsPreviewPhone').textContent=values.phone;
  $('#settingsPreviewEmail').textContent=values.email;
  $('#settingsPreviewWebsite').textContent=values.website;
  $('#settingsPreviewLogo').src=values.logo==='gotunexref'?'assets/got-u-nex-ref-logo.png':'assets/rtbo-shield.png';
}
function bindSettings(){
  const form=$('#invoiceSettingsForm'); if(!form)return;
  fillSettingsForm();
  form.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',updateSettingsPreview));
  form.addEventListener('submit',e=>{
    e.preventDefault();
    state.options.invoiceSettings=readSettingsForm();
    persist();
    fillSettingsForm();
    $('#invoiceSettingsStatus').textContent='Saved. Invoice Generator header settings are synchronized.';
    toast('Invoice settings saved.');
  });
  $('#resetInvoiceSettings').addEventListener('click',()=>{
    state.options.invoiceSettings={...DEFAULT_INVOICE_SETTINGS};
    persist(); fillSettingsForm(); toast('Invoice settings reset to defaults.');
  });
}
function renderRoute(){
  const settings=location.hash==='#settings';
  $('#overviewPanel').hidden=settings;
  $('#settingsPanel').hidden=!settings;
  document.querySelectorAll('.admin-nav a').forEach(a=>a.classList.toggle('active',settings?a.getAttribute('href')?.endsWith('#settings'):a.getAttribute('href')==='admin-dashboard.html'));
  if(settings)fillSettingsForm();
}
function init(){persist();initOverview();bindSettings();renderRoute();document.querySelector('.admin-profile')?.addEventListener('click',()=>location.href='admin-profile.html')}
window.addEventListener('hashchange',renderRoute);
window.addEventListener('storage',e=>{if(e.key===KEY)location.reload()});
init();
})();
