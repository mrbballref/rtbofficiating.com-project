import { supabase, requireRole } from '../../assets/auth.js';

(async () => {
  'use strict';

  const session = await requireRole(['site_admin']);
  if (!session) return;

  const ALLOWED_ROLES = [
    'super_admin', 'site_admin', 'official', 'coach', 'assistant_coach',
    'athletic_director', 'assistant_athletic_director', 'sid',
    'game_day_admin', 'conference_commissioner', 'evaluator', 'observer',
    'vendor', 'student',
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let timer;
  const toast = (m) => {
    const e = $('#toast');
    if (!e) return;
    e.textContent = m;
    e.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => e.classList.remove('show'), 1700);
  };

  let officials = [];

  async function load() {
    const { data, error } = await supabase.rpc('admin_list_officials', { search_text: null });
    if (error) {
      toast(`Could not load users: ${error.message}`);
      officials = [];
      return;
    }
    officials = data || [];
  }

  function initials(u) {
    return `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase() || '—';
  }

  function fillRoles() {
    const roles = [...new Set(officials.map((u) => u.approved_role).filter(Boolean))].sort();
    $('#roleFilter').innerHTML = '<option value="">All Roles</option>' + roles.map((r) => `<option value="${esc(r)}">${esc(r)}</option>`).join('');
    const q = new URLSearchParams(location.search).get('role');
    if (q) {
      const match = roles.find((r) => r.toLowerCase().includes(q.toLowerCase()));
      if (match) $('#roleFilter').value = match;
    }
  }

  function filtered() {
    const q = $('#userSearch').value.trim().toLowerCase();
    const role = $('#roleFilter').value;
    const status = $('#statusFilter').value;
    return officials.filter((u) => {
      const hay = [u.first_name, u.last_name, u.email].filter(Boolean).join(' ').toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (role && u.approved_role !== role) return false;
      const active = u.account_status === 'active' ? 'active' : 'inactive';
      if (status && active !== status) return false;
      return true;
    });
  }

  function render() {
    const items = filtered();
    const body = $('#usersBody');
    body.innerHTML = items.map((u) => {
      const active = u.account_status === 'active' ? 'active' : 'inactive';
      const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || 'User';
      return `<tr>
        <td><div class="user-name"><div class="mini-avatar">${esc(initials(u))}</div><div><strong>${esc(name)}</strong><br><small>${esc(u.email || '')}</small></div></div></td>
        <td><button type="button" class="link-btn" data-edit-role="${esc(u.id)}">${esc(u.approved_role || 'unassigned')}</button></td>
        <td>${esc(u.account_status)}</td>
        <td>&mdash;</td>
        <td><span class="status-pill ${active === 'inactive' ? 'inactive' : ''}">${active === 'active' ? 'Active' : 'Inactive'}</span></td>
        <td>${esc(u.requested_role ? 'Requested: ' + u.requested_role : '—')}</td>
        <td><div class="row-actions"><button type="button" data-toggle-user="${esc(u.id)}">${active === 'active' ? 'Suspend' : 'Activate'}</button></div></td>
      </tr>`;
    }).join('');
    $('#usersEmpty').hidden = items.length > 0;
    $('#usersCount').textContent = `${items.length} user${items.length === 1 ? '' : 's'}`;
  }

  function bind() {
    $$('#userSearch,#roleFilter,#statusFilter,#inviteFilter').forEach((el) => el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', render));

    document.addEventListener('click', async (e) => {
      const toggle = e.target.closest('[data-toggle-user]');
      if (toggle) {
        const u = officials.find((x) => x.id === toggle.dataset.toggleUser);
        if (!u) return;
        const nextStatus = u.account_status === 'active' ? 'suspended' : 'active';
        const { error } = await supabase.rpc('admin_set_user_access', {
          target_user_id: u.id, new_role: u.approved_role || 'official', new_status: nextStatus,
        });
        if (error) { toast(error.message); return; }
        await load();
        fillRoles();
        render();
        toast(`Account ${nextStatus === 'active' ? 'activated' : 'suspended'}.`);
        return;
      }

      const editRole = e.target.closest('[data-edit-role]');
      if (editRole) {
        const u = officials.find((x) => x.id === editRole.dataset.editRole);
        if (!u) return;
        const next = prompt(`Set approved role for ${u.first_name} ${u.last_name}.\nAllowed: ${ALLOWED_ROLES.join(', ')}`, u.approved_role || 'official');
        if (!next || !ALLOWED_ROLES.includes(next.trim())) {
          if (next) toast('Not a valid role.');
          return;
        }
        const { error } = await supabase.rpc('admin_set_user_access', {
          target_user_id: u.id, new_role: next.trim(), new_status: u.account_status === 'active' ? 'active' : 'active',
        });
        if (error) { toast(error.message); return; }
        await load();
        fillRoles();
        render();
        toast('Role updated.');
      }
    });

    $('#exportUsersBtn').addEventListener('click', () => {
      const rows = filtered();
      const headers = ['First Name', 'Last Name', 'Email', 'Approved Role', 'Requested Role', 'Status'];
      const csv = [headers, ...rows.map((u) => [u.first_name, u.last_name, u.email, u.approved_role, u.requested_role, u.account_status])]
        .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'got-u-nex-ref-users.csv';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 500);
    });
  }

  await load();
  fillRoles();
  bind();
  render();
})();
