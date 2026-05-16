'use strict';

const _NAV = `
<header class="header" id="header">
  <div class="header-top">
    <div class="container header-top-inner">
      <span class="header-tagline">Hello Corp — <strong>La voix de votre entreprise</strong></span>
      <a href="tel:+33652916643" class="header-phone">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15.92v1z"/></svg>
        +33 6 52 91 66 43
      </a>
    </div>
  </div>
  <nav class="navbar" id="navbar">
    <div class="container nav-inner">
      <a href="index.html" class="logo logo-with-img">
        <img src="assets/icon.svg" alt="Hello Corp" class="logo-img"/>
        <span class="logo-text">
          <span class="logo-name"><span class="logo-add">Hello</span><span class="logo-ecom"> Corp</span></span>
          <span class="logo-slogan">La voix de votre entreprise</span>
        </span>
      </a>
      <ul class="nav-links" id="navLinks">
        <li><a href="actualites.html">Actualités</a></li>
        <li><a href="qui-sommes-nous.html">Qui sommes-nous ?</a></li>
        <li class="has-dropdown">
          <a href="prospection-b2b.html">Prospection B2B <span class="caret">▾</span></a>
          <ul class="dropdown">
            <li><a href="prospection-b2b.html#telemarketing">Télémarketing</a></li>
            <li><a href="prospection-b2b.html#prospection">Prospection téléphonique</a></li>
            <li><a href="prospection-b2b.html#etude">Étude de satisfaction</a></li>
            <li><a href="prospection-b2b.html#developper-ca">Développer votre CA</a></li>
            <li><a href="prospection-b2b.html#cse">CSE</a></li>
          </ul>
        </li>
        <li class="has-dropdown">
          <a href="relation-client.html">Relation client <span class="caret">▾</span></a>
          <ul class="dropdown">
            <li><a href="relation-client.html#telesecretariat">Télésecrétariat</a></li>
            <li><a href="relation-client.html#permanence">Permanence téléphonique</a></li>
          </ul>
        </li>
        <li class="has-dropdown">
          <a href="fonctions-support.html">Fonctions Support <span class="caret">▾</span></a>
          <ul class="dropdown">
            <li><a href="fonctions-support.html#administration">Administration / Gestion</a></li>
            <li><a href="fonctions-support.html#secretariat">Secrétariat</a></li>
            <li><a href="fonctions-support.html#rh-paie">RH / Paie</a></li>
            <li><a href="fonctions-support.html#commercial">Commercial</a></li>
            <li><a href="fonctions-support.html#communication">Communication / Marketing</a></li>
            <li><a href="fonctions-support.html#informatique">Informatique</a></li>
          </ul>
        </li>
        <li><a href="index.html#approche">Notre approche</a></li>
        <li><a href="index.html#contact" class="nav-cta">Nous contacter</a></li>
      </ul>
      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
</header>`;

const _FOOTER = `
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo">
          <img src="assets/icon.svg" alt="Hello Corp" class="footer-icon"/>
          <span class="footer-brand-name"><span class="logo-add">Hello</span><span style="color:#fff"> Corp</span></span>
        </div>
        <p class="footer-slogan">La voix de votre entreprise</p>
        <p>La 1ère entreprise de Travail à Temps Choisi en France. Votre partenaire externalisé, à la carte.</p>
        <div class="footer-social">
          <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>
          <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <ul>
          <li><a href="prospection-b2b.html">Prospection B2B</a></li>
          <li><a href="relation-client.html">Relation Client</a></li>
          <li><a href="fonctions-support.html">Fonctions Support</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Liens utiles</h4>
        <ul>
          <li><a href="qui-sommes-nous.html">À propos</a></li>
          <li><a href="index.html#approche">Notre approche</a></li>
          <li><a href="actualites.html">Actualités</a></li>
          <li><a href="index.html#contact">Recrutement</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <ul>
          <li><a href="tel:+33652916643">+33 6 52 91 66 43</a></li>
          <li><span>Lun – Ven : 8h – 19h</span></li>
          <li><span>Angers, France</span></li>
        </ul>
        <a href="index.html#contact" class="btn btn-primary footer-btn">Nous contacter</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 Hello Corp. Tous droits réservés.</p>
      <div class="footer-legal">
        <a href="#">Mentions légales</a>
        <a href="#">Politique de confidentialité</a>
        <span>Site réalisé par Mediapilote</span>
      </div>
    </div>
  </div>
</footer>`;

function _initNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  function closeAllDropdowns() {
    document.querySelectorAll('.has-dropdown.open').forEach(li => {
      li.classList.remove('open');
      const c = li.querySelector('.caret');
      if (c) c.style.transform = '';
    });
  }

  function closeMobileMenu() {
    navLinks.classList.remove('open');
    const [a, b, c] = hamburger.querySelectorAll('span');
    a.style.transform = ''; b.style.opacity = ''; c.style.transform = '';
    closeAllDropdowns();
  }

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    const [a, b, c] = hamburger.querySelectorAll('span');
    a.style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
    b.style.opacity   = open ? '0' : '1';
    c.style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
    if (!open) closeAllDropdowns();
  });

  document.querySelectorAll('.has-dropdown > a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const li     = link.parentElement;
      const isOpen = li.classList.contains('open');
      const caret  = link.querySelector('.caret');
      document.querySelectorAll('.has-dropdown.open').forEach(o => {
        if (o !== li) { o.classList.remove('open'); const c = o.querySelector('.caret'); if (c) c.style.transform = ''; }
      });
      li.classList.toggle('open', !isOpen);
      if (caret) caret.style.transform = !isOpen ? 'rotate(180deg)' : '';
    });
  });

  document.querySelectorAll('.dropdown a, .nav-links > li:not(.has-dropdown) > a').forEach(l => {
    l.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('click', e => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      closeAllDropdowns();
      if (window.innerWidth <= 768) closeMobileMenu();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeAllDropdowns(); closeMobileMenu(); }
  });

  // Active link highlight
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links > li > a:not(.nav-cta)').forEach(a => {
    const href = (a.getAttribute('href') || '').split('#')[0];
    if (href === page) { a.style.color = 'var(--blue)'; a.style.background = 'var(--blue-bg)'; }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const nr = document.getElementById('nav-root');
  const fr = document.getElementById('footer-root');
  if (nr) nr.outerHTML = _NAV;
  if (fr) fr.outerHTML = _FOOTER;
  _initNav();
});
