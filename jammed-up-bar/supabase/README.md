# Supabase integration

This folder provides a production-oriented starter schema and row-level-security posture. It intentionally contains **no credentials, no service-role key, and no fake content**.

Recommended production path:
1. Create development, staging, and production Supabase projects.
2. Apply `schema.sql`, then customize/apply `rls.sql`.
3. Keep service-role credentials server-side only.
4. Use Storage buckets for approved media/artwork/documents with rights metadata linked through `media_assets` and `content_rights`.
5. Use Edge Functions or a trusted backend for RSS generation, signed media URLs, rights-expiration jobs, analytics aggregation, and privileged CMS mutations.
6. Replace the browser-local CMS adapter in `assets/js/platform.js` with authenticated API calls once the backend project is connected.
