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
    return el("div", { class: "tc-word" }, stage, syllableEl(w, "div", { class: "tc-word__en" }),
      rubyEl(info.zh || "", info.bopo || "", "div", { class: "tc-word__zh" }),
      el("div", { class: "tc-tip" }, t(parts && parts.length > 1 ? `👏 拍手念：${parts.join("・")}（拍${parts.length}下），念三次！` : `👏 大聲念三次：${w}！`)),
      el("button", { class: "btn btn--ghost btn--full", onclick: () => speakWord(w) }, t("🔊 再聽一次")));
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
        el("div", { class: "tc-tip" }, t(`✍️ 用手指在桌上寫一次，邊寫邊數：1、2…${c.strokes}畫`)));
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
