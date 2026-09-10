# RTBO Core Website — Runtime Validation Evidence

**Platform:** `01_RTBO_Core_Website`
**Branch:** `chatgpt/01-rtbo-core-complete-build`
**Validated commit:** `203be0d81262b5b728b6c45c5e6ecce6b7f1c4ed`
**Workflow run:** `34499194065`
**Job:** `validate-core-source-draft`
**Result:** `PASS`

The GitHub Actions validation run completed successfully against the exact committed source tree.

## Verified static/runtime results

- HTML documents: 28
- CSS files: 18
- Static errors: 0
- JavaScript syntax errors: 0 as enforced by the platform validator
- Manifest/route/resource validation: passed under the platform validator
- HTTP page load validation: all 28 Core pages returned HTTP 200
- Browser console/page/resource error gate: passed
- Horizontal overflow gate: passed at every tested viewport

## Responsive breakpoint results

Validated viewport widths: `1600`, `1441`, `1440`, `1321`, `1320`, `1024`, `760`, `600`, `320`.

- Desktop navigation correctly active at 1600, 1441, 1440, and 1321 pixels.
- Mobile navigation correctly active at 1320, 1024, 760, 600, and 320 pixels.
- No tested viewport produced horizontal overflow.

## Interaction/accessibility behavior results

- desktop disclosure Escape behavior: PASS
- dialog Escape/focus restoration: PASS
- mobile two-stage Escape behavior: PASS
- skip-link focus behavior: PASS
- consent persistence: PASS

## Evidence artifact

Validation artifact ID: `10161135912`
Artifact SHA-256: `94a9fa77699b88c42c291ed73a8523e052a07ef4fbe4d38e2678bddfc26137b9`

## Gate status

This record advances the Core runtime/static/browser gate to `PASS` for commit `203be0d81262b5b728b6c45c5e6ecce6b7f1c4ed`.

It does **not** by itself grant final platform `VALIDATED` or `LOCKED` status. Remaining required gates include approved-asset fidelity, final UI/UX comparison, WCAG 2.2 AA evidence beyond the interaction checks already covered, performance evidence, complete line-accounting/line-ledger evidence, and platform regression/final immutable manifest requirements under the controlling project-wide validation rules.
