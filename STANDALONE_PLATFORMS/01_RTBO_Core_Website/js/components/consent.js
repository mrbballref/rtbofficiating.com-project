const KEY = "rtboPrivacyPreferencesV1";

function readPreferences() {
  try { const value = localStorage.getItem(KEY); return value ? JSON.parse(value) : null; } catch { return null; }
}
function savePreferences(analytics) {
  try { localStorage.setItem(KEY, JSON.stringify({ essential: true, analytics, savedAt: new Date().toISOString() })); } catch { /* preference remains session-only if storage is unavailable */ }
}

export function initializeConsent() {
  const banner = document.querySelector("[data-consent-banner]");
  const analytics = document.querySelector("[data-consent-analytics]");
  const saved = readPreferences();
  if (banner) banner.hidden = Boolean(saved);
  if (analytics instanceof HTMLInputElement && saved) analytics.checked = Boolean(saved.analytics);
  document.querySelectorAll("[data-consent-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.getAttribute("data-consent-choice");
      savePreferences(choice === "all");
      if (banner) banner.hidden = true;
    });
  });
  document.querySelector("[data-consent-save]")?.addEventListener("click", () => {
    savePreferences(analytics instanceof HTMLInputElement ? analytics.checked : false);
    if (banner) banner.hidden = true;
  });
}
