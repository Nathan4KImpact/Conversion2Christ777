/* admin-lead-update.js — Met à jour une fiche âme (authentifié).
   Champs autorisés : Étape tunnel, Statut, Notes. (Liste blanche stricte.) */
"use strict";
const lib = require("./_lib");

const STAGES = ["Lead", "Prière faite", "RDV pris", "Affermi"];
const STATUSES = ["Nouveau", "Converti", "Refroidi", ""];

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return lib.json(405, { error: "method_not_allowed" });
  const cfg = lib.configError();
  if (cfg) return cfg;
  if (!lib.authUser(event)) return lib.json(401, { error: "unauthorized" });

  try {
    const { id, stage, status, notes } = lib.readJson(event);
    if (!id || !/^rec[A-Za-z0-9]{14}$/.test(String(id)))
      return lib.json(400, { error: "invalid_id" });

    const fields = {};
    if (stage !== undefined) {
      if (!STAGES.includes(stage)) return lib.json(400, { error: "invalid_stage" });
      fields["Étape tunnel"] = stage;
    }
    if (status !== undefined) {
      if (!STATUSES.includes(status)) return lib.json(400, { error: "invalid_status" });
      if (status) fields["Statut"] = status;
    }
    if (notes !== undefined) {
      fields["Notes"] = String(notes).slice(0, 5000);
    }

    if (!Object.keys(fields).length) return lib.json(400, { error: "nothing_to_update" });

    const rec = await lib.patchRecord(lib.AMES_TABLE, id, fields);
    const f = rec.fields || {};
    return lib.json(200, {
      ok: true,
      id: rec.id,
      stage: lib.sel(f["Étape tunnel"]) || "Lead",
      status: lib.sel(f["Statut"]),
      notes: f["Notes"] || "",
    });
  } catch (err) {
    return lib.json(502, { error: "airtable_error", status: err && err.status });
  }
};
