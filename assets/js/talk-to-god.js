/* =========================================================================
   talk-to-god.js — « Parler à Dieu », accessible à tout moment

   Le problème : jusqu'ici, une personne devait traverser tout le tunnel
   (landing → quiz → opt-in → merci) avant qu'on lui propose de s'adresser à
   Dieu. Or quelqu'un peut être touché dès la première section — et repartir
   sans qu'on lui ait rien offert.

   La réponse : une porte discrète, présente sur toutes les pages d'entrée.
   Volontairement pas intitulée « Prier » — ce mot suppose de savoir faire,
   d'être « du côté des croyants ». « Parler à Dieu » n'exige rien : c'est
   une conversation, pas un rite.

   Ce n'est PAS la prière du salut (elle reste sur `prier.html`, comme
   aboutissement). C'est un premier contact, sans engagement, d'où l'on peut
   aller plus loin — ou pas.

   Usage : inclure le script. Il s'installe seul sur les pages qui n'ont pas
   déjà la prière comme sujet principal.
   ========================================================================= */
(function () {
  "use strict";

  // Pages où la proposition serait redondante : la prière y est déjà le sujet
  // (prier) ou déjà faite (nouveau-ne, grandir, fondations).
  var EXCLUDED = /(prier|nouveau-ne|grandir|fondations|admin)\.html$/i;

  var path = location.pathname;
  if (EXCLUDED.test(path)) return;

  var OPENED_KEY = "c2c_ttg_seen";

  /* ---------- Markup ---------- */

  /* Certaines pages fournissent déjà leur propre déclencheur, intégré dans le
     fil du contenu (`[data-ttg-open]`). C'est le cas de la landing, où un
     bouton flottant entrerait en collision avec celui du chat. Dans ce cas on
     n'ajoute pas le bouton flottant : la page a déjà sa porte. */
  var inlineTriggers = document.querySelectorAll("[data-ttg-open]");
  var useFab = inlineTriggers.length === 0;

  function build() {
    var wrap = document.createElement("div");
    wrap.className = "ttg";
    wrap.innerHTML =
      (useFab
        ? '<button type="button" class="ttg-fab" id="ttg-open" aria-haspopup="dialog">' +
            '<span class="ttg-fab-icon" aria-hidden="true">🕊️</span>' +
            '<span class="ttg-fab-label" data-i18n="ttg.fab">Parler à Dieu</span>' +
          "</button>"
        : "") +

      '<div class="ttg-overlay" id="ttg-overlay" hidden>' +
        '<div class="ttg-modal" role="dialog" aria-modal="true" aria-labelledby="ttg-title">' +
          '<button type="button" class="ttg-close" id="ttg-close" aria-label="Fermer">&times;</button>' +

          '<span class="ttg-eyebrow" data-i18n="ttg.eyebrow">Quand tu veux</span>' +
          '<h2 id="ttg-title" data-i18n="ttg.title">Tu peux lui parler maintenant</h2>' +
          '<p class="ttg-intro" data-i18n="ttg.intro">Pas besoin de mots justes…</p>' +

          '<blockquote class="ttg-prayer" data-i18n-html="ttg.prayer">Dieu, je ne sais pas bien comment te parler…</blockquote>' +
          '<p class="ttg-hint" data-i18n="ttg.hint">Prends le temps qu\'il te faut. Personne ne te regarde.</p>' +

          '<div class="ttg-actions">' +
            '<button type="button" class="btn btn-primary btn-block" id="ttg-done" data-i18n="ttg.done">Je viens de lui parler</button>' +
            '<a class="btn btn-ghost btn-block mt-2" href="prier.html" data-i18n="ttg.more">Aller plus loin</a>' +
          "</div>" +
          '<button type="button" class="ttg-later" id="ttg-later" data-i18n="ttg.later">Plus tard</button>' +
        "</div>" +
      "</div>";
    return wrap;
  }

  /* ---------- Comportement ---------- */

  var root = build();
  // Le script étant chargé en fin de <body>, l'injection a lieu AVANT que
  // i18n.js ne traduise (il agit sur DOMContentLoaded) : les data-i18n de la
  // modale sont donc pris en charge comme ceux du reste de la page.
  document.body.appendChild(root);

  var overlay = root.querySelector("#ttg-overlay");
  var modal = root.querySelector(".ttg-modal");
  var openBtn = root.querySelector("#ttg-open");
  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("ttg-locked");
    // Laisse le temps au navigateur d'appliquer `hidden=false` avant la transition.
    requestAnimationFrame(function () { overlay.classList.add("is-open"); });
    var first = modal.querySelector("#ttg-done");
    if (first) first.focus();
    try { sessionStorage.setItem(OPENED_KEY, "1"); } catch (_) {}
  }

  function close() {
    overlay.classList.remove("is-open");
    document.body.classList.remove("ttg-locked");
    setTimeout(function () { overlay.hidden = true; }, 200);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (openBtn) openBtn.addEventListener("click", open);
  // Déclencheurs fournis par la page (bandeau, lien dans le texte…).
  Array.prototype.forEach.call(inlineTriggers, function (el) {
    el.setAttribute("aria-haspopup", "dialog");
    el.addEventListener("click", function (e) {
      e.preventDefault();
      open();
    });
  });
  root.querySelector("#ttg-close").addEventListener("click", close);
  root.querySelector("#ttg-later").addEventListener("click", close);

  // Clic sur le fond (hors de la boîte) = fermeture.
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) close();
  });

  // Piège à focus minimal : la tabulation reste dans la boîte tant qu'elle est
  // ouverte (sinon on tabule derrière, dans une page qu'on ne voit plus).
  modal.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var items = modal.querySelectorAll("button, a[href], input, [tabindex]:not([tabindex='-1'])");
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  root.querySelector("#ttg-done").addEventListener("click", function () {
    // On marque le passage par la prière AVANT la redirection, pour que
    // l'entonnoir garde son ordre (prière → nouveau-né) même quand la
    // personne n'est jamais passée par `prier.html`.
    try {
      if (window.C2C_TRACK) window.C2C_TRACK.send("priere");
    } catch (_) {}
    window.location.href = "nouveau-ne.html";
  });
})();
