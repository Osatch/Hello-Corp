# Audit UI / UX — site Hello Corp

Relevé effectué le 24 août 2026, sur l'ensemble des 14 pages.
Les points de la première partie ont été corrigés ; ceux de la seconde
sont des recommandations qui demandent un arbitrage (contenu, budget
photo, priorités commerciales).

---

## 1. Corrigé

### 1.1 Défauts bloquants

**`.why-grid` figée sur 3 colonnes à toutes les tailles**
La section « Ce que vous gagnez avec Hello Corp » n'avait aucune règle
responsive. Sous 500 px de large, les trois cartes étaient compressées à
~100 px et la section débordait de la fenêtre. `body { overflow-x: hidden }`
empêchait le défilement latéral : le texte n'était donc pas décalé, il
était purement et simplement coupé.
→ `style.css`, passage à une colonne sous 768 px.

**Le bouton « Nous contacter » sortait de l'écran entre 769 et 1180 px**
La barre de navigation (7 entrées + 1 bouton) réclame 1173 px, mais le
menu burger ne se déclenchait qu'à 768 px. Sur toute la plage
intermédiaire — tablettes en paysage, petits portables — l'appel à
l'action principal était hors cadre.
→ Bascule en menu burger remontée à 1080 px.

**Photo hors sujet sur « Télésecrétariat »**
La section était illustrée par deux hommes se serrant la main. Remplacée
par une téléopératrice au casque devant son poste (`relation-client.html`).

### 1.2 Accessibilité

| Point | Critère | État avant |
|---|---|---|
| `prefers-reduced-motion` | WCAG 2.3.3 | absent du site |
| Anneau de focus visible | WCAG 2.4.7 | présent uniquement sur les champs de formulaire |
| Lien d'évitement | WCAG 2.4.1 | absent |
| Flèches « → » | WCAG 1.1.1 | énoncées par les lecteurs d'écran |

Les quatre points sont traités dans `motion.css` / `motion.js`. Le lien
d'évitement est injecté par le script pour éviter de le dupliquer dans
les 14 pages.

### 1.3 Performance

- Aucune image ne portait `loading` ni `decoding`. Les 25 images du site
  sont désormais différées, sauf celles au-dessus de la ligne de
  flottaison (hero, bandeau d'article) qui passent en `fetchpriority="high"` :
  ce sont les éléments LCP.
- La cascade d'apparition était calculée par sélecteur sur toute la page :
  le dernier élément d'une liste attendait jusqu'à ~0,5 s. Elle est
  maintenant calculée par grille et plafonnée à 4 crans.

### 1.4 Navigation

Les ancres `#services`, `#contact`, `#approche` amenaient la section
sous la barre collante. Corrigé par `scroll-margin-top`.

---

## 2. Recommandations

Par ordre d'impact décroissant.

### 2.1 Trois liens différents pour une même destination

Les cartes « Administration & Gestion », « Communication & Marketing » et
« Support Utilisateur » affichent chacune « En savoir plus → » et pointent
toutes les trois vers `#contact`. Le visiteur qui clique cherche du
contenu et reçoit un formulaire. Trois libellés distincts pour une seule
cible nuisent aussi au maillage interne.

**À faire** : créer les ancres correspondantes dans `fonctions-support.html`
et y pointer, comme le font déjà les cartes de la section « 3 services ».

### 2.2 Aucune preuve

Le CSS contient `.trust-section` (logos clients) et `.quote-section`
(témoignage) — les deux blocs sont stylés mais ne sont utilisés nulle
part. La page ne présente ni logo client, ni témoignage, ni chiffre.
Sur une offre d'externalisation, où le prospect confie sa voix, c'est le
manque le plus coûteux du site.

**À faire** : réactiver `.trust-section` avec 5 ou 6 logos, et
`.quote-section` avec un verbatim signé.

### 2.3 Deux cartes sans sortie

Dans « Notre approche » et « Nos expertises », les boutons « Découvrir »
sont commentés dans le HTML (`index.html`). Les deux cartes les plus
travaillées de la page ne mènent donc nulle part.

### 2.4 Prise de rendez-vous absente des pages à forte intention

Le widget flottant TidyCal n'existe que sur `index.html`. Les pages
`prospection-b2b.html` et `relation-client.html`, où le visiteur arrive
souvent directement depuis une recherche, n'offrent aucun chemin de
réservation.

### 2.5 Formulaire de contact : 7 champs obligatoires

Prénom, nom, entreprise, email, téléphone, service, message — tous
requis pour une première prise de contact. Passer le téléphone en
facultatif est le gain le plus simple ; le service souhaité pourrait
l'être aussi, puisqu'il se déduit du message.

### 2.6 Répétition au-dessus de la ligne de flottaison

« Hello Corp — La voix de votre entreprise » apparaît trois fois dans le
premier écran : bandeau supérieur, slogan du logo, badge du hero. Le
badge du hero est le moins utile des trois — il occupe la place où
pourrait figurer une preuve (« 72h », « dès 1 h/mois »).

### 2.7 Déséquilibre éditorial

« Support Utilisateur » se résume à « Support utilisateurs à distance. »
(5 mots) face à 12 et 15 mots pour ses deux voisines. La carte paraît
inachevée.

### 2.8 Images externes

La plupart des photos restent des liens directs vers
`images.unsplash.com`. Cela crée une dépendance externe à chaque
affichage, empêche de servir des formats modernes maîtrisés et expose à
une rupture si Unsplash modifie ou retire une ressource.

Trois visuels sont désormais hébergés localement — `secteurs-activite.jpg`,
`telesecretariat.jpg`, `support-utilisateurs.jpg`. Les 22 autres suivent
la même logique.

**À faire** : rapatrier le reste dans `assets/images/`, en AVIF/WebP.

### 2.9 Structure du document

Six pages n'ont pas de balise `<main>` : `index`, `actualites`,
`fonctions-support`, `prospection-b2b`, `qui-sommes-nous`,
`relation-client`. Le lien d'évitement se rabat sur le hero, ce qui
fonctionne mais reste approximatif.

### 2.10 Attributs de dimension

Seules les deux images rapatriées récemment portent `width` / `height`.
Pour les autres, le décalage de mise en page (CLS) est évité uniquement
parce que tous les conteneurs ont une hauteur fixe en CSS — la
protection disparaîtrait à la première refonte de gabarit.

---

## 3. Système d'animation livré

Deux fichiers, chargés après `style.css` / `pages.css`, qui ne
surchargent que des propriétés existantes.

**`motion.css`** — jetons de durée et de courbe, puis :
survol des images (zoom lent + bandeau lumineux droite → gauche),
cartes (élévation, filet d'accent, réaction des icônes), liens et
boutons (soulignement, reflet balayant), navigation (filet, chevrons,
en-tête compacté), hero (halos dérivants, entrée mot à mot), révélation
au défilement, éléments flottants (barre de lecture, retour en haut),
puis un bloc `prefers-reduced-motion` et un bloc `hover: none`.

**`motion.js`** — ne contient aucune animation : il pose des classes et
des variables CSS. Lien d'évitement, découpage du titre, bandeau
défilant, révélation, volets de dévoilement, parallaxe du hero, barre de
progression, retour en haut, rubrique courante.

### Règles suivies

- `transform` et `opacity` uniquement : composées par le GPU, elles
  n'entraînent ni recalcul de mise en page ni repeinture.
- Interactions en 150–400 ms, entrées en 600–900 ms.
- Aucun rebond ni rotation : le mouvement guide le regard, il ne cherche
  pas à capter l'attention pour lui-même.
- Le voile du hero n'est **pas** animé : son dégradé est calibré pour le
  contraste du texte.
- Tout est neutralisé sous `prefers-reduced-motion: reduce`, et le
  contenu reste visible si le JavaScript ne se charge pas.
