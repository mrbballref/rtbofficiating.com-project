# The Live Stream Payment Gateway

This folder contains the server-side Stripe Checkout integration for recurring Live Stream memberships.

## Setup

1. Install Node.js 20+.
2. In this `server` folder run `npm install`.
3. Copy `.env.example` to `.env`.
4. Add your Stripe secret key and webhook signing secret.
5. In Stripe, create recurring monthly and annual Prices for:
   - Live Stream Plus
   - Live Stream Premium
   - Live Stream All Access
6. Put those Stripe Price IDs into the matching environment variables.
7. Set `APP_URL` to your real HTTPS origin in production.
8. Run `npm start`.
9. Point your Stripe webhook endpoint to `/api/payments/webhook`.

## Security architecture

- The browser sends only the plan key, billing cycle, and customer email.
- The server maps the plan key to trusted Stripe Price IDs stored in environment variables.
- Secret keys never appear in the browser.
- Raw card numbers are not collected by the Live Stream frontend.
- Membership entitlement should be granted in the production database from verified Stripe webhook events, not from the browser success page.
