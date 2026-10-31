// 🔤 注音總複習・大會考（一年級期中考：37 個注音全部都考）
// 題型：聲母（蓋住第一個注音）、韻母（蓋住後面的注音）、聲調（蓋住聲調）、聽詞選注音；每題都先聽詞（念國字，Google 念得準）
// 練習：答錯要自己再選對，旁邊出現「記一記」教怎麼分（ㄅㄆ 送不送氣、ㄓㄗ 翹不翹舌…），錯的 2 題後再考
// 模擬考：一題一題寫，選好按「下一題」才會換（一定要作答，不能跳過），交卷才看分數，紀錄在 profile.mockExams["zh:bopo"]
const BP_INITIALS = [..."ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ"];
const BP_FINALS = [..."ㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ"];
// 每個注音的代表詞：[注音, 國字, 注音（教育部）, 圖]；韻母的詞裡要有這個注音
const BP_WORDS = [
  ["ㄅ", "爸爸", "ㄅㄚˋ ㄅㄚ˙", "👨"], ["ㄆ", "葡萄", "ㄆㄨˊ ㄊㄠˊ", "🍇"], ["ㄇ", "貓", "ㄇㄠ", "🐱"], ["ㄈ", "飛機", "ㄈㄟ ㄐㄧ", "✈️"],
  ["ㄉ", "大象", "ㄉㄚˋ ㄒㄧㄤˋ", "🐘"], ["ㄊ", "兔子", "ㄊㄨˋ ㄗ˙", "🐰"], ["ㄋ", "牛", "ㄋㄧㄡˊ", "🐮"], ["ㄌ", "老虎", "ㄌㄠˇ ㄏㄨˇ", "🐯"],
  ["ㄍ", "狗", "ㄍㄡˇ", "🐶"], ["ㄎ", "褲子", "ㄎㄨˋ ㄗ˙", "👖"], ["ㄏ", "花", "ㄏㄨㄚ", "🌸"],
  ["ㄐ", "雞", "ㄐㄧ", "🐔"], ["ㄑ", "汽車", "ㄑㄧˋ ㄔㄜ", "🚗"], ["ㄒ", "西瓜", "ㄒㄧ ㄍㄨㄚ", "🍉"],
  ["ㄓ", "豬", "ㄓㄨ", "🐷"], ["ㄔ", "吃飯", "ㄔ ㄈㄢˋ", "🍚"], ["ㄕ", "書", "ㄕㄨ", "📖"], ["ㄖ", "肉", "ㄖㄡˋ", "🍖"],
  ["ㄗ", "嘴巴", "ㄗㄨㄟˇ ㄅㄚ˙", "👄"], ["ㄘ", "草", "ㄘㄠˇ", "🌿"], ["ㄙ", "傘", "ㄙㄢˇ", "☂️"],
  ["ㄧ", "椅子", "ㄧˇ ㄗ˙", "🪑"], ["ㄨ", "烏龜", "ㄨ ㄍㄨㄟ", "🐢"], ["ㄩ", "魚", "ㄩˊ", "🐟"],
  ["ㄚ", "阿姨", "ㄚ ㄧˊ", "👩"], ["ㄛ", "外婆", "ㄨㄞˋ ㄆㄛˊ", "👵"], ["ㄜ", "鵝", "ㄜˊ", "🦢"], ["ㄝ", "葉子", "ㄧㄝˋ ㄗ˙", "🍃"],
  ["ㄞ", "愛心", "ㄞˋ ㄒㄧㄣ", "❤️"], ["ㄟ", "杯子", "ㄅㄟ ㄗ˙", "🥤"], ["ㄠ", "包子", "ㄅㄠ ㄗ˙", "🥟"], ["ㄡ", "猴子", "ㄏㄡˊ ㄗ˙", "🐵"],
  ["ㄢ", "山", "ㄕㄢ", "⛰️"], ["ㄣ", "門", "ㄇㄣˊ", "🚪"], ["ㄤ", "糖果", "ㄊㄤˊ ㄍㄨㄛˇ", "🍬"], ["ㄥ", "燈", "ㄉㄥ", "💡"], ["ㄦ", "耳朵", "ㄦˇ ㄉㄨㄛ˙", "👂"],
].map(([sym, zh, bopo, emoji]) => ({ sym, zh, bopo, emoji }));
// 容易搞混的注音怎麼分（短句、白話）
const BP_PAIR_TIPS = [
  [["ㄅ", "ㄆ"], "手放在嘴巴前面念念看：ㄆ會噴出風，ㄅ不會。"],
  [["ㄉ", "ㄊ"], "手放在嘴巴前面念念看：ㄊ會噴出風，ㄉ不會。"],
  [["ㄍ", "ㄎ"], "手放在嘴巴前面念念看：ㄎ會噴出風，ㄍ不會。"],
  [["ㄐ", "ㄑ", "ㄒ"], "ㄐ不噴風，ㄑ會噴風，ㄒ像笑的時候「嘻」的聲音。"],
  [["ㄓ", "ㄗ"], "ㄓ舌頭要往上捲起來（翹舌），ㄗ舌頭平平的。"],
  [["ㄔ", "ㄘ"], "ㄔ舌頭要往上捲起來（翹舌），ㄘ舌頭平平的。"],
  [["ㄕ", "ㄙ"], "ㄕ舌頭要往上捲起來（翹舌），ㄙ舌頭平平的，像蛇的聲音。"],
  [["ㄋ", "ㄌ"], "ㄋ聲音從鼻子出來，捏住鼻子就念不出來；ㄌ聲音從舌頭兩邊出來。"],
  [["ㄈ", "ㄏ"], "ㄈ要上面的牙齒碰下嘴唇；ㄏ像哈氣，從喉嚨出來。"],
  [["ㄢ", "ㄤ"], "ㄢ念完舌頭頂在上面牙齒後面；ㄤ嘴巴張大，聲音在喉嚨後面。"],
  [["ㄣ", "ㄥ"], "ㄣ念完舌頭頂在上面牙齒後面；ㄥ聲音在鼻子後面，比較長。"],
  [["ㄛ", "ㄜ"], "ㄛ嘴巴圓圓的，像「喔」；ㄜ嘴巴扁扁的，像「鵝」。"],
  [["ㄟ", "ㄝ"], "ㄟ像「欸」，最後會滑到ㄧ；ㄝ常常跟ㄧ、ㄩ在一起，像「葉」「月」。"],
  [["ㄠ", "ㄡ"], "ㄠ嘴巴先張大再變圓，像「凹」；ㄡ嘴巴一直圓圓的，像「歐」。"],
];
const BP_TONE_TIP = "用手比比看：一聲平平，二聲往上，三聲先下去再上來，四聲往下，輕聲輕輕短短的。";
const bpWordOf = sym => BP_WORDS.find(w => w.sym === sym);
function bpSymTip(sym, picked) {
  const pair = BP_PAIR_TIPS.find(([g]) => g.includes(sym) && (!picked || g.includes(picked))) || BP_PAIR_TIPS.find(([g]) => g.includes(sym));
  const w = bpWordOf(sym);
  const key = w ? `「${sym}」：${w.emoji}${w.zh}${BP_INITIALS.includes(sym) ? "的第一個聲音" : "裡面的聲音"}。` : "";
  return key + (pair ? pair[1] : "");
}
const bpSyls = bopo => bopo.trim().split(/\s+/);

// === 出題 ===
// 選項：答案＋容易搞混的＋同一類的
function bpSymOptions(sym, pool) {
  const near = shuffle(confusableOf(sym)).slice(0, 2);
  const rest = shuffle(pool.filter(s => s !== sym && !near.includes(s)));
  return shuffle([sym, ...near, ...rest].slice(0, 4));
}
function bpQSym(w, kind) {
  const syls = bpSyls(w.bopo);
  let si = 0, ci = 0;
  if (kind === "final") { si = syls.findIndex(s => s.includes(w.sym)); ci = [...splitSyl(syls[si]).symbols].indexOf(w.sym); }
  const pool = kind === "init" ? BP_INITIALS : BP_FINALS;
  return { kind, w, si, ci, answer: w.sym, options: bpSymOptions(w.sym, pool) };
}
function bpToneWords() {
  const lessonWords = (ZH?.lessons || []).filter(l => l.kind !== "chars").flatMap(l => l.words || []).filter(w => w.zh && w.bopo && !/[ㄅ-ㄩ]/.test(w.zh));
  return [...BP_WORDS, ...lessonWords];
}
function bpQTone(w) {
  const syls = bpSyls(w.bopo);
  const si = Math.floor(Math.random() * syls.length);
  const tone = splitSyl(syls[si]).tone;
  return { kind: "tone", w, si, answer: tone, options: TONES.map(x => x[0]) };
}
function bpQWord(w) {
  const opts = shuffle([w.bopo, ...shuffle(bopoVariants(w.bopo)).slice(0, 3)]);
  return { kind: "word", w, answer: w.bopo, options: opts };
}
const BP_KINDS = {
  init: { name: "聲母", emoji: "🔤", hint: "聽一聽，蓋住的是哪一個注音？", make: () => shuffle(BP_WORDS.filter(w => BP_INITIALS.includes(w.sym))).map(w => bpQSym(w, "init")) },
  final: { name: "韻母", emoji: "🎶", hint: "聽一聽，蓋住的是哪一個注音？", make: () => shuffle(BP_WORDS.filter(w => BP_FINALS.includes(w.sym))).map(w => bpQSym(w, "final")) },
  tone: { name: "聲調", emoji: "〰️", hint: "聽一聽，蓋住的是第幾聲？", make: () => shuffle(bpToneWords()).slice(0, 12).map(bpQTone) },
  word: { name: "聽詞選注音", emoji: "👂", hint: "聽一聽，選出正確的注音", make: () => shuffle(bpToneWords()).slice(0, 12).map(bpQWord) },
};

// === 畫題目 ===
// 把詞的注音畫出來，蓋住要考的地方
function bpBlankWord(q) {
  const node = bopoWordEl(q.w.bopo, { class: "bopo-word--lg bp-word" });
  if (q.kind === "init" || q.kind === "final") {
    const col = node.children[q.si];
    const chars = col.querySelectorAll(".bopo-char");
    const c = chars[q.ci]; if (c) { c.textContent = "　"; c.classList.add("bp-blank"); }
  } else if (q.kind === "tone") {
    const col = node.children[q.si];
    col.querySelectorAll(".bopo-tone").forEach(x => x.remove());
    const n = col.querySelectorAll(".bopo-char").length;
    col.appendChild(el("span", { class: "bopo-tone bp-blank bp-blank--tone", style: `grid-row: ${Math.max(n, 1)}` }, "?"));
    col.classList.add("bp-col--ask");
  }
  return node;
}
const BP_TONE_NAME = { "": "一聲", "ˊ": "二聲", "ˇ": "三聲", "ˋ": "四聲", "˙": "輕聲" };
function bpOptionNode(q, o) {
  if (q.kind === "tone") return el("span", { class: "bp-tone-opt" }, el("span", { class: "bp-tone-opt__mark" }, o || "ˉ"), t(BP_TONE_NAME[o]));
  if (q.kind === "word") return bopoWordEl(o, { class: "bopo-word--lg" });
  return el("span", { class: "bp-sym" }, o);
}
function bpQuestionHead(q) {
  return el("div", { class: "quiz-prompt bp-prompt" },
    el("div", { class: "quiz-prompt__emoji" }, q.w.emoji || "🔊"),
    el("button", { class: "icon-btn icon-btn--big icon-btn--accent", onclick: () => speakZh(q.w.zh), "aria-label": "再聽一次" }, "🔊"),
    q.kind === "word" ? null : bpBlankWord(q),
    el("div", { class: "quiz-prompt__hint" }, t(BP_KINDS[q.kind].hint)));
}
function bpTipOf(q, picked) {
  if (q.kind === "tone") return `這個字是${BP_TONE_NAME[q.answer]}。${BP_TONE_TIP}`;
  if (q.kind === "word") return "一個字一個字對：先聽第一個聲音，再看韻母，最後看聲調。";
  return bpSymTip(q.answer, picked);
}
const bpKey = q => q.kind === "tone" ? `聲調:${q.w.zh}` : q.kind === "word" ? `拼音:${q.w.zh}` : `注音${q.answer}`;

// 練習一題：答錯要自己再選對，出現「記一記」；onDone(第一次就對)
function mountBpQ(q, container, onDone) {
  let wrong = false, locked = false;
  const feedback = el("div", { class: "quiz-feedback" });
  const memo = el("div", {});
  const grid = el("div", { class: `zh-opts bp-opts bp-opts--${q.kind}` }, q.options.map(o => {
    const b = el("button", { class: "zh-opt bp-opt" }, bpOptionNode(q, o));
    b.addEventListener("click", () => {
      if (locked) return;
      if (o === q.answer) {
        locked = true; b.classList.add("zh-opt--ok"); dingCorrect(); speakZh(q.w.zh);
        if (!wrong) recordZh(bpKey(q), true);
        feedback.textContent = wrong ? "對了！記住這個 👍" : "答對了！🎉"; feedback.className = "quiz-feedback quiz-feedback--correct pop";
        setTimeout(() => onDone(!wrong), 1100);
      } else {
        b.classList.add("zh-opt--bad"); b.disabled = true; buzzWrong();
        if (!wrong) recordZh(bpKey(q), false);
        wrong = true;
        feedback.textContent = "再聽一次，想一想再選"; feedback.className = "quiz-feedback quiz-feedback--wrong shake";
        const tip = bpTipOf(q, o);
        memo.replaceChildren(el("div", { class: "guard-tip bp-memo" }, el("div", { class: "guard-tip__head" }, t("📌 記一記")),
          el("div", { class: "guard-tip__body" }, el("div", { class: "guard-tip__text" }, t(tip)),
            el("button", { class: "l-say__btn", "aria-label": "念給我聽", onclick: e => { e.stopPropagation(); speakZh(tip); } }, "🔊"))));
        setTimeout(() => speakZh(q.w.zh), 600);
      }
    });
    return b;
  }));
  container.replaceChildren(bpQuestionHead(q), grid, feedback, memo);
  setTimeout(() => speakZh(q.w.zh), 250);
}

// === 頁面 ===
function renderBopo(sub) {
  if (sub === "exam") return renderBopoExam();
  if (sub === "chart") return renderBopoChart();
  if (BP_KINDS[sub]) return renderBopoPractice(sub);
  const root = el("div", {});
  root.appendChild(renderHeader("🔤 注音總複習", { back: "#/" }));
  const app = el("main", { class: "app" });
  const key = "zh:bopo";
  app.appendChild(el("section", { class: "section" },
    el("div", { class: "m-hint" }, t("期中考會考全部37個注音：聲母21個、韻母16個，還有聲調和拼音")),
    el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => navigate("#/bopo/exam") }, t("📝 注音大會考（模擬考）")),
    el("div", { class: "progress-note", style: "text-align: center;" }, t(mockSummary(key))),
    el("button", { class: "btn btn--full btn--xl", style: "margin-top: 10px;", onclick: () => navigate("#/bopo/chart") }, t("📋 37個注音表（點了會念）"))));
  app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t("🎯 一種一種練")),
    el("div", { class: "mode-grid" }, Object.entries(BP_KINDS).map(([k, K]) => el("button", { class: "mode-btn", onclick: () => navigate(`#/bopo/${k}`) },
      el("span", { class: "mode-btn__emoji" }, K.emoji), t(K.name),
      el("span", { class: "mode-btn__sub" }, t(k === "init" ? "21個全部" : k === "final" ? "16個全部" : "每輪12題")))))));
  root.appendChild(app);
  return root;
}

function renderBopoChart() {
  const root = el("div", {});
  root.appendChild(renderHeader("📋 37個注音表", { back: "#/bopo" }));
  const app = el("main", { class: "app" });
  const cell = w => el("button", { class: "bp-cell", onclick: () => speakZh(w.zh) },
    el("span", { class: "bp-cell__sym" }, w.sym), el("span", { class: "bp-cell__emoji" }, w.emoji), rubyEl(w.zh, w.bopo, "span", { class: "bp-cell__word" }));
  app.append(el("div", { class: "section__title" }, t("聲母（21個）")), el("div", { class: "bp-chart" }, BP_WORDS.filter(w => BP_INITIALS.includes(w.sym)).map(cell)),
    el("div", { class: "section__title" }, t("韻母（16個）")), el("div", { class: "bp-chart" }, BP_WORDS.filter(w => BP_FINALS.includes(w.sym)).map(cell)));
  root.appendChild(app);
  return root;
}

function renderBopoPractice(kind) {
  const K = BP_KINDS[kind];
  const root = el("div", {});
  const header = renderHeader(`${K.emoji} ${K.name}`, { back: "#/bopo" });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);
  const qs = K.make();
  const total = qs.length;
  let i = 0, score = 0;
  const missed = [];
  const next = () => {
    if (i >= qs.length) {
      app.replaceChildren(renderResultBlock(`第一次就答對 ${score} / ${total}`, score === total ? "🌟" : score >= total * 0.7 ? "🎉" : "💪", "再練一次", () => navigate(`#/bopo/${kind}?r=${Date.now()}`),
        missed.length ? el("div", { class: "bp-missed" }, el("div", { class: "zh-missed__title" }, t("要再記的：")),
          missed.map(q => el("div", { class: "bp-missed__row" }, el("span", { class: "bp-missed__emoji" }, q.w.emoji), rubyEl(q.w.zh, q.w.bopo, "span"),
            el("div", { class: "bp-missed__tip" }, t(bpTipOf(q)))))) : null));
      return;
    }
    const q = qs[i];
    progressLabel.textContent = `${Math.min(i + 1, qs.length)}/${qs.length}・${score}分`;
    mountBpQ(q, app, first => {
      if (first && !q.retry) score++;
      if (!first) { if (!missed.includes(q)) missed.push(q); if (!q.retry) qs.splice(Math.min(i + 3, qs.length), 0, { ...q, retry: true, options: shuffle([...q.options]) }); }
      i++; next();
    });
  };
  next();
  return root;
}

// 模擬考：25 題（聲母 8、韻母 8、聲調 5、聽詞選注音 4），每題 4 分；選好按「下一題」，不能跳過、不能回頭
const BP_EXAM = [["init", 8, "一"], ["final", 8, "二"], ["tone", 5, "三"], ["word", 4, "四"]];
function renderBopoExam() {
  const u = { id: "bopo" }, key = "zh:bopo";
  const root = el("div", {});
  const header = renderHeader("📝 注音大會考", { back: "#/bopo" });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);
  const body = el("div", {});
  const gate = mockGate(body, u, "#/bopo/init", key);
  app.append(gate.el, body);
  const qs = BP_EXAM.flatMap(([kind, n, no]) => BP_KINDS[kind].make().slice(0, n).map(q => ({ ...q, sec: no })));
  const answers = [];
  let i = 0;
  const ask = () => {
    if (i >= qs.length) return finish();
    const q = qs[i];
    progressLabel.textContent = `第${i + 1}/${qs.length}題`;
    let picked = null;
    const nextBtn = el("button", { class: "btn btn--accent btn--full btn--xl bp-next", disabled: true }, t(i === qs.length - 1 ? "✅ 交卷" : "下一題 ▶"));
    const grid = el("div", { class: `zh-opts bp-opts bp-opts--${q.kind}` }, q.options.map(o => {
      const b = el("button", { class: "zh-opt bp-opt" }, bpOptionNode(q, o));
      b.addEventListener("click", () => { picked = o; grid.querySelectorAll(".bp-opt").forEach(x => x.classList.toggle("bp-opt--on", x === b)); nextBtn.disabled = false; nextBtn.classList.remove("bp-next--wait"); });
      return b;
    }));
    nextBtn.addEventListener("click", () => {
      if (picked === null) return;
      answers.push(picked); recordZh(bpKey(q), picked === q.answer);
      i++; ask(); window.scrollTo(0, 0);
    });
    body.replaceChildren(el("div", { class: "bp-sec" }, t(`第${q.sec}大題・${BP_KINDS[q.kind].name}`)), bpQuestionHead(q), grid,
      el("div", { class: "bp-next__hint" }, t("選好了再按下一題（一定要選一個）")), nextBtn);
    setTimeout(() => speakZh(q.w.zh), 250);
  };
  const finish = () => {
    progressLabel.textContent = "交卷了";
    let score = 0;
    const rows = BP_EXAM.map(([kind, n, no]) => ({ no, got: 0, max: n * 4 }));
    const wrong = [];
    qs.forEach((q, k) => { const ok = answers[k] === q.answer; const r = rows.find(x => x.no === q.sec); if (ok) { score += 4; r.got += 4; } else wrong.push([q, answers[k]]); });
    if (!wrong.length) { dingCorrect(); confetti(); } else buzzWrong();
    body.replaceChildren(el("div", { class: "ws-result" },
      el("div", { class: "ws-result__big" }, `${score} 分`),
      mockResult(u, score, gate.secs(), rows, key),
      wrong.length ? el("div", { class: "bp-missed" }, el("div", { class: "zh-missed__title" }, t(`錯了${wrong.length}題，看看怎麼記：`)),
        wrong.map(([q, a]) => el("div", { class: "bp-missed__row" }, el("span", { class: "bp-missed__emoji" }, q.w.emoji), rubyEl(q.w.zh, q.w.bopo, "span"),
          el("span", { class: "bp-missed__ans" }, t("你選"), el("b", { class: "bp-missed__bad" }, q.kind === "tone" ? BP_TONE_NAME[a] : q.kind === "word" ? bopoWordEl(a, { class: "bopo-word--sm" }) : a),
            t("，答案"), el("b", { class: "bp-missed__ok" }, q.kind === "tone" ? BP_TONE_NAME[q.answer] : q.kind === "word" ? bopoWordEl(q.answer, { class: "bopo-word--sm" }) : q.answer)),
          el("div", { class: "bp-missed__tip" }, t(bpTipOf(q, a)))))) : el("div", { class: "ws-result__msg" }, t("全對！太厲害了 🌟")),
      el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => navigate(`#/bopo/exam?r=${Date.now()}`) }, t("🔁 再考一次（題目會換）")),
      el("button", { class: "btn btn--ghost btn--full", onclick: () => navigate("#/bopo") }, t("回注音總複習"))));
    window.scrollTo(0, 0);
  };
  const start = gate.el.querySelector(".btn--accent");
  start.addEventListener("click", () => ask());
  return root;
}

// 一年級國語首頁的入口
function renderBopoEntry() {
  return el("button", { class: "tp-home", onclick: () => navigate("#/bopo") },
    el("span", { class: "tp-home__icon bp-home__icon" }, "ㄅㄆㄇ"),
    el("span", { class: "tp-home__text" }, t("🔤 注音總複習・大會考"),
      el("span", { class: "tp-home__sub" }, t(`37個注音全部練・${mockSummary("zh:bopo")}`))),
    el("span", { class: "tp-home__go" }, "▶"));
}
