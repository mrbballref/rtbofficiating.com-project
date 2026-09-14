(() => {
  // The main RTBO site serves this page from its own origin so nav/auth stay
  // unified; the subscription API lives on this platform's own backend.
  const API_BASE = 'https://jammed-up-bar-service.onrender.com';
  const form = document.querySelector('[data-subscription-form]');
  if (!form) return;
  const cards = [...document.querySelectorAll('[data-plan]')];
  const billingButtons = [...document.querySelectorAll('[data-billing]')];
  const status = document.querySelector('[data-subscription-status]');
  const submit = document.querySelector('[data-subscription-submit]');
  const planInput = form.querySelector('[data-plan-input]');
  const billingInput = form.querySelector('[data-billing-input]');
  const names = { listener:'Listener', 'bar-member':'Bar Member', 'crew-member':'Crew Member', 'all-access':'Network All-Access' };
  let selectedPlan = 'listener';
  let billing = 'monthly';

  const money = value => Number(value) === 0 ? '$0' : new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value));
  function priceFor(card){ return Number(card?.dataset[billing] || 0); }
  function renderCards(){
    cards.forEach(card => {
      const isSelected = card.dataset.plan === selectedPlan;
      card.classList.toggle('is-selected', isSelected);
      card.querySelector('[data-price]').textContent = money(priceFor(card));
      card.querySelector('[data-period]').textContent = priceFor(card) === 0 ? '/ forever' : billing === 'annual' ? '/ year' : '/ month';
      card.querySelector('[data-select-plan]').setAttribute('aria-pressed', String(isSelected));
    });
    billingButtons.forEach(btn => { const active=btn.dataset.billing===billing; btn.classList.toggle('is-active',active); btn.setAttribute('aria-pressed',String(active)); });
    updateSummary();
  }
  function updateSummary(){
    const card = cards.find(c => c.dataset.plan === selectedPlan);
    const price = priceFor(card);
    planInput.value = selectedPlan;
    billingInput.value = billing;
    document.querySelector('[data-selected-plan-name]').textContent = names[selectedPlan];
    document.querySelector('[data-selected-plan-price]').textContent = money(price);
    document.querySelector('[data-selected-plan-period]').textContent = price === 0 ? 'forever' : billing === 'annual' ? 'per year' : 'per month';
    document.querySelector('[data-order-plan]').textContent = names[selectedPlan];
    document.querySelector('[data-order-billing]').textContent = price === 0 ? 'Free' : billing === 'annual' ? 'Annual recurring' : 'Monthly recurring';
    document.querySelector('[data-order-total]').textContent = money(price);
    submit.textContent = window.RTBOSuperAdminAccess?.isActive() ? 'SUPER ADMIN — REVIEW MEMBERSHIP' : (price === 0 ? 'Create Free Subscription' : `Continue To Secure Checkout — ${money(price)}`);
  }
  cards.forEach(card => card.querySelector('[data-select-plan]')?.addEventListener('click', () => {
    selectedPlan = card.dataset.plan;
    if(selectedPlan==='listener') billing='monthly';
    renderCards();
    document.querySelector('#membership-form')?.scrollIntoView({behavior:'smooth',block:'start'});
  }));
  billingButtons.forEach(btn => btn.addEventListener('click', () => { billing = btn.dataset.billing; renderCards(); }));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if(window.RTBOSuperAdminAccess?.isActive()){
      status.className = 'subscription-form-status';
      status.textContent = 'Super Admin All-Access: this membership is available for administrative review. No account, subscription, or payment is required.';
      submit.disabled = false;
      submit.textContent = 'SUPER ADMIN — MEMBERSHIP AVAILABLE FOR REVIEW';
      return;
    }
    if(!form.reportValidity()) return;
    submit.disabled = true;
    status.className = 'subscription-form-status';
    const fd = new FormData(form);
    const payload = {
      plan: selectedPlan,
      billingInterval: billing,
      firstName: String(fd.get('firstName')||'').trim(),
      lastName: String(fd.get('lastName')||'').trim(),
      email: String(fd.get('email')||'').trim(),
      phone: String(fd.get('phone')||'').trim(),
      marketingConsent: fd.get('marketingConsent') === 'yes',
      termsAccepted: fd.get('termsAccepted') === 'yes',
      interests: fd.getAll('interests')
    };
    const isFree = selectedPlan === 'listener';
    status.textContent = isFree ? 'Creating your free network subscription…' : 'Opening secure Stripe Checkout…';
    try{
      const endpoint = isFree ? '/api/subscriptions/free' : '/api/checkout/session';
      const response = await fetch(`${API_BASE}${endpoint}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data = await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data.error || 'The subscription service could not complete this request.');
      if(data.url){ window.location.assign(data.url); return; }
      if(data.redirect){ window.location.assign(data.redirect); return; }
      throw new Error('The subscription service did not return a checkout destination.');
    }catch(error){
      status.classList.add('is-error');
      status.textContent = `${error.message} If you are previewing the static files, start the included Node server and configure the payment environment before testing subscriptions.`;
      submit.disabled = false;
    }
  });
  renderCards();
})();
