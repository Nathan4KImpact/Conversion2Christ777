# Envoyer depuis `contact@nouvellesviesenjesus.fr`

> Objectif : que les emails du tunnel (J0, J1, J3, J5, J7) partent d'une adresse
> qui fait autorité sur le domaine, et non d'une adresse Gmail personnelle.

---

## Le point à comprendre avant de commencer

**Changer l'expéditeur est facile. Ne pas tomber en spam est le vrai travail.**

Un serveur de réception pose trois questions à chaque message :

| Question | Mécanisme |
|---|---|
| Ce serveur a-t-il le droit d'envoyer pour ce domaine ? | **SPF** |
| Le message est-il signé par le domaine ? | **DKIM** |
| Le domaine du `From` correspond-il aux deux précédents ? | **DMARC** |

Aujourd'hui les emails partent d'une adresse Gmail : les trois passent, parce
que Google envoie pour son propre domaine. Si on met simplement
`contact@nouvellesviesenjesus.fr` dans le `From` **sans rien d'autre**, le
message revendique un domaine qui n'a autorisé personne à envoyer pour lui.
Résultat : la délivrabilité devient **pire** qu'aujourd'hui, pas meilleure.

D'où l'ordre des étapes ci-dessous : la boîte et les enregistrements DNS
**d'abord**, le `From` dans Make **en dernier**.

---

## Voie A — Gmail relaie via OVH *(recommandée)*

Le principe : la boîte vit chez OVH (MX Plan, inclus avec le domaine), et Gmail
est configuré pour envoyer **à travers** le serveur SMTP d'OVH. Les messages
quittent donc réellement l'infrastructure OVH, ce qui aligne naturellement SPF
et DKIM avec les enregistrements du domaine.

Avantages : on ne touche qu'un champ par module dans Make, et la trace des
envois reste dans Gmail.

### 1. Créer la boîte chez OVH

Espace client OVH ▸ **Web Cloud** ▸ **Emails** ▸ `nouvellesviesenjesus.fr` ▸
onglet **Emails** ▸ *Ajouter un compte*.

- Adresse : `contact@nouvellesviesenjesus.fr`
- Mot de passe : à garder — il servira à l'étape 5.

*Prérequis* : les enregistrements MX d'OVH doivent être dans la zone
(`mx1.mail.ovh.net`, `mx2…`, `mx3…`). Ils y sont depuis la bascule du domaine
(v17, option B : zone DNS conservée chez OVH, MX Plan intact).

### 2. Rediriger vers votre Gmail *(fortement conseillé)*

Même écran ▸ onglet **Redirections** ▸ créer
`contact@nouvellesviesenjesus.fr` → votre Gmail.

Sans ça, les réponses des personnes accompagnées arrivent dans une boîte OVH
que personne ne consulte. Avec la redirection, tout continue d'arriver là où
vous lisez déjà vos messages.

### 3. Activer DKIM

Espace client ▸ **Emails** ▸ le domaine ▸ onglet **Diagnostics** (ou **DKIM**)
▸ *Activer DKIM*.

La zone DNS étant chez OVH, l'enregistrement (`ovhXXXX._domainkey`) est ajouté
automatiquement. Propagation : quelques minutes à quelques heures.

### 4. SPF et DMARC

**SPF** — OVH propose *Activer le SPF* sur le même écran. L'enregistrement
obtenu ressemble à :

```
v=spf1 include:mx.ovh.com ~all
```

⚠️ **Un seul enregistrement SPF par domaine.** S'il en existe déjà un, il faut
le **fusionner**, pas en ajouter un second — deux SPF = SPF invalide, donc
échec pour tout le monde.

**DMARC** — à ajouter à la main. Zone DNS ▸ *Ajouter une entrée* ▸ **TXT** :

| Champ | Valeur |
|---|---|
| Sous-domaine | `_dmarc` |
| Valeur | `v=DMARC1; p=none; rua=mailto:contact@nouvellesviesenjesus.fr; adkim=r; aspf=r` |

Commencer en `p=none` : la politique n'agit pas, elle **observe** et vous
envoie des rapports. Après deux à quatre semaines de rapports propres, passer
à `p=quarantine`, puis éventuellement `p=reject`.

### 5. Déclarer l'adresse dans Gmail

⚠️ **Sur le compte Google utilisé par la connexion Make** (`expertit.vasedhonneur`,
connexion `6300394`) — pas un autre. L'API Gmail refuse un `From` qui n'est pas
un alias vérifié **du compte connecté**.

Gmail ▸ ⚙️ ▸ *Voir tous les paramètres* ▸ **Comptes et importation** ▸
« Envoyer des e-mails en tant que » ▸ *Ajouter une autre adresse e-mail*.

- Nom : `Nathanaël — Nouvelles Vies en Jésus`
- Adresse : `contact@nouvellesviesenjesus.fr`
- **Décocher « Traiter comme un alias »** — pour que les réponses partent bien
  vers l'adresse de contact et non vers votre Gmail personnel.

Puis les paramètres SMTP :

| Champ | Valeur |
|---|---|
| Serveur SMTP | `ssl0.ovh.net` |
| Port | `465` |
| Sécurité | **SSL** |
| Nom d'utilisateur | `contact@nouvellesviesenjesus.fr` *(adresse complète)* |
| Mot de passe | celui de l'étape 1 |

Gmail envoie un code de confirmation à `contact@…`. Grâce à la redirection de
l'étape 2, il arrive dans votre boîte habituelle — sinon, le récupérer sur
[mail.ovh.net](https://www.ovh.com/fr/mail/).

### 6. Régler le `From` dans Make

Les **5 modules Gmail** concernés :

| Scénario | Module |
|---|---|
| Capture & RDV | J0 — bienvenue |
| Nurturing | J1, J3, J5, J7 |

Dans chaque module *Send an email* : cliquer **« Show advanced settings »** en
bas du panneau — le champ **From** y est masqué par défaut — puis saisir :

```
contact@nouvellesviesenjesus.fr
```

Adresse nue, sans nom d'affichage : le nom vient déjà de l'alias Gmail
(étape 5), et le garder à un seul endroit évite qu'ils divergent.

> Les blueprints du repo (`make-blueprint.json`, `make-blueprint-nurturing.json`)
> portent déjà ce champ. Un ré-import le pose sur les 5 modules d'un coup —
> mais **seulement après** les étapes 1 à 5, sinon chaque envoi échoue.

### 7. Recette

1. Déclencher un envoi de test vers une adresse **Gmail**.
2. Ouvrir le message ▸ ⋮ ▸ **« Afficher l'original »**.
3. Vérifier les trois lignes :

```
SPF:    PASS   avec le domaine nouvellesviesenjesus.fr
DKIM:   PASS   avec le domaine nouvellesviesenjesus.fr
DMARC:  PASS   avec le domaine nouvellesviesenjesus.fr
```

Le domaine doit être le vôtre sur les trois lignes. Si l'une affiche
`gmail.com`, l'alignement n'est pas fait — reprendre à l'étape 3 ou 5.

4. Complément utile : envoyer à une adresse [mail-tester.com](https://www.mail-tester.com)
   et viser **≥ 9/10**.

---

## Voie B — Make envoie directement en SMTP

Remplacer les 5 modules `Gmail — Send an email` par le module natif
**Email ▸ Send an email** de Make, sur une connexion SMTP OVH
(`ssl0.ovh.net`, port `465`, SSL, identifiant = l'adresse complète).

- **Pour** : chaîne plus courte, Gmail sort du circuit.
- **Contre** : il faut recréer 5 modules et y recoller tout le HTML, et les
  messages envoyés n'apparaissent plus dans « Messages envoyés ».

Les étapes DNS 1, 3 et 4 restent **exactement les mêmes** — ce sont elles qui
font le travail de délivrabilité, quel que soit le chemin d'envoi.

---

## Voie C — Service transactionnel *(plus tard, si besoin)*

Brevo (300 emails/jour gratuits), Resend, Mailgun… Apportent l'authentification
de domaine guidée, la gestion des bounces, les statistiques d'ouverture et
l'en-tête `List-Unsubscribe` nativement.

**Pas maintenant** : à votre volume, la voie A suffit et n'ajoute aucune
dépendance. À reconsidérer si le volume grimpe ou si la délivrabilité pose
problème malgré une recette au vert.

---

## À faire dans la même passe

Vous allez de toute façon ouvrir les 5 modules Gmail. Trois chantiers
attendent au même endroit — autant les traiter ensemble :

1. **Les templates v22** (désamorçage du risque d'étiquetage) — voir
   [PR #14](https://github.com/Nathan4KImpact/Conversion2Christ777/pull/14).
   Corrigés dans le repo depuis le 14 août, pas encore en production.
2. **Le champ `From`** — objet de ce document.
3. **Le footer standard avec lien de désabonnement** (tâche 1.2 du Sprint 1).
   Vérifié le 2026-09-03 : **aucun des 5 emails n'en a**. C'est une exposition
   RGPD, et l'absence de désabonnement est l'un des signaux qui pèsent le plus
   lourd dans le classement en spam. Le faire maintenant sert donc aussi la
   bascule d'expéditeur.

## Cohérence du site

Si `contact@nouvellesviesenjesus.fr` devient l'adresse officielle, le lien
« Écrivez-nous » du pied de page devrait pointer là aussi. Il utilise
aujourd'hui l'adresse Gmail, assemblée au clic contre les aspirateurs
(`assets/js/footer.js`, attributs `data-u` / `data-d`). Changement d'une ligne,
à faire quand la boîte est active.

## Réputation du domaine

Un domaine expéditeur neuf n'a aucun historique. À votre volume — quelques
leads par jour — c'est sans conséquence. Cela le deviendrait si vous envoyiez
soudainement plusieurs centaines de messages le premier jour : dans ce cas,
montez progressivement sur deux à trois semaines.
