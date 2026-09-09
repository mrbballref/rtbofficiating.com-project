# RTBO Ultimate Validation — Current Package

This folder is the **only controlling validation package** for the current project-wide validation program.

## Controlling files

- `RTBO_ULTIMATE_VALIDATED_CODE_RULE.md` — mandatory pre-validation/code-storage rule
- `RTBO_ULTIMATE_VALIDATED_CODE_REGISTRY.json` — canonical validation state and future source hashes/evidence
- `RTBO_ULTIMATE_PROJECT_VALIDATION_MATRIX.md` — every platform/edition/gate
- `RTBO_ULTIMATE_TEACHING_PROTOCOL.md` — how canonical code will be taught after project lock
- `RTBO_ULTIMATE_REFERENCE_BASELINE.md` — mandatory project/external reference hierarchy
- `RTBO_CURRENT_SOURCE_OF_TRUTH_MANIFEST.md` — current controlling requirements/routes/design/history conflict rules
- `RTBO_CURRENT_SOURCE_INGESTION_STATUS.md` — factual current source availability and no-false-pass guard
- `RTBO_LINE_BY_LINE_VALIDATION_PROOF_STANDARD.md` — mandatory 100% physical-line accounting, per-file proof ledgers, hash matching, and user-visible validation evidence

## Mandatory proof principle

A source file is not validated merely because it compiles, renders, or passes tests. Every physical source line must be accounted for in a current line-validation ledger tied to the exact source commit/blob/content hash. A file is ineligible for `VALIDATED` or `LOCKED` unless line accounting is exactly 100.00%, with zero unclassified, failed, or unresolved lines.

## Current state

```text
PROJECT_WIDE_LOCKED = false
TEACHING_FREEZE = true
```

No implementation code may be taught as canonical until the complete project-wide validation program is finished and locked.
