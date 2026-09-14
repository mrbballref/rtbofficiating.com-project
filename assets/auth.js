// Shared Supabase-backed auth for every RTBO platform. All platforms are
// same-origin subpaths, so the default localStorage-backed Supabase session
// is visible everywhere without any extra cross-domain wiring.
//
// This wraps the REAL backend already provisioned in the RTBO Supabase
// project (migrations 20260715010000-20260716080000): a `profiles` table
// with a two-stage role model (requested_role = what the user picked at
// signup, approved_role = what a Super Admin actually granted, account_status
// = pending_email / pending_approval / active / suspended) and an
// `is_super_admin()` RPC used throughout that schema's own RLS policies.
// Role grants only ever happen server-side via the `admin_set_user_access`
// RPC (super-admin-only, audit-logged) — see supabase/README.md.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// Public, self-selectable roles — must match the `requested_role` enum.
export const REQUESTED_ROLES = ['official', 'school_league', 'vendor', 'evaluator'];

export async function signUp({ email, password, firstName, lastName, phone, requestedRole }) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone,
        requested_role: requestedRole,
      },
    },
  });
}

export async function signIn({ email, password }) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) return null;
  return data;
}

// Mirrors the database's own is_super_admin() (profiles.approved_role =
// 'super_admin' and account_status = 'active') via RPC, so the client never
// has to duplicate that logic or trust anything client-side.
export async function isSuperAdmin() {
  const { data, error } = await supabase.rpc('is_super_admin');
  if (error) return false;
  return data === true;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function resolvePostLoginDestination(userId) {
  const profile = await getProfile(userId);
  if (!profile) return '/got-u-nex-ref/user-profile/index.html';
  if (profile.account_status === 'active' && profile.approved_role === 'super_admin') {
    return '/got-u-nex-ref/super-admin-profile/index.html';
  }
  if (profile.account_status === 'active' && profile.approved_role === 'site_admin') {
    return '/got-u-nex-ref/application/admin-dashboard.html';
  }
  return '/got-u-nex-ref/user-profile/index.html';
}

// Convenience gate for privileged pages. Client-side only for UX (fast
// redirect); the real boundary is Postgres RLS + column-level grants on
// every table these pages read/write, keyed to the same is_super_admin()
// check and the account_status = 'active' requirement.
//
// Pass an empty/omitted allowedApprovedRoles for a super-admin-only page.
// A super_admin always passes, regardless of allowedApprovedRoles.
export async function requireRole(allowedApprovedRoles = [], redirectTo = '/account/index.html?view=signin') {
  const session = await getSession();
  if (!session) {
    window.location.href = redirectTo;
    return null;
  }
  if (await isSuperAdmin()) return session;
  const profile = await getProfile(session.user.id);
  const approved = profile?.account_status === 'active' && allowedApprovedRoles.includes(profile.approved_role);
  if (!approved) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}
