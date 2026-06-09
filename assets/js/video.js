/* =========================================================================
   video.js — Façade « Lite YouTube »
   Affiche une vignette légère ; charge l'iframe YouTube (nocookie) seulement
   au clic → page plus rapide, respect de la vie privée (RGPD), pas de cookies
   tiers avant interaction.

   IMPORTANT : la lecture intégrée ne fonctionne que si la page est servie en
   http(s) (domaine déployé ou `python3 -m http.server`). Ouvrir le fichier en
   double-clic (file://) provoque l'« Erreur 153 » de YouTube (origine invalide).
   Un lien de secours « Regarder sur YouTube » est ajouté sous chaque vidéo pour
   couvrir aussi les vidéos dont le propriétaire a désactivé l'intégration.

   Markup attendu :
   <div class="lite-yt" role="button" tabindex="0" data-id="VIDEO_ID" data-title="...">
     <img alt="" /><span class="lite-yt-play" aria-hidden="true">▶</span>
   </div>
   ========================================================================= */
(function () {
  function t(key, fr) {
    return (window.C2C_I18N && window.C2C_I18N.t(key)) || fr;
  }

  function embedUrl(id) {
    var origin = "";
    if (location.protocol === "http:" || location.protocol === "https:") {
      origin = "&origin=" + encodeURIComponent(location.origin);
    }
    return (
      "https://www.youtube-nocookie.com/embed/" +
      id +
      "?autoplay=1&rel=0&modestbranding=1&playsinline=1" +
      origin
    );
  }

  function load(el) {
    if (el.dataset.loaded) return;
    el.dataset.loaded = "1";
    var iframe = document.createElement("iframe");
    iframe.src = embedUrl(el.dataset.id);
    iframe.title = el.dataset.title || "Vidéo";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.setAttribute("allowfullscreen", "");
    iframe.loading = "lazy";
    el.innerHTML = "";
    el.appendChild(iframe);
  }

  function addFallback(el, id) {
    // Lien de secours juste après la façade (toujours présent)
    if (el.nextElementSibling && el.nextElementSibling.classList.contains("yt-fallback")) return;
    var a = document.createElement("a");
    a.className = "yt-fallback";
    a.href = "https://www.youtube.com/watch?v=" + id;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = t("video.fallback", "Regarder sur YouTube ↗");
    el.insertAdjacentElement("afterend", a);
  }

  function build(el) {
    if (el.dataset.bound) return;
    var id = el.dataset.id;
    if (!id) return; // (re)construit quand l'id sera défini (ex : résultat du quiz)
    el.dataset.bound = "1";

    var img = el.querySelector("img");
    if (img && !img.getAttribute("src")) {
      img.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
      img.addEventListener("error", function () { img.style.display = "none"; });
    }

    el.addEventListener("click", function () { load(el); });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); load(el); }
    });

    addFallback(el, id);
  }

  function initAll(root) {
    (root || document).querySelectorAll(".lite-yt[data-id]").forEach(build);
  }

  window.C2C_Video = { init: initAll };
  document.addEventListener("DOMContentLoaded", function () { initAll(); });
})();
