# RTBO PLATFORM BUILD-FIRST + REFERENCE VALIDATION RULE — CURRENT

**Project:** Raising The Bar Officiating ecosystem  
**Status:** MANDATORY — NO EXCEPTIONS  
**Repository:** `mrbballref/rtbofficiating.com-project`  
**Controls:** the implementation/validation sequence for every platform and enterprise edition in the current validation program.

## 1. User-mandated build-first rule

For each RTBO platform, the assistant must create the complete implementation first in a private/isolated validation branch or workspace before teaching any of it to the user.

The assistant must not teach while the platform is still being designed or assembled.

The required sequence for each platform is:

```text
RECONCILE CURRENT REQUIREMENTS + APPROVED REFERENCES
→ FREEZE THE COMPLETE PLATFORM CONTRACT
→ CREATE EVERY REQUIRED SOURCE FILE
→ CREATE EVERY REQUIRED LINE OF SOURCE CODE
→ COMPLETE INTERNAL STATIC REVIEW
→ RUN THE PLATFORM
→ VALIDATE THE FINISHED UI/UX AGAINST THE APPROVED REFERENCE SET
→ VALIDATE RESPONSIVE/UI STATES
→ VALIDATE ACCESSIBILITY
→ VALIDATE SEO/METADATA/FAVICON/PWA CONTRACTS
→ VALIDATE PERFORMANCE
→ VALIDATE SECURITY/PRIVACY BOUNDARIES
→ VALIDATE ROUTES/ASSETS/INTEGRATIONS
→ RUN REGRESSION TESTS
→ CREATE 100% LINE-ACCOUNTING LEDGERS
→ RECORD SOURCE HASHES + TEST EVIDENCE
→ LOCK THE PLATFORM
```

Only after the platform is locked may its code become a candidate for later teaching. The project-wide teaching freeze remains active until every required platform/edition and enterprise integration is locked.

## 2. Platform-by-platform construction order

Build and validate the standalone HTML/CSS/JS edition of each platform individually in this order:

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

After all standalone HTML/CSS/JS platforms are locked:

```text
BUILD + VALIDATE INTEGRATED HTML/CSS/JS ENTERPRISE
→ FREEZE FULL-STACK ARCHITECTURE + VERSIONS
→ BUILD + VALIDATE EACH FULL-STACK PLATFORM/MODULE
→ BUILD + VALIDATE INTEGRATED FULL-STACK ENTERPRISE
→ FINAL PROJECT-WIDE REGRESSION
```

## 3. Reference-validation rule

Every platform must have an explicit `APPROVED_REFERENCE_SET` before UI/UX lock.

The reference set may contain:

- user-designated live websites or applications;
- user-approved screenshots/images;
- user-provided HTML/CSS/JS/reference files;
- user-approved historical platform builds used only for deliberate approved behavior/content;
- approved logos, icons, images and media;
- project architecture, route inventory, UI/UX information architecture and design-system specifications;
- explicit user messages that define exact typography, layout, spacing, behavior or functionality.

Do not invent a reference website when the user did not designate one.

If a live reference website conflicts with a later explicit RTBO requirement, the later RTBO requirement controls. Reference websites are comparison/behavior sources, not authority to override the user's approved RTBO contract.

## 4. Reference-site research rule

When a platform has a user-designated external website/application reference, validation must inspect the current reference using the web when publicly accessible.

Record:

- reference URL/product name;
- date inspected;
- visible information architecture;
- navigation model;
- page/section structure;
- typography/hierarchy patterns;
- spacing/layout patterns;
- component behavior;
- media/player behavior;
- forms/search/filter/account interaction patterns where applicable;
- responsive/mobile behavior when observable;
- loading/empty/error/success states when observable;
- usability/accessibility lessons that can be used without copying proprietary source or protected creative expression.

The RTBO implementation must be independently coded. Do not copy proprietary source code, protected assets, or trade dress beyond what the user owns/has supplied or what is permitted as general functional/UI inspiration.

## 5. UI/UX validation rule

A platform cannot be locked from code review alone. The finished rendered implementation must be visually and behaviorally validated.

For every applicable page and breakpoint, compare:

- page structure and information architecture;
- header/navigation geometry;
- true centering/alignment;
- content max widths;
- spacing rhythm;
- headings and body typography;
- approved colors/borders/gradients;
- images/logos/icons;
- CTA sizing/placement/states;
- dropdowns/disclosures/dialogs;
- players/media surfaces;
- cards/sections/containers;
- tables/forms/search/filter controls;
- footer;
- hover/focus/active/disabled/loading/empty/error/success states;
- mobile/tablet/desktop reflow;
- no unintended overlap, clipping or horizontal scroll;
- browser zoom and text spacing;
- keyboard/focus behavior;
- screen-reader semantics where applicable.

A visual similarity pass alone is never sufficient. Functional and accessibility behavior must also pass.

## 6. Complete-code-before-teaching rule

Before the first line/block of a platform is taught to the user, the assistant must already know the complete locked codebase for that platform/edition, including downstream lines and dependencies.

This means the assistant may not discover later that the earlier taught code omitted:

- metadata;
- favicon/icons;
- canonical/social metadata;
- manifest/PWA decisions;
- current-page state;
- hidden/expanded state;
- keyboard/focus behavior;
- responsive behavior;
- route registry entries;
- error/loading/empty states;
- backend validation/security;
- database constraints;
- tests;
- integrations.

Those items must have been accounted for before teaching starts.

## 7. Every-line source validation

Every created file must follow `RTBO_LINE_BY_LINE_VALIDATION_PROOF_STANDARD.md`.

No file may reach `VALIDATED` or `LOCKED` unless:

```text
SOURCE HASH MATCH = PASS
PHYSICAL LINE ACCOUNTING = 100.00%
UNCLASSIFIED LINES = 0
FAILED LINES = 0
UNRESOLVED LINES = 0
APPLICABLE RUNTIME/TEST GATES = PASS
```

Each source ledger must connect every physical line/range to its requirement, standards, runtime and/or integration evidence.

## 8. Static HTML/CSS/JS validation

For every standalone HTML/CSS/JS platform, validate the complete public/browser implementation including:

- HTML document foundation;
- complete metadata strategy;
- favicon/icon references using real approved assets;
- semantic structure;
- CSS architecture/cascade/tokens;
- responsive system;
- ES-module JavaScript;
- navigation;
- forms and progressive enhancement;
- media/player behavior;
- route/link/resource integrity;
- accessible interaction states;
- loading/empty/error/success states;
- public-only security/privacy boundary;
- SEO/social metadata;
- PWA/offline only when approved;
- runtime/browser regression.

Static code must never pretend to provide secure server authority.

## 9. Full-stack creation/validation

Full-stack source is created only after the full-stack architecture freezes exact technologies and versions.

Then create and validate the complete authoritative implementation for each applicable platform, including:

- frontend;
- API/server routes;
- input/output schemas;
- server validation;
- authentication/session;
- authorization;
- database schema/migrations/constraints/indexes/transactions;
- uploads/media/storage;
- payments/webhooks/ledger where applicable;
- messaging/notifications;
- audit logging;
- rate limits;
- security headers/CORS/CSRF/CSP as applicable;
- error/loading/retry/idempotency/concurrency behavior;
- tests;
- observability;
- deployment/secrets/backup/rollback contracts.

Validate against OWASP plus current official documentation for the frozen stack/providers.

## 10. Reference examples already established in project history

Known examples from current project history include, where still applicable after current contract reconciliation:

- RefZone University: Coursera-style education UX combined with the approved RTBO iPad-style player and RTBO-specific requirements;
- The Vault: functional/UX comparison sources include DVSport 360, DVSport Filmroom, Synergy and Hudl, while retaining RTBO-approved iPad-player and production-studio requirements;
- additional user-provided screenshots/files/assets for platform-specific exact layouts and visuals.

These examples do not authorize inventing unverified reference sites for other platforms. Each platform manifest must list its actual approved reference set before design lock.

## 11. Validation evidence required per platform

Each locked platform must have at minimum:

```text
requirements reconciliation report
approved reference-set manifest
reference-site/UI research record
source file inventory
route/resource-link audit
line-by-line ledgers
HTML/CSS/JS static validation evidence
runtime test report
responsive breakpoint report
accessibility report
UI/UX comparison report
SEO/metadata/favicon/PWA report
performance report
security/privacy boundary report
integration report
regression report
source commit + hashes
platform LOCKED manifest
```

Full-stack editions add security, API, database, auth, provider, operational and deployment evidence.

## 12. Teaching consequence

The code the user is later taught must be the exact locked source code that was actually executed and validated.

Teaching may explain or break that code into beginner-friendly logical blocks, but may not redesign, simplify, improvise, omit or substitute source while teaching.

If a teaching explanation reveals a real source defect, teaching stops for the affected dependency tree, the source returns to `REVALIDATION_REQUIRED`, the canonical source is corrected and revalidated, and only then may teaching resume.

## 13. Permanent governing principle

```text
CREATE THE REAL CODE FIRST.
RUN THE REAL CODE.
COMPARE THE REAL UI/UX.
VALIDATE EVERY LINE AND EVERY SYSTEM.
LOCK THE EXACT SOURCE.
ONLY THEN TEACH THAT EXACT SOURCE.
```
