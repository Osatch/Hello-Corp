'use strict';

/* ── Navbar sticky + hamburger ── */
const header    = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  const [a, b, c] = hamburger.querySelectorAll('span');
  a.style.transform  = open ? 'rotate(45deg) translate(5px,5px)' : '';
  b.style.opacity    = open ? '0' : '1';
  c.style.transform  = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
});

navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
  navLinks.classList.remove('open');
  hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}));

/* ── Scroll reveal ── */
const revealTargets = [
  '.service-main-card',
  '.support-card',
  '.stat-item',
  '.dual-card',
  '.news-card',
  '.trust-badge',
  '.contact-left',
  '.contact-form',
];

revealTargets.forEach(sel => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.07}s`;
  });
});

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ── Contact form feedback ── */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '✓ Demande envoyée avec succès !';
    btn.style.background = '#16A34A';
    btn.style.borderColor = '#16A34A';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Envoyer ma demande';
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.disabled = false;
      form.reset();
    }, 4000);
  });
}
