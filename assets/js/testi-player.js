/* =========================================================================
   testi-player.js — Lecteur de témoignages par profil (style YouTube)
   - Grand frame (façade Lite-YT) + liste latérale de miniatures
   - Clic sur miniature → bascule la vidéo dans le grand frame
   - Met à jour titre + sous-titre depuis les data-* de la miniature
   ========================================================================= */
(function () {
  function init(player) {
    var stage = player.querySelector(".player-stage .lite-yt");
    var stageTitle = player.querySelector(".player-meta h4");
    var stageSub = player.querySelector(".player-meta p");
    var items = player.querySelectorAll(".player-item");
    if (!stage || !items.length) return;

    items.forEach(function (it) {
      it.addEventListener("click", function () {
        var id = it.getAttribute("data-id");
        var title = it.getAttribute("data-title") || "";
        var sub = it.getAttribute("data-sub") || "";
        if (!id) return;

        // Réinitialise la façade pour pointer sur la nouvelle vidéo
        stage.setAttribute("data-id", id);
        stage.setAttribute("data-title", title);
        stage.removeAttribute("data-loaded");
        stage.removeAttribute("data-bound");
        stage.innerHTML =
          '<img alt="" /><span class="lite-yt-play" aria-hidden="true">▶</span>';
        var fb = stage.nextElementSibling;
        if (fb && fb.classList.contains("yt-fallback")) fb.parentNode.removeChild(fb);
        if (window.C2C_Video) window.C2C_Video.init(stage.parentNode);

        if (stageTitle) stageTitle.textContent = title;
        if (stageSub) stageSub.textContent = sub;

        items.forEach(function (x) { x.classList.remove("active"); });
        it.classList.add("active");
      });
    });
  }
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".testi-player").forEach(init);
  });
})();
