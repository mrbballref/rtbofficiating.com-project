(()=>{
  const menuButton=document.querySelector('.rzu-menu-toggle');
  const mobileMenu=document.getElementById('mobile-menu');
  const closeMenu=()=>{mobileMenu?.classList.remove('open');mobileMenu?.setAttribute('aria-hidden','true');menuButton?.setAttribute('aria-expanded','false')};
  menuButton?.addEventListener('click',()=>{
    const open=!mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open',open);
    mobileMenu.setAttribute('aria-hidden',String(!open));
    menuButton.setAttribute('aria-expanded',String(open));
  });
  mobileMenu?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu()});
  window.addEventListener('resize',()=>{if(window.innerWidth>1080)closeMenu()});

  const D=window.RefZoneData;
  if(!D)return;
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
  const grid=document.getElementById('pathway-grid');
  if(grid){
    grid.innerHTML=D.tracks.map(track=>`<article class="rzu-pathway-card">
      <div class="rzu-pathway-card__visual"><img src="${escapeHtml(track.icon)}" alt="${escapeHtml(track.name)} course icon" loading="lazy" decoding="async"></div>
      <div class="rzu-pathway-card__content"><p>${escapeHtml(track.group)}</p><h3>${escapeHtml(track.name)}</h3><div class="rzu-pathway-links">
        <a href="platform.html#/program/${encodeURIComponent(track.id)}/foundations"><span>Foundations</span><small>Start</small></a>
        <a href="platform.html#/program/${encodeURIComponent(track.id)}/advancement"><span>Advancement</span><small>Advance</small></a>
        <a href="platform.html#/program/${encodeURIComponent(track.id)}/elite"><span>Elite</span><small>Lead</small></a>
      </div></div>
    </article>`).join('');
  }

  const membershipRoot=document.getElementById('home-membership-comparison');
  if(membershipRoot&&window.RefZoneMembershipRegistration){
    let recommendation=null;
    try{recommendation=JSON.parse(localStorage.getItem('rz:recommendation')||'null')}catch{}
    const options={checkoutPrefix:'platform.html'};
    membershipRoot.innerHTML=window.RefZoneMembershipRegistration.renderComparison(D.memberships,recommendation,options);
    window.RefZoneMembershipRegistration.mountComparison(D.memberships,options);
  }
})();
