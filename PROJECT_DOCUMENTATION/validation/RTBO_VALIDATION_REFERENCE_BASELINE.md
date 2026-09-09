# RTBO VALIDATION REFERENCE BASELINE

**Status:** MANDATORY  
**Purpose:** Define the minimum project and external references that every applicable validation record must cite.

## 1. RTBO project references

The latest controlling version of each applicable document must be consulted before code receives `VALIDATED` or `LOCKED` status.

### Global/project

- User's latest explicit requirements and exclusions
- `PROJECT_DOCUMENTATION/checkpoints/RTBO_RESTART_MASTER_CHECKPOINT_CURRENT.md`
- `PROJECT_DOCUMENTATION/architecture/RTBO_Master_Architecture.md`
- master ecosystem architecture/production specification, when separately present
- current platform-specific requirements/audit documents

### RTBO Core Website

- `PROJECT_DOCUMENTATION/architecture/RTBO_Core_Website_Requirements_Freeze.md`
- `PROJECT_DOCUMENTATION/architecture/RTBO_Core_Website_Complete_Route_Inventory.md`
- `PROJECT_DOCUMENTATION/architecture/RTBO_Core_Website_UI_UX_Information_Architecture.md`
- `PROJECT_DOCUMENTATION/architecture/RTBO_Core_Website_Design_System_Specification.md`
- `PROJECT_DOCUMENTATION/architecture/RTBO_Core_Website_Target_File_Folder_Tree.md`
- `PROJECT_DOCUMENTATION/architecture/RTBO_Core_Website_New_Implementation_Plan.md`

Equivalent platform-specific source-of-truth documents must be created/verified before validating each later platform.

## 2. HTML/CSS/JavaScript browser references

### MDN Web Docs

Primary implementation reference for HTML/CSS/JavaScript and browser APIs.

- https://developer.mozilla.org/
- Metadata/head guidance: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata
- HTML element reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements
- CSS reference: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference
- JavaScript reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
- Web APIs: https://developer.mozilla.org/en-US/docs/Web/API

### WHATWG HTML Standard

Normative HTML behavior/semantics reference:

- https://html.spec.whatwg.org/

Use the living standard for document metadata, link types, native elements, forms, hidden state, scripts/modules, media and browser behavior.

### W3Schools

Supplemental beginner-friendly explanation only. Never use it to override MDN, WHATWG or W3C/WAI.

- https://www.w3schools.com/

## 3. Accessibility references

### WCAG 2.2

Target: **WCAG 2.2 Level AA**.

- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/standards-guidelines/wcag/
- What's new in 2.2: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/

Mandatory review includes applicable requirements for keyboard access, focus order, focus visibility, focus not obscured, reflow, resize text, text spacing, target size, content on hover/focus, error identification, status messages and accessible authentication.

### WAI-ARIA Authoring Practices

- https://www.w3.org/WAI/ARIA/apg/

Use native HTML first. ARIA is applied only when required.

For ordinary expandable site navigation with top-level links, use the disclosure-navigation pattern rather than `menu`/`menubar` semantics unless a true application-menu contract is deliberately required:

- https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
- https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation-hybrid/

APG examples are educational examples, not code to copy blindly into production. Production implementations require browser/assistive-technology testing.

## 4. Security references

### OWASP ASVS

Full-stack baseline: **OWASP ASVS 5.0.0** (current stable baseline at establishment of this document).

- https://owasp.org/www-project-application-security-verification-standard/

Validation reports should use version-qualified ASVS requirement identifiers when individual requirements are cited.

### OWASP Cheat Sheet Series

- https://cheatsheetseries.owasp.org/

Applicable sheets include, as needed:

- Authentication
- Session Management
- Authorization
- Password Storage
- Forgot Password
- Input Validation
- Cross-Site Request Forgery Prevention
- Cross Site Scripting Prevention
- Content Security Policy
- REST Security
- File Upload
- Logging
- Secrets Management
- Transport Layer Security
- SQL Injection Prevention
- Transaction Authorization
- Multifactor Authentication
- Error Handling

Security is server-authoritative. Client-side validation never substitutes for server-side security.

## 5. Performance/PWA references

### web.dev

- https://web.dev/performance/
- https://web.dev/articles/vitals
- https://web.dev/learn/pwa/

Current Core Web Vitals baseline:

- LCP: target <= 2.5 seconds at the 75th percentile
- INP: target <= 200 ms at the 75th percentile
- CLS: target <= 0.1 at the 75th percentile

Service workers are progressive enhancement and must not be required for core first-load behavior. Cache design must be deliberate and must not cache sensitive/private data.

## 6. UI/UX references

### USWDS

Use as an accessibility/design implementation reference where relevant:

- https://designsystem.digital.gov/

### Nielsen Norman Group

Use for applicable usability/interaction research where it does not conflict with project requirements or accessibility standards:

- https://www.nngroup.com/

## 7. Full-stack official-documentation rule

The selected full-stack technology stack is currently **not allowed to be guessed**.

Before full-stack source validation begins, architecture must explicitly freeze:

- runtime/language and supported version;
- server framework;
- frontend architecture if different from static source;
- database;
- ORM/query layer if used;
- migration system;
- authentication/session implementation;
- object/media storage;
- payment provider(s);
- email/notification provider(s);
- test framework(s);
- build tooling;
- hosting/deployment target;
- observability stack;
- CI/CD strategy.

After those decisions are approved, the current official documentation for every selected technology becomes mandatory in addition to OWASP.

## 8. Reference freshness rule

Before validating a code block, verify that any external reference whose behavior/version can change is still current. Do not rely on an old cached assumption for:

- frameworks/runtimes;
- package/library APIs;
- browser platform changes;
- security standards;
- payment/auth provider APIs;
- PWA/installability rules;
- performance metrics;
- deployment/provider configuration.

Record the reference/version/date in validation evidence when material.

## 9. Conflict rule

If references conflict:

1. latest explicit user requirement controls project intent;
2. normative standards control conformance behavior;
3. latest controlling project architecture controls project structure;
4. official technology/provider documentation controls selected technology behavior;
5. MDN is preferred for practical browser guidance;
6. W3Schools remains supplemental only.

Do not resolve a material conflict by guessing. Mark the affected source `REVIEW_REQUIRED` until the contract is resolved.
