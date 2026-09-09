# RTBO VALIDATED TEACHING PROTOCOL

**Status:** MANDATORY — NO EXCEPTIONS  
**Depends on:** `RTBO_MASTER_VALIDATED_CODE_RULE.md`

## 1. Teaching is globally frozen until the entire project is locked

The user does not receive implementation code while the project-wide validation program is still in progress.

The teaching phase begins only when the canonical registry says:

```text
project_wide_locked = true
teaching_freeze = false
```

Until then, the assistant may design, implement, test and validate source in an isolated working environment and commit only validated production source to the canonical GitHub repository, but does not teach implementation code in chat.

The full sequence is:

```text
Complete all project requirements/architecture
→ implement all standalone HTML/CSS/JS platforms in isolated validation environment
→ validate/register/lock them
→ implement and validate the integrated HTML/CSS/JS enterprise
→ freeze the full-stack architecture
→ implement and validate every full-stack platform/module
→ run complete cross-platform regression
→ record all hashes/evidence
→ PROJECT_WIDE_LOCKED
→ lift teaching freeze
→ teach already-validated code
```

## 2. Default teaching unit after the freeze: logical validated block

Do not default to one line at a time.

Teach one coherent concept at a time, such as:

- complete production `<head>` block;
- complete navigation item/disclosure component;
- complete accessible form field group;
- complete CSS component/rule group;
- complete JavaScript module/behavior;
- complete page section;
- complete API endpoint with schema/service logic;
- complete database migration/model change;
- complete full-stack transaction.

A block must be small enough for a true beginner to understand, but large enough that its behavior and dependencies are not artificially fragmented.

## 3. Every teaching block must include

1. **Exact file/path**
2. **Exact location** — where to insert/add it relative to code the user already has
3. **What** — what the block creates
4. **Why** — why it is required
5. **What uses it**
6. **Complete validated code block**
7. **How it works** — beginner-level explanation by meaningful concepts/lines
8. **Dependencies**
9. **Project references**
10. **Standards references**
11. **Verification procedure**
12. **Expected result**
13. **Registry entry/status/hash** identifying the approved source

## 4. Additive instruction rule

Never tell the user to replace code they have not changed.

Use additive language whenever possible:

- locate this existing element;
- insert immediately after it;
- insert immediately before it;
- insert inside it;
- add this new block.

Use **replace** only when correcting an actual existing error.

## 5. Correction rule

When the user pastes/types code during the later teaching phase:

- review the entire affected system, not only the last line;
- compare it to the canonical validated source/hash;
- identify the exact file;
- use line numbers from the user's pasted version when practical;
- show the exact incorrect code;
- show the exact validated replacement;
- explain the error in beginner terms;
- identify whether the change invalidates downstream blocks.

If no correction is required, say exactly:

**No corrections are required.**

## 6. Size adjustment rule

Use a smaller sub-block only when:

- the logical block is unusually complex;
- the user is likely to make transcription errors without subdivision;
- a dependency must be verified before the rest can be typed;
- the user explicitly asks for smaller steps.

Even when split for teaching, the complete parent feature and the complete project must already be validated before the first sub-block is shown.

## 7. Never teach unresolved placeholders

Do not provide code containing guessed or unresolved:

- routes;
- asset paths;
- favicon paths;
- font URLs;
- social images;
- API endpoints;
- IDs/config values;
- environment values;
- payment/auth settings;
- database names;
- provider keys;
- dummy text where approved content is required.

Resolve the contract before project lock.

## 8. Static/full-stack distinction while teaching

For HTML/CSS/JS, clearly explain when a UI is representational only and not authoritative security.

For full-stack work, teach frontend + server + validation + authorization + persistence + error behavior + tests as one coherent feature contract, not as disconnected snippets that can create an insecure partial implementation.

## 9. Completion wording

Use these terms precisely:

- `DRAFT` — design/source not validated
- `REVALIDATION_REQUIRED` — prior result cannot be trusted under current dependencies/rules
- `VALIDATED` — complete applicable gate passed at evidence level E7
- `LOCKED` — validated and final regression/dependency gate passed at E8
- `PROJECT_WIDE_LOCKED` — every required project implementation is locked and the teaching freeze may be lifted
- `SUPERSEDED` — retained for history but not current

Never call a file/feature/platform/project complete unless its registry status supports that statement.
