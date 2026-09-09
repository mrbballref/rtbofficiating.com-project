# RTBO Core Website - Source Draft Status

**Status:** `SOURCE_DRAFT`  
**Validated/locked:** NO

## Draft source snapshot

Archive: `SOURCE_DRAFTS/01_RTBO_Core_Website/01_RTBO_Core_Website_SOURCE_DRAFT.tar.gz`

Archive SHA-256 from the isolated validation workspace:

`121ad8f48daaea6bca0d9797b3a0e6ffb825fa0d9a6afa08d23130599143efe6`

Current draft contains the homepage plus 27 required internal Core route pages, shared CSS, ES-module JavaScript, a route registry, and a web app manifest draft.

## Static checks passed in the isolated workspace

- 28 HTML files parsed.
- 0 duplicate IDs.
- 0 `href="#"` values.
- 0 `raisingthebarofficiating.com` references.
- 0 occurrences of The Save.
- 0 occurrences of Arkansas Baptist College Classic.
- 0 occurrences of Arkansas Sports Hall of Fame.
- 0 missing Core-internal route targets.
- 0 missing stylesheet/script/manifest resource targets.
- 0 broken `aria-controls` ID references.
- 0 CSS parser errors.
- 0 undefined CSS custom-property references.
- 0 `!important` declarations.
- JavaScript syntax checks passed with Node for all current `.js` modules.
- `manifest.webmanifest` parses as valid JSON.

## Corrections already made during draft audit

The navigation module was revised so one Escape press closes the currently expanded submenu and returns focus to its disclosure control instead of also collapsing the mobile navigation drawer in the same event. The mobile navigation button accessible label now switches between `Open navigation` and `Close navigation`, and the mobile navigation state resets when crossing from the mobile range into desktop.

## Runtime/UI validation state

Not passed yet. The current execution environment blocks Chromium/Playwright navigation to localhost with `ERR_BLOCKED_BY_ADMINISTRATOR`. The local HTTP server itself returned HTTP 200 to direct HTTP requests, but browser interaction evidence is still required. This environmental limitation is recorded as a blocker, not converted into a false runtime pass.

## Final-lock blockers currently known

- exact approved local RTBO logo asset;
- favicon and PWA icons;
- social-sharing image;
- approved Industry font implementation;
- final visual/background imagery;
- final review/legal content where current approved source content is absent;
- browser runtime and rendered breakpoint/UI/UX evidence;
- final accessibility, performance and regression evidence;
- 100% per-file line ledgers and content hashes.
