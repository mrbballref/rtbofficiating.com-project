# RTBO ULTIMATE VALIDATION REFERENCE BASELINE — CURRENT

**Status:** MANDATORY — NO EXCEPTIONS  
**Verified baseline date:** 2026-09-08  
**Depends on:** `RTBO_ULTIMATE_VALIDATED_CODE_RULE.md`

## 1. Project references — mandatory order

Before code receives `VALIDATED` or `LOCKED`, consult the latest controlling version of every applicable project source:

1. user's latest explicit requirement;
2. current cumulative checkpoint: `PROJECT_DOCUMENTATION/checkpoints/RTBO_RESTART_MASTER_CHECKPOINT_CURRENT.md`;
3. `PROJECT_DOCUMENTATION/architecture/RTBO_Master_Architecture.md`;
4. platform-specific requirements freeze/audit;
5. route inventory;
6. UI/UX information architecture;
7. design-system specification;
8. target file/folder tree;
9. implementation plan / exact feature contract;
10. approved assets/content;
11. cross-platform contracts;
12. actual source;
13. current runtime/test evidence.

For RTBO Core Website specifically, the required architecture set includes:

- `RTBO_Core_Website_Requirements_Freeze.md`
- `RTBO_Core_Website_Complete_Route_Inventory.md`
- `RTBO_Core_Website_UI_UX_Information_Architecture.md`
- `RTBO_Core_Website_Design_System_Specification.md`
- `RTBO_Core_Website_Target_File_Folder_Tree.md`
- `RTBO_Core_Website_New_Implementation_Plan.md`

Equivalent platform-specific source-of-truth documents must be reconciled before validating every other platform.

## 2. Current browser/web standards baseline

### MDN / Mozilla

Primary practical browser implementation reference:

- https://developer.mozilla.org/
- HTML: https://developer.mozilla.org/en-US/docs/Web/HTML
- CSS: https://developer.mozilla.org/en-US/docs/Web/CSS
- JavaScript: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- Web APIs: https://developer.mozilla.org/en-US/docs/Web/API
- Metadata/head: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata

Metadata validation must explicitly check title, description strategy, favicon/icon references, styles/scripts, canonical strategy, social metadata ownership and manifest/PWA dependency.

### WHATWG HTML Living Standard

Normative HTML behavior and semantics:

- https://html.spec.whatwg.org/

Current validation must use the living standard for native semantics, document metadata, link types including `canonical`, `icon`, and `manifest`, forms, buttons, disclosure-supporting native states, media, scripts/modules and parsing behavior.

### W3Schools

Supplemental beginner-teaching reference only:

- https://www.w3schools.com/

It may clarify syntax for a beginner but cannot override MDN, WHATWG, W3C/WAI or project architecture.

## 3. Accessibility baseline

### WCAG 2.2

Target: **WCAG 2.2 Level AA**.

Official W3C sources:

- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/standards-guidelines/wcag/

At this baseline date, W3C continues to recommend WCAG 2.2 as the latest WCAG 2 version. Mandatory review includes all applicable AA requirements, including Focus Not Obscured (Minimum), Dragging Movements, Target Size (Minimum), Consistent Help, Redundant Entry and Accessible Authentication.

### WAI-ARIA Authoring Practices

- https://www.w3.org/WAI/ARIA/apg/

Native HTML first. Use ARIA only when needed. Ordinary site navigation with expandable subnavigation should use a disclosure pattern rather than application `menu`/`menubar` semantics unless a true application-menu contract is deliberately required.

## 4. Security baseline

### OWASP ASVS

Current stable baseline verified on 2026-09-08: **OWASP ASVS 5.0.0**.

- https://owasp.org/www-project-application-security-verification-standard/

Use version-qualified requirement references where individual ASVS controls are recorded.

### OWASP Cheat Sheet Series

- https://cheatsheetseries.owasp.org/

Use applicable current guidance for authentication, session management, authorization, password storage, forgot-password flows, input validation, CSRF, XSS, CSP, REST security, file upload, logging, secrets, TLS, SQL injection prevention, transaction authorization, MFA and safe error handling.

Client-side validation never substitutes for server-side validation/security.

## 5. Performance and PWA baseline

Use current web.dev guidance:

- https://web.dev/performance/
- https://web.dev/articles/vitals
- https://web.dev/learn/pwa/

Measure real implementation behavior. Do not add a service worker, manifest capability or caching strategy merely because PWA files exist; the PWA contract must be approved and cache behavior must avoid private/sensitive data.

## 6. Usability/design implementation references

Where applicable and non-conflicting:

- USWDS: https://designsystem.digital.gov/
- Nielsen Norman Group: https://www.nngroup.com/

These supplement, not override, user-approved design and accessibility requirements.

## 7. Full-stack official-documentation rule

The full-stack technology stack may not be guessed.

Architecture must first freeze:

- runtime/language + supported version;
- server framework;
- frontend architecture if applicable;
- database;
- ORM/query layer;
- migration system;
- authentication/session implementation;
- authorization model;
- object/media storage;
- payment providers;
- email/notification providers;
- test frameworks;
- build tooling;
- hosting/deployment;
- observability;
- CI/CD;
- backup/recovery strategy.

After those selections are approved, the **current official documentation for each selected technology** becomes mandatory validation evidence.

## 8. Freshness rule

Before validating any code whose correctness depends on changing external behavior, re-check the current official source. This includes frameworks, runtimes, packages, browser APIs, security standards, payment/auth provider APIs, PWA/installability rules, performance metrics, deployment settings and provider requirements.

Record material versions/dates in validation evidence.

## 9. Conflict resolution

If references conflict:

1. latest explicit user requirement controls project intent;
2. normative standards control conformance;
3. latest controlling project architecture controls project structure;
4. official selected-technology documentation controls its runtime behavior;
5. MDN is preferred for practical browser implementation guidance;
6. W3Schools remains supplemental only.

Never resolve a material conflict by guessing. Mark the affected implementation `CONTRACT_REVIEW` or `REVALIDATION_REQUIRED` until the conflict is resolved.
