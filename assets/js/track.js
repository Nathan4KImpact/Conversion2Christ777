/* =========================================================================
   track.js — Mesure d'activation du tunnel (côté visiteur)

   Ce qu'on mesure : combien de personnes ouvrent le site, lancent le quiz,
   le terminent, laissent leurs coordonnées, prient. C'est ce qui permet de
   voir OÙ le tunnel fuit — le tableau de bord ne voyait jusqu'ici que les
   âmes ayant déjà laissé leur email.

   Ce qu'on N'enregistre PAS : aucune donnée personnelle, aucun cookie, aucun
   identifiant, aucun traceur tiers. Le serveur n'incrémente qu'un compteur
   par jour. Rien à consentir : il n'y a rien à consentir.

   Anti-double-comptage : chaque évènement n'est envoyé qu'une fois par
   session de navigation (sessionStorage). Rafraîchir la page ne gonfle pas
   les chiffres.

   Usage :
     <body data-track="visite">            → envoi automatique au chargement
     window.C2C_TRACK.send("quiz_lance");  → envoi explicite
   ========================================================================= */
(function () {
  "use strict";

  var ENDPOINT = "/api/track";
  var PREFIX = "c2c_ev_";
  var VALID = {
    visite: 1,
    quiz_lance: 1,
    quiz_termine: 1,
    optin: 1,
    priere: 1,
    nouveau_ne: 1,
  };

  /* ---- Couche 2 : automatisation détectable côté navigateur ----
     Le serveur filtre déjà les robots qui s'annoncent dans leur User-Agent.
     Restent ceux qui se déguisent en navigateur : ils sont presque toujours
     pilotés par Puppeteer / Playwright / Selenium, qui laissent des traces. */
  function isAutomated() {
    try {
      // Signal standardisé (WebDriver spec) : true si la page est pilotée.
      if (navigator.webdriver === true) return true;
      var ua = String(navigator.userAgent || "");
      if (!ua) return true;
      if (/headless|phantomjs|slimerjs|electron|puppeteer|playwright|selenium/i.test(ua)) return true;
      if (/bot\b|crawler|spider|scrap(er|ing)|slurp/i.test(ua)) return true;
      return false;
    } catch (_) {
      return false; // dans le doute, on compte : mieux vaut un faux positif humain
    }
  }

  /* ---- Couche 3 : attendre un signal humain avant de compter une page ----
     Un crawler moderne exécute le JavaScript, rend la page, prend son
     instantané et repart. Il ne défile pas, ne bouge pas la souris, ne reste
     pas. On attend donc l'un des deux :
       • une interaction réelle (défilement, clic, touche, toucher), ou
       • un temps de présence à l'écran (l'onglet doit être VISIBLE).
     Le second critère protège le visiteur qui lit sans rien toucher ; le
     premier capte celui qui repart aussitôt (le clic précède la navigation).
     Les pages préchargées/prérendues par le navigateur restent « hidden » :
     le minuteur ne démarre pas, elles ne sont donc jamais comptées à tort. */
  var DWELL_MS = 2500;
  var SIGNALS = ["scroll", "pointerdown", "pointermove", "keydown", "touchstart", "wheel"];
  var LISTEN_OPTS = { passive: true, capture: true };

  function onHumanSignal(callback) {
    var fired = false;
    var timer = null;

    function stopTimer() {
      if (timer) { clearTimeout(timer); timer = null; }
    }
    function startTimer() {
      stopTimer();
      timer = setTimeout(fire, DWELL_MS);
    }
    function cleanup() {
      stopTimer();
      SIGNALS.forEach(function (type) {
        window.removeEventListener(type, fire, LISTEN_OPTS);
      });
      document.removeEventListener("visibilitychange", onVisibility);
    }
    function fire() {
      if (fired) return;
      fired = true;
      cleanup();
      callback();
    }
    function onVisibility() {
      // Le temps de présence ne compte que pendant que l'onglet est au premier plan.
      if (document.visibilityState === "visible") startTimer();
      else stopTimer();
    }

    SIGNALS.forEach(function (type) {
      window.addEventListener(type, fire, LISTEN_OPTS);
    });
    document.addEventListener("visibilitychange", onVisibility);
    if (document.visibilityState === "visible") startTimer();
  }

  function alreadySent(name) {
    try {
      if (sessionStorage.getItem(PREFIX + name)) return true;
      sessionStorage.setItem(PREFIX + name, "1");
      return false;
    } catch (_) {
      return false; // navigation privée / stockage bloqué : on envoie quand même
    }
  }

  /** Envoie un évènement. Silencieux : une mesure ne doit jamais gêner un visiteur. */
  function send(name, opts) {
    if (!VALID[name]) return;
    if (isAutomated()) return;
    if (!(opts && opts.force) && alreadySent(name)) return;

    var payload = JSON.stringify({ event: name });
    try {
      if (navigator.sendBeacon) {
        // sendBeacon survit à la navigation (clic sortant, fermeture d'onglet).
        navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "application/json" }));
        return;
      }
    } catch (_) {
      /* on retombe sur fetch */
    }
    try {
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(function () {});
    } catch (_) {
      /* mesure indisponible : sans conséquence */
    }
  }

  window.C2C_TRACK = { send: send };

  document.addEventListener("DOMContentLoaded", function () {
    var auto = document.body && document.body.getAttribute("data-track");
    if (!auto) return;

    var names = auto.split(/\s+/).filter(Boolean);
    if (!names.length) return;
    if (isAutomated()) return;

    // Les évènements déclenchés automatiquement à l'ouverture d'une page
    // (visite, priere, nouveau_ne) passent par le filtre « signal humain ».
    // Les évènements appelés explicitement depuis le code (quiz_lance, optin…)
    // résultent déjà d'une action de l'utilisateur : ils partent directement.
    onHumanSignal(function () {
      names.forEach(function (name) { send(name); });
    });
  });
})();
