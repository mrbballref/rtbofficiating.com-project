# RTBO ULTIMATE VALIDATED TEACHING PROTOCOL — CURRENT

**Status:** MANDATORY — NO EXCEPTIONS  
**Depends on:** `RTBO_ULTIMATE_VALIDATED_CODE_RULE.md`, `RTBO_PROJECT_WIDE_COMPLETE_BEFORE_TEACHING_RULE.md`

## 1. Teaching freeze

No implementation code is taught while project-wide validation is incomplete.

Teaching starts only after the canonical current registry states:

```text
project_wide_state = PROJECT_WIDE_LOCKED
teaching_freeze = false
```

Before that point, source may be designed, implemented, tested, audited, validated and stored in GitHub, but it is not presented as teachable canonical code.

## 2. Instructional model

Teaching must use a structured online-course method informed by current successful web-development programs such as Coursera, Udemy, and Zero To Mastery, while preserving every RTBO-specific beginner, validation, additive-instruction, checkpoint, and standards rule.

The RTBO teaching model is:

```text
COURSE ORIENTATION
→ LEARNING OBJECTIVES
→ CONCEPT LESSON
→ GUIDED CODE-ALONG
→ EXPLAIN THE COMPLETE VALIDATED BLOCK
→ HANDS-ON LAB
→ KNOWLEDGE CHECK
→ DEBUGGING / DEVTOOLS CHECKPOINT
→ MINI PROJECT OR FEATURE MILESTONE
→ REVIEW + REFACTOR LESSON
→ MODULE ASSESSMENT
→ PLATFORM CAPSTONE
→ INTEGRATION CAPSTONE
→ FULL-STACK CAPSTONE
```

This combines Coursera-style modules, readings, labs, assignments, assessments and final projects; Udemy-style guided lectures, coding exercises, code-alongs and project-based practice; and Zero To Mastery-style step-by-step progression, real-world projects, best-practice/code-quality emphasis, debugging/testing practice and portfolio-grade capstones.

The instructional model is used only after the entire project is locked. It never changes the canonical source being taught.

## 3. Curriculum progression

The user is taught from foundational concepts toward production integration.

### HTML/CSS/JS curriculum phases

1. development environment, project architecture, HTTP local server, Git/GitHub and browser DevTools;
2. semantic HTML and complete production document metadata;
3. accessibility foundations and semantic interaction patterns;
4. CSS cascade, cascade layers, tokens, typography and logical properties;
5. responsive design, Flexbox/Grid, intrinsic sizing and breakpoint strategy;
6. navigation, disclosures, dialogs and mobile interaction patterns;
7. forms, native validation, accessible errors and progressive enhancement;
8. JavaScript fundamentals and ES modules;
9. DOM, events, state and progressive enhancement;
10. asynchronous/browser data patterns when applicable;
11. media, player controls and rich interfaces;
12. loading, empty, error, success and offline states;
13. SEO, social metadata, canonical URLs, favicon/icons and PWA decisions;
14. performance, testing, accessibility audits and regression;
15. complete RTBO standalone platform builds as capstones;
16. integrated HTML/CSS/JS enterprise capstone.

### Full-stack curriculum phases

1. full-stack architecture and the browser/server/database request lifecycle;
2. server/runtime/framework fundamentals for the exact frozen stack;
3. API design, request/response schemas and validation;
4. database modeling, migrations, indexes, constraints and transactions;
5. authentication and session lifecycle;
6. authorization, roles and least privilege;
7. secure forms, uploads, media and storage;
8. messaging, notifications and asynchronous workflows where applicable;
9. payments, webhooks, idempotency, settlements and ledger behavior where applicable;
10. application security and OWASP review;
11. testing: unit, integration, API and end-to-end;
12. observability, logging, failure handling and recovery;
13. deployment, secrets, backups and rollback;
14. complete RTBO full-stack platform modules as capstones;
15. integrated full-stack enterprise capstone.

## 4. Default teaching unit: logical validated block

Do not teach one line at a time by default.

Teach one coherent validated concept at a time. Examples:

- complete production `<head>` block;
- complete navigation/disclosure component;
- complete submenu;
- complete semantic section;
- complete CSS component or rule group;
- complete JavaScript behavior/module;
- complete form field group with validation/error behavior;
- complete media-player control group;
- complete API endpoint + request/response schema + service transaction;
- complete database migration/model change;
- complete secure full-stack workflow.

A teaching block is selected by conceptual completeness, not a fixed line count.

## 5. Lesson structure for every validated block

Each lesson must include:

1. **Lesson title** — one clear concept;
2. **Why this matters** — its practical purpose in RTBO;
3. **Learning objectives** — what the user should understand and be able to do afterward;
4. **Prerequisites** — previously mastered concepts/files;
5. **Concept lesson** — beginner-friendly theory before typing;
6. **Exact repository/file path**;
7. **Exact insertion/addition location relative to the user's existing code**;
8. **Complete validated code block**;
9. **Guided code-along** — meaningful groups of elements, attributes, rules, functions or transactions, not isolated characters;
10. **How the browser/server/database interprets it**;
11. **Dependencies and downstream relationships**;
12. **Project requirement/reference links**;
13. **Official standards/documentation references**;
14. **Hands-on lab** — a safe exercise that reinforces the concept without silently altering canonical source;
15. **DevTools/runtime verification**;
16. **Expected result**;
17. **Knowledge check** — short questions, prediction exercise or debugging challenge;
18. **Common mistakes** — especially mistakes relevant to this RTBO implementation;
19. **Mini milestone or project task** when appropriate;
20. **Checkpoint** — completed material and next module;
21. **Validation proof** — registry ID, source commit, file/content hash, line-ledger coverage and status.

## 6. Learning-by-doing requirements

The course must not become passive copying.

For each major topic, include appropriately scoped practice such as:

- predict what code will do before running it;
- inspect HTML/CSS/JS through DevTools;
- intentionally diagnose a safe broken example separate from canonical source;
- write a small practice component/module independently;
- explain the role of important attributes/properties/functions in the user's own words;
- compare expected and actual browser behavior;
- complete short quizzes/knowledge checks;
- complete feature milestones and platform capstones.

Practice work must remain separate from locked canonical production source unless the exercise itself is an explicitly validated production task.

## 7. Block-size decision rule

Choose the largest block that remains understandable and safely typeable by a true beginner without hiding important dependencies.

Split a validated parent block only when one or more are true:

- it combines more than one major concept;
- it is unusually long or transcription-error-prone;
- a dependency must be verified before the next sub-block;
- separate browser/runtime checks materially improve learning;
- the user explicitly requests smaller steps.

Even when split, the complete parent feature and all downstream dependencies must already have passed validation before the first sub-block is taught.

## 8. Additive instruction rule

Never tell the user to replace code they have not changed.

Use additive instructions whenever possible:

- locate this existing element/block;
- insert immediately after it;
- insert immediately before it;
- insert inside it;
- add this complete validated block.

Use **replace** only to correct code the user actually has and that differs from the canonical validated source.

## 9. Review/correction rule during teaching

When the user pastes their current code:

- compare the entire affected system to the canonical validated source, not only the most recently typed line;
- identify every discrepancy belonging to the affected validated block/system before issuing a correction;
- identify the exact file/path;
- use line numbers from the pasted version when practical;
- show the exact incorrect code;
- show the exact canonical replacement;
- explain what failed and why;
- state whether downstream blocks are affected.

If the pasted code matches the canonical validated source, say exactly:

**No corrections are required.**

## 10. No unresolved teaching content

Never teach code containing guessed or unresolved routes, metadata values, favicon/icon/social-image paths, font paths/URLs, API endpoints, IDs/configuration, environment settings, payment/auth settings, database/provider details, dummy content where approved content is required, or placeholder assets where real approved assets are required.

Unresolved items block validation and therefore block teaching.

## 11. Static vs full-stack teaching boundary

### HTML/CSS/JS

Clearly distinguish representational/public UI from authoritative secure behavior. Static source may demonstrate interface states but must not pretend to securely authenticate, authorize, process payments, store private data, enforce memberships, protect uploads, process payroll, administer assignments, or perform Super Admin operations.

### Full-stack

Teach each secure feature as a coherent contract that includes the relevant frontend, server validation, authorization, persistence, errors, tests and operational behavior. Do not teach insecure partial slices that can be mistaken for a complete secure implementation.

## 12. Learning verification

After each logical block, use concrete verification appropriate to the block: DOM/attribute inspection, local HTTP runtime, Network/Console inspection, keyboard/pointer/touch interaction, zoom/reflow/text-spacing checks, screen-reader/accessibility checks, automated tests/lint/type checks, API/database tests and security/regression checks as applicable.

Do not claim completion from visual appearance alone.

## 13. Module and capstone assessments

Every major module should end with an assessment appropriate to the material. Assessments may include:

- short quizzes;
- explain-the-code questions;
- debugging challenges;
- DevTools investigation;
- small independent coding tasks;
- code review exercises;
- accessibility or responsive-design audits.

Every standalone RTBO platform becomes a capstone case study during teaching because its complete source has already been validated. The integrated HTML/CSS/JS edition becomes the frontend enterprise capstone. The integrated full-stack edition becomes the final production capstone.

## 14. Teaching-source integrity

The exact code taught must be the exact source that was validated and locked.

Teaching explanations may reorganize concepts pedagogically, but must not alter, omit, simplify or improvise production source. Any genuine source defect discovered during teaching immediately changes the affected source/dependency status to `REVALIDATION_REQUIRED` and pauses teaching of that dependency until corrected and revalidated.

## 15. Terminology

Use status terms precisely:

- `NOT_STARTED`
- `CONTRACT_REVIEW`
- `DESIGN_VALIDATED`
- `SOURCE_DRAFT`
- `SOURCE_REVIEW`
- `RUNTIME_VERIFIED`
- `VALIDATED`
- `LOCKED`
- `REVALIDATION_REQUIRED`
- `FAILED`
- `SUPERSEDED`
- `PROJECT_WIDE_LOCKED`

Never call code complete, verified, approved or locked unless the registry supports that exact status.
