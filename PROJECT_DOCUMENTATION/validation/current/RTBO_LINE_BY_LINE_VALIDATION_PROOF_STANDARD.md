# RTBO LINE-BY-LINE VALIDATION PROOF STANDARD

**Status:** MANDATORY — NO EXCEPTIONS  
**Applies to:** Every source file in every standalone HTML/CSS/JS platform, the integrated HTML/CSS/JS enterprise, every full-stack platform/module, and the integrated full-stack enterprise.

## 1. Purpose

The user must be able to verify that every line of teachable source code was covered by the validation program. Trust is not sufficient; the proof must be auditable in GitHub.

## 2. Required proof for every validated source file

Every source file that is eligible for `VALIDATED` or `LOCKED` status must have a corresponding line-validation ledger stored under:

```text
PROJECT_DOCUMENTATION/validation/current/line-ledgers/
```

The ledger must identify the exact source file by:

- repository path;
- source commit SHA;
- Git blob SHA;
- SHA-256 content hash;
- total line count;
- executable/code line count where applicable;
- comment/documentation line count;
- generated/vendor line count, if any;
- validation date;
- validation status.

A ledger is invalid if the source hash changes.

## 3. Line coverage requirement

Every physical line in a validated source file must be accounted for by one and only one of these classifications:

- `CODE_VALIDATED` — source line reviewed and covered by applicable validation rules/tests;
- `COMMENT_VALIDATED` — comment/documentation line reviewed for accuracy and non-conflict;
- `BLANK_ACCOUNTED` — blank line intentionally present and structurally harmless;
- `GENERATED_VERIFIED` — generated source whose generator/version/output integrity was validated;
- `VENDOR_VERIFIED` — third-party/vendor source not manually authored, validated through exact package/version/integrity/dependency review and excluded from user-authored line claims.

No physical line may remain unclassified.

## 4. Coverage map

Each ledger must provide ranges such as:

```text
Lines 1-12   CODE_VALIDATED  HTML document metadata/entry-point gate
Lines 13-14  BLANK_ACCOUNTED formatting only
Lines 15-78  CODE_VALIDATED  primary navigation semantic/accessibility gate
Lines 79-81  COMMENT_VALIDATED explanatory comments
```

For every `CODE_VALIDATED` range, the ledger must point to the applicable evidence categories, for example:

- syntax/parser validation;
- HTML/CSS/JavaScript standards validation;
- route/asset/import validation;
- accessibility validation;
- responsive/browser validation;
- security/privacy validation;
- SEO/metadata/PWA validation;
- performance validation;
- API/database/auth validation;
- unit/integration/e2e testing;
- manual regression testing.

## 5. 100% accounting gate

A file cannot receive `VALIDATED` or `LOCKED` unless:

```text
accounted_physical_lines == total_physical_lines
unclassified_lines == 0
failed_lines == 0
unresolved_lines == 0
```

The ledger must state the percentage:

```text
LINE ACCOUNTING COVERAGE: 100.00%
```

Anything below 100% is an automatic failure.

## 6. Validation depth is contextual, not merely syntactic

A line is not considered validated merely because it parses.

Each line/range must be checked in the context of the complete file, feature, platform, edition, shared systems, and downstream dependencies. Examples:

- a correct `href` line fails if its route does not exist;
- correct ARIA syntax fails if runtime state is not synchronized;
- correct CSS fails if it breaks another breakpoint or violates the locked design system;
- correct JavaScript fails if keyboard/focus/error behavior is incomplete;
- correct API code fails if authorization is missing;
- correct SQL/ORM code fails if constraints/transactions/concurrency are incorrect;
- correct payment code fails if webhook/idempotency/reconciliation requirements are incomplete.

## 7. Automated and manual evidence

Each ledger must distinguish:

### Automated evidence

Examples include:

- parser/compiler/type-check results;
- lint/static-analysis results;
- route/link/import checks;
- unit tests;
- integration tests;
- e2e tests;
- accessibility automation;
- dependency/security scans;
- schema/migration checks;
- build/test commands;
- content/hash verification.

### Manual evidence

Examples include:

- keyboard-only behavior;
- focus order/visibility;
- touch/pointer behavior;
- screen-reader review where applicable;
- responsive/reflow/zoom review;
- visual design-system comparison;
- error/loading/empty/success states;
- cross-platform integration;
- destructive/secure workflow review;
- browser runtime/console/network validation.

Automated evidence never replaces required manual validation.

## 8. File-level attestation

Every ledger ends with an attestation block:

```text
SOURCE HASH MATCH: PASS
TOTAL PHYSICAL LINES: <n>
ACCOUNTED PHYSICAL LINES: <n>
UNCLASSIFIED LINES: 0
FAILED LINES: 0
UNRESOLVED LINES: 0
LINE ACCOUNTING COVERAGE: 100.00%
FILE VALIDATION STATUS: VALIDATED | LOCKED
```

## 9. Platform-level proof

Each platform manifest must aggregate all file ledgers and prove:

```text
files_expected == files_with_current_ledgers
files_with_less_than_100_percent_line_accounting == 0
files_failed == 0
files_unresolved == 0
```

Only then can the platform edition reach `VALIDATED`/`LOCKED`.

## 10. Project-wide proof

The project-wide registry must aggregate every platform and enterprise edition. The teaching freeze may be lifted only when every required source file has a current 100% ledger and every required platform/enterprise gate is locked.

## 11. Change invalidation

Any source change changes the content hash and immediately invalidates the old line ledger. The changed file and all affected dependents return to `REVALIDATION_REQUIRED` until new line accounting, tests and regression evidence are recorded.

## 12. Teaching proof shown to the user

When teaching a validated logical block, the assistant must identify:

- canonical repository file;
- locked source commit SHA;
- source SHA-256;
- relevant line range(s);
- ledger path;
- validation status;
- 100% line-accounting result;
- tests/evidence applicable to that block.

This allows the user to independently inspect the exact validated source and its proof before or while typing it.

## 13. No exception rule

There is no "small line" exception. Attributes, metadata, favicon links, imports, ARIA states, punctuation, selectors, route strings, configuration, schemas, migrations, error branches and closing syntax are all part of line accounting.

No implementation code may be represented as completely validated if any required source line lacks current proof.