# The Jammed Up Bar! Podcast & Multimedia Platform

This package contains the complete static frontend page architecture for The Jammed Up Bar!, a Raising The Bar Officiating media property.

## Approved assets
- The supplied transparent The Jammed Up Bar! logo is used exactly as provided.
- The approved iPad video player remains included under `player/`.
- The primary platform navigation uses a dedicated center grid track for the logo so it cannot overlap the left or right menu groups.

## Page coverage
The package currently contains **95 platform HTML pages**, including:
- Core media: Home, Live, Watch, Listen, Shows, Episodes, News, Films, Clips, Guests, Hosts, Topics, Sports, Podcasts, Events, Newsletters, The Jammed Up Play, Search and Subscribe.
- Network divisions: About, Network, Studios, Digital, Publishing, Education, Business and Creative.
- Audience: Account, Profile, Favorites, Watch Later, Listen Later, Playlists, Notifications, Community and Submit A Jammed Up Play.
- Commercial/company: Advertise, Sponsorships, Media Kit, Licensing, Syndication, Production Services, Partner Portal, Press, Careers and Contact.
- Legal: Accessibility, Privacy, Terms, Copyright and Submission Terms.
- Canonical CMS-driven page shells: Show, Episode, Article, Guest, Film and Event.
- Admin Command Center with 24 dedicated operational module pages.
- A complete `/sitemap/` page links the page set.

## Data integrity
Dynamic modules use empty states until real content exists. The package does not invent podcast episodes, guests, live schedules, advertisers, sponsors, audience metrics, ratings or distribution links.

## Frontend forms
Prototype forms save locally in the current browser only. They do not claim to send messages or create production accounts.


## Subscription commerce
The Subscribe CTA now opens a four-level podcast/network membership experience with a real subscription form and a server-side Stripe Checkout integration. See `docs/subscriptions-and-payments.md`. Payment processing requires RTBO's Stripe account credentials and recurring Price IDs; no payment credentials are embedded in browser code.
