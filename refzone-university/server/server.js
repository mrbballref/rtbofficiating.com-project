require('dotenv').config({path:require('node:path').join(__dirname,'.env')});
const path=require('node:path');const express=require('express');const helmet=require('helmet');const rateLimit=require('express-rate-limit');const bcrypt=require('bcryptjs');const Stripe=require('stripe');const memberships=require('./memberships');const registrations=require('./lib/registrations');
const app=express();const root=path.join(__dirname,'..');const port=Number(process.env.PORT||4242);const appUrl=(process.env.APP_URL||`http://localhost:${port}`).replace(/\/$/,'');
const stripeConfigured=Boolean(process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_PUBLISHABLE_KEY&&!process.env.STRIPE_SECRET_KEY.includes('replace_me'));
const stripe=stripeConfigured?new Stripe(process.env.STRIPE_SECRET_KEY):null;
const trackIds=new Set(['nfhs','njcaa-men','njcaa-women','naia-men','naia-women','ncaa-d3-men','ncaa-d3-women','ncaa-d2-men','ncaa-d2-women','ncaa-d1-men','ncaa-d1-women','usa-men','usa-women','euro-men','euro-women','fiba-men','fiba-women','g-league','wnba','nba']);
const pathwayNames={foundations:'Bachelor’s-Level Professional Foundations',advancement:'Master’s-Level Advanced Officiating',elite:'PhD-Level Research, Leadership, and Elite Officiating'};
const trackNames={nfhs:'NFHS','njcaa-men':'NJCAA Men','njcaa-women':'NJCAA Women','naia-men':'NAIA Men','naia-women':'NAIA Women','ncaa-d3-men':'NCAA Division III Men','ncaa-d3-women':'NCAA Division III Women','ncaa-d2-men':'NCAA Division II Men','ncaa-d2-women':'NCAA Division II Women','ncaa-d1-men':'NCAA Division I Men','ncaa-d1-women':'NCAA Division I Women','usa-men':'USA Basketball Men','usa-women':'USA Basketball Women','euro-men':'Euro Basketball Men','euro-women':'Euro Basketball Women','fiba-men':'FIBA Basketball Men','fiba-women':'FIBA Basketball Women','g-league':'NBA G League',wnba:'WNBA',nba:'NBA'};

app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'",'https://js.stripe.com'],frameSrc:["'self'",'https://js.stripe.com','https://hooks.stripe.com'],connectSrc:["'self'",'https://api.stripe.com'],imgSrc:["'self'",'data:'],styleSrc:["'self'","'unsafe-inline'"],fontSrc:["'self'",'data:']}}}));
const apiLimiter=rateLimit({windowMs:15*60*1000,limit:120,standardHeaders:'draft-8',legacyHeaders:false});
app.use('/api',apiLimiter);

// Stripe requires the exact raw request body for signature verification.
app.post('/api/webhooks/stripe',express.raw({type:'application/json'}),(req,res)=>{
  if(!stripe||!process.env.STRIPE_WEBHOOK_SECRET)return res.status(503).send('Webhook not configured');
  let event;try{event=stripe.webhooks.constructEvent(req.body,req.headers['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET)}catch(error){return res.status(400).send(`Webhook signature error: ${error.message}`)}
  try{
    const object=event.data.object;
    if(event.type==='checkout.session.completed'){
      const id=object.metadata?.registrationId; if(id)registrations.update(id,{status:object.payment_status==='paid'?'active':'processing',stripeCustomerId:object.customer||null,stripeSubscriptionId:object.subscription||null,stripeSessionId:object.id,paymentStatus:object.payment_status});
    }
    if(event.type==='customer.subscription.updated'||event.type==='customer.subscription.deleted'){
      const id=object.metadata?.registrationId;if(id)registrations.update(id,{status:object.status,stripeSubscriptionId:object.id});
    }
    if(event.type==='invoice.payment_failed'){
      const id=object.parent?.subscription_details?.metadata?.registrationId||object.subscription_details?.metadata?.registrationId;if(id)registrations.update(id,{status:'past_due',lastPaymentFailure:new Date().toISOString()});
    }
    res.json({received:true});
  }catch(error){console.error(error);res.status(500).json({error:'Webhook processing failed'})}
});

app.use(express.json({limit:'32kb'}));
function clean(value,max=600){return String(value??'').trim().slice(0,max)}
function validate(body,{paid}){
  const required=['firstName','lastName','email','password','country','track','pathway','experience','currentLevel','goal','plan','billing'];for(const key of required)if(!clean(body[key]))throw new Error(`Missing required field: ${key}`);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))throw new Error('Enter a valid email address.');if(String(body.password).length<12)throw new Error('Password must contain at least 12 characters.');
  if(!memberships[body.plan])throw new Error('Invalid membership.');if(!trackIds.has(body.track))throw new Error('Invalid competition track.');if(!memberships[body.plan].pathways.includes(body.pathway))throw new Error('The selected pathway is not included with this membership.');if(!['monthly','annual'].includes(body.billing))throw new Error('Invalid billing frequency.');
  if(!body.termsAccepted||!body.privacyAccepted||!body.refundAccepted)throw new Error('Required policy acknowledgements are missing.');if(paid&&!body.recurringAccepted)throw new Error('Recurring billing authorization is required.');
}
async function recordRegistration(body,status='pending'){
  const passwordHash=await bcrypt.hash(String(body.password),12);return registrations.create({status,firstName:clean(body.firstName,80),lastName:clean(body.lastName,80),email:clean(body.email,180).toLowerCase(),passwordHash,phone:clean(body.phone,30),country:clean(body.country,8),track:body.track,pathway:body.pathway,experience:clean(body.experience,20),currentLevel:clean(body.currentLevel,80),goal:clean(body.goal,600),advisorReview:Boolean(body.advisorReview),plan:body.plan,billing:body.billing,termsAcceptedAt:new Date().toISOString(),privacyAcceptedAt:new Date().toISOString(),refundAcceptedAt:new Date().toISOString(),recurringAcceptedAt:body.recurringAccepted?new Date().toISOString():null,marketing:Boolean(body.marketing)});
}
app.get('/api/membership-config',(req,res)=>res.json({stripeConfigured,paymentsApproved:process.env.PAYMENTS_LIVE_APPROVED==='true',gatewayConfigured:stripeConfigured&&process.env.PAYMENTS_LIVE_APPROVED==='true',publishableKey:process.env.STRIPE_PUBLISHABLE_KEY||'',currency:'usd',memberships:Object.fromEntries(Object.entries(memberships).map(([id,plan])=>[id,{name:plan.name,monthly:plan.monthly/100,annual:plan.annual/100,pathways:plan.pathways}]))}));
app.post('/api/register-preview',async(req,res)=>{try{validate(req.body,{paid:false});if(req.body.plan!=='preview')throw new Error('This endpoint only activates RefZone Preview.');const record=await recordRegistration(req.body,'active');res.status(201).json({registrationId:record.id,status:'active'})}catch(error){res.status(400).json({error:error.message})}});
app.post('/api/create-checkout-session',async(req,res)=>{try{
  if(!stripeConfigured)throw new Error('Stripe is not configured.');if(process.env.PAYMENTS_LIVE_APPROVED!=='true')throw new Error('Payment collection is blocked until the legal and administrative launch gate is approved.');validate(req.body,{paid:true});if(req.body.plan==='preview')throw new Error('Preview does not require payment.');
  const plan=memberships[req.body.plan],lookupKey=plan.lookupKeys[req.body.billing];const prices=await stripe.prices.list({lookup_keys:[lookupKey],active:true,limit:1});if(!prices.data[0])throw new Error(`Stripe price not found for lookup key ${lookupKey}. Run npm run stripe:catalog.`);
  const record=await recordRegistration(req.body,'pending_payment');
  const session=await stripe.checkout.sessions.create({ui_mode:'embedded',mode:'subscription',customer_email:record.email,line_items:[{price:prices.data[0].id,quantity:1}],return_url:`${appUrl}/membership-return.html?session_id={CHECKOUT_SESSION_ID}`,allow_promotion_codes:true,billing_address_collection:'auto',automatic_tax:{enabled:process.env.STRIPE_AUTOMATIC_TAX==='true'},metadata:{registrationId:record.id,plan:record.plan,billing:record.billing,track:record.track,pathway:record.pathway},subscription_data:{metadata:{registrationId:record.id,plan:record.plan,track:record.track,pathway:record.pathway}},custom_text:{submit:{message:'Membership access is separate from academic admission, certification, assignments, employment, and advancement.'}}},{idempotencyKey:`membership-${record.id}`});
  registrations.update(record.id,{stripeSessionId:session.id});res.json({clientSecret:session.client_secret});
 }catch(error){console.error(error);res.status(400).json({error:error.message})}});
app.get('/api/session-status',async(req,res)=>{try{if(!stripe)throw new Error('Stripe is not configured.');const id=clean(req.query.session_id,255);if(!id.startsWith('cs_'))throw new Error('Invalid Checkout Session ID.');const session=await stripe.checkout.sessions.retrieve(id);const registrationId=session.metadata?.registrationId;const record=registrationId?registrations.find(registrationId):null;res.json({status:session.status,paymentStatus:session.payment_status,email:session.customer_details?.email||record?.email||'',plan:session.metadata?.plan||record?.plan,planName:memberships[session.metadata?.plan||record?.plan]?.name||'RefZone Membership',track:session.metadata?.track||record?.track,trackName:trackNames[session.metadata?.track||record?.track]||'Selected track',pathway:session.metadata?.pathway||record?.pathway,pathwayName:pathwayNames[session.metadata?.pathway||record?.pathway]||'Selected pathway',registrationId,customerId:session.customer||null,subscriptionId:session.subscription||null})}catch(error){res.status(400).json({error:error.message})}});
app.use(express.static(root,{extensions:['html'],maxAge:process.env.NODE_ENV==='production'?'1h':0}));
app.use((req,res)=>res.sendFile(path.join(root,'platform.html')));
app.listen(port,()=>console.log(`RefZone University running at ${appUrl}`));
