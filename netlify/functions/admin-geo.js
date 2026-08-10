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

    const byCountry = new Map();
    const byCity = new Map();
    let totalVisits = 0;
    let unresolved = 0;

    records.forEach(function (r) {
      const f = r.fields || {};
      const day = String(f["Jour"] || "").slice(0, 10);
      if (!day || day < cutoff) return;
      const n = Number(f["Visites"] || 0);
      if (!n) return;
      totalVisits += n;

      const cc = String(f["Pays code"] || "").toUpperCase();
      const cname = String(f["Pays"] || "");
      const city = String(f["Ville"] || "");

      if (!cc) { unresolved += n; return; }

      const kC = cc;
      const rowC = byCountry.get(kC) || { code: cc, name: cname || cc, count: 0 };
      rowC.count += n;
      if (rowC.name === kC && cname) rowC.name = cname;
      byCountry.set(kC, rowC);

      if (city) {
        const kV = cc + "|" + city;
        const rowV = byCity.get(kV) || { code: cc, country: cname || cc, city: city, count: 0 };
        rowV.count += n;
        byCity.set(kV, rowV);
      }
    });

    const topCountries = Array.from(byCountry.values())
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, TOP_N);
    const topCities = Array.from(byCity.values())
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, TOP_N);

    return lib.json(200, {
      generatedAt: new Date().toISOString(),
      windowDays: WINDOW_DAYS,
      totalVisits: totalVisits,
      unresolved: unresolved,
      countries: topCountries.length,
      cities: byCity.size,
      topCountries: topCountries,
      topCities: topCities,
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
