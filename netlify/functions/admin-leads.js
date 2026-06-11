/* admin-leads.js — Liste nominative des âmes (authentifié uniquement).
   Renvoie les fiches pour le suivi (relance, prise de contact). */
"use strict";
const lib = require("./_lib");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return lib.json(405, { error: "method_not_allowed" });
  const cfg = lib.configError();
  if (cfg) return cfg;
  if (!lib.authUser(event)) return lib.json(401, { error: "unauthorized" });

  try {
    const records = await lib.listAll(lib.AMES_TABLE);
    const leads = records.map((r) => {
      const f = r.fields || {};
      return {
        id: r.id,
        firstname: f["Prénom"] || "",
        email: f["Email"] || "",
        whatsapp: f["WhatsApp"] || "",
        persona: lib.sel(f["Persona"]),
        lang: lib.sel(f["Langue"]),
        source: f["Source"] || "",
        stage: lib.sel(f["Étape tunnel"]) || "Lead",
        status: lib.sel(f["Statut"]),
        entered: f["Date d'entrée"] || "",
        rdv: f["RDV prière"] || "",
        daysSince:
          typeof f["Jours depuis entrée"] === "number"
            ? f["Jours depuis entrée"]
            : lib.daysSince(f["Date d'entrée"]),
        j1: f["J1 envoyé"] === true,
        j3: f["J3 envoyé"] === true,
        j5: f["J5 envoyé"] === true,
        j7: f["J7 envoyé"] === true,
        notes: f["Notes"] || "",
      };
    });

    // Plus récentes d'abord (par date d'entrée).
    leads.sort((a, b) => (b.entered || "").localeCompare(a.entered || ""));

    return lib.json(200, { count: leads.length, leads });
  } catch (err) {
    return lib.json(502, { error: "airtable_error", status: err && err.status });
  }
};
