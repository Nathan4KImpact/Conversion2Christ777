# Branchements — PDVIE (Vases d'Honneur)

Architecture : **formulaire du site → Webhook Make → Airtable (CRM) + Gmail (nurturing)**.
Le site reste 100 % statique et sûr : aucune clé secrète dedans, tout passe par Make.

```
optin.html ──POST JSON──► Webhook Make ──► Airtable « Suivi des Ames PDVIE » (table "Ames")
                                        └─► Gmail : email de bienvenue (J0)
```

## 1) Importer le scénario dans Make

1. Make → **Scenarios** → **Create a new scenario** → menu **⋯** → **Import Blueprint**.
2. Choisis le fichier [`make-blueprint.json`](./make-blueprint.json).
3. À l'import, Make te demande de confirmer les connexions (elles existent déjà
   dans ton compte) :
   - **Webhook** : il crée un webhook nommé *« PDVIE Landing Webhook »* → **copie son URL**.
   - **Airtable** : connexion OAuth existante (`airtable3`).
   - **Gmail** : connexion `expertit.vasedhonneur@gmail.com` (modifiable).
4. Dans le module **Airtable – Make an API Call**, l'URL pointe déjà sur la base
   créée : `v0/appRLYZbJgmORxkxz/Ames` (base « Suivi des Ames PDVIE », table `Ames`).
5. **Active** le scénario (toggle ON).

## 2) Brancher le site

Colle l'URL du webhook dans `assets/js/config.js` :

```js
window.C2C_CONFIG = {
  WEBHOOK_URL: "https://hook.eu1.make.com/xxxxxxxxxxxxxxxx", // ← ici
  BOOKING_URL: "", // page Google Agenda « Prendre RDV » ou Calendly
  ...
};
```

Le formulaire `optin.html` envoie alors ce JSON à chaque nouveau contact :

```json
{
  "firstname": "Marie", "email": "marie@ex.com", "whatsapp": "+33...",
  "persona": "p2", "personaLabel": "Blessé", "lang": "fr",
  "source": "landing-vasesdhonneur", "ts": "2026-06-09T18:00:00.000Z"
}
```

## 3) Base Airtable — « Suivi des Ames PDVIE » ✅ créée

Base `appRLYZbJgmORxkxz` · table `Ames` `tblqFCCV7BAO8IJNL`. Champs en place :

| Champ | Type | Notes |
|-------|------|-------|
| Prénom | Single line text | **champ primaire** |
| Email | Email | |
| WhatsApp | Phone number | |
| Persona | Single select | Ouvert · Blessé · Chercheur |
| Langue | Single select | FR · EN |
| Source | Single line text | ex. `landing-vasesdhonneur` |
| Étape tunnel | Single select | Lead · Prière faite · RDV pris · Affermi |
| Statut | Single select | Nouveau · En cours · Suivi |
| Date d'entrée | Date | rempli par Make (`YYYY-MM-DD`) |
| RDV prière | Date/heure | créneau Mar–Sam 19h–20h |
| Notes | Long text | |

> ⚠️ La table doit s'appeler **`Ames`** (sans accent) car son nom est utilisé dans
> l'URL de l'API Airtable. Le libellé d'affichage peut rester « Âmes » si tu utilises
> plutôt l'ID de table dans l'URL.

## 4) Aller plus loin (séquence de nurturing J1→J7)

Le scénario importé envoie l'email **J0** (bienvenue). Pour la suite (J1, J3, J5, J7),
deux options :
- **Airtable Automations** (déclenché sur `Étape tunnel = Lead`, avec délais), ou
- un **2ᵉ scénario Make planifié** qui parcourt les enregistrements et envoie l'email
  du jour selon `Date d'entrée`. Les 5 textes sont déjà prêts en **brouillons Gmail**
  (label « PDVIE — Suivi des Âmes »).
