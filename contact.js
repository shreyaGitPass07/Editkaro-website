/* ============================================
   EDITKARO.IN — CONTACT PAGE JS
   Features: Navbar, Mobile Menu, Form Validation,
             Google Sheets Submission
   ============================================ */

// ─── REPLACE THIS WITH YOUR DEPLOYED APPS SCRIPT URL ──
const CONTACT_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzxeculPTvTfSqvTMBg4GGLaELdehZqtWrSfAkVyp18VaUKH8EnoChwfXHIMPSrhRcC/exec';

// ─── NAVBAR ───────────────────────────────────
const navbar     = document.querySelector('.navbar');
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  const spans = hamburger.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  }
});

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', false);
  hamburger.querySelectorAll('span').forEach(s => {
    s.style.transform = '';
    s.style.opacity   = '';
  });
}

document.addEventListener('click', (e) => {
  if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
    closeMobileMenu();
  }
});

// ─── FORM ELEMENTS ────────────────────────────
const contactForm    = document.getElementById('contactForm');
const formSuccess    = document.getElementById('formSuccess');
const formReset      = document.getElementById('formReset');
const formSubmitBtn  = document.getElementById('formSubmitBtn');
const submitLoader   = document.getElementById('submitLoader');
const submitText     = formSubmitBtn.querySelector('.submit-text');

// ─── VALIDATION HELPERS ───────────────────────
function showError(fieldId, show = true) {
  const errEl = document.getElementById('error-' + fieldId);
  const input = document.getElementById('cf-' + fieldId) ||
                document.getElementById(fieldId);
  if (errEl) errEl.classList.toggle('visible', show);
  if (input) input.classList.toggle('input-error', show);
}

function clearError(fieldId) {
  showError(fieldId, false);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── LIVE VALIDATION ──────────────────────────
document.getElementById('cf-name').addEventListener('input', function () {
  if (this.value.trim()) clearError('name');
});
document.getElementById('cf-email').addEventListener('input', function () {
  if (isValidEmail(this.value.trim())) clearError('email');
});
document.getElementById('cf-budget').addEventListener('change', function () {
  if (this.value) clearError('budget');
});
document.getElementById('cf-message').addEventListener('input', function () {
  if (this.value.trim().length >= 10) clearError('message');
});
document.querySelectorAll('input[name="editType"]').forEach(cb => {
  cb.addEventListener('change', () => {
    const anyChecked = document.querySelectorAll('input[name="editType"]:checked').length > 0;
    if (anyChecked) clearError('editType');
  });
});

// ─── FORM VALIDATION ──────────────────────────
function validateForm() {
  let valid = true;

  const name = document.getElementById('cf-name').value.trim();
  if (!name) { showError('name'); valid = false; } else clearError('name');

  const email = document.getElementById('cf-email').value.trim();
  if (!isValidEmail(email)) { showError('email'); valid = false; } else clearError('email');

  const budget = document.getElementById('cf-budget').value;
  if (!budget) { showError('budget'); valid = false; } else clearError('budget');

  const editTypes = Array.from(document.querySelectorAll('input[name="editType"]:checked'));
  if (editTypes.length === 0) { showError('editType'); valid = false; } else clearError('editType');

  const message = document.getElementById('cf-message').value.trim();
  if (message.length < 10) { showError('message'); valid = false; } else clearError('message');

  return valid;
}

// ─── COLLECT FORM DATA ────────────────────────
function collectFormData() {
  const editTypes = Array.from(
    document.querySelectorAll('input[name="editType"]:checked')
  ).map(cb => cb.value).join(', ');

  return {
    timestamp:      new Date().toISOString(),
    name:           document.getElementById('cf-name').value.trim(),
    email:          document.getElementById('cf-email').value.trim(),
    phone:          document.getElementById('cf-phone').value.trim() || '—',
    budget:         document.getElementById('cf-budget').value,
    editTypes:      editTypes,
    deadline:       document.getElementById('cf-deadline').value || '—',
    message:        document.getElementById('cf-message').value.trim(),
    referenceLinks: document.getElementById('cf-ref').value.trim() || '—',
    source:         'contact-form'
  };
}

// ─── SET LOADING STATE ────────────────────────
function setLoading(loading) {
  formSubmitBtn.disabled = loading;
  submitText.style.opacity  = loading ? '0' : '1';
  submitLoader.classList.toggle('active', loading);
}

// ─── SUBMIT FORM ──────────────────────────────
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);

  const data = collectFormData();

  try {
    // POST to Google Apps Script as URL-encoded form
    await fetch(CONTACT_SHEET_URL, {
      method: 'POST',
      mode:   'no-cors',        // Apps Script requires no-cors
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString()
    });

    // no-cors means we can't read the response — assume success
    showSuccess();
  } catch (err) {
    // Network error fallback
    console.error('Submission error:', err);
    alert('Something went wrong. Please email us directly at hello@editkaro.in');
  } finally {
    setLoading(false);
  }
});

// ─── SHOW SUCCESS ─────────────────────────────
function showSuccess() {
  contactForm.style.display  = 'none';
  formSuccess.classList.add('visible');
  document.querySelector('.contact-form-header').style.display = 'none';
  window.scrollTo({ top: document.querySelector('.contact-form-wrap').offsetTop - 100, behavior: 'smooth' });
}

// ─── RESET FORM ───────────────────────────────
formReset.addEventListener('click', () => {
  contactForm.reset();
  contactForm.style.display = '';
  formSuccess.classList.remove('visible');
  document.querySelector('.contact-form-header').style.display = '';
});

console.log('%c[editkaro.in] Contact page loaded.', 
  'color: #8b5cf6; font-family: monospace; font-size: 13px; font-weight: bold;'
);