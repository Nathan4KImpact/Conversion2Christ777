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
    if (auto) {
      auto.split(/\s+/).forEach(function (name) {
        if (name) send(name);
      });
    }
  });
})();
