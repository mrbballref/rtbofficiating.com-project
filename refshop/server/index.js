import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 1) continue;
    const key = line.slice(0, idx).trim();
    if (process.env[key] !== undefined) continue;
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[key] = value;
  }
}
loadEnvFile(path.join(__dirname, '.env'));

const port = Number(process.env.PORT || 4173);
const environment = process.env.PAYMENTS_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
const baseUrl = String(process.env.PUBLIC_BASE_URL || `http://localhost:${port}`).replace(/\/$/, '');

function configured(value) { return Boolean(String(value || '').trim()); }
function boolEnv(name, fallback = false) {
  const raw = process.env[name];
  if (raw == null) return fallback;
  return ['1','true','yes','on'].includes(String(raw).toLowerCase());
}
function json(res, status, body) {
  const data = Buffer.from(JSON.stringify(body));
  res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Content-Length':data.length, 'Cache-Control':'no-store' });
  res.end(data);
}
async function readBody(req, limit = 1024 * 1024) {
  const chunks=[]; let size=0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Request body too large.'), { status:413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
function currencyCode(input='USD') {
  const code=String(input||'USD').toUpperCase();
  if(!/^[A-Z]{3}$/.test(code)) throw Object.assign(new Error('Invalid currency.'),{status:400});
  return code;
}
function normalizeCart(body) {
  const items=Array.isArray(body?.items)?body.items:[];
  if(!items.length||items.length>100) throw Object.assign(new Error('Checkout requires between 1 and 100 line items.'),{status:400});
  const normalized=items.map((item,index)=>{
    const name=String(item.name||'').trim().slice(0,160);
    const sku=String(item.sku||'').trim().slice(0,80);
    const unitAmount=Number(item.unitAmount), quantity=Number(item.quantity);
    if(!name) throw Object.assign(new Error(`Line ${index+1} is missing a product name.`),{status:400});
    if(!Number.isFinite(unitAmount)||unitAmount<0||unitAmount>1000000) throw Object.assign(new Error(`Line ${index+1} has an invalid amount.`),{status:400});
    if(!Number.isInteger(quantity)||quantity<1||quantity>999) throw Object.assign(new Error(`Line ${index+1} has an invalid quantity.`),{status:400});
    return { id:String(item.id||''), name, sku, unitAmount:Math.round(unitAmount*100)/100, quantity };
  });
  if(environment==='production'&&!boolEnv('ALLOW_CLIENT_PRICING_IN_PRODUCTION',false)) throw Object.assign(new Error('Production payment creation is blocked until RefShop connects the payment service to an authoritative server-side Catalog/Pricing/Order service. Browser-submitted prices are not trusted for live charging.'),{status:503});
  if(environment!=='production'&&!boolEnv('ALLOW_CLIENT_PRICING_IN_SANDBOX',true)) throw Object.assign(new Error('Sandbox client pricing is disabled by server policy.'),{status:503});
  return normalized;
}
function totalFor(items){return items.reduce((sum,item)=>sum+item.unitAmount*item.quantity,0);}
function paymentConfig(){return {environment,stripe:{configured:configured(process.env.STRIPE_SECRET_KEY)},paypal:{configured:configured(process.env.PAYPAL_CLIENT_ID)&&configured(process.env.PAYPAL_CLIENT_SECRET),clientId:String(process.env.PAYPAL_CLIENT_ID||'')},offline:{bankTransfer:true,purchaseOrder:true,storeValue:true}};}

async function stripeRequest(pathname, options={}) {
  const secret=process.env.STRIPE_SECRET_KEY;
  if(!configured(secret)) throw Object.assign(new Error('Stripe is not configured on the payment server.'),{status:503});
  const response=await fetch(`https://api.stripe.com${pathname}`,{...options,headers:{Authorization:`Bearer ${secret}`,...(options.headers||{})}});
  const body=await response.json();
  if(!response.ok) throw Object.assign(new Error(body?.error?.message||`Stripe returned ${response.status}.`),{status:502});
  return body;
}
function paypalBase(){return process.env.PAYPAL_ENVIRONMENT==='production'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com';}
async function paypalToken(){
  const id=process.env.PAYPAL_CLIENT_ID, secret=process.env.PAYPAL_CLIENT_SECRET;
  if(!configured(id)||!configured(secret)) throw Object.assign(new Error('PayPal is not configured on the payment server.'),{status:503});
  const response=await fetch(`${paypalBase()}/v1/oauth2/token`,{method:'POST',headers:{Authorization:`Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
  const body=await response.json();
  if(!response.ok) throw Object.assign(new Error(body.error_description||'PayPal authentication failed.'),{status:502});
  return body.access_token;
}
async function paypalRequest(pathname,options={}){
  const token=await paypalToken();
  const response=await fetch(`${paypalBase()}${pathname}`,{...options,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','PayPal-Request-Id':options.requestId||`refshop-${Date.now()}-${Math.random()}`,...(options.headers||{})}});
  const body=await response.json();
  if(!response.ok) throw Object.assign(new Error(body.message||body.details?.[0]?.description||`PayPal returned ${response.status}.`),{status:502});
  return body;
}
function verifyStripeSignature(rawBody, signatureHeader, secret, toleranceSeconds=300){
  if(!signatureHeader||!secret)return false;
  const parts=String(signatureHeader).split(',').map(part=>part.split('='));
  const timestamp=parts.find(([key])=>key==='t')?.[1];
  const signatures=parts.filter(([key])=>key==='v1').map(([,value])=>value);
  if(!timestamp||!signatures.length)return false;
  if(Math.abs(Math.floor(Date.now()/1000)-Number(timestamp))>toleranceSeconds)return false;
  const expected=crypto.createHmac('sha256',secret).update(`${timestamp}.${rawBody.toString('utf8')}`).digest('hex');
  return signatures.some(sig=>{try{return crypto.timingSafeEqual(Buffer.from(sig,'hex'),Buffer.from(expected,'hex'));}catch{return false;}});
}

function mimeType(file){
  const ext=path.extname(file).toLowerCase();
  return ({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.mp4':'video/mp4','.woff2':'font/woff2'}[ext]||'application/octet-stream');
}
function serveStatic(urlPath,res){
  let decoded;
  try{decoded=decodeURIComponent(urlPath);}catch{return false;}
  if(decoded==='/'||decoded==='')decoded='/index.html';
  const safePath=path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const filePath=path.resolve(webRoot, `.${safePath}`);
  if(!filePath.startsWith(webRoot))return false;
  let target=filePath;
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!fs.existsSync(target)||!fs.statSync(target).isFile())return false;
  const stat=fs.statSync(target);
  res.writeHead(200,{'Content-Type':mimeType(target),'Content-Length':stat.size,'Cache-Control':target.endsWith('index.html')?'no-cache':'public, max-age=3600'});
  fs.createReadStream(target).pipe(res);return true;
}

async function handleApi(req,res,url){
  if(req.method==='GET'&&url.pathname==='/api/payments/config')return json(res,200,paymentConfig());

  if(req.method==='POST'&&url.pathname==='/api/payments/stripe/checkout-session'){
    const body=JSON.parse((await readBody(req)).toString('utf8')||'{}');
    const items=normalizeCart(body), currency=currencyCode(body.currency).toLowerCase(), customer=body.customer||{}, checkoutId=String(body.checkoutId||'').slice(0,120);
    const params=new URLSearchParams();params.append('mode','payment');params.append('success_url',`${baseUrl}/?payment_gateway=stripe&session_id={CHECKOUT_SESSION_ID}#/payment-success`);params.append('cancel_url',`${baseUrl}/#/checkout`);if(customer.email)params.append('customer_email',String(customer.email));params.append('client_reference_id',checkoutId||`refshop-${Date.now()}`);params.append('metadata[refshop_checkout_id]',checkoutId||'');if(body.requestedMethod==='ach')params.append('payment_method_types[]','us_bank_account');
    items.forEach((item,index)=>{params.append(`line_items[${index}][quantity]`,String(item.quantity));params.append(`line_items[${index}][price_data][currency]`,currency);params.append(`line_items[${index}][price_data][unit_amount]`,String(Math.round(item.unitAmount*100)));params.append(`line_items[${index}][price_data][product_data][name]`,item.name);if(item.sku)params.append(`line_items[${index}][price_data][product_data][metadata][sku]`,item.sku);});
    const session=await stripeRequest('/v1/checkout/sessions',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:params.toString()});
    return json(res,200,{id:session.id,url:session.url,environment});
  }

  const stripeSession=url.pathname.match(/^\/api\/payments\/stripe\/session\/([^/]+)$/);
  if(req.method==='GET'&&stripeSession){
    const session=await stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(stripeSession[1])}`,{method:'GET'});
    return json(res,200,{gatewayId:session.id,status:session.payment_status,checkoutStatus:session.status,checkoutId:String(session.metadata?.refshop_checkout_id||session.client_reference_id||''),amount:Number(session.amount_total||0)/100,currency:String(session.currency||'USD').toUpperCase(),environment,customerEmail:session.customer_details?.email||session.customer_email||''});
  }

  if(req.method==='POST'&&url.pathname==='/api/payments/paypal/order'){
    const body=JSON.parse((await readBody(req)).toString('utf8')||'{}');const items=normalizeCart(body),currency=currencyCode(body.currency),checkoutId=String(body.checkoutId||`refshop-${Date.now()}`).slice(0,120),total=totalFor(items).toFixed(2);
    const order=await paypalRequest('/v2/checkout/orders',{method:'POST',requestId:checkoutId,body:JSON.stringify({intent:'CAPTURE',purchase_units:[{reference_id:checkoutId,amount:{currency_code:currency,value:total,breakdown:{item_total:{currency_code:currency,value:total}}},items:items.map(item=>({name:item.name,sku:item.sku||undefined,quantity:String(item.quantity),unit_amount:{currency_code:currency,value:item.unitAmount.toFixed(2)}}))}],application_context:{brand_name:'The RefShop',user_action:'PAY_NOW'}})});
    return json(res,200,{id:order.id,status:order.status,environment});
  }

  const paypalCapture=url.pathname.match(/^\/api\/payments\/paypal\/order\/([^/]+)\/capture$/);
  if(req.method==='POST'&&paypalCapture){
    const capture=await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(paypalCapture[1])}/capture`,{method:'POST',requestId:`capture-${paypalCapture[1]}`,body:'{}'});const unit=capture.purchase_units?.[0],cap=unit?.payments?.captures?.[0];
    return json(res,200,{gatewayId:capture.id,status:capture.status==='COMPLETED'?'paid':String(capture.status||'').toLowerCase(),amount:Number(cap?.amount?.value||unit?.amount?.value||0),currency:String(cap?.amount?.currency_code||unit?.amount?.currency_code||'USD'),environment});
  }

  if(req.method==='POST'&&url.pathname==='/api/payments/webhooks/stripe'){
    const raw=await readBody(req),secret=process.env.STRIPE_WEBHOOK_SECRET;
    if(!configured(secret))return json(res,503,{error:'STRIPE_WEBHOOK_SECRET is not configured.'});
    if(!verifyStripeSignature(raw,req.headers['stripe-signature'],secret))return json(res,400,{error:'Invalid Stripe webhook signature.'});
    let event;try{event=JSON.parse(raw.toString('utf8'));}catch{return json(res,400,{error:'Invalid Stripe webhook JSON.'});}
    console.log('[RefShop Stripe webhook]',event.type,event.id);return json(res,200,{received:true,id:event.id,type:event.type});
  }

  if(req.method==='POST'&&url.pathname==='/api/payments/webhooks/paypal'){
    const body=JSON.parse((await readBody(req)).toString('utf8')||'{}'),webhookId=process.env.PAYPAL_WEBHOOK_ID;
    if(!configured(webhookId))return json(res,503,{error:'PAYPAL_WEBHOOK_ID is not configured.'});
    const token=await paypalToken();const response=await fetch(`${paypalBase()}/v1/notifications/verify-webhook-signature`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({auth_algo:req.headers['paypal-auth-algo'],cert_url:req.headers['paypal-cert-url'],transmission_id:req.headers['paypal-transmission-id'],transmission_sig:req.headers['paypal-transmission-sig'],transmission_time:req.headers['paypal-transmission-time'],webhook_id:webhookId,webhook_event:body})});const verify=await response.json();if(!response.ok||verify.verification_status!=='SUCCESS')return json(res,400,{error:'Invalid PayPal webhook signature.'});console.log('[RefShop PayPal webhook]',body.event_type,body.id);return json(res,200,{received:true,id:body.id,type:body.event_type});
  }

  return json(res,404,{error:'Payment API route not found.'});
}

const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,baseUrl);
  try{
    if(url.pathname.startsWith('/api/payments/'))return await handleApi(req,res,url);
    if(serveStatic(url.pathname,res))return;
    if(req.method==='GET')return serveStatic('/index.html',res);
    return json(res,404,{error:'Not found.'});
  }catch(error){console.error('[RefShop payments]',error);return json(res,Number(error.status||500),{error:error.message||'Payment service error.'});}
});

server.listen(port,()=>console.log(`RefShop storefront + payment orchestration server running at ${baseUrl}`));
