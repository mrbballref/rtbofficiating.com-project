# The RefShop — Enterprise Commerce Operating System Frontend

This package implements the first coded RefShop commerce workspace using the user-supplied master specification, exact RefShop logo, approved RTBO navigation behavior/style, and approved iPad 13 video player.

## What is included

- Original RefShop premium black / burnt-orange / metallic-silver commerce design.
- Desktop and mobile navigation mirroring the supplied approved RTBO navigation's centered-logo, chrome border, dropdown, active-state, CTA, keyboard, outside-click and Escape behavior.
- Exact supplied `assets/refshop-logo.png` in the RefShop navigation, hero and footer. It is not regenerated or redrawn.
- Exact approved iPad player package preserved at `components/ipad-player/` and integrated through the Live Shopping Studio.
- Responsive SPA routes for customer commerce, marketplace, account, Seller Central, RefShop Business, Supplier Portal, Developer Portal and Admin Control Center.
- Real browser-local product CRUD, inventory counts, cart, wishlist, seller applications, supplier records, business organizations, support cases, feature flags and audit history.
- Empty states instead of fabricated products, orders, reviews, revenue or analytics.
- Payment orchestration layer with Stripe Checkout, eligible Apple Pay / Google Pay methods through Stripe, ACH checkout, PayPal Checkout, signed webhook verification endpoints, and governed B2B/stored-value payment workflow integration points.
- 10px black-gradient transitions between major RTBO/RefShop sections.

## Run locally

For the storefront **with payment gateway APIs**, use the included Node server (Node 20+; no external npm packages are required):

```bash
cd server
cp .env.example .env
npm start
```

Open `http://localhost:4173`. If you only need to review the frontend without payment APIs, any static web server can still serve the project root.

## Primary routes

- `#/home`
- `#/shop`
- `#/cart`
- `#/checkout`
- `#/account`
- `#/orders`
- `#/wishlist`
- `#/live-shopping`
- `#/sell`
- `#/seller`
- `#/business`
- `#/supplier`
- `#/developer`
- `#/admin`
- `#/admin/products`
- `#/admin/audit-logs`
- `#/admin/feature-flags`
- `#/admin/integrations`

The seller/business/supplier/admin sidebars expose the broader page inventories specified in the master requirements.

## Important production boundary

This package now includes real payment gateway integration code, but merchant accounts and credentials are intentionally not embedded. AWS infrastructure, identity/KYC, tax, carriers, ERP, email/SMS, banking, and other external production services still require their own credentials, backend services, environment configuration, and deployment infrastructure. The payment server also blocks untrusted browser pricing in production until an authoritative server-side Catalog/Pricing/Order service is connected.

## Supplied source references

- `reference/approved-navigation/` contains the approved navigation source used as the behavior/style reference.
- `components/ipad-player/` contains the approved iPad player source exactly as supplied.
- `assets/refshop-logo.png` is the supplied official RefShop logo.

## Navigation balance update
- Desktop navigation is now split into five primary items on each side of the exact centered RefShop logo.
- Left: Home, Shop, New Releases, Best Sellers, Deals.
- Right: Marketplace, Business, Live Shopping, Account, Cart.
- Both sides use equal-width five-column tracks around a dedicated centered logo track, preventing visual drift or logo overlap.


## Payment gateways (v1.1)

RefShop now includes a server-side payment orchestration package in `server/` and storefront checkout adapters for:

- Stripe Checkout for cards and dynamically eligible Stripe payment methods.
- Apple Pay and Google Pay through Stripe-hosted checkout when the Stripe merchant account, domain, browser/device, and customer wallet are eligible.
- ACH / bank-payment architecture through the Stripe gateway configuration.
- PayPal Checkout using the PayPal JavaScript SDK plus server-side Orders API create/capture calls.
- Bank-transfer workflow architecture for approved accounts.
- RefShop Business Purchase Order workflow architecture.
- Gift-card / store-credit integration point for the future internal stored-value ledger.

### Start the payment server

```bash
cd server
cp .env.example .env
npm start
```

Add sandbox/test merchant credentials to `.env` before testing. Secret keys are never stored in frontend JavaScript or localStorage.

The included server defaults to safe sandbox-oriented behavior. Because this current frontend stores the product catalog in browser localStorage, server-side payment creation blocks untrusted client pricing in production unless a trusted catalog/order service is connected. This is deliberate: production charges must be created from authoritative server-side prices, not browser-submitted totals.

### Production requirements still needed

- Real merchant accounts and credentials.
- HTTPS production domain.
- Stripe/Apple Pay domain and wallet eligibility configuration where applicable.
- PayPal application and webhook setup.
- Trusted server-side Catalog / Pricing / Order service.
- Tax, shipping, inventory reservation and ledger services.
- Webhook processing connected to the canonical Order and Financial Ledger domains.
