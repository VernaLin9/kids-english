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
function createProfile(name, grade) {
  if (!name) return;
  const isNew = !STORE.profiles[name];
  STORE.profiles[name] = ensureProfileFields(STORE.profiles[name] || {});
  if (isNew) STORE.profiles[name].grade = GRADES[grade] ? grade : CURRENT_GRADE; // 沒指定就沿用目前畫面的年級
  STORE.active = name;
  saveStore();
  reloadIfGradeChanged();
}
function switchProfile(name) {
  if (!STORE.profiles[name]) return;
  STORE.active = name;
  saveStore();
  reloadIfGradeChanged();
}
function deleteProfile(name) {
  delete STORE.profiles[name];
  if (STORE.active === name) STORE.active = Object.keys(STORE.profiles)[0] || null;
  saveStore();
  reloadIfGradeChanged();
}

// === 年級 ===
// 單字資料在 data.js 載入時就依目前使用者的年級決定，所以年級改變要重新載入頁面
const profileGrade = (p = getProfile()) => (GRADES[p?.grade] ? p.grade : DEFAULT_GRADE);
function reloadIfGradeChanged() {
  if (STORE.active && profileGrade() !== CURRENT_GRADE) {
    location.hash = "#/";
    location.reload();
  }
}
function setGrade(g) {
  const p = getProfile();
  if (!p || !GRADES[g]) return;
  p.grade = g;
  saveStore();
  reloadIfGradeChanged();
}

// === 📋 學習紀錄（家長模式查詢）：每次作答記一筆 [時間, 科目, 頁面, 題目, 對1/錯0, 距離上一次作答幾毫秒, 太快亂點1/0]，留最近 4000 筆 ===
const LOG_MAX = 4000;
let logLastAt = 0, logRushFlag = false; // logRushFlag 由 modes-guard 設定（題目出來不到 1 秒就點）
function logAnswer(subj, key, ok) {
  const p = getProfile(); if (!p || typeof ok !== "boolean") return;
  const now = Date.now(), gap = logLastAt ? now - logLastAt : 0;
  const page = location.hash.replace(/[&?]r=\d+/, "").slice(0, 60), k = String(key).slice(0, 30);
  p.log = p.log || [];
  const last = p.log[p.log.length - 1];
  if (ok && last && last[3] === k && last[2] === page && last[4] === 0 && now - last[0] < 120000) return; // 答錯後改對：只算第一次的作答
  logLastAt = now;
  p.log.push([now, subj, page, k, ok ? 1 : 0, gap, logRushFlag ? 1 : 0]);
  logRushFlag = false;
  if (p.log.length > LOG_MAX) p.log = p.log.slice(-LOG_MAX);
}

// 連續答對 MASTER_STREAK 次 → 自動標記「學會」；答錯 → 取消學會、重新累計
const MASTER_STREAK = 3;
function recordWord(w, hit) {
  const p = getProfile(); if (!p) return;
  const r = p.progress[w] || { seen: 0, correct: 0, wrong: 0, mastered: false };
  r.seen += 1;
  if (hit === true) {
    r.correct += 1; p.stars = (p.stars || 0) + 1;
    r.streak = (r.streak || 0) + 1;
    if (r.streak >= MASTER_STREAK) r.mastered = true;
  }
  if (hit === false) { r.wrong += 1; r.streak = 0; r.mastered = false; }
  scheduleReview(r, hit);
  p.progress[w] = r;
  logAnswer("en", w, hit);
  saveStore();
}

// === 隔天再複習（間隔重複，Leitner 盒子）===
// 每個字有 box 0-5；一天內第一次答對 → 升一盒，隔 REVIEW_DAYS[box] 天再出現；答錯 → 回到第 0 盒、今天再練
const REVIEW_DAYS = [0, 1, 3, 7, 14, 30];
const dayISO = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return dayISO(d); };
function scheduleReview(r, hit) {
  const today = dayISO();
  if (hit === false) { r.box = 0; r.due = today; r.lastDay = today; return; }
  if (hit !== true) return;
  if (r.lastDay === today && r.due) return; // 同一天重複答對不再升級，避免一天內就跳到很久以後
  r.box = Math.min((r.box || 0) + 1, REVIEW_DAYS.length - 1);
  r.due = addDays(REVIEW_DAYS[r.box]);
  r.lastDay = today;
}
// 今天該複習的字：已經練過、而且到期了（依到期日、盒子排序）
const dueWords = (profile = getProfile()) => {
  const today = dayISO();
  return Object.entries(profile?.progress || {})
    .filter(([w, r]) => WORDS[w] && r.due && r.due <= today)
    .sort(([, a], [, b]) => (a.due < b.due ? -1 : a.due > b.due ? 1 : (a.box || 0) - (b.box || 0)))
    .map(([w]) => w);
};

// === 下次考試範圍 ===
// 從本週往後找第一個寫 Quiz / Midterm / Final 的週；"Unit 1 Quiz 1" → Unit 1，"(Unit 1-2)" → Unit 1 到 2
function nextExam() {
  const cw = getCurrentWeek();
  const wk = WEEKS.find(w => w.num >= cw.num && /quiz|midterm|final|exam/i.test(w.progress));
  if (!wk) return null;
  let from, to;
  const range = wk.progress.match(/Unit\s*(\d+)\s*-\s*(\d+)/i);
  const single = wk.progress.match(/Unit\s*(\d+)/i);
  if (range) { from = +range[1]; to = +range[2]; }
  else if (single) { from = to = +single[1]; }
  else return null;
  const ids = [];
  for (let n = from; n <= to; n++) if (UNITS.find(u => u.id === `unit-${n}`)) ids.push(`unit-${n}`);
  if (!ids.length) return null;
  const setKey = "units-" + ids.join(",");
  return { week: wk, setKey, words: resolveSet(setKey), title: wk.progress, isThisWeek: wk.num === cw.num };
}

// === 拆音節 ===
// 多音節的字用 · 分段，畫面上用兩種顏色交替顯示，一次記一小段
const SYLLABLES = {
  seven: "sev·en", eleven: "e·lev·en", thirteen: "thir·teen", fourteen: "four·teen", fifteen: "fif·teen",
  sixteen: "six·teen", seventeen: "sev·en·teen", eighteen: "eigh·teen", nineteen: "nine·teen", twenty: "twen·ty",
  number: "num·ber", uncle: "un·cle", cousin: "cous·in", reading: "read·ing", counting: "count·ing",
  coloring: "col·or·ing", cutting: "cut·ting", writing: "writ·ing", drawing: "draw·ing", gluing: "glu·ing",
  talking: "talk·ing", erasing: "e·ras·ing", listening: "lis·ten·ing", using: "us·ing", marker: "mark·er",
  notebook: "note·book", scissors: "scis·sors", paintbrush: "paint·brush", sunny: "sun·ny", cloudy: "cloud·y",
  rainy: "rain·y", windy: "wind·y", snowy: "snow·y", raincoat: "rain·coat", sweater: "sweat·er",
  jacket: "jack·et", wearing: "wear·ing", "bathing suit": "bath·ing suit", sneakers: "sneak·ers",
  umbrella: "um·brel·la", Monday: "Mon·day", Tuesday: "Tues·day", Wednesday: "Wednes·day",
  Thursday: "Thurs·day", Friday: "Fri·day", Saturday: "Sat·ur·day", Sunday: "Sun·day", today: "to·day",
  basketball: "bas·ket·ball", baseball: "base·ball", soccer: "soc·cer", rollerblade: "roll·er·blade",
  skateboard: "skate·board", boring: "bor·ing", playground: "play·ground", shower: "show·er",
  microwave: "mi·cro·wave", bookcase: "book·case", armchair: "arm·chair", fireplace: "fire·place",
  above: "a·bove", behind: "be·hind", under: "un·der", between: "be·tween", window: "win·dow",
  refrigerator: "re·frig·er·a·tor", inside: "in·side", outside: "out·side", welcome: "wel·come",
  different: "dif·fer·ent", people: "peo·ple", visit: "vis·it", favorite: "fa·vor·ite", furniture: "fur·ni·ture",
  special: "spe·cial", really: "re·al·ly", artist: "art·ist", children: "chil·dren", weather: "weath·er",
  "put away": "put a·way",
  Hello: "Hel·lo", classroom: "class·room", computer: "com·put·er", pencil: "pen·cil", eraser: "e·ras·er",
  crayon: "cray·on", paper: "pa·per", picture: "pic·ture", color: "col·or", mountain: "moun·tain",
  river: "riv·er", ocean: "o·cean", flower: "flow·er", butterfly: "but·ter·fly", family: "fam·i·ly",
  photo: "pho·to", parents: "par·ents", father: "fa·ther", mother: "moth·er", brother: "broth·er",
  sister: "sis·ter", baby: "ba·by", grandma: "grand·ma", grandpa: "grand·pa", bedroom: "bed·room",
  bathroom: "bath·room", kitchen: "kitch·en", "living room": "liv·ing room", "dining room": "din·ing room",
  eating: "eat·ing", sleeping: "sleep·ing", cooking: "cook·ing", cleaning: "clean·ing",
  "watching TV": "watch·ing TV", "taking a bath": "tak·ing a bath", mirror: "mir·ror",
};
// 單字 → 分段的 DOM（沒有分段資料就原樣顯示）
function syllableEl(w, tag = "span", attrs = {}) {
  const parts = (SYLLABLES[w] || w).split("·");
  const node = el(tag, { ...attrs, class: `syl ${attrs.class || ""}` });
  parts.forEach((p, i) => node.appendChild(el("span", { class: `syl__part syl__part--${i % 2}` }, p)));
  return node;
}

// === 同字尾的字（-ing、-y …），一起練找規律 ===
const WORD_ENDINGS = [
  ["ing", "-ing 正在做"], ["day", "-day 星期"], ["teen", "-teen 十幾"], ["y", "-y 結尾"], ["er", "-er"],
  ["room", "-room 房間"], ["ball", "-ball 球類"],
];
function wordFamilies() {
  const used = new Set();
  return WORD_ENDINGS.map(([end, label]) => {
    const words = Object.keys(WORDS).filter(w => !used.has(w) && /^[a-z]+$/i.test(w) && w.length > end.length + 1 && w.toLowerCase().endsWith(end));
    words.forEach(w => used.add(w));
    return { end, label, words };
  }).filter(f => f.words.length >= 3);
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

// === 注音 helper ===
// rubyEl(text, bopo?, tag?, attrs?) — 把中文字串包成帶注音的 DOM 節點
// - 有 bopo（空白分隔每個漢字一段）→ 使用人工標注（精準，處理多音字）
// - 沒給 bopo → 自動逐字查 CHAR_BOPO
// - STORE.settings.bopomofo = false → 不顯示注音，僅純文字
// - 注音直書放在每個漢字右側，與漢字「垂直至中」對齊
// - 聲調符號（ˊˇˋ）放在頂端右側；輕聲 ˙ 放在頂端中央
// - 不用 <ruby><rt>（瀏覽器 ruby 預設位置會干擾），改用 span/flex
// 一個字的注音直欄（台灣課本：輕聲 ˙ 在最上方；ˊˇˋ 在最後一個符號右邊）
const TONE_MARK_RE = /[ˊˇˋ˙]/;
function bopoColEl(reading) {
  let tone = "", bare = reading || "";
  const m = bare.match(TONE_MARK_RE);
  if (m) { tone = m[0]; bare = bare.replace(TONE_MARK_RE, ""); }
  const col = document.createElement("span");
  col.className = "zh-bopo";
  const neutral = tone === "˙";
  if (neutral) {
    const tn = document.createElement("span");
    tn.className = "bopo-tone bopo-tone--neutral";
    tn.textContent = tone;
    col.appendChild(tn);
  }
  const chars = [...bare];
  chars.forEach(c => {
    const sp = document.createElement("span");
    sp.className = "bopo-char";
    sp.textContent = c;
    col.appendChild(sp);
  });
  if (tone && !neutral) {
    const tn = document.createElement("span");
    tn.className = "bopo-tone";
    tn.textContent = tone;
    tn.style.gridRow = String(Math.max(chars.length, 1));
    col.appendChild(tn);
  }
  return col;
}
// 只有注音（國語注音階段用）：每個字一欄，由左到右排
function bopoWordEl(bopo, attrs = {}) {
  const node = el("span", { ...attrs, class: `bopo-word ${attrs.class || ""}` });
  bopo.split(/\s+/).filter(Boolean).forEach(r => node.appendChild(bopoColEl(r)));
  return node;
}


// === 自動注音：先查詞（多音字照詞念），再查單字，最後處理「一」「不」變調（照課本標法）===
// PHRASE_BOPO 在 data.js；只影響沒有給注音的介面文字，課文／詞語資料用自己的 bopo
const SANDHI_SKIP_PREV = "第十百千萬零";
const NUM_CHARS = "一二三四五六七八九十百千萬零兩";
const toneOf = r => !r ? null : /ˋ/.test(r) ? 4 : /ˊ/.test(r) ? 2 : /ˇ/.test(r) ? 3 : /˙/.test(r) ? 0 : 1;
function autoReadings(text) {
  const CB = typeof CHAR_BOPO !== "undefined" ? CHAR_BOPO : {};
  const PB = typeof PHRASE_BOPO !== "undefined" ? PHRASE_BOPO : {};
  const chars = [...text];
  const isCJK = c => /[\u4e00-\u9fff]/.test(c);
  const out = new Array(chars.length).fill(null), fixed = new Array(chars.length).fill(false);
  for (let i = 0; i < chars.length; i++) {
    if (!isCJK(chars[i]) || out[i]) continue;
    for (let L = 5; L >= 2; L--) {
      const w = chars.slice(i, i + L).join("");
      if (w.length === L && PB[w]) { PB[w].split(" ").forEach((r, k) => { out[i + k] = r; fixed[i + k] = true; }); break; }
    }
    if (!out[i]) out[i] = CB[chars[i]] || "";
  }
  // 變調：一 ＋ 第四聲（含「個」）→ ㄧˊ；一 ＋ 其他聲 → ㄧˋ；不 ＋ 第四聲 → ㄅㄨˊ
  for (let i = 0; i < chars.length - 1; i++) {
    const c = chars[i], n = chars[i + 1];
    if (fixed[i] || !isCJK(n) || (c !== "一" && c !== "不")) continue;
    const nextTone = n === "個" ? 4 : toneOf(out[i + 1]);
    if (nextTone == null || nextTone === 0) continue;
    if (c === "一") {
      const prev = chars[i - 1]; // 注意 "".includes 會是 true，開頭的「一」要先判斷有沒有前一個字
      if ((prev && (SANDHI_SKIP_PREV.includes(prev) || NUM_CHARS.includes(prev))) || NUM_CHARS.includes(n) || "月號年樓聲".includes(n)) continue;
      out[i] = nextTone === 4 ? "ㄧˊ" : "ㄧˋ";
    } else out[i] = nextTone === 4 ? "ㄅㄨˊ" : "ㄅㄨˋ";
  }
  return out.filter((_, i) => isCJK(chars[i]));
}

function rubyEl(text, bopo, tag = "span", attrs = {}) {
  const node = el(tag, attrs);
  if (!STORE.settings.bopomofo) {
    node.textContent = text;
    return node;
  }
  const explicit = bopo ? bopo.split(/\s+/).filter(Boolean) : null;
  const auto = explicit ? null : autoReadings(text);
  let bi = 0, ci = -1;
  const TONE_RE = /[ˊˇˋ˙]/;
  for (const ch of text) {
    if (/[一-鿿]/.test(ch)) {
      ci++;
      const reading = explicit ? (explicit[bi++] || "") : (auto[ci] || "");
      // 結構：<span.zh-pair><span.zh-base>漢字</span><span.zh-bopo>注音欄</span></span>
      const pair = document.createElement("span");
      pair.className = "zh-pair";
      const base = document.createElement("span");
      base.className = "zh-base";
      base.textContent = ch;
      pair.appendChild(base);
      const bopoCol = bopoColEl(reading);
      pair.appendChild(bopoCol);
      node.appendChild(pair);
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

// === 自動注音 ===
// 畫面上所有沒標注音的國字，自動查 CHAR_BOPO 補上注音（包含之後才出現的文字，例如答對/答錯提示）。
// 不處理：已經有注音的 .zh-pair、輸入框、家長頁（[data-nobopo]）
const CJK_RE = /[\u4e00-\u9fff]/;
function autoBopoText(node) {
  if (!STORE.settings.bopomofo || !node.isConnected || !CJK_RE.test(node.nodeValue)) return;
  const parent = node.parentElement;
  if (!parent || parent.closest(".zh-pair, script, style, textarea, input, select, option, [data-nobopo]")) return;
  node.replaceWith(rubyEl(node.nodeValue, null, "span"));
}
function autoBopo(root) {
  if (!STORE.settings.bopomofo) return;
  if (root.nodeType === Node.TEXT_NODE) return autoBopoText(root);
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(autoBopoText);
}
new MutationObserver(muts => {
  for (const m of muts) {
    if (m.type === "characterData") autoBopoText(m.target);
    else m.addedNodes.forEach(autoBopo);
  }
}).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

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
// iPhone／iPad 的聲音清單裡有很多「搞笑／機器人」聲音（Albert、Bad News、Bells、Zarvox…，還有 Eddy、Flo、Grandma 這類），
// 排在清單前面，隨便挑第一個就會念得很奇怪 → 一律排除，優先挑正常的聲音
const ODD_VOICES = /Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Ralph|Kathy|Princess|Deranged|Hysterical|Pipe Organ|Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley|Novelty/i;
function pickEnVoice() {
  const vs = (window.speechSynthesis?.getVoices?.() || voicesCache).filter(v => !ODD_VOICES.test(v.name));
  const us = vs.filter(v => /en[-_]US/i.test(v.lang));
  return us.find(v => /Samantha|Ava|Allison|Susan|Zoe|Nicky|Siri|Google US English|Aria|Jenny/i.test(v.name))
    || us.find(v => v.localService) || us[0] || vs.find(v => /^en/i.test(v.lang)) || null;
}
// iOS Safari：cancel() 之後馬上 speak() 常常會念不出來或念一半 → 有東西在念就等一下再念
function speakUtterance(u) {
  const ss = window.speechSynthesis;
  if (ss.speaking || ss.pending) { ss.cancel(); setTimeout(() => ss.speak(u), 80); }
  else ss.speak(u);
}
// 英文：用 Google 的英文聲音（跟國語一樣，每台平板聽起來都一樣）；連不到 Google 才用平板聲音
const speak = (text) => {
  if (typeof speakGoogle === "function" && speakGoogle(String(text).replace(/_+/g, " "), "en")) return;
  speakEnDevice(text);
};
function speakEnDevice(text) {
  if (typeof zhAudio !== "undefined" && zhAudio) zhAudio.pause(); // 英文要念時，先停掉正在念的國語
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.9;
  const enVoice = pickEnVoice();
  if (enVoice) u.voice = enVoice; // 找不到正常的就不指定，用系統預設的英文聲音
  speakUtterance(u);
}
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
// 跳到同一頁時網址不變、不會觸發 hashchange，所以直接重畫
const navigate = h => { if (location.hash === h) route(); else location.hash = h; };

// === Helpers ===
const weekDateRange = (n) => WEEKS.find(w => w.num === n)?.dateRange || "";
const weekProgress = (n) => WEEKS.find(w => w.num === n)?.progress || "";
// 只計算目前單字表內的字（舊學期練熟的字不算進本學期進度）
const countMastered = (progress) => Object.entries(progress || {}).filter(([w, r]) => WORDS[w] && r.mastered).length;
// 常錯的字：答錯過、還沒重新學會（依錯誤率排序）
const wrongWords = (profile = getProfile()) => Object.entries(profile?.progress || {})
  .filter(([w, r]) => WORDS[w] && r.wrong > 0 && !r.mastered)
  .sort(([, a], [, b]) => b.wrong / Math.max(b.seen, 1) - a.wrong / Math.max(a.seen, 1) || b.wrong - a.wrong)
  .map(([w]) => w);
// 還沒學會的字（依單字表順序）
const unmasteredWords = (profile = getProfile()) => Object.keys(WORDS).filter(w => !profile?.progress?.[w]?.mastered);
// 單字清單 → setKey（"words-a,b,c"）
const wordsSetKey = (words) => "words-" + words.join(",");

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
  if (setKey.startsWith("cats-")) {
    const ids = setKey.slice(5).split(",").filter(Boolean);
    return [...new Set(ids.flatMap(id => CATEGORIES.find(c => c.id === id)?.words || []))];
  }
  if (setKey.startsWith("words-")) {
    return [...new Set(setKey.slice(6).split(",").filter(w => WORDS[w]))];
  }
  if (setKey === "wrong") return wrongWords();
  if (setKey === "due") return dueWords();
  if (setKey === "unmastered") return unmasteredWords();
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
  if (setKey?.startsWith("cats-")) {
    const ids = setKey.slice(5).split(",").filter(Boolean);
    return `📝 自訂考試：${ids.map(id => CATEGORIES.find(c => c.id === id)?.name || id).join(" + ")}`;
  }
  if (setKey?.startsWith("words-")) return `📝 自選單字（${resolveSet(setKey).length} 個）`;
  if (setKey === "wrong") return "❌ 常錯的字";
  if (setKey === "due") return "📅 今天要複習";
  if (setKey === "unmastered") return "🌱 還沒學會的字";
  return "全部";
};
const backHashFor = (setKey) => {
  if (setKey?.startsWith("week-")) return `#/week/${setKey.slice(5)}`;
  if (setKey?.startsWith("category-")) return `#/category/${setKey.slice(9)}`;
  if (setKey?.startsWith("units-")) return `#/exam`;
  if (setKey?.startsWith("weeks-")) return `#/exam`;
  if (setKey?.startsWith("cats-") || setKey?.startsWith("words-")) return `#/exam`;
  return "#/";
};

// === Header ===
const renderHeader = (title, { back = "#/", progress = "", streak = null } = {}) => {
  const left = back
    ? el("button", { class: "header__back", onclick: () => navigate(back), "aria-label": "回上一頁" }, "←")
    : el("div", { class: "header__back", style: "background: var(--accent-soft);" }, "📚");
  const right = el("div", { class: "header__progress" }, progress);
  if (streak != null && streak >= 2) {
    right.appendChild(document.createTextNode(" "));
    const s = el("span", { class: "streak" }, `🔥${streak}`);
    right.appendChild(s);
  }
  const gear = el("button", { class: "header__gear", onclick: openSettingsSheet, "aria-label": "設定" }, "⚙️");
  return el("header", { class: "header" }, left, el("div", { class: "header__title" }, title), right, gear);
};

// === 設定面板（字的大小 / 注音 / 音效 / 專注模式 / 家長）===
function openSettingsSheet() {
  const overlay = el("div", { class: "overlay settings-overlay" });
  const close = (rerender) => { overlay.remove(); if (rerender) route(); };
  overlay.addEventListener("click", e => { if (e.target === overlay) close(false); });
  const sizeLabel = el("span", { class: "settings-row__value" });
  const showSize = () => sizeLabel.textContent = `${Math.round(STORE.settings.fontScale * 100)}%`;
  showSize();
  const setScale = d => {
    STORE.settings.fontScale = Math.min(1.6, Math.max(0.8, +(STORE.settings.fontScale + d).toFixed(2)));
    saveStore(); applySettings(); showSize();
  };
  let dirty = false;
  const toggleRow = (emoji, label, desc, key) => {
    const btn = el("button", { class: `settings-toggle ${STORE.settings[key] ? "settings-toggle--on" : ""}` }, STORE.settings[key] ? "開" : "關");
    btn.addEventListener("click", () => {
      STORE.settings[key] = !STORE.settings[key];
      saveStore(); applySettings(); dirty = true;
      btn.textContent = STORE.settings[key] ? "開" : "關";
      btn.classList.toggle("settings-toggle--on", STORE.settings[key]);
    });
    return el("div", { class: "settings-row" },
      el("span", { class: "settings-row__emoji" }, emoji),
      el("div", { class: "settings-row__text" }, el("div", { class: "settings-row__label" }, label), el("div", { class: "settings-row__desc" }, desc)),
      btn);
  };
  const gradeRow = STORE.active ? el("div", { class: "settings-row" },
    el("span", { class: "settings-row__emoji" }, "📚"),
    el("div", { class: "settings-row__text" }, el("div", { class: "settings-row__label" }, "年級"),
      el("div", { class: "settings-row__desc" }, `${STORE.active} 的單字表`)),
    el("div", { class: "settings-row__pair" },
      ...Object.entries(GRADES).map(([g, info]) =>
        el("button", { class: `settings-toggle ${g === CURRENT_GRADE ? "settings-toggle--on" : ""}`, onclick: () => { if (g !== CURRENT_GRADE) setGrade(g); } }, info.name)))
  ) : null;
  const card = el("div", { class: "overlay__card settings-card pop" },
    el("div", { class: "settings-card__title" }, "⚙️ 設定"),
    gradeRow,
    el("div", { class: "settings-row" },
      el("span", { class: "settings-row__emoji" }, "🔠"),
      el("div", { class: "settings-row__text" }, el("div", { class: "settings-row__label" }, "字的大小"), sizeLabel),
      el("div", { class: "settings-row__pair" },
        el("button", { class: "settings-step", onclick: () => setScale(-0.1), "aria-label": "字變小" }, "A−"),
        el("button", { class: "settings-step", onclick: () => setScale(0.1), "aria-label": "字變大" }, "A+"))),
    toggleRow("ㄅ", "注音", "國字旁邊顯示注音", "bopomofo"),
    toggleRow("🔊", "音效", "答對、答錯的聲音", "sound"),
    toggleRow("🎯", "專注模式", "首頁只留下本週練習", "focus"),
    el("button", { class: "btn btn--ghost btn--full", style: "margin-top: 8px;", onclick: () => { overlay.remove(); navigate("#/parent"); } }, "👪 家長模式"),
    el("button", { class: "btn btn--accent btn--full", style: "margin-top: 8px;", onclick: () => close(dirty) }, "好了")
  );
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

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
    const list = renderKidList();
    childPanel.appendChild(list);
    childPanel.appendChild(rubyEl("或新增小孩：", null, "div", { style: "margin-top: 14px; font-weight: 700; color: var(--ink-soft);" }));
  }

  const input = el("input", { type: "text", placeholder: "你叫什麼名字？", maxlength: 12 });
  childPanel.appendChild(input);
  let newGrade = DEFAULT_GRADE;
  const gradeWrap = el("div", { style: "margin-top: 10px;" });
  const drawGrade = () => gradeWrap.replaceChildren(rubyEl("幾年級？", null, "div", { style: "font-weight: 700; color: var(--ink-soft); margin-bottom: 6px;" }), gradePicker(newGrade, g => { newGrade = g; drawGrade(); }));
  drawGrade();
  childPanel.appendChild(gradeWrap);
  const start = () => {
    const name = (input.value || "").trim();
    if (!name) return;
    createProfile(name, newGrade);
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

// === 選小孩（登入頁、換人頁共用）===
// 整張卡片都可以點；還沒設定年級的小孩（舊版建立的），第一次選時先問幾年級
function pickKid(name) {
  const p = STORE.profiles[name];
  if (!p) return;
  const go = () => { switchProfile(name); navigate("#/"); };
  if (GRADES[p.grade]) return go();
  const overlay = el("div", { class: "overlay" });
  overlay.appendChild(el("div", { class: "overlay__card settings-card pop", style: "text-align: center;" },
    el("div", { class: "settings-card__title" }, `${name} 幾年級？`),
    el("div", { style: "display: grid; gap: 10px; margin-top: 12px;" },
      Object.entries(GRADES).map(([g, info]) =>
        el("button", { class: "btn btn--accent btn--xl btn--full", onclick: () => { p.grade = g; saveStore(); overlay.remove(); go(); } }, `📚 ${info.name}`))),
    el("button", { class: "btn btn--ghost btn--full", style: "margin-top: 10px;", onclick: () => overlay.remove() }, "取消")));
  document.body.appendChild(overlay);
}
function renderKidList() {
  const list = el("div", { class: "kid-list" });
  Object.keys(STORE.profiles).forEach(name => {
    const p = STORE.profiles[name];
    const hasGrade = !!GRADES[p.grade];
    const del = el("button", { class: "kid-pick__del", "aria-label": `刪除 ${name}` }, "✕");
    del.addEventListener("click", e => {
      e.stopPropagation();
      if (confirm(`刪除 ${name} 的所有進度？`)) { deleteProfile(name); route(); }
    });
    list.appendChild(el("div", { class: "kid-pick-wrap" },
      el("button", { class: `kid-pick ${STORE.active === name ? "kid-pick--active" : ""}`, onclick: () => pickKid(name) },
        el("span", { class: "kid-pick__avatar" }, "👤"),
        el("span", { class: "kid-pick__info" },
          el("span", { class: "kid-pick__name" }, name),
          el("span", { class: "kid-pick__meta" }, hasGrade ? `📚 ${GRADES[p.grade].name}` : "📚 還沒選年級", `　⭐ ${p.stars || 0}`)),
        el("span", { class: "kid-pick__go" }, "▶")),
      del));
  });
  return list;
}

// === Home ===
// 練習方式（週次頁、主題頁、自選複習共用）
// 跟著念需要瀏覽器的語音辨識（Chrome / iPad Safari 大多支援；不支援就不顯示）
const SPEECH_RECOG = window.SpeechRecognition || window.webkitSpeechRecognition || null;
const PRACTICE_MODES = [
  ["flashcard", "🃏", "單字卡"],
  ["match",     "🧩", "翻牌配對"],
  ["quiz",      "📝", "選擇題"],
  ["listening", "👂", "聽力"],
  ["spelling",  "🔤", "拼字"],
  ["handwrite", "✍️", "手寫"],
  ...(SPEECH_RECOG ? [["speak", "🎤", "跟著念"]] : []),
];
function renderModeGrid(setKey) {
  return el("div", { class: "mode-grid" },
    PRACTICE_MODES.map(([m, emoji, label]) =>
      el("button", { class: "mode-btn", onclick: () => navigate(`#/play/${m}?set=${encodeURIComponent(setKey)}`) },
        el("span", { class: "mode-btn__emoji" }, emoji), t(label))));
}

// 複習卡片：常錯的字 / 還沒學會 / 自己選（首頁、自選複習共用）
function renderReviewPicks(profile, { custom = true } = {}) {
  const nWrong = wrongWords(profile).length;
  const nTodo = unmasteredWords(profile).length;
  const card = (cls, emoji, label, sub, onclick, disabled = false) =>
    el("button", { class: `review-pick ${cls}`, disabled, onclick },
      el("span", { class: "review-pick__emoji" }, emoji), t(label), el("span", { class: "review-pick__count" }, sub));
  return el("div", { class: `review-picks ${custom ? "" : "review-picks--2"}` },
    card("review-pick--wrong", "❌", "常錯字", nWrong ? `${nWrong} 個` : "還沒有", () => navigate("#/play/quiz?set=wrong"), !nWrong),
    card("review-pick--todo", "🌱", "沒學會", `${nTodo} 個`, () => navigate("#/play/flashcard?set=unmastered"), !nTodo),
    custom ? card("review-pick--custom", "🎯", "自己選", "挑範圍", () => navigate("#/exam")) : null
  );
}

function renderHome() {
  const profile = getProfile();
  const progress = profile?.progress || {};
  const cw = getCurrentWeek();
  const cs = SENTENCES.find(s => s.week === cw.num);
  const masteredCount = profile ? countMastered(profile.progress) : 0;
  const totalWords = Object.keys(WORDS).length;
  const pct = Math.round((masteredCount / totalWords) * 100);

  const root = el("div", {});
  root.appendChild(renderHeader(`Hi ${profile?.name || STORE.active || "👤"}`, { back: null }));
  const app = el("main", { class: "app" });

  // 狀態列：誰在練習 / 年級 / 星星（都可以點）
  app.appendChild(el("div", { class: "status-bar" },
    el("button", { class: "status-chip", onclick: () => navigate("#/profile") }, `👤 ${STORE.active || ""}`, el("span", { class: "status-chip__more" }, "›")),
    el("button", { class: "status-chip", onclick: openSettingsSheet }, `📚 ${GRADES[CURRENT_GRADE].name}`, el("span", { class: "status-chip__more" }, "›")),
    el("div", { class: "status-chip status-chip--star" }, `⭐ ${profile?.stars || 0}`)
  ));

  // 科目：英文 / 國語 / 數學（這個年級有資料的科目才顯示）
  const subjects = [["en", "🔤 英文"], ...(ZH ? [["zh", "ㄅ 國語"]] : []), ...(MATH ? [["math", "➕ 數學"]] : [])];
  const subject = subjects.some(([id]) => id === profile?.subject) ? profile.subject : "en";
  // 國語／數學的考試提醒（資料裡有 exam 且日期在 10 天內）
  const reminders = [];
  (ZH?.lessons || []).forEach(l => { if (l.exam) reminders.push({ ...l.exam, subject: "國語", title: l.title, hash: l.exam.mode === "lesson" ? `#/zh/${l.id}` : `#/zhplay/${l.exam.mode}?l=${l.id}` }); });
  (MATH?.units || []).forEach(u => { if (u.exam) reminders.push({ ...u.exam, subject: "數學", title: u.title, hash: `#/mathplay/${u.exam.mode}?u=${u.id}` }); });
  const today = dayISO();
  reminders.filter(r => r.date >= today && r.date <= addDays(10)).sort((a, b) => a.date.localeCompare(b.date)).forEach(r => {
    const d = new Date(r.date + "T00:00:00");
    const daysLeft = Math.round((d - new Date(today + "T00:00:00")) / 86400000);
    const when = daysLeft === 0 ? "今天" : daysLeft === 1 ? "明天" : `${daysLeft}天後`;
    app.appendChild(el("button", { class: "exam-remind", onclick: () => navigate(r.hash) },
      el("span", { class: "exam-remind__icon" }, "📅"),
      el("span", { class: "exam-remind__text" }, t(`${d.getMonth() + 1}/${d.getDate()}(${"日一二三四五六"[d.getDay()]})${when}考${r.subject}：${r.label}`)),
      el("span", { class: "exam-remind__go" }, t(r.mode === "exam" ? "模擬小考 ›" : "去練習 ›"))));
  });
  if (subjects.length > 1) {
    app.appendChild(el("div", { class: `subject-tabs subject-tabs--${subjects.length}` },
      subjects.map(([id, label]) =>
        el("button", { class: `subject-tab subject-tab--${id} ${subject === id ? "subject-tab--on" : ""}`, onclick: () => { if (profile) { profile.subject = id; saveStore(); } route(); } }, t(label)))));
  }
  // 🎮 遊樂場（英文、國語都能玩）
  app.appendChild(el("button", { class: "g-home", onclick: () => navigate(`#/games?s=${subject}`) },
    el("span", { class: "g-home__emoji" }, "🎮"),
    el("span", { class: "g-home__text" }, t("遊戲"), el("span", { class: "g-home__sub" }, t("陀螺對戰・養寵物・夜市（跟著要考的那一課）"))),
    el("span", { class: "g-home__go" }, "▶")));
  if (subject === "zh" || subject === "math") {
    app.appendChild(subject === "zh" ? renderZhHomeSection() : renderMathHomeSection());
    root.appendChild(app);
    return root;
  }

  // 本週：單字 + 一顆大按鈕
  const hero = el("section", { class: "hero" },
    el("div", { class: "hero__head" },
      el("h1", { class: "hero__title" }, `本週 第 ${cw.num} 週`),
      el("div", { class: "hero__sub" }, `${cw.dateRange}・${cw.progress}`)
    )
  );
  if (cw.words.length) {
    const learned = cw.words.filter(w => progress[w]?.mastered).length;
    hero.appendChild(el("div", { class: "hero__words" },
      cw.words.map(w => el("div", { class: `hero__word ${progress[w]?.mastered ? "hero__word--done" : ""}` },
        el("span", { class: "hero__word-emoji" }, WORDS[w]?.emoji || ""), w))));
    hero.appendChild(el("div", { class: "hero__learned" }, `學會 ${learned} / ${cw.words.length} 個 ${learned === cw.words.length ? "🎉" : ""}`));
    hero.appendChild(el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => navigate(`#/week/${cw.num}`) }, t("▶ 開始練習本週")));
  } else {
    hero.appendChild(el("p", { class: "hero__empty" }, "這週是考試 / 複習週，沒有新單字。把還沒學會的字練一練吧！"));
    hero.appendChild(el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => navigate("#/play/flashcard?set=unmastered") }, t("▶ 開始複習")));
  }
  if (cs) {
    hero.appendChild(el("button", { class: "hero__sentence", onclick: () => navigate("#/sentences") },
      el("span", { class: "hero__sentence-icon" }, "💬"),
      el("div", {}, el("div", { class: "hero__sentence-en" }, cs.en), rubyEl(cs.zh, cs.bopo, "div", { class: "hero__sentence-zh" }))));
  }
  app.appendChild(hero);

  // 下次考試：一鍵練整個考試範圍
  const exam = nextExam();
  if (exam) {
    const learnedExam = exam.words.filter(w => progress[w]?.mastered).length;
    app.appendChild(el("section", { class: "exam-card" },
      el("div", { class: "exam-card__head" },
        el("span", { class: "exam-card__icon" }, "📝"),
        el("div", {},
          el("div", { class: "exam-card__title" }, exam.isThisWeek ? "這週要考試！" : "下次考試"),
          el("div", { class: "exam-card__sub" }, `第 ${exam.week.num} 週（${exam.week.dateRange}）・${exam.title}`))),
      el("div", { class: "exam-card__count" }, `考試範圍 ${exam.words.length} 個字・已學會 ${learnedExam} 個`),
      el("div", { class: "progress-bar" }, el("div", { class: "progress-bar__fill", style: `width: ${Math.round(learnedExam * 100 / Math.max(exam.words.length, 1))}%;` })),
      el("button", { class: "btn btn--full btn--xl exam-card__btn", onclick: () => navigate(`#/practice/${encodeURIComponent(exam.setKey)}`) }, t("📝 考前複習"))
    ));
  }

  // 複習
  const nDue = dueWords(profile).length;
  app.appendChild(el("section", { class: "section section--hide-on-focus" },
    el("div", { class: "section__title" }, t("🔁 複習")),
    nDue ? el("button", { class: "due-banner", onclick: () => navigate("#/practice/due") },
      el("span", { class: "due-banner__icon" }, "📅"),
      el("div", { class: "due-banner__text" }, el("div", { class: "due-banner__title" }, `今天要複習 ${nDue} 個字`), el("div", { class: "due-banner__sub" }, "快忘記的字，再練一次記更久")),
      el("span", { class: "due-banner__go" }, "›")) : null,
    renderReviewPicks(profile)
  ));

  // 進度 + 全部單字
  app.appendChild(el("section", { class: "section section--hide-on-focus" },
    el("div", { class: "progress-head" },
      el("span", {}, t("🌟 學會")),
      el("span", { class: "progress-head__num" }, `${masteredCount} / ${totalWords}`)),
    el("div", { class: "progress-bar" }, el("div", { class: "progress-bar__fill", style: `width: ${pct}%;` })),
    el("div", { class: "progress-note" }, `選擇題、聽力、拼字連續答對 ${MASTER_STREAK} 次，就算學會；學過的字會在 1、3、7、14 天後再出現複習`),
    el("div", { class: "home-links" },
      el("button", { class: "btn btn--ghost btn--full", onclick: () => navigate("#/words") }, t("📖 全部單字（週次・主題・字尾）")),
      SENTENCES.length ? el("button", { class: "btn btn--ghost btn--full", onclick: () => navigate("#/sentences") }, t("💬 每週一句")) : null
    )
  ));

  root.appendChild(app);
  return root;
}

// === 全部單字：依週次 / 依主題 ===
let WORDS_TAB = "weeks";
function renderWordsPage() {
  const profile = getProfile();
  const progress = profile?.progress || {};
  const cw = getCurrentWeek();
  const root = el("div", {});
  root.appendChild(renderHeader("📖 全部單字", { back: "#/" }));
  const app = el("main", { class: "app" });
  const learnedOf = words => words.filter(w => progress[w]?.mastered).length;

  const tabs = el("div", { class: "pick-tabs pick-tabs--3" });
  const body = el("div", {});
  const show = (tab) => {
    WORDS_TAB = tab;
    tabs.querySelectorAll(".pick-tab").forEach(b => b.classList.toggle("pick-tab--on", b.dataset.tab === tab));
    if (tab === "weeks") {
      body.replaceChildren(el("div", { class: "list-cards" }, WEEKS.map(w => {
        const isCurrent = w.num === cw.num;
        return el("button", { class: `list-card ${isCurrent ? "list-card--current" : ""} ${w.words.length ? "" : "list-card--exam"}`, onclick: () => navigate(`#/week/${w.num}`) },
          el("div", { class: "list-card__main" },
            el("div", { class: "list-card__title" }, `第 ${w.num} 週`, isCurrent ? el("span", { class: "list-card__badge" }, "本週") : null),
            el("div", { class: "list-card__sub" }, `${w.dateRange}・${w.progress}`),
            w.words.length ? el("div", { class: "list-card__words" }, w.words.join(", ")) : null),
          el("div", { class: "list-card__side" }, w.words.length ? `${learnedOf(w.words)}/${w.words.length}` : "📝"));
      })));
    } else if (tab === "ends") {
      const fams = wordFamilies();
      body.replaceChildren(
        el("p", { class: "match-hint" }, "結尾一樣的字一起記：找到規律，一次記一整組"),
        fams.length ? el("div", { class: "list-cards" }, fams.map(f =>
          el("button", { class: "list-card", onclick: () => navigate(`#/practice/${encodeURIComponent(wordsSetKey(f.words))}`) },
            el("div", { class: "list-card__main" },
              el("div", { class: "list-card__title" }, f.label),
              el("div", { class: "list-card__words" }, f.words.map(w => w.slice(0, -f.end.length) + "·" + f.end).join(", "))),
            el("div", { class: "list-card__side" }, `${learnedOf(f.words)}/${f.words.length}`)))) : el("div", { class: "empty" }, "這個年級沒有同字尾的字組"));
    } else {
      body.replaceChildren(el("div", { class: "list-cards list-cards--grid" }, CATEGORIES.map(c =>
        el("button", { class: "list-card list-card--cat", onclick: () => navigate(`#/category/${c.id}`) },
          el("span", { class: "list-card__emoji" }, c.emoji),
          el("div", { class: "list-card__main" },
            rubyEl(c.name, c.bopo, "div", { class: "list-card__title" }),
            el("div", { class: "list-card__sub" }, `${c.nameEn}・學會 ${learnedOf(c.words)}/${c.words.length}`))))));
    }
  };
  [["weeks", "📅 週次"], ["cats", "🎨 主題"], ["ends", "🔤 字尾"]].forEach(([id, label]) =>
    tabs.appendChild(el("button", { class: "pick-tab", "data-tab": id, onclick: () => show(id) }, t(label))));
  app.append(tabs, body);
  show(WORDS_TAB);
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

  const list = renderKidList();
  card.appendChild(list);

  const input = el("input", { type: "text", placeholder: "新增名字", maxlength: 12, style: "margin-top: 16px;" });
  let newGrade = CURRENT_GRADE;
  const gradeWrap = el("div", { style: "margin-top: 10px;" });
  const drawGrade = () => gradeWrap.replaceChildren(gradePicker(newGrade, g => { newGrade = g; drawGrade(); }));
  drawGrade();
  const add = () => {
    const name = (input.value || "").trim();
    if (!name) return;
    navigate("#/");
    createProfile(name, newGrade);
  };
  input.addEventListener("keydown", e => { if (e.key === "Enter") add(); });
  card.appendChild(input);
  card.appendChild(gradeWrap);
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
    if (setKey.startsWith("week-")) app.appendChild(questEntryBtn("en", setKey));
    app.appendChild(el("section", { class: "section" },
      el("div", { class: "section__title" }, t("✏️ 選一種練習")),
      renderModeGrid(setKey)
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
      const text = el("div", { class: "word-row__text" });
      text.appendChild(el("div", { class: "word-row__en" }, syllableEl(w), r?.mastered ? el("span", { class: "word-row__star" }, " ⭐") : null));
      text.appendChild(rubyEl(info.zh || "", info.bopo || "", "div", { class: "word-row__zh" }));
      row.appendChild(text);
      row.appendChild(el("button", { class: "word-row__speak", onclick: () => speakWord(w), "aria-label": `念 ${w}` }, "🔊"));
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

// === 自動更新：平板常常拿到快取的舊網頁。打開時偷偷抓最新的 index.html，
// 版本號（?v=）不一樣就重新載入一次（同一個版本只重載一次，避免一直重整）===
// 自動更新：打開網頁、切回網頁、每 3 分鐘檢查一次；index.html 的版本號不同就重新載入（家長要求：不管在玩什麼都直接換成新版）
(function checkNewVersion() {
  const mine = (document.querySelector('script[src*="app.js?v="]')?.getAttribute("src") || "").split("?v=")[1];
  if (!mine || !window.fetch) return;
  const check = () => fetch(`${location.pathname}?nocache=${Date.now()}`, { cache: "no-store" })
    .then(r => r.ok ? r.text() : "")
    .then(html => {
      const latest = (html.match(/app\.js\?v=([0-9a-z]+)/) || [])[1];
      if (!latest || latest === mine) return;
      let tried = null; try { tried = sessionStorage.getItem("reloadedFor"); } catch (e) {}
      if (tried === latest) return;
      try { sessionStorage.setItem("reloadedFor", latest); } catch (e) {}
      location.reload();
    })
    .catch(() => {});
  check();
  setInterval(check, 3 * 60 * 1000);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") check(); });
})();
