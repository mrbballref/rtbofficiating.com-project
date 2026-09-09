# RTBO ULTIMATE VALIDATED TEACHING PROTOCOL — CURRENT

**Status:** MANDATORY — NO EXCEPTIONS  
**Depends on:** `RTBO_ULTIMATE_VALIDATED_CODE_RULE.md`

## 1. Teaching freeze

No implementation code is taught while project-wide validation is incomplete.

Teaching starts only after the canonical current registry states:

```text
project_wide_state = PROJECT_WIDE_LOCKED
teaching_freeze = false
```

Before that point, source may be designed, implemented, tested, audited, validated and stored in GitHub, but it is not presented as teachable canonical code.

## 2. Default teaching unit: logical validated block

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

## 3. Block-size decision rule

Choose the largest block that remains understandable and safely typeable by a true beginner without hiding important dependencies.

Split a validated parent block only when one or more are true:

- it combines more than one major concept;
- it is unusually long or transcription-error-prone;
- a dependency must be verified before the next sub-block;
- separate browser/runtime checks materially improve learning;
- the user explicitly requests smaller steps.

Even when split, the complete parent feature and all downstream dependencies must already have passed validation before the first sub-block is taught.

## 4. Required teaching format

Every teaching block must include:

1. exact repository/file path;
2. exact insertion/addition location relative to code the user already has;
3. what the block creates;
4. why it is required;
5. what uses it;
6. complete validated code block;
7. beginner explanation by meaningful concepts/lines;
8. dependencies;
9. project references;
10. external standards/official documentation references;
11. verification steps;
12. expected result;
13. registry entry ID/status/content hash/source commit proving the block is canonical.

## 5. Additive instruction rule

Never tell the user to replace code they have not changed.

Use additive instructions whenever possible:

- locate this existing element/block;
- insert immediately after it;
- insert immediately before it;
- insert inside it;
- add this complete validated block.

Use **replace** only to correct code the user actually has and that differs from the canonical validated source.

## 6. Review/correction rule during teaching

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

## 7. No unresolved teaching content

Never teach code containing guessed or unresolved routes, metadata values, favicon/icon/social-image paths, font paths/URLs, API endpoints, IDs/configuration, environment settings, payment/auth settings, database/provider details, dummy content where approved content is required, or placeholder assets where real approved assets are required.

Unresolved items block validation and therefore block teaching.

## 8. Static vs full-stack teaching boundary

### HTML/CSS/JS

Clearly distinguish representational/public UI from authoritative secure behavior. Static source may demonstrate interface states but must not pretend to securely authenticate, authorize, process payments, store private data, enforce memberships, protect uploads, process payroll, administer assignments, or perform Super Admin operations.

### Full-stack

Teach each secure feature as a coherent contract that includes the relevant frontend, server validation, authorization, persistence, errors, tests and operational behavior. Do not teach insecure partial slices that can be mistaken for a complete secure implementation.

## 9. Learning verification

After each logical block, use a concrete verification procedure appropriate to the block: DOM/attribute inspection, local HTTP runtime, Network/Console inspection, keyboard/pointer/touch interaction, zoom/reflow/text-spacing checks, screen-reader/accessibility checks, automated tests/lint/type checks, API/database tests, and security/regression checks as applicable.

Do not claim completion from visual appearance alone.

## 10. Terminology

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
