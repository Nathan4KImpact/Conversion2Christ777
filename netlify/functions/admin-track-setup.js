/* =========================================================================
   admin-track-setup.js — Crée la table Airtable « Stats » (authentifié).

   Le suivi d'activation a besoin d'une table de compteurs. Plutôt que
   d'imposer une création manuelle, le tableau de bord propose un bouton qui
   appelle cette fonction. Elle utilise l'API « meta » d'Airtable, qui exige
   que le jeton (AIRTABLE_TOKEN) porte le scope « schema.bases:write ».
   Si ce n'est pas le cas, on renvoie une erreur explicite et l'interface
   bascule sur la procédure manuelle.
   ========================================================================= */
"use strict";
const lib = require("./_lib");

const FIELDS = [
  {
    name: "Jour",
    type: "singleLineText",
    description: "Date au format ISO YYYY-MM-DD (heure de Paris). Une seule fiche par jour.",
  },
  { name: "Visites", type: "number", options: { precision: 0 }, description: "Sessions ayant ouvert le site public." },
  { name: "Quiz lancés", type: "number", options: { precision: 0 }, description: "Sessions ayant démarré le quiz." },
  { name: "Quiz terminés", type: "number", options: { precision: 0 }, description: "Sessions ayant vu le résultat du quiz." },
  { name: "Opt-in", type: "number", options: { precision: 0 }, description: "Formulaires de capture envoyés." },
  { name: "Prières", type: "number", options: { precision: 0 }, description: "Sessions arrivées sur la prière du salut." },
  { name: "Nouveau-nés", type: "number", options: { precision: 0 }, description: "Sessions ayant déclaré avoir prié." },
];

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return lib.json(405, { error: "method_not_allowed" });
  const cfg = lib.configError();
  if (cfg) return cfg;
  if (!lib.authUser(event)) return lib.json(401, { error: "unauthorized" });

  // Déjà créée ? On le dit sans rien toucher.
  try {
    await lib.findStatsDay(lib.todayKey());
    return lib.json(200, { ok: true, already: true });
  } catch (err) {
    if (!lib.isMissingTable(err)) return lib.json(502, { error: "airtable_error", status: err && err.status });
  }

  try {
    const created = await lib.at("meta/bases/" + lib.BASE + "/tables", {
      method: "POST",
      body: JSON.stringify({
        name: lib.STATS_TABLE,
        description:
          "Compteurs d'activation du tunnel, agrégés par jour. Aucune donnée personnelle : uniquement des nombres. Alimenté par la fonction Netlify /api/track.",
        fields: FIELDS,
      }),
    });
    return lib.json(200, { ok: true, tableId: created && created.id });
  } catch (err) {
    const detail = err && err.data && err.data.error;
    return lib.json(200, {
      ok: false,
      error: "schema_write_failed",
      status: err && err.status,
      detail: detail ? detail.message || detail.type || detail : undefined,
    });
  }
};
