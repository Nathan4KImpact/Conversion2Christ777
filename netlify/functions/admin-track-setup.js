/* =========================================================================
   admin-track-setup.js — Crée les tables Airtable de suivi (authentifié).

   Le suivi d'activation a besoin de deux tables :
   - « Stats » : compteurs agrégés par jour (visites, quiz, opt-in, prières…)
   - « Geo »   : compteurs par (jour × pays × ville) — origine des visiteurs
                 fournie par Netlify Edge (context.geo), sans IP stockée.

   Plutôt que d'imposer une création manuelle, le tableau de bord propose un
   bouton qui appelle cette fonction. Elle utilise l'API « meta » d'Airtable,
   qui exige que le jeton (AIRTABLE_TOKEN) porte le scope « schema.bases:write ».
   Si ce n'est pas le cas, on renvoie une erreur explicite et l'interface
   bascule sur la procédure manuelle.
   ========================================================================= */
"use strict";
const lib = require("./_lib");

const STATS_FIELDS = [
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
  { name: "Bots", type: "number", options: { precision: 0 }, description: "Robots filtrés (indexation, IA, aperçus de liens). NON comptés dans les statistiques d'activation — affiché à part pour vérifier que le filtre fonctionne." },
];

const GEO_FIELDS = [
  {
    name: "Clé",
    type: "singleLineText",
    description: "Clé de dédoublonnage « Jour|Pays code|Ville » (une seule fiche par jour × pays × ville).",
  },
  { name: "Jour", type: "singleLineText", description: "Date ISO YYYY-MM-DD (heure de Paris)." },
  { name: "Pays code", type: "singleLineText", description: "Code ISO 3166-1 alpha-2 (ex. FR)." },
  { name: "Pays", type: "singleLineText", description: "Nom du pays (ex. France)." },
  { name: "Ville", type: "singleLineText", description: "Ville détectée à partir de l'IP par Netlify (jamais l'IP elle-même)." },
  { name: "Visites", type: "number", options: { precision: 0 }, description: "Nombre de sessions ce jour, depuis cette origine." },
];

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return lib.json(405, { error: "method_not_allowed" });
  const cfg = lib.configError();
  if (cfg) return cfg;
  if (!lib.authUser(event)) return lib.json(401, { error: "unauthorized" });

  const state = { stats: null, geo: null };
  const errors = [];

  // --- Table Stats ---
  try {
    await lib.findStatsDay(lib.todayKey());
    state.stats = "already";
    // La table existe déjà, mais peut dater d'avant l'ajout d'une colonne
    // (ex. « Bots », arrivée avec le filtrage des robots d'indexation).
    // On complète ce qui manque, sans jamais toucher aux données existantes.
    const added = await ensureFields(lib.STATS_TABLE, STATS_FIELDS);
    if (added.length) state.statsFieldsAdded = added;
    else if (added.failed) errors.push({ table: "Stats", detail: added.failed });
  } catch (err) {
    if (lib.isMissingTable(err)) {
      const r = await createTable(lib.STATS_TABLE, STATS_FIELDS, "Compteurs d'activation du tunnel, agrégés par jour. Aucune donnée personnelle : uniquement des nombres. Alimenté par /api/track.");
      if (r.ok) state.stats = "created";
      else { state.stats = "failed"; errors.push({ table: "Stats", detail: r.detail, status: r.status }); }
    } else {
      state.stats = "failed";
      errors.push({ table: "Stats", error: "airtable_error", status: err && err.status });
    }
  }

  // --- Table Geo ---
  try {
    await lib.pingGeoTable();
    state.geo = "already";
  } catch (err) {
    if (lib.isMissingTable(err)) {
      const r = await createTable(lib.GEO_TABLE, GEO_FIELDS, "Origine des visiteurs : compteurs agrégés par (jour × pays × ville). Alimenté par l'Edge Function /api/track à partir de context.geo (Netlify). Aucune IP, aucun identifiant, aucun cookie.");
      if (r.ok) state.geo = "created";
      else { state.geo = "failed"; errors.push({ table: "Geo", detail: r.detail, status: r.status }); }
    } else {
      state.geo = "failed";
      errors.push({ table: "Geo", error: "airtable_error", status: err && err.status });
    }
  }

  const allOk = state.stats !== "failed" && state.geo !== "failed";
  // Rétrocompat : l'ancien front lit `ok` et `already`.
  const already = state.stats === "already" && state.geo === "already";
  return lib.json(200, {
    ok: allOk,
    already: already && !(state.statsFieldsAdded && state.statsFieldsAdded.length),
    state: state,
    errors: errors.length ? errors : undefined,
    // le champ `detail` reste renseigné (utilisé par le front pour afficher un message brut)
    detail: errors[0] && (errors[0].detail || errors[0].error),
  });
};

/* Ajoute à une table existante les colonnes attendues qui lui manquent.
   Renvoie la liste des colonnes ajoutées. Best effort : si le jeton n'a pas
   le droit d'écrire le schéma, on renvoie l'erreur sans casser le reste. */
async function ensureFields(tableName, expectedFields) {
  const added = [];
  let table;
  try {
    const meta = await lib.at("meta/bases/" + lib.BASE + "/tables");
    table = (meta.tables || []).find((t) => t.name === tableName);
  } catch (err) {
    const d = err && err.data && err.data.error;
    added.failed = (d && (d.message || d.type)) || "schema_read_failed";
    return added;
  }
  if (!table) return added;

  const existing = new Set((table.fields || []).map((f) => f.name));
  for (const field of expectedFields) {
    if (existing.has(field.name)) continue;
    try {
      await lib.at("meta/bases/" + lib.BASE + "/tables/" + table.id + "/fields", {
        method: "POST",
        body: JSON.stringify(field),
      });
      added.push(field.name);
    } catch (err) {
      const d = err && err.data && err.data.error;
      added.failed = (d && (d.message || d.type)) || "field_create_failed";
    }
  }
  return added;
}

async function createTable(name, fields, description) {
  try {
    const created = await lib.at("meta/bases/" + lib.BASE + "/tables", {
      method: "POST",
      body: JSON.stringify({ name: name, description: description, fields: fields }),
    });
    return { ok: true, tableId: created && created.id };
  } catch (err) {
    const d = err && err.data && err.data.error;
    return {
      ok: false,
      status: err && err.status,
      detail: d ? (d.message || d.type || d) : undefined,
    };
  }
}
