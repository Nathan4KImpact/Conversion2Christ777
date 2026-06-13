# Branchements — PDVIE (Nouvelles Vies en Jésus)

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
| `lead` | Nouveau lead (depuis `optin.html`) | Airtable *upsert* (Email) + Gmail email J0 — **filtré : envoyé uniquement si la fiche vient d'être créée** (`createdRecords` non vide), pour ne pas re-spammer un lead qui re-remplit le formulaire |
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
3. **Planifie** le scénario : **1×/jour** (ex. chaque jour à 10h00) suffit — le mécanisme
   anti-doublon le rend de toute façon **idempotent** (le relancer plus souvent n'envoie rien en plus).
4. **Active**.

Fonctionnement (anti-doublon ✅ + rattrapage des jours manqués) : le scénario cherche les
fiches `Étape tunnel = Lead`, **sans RDV**, en **fenêtres de jours** (J1 = 1-2 j, J3 = 3-4 j,
J5 = 5-6 j, J7 = 7 j et +) **ET dont le champ « Jx envoyé » n'est pas encore coché**. Après
chaque envoi Gmail réussi, un module Airtable **coche « Jx envoyé »** sur la fiche
(`PATCH v0/base/table/{{1.id}}`). Au passage suivant, la formule l'exclut → **un seul email
par campagne et par âme**.

> 💡 **Pourquoi des fenêtres et non des jours exacts ?** Avec un jour exact (`=1`, `=3`…), si
> le scénario ne tourne pas pile ce jour-là — ou si l'âme « tombe » un jour pair — la campagne
> est **sautée définitivement**. Les fenêtres (`>=1 et <3`, etc.) garantissent que **chaque
> email part une fois**, même en cas d'exécution manquée ou de jour creux.

Formule du module Search Records :
```
AND({Étape tunnel}='Lead', {RDV prière}=BLANK(),
  OR(AND({Jours depuis entrée}>=1, {Jours depuis entrée}<3, NOT({J1 envoyé})),
     AND({Jours depuis entrée}>=3, {Jours depuis entrée}<5, NOT({J3 envoyé})),
     AND({Jours depuis entrée}>=5, {Jours depuis entrée}<7, NOT({J5 envoyé})),
     AND({Jours depuis entrée}>=7, NOT({J7 envoyé}))))
```

Filtres des 4 branches Gmail (routeur) — à mettre en cohérence avec les fenêtres :
| Branche | Condition sur `Jours depuis entrée` |
|---------|-------------------------------------|
| Jour 1  | `≥ 1` (number) **ET** `< 3` (number) |
| Jour 3  | `≥ 3` **ET** `< 5` |
| Jour 5  | `≥ 5` **ET** `< 7` |
| Jour 7  | `≥ 7` |

> **Mettre à jour le scénario déjà en ligne sans ré-importer** :
> 1. Module **Airtable – Search Records** → remplace la **formule** par celle ci-dessus.
> 2. Sur **chaque** branche, ouvre le **filtre avant le Gmail** et passe-le en fenêtre numérique
>    (tableau ci-dessus) — opérateurs *Greater than or equal to (number)* / *Less than (number)*.
> 3. Après **chaque** module Gmail (J1, J3, J5, J7), un module **Airtable → Make an API Call**
>    (connexion qui écrit) coche la case :
>    - URL : `v0/appRLYZbJgmORxkxz/tblqFCCV7BAO8IJNL/{{1.id}}` · Méthode : `PATCH`
>    - Header : `Content-Type: application/json`
>    - Body : `{"fields":{"J1 envoyé":true}}` (adapter `J1`→`J3`/`J5`/`J7` selon la branche).
> 4. De même, sur le **Scénario 1**, ajoute un **filtre** entre le module Airtable upsert et le
>    Gmail J0 : condition `{{length(3.body.createdRecords)}}` **Greater than (number)** `0`
>    (remplace `3` par le n° réel du module Airtable de la branche lead).

### Vidéos personnalisées selon le persona 🎥

Chaque email J1/J3/J5 propose **une vidéo choisie selon le `Persona` du lead**, via la fonction
Make `switch(1.Persona; "Ouvert"; …; "Blessé"; …; …; <défaut>)` directement dans le HTML
(URL + titre). J7 renvoie vers le **mur complet des témoignages** (`/index.html#testimonials`),
où toute la bibliothèque est classée par profil. Un lien « Voir tous les témoignages » figure
aussi dans chaque email → **toute la bibliothèque reste joignable**, quel que soit le profil.

| Jour | Ouvert | Blessé | Chercheur | Musulman | Sceptique |
|------|--------|--------|-----------|----------|-----------|
| **J1** | Nick Vujicic | « …l'homosexualité… » | New Age (1) | Al-Azzaz | D'athée à Dieu |
| **J3** | Pauline | Janick | Sauvés du New Age | Amir | Alexia Vidot |
| **J5** | Évangile présenté | Sarah | Sortir des énergies | Moussa Koné | Plan de salut |
| **J7** | → tous les témoignages (mur complet, tous profils) |

> Si le champ `Persona` est vide/inconnu, le `switch` retombe sur le **mur de témoignages**
> (défaut). Les vidéos non citées ci-dessus (Nathalie, Juliana, EMCI, Ali, Naeem, preuves
> historiques, Joël Spinks…) restent accessibles via ce mur. Séquence en **français** ;
> des variantes EN pourront être ajoutées avec un second `switch` sur `{{1.Langue}}`.


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
| J1 envoyé · J3 envoyé · J5 envoyé · J7 envoyé | Cases à cocher — cochées par Make après chaque envoi de nurturing (anti-doublon) |
| Référent | Collaborateur |
| Notes | Long text |

> ⚠️ Limites API Airtable : impossible de *supprimer* un champ → les défauts résiduels
> (`Attachments`, `Attachment Summary`) et les choix par défaut du champ `Statut`
> (Todo/In progress/Done) sont à nettoyer **à la main** dans l'UI si tu le souhaites.
