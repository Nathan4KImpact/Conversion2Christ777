# Espace responsable (admin) — PDVIE « Nouvelles Vies en Jésus »

Tableau de bord privé pour **suivre les âmes** et **piloter le tunnel** :
statistiques clés, tunnel de conversion, relances prioritaires, table des
contacts, mise à jour d'étape et export CSV.

```
admin.html  (connexion / inscription)
   │  JWT (12 h) en en-tête Authorization
   ▼
/api/*  ──►  Fonctions Netlify (Node, sans dépendance)
                admin-signup / admin-login        ▸ table Airtable « Admins »
                admin-stats  / admin-leads        ▸ table Airtable « Ames » (lecture)
                admin-lead-update                 ▸ table Airtable « Ames » (écriture)
                admin-track-setup                 ▸ crée la table « Stats »
```

```
Site public (aucune donnée personnelle)
   │  POST /api/track  { event: "quiz_lance" }
   ▼
track  ──►  table Airtable « Stats » : +1 sur le compteur du jour
```

## Pourquoi un mini back-end ?

Les fiches contiennent des **données personnelles sensibles** (email, WhatsApp,
persona — dont blessures, abus, identité…). Le **token Airtable ne doit jamais**
se retrouver dans du JavaScript public. Les fonctions Netlify le gardent **côté
serveur** (variable d'environnement) ; le navigateur ne reçoit que ce qu'un
**admin authentifié** demande.

- Mots de passe **hachés** (scrypt, natif Node) — jamais stockés en clair.
- Authentification par **JWT signé** (HMAC-SHA256), valable 12 h.
- Inscription **protégée par un code d'invitation** (pas d'admin sauvage).
- **Zéro dépendance npm** (modules natifs de Node uniquement).
- Page `admin.html` en `noindex`.

## Ce que voit l'admin

- **5 indicateurs clés** : âmes touchées (+ aujourd'hui), nouvelles sur 7 j
  (+ 30 j), « ont prié ou + » (+ taux de conversion), RDV à venir (+ total),
  à relancer.
- **Activation du tunnel (30 j)** : sessions → quiz lancés → quiz terminés →
  opt-in → prières → nouveau-nés, avec le taux de passage d'une étape à l'autre.
  C'est ce qui montre **où le tunnel fuit avant la capture**.
- **Tunnel de conversion** (Lead → Prière faite → RDV pris → Affermi) avec le
  taux de déperdition entre étapes.
- **Répartitions** : par persona, par langue, top sources, nurturing envoyé
  (J1/J3/J5/J7).
- **Évolution** des nouvelles âmes sur 30 jours.
- **À relancer en priorité** : leads sans RDV depuis ≥ 7 j, avec boutons
  WhatsApp / Email pré-remplis et « marquer Prière faite ».
- **Table de toutes les âmes** : recherche, filtres (persona / étape),
  changement d'étape en un clic, **export CSV**.
- **Bilingue FR / EN** (même bascule que le site).

---

## Mise en service (≈ 10 min, une seule fois)

### 1) Créer un token Airtable (Personal Access Token)

1. https://airtable.com/create/tokens → **Create token**.
2. Scopes : `data.records:read`, `data.records:write`, `schema.bases:read`
   et — pour le bouton « Activer le suivi » — `schema.bases:write`.
3. Accès : ajoute la base **« Suivi des Ames PDVIE »**.
4. Copie le token (commence par `pat…`).

### 2) Renseigner les variables d'environnement Netlify

Netlify → **Site settings ▸ Environment variables** → ajoute :

| Variable | Valeur | Obligatoire |
|----------|--------|:-----------:|
| `AIRTABLE_TOKEN` | le token `pat…` ci-dessus | ✅ |
| `JWT_SECRET` | une longue chaîne aléatoire (voir ci-dessous) | ✅ |
| `ADMIN_SIGNUP_CODE` | un code secret d'invitation de ton choix | ✅ |
| `AIRTABLE_BASE` | `appRLYZbJgmORxkxz` | ⛔ (déjà par défaut) |
| `AMES_TABLE` | `tblqFCCV7BAO8IJNL` | ⛔ (déjà par défaut) |
| `ADMINS_TABLE` | `tblYWX1NiR5dcVliI` | ⛔ (déjà par défaut) |

Générer un secret solide :

```bash
openssl rand -hex 32        # pour JWT_SECRET
openssl rand -base64 12     # pour ADMIN_SIGNUP_CODE (ou choisis le tien)
```

> ⚠️ Si tu changes `JWT_SECRET` plus tard, toutes les sessions ouvertes sont
> invalidées (il faudra se reconnecter) — c'est le comportement attendu.

### 3) Déployer

Le `netlify.toml` (à la racine) active déjà les fonctions et la route `/api/*`.
Un simple `git push` sur la branche déclenche le déploiement Netlify ; les
fonctions sont détectées automatiquement dans `netlify/functions/`.

### 4) Créer le premier compte admin

1. Ouvre `https://<ton-site>.netlify.app/admin.html`.
2. Onglet **« Créer un compte »** → nom, email, mot de passe (8 car. min.),
   et le **code d'invitation** (`ADMIN_SIGNUP_CODE`).
3. Tu es connecté(e) : le tableau de bord se charge.

Pour ajouter d'autres responsables : partage-leur le **code d'invitation**
(ou crée un autre code). Tu peux **suspendre** un accès en décochant `Actif`
sur la fiche correspondante dans la table Airtable **Admins**.

---

## Table Airtable « Admins » (déjà créée)

Base `appRLYZbJgmORxkxz` · table `Admins` `tblYWX1NiR5dcVliI`.

| Champ | Type | Rôle |
|-------|------|------|
| Email | Email (primaire) | identifiant de connexion |
| Password Hash | Single line | hachage scrypt (jamais le clair) |
| Nom | Single line | nom affiché |
| Rôle | Select : Admin / Responsable / Berger | niveau d'accès |
| Actif | Case à cocher | décocher = accès suspendu |
| Créé le | Date | création du compte |
| Dernière connexion | Date/heure | dernière connexion réussie |

---

## Sécurité — bonnes pratiques

- Garde `ADMIN_SIGNUP_CODE` **confidentiel** ; change-le après avoir créé les
  comptes voulus (l'inscription se ferme alors aux nouveaux venus).
- Ne mets **jamais** le token Airtable ailleurs que dans les variables Netlify.
- Le token Airtable doit être limité à **cette base** uniquement.
- Sessions de 12 h ; « Déconnexion » efface le jeton du navigateur.

## Limites connues / évolutions possibles

- Pas encore de **réinitialisation de mot de passe** en self-service (à la
  demande : on peut réinitialiser le champ `Password Hash` à la main, ou
  ajouter une fonction de reset par email via Gmail/Make).
- Le garde-fou anti-force-brute est « best effort » (mémoire par instance).
  Pour durcir : ajouter un blocage persistant (table Airtable ou Netlify Blobs).
- Évolutions faciles : export par persona, graphe « temps jusqu'à la prière »,
  notifications de nouvelles âmes, attribution d'un référent depuis le tableau.

---

## Suivi d'activation (haut du tunnel)

### Le problème qu'il résout

Le tableau de bord ne voyait que les âmes **ayant déjà laissé leurs
coordonnées**. Impossible de savoir si 10 ou 1 000 personnes étaient passées
avant, ni **à quelle étape elles décrochaient**. Un tunnel qui convertit 5 %
de 20 visiteurs et un tunnel qui convertit 0,1 % de 1 000 visiteurs donnent le
même nombre de leads — mais appellent des décisions opposées.

### Ce qui est mesuré

| Évènement       | Colonne Airtable  | Déclenché par |
|-----------------|-------------------|---------------|
| `visite`        | `Visites`         | ouverture de `index` / `temoignages` / `histoire` / `quiz` |
| `quiz_lance`    | `Quiz lancés`     | clic sur « Commencer » dans le quiz |
| `quiz_termine`  | `Quiz terminés`   | affichage du résultat (4 réponses) |
| `optin`         | `Opt-in`          | envoi du formulaire de capture |
| `priere`        | `Prières`         | ouverture de `prier.html` |
| `nouveau_ne`    | `Nouveau-nés`     | ouverture de `nouveau-ne.html` |

### Vie privée

**Aucune donnée personnelle n'est enregistrée** : ni IP, ni user agent, ni
identifiant, ni cookie, ni traceur tiers. Le serveur incrémente uniquement un
compteur dans la fiche du jour. Il n'y a donc **rien à consentir** au sens
RGPD — contrairement à Google Analytics.

Chaque évènement n'est compté **qu'une fois par session de navigation**
(`sessionStorage`) : rafraîchir une page ne gonfle pas les chiffres.

### Activation (une seule fois)

1. Connecte-toi sur `/admin.html`.
2. Bloc « Activation du tunnel » → bouton **« Activer le suivi »**.
3. C'est fait : la table `Stats` est créée et les compteurs démarrent.

Si le bouton affiche que la création automatique est impossible, c'est que le
token Airtable n'a pas le scope `schema.bases:write`. Deux options :

- **soit** ajouter ce scope au token (https://airtable.com/create/tokens),
  puis recliquer sur le bouton ;
- **soit** créer la table à la main dans Airtable, base « Suivi des Ames
  PDVIE », table nommée exactement **`Stats`** :

  | Champ           | Type                        |
  |-----------------|-----------------------------|
  | `Jour`          | Texte court (champ primaire) |
  | `Visites`       | Nombre (0 décimale)          |
  | `Quiz lancés`   | Nombre (0 décimale)          |
  | `Quiz terminés` | Nombre (0 décimale)          |
  | `Opt-in`        | Nombre (0 décimale)          |
  | `Prières`       | Nombre (0 décimale)          |
  | `Nouveau-nés`   | Nombre (0 décimale)          |

### Notes techniques

- **1 fiche = 1 jour** (clé `Jour` au format `YYYY-MM-DD`, heure de Paris).
  Volume : ~365 fiches/an, sans risque pour les quotas Airtable.
- L'incrément est un *read-then-write* : deux évènements strictement
  simultanés peuvent, très rarement, n'en compter qu'un. Sans importance à
  l'échelle du tunnel — et sans transaction possible côté API Airtable.
- La fonction `/api/track` **ne casse jamais le site** : table absente ou
  Airtable indisponible → réponse `200 { ok: false }`, le visiteur ne voit rien.
- Tant que la table n'existe pas, `admin-stats` renvoie `activation: null` et
  le tableau de bord affiche le bouton d'activation au lieu d'une erreur.
