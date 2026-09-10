# RTBO ULTIMATE VALIDATED CODE RULE — CURRENT

**Project:** Raising The Bar Officiating ecosystem  
**Status:** MANDATORY — NO EXCEPTIONS  
**Canonical repository:** `mrbballref/rtbofficiating.com-project`  
**Controlling branch while validation is in progress:** `chatgpt/validated-code-governance`  
**Applies to:** every standalone HTML/CSS/JS platform, the integrated HTML/CSS/JS enterprise, every full-stack platform/module, the integrated full-stack enterprise, shared libraries, Master CMS + Super Admin, deployment/runtime contracts, tests, and project documentation.

## 1. Absolute pre-validation rule

No implementation code may be taught, handed to the user for manual typing, represented as approved, or treated as canonical until the complete project implementation has been designed, validated, registered, and locked.

Validation must happen **before teaching**. The assistant must not discover missing metadata, favicon references, routes, accessibility states, CSS, JavaScript, backend logic, schemas, security controls, error states, tests, or downstream dependencies after earlier code has already been given to the user.

The assistant must first understand and validate the finished system, then teach from that already-validated source.

## 2. Entire-project scope

The rule applies to all required implementations of:

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
12. the integrated HTML/CSS/JS enterprise
13. the integrated full-stack enterprise
14. shared browser/core modules
15. shared server modules and APIs
16. shared authentication, authorization, data, payments, messaging, notification, media, consent/privacy, observability, deployment, backup, and recovery systems.

## 3. All prior approved RTBO rules remain mandatory

This rule adds to all existing user-approved RTBO rules; it does not replace them.

Mandatory examples include:

- requirements and standards before architecture;
- architecture before routes/information architecture;
- routes/information architecture before design system/filesystem/code;
- standalone platforms first, then integrated HTML/CSS/JS, then full-stack;
- semantic HTML;
- modern CSS with cascade layers, custom properties, low specificity, logical properties where appropriate, and no unjustified `!important`;
- modern ES-module JavaScript and `addEventListener()`;
- progressive enhancement;
- WCAG 2.2 AA;
- no dummy code, fake routes, `href="#"`, invented assets, invented credentials, invented IDs, invented providers, or fake secure behavior;
- HTTP/HTTPS browser testing for ES modules;
- static HTML/CSS/JS must never pretend to provide authoritative authentication, authorization, payments, private data, secure uploads, memberships, payroll, assignments, notifications, messaging, or Super Admin authority;
- cumulative checkpoint files remain literal cumulative continuations;
- use the canonical domain family based on `https://rtbofficiating.com/`;
- never introduce `raisingthebarofficiating.com`;
- `The Save`, `Arkansas Baptist College Classic`, and `Arkansas Sports Hall of Fame` remain excluded unless the user explicitly reverses those decisions;
- preserve exact user-approved assets, names, routes, platform behavior, navigation, design, content, and integration requirements.

## 4. Mandatory reference hierarchy

Every implementation decision and every validation record must be checked in this order:

1. user's latest explicit requirement;
2. latest controlling section of the cumulative checkpoint;
3. current master ecosystem architecture/specification;
4. current platform-specific requirements freeze/audit;
5. current route inventory;
6. current UI/UX information architecture;
7. current design-system specification;
8. current target file/folder tree;
9. exact feature/page/module contract;
10. approved assets/content;
11. current cross-platform integration contracts;
12. actual current source files;
13. current runtime/test evidence;
14. external standards and official technology documentation.

Later approved requirements override earlier historical requirements. Earlier history remains preserved but cannot silently control current implementation.

## 5. Mandatory external references

### Browser/static implementation

- MDN / Mozilla current HTML, CSS, JavaScript and Web API documentation;
- WHATWG HTML Living Standard;
- W3C/WAI/WCAG 2.2 AA;
- WAI-ARIA Authoring Practices when ARIA is genuinely required;
- W3Schools as beginner-support material only, never as authority over MDN/WHATWG/W3C;
- web.dev for performance, Core Web Vitals and PWA/service-worker guidance;
- current browser support data where compatibility materially affects implementation.

### Full-stack implementation

- current OWASP ASVS baseline and OWASP Cheat Sheet Series;
- current official documentation for every frozen runtime, framework, database, ORM/query layer, authentication/session library/provider, payment provider, email/notification provider, storage/media provider, test framework, build tool, hosting/deployment platform, logging/observability tool, and CI/CD system.

No full-stack dependency or provider may be guessed merely to proceed. The architecture must freeze the stack first.

## 6. Mandatory validation pipeline

Every applicable source unit must pass this pipeline before it can be locked:

```text
requirements reconciliation
→ architecture reconciliation
→ route/data/interaction contract validation
→ design-system validation
→ filesystem/module ownership validation
→ complete downstream dependency design
→ source implementation in validation workspace
→ static syntax/type/lint validation
→ browser/runtime validation
→ accessibility validation
→ responsive/reflow/zoom validation
→ security/privacy validation
→ SEO/metadata/PWA validation
→ performance validation
→ integration validation
→ regression validation
→ automated + manual test evidence
→ content hash + source commit identification
→ registry entry = VALIDATED
→ dependency/regression lock
→ registry entry = LOCKED
```

If a defect is found in a shared system, the entire affected shared system and every dependent consumer must be re-audited before a correction is issued.

## 7. HTML validation gate

Validate every applicable item before the file can be locked:

- doctype and language;
- charset and viewport;
- unique production title;
- metadata description strategy;
- canonical URL strategy;
- favicon/icon links with real approved files;
- social/Open Graph metadata with real approved assets;
- structured data only when facts are verified;
- manifest link only when PWA contract is approved;
- semantic landmarks;
- heading hierarchy;
- native semantics before ARIA;
- link vs button correctness;
- real route targets;
- current-page state (`aria-current`) where applicable;
- form labels, instructions, errors, autocomplete and input purpose;
- disclosure/dialog/tab/accordion/media semantics where applicable;
- synchronization of `aria-expanded`, `hidden`, focus, and visual state;
- accessible names;
- unique IDs and valid ARIA ID references;
- valid nesting and parsing;
- accessible images/media/captions/transcripts;
- progressive-enhancement behavior.

## 8. CSS validation gate

Validate:

- approved cascade-layer order;
- import existence and ownership;
- design tokens;
- approved colors and contrast;
- approved Industry/Inter typography contracts where applicable;
- spacing, max widths and container behavior;
- layout geometry and centered-logo constraints;
- logical properties where useful;
- mobile/tablet/desktop breakpoints and the approved 1320px navigation handoff where applicable;
- reflow at 320 CSS px equivalent;
- 200%/400% zoom behavior as applicable;
- text-spacing override behavior;
- focus visible and focus-not-obscured behavior;
- target sizing;
- reduced motion;
- pointer/hover/focus/touch parity;
- no unintended horizontal overflow;
- stacking contexts and overlays;
- low specificity and maintainability;
- no unjustified `!important`;
- no CSS leakage across integrated platforms.

## 9. JavaScript validation gate

Validate:

- real ES-module imports/exports;
- no unresolved imports;
- DOM-query assumptions and null handling;
- `addEventListener()`;
- pointer/keyboard/touch parity;
- focus management;
- ARIA/visible-state synchronization;
- Escape behavior for disclosures/dialogs where required;
- progressive enhancement;
- no unnecessary globals;
- lifecycle/cleanup where applicable;
- async failure handling;
- loading/empty/error/success states;
- race/cancellation handling where applicable;
- history/navigation behavior;
- storage/privacy implications;
- no secrets in browser source;
- no fake secure behavior;
- no uncaught runtime errors in supported browsers.

## 10. Full-stack validation gate

Before any full-stack source can be validated, the full-stack architecture must freeze the exact stack and versions.

Then validate, as applicable:

### Runtime/dependencies
- reproducible install/build/start/test;
- lockfile consistency;
- supported runtime versions;
- minimal dependencies;
- vulnerability review;
- environment-variable contract;
- secrets excluded from source/client bundles.

### HTTP/API
- route ownership;
- methods/status codes/content types;
- request/response schemas;
- server-side validation and size limits;
- output encoding;
- pagination/filter/sort contracts;
- idempotency;
- rate limiting;
- CORS;
- CSRF where applicable;
- cache-control;
- safe generic errors;
- no sensitive implementation leakage.

### Authentication/session
- registration/verification/sign-in/sign-out;
- failed-attempt policy;
- password rules and password hashing;
- recovery/reset;
- session fixation prevention/rotation;
- secure expiration/invalidation;
- reauthentication for sensitive actions;
- secure cookies when cookies are used;
- no authentication secrets in browser storage.

### Authorization
- deny by default;
- server-side enforcement;
- object-level ownership;
- role/permission enforcement;
- tenant isolation where applicable;
- Super Admin protection;
- no UI-only authorization assumptions.

### Database
- schema documentation;
- keys/constraints/uniqueness/indexes;
- nullable/required decisions;
- migrations;
- safe parameterization/ORM behavior;
- transactions;
- concurrency/race handling;
- idempotency;
- deletion/retention;
- audit history;
- backup/restore validation.

### Files/media
- allowlisted types;
- content validation;
- size limits;
- generated safe names;
- traversal prevention;
- safe storage;
- authorization;
- download authorization;
- malware/CDR strategy where applicable;
- MIME handling;
- streaming/range behavior where applicable.

### Payments/financial operations
- official provider APIs/SDKs;
- no raw card storage;
- server-authoritative totals;
- verified webhooks;
- replay/idempotency controls;
- taxes/discounts/credits/gift cards;
- refunds/cancellations;
- payouts/settlements/ledger/reconciliation;
- audit logs;
- retry/error behavior.

### Security headers/transport
- HTTPS/HSTS;
- CSP;
- anti-clickjacking/frame rules;
- MIME-sniffing defense;
- referrer policy;
- permissions policy;
- secure cookies;
- safe cross-origin policy.

### Operations
- structured logs;
- sensitive-data redaction;
- security-event logging;
- request/correlation IDs;
- metrics/traces where appropriate;
- health/readiness;
- alerting/error reporting;
- backup/restore;
- deployment/rollback.

## 11. Accessibility gate

Target: WCAG 2.2 AA.

Validate applicable semantics, accessible names, keyboard operation, focus order, focus visibility, focus not obscured, bypass blocks, headings, labels, instructions, errors, status messages, color and non-text contrast, resize text, reflow, text spacing, hover/focus content, reduced motion, dragging alternatives, target-size minimums, accessible authentication, and media alternatives.

Automated accessibility testing supplements but never replaces manual keyboard, touch, screen-reader and zoom testing.

## 12. SEO / metadata / favicon / PWA gate

Validate applicable public-page requirements before lock:

- title;
- description;
- canonical URL;
- favicon/icons;
- approved social metadata;
- approved social image;
- robots/sitemap ownership;
- structured data accuracy;
- redirects/404 behavior;
- manifest/installability only when approved;
- service-worker scope/update strategy only when approved;
- deliberate cache versioning;
- offline fallback only when approved;
- never cache sensitive/private data;
- correct canonical RTBO production URLs.

## 13. Performance gate

Validate image dimensions/formats/responsive sources, lazy loading where appropriate, font loading, script/module loading, render-blocking work, caching, Core Web Vitals, layout stability, interaction responsiveness, media loading, large-list/table behavior, memory leaks and frontend dependency cost.

Performance changes may never break accessibility, security, semantics or approved visuals.

## 14. Canonical validated-code storage rule

Validated code must never exist only in chat or conversational memory.

The canonical source of truth is GitHub plus the registry under:

```text
PROJECT_DOCUMENTATION/validation/current/
```

Required governance artifacts:

- `RTBO_ULTIMATE_VALIDATED_CODE_RULE.md`
- `RTBO_ULTIMATE_VALIDATED_CODE_REGISTRY.json`
- `RTBO_ULTIMATE_PROJECT_VALIDATION_MATRIX.md`
- `RTBO_ULTIMATE_TEACHING_PROTOCOL.md`
- `RTBO_ULTIMATE_REFERENCE_BASELINE.md`
- platform validation manifests and evidence files as they are created.

Every validated source entry must record at minimum:

- platform;
- edition;
- feature/page/module;
- repository path;
- source commit SHA;
- content SHA-256 when available;
- dependencies;
- controlling project references;
- external standards references;
- automated test evidence;
- manual/browser evidence;
- accessibility evidence;
- security/privacy evidence as applicable;
- performance evidence;
- integration/regression evidence;
- validation date;
- status;
- superseded-by relationship when applicable.

## 15. Allowed validation statuses

```text
NOT_STARTED
CONTRACT_REVIEW
DESIGN_VALIDATED
SOURCE_DRAFT
SOURCE_REVIEW
RUNTIME_VERIFIED
VALIDATED
LOCKED
REVALIDATION_REQUIRED
FAILED
SUPERSEDED
```

Only `VALIDATED` or `LOCKED` source can become canonical source. No code is teachable until the complete project reaches `PROJECT_WIDE_LOCKED`.

## 16. Change invalidation rule

Any change to a validated file invalidates its recorded hash and moves the file plus materially affected dependents to `REVALIDATION_REQUIRED` until regression passes.

Examples include design tokens, routes, shared navigation, account/auth systems, API schemas, database schemas, payment contracts, consent/privacy behavior and shared media components.

## 17. Teaching rule

Teaching begins only after the project-wide registry says:

```text
project_wide_state = PROJECT_WIDE_LOCKED
teaching_freeze = false
```

Teaching no longer defaults to one line at a time.

Teach in **logical validated blocks**: complete coherent units that a beginner can understand and verify without fragmenting a working feature.

Typical units:

- complete production `<head>` block;
- complete navigation item/disclosure component;
- complete submenu;
- complete CSS component/rule group;
- complete JavaScript behavior/module;
- complete page section;
- complete form and validation behavior;
- complete API endpoint + schema + service transaction;
- complete database migration/model change;
- complete full-stack transaction.

Every teaching block must provide:

1. exact file/path;
2. exact insertion/addition location;
3. what the block creates;
4. why it is required;
5. what uses it;
6. the complete already-validated block;
7. beginner explanation by meaningful concepts rather than isolated characters;
8. dependencies;
9. applicable project and standards references;
10. exact verification procedure and expected result;
11. registry entry/status/hash proving it is the approved source.

Use smaller sub-blocks only when complexity or transcription risk requires it, or when the user explicitly requests it. The complete parent feature must already be validated before the first sub-block is taught.

Never tell the user to replace code they have not changed. Use additive instructions unless correcting an actual existing error. When correcting, identify the exact existing code and exact validated replacement. When no correction is required, say exactly: **No corrections are required.**

## 18. No retroactive trust

Any earlier code labeled complete, verified, passed or locked must be revalidated under this current rule before it becomes current canonical validated code.

Historical code may be used as reference input only after reconciliation against the latest project requirements.

## 19. Project-wide completion gate

The teaching freeze is lifted only after:

- every required standalone HTML/CSS/JS platform is locked;
- integrated HTML/CSS/JS is locked;
- the full-stack architecture is frozen;
- every required full-stack platform/module is locked;
- complete cross-platform regression passes;
- all registry hashes/evidence are recorded;
- there are no unresolved architecture, route, asset, accessibility, security, privacy, performance, dependency, content or integration blockers.

Only then may the registry state become:

```text
PROJECT_WIDE_LOCKED
```
