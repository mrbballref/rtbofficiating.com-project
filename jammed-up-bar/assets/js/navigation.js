(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const desktopDropdowns = [...document.querySelectorAll('.has-dropdown')];
  const desktopToggles = [...document.querySelectorAll('.dropdown-toggle')];
  const mobileItems = [...document.querySelectorAll('.mobile-item')];
  const mobileDropdownToggles = [...document.querySelectorAll('.mobile-dropdown-toggle')];
  const primaryLinks = [...document.querySelectorAll('[data-nav-link], .desktop-nav a.nav-link, .mobile-nav-link[href]')];

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

  const setActive = (target) => {
    document.querySelectorAll('.nav-link.active, .mobile-nav-link.active, .dropdown-toggle.active, .cta.active-cta')
      .forEach((item) => item.classList.remove('active'));
    target.classList.add('active');
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

      // Clicking an already-open main item closes its dropdown.
      closeDesktopDropdowns();

      if (shouldOpen) {
        parent.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }

      setActive(toggle);
    });
  });

  mobileDropdownToggles.forEach((toggle) => {
    toggle.addEventListener('click', (event) => {
      event.preventDefault();

      const item = toggle.closest('.mobile-item');
      const shouldOpen = !item.classList.contains('is-open');

      // Clicking an already-open mobile main item closes its submenu.
      closeMobileDropdowns();

      if (shouldOpen) {
        item.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }

      setActive(toggle);
    });
  });

  primaryLinks.forEach((link) => {
    link.addEventListener('click', () => {
      setActive(link);
      closeDesktopDropdowns();
      setMenuOpen(false);
    });
  });

  document.querySelectorAll('.dropdown-menu a').forEach((link) => {
    link.addEventListener('click', () => {
      const parentToggle = link.closest('.has-dropdown')?.querySelector('.dropdown-toggle');
      if (parentToggle) setActive(parentToggle);
      closeDesktopDropdowns();
      setMenuOpen(false);
    });
  });

  document.querySelectorAll('.mobile-submenu a').forEach((link) => {
    link.addEventListener('click', () => {
      const parentToggle = link.closest('.mobile-item')?.querySelector('.mobile-dropdown-toggle');
      if (parentToggle) setActive(parentToggle);
      closeMobileDropdowns();
      setMenuOpen(false);
    });
  });

  document.querySelectorAll('.cta, .brand').forEach((link) => {
    link.addEventListener('click', () => {
      closeDesktopDropdowns();
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
