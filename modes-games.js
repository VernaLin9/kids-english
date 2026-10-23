// 🎮 遊樂場：休閒小遊戲（打地鼠、氣球、兔子賽跑、賽車）
// 題目用現有資料：英文單字（WORDS）、一年級注音詞（ZH 注音課）、二年級生字（ZH kind:"chars"）、數學（一年級10以內加減、二年級第4單元）
// 每個遊戲都是 { prompt, say, options:[{ node, ok }] } 四選一，差別在玩法、時間與計分
// 最高分存在 profile.games[gameId][subject]

const GAMES = [
  { id: "mole",    emoji: "🐹", name: "打地鼠", desc: "地鼠冒出來，打對的那隻！60 秒拿高分", color: "candy-3" },
  { id: "balloon", emoji: "🎈", name: "戳氣球", desc: "氣球往上飄，戳對的那顆！飄走就少一條命", color: "candy-2" },
  { id: "race",    emoji: "🏁", name: "兔子賽跑", desc: "答對就往前跑，比烏龜先到終點！", color: "candy-1" },
  { id: "car",     emoji: "🏎️", name: "賽車", desc: "點一條車道，開進對的答案！連續答對會越開越快", color: "candy-3" },
];

// === 題目產生器 ===
function gameSubjects() {
  const out = [["en", "🔤 英文"]];
  if (typeof ZH !== "undefined" && ZH) out.push(["zh", "ㄅ 國語"]);
  if (typeof MATH !== "undefined" && MATH) out.push(["math", "➕ 數學"]);
  return out;
}
// 數學題：一年級 10 以內加減；二年級 兩位數加減、大於小於等於、湊 15（第4單元）
function makeMathGen() {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const numOpts = (ans, spread) => {
    const set = new Set([ans]);
    const cands = shuffle([ans + 1, ans - 1, ans + 2, ans - 2, ans + spread, ans - spread, ans + 3].filter(v => v >= 0 && v !== ans));
    for (const v of cands) { if (set.size >= 4) break; set.add(v); }
    return shuffle([...set]).map(v => ({ node: el("span", { class: "g-opt__num" }, String(v)), ok: v === ans }));
  };
  const mk = (text, opts, say) => ({ key: text, subject: "math", prompt: el("span", { class: "g-prompt__math", "data-nobopo": "1" }, text), say: () => speakZh(say || text.replace(/−/g, "減").replace(/\+/g, "加").replace("= ?", "等於多少")), sayAnswer: null, options: opts });
  if (CURRENT_GRADE === "g1") {
    return () => {
      if (Math.random() < 0.6) { const a = ri(1, 9), b = ri(0, 10 - a); return mk(`${a} + ${b} = ?`, numOpts(a + b, 2)); }
      const a = ri(2, 10), b = ri(0, a); return mk(`${a} − ${b} = ?`, numOpts(a - b, 2));
    };
  }
  return () => {
    const k = Math.random();
    if (k < 0.45) { const T = ri(30, 99), A = ri(10, T - 8); return mk(`${T} − ${A} = ?`, numOpts(T - A, 10)); }
    if (k < 0.75) { const A = ri(10, 60), B = ri(8, 99 - A); return mk(`${A} + ${B} = ?`, numOpts(A + B, 10)); }
    if (k < 0.9) {
      const rel = ["<", ">", "="][ri(0, 2)], a = ri(5, 40), b = ri(5, 40), L = a + b, R = rel === "=" ? L : rel === ">" ? L - ri(1, 4) : L + ri(1, 4);
      return mk(`${a} + ${b} ◯ ${R}`, ["<", ">", "="].map(x => ({ node: el("span", { class: "g-opt__num" }, x), ok: x === rel })), `${a}加${b}，和${R}比，要填大於、小於，還是等於`);
    }
    for (;;) { const a = ri(1, 9), b = ri(1, 9), c = 15 - a - b; if (a !== b && c >= 1 && c <= 9 && c !== a && c !== b) return mk(`${a} + ${b} + ? = 15`, numOpts(c, 3)); }
  };
}
function gameWordPool() {
  // 英文：本週＋前兩週＋答錯／沒學會的字；不夠 8 個就用全部
  const cw = getCurrentWeek();
  const recent = WEEKS.filter(w => w.num <= cw.num && w.num >= cw.num - 2).flatMap(w => w.words);
  const pool = [...new Set([...recent, ...wrongWords(), ...unmasteredWords().slice(0, 10)])].filter(w => WORDS[w]);
  return pool.length >= 8 ? pool : Object.keys(WORDS);
}
function makeQuestionGen(subject) {
  if (subject === "math") return makeMathGen();
  if (subject === "en") {
    const pool = gameWordPool();
    return () => {
      const w = pool[Math.floor(Math.random() * pool.length)];
      const info = WORDS[w];
      const ds = distractors(w);
      const toEn = Math.random() < 0.6;
      if (toEn) {
        return { key: w, subject, prompt: el("span", { class: "g-prompt__inner" }, el("span", { class: "g-prompt__emoji" }, info.emoji || ""), rubyEl(info.zh, info.bopo, "span")),
          say: () => speakZh(info.zh), sayAnswer: () => speak(info.speak || w),
          options: shuffle([w, ...ds]).map(x => ({ node: el("span", { class: "g-opt__en", "data-nobopo": "1" }, x), ok: x === w })) };
      }
      return { key: w, subject, prompt: el("span", { class: "g-prompt__inner" }, el("span", { class: "g-prompt__en", "data-nobopo": "1" }, w)),
        say: () => speak(info.speak || w), sayAnswer: () => speakZh(info.zh),
        options: shuffle([w, ...ds]).map(x => ({ node: el("span", { class: "g-opt__zh" }, (WORDS[x].emoji || "") + " ", rubyEl(WORDS[x].zh, WORDS[x].bopo, "span")), ok: x === w })) };
    };
  }
  // 國語
  const lessons = ZH.lessons;
  const charLessons = lessons.filter(l => l.kind === "chars");
  if (charLessons.length) {
    const chars = charLessons.flatMap(l => l.chars);
    return () => {
      const c = chars[Math.floor(Math.random() * chars.length)];
      const pool = shuffle([...new Set([...c.confuse.split(""), ...chars.map(x => x.zh)])].filter(z => z !== c.zh)).slice(0, 3);
      return { key: c.zh, subject, prompt: charPromptEl(c, true), say: () => speakZh(c.word), sayAnswer: () => speakZh(`${c.zh}，${c.word}`),
        options: shuffle([c.zh, ...pool]).map(z => ({ node: el("span", { class: "g-opt__char", "data-nobopo": "1" }, z), ok: z === c.zh })) };
    };
  }
  const words = lessons.flatMap(l => l.words);
  return () => {
    const w = words[Math.floor(Math.random() * words.length)];
    const variants = bopoVariants(w.bopo).slice(0, 3);
    return { key: w.zh, subject, prompt: el("span", { class: "g-prompt__inner" }, el("span", { class: "g-prompt__emoji" }, w.emoji), el("span", { class: "g-prompt__zhword", "data-nobopo": "1" }, w.zh)),
      say: () => speakZh(w.zh), sayAnswer: () => speakZh(w.zh),
      options: shuffle([w.bopo, ...variants]).map(b => ({ node: bopoWordEl(b, { class: "bopo-word--sm" }), ok: b === w.bopo })) };
  };
}
function gameRecord(q, ok) {
  if (q.subject === "en") recordWord(q.key, ok); else if (q.subject === "math") recordMath("game", ok); else recordZh(q.key, ok);
}
function gameBest(id, subject) { const p = getProfile(); return p?.games?.[id]?.[subject] || 0; }
function gameSaveScore(id, subject, score) {
  const p = getProfile(); if (!p) return false;
  p.games = p.games || {}; p.games[id] = p.games[id] || {};
  const isBest = score > (p.games[id][subject] || 0);
  if (isBest) p.games[id][subject] = score;
  p.stars = (p.stars || 0) + Math.floor(score / 50);
  saveStore();
  return isBest;
}

// === 遊樂場首頁 ===
function renderGames(subjectParam) {
  const profile = getProfile();
  const subjects = gameSubjects();
  const subject = subjects.some(([id]) => id === subjectParam) ? subjectParam : (subjects.some(([id]) => id === profile?.subject) ? profile.subject : "en");
  const root = el("div", {});
  root.appendChild(renderHeader("🎮 遊樂場", { back: "#/" }));
  const app = el("main", { class: "app" });
  if (subjects.length > 1) app.appendChild(el("div", { class: `subject-tabs subject-tabs--${subjects.length}` },
    subjects.map(([id, label]) => el("button", { class: `subject-tab ${subject === id ? "subject-tab--on" : ""}`, onclick: () => navigate(`#/games?s=${id}`) }, t(label)))));
  app.appendChild(el("div", { class: "g-intro" }, t(subject === "en" ? "用英文單字來玩！答對加分，連續答對分數更多" : subject === "math" ? "用數學題來玩！答對加分，連續答對分數更多" : "用國語來玩！答對加分，連續答對分數更多")));
  app.appendChild(el("div", { class: "g-list" }, GAMES.map(g => {
    const best = gameBest(g.id, subject);
    return el("button", { class: `g-card g-card--${g.color}`, onclick: () => navigate(`#/game/${g.id}?s=${subject}`) },
      el("span", { class: "g-card__emoji" }, g.emoji),
      el("span", { class: "g-card__body" }, el("span", { class: "g-card__name" }, t(g.name)), el("span", { class: "g-card__desc" }, t(g.desc)),
        el("span", { class: "g-card__best" }, best ? t(`🏆 最高分 ${best}`) : t("還沒玩過"))),
      el("span", { class: "g-card__go" }, "▶"));
  })));
  root.appendChild(app);
  return root;
}

// === 共用：遊戲外框（HUD）與結束畫面 ===
function gameShell(game, subject) {
  const root = el("div", { class: "g-root" });
  root.appendChild(renderHeader(`${game.emoji} ${game.name}`, { back: `#/games?s=${subject}` }));
  const app = el("main", { class: "app g-app" });
  root.appendChild(app);
  const hud = { score: el("span", { class: "g-hud__num" }, "0"), combo: el("span", { class: "g-hud__combo" }, ""), right: el("span", { class: "g-hud__num" }, "") };
  const hudEl = el("div", { class: "g-hud" },
    el("span", { class: "g-hud__item" }, t("分數 "), hud.score), hud.combo, el("span", { class: "g-hud__item g-hud__item--right" }, hud.right));
  const timers = new Set();
  const alive = () => document.body.contains(root);
  const every = (ms, fn) => { const id = setInterval(() => { if (!alive()) { clearInterval(id); return; } fn(); }, ms); timers.add(id); return id; };
  const after = (ms, fn) => { const id = setTimeout(() => { if (alive()) fn(); }, ms); timers.add(id); return id; };
  const stopAll = () => { timers.forEach(id => { clearInterval(id); clearTimeout(id); }); timers.clear(); };
  return { root, app, hud, hudEl, every, after, stopAll, alive };
}
function gameOver(sh, game, subject, score, extra) {
  sh.stopAll();
  const isBest = gameSaveScore(game.id, subject, score);
  const best = gameBest(game.id, subject);
  if (score > 0) dingCorrect();
  sh.app.replaceChildren(el("div", { class: "g-over pop" },
    el("div", { class: "g-over__emoji" }, isBest && score > 0 ? "🏆" : score > 0 ? "🎉" : "💪"),
    el("div", { class: "g-over__score" }, `${score} `, t("分")),
    isBest && score > 0 ? el("div", { class: "g-over__best" }, t("新紀錄！")) : el("div", { class: "g-over__best g-over__best--old" }, t(`最高分 ${best}`)),
    extra || null,
    el("div", { class: "g-over__stars" }, t(`得到 ${Math.floor(score / 50)} 顆 ⭐`)),
    el("div", { class: "g-over__btns" },
      el("button", { class: "btn btn--accent btn--xl", onclick: () => navigate(`#/game/${game.id}?s=${subject}`) }, t("🔁 再玩一次")),
      el("button", { class: "btn btn--ghost", onclick: () => navigate(`#/games?s=${subject}`) }, t("換一個遊戲")))));
}
// 倒數 3、2、1 再開始
function countdown(sh, then) {
  const n = el("div", { class: "g-count" }, "3");
  sh.app.appendChild(n);
  let k = 3;
  const id = sh.every(700, () => { k--; if (k <= 0) { clearInterval(id); n.remove(); then(); } else { n.textContent = String(k); n.classList.remove("pop"); void n.offsetWidth; n.classList.add("pop"); } });
}
const comboText = c => c >= 2 ? `🔥 連擊 x${c}` : "";

// === 🐹 打地鼠 ===
function renderGameMole(subject) {
  const game = GAMES[0];
  const sh = gameShell(game, subject);
  const gen = makeQuestionGen(subject);
  const DURATION = 60;
  let score = 0, combo = 0, left = DURATION, q = null, popsSinceCorrect = 0, locked = true;
  const promptEl = el("div", { class: "g-prompt" });
  const speakBtn = el("button", { class: "icon-btn icon-btn--accent g-speak", "aria-label": "念題目", onclick: () => q?.say() }, "🔊");
  const holes = Array.from({ length: 9 }, () => el("div", { class: "g-hole" }, el("div", { class: "g-mole" })));
  const grid = el("div", { class: "g-mole-grid" }, holes);
  sh.hud.right.textContent = `⏱ ${left}`;
  sh.app.replaceChildren(sh.hudEl, el("div", { class: "g-prompt-row" }, promptEl, speakBtn), grid);
  const updateHud = () => { sh.hud.score.textContent = String(score); sh.hud.combo.textContent = comboText(combo); };
  const newQuestion = () => { q = gen(); popsSinceCorrect = 0; promptEl.replaceChildren(q.prompt); q.say(); };
  const hideMole = hole => { hole.classList.remove("g-hole--up", "g-hole--hit", "g-hole--bad"); hole._opt = null; };
  const pop = () => {
    const free = holes.filter(h => !h.classList.contains("g-hole--up"));
    if (!free.length || !q) return;
    const hole = free[Math.floor(Math.random() * free.length)];
    const up = new Set(holes.filter(h => h.classList.contains("g-hole--up")).map(h => h._opt));
    const correctUp = [...up].some(o => o?.ok);
    const avail = q.options.filter(o => !up.has(o)); // 同一個答案不同時冒兩隻
    if (!avail.length) return;
    let opt;
    if (!correctUp && popsSinceCorrect >= 2) opt = q.options.find(o => o.ok);
    else opt = avail[Math.floor(Math.random() * avail.length)];
    popsSinceCorrect = opt.ok ? 0 : popsSinceCorrect + 1;
    hole._opt = opt; hole._q = q;
    const mole = hole.firstChild;
    mole.replaceChildren(el("span", { class: "g-mole__face" }, "🐹"), el("span", { class: "g-mole__label" }, opt.node.cloneNode(true)));
    hole.classList.add("g-hole--up");
    sh.after(2000, () => { if (hole._opt === opt) hideMole(hole); });
  };
  holes.forEach(hole => hole.addEventListener("pointerdown", e => {
    e.preventDefault();
    if (locked || !hole.classList.contains("g-hole--up") || !hole._opt) return;
    const opt = hole._opt, hq = hole._q;
    if (opt.ok && hq === q) {
      combo++; score += 10 * Math.min(combo, 5); gameRecord(q, true); dingCorrect();
      hole.classList.add("g-hole--hit"); hole.firstChild.querySelector(".g-mole__face").textContent = "😵";
      q.sayAnswer?.();
      holes.forEach(h => { if (h !== hole) hideMole(h); });
      sh.after(500, () => { hideMole(hole); newQuestion(); });
    } else {
      combo = 0; gameRecord(hq, false); buzzWrong();
      hole.classList.add("g-hole--bad");
      sh.after(400, () => hideMole(hole));
    }
    updateHud();
  }));
  countdown(sh, () => {
    locked = false; newQuestion();
    sh.every(850, pop);
    sh.every(1000, () => { left--; sh.hud.right.textContent = `⏱ ${left}`; if (left <= 10) sh.hud.right.classList.add("g-hud__num--hot"); if (left <= 0) { locked = true; gameOver(sh, game, subject, score); } });
  });
  return sh.root;
}

// === 🎈 戳氣球 ===
function renderGameBalloon(subject) {
  const game = GAMES[1];
  const sh = gameShell(game, subject);
  const gen = makeQuestionGen(subject);
  let score = 0, combo = 0, lives = 3, round = 0, q = null, locked = true;
  const COLORS = ["#ff6fa3", "#6b8cff", "#4ec9a8", "#ffb020", "#b388ff"];
  const promptEl = el("div", { class: "g-prompt" });
  const speakBtn = el("button", { class: "icon-btn icon-btn--accent g-speak", "aria-label": "念題目", onclick: () => q?.say() }, "🔊");
  const sky = el("div", { class: "g-sky" });
  const livesEl = () => "❤️".repeat(lives) + "🤍".repeat(Math.max(0, 3 - lives));
  sh.hud.right.textContent = livesEl();
  sh.app.replaceChildren(sh.hudEl, el("div", { class: "g-prompt-row" }, promptEl, speakBtn), sky);
  const updateHud = () => { sh.hud.score.textContent = String(score); sh.hud.combo.textContent = comboText(combo); sh.hud.right.textContent = livesEl(); };
  const clearSky = () => sky.replaceChildren();
  const nextRound = () => {
    if (lives <= 0) { locked = true; gameOver(sh, game, subject, score, el("div", { class: "g-over__msg" }, t(`戳破了 ${round} 題`))); return; }
    q = gen(); round++;
    promptEl.replaceChildren(q.prompt); q.say();
    clearSky();
    const dur = Math.max(9, 13 - round * 0.15); // 慢慢飄，越玩稍微快一點（小朋友反應原本太快）
    const slots = shuffle([0, 1, 2, 3]);
    const thisQ = q;
    q.options.forEach((opt, i) => {
      const b = el("button", { class: "g-balloon", style: `left: ${8 + slots[i] * 23}%; animation-duration: ${dur}s; animation-delay: ${i * 0.5}s; --bc: ${COLORS[(round + i) % COLORS.length]};` },
        el("span", { class: "g-balloon__body" }, opt.node), el("span", { class: "g-balloon__string" }));
      b.addEventListener("pointerdown", e => {
        e.preventDefault();
        if (locked || thisQ !== q || b.classList.contains("g-balloon--pop")) return;
        b.classList.add("g-balloon--pop");
        if (opt.ok) {
          combo++; score += 10 * Math.min(combo, 5); gameRecord(q, true); dingCorrect(); q.sayAnswer?.();
          b.firstChild.textContent = "💥"; updateHud();
          sky.querySelectorAll(".g-balloon").forEach(x => { if (x !== b) x.classList.add("g-balloon--fade"); });
          sh.after(700, nextRound);
        } else { combo = 0; gameRecord(q, false); buzzWrong(); b.firstChild.textContent = "❌"; updateHud(); }
      });
      b.addEventListener("animationend", () => { // 飄走了
        if (thisQ !== q || b.classList.contains("g-balloon--pop")) return;
        if (opt.ok) { lives--; combo = 0; gameRecord(q, false); buzzWrong(); updateHud(); sky.classList.add("shake"); sh.after(400, () => sky.classList.remove("shake")); sh.after(500, nextRound); }
        else b.remove();
      });
      sky.appendChild(b);
    });
  };
  countdown(sh, () => { locked = false; nextRound(); });
  return sh.root;
}

// === 🏁 兔子賽跑 ===
function renderGameRace(subject) {
  const game = GAMES[2];
  const sh = gameShell(game, subject);
  const gen = makeQuestionGen(subject);
  const TRACK = 100, QS = 10;
  let me = 0, rival = 0, qi = 0, score = 0, combo = 0, q = null, qStart = 0, locked = true, stunned = false, finished = false;
  const promptEl = el("div", { class: "g-prompt" });
  const speakBtn = el("button", { class: "icon-btn icon-btn--accent g-speak", "aria-label": "念題目", onclick: () => q?.say() }, "🔊");
  const meEl = el("span", { class: "g-runner g-runner--me" }, "🐰"), rivalEl = el("span", { class: "g-runner g-runner--rival" }, "🐢");
  const track = el("div", { class: "g-track" }, el("div", { class: "g-lane" }, meEl, el("span", { class: "g-flag" }, "🏁")), el("div", { class: "g-lane" }, rivalEl, el("span", { class: "g-flag" }, "🏁")));
  const opts = el("div", { class: "g-race-opts" });
  const feedback = el("div", { class: "quiz-feedback" });
  sh.hud.right.textContent = `第 0/${QS} 題`;
  sh.app.replaceChildren(sh.hudEl, track, el("div", { class: "g-prompt-row" }, promptEl, speakBtn), opts, feedback);
  const draw = () => { meEl.style.left = `${Math.min(me, TRACK) * 0.86}%`; rivalEl.style.left = `${Math.min(rival, TRACK) * 0.86}%`; };
  const updateHud = () => { sh.hud.score.textContent = String(score); sh.hud.combo.textContent = comboText(combo); sh.hud.right.textContent = `第 ${qi}/${QS} 題`; };
  const end = (win) => {
    if (finished) return; finished = true; locked = true;
    if (win) score += 50;
    gameOver(sh, game, subject, score, el("div", { class: "g-over__msg" }, t(win ? "🐰 兔子贏了！比烏龜先到終點" : "🐢 烏龜先到了，再試一次！")));
  };
  const ask = () => {
    if (qi >= QS) { end(me >= rival); return; }
    q = gen(); qi++; qStart = Date.now(); updateHud();
    promptEl.replaceChildren(q.prompt); q.say();
    feedback.textContent = ""; feedback.className = "quiz-feedback";
    const thisQ = q;
    opts.replaceChildren(...q.options.map(opt => {
      const b = el("button", { class: "zh-opt g-race-opt" }, opt.node);
      b.addEventListener("click", () => {
        if (locked || stunned || thisQ !== q || finished) return;
        if (opt.ok) {
          const fast = Date.now() - qStart < 4000;
          combo++; const gain = 10 * Math.min(combo, 5) + (fast ? 5 : 0); score += gain;
          me += fast ? 13 : 10; gameRecord(q, true); dingCorrect(); q.sayAnswer?.();
          b.classList.add("zh-opt--ok"); feedback.textContent = fast ? `好快！+${gain} 🚀` : `+${gain}`; feedback.className = "quiz-feedback quiz-feedback--correct pop";
          meEl.classList.add("g-runner--hop"); sh.after(400, () => meEl.classList.remove("g-runner--hop"));
          draw(); updateHud();
          if (me >= TRACK) { sh.after(500, () => end(true)); return; }
          sh.after(700, ask);
        } else {
          combo = 0; gameRecord(q, false); buzzWrong(); b.classList.add("zh-opt--bad"); b.disabled = true;
          stunned = true; feedback.textContent = "哎呀，絆倒了 😵"; feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          sh.after(900, () => { stunned = false; });
          updateHud();
        }
      });
      return b;
    }));
  };
  draw();
  countdown(sh, () => {
    locked = false; ask();
    sh.every(700, () => { if (finished) return; rival += 1.6; draw(); if (rival >= TRACK) end(false); });
  });
  return sh.root;
}


// === 🏎️ 賽車：3 條車道，答案寫在前面的拱門上，點車道把車開進對的拱門 ===
function renderGameCar(subject) {
  const game = GAMES.find(g => g.id === "car");
  const sh = gameShell(game, subject);
  const gen = makeQuestionGen(subject);
  const GATES = 15;
  let score = 0, combo = 0, gate = 0, lane = 1, q = null, locked = true, raf = 0, hits = 0;
  const promptEl = el("div", { class: "g-prompt" });
  const speakBtn = el("button", { class: "icon-btn icon-btn--accent g-speak", "aria-label": "念題目", onclick: () => q?.say() }, "🔊");
  const car = el("div", { class: "g-car" }, "🏎️");
  const gateRow = el("div", { class: "g-gates" });
  const laneBtns = [0, 1, 2].map(i => { const b = el("button", { class: "g-lane-btn", "aria-label": `第${i + 1}條車道` }); b.addEventListener("pointerdown", e => { e.preventDefault(); if (!locked) { lane = i; placeCar(); } }); return b; });
  const road = el("div", { class: "g-road" }, el("div", { class: "g-road__lines" }), gateRow, car, el("div", { class: "g-lane-btns" }, laneBtns));
  const speedEl = el("div", { class: "g-speed" });
  sh.hud.right.textContent = `🚩 0/${GATES}`;
  sh.app.replaceChildren(sh.hudEl, el("div", { class: "g-prompt-row" }, promptEl, speakBtn), road, speedEl);
  const placeCar = () => { car.style.left = `${lane * 33.33 + 16.66}%`; laneBtns.forEach((b, i) => b.classList.toggle("g-lane-btn--on", i === lane)); };
  const updateHud = () => { sh.hud.score.textContent = String(score); sh.hud.combo.textContent = comboText(combo); sh.hud.right.textContent = `🚩 ${gate}/${GATES}`; };
  const travelMs = () => Math.max(4200, 7000 - combo * 450); // 連續答對越開越快，最快 4.2 秒
  const showSpeed = () => { const lv = Math.round((7000 - travelMs()) / 450); speedEl.replaceChildren(t("速度 "), el("span", { class: "g-speed__bar" }, "▮".repeat(lv + 1) + "▯".repeat(Math.max(0, 7 - lv)))); road.style.setProperty("--road-speed", `${Math.max(0.25, 0.9 - combo * 0.1)}s`); };
  const nextGate = () => {
    if (gate >= GATES) { locked = true; gameOver(sh, game, subject, score, el("div", { class: "g-over__msg" }, t(`🏁 跑完了！開進對的答案 ${hits} 次`))); return; }
    q = gen(); gate++; updateHud(); showSpeed();
    promptEl.replaceChildren(q.prompt); q.say();
    const right = q.options.find(o => o.ok), wrongs = shuffle(q.options.filter(o => !o.ok)).slice(0, 2);
    const opts = shuffle([right, ...wrongs]);
    gateRow.replaceChildren(...opts.map(o => el("div", { class: "g-gate" }, el("span", { class: "g-gate__label" }, o.node.cloneNode(true)))));
    const thisQ = q, start = performance.now(), dur = travelMs();
    const tick = now => {
      if (!sh.alive() || thisQ !== q) return;
      const p = Math.min(1, (now - start) / dur);
      gateRow.style.top = `${-18 + p * 78}%`;
      if (p < 1) { raf = requestAnimationFrame(tick); return; }
      const ok = opts[lane] === right;
      gameRecord(q, ok);
      const g = gateRow.children[lane];
      if (ok) { hits++; combo++; score += 10 * Math.min(combo, 5); dingCorrect(); q.sayAnswer?.(); g.classList.add("g-gate--ok"); car.classList.add("g-car--boost"); }
      else { combo = 0; buzzWrong(); g.classList.add("g-gate--bad"); gateRow.children[opts.indexOf(right)].classList.add("g-gate--ok"); car.classList.add("g-car--crash"); }
      updateHud();
      sh.after(ok ? 600 : 1300, () => { car.classList.remove("g-car--boost", "g-car--crash"); nextGate(); });
    };
    raf = requestAnimationFrame(tick);
  };
  placeCar(); showSpeed();
  countdown(sh, () => { locked = false; nextGate(); });
  return sh.root;
}

function renderGame(id, subject) {
  const subjects = gameSubjects();
  const s = subjects.some(([x]) => x === subject) ? subject : "en";
  if (id === "mole") return renderGameMole(s);
  if (id === "balloon") return renderGameBalloon(s);
  if (id === "race") return renderGameRace(s);
  if (id === "car") return renderGameCar(s);
  return renderGames(s);
}
