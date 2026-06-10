# Conversion2Christ777 — Nouvelles Vies en Christ

Landing page + **tunnel de conversion à Christ** pour une antenne locale de la
communauté **Nouvelles Vies en Christ**. Site statique (HTML/CSS/JS), bilingue **FR / EN**,
sans étape de build — hébergeable n'importe où (GitHub Pages, Netlify, Vercel,
serveur classique).

## 🧭 Le tunnel (parcours du prospect)

```
Réseaux sociaux (flyers, FB, WTA, réels)
        │  clic
        ▼
index.html   → Landing : hook + 3 portes (personas) + l'alternative + offre + témoignages
        │
        ▼
quiz.html    → Lead magnet « La source de ta soif » (4 questions, segmentation auto)
        │
        ▼
optin.html   → Capture (prénom + email + WhatsApp, consentement RGPD)
        │
        ▼
merci.html   → Remerciement + 1er pas (vidéo/WhatsApp) → invite à la prière
        │
        ▼
prier.html   → Moment de décision : prière du salut guidée + accompagnement
```

## 📁 Structure

| Fichier | Rôle |
|---------|------|
| `index.html` | Landing page complète (8 sections) |
| `quiz.html` | Quiz lead magnet « La source de ta soif » |
| `optin.html` | Formulaire de capture du lead |
| `merci.html` | Page de remerciement + premier pas |
| `prier.html` | Page de décision (prière du salut) |
| `assets/css/styles.css` | Design system « Or & Nuit » (variables CSS re-brandables) |
| `assets/js/i18n.js` | Bascule de langue FR/EN + tous les textes |
| `assets/js/quiz.js` | Logique du quiz et du résultat personnalisé |
| `assets/js/main.js` | Animations au scroll, utilitaires |

## ✏️ Personnaliser

- **Couleurs / branding** : variables en haut de `assets/css/styles.css` (`:root`).
- **Tous les textes** (FR + EN) : objet `I18N` dans `assets/js/i18n.js`.
- **Lien WhatsApp, email, réseaux** : placeholders `#` / `*.example` à remplacer.

## 🔌 Branchements à venir (voir `CLAUDE.md` §4)

La capture du lead (`optin.html`) stocke aujourd'hui en local + redirige.
Prochaine étape : connecter à **Airtable** (CRM des âmes), **Make.com**
(automatisation), **Gmail** (séquence de nurturing), **Google Agenda** (RDV de prière).

## ▶️ Aperçu local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## 🌐 Mettre en ligne (gratuit)

> ✅ **En ligne** : https://nouvellevieenchrist-pdvie-vdh-mks2026.netlify.app

Le site est 100 % statique (aucun build) → hébergeable tel quel. Deux options gratuites.

### Option A — Netlify (URL la plus propre, HTTPS auto, recommandé)
1. Crée un compte gratuit sur [netlify.com](https://netlify.com) (« Sign up with GitHub »).
2. **Add new site ▸ Import an existing project ▸ GitHub** → choisis ce dépôt.
3. Réglages : **Branch** = `claude/church-landing-conversion-funnel-llg2qq` (ou `main`),
   **Build command** = *(vide)*, **Publish directory** = `.` (racine) → **Deploy**.
4. URL du type `https://vases-honneur.netlify.app` (renommable dans *Site settings ▸ Domain*).
   Auto-redéploiement à chaque push.

### Option B — GitHub Pages (zéro compte en plus)
1. Dépôt GitHub → **Settings ▸ Pages**.
2. **Source** = *Deploy from a branch* → **Branch** = `claude/church-landing-conversion-funnel-llg2qq`,
   dossier **`/ (root)`** → **Save**.
3. Au bout d'~1 min : `https://nathan4kimpact.github.io/Conversion2Christ777/`
   (le `.nojekyll` à la racine garantit que `assets/` est servi tel quel).

### Après la mise en ligne
- Remplace `[LIEN_SITE]` par l'URL publique dans les emails Make (J1, J5) et les brouillons Gmail.
- (Option) achète un nom de domaine et branche-le (Netlify : *Domain ▸ Add custom domain*).

