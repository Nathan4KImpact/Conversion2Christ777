/* =========================================================================
   main.js — Animations au scroll + petites interactions globales
   ========================================================================= */
(function () {
  // Reveal-on-scroll
  const els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && els.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add("in"));
  }

  // Année dynamique dans le footer
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
