# RTBO Core Website — Route Registry Audit

Validated source file: `STANDALONE_PLATFORMS/01_RTBO_Core_Website/js/routing/routes.js`
Source branch: `chatgpt/01-rtbo-core-complete-build`
Git blob SHA: `7d39d5076ad631084f7537cee800fbab3873f9cb`

## Contract checks

- Canonical Core domain uses `https://rtbofficiating.com/`.
- Required About routes are present: Guests, Trainers, Reviews, Founder.
- Required Schools routes are present: UAPB Men, UAPB Women, UCA Women, UALR Women.
- Required Events routes are present: Hop Step Sporting Events, Big Miller Event, She Got Game League LR, UAPB Celebrity Game.
- Required platform integrations are present: RefZone University, The Lab Hub, The Live Stream, The Jammed Up Bar!, The Locker Room, The Vault, The RefShop, The Cutting Room, Got U Nex Ref.
- Permanent exclusions are absent from the route registry: The Save; Arkansas Baptist College Classic; Arkansas Sports Hall of Fame.
- Legacy incorrect canonical domain `raisingthebarofficiating.com` is absent.
- Route registry contains no `href="#"` placeholder contract because routes are expressed as concrete local/production destinations.

## Gate result

Route-registry contract audit: `PASS` for Git blob `7d39d5076ad631084f7537cee800fbab3873f9cb`.

This evidence is subordinate to the final immutable platform manifest and does not grant platform lock by itself.
