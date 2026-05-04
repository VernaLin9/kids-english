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
  settings: { fontScale: 1.0, bopomofo: true, sound: true, focus: false, parentPin: "" }
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
  p.sessions = p.sessions || [];
  return p;
}
function recordSession(mode, setKey, score, total) {
  const p = getProfile(); if (!p) return;
  p.sessions = p.sessions || [];
  p.sessions.push({
    date: new Date().toISOString(),
    mode, setKey,
    score: score || 0,
    total: total || 0,
  });
  if (p.sessions.length > 50) p.sessions = p.sessions.slice(-50);
  saveStore();
}
function touchProfileVisit() {
  const p = getProfile(); if (!p) return;
  p.lastVisit = new Date().toISOString();
  saveStore();
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
// rubyEl(text, bopo?, tag?, attrs?) — 把中文字串包成帶 <ruby><rt> 的 DOM 節點
// - 有 bopo（空白分隔每個漢字一段）→ 使用人工標注（精準，處理多音字）
// - 沒給 bopo → 自動逐字查 CHAR_BOPO
// - STORE.settings.bopomofo = false → 不顯示注音，僅純文字
// - 注音直書放在每個漢字右側；聲調符號（ˊˇˋ˙）獨立放在右上角
function rubyEl(text, bopo, tag = "span", attrs = {}) {
  const node = el(tag, attrs);
  if (!STORE.settings.bopomofo) {
    node.textContent = text;
    return node;
  }
  const explicit = bopo ? bopo.split(/\s+/).filter(Boolean) : null;
  let bi = 0;
  const TONE_RE = /[ˊˇˋ˙]/;
  for (const ch of text) {
    if (/[一-鿿]/.test(ch)) {
      const reading = explicit ? (explicit[bi++] || "") : ((typeof CHAR_BOPO !== "undefined" ? CHAR_BOPO[ch] : "") || "");
      const ruby = document.createElement("ruby");
      ruby.appendChild(document.createTextNode(ch));
      const rt = document.createElement("rt");
      // 拆出聲調符號獨立放
      let tone = "";
      let bare = reading;
      const m = reading.match(TONE_RE);
      if (m) { tone = m[0]; bare = reading.replace(TONE_RE, ""); }
      // 注音字元逐個 span（直書堆疊用 CSS）
      for (const c of bare) {
        const s = document.createElement("span");
        s.className = "bopo-char";
        s.textContent = c;
        rt.appendChild(s);
      }
      if (tone) {
        const tn = document.createElement("span");
        tn.className = "bopo-tone";
        tn.textContent = tone;
        rt.appendChild(tn);
      }
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
// 介面文字快捷：自動逐字注音
const t = (text, attrs = {}) => rubyEl(text, null, "span", attrs);

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
  if (setKey.startsWith("weeks-")) {
    const nums = setKey.slice(6).split(",").map(x => +x).filter(n => !isNaN(n));
    const set = new Set();
    nums.forEach(n => {
      const wk = WEEKS.find(x => x.num === n);
      if (wk) wk.words.forEach(w => set.add(w));
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
  if (setKey?.startsWith("weeks-")) {
    const nums = setKey.slice(6).split(",").filter(Boolean);
    return `📝 自訂考試：第 ${nums.join("、")} 週`;
  }
  return "全部";
};
const backHashFor = (setKey) => {
  if (setKey?.startsWith("week-")) return `#/week/${setKey.slice(5)}`;
  if (setKey?.startsWith("category-")) return `#/category/${setKey.slice(9)}`;
  if (setKey?.startsWith("units-")) return `#/exam`;
  if (setKey?.startsWith("weeks-")) return `#/exam`;
  return "#/";
};

// === Header ===
const renderHeader = (title, { back = "#/", progress = "", streak = null } = {}) => {
  const tools = el("div", { class: "header__tools" },
    el("button", { class: "tool-btn", title: "縮小字", onclick: () => { STORE.settings.fontScale = Math.max(0.8, +(STORE.settings.fontScale - 0.1).toFixed(2)); saveStore(); applySettings(); } }, "A−"),
    el("button", { class: "tool-btn", title: "放大字", onclick: () => { STORE.settings.fontScale = Math.min(1.6, +(STORE.settings.fontScale + 0.1).toFixed(2)); saveStore(); applySettings(); } }, "A+"),
    el("button", { class: `tool-btn ${STORE.settings.bopomofo ? "tool-btn--on" : ""}`, title: "注音", onclick: () => { STORE.settings.bopomofo = !STORE.settings.bopomofo; saveStore(); route(); } }, "ㄅ"),
    el("button", { class: `tool-btn ${STORE.settings.sound ? "tool-btn--on" : ""}`, title: "音效", onclick: () => { STORE.settings.sound = !STORE.settings.sound; saveStore(); route(); } }, "🔊"),
    el("button", { class: `tool-btn ${STORE.settings.focus ? "tool-btn--on" : ""}`, title: "專注模式", onclick: () => { STORE.settings.focus = !STORE.settings.focus; saveStore(); applySettings(); } }, "🎯"),
    el("button", { class: "tool-btn", title: "家長模式", style: "background: var(--candy-5);", onclick: () => navigate("#/parent") }, "👪")
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
  card.appendChild(rubyEl("請選擇模式", null, "p"));

  // 兩個大按鈕：兒童 / 家長（上下排，全寬）
  const modeBtns = el("div", { style: "display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 8px; margin-bottom: 16px;" });
  const childBtn = el("button", { class: "btn btn--accent btn--xl btn--full", style: "min-height: 80px; gap: 14px; padding: 12px 18px; white-space: nowrap;" });
  childBtn.appendChild(el("span", { style: "font-size: 36px; line-height: 1; flex: 0 0 auto;" }, "👶"));
  childBtn.appendChild(rubyEl("兒童模式", null, "span", { style: "white-space: nowrap;" }));
  const parentBtn = el("button", { class: "btn btn--xl btn--full", style: "background: var(--candy-5); color: var(--ink); min-height: 80px; gap: 14px; padding: 12px 18px; white-space: nowrap;" });
  parentBtn.appendChild(el("span", { style: "font-size: 36px; line-height: 1; flex: 0 0 auto;" }, "👪"));
  parentBtn.appendChild(rubyEl("家長模式", null, "span", { style: "white-space: nowrap;" }));
  modeBtns.appendChild(childBtn);
  modeBtns.appendChild(parentBtn);
  card.appendChild(modeBtns);

  // 兒童模式區塊
  const childPanel = el("div", { style: "display: none;" });
  childPanel.appendChild(rubyEl("選擇要學習的小孩", null, "div", { style: "font-weight: 700; color: var(--ink-soft); margin-bottom: 10px;" }));

  const existing = Object.keys(STORE.profiles);
  if (existing.length) {
    const list = el("div", { class: "profile-list" });
    existing.forEach(name => {
      const p = STORE.profiles[name];
      const pill = el("div", { class: "profile-pill" });
      pill.appendChild(el("span", {}, "👤"));
      pill.appendChild(el("span", {}, name));
      pill.appendChild(el("span", { style: "font-size: 14px; color: var(--ink-soft);" }, `⭐${p.stars || 0}`));
      const pickBtn = el("button", { onclick: () => { switchProfile(name); location.hash = "#/"; route(); } });
      pickBtn.appendChild(t("選這個"));
      pill.appendChild(pickBtn);
      const delBtn = el("button", {
        onclick: () => { if (confirm(`刪除 ${name} 的進度？`)) { deleteProfile(name); route(); } }
      });
      delBtn.appendChild(t("刪"));
      pill.appendChild(delBtn);
      list.appendChild(pill);
    });
    childPanel.appendChild(list);
    childPanel.appendChild(rubyEl("或新增小孩：", null, "div", { style: "margin-top: 14px; font-weight: 700; color: var(--ink-soft);" }));
  }

  const input = el("input", { type: "text", placeholder: "你叫什麼名字？", maxlength: 12 });
  childPanel.appendChild(input);
  const start = () => {
    const name = (input.value || "").trim();
    if (!name) return;
    createProfile(name);
    location.hash = "#/";
    route();
  };
  input.addEventListener("keydown", e => { if (e.key === "Enter") start(); });
  const startBtn = el("button", { class: "btn btn--accent btn--full", style: "margin-top: 10px;", onclick: start });
  startBtn.appendChild(t("✨ 開始學習！"));
  childPanel.appendChild(startBtn);
  card.appendChild(childPanel);

  // 切換顯示
  childBtn.addEventListener("click", () => {
    childPanel.style.display = "";
    childBtn.classList.add("btn--accent");
    parentBtn.classList.remove("btn--accent");
    setTimeout(() => input.focus(), 80);
  });
  parentBtn.addEventListener("click", () => {
    location.hash = "#/parent";
  });

  // 預設顯示兒童模式（多數情境用兒童居多）
  childPanel.style.display = "";

  // QR code — 給其他手機也能掃進來
  const qrSection = el("div", { style: "margin-top: 22px; padding-top: 16px; border-top: 2px dashed var(--primary-soft); text-align: center;" });
  qrSection.appendChild(rubyEl("用其他手機掃這個就能進", null, "div", { style: "font-size: 13px; color: var(--ink-soft); margin-bottom: 8px;" }));
  const qrUrl = location.origin + location.pathname;
  const qrImg = el("img", {
    src: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(qrUrl)}`,
    alt: "QR code",
    width: 180,
    height: 180,
    style: "border-radius: 12px; box-shadow: 0 2px 0 rgba(0,0,0,0.08);"
  });
  qrSection.appendChild(qrImg);
  qrSection.appendChild(el("div", { style: "font-size: 11px; color: var(--ink-soft); margin-top: 6px; word-break: break-all;" }, qrUrl));
  card.appendChild(qrSection);

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
    buttons.appendChild(el("button", { class: "btn btn--accent", onclick: () => navigate(`#/week/${cw.num}`) }, t("📖 練習本週")));
  } else {
    buttons.appendChild(el("button", { class: "btn btn--accent", onclick: () => navigate(`#/play/flashcard?set=all`) }, t("📖 全部複習")));
  }
  buttons.appendChild(el("button", { class: "btn", onclick: () => navigate(`#/exam`) }, t("📝 自選考試")));
  hero.appendChild(buttons);
  app.appendChild(hero);

  // Mastered progress bar
  app.appendChild(el("section", { class: "section section--hide-on-focus" },
    el("div", { class: "section__title" }, t("🌟 學習進度")),
    el("div", { class: "progress-bar" },
      el("div", { class: "progress-bar__fill", style: `width: ${pct}%;` })
    ),
    el("div", { style: "text-align: right; margin-top: 6px; font-weight: 700; color: var(--ink-soft);" },
      t(`已學會 ${masteredCount} / ${totalWords} 個字（${pct}%）`))
  ));

  // Categories
  const catSection = el("section", { class: "section section--hide-on-focus" },
    el("div", { class: "section__title" }, t("🎨 依主題複習"))
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
    el("div", { class: "section__title" }, t("📅 依週次複習"))
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
      t("💬 每週一句 Sentence of the Week"))
  ));

  root.appendChild(app);
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
      el("div", { class: "section__title" }, t("🎮 練習方式")),
      el("div", { class: "modes" },
        el("button", { class: "btn", onclick: () => navigate(`#/play/flashcard?set=${setKey}`) }, t("🃏 單字卡")),
        el("button", { class: "btn btn--accent", onclick: () => navigate(`#/play/quiz?set=${setKey}`) }, t("📝 選擇題")),
        el("button", { class: "btn btn--success", onclick: () => navigate(`#/play/listening?set=${setKey}`) }, t("👂 聽力")),
        el("button", { class: "btn btn--warn", onclick: () => navigate(`#/play/spelling?set=${setKey}`) }, t("✏️ 拼字")),
        el("button", { class: "btn btn--danger", onclick: () => navigate(`#/play/handwrite?set=${setKey}`) }, t("✍️ 手寫"))
      )
    ));

    const wordSection = el("section", { class: "section" },
      el("div", { class: "section__title" }, t(`📖 單字（共 ${words.length}）`))
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
