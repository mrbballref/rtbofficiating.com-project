REFZONE UNIVERSITY MEMBERSHIP REGISTRATION

Open with the Node server, not by double-clicking platform.html, because Stripe Checkout and server-side registration require HTTP endpoints.

1. Read PAYMENT-GATEWAY-SETUP.md
2. Configure server/.env
3. npm install
4. npm run stripe:catalog
5. npm start
6. Open platform.html#/membership

The payment gateway is intentionally blocked until PAYMENTS_LIVE_APPROVED is explicitly enabled after policy review.
