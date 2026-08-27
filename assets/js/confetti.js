/* =========================================================================
   confetti.js — Célébration visuelle du moment de la décision

   Quand une personne signale avoir fait la prière du salut, c'est le moment
   le plus important de tout le tunnel. Le hero de `nouveau-ne.html` le dit
   déjà — « Le ciel est en fête pour toi » — ce module le rend visible.

   Zéro dépendance : un canvas temporaire, retiré du DOM dès la fin. Aucune
   image, aucune requête réseau, aucun impact sur le poids des pages.

   Accessibilité : respecte `prefers-reduced-motion`. Une personne qui a
   demandé à son système de limiter les animations ne verra rien — le message
   textuel de la page porte déjà la joie, l'animation n'est qu'un bonus.

   Usage :
     <body data-confetti="auto">      → au chargement de la page
     <a data-confetti href="…">       → au clic (utile si on reste sur la page)
     window.C2C_CONFETTI.celebrate(); → depuis du code
   ========================================================================= */
(function () {
  "use strict";

  /* Palette de la marque (styles.css) — le doré domine, c'est la couleur
     de la fête ; le sarcelle et le rouge ancrent dans l'identité du site. */
  var COLORS = [
    "#c9a23a", // or
    "#e6c878", // or clair
    "#1a6e60", // sarcelle
    "#2f9e8a", // sarcelle clair
    "#b51b2d", // rouge
    "#f5eddc", // crème
    "#ffffff",
  ];

  var GRAVITY = 0.34;
  var DRAG = 0.988;
  var MAX_MS = 4200;      // filet de sécurité : jamais d'animation infinie
  var SESSION_KEY = "c2c_confetti_";

  var running = false;    // une seule animation à la fois

  function reducedMotion() {
    try {
      return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (_) {
      return false;
    }
  }

  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  /* Un « canon » : projette des particules depuis un point, vers le haut,
     inclinées vers le centre. Deux canons (gauche + droite) donnent la
     gerbe symétrique classique d'une célébration. */
  function cannon(particles, originX, originY, angleDeg, count, w, h) {
    var baseAngle = (angleDeg * Math.PI) / 180;
    for (var i = 0; i < count; i++) {
      var angle = baseAngle + rand(-0.36, 0.36);
      var speed = rand(0.55, 1) * Math.min(w, h) * 0.032;
      var size = rand(6, 13);
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: size,
        h: size * rand(0.4, 0.75),          // rectangles allongés = papier
        color: pick(COLORS),
        angle: rand(0, Math.PI * 2),
        spin: rand(-0.22, 0.22),
        flutter: rand(0, Math.PI * 2),      // phase du battement
        flutterSpeed: rand(0.08, 0.16),
        life: 1,
        decay: rand(0.006, 0.012),
        round: Math.random() < 0.18,        // quelques confettis ronds
      });
    }
  }

  function celebrate(opts) {
    opts = opts || {};
    if (reducedMotion() || running) return;
    running = true;

    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;" +
      "pointer-events:none;z-index:9999;";
    document.body.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2); // 2 suffit, au-delà c'est du gaspillage
    var w, h;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    var particles = [];
    var intensity = opts.intensity || 1;
    var perCannon = Math.round(70 * intensity);

    // Première salve : deux canons depuis les coins bas, vers le haut-centre.
    cannon(particles, w * 0.08, h * 1.02, -68, perCannon, w, h);
    cannon(particles, w * 0.92, h * 1.02, -112, perCannon, w, h);

    // Seconde salve, légèrement décalée : la fête a du souffle, elle ne
    // s'éteint pas d'un coup.
    var wave2 = setTimeout(function () {
      if (!running) return;
      cannon(particles, w * 0.22, h * 1.02, -75, Math.round(perCannon * 0.65), w, h);
      cannon(particles, w * 0.78, h * 1.02, -105, Math.round(perCannon * 0.65), w, h);
    }, 260);

    var startedAt = performance.now();
    var rafId = null;

    function finish() {
      running = false;
      clearTimeout(wave2);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }

    function frame(now) {
      ctx.clearRect(0, 0, w, h);

      var alive = 0;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (p.life <= 0) continue;

        p.vy += GRAVITY;
        p.vx *= DRAG;
        p.vy *= DRAG;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.flutter += p.flutterSpeed;
        p.life -= p.decay;

        // Sorti par le bas : inutile de continuer à le calculer.
        if (p.y - p.h > h) { p.life = 0; continue; }
        alive++;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        // Le battement écrase la largeur : illusion d'un papier qui tourne.
        ctx.scale(Math.cos(p.flutter), 1);
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }

      if (alive === 0 || now - startedAt > MAX_MS) return finish();
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
  }

  /** Ne célèbre qu'une fois par session de navigation (revenir en arrière
      ou rafraîchir ne relance pas l'animation). */
  function celebrateOnce(key, opts) {
    try {
      if (sessionStorage.getItem(SESSION_KEY + key)) return;
      sessionStorage.setItem(SESSION_KEY + key, "1");
    } catch (_) {
      /* navigation privée : on célèbre quand même */
    }
    celebrate(opts);
  }

  window.C2C_CONFETTI = { celebrate: celebrate, celebrateOnce: celebrateOnce };

  document.addEventListener("DOMContentLoaded", function () {
    // <body data-confetti="auto"> → célébration à l'ouverture de la page.
    var auto = document.body && document.body.getAttribute("data-confetti");
    if (auto === "auto") {
      // Court délai : laisse la page se peindre, l'effet arrive « par-dessus »
      // une page déjà lisible plutôt que sur un écran encore vide.
      setTimeout(function () {
        celebrateOnce(location.pathname, { intensity: 1.15 });
      }, 420);
    }

    // [data-confetti] sur un élément → célébration au clic. Utile quand on
    // reste sur la page (lien WhatsApp qui ouvre un nouvel onglet, bouton…).
    document.addEventListener("click", function (e) {
      var el = e.target && e.target.closest && e.target.closest("[data-confetti]");
      if (!el || el === document.body) return;
      celebrate({ intensity: 0.85 });
    });
  });
})();
