# RTBO CURRENT SOURCE-OF-TRUTH MANIFEST

**Status:** CURRENT / CONTROLLING INPUT MANIFEST  
**Validation root:** `PROJECT_DOCUMENTATION/validation/current/`

## 1. Conflict rule

RTBO project history is cumulative. Earlier sections/files remain historical evidence, but later explicit user decisions and later controlling checkpoint sections override earlier conflicting requirements.

No validator may select an older matching document merely because its filename looks canonical.

## 2. Current controlling inputs

Use in this order:

1. latest explicit user instructions in the active project;
2. latest controlling sections of `RTBO_RESTART_MASTER_CHECKPOINT_CURRENT.md`;
3. current master architecture and platform architecture documents;
4. current corrected route inventory;
5. current UI/UX information architecture;
6. current design system specification;
7. current target filesystem tree;
8. current implementation plan;
9. approved assets/content and exact user-supplied references;
10. actual source files;
11. current runtime/test evidence;
12. current external standards/official documentation.

## 3. Current ecosystem order

```text
Standalone platforms
→ Integrated HTML/CSS/JS Enterprise
→ Full-Stack Enterprise
```

Standalone platform roots:

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

## 4. Current permanent exclusions

Unless the user explicitly reverses them, exclude throughout navigation, routes, pages, footer, sitemap, structured data, integrations, source trees and full-stack implementations:

```text
The Save
Arkansas Baptist College Classic
Arkansas Sports Hall of Fame
```

Any historical checkpoint or route inventory containing those items is superseded for current implementation purposes.

## 5. Current canonical domain family

```text
https://rtbofficiating.com/
https://assign.rtbofficiating.com/
https://university.rtbofficiating.com/
https://live.rtbofficiating.com/
https://podcast.rtbofficiating.com/
https://lockerroom.rtbofficiating.com/
https://vault.rtbofficiating.com/
https://shop.rtbofficiating.com/
https://cuttingroom.rtbofficiating.com/
https://lab.rtbofficiating.com/
```

Never introduce `raisingthebarofficiating.com`.

## 6. Current Core primary navigation

```text
Home
About
  Guests
  Trainers
  Reviews
  Founder
Schools
  UAPB Men
  UAPB Women
  UCA Women
  UALR Women
RefZone University
[centered approved RTBO logo]
Events
  Hop Step Sporting Events
  Big Miller Event
  She Got Game League LR
  UAPB Celebrity Game
The Lab
  The Live Stream
  The Jammed Up Bar!
  The Locker Room
  The Vault
  The Cutting Room
Services
Shop
```

## 7. Current Core route contract

Required local/static route keys currently include:

- `home` → `index.html`
- `about` → `pages/about/index.html`
- `aboutGuests` → `pages/about/guests/index.html`
- `aboutTrainers` → `pages/about/trainers/index.html`
- `aboutReviews` → `pages/about/reviews/index.html`
- `aboutFounder` → `pages/about/founder/index.html`
- `schools` → `pages/schools/index.html`
- `schoolUapbMen` → `pages/schools/uapb-men/index.html`
- `schoolUapbWomen` → `pages/schools/uapb-women/index.html`
- `schoolUcaWomen` → `pages/schools/uca-women/index.html`
- `schoolUalrWomen` → `pages/schools/ualr-women/index.html`
- `refZoneUniversity` → `../03_RefZone_University/index.html`
- `events` → `pages/events/index.html`
- `eventHopStep` → `pages/events/hop-step-sporting-events/index.html`
- `eventBigMiller` → `pages/events/big-miller-event/index.html`
- `eventSheGotGame` → `pages/events/she-got-game-league-lr/index.html`
- `eventUapbCelebrity` → `pages/events/uapb-celebrity-game/index.html`
- `labHub` → `../10_The_Lab_Hub/index.html`
- `liveStream` → `../04_The_Live_Stream/index.html`
- `jammedUpBar` → `../05_The_Jammed_Up_Bar/index.html`
- `lockerRoom` → `../06_The_Locker_Room/index.html`
- `vault` → `../07_The_Vault/index.html`
- `cuttingRoom` → `../09_The_Cutting_Room/index.html`
- `services` → `pages/services/index.html`
- `refShop` → `../08_The_RefShop/index.html`
- `gotUNexRef` → `../02_Got_U_Nex_Ref/index.html`

Account UI-only routes:

- profile
- settings
- notifications
- messages
- security

Legal routes:

- privacy
- terms
- cookies/privacy preferences
- accessibility

Other Core routes/contracts:

- contact
- partners when implemented
- offline only if PWA/service worker is approved and implemented.

No fake static authentication endpoint is allowed.

## 8. Current Core homepage order

```text
01 Hero
02 Quick Ecosystem Links / Four-Item Strip
03 About RTBO
04 Built for the Game
   Clients We Serve
   Featured Partners
05 Education / Training / Assigning Pathways
06 Client Spotlight
07 Services Preview
08 Final CTA
09 Footer
```

## 9. Current Core design baseline

```text
RTBO Black        #050505
RTBO Black Soft   #0B0B0B
RTBO Surface      #111111
RTBO Surface 2    #161616
RTBO White        #FFFFFF
RTBO Text         #F4F4F4
RTBO Muted        #A8A8A8
RTBO Burnt Orange #BF5700
RTBO Crimson      #8B0000
RTBO Border       rgba(255,255,255,0.14)
```

Typography:

```text
Headings: Industry
Body/interface: Inter
```

Do not invent font paths/URLs.

Layout/navigation:

```text
Content max width: 1540px
Wide desktop center lane: 200px
Compact desktop center lane: 190px
Mobile navigation handoff: 1320px
Wide desktop horizontal inset: 24px
Compact desktop inset 1321–1440px: 22px
Major section transition: 10px
Preferred control target: 44 × 44 CSS px where practical
WCAG target: 2.2 AA
```

The 1320px handoff is expressed through a literal media-query condition rather than a CSS custom property because custom properties do not resolve as media-query condition values.

## 10. Current Core implementation sequence

```text
01 Foundation + Entry Point
02 Global Shell + Container System
03 Desktop Navigation
04 Mobile Navigation
05 Account Interface Shell
06 Homepage Hero
07 Quick Ecosystem Links / Four-Item Strip
08 About RTBO Homepage Section
09 Built for the Game
10 Education / Training / Assigning Pathways
11 Client Spotlight + Approved iPad Player
12 Services Preview
13 Final CTA
14 Footer
15 Consent / Privacy Interface
16 Complete Core Route Registry
17 About Page Family
18 Schools Page Family
19 Events Page Family
20 Services Page
21 Contact Page
22 Partners Page
23 Legal Page Family
24 Account Interface Page Family
25 SEO / Metadata / Manifest Review
26 PWA / Offline Decision + implementation if approved
27 Full Core Regression Audit
28 Platform 01 Lock
```

The current ultimate validation rule changes execution: downstream requirements for all slices must be resolved and validated before any code is taught.

## 11. Metadata/favicon correction incorporated into current validation

The presence of `favicon.ico` and `manifest.webmanifest` in the target Core root does not mean metadata can be deferred blindly. The production document-head contract must be validated as a complete system before teaching the first `<head>` block, including real favicon/icon paths, canonical strategy, description strategy, approved social metadata/assets, script/style loading, and the manifest/PWA decision boundary.

## 12. Current source status

Historical code and previously typed restart code are inputs only until revalidated under `RTBO_ULTIMATE_VALIDATED_CODE_RULE.md`.

No prior `PASS`, `COMPLETE`, `VERIFIED` or `LOCKED` label automatically becomes current canonical validation evidence.
