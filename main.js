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

  /* ──────────────────────────────────────────────────────────────────────
     Formulaire de contact

     Le mode d'envoi est choisi automatiquement selon l'hébergement :

     • Hébergement PHP (LWS, OVH, o2switch…)  → contact.php
     • Hébergement statique (GitHub Pages, Netlify, Vercel…) → FormSubmit,
       car le PHP n'y est pas exécuté. Aucun compte ni clé à créer : le
       service envoie un email de confirmation à l'adresse de réception lors
       du tout premier envoi, il suffit de cliquer sur le lien une fois.

     Pour forcer un mode, remplacer `mode: 'auto'` par 'php' ou 'formsubmit'.
     ────────────────────────────────────────────────────────────────────── */
  const CONTACT_CONFIG = {
    mode: 'auto',                                  // 'auto' | 'php' | 'formsubmit'
    email: 'contact@hellocorp.fr',                 // adresse de réception (mode statique)
    subject: 'Nouvelle demande de contact - Site Hello Corp',
  };

  const SUCCESS_MESSAGE  = 'Merci ! Votre demande a bien été envoyée, nous revenons vers vous rapidement.';
  const FALLBACK_MESSAGE = "L'envoi n'a pas abouti. Merci de nous écrire à contact@hellocorp.fr ou de nous appeler au 01 87 66 66 57.";

  /** Hébergements statiques connus : le PHP n'y fonctionne pas. */
  const STATIC_HOSTS = ['github.io', 'netlify.app', 'vercel.app', 'pages.dev'];

  const form = document.getElementById('contactForm');
  if (form) {
    const status = document.getElementById('formStatus');

    const isStaticHost = STATIC_HOSTS.some(host => location.hostname.endsWith(host));
    const mode = CONTACT_CONFIG.mode === 'auto'
      ? (isStaticHost ? 'formsubmit' : 'php')
      : CONTACT_CONFIG.mode;

    const endpoint = mode === 'formsubmit'
      ? 'https://formsubmit.co/ajax/' + encodeURIComponent(CONTACT_CONFIG.email)
      : form.action;

    // On aligne aussi l'attribut action pour que l'envoi fonctionne même si
    // le JavaScript est désactivé.
    if (mode === 'formsubmit') {
      form.action = 'https://formsubmit.co/' + encodeURIComponent(CONTACT_CONFIG.email);
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Champ piège rempli = robot : on simule un succès sans rien envoyer.
      const honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value.trim() !== '') {
        form.reset();
        if (status) {
          status.textContent = SUCCESS_MESSAGE;
          status.className = 'form-status form-status--success';
        }
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Envoi en cours...';
      if (status) {
        status.textContent = '';
        status.className = 'form-status';
      }

      try {
        const payload = new FormData(form);
        if (mode === 'formsubmit') {
          // Champ piège interne : inutile de le transmettre au service externe.
          payload.delete('website');
          payload.append('_subject', CONTACT_CONFIG.subject);
          payload.append('_template', 'table');
          payload.append('_captcha', 'false');
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          body: payload,
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        const rawResponse = await response.text();
        let result;

        if (rawResponse.trim()) {
          try {
            result = JSON.parse(rawResponse);
          } catch {
            // Réponse non-JSON : PHP non exécuté, page d'erreur de l'hébergeur…
            console.error('[contact] Réponse inattendue du serveur :', rawResponse.slice(0, 500));
            if (rawResponse.includes('<?php')) {
              throw new Error(FALLBACK_MESSAGE + ' (Le fichier contact.php n’est pas exécuté : hébergement sans PHP.)');
            }
            throw new Error(FALLBACK_MESSAGE);
          }
        } else {
          console.error('[contact] Réponse vide, statut HTTP', response.status);
          result = {
            success: response.ok,
            message: response.ok ? SUCCESS_MESSAGE : FALLBACK_MESSAGE,
          };
        }

        // contact.php renvoie { success: true }, FormSubmit { success: "true" }
        // (chaîne de caractères), Formspree { ok: true } : on accepte les trois.
        const ok = response.ok
          && (result.success === true || result.success === 'true' || result.ok === true);
        if (!ok) {
          console.error('[contact] Envoi refusé :', response.status, result);
          throw new Error(result.message || FALLBACK_MESSAGE);
        }

        form.reset();
        if (status) {
          // Les services externes répondent en anglais : on garde notre message.
          status.textContent = (mode === 'php' && result.message) ? result.message : SUCCESS_MESSAGE;
          status.classList.add('form-status--success');
        }
      } catch (error) {
        console.error('[contact]', error);
        if (status) {
          status.textContent = error.message || FALLBACK_MESSAGE;
          status.classList.add('form-status--error');
        }
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }

});
