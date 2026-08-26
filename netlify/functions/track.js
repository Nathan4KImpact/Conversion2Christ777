/* =========================================================================
   track.js — Compteurs d'activation du tunnel (endpoint PUBLIC).

   Pourquoi : le tableau de bord sait combien d'âmes ont laissé leurs
   coordonnées, mais pas combien de personnes ont ouvert la landing, lancé le
   quiz ou l'ont terminé. Sans ces chiffres, impossible de savoir OÙ ça fuit.

   Vie privée : on n'enregistre AUCUNE donnée personnelle — ni IP, ni user
   agent, ni identifiant. Uniquement des compteurs agrégés par jour, dans la
   table Airtable « Stats » (1 fiche = 1 jour). Rien à consentir côté RGPD.

   Robustesse : cette fonction ne doit jamais casser le site. Toute erreur
   (table absente, Airtable indisponible…) renvoie 200 avec ok:false.
   ========================================================================= */
"use strict";
const lib = require("./_lib");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return lib.json(405, { error: "method_not_allowed" });

  // Garde-fou : 120 évènements/minute et par IP (l'IP sert au comptage
  // en mémoire seulement, elle n'est jamais stockée).
  if (!lib.rateLimit(event, "track", 120, 60000)) return lib.json(200, { ok: false, reason: "rate_limited" });

  // Robots d'indexation / IA / aperçus : jamais comptés dans l'activation.
  // (Voir netlify/edge-functions/track.js — cette fonction Node reste un repli.)
  if (lib.isBotRequest(event)) return lib.json(200, { ok: false, reason: "bot" });

  const body = lib.readJson(event);
  const field = lib.TRACK_FIELDS[String(body.event || "")];
  if (!field) return lib.json(400, { error: "unknown_event" });

  if (!process.env.AIRTABLE_TOKEN) return lib.json(200, { ok: false, reason: "not_configured" });

  const day = lib.todayKey();
  try {
    const rec = await lib.findStatsDay(day);
    if (rec) {
      const current = Number((rec.fields || {})[field] || 0);
      const patch = {};
      patch[field] = current + 1;
      await lib.patchRecord(lib.STATS_TABLE, rec.id, patch);
    } else {
      const fields = { Jour: day };
      fields[field] = 1;
      await lib.createRecord(lib.STATS_TABLE, fields);
    }
    return lib.json(200, { ok: true });
  } catch (err) {
    // Table pas encore créée, ou Airtable en carafe : on ne casse rien.
    return lib.json(200, {
      ok: false,
      reason: lib.isMissingTable(err) ? "stats_table_missing" : "airtable_error",
    });
  }
};
