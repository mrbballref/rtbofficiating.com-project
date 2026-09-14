# The Vault — Frontend Production Package

This package is built from the user-supplied **The Vault master platform prompt**, exact **The Vault logo**, the supplied **approved RTBO navigation menu** as the navigation structure/behavior baseline, and the supplied **approved iPad 13 video player** package.

## What is included

- 44 linked HTML pages matching the page list in the master prompt.
- TV multimedia production-studio visual system across public, application, video, and admin pages.
- Exact supplied Vault logo at `assets/vault-logo.png`.
- Approved RTBO logo in the footer at `assets/rtbo-logo.png`.
- Approved navigation CSS/JS preserved at `assets/approved-nav-base.css` and `assets/approved-nav.js`, with Vault-specific markup and styling layered on top.
- Approved iPad player preserved unchanged in `player/` and embedded on primary video pages.
- Responsive layouts for desktop, tablet/iPad, and mobile.
- Browser-local functional UI for ingest jobs, export/download jobs, clip metadata, generic create forms, and demo/contact/setup submissions.
- Command palette (`Ctrl/Cmd+K` or `/`).
- Empty states instead of fabricated customers, games, analytics, teams, downloads, or partnerships.

## Important production boundary

This is a **frontend implementation**. True video upload, transcoding, media storage, clip rendering, authenticated sharing, email delivery, billing, SSO, RBAC enforcement, AI analysis, live ingest, CDN delivery, and server-side audit logs require production backend services. The UI does not falsely claim those services are active.

The approved iPad player is intentionally copied without modification.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Primary pages

- `index.html` — public homepage
- `dashboard.html` — production dashboard
- `media-library.html` — The Vault media library
- `ingest.html` — ingest center
- `film-room.html` — approved iPad player in Film Room
- `clip-editor.html` — clip workflow
- `control-room.html` — TV control room
- `downloads.html` — download/export center
- `admin.html` — platform administration
- `cms.html` — customer CMS

The complete product specification is included at `docs/THE-VAULT-master-prompt.md`.
