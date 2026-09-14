import { supabase, getSession } from '../../assets/auth.js';

(async () => {
  'use strict';

  const session = await getSession();
  if (!session) { window.location.href = '/account/index.html?view=signin'; return; }

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const { data: profile, error: profileError } = await supabase.rpc('official_get_my_profile');
  if (profileError || !profile) {
    showToast('Could not load your profile.');
  }

  // Maps the real profiles/official_profiles columns onto the field names
  // this page's markup already uses.
  const p = {
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    preferredName: '',
    dateOfBirth: profile?.date_of_birth || '',
    officialId: (profile?.id || '').slice(0, 8),
    role: profile?.approved_role || profile?.requested_role || '',
    email: profile?.email || '',
    phone: profile?.mobile_phone || profile?.phone || '',
    streetAddress: profile?.address_line_1 || '',
    address2: profile?.address_line_2 || '',
    city: profile?.city || '',
    state: profile?.state || '',
    postalCode: profile?.postal_code || '',
    country: profile?.country || '',
    timezone: '',
    primarySport: profile?.primary_sport || '',
    yearsExperience: profile?.years_experience || '',
    preferredLevel: profile?.preferred_level || '',
    uniformSize: profile?.uniform_size || '',
    nfhsNumber: profile?.nfhs_number || '',
    accountStatus: profile?.account_status || '',
    backgroundStatus: profile?.background_status || 'not_started',
    backgroundDate: profile?.background_checked_at || '',
    safeSportStatus: profile?.safe_sport_status || 'not_started',
    safeSportDate: profile?.safe_sport_expires_at || '',
    idExpiry: profile?.id_card_expires_at || '',
    photoDataUrl: profile?.profile_photo_url || '',
  };
  let original = JSON.stringify(p);

  const fields = ['firstName','lastName','preferredName','dateOfBirth','email','phone','streetAddress','city','state','postalCode','yearsExperience','preferredLevel','primarySport','uniformSize','nfhsNumber'];
  const selectEnsure = (el, value) => {
    if (!el) return;
    if (el.tagName === 'SELECT' && value && ![...el.options].some((o) => o.value === value)) {
      const o = document.createElement('option');
      o.value = value; o.textContent = value;
      el.appendChild(o);
    }
    el.value = value || '';
  };

  function hydrate() {
    fields.forEach((k) => selectEnsure($('#' + k), p[k]));
    if (p.photoDataUrl) {
      const src = p.photoDataUrl;
      if ($('#profilePhoto')) $('#profilePhoto').src = src;
      if ($('#previewPhoto')) $('#previewPhoto').src = src;
      if ($('#desktopPhoto')) $('#desktopPhoto').src = src;
    }
    syncPreview();
  }

  function syncPreview() {
    const first = $('#firstName').value.trim(), last = $('#lastName').value.trim();
    const name = [first, last].filter(Boolean).join(' ') || 'Profile not completed';
    if ($('#previewName')) $('#previewName').textContent = name;
    if ($('#desktopName')) $('#desktopName').textContent = name;
    if ($('#previewRole')) $('#previewRole').textContent = (p.role || 'Role not provided').toUpperCase();
    if ($('#desktopRole')) $('#desktopRole').textContent = p.role || 'Role not provided';
    if ($('#previewId')) $('#previewId').textContent = p.officialId || 'Not issued';
    if ($('#desktopOfficialId')) $('#desktopOfficialId').textContent = p.officialId || 'Not issued';
    if ($('#previewSport')) $('#previewSport').textContent = $('#primarySport').value || 'Not provided';
    if ($('#desktopSport')) $('#desktopSport').textContent = $('#primarySport').value || 'Not provided';
    if ($('#previewYears')) $('#previewYears').textContent = $('#yearsExperience').value || 'Not provided';
    if ($('#previewLevel')) $('#previewLevel').textContent = $('#preferredLevel').value || 'Not provided';
    if ($('#previewNfhs')) $('#previewNfhs').textContent = $('#nfhsNumber').value || 'Not provided';
    if ($('#backgroundStatus')) $('#backgroundStatus').textContent = p.backgroundStatus || 'Not on file';
    if ($('#safeSportStatus')) $('#safeSportStatus').textContent = p.safeSportStatus || 'Not on file';
    if ($('#backgroundDate')) $('#backgroundDate').textContent = p.backgroundDate || '';
    if ($('#safeSportDate')) $('#safeSportDate').textContent = p.safeSportDate || '';
    if ($('#previewBackground')) $('#previewBackground').textContent = p.backgroundStatus || 'Not on file';
    if ($('#previewSafe')) $('#previewSafe').textContent = p.safeSportStatus || 'Not on file';
  }

  fields.forEach((k) => $('#' + k)?.addEventListener('input', syncPreview));
  fields.forEach((k) => $('#' + k)?.addEventListener('change', syncPreview));

  const drop = $('#photoDrop'), photoInput = $('#photoInput');
  if (drop) {
    ['dragenter', 'dragover'].forEach((evt) => drop.addEventListener(evt, (e) => { e.preventDefault(); drop.style.borderColor = '#ff4b17'; }));
    ['dragleave', 'drop'].forEach((evt) => drop.addEventListener(evt, (e) => { e.preventDefault(); drop.style.borderColor = ''; }));
    drop.addEventListener('drop', (e) => handlePhoto(e.dataTransfer.files[0]));
  }
  photoInput?.addEventListener('change', () => handlePhoto(photoInput.files[0]));

  function handlePhoto(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Profile photo must be 5MB or smaller.'); return; }
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { showToast('Use a JPG, PNG, or WEBP image.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if ($('#profilePhoto')) $('#profilePhoto').src = reader.result;
      if ($('#previewPhoto')) $('#previewPhoto').src = reader.result;
      if ($('#desktopPhoto')) $('#desktopPhoto').src = reader.result;
      p.photoDataUrl = reader.result;
      showToast('Profile photo ready to save.');
    };
    reader.readAsDataURL(file);
  }

  $('#saveBtn')?.addEventListener('click', async () => {
    fields.forEach((k) => { p[k] = $('#' + k).value.trim ? $('#' + k).value.trim() : $('#' + k).value; });

    const { error } = await supabase.rpc('official_update_my_profile', {
      official_mobile_phone: p.phone,
      official_alternate_phone: '',
      official_address_line_1: p.streetAddress,
      official_city: p.city,
      official_state: p.state,
      official_postal_code: p.postalCode,
      official_emergency_contact_name: '',
      official_emergency_contact_relationship: '',
      official_emergency_contact_phone: '',
      official_uniform_size: p.uniformSize,
    });
    if (error) { showToast(`Could not save: ${error.message}`); return; }

    original = JSON.stringify(p);
    showToast('Profile changes saved.');
    setTimeout(() => { location.href = 'my-profile.html#profile'; }, 300);
  });

  $('#cancelBtn')?.addEventListener('click', () => {
    const changed = JSON.stringify(currentForm()) !== original || ($('#profilePhoto')?.src.startsWith('data:') && $('#profilePhoto').src !== p.photoDataUrl);
    if (changed && !confirm('Discard unsaved profile changes?')) return;
    location.href = 'my-profile.html#profile';
  });

  function currentForm() {
    const q = { ...p };
    fields.forEach((k) => { q[k] = $('#' + k).value.trim ? $('#' + k).value.trim() : $('#' + k).value; });
    return q;
  }

  // Documents are not yet backed by a real table (contracts/tax-forms/uploads
  // are intentionally out of scope for now) — the empty state below is
  // accurate, not a placeholder bug.
  function renderEditDocuments() {
    const target = $('#editDocumentRows');
    if (!target) return;
    target.innerHTML = '<div class="edit-document-empty">No completed documents on file.</div>';
  }
  renderEditDocuments();
  $('#manageDocs')?.addEventListener('click', () => location.href = 'my-profile.html#documents');

  $$('.preview-toggle').forEach((btn) => btn.addEventListener('click', () => {
    const mode = btn.dataset.preview;
    $$('.preview-toggle').forEach((b) => b.classList.toggle('active', b === btn));
    if ($('#phonePreview')) $('#phonePreview').hidden = mode !== 'mobile';
    if ($('#desktopPreview')) $('#desktopPreview').hidden = mode !== 'desktop';
    if ($('#previewNote')) $('#previewNote').textContent = mode === 'mobile'
      ? 'This is how your profile appears in the Got U Nex Ref mobile app.'
      : 'This is how your profile appears in the Got U Nex Ref desktop portal.';
  }));

  const modal = $('#modalBackdrop');
  $$('[data-modal]').forEach((btn) => btn.addEventListener('click', () => openCompliance(btn.dataset.modal)));
  $('#modalClose')?.addEventListener('click', () => modal.hidden = true);
  modal?.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });
  function openCompliance(type) {
    const isBg = type === 'background';
    $('#modalTitle').textContent = isBg ? 'Background Check' : 'SafeSport Status';
    $('#modalBody').innerHTML = `<p><strong>Status:</strong> ${isBg ? p.backgroundStatus : p.safeSportStatus}<br><strong>Verified:</strong> ${isBg ? p.backgroundDate : p.safeSportDate}</p><p>This status is synchronized with the Got U Nex Ref admin/compliance dashboard. Officials can review the record here and manage supporting documents from the Documents area.</p><div class="modal-actions"><a class="primary" href="my-profile.html#documents">Manage Compliance Documents</a><a href="my-profile.html#profile">Back to Profile</a></div>`;
    modal.hidden = false;
  }

  function showToast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  const editMessageBadge = document.querySelector('.side-nav .nav-badge');
  if (editMessageBadge) {
    const { data: messages } = await supabase.rpc('list_my_gunr_messages');
    const unread = (messages || []).filter((m) => !m.read && m.sender_id !== session.user.id).length;
    editMessageBadge.textContent = unread;
    editMessageBadge.hidden = unread === 0;
  }

  hydrate();
})();
