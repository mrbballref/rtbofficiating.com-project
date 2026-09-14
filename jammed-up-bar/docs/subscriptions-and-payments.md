# Podcast Membership & Payment Gateway

The Subscribe CTA now lands on a real membership selection and subscriber form. The frontend never accepts raw card details. Paid memberships create a server-side Stripe Checkout Session and redirect the member to Stripe-hosted Checkout. This follows Stripe's subscription Checkout pattern.

## Included membership levels

- Listener — Free
- Bar Member — $4.99/month or $49.99/year
- Crew Member — $9.99/month or $99.99/year
- Network All-Access — $19.99/month or $199.99/year

These launch prices are controlled by the Stripe Price IDs configured on the server. If pricing changes, update both the displayed pricing in `subscribe/index.html` and the matching Stripe recurring Prices.

## Run locally

1. Open `server/`.
2. Copy `.env.example` to `.env`.
3. Create the recurring products/prices in Stripe and add their Price IDs.
4. Add development Supabase URL and server-side service-role key.
5. Apply `supabase/schema.sql` and `supabase/rls.sql`.
6. Run `npm install`, then `npm start`.
7. Open `http://localhost:3000/subscribe/index.html#membership-plans`.

## Stripe webhook

Configure the Stripe webhook destination as `/api/stripe/webhook`. The included handler verifies the Stripe signature, processes completed Checkout Sessions and subscription updates/deletions, then writes membership state to the private Supabase tables.

## Production requirements

Use production Stripe/Supabase projects, HTTPS, secret management, authenticated account-to-subscription linking, a Stripe customer portal or equivalent cancellation workflow, email verification, transactional email receipts/welcome messages, and final legal/tax review before public launch.
