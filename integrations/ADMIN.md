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
2. Scopes : `data.records:read`, `data.records:write`, `schema.bases:read`.
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
