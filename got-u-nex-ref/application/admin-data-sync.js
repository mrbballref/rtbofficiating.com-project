// Admin-side counterpart to portal-data-sync.js: seeds real Supabase data
// into the localStorage keys the large pre-existing admin tooling
// (admin-dashboard.js, quick-assign.js, admin-create-assignment.js,
// admin-game-assignments.js, admin-master-schedule.js, admin-payments.js,
// admin-profile.js, admin-add-user.js, admin-contract-generator.js,
// admin-invoice-generator.js, admin-navigation.js, admin-section-main.js)
// already reads — so that tooling keeps working unmodified but now shows
// real officials/assignments/notifications/messages instead of the fake
// seed content that used to live there.
import { supabase, getSession, requireRole } from '../../assets/auth.js';

const DASHBOARD_KEY = 'gotUNexRef.adminDashboard.v1';
const ASSIGNMENTS_KEY = 'gotUNexRef.adminAssignments.v1';

function toDollars(cents) { return typeof cents === 'number' ? cents / 100 : undefined; }

function mapUser(u) {
  return {
    id: u.id, firstName: u.first_name || '', lastName: u.last_name || '', email: u.email || '',
    role: u.approved_role || u.requested_role || '', roleLabel: u.approved_role || u.requested_role || '',
    organization: '', organizationLabel: '',
    username: '', primarySport: u.primary_sport || '', preferredLevel: u.preferred_level || '',
    security: { accountActive: u.account_status === 'active' },
    invitation: { status: u.account_status === 'pending_approval' ? 'pending' : 'not-scheduled' },
    profilePhoto: '', createdAt: u.created_at,
  };
}

async function buildAssignments(rows) {
  const items = (rows || []).slice(0, 50);
  const details = await Promise.all(items.map(async (row) => {
    const { data } = await supabase.rpc('admin_get_assignment', { target_id: row.id });
    return data || row;
  }));
  return details.map((a) => ({
    id: a.id,
    date: a.game_date, time: a.game_time,
    homeTeam: a.home_team_name || '', visitingTeam: a.visiting_team_name || '', awayTeam: a.visiting_team_name || '',
    sport: a.sport, level: a.level, gender: a.gender,
    venue: a.venue_name || '', address: a.venue_address || '',
    status: a.status, workflowStatus: a.status, publishStatus: a.publish_status,
    published: a.publish_status === 'published',
    crewSize: a.crew_size, pay: toDollars(a.estimated_total_pay_cents),
    notes: a.notes || '',
    crew: (a.crew || []).map((c) => ({
      id: c.official_id, officialId: c.official_id, name: c.official_name, role: c.position, position: c.position,
    })),
  }));
}

export async function syncAdminData() {
  const session = await requireRole(['site_admin']);
  if (!session) return false;

  const [officialsRes, assignmentsRes, incidentsRes] = await Promise.all([
    supabase.rpc('admin_list_officials', { search_text: null }),
    supabase.rpc('admin_list_assignments', { search_text: null, status_filter: null, date_from: null, date_to: null }),
    supabase.rpc('admin_list_incidents', { status_filter: null }),
  ]);

  const users = (officialsRes.data || []).map(mapUser);
  const assignments = await buildAssignments(assignmentsRes.data);

  let dashboardState = {};
  try { dashboardState = JSON.parse(localStorage.getItem(DASHBOARD_KEY) || 'null') || {}; } catch { dashboardState = {}; }
  dashboardState.users = users;
  dashboardState.drafts = assignments.filter((a) => a.status === 'draft');
  dashboardState.options = dashboardState.options || {};
  dashboardState.options.currentAdmin = {
    name: [session.user.user_metadata?.first_name, session.user.user_metadata?.last_name].filter(Boolean).join(' ') || session.user.email,
    role: 'Super Admin', photo: '',
  };
  dashboardState.options.incidentReports = (incidentsRes.data || []).map((i) => ({
    id: i.id, incidentNumber: i.incident_number, category: i.category, status: i.status,
    summary: i.summary, event: i.event, location: i.location, submittedByName: i.submitted_by_name,
    submittedAt: i.submitted_at, closedAt: i.closed_at,
  }));
  dashboardState.notifications = [];
  dashboardState.messages = [];
  localStorage.setItem(DASHBOARD_KEY, JSON.stringify(dashboardState));

  let assignmentsState = {};
  try { assignmentsState = JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY) || 'null') || {}; } catch { assignmentsState = {}; }
  assignmentsState.assignments = assignments;
  assignmentsState.drafts = assignments.filter((a) => a.status === 'draft');
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignmentsState));

  return true;
}

function loadScriptSequentially(src) {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = resolve;
    document.body.appendChild(s);
  });
}

await syncAdminData();
const thenScripts = (new URL(import.meta.url).searchParams.get('then') || '').split(',').filter(Boolean);
for (const src of thenScripts) {
  await loadScriptSequentially(src);
}
