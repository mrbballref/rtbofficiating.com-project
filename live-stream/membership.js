(() => {
  const PLANS = {
    free: {
      name: "Live Stream Free",
      monthly: 0,
      annual: 0,
      label: "Free"
    },
    plus: {
      name: "Live Stream Plus",
      monthly: 9.99,
      annual: 99.99,
      label: "Plus"
    },
    premium: {
      name: "Live Stream Premium",
      monthly: 19.99,
      annual: 199.99,
      label: "Premium"
    },
    all_access: {
      name: "Live Stream All Access",
      monthly: 29.99,
      annual: 299.99,
      label: "All Access"
    }
  };

  window.TLS_MEMBERSHIP_PLANS = PLANS;

  const format = (amount) => Number(amount).toFixed(2).replace(/\.00$/, "");

  const billingButtons = [...document.querySelectorAll("[data-billing-cycle]")];
  const planPrices = [...document.querySelectorAll("[data-plan-price]")];
  const planLinks = [...document.querySelectorAll("[data-plan-select]")];

  const setCycle = (cycle) => {
    document.documentElement.dataset.billingCycle = cycle;
    billingButtons.forEach(btn => btn.classList.toggle("is-active", btn.dataset.billingCycle === cycle));
    planPrices.forEach(node => {
      const plan = PLANS[node.dataset.planPrice];
      if (!plan) return;
      const amount = plan[cycle];
      const amountNode = node.querySelector("[data-amount]");
      const periodNode = node.querySelector("[data-period]");
      const noteNode = node.closest(".tls-plan")?.querySelector("[data-annual-note]");
      if (amountNode) amountNode.textContent = format(amount);
      if (periodNode) periodNode.textContent = amount === 0 ? "" : (cycle === "monthly" ? "/ month" : "/ year");
      if (noteNode) noteNode.textContent = cycle === "annual" && amount > 0 ? "Annual billing selected" : "";
    });
    planLinks.forEach(link => {
      const planId = link.dataset.planSelect;
      if (planId === "free") return;
      link.href = `../subscribe/index.html?plan=${encodeURIComponent(planId)}&cycle=${encodeURIComponent(cycle)}`;
    });
  };

  billingButtons.forEach(btn => btn.addEventListener("click", () => setCycle(btn.dataset.billingCycle)));
  if (billingButtons.length) setCycle("monthly");

  // FAQ
  document.querySelectorAll("[data-membership-faq]").forEach(button => {
    button.addEventListener("click", () => {
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      const mark = button.querySelector("[data-faq-mark]");
      if (mark) mark.textContent = open ? "+" : "−";
      if (panel) panel.hidden = open;
    });
  });

  // Checkout page.
  const checkout = document.querySelector("[data-membership-checkout]");
  if (!checkout) return;

  const params = new URLSearchParams(location.search);
  const initialPlan = PLANS[params.get("plan")] ? params.get("plan") : "plus";
  const initialCycle = params.get("cycle") === "annual" ? "annual" : "monthly";

  const planSelect = checkout.querySelector("[data-checkout-plan]");
  const cycleSelect = checkout.querySelector("[data-checkout-cycle]");
  const emailInput = checkout.querySelector("[data-checkout-email]");
  const form = checkout.querySelector("form");
  const status = checkout.querySelector("[data-checkout-status]");
  const summaryPlan = checkout.querySelector("[data-summary-plan]");
  const summaryCycle = checkout.querySelector("[data-summary-cycle]");
  const summaryAmount = checkout.querySelector("[data-summary-amount]");
  const summaryTotal = checkout.querySelector("[data-summary-total]");
  const button = checkout.querySelector("[data-checkout-submit]");

  if (planSelect) planSelect.value = initialPlan;
  if (cycleSelect) cycleSelect.value = initialCycle;

  const updateSummary = () => {
    const planId = planSelect.value;
    const cycle = cycleSelect.value;
    const plan = PLANS[planId];
    const amount = plan[cycle];
    summaryPlan.textContent = plan.name;
    summaryCycle.textContent = cycle === "monthly" ? "Monthly" : "Annual";
    summaryAmount.textContent = `$${format(amount)}`;
    summaryTotal.textContent = `$${format(amount)}`;
    const adminAccess = window.RTBOSuperAdminAccess?.isActive();
    button.disabled = !adminAccess && planId === "free";
    button.textContent = adminAccess ? "SUPER ADMIN — REVIEW PLAN" : (planId === "free" ? "FREE PLAN — NO PAYMENT REQUIRED" : "CONTINUE TO SECURE CHECKOUT");
  };

  planSelect?.addEventListener("change", updateSummary);
  cycleSelect?.addEventListener("change", updateSummary);
  updateSummary();

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (window.RTBOSuperAdminAccess?.isActive()) {
      status.textContent = "Super Admin All-Access: this membership is open for administrative review. No account or payment is required.";
      button.disabled = false;
      button.textContent = "SUPER ADMIN — PLAN AVAILABLE FOR REVIEW";
      return;
    }
    if (!form.reportValidity()) return;

    const plan = planSelect.value;
    const cycle = cycleSelect.value;
    if (plan === "free") {
      status.textContent = "The free membership does not require payment. Account activation can be completed after authentication is connected.";
      return;
    }

    button.disabled = true;
    button.textContent = "OPENING SECURE CHECKOUT…";
    status.textContent = "";

    try {
      const response = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          plan,
          cycle,
          email: emailInput.value.trim()
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Payment gateway is not configured.");
      }

      location.assign(data.url);
    } catch (error) {
      status.textContent = `${error.message} Connect the supplied Stripe server configuration and environment variables to activate live payments.`;
      button.disabled = false;
      button.textContent = "CONTINUE TO SECURE CHECKOUT";
    }
  });
})();