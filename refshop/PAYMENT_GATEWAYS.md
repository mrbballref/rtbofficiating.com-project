# RefShop Payment Gateway Setup

## Included gateways and workflows

- **Stripe Checkout**: cards and Stripe Dynamic Payment Methods.
- **Apple Pay / Google Pay**: available through Stripe-hosted checkout when enabled and eligible for the merchant account, domain, browser/device, and customer wallet.
- **ACH Direct Debit**: Stripe Checkout flow using `us_bank_account` when the shopper chooses ACH.
- **PayPal Checkout**: PayPal JavaScript SDK in the storefront, with server-side Orders API create and capture calls.
- **Bank transfer**: enterprise workflow integration point; requires approved account, remittance instructions, reconciliation, and ledger services.
- **Purchase Order**: RefShop Business workflow integration point; requires authenticated business account and approval rules.
- **Gift card / store credit**: internal stored-value integration point; requires RefShop ledger/balance services.

## Local gateway server

Node.js 20+ is required. The gateway server uses only Node built-ins; there are no third-party npm dependencies.

```bash
cd server
cp .env.example .env
npm start
```

Open:

`http://localhost:4173`

## Environment variables

### Stripe

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### PayPal

- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_ENVIRONMENT=sandbox` or `production`

### Runtime

- `PUBLIC_BASE_URL`
- `PAYMENTS_ENVIRONMENT=sandbox` or `production`
- `ALLOW_CLIENT_PRICING_IN_SANDBOX=true`
- `ALLOW_CLIENT_PRICING_IN_PRODUCTION=false`

## Production pricing safety

The current product catalog lives in browser localStorage. A browser is not an authoritative source for a charge amount. Therefore the included server blocks client-submitted pricing in production by default.

Before live charging is enabled, connect the payment service to the permanent RefShop server-side Catalog, Pricing, Inventory, Tax, Shipping, Order, and Ledger domains. Production payment creation should calculate the final payable amount from those trusted services.

## Checkout behavior

1. Shopper completes contact and delivery fields.
2. Shopper selects a payment method.
3. RefShop creates a pending checkout snapshot locally.
4. Stripe or PayPal receives a server-side payment/order creation request.
5. Shopper completes payment through the provider-controlled UI.
6. RefShop verifies the provider result before creating its local order record.
7. Card/PayPal captures create a `Payment Captured` order state.
8. ACH can create `Payment Processing` because bank debit confirmation can be delayed.
9. Production fulfillment should advance only from verified payment events/webhooks and canonical Order/Ledger rules.

## Admin gateway view

Open:

`#/admin/integrations`

The page shows Stripe, PayPal, enterprise payments, and stored-value architecture status without exposing secret credentials to the browser.

## Webhook endpoints

- `POST /api/payments/webhooks/stripe`
- `POST /api/payments/webhooks/paypal`

Stripe webhook signatures are HMAC verified using `STRIPE_WEBHOOK_SECRET`.

PayPal webhook signatures are verified against PayPal's webhook verification API using `PAYPAL_WEBHOOK_ID`.
