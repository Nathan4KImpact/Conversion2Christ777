/* =========================================================================
   _lib.js — Boîte à outils partagée des fonctions serverless (Netlify)
   Espace administrateur PDVIE — « Nouvelles Vies en Jésus ».

   Pourquoi un back-end ? Les fiches des âmes (email, WhatsApp, persona —
   dont des sujets sensibles : blessures, abus, identité…) ne doivent JAMAIS
   transiter par du JavaScript public. Le token Airtable reste ici, côté
   serveur, dans une variable d'environnement Netlify. Le navigateur ne reçoit
   que ce qu'un admin authentifié demande.

   Zéro dépendance npm : uniquement les modules natifs de Node (crypto, fetch).
   ========================================================================= */
"use strict";

const crypto = require("crypto");

/* ---- Configuration (variables d'environnement Netlify) ---- */
const BASE = process.env.AIRTABLE_BASE || "appRLYZbJgmORxkxz";
const AMES_TABLE = process.env.AMES_TABLE || "tblqFCCV7BAO8IJNL";
const ADMINS_TABLE = process.env.ADMINS_TABLE || "tblYWX1NiR5dcVliI";
// Table des compteurs d'activation : adressée par NOM (et non par id) pour
// rester valide même si elle est (re)créée depuis le tableau de bord.
const STATS_TABLE = process.env.STATS_TABLE || "Stats";
// Table « Origine des visiteurs » (compteurs par jour × pays × ville, sans PII).
const GEO_TABLE = process.env.GEO_TABLE || "Geo";
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || "";
const JWT_SECRET = process.env.JWT_SECRET || "";
const SIGNUP_CODE = process.env.ADMIN_SIGNUP_CODE || "";
const TOKEN_TTL = 60 * 60 * 12; // jeton valable 12 h

/* ---- Réponses HTTP ---- */
const SECURITY_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function json(statusCode, body, extra) {
  return {
    statusCode,
    headers: Object.assign({}, SECURITY_HEADERS, extra || {}),
    body: JSON.stringify(body),
  };
}

function readJson(event) {
  try {
    if (!event || !event.body) return {};
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

/** Renvoie une réponse 500 si la config serveur est incomplète, sinon null. */
function configError() {
  if (!AIRTABLE_TOKEN || !JWT_SECRET) {
    return json(500, {
      error: "server_not_configured",
      detail:
        "Variables d'environnement manquantes côté Netlify (AIRTABLE_TOKEN et/ou JWT_SECRET).",
    });
  }
  return null;
}

/* ---- base64url ---- */
function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
function b64urlJson(obj) {
  return b64url(Buffer.from(JSON.stringify(obj), "utf8"));
}
function fromB64url(str) {
  let s = String(str).replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

/* ---- Mots de passe : scrypt (natif), jamais de clair en base ---- */
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  });
  return [
    "scrypt",
    SCRYPT.N,
    SCRYPT.r,
    SCRYPT.p,
    salt.toString("base64"),
    hash.toString("base64"),
  ].join("$");
}

function verifyPassword(password, stored) {
  try {
    const parts = String(stored).split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const N = +parts[1],
      r = +parts[2],
      p = +parts[3];
    const salt = Buffer.from(parts[4], "base64");
    const expected = Buffer.from(parts[5], "base64");
    const actual = crypto.scryptSync(password, salt, expected.length, { N, r, p });
    return (
      expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
    );
  } catch (_) {
    return false;
  }
}

/* ---- JWT maison (HS256) ---- */
function signToken(payload) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64urlJson({ alg: "HS256", typ: "JWT" });
  const body = b64urlJson(Object.assign({ iat: now, exp: now + TOKEN_TTL }, payload));
  const sig = b64url(
    crypto.createHmac("sha256", JWT_SECRET).update(head + "." + body).digest()
  );
  return head + "." + body + "." + sig;
}

function verifyToken(token) {
  const parts = String(token).split(".");
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;
  const expSig = b64url(
    crypto.createHmac("sha256", JWT_SECRET).update(head + "." + body).digest()
  );
  const a = Buffer.from(sig);
  const b = Buffer.from(expSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let payload;
  try {
    payload = JSON.parse(fromB64url(body).toString("utf8"));
  } catch (_) {
    return null;
  }
  if (!payload || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

/** Lit l'en-tête Authorization: Bearer <jwt> et renvoie le payload, ou null. */
function authUser(event) {
  const headers = (event && event.headers) || {};
  const h = headers.authorization || headers.Authorization || "";
  const m = String(h).match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  return verifyToken(m[1].trim());
}

/* ---- Accès Airtable (token serveur uniquement) ---- */
async function at(path, options) {
  const res = await fetch("https://api.airtable.com/v0/" + path, {
    method: (options && options.method) || "GET",
    headers: Object.assign(
      {
        Authorization: "Bearer " + AIRTABLE_TOKEN,
        "Content-Type": "application/json",
      },
      (options && options.headers) || {}
    ),
    body: options && options.body ? options.body : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    data = { raw: text };
  }
  if (!res.ok) {
    const e = new Error("Airtable " + res.status);
    e.status = res.status;
    e.data = data;
    throw e;
  }
  return data;
}

/** Récupère TOUTES les fiches d'une table (pagination 100/page). */
async function listAll(tableId, query) {
  const out = [];
  let offset;
  do {
    let url = BASE + "/" + tableId + "?pageSize=100";
    if (query) url += "&" + query;
    if (offset) url += "&offset=" + encodeURIComponent(offset);
    const data = await at(url);
    if (data.records) out.push.apply(out, data.records);
    offset = data.offset;
  } while (offset);
  return out;
}

async function findAdmin(email) {
  const e = String(email || "").toLowerCase().trim().replace(/"/g, '\\"');
  if (!e) return null;
  const formula = encodeURIComponent('LOWER({Email})="' + e + '"');
  const data = await at(BASE + "/" + ADMINS_TABLE + "?maxRecords=1&filterByFormula=" + formula);
  return (data.records && data.records[0]) || null;
}

async function createAdmin(fields) {
  const data = await at(BASE + "/" + ADMINS_TABLE, {
    method: "POST",
    body: JSON.stringify({ typecast: true, fields }),
  });
  return data;
}

async function patchRecord(tableId, recordId, fields) {
  const data = await at(BASE + "/" + tableId + "/" + recordId, {
    method: "PATCH",
    body: JSON.stringify({ typecast: true, fields }),
  });
  return data;
}

async function createRecord(tableId, fields) {
  return at(BASE + "/" + encodeURIComponent(tableId), {
    method: "POST",
    body: JSON.stringify({ typecast: true, fields }),
  });
}

/* ---- Compteurs d'activation (table « Stats », 1 fiche = 1 jour) ---- */

/** Colonne Airtable correspondant à chaque évènement public accepté. */
const TRACK_FIELDS = {
  visite: "Visites",
  quiz_lance: "Quiz lancés",
  quiz_termine: "Quiz terminés",
  optin: "Opt-in",
  priere: "Prières",
  nouveau_ne: "Nouveau-nés",
};

/** Jour courant « YYYY-MM-DD » en heure de Paris (le repère du porteur). */
function todayKey(d) {
  // 'fr-CA' produit déjà le format ISO YYYY-MM-DD.
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d || new Date());
}

/* ---- Détection des robots (voir netlify/edge-functions/track.js) ----
   ⚠️ Liste dupliquée depuis l'Edge Function : les deux runtimes (Deno / Node)
   ne partagent pas de module. Toute mise à jour doit être reportée là-bas. */
const BOT_UA = new RegExp(
  [
    "bot\\b", "\\bbots\\b", "crawler", "crawling", "spider", "scrap(er|ing)",
    "slurp", "archiver", "indexer", "monitor(ing)?", "validator", "analyz(er|e)",
    "googlebot", "google-inspectiontool", "storebot-google", "google-site-verification",
    "bingbot", "bingpreview", "adidxbot", "msnbot", "yandex", "baiduspider",
    "duckduckbot", "duckduckgo", "seznambot", "sogou", "exabot", "qwantify",
    "petalbot", "applebot", "naver", "coccocbot",
    "gptbot", "chatgpt-user", "oai-searchbot", "ccbot", "anthropic-ai", "claudebot",
    "claude-web", "perplexitybot", "perplexity-user", "bytespider", "amazonbot",
    "cohere-ai", "diffbot", "meta-externalagent", "google-extended", "timpibot",
    "youbot", "imagesiftbot", "omgili", "webzio",
    "ahrefs", "semrush", "mj12bot", "dotbot", "dataforseo", "blexbot", "serpstat",
    "screaming ?frog", "sitebulb", "lighthouse", "pagespeed", "gtmetrix", "pingdom",
    "uptimerobot", "statuscake", "site24x7", "newrelicpinger", "chrome-lighthouse",
    "facebookexternalhit", "facebookcatalog", "facebot", "twitterbot", "linkedinbot",
    "whatsapp", "telegrambot", "discordbot", "slackbot", "slack-imgproxy",
    "pinterest", "redditbot", "embedly", "quora link preview", "skypeuripreview",
    "vkshare", "tumblr", "nuzzel", "outbrain", "bitlybot", "flipboard",
    "google-structured-data", "w3c_validator",
    "headless", "phantomjs", "slimerjs", "electron", "puppeteer", "playwright",
    "selenium", "webdriver", "cypress",
    "python-requests", "python-urllib", "aiohttp", "httpx", "scrapy", "curl/",
    "wget", "go-http-client", "java/", "okhttp", "apache-httpclient", "libwww-perl",
    "axios/", "node-fetch", "guzzlehttp", "postmanruntime", "insomnia",
    "restsharp", "httpie", "typhoeus", "faraday",
  ].join("|"),
  "i"
);

/** true si la requête vient d'un robot (ou d'un client non-navigateur). */
function isBotRequest(event) {
  try {
    const h = (event && event.headers) || {};
    const ua = h["user-agent"] || h["User-Agent"] || "";
    if (!ua) return true; // un navigateur envoie toujours un User-Agent
    return BOT_UA.test(ua);
  } catch (_) {
    return false;
  }
}

/** true si l'erreur Airtable signifie « la table n'existe pas encore ».
    Airtable répond 404 (TABLE_NOT_FOUND / NOT_FOUND) sur une table inconnue. */
function isMissingTable(err) {
  return !!err && err.status === 404;
}

/** Fiche du jour dans la table Stats, ou null. */
async function findStatsDay(day) {
  const formula = encodeURIComponent('{Jour}="' + String(day).replace(/"/g, "") + '"');
  const data = await at(
    BASE + "/" + encodeURIComponent(STATS_TABLE) + "?maxRecords=1&filterByFormula=" + formula
  );
  return (data.records && data.records[0]) || null;
}

/** Ping la table Geo : renvoie null si vide, throw 404 si absente. Sert
    à savoir depuis admin-track-setup si la table doit être créée. */
async function pingGeoTable() {
  const data = await at(
    BASE + "/" + encodeURIComponent(GEO_TABLE) + "?maxRecords=1"
  );
  return (data.records && data.records[0]) || null;
}

/* ---- Garde-fou anti-force-brute (best effort, par instance chaude) ---- */
const _hits = new Map();
function rateLimit(event, bucket, max, windowMs) {
  try {
    const headers = (event && event.headers) || {};
    const ip =
      headers["x-nf-client-connection-ip"] ||
      (headers["x-forwarded-for"] || "").split(",")[0].trim() ||
      "unknown";
    const key = bucket + ":" + ip;
    const now = Date.now();
    const rec = _hits.get(key);
    if (!rec || now - rec.ts > windowMs) {
      _hits.set(key, { count: 1, ts: now });
      return true;
    }
    rec.count += 1;
    return rec.count <= max;
  } catch (_) {
    return true;
  }
}

/* ---- Divers ---- */
function sel(v) {
  if (v && typeof v === "object") return v.name || "";
  return v || "";
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = Date.parse(String(dateStr).slice(0, 10) + "T00:00:00Z");
  if (isNaN(d)) return null;
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((todayUTC - d) / 86400000);
}

module.exports = {
  BASE,
  AMES_TABLE,
  ADMINS_TABLE,
  STATS_TABLE,
  GEO_TABLE,
  TRACK_FIELDS,
  SIGNUP_CODE,
  createRecord,
  todayKey,
  isBotRequest,
  isMissingTable,
  findStatsDay,
  pingGeoTable,
  json,
  readJson,
  configError,
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  authUser,
  at,
  listAll,
  findAdmin,
  createAdmin,
  patchRecord,
  rateLimit,
  sel,
  daysSince,
};
