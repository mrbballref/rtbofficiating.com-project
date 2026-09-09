# RTBO PROJECT-WIDE VALIDATION MATRIX

**Repository:** `mrbballref/rtbofficiating.com-project`  
**Governance:** `RTBO_MASTER_VALIDATED_CODE_RULE.md`  
**Status:** ACTIVE  
**Default source status:** `REVALIDATION_REQUIRED` until actual source and evidence are inspected.

## 1. Purpose

This matrix is the master control board for validating every required implementation of every RTBO platform before any code is taught as approved production code.

A green-looking UI is not a pass. A platform/edition is complete only when its applicable requirements, architecture, source, runtime, accessibility, responsive, security/privacy, performance, SEO/PWA, integration, regression, and test gates are all satisfied.

## 2. Edition definitions

### A. Standalone HTML/CSS/JS
A separately deployable static/public implementation of each platform, preserving approved public functionality without pretending to provide server-authoritative security.

### B. Integrated HTML/CSS/JS Enterprise
The combined browser-based RTBO ecosystem with all approved platform links, shared contracts, route registry, navigation/account shells, branding, public UI behaviors and cross-platform integration.

### C. Full-Stack Enterprise
The authoritative application implementation for authentication, authorization, persistent private data, payments, memberships, assignments, messaging, notifications, uploads, admin operations, database transactions, APIs and other secure workflows.

## 3. Platform matrix

| # | Platform | Standalone HTML/CSS/JS | Integrated HTML/CSS/JS | Full-Stack | Current controlling note |
|---|---|---|---|---|---|
| 01 | RTBO Core Website | REVALIDATION_REQUIRED | NOT_STARTED | NOT_STARTED | New Core restart exists; prior labels must be re-audited under master rule. |
| 02 | Got U Nex Ref | REVALIDATION_REQUIRED | NOT_STARTED | NOT_STARTED | Assigning platform; secure assignment/auth flows belong to full-stack. |
| 03 | RefZone University | REVALIDATION_REQUIRED | NOT_STARTED | NOT_STARTED | Education platform; 20 competition levels × 3 academic tiers; membership/auth entitlements full-stack. |
| 04 | The Live Stream | REVALIDATION_REQUIRED | NOT_STARTED | NOT_STARTED | Broadcast platform; approved visual/player/navigation requirements must be re-audited. |
| 05 | The Jammed Up Bar! | REVALIDATION_REQUIRED | NOT_STARTED | NOT_STARTED | Podcast/subscription platform; payment/subscription authority full-stack. |
| 06 | The Locker Room | REVALIDATION_REQUIRED | NOT_STARTED | NOT_STARTED | Platform-specific requirements/source audit required before validation. |
| 07 | The Vault | REVALIDATION_REQUIRED | NOT_STARTED | NOT_STARTED | Filmroom/live/control; uploads/clips/private media rights full-stack. |
| 08 | The RefShop | REVALIDATION_REQUIRED | NOT_STARTED | NOT_STARTED | Enterprise Commerce OS; extensive commerce/security/integration validation required. |
| 09 | The Cutting Room | REVALIDATION_REQUIRED | NOT_STARTED | NOT_STARTED | Multimedia editing platform; source/requirements audit required. |
| 10 | The Lab Hub | REVALIDATION_REQUIRED | NOT_STARTED | NOT_STARTED | Umbrella/Lab route and integration hub; excludes The Save. |
| 11 | Master CMS + Super Admin | REVALIDATION_REQUIRED | NOT_STARTED | NOT_STARTED | Static edition may only represent UI; authoritative admin/security operations full-stack. |

## 4. Permanent exclusions/route constraints

Unless the user explicitly reverses them, all editions must exclude:

```text
The Save
Arkansas Baptist College Classic
Arkansas Sports Hall of Fame
```

Canonical production domain family remains based on `rtbofficiating.com` and approved subdomains. Never introduce `raisingthebarofficiating.com`.

## 5. Validation gate matrix

Each platform/edition must be evaluated against the applicable gates below.

| Gate | Standalone HTML/CSS/JS | Integrated HTML/CSS/JS | Full-Stack |
|---|---:|---:|---:|
| Requirements/source-of-truth reconciliation | REQUIRED | REQUIRED | REQUIRED |
| Architecture | REQUIRED | REQUIRED | REQUIRED |
| Route inventory | REQUIRED | REQUIRED | REQUIRED |
| UI/UX information architecture | REQUIRED | REQUIRED | REQUIRED |
| Design system | REQUIRED | REQUIRED | REQUIRED |
| Filesystem/module ownership | REQUIRED | REQUIRED | REQUIRED |
| HTML semantics/document metadata | REQUIRED | REQUIRED | REQUIRED frontend |
| CSS/cascade/responsive/reflow | REQUIRED | REQUIRED | REQUIRED frontend |
| JavaScript/progressive enhancement | REQUIRED | REQUIRED | REQUIRED frontend |
| WCAG 2.2 AA manual + automated validation | REQUIRED | REQUIRED | REQUIRED |
| Pointer/keyboard/touch/focus | REQUIRED | REQUIRED | REQUIRED |
| Loading/empty/error/success states | AS APPLICABLE | REQUIRED | REQUIRED |
| SEO/canonical/social metadata | PUBLIC PAGES | PUBLIC PAGES | PUBLIC PAGES |
| Favicon/icons/manifest/PWA contract | AS APPROVED | AS APPROVED | AS APPROVED |
| Performance/Core Web Vitals | REQUIRED | REQUIRED | REQUIRED |
| Route/link regression | REQUIRED | REQUIRED | REQUIRED |
| Cross-platform integration | EXTERNAL CONTRACTS | REQUIRED | REQUIRED |
| Authentication/session | UI-ONLY BOUNDARY | UI-ONLY BOUNDARY | REQUIRED WHERE APPLICABLE |
| Authorization | NOT AUTHORITATIVE | NOT AUTHORITATIVE | REQUIRED WHERE APPLICABLE |
| Database/migrations/transactions | N/A | N/A | REQUIRED WHERE APPLICABLE |
| API schemas/status/errors/rate limits | N/A unless real public API | N/A unless real public API | REQUIRED WHERE APPLICABLE |
| Secure file upload/download | NOT AUTHORITATIVE | NOT AUTHORITATIVE | REQUIRED WHERE APPLICABLE |
| Payments/webhooks/ledger/reconciliation | NOT AUTHORITATIVE | NOT AUTHORITATIVE | REQUIRED WHERE APPLICABLE |
| Security headers/CORS/CSRF/CSP | HOSTING REVIEW | HOSTING REVIEW | REQUIRED WHERE APPLICABLE |
| Logs/metrics/alerts/backups/rollback | N/A | N/A | REQUIRED WHERE APPLICABLE |
| Dependency/security vulnerability review | NATIVE WEB ONLY or build deps | NATIVE WEB ONLY or build deps | REQUIRED |
| Automated unit/integration/e2e tests | AS APPLICABLE | REQUIRED | REQUIRED |
| Manual browser/runtime regression | REQUIRED | REQUIRED | REQUIRED |
| Registry hash/evidence | REQUIRED | REQUIRED | REQUIRED |
| Final lock | REQUIRED | REQUIRED | REQUIRED |

## 6. Platform 01 — RTBO Core Website validation program

The Core implementation must be re-audited from the document root forward. The earlier discovery of omitted metadata/favicon handling and disclosure-state behavior means no earlier "validated" label is carried forward automatically.

### Current planned slices

```text
01 Foundation + Entry Point
02 Global Shell + Container System
03 Desktop Navigation
04 Mobile Navigation
05 Account Interface Shell
06 Homepage Hero
07 Quick Ecosystem Links / Four-Item Strip
08 About RTBO Homepage Section
09 Built for the Game
10 Education / Training / Assigning Pathways
11 Client Spotlight + approved iPad player
12 Services Preview
13 Final CTA
14 Footer
15 Consent / Privacy Interface
16 Complete Core Route Registry
17 About Page Family
18 Schools Page Family
19 Events Page Family
20 Services Page
21 Contact Page
22 Partners Page
23 Legal Page Family
24 Account Interface Page Family
25 SEO / Metadata / Manifest Review
26 PWA / Offline Decision + implementation if approved
27 Full Core Regression Audit
28 Platform 01 Lock
```

### Governance correction

The master validation rule changes execution of these slices: code is no longer taught before downstream validation. Before the first teaching block is given, all affected downstream contracts for that block must already be validated.

For example, the production `<head>` cannot be taught until the required metadata, favicon/icon paths, canonical behavior, social metadata ownership, manifest/PWA dependency and page-level variation strategy are resolved.

Likewise, desktop navigation cannot be taught until its complete HTML/CSS/JS behavior, route set, current-page behavior, responsive handoff, mobile interaction dependency, focus/Escape behavior, disclosure visibility state, approved logo asset, and regression expectations are designed and validated.

## 7. Platform 02 — Got U Nex Ref validation program

Validate at minimum:

- approved exact logo/branding;
- standalone public landing/interface;
- service integration from RTBO Core;
- account/sign-in shell boundary in static edition;
- assigning workflows;
- schedules;
- acceptance/decline/turn-back rules;
- training-school interactions where applicable;
- notifications/messages;
- QR attendance/payroll signaling;
- secure roles/permissions;
- persistent data model;
- audit trail;
- full-stack authentication/authorization;
- API/database concurrency around assignments;
- responsive/accessibility/error/offline decisions.

## 8. Platform 03 — RefZone University validation program

Validate at minimum:

- 20 competition levels;
- Bachelor's/Master's/PhD tiers;
- all required pathways and course ownership;
- Programs & Pathways;
- membership/payment gating;
- Learning Lab;
- approved iPad player;
- left sidebar and minimizable right sidebar;
- responsive mobile navigation/player behavior;
- survey/recommendation flows;
- course transcript and content contracts;
- quizzes/progress;
- entitlements;
- authentication/authorization;
- membership/payment authority;
- accessible media, captions/transcripts;
- secure course/media access in full-stack.

## 9. Platform 04 — The Live Stream validation program

Validate at minimum:

- approved logo/navigation;
- hero and typography requirements;
- Featured Live Event;
- iPad player;
- schedule/watch routes;
- responsive navigation;
- streaming unavailable/empty/error/loading states;
- media accessibility;
- streaming/security/authorization requirements in full-stack;
- performance and network failure behavior.

## 10. Platform 05 — The Jammed Up Bar! validation program

Validate at minimum:

- approved home/navigation assets;
- podcast player/content;
- subscription form;
- membership/payment boundary;
- accessible audio/transcripts;
- loading/empty/error states;
- responsive navigation;
- full-stack subscriptions, billing, entitlements and account state.

## 11. Platform 06 — The Locker Room validation program

Before code validation, perform a dedicated requirements/source audit. Then validate public UI, routing, media/content behavior, account/security boundary, accessibility, responsive behavior, integration, and every authoritative full-stack feature established by that audit.

## 12. Platform 07 — The Vault validation program

Validate at minimum:

- Vault Home;
- Vault Film Room;
- Vault Live Production;
- Control Room;
- approved full-size iPad player;
- non-scrollable player areas where approved;
- creator information placement;
- upload/download/clip/email workflows;
- event date/name/size/time metadata;
- private media authorization;
- file security;
- streaming/range requests;
- storage lifecycle;
- audit/logging;
- responsive/accessible player and controls.

## 13. Platform 08 — The RefShop validation program

Validate the complete Enterprise Commerce OS, including applicable:

- global retail/multi-vendor/B2B/B2C/D2C;
- products/catalog/PIM/MDM;
- sellers/vendors;
- search/filter/sort;
- cart/checkout/orders;
- profiles/addresses/payment methods;
- wishlist/saved/recently viewed;
- coupons/gift cards/store credit/rewards;
- digital downloads/licenses/entitlements;
- memberships/subscriptions;
- tax/VAT;
- shipping/fulfillment/WMS/TMS/3PL/OMS;
- supplier/procurement;
- payouts/settlements/ledger/refunds;
- ERP/POS/API/webhook/integration contracts;
- advertising/affiliate/analytics;
- multi-currency/multi-language;
- security/payment provider compliance boundaries;
- seller/buyer/admin authorization;
- webhook verification/idempotency;
- inventory/order concurrency;
- full audit/reconciliation.

Root folder remains exactly `08_The_RefShop`.

## 14. Platform 09 — The Cutting Room validation program

Perform dedicated requirements/source audit first, then validate the multimedia-editing public interface, media workflows, integration, accessibility, responsive behavior, secure uploads/storage/processing and full-stack authorization established by the audit.

## 15. Platform 10 — The Lab Hub validation program

Validate:

- umbrella navigation and route ownership;
- Live Stream;
- Jammed Up Bar!;
- Locker Room;
- Vault;
- Cutting Room;
- no The Save;
- balanced/centered navigation;
- platform cards/sections without dashboard-card regressions where prohibited;
- cross-platform route registry;
- responsive/mobile behavior;
- shared branding/accessibility.

## 16. Platform 11 — Master CMS + Super Admin validation program

Static edition may present administrative interface concepts but must not represent itself as secure authority.

Full-stack validation includes, as applicable:

- Super Admin authentication;
- roles/permissions;
- persistent login/session policy;
- account creation/membership oversight;
- assignment/schedule administration;
- pending/accept/decline/turn-back workflows;
- QR/payroll notifications;
- messages/notifications;
- training-school CRUD;
- page/content management;
- route/content publication;
- audit trail;
- security logging;
- protected admin APIs;
- database transactions/concurrency;
- backups/restore;
- operational monitoring;
- safe destructive-action confirmation.

## 17. Cross-platform enterprise validation

After all standalone editions are locked, the integrated HTML/CSS/JS enterprise must validate:

- identical approved ecosystem route ownership;
- global navigation/footer contracts;
- centered logo behavior;
- account-interface visibility rules;
- cross-platform CTAs;
- consistent consent/privacy handling;
- shared design tokens where deliberately centralized;
- independent platform asset ownership;
- no broken relative paths after integration;
- no duplicate IDs/global variable collisions;
- no CSS leakage/cascade collisions;
- no duplicated incompatible components;
- global accessibility regression;
- global responsive regression;
- global SEO/canonical behavior.

## 18. Full-stack enterprise validation

The full-stack edition is not started until the full-stack architecture freezes:

- runtime/framework versions;
- monolith/modular-monolith/service boundaries;
- database technology and schema strategy;
- authentication/session model;
- authorization model;
- object storage/media strategy;
- payment/provider strategy;
- email/notification strategy;
- deployment/hosting;
- secrets/environment strategy;
- observability;
- backup/recovery;
- CI/test strategy.

Only then may full-stack source be created and validated against the Master Rule and current official documentation.

## 19. Evidence levels

Use these evidence labels per registry entry:

```text
E0 — requirement known only
E1 — architecture/source contract reviewed
E2 — static source review passed
E3 — automated syntax/lint/unit checks passed
E4 — browser/runtime behavior passed
E5 — accessibility/responsive/manual interaction passed
E6 — security/privacy/performance/integration checks passed
E7 — regression suite passed and content hash recorded
E8 — LOCKED
```

A code block may be taught only at E7 (`VALIDATED`) or E8 (`LOCKED`).

## 20. Current repository state

At establishment of this matrix, the GitHub repository is intentionally treated as having **no validated production source yet**. Governance documentation may be committed first. Actual project source must then be imported/synchronized and audited.

No historical `PASS`, `COMPLETE`, or `VERIFIED` label automatically becomes a registry `VALIDATED`/`LOCKED` entry without fresh evidence under the Master Validated Code Rule.
