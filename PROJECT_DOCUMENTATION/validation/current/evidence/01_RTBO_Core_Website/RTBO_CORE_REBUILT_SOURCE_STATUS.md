# RTBO Core Website — Current Rebuilt Source Status

**Platform:** `01_RTBO_Core_Website`  
**Branch:** `chatgpt/01-rtbo-core-complete-build`  
**Status:** `SOURCE_REVIEW`  
**Teaching:** FROZEN

The earlier compressed source snapshot is superseded by the individual-file materialization workflow. It remains historical evidence of the first draft only and is not canonical source.

## Current validation contract

The canonical draft is the normal source tree at:

`STANDALONE_PLATFORMS/01_RTBO_Core_Website/`

The exact committed individual files are what browser/runtime validation and later line ledgers must inspect.

## Static review completed before materialization

The rebuilt source contains:

- 28 HTML documents;
- 18 CSS files;
- 5 JavaScript modules;
- `manifest.webmanifest`;
- complete current Core internal route set;
- current four-event set only;
- desktop and mobile disclosure navigation;
- account-interface shell without fake authentication;
- homepage sections in the frozen information-architecture order;
- consent/privacy interface;
- complete footer route family;
- metadata including title, description, canonical URL, favicon reference, Open Graph and Twitter metadata;
- Client Spotlight empty state with playlist intentionally absent until approved videos exist.

Static audit currently reports:

```text
HTML document count: 28
Duplicate IDs: 0
href="#": 0
Banned event/platform names: 0
Missing Core-internal route targets: 0
Missing local CSS/JS/manifest resources: 0
Broken aria-controls references: 0
Collapsed disclosure targets missing hidden: 0
Inline style/script/event-handler violations: 0
CSS parse errors: 0
Undefined CSS custom-property references: 0
!important declarations: 0
JavaScript syntax errors: 0
Manifest JSON errors: 0
```

## Accessibility correction from deep review

The brand burnt orange `#BF5700` has approximately 4.44:1 contrast against RTBO black `#050505`, which is marginally below the 4.5:1 normal-text AA threshold. The rebuilt CSS therefore does not rely on burnt-orange color for small current-navigation/link text. Small text remains white and uses burnt orange as a border/underline/current-state accent. Burnt-orange text is reserved for sufficiently large bold eyebrow text or white text on burnt-orange controls.

## Browser validation

The GitHub Actions browser validator now runs against the normal individual source tree rather than the historical compressed archive. It checks HTTP 200 loading, all 28 pages, console/page/resource errors, desktop/mobile handoff at 1320/1321, compact/wide desktop boundaries, true centered-brand geometry, horizontal overflow, disclosure Escape/focus behavior, mobile two-stage Escape, dialog focus restoration, skip-link focus, consent persistence, and breakpoint screenshots.

No `VALIDATED` or `LOCKED` status is granted until that run passes and the remaining UI/UX, asset, accessibility, performance, regression, and line-accounting gates are complete.
