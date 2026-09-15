const videoEl = document.getElementById('videoEl');
const offlineState = document.getElementById('offlineState');
const onlineBadge = document.getElementById('onlineBadge');
const titleOverlay = document.getElementById('titleOverlay');
const controlsShell = document.getElementById('controlsShell');
const timeline = document.getElementById('timeline');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const playlistList = document.getElementById('playlistList');
const playlistPanel = document.getElementById('playlistPanel');
const deviceModeLabel = document.getElementById('deviceModeLabel');
const creatorName = document.getElementById('creatorName');
const creatorMeta = document.getElementById('creatorMeta');
const creatorAvatar = document.getElementById('creatorAvatar');
const videoDescription = document.getElementById('videoDescription');
const uploadDialog = document.getElementById('uploadDialog');
const uploadForm = document.getElementById('uploadForm');
const shareDialog = document.getElementById('shareDialog');
const settingsPanel = document.getElementById('settingsPanel');
const volumePanel = document.getElementById('volumePanel');
const morePanel = document.getElementById('morePanel');
const moreControlsGrid = document.getElementById('moreControlsGrid');
const likeCount = document.getElementById('likeCount');
const dislikeCount = document.getElementById('dislikeCount');
const recordingIndicator = document.getElementById('recordingIndicator');
const recordingTimer = document.getElementById('recordingTimer');
const screenScrubber = document.getElementById('screenScrubber');
const screenScrubberProgress = document.getElementById('screenScrubberProgress');
const screenScrubberBuffered = document.getElementById('screenScrubberBuffered');
const screenScrubberTooltip = document.getElementById('screenScrubberTooltip');
const brightnessPanel = document.getElementById('brightnessPanel');
const airplayPanel = document.getElementById('airplayPanel');

let videos = [];
let currentIndex = -1;
let titleTimer;
let recording = false;
let recordTimer;
let recordSeconds = 0;
let mediaRecorder;
let chunks = [];

const controlNames = {
  previous: 'Previous', rewind: 'Rewind', back10: 'Skip Back 10 Seconds', frameBack:'Previous Frame', play: 'Play', pause: 'Pause', frameForward:'Next Frame', stop: 'Stop', forward10: 'Skip Forward 10 Seconds', fastforward: 'Fast Forward', next: 'Next', record: 'Record', settings: 'Settings', brightness:'Brightness', airplay:'AirPlay', cc: 'Closed Caption', volume: 'Volume', mute: 'Mute', mini: 'Mini Player', theater: 'Theater', full: 'Full Screen'
};

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
function activeVideo() { return videos[currentIndex]; }
function showTitle() {
  const video = activeVideo();
  if (!video) return;
  titleOverlay.textContent = video.title;
  titleOverlay.classList.remove('hidden');
  clearTimeout(titleTimer);
  titleTimer = setTimeout(() => titleOverlay.classList.add('hidden'), 5000);
}
function updateStatus(online) {
  onlineBadge.className = `status-badge ${online ? 'online' : 'offline'}`;
  onlineBadge.innerHTML = `<span></span>${online ? 'Online' : 'Offline'}`;
  offlineState.classList.toggle('hidden', !!activeVideo());
  document.body.classList.toggle('has-video', !!activeVideo());
}
function setActiveControl(control, flash = false) {
  document.querySelectorAll('.control-btn').forEach(btn => {
    if (!['record','cc','mute','theater','mini','full','settings'].includes(btn.dataset.control)) {
      btn.className = 'control-btn' + (btn.classList.contains('secondary-control') ? ' secondary-control' : '') + (btn.classList.contains('more-btn') ? ' more-btn' : '');
    }
  });
  const btn = document.querySelector(`[data-control="${control}"]`);
  if (!btn) return;
  const map = { play:'active-play', pause:'active-pause', stop:'active-stop', back10:'active-settings', forward10:'active-settings', rewind:'active-volume', fastforward:'active-volume', previous:'active-theater', next:'active-theater' };
  btn.classList.add(map[control] || 'active-settings');
  if (flash) setTimeout(() => btn.classList.remove(map[control] || 'active-settings'), 260);
}
function loadVideo(index, autoplay = false) {
  if (!videos[index]) return;
  currentIndex = index;
  const v = videos[index];
  videoEl.src = v.url;
  videoEl.load();
  updateStatus(true);
  updateCreator();
  renderPlaylist();
  showTitle();
  if (autoplay) videoEl.play().catch(() => {});
}
function updateCreator() {
  const v = activeVideo();
  if (!v) return;
  creatorName.textContent = v.creatorName;
  creatorMeta.textContent = `${v.creatorRole || 'Creator'} • ${v.category || 'Uncategorized'} • Uploaded ${new Date(v.createdAt).toLocaleString()}`;
  videoDescription.textContent = v.description || 'No description provided.';
  creatorAvatar.textContent = v.creatorName.split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase();
  likeCount.textContent = v.likes;
  dislikeCount.textContent = v.dislikes;
  document.getElementById('saveBtn').classList.toggle('active', v.saved);
  document.getElementById('likeBtn').classList.toggle('active', v.liked);
  document.getElementById('dislikeBtn').classList.toggle('active', v.disliked);
}
function renderPlaylist() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const sort = document.getElementById('sortSelect').value;
  let list = videos.map((v,i)=>({...v,index:i})).filter(v => [v.title, v.creatorName, v.category, v.tags].join(' ').toLowerCase().includes(q));
  list.sort((a,b) => sort === 'title' ? a.title.localeCompare(b.title) : sort === 'oldest' ? a.createdAt - b.createdAt : sort === 'likes' ? b.likes - a.likes : b.createdAt - a.createdAt);
  if (!list.length) {
    playlistList.innerHTML = '<div class="offline-state" style="position:static;min-height:180px;border-radius:18px"><h2>No videos found</h2><p>Upload a video or change your search.</p></div>';
    return;
  }
  playlistList.innerHTML = list.map(v => `
    <article class="playlist-item ${v.index === currentIndex ? 'active' : ''}" data-index="${v.index}">
      <div class="thumb">${v.thumb ? `<img src="${v.thumb}" alt="">` : 'VIDEO'}<span class="duration-badge">${v.duration || '0:00'}</span></div>
      <div><h4>${v.title}</h4><p>${v.creatorName}</p><p>${v.category || 'Video'} • ${v.likes} likes</p></div>
    </article>`).join('');
}
function captureThumbnail(fileUrl, callback) {
  const temp = document.createElement('video');
  temp.src = fileUrl; temp.muted = true; temp.playsInline = true;
  temp.addEventListener('loadeddata', () => {
    try {
      temp.currentTime = Math.min(1, temp.duration || 1);
    } catch { callback(''); }
  });
  temp.addEventListener('seeked', () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 320; canvas.height = 180;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(temp, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/jpeg', .72));
    } catch { callback(''); }
  }, { once: true });
  temp.addEventListener('error', () => callback(''));
}
function control(action) {
  const v = activeVideo();
  if (!v && !['settings','volume','more','record'].includes(action)) return;
  switch(action) {
    case 'play': videoEl.play(); showTitle(); setActiveControl('play'); break;
    case 'pause': videoEl.pause(); showTitle(); setActiveControl('pause'); break;
    case 'stop': videoEl.pause(); videoEl.currentTime = 0; setActiveControl('stop', true); break;
    case 'back10': videoEl.currentTime = Math.max(0, videoEl.currentTime - 10); setActiveControl('back10', true); showTitle(); break;
    case 'forward10': videoEl.currentTime = Math.min(videoEl.duration || 0, videoEl.currentTime + 10); setActiveControl('forward10', true); showTitle(); break;
    case 'rewind': videoEl.currentTime = Math.max(0, videoEl.currentTime - 5); setActiveControl('rewind', true); break;
    case 'fastforward': videoEl.currentTime = Math.min(videoEl.duration || 0, videoEl.currentTime + 5); setActiveControl('fastforward', true); break;
    case 'next': loadVideo(currentIndex + 1 < videos.length ? currentIndex + 1 : (document.getElementById('loopToggle').checked ? 0 : currentIndex), true); setActiveControl('next', true); break;
    case 'previous': loadVideo(currentIndex - 1 >= 0 ? currentIndex - 1 : (document.getElementById('loopToggle').checked ? videos.length - 1 : currentIndex), true); setActiveControl('previous', true); break;
    case 'frameBack': videoEl.pause(); videoEl.currentTime = Math.max(0, videoEl.currentTime - (1 / Number(document.getElementById('frameRateSelect')?.value || 30))); setActiveControl('frameBack', true); showTitle(); break;
    case 'frameForward': videoEl.pause(); videoEl.currentTime = Math.min(videoEl.duration || 0, videoEl.currentTime + (1 / Number(document.getElementById('frameRateSelect')?.value || 30))); setActiveControl('frameForward', true); showTitle(); break;
    case 'mute': videoEl.muted = !videoEl.muted; document.querySelector('[data-control="mute"]').classList.toggle('active-mute', videoEl.muted); break;
    case 'volume': volumePanel.classList.toggle('hidden'); document.querySelector('[data-control="volume"]').classList.toggle('active-volume', !volumePanel.classList.contains('hidden')); break;
    case 'settings': settingsPanel.classList.toggle('hidden'); document.querySelector('[data-control="settings"]').classList.toggle('active-settings', !settingsPanel.classList.contains('hidden')); break;
    case 'brightness': brightnessPanel?.classList.toggle('hidden'); document.querySelector('[data-control="brightness"]')?.classList.toggle('active-volume', brightnessPanel && !brightnessPanel.classList.contains('hidden')); break;
    case 'airplay': airplayPanel?.classList.toggle('hidden'); document.querySelector('[data-control="airplay"]')?.classList.toggle('active-cc', airplayPanel && !airplayPanel.classList.contains('hidden')); break;
    case 'cc': document.querySelector('[data-control="cc"]').classList.toggle('active-cc'); alert('Closed captions are ready for WebVTT tracks. No caption file is loaded for this video.'); break;
    case 'mini': document.body.classList.toggle('mini-mode'); document.querySelector('[data-control="mini"]').classList.toggle('active-mini'); break;
    case 'theater': document.body.classList.toggle('theater-mode'); document.querySelector('[data-control="theater"]').classList.toggle('active-theater'); break;
    case 'full': if (!document.fullscreenElement) document.getElementById('deviceFrame').requestFullscreen?.(); else document.exitFullscreen?.(); document.querySelector('[data-control="full"]').classList.toggle('active-full'); break;
    case 'record': toggleRecording(); break;
    case 'more': morePanel.classList.toggle('hidden'); break;
  }
}
async function toggleRecording() {
  if (recording) {
    mediaRecorder?.stop();
    return;
  }
  if (!navigator.mediaDevices || !window.MediaRecorder) { alert('Recording is not supported in this browser.'); return; }
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const item = { id: crypto.randomUUID(), title: `Screen Recording ${new Date().toLocaleTimeString()}`, description: 'Recorded with the built-in player recording control.', creatorName: 'Local Course User', creatorRole: 'Course Recording', category: 'Recording', tags: 'recording', url, thumb: '', likes: 0, dislikes: 0, liked:false, disliked:false, saved:false, createdAt: Date.now(), duration: 'REC' };
      videos.unshift(item); currentIndex = 0; renderPlaylist(); loadVideo(0, true);
      recording = false; recordingIndicator.classList.add('hidden'); document.querySelector('[data-control="record"]').classList.remove('active-record'); clearInterval(recordTimer);
    };
    mediaRecorder.start(); recording = true; recordSeconds = 0;
    recordingIndicator.classList.remove('hidden'); document.querySelector('[data-control="record"]').classList.add('active-record');
    recordTimer = setInterval(() => { recordSeconds++; recordingTimer.textContent = formatTime(recordSeconds); }, 1000);
  } catch (e) { alert('Recording permission was cancelled or denied.'); }
}
function updateDeviceMode() {
  const w = window.innerWidth;
  let mode = 'Desktop';
  if (w <= 320) mode = 'Small Phone'; else if (w <= 360) mode = 'Compact Phone'; else if (w <= 390) mode = 'Modern Phone'; else if (w <= 430) mode = 'Pro Max Phone'; else if (w <= 540) mode = 'Foldable / Wide Phone'; else if (w <= 768) mode = 'Tablet Portrait'; else if (w <= 834) mode = 'iPad Portrait'; else if (w <= 1180) mode = 'iPad Landscape'; else if (w <= 1440) mode = 'Desktop'; else mode = 'Ultra-wide Desktop';
  deviceModeLabel.textContent = mode;
}
function buildMoreControls() {
  const ids = ['record','settings','brightness','airplay','cc','volume','mini','theater','stop','previous','next','rewind','fastforward','frameBack','frameForward'];
  moreControlsGrid.innerHTML = ids.map(id => `<button data-more-action="${id}">${controlNames[id]}</button>`).join('');
}

controlsShell.addEventListener('click', e => { const btn = e.target.closest('[data-control]'); if (btn) control(btn.dataset.control); });
moreControlsGrid.addEventListener('click', e => { const btn = e.target.closest('[data-more-action]'); if (btn) { control(btn.dataset.moreAction); morePanel.classList.add('hidden'); } });
playlistList.addEventListener('click', e => { const item = e.target.closest('.playlist-item'); if (item) { loadVideo(Number(item.dataset.index), true); playlistPanel.classList.remove('open'); } });
videoEl.addEventListener('play', () => { updateStatus(true); setActiveControl('play'); showTitle(); });
videoEl.addEventListener('pause', () => setActiveControl('pause'));
videoEl.addEventListener('loadedmetadata', () => { durationEl.textContent = formatTime(videoEl.duration); if (activeVideo()) activeVideo().duration = formatTime(videoEl.duration); renderPlaylist(); });
videoEl.addEventListener('timeupdate', () => {
  const pct = videoEl.duration ? (videoEl.currentTime / videoEl.duration) * 100 : 0;
  timeline.value = pct; currentTimeEl.textContent = formatTime(videoEl.currentTime);
  if (screenScrubberProgress) screenScrubberProgress.style.width = pct + '%';
  if (screenScrubber) { screenScrubber.setAttribute('aria-valuenow', String(Math.round(pct))); screenScrubber.setAttribute('aria-valuetext', `${formatTime(videoEl.currentTime)} of ${formatTime(videoEl.duration)}`); }
});
videoEl.addEventListener('ended', () => { if (document.getElementById('autoplayToggle').checked && currentIndex < videos.length - 1) loadVideo(currentIndex + 1, true); });
videoEl.addEventListener('progress', () => {
  if (!screenScrubberBuffered || !videoEl.duration || !videoEl.buffered.length) return;
  const end = videoEl.buffered.end(videoEl.buffered.length - 1);
  screenScrubberBuffered.style.width = Math.min(100, (end / videoEl.duration) * 100) + '%';
});
videoEl.addEventListener('mousemove', showTitle);
videoEl.addEventListener('click', () => controlsShell.classList.toggle('show'));
timeline.addEventListener('input', () => { if (videoEl.duration) videoEl.currentTime = (Number(timeline.value) / 100) * videoEl.duration; });
function seekFromScrubberEvent(e) {
  if (!videoEl.duration || !screenScrubber) return;
  const rect = screenScrubber.getBoundingClientRect();
  const clientX = e.touches?.[0]?.clientX ?? e.clientX;
  const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  videoEl.currentTime = pct * videoEl.duration;
  if (screenScrubberTooltip) { screenScrubberTooltip.style.left = (pct * 100) + '%'; screenScrubberTooltip.textContent = formatTime(videoEl.currentTime); }
}
let scrubDragging = false;
screenScrubber?.addEventListener('pointerdown', e => { scrubDragging = true; screenScrubber.setPointerCapture?.(e.pointerId); seekFromScrubberEvent(e); });
screenScrubber?.addEventListener('pointermove', e => { if (scrubDragging) seekFromScrubberEvent(e); });
screenScrubber?.addEventListener('pointerup', e => { scrubDragging = false; screenScrubber.releasePointerCapture?.(e.pointerId); });
document.getElementById('volumeSlider').addEventListener('input', e => { videoEl.volume = Number(e.target.value); videoEl.muted = videoEl.volume === 0; const vv=document.getElementById('volumeValue'); if(vv) vv.textContent = Math.round(videoEl.volume*100)+'%'; });
document.getElementById('volumeMuteToggle')?.addEventListener('click', () => control('mute'));
function setBrightness(v){ document.documentElement.style.setProperty('--video-brightness', Number(v)/100); ['brightnessValue','brightnessValueSettings'].forEach(id=>{const el=document.getElementById(id); if(el) el.textContent = v + '%';}); }
document.getElementById('brightnessSlider')?.addEventListener('input', e => { setBrightness(e.target.value); const s=document.getElementById('brightnessSliderSettings'); if(s) s.value=e.target.value; });
document.getElementById('brightnessSliderSettings')?.addEventListener('input', e => { setBrightness(e.target.value); const s=document.getElementById('brightnessSlider'); if(s) s.value=e.target.value; });
document.getElementById('speedSelect').addEventListener('change', e => videoEl.playbackRate = Number(e.target.value));
document.getElementById('loopToggle').addEventListener('change', e => videoEl.loop = e.target.checked);
document.getElementById('pipBtn').addEventListener('click', async () => { try { if (document.pictureInPictureElement) await document.exitPictureInPicture(); else await videoEl.requestPictureInPicture(); } catch { alert('Picture-in-Picture is not available for this video/browser.'); } });
document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => document.getElementById(`${btn.dataset.close}Panel`).classList.add('hidden')));
['uploadOpenBtn','emptyUploadBtn'].forEach(id => document.getElementById(id).addEventListener('click', () => uploadDialog.showModal()));
document.getElementById('closeUploadBtn').addEventListener('click', () => uploadDialog.close());
document.getElementById('playlistToggleBtn').addEventListener('click', () => playlistPanel.classList.toggle('open'));
document.getElementById('closePlaylistBtn').addEventListener('click', () => playlistPanel.classList.remove('open'));
document.getElementById('searchInput').addEventListener('input', renderPlaylist);
document.getElementById('sortSelect').addEventListener('change', renderPlaylist);
document.getElementById('playAllBtn').addEventListener('click', () => videos.length && loadVideo(0, true));
document.getElementById('shuffleBtn').addEventListener('click', () => { if (!videos.length) return; loadVideo(Math.floor(Math.random() * videos.length), true); });
document.getElementById('likeBtn').addEventListener('click', () => { const v = activeVideo(); if (!v) return; if (v.liked) { v.likes--; v.liked=false; } else { v.likes++; v.liked=true; if (v.disliked) { v.disliked=false; v.dislikes--; } } updateCreator(); renderPlaylist(); });
document.getElementById('dislikeBtn').addEventListener('click', () => { const v = activeVideo(); if (!v) return; if (v.disliked) { v.dislikes--; v.disliked=false; } else { v.dislikes++; v.disliked=true; if (v.liked) { v.liked=false; v.likes--; } } updateCreator(); renderPlaylist(); });
document.getElementById('saveBtn').addEventListener('click', () => { const v = activeVideo(); if (!v) return; v.saved = !v.saved; updateCreator(); });
document.getElementById('downloadBtn').addEventListener('click', () => { const v = activeVideo(); if (!v) return; const a = document.createElement('a'); a.href = v.url; a.download = `${v.title}.webm`; a.click(); });
document.getElementById('shareBtn').addEventListener('click', async () => { const v = activeVideo(); if (!v) return; const link = `${location.href.split('#')[0]}#video=${v.id}`; if (navigator.share) { try { await navigator.share({ title: v.title, text: v.description, url: link }); return; } catch {} } document.getElementById('shareTitle').textContent = v.title; document.getElementById('shareLinkInput').value = link; shareDialog.showModal(); });
document.getElementById('closeShareBtn').addEventListener('click', () => shareDialog.close());
document.getElementById('copyShareBtn').addEventListener('click', async () => { await navigator.clipboard.writeText(document.getElementById('shareLinkInput').value); document.getElementById('copyMessage').textContent = 'Link copied.'; });
uploadForm.addEventListener('submit', e => {
  e.preventDefault();
  const file = document.getElementById('videoFileInput').files[0];
  if (!file || !file.type.startsWith('video/')) { alert('Please select a valid video file.'); return; }
  const progress = document.getElementById('uploadProgress'); progress.classList.remove('hidden');
  const url = URL.createObjectURL(file);
  const title = document.getElementById('videoTitleInput').value.trim();
  const item = { id: crypto.randomUUID(), title, description: document.getElementById('videoDescInput').value.trim(), creatorName: document.getElementById('creatorNameInput').value.trim(), creatorRole: document.getElementById('creatorRoleInput').value.trim(), category: document.getElementById('categoryInput').value.trim(), tags: document.getElementById('tagsInput').value.trim(), url, thumb: '', likes: 0, dislikes: 0, liked:false, disliked:false, saved:false, createdAt: Date.now(), duration: '0:00', fileSize: file.size, mimeType: file.type };
  captureThumbnail(url, thumb => { item.thumb = thumb; videos.unshift(item); uploadDialog.close(); uploadForm.reset(); progress.classList.add('hidden'); loadVideo(0, true); renderPlaylist(); });
});
document.getElementById('rotateBtn')?.addEventListener('click', () => { const wrap=document.getElementById('ipadWrap'); wrap.classList.toggle('portrait'); wrap.classList.toggle('landscape'); const label=document.getElementById('deviceModeLabel'); if(label) label.textContent = wrap.classList.contains('portrait') ? 'iPad Pro 13 • Portrait' : 'iPad Pro 13 • Landscape'; });
window.addEventListener('resize', updateDeviceMode);
document.addEventListener('keydown', e => {
  if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
  const k = e.key.toLowerCase();
  if (k === ' ' || k === 'k') { e.preventDefault(); videoEl.paused ? control('play') : control('pause'); }
  if (k === 'j') control('back10'); if (k === 'l') control('forward10'); if (e.key === ',' || e.key === '<') control('frameBack'); if (e.key === '.' || e.key === '>') control('frameForward'); if (k === 'm') control('mute'); if (k === 'f') control('full'); if (k === 't') control('theater'); if (k === 'i') control('mini'); if (k === 'c') control('cc');
  if (e.key === 'ArrowLeft') { videoEl.currentTime = Math.max(0, videoEl.currentTime - 5); }
  if (e.key === 'ArrowRight') { videoEl.currentTime = Math.min(videoEl.duration || 0, videoEl.currentTime + 5); }
  if (e.key === 'ArrowUp') { videoEl.volume = Math.min(1, videoEl.volume + .05); }
  if (e.key === 'ArrowDown') { videoEl.volume = Math.max(0, videoEl.volume - .05); }
  if (e.key === 'Escape') { settingsPanel.classList.add('hidden'); volumePanel.classList.add('hidden'); morePanel.classList.add('hidden'); playlistPanel.classList.remove('open'); document.body.classList.remove('theater-mode'); }
});

buildMoreControls(); updateDeviceMode(); renderPlaylist(); updateStatus(false);

// Mock AirPlay device picker — see the panel's own copy ("start a mock
// AirPlay stream"). Neither the device buttons nor disconnect button had
// a click handler, so picking a device did nothing.
const airplayCurrent = document.getElementById('airplayCurrent');
const airplayDisconnectBtn = document.getElementById('airplayDisconnectBtn');
document.querySelectorAll('.airplay-device').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.airplayDevice || 'device';
    if (airplayCurrent) airplayCurrent.innerHTML = `<span class="airplay-glyph">▵</span><div><strong>Casting to ${name}</strong><p>Mock AirPlay stream connected.</p></div>`;
    if (airplayDisconnectBtn) airplayDisconnectBtn.disabled = false;
    airplayPanel?.classList.add('hidden');
    document.querySelector('[data-control="airplay"]')?.classList.remove('active-cc');
  });
});
airplayDisconnectBtn?.addEventListener('click', () => {
  if (airplayCurrent) airplayCurrent.innerHTML = `<span class="airplay-glyph">▵</span><div><strong>Not Casting</strong><p>Select an external device to start a mock AirPlay stream.</p></div>`;
  airplayDisconnectBtn.disabled = true;
});

// Side panel tabs (Video Library / Info / Actions) only toggled their own
// active state visually — clicking Info or Actions did nothing at all.
document.querySelectorAll('.side-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.side-tab').forEach(t => t.classList.toggle('active', t === tab));
  });
});
