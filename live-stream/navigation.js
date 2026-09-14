(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  if (!header) return;

  const menuToggle = header.querySelector('.menu-toggle');
  const mobileMenu = header.querySelector('#mobile-menu');
  const desktopDropdowns = [...header.querySelectorAll('.has-dropdown')];
  const desktopToggles = [...header.querySelectorAll('.dropdown-toggle')];
  const mobileItems = [...header.querySelectorAll('.mobile-item')];
  const mobileDropdownToggles = [...header.querySelectorAll('.mobile-dropdown-toggle')];
  const primaryLinks = [...header.querySelectorAll('[data-nav-link], .desktop-nav a.nav-link, .mobile-nav-link[href]')];

  const closeDesktopDropdowns = () => {
    desktopDropdowns.forEach((item) => {
      item.classList.remove('is-open');
      item.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });
  };

  const closeMobileDropdowns = () => {
    mobileItems.forEach((item) => item.classList.remove('is-open'));
    mobileDropdownToggles.forEach((toggle) => toggle.setAttribute('aria-expanded', 'false'));
  };

  const setMenuOpen = (open) => {
    header.classList.toggle('menu-open', open);
    menuToggle?.setAttribute('aria-expanded', String(open));
    menuToggle?.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    mobileMenu?.setAttribute('aria-hidden', String(!open));
    if (!open) closeMobileDropdowns();
  };

  menuToggle?.addEventListener('click', () => {
    setMenuOpen(!header.classList.contains('menu-open'));
  });

  desktopToggles.forEach((toggle) => {
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const parent = toggle.closest('.has-dropdown');
      const shouldOpen = !parent.classList.contains('is-open');

      closeDesktopDropdowns();

      if (shouldOpen) {
        parent.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  mobileDropdownToggles.forEach((toggle) => {
    toggle.addEventListener('click', (event) => {
      event.preventDefault();

      const item = toggle.closest('.mobile-item');
      const shouldOpen = !item.classList.contains('is-open');

      closeMobileDropdowns();

      if (shouldOpen) {
        item.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  primaryLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeDesktopDropdowns();
      setMenuOpen(false);
    });
  });

  header.querySelectorAll('.dropdown-menu a, .mobile-submenu a, .cta, .brand').forEach((link) => {
    link.addEventListener('click', () => {
      closeDesktopDropdowns();
      closeMobileDropdowns();
      setMenuOpen(false);
    });
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) {
      closeDesktopDropdowns();
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDesktopDropdowns();
      setMenuOpen(false);
      menuToggle?.focus();
    }
  });

  const desktopMedia = window.matchMedia('(min-width: 1181px)');
  desktopMedia.addEventListener('change', () => {
    closeDesktopDropdowns();
    setMenuOpen(false);
  });
})();