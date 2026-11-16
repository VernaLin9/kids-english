// 📖 學一學（家長：網站不要只有考試，也要有教學、複習）
// 每一科都是「先學 → 馬上小檢查 → 再學下一組」，不計分、答錯就再看一次教學卡
//   英文 #/teach/en?set=week-N：3 個字一組，看大圖、拍手念、看中文 → 聽音選圖
//   國語 #/teach/zh?l=ID：生字課＝字、部首、筆畫、詞、記法 → 選出這個字；注音課＝詞、注音一個字一個字念 → 選出對的注音
//   數學 #/teach/math?u=ID：每種題型「老師先做一題（答案會發亮）」→「換你做」，加減有 🧱 積木示範
// 首頁「🌟 今天這樣學」renderTodayPlan：①學一學 ②練一練 ③考考看（照最近要考的那一課／單元／週）

const teachKey = (sub, id) => `${sub}:${id}`;
function teachMark(sub, id) { const p = getProfile(); if (!p) return; p.teachDone = p.teachDone || {}; p.teachDone[teachKey(sub, id)] = dayISO(); saveStore(); }
const teachDoneDay = (sub, id) => getProfile()?.teachDone?.[teachKey(sub, id)] || null;
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

// 共用：一頁一張卡，下面一顆大按鈕往下走；chk＝小檢查題（options：{label, ok}），答錯先看教學卡再選
function teachRunner(title, back, steps, onEnd) {
  const root = el("div", {});
  const header = renderHeader(title, { back });
  root.appendChild(header);
  const progress = $(".header__progress", header);
  const app = el("main", { class: "app tc" });
  root.appendChild(app);
  let i = 0;
  const show = () => {
    if (i >= steps.length) { onEnd(app); return; }
    const s = steps[i];
    progress.textContent = `${i + 1}/${steps.length}`;
    const next = () => { i++; show(); window.scrollTo(0, 0); };
    app.replaceChildren(s.kind === "learn" ? learnView(s, next) : checkView(s, next));
  };
  const learnView = (s, next) => el("div", { class: "tc-card" },
    el("div", { class: "tc-tag" }, t(s.tag || "📖 學一學")), s.body(),
    el("button", { class: "btn btn--accent btn--full btn--xl tc-next", onclick: next }, t(s.nextLabel || "我記住了 ▶")));
  const checkView = (s, next) => {
    const fb = el("div", { class: "quiz-feedback" });
    const again = el("div", {});
    let missed = false;
    const opts = el("div", { class: `tc-opts${s.optClass ? " " + s.optClass : ""}` }, s.options.map(o => {
      const b = el("button", { class: "tc-opt" }, o.label); // 教學的小檢查不套防亂點（答錯就再看教學卡）
      b.addEventListener("click", () => {
        if (b.disabled) return;
        if (o.ok) {
          b.classList.add("tc-opt--ok"); opts.querySelectorAll(".tc-opt").forEach(x => { x.disabled = true; });
          fb.textContent = missed ? "改對了！記住它 👍" : "答對了！🎉"; fb.className = "quiz-feedback quiz-feedback--correct pop"; dingCorrect();
          s.rec?.(!missed);
          setTimeout(next, 900);
        } else {
          missed = true; b.classList.add("tc-opt--bad"); b.disabled = true; buzzWrong();
          fb.textContent = "再看一次教學卡，然後再選"; fb.className = "quiz-feedback quiz-feedback--wrong shake";
          again.replaceChildren(el("div", { class: "tc-again" }, s.teach()));
        }
      });
      return b;
    }));
    setTimeout(() => s.say?.(), 250);
    return el("div", { class: "tc-card" }, el("div", { class: "tc-tag tc-tag--chk" }, t("✅ 小檢查")),
      el("div", { class: "tc-q" }, s.prompt, s.say ? el("button", { class: "icon-btn icon-btn--accent m-speak--listen", onclick: () => s.say(), "aria-label": "再聽一次" }, "🔊") : null),
      opts, fb, again);
  };
  show();
  return root;
}
const teachEnd = (app, msg, btns) => { dingCorrect(); confetti?.(); app.replaceChildren(el("div", { class: "tc-card tc-end" },
  el("div", { class: "tc-end__icon" }, "🎉"), el("div", { class: "tc-end__msg" }, t(msg)), el("div", { class: "tc-end__btns" }, btns))); };
const teachBtn = (label, hash, accent) => el("button", { class: `btn btn--full btn--xl${accent ? " btn--accent" : ""}`, onclick: () => navigate(hash) }, t(label));

// === 🔤 英文 ===
function renderTeachEn(setKey) {
  const words = resolveSet(setKey).filter(w => WORDS[w]);
  if (!words.length) return renderEmpty("#/", "沒有單字");
  const card = w => {
    const info = WORDS[w];
    const fx = el("span", { class: "fc-emoji fc-emoji--pop", "data-nobopo": "1" }, info.emoji);
    const stage = el("button", { class: `fc-stage fc-cat--${info.category || "x"}`, onclick: () => { fx.classList.remove("fc-emoji--hop"); void fx.offsetWidth; fx.classList.add("fc-emoji--hop"); speakWord(w); } }, fx);
    setTimeout(() => speakWord(w), 300);
    const parts = typeof SYLLABLES !== "undefined" && SYLLABLES[w] ? SYLLABLES[w].split("·") : null; // SYLLABLES 是 "sev·en" 字串
    const en = syllableEl(w, "div", { class: "tc-word__en" });
    return el("div", { class: "tc-word" }, stage, en,
      rubyEl(info.zh || "", info.bopo || "", "div", { class: "tc-word__zh" }),
      el("button", { class: "btn btn--ghost btn--full", onclick: () => speakWord(w) }, t("🔊 再聽一次")),
      phonicsEl(w), imageMemEl(w, en),
      el("div", { class: "tc-tip" }, t(parts && parts.length > 1 ? `👏 拍手念：${parts.join("・")}（拍${parts.length}下），念三次！` : `👏 大聲念三次：${w}！`)));
  };
  const steps = [];
  chunk(words, 3).forEach(group => {
    group.forEach(w => steps.push({ kind: "learn", tag: "📖 看圖、聽、念", body: () => card(w) }));
    shuffle(group).forEach(w => {
      const others = shuffle(words.filter(x => x !== w)).slice(0, 2);
      steps.push({ kind: "check", prompt: t("聽一聽，是哪一個？"), say: () => speakWord(w), teach: () => card(w), optClass: "tc-opts--pic",
        options: shuffle([w, ...others]).map(x => ({ ok: x === w, label: el("span", { class: "tc-pic", "data-nobopo": "1" }, el("span", { class: "tc-pic__emoji" }, WORDS[x].emoji), el("span", { class: "tc-pic__en" }, x)) })),
        rec: ok => recordWord(w, ok) });
    });
  });
  const exam = typeof nextExam === "function" ? nextExam() : null;
  return teachRunner(`📖 學一學・${setLabel(setKey)}`, "#/", steps, app => { teachMark("en", setKey); teachEnd(app, `學完${words.length}個字了！接下來練一練，記得更牢。`, [
    teachBtn("✏️ 練一練（翻牌配對、選擇題…）", setKey.startsWith("week-") ? `#/week/${setKey.slice(5)}` : `#/practice/${encodeURIComponent(setKey)}`, true),
    exam ? teachBtn("📝 考考看（模擬小考）", `#/play/mock?set=${encodeURIComponent(exam.setKey)}`) : null,
    teachBtn("🌟 看我的貼紙本", "#/stickers")].filter(Boolean)); });
}

// === ㄅ 國語 ===
function renderTeachZh(id) {
  const l = zhLesson(id);
  if (!l) return renderEmpty("#/", "找不到這一課");
  const steps = [];
  if (l.kind === "chars") {
    const card = c => {
      const memo = (typeof ZH2_MNEMONIC !== "undefined" && ZH2_MNEMONIC[c.zh]) || null;
      setTimeout(() => speakZh(`${c.zh}，${c.word}的${c.zh}`), 300);
      return el("div", { class: "tc-char" },
        el("button", { class: "tc-char__big", onclick: () => speakZh(`${c.zh}，${c.word}的${c.zh}`) }, rubyEl(c.zh, c.bopo, "span", { class: "tc-char__ruby" })),
        el("div", { class: "tc-facts" },
          el("div", { class: "tc-fact" }, el("span", { class: "tc-fact__k" }, t("部首")), el("span", { class: "tc-fact__v", "data-nobopo": "1" }, c.radical)),
          el("div", { class: "tc-fact" }, el("span", { class: "tc-fact__k" }, t("總筆畫")), el("span", { class: "tc-fact__v", "data-nobopo": "1" }, `${c.strokes}`)),
          el("div", { class: "tc-fact" }, el("span", { class: "tc-fact__k" }, t("語詞")), rubyEl(c.word, c.wordBopo, "span", { class: "tc-fact__w" }))),
        memo ? el("div", { class: "tc-tip" }, t(`💡 ${memo}`)) : null,
        c.confuse ? el("div", { class: "tc-tip tc-tip--warn" }, t("👀 小心長得像："), el("span", { "data-nobopo": "1", class: "tc-confuse" }, [...c.confuse].join("　"))) : null,
        el("div", { class: "tc-tip" }, t(`🧩 部首「${c.radical}」：${(RADICAL_INFO[c.radical]?.meaning) || ""}`)),
        strokeOrderEl(c.zh));
    };
    chunk(l.chars, 3).forEach(group => {
      group.forEach(c => steps.push({ kind: "learn", tag: "📖 認識生字", body: () => card(c) }));
      shuffle(group).forEach(c => {
        const opts = shuffle([c.zh, ...shuffle([...(c.confuse || "")]).slice(0, 2)]);
        steps.push({ kind: "check", prompt: el("span", {}, t(`哪一個是「${c.word}」的`), el("b", {}, bopoWordEl(c.bopo, { class: "bopo-word--sm" }))), say: () => speakZh(`${c.word}的${c.zh}`), teach: () => card(c),
          options: opts.map(x => ({ ok: x === c.zh, label: el("span", { class: "tc-bigchar", "data-nobopo": "1" }, x) })), rec: ok => recordZh(c.zh, ok) });
        steps.push({ kind: "check", prompt: t(`「${c.zh}」的部首是哪一個？`), say: () => speakZh(`${c.zh}的部首是哪一個`), teach: () => card(c),
          options: shuffle([c.radical, ...shuffle(["手", "人", "口", "一", "工", "乙", "水", "木", "土", "日", "心", "女"].filter(r => r !== c.radical)).slice(0, 2)]).map(x => ({ ok: x === c.radical, label: el("span", { class: "tc-bigchar", "data-nobopo": "1" }, x) })) });
      });
    });
  } else {
    const card = w => {
      setTimeout(() => speakZh(w.zh), 300);
      return el("div", { class: "tc-char" }, w.emoji ? el("div", { class: "tc-emoji" }, w.emoji) : null,
        el("button", { class: "tc-bopo", onclick: () => speakZh(w.zh) }, bopoWordEl(w.bopo, { class: "bopo-word--lg" })),
        el("div", { class: "tc-tip" }, t(`🔊 點注音聽一次。一個字一個字拼：${w.bopo.split(" ").join("、")}`)),
        el("div", { class: "tc-tip" }, t("📍 聲調寫在最後一個注音的右上角，輕聲寫在最上面")));
    };
    chunk(l.words, 3).forEach(group => {
      group.forEach(w => steps.push({ kind: "learn", tag: "📖 看詞、聽、拼", body: () => card(w) }));
      shuffle(group).forEach(w => {
        const vs = typeof bopoVariants === "function" ? bopoVariants(w.bopo) : [];
        const opts = shuffle([w.bopo, ...shuffle(vs.filter(v => v !== w.bopo)).slice(0, 2)]);
        if (opts.length < 2) return;
        steps.push({ kind: "check", prompt: el("span", {}, w.emoji ? el("span", { class: "tc-qemoji" }, w.emoji) : null, t("聽一聽，哪一個注音對？")), say: () => speakZh(w.zh), teach: () => card(w),
          optClass: "tc-opts--bopo", options: opts.map(x => ({ ok: x === w.bopo, label: bopoWordEl(x) })), rec: ok => recordZh(w.zh, ok) });
      });
    });
  }
  return teachRunner(`📖 學一學・${l.title}`, "#/", steps, app => { teachMark("zh", l.id); teachEnd(app, "這一課學完了！接下來練一練。", [
    teachBtn("✏️ 練一練", `#/zh/${l.id}`, true),
    l.kind === "chars" ? teachBtn("📝 考考看（模擬小考）", `#/zhplay/exam?l=${l.id}`) : null,
    teachBtn("🎮 用遊戲練這一課", `#/games?s=zh&c=${l.id}`)].filter(Boolean)); });
}

// === ➕ 數學：老師先做一題 → 換你做 ===
function renderTeachMath(id) {
  const u = mathUnit(id);
  if (!u) return renderEmpty("#/", "找不到這個單元");
  const calc = u.kind === "calc";
  const T = calc ? MATH2_TOPICS : MATH_TOPICS;
  const steps = [];
  u.topics.slice(0, 4).forEach(tp => {
    if (!T[tp]) return;
    steps.push({ kind: "learn", tag: `👀 老師先做：${T[tp].name}`, nextLabel: "換我做 ▶", body: () => {
      const box = el("div", { class: "tc-demo" });
      const q = T[tp].gen();
      if (calc) {
        mountMath2Q(q, box, () => {}, () => {});
        const c = calcOf(q);
        box.prepend(el("div", { class: "tc-tip" }, t("先看題目，按「💡 提示」看怎麼想。")), c ? el("button", { class: "btn btn--full btn--xl", onclick: () => openBlocksTeach(c) }, t("🧱 用積木一步一步看")) : null);
      } else {
        mountMathQ(q, box, () => {}, tp);
        setTimeout(() => { box.querySelectorAll(".m-item").forEach((n, k) => { if (q.items[k]?.correct) n.classList.add("tc-demo__ok"); }); }, 900);
        box.prepend(el("div", { class: "tc-tip" }, t("看清楚：發亮的就是答案。想一想為什麼是它？")));
        const add = u.id === "u7" ? q.prompt.match(/(\d+)個和(\d+)個/) : null;
        if (add && typeof openBlocksTeach === "function") box.append(el("button", { class: "btn btn--full btn--xl", onclick: () => openBlocksTeach({ op: "add", a: +add[1], b: +add[2] }) }, t("🧱 用積木看加法")));
      }
      return box;
    } });
    steps.push({ kind: "learn", tag: `✏️ 換你做：${T[tp].name}`, nextLabel: "下一個 ▶", body: () => {
      const box = el("div", { class: "tc-demo" });
      const q = T[tp].gen();
      const done = el("div", { class: "tc-tip" }, t("做做看，錯了會告訴你怎麼想"));
      if (calc) mountMath2Q(q, box, () => done.replaceChildren(t("做對了！🎉")), () => {}); else mountMathQ(q, box, () => done.replaceChildren(t("做對了！🎉")), tp);
      box.prepend(done);
      return box;
    } });
  });
  const hasExam = calc || (typeof FILL_SHEETS !== "undefined" && FILL_SHEETS[u.id]) || u.id === "u2";
  return teachRunner(`📖 學一學・${u.title}`, "#/", steps, app => { teachMark("math", u.id); teachEnd(app, "看完示範也自己做過了！接下來多練幾題。", [
    teachBtn("✏️ 練一練（小考隨機12題）", `#/mathplay/mix?u=${u.id}`, true),
    hasExam ? teachBtn("📝 考考看（模擬小考）", `#/mathplay/exam?u=${u.id}`) : null].filter(Boolean)); });
}

// === 首頁：🌟 今天這樣學（照最近要考的那一課） ===
// 這一科最該練的：日期最近、還沒考的；沒有就挑最新的一課／單元
function teachFocus(list) {
  const today = dayISO();
  const up = list.filter(x => x.exam?.date >= today).sort((a, b) => a.exam.date.localeCompare(b.exam.date));
  if (up.length) return up[0];
  const dated = list.filter(x => x.exam?.date).sort((a, b) => b.exam.date.localeCompare(a.exam.date));
  return dated[0] || list[0] || null;
}
function renderTodayPlan(subject) {
  let title, steps;
  const done = (sub, id) => teachDoneDay(sub, id) === dayISO();
  if (subject === "zh" && ZH) {
    const l = teachFocus(ZH.lessons); if (!l) return null;
    title = l.title + (l.exam?.date >= dayISO() ? `（${l.exam.date.slice(5).replace("-", "/")}考）` : "");
    steps = [["📖", "學一學", `#/teach/zh?l=${l.id}`, done("zh", l.id)], ["✏️", "練一練", `#/zh/${l.id}`], l.kind === "chars" ? ["📝", "考考看", `#/zhplay/exam?l=${l.id}`] : ["🎮", "玩遊戲", `#/games?s=zh&c=${l.id}`]];
  } else if (subject === "math" && MATH) {
    const u = teachFocus(MATH.units); if (!u) return null;
    title = u.title + (u.exam?.date >= dayISO() ? `（${u.exam.date.slice(5).replace("-", "/")}考）` : "");
    const hasExam = u.kind === "calc" || (typeof FILL_SHEETS !== "undefined" && FILL_SHEETS[u.id]) || u.id === "u2";
    steps = [["📖", "學一學", `#/teach/math?u=${u.id}`, done("math", u.id)], ["✏️", "練一練", `#/math/${u.id}`], hasExam ? ["📝", "考考看", `#/mathplay/exam?u=${u.id}`] : ["🎮", "玩遊戲", `#/games?s=math&c=${u.id}`]];
  } else {
    const cw = getCurrentWeek();
    const exam = typeof nextExam === "function" ? nextExam() : null;
    const setKey = cw.words.length ? `week-${cw.num}` : exam?.setKey;
    if (!setKey) return null;
    title = cw.words.length ? `本週單字（第${cw.num}週）` : "考試範圍的單字";
    steps = [["📖", "學一學", `#/teach/en?set=${encodeURIComponent(setKey)}`, done("en", setKey)], ["✏️", "練一練", cw.words.length ? `#/week/${cw.num}` : `#/practice/${encodeURIComponent(setKey)}`],
      exam ? ["📝", "考考看", `#/play/mock?set=${encodeURIComponent(exam.setKey)}`] : ["🎮", "玩遊戲", `#/games?s=en`]];
  }
  return el("section", { class: "tp-plan" },
    el("div", { class: "tp-plan__head" }, el("span", { class: "tp-plan__icon" }, "🌟"), el("div", {}, el("div", { class: "tp-plan__title" }, t("今天這樣學")), el("div", { class: "tp-plan__sub" }, t(title)))),
    el("div", { class: "tp-plan__steps" }, steps.map(([icon, label, hash, ok], k) => el("button", { class: `tp-step${ok ? " tp-step--done" : ""}${k === 0 ? " tp-step--first" : ""}`, onclick: () => navigate(hash) },
      el("span", { class: "tp-step__no" }, ok ? "✓" : `${k + 1}`), el("span", { class: "tp-step__icon" }, icon), t(label)))),
    el("div", { class: "tp-plan__hint" }, t("先學會再練習，最後才考考看")));
}

// === ✍️ 筆順（家長：要有筆順教學，而且要加強筆順訓練）===
// 這個環境連不到網路上的筆順資料庫，所以照教育部標準筆順自己畫：每一筆是 100×100 格子裡的中心線（M/L/Q），names 是筆畫名稱
// 先做國語第一課的 9 個字；沒有資料的字只講通則
const STROKES = {
  "上": { names: ["豎", "橫", "橫"], d: ["M50 14 L50 86", "M50 48 L76 48", "M14 86 L86 86"] },
  "下": { names: ["橫", "豎", "點"], d: ["M14 18 L86 18", "M50 18 L50 90", "M55 42 Q62 50 68 58"] },
  "也": { names: ["橫折鉤", "豎", "豎曲鉤"], d: ["M14 40 L78 33 Q80 54 74 64 L67 58", "M48 14 L48 70", "M26 24 L26 80 Q26 88 36 88 L84 88 L86 76"] },
  "手": { names: ["撇", "橫", "橫", "豎鉤"], d: ["M74 12 L30 22", "M24 38 L76 38", "M14 58 L86 58", "M50 22 L50 88 L42 82"] },
  "左": { names: ["橫", "撇", "橫", "豎", "橫"], d: ["M14 32 L86 32", "M52 12 L18 88", "M38 56 L76 56", "M57 56 L57 84", "M32 84 L86 84"] },
  "右": { names: ["撇", "橫", "豎", "橫折", "橫"], d: ["M52 12 L16 80", "M14 32 L86 32", "M38 54 L38 88", "M38 54 L80 54 L78 88", "M38 86 L78 86"] },
  "拍": { names: ["橫", "豎鉤", "提", "撇", "豎", "橫折", "橫", "橫"], d: ["M10 34 L38 34", "M24 12 L24 86 L17 80", "M10 64 L38 52", "M70 10 L62 24", "M48 28 L48 88", "M48 28 L86 28 L86 88", "M48 57 L86 57", "M48 86 L86 86"] },
  "你": { names: ["撇", "豎", "撇", "橫鉤", "豎鉤", "撇", "點"], d: ["M28 10 L10 46", "M20 32 L20 90", "M54 10 L40 34", "M48 26 L86 26 L80 36", "M64 30 L64 88 L56 82", "M52 52 L38 74", "M76 52 L86 70"] },
  "他": { names: ["撇", "豎", "橫折鉤", "豎", "豎曲鉤"], d: ["M28 10 L10 46", "M20 32 L20 90", "M34 42 L84 35 Q86 55 80 65 L74 60", "M60 14 L60 70", "M44 22 L44 80 Q44 88 52 88 L88 88 L90 76"] },
};
const strokePts = d => { const n = d.match(/-?\d+(\.\d+)?/g).map(Number); const p = []; for (let i = 0; i + 1 < n.length; i += 2) p.push([n[i], n[i + 1]]); return p; };
// 田字格＋淡淡的整個字（照筆畫畫，跟動畫一樣的形狀）
function strokeGrid(ch, cls = "") {
  const S = STROKES[ch];
  const g = svg("svg", { viewBox: "0 0 100 100", class: `so-grid ${cls}` },
    svg("rect", { x: 1, y: 1, width: 98, height: 98, fill: "#fff", stroke: "#c9a3a3", "stroke-width": 1.5 }),
    svg("path", { d: "M50 1 L50 99 M1 50 L99 50", stroke: "#efcaca", "stroke-width": 1, "stroke-dasharray": "3 3" }),
    ...S.d.map(d => svg("path", { d, class: "so-ghost" })));
  return g;
}
// 筆順動畫：一筆一筆畫出來，旁邊寫第幾畫、念筆畫名稱
function strokeOrderEl(ch) {
  const S = STROKES[ch];
  if (!S) return el("div", { class: "tc-tip" }, t("✍️ 筆順通則：先上後下、先左後右、先橫後豎、先外後內。用手指在桌上寫一次。"));
  const g = strokeGrid(ch, "so-grid--big");
  const ink = svg("g", {}); g.appendChild(ink);
  const cap = el("div", { class: "so-cap" }, t(`共${S.d.length}畫`));
  let timer = null, k = 0;
  const drawOne = (i, anim = true) => {
    const p = svg("path", { d: S.d[i], class: "so-ink" });
    ink.appendChild(p);
    const [x, y] = strokePts(S.d[i])[0];
    ink.appendChild(svg("circle", { cx: x, cy: y, r: 6, class: "so-num-bg" }));
    const tx = svg("text", { x, y: y + 3.5, class: "so-num" }); tx.textContent = i + 1; ink.appendChild(tx);
    if (anim) { const L = p.getTotalLength ? p.getTotalLength() : 100; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.getBoundingClientRect(); p.style.transition = "stroke-dashoffset 0.7s ease"; p.style.strokeDashoffset = 0; }
    cap.replaceChildren(t(`第${i + 1}畫：${S.names[i]}（共${S.d.length}畫）`));
    speakZh(`第${i + 1}畫，${S.names[i]}`);
  };
  const play = () => { clearTimeout(timer); ink.replaceChildren(); k = 0; const go = () => { if (k >= S.d.length) { cap.replaceChildren(t(`寫完了！共${S.d.length}畫`)); return; } drawOne(k++); timer = setTimeout(go, 1300); }; go(); };
  const step = () => { clearTimeout(timer); if (k >= S.d.length) { ink.replaceChildren(); k = 0; } drawOne(k++); };
  setTimeout(play, 600);
  return el("div", { class: "so-box" }, g, cap,
    el("div", { class: "so-btns" }, el("button", { class: "btn btn--xl", onclick: play }, t("▶ 再看一次")), el("button", { class: "btn btn--xl", onclick: step }, t("👆 一筆一筆看"))));
}
// 筆順練習：照順序一筆一筆寫，要從對的地方開始、往對的方向寫；寫錯就再看那一筆（hint＝顯示下一筆的起點）
function strokePracticeEl(ch, onDone, hint = true) {
  const S = STROKES[ch];
  const g = strokeGrid(ch, "so-grid--big so-grid--pad");
  const ink = svg("g", {}), live = svg("path", { class: "so-live" }), hintG = svg("g", {});
  g.append(ink, hintG, live);
  const msg = el("div", { class: "so-cap" });
  let k = 0, pts = null, misses = 0;
  const showHint = () => {
    hintG.replaceChildren();
    if (k >= S.d.length || !hint) return;
    const [x, y] = strokePts(S.d[k])[0];
    hintG.append(svg("circle", { cx: x, cy: y, r: 7, class: "so-hint" }));
    const tx = svg("text", { x, y: y + 3.5, class: "so-num so-num--hint" }); tx.textContent = k + 1; hintG.appendChild(tx);
  };
  const say = () => msg.replaceChildren(t(k < S.d.length ? `寫第${k + 1}畫：${S.names[k]}${hint ? "（從發亮的點開始）" : ""}` : "全部寫對了！🎉"));
  const toPt = e => { const r = g.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100]; };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  g.addEventListener("pointerdown", e => { if (k >= S.d.length) return; e.preventDefault(); g.setPointerCapture?.(e.pointerId); pts = [toPt(e)]; });
  g.addEventListener("pointermove", e => { if (!pts) return; pts.push(toPt(e)); live.setAttribute("d", "M" + pts.map(p => p.map(v => v.toFixed(1)).join(" ")).join(" L")); });
  g.addEventListener("pointerup", () => {
    if (!pts) return;
    const drawn = pts; pts = null; live.setAttribute("d", "");
    const want = strokePts(S.d[k]), A = want[0], B = want[want.length - 1], B2 = want[want.length - 2] || B;
    const len = drawn.reduce((s, p, i) => s + (i ? dist(p, drawn[i - 1]) : 0), 0);
    const startOk = dist(drawn[0], A) < 22, endOk = dist(drawn[drawn.length - 1], B) < 26 || dist(drawn[drawn.length - 1], B2) < 26;
    if (startOk && endOk && len > 8) {
      ink.appendChild(svg("path", { d: S.d[k], class: "so-ink so-ink--ok" })); k++; dingCorrect?.();
      say(); showHint();
      if (k >= S.d.length) onDone?.(misses);
    } else {
      misses++; buzzWrong?.();
      msg.replaceChildren(t(!startOk ? `不對喔，第${k + 1}畫「${S.names[k]}」要從這裡開始，看一次再寫` : `方向不對，第${k + 1}畫「${S.names[k]}」要這樣寫，看一次再寫`));
      const p = svg("path", { d: S.d[k], class: "so-ink so-ink--show" }); hintG.appendChild(p);
      const L = p.getTotalLength ? p.getTotalLength() : 100; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.getBoundingClientRect(); p.style.transition = "stroke-dashoffset 0.8s ease"; p.style.strokeDashoffset = 0;
      speakZh(`第${k + 1}畫，${S.names[k]}`);
      setTimeout(showHint, 1300);
    }
  });
  say(); showHint();
  return el("div", { class: "so-box" }, g, msg, el("button", { class: "btn btn--ghost btn--full", onclick: () => { ink.replaceChildren(); k = 0; say(); showHint(); } }, t("🧹 擦掉重寫")));
}
// #/strokes?l=：一個字「看筆順 → 照順序寫（有提示）→ 不看提示再寫一次」
function renderStrokes(id) {
  const l = zhLesson(id);
  const chars = (l?.chars || []).filter(c => STROKES[c.zh]);
  if (!chars.length) return renderEmpty("#/", "這一課還沒有筆順資料");
  const steps = [];
  chars.forEach(c => {
    steps.push({ kind: "learn", tag: `👀 看筆順：${c.zh}`, nextLabel: "換我寫 ▶", body: () => el("div", { class: "tc-char" }, rubyEl(c.zh, c.bopo, "div", { class: "so-title" }), strokeOrderEl(c.zh)) });
    steps.push({ kind: "learn", tag: `✍️ 照順序寫：${c.zh}`, nextLabel: "下一步 ▶", body: () => strokePracticeEl(c.zh, () => {}, true) });
    steps.push({ kind: "learn", tag: `💪 不看提示寫：${c.zh}`, nextLabel: "下一個字 ▶", body: () => strokePracticeEl(c.zh, m => recordZh(`筆順:${c.zh}`, m === 0), false) });
  });
  return teachRunner(`✍️ 筆順練習・${l.title}`, `#/zh/${l.id}`, steps, app => teachEnd(app, "筆順都練過了！寫字的時候也要照這個順序喔。", [
    teachBtn("🔁 再練一次", `#/strokes?l=${l.id}&r=${Date.now()}`, true), teachBtn("✏️ 回去練生字", `#/zh/${l.id}`)]));
}

// === 🧩 部首怎麼記（家長：一年級會考部首，要有記部首的方法）===
// 記法：①部首是字的「家」，有意思（扌＝手、亻＝人、口＝嘴巴）②常在左邊或上面、下面 ③同一個部首的字放一起記（部首分家）
const RADICAL_INFO = {
  "手": { alt: "扌", emoji: "✋", say: "手", meaning: "手。在字的左邊會變成「扌」，叫做提手旁。有扌的字常常是用手做的動作。", ex: ["拍", "打", "拉"] },
  "人": { alt: "亻", emoji: "🧍", say: "人", meaning: "人。在字的左邊會變成「亻」，叫做單人旁。有亻的字常常跟人有關。", ex: ["你", "他", "們", "休"] },
  "口": { emoji: "👄", say: "口", meaning: "嘴巴。口可以在字的左邊、下面或裡面。", ex: ["右", "吃", "叫", "和"] },
  "工": { emoji: "🔨", say: "工", meaning: "做工的工具。「左」下面是工，所以部首是工。", ex: ["左", "巧"] },
  "乙": { emoji: "〰️", say: "乙", meaning: "彎彎的一筆。「也」「九」的部首是乙。", ex: ["也", "九"] },
  "一": { emoji: "➖", say: "一", meaning: "一橫。「上」「下」最長的那一橫就是部首一。", ex: ["上", "下", "三", "不"] },
  "水": { alt: "氵", emoji: "💧", say: "水", meaning: "水。在左邊變成三點水「氵」，跟水有關。", ex: ["沙", "減"] },
  "土": { emoji: "🟫", say: "土", meaning: "泥土。跟土地有關。", ex: ["垃", "圾"] },
  "目": { emoji: "👁️", say: "目", meaning: "眼睛。跟看有關。", ex: ["眼"] },
  "肉": { alt: "月", emoji: "🍖", say: "肉", meaning: "肉。在左邊寫成「月」，叫肉月旁。", ex: ["膠"] },
  "寸": { emoji: "📏", say: "寸", meaning: "寸。「對」右邊是寸。", ex: ["對"] },
  "牛": { alt: "牜", emoji: "🐮", say: "牛", meaning: "牛。在左邊寫成「牜」，跟動物有關。", ex: ["牠"] },
  "宀": { emoji: "🏠", say: "寶蓋頭", meaning: "屋頂，叫寶蓋頭。房子裡有女生，就是「安」。", ex: ["安"] },
  "女": { emoji: "👧", say: "女", meaning: "女生。", ex: ["如"] },
  "言": { emoji: "💬", say: "言", meaning: "說話。跟說話有關。", ex: ["該"] },
  "田": { emoji: "🌾", say: "田", meaning: "田地。", ex: ["留"] },
  "小": { emoji: "🐜", say: "小", meaning: "小。「少」上面是小。", ex: ["少"] },
};
function radicalCard(r, lessonChars) {
  const R = RADICAL_INFO[r] || { emoji: "🧩", meaning: `部首是「${r}」。`, ex: [] };
  const exs = [...new Set([...lessonChars.filter(c => c.radical === r).map(c => c.zh), ...(R.ex || [])])];
  setTimeout(() => speakZh(R.meaning), 300);
  return el("div", { class: "tc-char" },
    el("div", { class: "rd-head" }, el("span", { class: "rd-emoji" }, R.emoji), el("span", { class: "rd-char", "data-nobopo": "1" }, r), R.alt ? el("span", { class: "rd-alt" }, t("寫在左邊："), el("b", { "data-nobopo": "1" }, R.alt)) : null),
    el("div", { class: "tc-tip" }, t(`💡 ${R.meaning}`)),
    el("div", { class: "rd-ex" }, exs.map(ch => el("button", { class: "rd-ex__ch", onclick: () => speakZh(ch) }, rubyEl(ch, CHAR_BOPO[ch] || "", "span")))),
    el("div", { class: "tc-tip" }, t("👀 找部首：先看左邊，再看上面、下面；部首通常是字裡「有意思」的那一塊。")));
}
// #/radicals?l=：每個部首一張卡（意思、圖、例字）→ 部首分家（一個字住哪一家？）
function renderRadicals(id) {
  const l = zhLesson(id);
  const chars = l?.chars || [];
  if (!chars.length) return renderEmpty("#/", "這一課沒有生字");
  const rads = [...new Set(chars.map(c => c.radical))];
  const steps = rads.map(r => ({ kind: "learn", tag: "🧩 認識部首", body: () => radicalCard(r, chars) }));
  // 部首分家：課本的字＋部首卡上的例字（部首都確定的字）
  const pool = shuffle([...chars.map(c => [c.zh, c.radical]), ...rads.flatMap(r => (RADICAL_INFO[r]?.ex || []).filter(ch => !chars.some(c => c.zh === ch)).map(ch => [ch, r]))]).slice(0, 10);
  pool.forEach(([ch, r]) => {
    const others = shuffle(rads.filter(x => x !== r)).slice(0, 2);
    while (others.length < 2) { const x = shuffle(Object.keys(RADICAL_INFO).filter(y => y !== r && !others.includes(y)))[0]; others.push(x); }
    steps.push({ kind: "check", prompt: el("span", {}, t("「"), rubyEl(ch, CHAR_BOPO[ch] || "", "span", { class: "rd-q" }), t("」住在哪一個部首的家？")), say: () => speakZh(`${ch}的部首是哪一個`),
      teach: () => radicalCard(r, chars),
      options: shuffle([r, ...others]).map(x => ({ ok: x === r, label: el("span", { class: "rd-opt" }, el("span", { class: "rd-opt__emoji" }, RADICAL_INFO[x]?.emoji || "🧩"), el("span", { class: "tc-bigchar", "data-nobopo": "1" }, x), RADICAL_INFO[x]?.alt ? el("span", { class: "rd-opt__alt", "data-nobopo": "1" }, RADICAL_INFO[x].alt) : null) })),
      rec: ok => recordZh(`部首:${ch}`, ok) });
  });
  return teachRunner(`🧩 部首怎麼記・${l.title}`, `#/zh/${l.id}`, steps, app => teachEnd(app, "部首都分好家了！考試時先找字裡「有意思」的那一塊。", [
    teachBtn("🔁 再玩一次部首分家", `#/radicals?l=${l.id}&r=${Date.now()}`, true), teachBtn("✏️ 回去練生字", `#/zh/${l.id}`)]));
}

// === 🔤 英文：發音記憶＋圖像記憶（家長：發音記憶和圖像記憶結合）===
// 開頭的聲音跟一年級字母課的代表字一樣（b 跟 🐻 bear 一樣開頭）；單字拆成「開頭＋後半」；找一樣結尾的字一起記
const LETTER_PIC = { a: ["🍎", "apple"], b: ["🐻", "bear"], c: ["🐱", "cat"], d: ["🐶", "dog"], e: ["🥚", "egg"], f: ["🐟", "fish"], g: ["🍇", "grapes"], h: ["🎩", "hat"], j: ["🧃", "juice"], k: ["🪁", "kite"], l: ["🦁", "lion"], m: ["🐵", "monkey"], n: ["👃", "nose"], o: ["🐙", "octopus"], p: ["🐷", "pig"], q: ["👑", "queen"], r: ["🐰", "rabbit"], s: ["☀️", "sun"], t: ["🐯", "tiger"], v: ["🎻", "violin"], w: ["🍉", "watermelon"], y: ["🪀", "yo-yo"], z: ["🦓", "zebra"] };
function phonicsEl(w) {
  const lw = w.toLowerCase();
  if (!/^[a-z]+$/.test(lw)) return null;
  const parts = typeof SYLLABLES !== "undefined" && SYLLABLES[w] ? SYLLABLES[w].split("·") : null;
  const vi = lw.slice(1).search(/[aeiouy]/) + 1;
  const chunks = parts && parts.length > 1 ? parts : vi > 0 ? [w.slice(0, vi), w.slice(vi)] : [w];
  const f = lw[0], digraph = /^(sh|ch|th|wh|ph|kn|wr)/.test(lw), soft = /^[cg][eiy]/.test(lw);
  const pic = !digraph && !soft && !/[aeiou]/.test(f) && LETTER_PIC[f] && LETTER_PIC[f][1] !== lw ? LETTER_PIC[f] : null;
  const rime = vi > 0 && chunks.length === 2 && !parts ? lw.slice(vi) : null;
  const fam = rime && rime.length >= 2 ? Object.keys(WORDS).filter(x => x !== w && /^[a-z]+$/.test(x) && x.endsWith(rime) && x.length <= rime.length + 3).slice(0, 3) : [];
  return el("div", { class: "ph-box" },
    el("div", { class: "ph-title" }, t("🔤 發音記憶")),
    el("div", { class: "ph-chunks", "data-nobopo": "1" }, chunks.map((c, i) => el("button", { class: `ph-chunk ph-chunk--${i % 3}`, onclick: () => speakWord(w) }, c))),
    el("div", { class: "ph-line" }, t(chunks.length > 1 ? `分成${chunks.length}塊念：${chunks.join("・")}，再連起來念` : "慢慢念，再快快念")),
    pic ? el("button", { class: "ph-line ph-pic", onclick: () => speak(pic[1]) }, t("開頭的聲音跟"), el("span", { class: "ph-pic__e" }, pic[0]), el("b", { "data-nobopo": "1" }, pic[1]), t("一樣（點我聽）")) : null,
    digraph ? el("div", { class: "ph-line" }, t("開頭的"), el("b", { "data-nobopo": "1" }, lw.slice(0, 2)), t("兩個字母要一起念")) : null,
    fam.length ? el("div", { class: "ph-line" }, t("一樣結尾，一起記："), el("span", { "data-nobopo": "1", class: "ph-fam" }, fam.map(x => `${x}`).join("、"))) : null);
}
function imageMemEl(w, enNode) {
  const btn = el("button", { class: "btn btn--full ph-hide" }, t("🙈 遮住英文，看圖說說看"));
  btn.addEventListener("click", () => { const off = enNode.classList.toggle("tc-word__en--hide"); btn.replaceChildren(t(off ? "👀 打開看答案" : "🙈 遮住英文，看圖說說看")); if (!off) speakWord(w); });
  return el("div", { class: "ph-box ph-box--img" },
    el("div", { class: "ph-title" }, t("🖼️ 圖像記憶")),
    el("div", { class: "ph-line" }, t("看著圖念三次，閉上眼睛想這張圖，再說出英文。")),
    btn);
}

// === 📝 圈詞聽寫（11/19 考第一課圈詞；照圈詞作業：學過的字寫國字，還沒學的寫注音）===
// 聽 → 在紙上寫 → 看答案自己對 → 寫錯的最後再考一次（弟弟作業常忘了寫聲調，答案旁邊提醒）
function quanciAnswerEl(q, l) {
  const known = new Set((l.chars || []).map(c => c.zh));
  const bs = q.bopo.split(/\s+/);
  return el("div", { class: "qc-ans" }, [...q.zh].map((ch, i) => known.has(ch)
    ? el("span", { class: "qc-ch" }, rubyEl(ch, bs[i] || "", "span"))
    : el("span", { class: "qc-bp" }, bopoColEl(bs[i] || ""))));
}
function renderQuanci(id) {
  const l = zhLesson(id);
  const list = l?.quanci || [];
  if (!list.length) return renderEmpty("#/", "這一課還沒有圈詞");
  const root = el("div", {});
  const header = renderHeader(`📝 圈詞聽寫・${l.title}`, { back: `#/zh/${l.id}` });
  root.appendChild(header);
  const progress = $(".header__progress", header);
  const app = el("main", { class: "app tc" });
  root.appendChild(app);
  let queue = shuffle(list.map(q => ({ q, again: false }))), i = 0, wrong = [];
  const show = () => {
    if (i >= queue.length) {
      if (wrong.length) { queue = shuffle(wrong.map(q => ({ q, again: true }))); wrong = []; i = 0; app.replaceChildren(el("div", { class: "tc-card" }, el("div", { class: "tc-end__msg" }, t("寫錯的再考一次！")), el("button", { class: "btn btn--accent btn--full btn--xl", onclick: show }, t("開始 ▶")))); return; }
      teachMark("quanci", l.id); teachEnd(app, `${list.length}個圈詞都寫對了！`, [teachBtn("🔁 再考一次", `#/quanci?l=${l.id}&r=${Date.now()}`, true), teachBtn("✏️ 回去練生字", `#/zh/${l.id}`)]); return;
    }
    const { q, again } = queue[i];
    progress.textContent = `${i + 1}/${queue.length}`;
    const say = () => speakZh(q.zh);
    setTimeout(say, 300);
    const ansBox = el("div", {});
    const btns = el("div", {});
    const reveal = el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => {
      reveal.remove();
      ansBox.replaceChildren(el("div", { class: "tc-tag tc-tag--chk" }, t("✅ 答案")), quanciAnswerEl(q, l),
        el("div", { class: "tc-tip" }, t("對一對：國字有沒有寫對？注音的聲調有沒有寫？（ˊˇˋ寫在右上角）")));
      btns.replaceChildren(el("div", { class: "home-learn" },
        el("button", { class: "btn btn--success btn--xl", onclick: () => { recordZh(`圈詞:${q.zh}`, true); dingCorrect(); i++; show(); } }, t("⭕ 我寫對了")),
        el("button", { class: "btn btn--xl", onclick: () => { recordZh(`圈詞:${q.zh}`, false); wrong.push(q); i++; show(); } }, t("❌ 寫錯了"))));
    } }, t("寫好了，看答案"));
    app.replaceChildren(el("div", { class: "tc-card" },
      el("div", { class: "tc-tag" }, t(again ? "🔁 再寫一次" : "👂 聽一聽，寫在紙上")),
      el("button", { class: "qc-say", onclick: say }, el("span", { class: "qc-say__icon" }, "🔊"), t("再聽一次")),
      el("div", { class: "tc-tip" }, t("拿紙和筆寫：學過的字寫國字，還沒學的字寫注音。")),
      reveal, ansBox, btns));
  };
  app.appendChild(el("div", { class: "tc-card" },
    el("div", { class: "tc-end__icon" }, "📝"), el("div", { class: "tc-end__msg" }, t(`圈詞聽寫：共${list.length}個詞`)),
    el("div", { class: "tc-tip" }, t("跟考試一樣：聽一個詞，在紙上寫下來，再看答案自己對。寫錯的最後會再考一次。")),
    el("div", { class: "qc-list" }, list.map(q => quanciAnswerEl(q, l))),
    el("button", { class: "btn btn--accent btn--full btn--xl", onclick: show }, t("開始聽寫 ▶"))));
  return root;
}

// === 🎩 英文名言背誦（二年級 11/16 作業：review Dr. Seuss rhyming quote）===
// 先看整段＋聽→押韻和句型怎麼記→填空小檢查→下一句是哪一句；學完記 teachDone["en:quote-<id>"]
const EN_QUOTES = {
  seuss: {
    title: "Dr. Seuss 名言", from: "I Can Read with My Eyes Shut! by Dr. Seuss", grade: "g2", until: "2026-12-31",
    lines: [
      { en: "The more that you READ,", zh: "你讀得越多，", key: "READ", keyZh: "讀" },
      { en: "the more things you will KNOW.", zh: "你知道的事情就越多。", key: "KNOW", keyZh: "知道" },
      { en: "The more that you LEARN,", zh: "你學得越多，", key: "LEARN", keyZh: "學" },
      { en: "the more places you'll GO.", zh: "你能去的地方就越多。", key: "GO", keyZh: "去" },
    ],
  },
};
function quoteLineEl(l, hideKey) {
  const parts = l.en.split(l.key);
  return el("div", { class: "qt-line" },
    el("div", { class: "qt-line__en" }, parts[0], hideKey ? el("span", { class: "qt-blank" }, "____") : el("b", { class: "qt-key" }, l.key), parts[1]),
    el("div", { class: "qt-line__zh" }, t(l.zh)),
    hideKey ? null : el("button", { class: "icon-btn icon-btn--accent", onclick: () => speak(l.en), "aria-label": "念這一句" }, "🔊"));
}
function renderQuote(id) {
  const Q = EN_QUOTES[id];
  if (!Q) return renderEmpty("#/", "找不到這段名言");
  const all = Q.lines.map(l => l.en).join(" ");
  const steps = [
    { kind: "learn", tag: "🎩 先聽、跟著念", body: () => el("div", { class: "qt" },
      el("div", { class: "qt-title" }, "🎩 ", t(Q.title)),
      Q.lines.map(l => quoteLineEl(l)),
      el("button", { class: "btn btn--full", onclick: () => speak(all) }, t("🔊 整段念一次")),
      el("div", { class: "qt-from" }, Q.from),
      el("div", { class: "tc-tip" }, t("跟著念三次：第一次看著念，第二次念大聲，第三次蓋住英文試試看。"))) },
    { kind: "learn", tag: "🧠 怎麼記", body: () => el("div", { class: "qt" },
      el("div", { class: "qt-memo" }, el("div", { class: "qt-memo__title" }, t("① 一樣的句型念兩次")),
        el("div", { class: "qt-memo__en" }, "The more that you ___, the more ___."), el("div", { class: "qt-line__zh" }, t("越…，就越…"))),
      el("div", { class: "qt-memo" }, el("div", { class: "qt-memo__title" }, t("② 四個大寫的字照順序：讀→知道→學→去")),
        el("div", { class: "qt-keys" }, Q.lines.map(l => el("span", { class: "qt-keychip" }, l.key, el("small", {}, t(l.keyZh)))))),
      el("div", { class: "qt-memo" }, el("div", { class: "qt-memo__title" }, t("③ 押韻：KNOW 和 GO 最後的聲音一樣（-o）")),
        el("button", { class: "btn btn--ghost", onclick: () => speak("know, go. know, go.") }, t("🔊 KNOW・GO"))),
      el("div", { class: "tc-tip" }, t("邊念邊做動作：READ 打開書、KNOW 指頭、LEARN 舉手、GO 原地踏步。"))) },
    ...shuffle(Q.lines.slice()).map(l => ({ kind: "chk", prompt: el("div", { class: "qt-chk" }, quoteLineEl(l, true)),
      options: shuffle(Q.lines.map(x => ({ label: x.key, ok: x.key === l.key }))), optClass: "tc-opts--four",
      teach: () => el("div", { class: "qt" }, Q.lines.map(x => quoteLineEl(x))) })),
    ...Q.lines.slice(0, -1).map((l, k) => ({ kind: "chk", prompt: el("div", { class: "qt-chk" }, el("div", { class: "tc-tip" }, t("下一句是哪一句？")), el("div", { class: "qt-line__en" }, l.en)),
      options: shuffle(Q.lines.slice(1).map(x => ({ label: x.en, ok: x === Q.lines[k + 1] }))), optClass: "tc-opts--wide",
      teach: () => el("div", { class: "qt" }, Q.lines.map(x => quoteLineEl(x))) })),
  ];
  return teachRunner(`🎩 ${Q.title}`, "#/", steps, app => {
    teachMark("en", `quote-${id}`);
    teachEnd(app, "背好了！明天再念一次會記更久 🌟", [teachBtn("🔁 再念一次", `#/quote/${id}`, true), teachBtn("🏠 回首頁", "#/")]);
  });
}
// 首頁英文：還在作業期間的名言卡
function quoteHomeCards() {
  const today = dayISO();
  return Object.entries(EN_QUOTES).filter(([, Q]) => Q.grade === CURRENT_GRADE && today <= Q.until).map(([id, Q]) =>
    el("button", { class: "hero__sentence hero__sentence--go qt-home", onclick: () => navigate(`#/quote/${id}`) },
      el("span", { class: "hero__sentence-icon" }, "🎩"),
      el("div", { class: "hero__sentence-body" }, el("div", { class: "hero__sentence-tag" }, t(`${Q.title}・老師要背${teachDoneDay("en", `quote-${id}`) === today ? "（今天背過了✓）" : "・點這裡練習"}`)),
        el("div", { class: "hero__sentence-en" }, `${Q.lines[0].en} ${Q.lines[1].en}`)),
      el("span", { class: "hero__sentence-go" }, "›")));
}
