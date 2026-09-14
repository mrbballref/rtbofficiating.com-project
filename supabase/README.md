# RTBO Supabase project

The real backend already lives in the "RTBO" Supabase project (org: Raising
The Bar Officiating Inc., project ref `xnwcgbnasvhkuiejtxer`) — provisioned
2026-07-15/16, well before this repo's HTML/CSS/JS was reassembled from its
source zips. There is no local copy of that schema's SQL in this repo; use
the Supabase MCP tools (`list_tables`, `list_migrations`, `execute_sql`) or
the dashboard to inspect it directly rather than assuming from this folder.

## Shape (as of 2026-09)

- **Identity**: `profiles` (1 row per `auth.users`) with a two-stage role
  model — `requested_role` (what the user picked at signup: `official`,
  `school_league`, `vendor`, `evaluator`) vs `approved_role` (free-text,
  set only by a Super Admin via `admin_set_user_access()`) — plus
  `account_status` (`pending_email` → `pending_approval` → `active`/`suspended`).
  `is_super_admin()` checks `approved_role = 'super_admin' AND account_status = 'active'`.
  Allowed `approved_role` values: `super_admin, site_admin, official, coach,
  assistant_coach, athletic_director, assistant_athletic_director, sid,
  game_day_admin, conference_commissioner, evaluator, observer, vendor, student`.
- **CMS**: `site_pages`, `site_page_sections`, `site_page_revisions`,
  `site_navigation_items`, `media_assets` + `admin_upsert_page` /
  `admin_upsert_page_section` / `admin_list_pages` / etc. RPCs — a real
  backend for the Master CMS (`cms/`), not yet wired to it.
- **Programs/registrations**: `programs`, `program_registrations` +
  `public_get_program`, `public_list_programs`, `public_register_for_program`
  RPCs. The 4 training-school registration forms
  (`registration/{ualr-women,uapb-men,uapb-women,uca-women}.html`) are wired
  to this as of 2026-09-14 — see `registration/registration.js`. `programs`
  seeded with those 4 schools (`kind = 'training_school'`).
- **Schools/partners**: `organizations`, `organization_teams`,
  `organization_contacts` + `public_get_organization` / `public_list_organizations`
  / `admin_upsert_organization` RPCs. Not yet wired to `schools/`, `partners/`.
- **Ops**: `admin_audit_logs` (every `admin_*` mutation should log here),
  `platform_settings` (key/value site config, e.g. `program_registration_mode`),
  `platform_releases`.

## Client integration

`assets/auth.js` is the shared client (Supabase JS v2 via esm.sh) — `signUp`,
`signIn`, `getSession`, `getProfile`, `isSuperAdmin()` (wraps the RPC),
`requireRole(allowedApprovedRoles, redirectTo)` for page gates. Anon key
lives in `assets/supabase-config.js` (safe to expose — every table is RLS +
column-grant protected). Never put a service-role key in client code.
