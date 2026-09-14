// Real Supabase-backed persistence, replacing the flat JSON file that used
// to live on the server's local disk (data loss on every redeploy on a host
// with an ephemeral filesystem, e.g. Render web services by default).
// Keeps the same create/update/find API server.js already calls.
const crypto = require('node:crypto');

const FIELD_MAP = {
  firstName: 'first_name', lastName: 'last_name', passwordHash: 'password_hash',
  currentLevel: 'current_level', advisorReview: 'advisor_review',
  termsAcceptedAt: 'terms_accepted_at', privacyAcceptedAt: 'privacy_accepted_at',
  refundAcceptedAt: 'refund_accepted_at', recurringAcceptedAt: 'recurring_accepted_at',
  stripeCustomerId: 'stripe_customer_id', stripeSubscriptionId: 'stripe_subscription_id',
  stripeSessionId: 'stripe_session_id', paymentStatus: 'payment_status',
  lastPaymentFailure: 'last_payment_failure',
};
const REVERSE_MAP = Object.fromEntries(Object.entries(FIELD_MAP).map(([k, v]) => [v, k]));

function toColumns(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) out[FIELD_MAP[k] || k] = v;
  return out;
}
function toCamel(row) {
  if (!row) return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) out[REVERSE_MAP[k] || k] = v;
  return out;
}

async function supabaseRequest(table, method, body, query = '') {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Registration database is not configured.');
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Registration database error (${response.status}): ${text}`);
  return text ? JSON.parse(text) : [];
}

async function create(data) {
  const record = { status: 'pending', ...data };
  const rows = await supabaseRequest('refzone_registrations', 'POST', toColumns(record));
  return toCamel(rows[0]);
}
async function update(id, changes) {
  const rows = await supabaseRequest(
    'refzone_registrations', 'PATCH',
    { ...toColumns(changes), updated_at: new Date().toISOString() },
    `?id=eq.${encodeURIComponent(id)}`
  );
  return toCamel(rows[0]) || null;
}
async function find(id) {
  const rows = await supabaseRequest('refzone_registrations', 'GET', undefined, `?id=eq.${encodeURIComponent(id)}&limit=1`);
  return toCamel(rows[0]) || null;
}
async function findByEmail(email) {
  const rows = await supabaseRequest('refzone_registrations', 'GET', undefined, `?email=eq.${encodeURIComponent(String(email).toLowerCase())}&limit=1`);
  return toCamel(rows[0]) || null;
}

// Minimal session support for the login endpoint — a random opaque token
// stored server-side, not a JWT. Sessions are looked up only by the server
// itself via the service-role key, never queried directly by a browser.
async function createSession(registrationId, ttlDays = 30) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + ttlDays * 86400000).toISOString();
  await supabaseRequest('refzone_sessions', 'POST', { token, registration_id: registrationId, expires_at: expiresAt });
  return { token, expiresAt };
}
async function findSession(token) {
  if (!token) return null;
  const rows = await supabaseRequest('refzone_sessions', 'GET', undefined, `?token=eq.${encodeURIComponent(token)}&limit=1`);
  const session = rows[0];
  if (!session || new Date(session.expires_at) < new Date()) return null;
  return find(session.registration_id);
}
async function deleteSession(token) {
  if (!token) return;
  await supabaseRequest('refzone_sessions', 'DELETE', undefined, `?token=eq.${encodeURIComponent(token)}`);
}

module.exports = { create, update, find, findByEmail, createSession, findSession, deleteSession };
