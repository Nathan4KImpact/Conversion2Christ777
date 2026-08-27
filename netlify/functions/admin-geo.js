/* =========================================================================
   admin-geo.js — Origine des visiteurs (lecture seule, authentifié).

   Agrège la table Airtable « Geo » (compteurs par jour × pays × ville) sur
   les 30 derniers jours et renvoie :
     - totalVisits            : somme des visites géolocalisées (30 j)
     - topCountries           : top 12 pays (code + nom + count)
     - topCities              : top 12 villes (code pays + ville + count)
     - unresolved             : visites dont ni le pays ni la ville n'ont pu
                                être résolus par Netlify (indicatif)

   Ne renvoie AUCUNE donnée nominative : uniquement des agrégats. La table
   « Geo » elle-même n'en contient pas non plus (aucune IP, aucun identifiant).
   ========================================================================= */
"use strict";
const lib = require("./_lib");

const WINDOW_DAYS = 30;
const TOP_N = 12;

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return lib.json(405, { error: "method_not_allowed" });
  const cfg = lib.configError();
  if (cfg) return cfg;
  if (!lib.authUser(event)) return lib.json(401, { error: "unauthorized" });

  try {
    const records = await lib.listAll(lib.GEO_TABLE);
    const cutoff = todayMinus(WINDOW_DAYS - 1); // inclus

    // Deux jeux de compteurs sur les mêmes fiches : « Visites » (humains,
    // ayant passé le filtre anti-robots) et « Bots » (robots écartés). Le
    // tableau de bord bascule de l'un à l'autre sans nouvelle requête.
    const byCountry = new Map();
    const byCity = new Map();
    let totalVisits = 0;
    let totalBots = 0;
    let unresolved = 0;
    let unresolvedBots = 0;

    records.forEach(function (r) {
      const f = r.fields || {};
      const day = String(f["Jour"] || "").slice(0, 10);
      if (!day || day < cutoff) return;
      const n = Number(f["Visites"] || 0);
      const b = Number(f["Bots"] || 0);
      if (!n && !b) return;
      totalVisits += n;
      totalBots += b;

      const cc = String(f["Pays code"] || "").toUpperCase();
      const cname = String(f["Pays"] || "");
      const city = String(f["Ville"] || "");

      if (!cc) { unresolved += n; unresolvedBots += b; return; }

      const rowC = byCountry.get(cc) || { code: cc, name: cname || cc, count: 0, bots: 0 };
      rowC.count += n;
      rowC.bots += b;
      if (rowC.name === cc && cname) rowC.name = cname;
      byCountry.set(cc, rowC);

      if (city) {
        const kV = cc + "|" + city;
        const rowV = byCity.get(kV) || { code: cc, country: cname || cc, city: city, count: 0, bots: 0 };
        rowV.count += n;
        rowV.bots += b;
        byCity.set(kV, rowV);
      }
    });

    /* Un top par audience : trier sur « humains » puis tronquer masquerait
       un pays visité uniquement par des robots (et inversement). On calcule
       donc deux classements indépendants. */
    function top(map, key) {
      return Array.from(map.values())
        .filter(function (r) { return r[key] > 0; })
        .sort(function (a, b) { return b[key] - a[key]; })
        .slice(0, TOP_N);
    }
    function countWith(map, key) {
      let n = 0;
      map.forEach(function (r) { if (r[key] > 0) n += 1; });
      return n;
    }

    return lib.json(200, {
      generatedAt: new Date().toISOString(),
      windowDays: WINDOW_DAYS,
      // Audience « humains » (par défaut) — rétrocompatible avec l'ancien front
      totalVisits: totalVisits,
      unresolved: unresolved,
      countries: countWith(byCountry, "count"),
      cities: countWith(byCity, "count"),
      topCountries: top(byCountry, "count"),
      topCities: top(byCity, "count"),
      // Audience « robots » — même structure, champ `count` aligné pour que
      // le front puisse réutiliser exactement le même rendu.
      bots: {
        totalVisits: totalBots,
        unresolved: unresolvedBots,
        countries: countWith(byCountry, "bots"),
        cities: countWith(byCity, "bots"),
        topCountries: top(byCountry, "bots").map(function (r) {
          return { code: r.code, name: r.name, count: r.bots };
        }),
        topCities: top(byCity, "bots").map(function (r) {
          return { code: r.code, country: r.country, city: r.city, count: r.bots };
        }),
      },
    });
  } catch (err) {
    if (lib.isMissingTable(err)) {
      return lib.json(200, { ok: false, reason: "geo_table_missing" });
    }
    return lib.json(502, { error: "airtable_error", status: err && err.status });
  }
};

function todayMinus(n) {
  const now = new Date(Date.now() - n * 86400000);
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
