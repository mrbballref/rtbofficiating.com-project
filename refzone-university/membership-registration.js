
(()=>{
  const esc=(value)=>String(value??'').replace(/[&<>'"]/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const PLAN_PATH={preview:'foundations',foundations:'foundations',advancement:'advancement',elite:'elite','all-access':'foundations'};
  const state={step:0,billing:'monthly',checkout:null,config:null,context:null};

  function priceFor(plan,billing){return billing==='annual'?(plan.annual??0):(plan.monthly??0)}
  function billingLabel(billing){return billing==='annual'?'year':'month'}
  function renderComparison(memberships,recommendation,options={}){
    const checkoutPrefix=options.checkoutPrefix||'';
    return `<section class="reg-plan-comparison" aria-labelledby="membership-heading">
      <header class="reg-plan-header">
        <div><p class="reg-kicker">Membership access</p><h2 id="membership-heading">Choose your development access.</h2><p>Membership controls access to learning resources. Academic admission, governing-body registration, certification, assignments, employment, and advancement remain separate.</p></div>
        <div class="reg-billing-toggle" role="group" aria-label="Billing period"><button class="is-active" type="button" data-plan-billing="monthly">Monthly</button><button type="button" data-plan-billing="annual">Annual · save up to 17%</button></div>
      </header>
      <div class="reg-plan-grid">${memberships.map(plan=>`<article class="reg-plan-card ${recommendation?.membership===plan.id?'is-recommended':''}" data-comparison-plan="${esc(plan.id)}">${recommendation?.membership===plan.id?'<span class="reg-plan-card__badge">RECOMMENDED FOR YOUR PLACEMENT</span>':''}<p class="reg-kicker">${esc(plan.name)}</p><h3>${esc(plan.intended)}</h3><div class="reg-plan-card__price"><strong data-plan-price>$${plan.monthly}</strong><span data-plan-period> / month</span></div><p>${esc(plan.tracks)} · ${esc(plan.pathway)}</p><ul>${plan.features.slice(0,6).map(item=>`<li>${esc(item)}</li>`).join('')}</ul><a class="reg-button ${plan.id==='preview'?'reg-button--secondary':''}" href="${esc(checkoutPrefix)}#/checkout/${esc(plan.id)}" data-plan-link>${plan.id==='preview'?'Activate free access':'Start registration'}</a></article>`).join('')}</div>
      <div class="reg-notice">Prices shown in U.S. dollars. Taxes are calculated by the configured payment provider when applicable. Paid plans renew automatically until canceled. No paid add-ons are preselected.</div>
    </section>`;
  }

  function mountComparison(memberships,options={}){
    const checkoutPrefix=options.checkoutPrefix||'';
    const buttons=[...document.querySelectorAll('[data-plan-billing]')];
    buttons.forEach(button=>button.addEventListener('click',()=>{
      const billing=button.dataset.planBilling;
      buttons.forEach(item=>item.classList.toggle('is-active',item===button));
      document.querySelectorAll('[data-comparison-plan]').forEach(card=>{
        const plan=memberships.find(item=>item.id===card.dataset.comparisonPlan);
        card.querySelector('[data-plan-price]').textContent=`$${priceFor(plan,billing)}`;
        card.querySelector('[data-plan-period]').textContent=plan.id==='preview'?'':' / '+billingLabel(billing);
        card.querySelector('[data-plan-link]').href=`${checkoutPrefix}#/checkout/${plan.id}?billing=${billing}`;
      });
    }));
  }

  function render({membership,tracks,pathways,recommendation}){
    const recommendedTrack=recommendation?.track||'nfhs';
    const pathwayId=PLAN_PATH[membership.id]||'foundations';
    const selectedPath=recommendation?.pathway||pathwayId;
    const billing=new URLSearchParams((location.hash.split('?')[1]||'')).get('billing')||'monthly';
    state.billing=membership.annual?billing:'monthly';
    return `<section class="membership-register" data-membership-register data-plan="${esc(membership.id)}">
      <div class="reg-hero"><div class="reg-hero__grid"><div><p class="reg-kicker">Secure membership enrollment</p><h2>Build your RefZone learning plan.</h2><p>Create your account, select the competition track and degree-structured pathway that match your goals, review transparent recurring-billing terms, and complete payment through Stripe’s secure checkout.</p></div><div class="reg-secure-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1 4 4v6c0 5.4 3.4 10.4 8 12 4.6-1.6 8-6.6 8-12V4l-8-3Zm0 4a3 3 0 0 1 3 3v1h1v7H8V9h1V8a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v1h2V8a1 1 0 0 0-1-1Z"/></svg><div><strong>Secure payment gateway</strong><span>Payment details go directly to Stripe and never touch RefZone servers.</span></div></div></div></div>
      <div class="reg-progress" aria-label="Registration progress">${['Account','Learning plan','Billing terms','Secure payment'].map((label,index)=>`<button type="button" class="reg-progress__step ${index===0?'is-current':''}" data-reg-progress="${index}" ${index>0?'disabled':''}><span>${index+1}</span><b>${label}</b></button>`).join('')}</div>
      <div class="reg-layout">
        <form class="reg-panel" id="membershipRegistrationForm" novalidate>
          <header class="reg-panel__header"><div><p class="reg-kicker" id="regStepKicker">Step 1 of 4</p><h3 id="regStepTitle">Create your student account</h3><p id="regStepDescription">Use an email address you can access. Your password is transmitted only to the RefZone server and stored as a one-way hash.</p></div></header>
          <div class="reg-step is-active" data-reg-step="0">
            <div class="reg-grid">
              <div class="reg-field"><label for="regFirstName">First name</label><input id="regFirstName" name="firstName" autocomplete="given-name" required maxlength="80"></div>
              <div class="reg-field"><label for="regLastName">Last name</label><input id="regLastName" name="lastName" autocomplete="family-name" required maxlength="80"></div>
              <div class="reg-field reg-field--full"><label for="regEmail">Email address</label><input id="regEmail" name="email" type="email" autocomplete="email" required maxlength="180" value="${esc(recommendation?.email||'')}"><small>Receipts, renewal notices, and account messages will be sent here.</small></div>
              <div class="reg-field"><label for="regPassword">Password</label><input id="regPassword" name="password" type="password" autocomplete="new-password" minlength="12" required><small>At least 12 characters.</small></div>
              <div class="reg-field"><label for="regConfirmPassword">Confirm password</label><input id="regConfirmPassword" name="confirmPassword" type="password" autocomplete="new-password" minlength="12" required></div>
              <div class="reg-field"><label for="regPhone">Mobile phone <span aria-hidden="true">(optional)</span></label><input id="regPhone" name="phone" type="tel" autocomplete="tel" maxlength="30"></div>
              <div class="reg-field"><label for="regCountry">Country</label><select id="regCountry" name="country" autocomplete="country" required><option value="US">United States</option><option value="CA">Canada</option><option value="GB">United Kingdom</option><option value="AU">Australia</option><option value="other">Other</option></select></div>
            </div>
          </div>
          <div class="reg-step" data-reg-step="1">
            <div class="reg-grid">
              <div class="reg-field reg-field--full"><label for="regTrack">Primary competition track</label><select id="regTrack" name="track" required>${tracks.map(track=>`<option value="${esc(track.id)}" ${track.id===recommendedTrack?'selected':''}>${esc(track.name)}</option>`).join('')}</select><small>${membership.id==='all-access'?'All-Access unlocks all tracks; this selection sets the student’s starting dashboard.':'This plan includes one primary ruleset. Changes are subject to membership policy.'}</small></div>
              <div class="reg-field reg-field--full"><label for="regPathway">Starting pathway</label><select id="regPathway" name="pathway" required ${membership.id!=='all-access'?'aria-readonly="true"':''}>${pathways.map(path=>`<option value="${esc(path.id)}" ${(membership.id==='all-access'?selectedPath:pathwayId)===path.id?'selected':''} ${membership.id!=='all-access'&&path.id!==pathwayId?'disabled':''}>${esc(path.title)}</option>`).join('')}</select><small>Membership access and formal academic admission are separate. This selection does not confer an accredited degree status.</small></div>
              <div class="reg-field"><label for="regExperience">Years officiating</label><select id="regExperience" name="experience" required><option value="">Select</option><option value="0">New official</option><option value="1-2">1–2 years</option><option value="3-5">3–5 years</option><option value="6-10">6–10 years</option><option value="11+">11+ years</option></select></div>
              <div class="reg-field"><label for="regCurrentLevel">Current highest level</label><select id="regCurrentLevel" name="currentLevel" required><option value="">Select</option><option>Youth / recreational</option><option>Middle school</option><option>High school</option><option>Junior college</option><option>NAIA</option><option>NCAA</option><option>International</option><option>Professional</option><option>Not currently officiating</option></select></div>
              <div class="reg-field reg-field--full"><label for="regGoal">Primary development goal</label><textarea id="regGoal" name="goal" maxlength="600" required placeholder="Describe the ruleset, mechanics, judgment, leadership, evaluation, or research capability you want to develop."></textarea></div>
            </div>
            <div class="reg-consents"><label class="reg-check"><input type="checkbox" name="advisorReview"><span>Request an academic-advisor review of my starting pathway after registration.</span></label></div>
          </div>
          <div class="reg-step" data-reg-step="2">
            ${membership.id==='preview'?'<div class="reg-notice"><strong>No payment required.</strong> RefZone Preview is free and does not renew. Complete the disclosures below to activate access.</div>':`<p class="reg-label">Choose billing frequency</p><div class="reg-choice-grid"><label class="reg-choice-card"><input type="radio" name="billing" value="monthly" ${state.billing==='monthly'?'checked':''}><span class="reg-choice-card__body"><strong>Monthly · $${membership.monthly}</strong><span>Charged today and automatically every month until canceled.</span></span></label><label class="reg-choice-card"><input type="radio" name="billing" value="annual" ${state.billing==='annual'?'checked':''}><span class="reg-choice-card__body"><strong>Annual · $${membership.annual}</strong><span>Charged today and automatically each year until canceled.</span></span></label></div>`}
            <div class="reg-notice"><strong>Transparent billing:</strong> the final amount, applicable tax, discounts, payment method, and renewal schedule are displayed by Stripe before you authorize payment. No paid add-on is preselected.</div>
            <div class="reg-consents">
              <label class="reg-check"><input type="checkbox" name="termsAccepted" required><span>I agree to the <a href="#/terms" target="_blank">Terms of Membership</a> and acknowledge that membership is separate from academic admission, governing-body registration, certification, assignments, employment, and advancement.</span></label>
              <label class="reg-check"><input type="checkbox" name="privacyAccepted" required><span>I acknowledge the <a href="#/privacy" target="_blank">Privacy Notice</a> and consent to processing the information required to create and administer my account.</span></label>
              ${membership.id==='preview'?'':`<label class="reg-check"><input type="checkbox" name="recurringAccepted" required><span>I explicitly authorize recurring ${state.billing==='annual'?'annual':'monthly'} charges until I cancel according to the cancellation terms shown before payment.</span></label>`}
              <label class="reg-check"><input type="checkbox" name="refundAccepted" required><span>I reviewed the <a href="#/refund" target="_blank">Refund and Cancellation Policy</a>. The live gateway must remain disabled until this policy receives administrator and legal approval.</span></label>
              <label class="reg-check"><input type="checkbox" name="marketing"><span>Send optional course updates, clinics, and educational announcements. This choice is not preselected and can be changed later.</span></label>
            </div>
          </div>
          <div class="reg-step" data-reg-step="3">
            <div id="regPaymentIntro"><p class="reg-label">Secure checkout</p><div class="reg-notice">Your account and learning-plan information will be validated before the secure payment form loads. Card and wallet details are tokenized by Stripe and are never stored by RefZone University.</div></div>
            <div class="reg-gateway" id="stripeCheckout"><div class="reg-gateway-status" id="gatewayStatus"><div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1 4 4v6c0 5.4 3.4 10.4 8 12 4.6-1.6 8-6.6 8-12V4l-8-3Zm0 4a3 3 0 0 1 3 3v1h1v7H8V9h1V8a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v1h2V8a1 1 0 0 0-1-1Z"/></svg><h4>${membership.id==='preview'?'Ready to activate Preview':'Payment gateway loads after validation'}</h4><p>${membership.id==='preview'?'No card is required. Select Activate Preview below.':'Select Continue to secure payment to initialize Stripe Checkout.'}</p></div></div></div>
            <div class="reg-payment-assurance"><div><strong>Encrypted</strong>TLS required in production</div><div><strong>Tokenized</strong>No card data stored locally</div><div><strong>Recurring terms</strong>Displayed before authorization</div></div>
          </div>
          <div class="reg-error" id="regError" role="alert"></div>
          <div class="reg-actions"><button class="reg-button reg-button--secondary" id="regBack" type="button" disabled>Back</button><button class="reg-button" id="regNext" type="button">Continue</button></div>
        </form>
        <aside class="reg-summary" aria-label="Membership order summary"><div class="reg-summary__top"><p class="reg-kicker">Order summary</p><h3>${esc(membership.name)}</h3></div><div class="reg-summary__body"><div class="reg-summary__price"><strong id="summaryPrice">$${priceFor(membership,state.billing)}</strong><span id="summaryPeriod">${membership.id==='preview'?'free access':'/'+billingLabel(state.billing)}</span></div><div class="reg-summary__rows"><div class="reg-summary__row"><span>Primary track</span><strong id="summaryTrack">${esc(tracks.find(t=>t.id===recommendedTrack)?.name||tracks[0].name)}</strong></div><div class="reg-summary__row"><span>Pathway</span><strong id="summaryPathway">${esc(pathways.find(p=>p.id===(membership.id==='all-access'?selectedPath:pathwayId))?.short||'Bachelor’s')}</strong></div><div class="reg-summary__row"><span>Due today</span><strong id="summaryDue">$${priceFor(membership,state.billing)}${membership.id==='preview'?'':' + applicable tax'}</strong></div><div class="reg-summary__row"><span>Renewal</span><strong id="summaryRenewal">${membership.id==='preview'?'No renewal':state.billing==='annual'?'Annually until canceled':'Monthly until canceled'}</strong></div><div class="reg-summary__row"><span>Film reviews</span><strong>${membership.reviews||0} per month</strong></div></div></div><div class="reg-summary__legal">Membership does not guarantee admission, certification, assignments, employment, or advancement. Stripe determines the final payment methods, taxes, discounts, and transaction status. <a href="index.html#membership-access">Change membership</a>.</div></aside>
      </div>
    </section>`;
  }

  function mount(context){
    const superAdminAccess = window.RTBOSuperAdminAccess?.isActive();
    state.context=context;state.step=0;state.checkout=null;
    const root=document.querySelector('[data-membership-register]');
    if(!root)return;
    const form=document.getElementById('membershipRegistrationForm');
    const steps=[...root.querySelectorAll('[data-reg-step]')];
    const progress=[...root.querySelectorAll('[data-reg-progress]')];
    const back=document.getElementById('regBack');
    const next=document.getElementById('regNext');
    const error=document.getElementById('regError');
    const titles=[['Create your student account','Use an email address you can access. Your password is transmitted only to the RefZone server and stored as a one-way hash.'],['Choose your learning plan','Set the primary competition track and starting pathway used on your student dashboard.'],['Review billing and consent','Confirm billing frequency, automatic renewal, privacy, refund, and membership-status disclosures.'],['Complete secure checkout','Activate free Preview access or authorize payment in Stripe’s secure embedded checkout.']];
    const showError=(message)=>{error.textContent=message;error.classList.add('is-visible');error.focus?.()};
    const clearError=()=>{error.textContent='';error.classList.remove('is-visible')};
    const setStep=(index)=>{
      state.step=Math.max(0,Math.min(3,index));clearError();
      steps.forEach((step,i)=>step.classList.toggle('is-active',i===state.step));
      progress.forEach((item,i)=>{item.classList.toggle('is-current',i===state.step);item.classList.toggle('is-complete',i<state.step);item.disabled=i>state.step});
      document.getElementById('regStepKicker').textContent=`Step ${state.step+1} of 4`;
      document.getElementById('regStepTitle').textContent=titles[state.step][0];
      document.getElementById('regStepDescription').textContent=titles[state.step][1];
      back.disabled=state.step===0;
      next.style.display=state.step===3&&state.checkout?'none':'inline-flex';
      next.textContent=state.step===2?'Review secure payment':state.step===3?(context.membership.id==='preview'?'Activate Preview':'Continue to secure payment'):'Continue';
      root.querySelector('.reg-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    };
    const updateSummary=()=>{
      const track=context.tracks.find(item=>item.id===form.track.value);
      const path=context.pathways.find(item=>item.id===form.pathway.value);
      const billing=form.billing?.value||'monthly';state.billing=billing;
      document.getElementById('summaryTrack').textContent=track?.name||'';
      document.getElementById('summaryPathway').textContent=path?.short||'';
      document.getElementById('summaryPrice').textContent=`$${priceFor(context.membership,billing)}`;
      document.getElementById('summaryPeriod').textContent=context.membership.id==='preview'?'free access':'/'+billingLabel(billing);
      document.getElementById('summaryDue').textContent=`$${priceFor(context.membership,billing)}${context.membership.id==='preview'?'':' + applicable tax'}`;
      document.getElementById('summaryRenewal').textContent=context.membership.id==='preview'?'No renewal':billing==='annual'?'Annually until canceled':'Monthly until canceled';
      const recurring=form.querySelector('[name="recurringAccepted"]')?.closest('.reg-check span');
      if(recurring)recurring.textContent=`I explicitly authorize recurring ${billing==='annual'?'annual':'monthly'} charges until I cancel according to the cancellation terms shown before payment.`;
    };
    if(superAdminAccess){
      const adminPanel=document.createElement('div');
      adminPanel.dataset.superAdminRzuBypass='true';
      adminPanel.className='reg-notice';
      adminPanel.innerHTML='<strong>Super Admin All-Access Mode</strong> This membership and its included course access are available for administrative review without creating an account, enrolling, or completing payment. <button type="button" class="button" data-super-admin-open-rzu>Open All-Access Dashboard</button>';
      form.prepend(adminPanel);
      adminPanel.querySelector('[data-super-admin-open-rzu]')?.addEventListener('click',()=>{location.hash='#/dashboard'});
    }
    form.addEventListener('change',updateSummary);updateSummary();
    progress.forEach(item=>item.addEventListener('click',()=>{const target=Number(item.dataset.regProgress);if(target<=state.step)setStep(target)}));
    back.addEventListener('click',()=>setStep(state.step-1));
    next.addEventListener('click',async()=>{
      clearError();
      if(superAdminAccess){
        location.hash='#/dashboard';
        return;
      }
      if(state.step===0){
        const controls=[form.firstName,form.lastName,form.email,form.password,form.confirmPassword,form.country];
        if(!controls.every(control=>control.reportValidity()))return;
        if(form.password.value!==form.confirmPassword.value){showError('The password confirmation does not match.');return}
        setStep(1);return;
      }
      if(state.step===1){
        const controls=[form.track,form.pathway,form.experience,form.currentLevel,form.goal];
        if(!controls.every(control=>control.reportValidity()))return;
        setStep(2);return;
      }
      if(state.step===2){
        const required=[...steps[2].querySelectorAll('[required]')];
        if(!required.every(control=>control.reportValidity()))return;
        setStep(3);return;
      }
      if(state.step===3){
        next.disabled=true;next.textContent=context.membership.id==='preview'?'Activating…':'Loading gateway…';
        try{
          if(context.membership.id==='preview')await activatePreview(form,context);
          else await initializeStripe(form,context);
        }catch(err){showError(err.message||'Registration could not be completed.');next.disabled=false;next.textContent=context.membership.id==='preview'?'Activate Preview':'Continue to secure payment'}
      }
    });
    setStep(0);
  }

  function registrationPayload(form,context){
    const data=new FormData(form);
    return {
      firstName:data.get('firstName'),lastName:data.get('lastName'),email:data.get('email'),password:data.get('password'),phone:data.get('phone')||'',country:data.get('country'),
      track:data.get('track'),pathway:data.get('pathway'),experience:data.get('experience'),currentLevel:data.get('currentLevel'),goal:data.get('goal'),advisorReview:data.get('advisorReview')==='on',
      plan:context.membership.id,billing:data.get('billing')||'monthly',termsAccepted:data.get('termsAccepted')==='on',privacyAccepted:data.get('privacyAccepted')==='on',recurringAccepted:context.membership.id==='preview'||data.get('recurringAccepted')==='on',refundAccepted:data.get('refundAccepted')==='on',marketing:data.get('marketing')==='on'
    };
  }

  async function api(path,options={}){
    const response=await fetch(path,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
    const body=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(body.error||'The server returned an unexpected response.');
    return body;
  }

  async function activatePreview(form,context){
    const result=await api('/api/register-preview',{method:'POST',body:JSON.stringify(registrationPayload(form,context))});
    localStorage.setItem('rz:enrollment',JSON.stringify({plan:'preview',track:form.track.value,pathway:form.pathway.value,email:form.email.value,registrationId:result.registrationId,createdAt:Date.now()}));
    location.href='membership-return.html?preview=1';
  }


  function loadStripeJs(){
    if(typeof Stripe==='function')return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-refzone-stripe]');
      if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(new Error('Stripe.js could not be loaded.')),{once:true});return}
      const script=document.createElement('script');script.src='https://js.stripe.com/v3/';script.async=true;script.dataset.refzoneStripe='true';script.onload=resolve;script.onerror=()=>reject(new Error('Stripe.js could not be loaded. Check the network connection and Content Security Policy.'));document.head.appendChild(script);
    });
  }

  async function initializeStripe(form,context){
    const status=document.getElementById('gatewayStatus');
    status.innerHTML='<div><h4>Connecting to Stripe…</h4><p>Do not refresh the page.</p></div>';
    const config=await api('/api/membership-config');state.config=config;
    if(!config.gatewayConfigured){
      const reason=config.stripeConfigured&&!config.paymentsApproved?'The Stripe keys are configured, but the legal and administrative launch gate is still closed.':'The server environment does not yet contain valid Stripe keys.';
      status.innerHTML=`<div><h4>Stripe gateway activation required</h4><p>${reason}</p><ol class="reg-config-list"><li>Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY.</li><li>Run the included Stripe catalog setup script.</li><li>Set STRIPE_WEBHOOK_SECRET and APP_URL.</li><li>Approve the Terms, Privacy, Refund, Cancellation, tax, and support policies.</li><li>Set PAYMENTS_LIVE_APPROVED=true and test in Stripe sandbox mode.</li></ol></div>`;
      throw new Error('Payment gateway activation is incomplete. See PAYMENT-GATEWAY-SETUP.md in the website package.');
    }
    await loadStripeJs();
    const stripe=Stripe(config.publishableKey);
    const payload=registrationPayload(form,context);
    const fetchClientSecret=async()=>{
      const result=await api('/api/create-checkout-session',{method:'POST',body:JSON.stringify(payload)});
      return result.clientSecret;
    };
    status.remove();
    const checkout=await stripe.initEmbeddedCheckout({fetchClientSecret});
    state.checkout=checkout;
    checkout.mount('#stripeCheckout');
    document.getElementById('regNext').style.display='none';
    document.getElementById('regBack').disabled=true;
  }

  window.RefZoneMembershipRegistration={render,renderComparison,mount,mountComparison};
})();
