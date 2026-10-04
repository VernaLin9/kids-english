// === Custom review page（自選複習）===
// 選擇狀態存在記憶體：練完按「←」回來時，上次勾選的還在
const EXAM_STATE = { tab: "units", units: new Set(), weeks: new Set(), cats: new Set(), words: new Set() };

function renderExam() {
  const S = EXAM_STATE;
  const root = el("div", {});
  root.appendChild(renderHeader("🎯 自選複習", { back: "#/" }));
  const app = el("main", { class: "app" });
  const profile = getProfile();
  const progress = profile?.progress || {};

  // 快速複習：常錯 / 還沒學會
  const quick = renderReviewPicks(profile, { custom: false });
  quick.style.marginBottom = "16px";
  app.appendChild(quick);

  // Tabs
  const TABS = [
    ["units", "單元", "勾選想複習的單元（可複選）"],
    ["weeks", "週次", "勾選想複習的週次（可複選）"],
    ["cats",  "主題", "勾選想複習的主題（可複選）"],
    ["words", "單字", "點單字自己挑（可複選），也可以整週一起選"],
  ];
  const tabBar = el("div", { class: "pick-tabs" });
  const hint = el("p", { style: "color: var(--ink-soft); font-size: calc(15px * var(--font-scale)); margin: 4px 0 12px;" });
  const panels = {};
  TABS.forEach(([id, label]) => {
    tabBar.appendChild(el("button", { class: "pick-tab", "data-tab": id, onclick: () => switchTab(id) }, t(label)));
  });
  app.appendChild(tabBar);
  app.appendChild(hint);

  const pickItem = (set, key, bg, title, sub) => {
    const item = el("button", { class: `unit-pick__item ${set.has(key) ? "checked" : ""}`, style: `background: ${bg};` });
    item.appendChild(title);
    item.appendChild(el("div", { class: "unit-pick__count" }, sub));
    item.addEventListener("click", () => {
      set.has(key) ? set.delete(key) : set.add(key);
      item.classList.toggle("checked", set.has(key));
      updateBar();
    });
    return item;
  };
  const masteredOf = words => words.filter(w => progress[w]?.mastered).length;

  // 單元
  panels.units = el("div", { class: "unit-pick" });
  UNITS.forEach(u => {
    const name = el("div", { class: "unit-pick__name" }, el("span", { class: "unit-pick__emoji" }, u.emoji), u.name);
    panels.units.appendChild(pickItem(S.units, u.id, u.color, name, `${u.words.length} 個字・學會 ${masteredOf(u.words)}`));
  });

  // 週次（跳過沒有單字的考試週）
  panels.weeks = el("div", { class: "unit-pick" });
  WEEKS.filter(w => w.words.length).forEach(w => {
    const name = el("div", { class: "unit-pick__name" }, el("span", { class: "unit-pick__emoji" }, "📅"), `第 ${w.num} 週`);
    panels.weeks.appendChild(pickItem(S.weeks, w.num, "var(--candy-2)", name,
      `${w.dateRange}・${w.progress}・學會 ${masteredOf(w.words)}/${w.words.length}`));
  });

  // 主題
  panels.cats = el("div", { class: "unit-pick" });
  CATEGORIES.forEach(c => {
    const name = el("div", { class: "unit-pick__name" }, el("span", { class: "unit-pick__emoji" }, c.emoji), rubyEl(c.name, c.bopo, "span"));
    panels.cats.appendChild(pickItem(S.cats, c.id, c.color, name, `${c.nameEn}・${c.words.length} 個字・學會 ${masteredOf(c.words)}`));
  });

  // 單字：依週分組，每組可整組選
  panels.words = el("div", {});
  const chipEls = new Map();
  const refreshChips = () => chipEls.forEach((chip, w) => chip.classList.toggle("checked", S.words.has(w)));
  WEEKS.filter(w => w.words.length).forEach(wk => {
    const group = el("div", { class: "word-pick-group" });
    group.appendChild(el("div", { class: "word-pick-group__head" },
      el("span", {}, `第 ${wk.num} 週・${wk.progress}`),
      el("button", { class: "word-pick-group__all", onclick: () => {
        const allIn = wk.words.every(w => S.words.has(w));
        wk.words.forEach(w => allIn ? S.words.delete(w) : S.words.add(w));
        refreshChips(); updateBar();
      } }, t("整週"))
    ));
    const chips = el("div", { class: "word-pick" });
    wk.words.forEach(w => {
      const r = progress[w];
      const chip = el("button", { class: "word-chip", onclick: () => {
        S.words.has(w) ? S.words.delete(w) : S.words.add(w);
        refreshChips(); updateBar();
      } }, `${WORDS[w]?.emoji || ""} ${w}`, r?.mastered ? " ⭐" : (r?.wrong && !r.mastered ? " ❗" : ""));
      chipEls.set(w, chip);
      chips.appendChild(chip);
    });
    group.appendChild(chips);
    panels.words.appendChild(group);
  });
  refreshChips();
  panels.words.appendChild(el("div", { style: "font-size: calc(13px * var(--font-scale)); color: var(--ink-soft); margin-top: 8px;" }, "⭐ 已學會　❗ 答錯過、還沒學會"));

  Object.values(panels).forEach(p => app.appendChild(p));

  // 底部：選取狀態 + 練習方式
  const bar = el("div", { class: "section pick-bar", style: "position: sticky; bottom: 8px; background: var(--bg); padding: 10px; border-radius: var(--radius-lg); box-shadow: var(--shadow);" });
  const status = el("div", { style: "font-weight: 800; margin-bottom: 6px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;" });
  bar.appendChild(status);
  const modeRow = el("div", { class: "exam-options" });
  PRACTICE_MODES.forEach(([m, emoji, label]) => {
    modeRow.appendChild(el("button", { onclick: () => start(m) }, `${emoji} `, t(label)));
  });
  bar.appendChild(modeRow);
  app.appendChild(bar);

  const UNIT_NAME = { units: "單元", weeks: "週次", cats: "主題", words: "單字" };
  const currentKey = () => {
    const set = S[S.tab];
    if (!set.size) return null;
    if (S.tab === "units") return "units-" + [...set].join(",");
    if (S.tab === "weeks") return "weeks-" + [...set].sort((a, b) => a - b).join(",");
    if (S.tab === "cats") return "cats-" + [...set].join(",");
    return wordsSetKey([...set]);
  };
  function updateBar() {
    const set = S[S.tab];
    const key = currentKey();
    const n = key ? resolveSet(key).length : 0;
    status.replaceChildren(
      set.size
        ? (S.tab === "words" ? `選了 ${n} 個字` : `選了 ${set.size} 個${UNIT_NAME[S.tab]}・${n} 個字`)
        : `請先選${UNIT_NAME[S.tab]}`,
      ...(set.size ? [el("button", { class: "pick-clear", onclick: () => {
        set.clear();
        panels[S.tab].querySelectorAll(".checked").forEach(x => x.classList.remove("checked"));
        updateBar();
      } }, "清除")] : [])
    );
    modeRow.querySelectorAll("button").forEach(b => { b.disabled = !n; });
  }
  function start(m) {
    const key = currentKey();
    if (!key) return;
    const n = resolveSet(key).length;
    if ((m === "quiz" || m === "listening") && n < 2) { alert("選擇題/聽力至少要 2 個字"); return; }
    navigate(`#/play/${m}?set=${encodeURIComponent(key)}`);
  }
  function switchTab(id) {
    S.tab = id;
    tabBar.querySelectorAll(".pick-tab").forEach(b => b.classList.toggle("pick-tab--on", b.dataset.tab === id));
    Object.entries(panels).forEach(([k, p]) => { p.style.display = k === id ? "" : "none"; });
    hint.replaceChildren(t(TABS.find(x => x[0] === id)[2]));
    updateBar();
  }
  switchTab(S.tab);

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
      syllableEl(w, "div", { class: "flashcard__en" }),
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

// 結果頁：這一輪答錯的字 → 再練一次
function retryWrongButton(mode, wrongSet) {
  if (!wrongSet.size) return null;
  return el("button", { class: "btn btn--warn", onclick: () => navigate(`#/play/${mode}?set=${encodeURIComponent(wordsSetKey([...wrongSet]))}`) },
    t(`🔁 再練錯的 ${wrongSet.size} 個字`));
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
  const missed = new Set();

  const root = el("div", {});
  const header = renderHeader(`📝 ${setLabel(setKey)}`, { back: backHashFor(setKey) });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

  function render() {
    if (i >= queue.length) {
      recordSession("quiz", setKey, score, total);
      app.replaceChildren(renderResultBlock(`答對 ${score} / ${total}`, score === total ? "🌟" : score >= total * 0.7 ? "🎉" : "💪", "再來一次", () => navigate(`#/play/quiz?set=${encodeURIComponent(setKey)}`), retryWrongButton("quiz", missed)));
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
          if (!missed.has(w)) score++; // 只算第一次就答對的
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
          missed.add(w);
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
  const missed = new Set();

  const root = el("div", {});
  const header = renderHeader(`👂 ${setLabel(setKey)}`, { back: backHashFor(setKey) });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

  function render() {
    if (i >= queue.length) {
      recordSession("listening", setKey, score, total);
      app.replaceChildren(renderResultBlock(`答對 ${score} / ${total}`, score === total ? "🌟" : "🎉", "再來一次", () => navigate(`#/play/listening?set=${encodeURIComponent(setKey)}`), retryWrongButton("listening", missed)));
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
          if (!missed.has(w)) score++;
          streak++;
          recordWord(w, true);
          dingCorrect();
        } else {
          btn.classList.add("quiz-option--wrong");
          [...optionsWrap.children].forEach(b => { if (b.textContent === w) b.classList.add("quiz-option--correct"); });
          feedback.textContent = `正確答案：${w}`;
          feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          streak = 0;
          recordWord(w, false);
          missed.add(w);
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

// === Spelling mode：點字母方塊排出單字（平板不用鍵盤）===
// 空白會自動留好；點方塊放進下一格，點格子把字母拿回來；排滿自動對答案
function renderSpelling(setKey) {
  const words = resolveSet(setKey);
  if (!words.length) return renderEmpty(`#/`, "沒有單字");
  const queue = withSpacedRepetition(words);
  const total = words.length;
  let i = 0, score = 0, streak = 0;
  const missed = new Set();

  const root = el("div", {});
  const header = renderHeader(`🔤 ${setLabel(setKey)}`, { back: backHashFor(setKey) });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

  function render() {
    if (i >= queue.length) {
      recordSession("spelling", setKey, score, total);
      app.replaceChildren(renderResultBlock(`答對 ${score} / ${total}`, score === total ? "🌟" : "🎉", "再來一次", () => navigate(`#/play/spelling?set=${encodeURIComponent(setKey)}`), retryWrongButton("spelling", missed)));
      return;
    }
    const w = queue[i];
    const info = WORDS[w] || { emoji: "❓", zh: "", bopo: "" };
    progressLabel.textContent = `${i + 1}/${queue.length}・${score}分`;
    const chars = [...w];
    const letterIdx = chars.map((c, k) => (c === " " ? -1 : k)).filter(k => k >= 0);
    // 方塊：單字裡的字母打亂（避免打亂後剛好是原順序）
    let tiles = shuffle(letterIdx.map(k => ({ ch: chars[k], used: false })));
    if (tiles.length > 1 && tiles.map(t => t.ch).join("") === letterIdx.map(k => chars[k]).join("")) tiles.reverse();
    const filled = letterIdx.map(() => null); // 每一格放哪一個方塊（tiles 的 index）
    let wrongTries = 0, done = false;

    const feedback = el("div", { class: "quiz-feedback" }, "");
    const slotsWrap = el("div", { class: "spell-slots" });
    const tilesWrap = el("div", { class: "spell-tiles" });

    const draw = () => {
      slotsWrap.replaceChildren();
      let li = 0;
      chars.forEach((c, k) => {
        if (c === " ") { slotsWrap.appendChild(el("span", { class: "spell-gap" })); return; }
        const slot = li++;
        const ti = filled[slot];
        const btn = el("button", { class: `spell-slot ${ti != null ? "spell-slot--filled" : ""}`, "aria-label": "字母格" }, ti != null ? tiles[ti].ch : "");
        btn.addEventListener("click", () => {
          if (done || ti == null) return;
          tiles[ti].used = false; filled[slot] = null; draw();
        });
        slotsWrap.appendChild(btn);
      });
      tilesWrap.replaceChildren(...tiles.map((t, ti) => {
        const b = el("button", { class: `spell-tile ${t.used ? "spell-tile--used" : ""}`, disabled: t.used }, t.ch);
        b.addEventListener("click", () => {
          if (done || t.used) return;
          const slot = filled.indexOf(null);
          if (slot < 0) return;
          t.used = true; filled[slot] = ti; draw();
          if (!filled.includes(null)) check();
        });
        return b;
      }));
    };
    const answer = () => filled.map(ti => tiles[ti].ch).join("");
    const target = letterIdx.map(k => chars[k]).join("");
    const next = (delay) => setTimeout(() => maybeMovementBreak(streak, () => { i++; render(); }), delay);
    const check = () => {
      if (answer().toLowerCase() === target.toLowerCase()) {
        done = true;
        feedback.textContent = "答對了！🎉";
        feedback.className = "quiz-feedback quiz-feedback--correct pop";
        if (!missed.has(w)) score++;
        streak++;
        recordWord(w, true);
        dingCorrect();
        speakWord(w);
        next(1200);
      } else {
        wrongTries++;
        if (wrongTries === 1) { recordWord(w, false); missed.add(w); }
        streak = 0;
        buzzWrong();
        feedback.textContent = wrongTries >= 2 ? "再試一次！可以按「提示」" : "再試一次！";
        feedback.className = "quiz-feedback quiz-feedback--wrong shake";
        // 把放錯位置的字母退回去，對的留著
        filled.forEach((ti, slot) => { if (ti != null && tiles[ti].ch.toLowerCase() !== target[slot].toLowerCase()) { tiles[ti].used = false; filled[slot] = null; } });
        setTimeout(draw, 350);
      }
    };
    // 提示：把下一個正確字母放進第一個空格
    const hint = () => {
      if (done) return;
      const slot = filled.findIndex((ti, k) => ti == null || tiles[ti].ch.toLowerCase() !== target[k].toLowerCase());
      if (slot < 0) return;
      if (filled[slot] != null) { tiles[filled[slot]].used = false; filled[slot] = null; }
      const ti = tiles.findIndex(t => !t.used && t.ch.toLowerCase() === target[slot].toLowerCase());
      if (ti < 0) return;
      tiles[ti].used = true; filled[slot] = ti;
      if (!missed.has(w)) { recordWord(w, false); missed.add(w); }
      draw();
      if (!filled.includes(null)) check();
    };
    const clearAll = () => { if (done) return; tiles.forEach(t => (t.used = false)); filled.fill(null); draw(); };

    const promptBox = el("div", { class: "quiz-prompt" });
    promptBox.appendChild(el("div", { class: "quiz-prompt__emoji" }, info.emoji));
    promptBox.appendChild(rubyEl(info.zh || "", info.bopo || "", "div", { class: "quiz-prompt__zh" }));
    promptBox.appendChild(el("button", { class: "icon-btn icon-btn--big icon-btn--accent", style: "margin-top: 8px;", onclick: () => speakWord(w), "aria-label": "重聽" }, "🔊"));

    app.replaceChildren(
      promptBox,
      slotsWrap,
      tilesWrap,
      el("div", { class: "spell-actions" },
        el("button", { class: "btn btn--ghost", onclick: hint }, t("💡 提示")),
        el("button", { class: "btn btn--ghost", onclick: clearAll }, t("🧹 重排"))
      ),
      feedback
    );
    draw();
    setTimeout(() => speakWord(w), 150);
  }
  render();
  return root;
}

// === 翻牌配對：英文卡和圖片+中文卡配成一對 ===
function renderMatch(setKey) {
  const all = resolveSet(setKey);
  if (all.length < 2) return renderEmpty(`#/`, "單字太少，無法配對");
  const PAIRS = Math.min(6, all.length);
  let round = 0, moves = 0, found = 0, first = null, lock = false;

  const root = el("div", {});
  const header = renderHeader(`🧩 ${setLabel(setKey)}`, { back: backHashFor(setKey) });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);
  const pool = shuffle(all);

  function render() {
    const words = pool.slice(round * PAIRS, round * PAIRS + PAIRS);
    const picked = words.length >= 2 ? words : shuffle(all).slice(0, PAIRS);
    found = 0; moves = 0; first = null; lock = false;
    const cards = shuffle(picked.flatMap(w => [{ w, side: "en" }, { w, side: "zh" }]));
    const grid = el("div", { class: `match-grid ${cards.length > 8 ? "match-grid--4" : ""}` });
    const update = () => { progressLabel.textContent = `${found}/${picked.length} 對`; };
    cards.forEach(c => {
      const info = WORDS[c.w] || {};
      const face = c.side === "en"
        ? el("div", { class: "match-card__face match-card__face--en" }, c.w)
        : el("div", { class: "match-card__face" }, el("div", { class: "match-card__emoji" }, info.emoji || ""), rubyEl(info.zh || "", info.bopo || "", "div", { class: "match-card__zh" }));
      const card = el("button", { class: "match-card", "data-w": c.w }, el("div", { class: "match-card__back" }, "❓"), face);
      card.addEventListener("click", () => {
        if (lock || card.classList.contains("match-card--open")) return;
        card.classList.add("match-card--open");
        if (c.side === "en") speakWord(c.w);
        if (!first) { first = { c, card }; return; }
        moves++;
        if (first.c.w === c.w) {
          card.classList.add("match-card--done"); first.card.classList.add("match-card--done");
          found++; first = null; dingCorrect(); update();
          if (found === picked.length) setTimeout(finish, 600);
        } else {
          lock = true; buzzWrong();
          const prev = first; first = null;
          setTimeout(() => { card.classList.remove("match-card--open"); prev.card.classList.remove("match-card--open"); lock = false; }, 900);
        }
      });
      grid.appendChild(card);
    });
    app.replaceChildren(el("p", { class: "match-hint" }, "翻兩張牌，英文和圖配成一對 🧩"), grid);
    update();
  }
  function finish() {
    const more = (round + 1) * PAIRS < pool.length;
    p_stars();
    app.replaceChildren(renderResultBlock(`配完了！翻了 ${moves} 次`, moves <= PAIRS + 2 ? "🌟" : "🎉",
      more ? "下一組 →" : "再玩一次", () => { if (more) round++; else round = 0; render(); }));
  }
  function p_stars() { const p = getProfile(); if (p) { p.stars = (p.stars || 0) + 1; saveStore(); } }
  render();
  return root;
}

// === 跟著念：聽發音 → 按麥克風念出來 → 網站聽聽看念得對不對 ===
function renderSpeak(setKey) {
  const words = resolveSet(setKey);
  if (!words.length) return renderEmpty(`#/`, "沒有單字");
  if (!SPEECH_RECOG) return renderEmpty(backHashFor(setKey), "這台裝置的瀏覽器不支援語音辨識，請改用其他練習");
  const queue = shuffle(words);
  let i = 0, score = 0;

  const root = el("div", {});
  const header = renderHeader(`🎤 ${setLabel(setKey)}`, { back: backHashFor(setKey) });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);
  const norm = s => s.toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, " ").trim();

  function render() {
    if (i >= queue.length) {
      app.replaceChildren(renderResultBlock(`念對 ${score} / ${queue.length}`, score === queue.length ? "🌟" : "🎉", "再來一次", () => navigate(`#/play/speak?set=${encodeURIComponent(setKey)}`)));
      return;
    }
    const w = queue[i];
    const info = WORDS[w] || {};
    progressLabel.textContent = `${i + 1}/${queue.length}・${score}分`;
    const target = norm(WORDS[w]?.speak ?? w);
    const feedback = el("div", { class: "quiz-feedback" }, "");
    const heard = el("div", { class: "speak-heard" }, "");
    const mic = el("button", { class: "speak-mic", "aria-label": "按我念" }, "🎤");
    let tries = 0, listening = false;
    mic.addEventListener("click", () => {
      if (listening) return;
      const rec = new SPEECH_RECOG();
      rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 5;
      listening = true; mic.classList.add("speak-mic--on");
      feedback.textContent = "請念出來…"; feedback.className = "quiz-feedback";
      rec.onresult = (e) => {
        const alts = [...e.results[0]].map(a => norm(a.transcript));
        heard.textContent = `聽到：${e.results[0][0].transcript}`;
        if (alts.some(a => a === target || a.split(" ").includes(target) || a.includes(target))) {
          feedback.textContent = "念得很好！🎉"; feedback.className = "quiz-feedback quiz-feedback--correct pop";
          if (tries === 0) score++;
          dingCorrect();
          setTimeout(() => { i++; render(); }, 1200);
        } else {
          tries++;
          feedback.textContent = tries >= 2 ? "再聽一次，慢慢念～（也可以按「下一個」）" : "再試一次！";
          feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          buzzWrong();
        }
      };
      rec.onerror = (e) => {
        feedback.textContent = e.error === "not-allowed" ? "需要允許使用麥克風喔" : "沒有聽清楚，再按一次 🎤";
        feedback.className = "quiz-feedback quiz-feedback--wrong";
      };
      rec.onend = () => { listening = false; mic.classList.remove("speak-mic--on"); };
      try { rec.start(); } catch { listening = false; mic.classList.remove("speak-mic--on"); }
    });
    app.replaceChildren(
      el("div", { class: "quiz-prompt" },
        el("div", { class: "quiz-prompt__emoji" }, info.emoji || ""),
        syllableEl(w, "div", { class: "speak-word" }),
        rubyEl(info.zh || "", info.bopo || "", "div", { class: "quiz-prompt__hint" }),
        el("button", { class: "icon-btn icon-btn--big icon-btn--accent", style: "margin-top: 10px;", onclick: () => speakWord(w), "aria-label": "聽發音" }, "🔊")),
      el("div", { class: "speak-step" }, t("先按🔊聽，再按🎤念出來")),
      mic, heard, feedback,
      el("button", { class: "btn btn--ghost btn--full", style: "margin-top: 12px;", onclick: () => { i++; render(); } }, t("下一個 →"))
    );
    setTimeout(() => speakWord(w), 200);
  }
  render();
  return root;
}
