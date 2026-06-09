/* =========================================================================
   video.js — Façade « Lite YouTube »
   Affiche une vignette légère ; charge l'iframe YouTube (nocookie) seulement
   au clic → page plus rapide, respect de la vie privée (RGPD), pas de cookies
   tiers avant interaction de l'utilisateur.

   Markup attendu :
   <div class="lite-yt" role="button" tabindex="0" data-id="VIDEO_ID" data-title="...">
     <img alt="" /><span class="lite-yt-play" aria-hidden="true">▶</span>
   </div>
   ========================================================================= */
(function () {
  function load(el) {
    if (el.dataset.loaded) return;
    el.dataset.loaded = "1";
    var id = el.dataset.id;
    var iframe = document.createElement("iframe");
    iframe.src =
      "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1";
    iframe.title = el.dataset.title || "Vidéo";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.setAttribute("allowfullscreen", "");
    iframe.loading = "lazy";
    el.innerHTML = "";
    el.appendChild(iframe);
  }

  function build(el) {
    if (el.dataset.bound) return;
    var id = el.dataset.id;
    if (!id) return; // sera (re)construit quand l'id sera défini (ex : résultat du quiz)
    el.dataset.bound = "1";

    var img = el.querySelector("img");
    if (img && !img.getAttribute("src")) {
      img.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
      // Fallback si la miniature ne charge pas (réseau restreint) : on garde le dégradé.
      img.addEventListener("error", function () { img.style.display = "none"; });
    }

    el.addEventListener("click", function () { load(el); });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); load(el); }
    });
  }

  function initAll(root) {
    (root || document).querySelectorAll(".lite-yt[data-id]").forEach(build);
  }

  window.C2C_Video = { init: initAll };
  document.addEventListener("DOMContentLoaded", function () { initAll(); });
})();
