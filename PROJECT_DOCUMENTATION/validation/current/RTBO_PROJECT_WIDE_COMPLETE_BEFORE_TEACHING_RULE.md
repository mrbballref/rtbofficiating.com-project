# RTBO PROJECT-WIDE COMPLETE-BEFORE-TEACHING RULE — CURRENT

**Project:** Raising The Bar Officiating ecosystem  
**Status:** MANDATORY — NO EXCEPTIONS

## 1. Absolute teaching freeze

No canonical implementation code may be taught to the user until the entire RTBO ecosystem has been completely created, executed, validated, evidenced, and locked.

This freeze applies across:

1. all 11 standalone HTML/CSS/JS platforms;
2. the integrated HTML/CSS/JS enterprise;
3. the frozen full-stack architecture and exact technology/version set;
4. every full-stack platform/module;
5. the integrated full-stack enterprise;
6. final project-wide regression and deployment-readiness validation.

The teaching freeze is project-wide, not platform-by-platform. Completing and locking Platform 01 does not authorize teaching Platform 01 while Platforms 02–11 or either enterprise edition remain incomplete.

## 2. Mandatory build/validation sequence

```text
RECONCILE ALL PROJECT REQUIREMENTS + REFERENCES
→ FREEZE ALL PLATFORM CONTRACTS
→ BUILD ALL STANDALONE HTML/CSS/JS PLATFORMS INDIVIDUALLY
→ RUN + VALIDATE EACH STANDALONE PLATFORM
→ LOCK EACH STANDALONE PLATFORM
→ BUILD INTEGRATED HTML/CSS/JS ENTERPRISE
→ RUN + VALIDATE + LOCK INTEGRATED HTML/CSS/JS ENTERPRISE
→ FREEZE FULL-STACK ARCHITECTURE + EXACT VERSIONS
→ BUILD EACH FULL-STACK PLATFORM/MODULE INDIVIDUALLY
→ RUN + VALIDATE + LOCK EACH FULL-STACK PLATFORM/MODULE
→ BUILD INTEGRATED FULL-STACK ENTERPRISE
→ RUN + VALIDATE + LOCK INTEGRATED FULL-STACK ENTERPRISE
→ FINAL CROSS-PLATFORM / SECURITY / ACCESSIBILITY / PERFORMANCE / DATA-INTEGRITY / DEPLOYMENT REGRESSION
→ PROJECT_WIDE_LOCKED = true
→ TEACHING_FREEZE = false
```

## 3. Platforms included

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

## 4. Validation required for every applicable platform/edition

At minimum:

- complete requirement/reference reconciliation;
- complete source creation;
- 100% physical-line accounting;
- syntax/static analysis;
- route/resource integrity;
- browser/runtime execution;
- UI/UX reference comparison;
- desktop/tablet/mobile/responsive validation;
- keyboard/focus/screen-reader accessibility validation;
- WCAG 2.2 AA audit;
- metadata/canonical/favicon/social/PWA validation where applicable;
- loading/empty/error/success states;
- performance validation;
- privacy/consent boundaries;
- integration/regression testing;
- exact commit/blob/SHA-256 evidence.

Full-stack editions additionally require:

- frozen stack/provider versions;
- server/API validation;
- input/output schema validation;
- authentication/session validation;
- authorization/role validation;
- database schema/migration/index/constraint/transaction validation;
- CSRF/CORS/CSP/security-header review as applicable;
- upload/storage validation;
- payments/webhooks/ledger/idempotency validation where applicable;
- notification/messaging validation;
- audit logging and observability;
- backup/restore/rollback/deployment validation;
- OWASP validation against the frozen stack and current official documentation.

## 5. Approved references remain mandatory

All previously established user rules, screenshots, files, approved platform designs, live/reference websites, route inventories, architecture files, design-system requirements, historical approved behaviors, and later controlling corrections remain mandatory.

Later explicit user requirements override earlier conflicting historical references.

Permanent exclusions remain in force unless the user explicitly reverses them, including:

- The Save;
- Arkansas Baptist College Classic;
- Arkansas Sports Hall of Fame.

## 6. Deployment/replacement rule

The current public `rtbofficiating.com` implementation must not be removed, overwritten, or replaced during validation.

Replacement of the current public website may begin only after:

```text
PROJECT_WIDE_LOCKED = true
DEPLOYMENT_READINESS = PASS
USER_DEPLOYMENT_APPROVAL = explicit
```

The new project implementation must be deployed using a controlled migration/rollback plan rather than destructive replacement without recovery.

## 7. Permanent rule

```text
BUILD EVERYTHING FIRST.
VALIDATE EVERYTHING FIRST.
LOCK EVERYTHING FIRST.
TEACH ONLY AFTER THE ENTIRE PROJECT IS LOCKED.
DEPLOY ONLY AFTER THE USER EXPLICITLY APPROVES THE LOCKED BUILD.
```
