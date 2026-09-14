
import { getSession } from '../../assets/auth.js';

const PUBLIC_PAGES = ['home', ''];
if (!PUBLIC_PAGES.includes(document.body?.dataset?.page)) {
  const session = await getSession();
  if (!session) window.location.href = '/account/index.html?view=signin';
}

(()=>{
 const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)];
 const page=document.body.dataset.page;
 const fmtMoney=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n||0));
 const fmtDate=v=>v?new Date(v).toLocaleString([], {dateStyle:'medium',timeStyle:'short'}):'—';
 const fmtDuration=s=>{s=Number(s||0);const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=Math.floor(s%60);return h?`${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${m}:${String(sec).padStart(2,'0')}`};
 const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
 function toast(msg){const t=$('[data-toast]');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2800)}
 function dl(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}
 function fileSize(n){if(!n)return'0 B';const u=['B','KB','MB','GB'];let i=0,v=n;while(v>=1024&&i<u.length-1){v/=1024;i++}return`${v.toFixed(v<10&&i?1:0)} ${u[i]}`}
 async function bindShell(){
  const header=$('[data-header]');
  const toggle=$('[data-menu-toggle]');
  const mobile=$('#crMobileNav');

  const closeMenu=()=>{
    mobile?.classList.remove('open');
    header?.classList.remove('menu-open');
    toggle?.setAttribute('aria-expanded','false');
  };

  toggle?.addEventListener('click',e=>{
    const open=!mobile?.classList.contains('open');
    mobile?.classList.toggle('open',open);
    header?.classList.toggle('menu-open',open);
    e.currentTarget.setAttribute('aria-expanded',String(open));
  });

  mobile?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  document.addEventListener('click',e=>{
    if(!header?.contains(e.target))closeMenu();
  });

  $$('[data-open-command]').forEach(b=>b.addEventListener('click',()=>{
    closeMenu();
    $('[data-command-dialog]')?.showModal();
  }));
  $$('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog')?.close()));
  $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));
 }
 async function dashboard(){
  const [films,markers,clips,evals,comments,activity]=await Promise.all(['films','markers','clips','evaluations','comments','activity'].map(s=>CuttingDB.all(s)));
  const full=films.filter(f=>f.type==='full-game'), videoBytes=films.reduce((n,f)=>n+(f.size||0),0);
  const vals={filmCount:films.length,fullGameCount:full.length,clipCount:clips.length,markerCount:markers.length,evaluationCount:evals.length,commentCount:comments.length,storageUsed:fileSize(videoBytes)};
  Object.entries(vals).forEach(([k,v])=>{const e=$(`[data-metric="${k}"]`);if(e)e.textContent=v});
  renderRecentFilms(films);
  renderActivity(activity);
 }
 function renderRecentFilms(films){const body=$('[data-recent-films]');if(!body)return;const rows=[...films].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,8);if(!rows.length){body.innerHTML='<tr><td colspan="6"><div class="empty-state"><strong>No film uploaded yet.</strong>Upload a clip or full game to begin.</div></td></tr>';return}body.innerHTML=rows.map(f=>`<tr><td><strong>${esc(f.title)}</strong><br><small class="muted">${esc(f.event||'')}</small></td><td>${esc(f.type==='full-game'?'Full Game':'Clip')}</td><td>${fmtDuration(f.duration)}</td><td>${fileSize(f.size)}</td><td><span class="status ${esc(f.status||'ready')}">${esc(f.status||'ready')}</span></td><td><a class="btn small secondary" href="review.html?film=${encodeURIComponent(f.id)}">Review</a></td></tr>`).join('')}
 function renderActivity(activity){const el=$('[data-activity-list]');if(!el)return;const rows=[...activity].sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,12);el.innerHTML=rows.length?rows.map(a=>`<div class="activity-row"><time>${fmtDate(a.at)}</time><strong>${esc(a.action)}</strong><small>${esc(a.detail||'')}</small></div>`).join(''):'<div class="empty-state"><strong>No activity yet.</strong>Actions taken in The Cutting Room will appear here.</div>'}
 async function uploadPage(){
  const drop=$('[data-upload-drop]'), input=$('#filmFile'), form=$('#uploadForm'), preview=$('[data-file-preview]');
  const pick=()=>input.click();drop?.addEventListener('click',pick);drop?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}});
  ['dragenter','dragover'].forEach(ev=>drop?.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('is-drag')}));['dragleave','drop'].forEach(ev=>drop?.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('is-drag')}));drop?.addEventListener('drop',e=>{if(e.dataTransfer.files[0]){input.files=e.dataTransfer.files;showFile(input.files[0])}});input?.addEventListener('change',()=>showFile(input.files[0]));
  function showFile(f){preview.textContent=f?`${f.name} · ${fileSize(f.size)} · ${f.type||'video file'}`:'No file selected'}
  form?.addEventListener('submit',async e=>{e.preventDefault();const f=input.files[0];if(!f){toast('Choose a video file first.');return}if(!f.type.startsWith('video/')){toast('Please choose a video file.');return}const fd=new FormData(form);const record={id:CuttingDB.id('film'),title:String(fd.get('title')||f.name).trim(),type:fd.get('type'),event:String(fd.get('event')||'').trim(),gameDate:fd.get('gameDate')||'',level:fd.get('level')||'',gender:fd.get('gender')||'',crew:String(fd.get('crew')||'').trim(),notes:String(fd.get('notes')||'').trim(),tags:String(fd.get('tags')||'').split(',').map(x=>x.trim()).filter(Boolean),status:'ready',name:f.name,mime:f.type,size:f.size,blob:f,createdAt:new Date().toISOString(),duration:0};
   try{const tmp=URL.createObjectURL(f),v=document.createElement('video');v.preload='metadata';await new Promise(resolve=>{v.onloadedmetadata=()=>{record.duration=Number.isFinite(v.duration)?v.duration:0;URL.revokeObjectURL(tmp);resolve()};v.onerror=()=>{URL.revokeObjectURL(tmp);resolve()};v.src=tmp});await CuttingDB.put('films',record);await CuttingDB.log('Film uploaded',record.title);form.reset();preview.textContent='No file selected';toast('Film added to The Cutting Room.');setTimeout(()=>location.href=`review.html?film=${encodeURIComponent(record.id)}`,550)}catch(err){console.error(err);toast('Upload could not be saved. Browser storage may be full.')}
  });
 }
 async function libraryPage(){const films=await CuttingDB.all('films');const q=$('#librarySearch'),type=$('#libraryType'),status=$('#libraryStatus'),sort=$('#librarySort');const render=()=>{let rows=[...films];const term=(q.value||'').toLowerCase();if(term)rows=rows.filter(f=>[f.title,f.event,f.level,f.crew,(f.tags||[]).join(' ')].join(' ').toLowerCase().includes(term));if(type.value)rows=rows.filter(f=>f.type===type.value);if(status.value)rows=rows.filter(f=>(f.status||'ready')===status.value);rows.sort((a,b)=>sort.value==='oldest'?new Date(a.createdAt)-new Date(b.createdAt):sort.value==='title'?a.title.localeCompare(b.title):new Date(b.createdAt)-new Date(a.createdAt));const body=$('[data-library-body]');body.innerHTML=rows.length?rows.map(f=>`<tr><td><strong>${esc(f.title)}</strong><br><small class="muted">${esc(f.event||'No event specified')}</small></td><td>${esc(f.type==='full-game'?'Full Game':'Clip')}</td><td>${esc(f.gameDate||'—')}</td><td>${fmtDuration(f.duration)}</td><td>${fileSize(f.size)}</td><td><span class="status ${esc(f.status||'ready')}">${esc(f.status||'ready')}</span></td><td><div class="page-actions"><a class="btn small primary" href="review.html?film=${encodeURIComponent(f.id)}">Open</a><button class="btn small secondary" data-film-download="${f.id}">Download</button><button class="btn small danger" data-film-delete="${f.id}">Delete</button></div></td></tr>`).join(''):'<tr><td colspan="7"><div class="empty-state"><strong>No matching film.</strong>Adjust the filters or upload film.</div></td></tr>';bindFilmRows(rows)};[q,type,status,sort].forEach(e=>e?.addEventListener('input',render));render();}
 function bindFilmRows(rows){$$('[data-film-download]').forEach(b=>b.addEventListener('click',async()=>{const f=await CuttingDB.get('films',b.dataset.filmDownload);if(f?.blob)dl(f.name||`${f.title}.mp4`,f.blob)}));$$('[data-film-delete]').forEach(b=>b.addEventListener('click',async()=>{const id=b.dataset.filmDelete,f=await CuttingDB.get('films',id);if(!confirm(`Delete “${f?.title||'this film'}” and its local video file?`))return;await CuttingDB.del('films',id);for(const s of ['markers','clips','evaluations','comments'])for(const r of await CuttingDB.all(s))if(r.filmId===id)await CuttingDB.del(s,r.id);await CuttingDB.log('Film deleted',f?.title||id);toast('Film deleted.');setTimeout(()=>location.reload(),350)}))}
 let currentFilm=null, currentUrl=null;
 async function reviewPage(){const films=await CuttingDB.all('films');const sel=$('#reviewFilm');sel.innerHTML='<option value="">Choose film…</option>'+films.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(f=>`<option value="${f.id}">${esc(f.title)}</option>`).join('');const param=new URLSearchParams(location.search).get('film');if(param&&films.some(f=>f.id===param))sel.value=param;sel.addEventListener('change',()=>loadFilm(sel.value));$('#markerForm')?.addEventListener('submit',saveMarker);$('#commentForm')?.addEventListener('submit',saveComment);$('#clipForm')?.addEventListener('submit',saveClip);$('#markIn')?.addEventListener('click',()=>{$('#clipIn').value=($('#reviewVideo')?.currentTime||0).toFixed(2)});$('#markOut')?.addEventListener('click',()=>{$('#clipOut').value=($('#reviewVideo')?.currentTime||0).toFixed(2)});$('#frameBack')?.addEventListener('click',()=>stepFrame(-1));$('#frameForward')?.addEventListener('click',()=>stepFrame(1));$('#speed')?.addEventListener('change',e=>{if($('#reviewVideo'))$('#reviewVideo').playbackRate=Number(e.target.value)});$('#copyTime')?.addEventListener('click',async()=>{const t=($('#reviewVideo')?.currentTime||0).toFixed(3);await navigator.clipboard?.writeText(t);toast(`Timecode ${t}s copied.`)});if(sel.value)loadFilm(sel.value);else renderNoReviewFilm()}
 function stepFrame(dir){const v=$('#reviewVideo');if(v&&v.src){v.pause();v.currentTime=Math.max(0,Math.min(v.duration||Infinity,v.currentTime+dir/30))}}
 async function loadFilm(id){if(currentUrl)URL.revokeObjectURL(currentUrl);currentFilm=id?await CuttingDB.get('films',id):null;const wrap=$('[data-review-video-wrap]');if(!currentFilm){renderNoReviewFilm();return}if(!currentFilm.blob){wrap.innerHTML='<div class="video-empty">Source video is not stored on this device. Re-upload the source file to review it.</div>';$('#reviewFilmTitle').textContent=currentFilm.title;$('#reviewFilmMeta').textContent='Metadata restored · source video missing';await Promise.all([renderMarkers(id),renderComments(id),renderClips(id)]);return}currentUrl=URL.createObjectURL(currentFilm.blob);wrap.innerHTML=`<video id="reviewVideo" controls playsinline preload="metadata" src="${currentUrl}"></video>`;$('#reviewFilmTitle').textContent=currentFilm.title;$('#reviewFilmMeta').textContent=[currentFilm.event,currentFilm.level,currentFilm.gameDate].filter(Boolean).join(' · ')||'Film ready for review';const v=$('#reviewVideo');v.addEventListener('timeupdate',()=>{$('[data-current-time]').textContent=fmtDuration(v.currentTime)});await Promise.all([renderMarkers(id),renderComments(id),renderClips(id)]);await CuttingDB.log('Film opened for review',currentFilm.title)}
 function renderNoReviewFilm(){const w=$('[data-review-video-wrap]');if(w)w.innerHTML='<div class="video-empty">Choose film from the library</div>';if($('#reviewFilmTitle'))$('#reviewFilmTitle').textContent='Review Studio';if($('#reviewFilmMeta'))$('#reviewFilmMeta').textContent='Select an uploaded clip or full game.';renderMarkers('');renderComments('');renderClips('')}
 async function saveMarker(e){e.preventDefault();if(!currentFilm){toast('Choose film first.');return}const fd=new FormData(e.currentTarget),v=$('#reviewVideo');const r={id:CuttingDB.id('mark'),filmId:currentFilm.id,time:(String(fd.get('time')||'').trim()===''?Number(v.currentTime||0):Number(fd.get('time'))),tag:String(fd.get('tag')||'Review').trim(),decision:String(fd.get('decision')||'').trim(),note:String(fd.get('note')||'').trim(),createdAt:new Date().toISOString()};await CuttingDB.put('markers',r);await CuttingDB.log('Review marker added',`${currentFilm.title} · ${r.tag}`);e.currentTarget.reset();await renderMarkers(currentFilm.id);toast('Marker saved.')}
 async function renderMarkers(id){const el=$('[data-marker-list]');if(!el)return;const rows=(await CuttingDB.all('markers')).filter(r=>r.filmId===id).sort((a,b)=>a.time-b.time);el.innerHTML=rows.length?rows.map(r=>`<div class="marker-item" data-marker-time="${r.time}"><strong><span>${esc(r.tag)}</span><span class="orange">${fmtDuration(r.time)}</span></strong>${r.decision?`<p><b>${esc(r.decision)}</b></p>`:''}${r.note?`<p>${esc(r.note)}</p>`:''}<button class="btn small danger" data-marker-delete="${r.id}">Delete</button></div>`).join(''):'<div class="empty-state"><strong>No markers yet.</strong>Pause on a play and add the first review marker.</div>';$$('[data-marker-time]',el).forEach(x=>x.addEventListener('click',e=>{if(e.target.closest('button'))return;const v=$('#reviewVideo');if(v){v.currentTime=Number(x.dataset.markerTime);v.play().catch(()=>{})}}));$$('[data-marker-delete]',el).forEach(b=>b.addEventListener('click',async()=>{await CuttingDB.del('markers',b.dataset.markerDelete);renderMarkers(id)}))}
 async function saveComment(e){e.preventDefault();if(!currentFilm){toast('Choose film first.');return}const fd=new FormData(e.currentTarget);const r={id:CuttingDB.id('com'),filmId:currentFilm.id,author:String(fd.get('author')||'Reviewer').trim(),role:fd.get('role')||'Official',body:String(fd.get('body')||'').trim(),time:Number($('#reviewVideo')?.currentTime||0),createdAt:new Date().toISOString()};if(!r.body)return;await CuttingDB.put('comments',r);await CuttingDB.log('Review comment added',currentFilm.title);e.currentTarget.reset();renderComments(currentFilm.id);toast('Comment saved.')}
 async function renderComments(id){const el=$('[data-comment-thread]');if(!el)return;const rows=(await CuttingDB.all('comments')).filter(r=>r.filmId===id).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));el.innerHTML=rows.length?rows.map(r=>`<div class="comment"><b>${esc(r.author)} · ${esc(r.role)}</b><p>${esc(r.body)}</p><small>${fmtDuration(r.time)} · ${fmtDate(r.createdAt)}</small></div>`).join(''):'<div class="empty-state"><strong>No comments yet.</strong>Use the review thread to document feedback.</div>'}
 async function saveClip(e){e.preventDefault();if(!currentFilm){toast('Choose film first.');return}const fd=new FormData(e.currentTarget),start=Number(fd.get('start')),end=Number(fd.get('end'));if(!(end>start)){toast('Clip out time must be after in time.');return}const r={id:CuttingDB.id('clip'),filmId:currentFilm.id,title:String(fd.get('title')||`${currentFilm.title} clip`).trim(),start,end,note:String(fd.get('note')||'').trim(),createdAt:new Date().toISOString()};await CuttingDB.put('clips',r);await CuttingDB.log('Clip range created',r.title);e.currentTarget.reset();renderClips(currentFilm.id);toast('Clip range saved.')}
 async function renderClips(id){const el=$('[data-clip-list]');if(!el)return;const rows=(await CuttingDB.all('clips')).filter(r=>r.filmId===id).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));el.innerHTML=rows.length?rows.map(r=>`<div class="marker-item" data-clip-play="${r.id}"><strong><span>${esc(r.title)}</span><span class="cyan">${fmtDuration(r.start)}–${fmtDuration(r.end)}</span></strong>${r.note?`<p>${esc(r.note)}</p>`:''}<div class="packet-actions"><button class="btn small primary" data-play-range="${r.id}">Play Range</button><button class="btn small secondary" data-export-edl="${r.id}">Export EDL</button></div></div>`).join(''):'<div class="empty-state"><strong>No clip ranges yet.</strong>Set IN and OUT points to create study clips without altering the source file.</div>';$$('[data-play-range]',el).forEach(b=>b.addEventListener('click',async()=>{const r=await CuttingDB.get('clips',b.dataset.playRange),v=$('#reviewVideo');if(!v)return;v.currentTime=r.start;v.play();const stop=()=>{if(v.currentTime>=r.end){v.pause();v.removeEventListener('timeupdate',stop)}};v.addEventListener('timeupdate',stop)}));$$('[data-export-edl]',el).forEach(b=>b.addEventListener('click',async()=>{const r=await CuttingDB.get('clips',b.dataset.exportEdl);dl(`${r.title.replace(/[^a-z0-9_-]+/gi,'_')}.json`,new Blob([JSON.stringify({format:'RTBO Cutting Room Clip EDL',filmId:r.filmId,title:r.title,in:r.start,out:r.end,note:r.note},null,2)],{type:'application/json'}))}))}
 async function evaluationsPage(){const films=await CuttingDB.all('films'),sel=$('#evalFilm');sel.innerHTML='<option value="">Choose film…</option>'+films.map(f=>`<option value="${f.id}">${esc(f.title)}</option>`).join('');$$('[data-score]').forEach(i=>{const o=$(`[data-output="${i.name}"]`);const sync=()=>o.textContent=i.value;i.addEventListener('input',sync);sync()});$('#evaluationForm')?.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);if(!fd.get('filmId')){toast('Choose film for this evaluation.');return}const r={id:CuttingDB.id('eval'),filmId:fd.get('filmId'),evaluator:String(fd.get('evaluator')||'').trim(),role:fd.get('role'),status:fd.get('status'),scores:{mechanics:Number(fd.get('mechanics')),positioning:Number(fd.get('positioning')),communication:Number(fd.get('communication')),professionalism:Number(fd.get('professionalism')),rules:Number(fd.get('rules'))},strengths:String(fd.get('strengths')||'').trim(),development:String(fd.get('development')||'').trim(),summary:String(fd.get('summary')||'').trim(),createdAt:new Date().toISOString()};r.average=Object.values(r.scores).reduce((a,b)=>a+b,0)/5;await CuttingDB.put('evaluations',r);await CuttingDB.log('Evaluation saved',`Average ${r.average.toFixed(1)}`);e.currentTarget.reset();$$('[data-score]').forEach(i=>i.dispatchEvent(new Event('input')));renderEvaluations();toast('Evaluation saved.')});renderEvaluations()}
 async function renderEvaluations(){const films=await CuttingDB.all('films'),map=Object.fromEntries(films.map(f=>[f.id,f]));const rows=(await CuttingDB.all('evaluations')).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));const body=$('[data-evaluations-body]');if(!body)return;body.innerHTML=rows.length?rows.map(r=>`<tr><td><strong>${esc(map[r.filmId]?.title||'Film unavailable')}</strong></td><td>${esc(r.evaluator||'—')}<br><small class="muted">${esc(r.role||'')}</small></td><td><strong class="orange">${r.average.toFixed(1)}</strong> / 5</td><td><span class="status ${esc(r.status)}">${esc(r.status)}</span></td><td>${fmtDate(r.createdAt)}</td><td><button class="btn small secondary" data-eval-export="${r.id}">Export</button></td></tr>`).join(''):'<tr><td colspan="6"><div class="empty-state"><strong>No evaluations yet.</strong>Create an evaluation from uploaded film.</div></td></tr>';$$('[data-eval-export]').forEach(b=>b.addEventListener('click',async()=>{const r=await CuttingDB.get('evaluations',b.dataset.evalExport);dl(`evaluation-${r.id}.json`,new Blob([JSON.stringify(r,null,2)],{type:'application/json'}))}))}
 async function collaborationPage(){const films=await CuttingDB.all('films'),sel=$('#packetFilm');sel.innerHTML='<option value="">Choose film…</option>'+films.map(f=>`<option value="${f.id}">${esc(f.title)}</option>`).join('');$('#packetForm')?.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(e.currentTarget),filmId=fd.get('filmId');if(!filmId){toast('Choose film first.');return}const r={id:CuttingDB.id('packet'),filmId,title:String(fd.get('title')||'Review Packet').trim(),recipients:String(fd.get('recipients')||'').split(',').map(x=>x.trim()).filter(Boolean),message:String(fd.get('message')||'').trim(),includeMarkers:fd.get('includeMarkers')==='on',includeComments:fd.get('includeComments')==='on',includeEvaluations:fd.get('includeEvaluations')==='on',createdAt:new Date().toISOString()};await CuttingDB.put('packets',r);await CuttingDB.log('Review packet created',r.title);e.currentTarget.reset();renderPackets();toast('Review packet created.')});$('#importPacketInput')?.addEventListener('change',importPacket);renderPackets()}
 async function packetPayload(r){const f=await CuttingDB.get('films',r.filmId);return {format:'RTBO Cutting Room Review Packet',version:1,packet:r,film:f?{...f,blob:undefined}:null,markers:r.includeMarkers?(await CuttingDB.all('markers')).filter(x=>x.filmId===r.filmId):[],comments:r.includeComments?(await CuttingDB.all('comments')).filter(x=>x.filmId===r.filmId):[],evaluations:r.includeEvaluations?(await CuttingDB.all('evaluations')).filter(x=>x.filmId===r.filmId):[]}}
 async function renderPackets(){const films=await CuttingDB.all('films'),map=Object.fromEntries(films.map(f=>[f.id,f]));const rows=(await CuttingDB.all('packets')).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)),el=$('[data-packet-list]');if(!el)return;el.innerHTML=rows.length?rows.map(r=>`<article class="card packet-card"><p class="eyebrow">REVIEW PACKET</p><h3>${esc(r.title)}</h3><p>${esc(map[r.filmId]?.title||'Film unavailable')}</p><p>Recipients: ${esc(r.recipients.join(', ')||'Not specified')}</p><div class="packet-actions"><button class="btn small primary" data-packet-download="${r.id}">Download Packet</button><button class="btn small secondary" data-packet-share="${r.id}">Share</button><button class="btn small danger" data-packet-delete="${r.id}">Delete</button></div></article>`).join(''):'<div class="empty-state"><strong>No review packets yet.</strong>Create a packet to exchange markers, comments, and evaluations as a portable JSON file.</div>';$$('[data-packet-download]').forEach(b=>b.addEventListener('click',async()=>{const r=await CuttingDB.get('packets',b.dataset.packetDownload),p=await packetPayload(r);dl(`${r.title.replace(/[^a-z0-9_-]+/gi,'_')}.json`,new Blob([JSON.stringify(p,null,2)],{type:'application/json'}))}));$$('[data-packet-share]').forEach(b=>b.addEventListener('click',async()=>{const r=await CuttingDB.get('packets',b.dataset.packetShare),p=await packetPayload(r),file=new File([JSON.stringify(p,null,2)],`${r.title}.json`,{type:'application/json'});if(navigator.canShare?.({files:[file]}))await navigator.share({title:r.title,text:r.message,files:[file]});else{dl(file.name,file);toast('Web Share is unavailable; packet downloaded instead.')}}));$$('[data-packet-delete]').forEach(b=>b.addEventListener('click',async()=>{await CuttingDB.del('packets',b.dataset.packetDelete);renderPackets()}))}
 async function importPacket(e){const f=e.target.files[0];if(!f)return;try{const p=JSON.parse(await f.text());if(p.format!=='RTBO Cutting Room Review Packet')throw new Error();if(p.packet)await CuttingDB.put('packets',{...p.packet,id:CuttingDB.id('packet'),createdAt:new Date().toISOString()});for(const [store,key] of [['markers','markers'],['comments','comments'],['evaluations','evaluations']])for(const r of (p[key]||[]))await CuttingDB.put(store,{...r,id:CuttingDB.id(store.slice(0,3))});await CuttingDB.log('Review packet imported',p.packet?.title||f.name);toast('Review packet imported.');renderPackets()}catch{toast('That file is not a valid Cutting Room review packet.')}finally{e.target.value=''}}
 async function downloadsPage(){const [films,clips,evals,packets]=await Promise.all(['films','clips','evaluations','packets'].map(s=>CuttingDB.all(s)));const body=$('[data-download-body]');const rows=[];films.forEach(f=>rows.push({kind:'Video Source',title:f.title,detail:`${fileSize(f.size)} · ${f.name}`,id:f.id,action:'film'}));clips.forEach(c=>rows.push({kind:'Clip EDL',title:c.title,detail:`${fmtDuration(c.start)}–${fmtDuration(c.end)}`,id:c.id,action:'clip'}));evals.forEach(e=>rows.push({kind:'Evaluation',title:`Evaluation · ${e.average.toFixed(1)}/5`,detail:fmtDate(e.createdAt),id:e.id,action:'eval'}));packets.forEach(p=>rows.push({kind:'Review Packet',title:p.title,detail:`${p.recipients.length} recipient(s)`,id:p.id,action:'packet'}));body.innerHTML=rows.length?rows.map(r=>`<tr><td>${esc(r.kind)}</td><td><strong>${esc(r.title)}</strong><br><small class="muted">${esc(r.detail)}</small></td><td><button class="btn small primary" data-download-kind="${r.action}" data-download-id="${r.id}">Download</button></td></tr>`).join(''):'<tr><td colspan="3"><div class="empty-state"><strong>No downloadable records yet.</strong>Upload film or create review records first.</div></td></tr>';$$('[data-download-kind]').forEach(b=>b.addEventListener('click',()=>downloadRecord(b.dataset.downloadKind,b.dataset.downloadId)));$('#exportAll')?.addEventListener('click',exportBackup)}
 async function downloadRecord(kind,id){if(kind==='film'){const f=await CuttingDB.get('films',id);if(f?.blob)dl(f.name||`${f.title}.mp4`,f.blob)}else if(kind==='clip'){const r=await CuttingDB.get('clips',id);dl(`${r.title}.json`,new Blob([JSON.stringify(r,null,2)],{type:'application/json'}))}else if(kind==='eval'){const r=await CuttingDB.get('evaluations',id);dl(`evaluation-${id}.json`,new Blob([JSON.stringify(r,null,2)],{type:'application/json'}))}else if(kind==='packet'){const r=await CuttingDB.get('packets',id),p=await packetPayload(r);dl(`${r.title}.json`,new Blob([JSON.stringify(p,null,2)],{type:'application/json'}))}}
 async function exportBackup(){const data=await CuttingDB.exportAll();const safe={...data,stores:{...data.stores,films:data.stores.films.map(f=>({...f,blob:undefined,blobOmitted:true}))}};dl(`cutting-room-backup-${new Date().toISOString().slice(0,10)}.json`,new Blob([JSON.stringify(safe,null,2)],{type:'application/json'}));toast('Metadata backup exported. Video blobs are downloaded separately.')}
 async function settingsPage(){const est=await CuttingDB.estimate(),pct=est.quota?Math.min(100,(est.usage/est.quota)*100):0;$('[data-storage-used]').textContent=fileSize(est.usage||0);$('[data-storage-quota]').textContent=fileSize(est.quota||0);$('[data-storage-meter]').style.width=`${pct}%`;$('#backupBtn')?.addEventListener('click',exportBackup);$('#restoreInput')?.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{await CuttingDB.importAll(JSON.parse(await f.text()),false);await CuttingDB.log('Metadata backup restored',f.name);toast('Backup restored. Video files must be re-uploaded separately.')}catch{toast('Backup could not be restored.')}e.target.value=''});$('#clearMetadata')?.addEventListener('click',async()=>{if(!confirm('Delete all Cutting Room data stored in this browser, including uploaded video files?'))return;for(const s of CuttingDB.STORES)await CuttingDB.clear(s);toast('Local Cutting Room data cleared.');setTimeout(()=>location.reload(),400)});const activity=await CuttingDB.all('activity');renderActivity(activity)}
 async function homePage(){/* Hero presentation remains fixed to the approved reference copy. */}
 
function initAngleGallerySlider(){
  const root=document.querySelector('[data-angle-slider]');
  if(!root)return;
  const viewport=root.querySelector('[data-angle-viewport]');
  const track=root.querySelector('[data-angle-track]');
  const prev=root.querySelector('[data-angle-prev]');
  const next=root.querySelector('[data-angle-next]');
  if(!viewport||!track)return;

  const originals=Array.from(track.querySelectorAll('[data-angle-card]'));
  if(!originals.length)return;

  // Repeat the full image set for looping; the viewport displays exactly five cards at once on desktop.
  originals.forEach(card=>track.append(card.cloneNode(true)));
  [...originals].reverse().forEach(card=>track.prepend(card.cloneNode(true)));

  let cards=Array.from(track.children);
  let centerStart=originals.length;
  let index=centerStart;
  let busy=false;
  let timer=null;

  const gap=()=>{
    const style=getComputedStyle(track);
    return parseFloat(style.columnGap||style.gap||'0')||0;
  };
  const step=()=>cards[0].getBoundingClientRect().width+gap();

  const setPosition=(animate=true)=>{
    track.style.transition=animate?'transform .48s cubic-bezier(.22,.61,.36,1)':'none';
    track.style.transform=`translate3d(${-index*step()}px,0,0)`;
  };

  const normalize=()=>{
    if(index>=centerStart+originals.length){
      index=centerStart;
      setPosition(false);
      requestAnimationFrame(()=>requestAnimationFrame(()=>{track.style.transition='';}));
    }else if(index<centerStart){
      index=centerStart+originals.length-1;
      setPosition(false);
      requestAnimationFrame(()=>requestAnimationFrame(()=>{track.style.transition='';}));
    }
  };

  const move=(delta)=>{
    if(busy)return;
    busy=true;
    index+=delta;
    setPosition(true);
    window.setTimeout(()=>{
      normalize();
      busy=false;
    },520);
  };

  const restartAuto=()=>{
    if(timer)clearInterval(timer);
    timer=setInterval(()=>move(1),4200);
  };

  prev?.addEventListener('click',()=>{move(-1);restartAuto()});
  next?.addEventListener('click',()=>{move(1);restartAuto()});
  root.addEventListener('mouseenter',()=>{if(timer)clearInterval(timer)});
  root.addEventListener('mouseleave',restartAuto);
  root.addEventListener('focusin',()=>{if(timer)clearInterval(timer)});
  root.addEventListener('focusout',restartAuto);

  let startX=0;
  viewport.addEventListener('pointerdown',e=>{
    startX=e.clientX;
    viewport.setPointerCapture?.(e.pointerId);
  });
  viewport.addEventListener('pointerup',e=>{
    const dx=e.clientX-startX;
    if(Math.abs(dx)>45){
      move(dx<0?1:-1);
      restartAuto();
    }
  });

  window.addEventListener('resize',()=>setPosition(false));
  requestAnimationFrame(()=>setPosition(false));
  restartAuto();
}

async function init(){await bindShell();
  initAngleGallerySlider();const map={home:homePage,dashboard,upload:uploadPage,library:libraryPage,review:reviewPage,evaluations:evaluationsPage,collaboration:collaborationPage,downloads:downloadsPage,settings:settingsPage};try{await (map[page]?.())}catch(err){console.error(err);toast('The Cutting Room could not load part of this page.') }}
 window.addEventListener('DOMContentLoaded',init);window.addEventListener('beforeunload',()=>{if(currentUrl)URL.revokeObjectURL(currentUrl)});
})();
