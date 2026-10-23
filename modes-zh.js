// === 國語複習（注音階段）===
// 資料在 data-zh.js 的 ZH；進度存在 profile.zhProgress（跟英文分開）

// 國語發音：用瀏覽器的中文語音念國字（念國字比念注音準）
// 台灣國語發音：只用台灣（zh-TW）的聲音；有些語音引擎即使是台灣聲音也會念大陸讀法，
// 念之前先換成台灣讀法的同音字（只影響聲音，畫面上的字不變）
const ZH_TW_READING = [["垃圾", "樂色"], ["垃", "樂"], ["圾", "色"]];
function zhTwText(text) { return ZH_TW_READING.reduce((s, [a, b]) => s.split(a).join(b), text); }
function pickZhVoice() {
  const vs = speechSynthesis.getVoices();
  const isTW = v => /zh[-_]TW|zh[-_]Hant[-_]TW|cmn[-_]Hant[-_]TW/i.test(v.lang) || /Taiwan|臺灣|台灣|Mei-?Jia|美佳|HsiaoChen|HsiaoYu|曉臻|曉雨|YunJhe|雲哲/i.test(v.name);
  return vs.find(v => isTW(v) && v.localService) || vs.find(isTW) || null;
}
// 主要用 Google 翻譯的台灣國語語音（tl=zh-TW），每台平板聽起來都一樣；
// 連不到或播放失敗時，退回平板內建的台灣聲音
const GOOGLE_TTS = (q) => `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=zh-TW&ttsspeed=0.8&q=${encodeURIComponent(q)}`;
const zhAudio = typeof Audio !== "undefined" ? new Audio() : null;
let zhAudioQueue = [], zhGoogleOK = true;
// iPad 要在使用者第一次點畫面時「解鎖」播放，之後程式自動念題目才念得出來
if (zhAudio) {
  const unlock = () => { zhAudio.muted = true; zhAudio.play().catch(() => {}).finally(() => { zhAudio.pause(); zhAudio.muted = false; }); document.removeEventListener("pointerdown", unlock, true); };
  document.addEventListener("pointerdown", unlock, true);
}
// Google 一次最多約 200 字，長句照標點切開依序念
function splitForTts(text) {
  const parts = text.split(/(?<=[，。！？、；：,.!?])/).map(x => x.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) { if (out.length && (out[out.length - 1] + p).length <= 90) out[out.length - 1] += p; else out.push(p); }
  return out.flatMap(p => p.length <= 180 ? [p] : p.match(/.{1,180}/g));
}
function speakZhDevice(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-TW";
  u.rate = 0.8;
  // 每次重找：聲音清單常常晚一點才載入，不能記住一開始找到的（可能是大陸的）聲音
  const v = pickZhVoice();
  if (v) u.voice = v; // 找不到台灣聲音就不指定，只設定 lang=zh-TW，不會退回大陸聲音
  speechSynthesis.speak(u);
}
function speakZh(text) {
  const say = zhTwText(String(text || "")).trim();
  if (!say) return;
  window.speechSynthesis?.cancel();
  if (!zhAudio || !zhGoogleOK) return speakZhDevice(say);
  zhAudio.pause();
  zhAudioQueue = splitForTts(say);
  const playNext = () => {
    const chunk = zhAudioQueue.shift();
    if (!chunk) return;
    zhAudio.onended = playNext;
    zhAudio.onerror = () => { zhGoogleOK = false; zhAudioQueue = []; speakZhDevice(say); setTimeout(() => { zhGoogleOK = true; }, 60000); }; // 連不到 Google：先用平板聲音，一分鐘後再試 Google
    zhAudio.src = GOOGLE_TTS(chunk);
    const pr = zhAudio.play();
    if (pr && pr.catch) pr.catch(err => { if (err && err.name === "NotAllowedError") speakZhDevice(say); }); // 還沒解鎖播放時先用平板聲音
  };
  playNext();
}

const zhLesson = (id) => ZH?.lessons.find(l => l.id === id);
const zhProgressOf = (p = getProfile()) => (p ? (p.zhProgress = p.zhProgress || {}) : {});
function recordZh(zh, hit) {
  const p = getProfile(); if (!p) return;
  const prog = zhProgressOf(p);
  const r = prog[zh] || { seen: 0, correct: 0, wrong: 0, streak: 0, mastered: false };
  r.seen++;
  if (hit) { r.correct++; r.streak = (r.streak || 0) + 1; p.stars = (p.stars || 0) + 1; if (r.streak >= MASTER_STREAK) r.mastered = true; }
  else { r.wrong++; r.streak = 0; r.mastered = false; }
  prog[zh] = r;
  saveStore();
}

// 注音拆解：「ㄒㄧㄠˇ」→ { symbols: ["ㄒ","ㄧ","ㄠ"], tone: "ˇ" }；一聲 tone = ""
const splitSyl = (r) => { const m = r.match(TONE_MARK_RE); return { symbols: [...r.replace(TONE_MARK_RE, "")], tone: m ? m[0] : "" }; };
const TONES = [["", "一聲"], ["ˊ", "二聲"], ["ˇ", "三聲"], ["ˋ", "四聲"], ["˙", "輕聲"]];
// 容易搞混的注音（考試常考）
const CONFUSE = [["ㄓ","ㄗ"],["ㄔ","ㄘ"],["ㄕ","ㄙ"],["ㄐ","ㄑ","ㄒ"],["ㄅ","ㄆ"],["ㄉ","ㄊ"],["ㄋ","ㄌ"],["ㄈ","ㄏ"],["ㄍ","ㄎ"],["ㄢ","ㄤ"],["ㄣ","ㄥ"],["ㄛ","ㄜ"],["ㄟ","ㄝ"],["ㄠ","ㄡ"]];
const confusableOf = (c) => (CONFUSE.find(g => g.includes(c)) || []).filter(x => x !== c);
const ALL_SYMBOLS = [..."ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ"];

// 把一個詞的注音改一點點（換聲調或換成容易混淆的符號），當選擇題的錯誤選項
function bopoVariants(bopo) {
  const syls = bopo.split(" ");
  const out = new Set();
  for (let tries = 0; tries < 40 && out.size < 6; tries++) {
    const k = Math.floor(Math.random() * syls.length);
    const { symbols, tone } = splitSyl(syls[k]);
    let next;
    if (Math.random() < 0.5) {
      const others = TONES.map(t => t[0]).filter(t => t !== tone && t !== "˙");
      next = symbols.join("") + others[Math.floor(Math.random() * others.length)];
    } else {
      const idx = symbols.findIndex(c => confusableOf(c).length);
      if (idx < 0) continue;
      const alt = confusableOf(symbols[idx]);
      const sym = [...symbols]; sym[idx] = alt[Math.floor(Math.random() * alt.length)];
      next = sym.join("") + tone;
    }
    const v = [...syls]; v[k] = next;
    const s = v.join(" ");
    if (s !== bopo) out.add(s);
  }
  return [...out];
}

// === 國語首頁區塊（放在首頁「國語」分頁）===
function renderZhHomeSection() {
  const wrap = el("div", {});
  const prog = zhProgressOf();
  ZH.lessons.forEach(l => {
    const items = l.kind === "chars" ? l.chars : l.words;
    const learned = items.filter(w => prog[w.zh]?.mastered).length;
    wrap.appendChild(el("section", { class: "hero" },
      el("div", { class: "hero__head" },
        el("h1", { class: "hero__title" }, `${l.emoji} `, rubyEl(l.title, l.titleBopo, "span")),
        el("div", { class: "hero__sub" }, l.kind === "chars" ? `${items.length} 個生字・學會 ${learned} 個` : `複習 ${items.length} 個詞・學會 ${learned} 個`)),
      el("div", { class: "zh-chips" }, l.kind === "chars"
        ? l.chars.slice(0, 9).map(c => el("div", { class: `zh-chip ${prog[c.zh]?.mastered ? "zh-chip--done" : ""}` }, rubyEl(c.zh, c.bopo, "span", { class: "zh-chip__char" })))
        : l.words.slice(0, 8).map(w => el("div", { class: `zh-chip ${prog[w.zh]?.mastered ? "zh-chip--done" : ""}` }, el("span", { class: "zh-chip__emoji" }, w.emoji), bopoWordEl(w.bopo, { class: "bopo-word--sm" })))),
      el("button", { class: "btn btn--accent btn--full btn--xl", style: "margin-top: 12px;", onclick: () => navigate(`#/zh/${l.id}`) }, t("▶ 開始複習"))
    ));
  });
  return wrap;
}

// === 課的頁面：練習方式 + 詞語 + 課文 ===
const ZH_MODES = [
  ["card",   "🃏", "注音卡"],
  ["listen", "👂", "聽音選注音"],
  ["tone",   "🎵", "加聲調"],
  ["spell",  "🔤", "拼注音"],
  ["write",  "✍️", "寫注音"],
];
function renderZhLesson(id) {
  const l = zhLesson(id);
  if (!l) return renderEmpty("#/", "找不到這一課");
  if (l.kind === "chars") return renderZhCharLesson(l);
  const prog = zhProgressOf();
  const root = el("div", {});
  root.appendChild(renderHeader(`${l.emoji} ${l.title}`, { back: "#/" }));
  const app = el("main", { class: "app" });
  app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t("🎮 選一種練習")),
    el("div", { class: "mode-grid" }, [...ZH_MODES, ...(l.sentences ? [["sentence", "🔗", "連句子"]] : [])].map(([m, emoji, label]) =>
      el("button", { class: "mode-btn", onclick: () => navigate(`#/zhplay/${m}?l=${l.id}`) }, el("span", { class: "mode-btn__emoji" }, emoji), t(label))))));

  // 這一課練的注音符號（點一個念一個）
  if (l.symbols) app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t("ㄅ 這課的注音符號（點一個聽一個）")),
    el("div", { class: "zh-symbols" }, l.symbols.map(sy => el("button", { class: "zh-symbol", onclick: () => speakZh(ZH_SYMBOL_SAY[sy] || sy) }, sy)))));

  // 課文：點一句念一句（沒有課文就不顯示）
  if (l.text?.length) app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t(l.textTitle || "📖 課文（點一句聽一句）")),
    el("div", { class: "zh-text" }, l.text.map(line =>
      el("button", { class: "zh-text__line", onclick: () => speakZh(line.zh) }, rubyEl(line.zh, line.bopo, "span"))))));

  if (l.pending?.length) app.appendChild(el("div", { class: "b2-note" }, l.pending.map(p => el("div", {}, t(`第${p.no}題 `), bopoWordEl(p.bopo, { class: "bopo-word--sm" }), t(`：${p.note}，還沒放進練習`)))));
  app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t(`📝 複習詞語（共 ${l.words.length}）`)),
    el("div", { class: "word-list zh-word-list" }, l.words.map(w =>
      el("div", { class: "word-row" },
        el("span", { class: "word-row__emoji" }, w.emoji),
        el("div", { class: "word-row__text" },
          el("div", { class: "zh-row__bopo" }, el("span", { class: "zh-row__no" }, `${w.no}.`), bopoWordEl(w.bopo), prog[w.zh]?.mastered ? el("span", { class: "word-row__star" }, " ⭐") : null),
          el("div", { class: "word-row__zh" }, rubyEl(w.zh, w.bopo, "span"), w.note ? el("span", { class: "zh-note" }, `（${w.note}）`) : null)),
        el("button", { class: "word-row__speak", onclick: () => speakZh(w.zh), "aria-label": `念 ${w.zh}` }, "🔊"))))));
  root.appendChild(app);
  return root;
}

// 共用：練習頁外框
function zhShell(l, title) {
  const root = el("div", {});
  const header = renderHeader(`${title}・${l.title.split(" ")[0]}`, { back: `#/zh/${l.id}` });
  root.appendChild(header);
  const app = el("main", { class: "app" });
  root.appendChild(app);
  return { root, app, progressLabel: $(".header__progress", header) };
}
function zhResult(app, l, mode, score, total, missed) {
  const again = () => navigate(`#/zhplay/${mode}?l=${l.id}`);
  app.replaceChildren(renderResultBlock(`答對 ${score} / ${total}`, score === total ? "🌟" : score >= total * 0.7 ? "🎉" : "💪", "再來一次", again,
    missed && missed.size ? el("div", { class: "zh-missed" }, el("div", { class: "zh-missed__title" }, t("要再練的：")),
      [...missed].map(zh => { const w = l.words.find(x => x.zh === zh); return el("span", { class: "zh-chip" }, w.emoji, bopoWordEl(w.bopo, { class: "bopo-word--sm" })); })) : null));
}

// === 🃏 注音卡：看注音念念看，點一下翻面看國字、聽發音 ===
function renderZhCard(l) {
  const { root, app, progressLabel } = zhShell(l, "🃏 注音卡");
  const words = shuffle(l.words);
  let i = 0;
  const render = () => {
    if (i >= words.length) { app.replaceChildren(renderResultBlock("看完一輪了！", "🎉", "再看一次", () => { i = 0; render(); })); return; }
    const w = words[i];
    progressLabel.textContent = `${i + 1}/${words.length}`;
    let flipped = false;
    const card = el("button", { class: "zh-card" });
    const front = () => card.replaceChildren(el("div", { class: "zh-card__emoji" }, w.emoji), bopoWordEl(w.bopo, { class: "bopo-word--xl" }), el("div", { class: "flashcard__hint" }, t("先念念看，再點卡片")));
    const back = () => card.replaceChildren(el("div", { class: "zh-card__emoji" }, w.emoji), rubyEl(w.zh, w.bopo, "div", { class: "zh-card__zh" }), el("div", { class: "flashcard__hint" }, t("再點一次翻回來")));
    card.addEventListener("click", () => { flipped = !flipped; flipped ? back() : front(); speakZh(w.zh); });
    front();
    app.replaceChildren(card, el("div", { class: "flash-actions" },
      el("button", { class: "btn btn--success", onclick: () => { recordZh(w.zh, true); dingCorrect(); i++; render(); } }, t("✅ 我會念")),
      el("button", { class: "btn btn--ghost", onclick: () => { i++; render(); } }, t("🔁 再練習"))));
  };
  render();
  return root;
}

// === 👂 聽音選注音：聽發音，選出正確的注音（錯的選項只差一點點）===
function renderZhListen(l) {
  const { root, app, progressLabel } = zhShell(l, "👂 聽音選注音");
  const words = shuffle(l.words);
  let i = 0, score = 0;
  const missed = new Set();
  const render = () => {
    if (i >= words.length) return zhResult(app, l, "listen", score, words.length, missed);
    const w = words[i];
    progressLabel.textContent = `${i + 1}/${words.length}・${score}分`;
    const wrong = shuffle(bopoVariants(w.bopo)).slice(0, 2);
    const other = shuffle(l.words.filter(x => x.bopo !== w.bopo && x.bopo.split(" ").length === w.bopo.split(" ").length)).map(x => x.bopo)[0];
    const opts = shuffle([w.bopo, ...wrong, ...(other ? [other] : [])]).slice(0, 4);
    if (!opts.includes(w.bopo)) opts[0] = w.bopo;
    let locked = false;
    const feedback = el("div", { class: "quiz-feedback" });
    const grid = el("div", { class: "zh-opts" });
    shuffle(opts).forEach(o => {
      const b = el("button", { class: "zh-opt" }, bopoWordEl(o, { class: "bopo-word--lg" }));
      b.addEventListener("click", () => {
        if (locked) return; locked = true;
        if (o === w.bopo) {
          b.classList.add("zh-opt--ok"); feedback.textContent = "答對了！🎉"; feedback.className = "quiz-feedback quiz-feedback--correct pop";
          if (!missed.has(w.zh)) score++;
          recordZh(w.zh, true); dingCorrect();
          setTimeout(() => { i++; render(); }, 1100);
        } else {
          b.classList.add("zh-opt--bad"); missed.add(w.zh); recordZh(w.zh, false); buzzWrong();
          feedback.textContent = "再聽一次，仔細比比看"; feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          [...grid.children].forEach(x => { if (x === b) x.disabled = true; });
          setTimeout(() => { locked = false; speakZh(w.zh); }, 700);
        }
      });
      grid.appendChild(b);
    });
    app.replaceChildren(
      el("div", { class: "quiz-prompt" }, el("div", { class: "quiz-prompt__emoji" }, w.emoji),
        el("button", { class: "icon-btn icon-btn--big icon-btn--accent", onclick: () => speakZh(w.zh), "aria-label": "再聽一次" }, "🔊"),
        el("div", { class: "quiz-prompt__hint" }, t("聽一聽，選出正確的注音"))),
      grid, feedback);
    setTimeout(() => speakZh(w.zh), 250);
  };
  render();
  return root;
}

// === 🎵 加聲調：一個字的聲調被蓋起來，選出正確的聲調 ===
function renderZhTone(l) {
  const { root, app, progressLabel } = zhShell(l, "🎵 加聲調");
  // 每個詞挑一個字來考（避開輕聲以外都可以；輕聲也考）
  const qs = shuffle(l.words).map(w => ({ w, k: Math.floor(Math.random() * w.bopo.split(" ").length) }));
  let i = 0, score = 0;
  const missed = new Set();
  const render = () => {
    if (i >= qs.length) return zhResult(app, l, "tone", score, qs.length, missed);
    const { w, k } = qs[i];
    progressLabel.textContent = `${i + 1}/${qs.length}・${score}分`;
    const syls = w.bopo.split(" ");
    const target = splitSyl(syls[k]);
    const show = (tone, cls) => {
      const row = el("span", { class: "bopo-word bopo-word--xl" });
      syls.forEach((r, j) => {
        if (j !== k) { row.appendChild(bopoColEl(r)); return; }
        const col = bopoColEl(target.symbols.join("") + (tone ?? ""));
        col.classList.add("zh-tone-target"); if (cls) col.classList.add(cls);
        row.appendChild(col);
      });
      return row;
    };
    const wordBox = el("div", { class: "zh-tone-word" }, show("", "zh-tone-target--ask"));
    const feedback = el("div", { class: "quiz-feedback" });
    let locked = false;
    const btns = el("div", { class: "zh-tones" }, TONES.map(([tn, name]) => {
      const b = el("button", { class: "zh-tone-btn" }, el("span", { class: "zh-tone-btn__mark" }, tn || "ˉ"), t(name));
      b.addEventListener("click", () => {
        if (locked) return;
        if (tn === target.tone) {
          locked = true;
          wordBox.replaceChildren(show(tn, "zh-tone-target--ok"));
          feedback.textContent = "答對了！🎉"; feedback.className = "quiz-feedback quiz-feedback--correct pop";
          if (!missed.has(w.zh)) score++;
          recordZh(w.zh, true); dingCorrect(); speakZh(w.zh);
          setTimeout(() => { i++; render(); }, 1200);
        } else {
          b.disabled = true; missed.add(w.zh); recordZh(w.zh, false); buzzWrong();
          feedback.textContent = "再聽一次～"; feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          speakZh(w.zh);
        }
      });
      return b;
    }));
    app.replaceChildren(
      el("div", { class: "quiz-prompt" }, el("div", { class: "quiz-prompt__emoji" }, w.emoji), wordBox,
        el("button", { class: "icon-btn icon-btn--accent", style: "width: 52px; height: 52px; font-size: 24px; margin: 8px auto 0;", onclick: () => speakZh(w.zh), "aria-label": "聽" }, "🔊"),
        el("div", { class: "quiz-prompt__hint" }, t("黃色框的字是第幾聲？"))),
      btns, feedback);
    setTimeout(() => speakZh(w.zh), 250);
  };
  render();
  return root;
}

// === 🔤 拼注音（聽寫）：聽發音，一個字一個字點注音、選聲調 ===
function renderZhSpell(l) {
  const { root, app, progressLabel } = zhShell(l, "🔤 拼注音");
  const words = shuffle(l.words);
  let i = 0, score = 0;
  const missed = new Set();
  const render = () => {
    if (i >= words.length) return zhResult(app, l, "spell", score, words.length, missed);
    const w = words[i];
    const syls = w.bopo.split(" ").map(splitSyl);
    let s = 0; // 第幾個字
    progressLabel.textContent = `${i + 1}/${words.length}・${score}分`;
    const doneRow = el("div", { class: "bopo-word bopo-word--xl zh-spell-done" });
    const stage = el("div", {});
    const feedback = el("div", { class: "quiz-feedback" });
    const nextSyl = () => {
      if (s >= syls.length) {
        feedback.textContent = "答對了！🎉"; feedback.className = "quiz-feedback quiz-feedback--correct pop";
        if (!missed.has(w.zh)) score++;
        recordZh(w.zh, true); dingCorrect(); speakZh(w.zh);
        stage.replaceChildren(rubyEl(w.zh, w.bopo, "div", { class: "zh-card__zh" }));
        setTimeout(() => { i++; render(); }, 1400);
        return;
      }
      const target = syls[s];
      const pool = new Set(target.symbols);
      target.symbols.forEach(c => confusableOf(c).forEach(x => pool.size < target.symbols.length + 2 && pool.add(x)));
      while (pool.size < target.symbols.length + 2) pool.add(ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]);
      const tiles = shuffle([...pool]);
      const filled = [];
      let tone = null;
      const slots = el("div", { class: "zh-slots" });
      const tileRow = el("div", { class: "spell-tiles" });
      const toneRow = el("div", { class: "zh-tones zh-tones--sm" });
      const draw = () => {
        slots.replaceChildren(...target.symbols.map((_, j) =>
          el("button", { class: `spell-slot ${filled[j] ? "spell-slot--filled" : ""}`, onclick: () => { if (filled[j]) { filled.splice(j); draw(); } } }, filled[j] || "")),
          el("span", { class: `zh-tone-slot ${tone !== null ? "spell-slot--filled" : ""}` }, tone === null ? "？" : (tone || "ˉ")));
        tileRow.replaceChildren(...tiles.map(c => el("button", { class: "spell-tile", onclick: () => { if (filled.length < target.symbols.length) { filled.push(c); draw(); check(); } } }, c)));
        toneRow.replaceChildren(...TONES.map(([tn, name]) => el("button", { class: `zh-tone-btn ${tone === tn ? "zh-tone-btn--on" : ""}`, onclick: () => { tone = tn; draw(); check(); } }, el("span", { class: "zh-tone-btn__mark" }, tn || "ˉ"), t(name))));
      };
      const check = () => {
        if (filled.length < target.symbols.length || tone === null) return;
        if (filled.join("") === target.symbols.join("") && tone === target.tone) {
          doneRow.appendChild(bopoColEl(target.symbols.join("") + target.tone));
          dingCorrect(); s++; feedback.textContent = ""; nextSyl();
        } else {
          missed.add(w.zh); recordZh(w.zh, false); buzzWrong();
          const symOk = filled.join("") === target.symbols.join("");
          feedback.textContent = symOk ? "注音對了，聲調再想想！" : "再聽一次，注音不太對喔";
          feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          if (!symOk) filled.length = 0;
          tone = null; draw(); speakZh(w.zh);
        }
      };
      draw();
      stage.replaceChildren(
        el("div", { class: "zh-spell-step" }, t(`第 ${s + 1} 個字`), `（共 ${syls.length} 個）`),
        slots, tileRow, el("div", { class: "zh-spell-label" }, t("選聲調：")), toneRow,
        el("div", { class: "spell-actions" },
          el("button", { class: "btn btn--ghost", onclick: () => { filled.length = 0; tone = null; draw(); } }, t("🧹 重來")),
          el("button", { class: "btn btn--ghost", onclick: () => { missed.add(w.zh); filled.length = 0; target.symbols.forEach(c => filled.push(c)); tone = target.tone; draw(); setTimeout(check, 600); } }, t("💡 看答案"))));
    };
    app.replaceChildren(
      el("div", { class: "quiz-prompt" }, el("div", { class: "quiz-prompt__emoji" }, w.emoji),
        el("button", { class: "icon-btn icon-btn--big icon-btn--accent", onclick: () => speakZh(w.zh), "aria-label": "再聽一次" }, "🔊"),
        doneRow),
      stage, feedback);
    nextSyl();
    setTimeout(() => speakZh(w.zh), 250);
  };
  render();
  return root;
}

// === ✍️ 寫注音：描寫，或 看→遮→寫→對（默寫），注音直著寫 ===
function renderZhWrite(l) {
  const { root, app, progressLabel } = zhShell(l, "✍️ 寫注音");
  const words = shuffle(l.words);
  let i = 0;
  let style = STORE.settings.zhWriteStyle === "recall" ? "recall" : "trace";
  const btn = (cls, label, fn) => { const b = el("button", { class: `btn ${cls}` }, t(label)); b.addEventListener("click", fn); return b; };
  const render = () => {
    if (i >= words.length) { app.replaceChildren(renderResultBlock(`寫完 ${words.length} 個詞！`, "🌟", "再寫一次", () => { i = 0; render(); })); return; }
    const w = words[i];
    progressLabel.textContent = `${i + 1}/${words.length}`;
    const tabs = el("div", { class: "pick-tabs pick-tabs--2", style: "margin-bottom: 10px;" },
      [["trace", "✏️ 描寫"], ["recall", "🙈 默寫"]].map(([id, label]) =>
        el("button", { class: `pick-tab ${style === id ? "pick-tab--on" : ""}`, onclick: () => { style = id; STORE.settings.zhWriteStyle = id; saveStore(); render(); } }, t(label))));
    const stepText = el("div", { class: "write-step" });
    const wrap = el("div", { class: "write-canvas-wrap zh-write-wrap" });
    const canvas = el("canvas", { class: "write-canvas zh-write-canvas" });
    const guide = el("div", { class: "write-guide zh-write-guide" }, bopoWordEl(w.bopo, { class: "bopo-word--guide" }));
    wrap.append(guide, canvas);
    const actions = el("div", { class: "write-actions" });
    app.replaceChildren(tabs, el("div", { class: "write-card" },
      el("div", { class: "write-prompt" }, `${w.emoji} `, rubyEl(w.zh, w.bopo, "span")),
      stepText,
      el("button", { class: "icon-btn icon-btn--accent write-speak", onclick: () => speakZh(w.zh), "aria-label": "念出" }, "🔊"),
      wrap, actions));
    const pen = setupCanvas(canvas);
    const next = () => setTimeout(() => { i++; render(); }, 600);
    if (style === "trace") {
      stepText.replaceChildren(t("照著淡淡的注音描寫，聲調也要寫 ✍️"));
      actions.replaceChildren(btn("btn--ghost", "🧹 清除重寫", () => pen.clear()), btn("btn--success", "✅ 寫好了！", () => { recordZh(w.zh, true); dingCorrect(); next(); }));
    } else {
      const look = () => {
        guide.style.visibility = ""; guide.classList.add("write-guide--show"); guide.classList.remove("write-guide--check");
        canvas.style.pointerEvents = "none"; pen.clear();
        stepText.replaceChildren(t("① 看：看清楚、念出來"));
        actions.replaceChildren(btn("btn--accent btn--full", "② 記住了，蓋起來 🙈", cover));
        speakZh(w.zh);
      };
      const cover = () => {
        guide.style.visibility = "hidden"; canvas.style.pointerEvents = ""; pen.clear();
        stepText.replaceChildren(t("③ 寫：自己寫寫看，聲調也要寫"));
        actions.replaceChildren(btn("btn--ghost", "🧹 清除", () => pen.clear()), btn("btn--accent", "④ 寫好了，對答案 👀", check));
      };
      const check = () => {
        guide.style.visibility = ""; guide.classList.remove("write-guide--show"); guide.classList.add("write-guide--check");
        stepText.replaceChildren(t("④ 對：跟答案一樣嗎？"));
        actions.replaceChildren(btn("btn--ghost", "🔁 不太對，再一次", () => { recordZh(w.zh, false); look(); }), btn("btn--success", "✅ 寫對了！", () => { recordZh(w.zh, true); dingCorrect(); next(); }));
      };
      setTimeout(look, 0);
    }
    setTimeout(() => { pen.resize(); if (style === "trace") speakZh(w.zh); }, 100);
  };
  render();
  return root;
}

// 注音符號單獨念的時候，用有這個音的字讓 TTS 念得出來
const ZH_SYMBOL_SAY = { "ㄅ": "ㄅ", "ㄆ": "ㄆ", "ㄇ": "ㄇ", "ㄈ": "ㄈ", "ㄉ": "ㄉ", "ㄊ": "ㄊ", "ㄋ": "ㄋ", "ㄌ": "ㄌ", "ㄍ": "ㄍ", "ㄎ": "ㄎ", "ㄏ": "ㄏ", "ㄐ": "ㄐ", "ㄑ": "ㄑ", "ㄒ": "ㄒ", "ㄓ": "ㄓ", "ㄔ": "ㄔ", "ㄕ": "ㄕ", "ㄖ": "ㄖ", "ㄗ": "ㄗ", "ㄘ": "ㄘ", "ㄙ": "ㄙ", "ㄚ": "啊", "ㄛ": "喔", "ㄜ": "鵝", "ㄝ": "ㄝ", "ㄞ": "哀", "ㄟ": "ㄟ", "ㄠ": "凹", "ㄡ": "歐", "ㄢ": "安", "ㄣ": "恩", "ㄤ": "骯", "ㄥ": "ㄥ", "ㄦ": "兒", "ㄧ": "衣", "ㄨ": "屋", "ㄩ": "迂" };

// === 🔗 連句子（習作 p.68）：誰 → 在哪裡 → 做什麼，照課本的三段選 ===
function renderZhSentence(l) {
  const { root, app, progressLabel } = zhShell(l, "🔗 連句子");
  const qs = shuffle(l.sentences);
  let i = 0, score = 0;
  const missed = new Set();
  const render = () => {
    if (i >= qs.length) {
      app.replaceChildren(renderResultBlock(`答對 ${score} / ${qs.length}`, score === qs.length ? "🌟" : score >= qs.length * 0.7 ? "🎉" : "💪", "再來一次", () => navigate(`#/zhplay/sentence?l=${l.id}`),
        missed.size ? el("div", { class: "zh-missed" }, el("div", { class: "zh-missed__title" }, t("要再練的：")), [...missed].map(zh => el("span", { class: "zh-chip" }, zh))) : null));
      return;
    }
    const q = qs[i];
    progressLabel.textContent = `${i + 1}/${qs.length}`;
    let step = 0, wrongHere = false;
    const picked = [];
    const line = el("div", { class: "zh-sent" });
    const opts = el("div", { class: "zh-opts" });
    const feedback = el("div", { class: "quiz-feedback" });
    const sayAll = () => speakZh(`${q.who.zh}${picked.map(p => p.zh).join("")}`);
    const drawLine = () => {
      line.replaceChildren(el("span", { class: "zh-sent__emoji" }, q.emoji), rubyEl(q.who.zh, q.who.bopo, "span", { class: "zh-sent__part" }),
        ...["where", "what"].map((k, idx) => picked[idx] ? rubyEl(picked[idx].zh, picked[idx].bopo, "span", { class: "zh-sent__part zh-sent__part--on" }) : el("span", { class: `zh-sent__blank ${step === idx ? "zh-sent__blank--now" : ""}` }, idx === 0 ? "在哪裡？" : "做什麼？")));
    };
    const ask = () => {
      drawLine();
      if (step > 1) { // 完成
        feedback.textContent = "連好了！🎉"; feedback.className = "quiz-feedback quiz-feedback--correct pop";
        if (!wrongHere) score++; else missed.add(q.who.zh);
        recordZh(q.who.zh, !wrongHere); dingCorrect(); sayAll();
        opts.replaceChildren(el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => { i++; render(); } }, t("下一題 ▶")));
        return;
      }
      const key = step === 0 ? "where" : "what";
      const answer = q[key];
      const choices = shuffle(l.sentences.map(s => s[key]));
      opts.replaceChildren(...choices.map(c => {
        const b = el("button", { class: "zh-opt" }, rubyEl(c.zh, c.bopo, "span"));
        b.addEventListener("click", () => {
          if (c.zh === answer.zh) { b.classList.add("zh-opt--ok"); picked.push(c); step++; speakZh(c.zh); setTimeout(ask, 500); }
          else { b.classList.add("zh-opt--bad"); b.disabled = true; wrongHere = true; buzzWrong(); feedback.textContent = "再想想，看圖裡的動物在哪裡"; feedback.className = "quiz-feedback quiz-feedback--wrong shake"; }
        });
        return b;
      }));
    };
    app.replaceChildren(el("div", { class: "zh-sent__wrap" }, el("div", { class: "m-hint" }, t("照習作第68頁：先選在哪裡，再選做什麼")), line,
      el("button", { class: "icon-btn icon-btn--accent m-speak", onclick: () => speakZh(q.who.zh), "aria-label": "念" }, "🔊")), opts, feedback);
    ask();
    setTimeout(() => speakZh(q.who.zh), 250);
  };
  render();
  return root;
}

function renderZhPlay(mode, lessonId) {
  const l = zhLesson(lessonId);
  if (!l) return renderEmpty("#/", "找不到這一課");
  if (l.kind === "chars") return renderZh2Play(mode, l);
  if (mode === "sentence" && !l.sentences) return renderZhLesson(l.id);
  return ({ card: renderZhCard, listen: renderZhListen, tone: renderZhTone, spell: renderZhSpell, write: renderZhWrite, sentence: renderZhSentence })[mode]?.(l) || renderZhLesson(l.id);
}
