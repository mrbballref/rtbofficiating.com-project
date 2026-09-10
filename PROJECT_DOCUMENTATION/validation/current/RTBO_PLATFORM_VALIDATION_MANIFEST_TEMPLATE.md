# RTBO PLATFORM VALIDATION MANIFEST TEMPLATE

**Platform:** `<platform>`  
**Edition:** `<standalone_html_css_js | integrated_html_css_js | full_stack | integrated_full_stack>`  
**Status:** `<status>`  
**Evidence level:** `<E0-E8>`

## 1. Controlling requirements

- latest explicit user requirements:
- checkpoint sections:
- platform requirements freeze/audit:
- route inventory:
- UI/UX information architecture:
- design system:
- target filesystem/module tree:
- approved assets/content:
- integration contracts:

## 2. Source inventory

- repository root:
- source commit SHA:
- files/directories inspected:
- historical/superseded source excluded:
- missing source/assets:
- duplicate/competing implementations:
- placeholder/dummy/fake-secure findings:
- secret/private-data scan:

## 3. Complete implementation contract

List every page, section, component, state, route, interaction, data/API dependency, accessibility requirement, responsive requirement, error/loading/empty/success state, privacy/security implication and downstream dependency that must exist before source can be validated.

## 4. HTML/frontend document validation

- metadata/head:
- favicon/icons:
- canonical/social/structured data:
- landmarks/headings:
- links/buttons:
- forms:
- ARIA/native states:
- media alternatives:
- route/resource references:
- parsing/nesting/unique IDs:

## 5. CSS validation

- layers/imports:
- tokens/design system:
- typography:
- contrast:
- layout/max widths:
- breakpoints/reflow/zoom/text spacing:
- focus/targets/reduced motion:
- overflow/stacking:
- specificity/`!important` audit:
- integration leakage audit:

## 6. JavaScript validation

- modules/imports/exports:
- DOM assumptions/null handling:
- event handling:
- keyboard/pointer/touch/focus:
- ARIA/visible state synchronization:
- async/loading/error states:
- history/routes/storage/privacy:
- runtime console/network evidence:

## 7. Full-stack validation, when applicable

- frozen runtime/framework versions:
- dependencies/lockfile/vulnerability review:
- environment/secrets:
- HTTP/API schemas/status/errors/rate limits:
- authentication/session:
- authorization/object ownership/tenant isolation:
- database schema/migrations/constraints/transactions/concurrency:
- file/media security:
- payments/webhooks/idempotency/ledger/reconciliation:
- security headers/CORS/CSRF/CSP/TLS:
- logs/metrics/alerts/backups/rollback:

## 8. Accessibility evidence

- automated:
- keyboard:
- pointer/touch:
- focus:
- screen reader:
- zoom/reflow/text spacing:
- target size:
- media accessibility:

## 9. Responsive/browser/runtime evidence

- viewport matrix:
- supported browsers:
- HTTP runtime:
- resource status:
- console errors:
- overflow:
- interaction transitions:

## 10. SEO / metadata / PWA evidence

- title/description/canonical:
- favicon/icons/social image:
- robots/sitemap/structured data:
- manifest/service-worker/offline decision:
- sensitive-cache audit:

## 11. Performance evidence

- images/fonts/scripts:
- Core Web Vitals:
- layout stability:
- interaction responsiveness:
- media/network behavior:
- dependency/bundle cost:

## 12. Integration/regression evidence

- cross-platform routes:
- shared navigation/footer/account:
- CSS/JS collision audit:
- API/data dependencies:
- auth/payment/media interactions:
- complete regression suite:

## 13. Final evidence record

- content SHA-256:
- source commit SHA:
- automated-test artifacts:
- manual-test artifacts:
- validation date:
- validator notes:
- registry entry ID:
- final status:

A manifest may receive `VALIDATED` only at E7 and `LOCKED` only at E8.
