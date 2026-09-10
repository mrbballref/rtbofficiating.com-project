const DESKTOP_QUERY = "(min-width: 1321px)";

function closeDisclosure(button, { restoreFocus = false } = {}) {
  const id = button.getAttribute("aria-controls");
  const panel = id ? document.getElementById(id) : null;
  button.setAttribute("aria-expanded", "false");
  if (panel) panel.hidden = true;
  if (restoreFocus) button.focus();
}

function closeDisclosureGroup(buttons, except = null) {
  buttons.forEach((button) => {
    if (button !== except && button.getAttribute("aria-expanded") === "true") closeDisclosure(button);
  });
}

function setupDisclosureButtons(selector) {
  const buttons = [...document.querySelectorAll(selector)];
  buttons.forEach((button) => {
    const id = button.getAttribute("aria-controls");
    const panel = id ? document.getElementById(id) : null;
    if (!panel) return;
    button.addEventListener("click", () => {
      const opening = button.getAttribute("aria-expanded") !== "true";
      closeDisclosureGroup(buttons, opening ? button : null);
      button.setAttribute("aria-expanded", String(opening));
      panel.hidden = !opening;
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || button.getAttribute("aria-expanded") !== "true") return;
      event.preventDefault();
      event.stopPropagation();
      closeDisclosure(button, { restoreFocus: true });
    });
    panel.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closeDisclosure(button, { restoreFocus: true });
    });
  });
  return buttons;
}

export function initializeNavigation() {
  const desktopButtons = setupDisclosureButtons(".rtbo-primary-nav__submenu-toggle");
  const mobileButtons = setupDisclosureButtons(".rtbo-mobile-nav__submenu-toggle");
  const mobileToggle = document.querySelector("[data-mobile-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const desktopMedia = window.matchMedia(DESKTOP_QUERY);

  const closeMobile = ({ restoreFocus = false } = {}) => {
    if (!mobileToggle || !mobileNav) return;
    mobileNav.hidden = true;
    mobileToggle.setAttribute("aria-expanded", "false");
    mobileToggle.setAttribute("aria-label", "Open navigation");
    closeDisclosureGroup(mobileButtons);
    if (restoreFocus) mobileToggle.focus();
  };

  mobileToggle?.addEventListener("click", () => {
    if (!mobileNav) return;
    const opening = mobileToggle.getAttribute("aria-expanded") !== "true";
    mobileToggle.setAttribute("aria-expanded", String(opening));
    mobileToggle.setAttribute("aria-label", opening ? "Close navigation" : "Open navigation");
    mobileNav.hidden = !opening;
    if (!opening) closeDisclosureGroup(mobileButtons);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const openDesktop = desktopButtons.find((button) => button.getAttribute("aria-expanded") === "true");
    const openMobile = mobileButtons.find((button) => button.getAttribute("aria-expanded") === "true");
    if (openDesktop) { event.preventDefault(); closeDisclosure(openDesktop, { restoreFocus: true }); return; }
    if (openMobile) { event.preventDefault(); closeDisclosure(openMobile, { restoreFocus: true }); return; }
    if (mobileToggle?.getAttribute("aria-expanded") === "true") { event.preventDefault(); closeMobile({ restoreFocus: true }); }
  });

  const accountMenu = document.querySelector(".rtbo-account-menu");
  document.addEventListener("pointerdown", (event) => {
    if (!(event.target instanceof Element)) return;
    if (!event.target.closest(".rtbo-primary-nav__item--has-submenu")) closeDisclosureGroup(desktopButtons);
    if (accountMenu instanceof HTMLDetailsElement && !event.target.closest(".rtbo-account-menu")) accountMenu.open = false;
  });
  accountMenu?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !(accountMenu instanceof HTMLDetailsElement) || !accountMenu.open) return;
    event.preventDefault();
    accountMenu.open = false;
    accountMenu.querySelector("summary")?.focus();
  });

  desktopMedia.addEventListener("change", (event) => {
    closeDisclosureGroup(desktopButtons);
    closeDisclosureGroup(mobileButtons);
    if (event.matches) closeMobile();
  });
}
