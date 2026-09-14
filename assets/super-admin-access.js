// Compatibility shim: keeps the window.RTBOSuperAdminAccess API that ~232
// pages already call (canView/hasAccess/unlockMarkedContent/etc.) but backs
// it with the real is_super_admin() check (assets/auth.js -> Supabase RPC)
// instead of trusting a URL query param, path segment, or a localStorage
// flag anyone could set.
//
// Real access control lives in Postgres RLS + column-level grants (see the
// RTBO Supabase project's migrations): profiles.approved_role/account_status
// can only be written server-side via the admin_set_user_access() RPC, so
// even if this shim were bypassed entirely, privileged data stays
// unreadable/unwritable from the browser.
(() => {
  "use strict";

  const scriptEl = [...document.scripts].find((s) => s.hasAttribute("data-super-admin-runtime"));
  const src = scriptEl?.src || "";
  let authModuleUrl = "./auth.js";
  try {
    authModuleUrl = new URL("./auth.js", src).href;
  } catch {
    /* fall back to relative path */
  }

  let cachedIsSuperAdmin = false;
  let cachedUserId = null;

  async function loadStatus() {
    try {
      const { getSession, isSuperAdmin } = await import(authModuleUrl);
      const session = await getSession();
      if (!session) {
        cachedIsSuperAdmin = false;
        cachedUserId = null;
        return cachedIsSuperAdmin;
      }
      cachedUserId = session.user.id;
      cachedIsSuperAdmin = await isSuperAdmin();
      return cachedIsSuperAdmin;
    } catch {
      cachedIsSuperAdmin = false;
      return cachedIsSuperAdmin;
    }
  }

  function isActiveSync() {
    // Synchronous callers get the last-known answer; loadStatus() below
    // keeps it fresh. Defaults to false (locked) until the real check
    // resolves, which is the safe direction to fail in.
    return cachedIsSuperAdmin === true;
  }

  function hasAccessSync() {
    return isActiveSync();
  }

  function unlockMarkedContent(root = document) {
    if (!isActiveSync()) return;
    const selectors = [
      "[data-auth-required]", "[data-account-required]", "[data-login-required]",
      "[data-membership-required]", "[data-premium-required]", "[data-premium-only]",
      "[data-entitlement-required]", "[data-locked]", "[data-access-locked]",
    ];
    selectors.forEach((sel) => {
      root.querySelectorAll?.(sel).forEach((el) => {
        el.hidden = false;
        el.removeAttribute("aria-hidden");
        el.removeAttribute("aria-disabled");
        el.removeAttribute("data-locked");
        el.removeAttribute("data-access-locked");
        el.classList.remove("locked", "is-locked", "paywalled", "members-only-locked");
        el.dataset.superAdminUnlocked = "true";
      });
    });
  }

  function addBadge() {
    if (!isActiveSync() || document.getElementById("rtboSuperAdminBadge")) return;
    const badge = document.createElement("a");
    badge.id = "rtboSuperAdminBadge";
    let accessUrl = "#";
    try {
      accessUrl = new URL("../cms/access-center.html", new URL(src)).href;
    } catch {
      /* leave as # */
    }
    badge.href = accessUrl;
    badge.innerHTML = "<span>SUPER ADMIN</span><strong>ALL ACCESS</strong>";
    badge.setAttribute("aria-label", "Open Super Admin All-Access Center");
    document.body.appendChild(badge);
  }

  function render() {
    document.documentElement.toggleAttribute("data-super-admin-access", isActiveSync());
    if (!isActiveSync()) {
      document.getElementById("rtboSuperAdminBadge")?.remove();
      return;
    }
    const ready = () => {
      unlockMarkedContent();
      addBadge();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
    else ready();
  }

  async function refresh() {
    await loadStatus();
    render();
  }

  refresh();

  window.RTBOSuperAdminAccess = {
    isActive: isActiveSync,
    hasAccess: hasAccessSync,
    canView: isActiveSync,
    hasMembership: isActiveSync,
    canViewCourse: isActiveSync,
    canManage: isActiveSync,
    bypassAccount: isActiveSync,
    bypassPayment: isActiveSync,
    unlockMarkedContent,
    refresh,
    currentUserId: () => cachedUserId,
  };

  const observer = new MutationObserver((muts) => {
    if (!isActiveSync()) return;
    for (const m of muts) for (const node of m.addedNodes) if (node.nodeType === 1) unlockMarkedContent(node);
  });
  if (document.documentElement) observer.observe(document.documentElement, { childList: true, subtree: true });
})();
