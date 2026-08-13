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

     Deux modes possibles, selon l'hébergement final :

     1) HÉBERGEMENT PHP (LWS, OVH, o2switch, Hostinger…)  ← réglage par défaut
        Laisser `web3formsKey` vide : le formulaire est traité par contact.php.

     2) HÉBERGEMENT STATIQUE (GitHub Pages, Netlify, Vercel…)
        Le PHP n'y est pas exécuté. Créer une clé gratuite sur
        https://web3forms.com (saisir l'email de réception, la clé arrive par
        mail) puis la coller ci-dessous. Rien d'autre à changer.
     ────────────────────────────────────────────────────────────────────── */
  const CONTACT_CONFIG = {
    web3formsKey: '',                       // ex. 'a1b2c3d4-....' pour le mode statique
    subject: 'Nouvelle demande de contact - Site Hello Corp',
  };

  const SUCCESS_MESSAGE  = 'Merci ! Votre demande a bien été envoyée, nous revenons vers vous rapidement.';
  const FALLBACK_MESSAGE = "L'envoi n'a pas abouti. Merci de nous écrire à contact@hellocorp.fr ou de nous appeler au 01 87 66 66 57.";

  const form = document.getElementById('contactForm');
  if (form) {
    const status = document.getElementById('formStatus');
    const useWeb3Forms = CONTACT_CONFIG.web3formsKey.trim() !== '';
    const endpoint = useWeb3Forms ? 'https://api.web3forms.com/submit' : form.action;

    // En mode statique, on pointe aussi l'attribut action pour que l'envoi
    // fonctionne même si le JavaScript est bloqué.
    if (useWeb3Forms) {
      form.action = endpoint;
      let keyInput = form.querySelector('input[name="access_key"]');
      if (!keyInput) {
        keyInput = document.createElement('input');
        keyInput.type = 'hidden';
        keyInput.name = 'access_key';
        form.appendChild(keyInput);
      }
      keyInput.value = CONTACT_CONFIG.web3formsKey.trim();

      let subjectInput = form.querySelector('input[name="subject"]');
      if (!subjectInput) {
        subjectInput = document.createElement('input');
        subjectInput.type = 'hidden';
        subjectInput.name = 'subject';
        form.appendChild(subjectInput);
      }
      subjectInput.value = CONTACT_CONFIG.subject;
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
        if (useWeb3Forms) {
          // Champ piège interne : inutile de le transmettre au service externe.
          payload.delete('website');
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

        // Web3Forms renvoie { success }, Formspree { ok } : on accepte les deux.
        const ok = response.ok && (result.success === true || result.ok === true);
        if (!ok) {
          console.error('[contact] Envoi refusé :', response.status, result);
          throw new Error(result.message || FALLBACK_MESSAGE);
        }

        form.reset();
        if (status) {
          status.textContent = result.message || SUCCESS_MESSAGE;
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
