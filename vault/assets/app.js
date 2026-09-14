
import { supabase, getSession, signIn, requireRole } from '../../assets/auth.js';

const ADMIN_ONLY_PAGES = ['admin.html','users.html','roles.html','billing.html','organization-settings.html','integrations.html','audit.html','storage.html'];
const currentPage = location.pathname.split('/').pop() || 'index.html';
const isLoginPage = currentPage === 'login.html';

if (!isLoginPage) {
  if (ADMIN_ONLY_PAGES.includes(currentPage)) {
    await requireRole([], '/vault/login.html');
  } else {
    const session = await getSession();
    if (!session) window.location.href = '/vault/login.html';
  }
}

(() => {
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k,d=[]){try{return JSON.parse(localStorage.getItem('vault:'+k))??d}catch{return d}},set(k,v){localStorage.setItem('vault:'+k,JSON.stringify(v))}};
const fmtBytes=n=>{if(!Number.isFinite(n))return '—';const u=['B','KB','MB','GB','TB'];let i=0,v=n;while(v>=1024&&i<u.length-1){v/=1024;i++}return `${v.toFixed(i?2:0)} ${u[i]}`};
const stamp=()=>new Date().toLocaleString();
function updateClock(){const e=$('#studioClock');if(e)e.textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});}updateClock();setInterval(updateClock,1000);
function toast(msg){let t=$('#vaultToast');if(!t){t=document.createElement('div');t.id='vaultToast';Object.assign(t.style,{position:'fixed',right:'18px',bottom:'18px',zIndex:5000,padding:'13px 16px',background:'#121415',border:'1px solid rgba(204,85,0,.7)',borderRadius:'7px',color:'#fff',fontSize:'.75rem',boxShadow:'0 16px 46px rgba(0,0,0,.5)'});document.body.append(t)}t.textContent=msg;t.hidden=false;clearTimeout(t._timer);t._timer=setTimeout(()=>t.hidden=true,2600)}
function renderCounts(){const ups=store.get('uploads'), dls=store.get('downloads');$$('[data-count="uploads"]').forEach(e=>e.textContent=ups.filter(x=>x.status!=='READY').length);$$('[data-count="downloads"]').forEach(e=>e.textContent=dls.filter(x=>x.status!=='COMPLETED').length)}
function addUpload(file,meta={}){const uploads=store.get('uploads');uploads.unshift({id:crypto.randomUUID?.()||String(Date.now()),filename:file.name,size:file.size,type:file.type||file.name.split('.').pop()?.toUpperCase()||'VIDEO',event:meta.event||'',date:meta.date||'',sport:meta.sport||'',angle:meta.angle||'',status:'QUEUED',progress:0,created:stamp()});store.set('uploads',uploads);renderIngest();renderCounts();toast('Ingest job added to the local queue.');}
function renderIngest(){const tb=$('#ingestQueue'), empty=$('#ingestEmpty');if(!tb)return;const rows=store.get('uploads');tb.innerHTML=rows.map(x=>`<tr><td>${esc(x.filename)}</td><td>${esc(x.event)}</td><td>${esc(x.date)}</td><td>${esc(x.angle||'—')}</td><td>${esc(x.type)}</td><td>${fmtBytes(x.size)}</td><td>${esc(x.status)}</td><td class="progress-cell"><div class="progress-bar"><i style="width:${x.progress}%"></i></div></td></tr>`).join('');if(empty)empty.hidden=rows.length>0;}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
const gDialog=$('#globalUploadDialog');$$('#open-global-upload,[id="open-global-upload"]').forEach(b=>b?.addEventListener('click',e=>{e.preventDefault();gDialog?.showModal()}));
$('#globalUploadForm')?.addEventListener('submit',e=>{const f=$('#globalUploadFile')?.files?.[0];if(!f){e.preventDefault();return}addUpload(f,{event:$('#globalUploadEvent').value,date:$('#globalUploadDate').value,sport:$('#globalUploadSport').value,angle:$('#globalUploadAngle').value});});
$('#ingestForm')?.addEventListener('submit',e=>{e.preventDefault();const files=[...$('#ingestFile').files];files.forEach(f=>addUpload(f,{event:$('#ingestEvent').value,date:$('#ingestDate').value,sport:$('#ingestSport').value,angle:$('#ingestAngle').value}));e.target.reset();});
function progressUploads(){const rows=store.get('uploads');let dirty=false;rows.forEach(x=>{if(x.progress<100){x.progress=Math.min(100,x.progress+Math.ceil(Math.random()*8));x.status=x.progress<18?'UPLOADING':x.progress<30?'VERIFYING':x.progress<42?'INGESTING':x.progress<62?'TRANSCODING':x.progress<78?'GENERATING PROXIES':x.progress<92?'INDEXING':'READY';dirty=true}});if(dirty){store.set('uploads',rows);renderIngest();renderCounts()}}setInterval(progressUploads,2200);
function renderDownloads(){const tb=$('#downloadQueue'), empty=$('#downloadEmpty');if(!tb)return;const rows=store.get('downloads');tb.innerHTML=rows.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.date)}</td><td>${esc(x.source)}</td><td>${esc(x.angle||'—')}</td><td>${esc(x.format)}</td><td>${esc(x.size||'Pending')}</td><td>${esc(x.requested)}</td><td>${esc(x.status)}</td><td class="progress-cell"><div class="progress-bar"><i style="width:${x.progress}%"></i></div></td><td>${esc(x.time||'—')}</td><td>${esc(x.destination)}</td></tr>`).join('');if(empty)empty.hidden=rows.length>0;}
$('#downloadForm')?.addEventListener('submit',e=>{e.preventDefault();const rows=store.get('downloads');rows.unshift({id:crypto.randomUUID?.()||String(Date.now()),name:$('#dlName').value,date:$('#dlDate').value,source:$('#dlSource').value,angle:$('#dlAngle').value,format:$('#dlFormat').value,resolution:$('#dlResolution').value,size:$('#dlSize').value,destination:$('#dlDestination').value,requested:stamp(),status:'QUEUED',progress:0,time:'—'});store.set('downloads',rows);e.target.reset();renderDownloads();renderCounts();$('.form-status',e.target).textContent='Export job added to the local transfer queue.';});
function progressDownloads(){const rows=store.get('downloads');let dirty=false;rows.forEach(x=>{if(x.progress<100){x.progress=Math.min(100,x.progress+Math.ceil(Math.random()*6));x.status=x.progress<20?'PREPARING':x.progress<45?'RENDERING':x.progress<62?'PACKAGING':x.progress<75?'READY':x.progress<100?'DOWNLOADING':'COMPLETED';if(x.progress===100)x.time='Completed '+new Date().toLocaleTimeString();dirty=true}});if(dirty){store.set('downloads',rows);renderDownloads();renderCounts()}}setInterval(progressDownloads,2500);
$$('[data-local-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const key=form.dataset.localForm;const rows=store.get(key);rows.unshift({at:stamp(),data:Object.fromEntries(new FormData(form).entries())});store.set(key,rows);$('.form-status',form).textContent='Saved locally in this browser. Connect the production backend before deployment.';toast('Saved locally.')}));
$$('[data-auth-demo]').forEach(form=>form.addEventListener('submit',async e=>{
  e.preventDefault();
  const status=$('.form-status',form);
  const data=new FormData(form);
  const email=String(data.get('email')||'').trim(), password=String(data.get('password')||'');
  if(!email||!password){status.textContent='Email and password are required.';return}
  status.textContent='Signing in…';
  const { error } = await signIn({ email, password });
  if(error){status.textContent=error.message;return}
  status.textContent='Signed in.';
  window.location.href='dashboard.html';
}));
const createDialog=$('#createDialog'), createForm=$('#createDialogForm');let createKind='Item';function openCreate(kind){createKind=kind;$('#createDialogTitle').textContent='Create '+kind;$('#createName').value='';$('#createNotes').value='';createDialog?.showModal()}
$$('[data-create-kind]').forEach(b=>b.addEventListener('click',()=>openCreate(b.dataset.createKind)));$$('#create-event,[id="create-event"]').forEach(b=>b?.addEventListener('click',()=>openCreate('Event')));createForm?.addEventListener('submit',e=>{const rows=store.get('created:'+createKind);rows.unshift({name:$('#createName').value,notes:$('#createNotes').value,created:stamp()});store.set('created:'+createKind,rows);toast(createKind+' saved locally.');});
$$('[data-save-demo]').forEach(b=>b.addEventListener('click',()=>{const st=b.parentElement?.querySelector('.form-status');if(st)st.textContent='Configuration staged locally. Connect backend authorization before deployment.';toast('Configuration staged locally.')}));
$$('[data-mark]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.mark==='in'?'#markIn':'#markOut';const out=$(id);if(out){const now=new Date();out.value=`00:00:${String(now.getSeconds()).padStart(2,'0')}:00`}}));
$('#clipForm')?.addEventListener('submit',e=>{e.preventDefault();const clips=store.get('clips');clips.unshift({name:$('#clipName').value,category:$('#clipCategory').value,tags:$('#clipTags').value,notes:$('#clipNotes').value,markIn:$('#markIn').value,markOut:$('#markOut').value,created:stamp()});store.set('clips',clips);$('.form-status',e.target).textContent='Clip metadata saved locally. Source media lineage requires the production media backend.';toast('Clip metadata saved.');});
$('#open-film-room')?.addEventListener('click',()=>location.href='film-room.html');
// Command palette
const pageMap=[['Dashboard','dashboard.html'],['Media Library','media-library.html'],['Ingest Center','ingest.html'],['Events','events.html'],['Film Room','film-room.html'],['Clip Editor','clip-editor.html'],['Clip Library','clips.html'],['Playlists','playlists.html'],['Analysis Center','analysis.html'],['Scouting Center','scouting.html'],['Officiating Film Room','officiating.html'],['Projects','projects.html'],['Vault Live','live.html'],['Control Room','control-room.html'],['Download Center','downloads.html'],['Share Center','shared.html'],['Email Delivery','email-delivery.html'],['Archive','archive.html'],['Search','search.html'],['Notifications','notifications.html'],['Users','users.html'],['Teams','teams.html'],['Roles & Permissions','roles.html'],['Integrations','integrations.html'],['Storage','storage.html'],['Billing','billing.html'],['Organization Settings','organization-settings.html'],['Profile','profile.html'],['Support','support.html'],['Platform Administration','admin.html'],['Customer CMS','cms.html'],['Audit Activity','audit.html']];
const overlay=$('#commandOverlay'), ci=$('#commandInput'), cr=$('#commandResults');function renderCommands(q=''){const s=q.toLowerCase();cr.innerHTML=pageMap.filter(([n])=>n.toLowerCase().includes(s)).map(([n,h])=>`<a href="${h}"><strong>${n}</strong><span>${h}</span></a>`).join('')||'<div class="empty-state"><h3>No workspace match</h3></div>'}function openCommand(){overlay.hidden=false;renderCommands();setTimeout(()=>ci.focus(),0)}function closeCommand(){overlay.hidden=true}$$('[data-command-open]').forEach(b=>b.addEventListener('click',openCommand));$('#closeCommand')?.addEventListener('click',closeCommand);ci?.addEventListener('input',()=>renderCommands(ci.value));document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();overlay.hidden?openCommand():closeCommand()}if(e.key==='/'&&document.activeElement?.tagName!=='INPUT'&&document.activeElement?.tagName!=='TEXTAREA'){e.preventDefault();openCommand()}if(e.key==='Escape'&&!overlay.hidden)closeCommand()});overlay?.addEventListener('click',e=>{if(e.target===overlay)closeCommand()});
renderIngest();renderDownloads();renderCounts();
})();
