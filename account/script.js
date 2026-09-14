import { signUp, signIn, resolvePostLoginDestination } from '../assets/auth.js';

const modal = document.querySelector('.auth-modal');
const closeButton = document.querySelector('.modal-close');
const switchButtons = document.querySelectorAll('[data-switch]');
const views = document.querySelectorAll('[data-view]');
const brandMessages = document.querySelectorAll('[data-brand]');
const roleCards = document.querySelectorAll('.role-card');
const passwordButtons = document.querySelectorAll('.eye');

const params = new URLSearchParams(window.location.search);
const requestedView = params.get('view') === 'signin' ? 'signin' : 'create';

function switchAuthView(viewName) {
  views.forEach((view) => view.classList.toggle('is-active', view.dataset.view === viewName));
  brandMessages.forEach((message) => message.classList.toggle('is-active', message.dataset.brand === viewName));
  switchButtons.forEach((button) => {
    const selected = button.dataset.switch === viewName;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-selected', selected ? 'true' : 'false');
  });
}

switchAuthView(requestedView);

switchButtons.forEach((button) => {
  button.addEventListener('click', () => switchAuthView(button.dataset.switch));
});

roleCards.forEach((card) => {
  card.addEventListener('click', () => {
    roleCards.forEach((item) => item.classList.remove('is-selected'));
    card.classList.add('is-selected');
    const input = card.querySelector('input');
    if (input) input.checked = true;
  });
});

passwordButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const input = button.parentElement.querySelector('input');
    const hidden = input.type === 'password';
    input.type = hidden ? 'text' : 'password';
    button.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
  });
});

closeButton.addEventListener('click', () => {
  const embedded = new URLSearchParams(window.location.search).get('embedded') === '1';
  if (embedded && window.parent !== window) {
    window.parent.postMessage({ type: 'rtbo-close-account' }, '*');
    return;
  }
  window.location.href = '../index.html';
});

// Maps the visible role-cards (account/index.html) to the database's
// `requested_role` enum. This is only ever a *request* — actual authority
// comes from profiles.approved_role, which only a Super Admin can set via
// the admin_set_user_access() RPC. Privileged roles (super_admin, site_admin,
// etc.) are never offered here and can't be granted through signup.
function mapRoleCardToEnum(value) {
  switch (String(value || '').trim()) {
    case 'School / League':
      return 'school_league';
    case 'Vendor':
      return 'vendor';
    case 'Evaluator':
      return 'evaluator';
    default:
      return 'official';
  }
}

function showFormError(form, message) {
  let el = form.querySelector('.form-error');
  if (!el) {
    el = document.createElement('p');
    el.className = 'form-error';
    el.setAttribute('role', 'alert');
    el.style.cssText = 'color:#ff6b6b;font-size:0.85rem;margin-top:0.5rem;';
    form.appendChild(el);
  }
  el.textContent = message;
}

function clearFormError(form) {
  form.querySelector('.form-error')?.remove();
}

function setSubmitting(form, submitting) {
  const button = form.querySelector('button[type="submit"]');
  if (button) button.disabled = submitting;
}

const createForm = document.querySelector('.create-form');
if (createForm) {
  createForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormError(createForm);

    const data = new FormData(createForm);
    const password = data.get('password');
    const confirmPassword = data.get('confirmPassword');
    const email = String(data.get('email') || '').trim();

    if (!email || !password) {
      showFormError(createForm, 'Email and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      showFormError(createForm, 'Passwords do not match.');
      return;
    }
    if (!data.get('terms')) {
      showFormError(createForm, 'You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setSubmitting(createForm, true);
    const selectedRole = createForm.querySelector('input[name="role"]:checked')?.value || 'Official';
    const { data: signUpData, error } = await signUp({
      email,
      password,
      firstName: data.get('firstName'),
      lastName: data.get('lastName'),
      phone: data.get('phone'),
      requestedRole: mapRoleCardToEnum(selectedRole),
    });
    setSubmitting(createForm, false);

    if (error) {
      showFormError(createForm, error.message);
      return;
    }

    if (signUpData?.session) {
      // Email confirmation is disabled on this project — session is live immediately.
      const destination = await resolvePostLoginDestination(signUpData.user.id);
      window.location.href = destination;
      return;
    }

    // Email confirmation required: no session yet. Advance the existing
    // "Verify Email" step indicator rather than pretending we're signed in.
    document.querySelectorAll('.step').forEach((step, index) => {
      step.classList.toggle('is-active', index === 1);
    });
    createForm.reset();
    showFormError(createForm, "Check your email to verify your account, then sign in.");
    createForm.querySelector('.form-error').style.color = '#4ade80';
  });
}

const signinForm = document.querySelector('.signin-form');
if (signinForm) {
  signinForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormError(signinForm);

    const email = String(signinForm.elements.signinEmail?.value || '').trim();
    const password = signinForm.elements.signinPassword?.value || '';
    if (!email || !password) {
      showFormError(signinForm, 'Email and password are required.');
      return;
    }

    setSubmitting(signinForm, true);
    const { data, error } = await signIn({ email, password });
    setSubmitting(signinForm, false);

    if (error) {
      showFormError(signinForm, error.message);
      return;
    }

    const destination = await resolvePostLoginDestination(data.user.id);
    window.location.href = destination;
  });
}
