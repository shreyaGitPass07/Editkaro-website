/* ============================================
   EDITKARO.IN — ABOUT PAGE JS
   Features: Navbar, Mobile Menu, Scroll Reveal
   ============================================ */

// ─── NAVBAR ───────────────────────────────────
const navbar    = document.querySelector('.navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ─── MOBILE MENU ──────────────────────────────
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

// ─── SCROLL REVEAL ────────────────────────────
const revealEls = document.querySelectorAll(
  '.mv-card, .value-item, .team-card, .origin-inner, .origin-badges'
);

revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  // Stagger children in groups of 4
  const mod = i % 4;
  if (mod === 1) el.classList.add('reveal-delay-1');
  if (mod === 2) el.classList.add('reveal-delay-2');
  if (mod === 3) el.classList.add('reveal-delay-3');
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ─── NAV ACTIVE STATE ─────────────────────────
// Already set via class in HTML; no JS needed for about page.

console.log('%c[editkaro.in] About page loaded.', 
  'color: #f59e0b; font-family: monospace; font-size: 13px; font-weight: bold;'
);