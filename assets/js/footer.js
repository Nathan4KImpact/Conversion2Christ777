/* =========================================================================
   footer.js — Pied de page unique, adapté à l'étape du visiteur

   Pourquoi générer le pied de page en JS plutôt que le copier dans chaque
   page : il contient la seule navigation du site (l'en-tête n'a pas de menu),
   les contacts réels et la modale de RDV. Dupliqué dans dix fichiers, il
   dériverait — un lien WhatsApp changé ici, oublié là.

   Principe éditorial : chaque page ne montre QUE ce qui est pertinent à
   l'endroit où le visiteur se trouve dans le tunnel. On propose la marche
   suivante, jamais celles d'après : parler de « Fondations de la foi » à
   quelqu'un qui découvre la landing, c'est lui montrer une porte qui ne veut
   encore rien dire pour lui. La table PAGES ci-dessous EST le tunnel.

   Deux densités :
   - `full` : marque + colonne Explorer + colonne Contact + bas de page.
   - `min`  : bas de page seul, pour les deux pages où l'on demande un
              engagement (opt-in, prière du salut). Y poser huit liens de
              sortie, ce serait ouvrir huit portes au moment précis où l'on
              demande d'entrer.
   ========================================================================= */
(function () {
  "use strict";

  /* ---- Catalogue des destinations ---- */
  var LINKS = {
    home:        { href: "index.html",       key: "footer.link.home",  fb: "Accueil" },
    quiz:        { href: "quiz.html",        key: "footer.link.quiz",  fb: "Le test de la quête" },
    temoignages: { href: "temoignages.html", key: "footer.link.story", fb: "Histoires de vie" },
    histoire:    { href: "histoire.html",    key: "footer.link.about", fb: "Mon histoire" },
    prier:       { href: "prier.html",       key: "footer.link.pray",  fb: "Prier maintenant" },
    nn:          { href: "nouveau-ne.html",  key: "footer.link.nn",    fb: "Nouveau-né en Christ" },
    grandir:     { href: "grandir.html",     key: "footer.link.gr",    fb: "Grandir dans la foi" },
    fondations:  { href: "fondations.html",  key: "footer.link.fond",  fb: "Fondations de la foi" },
  };

  /* ---- Le tunnel, étape par étape ----
     `links` se lit « d'où je suis, où puis-je aller maintenant ». Les étapes
     de discipulat (nouveau-né, grandir, fondations) n'apparaissent qu'à
     partir de la décision : avant, elles n'ont pas de sens.
     `rdv:false` sur merci — la page porte déjà son formulaire de réservation,
     un second bouton pour la même action brouillerait le message. */
  var PAGES = {
    "index":       { density: "full", links: ["quiz", "temoignages", "histoire", "prier"], admin: true },
    "quiz":        { density: "full", links: ["home", "temoignages", "histoire", "prier"] },
    "temoignages": { density: "full", links: ["home", "quiz", "histoire", "prier"] },
    "histoire":    { density: "full", links: ["home", "quiz", "temoignages", "prier"] },
    "optin":       { density: "min",  links: ["quiz", "home"] },
    "merci":       { density: "full", links: ["prier", "temoignages", "home"], rdv: false },
    "prier":       { density: "min",  links: ["nn", "home"] },
    "nouveau-ne":  { density: "full", links: ["grandir", "fondations", "home"] },
    "grandir":     { density: "full", links: ["fondations", "nn", "home"] },
    "fondations":  { density: "full", links: ["grandir", "nn", "home"] },
  };

  var cfg = window.C2C_CONFIG || {};
  var I = window.C2C_I18N;

  function slug() {
    var f = location.pathname.split("/").pop() || "index.html";
    return f.replace(/\.html?$/i, "") || "index";
  }

  var page = PAGES[slug()];
  if (!page) return; // admin.html et tout le reste gardent leur propre pied de page.

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  function linkHtml(id) {
    var l = LINKS[id];
    if (!l) return "";
    return '<a href="' + l.href + '" data-i18n="' + l.key + '">' + esc(l.fb) + "</a>";
  }

  /* ---- Fragments ---- */

  function brandCol() {
    return (
      "<div>" +
        '<a class="brand" href="index.html" style="margin-bottom:14px">' +
          '<img class="brand-logo-img" src="assets/img/logo-main.png" alt="Nouvelles Vies en Jésus" width="54" height="54" />' +
          '<span class="brand-name">' +
            '<span class="bn-top" data-i18n="brand.tag1">Une Nouvelle Vie est possible</span>' +
            '<span class="brand-bar"></span>' +
            '<span class="bn-bottom" data-i18n="brand.tag2">en Jésus</span>' +
          "</span>" +
        "</a>" +
        '<p data-i18n="footer.tagline">Nouvelles Vies en Jésus — accueillir, accompagner et affermir chaque personne dans une rencontre vivante avec Jésus-Christ.</p>' +
        '<div class="social-row">' +
          '<a href="https://www.facebook.com/r.n.t.137" target="_blank" rel="noopener" aria-label="Facebook">f</a>' +
          '<a href="https://chat.whatsapp.com/0vazCnCIMag0OAsYUtuO1z" target="_blank" rel="noopener" aria-label="Groupe WhatsApp Nouvelles VIES en Jésus">✆</a>' +
          '<a href="https://whatsapp.com/channel/0029VbCXLHm72WToQsw68F0N" target="_blank" rel="noopener" aria-label="Chaîne WhatsApp Nouvelles VIES — Enseignements">📢</a>' +
          '<a href="https://www.youtube.com/channel/UCOBrKVhgjiUcSoGyqeo29WA" target="_blank" rel="noopener" aria-label="YouTube">▶</a>' +
        "</div>" +
      "</div>"
    );
  }

  function exploreCol() {
    var items = page.links.map(function (id) { return "<p>" + linkHtml(id) + "</p>"; }).join("");
    return '<div><h4 data-i18n="footer.explore">Explorer</h4>' + items + "</div>";
  }

  function contactCol() {
    var rdv = page.rdv === false ? "" :
      '<a class="contact-link contact-link-rdv" id="open-booking" href="#" role="button">' +
        '<span class="cl-ic" aria-hidden="true">📅</span>' +
        '<span data-i18n="footer.contact.rdv">Prendre un RDV de prière</span></a>';
    return (
      '<div><h4 data-i18n="footer.contact">Contact</h4>' +
        '<p data-i18n="footer.contact.text">Une question, un besoin de prière ?</p>' +
        '<div class="contact-links">' + rdv +
          // Email et téléphone assemblés au clic : rien en clair dans le HTML.
          '<a class="contact-link" id="contact-email" href="#" rel="nofollow" data-u="nathanaelfongang" data-d="gmail.com">' +
            '<span class="cl-ic" aria-hidden="true">✉</span><span data-i18n="footer.contact.email">Écrivez-nous</span></a>' +
          '<a class="contact-link" id="contact-wa" href="#" rel="nofollow" data-w="33758372268">' +
            '<span class="cl-ic" aria-hidden="true">✆</span>WhatsApp</a>' +
          '<a class="contact-link" href="https://chat.whatsapp.com/0vazCnCIMag0OAsYUtuO1z" target="_blank" rel="noopener">' +
            '<span class="cl-ic" aria-hidden="true">👥</span><span data-i18n="footer.contact.group">Groupe « Nouvelles VIES en Jésus »</span></a>' +
          '<a class="contact-link" href="https://whatsapp.com/channel/0029VbCXLHm72WToQsw68F0N" target="_blank" rel="noopener">' +
            '<span class="cl-ic" aria-hidden="true">📢</span><span data-i18n="footer.contact.channel">Chaîne « Nouvelles VIES — Enseignements »</span></a>' +
        "</div>" +
      "</div>"
    );
  }

  function bottomBar() {
    // En densité `min`, le bas de page porte seul la navigation d'étape.
    var nav = page.density === "min"
      ? page.links.map(linkHtml).join(" · ") + " · "
      : "";
    var admin = page.admin
      ? ' · <a href="admin.html" rel="nofollow" style="opacity:0.55" data-i18n="footer.admin">Espace responsable</a>'
      : "";
    return (
      '<div class="footer-bottom">' +
        "<span>© <span data-year>" + new Date().getFullYear() + "</span> " +
          '<span data-i18n="footer.rights">Nouvelles Vies en Jésus — Tous droits réservés.</span></span>' +
        "<span>" + nav +
          '<a href="#" data-i18n="footer.privacy">Confidentialité</a> · ' +
          '<a href="#" data-i18n="footer.legal">Mentions légales</a>' + admin +
        "</span>" +
      "</div>"
    );
  }

  function modalHtml() {
    return (
      '<div class="modal-overlay" id="booking-modal" hidden>' +
        '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-title">' +
          '<button class="modal-close" id="m-close" type="button" aria-label="Fermer">×</button>' +
          '<span class="result-badge" data-i18n="book.eyebrow">Un temps rien que pour toi</span>' +
          '<h2 id="m-title" style="color:var(--navy)" data-i18n="book.title">Réserve ton entretien de prière</h2>' +
          '<p class="lead" data-i18n="book.text">Du mardi au samedi, de 19h à 20h, prenons un vrai temps de prière ensemble.</p>' +
          '<form id="m-form" style="text-align:left">' +
            '<div class="field"><label for="m-firstname" data-i18n="optin.firstname">Ton prénom</label>' +
              '<input id="m-firstname" type="text" autocomplete="given-name" required /></div>' +
            '<div class="field"><label for="m-email" data-i18n="optin.email">Ton email</label>' +
              '<input id="m-email" type="email" autocomplete="email" required /></div>' +
            '<div class="field"><label for="m-slot" data-i18n="book.choose">Choisis ton créneau</label>' +
              '<select id="m-slot" required></select></div>' +
            '<button type="submit" class="btn btn-primary btn-lg btn-block" id="m-submit" data-i18n="book.cta">Réserver mon créneau</button>' +
          "</form>" +
          '<div id="m-done" class="prayer-box" hidden style="margin-top:14px;text-align:center">' +
            '<p style="margin:0;font-family:var(--font-sans)" data-i18n="book.done">🙏 C\'est noté&nbsp;! Tu recevras une confirmation par email. À très vite.</p></div>' +
          '<p class="mt-2 center"><a id="m-wa" href="#" target="_blank" rel="noopener" style="color:var(--muted);font-size:0.9rem" data-i18n="book.whatsapp">Je préfère réserver via WhatsApp →</a></p>' +
        "</div>" +
      "</div>"
    );
  }

  /* ---- Rendu ---- */

  var withRdv = page.density === "full" && page.rdv !== false;

  var html =
    '<footer class="site-footer' + (page.density === "min" ? " site-footer-min" : "") + '">' +
      '<div class="container">' +
        (page.density === "full"
          ? '<div class="footer-grid">' + brandCol() + exploreCol() + contactCol() + "</div>"
          : "") +
        bottomBar() +
      "</div>" +
    "</footer>" +
    (withRdv ? modalHtml() : "");

  var host = document.querySelector(".page-wrap") || document.body;
  var existing = host.querySelector("footer.site-footer");
  if (existing) existing.remove(); // une page peut encore porter l'ancien pied de page statique
  host.insertAdjacentHTML("beforeend", html);

  // Le script est chargé en fin de <body> : l'injection précède la traduction
  // (i18n.js agit sur DOMContentLoaded), les data-i18n sont donc pris en charge
  // comme le reste de la page.

  /* ---- Comportements ---- */

  /* 1) Anti-aspirateurs de contacts : rien en clair dans le HTML. */
  var emailLink = document.getElementById("contact-email");
  if (emailLink) {
    emailLink.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "mailto:" + emailLink.getAttribute("data-u") + "@" + emailLink.getAttribute("data-d");
    });
  }
  var waLink = document.getElementById("contact-wa");
  if (waLink) {
    waLink.addEventListener("click", function (e) {
      e.preventDefault();
      window.open("https://wa.me/" + waLink.getAttribute("data-w"), "_blank", "noopener");
    });
  }

  /* 2) Modale de RDV de prière (créneaux Mar–Sam 19h–20h → webhook Make). */
  var overlay = document.getElementById("booking-modal");
  var openBtn = document.getElementById("open-booking");
  if (!overlay || !openBtn) return;

  var sel = document.getElementById("m-slot");
  var lastFocus = null;

  function lang() { return (I && I.lang) || "fr"; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function fillSlots() {
    if (sel.options.length) return; // une seule fois
    var d = new Date();
    d.setDate(d.getDate() + 1); // à partir de demain
    var added = 0;
    while (added < 12) {
      var wd = d.getDay(); // 0=dim … 2=mar … 6=sam
      if (wd >= 2 && wd <= 6) {
        var y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
        var startISO = y + "-" + pad(m) + "-" + pad(day) + "T19:00:00";
        var endISO = y + "-" + pad(m) + "-" + pad(day) + "T20:00:00";
        var label = new Intl.DateTimeFormat(lang() === "en" ? "en-GB" : "fr-FR", {
          weekday: "long", day: "numeric", month: "long",
        }).format(d);
        label = label.charAt(0).toUpperCase() + label.slice(1) + (lang() === "en" ? " · 7–8pm" : " · 19h–20h");
        var opt = document.createElement("option");
        opt.value = startISO + "|" + endISO + "|" + label;
        opt.textContent = label;
        sel.appendChild(opt);
        added++;
      }
      d.setDate(d.getDate() + 1);
    }
  }

  function openModal(e) {
    if (e) e.preventDefault();
    fillSlots();
    try {
      var lead = JSON.parse(localStorage.getItem("c2c_lead") || "{}");
      if (lead.firstname) document.getElementById("m-firstname").value = lead.firstname;
      if (lead.email) document.getElementById("m-email").value = lead.email;
    } catch (_) {}
    var wa = document.getElementById("m-wa");
    if (wa && cfg.WHATSAPP) {
      wa.href = "https://wa.me/" + cfg.WHATSAPP + "?text=" +
        encodeURIComponent("Bonjour, j'aimerais réserver un entretien de prière (Mardi à Samedi, 19h-20h).");
    }
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    lastFocus = document.activeElement;
    document.getElementById("m-firstname").focus();
  }
  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  openBtn.addEventListener("click", openModal);
  document.getElementById("m-close").addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) closeModal();
  });

  document.getElementById("m-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!this.checkValidity()) { this.reportValidity(); return; }
    var parts = sel.value.split("|");
    var lead = {};
    try { lead = JSON.parse(localStorage.getItem("c2c_lead") || "{}"); } catch (_) {}
    var payload = {
      type: "booking",
      firstname: document.getElementById("m-firstname").value.trim(),
      email: document.getElementById("m-email").value.trim(),
      whatsapp: lead.whatsapp || "",
      rdvStartISO: parts[0],
      rdvEndISO: parts[1],
      rdvLabel: parts[2] || "",
      lang: lang(),
      source: "landing-nvc",
      ts: new Date().toISOString(),
    };
    var btn = document.getElementById("m-submit");
    btn.disabled = true;
    btn.textContent = (I && I.t && I.t("book.sending")) || "Envoi…";

    function done() {
      document.getElementById("m-form").hidden = true;
      document.getElementById("m-done").hidden = false;
    }
    if (cfg.WEBHOOK_URL) {
      fetch(cfg.WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).then(done).catch(done);
      setTimeout(done, 1500);
    } else {
      var wa = document.getElementById("m-wa");
      if (wa) window.open(wa.href, "_blank");
      done();
    }
  });
})();
