# RTBO ULTIMATE PROJECT VALIDATION MATRIX — CURRENT

**Status:** ACTIVE — MANDATORY  
**Governance:** `RTBO_ULTIMATE_VALIDATED_CODE_RULE.md`  
**Teaching freeze:** ACTIVE

## 1. Purpose

This matrix controls the ultimate deep-dive validation of every required HTML/CSS/JS and full-stack implementation in the RTBO ecosystem before any implementation code is taught as canonical.

A visually correct page is not a pass. A platform or enterprise edition is complete only after all applicable requirements, architecture, source, runtime, accessibility, responsive, security/privacy, SEO/metadata/PWA, performance, integration, regression and test gates pass.

## 2. Mandatory editions

Every platform is evaluated in these contexts:

1. **Standalone HTML/CSS/JS** — independently deployable public/static implementation.
2. **Integrated HTML/CSS/JS** — participation in the complete integrated browser enterprise.
3. **Full-stack** — authoritative server/database/API implementation where required.
4. **Integrated full-stack enterprise** — complete cross-platform authoritative ecosystem.

## 3. Master platform state

| # | Platform | Standalone HTML/CSS/JS | Integrated HTML/CSS/JS | Full-stack | Current state |
|---|---|---|---|---|---|
| 01 | RTBO Core Website | CONTRACT_REVIEW | NOT_STARTED | NOT_STARTED | Current restart contract partially reconstructed; existing typed source must be revalidated. |
| 02 | Got U Nex Ref | CONTRACT_REVIEW | NOT_STARTED | NOT_STARTED | Requirements/source reconciliation required. |
| 03 | RefZone University | CONTRACT_REVIEW | NOT_STARTED | NOT_STARTED | Large education/membership/media contract requires full audit. |
| 04 | The Live Stream | CONTRACT_REVIEW | NOT_STARTED | NOT_STARTED | Broadcast/media/streaming contract requires full audit. |
| 05 | The Jammed Up Bar! | CONTRACT_REVIEW | NOT_STARTED | NOT_STARTED | Podcast/subscription contract requires full audit. |
| 06 | The Locker Room | CONTRACT_REVIEW | NOT_STARTED | NOT_STARTED | Dedicated requirements/source audit required. |
| 07 | The Vault | CONTRACT_REVIEW | NOT_STARTED | NOT_STARTED | Filmroom/live/control/media workflows require full audit. |
| 08 | The RefShop | CONTRACT_REVIEW | NOT_STARTED | NOT_STARTED | Enterprise Commerce OS requires extensive commerce/security validation. |
| 09 | The Cutting Room | CONTRACT_REVIEW | NOT_STARTED | NOT_STARTED | Dedicated multimedia-editing requirements/source audit required. |
| 10 | The Lab Hub | CONTRACT_REVIEW | NOT_STARTED | NOT_STARTED | Cross-platform Lab routing/navigation integration required. |
| 11 | Master CMS + Super Admin | CONTRACT_REVIEW | NOT_STARTED | NOT_STARTED | Static admin UI boundary + authoritative full-stack admin/security required. |

## 4. Permanent ecosystem constraints

Unless explicitly reversed by the user, every edition must exclude:

- The Save
- Arkansas Baptist College Classic
- Arkansas Sports Hall of Fame

Canonical production domain family is based on `rtbofficiating.com`. Never introduce `raisingthebarofficiating.com`.

## 5. Universal validation gates

| Validation gate | Standalone HTML/CSS/JS | Integrated HTML/CSS/JS | Full-stack |
|---|---:|---:|---:|
| Requirements/source-of-truth reconciliation | REQUIRED | REQUIRED | REQUIRED |
| Architecture validation | REQUIRED | REQUIRED | REQUIRED |
| Route/information architecture | REQUIRED | REQUIRED | REQUIRED |
| Design-system validation | REQUIRED | REQUIRED | REQUIRED frontend |
| Filesystem/module ownership | REQUIRED | REQUIRED | REQUIRED |
| Complete downstream dependency design before teaching | REQUIRED | REQUIRED | REQUIRED |
| HTML semantics/document metadata | REQUIRED | REQUIRED | REQUIRED frontend |
| Favicon/icons/canonical/social metadata | PUBLIC PAGES | PUBLIC PAGES | PUBLIC PAGES |
| CSS/cascade/responsive/reflow | REQUIRED | REQUIRED | REQUIRED frontend |
| JS/progressive enhancement | REQUIRED | REQUIRED | REQUIRED frontend |
| WCAG 2.2 AA automated + manual | REQUIRED | REQUIRED | REQUIRED |
| Keyboard/pointer/touch/focus | REQUIRED | REQUIRED | REQUIRED |
| Loading/empty/error/success states | AS APPLICABLE | REQUIRED | REQUIRED |
| SEO/structured data/robots/sitemap | PUBLIC PAGES | PUBLIC PAGES | PUBLIC PAGES |
| Manifest/PWA/offline contract | AS APPROVED | AS APPROVED | AS APPROVED |
| Performance/Core Web Vitals | REQUIRED | REQUIRED | REQUIRED |
| Route/link/resource regression | REQUIRED | REQUIRED | REQUIRED |
| Cross-platform integration | EXTERNAL CONTRACTS | REQUIRED | REQUIRED |
| Authentication/session | REPRESENTATIONAL ONLY | REPRESENTATIONAL ONLY | REQUIRED WHERE APPLICABLE |
| Authorization | NOT AUTHORITATIVE | NOT AUTHORITATIVE | REQUIRED WHERE APPLICABLE |
| Database/migrations/transactions | N/A | N/A | REQUIRED WHERE APPLICABLE |
| APIs/status/errors/rate limits | N/A unless real public API | N/A unless real public API | REQUIRED WHERE APPLICABLE |
| Secure uploads/downloads/media authorization | NOT AUTHORITATIVE | NOT AUTHORITATIVE | REQUIRED WHERE APPLICABLE |
| Payments/webhooks/ledger/reconciliation | NOT AUTHORITATIVE | NOT AUTHORITATIVE | REQUIRED WHERE APPLICABLE |
| Security headers/CORS/CSRF/CSP | HOSTING REVIEW | HOSTING REVIEW | REQUIRED WHERE APPLICABLE |
| Logs/metrics/alerts/backups/rollback | N/A | N/A | REQUIRED WHERE APPLICABLE |
| Dependency/vulnerability review | NATIVE WEB/BUILD DEPS | NATIVE WEB/BUILD DEPS | REQUIRED |
| Unit/integration/e2e testing | AS APPLICABLE | REQUIRED | REQUIRED |
| Manual browser/runtime regression | REQUIRED | REQUIRED | REQUIRED |
| Registry hash/source commit/evidence | REQUIRED | REQUIRED | REQUIRED |
| Dependency lock | REQUIRED | REQUIRED | REQUIRED |

# 6. Platform 01 — RTBO Core Website

Validate the current restarted Core implementation from document root forward.

Mandatory scope includes:

- Foundation + Entry Point;
- complete production document `<head>` strategy, including title, description, canonical, favicon/icon ownership, approved social metadata, script/style loading, and manifest/PWA dependency;
- Global Shell + Container System;
- Desktop Navigation;
- Mobile Navigation;
- Account Interface Shell;
- Homepage Hero;
- Quick Ecosystem Links / Four-Item Strip;
- About RTBO homepage section;
- Built for the Game / Clients We Serve / Featured Partners;
- Education / Training / Assigning Pathways;
- Client Spotlight + approved iPad player;
- Services Preview;
- Final CTA;
- Footer;
- Consent / Privacy interface;
- complete Core route registry;
- About page family;
- Schools page family;
- Events page family;
- Services page;
- Contact page;
- Partners page;
- Legal page family;
- Account interface page family;
- SEO / Metadata / Manifest audit;
- PWA/offline decision and implementation only if approved;
- full Core regression;
- platform lock.

Navigation audit must validate the complete desktop + mobile + account interaction contract before any of it is taught: exact routes, centered-logo geometry, approved 1320px mobile handoff, dropdown disclosure states, keyboard behavior, focus/Escape behavior, current-page state, pointer/touch behavior, approved assets and complete regression.

Current frozen primary navigation contract:

- Home
- About → Guests, Trainers, Reviews, Founder
- Schools → UAPB Men, UAPB Women, UCA Women, UALR Women
- RefZone University
- centered RTBO logo
- Events → Hop Step Sporting Events, Big Miller Event, She Got Game League LR, UAPB Celebrity Game
- The Lab → The Live Stream, The Jammed Up Bar!, The Locker Room, The Vault, The Cutting Room
- Services
- Shop

# 7. Platform 02 — Got U Nex Ref

Validate:

- exact approved Got U Nex Ref logo/branding;
- Fortune-500/cinematic interface requirements;
- standalone public landing/interface;
- RTBO Services integration and CTA contracts;
- account/sign-in UI boundary in static edition;
- assigning dashboard/workflows;
- schedules;
- assignment acceptance/decline;
- turn-back workflow and reasons;
- training-school integration where applicable;
- messages/notifications;
- QR attendance/payroll signaling;
- role/permission model;
- persistent data model;
- audit history;
- authoritative authentication/authorization;
- assignment concurrency/conflict prevention;
- accessible/responsive/loading/error states;
- integrated enterprise contracts.

# 8. Platform 03 — RefZone University

Validate:

- 20 competition levels;
- Bachelor's, Master's and PhD tiers;
- complete pathway/course ownership and all required 60 pathways;
- Programs & Pathways;
- membership/payment gating;
- account creation and routing;
- Learning Lab;
- approved iPad player;
- left sidebar;
- minimizable right sidebar that remains visible with icons;
- mobile navigation/player behavior;
- survey/recommendation flow;
- syllabus/overview access rules;
- course content/transcripts/video scripts/diagrams;
- quizzes, progress and completion state;
- entitlements;
- accessible captions/transcripts/media controls;
- secure membership/course/media access in full-stack;
- payment authority and webhook handling;
- integrated enterprise routing.

# 9. Platform 04 — The Live Stream

Validate:

- approved navigation logo and centered navigation geometry;
- approved hero layout/typography/gradient/copy/CTAs;
- Featured Live Event section;
- approved iPad player;
- schedule/watch routes;
- live/not-live/loading/error/empty states;
- responsive/mobile navigation;
- accessible streaming controls/captions/transcripts where applicable;
- streaming authorization and media delivery in full-stack;
- range/network failure/retry behavior;
- performance under media load;
- integrated Lab contracts.

# 10. Platform 05 — The Jammed Up Bar!

Validate:

- approved home and navigation assets;
- podcast player/content presentation;
- subscription form;
- membership/payment UI boundary in static edition;
- authoritative subscription/billing/entitlement flow in full-stack;
- accessible audio controls/transcripts;
- loading/empty/error states;
- responsive navigation;
- integrated Lab contracts.

# 11. Platform 06 — The Locker Room

Perform a dedicated current requirements/source audit first. Then validate all established public UI, routing, content/media behavior, account/security boundaries, accessibility, responsive behavior, integration contracts, and authoritative full-stack features discovered by that audit.

# 12. Platform 07 — The Vault

Validate:

- Vault Home;
- Vault Film Room;
- Vault Live Production;
- Control Room;
- approved full-size iPad video player;
- non-scrollable player areas where required;
- creator-information placement;
- upload/download/clip/email workflows;
- download name/event date/size/time and other required metadata;
- storage and media lifecycle;
- private-media authorization;
- secure file validation;
- download authorization;
- streaming/range behavior;
- clipping/export concurrency and failure behavior;
- audit/logging;
- responsive/accessible controls;
- integrated Lab contracts.

# 13. Platform 08 — The RefShop

Root remains exactly `08_The_RefShop`.

Validate the complete approved Enterprise Commerce OS, including applicable:

- global retail;
- multi-vendor marketplace;
- B2B/B2C/D2C;
- products/catalog/PIM/MDM;
- sellers/vendors;
- categories/brands/campaigns/advertisements;
- search/filter/sort;
- cart/checkout/orders;
- profile/addresses/payment methods/security/preferences;
- wishlist/saved/recently viewed;
- coupons/gift cards/store credit/rewards;
- digital downloads/licenses/license keys/entitlements/access control;
- memberships/subscriptions;
- tax/VAT;
- shipping/fulfillment/WMS/TMS/3PL/OMS;
- suppliers/procurement;
- payouts/settlements/ledger/refunds;
- POS/ERP/API/webhooks/app integrations;
- advertising/affiliate/analytics;
- multi-currency/multi-language;
- buyer/seller/admin authorization;
- payment-provider boundaries;
- webhook verification/idempotency;
- inventory/order concurrency;
- reconciliation/audit history;
- accessibility/responsiveness/performance/security;
- integrated enterprise contracts.

# 14. Platform 09 — The Cutting Room

Perform a dedicated requirements/source audit first, then validate the approved multimedia-editing interface, media workflows, upload/storage/processing contracts, accessibility, responsive behavior, integrated Lab routing and authoritative full-stack permissions/security established by the audit.

# 15. Platform 10 — The Lab Hub

Validate:

- umbrella navigation and route ownership;
- The Live Stream;
- The Jammed Up Bar!;
- The Locker Room;
- The Vault;
- The Cutting Room;
- no The Save;
- balanced/centered navigation;
- platform sections/cards without prohibited dashboard-card regressions;
- cross-platform route registry;
- responsive/mobile behavior;
- shared branding/accessibility;
- integrated enterprise contracts.

# 16. Platform 11 — Master CMS + Super Admin

Static edition may present administrative interface concepts only; it cannot be authoritative security.

Full-stack validation includes, as applicable:

- Super Admin authentication;
- roles/permissions;
- persistent login/session policy;
- account/membership oversight;
- assignment/schedule administration;
- pending/accept/decline/turn-back workflows;
- QR/payroll notification behavior;
- messages/notifications;
- training-school create/update/remove workflows;
- page/content management;
- route/content publication;
- audit history;
- security logging;
- protected admin APIs;
- destructive-action confirmation;
- database transactions/concurrency;
- backup/restore;
- monitoring/alerts/rollback.

# 17. Integrated HTML/CSS/JS enterprise gate

Begin only after the standalone HTML/CSS/JS platforms are individually locked.

Validate:

- exact ecosystem route ownership;
- shared global navigation/footer contracts;
- centered-logo behavior;
- account-interface visibility rules;
- cross-platform CTAs;
- consent/privacy consistency;
- deliberately shared design tokens/components;
- independent platform asset ownership;
- no broken relative paths after integration;
- no duplicate IDs;
- no JS global/module collisions;
- no CSS leakage/cascade collisions;
- no incompatible duplicate components;
- global accessibility regression;
- global responsive regression;
- global SEO/canonical behavior;
- integrated performance/regression.

# 18. Full-stack architecture freeze gate

No full-stack implementation receives source-validation status until architecture freezes:

- runtime/language/version;
- application architecture boundaries;
- server framework;
- database technology;
- ORM/query layer if used;
- migrations;
- authentication/session model;
- authorization/role model;
- object/media storage;
- payment provider strategy;
- email/notification strategy;
- background jobs/queues if required;
- deployment/hosting;
- secrets/environment handling;
- observability;
- backup/disaster recovery;
- CI/CD;
- unit/integration/e2e/security test strategy.

# 19. Integrated full-stack enterprise gate

After full-stack platform modules are individually validated, run cross-platform validation for:

- identity/session consistency;
- server-side authorization across every protected feature;
- role/tenant/object-level ownership;
- shared account/profile state;
- payments/memberships/commerce/entitlements interactions;
- assigning/payroll/QR interactions;
- messaging/notification/event delivery;
- media storage/access controls;
- audit/logging/correlation;
- API/version/schema consistency;
- database transaction boundaries;
- idempotency/replay behavior;
- privacy/retention/deletion;
- backups/restore;
- deployment/rollback;
- full security/regression/performance suite.

# 20. Evidence ladder

```text
E0 — requirements/source identity known
E1 — requirements + architecture reconciled
E2 — complete design/downstream dependency contract validated
E3 — static source review + syntax/type/lint passed
E4 — browser/server runtime passed
E5 — accessibility/responsive/manual interaction passed
E6 — security/privacy/SEO/PWA/performance/integration passed as applicable
E7 — regression passed + hash + commit recorded = VALIDATED
E8 — dependency/regression lock = LOCKED
```

# 21. Teaching gate

Even individually validated or locked files remain non-teachable until **every** mandatory implementation is locked and the current registry reaches:

```text
PROJECT_WIDE_LOCKED
```

Only then is the teaching freeze lifted.
