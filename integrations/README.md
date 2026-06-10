# Branchements — PDVIE (Vases d'Honneur)

Architecture : **site → Webhook Make → Airtable (CRM) + Gmail + Google Agenda**.
Le site reste 100 % statique et sûr : aucune clé secrète dedans, tout passe par Make.

```
optin.html  (type:"lead")   ─┐
                             ├─► Webhook Make ─► Router
merci.html  (type:"booking") ─┘                  ├─[lead]──► Airtable create  + Gmail (J0)
                                                 └─[booking]► Airtable upsert + Google Agenda (RDV)

Scénario planifié (1×/jour) : Airtable (recherche par âge du lead) ─► Gmail J1 / J3 / J5 / J7
```

Deux blueprints à importer :
- [`make-blueprint.json`](./make-blueprint.json) — **Scénario 1 : Capture & RDV** (instantané, webhook).
- [`make-blueprint-nurturing.json`](./make-blueprint-nurturing.json) — **Scénario 2 : Nurturing J1→J7** (planifié).

> Connexions réutilisées (déjà dans ton compte Make) : Airtable OAuth `airtable3` #6112403,
> Gmail `expertit.vasedhonneur@gmail.com` #6300394, Google `#6109732` (Agenda).
> Base Airtable **« Suivi des Ames PDVIE »** `appRLYZbJgmORxkxz`, table `Ames` `tblqFCCV7BAO8IJNL`.

---

## Scénario 1 — Capture & RDV

1. Make → **Create a new scenario** → ⋯ → **Import Blueprint** → `make-blueprint.json`.
2. Confirme les connexions. Make crée le webhook **« PDVIE Landing Webhook »** → **copie son URL**.
3. L'URL du webhook est **déjà collée** dans `assets/js/config.js → WEBHOOK_URL`
   (`https://hook.eu1.make.com/ja5b3w4yt1i98yockyaqz7vlb8ogu55y`). Si Make en génère une
   différente, remplace-la dans `config.js`.
4. **Active** le scénario.

Le **Router** lit le champ `type` du JSON reçu :

| `type` | Branche | Actions |
|--------|---------|---------|
| `lead` | Nouveau lead (depuis `optin.html`) | Airtable *créer* la fiche + Gmail email J0 |
| `booking` | Réservation RDV (depuis `merci.html`) | Airtable *upsert* (Email) → `Étape tunnel = RDV pris`, `RDV prière` + Google Agenda *crée l'événement* (invité = l'âme) |
| `convert` | A prié (depuis `nouveau-ne.html`) | Airtable *upsert* (Email) → `Étape tunnel = Prière faite` |

> **Ajouter la branche `convert` à un scénario déjà importé** (sans tout ré-importer) : sur le
> **Router**, ajoute une route ; copie le module Airtable « Make an API Call » de la branche
> *booking* ; mets son **filtre** sur `{{1.type}} = convert` ; et remplace son **Body** par :
> `{"performUpsert":{"fieldsToMergeOn":["Email"]},"typecast":true,"records":[{"fields":{"Prénom":"{{1.firstname}}","Email":"{{1.email}}","Étape tunnel":"Prière faite"}}]}`

Payload **lead** :
```json
{ "type":"lead","firstname":"Marie","email":"marie@ex.com","whatsapp":"+33…",
  "persona":"p2","personaLabel":"Blessé","lang":"fr","source":"landing-vasesdhonneur" }
```
Payload **booking** :
```json
{ "type":"booking","firstname":"Marie","email":"marie@ex.com","whatsapp":"+33…",
  "rdvStartISO":"2026-06-13T19:00:00","rdvEndISO":"2026-06-13T20:00:00","lang":"fr" }
```
L'événement Agenda est créé sur `nathanaelfongang@gmail.com` (le même calendrier que les
créneaux récurrents Mar–Sam 19h–20h), avec l'âme en invité → elle reçoit l'invitation.

---

## Scénario 2 — Nurturing J1 → J7

1. Importe `make-blueprint-nurturing.json`.
2. Dans le module **Airtable – Search Records**, confirme la base/table (déjà renseignées).
3. **Planifie** le scénario : **toutes les 24 h** (ex. chaque jour à 10h00).
4. Remplace `[LIEN_SITE]` par l'URL publique du site dans les 4 emails (J1, J3, J5).
5. **Active**.

Fonctionnement : chaque jour, le scénario cherche les fiches `Étape tunnel = Lead` dont
le champ formule **`Jours depuis entrée`** vaut 1, 3, 5 ou 7, puis un Router envoie l'email
correspondant. Comme chaque âge (1/3/5/7) n'arrive qu'une fois par fiche, **pas de doublon**
sans avoir besoin de champ « déjà envoyé ».

> Les 5 textes (J0→J7) existent aussi en **brouillons Gmail** (label « PDVIE — Suivi des Âmes »)
> si tu veux les peaufiner.

---

## Base Airtable — « Suivi des Ames PDVIE » ✅

Base `appRLYZbJgmORxkxz` · table `Ames` `tblqFCCV7BAO8IJNL`.

| Champ | Type |
|-------|------|
| Prénom | Single line (primaire) |
| Email | Email |
| WhatsApp | Phone |
| Persona | Select : Ouvert · Blessé · Chercheur |
| Langue | Select : FR · EN |
| Source | Single line |
| Étape tunnel | Select : Lead · Prière faite · RDV pris · Affermi |
| Statut | Select |
| Date d'entrée | Date |
| RDV prière | Date/heure |
| Jours depuis entrée | Formule `DATETIME_DIFF(TODAY();{Date d'entrée};'days')` |
| Référent | Collaborateur |
| Notes | Long text |

> ⚠️ Limites API Airtable : impossible de *supprimer* un champ → les défauts résiduels
> (`Attachments`, `Attachment Summary`) et les choix par défaut du champ `Statut`
> (Todo/In progress/Done) sont à nettoyer **à la main** dans l'UI si tu le souhaites.
