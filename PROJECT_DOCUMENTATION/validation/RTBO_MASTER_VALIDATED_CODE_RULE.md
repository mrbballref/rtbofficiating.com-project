# RTBO MASTER VALIDATED CODE RULE

**Project:** Raising The Bar Officiating (RTBO) Ecosystem  
**Status:** MANDATORY — NO EXCEPTIONS  
**Repository:** `mrbballref/rtbofficiating.com-project`  
**Applies to:** Every standalone platform, the integrated HTML/CSS/JS enterprise, and the full-stack enterprise.

## 1. Master rule

No implementation code may be provided to the user until the complete finished implementation for the applicable feature has already been designed and validated against the full downstream contract.

Validation happens **before teaching**, never while the user is typing.

The assistant must never:

- improvise downstream code one line at a time;
- discover required HTML, metadata, favicon/icon references, routes, assets, CSS, JavaScript, accessibility states, responsive behavior, backend logic, database logic, security controls, or tests only after earlier code has already been given to the user;
- call code validated because syntax alone passes;
- call a feature complete because only its visible UI works;
- rely on chat history or memory as the canonical store of validated source;
- teach or reuse code with `DRAFT`, `REVIEW_REQUIRED`, `REVALIDATION_REQUIRED`, `FAILED`, or `SUPERSEDED` status;
- silently modify validated code without invalidating and revalidating every affected registry entry.

If one defect or omission is found in a shared system, audit the **entire affected system** before issuing any correction.

## 2. All prior RTBO rules remain mandatory

This rule adds to, and does not replace, any user-approved RTBO rule. This includes:

- standards and requirements before architecture;
- architecture before routes/information architecture;
- routes/information architecture before design system/filesystem/code;
- standalone platforms first;
- integrated HTML/CSS/JS enterprise second;
- full-stack enterprise third;
- semantic HTML;
- modern CSS with cascade layers, custom properties, low specificity, and no unjustified `!important`;
- modern ES-module JavaScript and `addEventListener()`;
- progressive enhancement;
- WCAG 2.2 AA;
- no dummy code, routes, assets, IDs, credentials, configuration, authentication, or `href="#"`;
- HTTP/HTTPS runtime testing for ES modules;
- static HTML/CSS/JS must never pretend to provide authoritative authentication, authorization, payments, private data, secure uploads, membership entitlements, payroll, assignments, messages, notifications, or Super Admin actions;
- every cumulative checkpoint is a literal cumulative continuation;
- `The Save` remains excluded unless the user explicitly reverses that rule;
- `Arkansas Baptist College Classic` and `Arkansas Sports Hall of Fame` remain excluded unless the user explicitly reverses that rule;
- exact user-approved platform assets, names, routes, behavior, and content remain controlling.

## 3. Mandatory reference hierarchy

Every proposed implementation is checked in this order:

1. User's latest explicit requirement.
2. Latest controlling section of the cumulative checkpoint.
3. Master ecosystem architecture/specification.
4. Platform requirements freeze.
5. Route inventory.
6. UI/UX information architecture.
7. Design-system specification.
8. Target file/folder tree.
9. Exact feature-slice contract.
10. Approved assets/content.
11. Cross-platform integration contracts.
12. Current actual source files.
13. Current runtime/test evidence.

Later approved requirements override earlier historical requirements while the historical record remains preserved.

### External references

Use the current applicable guidance from:

- MDN / Mozilla — primary HTML/CSS/JavaScript/browser reference;
- WHATWG HTML Standard — normative HTML behavior and semantics;
- W3C / WAI / WCAG 2.2 — accessibility;
- WAI-ARIA Authoring Practices — only when ARIA patterns are actually needed;
- W3Schools — beginner-friendly supplemental reference only;
- OWASP ASVS **5.0.0** and OWASP Cheat Sheet Series — full-stack security verification;
- web.dev — Core Web Vitals, performance, PWA/service-worker guidance;
- USWDS — accessible interaction/design-system guidance where applicable;
- Nielsen Norman Group — usability guidance where applicable;
- official documentation for every selected runtime, framework, database, ORM/query layer, authentication provider, payment provider, email provider, storage provider, build tool, test tool, and deployment target.

No full-stack stack, dependency, provider, route, schema, or service is invented merely to move forward. It must be frozen in architecture first.

## 4. Mandatory project-wide validation sequence

```text
Standards + Requirements
        ↓
Architecture
        ↓
Routes / Information Architecture
        ↓
Design System
        ↓
Filesystem
        ↓
Complete Implementation Design
        ↓
Source Code
        ↓
Static Validation
        ↓
Browser / Runtime Validation
        ↓
Accessibility Validation
        ↓
Responsive Validation
        ↓
Security / Privacy Validation
        ↓
Performance Validation
        ↓
SEO / Metadata / PWA Validation
        ↓
Integration Validation
        ↓
Regression Validation
        ↓
Automated + Manual Test Evidence
        ↓
Registry Snapshot + SHA-256
        ↓
VALIDATED
        ↓
LOCKED
        ↓
Teaching
```

Teaching is always the final step.

## 5. HTML/CSS/JS validation gate

Every applicable static feature must validate all relevant items below.

### HTML/document

- doctype, `lang`, charset, viewport;
- unique title;
- meta description where applicable;
- canonical relationship where applicable;
- favicon/icon relationships and real asset paths;
- manifest relationship only when the manifest contract is approved;
- Open Graph/social metadata where applicable, using real approved assets;
- structured data only when facts are verified;
- semantic landmarks and heading hierarchy;
- native semantics before ARIA;
- links vs buttons;
- real routes only;
- `aria-current` where appropriate;
- form labels, descriptions, instructions, errors, autocomplete, input purpose;
- disclosure/dialog/tab/accordion/media semantics as applicable;
- `aria-expanded`/visibility/`hidden` state synchronization;
- accessible names;
- IDs and ARIA ID references;
- valid nesting;
- duplicate-ID detection;
- media alternatives/captions/transcripts where applicable;
- progressive-enhancement fallback.

### CSS

- approved cascade layer order;
- every import exists and is required;
- no production import to a missing or empty placeholder module;
- design tokens;
- typography and approved font contracts;
- approved colors and contrast;
- spacing and max widths;
- logical properties where appropriate;
- approved responsive handoffs;
- reflow/zoom/text-spacing behavior;
- visible focus and focus-not-obscured behavior;
- target sizing;
- reduced motion;
- hover/focus/touch parity;
- no accidental horizontal overflow;
- stacking contexts;
- dark/light/default browser surface handling;
- maintainable low-specificity selectors;
- no unjustified `!important`.

### JavaScript

- ES-module boundaries and real imports/exports;
- DOM query assumptions and null handling;
- `addEventListener()`;
- pointer/keyboard parity;
- focus management;
- ARIA and visible-state synchronization;
- progressive enhancement;
- no unnecessary globals;
- lifecycle/cleanup where applicable;
- asynchronous failure handling;
- loading/empty/error/success states;
- race-condition/cancellation handling where applicable;
- real routes/history behavior;
- storage/privacy review;
- no secrets in client source;
- no fake secure behavior;
- no uncaught runtime errors in supported browsers.

### Static security boundary

The static edition must not claim authoritative security for authentication, authorization, payments, entitlements, private messages/notifications, protected data, secure uploads, payroll, assignments, or Super Admin operations.

## 6. Full-stack validation gate

Every full-stack feature must additionally pass all applicable areas below.

### Runtime/framework/dependencies

- frozen technology stack;
- supported versions;
- official documentation;
- reproducible install/build/start/test commands;
- lockfile consistency;
- dependency vulnerability review;
- minimal dependencies;
- environment-variable contract;
- secrets never committed or exposed to the browser.

### HTTP/API

- route ownership;
- methods/status codes/content types;
- request/response schemas;
- server-side input validation and size limits;
- output encoding;
- pagination/filter/sort contracts;
- idempotency where required;
- rate limits where required;
- CORS;
- CSRF protection where applicable;
- cache-control;
- generic safe errors;
- no sensitive implementation leakage.

### Authentication/session

- registration/verification/sign-in/sign-out;
- failed-attempt policy;
- password reset/recovery;
- approved password rules;
- password hashing;
- session fixation defense and rotation;
- secure expiration/invalidation;
- reauthentication for sensitive actions;
- secure cookie attributes when cookies are used;
- no auth secrets stored in browser storage.

### Authorization

- deny by default;
- server-side checks on every protected operation;
- object-level ownership;
- role/permission enforcement;
- tenant isolation where applicable;
- Super Admin protections;
- no UI-only authorization assumption.

### Database

- documented schema;
- keys/constraints/uniqueness/indexes;
- nullable/required decisions;
- migrations;
- parameterized queries or safe ORM equivalents;
- transactions;
- concurrency/race handling;
- idempotency;
- deletion/retention strategy;
- audit history where required;
- backup/restore validation.

### File/media

- allowlisted types;
- content validation;
- size limits;
- generated filenames;
- traversal prevention;
- safe storage;
- authorization;
- malware/CDR strategy where applicable;
- download authorization;
- MIME handling;
- media streaming/range behavior where applicable.

### Payments/financial operations

Where applicable:

- official provider APIs/SDKs;
- no raw card storage;
- server-authoritative amount calculations;
- webhook signature verification;
- replay/idempotency controls;
- taxes/discounts/credits/gift cards;
- refunds/cancellations;
- settlements/payouts/ledger/reconciliation;
- audit logs;
- retry/error behavior.

### Browser/security headers

As applicable:

- HTTPS/HSTS;
- Content Security Policy;
- anti-clickjacking/frame policy;
- MIME sniffing defense;
- referrer policy;
- permissions policy;
- secure cookies;
- safe cross-origin policy.

### Observability/operations

- structured logs;
- sensitive-data redaction;
- security-event logging;
- request/correlation IDs;
- metrics/traces where appropriate;
- health/readiness;
- alerting/error reporting;
- backup/restore;
- deployment and rollback strategy.

## 7. Accessibility gate

Target: **WCAG 2.2 AA**.

Validate, where applicable:

- semantics and accessible names;
- name/role/value;
- keyboard operation and no keyboard traps;
- logical focus order;
- visible focus;
- focus not obscured;
- skip/bypass mechanisms;
- headings, labels, instructions and errors;
- link purpose/current-page state;
- status messages;
- color and non-text contrast;
- resize text, reflow and text spacing;
- content on hover/focus;
- reduced motion;
- dragging alternatives;
- target size minimum;
- accessible authentication;
- captions/transcripts/audio-description requirements;
- keyboard-only, touch-only, screen-reader and zoom testing.

Automated accessibility testing supplements but never replaces manual testing.

## 8. SEO / metadata / PWA gate

Validate all applicable public-page requirements:

- title;
- description;
- canonical;
- favicon/icons;
- Open Graph/social metadata;
- real social image assets;
- robots/sitemap ownership;
- accurate structured data;
- redirects and 404 behavior;
- manifest and installability only when approved;
- service-worker scope and update lifecycle;
- deliberate cache strategy/versioning;
- offline fallback only when approved;
- never cache sensitive/private data;
- correct canonical production URLs.

## 9. Performance gate

Validate all applicable:

- image dimensions/formats/responsive sources;
- lazy loading where appropriate;
- font loading;
- script/module loading;
- render-blocking work;
- request count/caching;
- Core Web Vitals targets (LCP, INP, CLS);
- layout stability;
- interaction responsiveness;
- media loading;
- large-list/table behavior;
- memory leaks;
- frontend bundle/dependency cost.

Performance changes may never break accessibility, semantics, security, or approved visuals.

## 10. Platform-wide audit scope

Every platform receives its own senior requirements/architecture/source audit:

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

For each platform validate:

- standalone HTML/CSS/JS edition;
- participation in the integrated HTML/CSS/JS enterprise;
- full-stack implementation/module;
- cross-platform routes/contracts;
- shared navigation/footer/branding;
- account/auth implications;
- data/API/event implications;
- accessibility, responsiveness, security, privacy, SEO, performance and regression behavior.

## 11. Canonical validated-code storage

Validated code must never live only in chat.

Store validation governance under:

```text
PROJECT_DOCUMENTATION/
└── validation/
    ├── RTBO_MASTER_VALIDATED_CODE_RULE.md
    ├── RTBO_VALIDATED_CODE_REGISTRY.json
    ├── RTBO_PROJECT_WIDE_VALIDATION_MATRIX.md
    ├── RTBO_TEACHING_PROTOCOL.md
    ├── manifests/
    └── snapshots/
```

The actual repository source file is the canonical editable source. The registry records the exact validated state.

Every validated source entry must record:

- platform;
- edition;
- feature/slice;
- repository path;
- source commit SHA;
- SHA-256 content hash when source bytes are available to the validator;
- dependencies;
- requirements/architecture references;
- standards references;
- automated test evidence;
- manual test evidence;
- browser/accessibility/security evidence as applicable;
- validation date;
- status;
- superseded-by relationship when applicable.

Allowed statuses:

```text
NOT_STARTED
DRAFT
REVIEW_REQUIRED
REVALIDATION_REQUIRED
FAILED
VALIDATED
LOCKED
SUPERSEDED
```

Only `VALIDATED` or `LOCKED` code may be taught as approved code. `LOCKED` means the applicable regression gate has also passed and no unresolved dependency exists.

## 12. Change invalidation rule

Any change to a validated file invalidates that file's current hash. The affected file and every dependent registry entry return to `REVALIDATION_REQUIRED` until regression validation passes.

Examples:

- changing a design token revalidates every consumer whose behavior can change;
- changing a route revalidates navigation, footer, CTAs, sitemap, canonicals and route registry;
- changing shared navigation revalidates desktop/mobile/account behavior on every page using it;
- changing an API schema revalidates client, server, tests, database/service consumers and documentation;
- changing authentication revalidates every protected feature.

## 13. Teaching rule — validated component blocks

Teaching no longer defaults to one line at a time.

After a complete implementation has already passed validation, teach it in **logical validated blocks** sized around one coherent concept.

Examples:

- complete production `<head>` metadata block;
- complete accessible navigation item + disclosure block;
- complete CSS rule group/component;
- complete JavaScript behavior/module;
- complete form component plus validation/error behavior;
- complete API route + schema + service transaction;
- complete database migration/model change.

Each teaching block must include:

1. exact file and repository path;
2. exact insertion/addition location;
3. what is being added;
4. why it is required;
5. what uses it;
6. complete already-validated code block;
7. beginner explanation of the important lines/concepts;
8. dependencies;
9. applicable standards/project references;
10. exact verification step and expected result.

Use smaller blocks only when a concept is unusually complex or the user explicitly requests smaller steps.

Never tell the user to replace code they have not changed. Use additive instructions unless correcting an actual existing error. For actual corrections, give the exact current code and exact replacement. If no corrections are required, say exactly:

**No corrections are required.**

## 14. No retroactive trust

Because prior work revealed omissions such as incomplete metadata/favicon handling and an unsynchronized disclosure state, previously labeled code is not automatically carried forward as validated.

Existing source must be re-audited against this rule and entered into the registry with fresh evidence.

## 15. Completion rule

The project-wide validation program is complete only when every required platform/edition/feature has a registry entry and every production-required entry is `LOCKED`, with no unresolved cross-platform regression or security dependency.

Until then, code delivery proceeds only from individual `VALIDATED`/`LOCKED` registry entries; nothing else is represented as approved production code.
