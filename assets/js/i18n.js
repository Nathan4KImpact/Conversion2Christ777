/* =========================================================================
   i18n — Bascule de langue FR / EN
   Usage : <element data-i18n="key"></element>  (textContent)
           <element data-i18n-html="key"></element>  (innerHTML, pour le gras/lignes)
           <input data-i18n-ph="key">  (placeholder)
   La langue est mémorisée dans localStorage ("c2c_lang").
   ========================================================================= */

const I18N = {
  fr: {
    /* --- Nav / global --- */
    "brand.sub": "Vases d'Honneur",
    "nav.cta": "Je commence",
    "lang.fr": "FR",
    "lang.en": "EN",

    /* --- Hero --- */
    "hero.eyebrow": "Tu as cliqué. Ce n'était pas un hasard.",
    "hero.title": "Et si ta plus grande <span class=\"accent\">soif</span> avait enfin une réponse&nbsp;?",
    "hero.sub": "Paix, sens, guérison intérieure, vraie identité. Des millions les cherchent partout. Découvre la source vers laquelle tout convergeait depuis le début.",
    "hero.cta1": "Découvrir la source de ma soif",
    "hero.cta2": "Voir des histoires de vies transformées",
    "hero.trust1": "100% gratuit",
    "hero.trust2": "Sans jugement",
    "hero.trust3": "Confidentiel",
    "hero.verse": "« Dans une grande maison… il y a des vases d'honneur. » — 2 Timothée 2:20-21",

    /* --- Doors / personas --- */
    "doors.eyebrow": "Tu es ici pour une raison",
    "doors.title": "Quelle que soit la porte par laquelle tu entres…",
    "doors.subtitle": "…elles mènent toutes au même endroit. Reconnais-toi.",

    "door1.tag": "Le cœur déjà ouvert",
    "door1.title": "Tu connais déjà cette voix",
    "door1.text": "Tu as grandi avec ce message, ou il te touche depuis longtemps. Mais tu sens qu'il y a un pas de plus : passer du savoir à une rencontre vivante et personnelle.",
    "door1.link": "Faire ce pas",

    "door2.tag": "Le cœur lourd",
    "door2.title": "Tu portes un poids que personne ne voit",
    "door2.text": "Blessures d'enfance, vide, anxiété, fatigue de faire semblant. Tu veux retrouver l'espoir, la joie, un sens. Et si on déposait ce fardeau, ensemble&nbsp;?",
    "door2.link": "Déposer mon fardeau",

    "door3.tag": "Le cœur en quête",
    "door3.title": "Tu cherchais la lumière",
    "door3.text": "Développement personnel, énergies, pratiques venues d'ailleurs… tu cherches une paix et une puissance authentiques. Et si la Lumière, elle, te cherchait aussi&nbsp;?",
    "door3.link": "Trouver la vraie Lumière",

    /* --- Alternative / pillars --- */
    "alt.eyebrow": "La grande alternative",
    "alt.title": "Ce que tu cherches n'est pas une technique. C'est une Personne.",
    "alt.subtitle": "Toutes les méthodes du monde promettent l'apaisement. Jésus-Christ, Lui, offre bien plus : une vie nouvelle, reçue gratuitement par son Esprit.",
    "pillar1.title": "Le Salut",
    "pillar1.text": "Être pardonné, libéré, réconcilié. Non par tes efforts, mais par grâce. Un nouveau départ, réel.",
    "pillar2.title": "La Guérison",
    "pillar2.text": "Pour le cœur brisé, les blessures cachées, les fardeaux portés trop longtemps. La restauration de l'intérieur.",
    "pillar3.title": "La Paix",
    "pillar3.text": "Pas une paix de surface, mais celle qui surpasse toute compréhension. Une paix qui demeure, même dans la tempête.",

    /* --- Offre irrésistible --- */
    "offer.eyebrow": "L'offre irrésistible",
    "offer.title": "Le don le plus précieux… est entièrement gratuit",
    "offer.intro": "Le monde te fait payer cher ce qu'il ne peut pas garantir. L'Évangile t'offre, sans condition&nbsp;:",
    "offer.li1": "Le pardon total de tout ton passé",
    "offer.li2": "Une identité nouvelle : enfant de Dieu, vase d'honneur",
    "offer.li3": "La présence réelle de l'Esprit qui console et guérit",
    "offer.li4": "Une famille spirituelle qui t'accueille sans jugement",
    "offer.li5": "Une espérance solide pour aujourd'hui et pour l'éternité",
    "offer.price": "<s>Impayable</s> Gratuit",
    "offer.priceNote": "« C'est par la grâce que vous êtes sauvés, par le moyen de la foi. Cela ne vient pas de vous, c'est le don de Dieu. » — Éphésiens 2:8",
    "offer.cta": "Je veux recevoir ce don",

    /* --- Témoignages --- */
    "testi.eyebrow": "Des vies réellement transformées",
    "testi.title": "Ils cherchaient. Ils ont trouvé.",
    "testi1.quote": "J'avais tout essayé pour calmer mon angoisse. La première fois que j'ai vraiment prié, j'ai ressenti une paix que je ne savais même pas possible.",
    "testi1.author": "Sarah",
    "testi1.role": "Ancienne en quête spirituelle",
    "testi2.quote": "Je traînais mes blessures d'enfance depuis 30 ans. Aujourd'hui je suis libre. Pas parce que j'ai oublié, mais parce que j'ai été guéri.",
    "testi2.author": "David",
    "testi2.role": "Restauré",
    "testi3.quote": "Je croyais déjà connaître Dieu. Je le connaissais de loin. Maintenant je marche avec Lui chaque jour. Tout a changé.",
    "testi3.author": "Esther",
    "testi3.role": "Du savoir à la rencontre",

    /* --- CTA final --- */
    "ctaFinal.eyebrow": "Prêt(e) pour la suite ?",
    "ctaFinal.title": "Le premier pas tient en 2 minutes",
    "ctaFinal.sub": "Réponds à 4 questions simples. Nous t'aiderons à comprendre la source de ta soif — et le chemin précis pour l'étancher.",
    "ctaFinal.cta": "Commencer le test gratuit",

    /* --- Réassurance --- */
    "reassure.eyebrow": "Tu peux avancer en confiance",
    "reassure.title": "Notre engagement envers toi",
    "reassure1.title": "Sans aucun jugement",
    "reassure1.text": "Où que tu en sois, tu es accueilli tel que tu es. Ici, personne ne te regardera de haut.",
    "reassure2.title": "Tes données protégées",
    "reassure2.text": "Tes informations restent confidentielles et ne sont jamais revendues. Tu peux te désinscrire à tout moment.",
    "reassure3.title": "Une présence humaine",
    "reassure3.text": "Derrière l'écran, des personnes réelles, prêtes à t'écouter et à prier avec toi quand tu le souhaites.",

    /* --- Footer --- */
    "footer.tagline": "Une antenne de la communauté Vases d'Honneur. Accueillir, accompagner et affermir chaque personne dans une rencontre vivante avec Jésus-Christ.",
    "footer.explore": "Explorer",
    "footer.link.home": "Accueil",
    "footer.link.quiz": "Le test de la soif",
    "footer.link.story": "Histoires de vie",
    "footer.link.pray": "Prier maintenant",
    "footer.contact": "Contact",
    "footer.contact.text": "Une question, un besoin de prière&nbsp;? Écris-nous, nous répondons.",
    "footer.rights": "Vases d'Honneur — Tous droits réservés.",
    "footer.privacy": "Confidentialité",
    "footer.legal": "Mentions légales",

    /* --- Quiz --- */
    "quiz.title": "La source de ta soif",
    "quiz.intro": "4 questions, 2 minutes. À la fin, tu recevras une lecture personnalisée et un premier pas concret.",
    "quiz.start": "Commencer",
    "quiz.q1": "Quand tu es seul(e) et que tout devient silencieux, qu'est-ce qui remonte le plus souvent&nbsp;?",
    "quiz.q1a": "Une envie de me rapprocher de Dieu, sans savoir comment",
    "quiz.q1b": "Un poids, une tristesse ou une blessure ancienne",
    "quiz.q1c": "Une recherche de sens, d'énergie ou de paix intérieure",
    "quiz.q2": "Qu'est-ce qui t'a le plus manqué jusqu'ici&nbsp;?",
    "quiz.q2a": "Une foi vivante, pas seulement des connaissances",
    "quiz.q2b": "Quelqu'un à qui parler, et de l'espoir",
    "quiz.q2c": "Une spiritualité vraie, sans illusion ni manipulation",
    "quiz.q3": "Comment décrirais-tu ta relation actuelle avec le spirituel&nbsp;?",
    "quiz.q3a": "Je crois, mais je me sens loin / tiède",
    "quiz.q3b": "Je suis épuisé(e), j'ai besoin d'être relevé(e)",
    "quiz.q3c": "J'explore beaucoup de voies, sans rien trouver de stable",
    "quiz.q4": "Si tu pouvais recevoir une seule chose aujourd'hui&nbsp;?",
    "quiz.q4a": "Une rencontre réelle et personnelle avec Dieu",
    "quiz.q4b": "La guérison de mon cœur et la joie de vivre",
    "quiz.q4c": "Une paix profonde et durable",
    "quiz.result.title": "Voici la source de ta soif",
    "quiz.result.cta": "Recevoir mon premier pas",
    "quiz.back": "← Retour",

    "result.p1.badge": "Le cœur déjà ouvert",
    "result.p1.title": "Tu es à un pas d'une foi vivante",
    "result.p1.text": "Tu connais déjà le chemin de tête. Ce qui t'attend, c'est de le connaître de cœur : passer de la religion à la relation. Ce pas est plus proche que tu ne le penses.",
    "result.p2.badge": "Le cœur à relever",
    "result.p2.title": "Ta guérison peut commencer aujourd'hui",
    "result.p2.text": "Tu n'as pas à porter ce fardeau seul(e) plus longtemps. Celui qui guérit les cœurs brisés t'attend. La restauration n'est pas un rêve — c'est une promesse.",
    "result.p3.badge": "Le cœur en quête",
    "result.p3.title": "Tu as cherché la Lumière — Elle a un Nom",
    "result.p3.text": "La paix et la puissance authentiques ne se manipulent pas : elles se reçoivent. Ce que les techniques promettent sans tenir, une Personne te l'offre vraiment : Jésus.",

    /* --- Opt-in --- */
    "optin.title": "Ton premier pas t'attend",
    "optin.lead": "Laisse-nous t'envoyer ton résultat complet et un accompagnement doux, à ton rythme. Aucune pression, jamais.",
    "optin.firstname": "Ton prénom",
    "optin.email": "Ton email",
    "optin.whatsapp": "Ton WhatsApp (optionnel)",
    "optin.consent": "J'accepte de recevoir des messages d'accompagnement. Je peux me désinscrire à tout moment. Mes données restent confidentielles.",
    "optin.submit": "Recevoir mon accompagnement",
    "optin.skip": "Je préfère prier directement maintenant →",

    /* --- Merci --- */
    "merci.title": "Bienvenue dans la famille 🤍",
    "merci.lead": "C'est reçu. Une nouvelle aventure commence pour toi — et tu n'es plus seul(e).",
    "merci.step.title": "Ton tout premier pas, maintenant",
    "merci.step.text": "Tu n'as pas besoin d'attendre. Le moment le plus important de ta vie peut avoir lieu là, où tu es. Es-tu prêt(e) à rencontrer Jésus personnellement&nbsp;?",
    "merci.cta": "Oui, je veux prier maintenant",
    "merci.join": "Rejoindre notre groupe WhatsApp",

    /* --- Prière / décision --- */
    "pray.eyebrow": "Le moment de la décision",
    "pray.title": "La prière qui change tout",
    "pray.lead": "Il n'y a pas de formule magique. Dieu regarde ton cœur, pas tes mots parfaits. Si tu le désires sincèrement, dis cette prière à voix haute — elle t'appartient&nbsp;:",
    "pray.prayer": "Seigneur Jésus,<br>je reconnais que j'ai besoin de Toi.<br>Merci d'avoir donné ta vie pour moi.<br>Aujourd'hui, je te donne la mienne.<br>Pardonne-moi, entre dans mon cœur,<br>et fais de moi un vase d'honneur.<br>Je veux te suivre, dès maintenant.<br>Amen.",
    "pray.after.title": "Tu viens de prier&nbsp;? Alors écoute bien…",
    "pray.after.text": "Si tu as dit cette prière du fond du cœur, le ciel est en fête pour toi. Tu es né(e) de nouveau. Ce n'est pas une fin, c'est un commencement — et nous voulons marcher ce chemin avec toi.",
    "pray.cta": "J'ai prié — accompagnez-moi",
    "pray.cta2": "Parler à quelqu'un / être rappelé(e)",
  },

  en: {
    "brand.sub": "Vessels of Honor",
    "nav.cta": "Get started",
    "lang.fr": "FR",
    "lang.en": "EN",

    "hero.eyebrow": "You clicked. It wasn't by chance.",
    "hero.title": "What if your deepest <span class=\"accent\">thirst</span> finally had an answer?",
    "hero.sub": "Peace, meaning, inner healing, true identity. Millions search everywhere for them. Discover the source it was all pointing to from the start.",
    "hero.cta1": "Discover the source of my thirst",
    "hero.cta2": "See transformed lives",
    "hero.trust1": "100% free",
    "hero.trust2": "No judgment",
    "hero.trust3": "Confidential",
    "hero.verse": "“In a great house… there are vessels of honor.” — 2 Timothy 2:20-21",

    "doors.eyebrow": "You're here for a reason",
    "doors.title": "Whichever door you come through…",
    "doors.subtitle": "…they all lead to the same place. See yourself.",

    "door1.tag": "The open heart",
    "door1.title": "You already know this voice",
    "door1.text": "You grew up with this message, or it has moved you for a long time. But you sense there's one more step: from knowing about it to a living, personal encounter.",
    "door1.link": "Take that step",

    "door2.tag": "The heavy heart",
    "door2.title": "You carry a weight no one sees",
    "door2.text": "Childhood wounds, emptiness, anxiety, the exhaustion of pretending. You long for hope, joy, meaning. What if we laid that burden down, together?",
    "door2.link": "Lay down my burden",

    "door3.tag": "The searching heart",
    "door3.title": "You were searching for light",
    "door3.text": "Self-help, energies, practices from elsewhere… you're seeking authentic peace and power. What if the Light was searching for you too?",
    "door3.link": "Find the true Light",

    "alt.eyebrow": "The great alternative",
    "alt.title": "What you seek isn't a technique. It's a Person.",
    "alt.subtitle": "Every method in the world promises relief. Jesus Christ offers far more: a new life, received freely through His Spirit.",
    "pillar1.title": "Salvation",
    "pillar1.text": "To be forgiven, set free, reconciled. Not by your efforts, but by grace. A real, fresh start.",
    "pillar2.title": "Healing",
    "pillar2.text": "For the broken heart, hidden wounds, burdens carried far too long. Restoration from the inside out.",
    "pillar3.title": "Peace",
    "pillar3.text": "Not surface calm, but the peace that surpasses all understanding. A peace that remains, even in the storm.",

    "offer.eyebrow": "The irresistible offer",
    "offer.title": "The most precious gift… is entirely free",
    "offer.intro": "The world charges you dearly for what it cannot guarantee. The Gospel offers you, with no conditions:",
    "offer.li1": "Full forgiveness of your entire past",
    "offer.li2": "A new identity: child of God, vessel of honor",
    "offer.li3": "The real presence of the Spirit who comforts and heals",
    "offer.li4": "A spiritual family that welcomes you without judgment",
    "offer.li5": "A solid hope for today and for eternity",
    "offer.price": "<s>Priceless</s> Free",
    "offer.priceNote": "“For it is by grace you have been saved, through faith… it is the gift of God.” — Ephesians 2:8",
    "offer.cta": "I want to receive this gift",

    "testi.eyebrow": "Truly transformed lives",
    "testi.title": "They searched. They found.",
    "testi1.quote": "I had tried everything to calm my anxiety. The first time I truly prayed, I felt a peace I didn't even know was possible.",
    "testi1.author": "Sarah",
    "testi1.role": "Former spiritual seeker",
    "testi2.quote": "I dragged my childhood wounds around for 30 years. Today I'm free. Not because I forgot, but because I was healed.",
    "testi2.author": "David",
    "testi2.role": "Restored",
    "testi3.quote": "I thought I already knew God. I knew Him from afar. Now I walk with Him every day. Everything changed.",
    "testi3.author": "Esther",
    "testi3.role": "From knowing to meeting",

    "ctaFinal.eyebrow": "Ready for what's next?",
    "ctaFinal.title": "The first step takes 2 minutes",
    "ctaFinal.sub": "Answer 4 simple questions. We'll help you understand the source of your thirst — and the exact path to quench it.",
    "ctaFinal.cta": "Start the free test",

    "reassure.eyebrow": "You can move forward with confidence",
    "reassure.title": "Our promise to you",
    "reassure1.title": "No judgment, ever",
    "reassure1.text": "Wherever you are, you're welcomed exactly as you are. No one here will look down on you.",
    "reassure2.title": "Your data protected",
    "reassure2.text": "Your information stays confidential and is never sold. You can unsubscribe at any time.",
    "reassure3.title": "Real human presence",
    "reassure3.text": "Behind the screen, real people, ready to listen and pray with you whenever you wish.",

    "footer.tagline": "A local branch of the Vessels of Honor community. To welcome, walk alongside, and strengthen every person in a living encounter with Jesus Christ.",
    "footer.explore": "Explore",
    "footer.link.home": "Home",
    "footer.link.quiz": "The thirst test",
    "footer.link.story": "Life stories",
    "footer.link.pray": "Pray now",
    "footer.contact": "Contact",
    "footer.contact.text": "A question, a prayer need? Write to us — we reply.",
    "footer.rights": "Vessels of Honor — All rights reserved.",
    "footer.privacy": "Privacy",
    "footer.legal": "Legal notice",

    "quiz.title": "The source of your thirst",
    "quiz.intro": "4 questions, 2 minutes. At the end, you'll get a personalized reading and a concrete first step.",
    "quiz.start": "Start",
    "quiz.q1": "When you're alone and everything goes quiet, what surfaces most often?",
    "quiz.q1a": "A longing to get closer to God, without knowing how",
    "quiz.q1b": "A weight, a sadness, or an old wound",
    "quiz.q1c": "A search for meaning, energy, or inner peace",
    "quiz.q2": "What have you missed most until now?",
    "quiz.q2a": "A living faith, not just knowledge",
    "quiz.q2b": "Someone to talk to, and hope",
    "quiz.q2c": "A true spirituality, without illusion or manipulation",
    "quiz.q3": "How would you describe your current relationship with the spiritual?",
    "quiz.q3a": "I believe, but I feel far / lukewarm",
    "quiz.q3b": "I'm exhausted, I need to be lifted up",
    "quiz.q3c": "I explore many paths, finding nothing stable",
    "quiz.q4": "If you could receive just one thing today?",
    "quiz.q4a": "A real, personal encounter with God",
    "quiz.q4b": "Healing for my heart and the joy of living",
    "quiz.q4c": "A deep and lasting peace",
    "quiz.result.title": "Here is the source of your thirst",
    "quiz.result.cta": "Receive my first step",
    "quiz.back": "← Back",

    "result.p1.badge": "The open heart",
    "result.p1.title": "You're one step from a living faith",
    "result.p1.text": "You already know the way in your head. What awaits you is to know it in your heart: from religion to relationship. That step is closer than you think.",
    "result.p2.badge": "The heart to be lifted",
    "result.p2.title": "Your healing can begin today",
    "result.p2.text": "You don't have to carry this burden alone any longer. The One who heals broken hearts is waiting for you. Restoration isn't a dream — it's a promise.",
    "result.p3.badge": "The searching heart",
    "result.p3.title": "You searched for the Light — It has a Name",
    "result.p3.text": "Authentic peace and power aren't manipulated: they're received. What techniques promise but never deliver, a Person truly offers you: Jesus.",

    "optin.title": "Your first step awaits",
    "optin.lead": "Let us send you your full result and gentle support, at your own pace. No pressure, ever.",
    "optin.firstname": "Your first name",
    "optin.email": "Your email",
    "optin.whatsapp": "Your WhatsApp (optional)",
    "optin.consent": "I agree to receive supportive messages. I can unsubscribe at any time. My data stays confidential.",
    "optin.submit": "Receive my support",
    "optin.skip": "I'd rather pray directly now →",

    "merci.title": "Welcome to the family 🤍",
    "merci.lead": "All set. A new journey begins for you — and you're no longer alone.",
    "merci.step.title": "Your very first step, now",
    "merci.step.text": "You don't need to wait. The most important moment of your life can happen right where you are. Are you ready to meet Jesus personally?",
    "merci.cta": "Yes, I want to pray now",
    "merci.join": "Join our WhatsApp group",

    "pray.eyebrow": "The moment of decision",
    "pray.title": "The prayer that changes everything",
    "pray.lead": "There's no magic formula. God looks at your heart, not your perfect words. If you sincerely desire it, say this prayer out loud — it's yours:",
    "pray.prayer": "Lord Jesus,<br>I admit that I need You.<br>Thank You for giving Your life for me.<br>Today, I give You mine.<br>Forgive me, come into my heart,<br>and make me a vessel of honor.<br>I want to follow You, starting now.<br>Amen.",
    "pray.after.title": "Did you just pray? Then listen closely…",
    "pray.after.text": "If you said this prayer from the bottom of your heart, heaven is celebrating for you. You are born again. This isn't an end, it's a beginning — and we want to walk this road with you.",
    "pray.cta": "I prayed — walk with me",
    "pray.cta2": "Talk to someone / be called back",
  },
};

(function () {
  const STORE = "c2c_lang";
  function detect() {
    const saved = localStorage.getItem(STORE);
    if (saved && I18N[saved]) return saved;
    const nav = (navigator.language || "fr").slice(0, 2).toLowerCase();
    return I18N[nav] ? nav : "fr";
  }

  let lang = detect();

  function apply(l) {
    lang = I18N[l] ? l : "fr";
    localStorage.setItem(STORE, lang);
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (I18N[lang][key] != null) el.textContent = I18N[lang][key];
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (I18N[lang][key] != null) el.innerHTML = I18N[lang][key];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      const key = el.getAttribute("data-i18n-ph");
      if (I18N[lang][key] != null) el.setAttribute("placeholder", I18N[lang][key]);
    });

    document.querySelectorAll(".lang-switch button").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === lang);
    });

    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  // Expose
  window.C2C_I18N = {
    t: (key) => (I18N[lang] && I18N[lang][key]) || (I18N.fr[key] || key),
    get lang() { return lang; },
    set: apply,
  };

  document.addEventListener("DOMContentLoaded", () => {
    apply(lang);
    document.querySelectorAll(".lang-switch button").forEach((b) => {
      b.addEventListener("click", () => apply(b.dataset.lang));
    });
  });
})();
