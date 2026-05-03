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

// === Profile / settings store ===
const STORE_KEY = "partygo:store:v1";
const DEFAULT_STORE = {
  active: null,
  profiles: {},
  settings: { fontScale: 1.0, bopomofo: true, sound: true, focus: false }
};
function loadStore() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (!s) return structuredClone(DEFAULT_STORE);
    s.settings = { ...DEFAULT_STORE.settings, ...(s.settings || {}) };
    s.profiles = s.profiles || {};
    return s;
  } catch { return structuredClone(DEFAULT_STORE); }
}
function saveStore() { localStorage.setItem(STORE_KEY, JSON.stringify(STORE)); }
let STORE = loadStore();

function getProfile() {
  if (!STORE.active || !STORE.profiles[STORE.active]) return null;
  return STORE.profiles[STORE.active];
}
function ensureProfileFields(p) {
  p.progress = p.progress || {};
  p.stars = p.stars || 0;
  p.lastVisit = p.lastVisit || null;
  return p;
}
function createProfile(name) {
  if (!name) return;
  STORE.profiles[name] = ensureProfileFields(STORE.profiles[name] || {});
  STORE.active = name;
  saveStore();
}
function switchProfile(name) {
  if (!STORE.profiles[name]) return;
  STORE.active = name;
  saveStore();
}
function deleteProfile(name) {
  delete STORE.profiles[name];
  if (STORE.active === name) STORE.active = Object.keys(STORE.profiles)[0] || null;
  saveStore();
}

function recordWord(w, hit) {
  const p = getProfile(); if (!p) return;
  const r = p.progress[w] || { seen: 0, correct: 0, wrong: 0, mastered: false };
  r.seen += 1;
  if (hit === true) { r.correct += 1; p.stars = (p.stars || 0) + 1; }
  if (hit === false) r.wrong += 1;
  p.progress[w] = r;
  saveStore();
}
function setMastered(w, val) {
  const p = getProfile(); if (!p) return;
  p.progress[w] = p.progress[w] || { seen: 0, correct: 0, wrong: 0 };
  p.progress[w].mastered = !!val;
  if (val) p.stars = (p.stars || 0) + 1;
  saveStore();
}

// === Apply settings ===
function applySettings() {
  document.documentElement.style.setProperty("--font-scale", STORE.settings.fontScale);
  document.body.classList.toggle("focus", !!STORE.settings.focus);
}

// === 注音 ruby helper ===
function rubyEl(text, bopo, tag = "span", attrs = {}) {
  const node = el(tag, attrs);
  if (!bopo || !STORE.settings.bopomofo) {
    node.textContent = text;
    return node;
  }
  const bopos = bopo.split(/\s+/).filter(Boolean);
  let bi = 0;
  for (const ch of text) {
    if (/[一-鿿]/.test(ch)) {
      const b = bopos[bi++] || "";
      const ruby = document.createElement("ruby");
      ruby.appendChild(document.createTextNode(ch));
      const rt = document.createElement("rt");
      rt.textContent = b;
      ruby.appendChild(rt);
      node.appendChild(ruby);
    } else {
      node.appendChild(document.createTextNode(ch));
    }
  }
  return node;
}
const wordZhEl = (w, tag = "span", attrs = {}) => {
  const info = WORDS[w] || {};
  return rubyEl(info.zh || "", info.bopo || "", tag, attrs);
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

// === 音效 sound effects (Web Audio) ===
let audioCtx;
function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { audioCtx = null; }
  }
  return audioCtx;
}
function tone(freq, dur = 0.15, type = "sine", volume = 0.18) {
  if (!STORE.settings.sound) return;
  const ctx = ensureAudio(); if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur);
}
function dingCorrect() {
  tone(659.25, 0.12); // E5
  setTimeout(() => tone(987.77, 0.18), 110); // B5
}
function buzzWrong() {
  tone(220, 0.18, "sawtooth", 0.12); // A3
}

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
  if (t < WEEKS[0].start) return WEEKS[0];
  if (t > WEEKS[WEEKS.length - 1].end) return WEEKS[WEEKS.length - 1];
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

// === Helpers ===
const weekDateRange = (n) => WEEKS.find(w => w.num === n)?.dateRange || "";
const weekProgress = (n) => WEEKS.find(w => w.num === n)?.progress || "";

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
  if (setKey.startsWith("units-")) {
    const ids = setKey.slice(6).split(",").filter(Boolean);
    const set = new Set();
    ids.forEach(id => {
      const u = UNITS.find(x => x.id === id);
      if (u) u.words.forEach(w => set.add(w));
    });
    return [...set];
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
  if (setKey?.startsWith("units-")) {
    const ids = setKey.slice(6).split(",").filter(Boolean);
    const names = ids.map(id => UNITS.find(x => x.id === id)?.name || id).join(" + ");
    return `📝 自訂考試：${names}`;
  }
  return "全部";
};
const backHashFor = (setKey) => {
  if (setKey?.startsWith("week-")) return `#/week/${setKey.slice(5)}`;
  if (setKey?.startsWith("category-")) return `#/category/${setKey.slice(9)}`;
  if (setKey?.startsWith("units-")) return `#/exam`;
  return "#/";
};

// === Header ===
const renderHeader = (title, { back = "#/", progress = "", streak = null } = {}) => {
  const tools = el("div", { class: "header__tools" },
    el("button", { class: "tool-btn", title: "縮小字", onclick: () => { STORE.settings.fontScale = Math.max(0.8, +(STORE.settings.fontScale - 0.1).toFixed(2)); saveStore(); applySettings(); } }, "A−"),
    el("button", { class: "tool-btn", title: "放大字", onclick: () => { STORE.settings.fontScale = Math.min(1.6, +(STORE.settings.fontScale + 0.1).toFixed(2)); saveStore(); applySettings(); } }, "A+"),
    el("button", { class: `tool-btn ${STORE.settings.bopomofo ? "tool-btn--on" : ""}`, title: "注音", onclick: () => { STORE.settings.bopomofo = !STORE.settings.bopomofo; saveStore(); route(); } }, "ㄅ"),
    el("button", { class: `tool-btn ${STORE.settings.sound ? "tool-btn--on" : ""}`, title: "音效", onclick: () => { STORE.settings.sound = !STORE.settings.sound; saveStore(); route(); } }, "🔊"),
    el("button", { class: `tool-btn ${STORE.settings.focus ? "tool-btn--on" : ""}`, title: "專注模式", onclick: () => { STORE.settings.focus = !STORE.settings.focus; saveStore(); applySettings(); } }, "🎯")
  );
  const left = back
    ? el("button", { class: "header__back", onclick: () => navigate(back), "aria-label": "回上一頁" }, "←")
    : el("div", { class: "header__back", style: "background: var(--accent-soft);" }, "📚");
  const right = el("div", { class: "header__progress" }, progress);
  if (streak != null && streak >= 2) {
    right.appendChild(document.createTextNode(" "));
    const s = el("span", { class: "streak" }, `🔥${streak}`);
    right.appendChild(s);
  }
  return el("header", { class: "header" }, left, el("div", { class: "header__title" }, title), tools, right);
};

// === Profile gate ===
function renderProfileGate() {
  const root = el("div", { class: "profile-gate" });
  const card = el("div", { class: "profile-card" });

  card.appendChild(el("div", { style: "font-size: 56px; line-height: 1;" }, "📚"));
  card.appendChild(el("h1", {}, "歡迎！"));
  card.appendChild(el("p", {}, "輸入你的名字，我會幫你記住你學會的字"));

  const input = el("input", { type: "text", placeholder: "你叫什麼名字？", maxlength: 12 });
  card.appendChild(input);

  const start = () => {
    const name = (input.value || "").trim();
    if (!name) return;
    createProfile(name);
    location.hash = "#/";
    route();
  };
  input.addEventListener("keydown", e => { if (e.key === "Enter") start(); });
  card.appendChild(el("button", { class: "btn btn--accent btn--full", style: "margin-top: 14px;", onclick: start }, "開始學習！"));

  const existing = Object.keys(STORE.profiles);
  if (existing.length) {
    card.appendChild(el("div", { style: "margin-top: 18px; font-weight: 700; color: var(--ink-soft);" }, "或選之前的人："));
    const list = el("div", { class: "profile-list" });
    existing.forEach(name => {
      const p = STORE.profiles[name];
      list.appendChild(el("div", { class: "profile-pill" },
        el("span", {}, "👤"),
        el("span", {}, name),
        el("span", { style: "font-size: 14px; color: var(--ink-soft);" }, `⭐${p.stars || 0}`),
        el("button", { onclick: () => { switchProfile(name); location.hash = "#/"; route(); } }, "選這個"),
        el("button", { onclick: () => { if (confirm(`刪除 ${name} 的進度？`)) { deleteProfile(name); route(); } } }, "刪")
      ));
    });
    card.appendChild(list);
  }
  setTimeout(() => input.focus(), 100);
  root.appendChild(card);
  return root;
}

// === Home ===
function renderHome() {
  const profile = getProfile();
  const cw = getCurrentWeek();
  const cs = SENTENCES.find(s => s.week === cw.num);
  const masteredCount = profile ? Object.values(profile.progress).filter(p => p.mastered).length : 0;
  const totalWords = Object.keys(WORDS).length;
  const pct = Math.round((masteredCount / totalWords) * 100);

  const root = el("div", {});
  root.appendChild(renderHeader(`Hi ${profile?.name || STORE.active || "👤"}`, { back: null }));

  const app = el("main", { class: "app" });

  // Star jar + name chip
  app.appendChild(el("div", { style: "display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 14px;" },
    el("div", { class: "user-chip" }, "👤", STORE.active || ""),
    el("button", { class: "tool-btn", title: "切換使用者", style: "background: var(--candy-5);", onclick: () => { location.hash = "#/profile"; route(); } }, "↻"),
    el("div", { class: "star-jar", style: "flex: 1;" },
      el("span", { class: "star-jar__icon" }, "⭐"),
      el("div", {},
        el("div", { class: "star-jar__count" }, `${profile?.stars || 0} 顆星`),
        el("div", { class: "star-jar__label" }, "答對 / 練熟一個字 +1")
      )
    )
  ));

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
    cw.words.forEach(w => {
      const chip = el("span", { class: "hero__chip" });
      chip.appendChild(document.createTextNode(`${WORDS[w]?.emoji || ""} ${w} `));
      chip.appendChild(wordZhEl(w, "span", { style: "color: var(--ink-soft); font-weight: 500;" }));
      chips.appendChild(chip);
    });
    hero.appendChild(chips);
  } else {
    hero.appendChild(el("p", { style: "margin: 8px 0; color: var(--ink-soft);" }, "本週為複習 / 考試週，沒有新單字 — 來複習之前的吧！"));
  }
  if (cs) {
    const sentenceBox = el("div", {});
    sentenceBox.appendChild(el("div", { style: "font-size: calc(13px * var(--font-scale)); color: var(--ink-soft); font-weight: 500;" },
      `第 ${cs.week} 週・${weekDateRange(cs.week)} 每週一句`));
    sentenceBox.appendChild(el("div", {}, cs.en));
    sentenceBox.appendChild(rubyEl(cs.zh, cs.bopo, "small"));
    hero.appendChild(el("div", { class: "hero__sentence" },
      el("span", { style: "font-size: 28px;" }, "💬"),
      sentenceBox
    ));
  }
  const buttons = el("div", { class: "hero__buttons" });
  if (cw.words.length) {
    buttons.appendChild(el("button", { class: "btn btn--accent", onclick: () => navigate(`#/week/${cw.num}`) }, "📖 練習本週"));
  } else {
    buttons.appendChild(el("button", { class: "btn btn--accent", onclick: () => navigate(`#/play/flashcard?set=all`) }, "📖 全部複習"));
  }
  buttons.appendChild(el("button", { class: "btn", onclick: () => navigate(`#/exam`) }, "📝 自選考試"));
  hero.appendChild(buttons);
  app.appendChild(hero);

  // Mastered progress bar
  app.appendChild(el("section", { class: "section section--hide-on-focus" },
    el("div", { class: "section__title" }, "🌟 學習進度"),
    el("div", { class: "progress-bar" },
      el("div", { class: "progress-bar__fill", style: `width: ${pct}%;` })
    ),
    el("div", { style: "text-align: right; margin-top: 6px; font-weight: 700; color: var(--ink-soft);" },
      `已學會 ${masteredCount} / ${totalWords} 個字（${pct}%）`)
  ));

  // Categories
  const catSection = el("section", { class: "section section--hide-on-focus" },
    el("div", { class: "section__title" }, "🎨 依主題複習")
  );
  const catGrid = el("div", { class: "categories" });
  CATEGORIES.forEach(c => {
    const card = el("button", {
      class: "cat-card",
      style: `background: ${c.color};`,
      onclick: () => navigate(`#/category/${c.id}`)
    });
    card.appendChild(el("span", { class: "cat-card__emoji" }, c.emoji));
    card.appendChild(rubyEl(c.name, c.bopo, "div", { class: "cat-card__name" }));
    card.appendChild(el("div", { class: "cat-card__name-en" }, c.nameEn));
    card.appendChild(el("div", { class: "cat-card__count" }, `${c.words.length} 個字`));
    catGrid.appendChild(card);
  });
  catSection.appendChild(catGrid);
  app.appendChild(catSection);

  // Weeks
  const weekSection = el("section", { class: "section section--hide-on-focus" },
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
  app.appendChild(el("section", { class: "section section--hide-on-focus" },
    el("button", { class: "btn btn--full btn--xl", onclick: () => navigate("#/sentences") },
      "💬 每週一句 Sentence of the Week")
  ));

  return root;
}

// === Profile manager page ===
function renderProfilePage() {
  const root = el("div", {});
  root.appendChild(renderHeader("👥 切換使用者", { back: "#/" }));
  const app = el("main", { class: "app" });
  const card = el("div", { class: "profile-card" });
  card.appendChild(el("h1", {}, "誰要學英文？"));

  const list = el("div", { class: "profile-list" });
  Object.keys(STORE.profiles).forEach(name => {
    const p = STORE.profiles[name];
    list.appendChild(el("div", { class: "profile-pill" },
      el("span", {}, "👤"),
      el("span", {}, name),
      el("span", { style: "font-size: 14px; color: var(--ink-soft);" }, `⭐${p.stars || 0}`),
      el("button", { onclick: () => { switchProfile(name); navigate("#/"); } }, "選這個"),
      el("button", { onclick: () => { if (confirm(`刪除 ${name} 的所有進度？`)) { deleteProfile(name); route(); } } }, "刪")
    ));
  });
  card.appendChild(list);

  const input = el("input", { type: "text", placeholder: "新增名字", maxlength: 12, style: "margin-top: 16px;" });
  const add = () => {
    const name = (input.value || "").trim();
    if (!name) return;
    createProfile(name);
    navigate("#/");
  };
  input.addEventListener("keydown", e => { if (e.key === "Enter") add(); });
  card.appendChild(input);
  card.appendChild(el("button", { class: "btn btn--accent btn--full", style: "margin-top: 10px;", onclick: add }, "新增使用者"));

  app.appendChild(card);
  root.appendChild(app);
  return root;
}

// === Week / Category page ===
function renderListPage(setKey) {
  const words = resolveSet(setKey);
  const label = setLabel(setKey);
  const sentence = setKey.startsWith("week-")
    ? SENTENCES.find(s => s.week === +setKey.slice(5))
    : null;
  const profile = getProfile();
  const progress = profile?.progress || {};

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
        el("button", { class: "btn btn--warn", onclick: () => navigate(`#/play/spelling?set=${setKey}`) }, "✏️ 拼字"),
        el("button", { class: "btn btn--danger", onclick: () => navigate(`#/play/handwrite?set=${setKey}`) }, "✍️ 手寫")
      )
    ));

    const wordSection = el("section", { class: "section" },
      el("div", { class: "section__title" }, `📖 單字（共 ${words.length}）`)
    );
    const list = el("div", { class: "word-list" });
    words.forEach(w => {
      const info = WORDS[w] || { emoji: "❓", zh: "", bopo: "" };
      const r = progress[w];
      const row = el("div", { class: "word-row" });
      row.appendChild(el("span", { class: "word-row__emoji" }, info.emoji));
      const text = el("div", {});
      text.appendChild(el("div", { class: "word-row__en" }, w));
      text.appendChild(rubyEl(info.zh || "", info.bopo || "", "div", { class: "word-row__zh" }));
      row.appendChild(text);
      row.appendChild(el("button", {
        class: "icon-btn",
        style: "width: 44px; height: 44px; font-size: 22px; margin-left: auto;",
        onclick: () => speakWord(w),
        "aria-label": `念 ${w}`
      }, "🔊"));
      row.appendChild(el("span", { class: "word-row__star" }, r?.mastered ? "⭐" : ""));
      list.appendChild(row);
    });
    wordSection.appendChild(list);
    app.appendChild(wordSection);
  }

  if (sentence) {
    const sentenceCard = el("div", { class: "sentence-card" });
    sentenceCard.appendChild(el("div", { style: "font-size: calc(13px * var(--font-scale)); color: var(--ink-soft); font-weight: 600; margin-bottom: 6px;" },
      `第 ${sentence.week} 週・${weekDateRange(sentence.week)}`));
    sentenceCard.appendChild(el("div", { class: "sentence-card__en" }, sentence.en));
    sentenceCard.appendChild(rubyEl(sentence.zh, sentence.bopo, "div", { class: "sentence-card__zh" }));
    sentenceCard.appendChild(el("div", { style: "margin-top: 16px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;" },
      el("button", { class: "icon-btn icon-btn--big", onclick: () => speak(sentence.en.replace(/_+/g, "blank")), "aria-label": "念出句子" }, "🔊"),
      el("button", { class: "btn", onclick: () => navigate(`#/play/sentence-card?week=${sentence.week}`) }, "🃏 句卡"),
      sentence.blank
        ? el("button", { class: "btn btn--warn", onclick: () => navigate(`#/play/sentence-blank?week=${sentence.week}`) }, "✏️ 填空")
        : null
    ));
    app.appendChild(el("section", { class: "section" },
      el("div", { class: "section__title" }, `💬 第 ${sentence.week} 週每週一句`),
      sentenceCard
    ));
  }

  root.appendChild(app);
  return root;
}

// === Custom exam page ===
function renderExam() {
  const root = el("div", {});
  root.appendChild(renderHeader("📝 自選考試 Custom Exam", { back: "#/" }));
  const app = el("main", { class: "app" });

  app.appendChild(el("p", { style: "color: var(--ink-soft); font-size: calc(15px * var(--font-scale)); margin: 4px 0 12px;" },
    "勾選想考的單元（可以多選），然後選練習方式。"));

  const selected = new Set();
  const grid = el("div", { class: "unit-pick" });
  UNITS.forEach(u => {
    const item = el("button", { class: "unit-pick__item", style: `background: ${u.color};` });
    const name = el("div", { class: "unit-pick__name" });
    name.appendChild(el("span", { class: "unit-pick__emoji" }, u.emoji));
    name.appendChild(document.createTextNode(u.name));
    item.appendChild(name);
    item.appendChild(el("div", { class: "unit-pick__count" }, `${u.words.length} 個字`));
    item.addEventListener("click", () => {
      if (selected.has(u.id)) { selected.delete(u.id); item.classList.remove("checked"); }
      else { selected.add(u.id); item.classList.add("checked"); }
      updateBar();
    });
    grid.appendChild(item);
  });
  app.appendChild(grid);

  const bar = el("div", { class: "section", style: "position: sticky; bottom: 8px; background: var(--bg); padding: 12px; border-radius: var(--radius-lg); box-shadow: var(--shadow);" });
  const status = el("div", { style: "font-weight: 800; margin-bottom: 8px;" });
  bar.appendChild(status);
  const modeRow = el("div", { class: "exam-options", style: "margin-bottom: 8px;" });
  ["📝 選擇題", "👂 聽力", "✏️ 拼字", "✍️ 手寫"].forEach((label, i) => {
    const btn = el("button", { onclick: () => start(["quiz","listening","spelling","handwrite"][i]) }, label);
    modeRow.appendChild(btn);
  });
  bar.appendChild(modeRow);

  const updateBar = () => {
    const total = [...selected].reduce((s, id) => s + (UNITS.find(u => u.id === id)?.words.length || 0), 0);
    const dedupe = new Set();
    [...selected].forEach(id => UNITS.find(u => u.id === id)?.words.forEach(w => dedupe.add(w)));
    status.textContent = selected.size
      ? `選了 ${selected.size} 個單元・${dedupe.size} 個不同的字`
      : "請至少選 1 個單元";
  };
  const start = (mode) => {
    if (!selected.size) { alert("請先選至少 1 個單元"); return; }
    const setKey = "units-" + [...selected].join(",");
    navigate(`#/play/${mode}?set=${setKey}`);
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
    el("div", { class: "overlay__text" }, item.text),
    el("div", { class: "overlay__count" }, `${secs} 秒後繼續`),
    el("button", { class: "btn btn--accent btn--full", onclick: () => { clearInterval(timer); document.body.removeChild(overlay); onClose && onClose(); } }, "好了，繼續 →")
  );
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  const timer = setInterval(() => {
    secs--;
    card.children[2].textContent = secs > 0 ? `${secs} 秒後繼續` : "繼續～";
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
    el("button", { class: "btn btn--success" }, "✅ 我會了"),
    el("button", { class: "btn btn--ghost" }, "🔁 再練習")
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
      el("div", { class: "flashcard__hint" }, "點卡片看中文")
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

// === Handwriting mode (canvas trace) ===
function setupCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.floor(r.width * dpr);
    canvas.height = Math.floor(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#3b3a4a";
  };
  resize();
  let drawing = false, lastX = 0, lastY = 0;
  const point = e => {
    const r = canvas.getBoundingClientRect();
    const t = e.touches?.[0] || e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };
  const down = e => { e.preventDefault(); drawing = true; const p = point(e); lastX = p.x; lastY = p.y; };
  const move = e => {
    if (!drawing) return;
    e.preventDefault();
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x; lastY = p.y;
  };
  const up = () => { drawing = false; };
  canvas.addEventListener("mousedown", down);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
  canvas.addEventListener("touchstart", down, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", up);
  return {
    clear: () => { const r = canvas.getBoundingClientRect(); ctx.clearRect(0, 0, r.width, r.height); },
    resize
  };
}

function renderHandwrite(setKey) {
  const words = resolveSet(setKey);
  if (!words.length) return renderEmpty(`#/`, "沒有單字");
  const queue = withSpacedRepetition(words);
  const total = words.length;
  let i = 0, doneCount = 0, streak = 0;

  const root = el("div", {});
  const header = renderHeader(`✍️ ${setLabel(setKey)}`, { back: backHashFor(setKey) });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

  function render() {
    if (i >= queue.length) {
      app.replaceChildren(renderResultBlock(`寫完 ${doneCount} / ${total} 個字！`, "🌟", "再寫一次", () => navigate(`#/play/handwrite?set=${setKey}`)));
      return;
    }
    const w = queue[i];
    const info = WORDS[w] || { emoji: "❓", zh: "", bopo: "" };
    progressLabel.textContent = `${i + 1}/${queue.length}`;

    const promptCard = el("div", { class: "write-card" });
    const promptRow = el("div", { class: "write-prompt" });
    promptRow.appendChild(document.createTextNode(`${info.emoji} `));
    promptRow.appendChild(rubyEl(info.zh || "", info.bopo || "", "span"));
    promptCard.appendChild(promptRow);
    promptCard.appendChild(el("div", { style: "color: var(--ink-soft); font-size: calc(14px * var(--font-scale)); margin-bottom: 8px;" }, "用手指描寫底下的字 ✍️"));
    promptCard.appendChild(el("button", { class: "icon-btn icon-btn--big icon-btn--accent", onclick: () => speakWord(w), "aria-label": "念出" }, "🔊"));

    const wrap = el("div", { class: "write-canvas-wrap" });
    const canvas = el("canvas", { class: "write-canvas" });
    const guideClass = w.length > 7 ? "write-guide write-guide--small" : "write-guide";
    const guide = el("div", { class: guideClass }, w);
    wrap.appendChild(guide);
    wrap.appendChild(canvas);
    promptCard.appendChild(wrap);

    const actions = el("div", { class: "write-actions" });
    const clearBtn = el("button", { class: "btn btn--ghost" }, "🧹 清除重寫");
    const doneBtn = el("button", { class: "btn btn--success" }, "✅ 寫好了！");
    actions.appendChild(clearBtn);
    actions.appendChild(doneBtn);
    promptCard.appendChild(actions);

    app.replaceChildren(promptCard);
    const pen = setupCanvas(canvas);
    clearBtn.addEventListener("click", () => pen.clear());
    doneBtn.addEventListener("click", () => {
      doneCount++; streak++;
      setMastered(w, true);
      dingCorrect();
      speakWord(w);
      setTimeout(() => maybeMovementBreak(streak, () => { i++; render(); }), 800);
    });
    setTimeout(() => { pen.resize(); speakWord(w); }, 100);
  }
  render();
  return root;
}

// === Sentences overview ===
function renderSentences() {
  const cw = getCurrentWeek();
  const root = el("div", {});
  root.appendChild(renderHeader("💬 每週一句", { back: "#/" }));
  const app = el("main", { class: "app" });

  const list = el("div", { class: "sentence-list" });
  SENTENCES.forEach(s => {
    const isCurrent = s.week === cw.num;
    const dr = weekDateRange(s.week);
    const wp = weekProgress(s.week);
    const row = el("div", { class: `sentence-row ${isCurrent ? "sentence-row--current" : ""}` });
    row.appendChild(el("div", { class: "sentence-row__week" },
      `第 ${s.week} 週・${dr}${wp ? "・" + wp : ""}${isCurrent ? " 👈 本週" : ""}`));
    row.appendChild(el("div", { class: "sentence-row__en" }, s.en));
    row.appendChild(rubyEl(s.zh, s.bopo, "div", { class: "sentence-row__zh" }));
    row.appendChild(el("div", { style: "display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;" },
      el("button", { class: "icon-btn", style: "width: 44px; height: 44px; font-size: 20px;", onclick: () => speak(s.en.replace(/_+/g, "blank")), "aria-label": "念句子" }, "🔊"),
      el("button", { class: "btn btn--ghost", style: "min-height: 44px; font-size: calc(16px * var(--font-scale));", onclick: () => navigate(`#/play/sentence-card?week=${s.week}`) }, "🃏 句卡"),
      s.blank
        ? el("button", { class: "btn btn--ghost", style: "min-height: 44px; font-size: calc(16px * var(--font-scale));", onclick: () => navigate(`#/play/sentence-blank?week=${s.week}`) }, "✏️ 填空")
        : null
    ));
    list.appendChild(row);
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
  let i = 0, flipped = false;

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
      el("div", { class: "flashcard__en", style: "font-size: calc(28px * var(--font-scale)); line-height: 1.4;" }, s.en),
      el("div", { class: "flashcard__hint" }, "點卡片看中文")
    );
    back.replaceChildren(
      el("div", { class: "flashcard__emoji" }, "💬"),
      rubyEl(s.zh, s.bopo, "div", { class: "flashcard__zh", style: "font-size: calc(26px * var(--font-scale)); line-height: 1.4;" }),
      el("div", { class: "flashcard__hint" }, `第 ${s.week} 週・${weekDateRange(s.week)}`)
    );
    progressLabel.textContent = `${i + 1}/${list.length}`;
    controls.children[0].disabled = i === 0;
    controls.children[2].disabled = i === list.length - 1;
    setTimeout(() => speak(s.en.replace(/_+/g, "blank")), 200);
  }
  render();
  return root;
}

// === Sentence listening mode ===
function renderSentenceListen(weekArg) {
  const pool = weekArg === "all" ? SENTENCES : SENTENCES.filter(s => s.week === +weekArg);
  if (pool.length < 3) return renderEmpty("#/sentences", "句子太少，無法做聽力題");
  const order = shuffle(pool);
  let i = 0, score = 0, streak = 0, locked = false;

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

    const distractorsZ = shuffle(SENTENCES.filter(x => x.zh !== s.zh)).slice(0, 2);
    const opts = shuffle([s, ...distractorsZ]);
    const feedback = el("div", { class: "quiz-feedback" }, "");
    const optionsWrap = el("div", { class: "quiz-options", style: "grid-template-columns: 1fr;" });
    opts.forEach(opt => {
      const btn = el("button", { class: "quiz-option", style: "font-size: calc(20px * var(--font-scale)); min-height: 64px; text-align: left; padding-left: 18px;" });
      btn.appendChild(rubyEl(opt.zh, opt.bopo, "span"));
      btn.addEventListener("click", () => {
        if (locked) return;
        locked = true;
        if (opt.zh === s.zh) {
          btn.classList.add("quiz-option--correct");
          feedback.textContent = "答對了！🎉";
          feedback.className = "quiz-feedback quiz-feedback--correct pop";
          score++; streak++;
          dingCorrect();
        } else {
          btn.classList.add("quiz-option--wrong");
          [...optionsWrap.children].forEach(b => { if (b.textContent === s.zh) b.classList.add("quiz-option--correct"); });
          feedback.textContent = `正確：${s.en}`;
          feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          streak = 0;
          buzzWrong();
        }
        setTimeout(() => maybeMovementBreak(streak, () => { i++; render(); }), 1500);
      });
      optionsWrap.appendChild(btn);
    });

    app.replaceChildren(
      el("div", { class: "quiz-prompt" },
        el("div", { class: "quiz-prompt__emoji" }, "🎧"),
        el("div", { class: "quiz-prompt__zh", style: "font-size: calc(24px * var(--font-scale));" }, "聽聽看，選出正確的中文"),
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
      dingCorrect();
      speak(s.en.replace(/_+/g, word));
    });
    suggest.appendChild(b);
  });

  const sCard = el("div", { class: "sentence-card" });
  sCard.appendChild(display);
  sCard.appendChild(rubyEl(s.zh, s.bopo, "div", { class: "sentence-card__zh" }));
  sCard.appendChild(el("div", { style: "margin-top: 8px; font-size: calc(14px * var(--font-scale)); color: var(--ink-soft);" }, `提示：${s.blank.hint}`));
  sCard.appendChild(el("div", { style: "margin-top: 16px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;" },
    el("button", { class: "icon-btn icon-btn--big icon-btn--accent", onclick: () => speak((chosen ? s.en.replace(/_+/g, chosen) : s.en.replace(/_+/g, "blank"))), "aria-label": "念句子" }, "🔊")
  ));
  app.appendChild(sCard);
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
  return el("div", { class: "result pop" },
    el("div", { class: "result__emoji" }, emoji),
    el("div", { class: "result__score" }, score),
    el("div", { class: "result__msg" }, "你好棒！繼續加油 💪"),
    el("div", { style: "display: grid; gap: 10px; max-width: 320px; margin: 0 auto;" },
      el("button", { class: "btn btn--accent", onclick: onClick }, btnText),
      el("button", { class: "btn btn--ghost", onclick: () => navigate("#/") }, "🏠 回首頁")
    )
  );
}

// === Router ===
function route() {
  applySettings();
  // Profile gate first
  if (!STORE.active && location.hash !== "#/profile") {
    const root = $("#app");
    root.replaceChildren(renderProfileGate());
    return;
  }
  const { path, query } = parseHash();
  let view;
  if (path.length === 0) view = renderHome();
  else if (path[0] === "profile") view = renderProfilePage();
  else if (path[0] === "exam") view = renderExam();
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
    else if (path[1] === "handwrite") view = renderHandwrite(setKey);
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
if (document.readyState !== "loading") route();
