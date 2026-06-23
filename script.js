// ─── REPLACE WITH YOUR DEPLOYED APPS SCRIPT URLS ──
const SUBSCRIBE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzxeculPTvTfSqvTMBg4GGLaELdehZqtWrSfAkVyp18VaUKH8EnoChwfXHIMPSrhRcC/exec';

// ─── DISCLAIMER BANNER ────────────────────────
const disclaimerBar   = document.getElementById('disclaimerBar');
const disclaimerClose = document.getElementById('disclaimerClose');

if (disclaimerClose && disclaimerBar) {
  disclaimerClose.addEventListener('click', () => {
    disclaimerBar.style.transition = 'opacity 0.3s ease, max-height 0.4s ease, padding 0.4s ease';
    disclaimerBar.style.opacity    = '0';
    disclaimerBar.style.maxHeight  = '0';
    disclaimerBar.style.padding    = '0';
    disclaimerBar.style.overflow   = 'hidden';
    setTimeout(() => disclaimerBar.classList.add('hidden'), 400);
  });
}

// ─── DOM REFERENCES ───────────────────────────
const navbar        = document.querySelector('.navbar');
const hamburger     = document.getElementById('hamburger');
const mobileMenu    = document.getElementById('mobileMenu');
const filterBtns    = document.querySelectorAll('.filter-btn');
const videoCards    = document.querySelectorAll('.video-card');
const videoGrid     = document.getElementById('videoGrid');
const noResults     = document.getElementById('noResults');
const lightbox      = document.getElementById('lightbox');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxBack  = document.getElementById('lightboxBackdrop');
const lightboxPlayer= document.getElementById('lightboxPlayer');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCraft = document.getElementById('lightboxCraft');

// ─── NAVBAR: scroll shadow ─────────────────────
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
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
  const spans = hamburger.querySelectorAll('span');
  spans[0].style.transform = '';
  spans[1].style.opacity   = '';
  spans[2].style.transform = '';
}

document.addEventListener('click', (e) => {
  if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
    closeMobileMenu();
  }
});

// ─── FILTER SYSTEM ────────────────────────────
let activeFilter = 'all';

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    if (filter === activeFilter) return;

    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = filter;

    let visibleCount = 0;
    let delay = 0;

    videoCards.forEach(card => {
      const category = card.dataset.category;
      const matches  = filter === 'all' || category === filter;

      if (matches) {
        card.classList.remove('hidden');
        card.style.transitionDelay = `${delay * 60}ms`;
        card.classList.remove('visible');
        void card.offsetWidth;
        card.classList.add('visible');
        delay++;
        visibleCount++;
      } else {
        card.classList.remove('visible');
        card.style.transitionDelay = '0ms';
        setTimeout(() => {
          if (card.dataset.category !== activeFilter && activeFilter !== 'all') {
            card.classList.add('hidden');
          }
        }, 200);
      }
    });

    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  });
});

// ─── SCROLL REVEAL (Intersection Observer) ────
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
};

const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const card = entry.target;
      const cards = Array.from(videoCards);
      const cardIndex = cards.indexOf(card);
      const staggerGroup = cardIndex % 3;

      setTimeout(() => {
        card.classList.add('visible');
      }, staggerGroup * 80);

      cardObserver.unobserve(card);
    }
  });
}, observerOptions);

videoCards.forEach(card => {
  cardObserver.observe(card);
});

// ─── LIGHTBOX ─────────────────────────────────
let currentVideoId = null;

function openLightbox(videoId, title, craft, type) {
  currentVideoId = videoId;

  lightboxTitle.textContent = title;
  lightboxCraft.textContent = craft;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white`;

  lightboxPlayer.innerHTML = `
    <iframe
      src="${embedUrl}"
      title="${title}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  `;

  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => lightboxClose.blur(), 300);
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  currentVideoId = null;
  setTimeout(() => {
    lightboxPlayer.innerHTML = '';
  }, 300);
}

videoCards.forEach(card => {
  card.addEventListener('click', () => {
    const videoId = card.dataset.id;
    const title   = card.dataset.title;
    const craft   = card.dataset.craft;
    const type    = card.dataset.type;
    openLightbox(videoId, title, craft, type);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxBack.addEventListener('click', closeLightbox);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('open')) {
    closeLightbox();
  }
});

// ─── SMOOTH ANCHOR SCROLL ─────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ─── STATS COUNTER ANIMATION ──────────────────
const statNums = document.querySelectorAll('.stat-num');

function animateCounter(el, target, duration = 1200) {
  const isZero = target === 0;
  if (isZero) return;

  let start     = 0;
  const step    = Math.ceil(target / (duration / 16));
  const plus    = el.querySelector('.stat-plus');
  const plusHTML = plus ? plus.outerHTML : '';

  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.innerHTML = start + plusHTML;
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const rawText = el.textContent.replace('+', '').trim();
      const target  = parseInt(rawText, 10);

      if (!isNaN(target) && target > 0) {
        animateCounter(el, target);
      }
      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(num => statsObserver.observe(num));

// ─── HERO PARALLAX ────────────────────────────
const hero        = document.querySelector('.hero');
const heroContent = document.querySelector('.hero-content');

window.addEventListener('scroll', () => {
  if (!hero) return;
  const scrolled = window.scrollY;
  const heroH    = hero.offsetHeight;
  if (scrolled < heroH) {
    const ratio = scrolled / heroH;
    heroContent.style.transform = `translateY(${ratio * 40}px)`;
    heroContent.style.opacity   = 1 - ratio * 1.2;
  }
}, { passive: true });

// ─── CARD TILT ON HOVER (desktop only) ────────
if (window.matchMedia('(hover: hover)').matches) {
  videoCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect    = card.getBoundingClientRect();
      const x       = e.clientX - rect.left;
      const y       = e.clientY - rect.top;
      const centerX = rect.width  / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) *  4;

      card.style.transform = `
        translateY(-6px) scale(1.01)
        perspective(600px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ─── FILTER BAR: drag to scroll on mobile ─────
const filterBar = document.getElementById('filterBar');
let isDown    = false;
let startX    = 0;
let scrollLeft = 0;

filterBar.addEventListener('mousedown', (e) => {
  isDown = true;
  filterBar.style.cursor = 'grabbing';
  startX     = e.pageX - filterBar.offsetLeft;
  scrollLeft = filterBar.scrollLeft;
});
filterBar.addEventListener('mouseleave', () => {
  isDown = false;
  filterBar.style.cursor = '';
});
filterBar.addEventListener('mouseup', () => {
  isDown = false;
  filterBar.style.cursor = '';
});
filterBar.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x    = e.pageX - filterBar.offsetLeft;
  const walk = (x - startX) * 1.5;
  filterBar.scrollLeft = scrollLeft - walk;
});

// ─── EMAIL SUBSCRIBE FORM ─────────────────────
const subscribeForm    = document.getElementById('subscribeForm');
const subscribeSuccess = document.getElementById('subscribeSuccess');
const subSubmitBtn     = document.getElementById('subSubmitBtn');
const subLoader        = document.getElementById('subLoader');
const subText          = subSubmitBtn ? subSubmitBtn.querySelector('.sub-text') : null;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showSubError(field, show) {
  const err = document.getElementById('sub-error-' + field);
  const inp = document.getElementById('sub-' + field);
  if (err) err.classList.toggle('visible', show);
  if (inp) inp.classList.toggle('input-error', show);
}

// Live clear on input
if (document.getElementById('sub-name')) {
  document.getElementById('sub-name').addEventListener('input', function () {
    if (this.value.trim()) showSubError('name', false);
  });
}
if (document.getElementById('sub-email')) {
  document.getElementById('sub-email').addEventListener('input', function () {
    if (isValidEmail(this.value.trim())) showSubError('email', false);
  });
}

function validateSubscribe() {
  let valid = true;
  const name  = document.getElementById('sub-name').value.trim();
  const email = document.getElementById('sub-email').value.trim();

  if (!name)                { showSubError('name', true);  valid = false; } else showSubError('name', false);
  if (!isValidEmail(email)) { showSubError('email', true); valid = false; } else showSubError('email', false);
  return valid;
}

function setSubLoading(loading) {
  subSubmitBtn.disabled      = loading;
  subText.style.opacity      = loading ? '0' : '1';
  subLoader.classList.toggle('active', loading);
}

if (subscribeForm) {
  subscribeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateSubscribe()) return;

    setSubLoading(true);

    const data = {
      timestamp: new Date().toISOString(),
      name:      document.getElementById('sub-name').value.trim(),
      email:     document.getElementById('sub-email').value.trim(),
      source:    'homepage-subscribe'
    };

    try {
      await fetch(SUBSCRIBE_SHEET_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams(data).toString()
      });

      // Show success
      subscribeForm.style.display = 'none';
      subscribeSuccess.classList.add('visible');
    } catch (err) {
      console.error('Subscribe error:', err);
      alert('Something went wrong. Please try again or email us at hello@editkaro.in');
    } finally {
      setSubLoading(false);
    }
  });
}

// ─── INIT LOG ─────────────────────────────────
console.log('%c[editkaro.in] Portfolio loaded. Every frame counts.',
  'color: #8b5cf6; font-family: monospace; font-size: 13px; font-weight: bold;'
);