export function initializeDialogs() {
  const lastFocus = new WeakMap();
  document.querySelectorAll("[data-dialog-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-dialog-open");
      const dialog = id ? document.getElementById(id) : null;
      if (!(dialog instanceof HTMLDialogElement)) return;
      lastFocus.set(dialog, button);
      dialog.showModal();
      dialog.querySelector("[data-dialog-close], button, [href], input, select, textarea")?.focus();
    });
  });
  document.querySelectorAll("[data-dialog]").forEach((dialog) => {
    if (!(dialog instanceof HTMLDialogElement)) return;
    dialog.querySelectorAll("[data-dialog-close]").forEach((button) => button.addEventListener("click", () => dialog.close()));
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      const trigger = lastFocus.get(dialog);
      if (trigger instanceof HTMLElement) trigger.focus();
    });
  });
}
