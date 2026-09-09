# Raising The Bar Officiating — Master Project Repository

This repository is the canonical source-controlled home for the rebuilt **Raising The Bar Officiating (RTBO)** ecosystem.

## Mandatory governance

No source is considered approved merely because it exists in this repository.

The governing rule is:

`PROJECT_DOCUMENTATION/validation/RTBO_MASTER_VALIDATED_CODE_RULE.md`

The canonical validation registry is:

`PROJECT_DOCUMENTATION/validation/RTBO_VALIDATED_CODE_REGISTRY.json`

The project-wide status matrix is:

`PROJECT_DOCUMENTATION/validation/RTBO_PROJECT_WIDE_VALIDATION_MATRIX.md`

The teaching protocol is:

`PROJECT_DOCUMENTATION/validation/RTBO_TEACHING_PROTOCOL.md`

The reference baseline is:

`PROJECT_DOCUMENTATION/validation/RTBO_VALIDATION_REFERENCE_BASELINE.md`

Only source recorded as `VALIDATED` or `LOCKED` at evidence level E7/E8 may be taught or represented as approved production code.

## Build order

```text
1. Standalone platforms
2. Integrated HTML/CSS/JS enterprise
3. Full-stack enterprise
```

Required standalone platform roots:

```text
01_RTBO_Core_Website
02_Got_U_Nex_Ref
03_RefZone_University
04_The_Live_Stream
05_The_Jammed_Up_Bar
06_The_Locker_Room
07_The_Vault
08_The_RefShop
09_The_Cutting_Room
10_The_Lab_Hub
11_Master_CMS_Super_Admin
```

## Security note

This repository is public. Never commit secrets, credentials, private keys, production tokens, payment secrets, database passwords, private customer/user data, or environment-specific sensitive configuration.

Use documented environment-variable contracts and safe `.env.example` files when the full-stack architecture reaches that phase.

## Current state

The repository was initialized with validation governance before production source ingestion. Existing historical/local source must be synchronized and revalidated under the master rule before it receives a `VALIDATED` or `LOCKED` registry status.
