-- The Jammed Up Bar! — production-oriented PostgreSQL/Supabase starter schema.
-- No seed/fake records are included.
create extension if not exists pgcrypto;

create type public.publish_status as enum ('draft','review','approved','scheduled','published','archived');
create type public.media_kind as enum ('video','audio','image','document','caption','transcript');
create type public.access_level as enum ('public','registered','rtbo_member','premium','enterprise','admin');
create type public.live_status as enum ('offline','scheduled','countdown','live','ended','replay');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.roles (id uuid primary key default gen_random_uuid(), key text unique not null, label text not null);
create table if not exists public.user_roles (user_id uuid references auth.users(id) on delete cascade, role_id uuid references public.roles(id) on delete cascade, primary key(user_id,role_id));

create table if not exists public.sports (id uuid primary key default gen_random_uuid(), name text unique not null, slug text unique not null, status public.publish_status not null default 'draft');
create table if not exists public.competition_levels (id uuid primary key default gen_random_uuid(), sport_id uuid references public.sports(id) on delete set null, name text not null, slug text not null, status public.publish_status not null default 'draft');
create table if not exists public.governing_bodies (id uuid primary key default gen_random_uuid(), name text unique not null, slug text unique not null, website_url text, status public.publish_status not null default 'draft');
create table if not exists public.topics (id uuid primary key default gen_random_uuid(), name text unique not null, slug text unique not null, description text, status public.publish_status not null default 'draft');
create table if not exists public.rule_topics (id uuid primary key default gen_random_uuid(), governing_body_id uuid references public.governing_bodies(id) on delete set null, sport_id uuid references public.sports(id) on delete set null, citation text, title text not null, notes text, status public.publish_status not null default 'draft');

create table if not exists public.shows (
  id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null, description text,
  artwork_url text, language text default 'en', explicit boolean not null default false,
  access public.access_level not null default 'public', status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.seasons (id uuid primary key default gen_random_uuid(), show_id uuid not null references public.shows(id) on delete cascade, season_number int, title text, status public.publish_status not null default 'draft', unique(show_id,season_number));
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(), kind public.media_kind not null, title text, storage_path text, external_url text,
  mime_type text, bytes bigint, duration_seconds numeric, checksum text, owner_name text, rights_id uuid,
  created_at timestamptz not null default now()
);
create table if not exists public.episodes (
  id uuid primary key default gen_random_uuid(), show_id uuid references public.shows(id) on delete set null, season_id uuid references public.seasons(id) on delete set null,
  title text not null, slug text unique not null, description text, episode_number int, episode_type text default 'full', published_at timestamptz,
  video_asset_id uuid references public.media_assets(id) on delete set null, audio_asset_id uuid references public.media_assets(id) on delete set null,
  artwork_asset_id uuid references public.media_assets(id) on delete set null, access public.access_level not null default 'public', status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(), kind text not null check (kind in ('host','guest','contributor','author','talent','speaker')),
  name text not null, slug text unique not null, biography text, organization text, role_title text, photo_asset_id uuid references public.media_assets(id) on delete set null,
  website_url text, status public.publish_status not null default 'draft'
);
create table if not exists public.episode_people (episode_id uuid references public.episodes(id) on delete cascade, person_id uuid references public.people(id) on delete cascade, role text not null, sort_order int default 0, primary key(episode_id,person_id,role));
create table if not exists public.episode_topics (episode_id uuid references public.episodes(id) on delete cascade, topic_id uuid references public.topics(id) on delete cascade, primary key(episode_id,topic_id));
create table if not exists public.episode_sports (episode_id uuid references public.episodes(id) on delete cascade, sport_id uuid references public.sports(id) on delete cascade, primary key(episode_id,sport_id));
create table if not exists public.episode_levels (episode_id uuid references public.episodes(id) on delete cascade, competition_level_id uuid references public.competition_levels(id) on delete cascade, primary key(episode_id,competition_level_id));
create table if not exists public.episode_governing_bodies (episode_id uuid references public.episodes(id) on delete cascade, governing_body_id uuid references public.governing_bodies(id) on delete cascade, primary key(episode_id,governing_body_id));
create table if not exists public.episode_rule_topics (episode_id uuid references public.episodes(id) on delete cascade, rule_topic_id uuid references public.rule_topics(id) on delete cascade, primary key(episode_id,rule_topic_id));

create table if not exists public.transcripts (id uuid primary key default gen_random_uuid(), episode_id uuid references public.episodes(id) on delete cascade, language text default 'en', asset_id uuid references public.media_assets(id) on delete set null, status public.publish_status default 'draft');
create table if not exists public.transcript_segments (id uuid primary key default gen_random_uuid(), transcript_id uuid references public.transcripts(id) on delete cascade, speaker text, start_ms bigint not null, end_ms bigint not null, body text not null, sort_order int not null);
create table if not exists public.captions (id uuid primary key default gen_random_uuid(), episode_id uuid references public.episodes(id) on delete cascade, language text default 'en', label text, asset_id uuid references public.media_assets(id) on delete set null, status public.publish_status default 'draft');
create table if not exists public.chapters (id uuid primary key default gen_random_uuid(), episode_id uuid references public.episodes(id) on delete cascade, title text not null, start_ms bigint not null, sort_order int not null);
create table if not exists public.show_notes (id uuid primary key default gen_random_uuid(), episode_id uuid unique references public.episodes(id) on delete cascade, body_md text, updated_at timestamptz not null default now());
create table if not exists public.resources (id uuid primary key default gen_random_uuid(), episode_id uuid references public.episodes(id) on delete cascade, title text not null, url text, description text, sort_order int default 0);

create table if not exists public.live_events (
  id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null, description text, starts_at timestamptz, ends_at timestamptz,
  stream_url text, backup_stream_url text, status public.live_status not null default 'offline', replay_episode_id uuid references public.episodes(id) on delete set null,
  access public.access_level not null default 'public', publish_status public.publish_status not null default 'draft'
);
create table if not exists public.live_rundown_items (id uuid primary key default gen_random_uuid(), live_event_id uuid references public.live_events(id) on delete cascade, segment text not null, duration_seconds int, host text, guest text, camera text, graphics text, video_roll text, audio text, sponsor text, producer_notes text, sort_order int not null default 0);

create table if not exists public.articles (id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null, dek text, body_md text, author_id uuid references public.people(id) on delete set null, published_at timestamptz, status public.publish_status not null default 'draft', correction_note text, updated_at timestamptz not null default now());
create table if not exists public.films (id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null, description text, media_asset_id uuid references public.media_assets(id) on delete set null, trailer_asset_id uuid references public.media_assets(id) on delete set null, status public.publish_status not null default 'draft');
create table if not exists public.clips (id uuid primary key default gen_random_uuid(), episode_id uuid references public.episodes(id) on delete set null, title text not null, slug text unique not null, media_asset_id uuid references public.media_assets(id) on delete set null, format text, status public.publish_status not null default 'draft');
create table if not exists public.playlists (id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null, description text, owner_user_id uuid references auth.users(id) on delete set null, is_editorial boolean default true, status public.publish_status not null default 'draft');
create table if not exists public.playlist_items (playlist_id uuid references public.playlists(id) on delete cascade, episode_id uuid references public.episodes(id) on delete cascade, sort_order int not null default 0, primary key(playlist_id,episode_id));

create table if not exists public.events (id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null, description text, venue text, starts_at timestamptz, ends_at timestamptz, registration_url text, livestream_id uuid references public.live_events(id) on delete set null, status public.publish_status not null default 'draft');
create table if not exists public.event_sessions (id uuid primary key default gen_random_uuid(), event_id uuid references public.events(id) on delete cascade, title text not null, starts_at timestamptz, ends_at timestamptz, room text, description text);
create table if not exists public.event_speakers (event_session_id uuid references public.event_sessions(id) on delete cascade, person_id uuid references public.people(id) on delete cascade, primary key(event_session_id,person_id));
create table if not exists public.registrations (id uuid primary key default gen_random_uuid(), event_id uuid references public.events(id) on delete cascade, user_id uuid references auth.users(id) on delete set null, email text, ticket_type text, status text, created_at timestamptz not null default now());

create table if not exists public.content_rights (id uuid primary key default gen_random_uuid(), owner_name text not null, licensor text, licensee text, territories text[], platforms text[], starts_at timestamptz, expires_at timestamptz, exclusive boolean default false, attribution text, monetization boolean, edit_rights boolean, social_rights boolean, podcast_rights boolean, streaming_rights boolean, broadcast_rights boolean, notes text);
alter table public.media_assets add constraint media_assets_rights_fk foreign key (rights_id) references public.content_rights(id) on delete set null;
create table if not exists public.releases (id uuid primary key default gen_random_uuid(), person_id uuid references public.people(id) on delete set null, asset_id uuid references public.media_assets(id) on delete set null, release_type text not null, signed_at timestamptz, expires_at timestamptz, document_asset_id uuid references public.media_assets(id) on delete set null, notes text);

create table if not exists public.advertisers (id uuid primary key default gen_random_uuid(), name text not null, website_url text, status text default 'prospect');
create table if not exists public.sponsors (id uuid primary key default gen_random_uuid(), advertiser_id uuid references public.advertisers(id) on delete cascade, tier text, starts_at timestamptz, ends_at timestamptz, approved boolean default false);
create table if not exists public.campaigns (id uuid primary key default gen_random_uuid(), advertiser_id uuid references public.advertisers(id) on delete cascade, name text not null, starts_at timestamptz, ends_at timestamptz, status text default 'draft');
create table if not exists public.ad_inventory (id uuid primary key default gen_random_uuid(), placement_key text unique not null, media_type text not null, description text, enabled boolean default false);
create table if not exists public.ad_creatives (id uuid primary key default gen_random_uuid(), campaign_id uuid references public.campaigns(id) on delete cascade, asset_id uuid references public.media_assets(id) on delete set null, destination_url text, status public.publish_status default 'draft');

create table if not exists public.newsletters (id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, description text, status public.publish_status default 'draft');
create table if not exists public.newsletter_subscribers (id uuid primary key default gen_random_uuid(), newsletter_id uuid references public.newsletters(id) on delete cascade, email text not null, consented_at timestamptz not null, unsubscribed_at timestamptz, unique(newsletter_id,email));
create table if not exists public.submissions (id uuid primary key default gen_random_uuid(), type text not null, name text, email text, sport text, competition_level text, governing_body text, situation text, description text, question text, video_url text, asset_id uuid references public.media_assets(id) on delete set null, rights_confirmed boolean not null default false, permission_confirmed boolean not null default false, moderation_status text default 'pending', created_at timestamptz not null default now());

create table if not exists public.seo_metadata (id uuid primary key default gen_random_uuid(), entity_type text not null, entity_id uuid not null, title text, description text, canonical_url text, og_image_url text, json_ld jsonb, unique(entity_type,entity_id));
create table if not exists public.analytics_events (id bigint generated always as identity primary key, user_id uuid references auth.users(id) on delete set null, anonymous_id text, event_name text not null, entity_type text, entity_id uuid, properties jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.audit_logs (id bigint generated always as identity primary key, actor_user_id uuid references auth.users(id) on delete set null, action text not null, entity_type text, entity_id uuid, before_data jsonb, after_data jsonb, created_at timestamptz not null default now());

create index if not exists episodes_publish_idx on public.episodes(status,published_at desc);
create index if not exists articles_publish_idx on public.articles(status,published_at desc);
create index if not exists live_events_status_idx on public.live_events(status,starts_at);
create index if not exists transcript_segments_search_idx on public.transcript_segments using gin (to_tsvector('english',coalesce(body,'')));


-- Podcast/network membership and subscription commerce
create table if not exists public.podcast_subscribers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text unique not null,
  first_name text not null,
  last_name text not null,
  phone text,
  marketing_consent boolean not null default false,
  interests text[] not null default '{}',
  terms_accepted_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.podcast_subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.podcast_subscribers(id) on delete cascade,
  plan_code text not null check (plan_code in ('listener','bar-member','crew-member','all-access')),
  billing_interval text not null check (billing_interval in ('free','monthly','annual')),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_checkout_session_id text unique,
  status text not null default 'incomplete',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists podcast_subscribers_email_idx on public.podcast_subscribers(lower(email));
create index if not exists podcast_subscriptions_subscriber_idx on public.podcast_subscriptions(subscriber_id,status);
