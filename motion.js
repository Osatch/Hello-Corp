'use strict';

/* ============================================================
   HELLO CORP — COUCHE D'INTERACTION
   ------------------------------------------------------------
   Ce fichier ne contient aucune animation : il se contente de
   poser des classes et des variables CSS que motion.css sait
   interpréter. Toute la restitution visuelle reste donc dans
   la feuille de style, et le site reste utilisable si ce
   script ne se charge pas.

   Chargé APRÈS shared.js : l'en-tête et le pied de page ont
   déjà été injectés dans le DOM lorsque nos écouteurs partent.
   ============================================================ */

(function () {

  /** L'utilisateur a demandé à son système de limiter les animations. */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Pointeur fin (souris / trackpad) : le survol a un sens. */
  const hasHover = window.matchMedia('(hover: hover)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initSkipLink();
    initArrows();
    initSplitTitle();
    initMarquee();
    initReveal();
    initImageFade();
    initScrollSpy();
    initHeaderState();
    initHeroParallax();
    initReadingProgress();
    initBackToTop();
    initBookingNudge();
  });

  /* ──────────────────────────────────────────────────────────
     Lien d'évitement
     Permet à un utilisateur au clavier ou au lecteur d'écran de
     sauter la navigation (7 entrées + 3 sous-menus) pour
     atteindre le contenu directement. Ajouté ici plutôt que
     dans chaque page HTML pour rester sur une seule source.
     ────────────────────────────────────────────────────────── */
  function initSkipLink() {
    if (document.querySelector('.skip-link')) return;

    // Première cible plausible, dans l'ordre de préférence.
    const target =
      document.querySelector('main') ||
      document.querySelector('.hero') ||
      document.querySelector('.page-hero') ||
      document.querySelector('.article-hero');
    if (!target) return;

    if (!target.id) target.id = 'contenu-principal';
    // Un <section> n'est pas focusable nativement : sans cela le
    // focus resterait sur le lien et la tabulation repartirait du menu.
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');

    const link = document.createElement('a');
    link.className = 'skip-link';
    link.href = '#' + target.id;
    link.textContent = 'Aller au contenu principal';
    document.body.insertBefore(link, document.body.firstChild);
  }

  /* ──────────────────────────────────────────────────────────
     Flèches des liens « Découvrir → »
     Le caractère « → » fait partie du texte : on l'isole dans un
     <span> pour pouvoir l'animer, et on le masque aux lecteurs
     d'écran qui l'énonçaient (« flèche vers la droite »).
     ────────────────────────────────────────────────────────── */
  function initArrows() {
    document.querySelectorAll('.link-more, .article-return').forEach(el => {
      if (el.querySelector('.lm-arrow')) return;
      const html = el.innerHTML;
      if (!html.includes('→')) return;
      el.innerHTML = html.replace('→', '<span class="lm-arrow" aria-hidden="true">→</span>');
    });
  }

  /* ──────────────────────────────────────────────────────────
     Révélation au défilement

     Deux différences avec l'implémentation précédente :
     • la cascade est calculée PAR GRILLE et non par sélecteur
       sur toute la page — au-delà de 4 ou 5 éléments le délai
       cumulé devenait une attente, pas un effet ;
     • le délai passe par une variable CSS (`--d`) au lieu d'un
       style inline, ce qui laisse motion.css neutraliser la
       cascade en mode « mouvement réduit ».
     ────────────────────────────────────────────────────────── */

  /* Conteneurs dont les enfants directs se révèlent en cascade. */
  const REVEAL_GRIDS = [
    '.services-main-grid', '.support-grid', '.why-grid', '.dual-grid',
    '.news-grid', '.news-page-grid', '.values-grid', '.trust-grid',
    '.stats-grid', '.article-definition-grid',
  ];

  /* Éléments qui se révèlent seuls, sans cascade. */
  const REVEAL_SINGLES = [
    '.section-header', '.booking-card', '.contact-form',
    '.article-quote', '.article-comparison', '.article-cta', '.about-panel',
  ];

  /* Paires « visuel / texte » : entrée latérale, l'une vers
     l'autre, pour souligner qu'elles forment un bloc. */
  const REVEAL_PAIRS = ['.service-detail-grid', '.about-grid', '.contact-grid'];

  const STEP = 80;      // ms entre deux éléments d'une même grille
  const MAX_STEPS = 4;  // au-delà, le délai est plafonné

  function initReveal() {
    // Sans IntersectionObserver (ou en mouvement réduit), on
    // n'applique jamais `.reveal` : le contenu reste visible.
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    const mark = (el, delayIndex, variant) => {
      if (!el || el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      if (variant) el.classList.add(variant);
      const steps = Math.min(delayIndex, MAX_STEPS);
      if (steps > 0) el.style.setProperty('--d', steps * STEP + 'ms');
    };

    REVEAL_GRIDS.forEach(sel => {
      document.querySelectorAll(sel).forEach(grid => {
        Array.from(grid.children).forEach((child, i) => mark(child, i));
      });
    });

    REVEAL_PAIRS.forEach(sel => {
      document.querySelectorAll(sel).forEach(grid => {
        const kids = Array.from(grid.children);
        mark(kids[0], 0, 'reveal--left');
        mark(kids[1], 1, 'reveal--right');
        kids.slice(2).forEach((child, i) => mark(child, i + 2));
      });
    });

    REVEAL_SINGLES.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => mark(el, 0));
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);   // une seule fois : pas d'effet yo-yo
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  /* ──────────────────────────────────────────────────────────
     En-tête : état « défilé »
     ────────────────────────────────────────────────────────── */
  function initHeaderState() {
    const header = document.getElementById('header');
    if (!header) return;

    let ticking = false;
    const update = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  /* ──────────────────────────────────────────────────────────
     Parallaxe du hero
     L'image se déplace plus lentement que la page : le bandeau
     gagne en profondeur. Désactivé au clavier/tactile et en
     mouvement réduit, et borné pour ne jamais découvrir les
     bords de l'image.
     ────────────────────────────────────────────────────────── */
  function initHeroParallax() {
    const hero = document.querySelector('.hero');
    if (!hero || reduceMotion || !hasHover || window.innerWidth < 900) return;
    if (!hero.querySelector('.hero-img')) return;

    hero.classList.add('hero-parallax');

    // L'échelle appliquée par motion.css est de 1.12 : il reste
    // 6 % de marge en haut et en bas, on n'en consomme que 5 %.
    let maxShift = hero.offsetHeight * 0.05;
    let ticking = false;

    const update = () => {
      const shift = Math.min(window.scrollY * 0.22, maxShift);
      hero.style.setProperty('--hero-shift', '-' + shift.toFixed(1) + 'px');
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener('resize', () => {
      maxShift = hero.offsetHeight * 0.05;
      update();
    }, { passive: true });

    update();
  }

  /* ──────────────────────────────────────────────────────────
     Barre de progression de lecture
     Réservée aux pages longues (articles, mentions légales) :
     sur une page courte elle n'apporterait aucun repère.
     ────────────────────────────────────────────────────────── */
  function initReadingProgress() {
    const article = document.querySelector('.article-content, .legal-content');
    if (!article) return;

    const bar = document.createElement('div');
    bar.className = 'reading-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    let ticking = false;
    const update = () => {
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      // Article plus court que la fenêtre : rien à mesurer.
      const ratio = total > 0 ? (-rect.top) / total : 0;
      bar.style.setProperty('--progress', Math.min(Math.max(ratio, 0), 1).toFixed(4));
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ──────────────────────────────────────────────────────────
     Retour en haut de page
     Absent des pages qui portent déjà le widget flottant de
     prise de rendez-vous, pour ne pas encombrer le même coin.
     ────────────────────────────────────────────────────────── */
  function initBackToTop() {
    if (document.getElementById('bookingWidget')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'to-top';
    btn.setAttribute('aria-label', 'Revenir en haut de la page');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      // Le focus doit repartir du haut, sinon la tabulation
      // reprendrait au milieu de la page qu'on vient de quitter.
      const first = document.querySelector('#header .logo');
      if (first) first.focus({ preventScroll: true });
    });

    let ticking = false;
    const update = () => {
      btn.classList.toggle('is-visible', window.scrollY > 700);
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  /* ──────────────────────────────────────────────────────────
     Relance discrète du widget de rendez-vous
     Une pulsation, une seule fois par session, et uniquement si
     le visiteur a réellement parcouru la page — un rappel qui
     se déclenche sur une page à peine ouverte est perçu comme
     une publicité.
     ────────────────────────────────────────────────────────── */
  function initBookingNudge() {
    const btn = document.getElementById('bookingWidgetBtn');
    if (!btn || reduceMotion) return;
    if (sessionStorage.getItem('hcBookingNudge') === '1') return;

    let done = false;
    const fire = () => {
      if (done || window.scrollY < 800) return;
      done = true;
      sessionStorage.setItem('hcBookingNudge', '1');
      btn.classList.add('is-calling');
      btn.addEventListener('animationend', () => btn.classList.remove('is-calling'), { once: true });
      window.removeEventListener('scroll', fire);
    };

    window.addEventListener('scroll', fire, { passive: true });
    // Le panneau ouvert rend le rappel inutile.
    btn.addEventListener('click', () => {
      done = true;
      sessionStorage.setItem('hcBookingNudge', '1');
      btn.classList.remove('is-calling');
    });
  }

  /* ──────────────────────────────────────────────────────────
     Titre du hero découpé en mots
     Chaque mot entre séparément : le titre se construit sous
     l'oeil du visiteur au lieu d'apparaître d'un bloc.
     On ne parcourt que les noeuds texte, ce qui préserve le
     <br> et le <span> de couleur déjà présents dans le titre.
     ────────────────────────────────────────────────────────── */
  function initSplitTitle() {
    const h1 = document.querySelector('.hero-content h1');
    if (!h1 || reduceMotion || h1.classList.contains('is-split')) return;

    let i = 0;
    const walk = node => {
      // Copie préalable : on va remplacer des enfants en cours de route.
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
          return;
        }
        if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) return;

        const frag = document.createDocumentFragment();
        // Le séparateur est conservé dans le découpage pour ne pas
        // perdre les espaces entre les mots.
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
          const span = document.createElement('span');
          span.className = 'w';
          span.style.setProperty('--i', i++);
          span.textContent = part;
          frag.appendChild(span);
        });
        node.replaceChild(frag, child);
      });
    };

    walk(h1);
    h1.classList.add('is-split');
  }

  /* ──────────────────────────────────────────────────────────
     Bandeau défilant
     La piste est dupliquée une fois : l'animation la décale de
     -50 %, donc la copie arrive exactement là où l'originale
     avait commencé et la boucle ne se voit pas.
     La copie est masquée aux lecteurs d'écran, qui liraient
     sinon la liste deux fois.
     ────────────────────────────────────────────────────────── */
  function initMarquee() {
    document.querySelectorAll('.hc-marquee').forEach(marquee => {
      const track = marquee.querySelector('.hc-marquee-track');
      if (!track || track.dataset.doubled === '1') return;

      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      Array.from(clone.children).forEach(child => track.appendChild(child));
      track.dataset.doubled = '1';
    });
  }

  /* ──────────────────────────────────────────────────────────
     Fondu d'apparition des images

     Le site charge la plupart de ses visuels en `lazy` : ils
     arrivent pendant le défilement et se peignent d'un bloc,
     sans transition, ce qui contredit le reste de la page.

     Trois précautions :
     • on ne masque jamais une image déjà peinte (cache,
       `fetchpriority="high"` du hero) — la masquer pour la
       redécouvrir produirait un clignotement visible ;
     • les SVG de l'interface (logo, pictogrammes) sont écartés :
       ils sont instantanés et font partie du cadre, pas du
       contenu ;
     • `error` révèle l'image au même titre que `load`, sinon un
       visuel introuvable emporterait son texte alternatif dans
       l'invisible.
     ────────────────────────────────────────────────────────── */
  function initImageFade() {
    if (reduceMotion) return;

    /** Les pixels sont disponibles : l'image est déjà à l'écran. */
    const isPainted = img => img.complete && img.naturalWidth > 0;

    const pending = [];

    document.querySelectorAll('img').forEach(img => {
      if (img.classList.contains('hc-img')) return;
      if (/\.svg(\?|#|$)/i.test(img.getAttribute('src') || '')) return;
      if (isPainted(img)) return;

      const reveal = () => img.classList.add('is-loaded');
      img.classList.add('hc-img');
      img.addEventListener('load', reveal, { once: true });
      img.addEventListener('error', reveal, { once: true });

      // Le chargement a pu se terminer entre le test ci-dessus et
      // la pose des écouteurs : dans ce cas aucun événement ne
      // viendra plus, il faut révéler tout de suite.
      if (isPainted(img)) reveal();
      else pending.push(img);
    });

    if (!pending.length) return;

    // Filet de sécurité : une requête interrompue n'émet ni
    // `load` ni `error` sur tous les
    // navigateurs. Passé ce délai, plus rien ne reste caché.
    setTimeout(() => pending.forEach(img => img.classList.add('is-loaded')), 6000);
  }

  /* ──────────────────────────────────────────────────────────
     Rubrique en cours de lecture
     Le filet de la navigation reste allumé sous la section
     visible : le visiteur sait en permanence où il se trouve
     dans la page.
     ────────────────────────────────────────────────────────── */
  function initScrollSpy() {
    const links = Array.from(document.querySelectorAll('.nav-links > li > a[href*="#"]:not(.nav-cta)'));
    if (!links.length) return;

    const page = window.location.pathname.split('/').pop() || 'index.html';
    const pairs = [];

    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const [file, hash] = href.split('#');
      // Un lien vers une autre page ne peut pas décrire la position ici.
      if (hash && (!file || file === page)) {
        const section = document.getElementById(hash);
        if (section) pairs.push({ link, section });
      }
    });
    if (!pairs.length) return;

    let ticking = false;
    const update = () => {
      // Section active = la dernière dont le haut est passé sous
      // la barre de navigation.
      let active = null;
      pairs.forEach(pair => {
        if (pair.section.getBoundingClientRect().top <= 140) active = pair.link;
      });
      pairs.forEach(pair => pair.link.classList.toggle('is-current', pair.link === active));
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

})();
