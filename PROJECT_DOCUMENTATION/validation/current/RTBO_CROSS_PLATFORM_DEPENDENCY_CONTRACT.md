# RTBO CROSS-PLATFORM DEPENDENCY CONTRACT — CURRENT

**Status:** MANDATORY — NO EXCEPTIONS  
**Scope:** all standalone HTML/CSS/JS editions, integrated HTML/CSS/JS enterprise, all full-stack platform/modules, integrated full-stack enterprise

## 1. Ecosystem platform identities

The project contains exactly these current platform roots:

1. `01_RTBO_Core_Website`
2. `02_Got_U_Nex_Ref`
3. `03_RefZone_University`
4. `04_The_Live_Stream`
5. `05_The_Jammed_Up_Bar`
6. `06_The_Locker_Room`
7. `07_The_Vault`
8. `08_The_RefShop`
9. `09_The_Cutting_Room`
10. `10_The_Lab_Hub`
11. `11_Master_CMS_Super_Admin`

`The Save` is not a platform and is permanently excluded unless the user explicitly reverses that decision.

## 2. Current Core navigation contract

The primary Core navigation is:

- Home
- About
  - Guests
  - Trainers
  - Reviews
  - Founder
- Schools
  - UAPB Men
  - UAPB Women
  - UCA Women
  - UALR Women
- RefZone University
- centered RTBO logo
- Events
  - Hop Step Sporting Events
  - Big Miller Event
  - She Got Game League LR
  - UAPB Celebrity Game
- The Lab
  - The Live Stream
  - The Jammed Up Bar!
  - The Locker Room
  - The Vault
  - The Cutting Room
- Services
- Shop

Permanently excluded from current navigation/routes/pages unless explicitly restored by the user:

- The Save
- Arkansas Baptist College Classic
- Arkansas Sports Hall of Fame

## 3. Canonical domain / platform routing contract

Canonical Core domain: `https://rtboofficiating.com/`.

Known production platform destinations include:

- RefZone University: `https://university.rtboofficiating.com/refzone-university/`
- Got U Nex Ref: `https://assign.rtboofficiating.com/got-u-nex-ref/`
- The Lab Hub: `https://lab.rtboofficiating.com/the-lab/`
- The Live Stream: `https://live.rtboofficiating.com/live-stream/`
- The Jammed Up Bar!: `https://podcast.rtboofficiating.com/jammed-up-bar/`
- The Locker Room: `https://lockerroom.rtboofficiating.com/locker-room/`
- The Vault: `https://vault.rtboofficiating.com/vault/`
- The Cutting Room: `https://cuttingroom.rtboofficiating.com/cutting-room/`
- The RefShop compatibility destination: `https://shop.rtboofficiating.com/refshop/index.html#/shop`

No code may introduce `raisingthebarofficiating.com`.

## 4. Standalone vs integrated editions

Every platform remains independently deployable in its standalone edition.

The integrated HTML/CSS/JS enterprise links those standalone platform experiences into the RTBO ecosystem without destroying standalone usability.

The full-stack enterprise adds authoritative server-side behavior. Static/browser-only editions may represent UI states but must never claim secure server authority for authentication, authorization, payments, private data, membership enforcement, uploads, payroll, assigning, or Super Admin operations.

## 5. Shared account/navigation experience

Approved global behavior to preserve where applicable:

- Register removed from global navigation.
- Account wording/routes evolve to Sign up and Sign in interfaces.
- authenticated users hide Sign up/Sign in affordances when authoritative full-stack state exists;
- user icon/dropdown provides portal, settings, notifications, messages and logout;
- authorized Super Admin users additionally receive Admin Dashboard access;
- RTBO Home is available from connected-platform user navigation where required;
- administrative controls are shown only to authorized users in authoritative full-stack editions.

Static editions may show representational account interfaces but cannot fake authoritative login persistence or security.

## 6. Shared password/security contract for authoritative full-stack edition

Where account authentication applies:

- lock after 3 failed login attempts according to the final frozen security workflow;
- password reset through verified email workflow with temporary/reset credential behavior defined by the frozen auth architecture;
- enforce the user-approved password baseline: at least 8 characters, at least one capital letter, at least one special character, and no disallowed profile-derived information;
- enforce 365-day password reuse restriction when the authoritative storage/security design supports this requirement;
- all final auth/session/password handling must be reconciled with current OWASP and the frozen framework/provider guidance before lock.

No client-side-only implementation may claim to enforce these controls securely.

## 7. Notification and messaging dependencies

Authoritative full-stack notification requirements include, where applicable:

Super Admin notifications:
- login events where required;
- assignment accept/decline/turn-back activity;
- profile updates;
- TBA requests;
- pending assignment viewed status;
- message read status;
- new account/membership events.

User notifications:
- assigned/pending items;
- messages;
- canceled events/games;
- schedule changes;
- administrator notices.

Shared notification schemas must be versioned and validated across every platform that produces or consumes them.

## 8. Assignment / turn-back / schedule / payroll dependencies

Authoritative assigning/payment flows must preserve approved behavior including:

- turn-back reason aligned with decline reason requirements;
- game remains on schedule until turn-back approval;
- confirmation before turn-back submission;
- Super Admin-only final removal where required;
- master schedule visually identifies turned-back games with the approved state;
- payment eligibility after completed/forfeited/canceled games only according to final approved on-site/QR workflow;
- QR/on-site scan event produces the approved downstream payroll/athletics notifications.

These are full-stack authority flows and require transaction, authorization, audit, idempotency and failure-state validation.

## 9. Training-school dependency contract

The ecosystem must support approved training-school management requirements in authoritative editions:

- configurable school slots/capacity;
- deadline management;
- sold-out state;
- ability for authorized administrators to add/remove training schools;
- ability to add corresponding school subpages and approved graphics/assets;
- no orphan routes or stale navigation after school changes.

## 10. RefZone University dependencies

RefZone University is a standalone education platform with 20 competition levels and three academic tiers per level: Bachelor's, Master's and PhD.

The 20 levels are:
- NFHS
- NJCAA Men
- NJCAA Women
- NAIA Men
- NAIA Women
- NCAA DIII Men
- NCAA DIII Women
- NCAA DII Men
- NCAA DII Women
- NCAA DI Men
- NCAA DI Women
- USA Men
- USA Women
- EURO Men
- EURO Women
- FIBA Men
- FIBA Women
- G-League
- WNBA
- NBA

Approved education/player dependencies include:
- Coursera-style learning experience adapted to RTBO;
- approved iPad-style player;
- left learning navigation;
- right sidebar that can be minimized while remaining usable;
- playlist hidden until actual videos exist;
- programs/pathways combined as approved;
- membership/payment gating after account creation while overview/syllabus remains viewable pre-membership;
- Learning Lab, survey and recommendation flow;
- rule-by-rule/scenario/reasoning/intent/quiz/film/transcript/diagram/script curriculum structure;
- transcript packages and course content must remain traceable to approved content.

## 11. Media/player shared contract

Approved iPad-style media-player behavior is a reusable ecosystem dependency for platforms that require it.

Do not substitute screenshots, image overlays or fake hotspots for interactive UI where the user required recreated HTML/CSS/JS elements.

Where video is not available, the UI must expose truthful unavailable/empty states rather than fake playback.

Responsive behavior must preserve the player and navigation at small-device breakpoints.

## 12. The Live Stream dependencies

Preserve the approved cinematic broadcast identity and Live Stream-specific navigation/hero/featured-event requirements, including the approved shield/camera navigation logo and RTBO Live branding when the exact approved assets are available.

Live-event and schedule interfaces must use truthful availability states and cannot claim an active stream when one does not exist.

## 13. The Jammed Up Bar! dependencies

Preserve approved podcast branding/assets and iPad-style player requirements.

Subscription/membership interfaces may be represented statically in HTML/CSS/JS, while payment/subscription authority belongs only to the validated full-stack provider integration.

## 14. The Locker Room dependencies

The Locker Room remains a separate standalone platform and a The Lab destination. Its final reference set and feature contract must be reconciled before source lock; no adjacent platform may silently define its behavior by assumption.

## 15. The Vault dependencies

The Vault is a TV/multimedia production-studio platform for sports organizations.

Approved functional/reference inspirations include DVSport 360, DVSport Filmroom, Synergy and Hudl, subject to independent RTBO implementation and the user's approved design.

Required capability areas include:
- Vault Home;
- Vault Film Room;
- Vault Live Production;
- Control Room;
- upload/game-film handling;
- clip creation;
- download;
- email/share workflow where authoritative infrastructure permits;
- full-size non-scrollable approved iPad player in required production surfaces;
- creator information at the bottom;
- detailed download metadata/status.

Static editions cannot pretend to persist/upload/email private media securely.

## 16. The RefShop dependencies

Root folder name must remain exactly `08_The_RefShop`.

The RefShop is an enterprise commerce OS whose approved scope includes global retail, marketplace/multi-vendor, B2B/B2C/D2C, digital products, subscriptions, services, wholesale, logistics/fulfillment, advertising, affiliate and financial-service-ready commerce models.

The final implementation must reconcile approved requirements for:
- products/categories/brands/sellers/campaigns/advertising;
- account/address/payment/preferences/security/wishlist/saved/recent views;
- orders/order details/downloads/licenses/entitlements;
- memberships/subscriptions/rewards/store credit/gift cards/coupons;
- PIM/MDM, supplier/procurement, WMS/TMS/3PL, OMS/POS/ERP integration contracts;
- APIs/webhooks/app-marketplace integration boundaries;
- analytics/BI, affiliate, tax/VAT, shipping, multicurrency and multilanguage architecture;
- digital-product entitlement/license/download/access-control models;
- payments/refunds/taxes/coupons/gift cards/credits/invoicing/payouts/settlements/ledger.

The correct approved RefShop platform/reference source controls over earlier incorrect builds.

## 17. The Cutting Room dependencies

The Cutting Room is a multimedia film-editing platform under The Lab ecosystem. Preserve approved Cutting Room branding/logo/reference requirements and independently validate its editing/media workflow before source lock.

Static HTML/CSS/JS may represent editing UI but cannot pretend to perform server-authoritative media processing that requires backend infrastructure.

## 18. The Lab Hub dependencies

The Lab Hub is the umbrella destination for:
- The Live Stream
- The Jammed Up Bar!
- The Locker Room
- The Vault
- The Cutting Room

Its layout must remain within the project max-width; approved heading wrapping/font behavior must be preserved. Links/routes must remain synchronized with the standalone platforms.

## 19. Master CMS + Super Admin dependencies

The Master CMS/Super Admin full-stack module is the authoritative administrative integration point. It must not be represented as secure through client-side-only controls.

The full-stack implementation must centralize only the shared authority actually required, with explicit role/permission checks, audit trails, validation, failure handling and cross-platform contracts.

## 20. Shared UI/design dependencies

Current Core visual baseline includes:
- black `#050505`;
- soft black `#0B0B0B`;
- surfaces `#111111` and `#161616`;
- white `#FFFFFF`;
- main text `#F4F4F4`;
- muted `#A8A8A8`;
- burnt orange `#BF5700`;
- crimson `#8B0000`;
- border `rgba(255,255,255,0.14)`;
- Industry for headings where the approved licensed/source asset is available;
- Inter for body/interface;
- Core content max width `1540px`;
- 10px black-gradient structural transitions where approved;
- transparent 1px-border secondary CTAs with approved burnt-orange/crimson hover behavior.

Platform-specific approved design systems may extend this baseline but may not silently break shared ecosystem accessibility/navigation rules.

## 21. Accessibility dependency contract

All applicable editions target WCAG 2.2 AA.

Shared components require consistent semantic, keyboard, focus, disclosure/dialog, label/error, responsive/reflow and reduced-motion behavior. A shared component defect invalidates every dependent platform's lock until revalidated.

The established Core `:focus-visible` system uses a visible white outline plus black separation/shadow and must be reconciled for all shared component contexts.

## 22. Metadata / SEO / icon / PWA dependencies

Every public platform/page must have a complete validated metadata strategy appropriate to its edition, including as applicable:
- title;
- description;
- canonical URL;
- favicon/icon references;
- social metadata and approved share image;
- robots/indexing intent;
- structured data when justified;
- manifest/PWA metadata only when PWA implementation is actually approved and complete.

Never invent asset paths or metadata values simply to satisfy a checklist.

## 23. Asset dependency rule

Approved user-supplied logos, graphics, icons, photographs, course artwork and reference files remain authoritative assets when still approved.

If an exact asset is not available in the current source workspace/File Library/repository, mark the affected visual/metadata gate `BLOCKED_ASSET`, not `PASS`, and do not substitute a fabricated replacement as final.

## 24. Shared source / versioning rule

Reusable source may be shared only through an explicit documented shared-package/component contract. A modification to shared source invalidates dependent hashes/evidence and triggers dependency revalidation.

No hidden duplication of near-identical shared navigation/auth/consent/route logic is considered fully validated until divergence risk is addressed.

## 25. Integrated enterprise lock condition

A standalone platform may be individually `LOCKED`, but the project remains teaching-frozen until:

- all 11 standalone HTML/CSS/JS editions lock;
- integrated HTML/CSS/JS enterprise locks;
- full-stack architecture versions freeze;
- every full-stack platform/module locks;
- integrated full-stack enterprise locks;
- final cross-platform regression passes.

## 26. Deployment guard

The current public website is not modified during validation.

Production replacement requires:
- `PROJECT_WIDE_LOCKED = true`;
- deployment-readiness PASS;
- tested backup/rollback/migration procedure;
- explicit user approval of the exact locked release.
