(() => {
  const STORAGE_KEY = 'gunr-super-admin-profile-v1';
  const readState = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  };
  const writeState = (patch) => {
    const current = readState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
  };
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  const applyProfile = (values) => {
    const first = String(values.first || '').trim();
    const last = String(values.last || '').trim();
    const preferred = String(values.preferred || '').trim();
    const fullName = `${first} ${last}`.trim();
    const displayName = `${preferred || first} ${last}`.trim();
    setText('heroProfileName', displayName || 'Super Administrator Profile');
    setText('profileName', fullName || 'Not added');
    setText('profileEmail', String(values.email || '').trim() || 'Not added');
    setText('heroEmail', String(values.email || '').trim() || 'Email not added');
    setText('profilePhone', String(values.phone || '').trim() || 'Not added');
    const address = [values.address1, values.city, values.state, values.zip].map(v => String(v || '').trim()).filter(Boolean).join(', ');
    setText('profileAddress', address || 'Not added');
    const emergencyName = String(values.emergencyName || '').trim();
    const emergencyRelationship = String(values.emergencyRelationship || '').trim();
    setText('profileEmergency', emergencyName ? `${emergencyName}${emergencyRelationship ? ` · ${emergencyRelationship}` : ''}` : 'Not added');
    const required = [first, last, values.email, values.phone, values.address1, values.city, values.state, values.zip, values.country, values.emergencyName, values.emergencyPhone];
    const completion = Math.round(required.filter(v => String(v || '').trim()).length / required.length * 100);
    setText('profileCompletion', `${completion}%`);
    const progress = document.getElementById('profileProgress');
    if (progress) progress.style.width = `${completion}%`;
  };

  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
    const modal = document.getElementById(button.dataset.open);
    if (modal) { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); }
  }));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => {
    const modal = button.closest('.modal');
    if (modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
  }));
  document.querySelectorAll('.modal').forEach(modal => modal.addEventListener('click', event => {
    if (event.target === modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') document.querySelectorAll('.modal.open').forEach(modal => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); });
  });



  document.querySelectorAll('[data-sign-out]').forEach(link => link.addEventListener('click', (event) => {
    event.preventDefault();
    const destination = link.href;
    import('../../assets/auth.js')
      .then(({ signOut }) => signOut())
      .finally(() => { window.location.href = destination; });
  }));

  const form = document.getElementById('profileForm');
  const saved = readState().profile;
  if (form && saved) {
    Object.entries(saved).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (field && typeof value === 'string') field.value = value;
    });
    applyProfile(saved);
  }
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    writeState({ profile: values });
    applyProfile(values);
    const modal = form.closest('.modal');
    if (modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
  });
})();
