'use strict';

/* ------------------------------------------------------------------
   Mesure d'audience Matomo
   ------------------------------------------------------------------
   1. Renseigner `url` et `siteId` ci-dessous (valeurs fournies par
      l'instance Matomo, écran « Suivi > Code de suivi »).
      Tant que `url` contient encore la valeur d'exemple, rien n'est chargé :
      le site fonctionne normalement, sans requête vers Matomo.
   2. Côté serveur Matomo, activer pour rester dans les conditions
      d'exemption de consentement annoncées dans nos politiques :
        - anonymisation de l'adresse IP (au moins 2 octets masqués) ;
        - conservation des données limitée à 180 jours ;
        - désactivation du suivi inter-sites / des finalités publicitaires.
   ------------------------------------------------------------------ */
const MATOMO_CONFIG = {
  // URL de l'instance, avec le slash final.
  // Matomo Cloud : 'https://hellocorp.matomo.cloud/'
  // Auto-hébergé  : 'https://analytics.hellocorp.fr/'
  url: 'https://VOTRE-INSTANCE-MATOMO/',
  siteId: '1'
};

const MATOMO_ENABLED = !/VOTRE-INSTANCE-MATOMO/.test(MATOMO_CONFIG.url);

const _paq = window._paq = window._paq || [];

if (MATOMO_ENABLED) {
  // Respect du signal « Do Not Track » du navigateur.
  _paq.push(['setDoNotTrack', true]);

  // Durées annoncées dans la politique de confidentialité :
  // cookies de mesure d'audience de 13 mois maximum, non prolongés.
  const TREIZE_MOIS = 33696000; // 13 * 30 jours, en secondes
  _paq.push(['setVisitorCookieTimeout', TREIZE_MOIS]);
  _paq.push(['setReferralCookieTimeout', TREIZE_MOIS]);
  _paq.push(['setSessionCookieTimeout', 1800]);

  // Temps réellement passé sur la page (utile sur les pages longues).
  _paq.push(['enableHeartBeatTimer', 15]);

  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']); // liens sortants + téléchargements

  (function () {
    const u = MATOMO_CONFIG.url;
    _paq.push(['setTrackerUrl', u + 'matomo.php']);
    _paq.push(['setSiteId', MATOMO_CONFIG.siteId]);
    const d = document;
    const g = d.createElement('script');
    const s = d.getElementsByTagName('script')[0];
    g.async = true;
    g.src = u + 'matomo.js';
    s.parentNode.insertBefore(g, s);
  })();
}

/* --- Suivi des activités du site ---------------------------------- */

function matomoTrack(categorie, action, nom) {
  if (!MATOMO_ENABLED) return;
  _paq.push(['trackEvent', categorie, action, nom || '']);
}
window.matomoTrack = matomoTrack;

// Clics sur les numéros de téléphone et les adresses email : ce sont nos
// principales conversions, et Matomo ne les compte pas automatiquement.
document.addEventListener('click', e => {
  const lien = e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
  if (!lien) return;
  const href = lien.getAttribute('href');
  matomoTrack(
    'Contact',
    href.startsWith('tel:') ? 'Clic téléphone' : 'Clic email',
    href.replace(/^(tel|mailto):/, '')
  );
});

// Événements émis par main.js (formulaire de contact, prise de rendez-vous).
document.addEventListener('hc:contact-envoye', () => {
  matomoTrack('Formulaire', 'Message envoyé', document.title);
});
document.addEventListener('hc:rdv-ouvert', e => {
  matomoTrack('Rendez-vous', 'Ouverture du calendrier', (e.detail && e.detail.source) || 'inconnu');
});

/* --- Mécanisme d'opposition (politique de confidentialité) --------- */

document.addEventListener('DOMContentLoaded', () => {
  const cible = document.getElementById('matomo-optout');
  if (!cible) return;

  if (!MATOMO_ENABLED) {
    cible.innerHTML = '<p><em>Le mécanisme d\'opposition sera disponible dès l\'activation de la mesure d\'audience.</em></p>';
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.className = 'matomo-optout';
  iframe.title = 'Mécanisme d\'opposition à la mesure d\'audience Matomo';
  iframe.style.cssText = 'border:0;width:100%;height:220px';
  iframe.src = MATOMO_CONFIG.url + 'index.php?module=CoreAdminHome&action=optOut&language=fr';
  cible.replaceChildren(iframe);
});
