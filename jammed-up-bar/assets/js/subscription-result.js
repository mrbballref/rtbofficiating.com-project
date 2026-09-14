(() => {
  const API_BASE = 'https://jammed-up-bar-service.onrender.com';
  const status=document.querySelector('[data-result-status]');
  const title=document.querySelector('[data-result-title]');
  const message=document.querySelector('[data-result-message]');
  if(!status || !title || !message) return;
  const details=document.querySelector('[data-result-details]');
  const params=new URLSearchParams(location.search);
  const names={listener:'Listener','bar-member':'Bar Member','crew-member':'Crew Member','all-access':'Network All-Access'};
  if(params.get('free')==='1'){
    status.textContent='SUBSCRIPTION ACTIVE'; title.textContent='Welcome to The Jammed Up Bar!';
    message.textContent='Your free Listener subscription has been created. Watch your email for network updates based on the preferences you selected.';
    details.hidden=false; document.querySelector('[data-result-plan]').textContent='Listener'; document.querySelector('[data-result-billing]').textContent='Free'; document.querySelector('[data-result-membership-status]').textContent='Active'; return;
  }
  const id=params.get('session_id');
  if(!id){status.textContent='MEMBERSHIP STATUS';title.textContent='Subscription verification unavailable.';message.textContent='No secure checkout session was provided. Return to the membership page if you still want to subscribe.';return;}
  fetch(`${API_BASE}/api/checkout/session/${encodeURIComponent(id)}`).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Unable to verify checkout.');return d;}).then(data=>{
    const active=data.status==='complete' && ['active','trialing'].includes(data.subscriptionStatus);
    status.textContent=active?'PAYMENT CONFIRMED':'CHECKOUT COMPLETED';
    title.textContent=active?'Welcome to The Jammed Up Bar!':'Your checkout is being finalized.';
    message.textContent=active?'Your paid membership is active. A payment confirmation is handled by the connected Stripe account, and member access can now be provisioned from the verified subscription event.':'Stripe returned the checkout successfully. Membership access should remain pending until the verified subscription webhook confirms an active subscription.';
    details.hidden=false; document.querySelector('[data-result-plan]').textContent=names[data.planCode]||data.planCode||'Membership'; document.querySelector('[data-result-billing]').textContent=data.billingInterval==='annual'?'Annual':data.billingInterval==='monthly'?'Monthly':'—'; document.querySelector('[data-result-membership-status]').textContent=data.subscriptionStatus||data.status||'Pending';
  }).catch(err=>{status.textContent='VERIFICATION NEEDED';title.textContent='We could not verify the subscription yet.';message.textContent=`${err.message} Your payment information is not stored on this page. Contact support if the payment provider shows a completed charge but access does not appear.`;});
})();
