/* =========================================================================
   admin.js — Espace responsable PDVIE (auth + tableau de bord)
   Parle uniquement aux fonctions /api/* (Netlify). Aucun secret ici.
   ========================================================================= */
(function () {
  "use strict";

  var API = "/api";
  var LS_TOKEN = "c2c_admin_token";
  var LS_USER = "c2c_admin_user";
  var LS_LANG = "c2c_lang";

  /* ---------------- i18n ---------------- */
  var I18N = {
    fr: {
      "brand.tag1": "Une Nouvelle Vie est possible",
      "brand.tag2": "en Jésus",
      "admin.area": "Espace responsable",
      "admin.logout": "Déconnexion",
      "auth.title": "Espace responsable",
      "auth.sub": "Suivi des âmes & statistiques du tunnel. Accès réservé.",
      "auth.tab.login": "Connexion",
      "auth.tab.signup": "Créer un compte",
      "auth.email": "Email",
      "auth.password": "Mot de passe",
      "auth.password.new": "Mot de passe (8 caractères min.)",
      "auth.name": "Ton nom",
      "auth.code": "Code d'invitation",
      "auth.code.hint": "Fourni par l'administrateur du site (variable ADMIN_SIGNUP_CODE).",
      "auth.login.cta": "Se connecter",
      "auth.signup.cta": "Créer mon compte",
      "dash.refresh": "↻ Rafraîchir",
      "dash.backsite": "← Retour au site",
      "chart.funnel": "Tunnel de conversion",
      "chart.persona": "Par profil (persona)",
      "chart.lang": "Par langue",
      "chart.source": "Sources principales",
      "chart.timeseries": "Nouvelles âmes — 30 derniers jours",
      "chart.nurturing": "Nurturing envoyé",
      "followup.title": "À relancer en priorité",
      "followup.hint": "Âmes au stade « Lead », sans RDV, depuis 7 jours ou plus.",
      "followup.none": "Personne à relancer — tout est à jour 🙌",
      "leads.title": "Toutes les âmes",
      "leads.search": "Rechercher (nom, email)…",
      "leads.allpersona": "Tous profils",
      "leads.allstage": "Toutes étapes",
      "leads.export": "⤓ Export CSV",
      "leads.empty": "Aucune âme pour ces filtres.",
      "th.name": "Nom",
      "th.contact": "Contact",
      "th.persona": "Profil",
      "th.entered": "Entrée",
      "th.stage": "Étape",
      "th.actions": "Actions",
      "kpi.total": "Âmes touchées",
      "kpi.new7": "Nouvelles (7 j)",
      "kpi.conversions": "Ont prié (ou +)",
      "kpi.rdv": "RDV à venir",
      "kpi.followup": "À relancer",
      "kpi.total.sub": "{n} aujourd'hui",
      "kpi.conv.sub": "{r}% de conversion",
      "kpi.new7.sub": "{n} sur 30 j",
      "kpi.rdv.sub": "{n} au total",
      "kpi.followup.sub": "≥ 7 j sans suite",
      "greeting": "Bonjour",
      "meta": "Mis à jour à {time} · {n} âmes",
      "act.pray": "Prière faite",
      "act.rdv": "RDV pris",
      "act.wa": "WhatsApp",
      "act.mail": "Email",
      "drop": "−{p}% vs étape précéd.",
      "saved": "Enregistré ✓",
      "err.generic": "Une erreur est survenue. Réessaie.",
      "err.network": "Connexion impossible au serveur (fonctions Netlify non déployées ?).",
      "err.invalid_credentials": "Email ou mot de passe incorrect.",
      "err.account_disabled": "Ce compte est désactivé.",
      "err.invalid_code": "Code d'invitation invalide.",
      "err.email_exists": "Un compte existe déjà avec cet email.",
      "err.weak_password": "Mot de passe trop court (8 caractères minimum).",
      "err.invalid_email": "Adresse email invalide.",
      "err.too_many_requests": "Trop de tentatives. Réessaie dans quelques minutes.",
      "err.server_not_configured": "Serveur non configuré (variables d'environnement manquantes).",
    },
    en: {
      "brand.tag1": "A New Life is possible",
      "brand.tag2": "in Jesus",
      "admin.area": "Admin area",
      "admin.logout": "Log out",
      "auth.title": "Admin area",
      "auth.sub": "Soul follow-up & funnel analytics. Restricted access.",
      "auth.tab.login": "Sign in",
      "auth.tab.signup": "Create account",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.password.new": "Password (8 characters min.)",
      "auth.name": "Your name",
      "auth.code": "Invite code",
      "auth.code.hint": "Provided by the site administrator (ADMIN_SIGNUP_CODE variable).",
      "auth.login.cta": "Sign in",
      "auth.signup.cta": "Create my account",
      "dash.refresh": "↻ Refresh",
      "dash.backsite": "← Back to site",
      "chart.funnel": "Conversion funnel",
      "chart.persona": "By profile (persona)",
      "chart.lang": "By language",
      "chart.source": "Top sources",
      "chart.timeseries": "New souls — last 30 days",
      "chart.nurturing": "Nurturing sent",
      "followup.title": "Priority follow-ups",
      "followup.hint": "Souls at the “Lead” stage, no appointment, for 7+ days.",
      "followup.none": "Nobody to follow up — all clear 🙌",
      "leads.title": "All souls",
      "leads.search": "Search (name, email)…",
      "leads.allpersona": "All profiles",
      "leads.allstage": "All stages",
      "leads.export": "⤓ Export CSV",
      "leads.empty": "No soul for these filters.",
      "th.name": "Name",
      "th.contact": "Contact",
      "th.persona": "Profile",
      "th.entered": "Joined",
      "th.stage": "Stage",
      "th.actions": "Actions",
      "kpi.total": "Souls reached",
      "kpi.new7": "New (7 d)",
      "kpi.conversions": "Prayed (or +)",
      "kpi.rdv": "Upcoming RDV",
      "kpi.followup": "To follow up",
      "kpi.total.sub": "{n} today",
      "kpi.conv.sub": "{r}% conversion",
      "kpi.new7.sub": "{n} over 30 d",
      "kpi.rdv.sub": "{n} total",
      "kpi.followup.sub": "≥ 7 d, no follow-up",
      "greeting": "Hello",
      "meta": "Updated at {time} · {n} souls",
      "act.pray": "Prayed",
      "act.rdv": "RDV booked",
      "act.wa": "WhatsApp",
      "act.mail": "Email",
      "drop": "−{p}% vs previous step",
      "saved": "Saved ✓",
      "err.generic": "Something went wrong. Try again.",
      "err.network": "Cannot reach the server (Netlify functions not deployed?).",
      "err.invalid_credentials": "Wrong email or password.",
      "err.account_disabled": "This account is disabled.",
      "err.invalid_code": "Invalid invite code.",
      "err.email_exists": "An account already exists with this email.",
      "err.weak_password": "Password too short (8 characters minimum).",
      "err.invalid_email": "Invalid email address.",
      "err.too_many_requests": "Too many attempts. Try again in a few minutes.",
      "err.server_not_configured": "Server not configured (missing environment variables).",
    },
  };

  var lang = localStorage.getItem(LS_LANG) === "en" ? "en" : "fr";
  function t(key, vars) {
    var s = (I18N[lang] && I18N[lang][key]) || I18N.fr[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  }
  function applyI18n() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-ai]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-ai"));
    });
    document.querySelectorAll("[data-ai-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-ai-ph")));
    });
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });
  }

  /* ---------------- constantes d'affichage ---------------- */
  var STAGES = ["Lead", "Prière faite", "RDV pris", "Affermi"];
  var PERSONAS = ["Ouvert", "Blessé", "Chercheur", "Musulman", "Sceptique"];
  var PERSONA_TAG = { "Ouvert": "tag-p1", "Blessé": "tag-p2", "Chercheur": "tag-p3", "Musulman": "tag-p4", "Sceptique": "tag-p5" };
  var PERSONA_COLOR = { "Ouvert": "#2f7fb5", "Blessé": "#c85a7f", "Chercheur": "#7a5cc0", "Musulman": "#2f9e8a", "Sceptique": "#5b6b8c" };
  var STAGE_COLOR = { "Lead": "#5b6b8c", "Prière faite": "#c9a23a", "RDV pris": "#d98324", "Affermi": "#1a6e60" };

  /* ---------------- état ---------------- */
  var token = localStorage.getItem(LS_TOKEN) || "";
  var user = null;
  try { user = JSON.parse(localStorage.getItem(LS_USER) || "null"); } catch (e) {}
  var allLeads = [];

  /* ---------------- helpers DOM ---------------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function digits(s) { return String(s || "").replace(/[^0-9]/g, ""); }
  function fmtDate(s) {
    if (!s) return "—";
    var d = new Date(String(s).slice(0, 10) + "T00:00:00");
    if (isNaN(d)) return "—";
    return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(d);
  }

  /* ---------------- API ---------------- */
  function api(path, opts) {
    opts = opts || {};
    var headers = {};
    if (opts.auth !== false && token) headers["Authorization"] = "Bearer " + token;
    if (opts.body) headers["Content-Type"] = "application/json";
    return fetch(API + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (res) {
      return res.text().then(function (txt) {
        var data; try { data = txt ? JSON.parse(txt) : {}; } catch (e) { data = {}; }
        return { ok: res.ok, status: res.status, data: data };
      });
    });
  }
  function errMsg(data) {
    var code = data && data.error;
    var key = "err." + code;
    if (code && I18N[lang][key]) return t(key);
    return t("err.generic");
  }

  /* ---------------- vues ---------------- */
  function showAuth() {
    $("view-auth").hidden = false;
    $("view-dash").hidden = true;
    $("logout-btn").hidden = true;
  }
  function showDash() {
    $("view-auth").hidden = true;
    $("view-dash").hidden = false;
    $("logout-btn").hidden = false;
    $("dash-greeting").textContent = t("greeting") + (user && user.name ? ", " + user.name : "") + " 👋";
    $("dash-year").textContent = new Date().getFullYear();
  }

  function setSession(tok, usr) {
    token = tok; user = usr;
    localStorage.setItem(LS_TOKEN, tok);
    localStorage.setItem(LS_USER, JSON.stringify(usr || null));
  }
  function logout() {
    token = ""; user = null; allLeads = [];
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    showAuth();
  }

  /* ---------------- auth handlers ---------------- */
  function authMsg(msg, ok) {
    var el = $("auth-msg");
    el.hidden = false;
    el.textContent = msg;
    el.className = "auth-msg " + (ok ? "ok" : "err");
  }

  function bindAuth() {
    document.querySelectorAll(".auth-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var which = tab.getAttribute("data-tab");
        document.querySelectorAll(".auth-tab").forEach(function (x) { x.classList.toggle("active", x === tab); });
        $("login-form").hidden = which !== "login";
        $("signup-form").hidden = which !== "signup";
        $("auth-msg").hidden = true;
      });
    });

    $("login-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = this.querySelector("button[type=submit]");
      btn.disabled = true;
      api("/admin-login", {
        method: "POST", auth: false,
        body: { email: $("login-email").value.trim(), password: $("login-password").value },
      }).then(function (r) {
        btn.disabled = false;
        if (r.ok && r.data.token) { setSession(r.data.token, r.data.user); enterDashboard(); }
        else authMsg(errMsg(r.data));
      }).catch(function () { btn.disabled = false; authMsg(t("err.network")); });
    });

    $("signup-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = this.querySelector("button[type=submit]");
      btn.disabled = true;
      api("/admin-signup", {
        method: "POST", auth: false,
        body: {
          name: $("signup-name").value.trim(),
          email: $("signup-email").value.trim(),
          password: $("signup-password").value,
          code: $("signup-code").value.trim(),
        },
      }).then(function (r) {
        btn.disabled = false;
        if (r.ok && r.data.token) { setSession(r.data.token, r.data.user); enterDashboard(); }
        else authMsg(errMsg(r.data));
      }).catch(function () { btn.disabled = false; authMsg(t("err.network")); });
    });
  }

  /* ---------------- chargement dashboard ---------------- */
  function enterDashboard() {
    showDash();
    loadDashboard();
  }

  function loadDashboard() {
    $("dash-error").hidden = true;
    Promise.all([api("/admin-stats"), api("/admin-leads")]).then(function (res) {
      var sRes = res[0], lRes = res[1];
      if (sRes.status === 401 || lRes.status === 401) { logout(); return; }
      if (!sRes.ok) { dashError(errMsg(sRes.data)); return; }
      if (!lRes.ok) { dashError(errMsg(lRes.data)); return; }
      allLeads = lRes.data.leads || [];
      renderStats(sRes.data);
      buildFilters();
      renderFollowup();
      renderTable();
    }).catch(function () { dashError(t("err.network")); });
  }
  function dashError(msg) {
    var el = $("dash-error");
    el.hidden = false; el.textContent = msg;
  }

  /* ---------------- rendu : KPI + graphiques ---------------- */
  function renderStats(s) {
    var now = new Date();
    var time = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", { hour: "2-digit", minute: "2-digit" }).format(now);
    $("dash-meta").textContent = t("meta", { time: time, n: s.total });

    var kpis = [
      { label: t("kpi.total"), num: s.total, sub: t("kpi.total.sub", { n: s.newToday }), accent: "var(--teal)" },
      { label: t("kpi.new7"), num: s.new7, sub: t("kpi.new7.sub", { n: s.new30 }), accent: "var(--p1)" },
      { label: t("kpi.conversions"), num: s.conversions, sub: t("kpi.conv.sub", { r: s.conversionRate }), accent: "var(--gold-deep)" },
      { label: t("kpi.rdv"), num: s.rdvUpcoming, sub: t("kpi.rdv.sub", { n: s.rdvTotal }), accent: "#d98324" },
      { label: t("kpi.followup"), num: s.followUp, sub: t("kpi.followup.sub"), accent: "var(--red)" },
    ];
    $("kpi-grid").innerHTML = kpis.map(function (k) {
      return '<div class="kpi" style="--accent:' + k.accent + '">' +
        '<div class="kpi-label">' + esc(k.label) + "</div>" +
        '<div class="kpi-num">' + esc(k.num) + "</div>" +
        '<div class="kpi-sub">' + esc(k.sub) + "</div></div>";
    }).join("");

    renderFunnel(s.byStage);
    renderBarList("chart-persona", PERSONAS.map(function (p) {
      return { label: p, val: s.byPersona[p] || 0, color: PERSONA_COLOR[p] };
    }));
    renderBarList("chart-lang", Object.keys(s.byLang).map(function (l) {
      return { label: l, val: s.byLang[l] || 0, color: l === "EN" ? "#c9a23a" : "#1a6e60" };
    }));
    renderBarList("chart-source", (s.topSources || []).map(function (x) {
      return { label: x.label, val: x.count, color: "#5b6478" };
    }));
    renderBarList("chart-nurturing", ["J1", "J3", "J5", "J7"].map(function (j) {
      return { label: j, val: (s.nurturing && s.nurturing[j]) || 0, color: "#1a6e60" };
    }));
    renderTimeseries(s.timeseries || []);
  }

  function renderBarList(id, rows) {
    var max = Math.max.apply(null, rows.map(function (r) { return r.val; }).concat([1]));
    $(id).innerHTML = rows.map(function (r) {
      var pct = Math.round((r.val / max) * 100);
      return '<div class="bar-row"><span class="bar-label" title="' + esc(r.label) + '">' + esc(r.label) + "</span>" +
        '<span class="bar-track"><span class="bar-fill" style="width:' + pct + "%;background:" + r.color + '"></span></span>' +
        '<span class="bar-val">' + r.val + "</span></div>";
    }).join("") || '<p class="cell-sub">—</p>';
  }

  function renderFunnel(byStage) {
    var counts = STAGES.map(function (s) { return byStage[s] || 0; });
    var max = Math.max.apply(null, counts.concat([1]));
    var html = "";
    for (var i = 0; i < STAGES.length; i++) {
      var c = counts[i];
      var w = Math.max(38, Math.round((c / max) * 100));
      var drop = "";
      if (i > 0 && counts[i - 1] > 0) {
        var p = Math.round((1 - c / counts[i - 1]) * 100);
        if (p > 0) drop = '<div class="funnel-drop">' + t("drop", { p: p }) + "</div>";
      }
      html += '<div class="funnel-step"><div class="funnel-bar" style="width:' + w + "%;background:" + STAGE_COLOR[STAGES[i]] + '">' +
        '<span class="fb-name">' + esc(STAGES[i]) + '</span><span class="fb-val">' + c + "</span></div>" + drop + "</div>";
    }
    $("chart-funnel").innerHTML = html;
  }

  function renderTimeseries(series) {
    if (!series.length) { $("chart-timeseries").innerHTML = '<p class="cell-sub">—</p>'; return; }
    var W = 320, H = 150, padB = 18, padT = 8;
    var n = series.length, gap = 2;
    var bw = (W - (n - 1) * gap) / n;
    var max = Math.max.apply(null, series.map(function (d) { return d.count; }).concat([1]));
    var bars = "";
    series.forEach(function (d, i) {
      var h = Math.round((d.count / max) * (H - padB - padT));
      var x = i * (bw + gap);
      var y = H - padB - h;
      bars += '<rect class="sbar" x="' + x.toFixed(1) + '" y="' + y + '" width="' + bw.toFixed(1) + '" height="' + Math.max(h, d.count > 0 ? 2 : 0) + '" rx="1">' +
        "<title>" + esc(fmtDate(d.date)) + " : " + d.count + "</title></rect>";
    });
    // étiquettes : première, milieu, dernière
    function lbl(idx, anchor) {
      var d = series[idx]; var x = idx * (bw + gap) + bw / 2;
      var txt = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "short" }).format(new Date(d.date + "T00:00:00"));
      return '<text class="spark-axis" x="' + x.toFixed(1) + '" y="' + (H - 5) + '" text-anchor="' + anchor + '">' + esc(txt) + "</text>";
    }
    var axis = lbl(0, "start") + lbl(Math.floor(n / 2), "middle") + lbl(n - 1, "end");
    $("chart-timeseries").innerHTML =
      '<svg class="spark" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" role="img">' + bars + axis + "</svg>";
  }

  /* ---------------- à relancer ---------------- */
  function followupLeads() {
    return allLeads.filter(function (l) {
      return l.stage === "Lead" && !l.rdv && typeof l.daysSince === "number" && l.daysSince >= 7;
    }).sort(function (a, b) { return b.daysSince - a.daysSince; });
  }
  function renderFollowup() {
    var rows = followupLeads();
    if (!rows.length) { $("followup-list").innerHTML = '<p class="fu-empty">' + t("followup.none") + "</p>"; return; }
    $("followup-list").innerHTML = rows.map(function (l) {
      return '<div class="fu-card">' +
        '<div class="fu-name">' + esc(l.firstname || "—") + " " + personaTag(l.persona) + "</div>" +
        '<div class="fu-meta">' + esc(l.email || "") + " · " + l.daysSince + " j</div>" +
        '<div class="fu-actions">' + waBtn(l) + mailBtn(l) +
        '<button class="mini mini-ok" data-act="pray" data-id="' + l.id + '">' + t("act.pray") + "</button>" +
        "</div></div>";
    }).join("");
  }

  /* ---------------- table ---------------- */
  function buildFilters() {
    var fp = $("filter-persona");
    var fs = $("filter-stage");
    if (fp.options.length <= 1) {
      PERSONAS.forEach(function (p) { var o = document.createElement("option"); o.value = p; o.textContent = p; fp.appendChild(o); });
    }
    if (fs.options.length <= 1) {
      STAGES.forEach(function (s) { var o = document.createElement("option"); o.value = s; o.textContent = s; fs.appendChild(o); });
    }
  }
  function filteredLeads() {
    var q = ($("lead-search").value || "").toLowerCase().trim();
    var fp = $("filter-persona").value;
    var fs = $("filter-stage").value;
    return allLeads.filter(function (l) {
      if (fp && l.persona !== fp) return false;
      if (fs && l.stage !== fs) return false;
      if (q && (l.firstname + " " + l.email).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }
  function personaTag(p) {
    if (!p) return '<span class="tag tag-none">—</span>';
    return '<span class="tag ' + (PERSONA_TAG[p] || "tag-none") + '">' + esc(p) + "</span>";
  }
  function nudge(l) {
    return '<span class="nudge" title="J1/J3/J5/J7">' +
      ["j1", "j3", "j5", "j7"].map(function (k) { return '<i class="' + (l[k] ? "on" : "") + '"></i>'; }).join("") + "</span>";
  }
  function waBtn(l) {
    var d = digits(l.whatsapp);
    if (!d) return "";
    var msg = encodeURIComponent("Bonjour " + (l.firstname || "") + " 🙏");
    return '<a class="mini mini-wa" target="_blank" rel="noopener" href="https://wa.me/' + d + "?text=" + msg + '">' + t("act.wa") + "</a>";
  }
  function mailBtn(l) {
    if (!l.email) return "";
    return '<a class="mini mini-mail" href="mailto:' + esc(l.email) + '">' + t("act.mail") + "</a>";
  }
  function stageSelect(l) {
    var opts = STAGES.map(function (s) {
      return '<option value="' + esc(s) + '"' + (s === l.stage ? " selected" : "") + ">" + esc(s) + "</option>";
    }).join("");
    return '<select data-stage-id="' + l.id + '">' + opts + "</select>";
  }
  function renderTable() {
    var rows = filteredLeads();
    $("table-empty").hidden = rows.length > 0;
    $("leads-tbody").innerHTML = rows.map(function (l) {
      return "<tr>" +
        '<td><div class="cell-name">' + esc(l.firstname || "—") + "</div>" +
          '<div class="cell-sub">' + esc(l.lang || "") + (l.source ? " · " + esc(l.source) : "") + "</div>" + nudge(l) + "</td>" +
        '<td class="cell-contact">' + (l.email ? '<a href="mailto:' + esc(l.email) + '">' + esc(l.email) + "</a>" : "—") +
          (l.whatsapp ? '<div class="cell-sub">' + esc(l.whatsapp) + "</div>" : "") + "</td>" +
        "<td>" + personaTag(l.persona) + "</td>" +
        "<td>" + esc(fmtDate(l.entered)) + '<div class="cell-sub">' + (typeof l.daysSince === "number" ? l.daysSince + " j" : "") + "</div></td>" +
        '<td>' + stageSelect(l) + "</td>" +
        '<td><div class="cell-actions">' + waBtn(l) + mailBtn(l) + "</div></td>" +
        "</tr>";
    }).join("");
  }

  /* ---------------- mise à jour d'une fiche ---------------- */
  function updateLead(id, patch) {
    var body = Object.assign({ id: id }, patch);
    api("/admin-lead-update", { method: "POST", body: body }).then(function (r) {
      if (r.status === 401) { logout(); return; }
      if (!r.ok) { dashError(errMsg(r.data)); return; }
      // maj locale + re-render (et stats rafraîchies)
      var l = allLeads.filter(function (x) { return x.id === id; })[0];
      if (l) { if (patch.stage !== undefined) l.stage = r.data.stage; if (patch.status !== undefined) l.status = r.data.status; }
      loadDashboard();
    }).catch(function () { dashError(t("err.network")); });
  }

  /* ---------------- export CSV ---------------- */
  function exportCsv() {
    var rows = filteredLeads();
    var head = ["Prénom", "Email", "WhatsApp", "Persona", "Langue", "Source", "Étape", "Date d'entrée", "RDV prière", "Jours", "J1", "J3", "J5", "J7", "Notes"];
    function cell(v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }
    var lines = [head.map(cell).join(",")];
    rows.forEach(function (l) {
      lines.push([l.firstname, l.email, l.whatsapp, l.persona, l.lang, l.source, l.stage, l.entered, l.rdv,
        l.daysSince, l.j1 ? "oui" : "", l.j3 ? "oui" : "", l.j5 ? "oui" : "", l.j7 ? "oui" : "", l.notes].map(cell).join(","));
    });
    var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "ames-pdvie-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------------- wiring global ---------------- */
  function bindDashboard() {
    $("logout-btn").addEventListener("click", logout);
    $("refresh-btn").addEventListener("click", loadDashboard);
    $("export-btn").addEventListener("click", exportCsv);
    $("lead-search").addEventListener("input", renderTable);
    $("filter-persona").addEventListener("change", renderTable);
    $("filter-stage").addEventListener("change", renderTable);

    // délégation : changement d'étape + bouton "prière faite"
    $("leads-tbody").addEventListener("change", function (e) {
      var sel = e.target.closest("select[data-stage-id]");
      if (sel) updateLead(sel.getAttribute("data-stage-id"), { stage: sel.value });
    });
    $("followup-list").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-act=pray]");
      if (b) updateLead(b.getAttribute("data-id"), { stage: "Prière faite" });
    });

    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.addEventListener("click", function () {
        lang = b.getAttribute("data-lang");
        localStorage.setItem(LS_LANG, lang);
        applyI18n();
        if (!$("view-dash").hidden) loadDashboard();
      });
    });
  }

  /* ---------------- init ---------------- */
  applyI18n();
  bindAuth();
  bindDashboard();
  if (token) { showDash(); loadDashboard(); }
  else showAuth();
})();
