/* admin-login.js — Connexion d'un administrateur. Renvoie un JWT (12 h). */
"use strict";
const lib = require("./_lib");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return lib.json(405, { error: "method_not_allowed" });
  const cfg = lib.configError();
  if (cfg) return cfg;
  if (!lib.rateLimit(event, "login", 15, 10 * 60 * 1000))
    return lib.json(429, { error: "too_many_requests" });

  try {
    const { email, password } = lib.readJson(event);
    if (!email || !password) return lib.json(400, { error: "missing_fields" });

    const admin = await lib.findAdmin(email);
    if (!admin) return lib.json(401, { error: "invalid_credentials" });

    const f = admin.fields || {};
    if (f.Actif === false) return lib.json(403, { error: "account_disabled" });
    if (!lib.verifyPassword(String(password), f["Password Hash"] || ""))
      return lib.json(401, { error: "invalid_credentials" });

    // Trace de connexion (best effort — ne bloque pas la connexion si échec).
    try {
      await lib.patchRecord(lib.ADMINS_TABLE, admin.id, {
        "Dernière connexion": new Date().toISOString(),
      });
    } catch (_) {}

    const user = { email: f.Email, name: f.Nom || "", role: f["Rôle"] || "Admin" };
    const token = lib.signToken({ sub: user.email, name: user.name, role: user.role });
    return lib.json(200, { token, user });
  } catch (err) {
    return lib.json(500, { error: "server_error" });
  }
};
