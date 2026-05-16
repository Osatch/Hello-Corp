'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ── Scroll reveal ── */
  const selectors = [
    '.service-main-card', '.support-card', '.stat-item',
    '.dual-card', '.news-card', '.trust-badge',
    '.contact-left', '.contact-form',
  ];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 0.07}s`;
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ── Contact form ── */
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
        btn.style.background = btn.style.borderColor = '';
        btn.disabled = false;
        form.reset();
      }, 4000);
    });
  }

});
