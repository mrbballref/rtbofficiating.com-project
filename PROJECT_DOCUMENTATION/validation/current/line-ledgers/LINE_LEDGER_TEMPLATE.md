# RTBO SOURCE LINE VALIDATION LEDGER

**Platform:** `<platform>`  
**Edition:** `<standalone_html_css_js | integrated_html_css_js | full_stack>`  
**Feature/Slice:** `<feature>`  
**Repository Path:** `<source path>`  
**Source Commit SHA:** `<commit sha>`  
**Git Blob SHA:** `<blob sha>`  
**SHA-256:** `<sha256>`  
**Validation Date:** `<YYYY-MM-DD>`  
**Status:** `<REVIEW_REQUIRED | VALIDATED | LOCKED>`

## File accounting

```text
TOTAL PHYSICAL LINES: <n>
CODE_VALIDATED LINES: <n>
COMMENT_VALIDATED LINES: <n>
BLANK_ACCOUNTED LINES: <n>
GENERATED_VERIFIED LINES: <n>
VENDOR_VERIFIED LINES: <n>
UNCLASSIFIED LINES: <n>
FAILED LINES: <n>
UNRESOLVED LINES: <n>
LINE ACCOUNTING COVERAGE: <percent>
```

## Line/range coverage map

| Lines | Classification | Requirement/feature | Standards/checks | Test/evidence IDs | Result |
|---|---|---|---|---|---|
| `<start-end>` | `CODE_VALIDATED` | `<requirement>` | `<references/checks>` | `<evidence>` | `PASS` |

## Automated evidence

- `<command/check>` — `<result>`

## Manual evidence

- `<interaction/review>` — `<result>`

## Dependency/regression evidence

- `<dependency>` — `<result>`

## File attestation

```text
SOURCE HASH MATCH: <PASS|FAIL>
TOTAL PHYSICAL LINES: <n>
ACCOUNTED PHYSICAL LINES: <n>
UNCLASSIFIED LINES: <n>
FAILED LINES: <n>
UNRESOLVED LINES: <n>
LINE ACCOUNTING COVERAGE: <percent>
FILE VALIDATION STATUS: <VALIDATED|LOCKED|FAILED>
```

A file cannot be `VALIDATED` or `LOCKED` unless source hash match is PASS, line accounting is exactly 100.00%, and unclassified/failed/unresolved lines are all zero.
