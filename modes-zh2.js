// 國語（二年級）：生字課 kind:"chars" 的練習
// 資料在 data-zh.js 的 ZH_DATA.g2，每課 chars:[{ zh, bopo, radical, extra, strokes, word, wordBopo, confuse }]
// 模式：生字卡、聽寫國字（看→蓋→寫→對）、選國字、部首、筆畫數、小考（混合）

const ZH2_MODES = [
  ["card",    "🃏", "生字卡"],
  ["write",   "✍️", "聽寫國字"],
  ["pick",    "🔍", "選國字"],
  ["radical", "🧩", "部首"],
  ["strokes", "✏️", "筆畫數"],
  ["quiz",    "📝", "小考"],
];

const RADICAL_NAMES = { "水": "水（氵）", "手": "手（扌）", "肉": "肉（月）", "人": "人（亻）", "宀": "宀（寶蓋頭）", "言": "言" };
const radicalLabel = r => RADICAL_NAMES[r] || r;

// 課的頁面
function renderZhCharLesson(l) {
  const prog = zhProgressOf();
  const root = el("div", {});
  root.appendChild(renderHeader(`${l.emoji} ${l.title}`, { back: "#/" }));
  const app = el("main", { class: "app" });
  app.appendChild(questEntryBtn("zh", l.id));
  app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t("✏️ 選一種練習")),
    el("div", { class: "mode-grid" }, ZH2_MODES.map(([m, emoji, label]) =>
      el("button", { class: "mode-btn", onclick: () => navigate(`#/zhplay/${m}?l=${l.id}`) }, el("span", { class: "mode-btn__emoji" }, emoji), t(label))))));

  // 生字表（照課本 p.52：部首／部首外筆畫／總筆畫）
  app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t(`✍️ 我會寫的字（共 ${l.chars.length}，點一個聽一個）`)),
    el("div", { class: "c-grid" }, l.chars.map(c =>
      el("button", { class: `c-cell ${prog[c.zh]?.mastered ? "c-cell--done" : ""}`, onclick: () => speakZh(`${c.zh}，${c.word}`) },
        el("div", { class: "c-cell__top" }, el("span", { class: "c-cell__rad" }, t(c.radical)), el("span", { class: "c-cell__num" }, `${c.extra}/${c.strokes}`)),
        rubyEl(c.zh, c.bopo, "div", { class: "c-cell__zh" }),
        rubyEl(c.word, c.wordBopo, "div", { class: "c-cell__word" }))))));

  if (l.text) app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t(l.textTitle || "📖 課文（照課本分段，點一段聽一段）")),
    el("div", { class: "zh-text" }, l.text.map(zhTextBlock))));

  if (l.words) app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t(`📝 詞語（共 ${l.words.length}）`)),
    el("div", { class: "word-list zh-word-list" }, l.words.map(w =>
      el("div", { class: "word-row" },
        el("span", { class: "word-row__emoji" }, w.emoji),
        el("div", { class: "word-row__text" }, el("div", { class: "word-row__zh" }, el("span", { class: "zh-row__no" }, `${w.no}.`), rubyEl(w.zh, w.bopo, "span"))),
        el("button", { class: "word-row__speak", onclick: () => speakZh(w.zh), "aria-label": `念 ${w.zh}` }, "🔊"))))));
  root.appendChild(app);
  return root;
}

// 課文一段：前面有課本的段落編號（一、二…）；便條照課本分行、放在便條紙上
function zhTextBlock(line) {
  if (line.note) return el("button", { class: "zh-text__line zh-note", onclick: () => speakZh(line.zh) },
    el("div", { class: "zh-note__tag" }, t(`📝 ${line.note}`)),
    line.lines.map(x => rubyEl(x.zh, x.bopo, "div", { class: `zh-note__line ${x.right ? "zh-note__line--right" : ""}` })));
  return el("button", { class: "zh-text__line zh-text__para", onclick: () => speakZh(line.zh) },
    line.para ? el("span", { class: "zh-para", "data-nobopo": "" }, line.para) : null, rubyEl(line.zh, line.bopo, "span"));
}

// 共用：題目卡（例詞，目標字挖空或顯示）
function charPromptEl(c, hide) {
  const wrap = el("div", { class: "c-prompt" });
  const parts = c.word.split("");
  const bopos = c.wordBopo.split(/\s+/);
  parts.forEach((ch, i) => {
    if (ch === c.zh && hide) wrap.appendChild(el("span", { class: "zh-pair c-blank" }, el("span", { class: "zh-base" }, "？"), bopoColEl(bopos[i] || "")));
    else wrap.appendChild(rubyEl(ch, bopos[i] || "", "span", { class: ch === c.zh ? "c-target" : "" }));
  });
  return wrap;
}
function zh2Result(app, l, mode, score, total, missed) {
  app.replaceChildren(renderResultBlock(`答對 ${score} / ${total}`, score === total ? "🌟" : score >= total * 0.7 ? "🎉" : "💪", "再來一次", () => navigate(`#/zhplay/${mode}?l=${l.id}`),
    missed.size ? el("div", { class: "zh-missed" }, el("div", { class: "zh-missed__title" }, t("要再練的：")),
      [...missed].map(zh => { const c = l.chars.find(x => x.zh === zh); return el("span", { class: "zh-chip" }, rubyEl(c.zh, c.bopo, "span")); })) : null));
}
// 四選一的通用題：options [{label(node), ok}]
function choiceRow(options, onPick) {
  let locked = false, tries = 0;
  return el("div", { class: "zh-opts" }, options.map(o => {
    const b = el("button", { class: "zh-opt" }, o.label);
    b.addEventListener("click", () => {
      if (locked) return;
      if (o.ok) { locked = true; b.classList.add("zh-opt--ok"); onPick(tries === 0); }
      else { tries++; b.classList.add("zh-opt--bad"); b.disabled = true; buzzWrong(); }
    });
    return b;
  }));
}

// 🃏 生字卡
function renderZh2Card(l) {
  const { root, app, progressLabel } = zhShell(l, "🃏 生字卡");
  const chars = shuffle(l.chars);
  let i = 0;
  const render = () => {
    if (i >= chars.length) { app.replaceChildren(renderResultBlock("看完一輪了！", "🎉", "再看一次", () => { i = 0; render(); })); return; }
    const c = chars[i];
    progressLabel.textContent = `${i + 1}/${chars.length}`;
    const card = el("div", { class: "c-card" },
      rubyEl(c.zh, c.bopo, "div", { class: "c-card__zh" }),
      el("div", { class: "c-card__info" },
        el("span", { class: "c-info" }, t("部首："), t(radicalLabel(c.radical))),
        el("span", { class: "c-info" }, t("部首外："), `${c.extra}`, t("畫")),
        el("span", { class: "c-info" }, t("總筆畫："), `${c.strokes}`, t("畫"))),
      el("div", { class: "c-card__word" }, charPromptEl(c, false)),
      c.note ? el("div", { class: "zh-note" }, t(c.note)) : null,
      el("button", { class: "icon-btn icon-btn--accent m-speak", onclick: () => speakZh(`${c.zh}，${c.word}`), "aria-label": "念" }, "🔊"));
    app.replaceChildren(card, el("div", { class: "flash-actions" },
      el("button", { class: "btn btn--success", onclick: () => { recordZh(c.zh, true); dingCorrect(); i++; render(); } }, t("✅ 我會寫")),
      el("button", { class: "btn btn--ghost", onclick: () => { i++; render(); } }, t("🔁 再練習"))));
    setTimeout(() => speakZh(`${c.zh}，${c.word}`), 200);
  };
  render();
  return root;
}

// ✍️ 聽寫國字：看 → 蓋起來 → 寫 → 對答案（描寫／默寫）
function renderZh2Write(l) {
  const { root, app, progressLabel } = zhShell(l, "✍️ 聽寫國字");
  const chars = shuffle(l.chars);
  let i = 0;
  let style = STORE.settings.zh2WriteStyle === "trace" ? "trace" : "recall";
  const btn = (cls, label, fn) => { const b = el("button", { class: `btn ${cls}` }, t(label)); b.addEventListener("click", fn); return b; };
  const render = () => {
    if (i >= chars.length) { app.replaceChildren(renderResultBlock(`寫完 ${chars.length} 個字！`, "🌟", "再寫一次", () => { i = 0; render(); })); return; }
    const c = chars[i];
    progressLabel.textContent = `${i + 1}/${chars.length}`;
    const tabs = el("div", { class: "pick-tabs pick-tabs--2", style: "margin-bottom: 10px;" },
      [["recall", "🙈 默寫（像考試）"], ["trace", "✏️ 描寫"]].map(([id, label]) =>
        el("button", { class: `pick-tab ${style === id ? "pick-tab--on" : ""}`, onclick: () => { style = id; STORE.settings.zh2WriteStyle = id; saveStore(); render(); } }, t(label))));
    const stepText = el("div", { class: "write-step" });
    const wrap = el("div", { class: "write-canvas-wrap c-write-wrap" });
    const canvas = el("canvas", { class: "write-canvas zh-write-canvas" });
    const guide = el("div", { class: "write-guide c-write-guide" }, el("span", { class: "c-guide__zh", "data-nobopo": "1" }, c.zh));
    wrap.append(el("div", { class: "c-write-grid" }), guide, canvas);
    const actions = el("div", { class: "write-actions" });
    const prompt = el("div", { class: "write-prompt" });
    app.replaceChildren(tabs, el("div", { class: "write-card" }, prompt, stepText,
      el("button", { class: "icon-btn icon-btn--accent write-speak", onclick: () => speakZh(`${c.zh}，${c.word}`), "aria-label": "念出" }, "🔊"),
      wrap, actions));
    const pen = setupCanvas(canvas);
    const next = () => setTimeout(() => { i++; render(); }, 600);
    if (style === "trace") {
      prompt.replaceChildren(charPromptEl(c, false));
      stepText.replaceChildren(t("照著淡淡的字描寫，注意筆順 ✍️"));
      actions.replaceChildren(btn("btn--ghost", "🧹 清除重寫", () => pen.clear()), btn("btn--success", "✅ 寫好了！", () => { recordZh(c.zh, true); dingCorrect(); next(); }));
    } else {
      const look = () => {
        prompt.replaceChildren(charPromptEl(c, false));
        guide.style.visibility = ""; guide.classList.add("write-guide--show"); guide.classList.remove("write-guide--check");
        canvas.style.pointerEvents = "none"; pen.clear();
        stepText.replaceChildren(t("① 看：看清楚這個字怎麼寫"));
        actions.replaceChildren(btn("btn--accent btn--full", "② 記住了，蓋起來 🙈", cover));
        speakZh(`${c.zh}，${c.word}`);
      };
      const cover = () => {
        prompt.replaceChildren(charPromptEl(c, true));
        guide.style.visibility = "hidden"; canvas.style.pointerEvents = ""; pen.clear();
        stepText.replaceChildren(t("③ 寫：聽注音，把「？」的字寫出來"));
        actions.replaceChildren(btn("btn--ghost", "🧹 清除", () => pen.clear()), btn("btn--accent", "④ 寫好了，對答案 👀", check));
        speakZh(c.word);
      };
      const check = () => {
        prompt.replaceChildren(charPromptEl(c, false));
        guide.style.visibility = ""; guide.classList.remove("write-guide--show"); guide.classList.add("write-guide--check");
        stepText.replaceChildren(t("④ 對：跟答案一樣嗎？"));
        actions.replaceChildren(btn("btn--ghost", "🔁 不太對，再一次", () => { recordZh(c.zh, false); look(); }), btn("btn--success", "✅ 寫對了！", () => { recordZh(c.zh, true); dingCorrect(); next(); }));
      };
      setTimeout(look, 0);
    }
    setTimeout(() => { pen.resize(); if (style === "trace") speakZh(`${c.zh}，${c.word}`); }, 100);
  };
  render();
  return root;
}

// 🔍 選國字：例詞挖空，四個長得像的字選一個
function zh2PickQuestion(l, c) {
  const pool = shuffle([...c.confuse.split(""), ...l.chars.filter(x => x.zh !== c.zh).map(x => x.zh)]);
  const opts = shuffle([c.zh, ...[...new Set(pool)].filter(z => z !== c.zh).slice(0, 3)]);
  return { prompt: charPromptEl(c, true), say: c.word, options: opts.map(z => ({ label: el("span", { class: "c-opt__zh", "data-nobopo": "1" }, z), ok: z === c.zh })) };
}
// 🧩 部首
function zh2RadicalQuestion(l, c) {
  const others = shuffle([...new Set(l.chars.map(x => x.radical).filter(r => r !== c.radical))]).slice(0, 3);
  const opts = shuffle([c.radical, ...others]);
  return { prompt: el("div", { class: "c-prompt" }, rubyEl(c.zh, c.bopo, "span", { class: "c-target c-big" }), t("的部首是？")), say: `${c.zh}的部首是什麼`, options: opts.map(r => ({ label: t(radicalLabel(r)), ok: r === c.radical })) };
}
// ✏️ 筆畫數（總筆畫；部首外筆畫另一題）
function zh2StrokeQuestion(l, c, kind) {
  const ans = kind === "extra" ? c.extra : c.strokes;
  const cands = new Set(); let d = 1;
  while (cands.size < 3) { [ans - d, ans + d].forEach(v => { if (v >= 0 && v !== ans && cands.size < 3) cands.add(v); }); d++; }
  const opts = shuffle([ans, ...cands]);
  return { prompt: el("div", { class: "c-prompt" }, rubyEl(c.zh, c.bopo, "span", { class: "c-target c-big" }), t(kind === "extra" ? `部首「${c.radical}」以外有幾畫？` : "總共幾畫？")), say: kind === "extra" ? `${c.zh}，部首以外有幾畫` : `${c.zh}，總共幾畫`, options: opts.map(v => ({ label: el("span", { class: "c-opt__num" }, `${v}`), ok: v === ans })), sub: kind === "extra" ? "（寫法：部首外筆畫／總筆畫，像課本的 13／16）" : null };
}

// 通用的四選一練習
function renderZh2Choice(l, mode, title, makeQs) {
  const { root, app, progressLabel } = zhShell(l, title);
  const qs = makeQs();
  let i = 0, score = 0;
  const missed = new Set();
  const render = () => {
    if (i >= qs.length) return zh2Result(app, l, mode, score, qs.length, missed);
    const { c, q } = qs[i];
    progressLabel.textContent = `${i + 1}/${qs.length}`;
    const feedback = el("div", { class: "quiz-feedback" });
    const row = choiceRow(q.options, firstTry => {
      if (firstTry) score++; else missed.add(c.zh);
      recordZh(c.zh, firstTry); dingCorrect();
      feedback.textContent = "答對了！🎉"; feedback.className = "quiz-feedback quiz-feedback--correct pop";
      setTimeout(() => { i++; render(); }, 900);
    });
    app.replaceChildren(el("div", { class: "c-qcard" }, q.prompt, q.sub ? el("div", { class: "m-hint" }, t(q.sub)) : null,
      el("button", { class: "icon-btn icon-btn--accent m-speak", onclick: () => speakZh(q.say), "aria-label": "念" }, "🔊")), row, feedback);
    setTimeout(() => speakZh(q.say), 250);
  };
  render();
  return root;
}
function renderZh2Pick(l) { return renderZh2Choice(l, "pick", "🔍 選國字", () => shuffle(l.chars).map(c => ({ c, q: zh2PickQuestion(l, c) }))); }
function renderZh2Radical(l) { return renderZh2Choice(l, "radical", "🧩 部首", () => shuffle(l.chars).map(c => ({ c, q: zh2RadicalQuestion(l, c) }))); }
function renderZh2Strokes(l) { return renderZh2Choice(l, "strokes", "✏️ 筆畫數", () => shuffle(l.chars).flatMap(c => [{ c, q: zh2StrokeQuestion(l, c, "total") }, { c, q: zh2StrokeQuestion(l, c, "extra") }])); }
function renderZh2Quiz(l) {
  return renderZh2Choice(l, "quiz", "📝 小考", () => {
    const qs = shuffle(l.chars).slice(0, 12).map(c => { const k = ["pick", "radical", "total", "extra"][Math.floor(Math.random() * 4)]; return { c, q: k === "pick" ? zh2PickQuestion(l, c) : k === "radical" ? zh2RadicalQuestion(l, c) : zh2StrokeQuestion(l, c, k) }; });
    return qs;
  });
}

function renderZh2Play(mode, l) {
  return ({ card: renderZh2Card, write: renderZh2Write, pick: renderZh2Pick, radical: renderZh2Radical, strokes: renderZh2Strokes, quiz: renderZh2Quiz })[mode]?.(l) || renderZhCharLesson(l);
}
