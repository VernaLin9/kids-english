// 🎮 遊樂場：休閒小遊戲（打地鼠、氣球、兔子賽跑、賽車）
// 題目用現有資料：英文單字（WORDS）、一年級注音詞（ZH 注音課）、二年級生字（ZH kind:"chars"）、數學（一年級10以內加減、二年級第4單元）
// 每個遊戲都是 { prompt, say, options:[{ node, ok }] } 四選一，差別在玩法、時間與計分
// 最高分存在 profile.games[gameId][subject]

const GAMES = [
  { id: "mole",    emoji: "🐹", name: "打地鼠", desc: "地鼠冒出來，打對的那隻！60 秒拿高分", color: "candy-3" },
  { id: "balloon", emoji: "🎈", name: "戳氣球", desc: "氣球往上飄，戳對的那顆！飄走就少一條命", color: "candy-2" },
  { id: "race",    emoji: "🏁", name: "兔子賽跑", desc: "答對就往前跑，比烏龜先到終點！", color: "candy-1" },
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
  const calcFrom = text => { const m = text.match(/^(\d+) ([+−]) (\d+)/); return m ? { op: m[2] === "+" ? "add" : "sub", a: +m[1], b: +m[3] } : null; };
  const mk = (text, opts, say, explain, calc) => ({ key: text, subject: "math", explain, calc: calc || calcFrom(text), prompt: el("span", { class: "g-prompt__math", "data-nobopo": "1" }, text), say: () => speakZh(say || text.replace(/−/g, "減").replace(/\+/g, "加").replace("= ?", "等於多少")), sayAnswer: null, options: opts });
  // 算法說明（答錯時教）：一行一步，用小朋友聽得懂的話；可以按 🔊 念出來
  const subSteps = (T, A) => { const t1 = T % 10, a1 = A % 10, t10 = Math.floor(T / 10), a10 = Math.floor(A / 10);
    return t1 < a1 ? [`個位 ${t1} 減 ${a1}，不夠減`, `跟十位借 10 過來：${t1 + 10} − ${a1} = ${t1 + 10 - a1}`, `十位被借走 1，剩 ${t10 - 1}：${t10 - 1} − ${a10} = ${t10 - 1 - a10}`, `合起來就是 ${T - A}`, `檢查：${T - A} + ${A} = ${T} ✓`]
      : [`先算個位：${t1} − ${a1} = ${t1 - a1}`, `再算十位：${t10} − ${a10} = ${t10 - a10}`, `合起來就是 ${T - A}`]; };
  const addSteps = (A, B) => { const a1 = A % 10, b1 = B % 10, s1 = a1 + b1, A10 = Math.floor(A / 10), B10 = Math.floor(B / 10);
    return s1 >= 10 ? [`先算個位：${a1} + ${b1} = ${s1}`, `滿 10 了！個位寫 ${s1 - 10}，多的 1 送去十位`, `再算十位：${A10} + ${B10} + 1 = ${A10 + B10 + 1}`, `合起來就是 ${A + B}`]
      : [`先算個位：${a1} + ${b1} = ${s1}`, `再算十位：${A10} + ${B10} = ${A10 + B10}`, `合起來就是 ${A + B}`]; };
  if (CURRENT_GRADE === "g1") {
    return () => {
      if (Math.random() < 0.6) { const a = ri(1, 9), b = ri(0, 10 - a); return mk(`${a} + ${b} = ?`, numOpts(a + b, 2), null, b ? [`先伸出 ${a} 根手指`, `再多伸出 ${b} 根`, `數一數，一共 ${a + b} 根`] : [`加 0 就是什麼都沒加`, `所以還是 ${a}`]); }
      const a = ri(2, 10), b = ri(0, a); return mk(`${a} − ${b} = ?`, numOpts(a - b, 2), null, b ? [`先伸出 ${a} 根手指`, `收起來 ${b} 根`, `還剩下 ${a - b} 根`] : [`減 0 就是什麼都沒拿走`, `所以還是 ${a}`]);
    };
  }
  return () => {
    const k = Math.random();
    if (k < 0.45) { const T = ri(30, 99), A = ri(10, T - 8); return mk(`${T} − ${A} = ?`, numOpts(T - A, 10), null, subSteps(T, A)); }
    if (k < 0.75) { const A = ri(10, 60), B = ri(8, 99 - A); return mk(`${A} + ${B} = ?`, numOpts(A + B, 10), null, addSteps(A, B)); }
    if (k < 0.9) {
      const rel = ["<", ">", "="][ri(0, 2)], a = ri(5, 40), b = ri(5, 40), L = a + b, R = rel === "=" ? L : rel === ">" ? L - ri(1, 4) : L + ri(1, 4);
      return mk(`${a} + ${b} ◯ ${R}`, ["<", ">", "="].map(x => ({ node: el("span", { class: "g-opt__num" }, x), ok: x === rel })), `${a}加${b}，和${R}比，要填大於、小於，還是等於`,
        [`先算左邊：${a} + ${b} = ${L}`, rel === "=" ? `${L} 和 ${R} 一樣大，填 =` : `${L} 和 ${R} 比，${Math.max(L, R)} 比較大`, rel === "=" ? `一樣大就用等號` : `開口開開的那邊對著大的數：${L} ${rel} ${R}`]);
    }
    for (;;) { const a = ri(1, 9), b = ri(1, 9), c = 15 - a - b; if (a !== b && c >= 1 && c <= 9 && c !== a && c !== b) return mk(`${a} + ${b} + ? = 15`, numOpts(c, 3), null, [`先算 ${a} + ${b} = ${a + b}`, `${a + b} 還要再加多少，才會變成 15？`, `15 − ${a + b} = ${c}，答案是 ${c}`]); }
  };
}
function gameWordPool() {
  // 英文：本週＋前兩週＋答錯／沒學會的字；不夠 8 個就用全部
  const cw = getCurrentWeek();
  const recent = WEEKS.filter(w => w.num <= cw.num && w.num >= cw.num - 2).flatMap(w => w.words);
  const pool = [...new Set([...recent, ...wrongWords(), ...unmasteredWords().slice(0, 10)])].filter(w => WORDS[w]);
  return pool.length >= 8 ? pool : Object.keys(WORDS);
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
// === 共用：遊戲外框（HUD）與結束畫面 ===
function gameShell(game, subject, c = null) {
  const root = el("div", { class: `g-root g-root--${game.id}` });
  root.appendChild(renderHeader(`${game.emoji} ${game.name}`, { back: `#/games?s=${subject}${c ? `&c=${encodeURIComponent(c)}` : ""}` }));
  const app = el("main", { class: `app g-app g-app--${game.id}` });
  root.appendChild(app);
  const hud = { score: el("span", { class: "g-hud__num" }, "0"), combo: el("span", { class: "g-hud__combo" }, ""), right: el("span", { class: "g-hud__num g-hud__num--right" }, "") };
  const hudEl = el("div", { class: "g-hud" },
    el("span", { class: "g-hud__pill g-hud__pill--score" }, el("span", { class: "g-hud__icon" }, "⭐"), hud.score), hud.combo,
    el("span", { class: "g-hud__pill g-hud__pill--right" }, hud.right));
  const timers = new Set();
  let paused = false;
  const holds = new Set(); // 暫停的原因：teach（答錯教學）、user（按了暫停鍵）
  const alive = () => document.body.contains(root);
  const every = (ms, fn) => { const id = setInterval(() => { if (!alive()) { clearInterval(id); return; } if (!paused) fn(); }, ms); timers.add(id); return id; };
  const pause = (on, why = "teach") => { if (on) holds.add(why); else holds.delete(why); paused = holds.size > 0; app.classList.toggle("g-app--paused", paused); };
  const isPaused = () => paused;
  const after = (ms, fn) => { const id = setTimeout(() => { if (alive()) fn(); }, ms); timers.add(id); return id; };
  // 遊戲時間：暫停的時候不算（例如地鼠暫停時不會躲回去）
  const afterPlay = (ms, fn) => after(ms, function check() { if (paused) after(300, check); else fn(); });
  const stopAll = () => { timers.forEach(id => { clearInterval(id); clearTimeout(id); }); timers.clear(); };
  // ⏸ 暫停鍵：小朋友想慢慢算、慢慢想的時候按。不擋住畫面：題目和答案都看得到、可以直接點；點了答案就自動繼續
  const pauseBtn = el("button", { class: "g-pause-btn", "aria-label": "暫停" }, "⏸");
  const pauseBar = el("div", { class: "g-pausebar", hidden: true }, t("⏸ 暫停中：慢慢想，想好了直接點答案，或按 ▶ 繼續"));
  const setUserPause = on => {
    pause(on, "user");
    pauseBtn.textContent = on ? "▶" : "⏸"; pauseBtn.setAttribute("aria-label", on ? "繼續" : "暫停");
    pauseBtn.classList.toggle("g-pause-btn--on", on);
    pauseBar.hidden = !on;
  };
  pauseBtn.addEventListener("click", () => setUserPause(!holds.has("user")));
  app.addEventListener("pointerdown", e => { if (holds.has("user") && e.target.closest(".g-balloon, .g-hole, .g-race-opt")) setTimeout(() => setUserPause(false), 250); }, true);
  hudEl.appendChild(pauseBtn);
  hudEl.appendChild(pauseBar);
  return { root, app, hud, hudEl, every, after, afterPlay, stopAll, alive, pause, isPaused, c };
}
// === 特效：答對時冒出分數和彩色碎片，答錯時冒出 ✗ ===
function fxLayer() { let l = document.querySelector(".g-fx"); if (!l) { l = el("div", { class: "g-fx", "aria-hidden": "true" }); document.body.appendChild(l); } return l; }
function fxAt(target) { const r = target.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
function fxPop(target, text, bad) {
  const [x, y] = fxAt(target);
  const n = el("div", { class: `g-fx__pop ${bad ? "g-fx__pop--bad" : ""}`, style: `left:${x}px; top:${y}px;`, "data-nobopo": "1" }, text);
  fxLayer().appendChild(n); setTimeout(() => n.remove(), 900);
}
function fxBurst(target, count = 12) {
  const [x, y] = fxAt(target), layer = fxLayer();
  const bits = ["⭐", "✨", "🎉", "💖", "🌟"];
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.4, d = 60 + Math.random() * 60;
    const n = el("div", { class: "g-fx__bit", style: `left:${x}px; top:${y}px; --dx:${Math.cos(a) * d}px; --dy:${Math.sin(a) * d}px;`, "data-nobopo": "1" }, bits[i % bits.length]);
    layer.appendChild(n); setTimeout(() => n.remove(), 800);
  }
}
function fxHit(target, gain) { fxPop(target, `+${gain}`); fxBurst(target); }
function fxMiss(target) { fxPop(target, "✗", true); }
function confetti(n = 60) {
  const layer = fxLayer(), colors = ["#ff6fa3", "#6b8cff", "#4ec9a8", "#ffb020", "#b388ff"];
  for (let i = 0; i < n; i++) {
    const c = el("div", { class: "g-fx__confetti", style: `left:${Math.random() * 100}vw; background:${colors[i % colors.length]}; animation-delay:${Math.random() * 0.6}s; animation-duration:${1.6 + Math.random() * 1.2}s; --rot:${Math.random() * 720 - 360}deg;` });
    layer.appendChild(c); setTimeout(() => c.remove(), 3400);
  }
}
// 星星：照分數給 1～3 顆（每個遊戲門檻不同）
const STAR_LEVELS = { mole: [50, 150, 280], balloon: [40, 120, 240], race: [80, 180, 260], car: [100, 300, 520] };
const starsFor = (id, score) => (STAR_LEVELS[id] || [50, 150, 300]).filter(v => score >= v).length;

function gameOver(sh, game, subject, score, extra) {
  sh.stopAll();
  const isBest = gameSaveScore(game.id, subject, score);
  const best = gameBest(game.id, subject);
  if (score > 0) dingCorrect();
  const stars = starsFor(game.id, score);
  if (stars >= 2 || (isBest && score > 0)) setTimeout(() => confetti(), 200);
  sh.app.replaceChildren(el("div", { class: "g-over pop" },
    el("div", { class: "g-over__emoji" }, isBest && score > 0 ? "🏆" : score > 0 ? "🎉" : "💪"),
    el("div", { class: "g-over__rating" }, [0, 1, 2].map(i => el("span", { class: `g-over__star ${i < stars ? "g-over__star--on" : ""}`, style: `animation-delay:${0.25 + i * 0.25}s;` }, "★"))),
    el("div", { class: "g-over__score" }, `${score} `, t("分")),
    isBest && score > 0 ? el("div", { class: "g-over__best" }, t("新紀錄！")) : el("div", { class: "g-over__best g-over__best--old" }, t(`最高分 ${best}`)),
    extra || null,
    Math.floor(score / 50) > 0 ? el("div", { class: "g-over__stars" }, t(`星星罐 +${Math.floor(score / 50)} ⭐`)) : null,
    sh.learn ? learnSummary(sh.learn) : null,
    el("div", { class: "g-over__btns" },
      el("button", { class: "btn btn--accent btn--xl", onclick: () => navigate(`#/game/${game.id}?s=${subject}${sh.c ? `&c=${encodeURIComponent(sh.c)}` : ""}`) }, t("🔁 再玩一次")),
      el("button", { class: "btn btn--ghost", onclick: () => navigate(`#/games?s=${subject}${sh.c ? `&c=${encodeURIComponent(sh.c)}` : ""}`) }, t("換一個遊戲")))));
}
// 倒數 3、2、1 再開始
function countdown(sh, then) {
  const num = el("span", { class: "g-count__num" }, "3");
  const n = el("div", { class: "g-count" }, el("div", { class: "g-count__ring" }, num));
  sh.app.appendChild(n);
  let k = 3;
  const bump = () => { num.classList.remove("g-count__num--bump"); void num.offsetWidth; num.classList.add("g-count__num--bump"); };
  bump();
  const id = sh.every(700, () => {
    k--;
    if (k === 0) { num.replaceChildren(t("開始！")); n.classList.add("g-count--go"); bump(); }
    else if (k < 0) { clearInterval(id); n.remove(); then(); }
    else { num.textContent = String(k); bump(); }
  });
}
const comboText = c => c >= 2 ? `🔥 x${c}` : "";

// === 🐹 打地鼠 ===
function renderGameMole(subject, c) {
  const game = GAMES[0];
  const sh = gameShell(game, subject, c);
  const L = makeLearnSession(subject, c); sh.learn = L;
  const gen = () => L.next();
  const DURATION = subject === "math" ? 90 : 60;
  const MOLE_STAY = subject === "math" ? 5000 : 3000, MOLE_EVERY = subject === "math" ? 1500 : 1100; // 數學要時間算，地鼠待久一點
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
    sh.afterPlay(MOLE_STAY, () => { if (hole._opt === opt) hideMole(hole); });
  };
  holes.forEach(hole => hole.addEventListener("pointerdown", e => {
    e.preventDefault();
    if (locked || !hole.classList.contains("g-hole--up") || !hole._opt) return;
    const opt = hole._opt, hq = hole._q;
    if (opt.ok && hq === q) {
      combo++; score += 10 * Math.min(combo, 5); gameRecord(q, true); dingCorrect();
      hole.classList.add("g-hole--hit"); hole.firstChild.querySelector(".g-mole__face").textContent = "😵"; fxHit(hole, 10 * Math.min(combo, 5));
      q.sayAnswer?.();
      holes.forEach(h => { if (h !== hole) hideMole(h); });
      sh.after(500, () => { hideMole(hole); newQuestion(); });
    } else {
      combo = 0; gameRecord(hq, false); buzzWrong();
      hole.classList.add("g-hole--bad"); fxMiss(hole);
      if (hq === q) teachMiss(sh, L, hq, () => {});
      sh.after(400, () => hideMole(hole));
    }
    updateHud();
  }));
  learnFirst(sh, L, () => countdown(sh, () => {
    locked = false; newQuestion();
    sh.every(MOLE_EVERY, pop);
    sh.every(1000, () => { left--; sh.hud.right.textContent = `⏱ ${left}`; if (left <= 10) sh.hud.right.classList.add("g-hud__num--hot"); if (left <= 0) { locked = true; gameOver(sh, game, subject, score); } });
  }));
  return sh.root;
}

// === 🎈 戳氣球 ===
function renderGameBalloon(subject, c) {
  const game = GAMES[1];
  const sh = gameShell(game, subject, c);
  const L = makeLearnSession(subject, c); sh.learn = L;
  const gen = () => L.next();
  let score = 0, combo = 0, lives = 3, round = 0, q = null, locked = true;
  const COLORS = ["#ff6fa3", "#6b8cff", "#4ec9a8", "#ffb020", "#b388ff"];
  const promptEl = el("div", { class: "g-prompt" });
  const speakBtn = el("button", { class: "icon-btn icon-btn--accent g-speak", "aria-label": "念題目", onclick: () => q?.say() }, "🔊");
  const sky = el("div", { class: "g-sky" });
  const scenery = el("div", { class: "g-sky__scenery", "aria-hidden": "true" },
    el("span", { class: "g-sun" }, "☀️"), el("span", { class: "g-cloud g-cloud--1" }, "☁️"), el("span", { class: "g-cloud g-cloud--2" }, "☁️"), el("span", { class: "g-cloud g-cloud--3" }, "☁️"),
    el("div", { class: "g-hills" }));
  sky.appendChild(scenery);
  const livesEl = () => "❤️".repeat(lives) + "🤍".repeat(Math.max(0, 3 - lives));
  sh.hud.right.textContent = livesEl();
  sh.app.replaceChildren(sh.hudEl, el("div", { class: "g-prompt-row" }, promptEl, speakBtn), sky);
  const updateHud = () => { sh.hud.score.textContent = String(score); sh.hud.combo.textContent = comboText(combo); sh.hud.right.textContent = livesEl(); };
  const clearSky = () => sky.replaceChildren(scenery);
  const nextRound = () => {
    if (lives <= 0) { locked = true; gameOver(sh, game, subject, score, el("div", { class: "g-over__msg" }, t(`戳破了 ${round} 題`))); return; }
    q = gen(); round++;
    promptEl.replaceChildren(q.prompt); q.say();
    clearSky();
    // 飄的時間（秒）：數學要時間算，固定很慢、不會越來越快；英文／國語也放慢
    const dur = subject === "math" ? (CURRENT_GRADE === "g1" ? 22 : 28) : Math.max(13, 16 - round * 0.1);
    const slots = shuffle([0, 1, 2, 3]);
    const thisQ = q;
    q.options.forEach((opt, i) => {
      const b = el("button", { class: "g-balloon", style: `left: ${8 + slots[i] * 23}%; animation-duration: ${dur}s; animation-delay: ${(i * 0.5 - dur * 0.18).toFixed(2)}s; --bc: ${COLORS[(round + i) % COLORS.length]};` },
        el("span", { class: "g-balloon__body" }, opt.node), el("span", { class: "g-balloon__string" }));
      b.addEventListener("pointerdown", e => {
        e.preventDefault();
        if (locked || thisQ !== q || b.classList.contains("g-balloon--pop")) return;
        b.classList.add("g-balloon--pop");
        if (opt.ok) {
          combo++; score += 10 * Math.min(combo, 5); gameRecord(q, true); dingCorrect(); q.sayAnswer?.();
          b.firstChild.textContent = "💥"; fxHit(b, 10 * Math.min(combo, 5)); updateHud();
          sky.querySelectorAll(".g-balloon").forEach(x => { if (x !== b) x.classList.add("g-balloon--fade"); });
          sh.after(700, nextRound);
        } else { combo = 0; gameRecord(q, false); buzzWrong(); b.firstChild.textContent = "❌"; fxMiss(b); updateHud(); teachMiss(sh, L, q, () => {}); }
      });
      b.addEventListener("animationend", () => { // 飄走了
        if (thisQ !== q || b.classList.contains("g-balloon--pop")) return;
        if (opt.ok) { lives--; combo = 0; gameRecord(q, false); buzzWrong(); updateHud(); sky.classList.add("shake"); sh.after(400, () => sky.classList.remove("shake")); sh.after(500, () => teachMiss(sh, L, thisQ, nextRound)); }
        else b.remove();
      });
      sky.appendChild(b);
    });
  };
  learnFirst(sh, L, () => countdown(sh, () => { locked = false; nextRound(); }));
  return sh.root;
}

// === 🏁 兔子賽跑 ===
function renderGameRace(subject, c) {
  const game = GAMES[2];
  const sh = gameShell(game, subject, c);
  const L = makeLearnSession(subject, c); sh.learn = L;
  const gen = () => L.next();
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
          const fast = Date.now() - qStart < (subject === "math" ? 9000 : 5000);
          combo++; const gain = 10 * Math.min(combo, 5) + (fast ? 5 : 0); score += gain;
          me += fast ? 13 : 10; gameRecord(q, true); dingCorrect(); q.sayAnswer?.();
          b.classList.add("zh-opt--ok"); fxHit(b, gain); feedback.textContent = fast ? `好快！+${gain} 🚀` : `+${gain}`; feedback.className = "quiz-feedback quiz-feedback--correct pop";
          meEl.classList.add("g-runner--hop"); sh.after(400, () => meEl.classList.remove("g-runner--hop"));
          draw(); updateHud();
          if (me >= TRACK) { sh.after(500, () => end(true)); return; }
          sh.after(700, ask);
        } else {
          combo = 0; gameRecord(q, false); buzzWrong(); b.classList.add("zh-opt--bad"); b.disabled = true; fxMiss(b);
          stunned = true; feedback.textContent = "哎呀，絆倒了 😵"; feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          sh.after(900, () => { stunned = false; });
          teachMiss(sh, L, q, () => {});
          updateHud();
        }
      });
      return b;
    }));
  };
  draw();
  learnFirst(sh, L, () => countdown(sh, () => {
    locked = false; ask();
    // 烏龜跑完全程的秒數：數學要算，給比較久
    const turtleSec = subject === "math" ? (CURRENT_GRADE === "g1" ? 130 : 170) : 100;
    sh.every(700, () => { if (finished) return; rival += TRACK / (turtleSec / 0.7); draw(); if (rival >= TRACK) end(false); });
  }));
  return sh.root;
}


// === 🏎️ 賽車：3 條車道，答案寫在前面的拱門上，點車道把車開進對的拱門 ===
function renderGameCar(subject, c) {
  const game = GAMES.find(g => g.id === "car");
  const sh = gameShell(game, subject, c);
  const L = makeLearnSession(subject, c); sh.learn = L;
  const gen = () => L.next();
  const GATES = 15;
  let score = 0, combo = 0, gate = 0, lane = 1, q = null, locked = true, raf = 0, hits = 0;
  const promptEl = el("div", { class: "g-prompt" });
  const speakBtn = el("button", { class: "icon-btn icon-btn--accent g-speak", "aria-label": "念題目", onclick: () => q?.say() }, "🔊");
  const car = el("div", { class: "g-car" }, "🏎️");
  const gateRow = el("div", { class: "g-gates" });
  const laneBtns = [0, 1, 2].map(i => { const b = el("button", { class: "g-lane-btn", "aria-label": `第${i + 1}條車道` }); b.addEventListener("pointerdown", e => { e.preventDefault(); if (!locked) { lane = i; placeCar(); } }); return b; });
  const side = cls => el("div", { class: `g-roadside ${cls}`, "aria-hidden": "true" }, ["🌳", "🌷", "🌲", "🏠", "🌳", "🌼", "🌲", "🌳"].map(e => el("span", {}, e)));
  const road = el("div", { class: "g-road" }, side("g-roadside--l"), side("g-roadside--r"), el("div", { class: "g-road__asphalt" }, el("div", { class: "g-road__lines" })), gateRow, car, el("div", { class: "g-lane-btns" }, laneBtns));
  const speedEl = el("div", { class: "g-speed" });
  sh.hud.right.textContent = `🚩 0/${GATES}`;
  sh.app.replaceChildren(sh.hudEl, el("div", { class: "g-prompt-row" }, promptEl, speakBtn), road, speedEl);
  const placeCar = () => { car.style.left = `${lane * 33.33 + 16.66}%`; laneBtns.forEach((b, i) => b.classList.toggle("g-lane-btn--on", i === lane)); };
  const updateHud = () => { sh.hud.score.textContent = String(score); sh.hud.combo.textContent = comboText(combo); sh.hud.right.textContent = `🚩 ${gate}/${GATES}`; };
  // 車子開到答案門的時間：數學要算，慢很多；連續答對才稍微變快
  const BASE = subject === "math" ? (CURRENT_GRADE === "g1" ? 13000 : 16000) : 9000, MIN = subject === "math" ? BASE - 3000 : 6000, STEP = (BASE - MIN) / 7;
  const travelMs = () => Math.max(MIN, BASE - combo * STEP);
  const showSpeed = () => { const lv = Math.round((BASE - travelMs()) / STEP); speedEl.replaceChildren(t("速度 "), el("span", { class: "g-speed__bar" }, "▮".repeat(lv + 1) + "▯".repeat(Math.max(0, 7 - lv)))); road.style.setProperty("--road-speed", `${Math.max(0.25, 0.9 - combo * 0.1)}s`); };
  const nextGate = () => {
    if (gate >= GATES) { locked = true; gameOver(sh, game, subject, score, el("div", { class: "g-over__msg" }, t(`🏁 跑完了！開進對的答案 ${hits} 次`))); return; }
    q = gen(); gate++; updateHud(); showSpeed();
    promptEl.replaceChildren(q.prompt); q.say();
    const right = q.options.find(o => o.ok), wrongs = shuffle(q.options.filter(o => !o.ok)).slice(0, 2);
    const opts = shuffle([right, ...wrongs]);
    gateRow.replaceChildren(...opts.map(o => el("div", { class: "g-gate" }, el("span", { class: "g-gate__label" }, o.node.cloneNode(true)))));
    const thisQ = q, dur = travelMs();
    let last = performance.now(), elapsed = 0;
    const tick = now => {
      if (!sh.alive() || thisQ !== q) return;
      if (!sh.isPaused()) elapsed += Math.min(100, now - last); // 暫停時門不會往下
      last = now;
      const p = Math.min(1, elapsed / dur);
      gateRow.style.top = `${-18 + p * 78}%`;
      if (p < 1) { raf = requestAnimationFrame(tick); return; }
      const ok = opts[lane] === right;
      gameRecord(q, ok);
      const g = gateRow.children[lane];
      if (ok) { hits++; combo++; score += 10 * Math.min(combo, 5); dingCorrect(); q.sayAnswer?.(); g.classList.add("g-gate--ok"); car.classList.add("g-car--boost"); fxHit(g, 10 * Math.min(combo, 5)); road.classList.add("g-road--boost"); sh.after(600, () => road.classList.remove("g-road--boost")); }
      else { combo = 0; buzzWrong(); g.classList.add("g-gate--bad"); gateRow.children[opts.indexOf(right)].classList.add("g-gate--ok"); car.classList.add("g-car--crash"); fxMiss(g); }
      updateHud();
      sh.after(ok ? 600 : 1300, () => { car.classList.remove("g-car--boost", "g-car--crash"); if (ok) nextGate(); else teachMiss(sh, L, q, nextGate); });
    };
    raf = requestAnimationFrame(tick);
  };
  placeCar(); showSpeed();
  learnFirst(sh, L, () => countdown(sh, () => { locked = false; nextGate(); }));
  return sh.root;
}

function renderGame(id, subject, c) {
  const subjects = gameSubjects();
  const s = subjects.some(([x]) => x === subject) ? subject : "en";
  if (!c) c = questDefaultChapter(s);
  if (s === "math" || !GAMES.some(g => g.id === id)) return renderGames(s, c); // 數學不玩計時遊戲；賽車已經拿掉
  if (id === "mole") return renderGameMole(s, c);
  if (id === "balloon") return renderGameBalloon(s, c);
  if (id === "race") return renderGameRace(s, c);
  if (id === "car") return renderGameCar(s, c);
  return renderGames(s, c);
}
