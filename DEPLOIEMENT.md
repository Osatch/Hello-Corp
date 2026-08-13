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

Deux scénarios possibles. **Le choix se résume à une question : l'hébergement exécute-t-il PHP ?**

| | Scénario A — Hébergement PHP | Scénario B — Hébergement statique |
|---|---|---|
| Exemples | LWS, OVH, o2switch, Hostinger, Ionos | GitHub Pages, Netlify, Vercel |
| Coût | ~3 à 8 €/mois | gratuit |
| Formulaire | `contact.php` (déjà prêt) | service externe Web3Forms (gratuit) |
| Email pro `@hellocorp.fr` | inclus | à souscrire à part |
| Recommandé pour | un site d'entreprise avec adresse mail pro | un site vitrine sans email pro |

> **Recommandation** : scénario A. Le site est déjà entièrement codé pour, et l'adresse `contact@hellocorp.fr` affichée sur le site suppose de toute façon un hébergement mail.

---

### Scénario A — Hébergement PHP (LWS, OVH, o2switch…)

#### A.1 Préparer l'hébergement

1. Souscrire une offre mutualisée avec le domaine `hellocorp.fr`.
2. Dans le panneau de l'hébergeur, créer la boîte mail **contact@hellocorp.fr**.
3. Activer le **certificat SSL / HTTPS** (Let's Encrypt, gratuit et inclus partout).

#### A.2 Régler l'adresse de réception

Ouvrir [contact.php](contact.php) et vérifier les deux premières constantes :

```php
define('RECIPIENT_EMAILS', 'contact@hellocorp.fr');    // qui reçoit les demandes
define('FROM_EMAIL', 'contact@hellocorp.fr');          // expéditeur (doit être du domaine du site)
```

- Pour recevoir sur plusieurs adresses, les séparer par une virgule : `'contact@hellocorp.fr, direction@hellocorp.fr'`
- ⚠️ `FROM_EMAIL` **doit** appartenir au domaine du site, sinon les mails partent en spam ou sont bloqués.

#### A.3 Envoyer les fichiers

Par FTP avec **FileZilla** (https://filezilla-project.org) :

1. Se connecter avec les identifiants FTP de l'hébergeur.
2. Aller dans le dossier public : `www/`, `public_html/` ou `htdocs/` selon l'hébergeur.
3. Y déposer **tout le contenu** du dossier du site :
   - tous les `.html`, `style.css`, `pages.css`, `main.js`, `shared.js`
   - `contact.php`
   - `.htaccess` *(fichier caché : activer « Afficher les fichiers cachés » dans FileZilla)*
   - le dossier `assets/`
4. **Ne pas envoyer** : `.git/`, `Modifs Site/`, `_tmp_xlsx_images/`, `*.md`

#### A.4 Vérifier

1. Ouvrir https://hellocorp.fr → le site s'affiche en HTTPS.
2. Remplir le formulaire de contact et l'envoyer.
3. Le message vert « Merci ! Votre demande a bien été envoyée » doit apparaître.
4. Vérifier la réception de l'email (**penser à regarder les spams la première fois**).

**Si l'envoi échoue :** consulter le fichier `contact-messages.log` créé à côté de `contact.php` (accessible par FTP). Il contient toutes les demandes reçues, avec la mention `ENVOYE` ou `NON ENVOYE`. Aucun contact n'est donc jamais perdu. Si la mention est `NON ENVOYE`, contacter le support de l'hébergeur pour faire activer la fonction `mail()`.

#### A.5 (Optionnel) Déploiement automatique depuis GitHub

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
          server-dir: ./www/
          exclude: |
            **/.git*
            **/.git*/**
            **/Modifs Site/**
            **/_tmp_xlsx_images/**
            **/*.md
```

Puis dans GitHub : **Settings → Secrets and variables → Actions → New repository secret**, créer `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` avec les identifiants FTP de l'hébergeur.

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

## 4. Checklist avant la mise en ligne

- [ ] Adresse de réception du formulaire vérifiée ([contact.php](contact.php) ligne 14, ou clé Web3Forms)
- [ ] Numéro de téléphone : **01 87 66 66 57** (header, footer, page contact)
- [ ] Email affiché : **contact@hellocorp.fr** — la boîte existe et est relevée
- [ ] [mentions-legales.html](mentions-legales.html) : raison sociale, SIRET, adresse, hébergeur, directeur de publication à jour
- [ ] [politique-confidentialite.html](politique-confidentialite.html) et [politique-cookies.html](politique-cookies.html) relues
- [ ] Test du formulaire en conditions réelles (+ vérification du dossier spam)
- [ ] Test sur mobile
- [ ] HTTPS actif, redirection `www` → domaine principal

---

## 5. Après la mise en ligne

| Action | Comment |
|---|---|
| Modifier une page | éditer le `.html` → `git add . && git commit -m "..." && git push` → renvoyer par FTP (ou automatique si A.5 configuré) |
| Changer le téléphone / l'email | header et footer sont dans [shared.js](shared.js), le reste dans chaque page |
| Consulter les demandes reçues | boîte mail, et `contact-messages.log` par FTP (scénario A) |
| Référencement Google | https://search.google.com/search-console → ajouter la propriété `hellocorp.fr` |

⚠️ **RGPD** : `contact-messages.log` contient des données personnelles. Il est exclu de Git par le [.gitignore](.gitignore) et bloqué en accès web par le [.htaccess](.htaccess). Le purger régulièrement.
