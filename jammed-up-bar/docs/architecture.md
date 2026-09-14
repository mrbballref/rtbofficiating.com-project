# The Jammed Up Bar! — platform architecture

## Delivered frontend foundation
- Global approved RTBO navigation integrated across the network.
- Dedicated secondary media navigation.
- Coded homepage experience built around the approved Jammed Up Bar logo and the supplied homepage content/copy.
- Approved iPad video player retained as a real HTML/CSS/JS component and adapted for Jammed Up Bar branding.
- Live, Watch, Listen, Episodes, Shows, News, Films, Clips, Guests, Hosts, Topics, Sports, Events, Podcasts, Newsletters, Subscribe, Search, Jammed Up Play, and Admin/CMS routes.
- Empty states instead of fabricated episodes, guests, advertisers, events, counts, or schedules.
- Browser-local CRUD CMS for staging and content-model testing; import/export JSON included.
- Persistent audio bar that restores selected media and playback position across same-session page navigation.
- Responsive layouts, keyboard focus states, reduced-motion support, and semantic landmarks.
- Empty RSS feed ready for real episode publication.
- Supabase/PostgreSQL starter schema and RLS starter policies.

## Production media architecture
Use a dedicated media pipeline instead of hosting large masters directly on a basic web server. A production stack can pair Supabase for identity/relational metadata with a video/audio platform or object storage/CDN for ingest, transcoding, HLS/DASH, captions, thumbnails, and playback telemetry.

## Content model
A canonical episode owns references to video, audio, transcript, captions, chapters, hosts, guests, topics, sports, competition levels, governing bodies, rule topics, resources, and rights. Video/audio are alternate media renditions of the same editorial episode, not duplicate episode records.

## Rights model
Every publishable media asset should be linked to rights metadata describing owner/licensor, territories, platforms, dates, attribution, edit rights, monetization, social, podcast, streaming, and broadcast permissions. Scheduled jobs should warn before expiration and automatically prevent delivery after expiry unless renewed.

## No fake data rule
This delivery ships with empty catalogs. Content cards populate only from records added by an authorized editor in the staging CMS or, later, from the production API.
