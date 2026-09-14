# The Live Stream — Complete Public Platform Frontend

This package expands The Live Stream into a complete, linked multi-page public platform using the route architecture in the supplied master specification.

## Pages created

- `/live-stream/` — Home
- `/live-stream/live/` — Live Now
- `/live-stream/schedule/` — Schedule
- `/live-stream/watch/` — Watch
- `/live-stream/events/` — Events
- `/live-stream/replays/` — Replays
- `/live-stream/highlights/` — Highlights
- `/live-stream/clips/` — Clips
- `/live-stream/shows/` — Shows
- `/live-stream/originals/` — Originals
- `/live-stream/officiating/` — Officiating
- `/live-stream/sports/` — Sports
- `/live-stream/levels/` — Competition Levels
- `/live-stream/production-services/` — Production Services
- `/live-stream/production-services/request/` — Request Production
- `/live-stream/advertise/` — Advertise
- `/live-stream/sponsors/` — Sponsorship
- `/live-stream/partners/` — Partners
- `/live-stream/membership/` — Membership
- `/live-stream/subscribe/` — Subscribe
- `/live-stream/account/` — Account
- `/live-stream/search/` — Search
- `/live-stream/help/` — Help
- `/live-stream/contact/` — Contact
- `/live-stream/licensing/` — Licensing
- `/live-stream/distribution/` — Distribution
- `/live-stream/newsletter/` — Newsletter
- `/live-stream/press/` — Press & Media
- `/live-stream/careers/` — Careers

Additional nested page:
- `/live-stream/production-services/request/` — Request Production

## Navigation

Every public page uses the same responsive The Live Stream platform navigation, formatted in the same left / centered-brand / right structure requested for the platform. Desktop dropdowns and mobile navigation link to the real pages above.

## Important implementation rules preserved

- No fake broadcasts, scores, viewers, sponsors, advertisers, clients, testimonials, programs, replays, or analytics.
- Pages use professional empty states where real operational data has not been supplied.
- No screenshot-based interface or hotspot navigation.
- The two supplied hero images remain image assets only; the interface is coded HTML/CSS/SVG/JS.
- The official The Live Stream logo has not been generated or substituted. The centered navigation brand remains coded text until the approved logo asset is supplied.
- Membership names/prices are not invented.
- Partner logos and affiliations are not invented.
- Forms validate on the frontend and explicitly disclose that the production integration endpoint is not configured in this static frontend package; they do not pretend to transmit data.
- 10px black-gradient transitions are included between major home-page sections and shared section styling supports the same system throughout the platform.
- Responsive layouts, keyboard focus, dropdown navigation, mobile navigation, semantic forms, and reduced-motion behavior are included.

## Files

- `live-stream/index.html`
- `live-stream/navigation.css`
- `live-stream/navigation.js`
- `live-stream/site.css`
- `live-stream/site.js`
- `live-stream/hero.css`
- `live-stream/hero.js`
- route folders listed above
- `assets/live-stream/hero/arena-background.png`
- `assets/live-stream/hero/camera-source.png`


## Navigation alignment correction

- Fixed the overlap shown in the supplied screenshot.
- The centered `THE LIVE / STREAM` brand now occupies a real reserved grid column instead of being absolutely positioned over the navigation.
- Left and right navigation groups can no longer render behind the center brand.
- The responsive mobile navigation now activates at 1320px to prevent cramped intermediate layouts.
- On mobile only, the center brand returns to absolute centering between the menu and account controls.

## Approved Live Stream navigation logo

The centered navigation brand now uses the exact user-supplied approved The Live Stream logo:

`assets/live-stream/the-live-stream-logo.png`

The logo has not been regenerated, redrawn, recolored, or substituted.

## Navigation structure

The navigation now mirrors the RTBO menu format:
- Left group: Home, Live Now, Schedule
- Center: approved The Live Stream logo linked to the platform home page
- Right group: Watch, Programming, Production Services, Membership, More, Search, Account
- Responsive mobile navigation preserves the same platform destinations
- Desktop dropdown and keyboard behavior remain intact

## Navigation balance correction

The desktop menu is now deliberately balanced around the approved centered logo.

Left side:
- Home
- Live Now
- Schedule
- Watch
- Events
- Replays

Center:
- Approved The Live Stream logo

Right side:
- Programming
- Production Services
- Membership
- More
- Search
- Account

Both desktop sides now contain six primary controls and occupy equal-width grid columns.
The approved logo sits in a dedicated center column rather than visually competing with either side.
The mobile menu activates at 1380px before the desktop layout can become crowded.

## The Live Stream Experience section

The five user-supplied experience images are now used as individual image assets in a coded homepage section placed directly below the hero.

- Heading: `THE LIVE STREAM EXPERIENCE`
- Heading is center-aligned with 10px bottom padding.
- All five images are centered.
- Desktop layout uses `justify-content: space-between`.
- Responsive layouts center and wrap the images.
- Section has 1px burnt-orange chrome-gradient borders at the top and bottom.
- The chrome borders are inset by 10px from the top and bottom of the section.
- The older generic experience card section was removed to prevent duplication.


## Approved RTBO navigation mirror

The Live Stream navigation has now been rebuilt directly from the supplied `approved_rtbo_navigation_menu.zip` design system rather than approximating it.

Mirrored RTBO navigation characteristics:
- Fixed header at 18px from the top.
- 1540px maximum navigation width.
- Three-column desktop grid with a 178px center logo lane.
- Left navigation aligns toward the center logo.
- Right navigation aligns away from the center logo.
- 3px rounded chrome border using burnt orange, crimson, warm silver, and white highlights.
- 24px rounded navigation container.
- Matching inner hairline, top chrome highlight, shadows, hover lift, active crimson state, dropdown styling, CTAs, and mobile behavior.
- Same 1370px and 1180px responsive stages as the approved RTBO navigation.
- Exact approved The Live Stream logo used in the center position.

Live Stream-specific menu items:
Left — Home, Live Now, Schedule, Watch.
Right — Programming, Production Services, Membership, More, Search, Account.

Search uses the RTBO outline-CTA position; Account uses the RTBO solid-CTA position.

## Featured Live Event section

A new `FEATURED LIVE EVENT` section is placed directly below `THE LIVE STREAM EXPERIENCE`.

- Uses a coded recreation of the approved iPad Pro 13 video-player appearance from the supplied `ipad13-video-player(2).zip`.
- The player is aligned left.
- A tab beneath the player reads `RTBO LIVE NETWORK`.
- Right-side content:
  - FEATURED LIVE EVENT — burnt orange, 16px
  - UPCOMING EVENTS — 36px
  - UPCOMING BASKETBALL GAME — burnt orange, 16px
  - Pin icon + ARENA NEAR YOU — 16px
  - Live Stream Not Available — 16px, weight 900
  - Availability paragraph
  - WATCH LIVE NOW CTA
- 1px burnt-orange chrome-gradient borders appear at the top and bottom, each inset by 10px.

## Featured Live Event typography update

- `UPCOMING EVENTS` heading increased from 36px to 55px.
- Section subheading copy increased from 16px to 24px:
  - FEATURED LIVE EVENT
  - UPCOMING BASKETBALL GAME
  - ARENA NEAR YOU
  - Live Stream Not Available
- Pin marker icon increased to 24px to remain proportionate with the location subheading.

## Video player tab typography update

- `RTBO LIVE NETWORK` tab copy increased to **32px**.

## Video player tab border radius update

- Bottom-right border radius set to **10px**.
- Bottom-left border radius set to **10px**.

## Memberships and payment gateway

The membership system now contains four launch tiers:

- Live Stream Free — $0
- Live Stream Plus — $9.99 monthly / $99.99 annual
- Live Stream Premium — $19.99 monthly / $199.99 annual
- Live Stream All Access — $29.99 monthly / $299.99 annual

The membership page includes monthly/annual switching, plan cards, benefit comparison, PPV/pass/institutional access information, and membership FAQs.

The Subscribe page is now a checkout-selection page. Paid memberships post to the included server-side Stripe Checkout endpoint. The backend maps trusted plan keys to Stripe Price IDs kept in environment variables and returns the secure Checkout URL.

No secret Stripe keys or payment card data are placed in the frontend.

Additional checkout routes:
- `/live-stream/checkout/success/`
- `/live-stream/checkout/cancel/`

Payment backend:
- `/server/server.js`
- `/server/package.json`
- `/server/.env.example`
- `/server/README.md`

## Navigation spacing update

- Added **15px desktop spacing** before the `Production Services` navigation item to increase separation from the centered approved Live Stream logo.

## Center logo overlap correction

The navigation collision was caused by the centered logo being absolutely positioned while the desktop navigation groups were left to CSS Grid auto-placement.

The desktop layout now explicitly reserves:
- Column 1 — left navigation
- Column 2 — centered approved Live Stream logo lane
- Column 3 — right navigation

The left and right groups also receive 28px of protected inner spacing from the logo lane. The previously requested 15px additional spacing before `Production Services` remains in place.

## Navigation correction — centered logo and protected menu lanes

The previous collision was caused by assigning `grid-column: 2` to the absolutely positioned center logo. That changed the positioning reference and moved the logo over the right-side navigation.

The corrected desktop navigation now:
- Keeps the approved Live Stream logo positioned at `left: 50%` of the full RTBO navigation container.
- Locks the left menu to grid column 1.
- Reserves a 190px center lane for the logo.
- Locks the right menu to grid column 3.
- Adds 15px protected spacing between each menu group and the center logo lane.
- Uses tighter spacing for the longer Live Stream-specific right-side labels so Programming and Production Services cannot render underneath the logo.
- Retains the approved RTBO responsive navigation treatment.

## Live Now approved iPad video player

The generic Live Now video stage has been removed.

`/live-stream/live/` now uses the exact approved iPad video player package supplied in `ipad13-video-player(2).zip`.

Implementation:
- Exact approved player HTML/CSS/JavaScript/assets copied to `/live-stream/approved-ipad-player/`.
- The Live Now page embeds that player directly.
- The approved iPad frame, player controls, timeline, captions, volume, full-screen, theater, mini-player, frame-step, settings, recording, AirPlay treatment, screensaver, and responsive player behavior are preserved.
- Only the standalone demo header, playlist sidebar, and creator-information area are hidden in embedded Live Now mode so the approved iPad player itself is the video experience.

## Live Now full-size iPad player correction

The approved iPad player is no longer placed inside a two-column site grid.

- The approved player now occupies the full available content width on `/live-stream/live/`.
- The desktop iframe is 860px tall so the complete iPad frame is visible at full size.
- The approved iPad glass renders at its full 760px desktop height.
- Broadcast Status has been moved below the player instead of sharing the row with it.
- Tablet and mobile sizes remain responsive while preserving the full iPad treatment.


## Production-network internal page redesign

All public internal pages were upgraded from generic dark content pages to a consistent sports-broadcast / multimedia-network design language.

Global redesign includes:
- Cinematic arena-based internal mastheads.
- Exact approved The Live Stream logo as a large network masthead visual.
- Broadcast capability strip beneath page mastheads.
- Control-room inspired sections, panels, forms, toolbars, tables, and empty states.
- Broadcast-style content tiles with chrome orange details and production framing.
- Network-style search/directory tiles.
- Enhanced media stages and the approved full-size iPad player presentation on Live Now.
- Premium Membership and Checkout presentation integrated into the same network visual system.
- RTBO 10px black-gradient section transitions remain intact.
- No fake games, scores, viewers, sponsors, advertisers, programs, clients, or testimonials were inserted.
- Existing real empty-state behavior remains intact where operational data has not been supplied.


## All video players standardized to the approved iPad player

Every actual video-player surface in the public Live Stream platform now uses the exact user-supplied approved iPad player package at:

`/live-stream/approved-ipad-player/index.html`

Updated player locations:
- Home — Featured Live Event
- Home — Live Now
- Live Now — full-size broadcast player
- Clips — Clip Engine preview

The former hand-built Featured Live Event iPad-like player was removed from use.
The generic `media-stage` video previews on Home and Clips were replaced with the approved player.

The approved player package remains the single player implementation, so its controls, frame, screensaver, captions, settings, volume, fullscreen, theater/mini-player features, timeline, and responsive behavior stay consistent everywhere.


## Unique production-page redesign

The internal platform no longer uses one repeated generic page composition.

Each major destination now has a purpose-built production interface:

- Schedule — program-grid / broadcast-control desk
- Watch — network discovery marquee and content rails
- Events — event operations console and lifecycle
- Replays — archive vault and rights window
- Highlights — editorial feature desk and approval flow
- Clips — approved iPad player inside a clip workstation
- Shows — channel/programming grid
- Originals — cinematic feature presentation and production reel
- Officiating — mechanics/positioning analysis lab
- Sports — sport matrix and scoring/graphics engine
- Competition Levels — visual competition ladder
- Production Services — control-room rack, service modules, and production CTA
- Advertise — broadcast inventory planner and sales inquiry
- Sponsorship — sponsor placement map and inventory categories
- Partners — strategic ecosystem/orbit
- Distribution — owned-platform distribution network diagram
- Licensing — rights matrix and licensing desk
- Newsletter — newsroom/newswire presentation
- Press & Media — press-room index, releases, credentials, assets, inquiry
- Careers — production crew wall and roster-interest workflow
- Help — support/diagnostics console
- Contact — department switchboard
- Search — network search command center
- Account — viewer identity console
- Live Now — approved full-size iPad player with program/tally controls
- Production Request — step-based production scoping workstation
- Membership / Checkout — retain their functional pricing/payment workflows with route-specific visual treatments
- Success / Cancel — distinct secure-checkout result screens

No fake operational events, scores, viewers, sponsors, clients, testimonials, partners, or program inventory were added.


## Homepage hero camera replacement

- Removed the previous hero camera from the homepage hero.
- Replaced it with the exact user-supplied RTBO LIVE camera PNG.
- The supplied image is used as a normal webpage image asset, not a mockup, screenshot overlay, or regenerated image.
- Removed the previous camera fade mask/filter from this replacement so the supplied artwork is preserved as provided.


## Hero camera size match

The replacement RTBO LIVE camera now uses the exact desktop sizing and position values of the previously removed camera:

- Width: `min(50vw, 858px)`
- Maximum image height: `87%`
- Right position: `-1.2%`
- Bottom position: `-1.5%`

The replacement image itself remains the exact user-supplied asset.


## Hero camera enlarged to match the supplied size reference

The RTBO LIVE replacement image has substantially more empty black canvas around the camera than the previous source asset. Matching only the former wrapper dimensions therefore made the visible camera too small.

The visible replacement camera has now been enlarged and remains anchored to the bottom-right of the homepage hero:
- Desktop artwork width: `min(76vw, 1300px)`
- Hero artwork height container: `108%`
- Right position: `-4%`
- Bottom position: `-7%`

Responsive sizing is also included for tablet and mobile breakpoints.


## Homepage hero camera size increase

The RTBO LIVE camera in the homepage hero was increased by 70px in both width and height.

Updated desktop sizing:
- Width: `min(calc(76vw + 70px), 1370px)`
- Height: `calc(108% + 70px)`


## Homepage hero camera set to 270px

The RTBO LIVE camera in the homepage hero is now set to:
- Width: `270px`
- Height: `270px`


## Homepage hero camera set to 1500px

The RTBO LIVE camera in the homepage hero is now set to:
- Width: `1500px`
- Height: `1500px`


## Homepage hero camera set to 1700px

The RTBO LIVE camera in the homepage hero is now set to:
- Width: `1700px`
- Height: `1700px`


## Homepage hero camera centered on right side

The 1700px × 1700px RTBO LIVE camera is now centered within the right half of the desktop hero:
- Horizontal center: `75%` of hero width
- Vertical center: `50%` of hero height
- Transform: `translate(-50%, -50%)`
- Camera size remains `1700px × 1700px`


## Homepage hero camera top padding

- Added `50px` top padding to the centered 1700px × 1700px RTBO LIVE camera.
- The camera's 1700px width and 1700px height remain unchanged.


## Homepage hero camera top padding update

- Updated the centered 1700px × 1700px RTBO LIVE camera from `50px` top padding to `150px` top padding.
- The camera width and height remain unchanged.


## Homepage hero camera top margin

- Added `150px` margin-top to the RTBO LIVE hero camera.
- Existing `150px` padding-top remains in place.
- Camera dimensions remain `1700px × 1700px`.


## Homepage hero camera recentered on the right

The extra 150px top padding and 150px top margin were removed so they no longer offset the camera.

The 1700px × 1700px camera is now truly centered in the right half of the desktop hero:
- Horizontal center: `75%`
- Vertical center: `50%`
- Transform: `translate(-50%, -50%)`


## Homepage hero camera moved to bottom

The 1700px × 1700px RTBO LIVE camera is now anchored to the bottom of the desktop hero while remaining centered within the right half.

- Horizontal center: `75%`
- Bottom: `0`
- Transform: `translateX(-50%)`
- Image alignment: `center bottom`


## Hero camera clipping/position fix

The desktop hero camera no longer uses a forced 1700px × 1700px square that caused the camera to be cropped at the top and dominate the full hero.

The camera is now:
- anchored to the bottom-right of the hero
- fully contained vertically with `max-height: 92%`
- responsive with `width: min(1700px, 72vw)`
- limited to the right-side visual area
- displayed at its original aspect ratio


## Homepage hero camera set to 1400px

The RTBO LIVE camera is now set to exactly:
- Width: `1400px`
- Height: `1400px`

It remains anchored to the bottom-right of the hero section.


## Homepage hero camera set to 1700px

The RTBO LIVE camera is now set to exactly:
- Width: `1700px`
- Height: `1700px`

It remains anchored to the bottom-right of the hero section.


## Homepage hero camera centered on right side and increased to 1800px

The RTBO LIVE hero camera was updated to:
- be centered on the right half of the hero section
- use exact desktop dimensions of `1800px × 1800px`

Desktop positioning:
- `left: 75%`
- `top: 50%`
- `transform: translate(-50%, -50%)`


## Homepage hero camera moved to bottom

The 1800px × 1800px RTBO LIVE camera now remains horizontally centered on the right half of the hero and is anchored to the bottom edge.

Desktop positioning:
- `left: 75%`
- `bottom: 0`
- `transform: translateX(-50%)`
- `object-position: center bottom`


## Hero camera visible-bottom alignment fix

The supplied RTBO LIVE PNG includes substantial transparent canvas below the visible camera. The previous `bottom: 0` rule aligned that transparent canvas to the hero bottom, which left the visible camera high in the hero and clipped at the top.

The camera remains:
- `1800px × 1800px`
- horizontally centered on the right half
- bottom-anchored

The image artwork is now shifted down `395px` so the visible camera itself reaches the bottom edge of the hero.


## Hero four-side black overlay

Added black gradient overlays to all four sides of the homepage hero background image:
- left edge
- right edge
- top edge
- bottom edge

The overlays fade toward the center so the arena remains visible while the edges blend into the dark Live Stream design. Hero copy and the RTBO LIVE camera remain above the overlay.


## RTBO LIVE hero camera restored

The supplied RTBO LIVE camera has been restored to the homepage hero above the four-sided black overlay.

The camera remains:
- `1800px × 1800px`
- horizontally centered on the right half
- visually aligned to the bottom
- layered above the hero background overlays

The overlay no longer changes the camera wrapper from absolute positioning to relative positioning.


## Approved iPad player outside border removed

Removed the external presentation frame surrounding the approved iPad video player:
- outside border removed
- external 14px frame padding removed
- external frame background removed
- external frame shadow removed
- `RTBO APPROVED iPAD VIDEO PLAYER` frame caption removed

The approved iPad chassis and its internal chrome/borders remain unchanged.


## Approved iPad player bottom border removed

Removed the remaining bottom border beneath the approved iPad player area by disabling:
- `.stage-layout` bottom border
- `.stage-layout::before` bottom border

The rest of the approved iPad player remains unchanged.


## Full TV Production Studio Redesign

Applied a broadcast-production visual system across all 31 public HTML pages while preserving each route's unique layout and function.

The redesign adds:
- master-control / control-room page environments
- multiview-style hero visual bays
- studio truss/chrome section dividers
- switcher/rack-inspired cards and panels
- engineering-console forms
- broadcast inventory walls
- edit-suite treatment for clips/replays/highlights
- studio newsroom treatment for newsletter/press
- subscription package console treatment for membership
- subscriber-control-desk treatment for checkout
- production-rack footer styling
- responsive studio treatment for tablet/mobile

The approved Live Stream navigation geometry and approved iPad player UI were intentionally preserved rather than replaced.

Internal link audit: 0 missing local targets detected.


## Production hero monitor fix across all pages

Fixed the empty/generic studio-monitor block across all 26 production routes.

Changes:
- corrected the official Live Stream logo asset path inside every production hero monitor
- removed the large orange crosshair treatment
- removed the oversized bottom meter strip
- replaced `STUDIO MULTIVIEW` with a cleaner non-operational `PROGRAM MONITOR` bezel label
- centered the official Live Stream logo inside the monitor
- corrected the old mobile rule that pushed the visual off-canvas and reduced it to 18% opacity
- preserved each page's existing hero copy, background treatment, navigation, sections, and unique production layout

Local image-source audit: 70 images checked; 3 broken local image source(s) remain.


### Image path cleanup
Corrected the remaining official Live Stream logo paths on Partners, Checkout Success, and Checkout Cancel.

Final local image-source audit: 70 images checked; 0 broken local image source(s) remain.
