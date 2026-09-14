// Captured synchronously at parse time — document.currentScript is only
// reliable during a classic script's initial execution, so this must happen
// before any of the IIFEs below, none of which are async themselves.
const RTBO_SCRIPT_URL = document.currentScript ? document.currentScript.src : '';

(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const desktopDropdowns = [...document.querySelectorAll('.has-dropdown')];
  const desktopToggles = [...document.querySelectorAll('.dropdown-toggle, .dropdown-trigger')];
  const mobileItems = [...document.querySelectorAll('.mobile-item')];
  const mobileDropdownToggles = [...document.querySelectorAll('.mobile-dropdown-toggle')];

  const closeDesktopDropdowns = (except = null) => {
    desktopDropdowns.forEach((item) => {
      if (item === except) return;
      item.classList.remove('is-open');
      item.querySelectorAll('.dropdown-toggle, .dropdown-trigger').forEach((toggle) => {
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  };

  const openDesktopDropdown = (item) => {
    if (!item) return;
    closeDesktopDropdowns(item);
    item.classList.add('is-open');
    item.querySelectorAll('.dropdown-toggle, .dropdown-trigger').forEach((toggle) => {
      toggle.setAttribute('aria-expanded', 'true');
    });
  };

  const setMenuOpen = (open) => {
    if (!header || !menuToggle || !mobileMenu) return;
    header.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    if (!open) {
      mobileItems.forEach((item) => item.classList.remove('is-open'));
      mobileDropdownToggles.forEach((toggle) => toggle.setAttribute('aria-expanded', 'false'));
    }
  };

  const setActive = (target) => {
    document.querySelectorAll('.nav-link.active, .mobile-nav-link.active, .dropdown-toggle.active')
      .forEach((item) => item.classList.remove('active'));
    target?.classList.add('active');
  };

  menuToggle?.addEventListener('click', () => {
    setMenuOpen(!header.classList.contains('menu-open'));
  });

  desktopDropdowns.forEach((item) => {
    item.addEventListener('mouseenter', () => openDesktopDropdown(item));
    item.addEventListener('focusin', () => openDesktopDropdown(item));
  });

  document.querySelectorAll('.desktop-nav > .nav-link, .desktop-nav > .cta').forEach((item) => {
    item.addEventListener('mouseenter', () => closeDesktopDropdowns());
    item.addEventListener('focus', () => closeDesktopDropdowns());
  });

  desktopToggles.forEach((toggle) => {
    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const parent = toggle.closest('.has-dropdown');
      const shouldOpen = !parent?.classList.contains('is-open');
      closeDesktopDropdowns();
      if (shouldOpen && parent) openDesktopDropdown(parent);
    });
  });

  document.querySelectorAll('.dropdown-menu a').forEach((link) => {
    link.addEventListener('click', () => closeDesktopDropdowns());
  });

  mobileDropdownToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.mobile-item');
      const shouldOpen = !item?.classList.contains('is-open');
      mobileItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.mobile-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
        }
      });
      item?.classList.toggle('is-open', shouldOpen);
      toggle.setAttribute('aria-expanded', String(shouldOpen));
    });
  });

  document.querySelectorAll('[data-nav-link], .mobile-nav-link[href], .mobile-submenu a, .cta, .brand, .nav-primary-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (link.matches('[data-nav-link], .mobile-nav-link[href], .nav-primary-link')) setActive(link);
      setMenuOpen(false);
      closeDesktopDropdowns();
    });
  });

  document.addEventListener('click', (event) => {
    if (header && !header.contains(event.target)) {
      setMenuOpen(false);
      closeDesktopDropdowns();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuOpen(false);
      closeDesktopDropdowns();
    }
  });

  window.matchMedia('(min-width: 1241px)').addEventListener('change', (event) => {
    if (event.matches) setMenuOpen(false);
  });
})();

(() => {
  'use strict';

  const dialog = document.getElementById('account-dialog');
  const frame = dialog?.querySelector('.account-dialog__frame');
  const closeButton = dialog?.querySelector('.account-dialog__close');

  const openDialog = (event) => {
    event.preventDefault();
    if (!dialog) return;
    if (frame && event.currentTarget.href) {
      const url = new URL(event.currentTarget.href, window.location.href);
      url.searchParams.set('embedded', '1');
      frame.src = url.href;
    }
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };

  document.querySelectorAll('[data-account-open]').forEach((trigger) => trigger.addEventListener('click', openDialog));
  closeButton?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  // Reflect real session state on every "Account" CTA sitewide. Loaded via
  // dynamic import so this file can stay a classic (non-module) script.
  const accountLinks = [...document.querySelectorAll('[data-account-open]')];
  if (accountLinks.length && RTBO_SCRIPT_URL) {
    const authModuleUrl = new URL('./assets/auth.js', RTBO_SCRIPT_URL).href;
    import(authModuleUrl).then(({ getSession, onAuthStateChange }) => {
      const render = (session) => {
        accountLinks.forEach((link) => {
          if (session && !link.dataset.sessionWired) {
            link.dataset.sessionWired = 'true';
            link.removeEventListener('click', openDialog);
            link.textContent = 'My Profile';
            link.removeAttribute('data-account-open');
            link.href = new URL('./got-u-nex-ref/user-profile/index.html', RTBO_SCRIPT_URL).href;
          }
        });
      };
      getSession().then(render);
      onAuthStateChange((_event, session) => render(session));
    }).catch(() => {
      /* auth module unavailable (e.g. offline) — CTA stays as static "Account" link */
    });
  }
})();

(() => {
  'use strict';

  const root = document.querySelector('[data-video-player]');
  if (!root) return;

  const video = root.querySelector('[data-player-video]');
  const stage = root.querySelector('[data-player-stage]');
  const fileInput = root.querySelector('[data-player-file]');
  const uploadButtons = [...root.querySelectorAll('[data-player-upload]')];
  const playButton = root.querySelector('[data-player-play]');
  const muteButton = root.querySelector('[data-player-mute]');
  const timeline = root.querySelector('[data-player-timeline]');
  const currentTime = root.querySelector('[data-player-current]');
  const duration = root.querySelector('[data-player-duration]');
  const speedButton = root.querySelector('[data-player-speed]');
  const replayButton = root.querySelector('[data-player-replay]');
  const pipButton = root.querySelector('[data-player-pip]');
  const fullscreenButton = root.querySelector('[data-player-fullscreen]');
  const shareButton = root.querySelector('[data-player-share]');
  const downloadButton = root.querySelector('[data-player-download]');
  const title = root.querySelector('[data-player-title]');
  const playlistPanel = root.querySelector('[data-player-playlist-panel]');
  const playlist = root.querySelector('[data-player-playlist]');
  const playlistCount = root.querySelector('[data-playlist-count]');
  const layout = root.querySelector('.approved-player__layout');

  let files = [];
  let activeIndex = -1;
  let currentUrl = '';
  const speeds = [1, 1.25, 1.5, 1.75, 2, .75];
  let speedIndex = 0;

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const updatePlayState = () => root.classList.toggle('is-playing', !video.paused);

  const renderPlaylist = () => {
    playlist.innerHTML = '';
    files.forEach((file, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `playlist-item${index === activeIndex ? ' is-active' : ''}`;
      button.innerHTML = `<span class="playlist-item__number">${index + 1}</span><span class="playlist-item__name"></span>`;
      button.querySelector('.playlist-item__name').textContent = file.name;
      button.addEventListener('click', () => loadVideo(index, true));
      playlist.appendChild(button);
    });
    playlistCount.textContent = `${files.length} video${files.length === 1 ? '' : 's'}`;
    const hasVideos = files.length > 0;
    playlistPanel.hidden = !hasVideos;
    playlistPanel.setAttribute('aria-hidden', String(!hasVideos));
    layout.classList.toggle('has-playlist', hasVideos);
  };

  const loadVideo = (index, autoplay = false) => {
    const file = files[index];
    if (!file) return;
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentUrl = URL.createObjectURL(file);
    activeIndex = index;
    video.src = currentUrl;
    video.load();
    root.classList.add('is-loaded');
    title.textContent = file.name.replace(/\.[^/.]+$/, '');
    shareButton.disabled = false;
    downloadButton.disabled = false;
    renderPlaylist();
    if (autoplay) video.play().catch(() => {});
  };

  uploadButtons.forEach((button) => button.addEventListener('click', () => fileInput.click()));
  fileInput.addEventListener('change', () => {
    const selected = [...fileInput.files].filter((file) => file.type.startsWith('video/'));
    if (!selected.length) return;
    const firstNewIndex = files.length;
    files = files.concat(selected);
    renderPlaylist();
    loadVideo(activeIndex < 0 ? firstNewIndex : activeIndex, activeIndex < 0);
    fileInput.value = '';
  });

  playButton.addEventListener('click', () => {
    if (activeIndex < 0) return fileInput.click();
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  });
  video.addEventListener('play', updatePlayState);
  video.addEventListener('pause', updatePlayState);
  video.addEventListener('loadedmetadata', () => {
    duration.textContent = formatTime(video.duration);
    timeline.value = 0;
  });
  video.addEventListener('timeupdate', () => {
    currentTime.textContent = formatTime(video.currentTime);
    timeline.value = video.duration ? (video.currentTime / video.duration) * 100 : 0;
  });
  video.addEventListener('ended', () => {
    if (activeIndex + 1 < files.length) loadVideo(activeIndex + 1, true);
    else updatePlayState();
  });
  timeline.addEventListener('input', () => {
    if (video.duration) video.currentTime = (Number(timeline.value) / 100) * video.duration;
  });
  muteButton.addEventListener('click', () => {
    video.muted = !video.muted;
    muteButton.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
  });
  root.querySelectorAll('[data-player-skip]').forEach((button) => {
    button.addEventListener('click', () => {
      if (activeIndex >= 0) video.currentTime = Math.max(0, Math.min(video.duration || Infinity, video.currentTime + Number(button.dataset.playerSkip)));
    });
  });
  speedButton.addEventListener('click', () => {
    speedIndex = (speedIndex + 1) % speeds.length;
    video.playbackRate = speeds[speedIndex];
    speedButton.textContent = `${speeds[speedIndex]}×`;
  });
  replayButton.addEventListener('click', () => {
    if (activeIndex < 0) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  });
  pipButton.addEventListener('click', async () => {
    if (activeIndex < 0 || !document.pictureInPictureEnabled) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch (_) {}
  });
  fullscreenButton.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stage.requestFullscreen();
    } catch (_) {}
  });
  shareButton.addEventListener('click', async () => {
    if (activeIndex < 0) return;
    const file = files[activeIndex];
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ title: file.name, files: [file] }); } catch (_) {}
    }
  });
  downloadButton.addEventListener('click', () => {
    if (activeIndex < 0) return;
    const anchor = document.createElement('a');
    anchor.href = currentUrl;
    anchor.download = files[activeIndex].name;
    anchor.click();
  });

  document.addEventListener('keydown', (event) => {
    if (!root.contains(document.activeElement) && !root.matches(':hover')) return;
    if (event.code === 'Space') {
      event.preventDefault();
      playButton.click();
    } else if (event.key.toLowerCase() === 'm') {
      muteButton.click();
    } else if (event.key === 'ArrowLeft') {
      video.currentTime = Math.max(0, video.currentTime - 5);
    } else if (event.key === 'ArrowRight') {
      video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 5);
    }
  });

  window.addEventListener('beforeunload', () => {
    if (currentUrl) URL.revokeObjectURL(currentUrl);
  });
})();

(() => {
  'use strict';
  document.querySelectorAll('[data-preview-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = form.querySelector('.preview-form__status');
      const button = form.querySelector('button[type="submit"]');
      if (!RTBO_SCRIPT_URL) {
        if (status) status.textContent = 'Unable to send right now. Please try again later.';
        return;
      }
      const data = new FormData(form);
      if (button) button.disabled = true;
      if (status) { status.textContent = 'Sending…'; status.classList.remove('is-error'); }
      try {
        const authModuleUrl = new URL('./assets/auth.js', RTBO_SCRIPT_URL).href;
        const { supabase } = await import(authModuleUrl);
        const { error } = await supabase.rpc('public_submit_contact_inquiry', {
          inquiry_name: data.get('name'),
          inquiry_email: data.get('email'),
          inquiry_organization: data.get('organization') || '',
          inquiry_message: data.get('message'),
        });
        if (error) throw error;
        if (status) status.textContent = "Thanks — we'll be in touch soon.";
        form.reset();
      } catch (error) {
        if (status) {
          status.textContent = error?.message || 'The message could not be sent. Please try again.';
          status.classList.add('is-error');
        }
      } finally {
        if (button) button.disabled = false;
      }
    });
  });
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'rtbo-close-account') document.getElementById('account-dialog')?.close();
  });
})();

(() => {
  const section = document.querySelector('.rtbo-shop-showcase');
  const spotlight = document.querySelector('.rtbo-shop-showcase__spotlight');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!section || !spotlight || reduceMotion.matches) return;

  section.addEventListener('pointerenter', () => {
    section.classList.add('is-active');
  });

  section.addEventListener('pointermove', (event) => {
    const rect = section.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    spotlight.style.setProperty('--pointer-x', `${x}%`);
    spotlight.style.setProperty('--pointer-y', `${y}%`);
  });

  section.addEventListener('pointerleave', () => {
    section.classList.remove('is-active');
  });
})();


/* RTBO exact Shop banner interaction */
(() => {
  const banner = document.querySelector('.rtbo-exact-banner');
  if (!banner) return;

  const cta = banner.querySelector('.rtbo-exact-banner__cta');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  banner.classList.add('is-ready');

  if (cta && !reducedMotion.matches) {
    cta.addEventListener('pointerdown', () => {
      cta.style.transform = 'translateY(0) scale(.985)';
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
      cta.addEventListener(eventName, () => {
        cta.style.removeProperty('transform');
      });
    });
  }
})();


(() => {
  'use strict';

  const dialog = document.getElementById('founder-video-dialog');
  const openButton = document.querySelector('[data-founder-video-open]');
  const closeButton = dialog?.querySelector('[data-founder-video-close]');
  if (!dialog || !openButton) return;

  const openPlayer = (event) => {
    event.preventDefault();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };

  const closePlayer = () => {
    dialog.querySelector('[data-player-video]')?.pause();
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };

  openButton.addEventListener('click', openPlayer);
  closeButton?.addEventListener('click', closePlayer);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closePlayer();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closePlayer();
  });
})();


/* Reviews page — manual testimonial carousel */
(() => {
  'use strict';

  const slider = document.querySelector('[data-reviews-slider]');
  if (!slider) return;

  const track = slider.querySelector('[data-reviews-track]');
  const slides = [...slider.querySelectorAll('.reviews-slider__slide')];
  const prevButton = slider.querySelector('[data-reviews-prev]');
  const nextButton = slider.querySelector('[data-reviews-next]');
  const status = slider.querySelector('[data-reviews-status]');
  if (!track || !slides.length || !prevButton || !nextButton || !status) return;

  let activeIndex = 0;

  const update = () => {
    track.style.transform = `translateX(${-activeIndex * 100}%)`;
    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
    status.textContent = `${activeIndex + 1} / ${slides.length}`;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.toggleAttribute('inert', !isActive);
    });
  };

  const showNext = () => {
    if (activeIndex >= slides.length - 1) return;
    activeIndex += 1;
    update();
  };

  const showPrevious = () => {
    if (activeIndex <= 0) return;
    activeIndex -= 1;
    update();
  };

  nextButton.addEventListener('click', showNext);
  prevButton.addEventListener('click', showPrevious);

  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPrevious();
    }
  });

  update();
})();

// Services page: Got U Nex Ref promotional iPad modal.
(() => {
  const openButton = document.querySelector('[data-gunr-video-open]');
  const dialog = document.querySelector('[data-gunr-video-dialog]');
  const closeButton = document.querySelector('[data-gunr-video-close]');
  if (!openButton || !dialog) return;
  const open = () => {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };
  const close = () => {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };
  openButton.addEventListener('click', open);
  closeButton?.addEventListener('click', close);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
})();
