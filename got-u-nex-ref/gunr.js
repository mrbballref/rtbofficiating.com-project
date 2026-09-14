(() => {
  const toggle = document.querySelector('[data-gunr-menu-toggle]');
  const menu = document.querySelector('[data-gunr-menu]');

  if (toggle && menu) {
    const closeMenu = () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
    };

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      menu.classList.toggle('is-open', !open);
    });

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
      if (window.innerWidth > 920) closeMenu();
    });
  }

  const track = document.querySelector('[data-level-track]');
  const previous = document.querySelector('[data-level-prev]');
  const next = document.querySelector('[data-level-next]');
  const scrollLevelRail = (direction) => {
    if (!track) return;
    track.scrollBy({ left: direction * Math.max(260, track.clientWidth * 0.55), behavior: 'smooth' });
  };
  previous?.addEventListener('click', () => scrollLevelRail(-1));
  next?.addEventListener('click', () => scrollLevelRail(1));
})();

// Standalone review: gracefully replace unavailable referenced project images with coded media panels.
document.querySelectorAll('img[data-fallback="true"]').forEach((img) => {
  const fail = () => {
    const parent = img.parentElement;
    if (!parent) return;
    parent.classList.add('asset-fallback');
    parent.dataset.fallbackLabel = img.alt || 'Approved project media';
    if (parent.closest('.gunr-final')) parent.closest('.gunr-final').classList.add('asset-image-missing');
  };
  img.addEventListener('error', fail, {once:true});
  if (img.complete && img.naturalWidth === 0) fail();
});
