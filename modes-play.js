// === Custom exam page ===
function renderExam() {
  const root = el("div", {});
  root.appendChild(renderHeader("📝 自選考試 Custom Exam", { back: "#/" }));
  const app = el("main", { class: "app" });

  // 切換 Tab：依單元 / 依週次
  let mode = "units"; // "units" or "weeks"
  const selectedUnits = new Set();
  const selectedWeeks = new Set();

  const tabBar = el("div", { style: "display: flex; gap: 8px; margin-bottom: 12px;" });
  const tabUnits = el("button", { class: "btn btn--accent btn--full" }, t("📦 依單元"));
  const tabWeeks = el("button", { class: "btn btn--ghost btn--full" }, t("📅 依週次"));
  tabBar.appendChild(tabUnits);
  tabBar.appendChild(tabWeeks);
  app.appendChild(tabBar);

  const hint = el("p", { style: "color: var(--ink-soft); font-size: calc(15px * var(--font-scale)); margin: 4px 0 12px;" },
    "勾選想考的單元（可複選），然後選練習方式。");
  app.appendChild(hint);

  // Units grid
  const unitsGrid = el("div", { class: "unit-pick" });
  UNITS.forEach(u => {
    const item = el("button", { class: "unit-pick__item", style: `background: ${u.color};` });
    const name = el("div", { class: "unit-pick__name" });
    name.appendChild(el("span", { class: "unit-pick__emoji" }, u.emoji));
    name.appendChild(document.createTextNode(u.name));
    item.appendChild(name);
    item.appendChild(el("div", { class: "unit-pick__count" }, `${u.words.length} 個字`));
    item.addEventListener("click", () => {
      if (selectedUnits.has(u.id)) { selectedUnits.delete(u.id); item.classList.remove("checked"); }
      else { selectedUnits.add(u.id); item.classList.add("checked"); }
      updateBar();
    });
    unitsGrid.appendChild(item);
  });
  app.appendChild(unitsGrid);

  // Weeks grid (skip exam weeks with no words)
  const weeksGrid = el("div", { class: "unit-pick", style: "display: none;" });
  WEEKS.forEach(w => {
    if (!w.words.length) return; // skip exam-only weeks
    const item = el("button", { class: "unit-pick__item", style: "background: var(--candy-2);" });
    const name = el("div", { class: "unit-pick__name" });
    name.appendChild(el("span", { class: "unit-pick__emoji" }, "📅"));
    name.appendChild(document.createTextNode(`第 ${w.num} 週`));
    item.appendChild(name);
    item.appendChild(el("div", { class: "unit-pick__count" },
      `${w.dateRange}・${w.progress}・${w.words.length} 個字`));
    item.addEventListener("click", () => {
      if (selectedWeeks.has(w.num)) { selectedWeeks.delete(w.num); item.classList.remove("checked"); }
      else { selectedWeeks.add(w.num); item.classList.add("checked"); }
      updateBar();
    });
    weeksGrid.appendChild(item);
  });
  app.appendChild(weeksGrid);

  const switchTab = (which) => {
    mode = which;
    if (which === "units") {
      tabUnits.className = "btn btn--accent btn--full";
      tabWeeks.className = "btn btn--ghost btn--full";
      unitsGrid.style.display = "";
      weeksGrid.style.display = "none";
      hint.replaceChildren(t("勾選想考的單元（可複選），然後選練習方式。"));
    } else {
      tabUnits.className = "btn btn--ghost btn--full";
      tabWeeks.className = "btn btn--accent btn--full";
      unitsGrid.style.display = "none";
      weeksGrid.style.display = "";
      hint.replaceChildren(t("勾選想考的週次（可複選），然後選練習方式。"));
    }
    updateBar();
  };
  tabUnits.addEventListener("click", () => switchTab("units"));
  tabWeeks.addEventListener("click", () => switchTab("weeks"));

  const bar = el("div", { class: "section", style: "position: sticky; bottom: 8px; background: var(--bg); padding: 12px; border-radius: var(--radius-lg); box-shadow: var(--shadow);" });
  const status = el("div", { style: "font-weight: 800; margin-bottom: 8px;" });
  bar.appendChild(status);
  const modeRow = el("div", { class: "exam-options", style: "margin-bottom: 8px;" });
  [["📝 選擇題","quiz"],["👂 聽力","listening"],["✏️ 拼字","spelling"],["✍️ 手寫","handwrite"]].forEach(([label, m]) => {
    const btn = el("button", { onclick: () => start(m) });
    btn.appendChild(t(label));
    modeRow.appendChild(btn);
  });
  bar.appendChild(modeRow);

  const updateBar = () => {
    if (mode === "units") {
      const dedupe = new Set();
      [...selectedUnits].forEach(id => UNITS.find(u => u.id === id)?.words.forEach(w => dedupe.add(w)));
      status.textContent = selectedUnits.size
        ? `選了 ${selectedUnits.size} 個單元・${dedupe.size} 個不同的字`
        : "請至少選 1 個單元";
    } else {
      const dedupe = new Set();
      [...selectedWeeks].forEach(n => WEEKS.find(w => w.num === n)?.words.forEach(w => dedupe.add(w)));
      status.textContent = selectedWeeks.size
        ? `選了 ${selectedWeeks.size} 個週次・${dedupe.size} 個不同的字`
        : "請至少選 1 個週次";
    }
  };
  const start = (m) => {
    let setKey;
    if (mode === "units") {
      if (!selectedUnits.size) { alert("請先選至少 1 個單元"); return; }
      setKey = "units-" + [...selectedUnits].join(",");
    } else {
      if (!selectedWeeks.size) { alert("請先選至少 1 個週次"); return; }
      setKey = "weeks-" + [...selectedWeeks].sort((a,b)=>a-b).join(",");
    }
    navigate(`#/play/${m}?set=${setKey}`);
  };
  updateBar();
  app.appendChild(bar);

  root.appendChild(app);
  return root;
}

// === Movement break overlay ===
function showMovementBreak(onClose) {
  const item = MOVEMENT_BREAKS[Math.floor(Math.random() * MOVEMENT_BREAKS.length)];
  let secs = 5;
  const overlay = el("div", { class: "overlay" });
  const card = el("div", { class: "overlay__card pop" },
    el("div", { class: "overlay__emoji" }, item.emoji),
    el("div", { class: "overlay__text" }, t(item.text)),
    el("div", { class: "overlay__count" }, t(`${secs} 秒後繼續`)),
    el("button", { class: "btn btn--accent btn--full", onclick: () => { clearInterval(timer); document.body.removeChild(overlay); onClose && onClose(); } }, t("好了，繼續 →"))
  );
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  const timer = setInterval(() => {
    secs--;
    card.children[2].replaceChildren(t(secs > 0 ? `${secs} 秒後繼續` : "繼續～"));
    if (secs <= 0) { clearInterval(timer); if (overlay.parentNode) document.body.removeChild(overlay); onClose && onClose(); }
  }, 1000);
}

// === Flashcard mode ===
function renderFlashcard(setKey) {
  const words = resolveSet(setKey);
  if (!words.length) return renderEmpty(`#/`, "沒有單字");
  let i = 0;
  let flipped = false;

  const root = el("div", {});
  const header = renderHeader(`🃏 ${setLabel(setKey)}`, { back: backHashFor(setKey) });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);

  const app = el("main", { class: "app" });
  const wrap = el("div", { class: "flashcard-wrap" });
  const card = el("div", { class: "flashcard" });
  const front = el("div", { class: "flashcard__face" });
  const back = el("div", { class: "flashcard__face flashcard__face--back" });
  card.append(front, back);
  card.addEventListener("click", () => { flipped = !flipped; card.classList.toggle("flipped", flipped); });
  wrap.appendChild(card);
  app.appendChild(wrap);

  const controls = el("div", { class: "flash-controls" },
    el("button", { class: "icon-btn", "aria-label": "上一張" }, "←"),
    el("div", { style: "display: grid; place-items: center;" },
      el("button", { class: "icon-btn icon-btn--big icon-btn--accent", "aria-label": "念出單字" }, "🔊")
    ),
    el("button", { class: "icon-btn", "aria-label": "下一張" }, "→")
  );
  const [prevBtn, , nextBtn] = controls.children;
  const speakBtn = controls.querySelector(".icon-btn--big");
  prevBtn.addEventListener("click", e => { e.stopPropagation(); if (i > 0) { i--; render(); } });
  nextBtn.addEventListener("click", e => { e.stopPropagation(); if (i < words.length - 1) { i++; render(); } });
  speakBtn.addEventListener("click", e => { e.stopPropagation(); speakWord(words[i]); });
  app.appendChild(controls);

  const actions = el("div", { class: "flash-actions" },
    el("button", { class: "btn btn--success" }, t("✅ 我會了")),
    el("button", { class: "btn btn--ghost" }, t("🔁 再練習"))
  );
  actions.children[0].addEventListener("click", () => { setMastered(words[i], true); dingCorrect(); next(); });
  actions.children[1].addEventListener("click", () => { setMastered(words[i], false); next(); });
  app.appendChild(actions);

  function next() {
    if (i < words.length - 1) { i++; render(); }
    else {
      app.replaceChildren(renderResultBlock("做完一輪了！", "🎉", "重新開始", () => { i = 0; render(); }));
    }
  }

  function render() {
    flipped = false;
    card.classList.remove("flipped");
    const w = words[i];
    const info = WORDS[w] || { emoji: "❓", zh: "", bopo: "" };
    front.replaceChildren(
      el("div", { class: "flashcard__emoji" }, info.emoji),
      el("div", { class: "flashcard__en" }, w),
      el("div", { class: "flashcard__hint" }, t("點卡片看中文"))
    );
    back.replaceChildren(
      el("div", { class: "flashcard__emoji" }, info.emoji),
      rubyEl(info.zh || "", info.bopo || "", "div", { class: "flashcard__zh" }),
      el("div", { class: "flashcard__hint" }, w)
    );
    progressLabel.textContent = `${i + 1}/${words.length}`;
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === words.length - 1;
    setTimeout(() => speakWord(w), 200);
  }
  render();

  root.appendChild(app);
  return root;
}

// === Quiz / Listening / Spelling shared engine with spaced repetition ===
function withSpacedRepetition(originalWords) {
  return shuffle(originalWords);
}
function pushWrongBack(queue, currentIdx, word, depth = 3) {
  const insertAt = Math.min(currentIdx + 1 + depth, queue.length);
  queue.splice(insertAt, 0, word);
}
function maybeMovementBreak(streak, onResume) {
  if (streak > 0 && streak % 5 === 0) {
    setTimeout(() => showMovementBreak(onResume), 200);
  } else { onResume(); }
}

function distractors(correct) {
  const sameCat = Object.entries(WORDS)
    .filter(([w, info]) => w !== correct && info.category === WORDS[correct]?.category)
    .map(([w]) => w);
  const pool = sameCat.length >= 3 ? sameCat : Object.keys(WORDS).filter(w => w !== correct);
  return shuffle(pool).slice(0, 3);
}

// === Quiz mode (zh→en) ===
function renderQuiz(setKey) {
  const words = resolveSet(setKey);
  if (words.length < 2) return renderEmpty(`#/`, "單字太少，無法做選擇題");
  const queue = withSpacedRepetition(words);
  const total = words.length;
  let i = 0;
  let score = 0;
  let streak = 0;
  let locked = false;

  const root = el("div", {});
  const header = renderHeader(`📝 ${setLabel(setKey)}`, { back: backHashFor(setKey) });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

  function render() {
    if (i >= queue.length) {
      recordSession("quiz", setKey, score, total);
      app.replaceChildren(renderResultBlock(`答對 ${score} / ${total}`, score === total ? "🌟" : score >= total * 0.7 ? "🎉" : "💪", "再來一次", () => navigate(`#/play/quiz?set=${setKey}`)));
      return;
    }
    locked = false;
    const w = queue[i];
    const info = WORDS[w] || { emoji: "❓", zh: "", bopo: "" };
    progressLabel.textContent = `${i + 1}/${queue.length}・${score}分`;
    if (streak >= 2) {
      progressLabel.appendChild(document.createTextNode(" "));
      progressLabel.appendChild(el("span", { class: "streak" }, `🔥${streak}`));
    }

    const opts = shuffle([w, ...distractors(w)]);
    const feedback = el("div", { class: "quiz-feedback" }, "");

    const optionsWrap = el("div", { class: "quiz-options" });
    opts.forEach(opt => {
      const btn = el("button", { class: "quiz-option" }, opt);
      btn.addEventListener("click", () => {
        if (locked) return;
        locked = true;
        if (opt === w) {
          btn.classList.add("quiz-option--correct");
          feedback.textContent = "答對了！🎉";
          feedback.className = "quiz-feedback quiz-feedback--correct pop";
          score++;
          streak++;
          recordWord(w, true);
          dingCorrect();
          speakWord(w);
        } else {
          btn.classList.add("quiz-option--wrong");
          [...optionsWrap.children].forEach(b => { if (b.textContent === w) b.classList.add("quiz-option--correct"); });
          feedback.textContent = `正確答案：${w}`;
          feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          streak = 0;
          recordWord(w, false);
          buzzWrong();
          speakWord(w);
          pushWrongBack(queue, i, w);
        }
        setTimeout(() => {
          maybeMovementBreak(streak, () => { i++; render(); });
        }, 1300);
      });
      optionsWrap.appendChild(btn);
    });

    const promptBox = el("div", { class: "quiz-prompt" });
    promptBox.appendChild(el("div", { class: "quiz-prompt__emoji" }, info.emoji));
    promptBox.appendChild(rubyEl(info.zh || "", info.bopo || "", "div", { class: "quiz-prompt__zh" }));
    promptBox.appendChild(el("div", { class: "quiz-prompt__hint" }, "選出正確的英文"));
    app.replaceChildren(promptBox, optionsWrap, feedback);
  }
  render();
  return root;
}

// === Listening mode ===
function renderListening(setKey) {
  const words = resolveSet(setKey);
  if (words.length < 2) return renderEmpty(`#/`, "單字太少，無法做聽力題");
  const queue = withSpacedRepetition(words);
  const total = words.length;
  let i = 0, score = 0, streak = 0, locked = false;

  const root = el("div", {});
  const header = renderHeader(`👂 ${setLabel(setKey)}`, { back: backHashFor(setKey) });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

  function render() {
    if (i >= queue.length) {
      recordSession("listening", setKey, score, total);
      app.replaceChildren(renderResultBlock(`答對 ${score} / ${total}`, score === total ? "🌟" : "🎉", "再來一次", () => navigate(`#/play/listening?set=${setKey}`)));
      return;
    }
    locked = false;
    const w = queue[i];
    progressLabel.textContent = `${i + 1}/${queue.length}・${score}分`;

    const opts = shuffle([w, ...distractors(w)]);
    const feedback = el("div", { class: "quiz-feedback" }, "");
    const optionsWrap = el("div", { class: "quiz-options" });
    opts.forEach(opt => {
      const btn = el("button", { class: "quiz-option" }, opt);
      btn.addEventListener("click", () => {
        if (locked) return;
        locked = true;
        if (opt === w) {
          btn.classList.add("quiz-option--correct");
          feedback.textContent = "答對了！🎉";
          feedback.className = "quiz-feedback quiz-feedback--correct pop";
          score++; streak++;
          recordWord(w, true);
          dingCorrect();
        } else {
          btn.classList.add("quiz-option--wrong");
          [...optionsWrap.children].forEach(b => { if (b.textContent === w) b.classList.add("quiz-option--correct"); });
          feedback.textContent = `正確答案：${w}`;
          feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          streak = 0;
          recordWord(w, false);
          buzzWrong();
          pushWrongBack(queue, i, w);
        }
        setTimeout(() => maybeMovementBreak(streak, () => { i++; render(); }), 1300);
      });
      optionsWrap.appendChild(btn);
    });

    app.replaceChildren(
      el("div", { class: "quiz-prompt" },
        el("div", { class: "quiz-prompt__emoji" }, "🎧"),
        el("div", { class: "quiz-prompt__zh", style: "font-size: calc(24px * var(--font-scale));" }, "聽聽看，選出正確的英文"),
        el("button", { class: "icon-btn icon-btn--big icon-btn--accent", style: "margin-top: 12px;", onclick: () => speakWord(w), "aria-label": "重聽" }, "🔊"),
        el("div", { class: "quiz-prompt__hint" }, "點喇叭可重聽")
      ),
      optionsWrap,
      feedback
    );
    setTimeout(() => speakWord(w), 300);
  }
  render();
  return root;
}

// === Spelling mode ===
function renderSpelling(setKey) {
  const words = resolveSet(setKey);
  if (!words.length) return renderEmpty(`#/`, "沒有單字");
  const queue = withSpacedRepetition(words);
  const total = words.length;
  let i = 0, score = 0, streak = 0;

  const root = el("div", {});
  const header = renderHeader(`✏️ ${setLabel(setKey)}`, { back: backHashFor(setKey) });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

  function render() {
    if (i >= queue.length) {
      recordSession("spelling", setKey, score, total);
      app.replaceChildren(renderResultBlock(`答對 ${score} / ${total}`, score === total ? "🌟" : "🎉", "再來一次", () => navigate(`#/play/spelling?set=${setKey}`)));
      return;
    }
    const w = queue[i];
    const info = WORDS[w] || { emoji: "❓", zh: "", bopo: "" };
    progressLabel.textContent = `${i + 1}/${queue.length}・${score}分`;

    const input = el("input", { class: "spell-input", type: "text", autocomplete: "off", autocapitalize: "none", spellcheck: "false", placeholder: "在這裡輸入英文" });
    const hint = el("div", { class: "spell-hint" }, w.replace(/[a-zA-Z]/g, "_").split("").join(" "));
    let revealed = false;

    const submit = () => {
      const v = input.value.trim().toLowerCase().replace(/\s+/g, " ");
      const correct = w.toLowerCase().replace(/\s+/g, " ");
      if (v === correct) {
        feedback.textContent = "答對了！🎉";
        feedback.className = "quiz-feedback quiz-feedback--correct pop";
        score++; streak++;
        recordWord(w, true);
        dingCorrect();
        speakWord(w);
        setTimeout(() => maybeMovementBreak(streak, () => { i++; render(); }), 1100);
      } else if (revealed) {
        feedback.textContent = `正確：${w}`;
        feedback.className = "quiz-feedback quiz-feedback--wrong";
        streak = 0;
        recordWord(w, false);
        pushWrongBack(queue, i, w);
        setTimeout(() => { i++; render(); }, 1500);
      } else {
        feedback.textContent = "再試一次！";
        feedback.className = "quiz-feedback quiz-feedback--wrong shake";
        input.classList.add("shake");
        setTimeout(() => input.classList.remove("shake"), 400);
        buzzWrong();
      }
    };
    const reveal = () => {
      revealed = true;
      input.value = w;
      hint.textContent = w.split("").join(" ");
      speakWord(w);
    };
    const showHint = () => {
      hint.textContent = w[0] + " " + w.slice(1).replace(/[a-zA-Z]/g, "_").split("").join(" ");
    };

    input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
    const feedback = el("div", { class: "quiz-feedback" }, "");

    const promptBox = el("div", { class: "quiz-prompt" });
    promptBox.appendChild(el("div", { class: "quiz-prompt__emoji" }, info.emoji));
    promptBox.appendChild(rubyEl(info.zh || "", info.bopo || "", "div", { class: "quiz-prompt__zh" }));
    promptBox.appendChild(el("button", { class: "icon-btn icon-btn--big icon-btn--accent", style: "margin-top: 8px;", onclick: () => speakWord(w), "aria-label": "重聽" }, "🔊"));
    promptBox.appendChild(el("div", { class: "quiz-prompt__hint" }, `共 ${w.length} 個字元（含空白）`));

    app.replaceChildren(
      promptBox,
      input,
      hint,
      el("div", { class: "spell-actions" },
        el("button", { class: "btn btn--ghost", onclick: showHint }, "💡 提示首字"),
        el("button", { class: "btn btn--ghost", onclick: reveal }, "👀 看答案")
      ),
      el("button", { class: "btn btn--full", style: "margin-top: 12px;", onclick: submit }, "送出"),
      feedback
    );
    setTimeout(() => { input.focus(); speakWord(w); }, 100);
  }
  render();
  return root;
}
