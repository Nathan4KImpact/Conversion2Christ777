/* =========================================================================
   config.js — Points de branchement des intégrations (à remplir une fois)
   Aucune clé secrète ici : tout passe par un webhook Make.com côté serveur,
   ce qui garde le site statique 100% sûr (pas d'API key exposée).
   ========================================================================= */
window.C2C_CONFIG = {
  // 1) Webhook Make.com — scénario : Webhook ▸ Airtable « Suivi des Ames PDVIE »
  //    ▸ Gmail (séquence de nurturing) ▸ Google Agenda (RDV de prière).
  //    Colle ici l'URL du webhook quand le scénario Make est créé. Vide = la
  //    capture reste stockée en local + redirection (aucune perte de lead).
  WEBHOOK_URL: "https://hook.eu1.make.com/0n4j1xc1cjv9rgh2w3idgn319zbyw1xp",

  // 2) Page de réservation des RDV de prière (Mar–Sam, 19h–20h) :
  //    lien Google Agenda « Prendre rendez-vous » ou Calendly.
  //    Vide = repli automatique sur WhatsApp.
  BOOKING_URL: "",

  // 3) Contacts (déjà utilisés dans le tunnel)
  WHATSAPP: "33758372268",
  WHATSAPP_GROUP: "https://chat.whatsapp.com/0vazCnCIMag0OAsYUtuO1z",
  WHATSAPP_CHANNEL: "https://whatsapp.com/channel/0029VbCXLHm72WToQsw68F0N",
  EMAIL: "nathanaelfongang@gmail.com",
};
