/* =========================================================================
   quiz.js — « La source de ta soif »
   4 questions ; chaque réponse vote pour un persona (a=p1, b=p2, c=p3).
   Le persona majoritaire détermine le résultat + le pas suivant.
   Le résultat est mémorisé (localStorage) pour personnaliser l'opt-in.
   ========================================================================= */
(function () {
  const QUESTIONS = [
    { key: "quiz.q1", opts: ["quiz.q1a", "quiz.q1b", "quiz.q1c"] },
    { key: "quiz.q2", opts: ["quiz.q2a", "quiz.q2b", "quiz.q2c"] },
    { key: "quiz.q3", opts: ["quiz.q3a", "quiz.q3b", "quiz.q3c"] },
    { key: "quiz.q4", opts: ["quiz.q4a", "quiz.q4b", "quiz.q4c"] },
  ];
  const PERSONAS = ["p1", "p2", "p3"]; // index 0,1,2 ↔ a,b,c

  let current = 0;
  const answers = new Array(QUESTIONS.length).fill(null); // stocke l'index choisi par question

  const t = (k) => window.C2C_I18N.t(k);

  const els = {
    intro: document.getElementById("quiz-intro"),
    game: document.getElementById("quiz-game"),
    result: document.getElementById("quiz-result"),
    bar: document.getElementById("quiz-bar"),
    question: document.getElementById("quiz-question"),
    options: document.getElementById("quiz-options"),
    back: document.getElementById("quiz-back"),
  };

  function start() {
    current = 0;
    answers.fill(null);
    els.intro.hidden = true;
    els.result.hidden = true;
    els.game.hidden = false;
    render();
  }

  function render() {
    const q = QUESTIONS[current];
    els.question.innerHTML = t(q.key);
    els.bar.style.width = (current / QUESTIONS.length) * 100 + "%";
    els.options.innerHTML = "";
    q.opts.forEach((optKey, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option" + (answers[current] === i ? " selected" : "");
      btn.innerHTML =
        '<span class="opt-key">' +
        String.fromCharCode(65 + i) +
        "</span><span>" +
        t(optKey) +
        "</span>";
      btn.addEventListener("click", () => choose(i));
      els.options.appendChild(btn);
    });
    els.back.style.visibility = current === 0 ? "hidden" : "visible";
  }

  function choose(i) {
    answers[current] = i;
    if (current < QUESTIONS.length - 1) {
      current++;
      render();
    } else {
      finish();
    }
  }

  function back() {
    if (current > 0) {
      current--;
      render();
    }
  }

  function winner() {
    const scores = { p1: 0, p2: 0, p3: 0 };
    answers.forEach((i) => {
      if (i != null) scores[PERSONAS[i]] += 1;
    });
    // p1 par défaut en cas d'égalité (le plus inclusif)
    let best = "p1";
    if (scores.p2 > scores[best]) best = "p2";
    if (scores.p3 > scores[best]) best = "p3";
    return best;
  }

  function finish() {
    const p = winner();
    localStorage.setItem("c2c_persona", p);
    els.bar.style.width = "100%";
    els.game.hidden = true;
    els.result.hidden = false;
    renderResult(p);
  }

  // Témoignage vidéo aligné sur le persona (cf. fichier de sélection des témoignages)
  const RESULT_VIDEO = { p1: "1mu86jSJr9w", p2: "Ewm8bIZe8bs", p3: "2wzhSN0veAA" };

  function renderResult(p) {
    const accent = { p1: "var(--p1)", p2: "var(--p2)", p3: "var(--p3)" }[p];
    els.result.style.setProperty("--accent", accent);
    document.getElementById("result-badge").textContent = t("result." + p + ".badge");
    document.getElementById("result-title").textContent = t("result." + p + ".title");
    document.getElementById("result-text").textContent = t("result." + p + ".text");

    // Charge la façade vidéo du témoignage correspondant
    const rv = document.getElementById("result-video");
    if (rv && !rv.dataset.loaded) {
      const id = RESULT_VIDEO[p];
      rv.dataset.id = id;
      const img = rv.querySelector("img");
      if (img) { img.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"; img.alt = t("result." + p + ".title"); }
      if (window.C2C_Video) window.C2C_Video.init(rv.parentNode);
    }
  }

  // Re-render textes si la langue change pendant le quiz
  document.addEventListener("langchange", () => {
    if (!els.game.hidden) render();
    if (!els.result.hidden) renderResult(localStorage.getItem("c2c_persona") || "p1");
  });

  document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("quiz-start");
    if (startBtn) startBtn.addEventListener("click", start);
    if (els.back) els.back.addEventListener("click", back);
  });
})();
