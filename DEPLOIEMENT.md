# Guide de mise en ligne — Site Hello Corp

Ce guide couvre trois étapes : **tester en local**, **publier le code sur GitHub**, **mettre en production**.

Le site est en HTML/CSS/JS statique + un seul fichier PHP ([contact.php](contact.php)) pour le formulaire de contact.

---

## 0. Prérequis (une seule fois)

| Outil | À quoi ça sert | Où l'obtenir |
|---|---|---|
| **Git** | envoyer le code sur GitHub | https://git-scm.com/download/win |
| **Compte GitHub** | héberger le code | https://github.com/signup |
| **PHP** *(optionnel)* | tester le formulaire en local | https://windows.php.net/download (ou XAMPP) |

Vérifier que Git est installé :

```bash
git --version
```

---

## 1. Tester le site en local

### 1.1 Sans PHP (aperçu visuel uniquement)

Double-cliquer sur `index.html`. ⚠️ Le formulaire **ne fonctionnera pas** dans ce mode : les fichiers `.php` ne sont pas exécutés quand on ouvre un fichier directement.

### 1.2 Avec PHP (formulaire compris)

PHP est déjà présent sur ce poste (installé avec WAMP). Depuis le dossier du site :

```bash
C:/wamp64/bin/php/php8.2.0/php.exe -S localhost:8000
```

(ou simplement `php -S localhost:8000` si PHP est dans le PATH)

Puis ouvrir http://localhost:8000 dans le navigateur.

> Note : `mail()` n'envoie généralement rien depuis un PC Windows. En local, l'envoi affichera une erreur — c'est normal. En revanche, chaque demande est écrite dans `contact-messages.log` : c'est ce fichier qui permet de vérifier que le formulaire capte bien les données. Le test d'envoi réel se fait sur l'hébergement.

---

## 2. Publier le code sur GitHub

Le dépôt Git existe déjà en local. Il reste à le relier à GitHub.

### 2.1 Créer le dépôt sur GitHub

1. Aller sur https://github.com/new
2. **Repository name** : `hello-corp-site`
3. Visibilité : **Private** (recommandé) ou Public si le site sera publié via GitHub Pages
4. **Ne rien cocher** (pas de README, pas de .gitignore, pas de licence)
5. Cliquer **Create repository**

### 2.2 Envoyer le code

Dans le dossier du site (`f:\addecom-site`), en remplaçant `VOTRE-COMPTE` :

```bash
git add .
git commit -m "Site Hello Corp : formulaire de contact + configuration de deploiement"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/hello-corp-site.git
git push -u origin main
```

Si `git remote add` répond « remote origin already exists » :

```bash
git remote set-url origin https://github.com/VOTRE-COMPTE/hello-corp-site.git
git push -u origin main
```

GitHub demandera une authentification : se connecter via le navigateur, ou utiliser un **Personal Access Token** (Settings → Developer settings → Personal access tokens) comme mot de passe.

### 2.3 Les mises à jour suivantes

À chaque modification du site :

```bash
git add .
git commit -m "Description de la modification"
git push
```

---

## 3. Mise en production

➡️ **Hello Corp est en scénario A** : le domaine `hellocorp.fr` et son hébergement (formule **Perso**) sont chez **LWS**. C'est la configuration décrite ci-dessous — le scénario B n'est conservé que pour mémoire.

| | Scénario A — Hébergement PHP ✅ **en place** | Scénario B — Hébergement statique |
|---|---|---|
| Exemples | **LWS (Hello Corp)**, OVH, o2switch, Ionos | GitHub Pages, Netlify, Vercel |
| Coût | ~2 à 8 €/mois | gratuit |
| Formulaire | `contact.php` (déjà prêt) | service externe Web3Forms (gratuit) |
| Email pro `@hellocorp.fr` | inclus | à souscrire à part |
| Mesure d'audience Matomo (§ 4) | hébergeable sur place | impossible sans hébergement PHP à côté |

---

### Scénario A — Hébergement LWS (l'hébergement d'Hello Corp)

Le domaine **hellocorp.fr** est chez **LWS**, formule **Perso**, DNS gérés par LWS, expiration 19/05/2027. Cette formule couvre tous les besoins du site :

| Ressource incluse (formule Perso) | Utilisée pour |
|---|---|
| 100 Go d'espace disque, trafic illimité | le site (quelques Mo) |
| PHP 8.x | [contact.php](contact.php) |
| 10 adresses email `@hellocorp.fr` | `contact@hellocorp.fr` |
| **1 base de données MySQL** (1 Go) | Matomo (§ 4) — le site lui-même n'en a pas besoin |
| Certificat SSL gratuit | HTTPS |
| Tâches cron | archivage Matomo (§ 4.5) |

> ⚠️ **Une seule base MySQL** dans cette formule : elle sera prise par Matomo. Si un jour un CMS (WordPress…) est ajouté, il faudra passer à une formule supérieure.

#### A.1 Vérifier que l'hébergement est bien actif

LWS Panel → onglet **Domaine(s) & Hébergement(s)** → ligne `hellocorp.fr` → bouton **Gérer**.

Le tableau de bord doit afficher les rubriques **FTP**, **Bases de données**, **Emails**, **PHP**. Si seule la gestion du nom de domaine apparaît (DNS, redirections), c'est que le domaine n'a pas d'hébergement associé : souscrire une formule via **Choisissez un service → Hébergement web**.

#### A.2 Créer la boîte contact@hellocorp.fr

Dans **Gérer** → rubrique **Emails** (ou « Comptes email ») → **Créer un compte email** :

- Adresse : `contact` @ `hellocorp.fr`
- Mot de passe : solide, **à conserver** (il resservira en A.4)

Le webmail est ensuite accessible sur `https://webmail.hellocorp.fr`.

#### A.3 Activer le certificat SSL — **avant** d'envoyer les fichiers

Dans **Gérer** → rubrique **SSL** → activer le certificat **gratuit (Let's Encrypt)** sur `hellocorp.fr` et `www.hellocorp.fr`.

> ⚠️ Ordre important : le [.htaccess](.htaccess) du site force la redirection vers HTTPS. S'il est envoyé alors que le certificat n'est pas encore actif, le site devient inaccessible (erreur de sécurité). Activer le SSL d'abord, attendre qu'il soit annoncé « actif » dans le panel, puis publier.

#### A.4 Régler l'envoi des emails du formulaire

Sur LWS, la fonction `mail()` de PHP fonctionne, mais les messages partent plus souvent en spam qu'un envoi authentifié. Le plus fiable est de passer par le **SMTP de la boîte créée en A.2** — le code le gère déjà.

Créer un fichier **`contact-config.local.php`** (ce nom précis) contenant :

```php
<?php
define('SMTP_HOST',   'mail.hellocorp.fr');
define('SMTP_PORT',   465);
define('SMTP_SECURE', 'ssl');
define('SMTP_USER',   'contact@hellocorp.fr');
define('SMTP_PASS',   'LE-MOT-DE-PASSE-DE-LA-BOITE');
```

et le déposer par FTP **à côté de `contact.php`** (étape A.5). [contact.php](contact.php) le charge automatiquement et ses valeurs sont prioritaires.

> 🔒 Pourquoi ce fichier séparé : il contient un mot de passe et il est exclu de Git par le [.gitignore](.gitignore). Le mot de passe ne part donc **jamais sur GitHub**. Ne jamais écrire ces identifiants directement dans `contact.php`.
>
> Le port exact peut varier selon le serveur LWS ; si l'envoi échoue, essayer `SMTP_PORT 587` avec `SMTP_SECURE 'tls'`, ou laisser `SMTP_HOST` vide pour revenir à `mail()`.

Vérifier aussi dans [contact.php](contact.php) l'adresse de réception :

```php
define('RECIPIENT_EMAILS', 'contact@hellocorp.fr');    // qui reçoit les demandes
define('FROM_EMAIL', 'contact@hellocorp.fr');          // doit être du domaine du site
```

Pour recevoir sur plusieurs adresses, les séparer par une virgule.

#### A.5 Envoyer les fichiers par FTP

1. Dans **Gérer** → rubrique **FTP** : relever le **serveur** (`ftp.hellocorp.fr`), l'**identifiant** et le **mot de passe** (ou créer un compte FTP).
2. Se connecter avec **FileZilla** (https://filezilla-project.org).
3. Ouvrir le dossier **`htdocs`** : c'est la racine web du site sur LWS (ce qui est dedans s'affiche sur `https://hellocorp.fr`).
4. Y déposer **tout le contenu** du dossier du site :
   - tous les `.html`, `style.css`, `pages.css`, `motion.css`, `main.js`, `shared.js`, `motion.js`, `matomo.js`
   - `contact.php` et le `contact-config.local.php` créé en A.4
   - `.htaccess` *(fichier caché : activer « Afficher les fichiers cachés » dans FileZilla)*
   - le dossier `assets/`
5. **Ne pas envoyer** : `.git/`, `Modifs Site/`, `_tmp_xlsx_images/`, `outils/`, les `*.md`, `contact-messages.log`, `contact-config.local.php.exemple`

#### A.6 Vérifier la version de PHP

**Gérer** → rubrique **PHP** → sélectionner **PHP 8.1 ou 8.2**. (Une version trop ancienne ferait échouer l'envoi SMTP, et Matomo exige PHP 8.)

#### A.7 Vérifier le site

1. Ouvrir https://hellocorp.fr → le site s'affiche, le cadenas HTTPS est présent.
2. `http://www.hellocorp.fr` doit rediriger vers `https://hellocorp.fr` (règle du `.htaccess`).
3. Remplir le formulaire de contact et l'envoyer → message vert « Merci ! Votre demande a bien été envoyée ».
4. Vérifier la réception sur `contact@hellocorp.fr` (**regarder les spams la première fois**).

**Si l'envoi échoue :** consulter `contact-messages.log`, créé par FTP à côté de `contact.php`. Il contient toutes les demandes avec la mention `ENVOYE` ou `NON ENVOYE` — aucun contact n'est jamais perdu. Si c'est `NON ENVOYE`, revoir les réglages SMTP de A.4, puis contacter le support LWS.

#### A.8 (Optionnel) Déploiement automatique depuis GitHub

Pour publier automatiquement à chaque `git push`, créer le fichier `.github/workflows/deploy.yml` :

```yaml
name: Deploy FTP
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          server-dir: ./htdocs/
          exclude: |
            **/.git*
            **/.git*/**
            **/Modifs Site/**
            **/_tmp_xlsx_images/**
            **/outils/**
            **/*.md
```

Puis dans GitHub : **Settings → Secrets and variables → Actions → New repository secret**, créer `FTP_SERVER` (`ftp.hellocorp.fr`), `FTP_USERNAME`, `FTP_PASSWORD` avec les identifiants FTP LWS.

> Le fichier `contact-config.local.php` étant ignoré par Git, il n'est pas écrasé par ce déploiement : il reste en place sur le serveur.

---

### Scénario B — Hébergement statique (GitHub Pages / Netlify)

⚠️ **GitHub Pages n'exécute pas le PHP.** Le formulaire doit passer par un service externe — c'est gratuit et déjà prévu dans le code.

#### B.1 Activer le formulaire (Web3Forms)

1. Aller sur https://web3forms.com
2. Saisir l'adresse email de réception → une **clé d'accès** est envoyée par mail.
3. Ouvrir [main.js](main.js) et coller la clé :

```js
const CONTACT_CONFIG = {
  web3formsKey: 'COLLER-LA-CLE-ICI',
  subject: 'Nouvelle demande de contact - Site Hello Corp',
};
```

4. Enregistrer, puis `git add . && git commit -m "Formulaire via Web3Forms" && git push`

Le formulaire bascule automatiquement sur le service : plus rien d'autre à modifier. (`contact.php` peut rester dans le dépôt, il sera simplement ignoré.)

#### B.2 Publier sur GitHub Pages

1. Sur le dépôt GitHub : **Settings → Pages**
2. **Source** : `Deploy from a branch`
3. **Branch** : `main`, dossier `/ (root)` → **Save**
4. Au bout d'1 à 2 minutes, le site est en ligne sur `https://VOTRE-COMPTE.github.io/hello-corp-site/`

**Domaine personnalisé** : dans **Settings → Pages → Custom domain**, saisir `hellocorp.fr`, puis chez le registrar du domaine créer les enregistrements DNS :

```
Type A    @    185.199.108.153
Type A    @    185.199.109.153
Type A    @    185.199.110.153
Type A    @    185.199.111.153
Type CNAME www  VOTRE-COMPTE.github.io
```

Enfin, cocher **Enforce HTTPS** (disponible ~15 min après la propagation DNS).

#### B.3 Alternative : Netlify (plus simple)

1. https://app.netlify.com → **Add new site → Import an existing project → GitHub**
2. Sélectionner le dépôt, laisser les réglages par défaut (pas de build command), **Deploy**
3. **Domain settings** pour brancher `hellocorp.fr`, HTTPS automatique

---

## 4. Mesure d'audience Matomo (auto-hébergé, gratuit)

Le site est déjà entièrement câblé pour Matomo : [matomo.js](matomo.js) est inclus dans toutes les pages, mais **rien n'est envoyé** tant que l'URL de l'instance n'est pas renseignée. Il ne reste qu'à installer Matomo et à coller deux valeurs.

Version retenue : **Matomo On-Premise**, logiciel libre, **gratuit et sans limite de trafic**. (La version « Matomo Cloud » est payante — elle n'est pas nécessaire ici.)

> **Prérequis : un hébergement PHP + MySQL** — c'est-à-dire le **scénario A** ci-dessus. Avec un hébergement statique (scénario B), Matomo doit être installé ailleurs, sur n'importe quel mutualisé PHP.

### 4.1 Préparer le sous-domaine et la base de données (LWS Panel)

1. **Sous-domaine** — LWS Panel → `hellocorp.fr` → **Gérer** → rubrique **Sous-domaines** → créer **`analytics`**.
   LWS crée automatiquement un dossier `analytics/` à côté de `htdocs`, et y fait pointer `analytics.hellocorp.fr`. Matomo sera donc bien **séparé du site**, dans son propre dossier.
2. **SSL** — rubrique **SSL** → activer le certificat gratuit sur `analytics.hellocorp.fr` (obligatoire : le site en HTTPS ne peut pas envoyer ses mesures vers une adresse en HTTP).
3. **Base de données** — rubrique **Bases de données MySQL** → créer la base (ex. `hellocorp_matomo`) avec son utilisateur et son mot de passe.
   **Noter les 4 informations** : serveur (souvent `localhost`, parfois une adresse `mysql-xxx.lws-hosting.com` — c'est le panel qui l'indique), nom de la base, utilisateur, mot de passe.

> ⚠️ La formule **Perso** ne comprend **qu'une seule base MySQL (1 Go)**. Elle est ici affectée à Matomo. Avec la purge à 180 jours (§ 4.4), un site vitrine reste très loin du gigaoctet.

### 4.2 Installer Matomo

1. Télécharger l'archive sur https://matomo.org/download/ (« Matomo On-Premise »).
2. Décompresser : un dossier `matomo/` apparaît.
3. Par FTP (FileZilla), envoyer **le contenu** du dossier `matomo/` dans le dossier du sous-domaine.
4. Ouvrir **https://analytics.hellocorp.fr** dans le navigateur : l'assistant d'installation démarre.
5. Suivre les 8 étapes :
   - **Base de données** : saisir les 4 informations de l'étape 4.1
   - **Super utilisateur** : créer le compte administrateur (identifiant + mot de passe solide + email)
   - **Configurer un site web** :
     - Nom : `Hello Corp`
     - URL : `https://hellocorp.fr`
     - Fuseau horaire : `France`
     - Ce site est-il un site e-commerce : **Non**
6. L'écran suivant affiche le **code de suivi JavaScript**. Il n'est **pas** à copier tel quel : y relever seulement l'**idSite** (le `setSiteId`, en général `1`).

### 4.3 Brancher le site sur Matomo

Ouvrir [matomo.js](matomo.js) et remplir les deux valeurs, en haut du fichier :

```js
const MATOMO_CONFIG = {
  url: 'https://analytics.hellocorp.fr/',   // avec le slash final
  siteId: '1'
};
```

⚠️ Le **slash final** est obligatoire, et l'URL doit être en **https** (sinon les navigateurs bloqueront la requête depuis le site en HTTPS).

C'est le seul fichier à modifier : les 14 pages HTML suivent automatiquement. Puis publier :

```bash
git add matomo.js && git commit -m "Activation de la mesure d'audience Matomo" && git push
```

…et renvoyer `matomo.js` par FTP (ou automatique si A.5 est configuré).

### 4.4 Régler Matomo pour rester conforme (RGPD / exemption CNIL)

Ces réglages ne sont pas optionnels : [politique-confidentialite.html](politique-confidentialite.html) et [politique-cookies.html](politique-cookies.html) les annoncent déjà aux visiteurs. Dans Matomo, **roue dentée (Administration) → Confidentialité** :

| Écran | Réglage à appliquer |
|---|---|
| Confidentialité → **Anonymiser les données** | Activer l'anonymisation d'IP, **masquer au moins 2 octets** |
| Confidentialité → **Anonymiser les données** | Décocher le suivi des `UserId` / données inutiles |
| Confidentialité → **Supprimer les anciennes données** | Activer la suppression des données de visite de plus de **180 jours** |
| Administration → **Sites web → Paramètres** | Ne pas activer le suivi inter-sites ; aucune finalité publicitaire |

Le **mécanisme d'opposition** promis dans la politique de confidentialité fonctionne alors tout seul : [matomo.js:89-104](matomo.js#L89-L104) insère automatiquement l'iframe d'opt-out de Matomo dans le bloc `#matomo-optout` de la page.

Sont déjà gérés côté site, sans réglage : respect du signal *Do Not Track*, cookies plafonnés à **13 mois**, session de 30 minutes.

### 4.5 Activer le traitement des rapports (cron)

Sans cette étape, Matomo calcule les rapports à chaque consultation et devient très lent au fil des mois.

1. LWS Panel → **Gérer** → rubrique **Tâches cron** (ou « Cron ») → créer une tâche **toutes les heures** :

```bash
/usr/bin/php /home/VOTRE-COMPTE/analytics/console core:archive --url=https://analytics.hellocorp.fr/
```

Le chemin absolu du dossier `analytics` est affiché par le panel (rubrique FTP ou Tâches cron) ; le binaire PHP peut aussi s'écrire `/usr/local/php8.2/bin/php`. En cas de doute, le support LWS donne la ligne exacte pour votre serveur.

2. Puis dans Matomo : **Administration → Système → Paramètres généraux** → « Archiver les rapports lorsqu'ils sont consultés depuis le navigateur » = **Non**.

### 4.6 Vérifier

1. Ouvrir https://hellocorp.fr dans une **fenêtre de navigation privée**, visiter 2 ou 3 pages.
2. Dans Matomo : **Visiteurs → Visites en direct** → la visite doit apparaître en moins d'une minute.
3. Cliquer sur le numéro de téléphone et ouvrir le calendrier de rendez-vous, puis vérifier dans **Comportement → Événements** :

| Ce que fait le visiteur | Événement attendu |
|---|---|
| Clic sur le téléphone ou l'email | `Contact` / `Clic téléphone` ou `Clic email` |
| Formulaire de contact envoyé | `Formulaire` / `Message envoyé` |
| Ouverture du calendrier de RDV | `Rendez-vous` / `Ouverture du calendrier` |

**Si rien n'apparaît** : ouvrir la console du navigateur (F12) sur hellocorp.fr. Une erreur de chargement de `matomo.js` signale une URL mal saisie ou un HTTPS manquant dans `MATOMO_CONFIG`. Vérifier aussi qu'aucun bloqueur de publicité n'est actif — ils bloquent souvent Matomo, y compris auto-hébergé.

> **Entretien** : Matomo signale ses mises à jour dans son interface ; elles s'installent en un clic (**Administration → Système → Mise à jour**). Les appliquer, ce sont des correctifs de sécurité.

---

## 5. Checklist avant la mise en ligne

- [ ] Adresse de réception du formulaire vérifiée ([contact.php](contact.php) ligne 14, ou clé Web3Forms)
- [ ] Numéro de téléphone : **01 87 66 66 57** (header, footer, page contact)
- [ ] Email affiché : **contact@hellocorp.fr** — la boîte existe et est relevée
- [ ] [mentions-legales.html](mentions-legales.html) : raison sociale, SIRET, adresse, hébergeur, directeur de publication à jour
- [ ] [politique-confidentialite.html](politique-confidentialite.html) et [politique-cookies.html](politique-cookies.html) relues
- [ ] Test du formulaire en conditions réelles (+ vérification du dossier spam)
- [ ] Mesure d'audience Matomo active : URL et `siteId` renseignés dans [matomo.js](matomo.js), anonymisation IP et purge à 180 jours réglées, visite de test visible dans Matomo
- [ ] Test sur mobile
- [ ] HTTPS actif, redirection `www` → domaine principal

---

## 6. Après la mise en ligne

| Action | Comment |
|---|---|
| Modifier une page | éditer le `.html` → `git add . && git commit -m "..." && git push` → renvoyer par FTP (ou automatique si A.8 configuré) |
| Changer le téléphone / l'email | header et footer sont dans [shared.js](shared.js), le reste dans chaque page |
| Consulter les demandes reçues | boîte mail, et `contact-messages.log` par FTP (scénario A) |
| Consulter la fréquentation du site | https://analytics.hellocorp.fr → tableau de bord Matomo (rapport hebdomadaire par email : **Personnel → Emails de rapports**) |
| Mettre Matomo à jour | notification dans Matomo → **Administration → Système → Mise à jour** (à appliquer, correctifs de sécurité) |
| Référencement Google | https://search.google.com/search-console → ajouter la propriété `hellocorp.fr` |

⚠️ **RGPD** : `contact-messages.log` contient des données personnelles. Il est exclu de Git par le [.gitignore](.gitignore) et bloqué en accès web par le [.htaccess](.htaccess). Le purger régulièrement.
