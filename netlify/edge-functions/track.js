/* =========================================================================
   track.js — Edge Function (Deno) — Compteurs d'activation du tunnel.
   Route : /api/track (déclarée par `export const config` en bas).

   Pourquoi une Edge Function ? Elle expose « context.geo » (pays, ville,
   région) fourni par Netlify à partir de l'IP de la connexion — sans appel
   HTTP sortant, sans dépendance, sans jamais stocker l'IP. On récupère donc
   l'origine géographique sans dégrader la RGPD : les enregistrements côté
   Airtable restent des compteurs agrégés (1 fiche = 1 jour + 1 fiche = 1
   « jour × pays × ville »). Aucune donnée personnelle, aucun cookie, aucun
   traceur tiers.

   Robustesse : cette fonction ne doit jamais casser le site. Toute erreur
   (table absente, Airtable en carafe…) renvoie 200 { ok:false }.
   ========================================================================= */

// Colonne Airtable correspondant à chaque évènement public accepté.
const TRACK_FIELDS = {
  visite: "Visites",
  quiz_lance: "Quiz lancés",
  quiz_termine: "Quiz terminés",
  optin: "Opt-in",
  priere: "Prières",
  nouveau_ne: "Nouveau-nés",
};

const BASE = env("AIRTABLE_BASE") || "appRLYZbJgmORxkxz";
const STATS_TABLE = env("STATS_TABLE") || "Stats";
const GEO_TABLE = env("GEO_TABLE") || "Geo";
const TOKEN = env("AIRTABLE_TOKEN") || "";

function env(key) {
  try {
    if (typeof Netlify !== "undefined" && Netlify.env && Netlify.env.get) {
      return Netlify.env.get(key) || "";
    }
  } catch (_) {}
  try {
    if (typeof Deno !== "undefined" && Deno.env && Deno.env.get) {
      return Deno.env.get(key) || "";
    }
  } catch (_) {}
  return "";
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

// Clé du jour au format ISO YYYY-MM-DD, heure de Paris (repère du porteur).
function todayKey() {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function airtable(path, options) {
  const opts = options || {};
  const res = await fetch("https://api.airtable.com/v0/" + path, {
    method: opts.method || "GET",
    headers: {
      Authorization: "Bearer " + TOKEN,
      "content-type": "application/json",
    },
    body: opts.body,
  });
  const text = await res.text();
  let data = {};
  if (text) {
    try { data = JSON.parse(text); } catch (_) { data = { raw: text }; }
  }
  if (!res.ok) {
    const err = new Error("Airtable " + res.status);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function findByFormula(table, formula) {
  const q = encodeURIComponent(formula);
  const data = await airtable(
    BASE + "/" + encodeURIComponent(table) + "?maxRecords=1&filterByFormula=" + q
  );
  return (data.records && data.records[0]) || null;
}

async function incStats(day, field) {
  const rec = await findByFormula(STATS_TABLE, '{Jour}="' + day + '"');
  if (rec) {
    const current = Number((rec.fields || {})[field] || 0);
    const patch = {};
    patch[field] = current + 1;
    return airtable(
      BASE + "/" + encodeURIComponent(STATS_TABLE) + "/" + rec.id,
      { method: "PATCH", body: JSON.stringify({ typecast: true, fields: patch }) }
    );
  }
  const fields = { Jour: day };
  fields[field] = 1;
  return airtable(
    BASE + "/" + encodeURIComponent(STATS_TABLE),
    { method: "POST", body: JSON.stringify({ typecast: true, fields: fields }) }
  );
}

// Normalise une chaîne de ville/pays pour la clé Airtable : on retire ce qui
// pourrait casser le filterByFormula (guillemets, backslash, retours à la
// ligne) et on tronque pour rester dans une longueur raisonnable.
function safe(s, max) {
  return String(s || "")
    .replace(/["\\\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max || 80);
}

async function incGeo(day, countryCode, countryName, city) {
  const cc = safe(countryCode, 2).toUpperCase();
  if (!cc) return; // pas de pays connu → on saute le bonus géo (jamais bloquant)
  const cName = safe(countryName, 80);
  const cityName = safe(city, 80);
  const key = day + "|" + cc + "|" + cityName;

  const rec = await findByFormula(GEO_TABLE, '{Clé}="' + key + '"');
  if (rec) {
    const current = Number((rec.fields || {}).Visites || 0);
    return airtable(
      BASE + "/" + encodeURIComponent(GEO_TABLE) + "/" + rec.id,
      { method: "PATCH", body: JSON.stringify({ typecast: true, fields: { Visites: current + 1 } }) }
    );
  }
  const fields = {
    "Clé": key,
    Jour: day,
    "Pays code": cc,
    Pays: cName,
    Ville: cityName,
    Visites: 1,
  };
  return airtable(
    BASE + "/" + encodeURIComponent(GEO_TABLE),
    { method: "POST", body: JSON.stringify({ typecast: true, fields: fields }) }
  );
}

/* ---- Détection des robots (indexation, IA, aperçus, outils, scripts) ----

   Pourquoi c'est nécessaire : les crawlers modernes exécutent le JavaScript.
   Googlebot, GPTBot ou Bytespider rendent la page et déclenchent donc
   `data-track="visite"` exactement comme un visiteur humain. Sans ce filtre,
   les compteurs mélangent des machines et des personnes — et le taux de
   conversion du tunnel devient faux (dénominateur gonflé).

   Un robot bien élevé s'annonce dans son User-Agent : c'est le signal le plus
   fiable et le moins coûteux. Complété côté navigateur (assets/js/track.js)
   par la détection d'automatisation et l'attente d'un signal humain.

   ⚠️ Cette liste est volontairement dupliquée dans netlify/functions/_lib.js
   (repli Node) : les deux runtimes ne partagent pas de module. Toute mise à
   jour doit être reportée dans les deux fichiers. */
const BOT_UA = new RegExp(
  [
    // Familles génériques — couvre la majorité des robots qui s'annoncent
    "bot\\b", "\\bbots\\b", "crawler", "crawling", "spider", "scrap(er|ing)",
    "slurp", "archiver", "indexer", "monitor(ing)?", "validator", "analyz(er|e)",
    // Moteurs de recherche
    "googlebot", "google-inspectiontool", "storebot-google", "google-site-verification",
    "bingbot", "bingpreview", "adidxbot", "msnbot", "yandex", "baiduspider",
    "duckduckbot", "duckduckgo", "seznambot", "sogou", "exabot", "qwantify",
    "petalbot", "applebot", "naver", "coccocbot",
    // Robots IA / LLM
    "gptbot", "chatgpt-user", "oai-searchbot", "ccbot", "anthropic-ai", "claudebot",
    "claude-web", "perplexitybot", "perplexity-user", "bytespider", "amazonbot",
    "cohere-ai", "diffbot", "meta-externalagent", "google-extended", "timpibot",
    "youbot", "imagesiftbot", "omgili", "webzio",
    // SEO / audit / veille
    "ahrefs", "semrush", "mj12bot", "dotbot", "dataforseo", "blexbot", "serpstat",
    "screaming ?frog", "sitebulb", "lighthouse", "pagespeed", "gtmetrix", "pingdom",
    "uptimerobot", "statuscake", "site24x7", "newrelicpinger", "chrome-lighthouse",
    // Aperçus de liens (réseaux sociaux, messageries)
    "facebookexternalhit", "facebookcatalog", "facebot", "twitterbot", "linkedinbot",
    "whatsapp", "telegrambot", "discordbot", "slackbot", "slack-imgproxy",
    "pinterest", "redditbot", "embedly", "quora link preview", "skypeuripreview",
    "vkshare", "tumblr", "nuzzel", "outbrain", "bitlybot", "flipboard",
    "google-structured-data", "w3c_validator", "developers.google.com/\\+/web/snippet",
    // Navigateurs sans interface / automatisation
    "headless", "phantomjs", "slimerjs", "electron", "puppeteer", "playwright",
    "selenium", "webdriver", "cypress",
    // Clients HTTP / bibliothèques (jamais un vrai visiteur)
    "python-requests", "python-urllib", "aiohttp", "httpx", "scrapy", "curl/",
    "wget", "go-http-client", "java/", "okhttp", "apache-httpclient", "libwww-perl",
    "axios/", "node-fetch", "got \\(", "guzzlehttp", "postmanruntime", "insomnia",
    "restsharp", "httpie", "lwp::simple", "typhoeus", "faraday",
  ].join("|"),
  "i"
);

/** true si la requête vient d'un robot (ou d'un client non-navigateur). */
function isBot(userAgent) {
  // Un navigateur envoie toujours un User-Agent. Son absence est en soi un signal.
  if (!userAgent) return true;
  return BOT_UA.test(userAgent);
}

/* ---- Garde-fou anti-flood (par instance chaude, best effort) ---- */
const _hits = new Map();
function rateLimit(request, max, windowMs) {
  try {
    const h = request.headers;
    const ip =
      h.get("x-nf-client-connection-ip") ||
      (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
      "unknown";
    const now = Date.now();
    const rec = _hits.get(ip);
    if (!rec || now - rec.ts > windowMs) {
      _hits.set(ip, { count: 1, ts: now });
      return true;
    }
    rec.count += 1;
    return rec.count <= max;
  } catch (_) {
    return true;
  }
}

export default async (request, context) => {
  if (request.method !== "POST") return jsonResponse(405, { error: "method_not_allowed" });
  if (!rateLimit(request, 120, 60000)) return jsonResponse(200, { ok: false, reason: "rate_limited" });

  // Robot : on ne compte pas dans les statistiques d'activation. On garde
  // seulement un total agrégé à part, pour que le tableau de bord puisse
  // montrer « X visites de robots filtrées » — sans quoi on ne saurait pas
  // distinguer « le filtre marche » de « le site ne reçoit plus personne ».
  if (isBot(request.headers.get("user-agent"))) {
    if (TOKEN) {
      // Best effort : si la colonne « Bots » n'existe pas encore, on ignore.
      try { await incStats(todayKey(), "Bots"); } catch (_) { /* sans conséquence */ }
    }
    return jsonResponse(200, { ok: false, reason: "bot" });
  }

  let body = {};
  try { body = await request.json(); } catch (_) { body = {}; }
  const evt = String(body.event || "");
  const field = TRACK_FIELDS[evt];
  if (!field) return jsonResponse(400, { error: "unknown_event" });

  if (!TOKEN) return jsonResponse(200, { ok: false, reason: "not_configured" });

  const day = todayKey();

  // 1) Compteur global du jour (comportement historique).
  try {
    await incStats(day, field);
  } catch (err) {
    return jsonResponse(200, {
      ok: false,
      reason: err && err.status === 404 ? "stats_table_missing" : "airtable_error",
    });
  }

  // 2) Bonus « origine des visiteurs » — uniquement sur l'évènement `visite`
  //    (les autres évènements sont post-visite, même origine géographique).
  //    Table absente → on ignore silencieusement (ok:true renvoyé quand même).
  if (evt === "visite") {
    const geo = (context && context.geo) || {};
    const country = geo.country || {};
    try {
      await incGeo(day, country.code, country.name, geo.city);
    } catch (_) { /* jamais bloquant */ }
  }

  return jsonResponse(200, { ok: true });
};

// Netlify servira /api/track directement via cette Edge Function
// (les Edge Functions passent AVANT les redirects et les Functions Node).
export const config = { path: "/api/track" };
