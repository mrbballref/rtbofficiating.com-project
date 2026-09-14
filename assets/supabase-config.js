// Public project URL + anon/publishable key only. Safe to expose client-side —
// every table these are used against is protected by Postgres RLS policies
// (see supabase/migrations/0001_shared_auth.sql). Never put a service-role
// key in this file.
export const SUPABASE_URL = 'https://xnwcgbnasvhkuiejtxer.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_HT1nrJomS9lD6uWcpDvyPw_HWr3TzAb';
