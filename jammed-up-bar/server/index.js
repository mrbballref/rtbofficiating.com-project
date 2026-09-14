require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const siteRoot = path.resolve(__dirname, '..');
const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// The main RTBO site (rtbo-site) serves a copy of these pages from its own
// origin so nav/auth stay unified; this API is only reachable cross-origin.
const ALLOWED_ORIGINS = [process.env.MAIN_SITE_URL || 'https://rtbo-site.onrender.com', 'http://localhost:8080', 'http://127.0.0.1:8080'];
app.use('/api', cors({ origin: ALLOWED_ORIGINS }));

const PLAN_CONFIG = Object.freeze({
  'bar-member': { name:'Bar Member', monthly:process.env.STRIPE_PRICE_BAR_MEMBER_MONTHLY, annual:process.env.STRIPE_PRICE_BAR_MEMBER_ANNUAL },
  'crew-member': { name:'Crew Member', monthly:process.env.STRIPE_PRICE_CREW_MEMBER_MONTHLY, annual:process.env.STRIPE_PRICE_CREW_MEMBER_ANNUAL },
  'all-access': { name:'Network All-Access', monthly:process.env.STRIPE_PRICE_ALL_ACCESS_MONTHLY, annual:process.env.STRIPE_PRICE_ALL_ACCESS_ANNUAL }
});
const allowedInterests = new Set(['episodes','live','news','events']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value,max=200) => String(value || '').trim().slice(0,max);

async function supabaseRequest(table, method, body, query=''){
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url || !key) throw new Error('Subscriber database is not configured.');
  const response = await fetch(`${url.replace(/\/$/,'')}/rest/v1/${table}${query}`,{
    method,
    headers:{'apikey':key,'Authorization':`Bearer ${key}`,'Content-Type':'application/json','Prefer':'return=representation,resolution=merge-duplicates'},
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text=await response.text();
  if(!response.ok) throw new Error(`Subscriber database error (${response.status}).`);
  return text ? JSON.parse(text) : [];
}

async function upsertSubscriber(data){
  const record={
    email:data.email.toLowerCase(), first_name:data.firstName, last_name:data.lastName, phone:data.phone || null,
    marketing_consent:Boolean(data.marketingConsent), interests:data.interests || [], terms_accepted_at:new Date().toISOString(), updated_at:new Date().toISOString()
  };
  const rows=await supabaseRequest('podcast_subscribers','POST',record,'?on_conflict=email');
  return rows[0];
}
async function upsertSubscription(data){
  return supabaseRequest('podcast_subscriptions','POST',data,'?on_conflict=stripe_subscription_id');
}
function validateMemberPayload(body,{allowFree=false}={}){
  const firstName=clean(body.firstName,80), lastName=clean(body.lastName,80), email=clean(body.email,254).toLowerCase(), phone=clean(body.phone,40);
  const plan=clean(body.plan,40), billingInterval=clean(body.billingInterval,20);
  const interests=Array.isArray(body.interests) ? body.interests.filter(x=>allowedInterests.has(x)) : [];
  if(!firstName || !lastName || !emailPattern.test(email)) throw new Error('Enter a valid first name, last name and email address.');
  if(body.termsAccepted !== true) throw new Error('You must accept the terms before subscribing.');
  if(allowFree && plan !== 'listener') throw new Error('The free subscription endpoint only accepts the Listener plan.');
  if(!allowFree && !PLAN_CONFIG[plan]) throw new Error('Select a valid paid membership.');
  if(!allowFree && !['monthly','annual'].includes(billingInterval)) throw new Error('Select monthly or annual billing.');
  return {firstName,lastName,email,phone,plan,billingInterval,interests,marketingConsent:body.marketingConsent===true};
}

// Stripe requires the raw request body for webhook signature verification.
app.post('/api/stripe/webhook', express.raw({type:'application/json'}), async (req,res)=>{
  if(!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).send('Stripe webhook is not configured.');
  let event;
  try{ event=stripe.webhooks.constructEvent(req.body,req.headers['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET); }
  catch(err){ return res.status(400).send(`Webhook signature error: ${err.message}`); }
  try{
    if(event.type==='checkout.session.completed'){
      const session=event.data.object;
      const meta=session.metadata || {};
      const subscriber=await upsertSubscriber({firstName:meta.first_name||'',lastName:meta.last_name||'',email:session.customer_details?.email||session.customer_email||meta.email||'',phone:meta.phone||'',marketingConsent:meta.marketing_consent==='true',interests:(meta.interests||'').split(',').filter(Boolean)});
      if(session.subscription){
        const subscription=await stripe.subscriptions.retrieve(session.subscription);
        await upsertSubscription({subscriber_id:subscriber.id,plan_code:meta.plan_code,billing_interval:meta.billing_interval,stripe_customer_id:String(session.customer||''),stripe_subscription_id:String(session.subscription),stripe_checkout_session_id:session.id,status:subscription.status,current_period_end:new Date(subscription.current_period_end*1000).toISOString(),updated_at:new Date().toISOString()});
      }
    }
    if(event.type==='customer.subscription.updated' || event.type==='customer.subscription.deleted'){
      const sub=event.data.object;
      await supabaseRequest('podcast_subscriptions','PATCH',{status:sub.status,current_period_end:new Date(sub.current_period_end*1000).toISOString(),updated_at:new Date().toISOString()},`?stripe_subscription_id=eq.${encodeURIComponent(sub.id)}`);
    }
    res.json({received:true});
  }catch(err){ console.error(err); res.status(500).send('Webhook handling failed.'); }
});

app.use(express.json({limit:'64kb'}));

app.post('/api/subscriptions/free', async (req,res)=>{
  try{
    const data=validateMemberPayload(req.body,{allowFree:true});
    const subscriber=await upsertSubscriber(data);
    await supabaseRequest('podcast_subscriptions','POST',{subscriber_id:subscriber.id,plan_code:'listener',billing_interval:'free',status:'active',updated_at:new Date().toISOString()},'');
    const params=new URLSearchParams({free:'1',plan:'listener',email:data.email});
    res.json({redirect:`/subscribe/success.html?${params}`});
  }catch(err){ res.status(err.message.includes('configured')?503:400).json({error:err.message}); }
});

app.post('/api/checkout/session', async (req,res)=>{
  try{
    if(!stripe) return res.status(503).json({error:'Stripe Checkout is not configured on the server.'});
    const data=validateMemberPayload(req.body);
    const plan=PLAN_CONFIG[data.plan];
    const priceId=plan[data.billingInterval];
    if(!priceId) return res.status(503).json({error:`Stripe price ID is not configured for ${plan.name} (${data.billingInterval}).`});
    const metadata={plan_code:data.plan,billing_interval:data.billingInterval,first_name:data.firstName,last_name:data.lastName,email:data.email,phone:data.phone,marketing_consent:String(data.marketingConsent),interests:data.interests.join(',')};
    const session=await stripe.checkout.sessions.create({
      mode:'subscription',
      line_items:[{price:priceId,quantity:1}],
      customer_email:data.email,
      client_reference_id:data.email,
      metadata,
      subscription_data:{metadata},
      allow_promotion_codes:true,
      billing_address_collection:'auto',
      success_url:`${baseUrl}/subscribe/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:`${baseUrl}/subscribe/cancel.html?plan=${encodeURIComponent(data.plan)}&billing=${encodeURIComponent(data.billingInterval)}`
    });
    res.json({url:session.url});
  }catch(err){ console.error(err); res.status(400).json({error:err.message || 'Unable to create checkout session.'}); }
});

app.get('/api/checkout/session/:id', async (req,res)=>{
  try{
    if(!stripe) return res.status(503).json({error:'Stripe Checkout is not configured on the server.'});
    const id=clean(req.params.id,160);
    if(!id.startsWith('cs_')) return res.status(400).json({error:'Invalid checkout session.'});
    const session=await stripe.checkout.sessions.retrieve(id,{expand:['subscription']});
    res.json({
      status:session.status,
      paymentStatus:session.payment_status,
      email:session.customer_details?.email || session.customer_email || '',
      planCode:session.metadata?.plan_code || '',
      billingInterval:session.metadata?.billing_interval || '',
      subscriptionStatus:typeof session.subscription === 'object' ? session.subscription.status : null
    });
  }catch(err){ res.status(400).json({error:'Unable to verify checkout session.'}); }
});

app.use(express.static(siteRoot,{extensions:['html'],index:'index.html',redirect:true}));
app.listen(PORT,()=>console.log(`The Jammed Up Bar! platform running at ${baseUrl}`));
