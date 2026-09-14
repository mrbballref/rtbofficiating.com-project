# RefZone University Membership Registration and Stripe Gateway

## Included

- Five membership plans with monthly and annual billing.
- Four-step account, learning-plan, billing-consent, and secure-payment workflow.
- Stripe Embedded Checkout for paid recurring memberships.
- Free Preview activation without collecting a card.
- Server-side membership and price validation.
- Password hashing with bcrypt.
- Stripe webhook signature verification.
- Registration status updates for completed checkout, subscription changes, cancellation, and failed payment.
- Empty registration store with no fake students or payment records.

## Launch gate

Payment collection is deliberately blocked until `PAYMENTS_LIVE_APPROVED=true`. Do not enable it until the Terms of Membership, Privacy Notice, Refund and Cancellation Policy, customer-support contacts, and tax settings have received authorized administrative and legal approval.

## Local setup

1. Install Node.js 20 or newer.
2. In the `refzone-university` directory, run `npm install`.
3. Copy `server/.env.example` to `server/.env`.
4. Add Stripe sandbox publishable and secret keys.
5. Run `npm run stripe:catalog` to create products and recurring prices using controlled lookup keys.
6. Set `PAYMENTS_LIVE_APPROVED=true` only for an approved sandbox test.
7. Start the site with `npm start`.
8. Open `http://localhost:4242/platform.html#/membership`.

## Webhook testing

Use the Stripe CLI to forward events to:

`http://localhost:4242/api/webhooks/stripe`

Place the returned signing secret in `STRIPE_WEBHOOK_SECRET` and restart the server.

## Production requirements

- HTTPS is mandatory.
- Replace the included JSON registration store with the production authenticated database before launch.
- Add verified email, password reset, MFA for administrators, session management, and role-based access control.
- Configure Stripe Customer Portal for self-service cancellation, invoices, payment-method changes, and plan changes after authentication is implemented.
- Configure automatic tax only after tax obligations are reviewed.
- Register the production webhook endpoint and monitor delivery failures.
- Never expose the Stripe secret key in HTML, JavaScript, source control, screenshots, or support messages.
- Confirm annual and monthly prices in both Stripe sandbox and live mode.
- Test successful payments, authentication-required payments, declines, failed renewals, cancellation, refunds, disputes, and webhook retries.

## Membership pricing

- RefZone Preview: $0
- RefZone Foundations: $29 monthly or $290 annually
- RefZone Advancement: $59 monthly or $590 annually
- RefZone Elite: $99 monthly or $990 annually
- RefZone All-Access: $149 monthly or $1,490 annually

No card fields are simulated. When Stripe is not configured, the interface displays a configuration notice rather than pretending that payment was processed.
