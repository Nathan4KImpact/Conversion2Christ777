/* admin-stats.js — Indicateurs agrégés sur les âmes (lecture seule, authentifié).
   Ne renvoie que des AGRÉGATS (compteurs), aucune donnée nominative. */
"use strict";
const lib = require("./_lib");

const STAGES = ["Lead", "Prière faite", "RDV pris", "Affermi"];
const PERSONAS = ["Ouvert", "Blessé", "Chercheur", "Musulman", "Sceptique"];
const LANGS = ["FR", "EN"];

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return lib.json(405, { error: "method_not_allowed" });
  const cfg = lib.configError();
  if (cfg) return cfg;
  if (!lib.authUser(event)) return lib.json(401, { error: "unauthorized" });

  try {
    const records = await lib.listAll(lib.AMES_TABLE);
    const total = records.length;

    const byStage = {};
    const byPersona = {};
    const byLang = {};
    const bySource = {};
    STAGES.forEach((s) => (byStage[s] = 0));
    PERSONAS.forEach((p) => (byPersona[p] = 0));
    LANGS.forEach((l) => (byLang[l] = 0));

    let conversions = 0; // a prié ou au-delà
    let rdvTotal = 0;
    let rdvUpcoming = 0;
    let followUp = 0; // Lead, sans RDV, >= 7 jours
    let newToday = 0,
      new7 = 0,
      new30 = 0;
    const nurturing = { J1: 0, J3: 0, J5: 0, J7: 0 };
    const dayMap = {}; // 'YYYY-MM-DD' -> count (30 derniers jours)

    const nowMs = Date.now();
    // squelette des 30 derniers jours (pour des barres continues même à zéro)
    for (let i = 29; i >= 0; i--) {
      const d = new Date(nowMs - i * 86400000);
      dayMap[d.toISOString().slice(0, 10)] = 0;
    }

    records.forEach((r) => {
      const f = r.fields || {};
      const stage = lib.sel(f["Étape tunnel"]) || "Lead";
      const persona = lib.sel(f["Persona"]);
      const lang = lib.sel(f["Langue"]);
      const source = (f["Source"] || "").toString().trim();

      if (stage in byStage) byStage[stage] += 1;
      if (persona in byPersona) byPersona[persona] += 1;
      else if (persona) byPersona[persona] = (byPersona[persona] || 0) + 1;
      if (lang in byLang) byLang[lang] += 1;
      if (source) bySource[source] = (bySource[source] || 0) + 1;

      if (stage === "Prière faite" || stage === "RDV pris" || stage === "Affermi")
        conversions += 1;

      const rdv = f["RDV prière"];
      if (rdv) {
        rdvTotal += 1;
        if (Date.parse(rdv) >= nowMs) rdvUpcoming += 1;
      }

      const ds = lib.daysSince(f["Date d'entrée"]);
      if (ds !== null) {
        if (ds === 0) newToday += 1;
        if (ds <= 6) new7 += 1;
        if (ds <= 29) new30 += 1;
        const key = String(f["Date d'entrée"]).slice(0, 10);
        if (key in dayMap) dayMap[key] += 1;
      }

      if (stage === "Lead" && !rdv && ds !== null && ds >= 7) followUp += 1;

      if (f["J1 envoyé"] === true) nurturing.J1 += 1;
      if (f["J3 envoyé"] === true) nurturing.J3 += 1;
      if (f["J5 envoyé"] === true) nurturing.J5 += 1;
      if (f["J7 envoyé"] === true) nurturing.J7 += 1;
    });

    // Top sources (max 6)
    const topSources = Object.keys(bySource)
      .map((k) => ({ label: k, count: bySource[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const timeseries = Object.keys(dayMap)
      .sort()
      .map((d) => ({ date: d, count: dayMap[d] }));

    const conversionRate = total ? Math.round((conversions / total) * 1000) / 10 : 0;

    // --- Activation (table « Stats ») : ce qui se passe AVANT la capture ---
    // Absente tant que la table n'a pas été créée → le tableau de bord
    // affiche alors le bouton d'activation plutôt qu'une erreur.
    let activation = null;
    try {
      activation = await readActivation();
    } catch (err) {
      if (!lib.isMissingTable(err)) activation = { error: "airtable_error" };
    }

    return lib.json(200, {
      generatedAt: new Date().toISOString(),
      total,
      newToday,
      new7,
      new30,
      conversions,
      conversionRate,
      rdvTotal,
      rdvUpcoming,
      followUp,
      byStage,
      byPersona,
      byLang,
      topSources,
      nurturing,
      timeseries,
      activation,
    });
  } catch (err) {
    return lib.json(502, { error: "airtable_error", status: err && err.status });
  }
};

/* Compteurs d'activation sur les 30 derniers jours (+ aujourd'hui). */
async function readActivation() {
  const records = await lib.listAll(lib.STATS_TABLE);
  const today = lib.todayKey();

  // Squelette des 30 derniers jours, pour des séries continues même à zéro.
  const days = [];
  const base = Date.parse(today + "T12:00:00Z");
  for (let i = 29; i >= 0; i--) {
    days.push(new Date(base - i * 86400000).toISOString().slice(0, 10));
  }
  const inWindow = new Set(days);

  const fieldNames = Object.keys(lib.TRACK_FIELDS).map((k) => lib.TRACK_FIELDS[k]);
  const totals = {};
  const todayCounts = {};
  const series = {};
  fieldNames.forEach((f) => {
    totals[f] = 0;
    todayCounts[f] = 0;
    series[f] = {};
    days.forEach((d) => (series[f][d] = 0));
  });

  records.forEach((r) => {
    const f = r.fields || {};
    const day = String(f["Jour"] || "").slice(0, 10);
    if (!day) return;
    fieldNames.forEach((name) => {
      const v = Number(f[name] || 0);
      if (!v) return;
      if (inWindow.has(day)) {
        totals[name] += v;
        series[name][day] = v;
      }
      if (day === today) todayCounts[name] += v;
    });
  });

  return {
    days,
    totals,
    today: todayCounts,
    series,
    trackedDays: records.length,
  };
}
