import "dotenv/config";
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import path from "node:path";
import { fileURLToPath } from "node:url";

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const stripe = new Stripe(required("STRIPE_SECRET_KEY"));
const app = express();
const port = Number(process.env.PORT || 4242);
const appUrl = process.env.APP_URL || `http://localhost:${port}`;

// Membership persistence. If Supabase isn't configured, webhook handling
// still succeeds (so Stripe doesn't retry forever) but only logs — matching
// the previous stubbed-out behavior until SUPABASE_* env vars are set.
async function supabaseRequest(table, method, body, query = "") {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn(`Supabase not configured — skipping ${method} ${table}`);
    return null;
  }
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase error (${response.status}): ${text}`);
  return text ? JSON.parse(text) : [];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, "..");

// Stripe price IDs are never accepted directly from the browser.
const PRICE_MAP = Object.freeze({
  plus: Object.freeze({
    monthly: process.env.STRIPE_PRICE_PLUS_MONTHLY,
    annual: process.env.STRIPE_PRICE_PLUS_ANNUAL
  }),
  premium: Object.freeze({
    monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
    annual: process.env.STRIPE_PRICE_PREMIUM_ANNUAL
  }),
  all_access: Object.freeze({
    monthly: process.env.STRIPE_PRICE_ALL_ACCESS_MONTHLY,
    annual: process.env.STRIPE_PRICE_ALL_ACCESS_ANNUAL
  })
});

// The main RTBO site (rtbo-site) serves a copy of these pages from its own
// origin so nav/auth stay unified; this API is only reachable cross-origin.
const ALLOWED_ORIGINS = [process.env.MAIN_SITE_URL || "https://rtbo-site.onrender.com", "http://localhost:8080", "http://127.0.0.1:8080"];
app.use("/api", cors({ origin: ALLOWED_ORIGINS }));

// Webhook must use raw body before JSON middleware.
app.post("/api/payments/webhook", express.raw({type:"application/json"}), async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(503).send("Webhook secret is not configured.");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const meta = session.metadata || {};
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await supabaseRequest(
            "live_stream_memberships",
            "POST",
            {
              email: (session.customer_details?.email || session.customer_email || "").toLowerCase(),
              plan_code: meta.membership_plan || "plus",
              billing_cycle: meta.billing_cycle || "monthly",
              stripe_customer_id: String(session.customer || ""),
              stripe_subscription_id: String(session.subscription),
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            },
            "?on_conflict=stripe_subscription_id"
          );
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await supabaseRequest(
          "live_stream_memberships",
          "PATCH",
          {
            status: sub.status,
            current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          `?stripe_subscription_id=eq.${encodeURIComponent(sub.id)}`
        );
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed":
        console.log(event.type, event.data.object.id);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Webhook persistence failed:", error);
    // Still acknowledge receipt — Stripe retries on non-2xx, and a DB hiccup
    // shouldn't cause duplicate/looping webhook delivery.
  }

  res.json({received:true});
});

app.use(express.json({limit:"100kb"}));

app.post("/api/payments/create-checkout-session", async (req, res) => {
  try {
    const {plan, cycle, email} = req.body || {};
    if (!["plus","premium","all_access"].includes(plan)) {
      return res.status(400).json({error:"Invalid membership plan."});
    }
    if (!["monthly","annual"].includes(cycle)) {
      return res.status(400).json({error:"Invalid billing cycle."});
    }
    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({error:"A valid email address is required."});
    }

    const price = PRICE_MAP[plan]?.[cycle];
    if (!price) {
      return res.status(503).json({error:`Stripe price is not configured for ${plan} ${cycle}.`});
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email.trim(),
      line_items: [{price, quantity: 1}],
      success_url: `${appUrl}/live-stream/checkout/success/index.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/live-stream/checkout/cancel/index.html`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        platform: "the-live-stream",
        membership_plan: plan,
        billing_cycle: cycle
      },
      subscription_data: {
        metadata: {
          platform: "the-live-stream",
          membership_plan: plan,
          billing_cycle: cycle
        }
      }
    });

    return res.json({url: session.url});
  } catch (error) {
    console.error(error);
    return res.status(500).json({error:"Unable to create the secure checkout session."});
  }
});

app.post("/api/payments/customer-portal", async (req, res) => {
  try {
    const {customerId} = req.body || {};
    if (!customerId || typeof customerId !== "string") {
      return res.status(400).json({error:"A verified Stripe customer ID is required."});
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/live-stream/account/index.html`
    });

    return res.json({url: session.url});
  } catch (error) {
    console.error(error);
    return res.status(500).json({error:"Unable to open the billing portal."});
  }
});

// Static website
app.use(express.static(webRoot, {extensions:["html"]}));

app.listen(port, () => {
  console.log(`The Live Stream payment server is running at ${appUrl}`);
});
