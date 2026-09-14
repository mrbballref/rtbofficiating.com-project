// Seeds the real Supabase-backed data into the exact localStorage shape the
// large existing official-portal app (script.js, calendar.js, etc.) already
// reads from — so those pages keep working unmodified, but now display real
// data instead of the fake seed content that used to live there.
//
// This is a read bridge, not a full rewrite: any editing those pages do
// beyond what's already wired on dedicated pages (edit-profile.html,
// notifications.html, pending-assignment.html) still only writes back to
// localStorage, not to Supabase. Real availability-setting via a calendar UI
// is not wired yet — see supabase/README.md for the current status.
import { supabase, getSession } from '../../assets/auth.js';

const STORAGE_KEY = 'gotUNexRef.officialPortal.v3';

function toDollars(cents) {
  return typeof cents === 'number' ? cents / 100 : undefined;
}

async function buildAssignments(list) {
  const items = (list || []).slice(0, 30);
  const details = await Promise.all(items.map(async (row) => {
    const { data } = await supabase.rpc('official_get_assignment_detail', {
      target_assignment_officials_id: row.assignment_officials_id,
    });
    return { row, data };
  }));
  return details.map(({ row, data }) => ({
    id: row.assignment_officials_id,
    gameId: row.assignment_id,
    status: row.crew_status === 'assigned' ? 'pending' : row.crew_status,
    workflowStatus: row.crew_status === 'assigned' ? 'pending' : row.crew_status,
    date: row.game_date,
    time: row.game_time,
    level: row.level,
    homeSchool: data?.home_team_name || '',
    homeTeam: data?.home_team_name || '',
    awaySchool: data?.visiting_team_name || '',
    awayTeam: data?.visiting_team_name || '',
    venue: row.venue_name || data?.venue_name || '',
    address: data?.venue_address || '',
    venuePhone: data?.venue_phone || '',
    pay: toDollars(row.pay_cents),
    notes: data?.notes || '',
    crew: (data?.crew || []).map((c) => ({ name: c.name, position: c.position })),
  }));
}

function computeStats(assignments, evaluations) {
  const now = new Date();
  let completed = 0, upcoming = 0, cancelled = 0;
  assignments.forEach((a) => {
    const gameDate = a.date ? new Date(`${a.date}T12:00:00`) : null;
    const isPast = gameDate && gameDate < now;
    if (a.status === 'declined') cancelled++;
    else if (a.status === 'accepted' && isPast) completed++;
    else if (a.status === 'accepted' || a.status === 'pending') upcoming++;
  });
  const scored = (evaluations || []).filter((e) => typeof e.overall_score === 'number');
  const rating = scored.length ? (scored.reduce((sum, e) => sum + e.overall_score, 0) / scored.length) : null;
  return { total: assignments.length, completed, upcoming, cancelled, rating, reviews: (evaluations || []).length };
}

export async function syncPortalData() {
  const session = await getSession();
  if (!session) { window.location.href = '/account/index.html?view=signin'; return false; }

  const [profileRes, assignmentsRes, notificationsRes, messagesRes, evaluationsRes, incidentsRes] = await Promise.all([
    supabase.rpc('official_get_my_profile'),
    supabase.rpc('official_list_my_assignments'),
    supabase.rpc('list_my_gunr_notifications'),
    supabase.rpc('list_my_gunr_messages'),
    supabase.rpc('official_list_my_evaluations'),
    supabase.rpc('official_list_my_incidents'),
  ]);

  const p = profileRes.data || {};
  const assignments = await buildAssignments(assignmentsRes.data);
  const evaluations = evaluationsRes.data || [];

  const state = {
    profile: {
      firstName: p.first_name || '', lastName: p.last_name || '', preferredName: '',
      dateOfBirth: p.date_of_birth || '', officialId: (p.id || '').slice(0, 8), role: p.approved_role || p.requested_role || '',
      email: p.email || '', phone: p.mobile_phone || p.phone || '',
      streetAddress: p.address_line_1 || '', address2: p.address_line_2 || '', city: p.city || '', state: p.state || '',
      postalCode: p.postal_code || '', country: p.country || '', timezone: '',
      primarySport: p.primary_sport || '', yearsExperience: p.years_experience || '', preferredLevel: p.preferred_level || '',
      uniformSize: p.uniform_size || '', nfhsNumber: p.nfhs_number || '',
      accountStatus: p.account_status || '', backgroundStatus: p.background_status || 'not_started', backgroundDate: p.background_checked_at || '',
      safeSportStatus: p.safe_sport_status || 'not_started', safeSportDate: p.safe_sport_expires_at || '', idExpiry: p.id_card_expires_at || '',
      photoDataUrl: p.profile_photo_url || '',
    },
    accountStats: computeStats(assignments, evaluations),
    assignments,
    availability: { values: [
      ['unset','unset','unset','unset','unset','unset','unset'],
      ['unset','unset','unset','unset','unset','unset','unset'],
      ['unset','unset','unset','unset','unset','unset','unset'],
    ], savedAt: '' },
    documents: [], requiredForms: [], uploads: [],
    evaluations: evaluations.map((e) => ({
      id: e.id, gameTitle: e.game_title, gameDate: e.evaluation_date, level: e.level, gender: e.gender,
      overallScore: e.overall_score, scores: e.scores, comments: e.comments_visible_to_official ? e.comments : '',
      status: e.status,
    })),
    incidents: (incidentsRes.data || []).map((i) => ({
      id: i.id, incidentNumber: i.incident_number, category: i.category, status: i.status,
      summary: i.summary, submittedAt: i.submitted_at, adminPublicResponse: i.admin_public_response,
    })),
    messages: (messagesRes.data || []).map((m) => ({
      id: m.id, subject: m.subject, body: m.body, direction: m.sender_id === session.user.id ? 'sent' : 'received',
      read: m.read, date: m.created_at, createdAt: m.created_at,
    })),
    notifications: (notificationsRes.data || []).map((n) => ({
      id: n.id, title: n.title, message: n.body, body: n.body, category: n.category, priority: n.priority,
      read: n.read, createdAt: n.created_at, date: n.created_at,
    })),
    schools: [], whiteboard: [], supportTickets: [],
    permissions: [],
    authorization: { canCreateAssignments: false },
    settings: { emailAssignmentAlerts:false, smsAssignmentAlerts:false, documentReminders:false, evaluationNotifications:false, crewPhoneVisibility:false },
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return true;
}

// Runs the real data sync to completion BEFORE loading the page's own
// (classic, non-module) script — injected explicitly here rather than via a
// second <script> tag, since relying on document order between a deferred
// module with top-level await and a classic deferred script isn't a safe
// ordering guarantee across browsers.
await syncPortalData();
const thenScript = new URL(import.meta.url).searchParams.get('then');
if (thenScript) {
  const s = document.createElement('script');
  s.src = thenScript;
  document.body.appendChild(s);
}
