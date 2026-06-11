/* admin-signup.js — Création d'un compte administrateur.
   Protégé par un code d'invitation (ADMIN_SIGNUP_CODE) pour empêcher
   n'importe qui de s'enregistrer comme admin. */
"use strict";
const lib = require("./_lib");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return lib.json(405, { error: "method_not_allowed" });
  const cfg = lib.configError();
  if (cfg) return cfg;
  if (!lib.rateLimit(event, "signup", 10, 10 * 60 * 1000))
    return lib.json(429, { error: "too_many_requests" });

  try {
    const { email, password, name, code } = lib.readJson(event);

    if (!email || !password) return lib.json(400, { error: "missing_fields" });
    // L'inscription n'est possible que si un code est configuré ET correct.
    if (!lib.SIGNUP_CODE || String(code || "") !== lib.SIGNUP_CODE)
      return lib.json(403, { error: "invalid_code" });
    if (String(password).length < 8) return lib.json(400, { error: "weak_password" });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email)))
      return lib.json(400, { error: "invalid_email" });

    const existing = await lib.findAdmin(email);
    if (existing) return lib.json(409, { error: "email_exists" });

    const rec = await lib.createAdmin({
      Email: String(email).toLowerCase().trim(),
      "Password Hash": lib.hashPassword(String(password)),
      Nom: String(name || "").trim(),
      "Rôle": "Admin",
      Actif: true,
      "Créé le": new Date().toISOString().slice(0, 10),
    });

    const f = rec.fields || {};
    const user = {
      email: f.Email,
      name: f.Nom || "",
      role: f["Rôle"] || "Admin",
    };
    const token = lib.signToken({ sub: user.email, name: user.name, role: user.role });
    return lib.json(201, { token, user });
  } catch (err) {
    return lib.json(500, { error: "server_error" });
  }
};
