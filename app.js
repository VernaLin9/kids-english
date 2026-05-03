// === 工具 utilities ===
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
};
const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const escHTML = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// === 進度儲存 storage ===
const STORAGE_KEY = "partygo:progress:v1";
const loadProgress = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
};
const saveProgress = p => localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
const recordWord = (w, hit) => {
  const p = loadProgress();
  const r = p[w] || { seen: 0, correct: 0, wrong: 0, mastered: false };
  r.seen += 1;
  if (hit === true) r.correct += 1;
  if (hit === false) r.wrong += 1;
  p[w] = r;
  saveProgress(p);
};
const setMastered = (w, val) => {
  const p = loadProgress();
  p[w] = p[w] || { seen: 0, correct: 0, wrong: 0 };
  p[w].mastered = !!val;
  saveProgress(p);
};

// === 語音 speech ===
let voicesCache = [];
const initVoices = () => {
  const v = window.speechSynthesis?.getVoices?.() || [];
  if (v.length) voicesCache = v;
};
if (window.speechSynthesis) {
  initVoices();
  speechSynthesis.onvoiceschanged = initVoices;
}
const speak = (text) => {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.9;
  const enVoice = voicesCache.find(v => /en[-_]US/i.test(v.lang)) || voicesCache.find(v => /^en/i.test(v.lang));
  if (enVoice) u.voice = enVoice;
  speechSynthesis.speak(u);
};
const speakWord = w => speak(WORDS[w]?.speak ?? w);

// === 本週判斷 ===
const TODAY = new Date();
const todayISO = () => {
  const y = TODAY.getFullYear();
  const m = String(TODAY.getMonth() + 1).padStart(2, "0");
  const d = String(TODAY.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
const getCurrentWeek = () => {
  const t = todayISO();
  const inRange = WEEKS.find(w => t >= w.start && t <= w.end);
  if (inRange) return inRange;
  // before first week
  if (t < WEEKS[0].start) return WEEKS[0];
  // after last week
  if (t > WEEKS[WEEKS.length - 1].end) return WEEKS[WEEKS.length - 1];
  // between weeks: pick next upcoming
  return WEEKS.find(w => t < w.start) || WEEKS[WEEKS.length - 1];
};

// === Hash router ===
const parseHash = () => {
  const raw = location.hash.slice(1) || "/";
  const [pathPart, queryPart] = raw.split("?");
  const path = pathPart.split("/").filter(Boolean);
  const query = {};
  if (queryPart) {
    for (const seg of queryPart.split("&")) {
      const [k, v] = seg.split("=");
      query[decodeURIComponent(k)] = decodeURIComponent(v ?? "");
    }
  }
  return { path, query };
};
const navigate = h => { location.hash = h; };

// === 取單字集合 ===
const resolveSet = (setKey) => {
  if (!setKey) return [];
  if (setKey.startsWith("week-")) {
    const n = +setKey.slice(5);
    return WEEKS.find(w => w.num === n)?.words || [];
  }
  if (setKey.startsWith("category-")) {
    const id = setKey.slice(9);
    return CATEGORIES.find(c => c.id === id)?.words || [];
  }
  if (setKey === "all") return Object.keys(WORDS);
  return [];
};
const setLabel = (setKey) => {
  if (setKey?.startsWith("week-")) {
    const n = +setKey.slice(5);
    const w = WEEKS.find(x => x.num === n);
    return `第 ${n} 週・${w?.progress || ""}`;
  }
  if (setKey?.startsWith("category-")) {
    const c = CATEGORIES.find(x => x.id === setKey.slice(9));
    return `${c?.emoji || ""} ${c?.name || ""} ${c?.nameEn || ""}`;
  }
  return "全部";
};

// === Render header ===
const renderHeader = (title, { back = "#/", progress = "" } = {}) => {
  return el("header", { class: "header" },
    el("button", { class: "header__back", onclick: () => navigate(back), "aria-label": "回上一頁" }, "←"),
    el("div", { class: "header__title" }, title),
    el("div", { class: "header__progress" }, progress)
  );
};

// === 首頁 Home ===
function renderHome() {
  const cw = getCurrentWeek();
  const cs = SENTENCES.find(s => s.week === cw.num);
  const progress = loadProgress();
  const masteredCount = Object.values(progress).filter(p => p.mastered).length;
  const totalWords = Object.keys(WORDS).length;
  const pct = Math.round((masteredCount / totalWords) * 100);

  const root = el("div", {});
  root.appendChild(el("header", { class: "header" },
    el("div", { class: "header__back", style: "background: var(--accent-soft); font-size: 28px;" }, "📚"),
    el("div", { class: "header__title" }, "再興一年級英文 學習複習"),
    el("div", { class: "header__progress", title: "已學會 / 總字數" }, `${masteredCount}/${totalWords}`)
  ));

  const app = el("main", { class: "app" });

  // Hero - this week
  const dateStr = TODAY.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  const hero = el("section", { class: "hero" },
    el("div", { class: "hero__date" }, `今天 ${dateStr}`),
    el("h1", { class: "hero__title" }, `本週 第 ${cw.num} 週`,
      el("small", {}, `${cw.dateRange}・${cw.progress}`)
    )
  );
  if (cw.words.length) {
    const chips = el("div", { class: "hero__words" });
    cw.words.forEach(w => chips.appendChild(
      el("span", { class: "hero__chip" }, `${WORDS[w]?.emoji || ""} ${w}`)
    ));
    hero.appendChild(chips);
  } else {
    hero.appendChild(el("p", { style: "margin: 8px 0; color: var(--ink-soft);" }, "本週為複習 / 考試週，沒有新單字 — 來複習之前的吧！"));
  }
  if (cs) {
    hero.appendChild(el("div", { class: "hero__sentence" },
      el("span", { style: "font-size: 28px;" }, "💬"),
      el("div", {},
        el("div", {}, cs.en),
        el("small", {}, cs.zh)
      )
    ));
  }
  const buttons = el("div", { class: "hero__buttons" });
  if (cw.words.length) {
    buttons.appendChild(el("button", { class: "btn btn--accent", onclick: () => navigate(`#/week/${cw.num}`) }, "📖 練習本週單字"));
  } else {
    buttons.appendChild(el("button", { class: "btn btn--accent", onclick: () => navigate(`#/play/flashcard?set=all`) }, "📖 全部單字複習"));
  }
  buttons.appendChild(el("button", { class: "btn", onclick: () => navigate(`#/sentences`) }, "💬 看每週一句"));
  hero.appendChild(buttons);
  app.appendChild(hero);

  // Mastered progress bar
  app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, "🌟 學習進度"),
    el("div", { class: "progress-bar" },
      el("div", { class: "progress-bar__fill", style: `width: ${pct}%;` })
    ),
    el("div", { style: "text-align: right; margin-top: 6px; font-weight: 700; color: var(--ink-soft);" },
      `已學會 ${masteredCount} / ${totalWords} 個字（${pct}%）`)
  ));

  // Categories
  const catSection = el("section", { class: "section" },
    el("div", { class: "section__title" }, "🎨 依主題複習")
  );
  const catGrid = el("div", { class: "categories" });
  CATEGORIES.forEach(c => {
    catGrid.appendChild(el("button", {
      class: "cat-card",
      style: `background: ${c.color};`,
      onclick: () => navigate(`#/category/${c.id}`)
    },
      el("span", { class: "cat-card__emoji" }, c.emoji),
      el("div", { class: "cat-card__name" }, c.name),
      el("div", { class: "cat-card__name-en" }, c.nameEn),
      el("div", { class: "cat-card__count" }, `${c.words.length} 個字`)
    ));
  });
  catSection.appendChild(catGrid);
  app.appendChild(catSection);

  // Weeks
  const weekSection = el("section", { class: "section" },
    el("div", { class: "section__title" }, "📅 依週次複習")
  );
  const weekGrid = el("div", { class: "weeks" });
  WEEKS.forEach(w => {
    const isCurrent = w.num === cw.num;
    const isExam = !w.words.length;
    weekGrid.appendChild(el("button", {
      class: `week-card ${isCurrent ? "week-card--current" : ""} ${isExam ? "week-card--exam" : ""}`,
      onclick: () => navigate(`#/week/${w.num}`)
    },
      el("div", { class: "week-card__num" }, `第 ${w.num} 週${isCurrent ? " 👈" : ""}`),
      el("div", { class: "week-card__date" }, w.dateRange),
      el("div", { class: "week-card__progress" }, w.progress),
      el("div", { class: "week-card__words" }, w.words.length ? w.words.join(", ") : "—")
    ));
  });
  weekSection.appendChild(weekGrid);
  app.appendChild(weekSection);

  // Sentences shortcut
  app.appendChild(el("section", { class: "section" },
    el("button", { class: "btn btn--xl btn--full", onclick: () => navigate("#/sentences") },
      "💬 每週一句 Sentence of the Week")
  ));

  root.appendChild(app);
  return root;
}

// === 週次/分類詳細頁 ===
function renderListPage(setKey) {
  const words = resolveSet(setKey);
  const label = setLabel(setKey);
  const sentence = setKey.startsWith("week-")
    ? SENTENCES.find(s => s.week === +setKey.slice(5))
    : null;
  const progress = loadProgress();

  const root = el("div", {});
  root.appendChild(renderHeader(label, { back: "#/" }));
  const app = el("main", { class: "app" });

  if (!words.length && !sentence) {
    app.appendChild(el("div", { class: "empty" }, "本週是複習 / 考試週，沒有新單字 — 換一週試試吧！"));
    root.appendChild(app);
    return root;
  }

  if (words.length) {
    app.appendChild(el("section", { class: "section" },
      el("div", { class: "section__title" }, "🎮 練習方式"),
      el("div", { class: "modes" },
        el("button", { class: "btn", onclick: () => navigate(`#/play/flashcard?set=${setKey}`) }, "🃏 單字卡"),
        el("button", { class: "btn btn--accent", onclick: () => navigate(`#/play/quiz?set=${setKey}`) }, "📝 選擇題"),
        el("button", { class: "btn btn--success", onclick: () => navigate(`#/play/listening?set=${setKey}`) }, "👂 聽力"),
        el("button", { class: "btn btn--warn", onclick: () => navigate(`#/play/spelling?set=${setKey}`) }, "✏️ 拼字")
      )
    ));

    const wordSection = el("section", { class: "section" },
      el("div", { class: "section__title" }, `📖 單字（共 ${words.length}）`)
    );
    const list = el("div", { class: "word-list" });
    words.forEach(w => {
      const info = WORDS[w] || { emoji: "❓", zh: "" };
      const r = progress[w];
      list.appendChild(el("div", { class: "word-row" },
        el("span", { class: "word-row__emoji" }, info.emoji),
        el("div", {},
          el("div", { class: "word-row__en" }, w),
          el("div", { class: "word-row__zh" }, info.zh)
        ),
        el("button", {
          class: "icon-btn",
          style: "width: 44px; height: 44px; font-size: 22px; margin-left: auto;",
          onclick: () => speakWord(w),
          "aria-label": `念 ${w}`
        }, "🔊"),
        el("span", { class: "word-row__star", title: r?.mastered ? "已學會" : "" }, r?.mastered ? "⭐" : "")
      ));
    });
    wordSection.appendChild(list);
    app.appendChild(wordSection);
  }

  if (sentence) {
    app.appendChild(el("section", { class: "section" },
      el("div", { class: "section__title" }, "💬 本週一句"),
      el("div", { class: "sentence-card" },
        el("div", { class: "sentence-card__en" }, sentence.en),
        el("div", { class: "sentence-card__zh" }, sentence.zh),
        el("div", { style: "margin-top: 16px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;" },
          el("button", { class: "icon-btn icon-btn--big", onclick: () => speak(sentence.en.replace(/_+/g, "blank")), "aria-label": "念出句子" }, "🔊"),
          el("button", { class: "btn", onclick: () => navigate(`#/play/sentence-card?week=${sentence.week}`) }, "🃏 句卡"),
          sentence.blank
            ? el("button", { class: "btn btn--warn", onclick: () => navigate(`#/play/sentence-blank?week=${sentence.week}`) }, "✏️ 填空")
            : null
        )
      )
    ));
  }

  root.appendChild(app);
  return root;
}

// === Flashcard mode ===
function renderFlashcard(setKey) {
  const words = resolveSet(setKey);
  if (!words.length) return renderEmpty(`#/`, "沒有單字");
  let i = 0;
  let flipped = false;

  const root = el("div", {});
  const header = renderHeader(`🃏 ${setLabel(setKey)}`, { back: setKey.startsWith("week-") ? `#/week/${setKey.slice(5)}` : `#/category/${setKey.slice(9)}` });
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
    el("button", { class: "btn btn--success" }, "✅ 我會了"),
    el("button", { class: "btn btn--ghost" }, "🔁 再練習")
  );
  actions.children[0].addEventListener("click", () => { setMastered(words[i], true); next(); });
  actions.children[1].addEventListener("click", () => { setMastered(words[i], false); next(); });
  app.appendChild(actions);

  function next() {
    if (i < words.length - 1) { i++; render(); }
    else { app.replaceChildren(renderResultBlock("做完一輪了！", "🎉", "重新開始", () => { i = 0; render(); app.replaceWith(rebuild()); })); }
  }
  function rebuild() { return renderFlashcard(setKey); }

  function render() {
    flipped = false;
    card.classList.remove("flipped");
    const w = words[i];
    const info = WORDS[w] || { emoji: "❓", zh: "" };
    front.replaceChildren(
      el("div", { class: "flashcard__emoji" }, info.emoji),
      el("div", { class: "flashcard__en" }, w),
      el("div", { class: "flashcard__hint" }, "點卡片看中文")
    );
    back.replaceChildren(
      el("div", { class: "flashcard__emoji" }, info.emoji),
      el("div", { class: "flashcard__zh" }, info.zh),
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

// === Quiz mode (zh→en) ===
function renderQuiz(setKey) {
  const words = resolveSet(setKey);
  if (words.length < 2) return renderEmpty(`#/`, "單字太少，無法做選擇題");
  const order = shuffle(words);
  let i = 0;
  let score = 0;
  let locked = false;

  const root = el("div", {});
  const header = renderHeader(`📝 ${setLabel(setKey)}`, { back: setKey.startsWith("week-") ? `#/week/${setKey.slice(5)}` : `#/category/${setKey.slice(9)}` });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

  function distractors(correct) {
    const sameCat = Object.entries(WORDS)
      .filter(([w, info]) => w !== correct && info.category === WORDS[correct]?.category)
      .map(([w]) => w);
    const pool = sameCat.length >= 3 ? sameCat : Object.keys(WORDS).filter(w => w !== correct);
    return shuffle(pool).slice(0, 3);
  }

  function render() {
    if (i >= order.length) {
      app.replaceChildren(renderResultBlock(`答對 ${score} / ${order.length}`, score === order.length ? "🌟" : score >= order.length * 0.7 ? "🎉" : "💪", "再來一次", () => navigate(`#/play/quiz?set=${setKey}`)));
      return;
    }
    locked = false;
    const w = order[i];
    const info = WORDS[w] || { emoji: "❓", zh: "" };
    progressLabel.textContent = `${i + 1}/${order.length}・${score}分`;

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
          recordWord(w, true);
          speakWord(w);
        } else {
          btn.classList.add("quiz-option--wrong");
          [...optionsWrap.children].forEach(b => { if (b.textContent === w) b.classList.add("quiz-option--correct"); });
          feedback.textContent = `正確答案：${w}`;
          feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          recordWord(w, false);
          speakWord(w);
        }
        setTimeout(() => { i++; render(); }, 1300);
      });
      optionsWrap.appendChild(btn);
    });

    app.replaceChildren(
      el("div", { class: "quiz-prompt" },
        el("div", { class: "quiz-prompt__emoji" }, info.emoji),
        el("div", { class: "quiz-prompt__zh" }, info.zh),
        el("div", { class: "quiz-prompt__hint" }, "選出正確的英文")
      ),
      optionsWrap,
      feedback
    );
  }
  render();
  return root;
}

// === Listening mode ===
function renderListening(setKey) {
  const words = resolveSet(setKey);
  if (words.length < 2) return renderEmpty(`#/`, "單字太少，無法做聽力題");
  const order = shuffle(words);
  let i = 0;
  let score = 0;
  let locked = false;

  const root = el("div", {});
  const header = renderHeader(`👂 ${setLabel(setKey)}`, { back: setKey.startsWith("week-") ? `#/week/${setKey.slice(5)}` : `#/category/${setKey.slice(9)}` });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

  function distractors(correct) {
    const sameCat = Object.entries(WORDS)
      .filter(([w, info]) => w !== correct && info.category === WORDS[correct]?.category)
      .map(([w]) => w);
    const pool = sameCat.length >= 3 ? sameCat : Object.keys(WORDS).filter(w => w !== correct);
    return shuffle(pool).slice(0, 3);
  }

  function render() {
    if (i >= order.length) {
      app.replaceChildren(renderResultBlock(`答對 ${score} / ${order.length}`, score === order.length ? "🌟" : "🎉", "再來一次", () => navigate(`#/play/listening?set=${setKey}`)));
      return;
    }
    locked = false;
    const w = order[i];
    progressLabel.textContent = `${i + 1}/${order.length}・${score}分`;

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
          recordWord(w, true);
        } else {
          btn.classList.add("quiz-option--wrong");
          [...optionsWrap.children].forEach(b => { if (b.textContent === w) b.classList.add("quiz-option--correct"); });
          feedback.textContent = `正確答案：${w}`;
          feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          recordWord(w, false);
        }
        setTimeout(() => { i++; render(); }, 1300);
      });
      optionsWrap.appendChild(btn);
    });

    app.replaceChildren(
      el("div", { class: "quiz-prompt" },
        el("div", { class: "quiz-prompt__emoji" }, "🎧"),
        el("div", { class: "quiz-prompt__zh", style: "font-size: 22px;" }, "聽聽看，選出正確的英文"),
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
  const order = shuffle(words);
  let i = 0;
  let score = 0;

  const root = el("div", {});
  const header = renderHeader(`✏️ ${setLabel(setKey)}`, { back: setKey.startsWith("week-") ? `#/week/${setKey.slice(5)}` : `#/category/${setKey.slice(9)}` });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

  function render() {
    if (i >= order.length) {
      app.replaceChildren(renderResultBlock(`答對 ${score} / ${order.length}`, score === order.length ? "🌟" : "🎉", "再來一次", () => navigate(`#/play/spelling?set=${setKey}`)));
      return;
    }
    const w = order[i];
    const info = WORDS[w] || { emoji: "❓", zh: "" };
    progressLabel.textContent = `${i + 1}/${order.length}・${score}分`;

    const input = el("input", { class: "spell-input", type: "text", autocomplete: "off", autocapitalize: "none", spellcheck: "false", placeholder: "在這裡輸入英文" });
    const hint = el("div", { class: "spell-hint" }, w.replace(/[a-zA-Z]/g, "_").split("").join(" "));
    let revealed = false;

    const submit = () => {
      const v = input.value.trim().toLowerCase().replace(/\s+/g, " ");
      const correct = w.toLowerCase().replace(/\s+/g, " ");
      if (v === correct) {
        feedback.textContent = "答對了！🎉";
        feedback.className = "quiz-feedback quiz-feedback--correct pop";
        score++;
        recordWord(w, true);
        speakWord(w);
        setTimeout(() => { i++; render(); }, 1100);
      } else if (revealed) {
        feedback.textContent = `正確：${w}`;
        feedback.className = "quiz-feedback quiz-feedback--wrong";
        recordWord(w, false);
        setTimeout(() => { i++; render(); }, 1500);
      } else {
        feedback.textContent = "再試一次！";
        feedback.className = "quiz-feedback quiz-feedback--wrong shake";
        input.classList.add("shake");
        setTimeout(() => input.classList.remove("shake"), 400);
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

    app.replaceChildren(
      el("div", { class: "quiz-prompt" },
        el("div", { class: "quiz-prompt__emoji" }, info.emoji),
        el("div", { class: "quiz-prompt__zh" }, info.zh),
        el("button", { class: "icon-btn icon-btn--big icon-btn--accent", style: "margin-top: 8px;", onclick: () => speakWord(w), "aria-label": "重聽" }, "🔊"),
        el("div", { class: "quiz-prompt__hint" }, `共 ${w.length} 個字元（含空白）`)
      ),
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

// === Sentences overview ===
function renderSentences() {
  const cw = getCurrentWeek();
  const root = el("div", {});
  root.appendChild(renderHeader("💬 每週一句 Sentence of the Week", { back: "#/" }));
  const app = el("main", { class: "app" });

  const list = el("div", { class: "sentence-list" });
  SENTENCES.forEach(s => {
    const isCurrent = s.week === cw.num;
    list.appendChild(el("div", { class: `sentence-row ${isCurrent ? "sentence-row--current" : ""}` },
      el("div", { class: "sentence-row__week" }, `第 ${s.week} 週${isCurrent ? " 👈 本週" : ""}`),
      el("div", { class: "sentence-row__en" }, s.en),
      el("div", { class: "sentence-row__zh" }, s.zh),
      el("div", { style: "display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;" },
        el("button", { class: "icon-btn", style: "width: 44px; height: 44px; font-size: 20px;", onclick: () => speak(s.en.replace(/_+/g, "blank")), "aria-label": "念句子" }, "🔊"),
        el("button", { class: "btn btn--ghost", style: "min-height: 44px; font-size: 16px;", onclick: () => navigate(`#/play/sentence-card?week=${s.week}`) }, "🃏 句卡"),
        s.blank
          ? el("button", { class: "btn btn--ghost", style: "min-height: 44px; font-size: 16px;", onclick: () => navigate(`#/play/sentence-blank?week=${s.week}`) }, "✏️ 填空")
          : null
      )
    ));
  });
  app.appendChild(list);

  app.appendChild(el("div", { style: "margin-top: 16px;" },
    el("button", { class: "btn btn--full btn--xl btn--success", onclick: () => navigate("#/play/sentence-listen?week=all") },
      "👂 全部句子聽力測驗")
  ));

  root.appendChild(app);
  return root;
}

// === Sentence card mode ===
function renderSentenceCard(weekNum) {
  const list = weekNum === "all" ? SENTENCES : SENTENCES.filter(s => s.week === +weekNum);
  if (!list.length) return renderEmpty("#/sentences", "沒有句子");
  let i = 0;
  let flipped = false;

  const root = el("div", {});
  const header = renderHeader("🃏 句卡", { back: "#/sentences" });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

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
    el("button", { class: "icon-btn icon-btn--big icon-btn--accent", "aria-label": "念出句子" }, "🔊"),
    el("button", { class: "icon-btn", "aria-label": "下一張" }, "→")
  );
  controls.children[0].addEventListener("click", e => { e.stopPropagation(); if (i > 0) { i--; render(); } });
  controls.children[1].addEventListener("click", e => { e.stopPropagation(); speak(list[i].en.replace(/_+/g, "blank")); });
  controls.children[2].addEventListener("click", e => { e.stopPropagation(); if (i < list.length - 1) { i++; render(); } });
  app.appendChild(controls);

  function render() {
    flipped = false;
    card.classList.remove("flipped");
    const s = list[i];
    front.replaceChildren(
      el("div", { class: "flashcard__emoji" }, "💬"),
      el("div", { class: "flashcard__en", style: "font-size: 26px; line-height: 1.4;" }, s.en),
      el("div", { class: "flashcard__hint" }, "點卡片看中文")
    );
    back.replaceChildren(
      el("div", { class: "flashcard__emoji" }, "💬"),
      el("div", { class: "flashcard__zh", style: "font-size: 24px; line-height: 1.4;" }, s.zh),
      el("div", { class: "flashcard__hint" }, `第 ${s.week} 週`)
    );
    progressLabel.textContent = `${i + 1}/${list.length}`;
    controls.children[0].disabled = i === 0;
    controls.children[2].disabled = i === list.length - 1;
    setTimeout(() => speak(s.en.replace(/_+/g, "blank")), 200);
  }
  render();
  return root;
}

// === Sentence listening mode (en sentence → pick zh) ===
function renderSentenceListen(weekArg) {
  const pool = weekArg === "all" ? SENTENCES : SENTENCES.filter(s => s.week === +weekArg);
  if (pool.length < 3) return renderEmpty("#/sentences", "句子太少，無法做聽力題");
  const order = shuffle(pool);
  let i = 0;
  let score = 0;
  let locked = false;

  const root = el("div", {});
  const header = renderHeader("👂 句子聽力", { back: "#/sentences" });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

  function render() {
    if (i >= order.length) {
      app.replaceChildren(renderResultBlock(`答對 ${score} / ${order.length}`, score === order.length ? "🌟" : "🎉", "再來一次", () => navigate(`#/play/sentence-listen?week=${weekArg}`)));
      return;
    }
    locked = false;
    const s = order[i];
    progressLabel.textContent = `${i + 1}/${order.length}・${score}分`;

    const distractors = shuffle(SENTENCES.filter(x => x.zh !== s.zh)).slice(0, 2);
    const opts = shuffle([s, ...distractors]);
    const feedback = el("div", { class: "quiz-feedback" }, "");
    const optionsWrap = el("div", { class: "quiz-options", style: "grid-template-columns: 1fr;" });
    opts.forEach(opt => {
      const btn = el("button", { class: "quiz-option", style: "font-size: 18px; min-height: 64px; text-align: left; padding-left: 18px;" }, opt.zh);
      btn.addEventListener("click", () => {
        if (locked) return;
        locked = true;
        if (opt.zh === s.zh) {
          btn.classList.add("quiz-option--correct");
          feedback.textContent = "答對了！🎉";
          feedback.className = "quiz-feedback quiz-feedback--correct pop";
          score++;
        } else {
          btn.classList.add("quiz-option--wrong");
          [...optionsWrap.children].forEach(b => { if (b.textContent === s.zh) b.classList.add("quiz-option--correct"); });
          feedback.textContent = `正確：${s.en}`;
          feedback.className = "quiz-feedback quiz-feedback--wrong shake";
        }
        setTimeout(() => { i++; render(); }, 1500);
      });
      optionsWrap.appendChild(btn);
    });

    app.replaceChildren(
      el("div", { class: "quiz-prompt" },
        el("div", { class: "quiz-prompt__emoji" }, "🎧"),
        el("div", { class: "quiz-prompt__zh", style: "font-size: 22px;" }, "聽聽看，選出正確的中文"),
        el("button", { class: "icon-btn icon-btn--big icon-btn--accent", style: "margin-top: 12px;", onclick: () => speak(s.en.replace(/_+/g, "blank")), "aria-label": "重聽" }, "🔊")
      ),
      optionsWrap,
      feedback
    );
    setTimeout(() => speak(s.en.replace(/_+/g, "blank")), 300);
  }
  render();
  return root;
}

// === Sentence blank fill ===
function renderSentenceBlank(weekNum) {
  const s = SENTENCES.find(x => x.week === +weekNum && x.blank);
  if (!s) return renderEmpty("#/sentences", "這句沒有填空");

  const root = el("div", {});
  root.appendChild(renderHeader("✏️ 填空練習", { back: "#/sentences" }));
  const app = el("main", { class: "app" });
  root.appendChild(app);

  let chosen = null;
  const display = el("div", { class: "sentence-card__en" });
  const renderDisplay = () => {
    display.innerHTML = "";
    const parts = s.en.split(/(_+)/);
    parts.forEach(p => {
      if (/^_+$/.test(p)) {
        display.appendChild(el("span", {
          style: "display: inline-block; min-width: 90px; padding: 2px 10px; margin: 0 4px; background: var(--candy-4); border-radius: 8px; border-bottom: 3px solid var(--warn);"
        }, chosen || "____"));
      } else {
        display.appendChild(document.createTextNode(p));
      }
    });
  };
  renderDisplay();

  const suggest = el("div", { class: "blank-suggest" });
  s.blank.suggest.forEach(word => {
    const b = el("button", {}, word);
    b.addEventListener("click", () => {
      chosen = word;
      [...suggest.children].forEach(x => x.classList.remove("picked"));
      b.classList.add("picked");
      renderDisplay();
      speak(s.en.replace(/_+/g, word));
    });
    suggest.appendChild(b);
  });

  app.appendChild(el("div", { class: "sentence-card" },
    display,
    el("div", { class: "sentence-card__zh" }, s.zh),
    el("div", { style: "margin-top: 8px; font-size: 14px; color: var(--ink-soft);" }, `提示：${s.blank.hint}`),
    el("div", { style: "margin-top: 16px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;" },
      el("button", { class: "icon-btn icon-btn--big icon-btn--accent", onclick: () => speak((chosen ? s.en.replace(/_+/g, chosen) : s.en.replace(/_+/g, "blank"))), "aria-label": "念句子" }, "🔊")
    )
  ));
  app.appendChild(el("div", { class: "section__title" }, "👇 點選一個詞填入"));
  app.appendChild(suggest);

  return root;
}

// === Generic empty / result blocks ===
function renderEmpty(back, msg) {
  const root = el("div", {});
  root.appendChild(renderHeader("沒有資料", { back }));
  root.appendChild(el("main", { class: "app" },
    el("div", { class: "empty" }, msg),
    el("button", { class: "btn btn--full", onclick: () => navigate(back) }, "回上一頁")
  ));
  return root;
}
function renderResultBlock(score, emoji, btnText, onClick) {
  const wrap = el("div", { class: "result pop" },
    el("div", { class: "result__emoji" }, emoji),
    el("div", { class: "result__score" }, score),
    el("div", { class: "result__msg" }, "你好棒！繼續加油 💪"),
    el("div", { style: "display: grid; gap: 10px; max-width: 320px; margin: 0 auto;" },
      el("button", { class: "btn btn--accent", onclick: onClick }, btnText),
      el("button", { class: "btn btn--ghost", onclick: () => navigate("#/") }, "🏠 回首頁")
    )
  );
  return wrap;
}

// === Router ===
function route() {
  const { path, query } = parseHash();
  let view;
  if (path.length === 0) view = renderHome();
  else if (path[0] === "week" && path[1]) view = renderListPage(`week-${path[1]}`);
  else if (path[0] === "category" && path[1]) view = renderListPage(`category-${path[1]}`);
  else if (path[0] === "sentences") view = renderSentences();
  else if (path[0] === "play") {
    const setKey = query.set;
    const week = query.week;
    if (path[1] === "flashcard") view = renderFlashcard(setKey);
    else if (path[1] === "quiz") view = renderQuiz(setKey);
    else if (path[1] === "listening") view = renderListening(setKey);
    else if (path[1] === "spelling") view = renderSpelling(setKey);
    else if (path[1] === "sentence-card") view = renderSentenceCard(week);
    else if (path[1] === "sentence-listen") view = renderSentenceListen(week);
    else if (path[1] === "sentence-blank") view = renderSentenceBlank(week);
    else view = renderHome();
  } else view = renderHome();

  const root = $("#app");
  root.replaceChildren(view);
  window.scrollTo({ top: 0, behavior: "instant" });
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);
// 即時觸發（避免 deferred load 造成首次空白）
if (document.readyState !== "loading") route();
