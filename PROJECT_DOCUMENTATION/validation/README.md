# RTBO Validated Code Governance

## Current controlling validation system

The only controlling validation system for current RTBO work on this branch is:

```text
PROJECT_DOCUMENTATION/validation/current/
```

Current controlling files:

- `RTBO_ULTIMATE_VALIDATED_CODE_RULE.md`
- `RTBO_ULTIMATE_VALIDATED_CODE_REGISTRY.json`
- `RTBO_ULTIMATE_PROJECT_VALIDATION_MATRIX.md`
- `RTBO_ULTIMATE_TEACHING_PROTOCOL.md`
- `RTBO_ULTIMATE_REFERENCE_BASELINE.md`

Any validation/governance files outside `PROJECT_DOCUMENTATION/validation/current/` are historical/non-controlling for this current validation program unless the user explicitly reactivates them.

No implementation code may be taught, reused, integrated, or represented as canonical until it has passed the current mandatory validation gates and the complete project reaches `PROJECT_WIDE_LOCKED`.

Validation covers every standalone HTML/CSS/JS implementation, the integrated HTML/CSS/JS enterprise, every full-stack platform/module, the integrated full-stack enterprise, shared browser/server systems, Master CMS + Super Admin, cross-platform routes/contracts, accessibility, responsiveness, metadata/favicon/PWA, security/privacy, performance, testing, observability, deployment, backup/recovery and regression.

The latest user requirements, current cumulative checkpoint, current architecture/source-of-truth documents, approved assets/content, actual source files and verified external standards are authoritative inputs. Conversational memory is never a substitute for source inspection or test evidence.
