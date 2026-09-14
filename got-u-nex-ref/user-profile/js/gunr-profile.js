const games=[]; let tab='Pending';
function render(){const root=document.getElementById('games');const list=games.filter(g=>tab==='All'||g.status===tab);root.innerHTML=list.length?list.map(g=>`<article class="game"><div class="datebox"><span class="pos">${g.pos}</span><b>${g.date}</b><span>${g.time}</span></div><div><span class="status ${g.status.toLowerCase()}">${g.status}</span><h3>${g.game}</h3><p>⌖ ${g.venue} · ${g.fee}</p></div><div class="gameactions"><button class="btn">Game Details</button>${g.status==='Pending'?`<button class="btn green" onclick="setStatus(${g.id},'Accepted')">✓ Accept</button><button class="btn red" onclick="setStatus(${g.id},'Declined')">⊗ Decline</button>`:g.status==='Accepted'?'<button class="btn orange">⌖ Game Day</button>':''}</div></article>`).join(''):'<div class="empty">No '+tab.toLowerCase()+' games to display.</div>';document.getElementById('pendingMetric').textContent=String(games.filter(g=>g.status==='Pending').length).padStart(2,'0');document.getElementById('acceptedMetric').textContent=String(games.filter(g=>g.status==='Accepted').length).padStart(2,'0');document.querySelectorAll('.tab').forEach(b=>{const s=b.dataset.tab==='All'?games.length:games.filter(g=>g.status===b.dataset.tab).length;b.querySelector('span').textContent=s})}
function setStatus(id,status){games.find(g=>g.id===id).status=status;render()} document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));render()});render();
document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.open).classList.add('open'));document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('.modal').classList.remove('open'));document.querySelectorAll('.modal').forEach(m=>m.onclick=e=>{if(e.target===m)m.classList.remove('open')});
document.getElementById('markRead').onclick=()=>{document.querySelectorAll('#notificationsList .itemdot').forEach(d=>d.style.background='#424950');document.getElementById('markRead').textContent='All read'};
document.getElementById('availabilityForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const div=document.createElement('div');div.className='av';div.innerHTML=`<div class="avtop"><div class="dot ${f.get('type')==='Blocked'?'blocked':''}"></div><span class="status ${f.get('type')==='Blocked'?'declined':'accepted'}">${f.get('type')}</span></div><b>${f.get('date')}</b><small>${f.get('start')} – ${f.get('end')}</small>`;document.getElementById('availabilityEmpty')?.remove();document.getElementById('availabilityGrid').prepend(div);e.target.closest('.modal').classList.remove('open');e.target.reset()};
document.getElementById('profileForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const first=String(f.get('first')||'').trim(),last=String(f.get('last')||'').trim(),preferred=String(f.get('preferred')||'').trim();document.getElementById('heroProfileName').textContent=((preferred||first)+' '+last).trim()||'Your Profile';document.getElementById('profileName').textContent=(first+' '+last).trim()||'Not added';document.getElementById('profileEmail').textContent=String(f.get('email')||'Not added');document.getElementById('heroEmail').textContent=String(f.get('email')||'Email not added');document.getElementById('profilePhone').textContent=String(f.get('phone')||'').trim()||'Not added';const addr=[f.get('address1'),f.get('city'),f.get('state'),f.get('zip')].map(x=>String(x||'').trim()).filter(Boolean).join(', ');document.getElementById('profileAddress').textContent=addr||'Not added';const emergency=String(f.get('emergencyName')||'').trim(),relationship=String(f.get('emergencyRelationship')||'').trim();document.getElementById('profileEmergency').textContent=emergency?(emergency+(relationship?' · '+relationship:'')):'Not added';const required=[first,last,f.get('email'),f.get('phone'),f.get('address1'),f.get('city'),f.get('state'),f.get('zip'),f.get('country'),f.get('emergencyName'),f.get('emergencyPhone')];const completion=Math.round(required.filter(v=>String(v||'').trim()).length/required.length*100);document.getElementById('profileCompletion').textContent=completion+'%';document.getElementById('profileProgress').style.width=completion+'%';e.target.closest('.modal').classList.remove('open')};

// ------------------------------------------------------------
// Standalone HTML/CSS/JS persistence layer
// Stores this user's editable profile, availability, game states,
// and notification-read state in this browser via localStorage.
// Replace with your production API/database during backend integration.
// ------------------------------------------------------------
const GUNR_STORAGE_KEY = 'gunr-user-profile-v2-no-fake-data';
function readGunrState() {
  try { return JSON.parse(localStorage.getItem(GUNR_STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function writeGunrState(patch) {
  const current = readGunrState();
  localStorage.setItem(GUNR_STORAGE_KEY, JSON.stringify({...current, ...patch}));
}
function saveGamesState() {
  writeGunrState({ games: games.map(g => ({id:g.id,status:g.status})) });
}
function restoreGamesState() {
  const saved = readGunrState().games || [];
  saved.forEach(item => {
    const target = games.find(g => g.id === item.id);
    if (target && ['Pending','Accepted','Declined'].includes(item.status)) target.status = item.status;
  });
}
restoreGamesState();
const originalSetStatus = setStatus;
setStatus = function(id,status){ originalSetStatus(id,status); saveGamesState(); };
render();

const profileFormEl = document.getElementById('profileForm');
if (profileFormEl) {
  const savedProfile = readGunrState().profile;
  if (savedProfile) {
    Object.entries(savedProfile).forEach(([key,value]) => {
      const field = profileFormEl.elements.namedItem(key);
      if (field && typeof value === 'string') field.value = value;
    });
    // Trigger the existing submit handler programmatically without closing a visible modal.
    const f = new FormData(profileFormEl);
    const first=String(f.get('first')||'').trim(),last=String(f.get('last')||'').trim(),preferred=String(f.get('preferred')||'').trim();
    const heroName=document.getElementById('heroProfileName'); if(heroName) heroName.textContent=((preferred||first)+' '+last).trim()||'Your Profile';
    const setText=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val};
    setText('profileName',(first+' '+last).trim()||'Not added');
    setText('profileEmail',String(f.get('email')||'Not added')); setText('heroEmail',String(f.get('email')||'Email not added'));
    setText('profilePhone',String(f.get('phone')||'').trim()||'Not added');
    const addr=[f.get('address1'),f.get('city'),f.get('state'),f.get('zip')].map(x=>String(x||'').trim()).filter(Boolean).join(', ');
    setText('profileAddress',addr||'Not added');
    const emergency=String(f.get('emergencyName')||'').trim(),relationship=String(f.get('emergencyRelationship')||'').trim();
    setText('profileEmergency',emergency?(emergency+(relationship?' · '+relationship:'')):'Not added');
  }
  const existingProfileSubmit = profileFormEl.onsubmit;
  profileFormEl.onsubmit = function(e){
    const values = Object.fromEntries(new FormData(profileFormEl).entries());
    writeGunrState({profile: values});
    return existingProfileSubmit.call(profileFormEl,e);
  };
}

const availabilityFormEl = document.getElementById('availabilityForm');
if (availabilityFormEl) {
  const existingAvailSubmit = availabilityFormEl.onsubmit;
  availabilityFormEl.onsubmit = function(e){
    const values = Object.fromEntries(new FormData(availabilityFormEl).entries());
    const current = readGunrState().availability || [];
    writeGunrState({availability: [values, ...current].slice(0,50)});
    return existingAvailSubmit.call(availabilityFormEl,e);
  };
  const grid = document.getElementById('availabilityGrid');
  const savedAvailability=readGunrState().availability || []; if(savedAvailability.length) document.getElementById('availabilityEmpty')?.remove(); savedAvailability.slice().reverse().forEach(a => {
    if (!grid) return;
    const div=document.createElement('div'); div.className='av';
    const blocked=a.type==='Blocked';
    div.innerHTML=`<div class="avtop"><div class="dot ${blocked?'blocked':''}"></div><span class="status ${blocked?'declined':'accepted'}">${a.type||'Available'}</span></div><b>${a.date||''}</b><small>${a.start||''} – ${a.end||''}</small>`;
    grid.prepend(div);
  });
}

const markReadBtn = document.getElementById('markRead');
if (markReadBtn) {
  if (readGunrState().notificationsRead) {
    document.querySelectorAll('#notificationsList .itemdot').forEach(d=>d.style.background='#424950');
    markReadBtn.textContent='All read';
  }
  const originalMarkRead = markReadBtn.onclick;
  markReadBtn.onclick = function(e){ if(originalMarkRead) originalMarkRead.call(this,e); writeGunrState({notificationsRead:true}); };
}


if (!document.querySelector('#notificationsList .item')) { const b=document.getElementById('markRead'); if(b){ b.disabled=true; b.textContent='No unread notifications'; } }
