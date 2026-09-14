-- Starter RLS posture: public can read published content; all writes require authenticated role checks.
-- Role assignment itself must be restricted to trusted administrative workflows.

alter table public.shows enable row level security;
alter table public.episodes enable row level security;
alter table public.articles enable row level security;
alter table public.live_events enable row level security;
alter table public.films enable row level security;
alter table public.clips enable row level security;
alter table public.people enable row level security;
alter table public.events enable row level security;
alter table public.media_assets enable row level security;
alter table public.content_rights enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.has_role(role_key text)
returns boolean language sql stable security definer set search_path=public as $$
  select exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id=ur.role_id
    where ur.user_id=auth.uid() and r.key=role_key
  );
$$;

create policy "public read published shows" on public.shows for select using (status='published' or public.has_role('super_admin') or public.has_role('cms_admin'));
create policy "public read published episodes" on public.episodes for select using (status='published' or public.has_role('super_admin') or public.has_role('cms_admin'));
create policy "public read published articles" on public.articles for select using (status='published' or public.has_role('super_admin') or public.has_role('cms_admin'));
create policy "public read approved live" on public.live_events for select using (publish_status='published' or public.has_role('super_admin') or public.has_role('network_admin'));
create policy "public read published films" on public.films for select using (status='published' or public.has_role('super_admin') or public.has_role('cms_admin'));
create policy "public read published clips" on public.clips for select using (status='published' or public.has_role('super_admin') or public.has_role('cms_admin'));
create policy "public read published people" on public.people for select using (status='published' or public.has_role('super_admin') or public.has_role('cms_admin'));
create policy "public read published events" on public.events for select using (status='published' or public.has_role('super_admin') or public.has_role('events_manager'));

create policy "cms admins manage shows" on public.shows for all to authenticated using (public.has_role('super_admin') or public.has_role('cms_admin')) with check (public.has_role('super_admin') or public.has_role('cms_admin'));
create policy "cms admins manage episodes" on public.episodes for all to authenticated using (public.has_role('super_admin') or public.has_role('cms_admin') or public.has_role('podcast_admin')) with check (public.has_role('super_admin') or public.has_role('cms_admin') or public.has_role('podcast_admin'));
create policy "editors manage articles" on public.articles for all to authenticated using (public.has_role('super_admin') or public.has_role('cms_admin') or public.has_role('editor')) with check (public.has_role('super_admin') or public.has_role('cms_admin') or public.has_role('editor'));
create policy "network admins manage live" on public.live_events for all to authenticated using (public.has_role('super_admin') or public.has_role('network_admin') or public.has_role('executive_producer')) with check (public.has_role('super_admin') or public.has_role('network_admin') or public.has_role('executive_producer'));
create policy "rights managers read media" on public.media_assets for select to authenticated using (true);
create policy "rights managers manage rights" on public.content_rights for all to authenticated using (public.has_role('super_admin') or public.has_role('rights_manager')) with check (public.has_role('super_admin') or public.has_role('rights_manager'));
create policy "admins read audit logs" on public.audit_logs for select to authenticated using (public.has_role('super_admin') or public.has_role('executive'));


-- Membership data is private. Service-role access from the trusted backend bypasses RLS.
alter table public.podcast_subscribers enable row level security;
alter table public.podcast_subscriptions enable row level security;
