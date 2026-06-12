/* =========================================================================
   footer.js — Améliorations du pied de page de la landing :
   1) Email & téléphone assemblés au clic (anti-aspirateurs de contacts).
   2) Modal de prise de RDV de prière (créneaux Mar–Sam 19h–20h → webhook Make).
   ========================================================================= */
(function () {
  "use strict";
  var cfg = window.C2C_CONFIG || {};
  var I = window.C2C_I18N;

  /* ---- 1) Anti-scraping : rien en clair dans le HTML ---- */
  var emailLink = document.getElementById("contact-email");
  if (emailLink) {
    emailLink.addEventListener("click", function (e) {
      e.preventDefault();
      var u = emailLink.getAttribute("data-u");
      var d = emailLink.getAttribute("data-d");
      window.location.href = "mailto:" + u + "@" + d;
    });
  }
  var waLink = document.getElementById("contact-wa");
  if (waLink) {
    waLink.addEventListener("click", function (e) {
      e.preventDefault();
      window.open("https://wa.me/" + waLink.getAttribute("data-w"), "_blank", "noopener");
    });
  }

  /* ---- 2) Modal RDV ---- */
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
