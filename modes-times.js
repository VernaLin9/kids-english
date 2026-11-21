// ✖️ 九九乘法表（二年級：要考「念九九乘法表」）
// 單元 MATH_DATA.g2 的 t99（timesTable:true）：一般的練習／小考／模擬小考／遊戲照二年級數學那一套（題型 times／timesBlank／timesSay）
// 另外的頁面：
//   #/times              選一張表（1～9），看哪張背過了
//   #/times/learn?t=3    學一學：一句一句念（點一句聽一句、看圖）、🔊從頭念、🙈蓋答案念、記法
//   #/times/recite?t=3   背誦過關：①有提示（三一、三二…）②全部蓋起來，念完按「念完了」看答案自己對；第二關全對＝過關⭐
//   #/times/drill?t=3    練這一張：先照順序 9 題，再打亂 9 題（數字鍵）
//   #/times/chart        整張九九表：點一格念一句
// 念法照九九歌：積小於 10 用「得」（二四得八），10 念「一十」（二五一十），其他照數字念（三七二十一）

const TT_CN = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const TT_BOPO = { 零: "ㄌㄧㄥˊ", 一: "ㄧ", 二: "ㄦˋ", 三: "ㄙㄢ", 四: "ㄙˋ", 五: "ㄨˇ", 六: "ㄌㄧㄡˋ", 七: "ㄑㄧ", 八: "ㄅㄚ", 九: "ㄐㄧㄡˇ", 十: "ㄕˊ", 得: "ㄉㄜˊ" };
function ttNum(p) { // 積的念法（不含「得」）
  if (p < 10) return TT_CN[p];
  if (p === 10) return "一十";
  const tens = Math.floor(p / 10), ones = p % 10;
  return (tens === 1 ? "" : TT_CN[tens]) + "十" + (ones ? TT_CN[ones] : "");
}
const ttHead = (a, b) => TT_CN[a] + TT_CN[b];                        // 三七
const ttTail = (a, b) => (a * b < 10 ? "得" : "") + ttNum(a * b);    // 二十一／得九
const ttLine = (a, b) => ttHead(a, b) + ttTail(a, b);                 // 三七二十一
const ttBopo = s => [...s].map(c => TT_BOPO[c] || "").join(" ");
const ttRuby = (s, attrs) => rubyEl(s, ttBopo(s), "span", attrs);

// 每一張表怎麼記（白話短句）
const TT_TIPS = {
  1: ["一乘什麼數，答案就是那個數。", "一一得一、一二得二……很簡單！"],
  2: ["二的乘法：每次多 2。", "答案都是雙數：2、4、6、8、10、12、14、16、18。"],
  3: ["三的乘法：每次多 3。", "先記 3、6、9，再記 12、15、18，最後 21、24、27。"],
  4: ["四是二的兩倍：二的答案再乘 2。", "答案的個位數一直轉：4、8、2、6、0。"],
  5: ["五的乘法最好記：個位數不是 5 就是 0。", "像時鐘的分鐘：5、10、15、20……"],
  6: ["六是三的兩倍：三的答案再乘 2。", "六六三十六，跟六有關的要多念幾次。"],
  7: ["七最難，先背最難的：七七四十九、七八五十六。", "前面的可以倒過來想：七三＝三七二十一。"],
  8: ["八是四的兩倍：四的答案再乘 2。", "答案的個位數一直往下：8、6、4、2、0。"],
  9: ["九的答案：十位數和個位數加起來都是 9（3＋6＝9）。", "十位數比乘的數少 1：九四三十六，3 比 4 少 1。", "手指法：伸出十根手指，九乘四就彎下第 4 根，左邊 3 根、右邊 6 根＝36。"],
};
const TT_SWAP_TIP = "兩個數交換，答案一樣：三七二十一，七三也是二十一。背好前面的，後面就只要背一半！";

// 乘法的圖：b 盒，每盒 a 個點（a 的 b 倍＝a 個一數，數 b 次）
function ttDots(a, b, showAns = true) {
  return el("div", { class: "tt-dots" },
    Array.from({ length: b }, () => el("div", { class: "tt-dots__box" }, Array.from({ length: a }, () => el("span", { class: "tt-dots__dot" })))),
    el("div", { class: "tt-dots__cap" }, t(`${a}個一數，數${b}次${showAns ? `：${a} × ${b} = ${a * b}` : ""}`)));
}

// === 二年級數學單元裡的題型（給 mountMath2Q） ===
function ttPickFact() {
  const p = getProfile(), facts = p?.times?.facts || {};
  const weak = Object.entries(facts).filter(([, r]) => r.bad > r.ok).map(([k]) => k.split("x").map(Number));
  if (weak.length && Math.random() < 0.4) return weak[Math.floor(Math.random() * weak.length)];
  return [2 + Math.floor(Math.random() * 8), 1 + Math.floor(Math.random() * 9)];
}
function ttRecord(a, b, ok) {
  const p = getProfile(); if (!p) return;
  p.times = p.times || {}; p.times.facts = p.times.facts || {};
  const r = p.times.facts[`${a}x${b}`] || { ok: 0, bad: 0 };
  ok ? r.ok++ : r.bad++;
  p.times.facts[`${a}x${b}`] = r; saveStore();
}
function genTimes(a, b) {
  if (a == null) [a, b] = ttPickFact();
  return { topic: "times", text: `${a} × ${b} = ?`, visual: ttDots(a, b, false),
    steps: [{ type: "num", label: `${a} × ${b} = ?`, answer: a * b }],
    hint: `${a}個一數，數${b}次。也可以想：${a} × ${b - 1} = ${a * (b - 1)}，再多 ${a}`, tt: [a, b] };
}
function genTimesBlank() {
  const [a, b] = ttPickFact();
  return { topic: "timesBlank", text: `${a} × □ = ${a * b}，□是多少？`,
    steps: [{ type: "num", label: `${a} × □ = ${a * b}`, answer: b }],
    hint: `從「${ttHead(a, 1)}」開始念${TT_CN[a]}的乘法表，念到答案是 ${a * b} 的那一句`, tt: [a, b] };
}
function genTimesSay() {
  const [a, b] = ttPickFact(), right = ttTail(a, b);
  const near = [[a, b - 1], [a, b + 1], [a - 1, b], [a + 1, b], [a, b + 2]].filter(([x, y]) => x >= 1 && x <= 9 && y >= 1 && y <= 9).map(([x, y]) => ttTail(x, y));
  const wrong = shuffle([...new Set(near)].filter(s => s !== right)).slice(0, 2);
  return { topic: "timesSay", text: `「${ttHead(a, b)}」後面要念什麼？（${a} × ${b}）`,
    steps: [{ type: "choice", label: `${ttHead(a, b)}……`, options: shuffle([{ label: right, ok: true }, ...wrong.map(w => ({ label: w, ok: false }))]) }],
    hint: `${a} × ${b} = ${a * b}，念「${ttLine(a, b)}」`, tt: [a, b] };
}
if (typeof MATH2_TOPICS !== "undefined") Object.assign(MATH2_TOPICS, {
  times: { emoji: "✖️", name: "算乘法", gen: () => genTimes() },
  timesBlank: { emoji: "🔲", name: "□是多少", gen: genTimesBlank },
  timesSay: { emoji: "🗣️", name: "接下去念", gen: genTimesSay },
});

const ttUnit = () => (MATH_DATA.g2?.units || []).find(u => u.timesTable);
const ttPassed = t => getProfile()?.times?.pass?.[t] || null;

// 單元頁最上面：九九乘法表的入口
function timesUnitTop(u) {
  return el("section", { class: "section" },
    el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => navigate("#/times") }, t("📖 九九乘法表：學一學・背誦過關")),
    el("div", { class: "progress-note", style: "text-align: center;" }, t(`已經背過 ${[1, 2, 3, 4, 5, 6, 7, 8, 9].filter(ttPassed).length} / 9 張`)),
    el("button", { class: "btn btn--full btn--xl", style: "margin-top: 10px;", onclick: () => navigate("#/times/chart") }, t("🔢 整張九九表")));
}

// #/times：選一張表
function renderTimesHome() {
  const root = el("div", {});
  root.appendChild(renderHeader("✖️ 九九乘法表", { back: ttUnit() ? `#/math/${ttUnit().id}` : "#/" }));
  const app = el("main", { class: "app" });
  root.appendChild(app);
  const facts = getProfile()?.times?.facts || {};
  const acc = t => { let ok = 0, n = 0; for (let b = 1; b <= 9; b++) { const r = facts[`${t}x${b}`]; if (r) { ok += r.ok; n += r.ok + r.bad; } } return n ? Math.round(ok * 100 / n) : null; };
  app.append(
    el("div", { class: "tc-tip" }, t("一張一張背：先「學一學」聽念法、看圖，再「背誦過關」蓋起來念。7 最難，可以最後背。")),
    el("div", { class: "tt-grid" }, [2, 3, 4, 5, 6, 7, 8, 9, 1].map(n => {
      const pass = ttPassed(n), a = acc(n);
      return el("div", { class: `tt-card${pass ? " tt-card--pass" : ""}` },
        el("div", { class: "tt-card__n" }, t(`${TT_CN[n]}的乘法`)),
        el("div", { class: "tt-card__sub" }, t(pass ? `⭐ 背過了（${mockDay(new Date(pass).getTime())}）` : "還沒過關"), a != null ? t(`・答對${a}%`) : null),
        el("div", { class: "tt-card__btns" },
          el("button", { class: "btn btn--accent", onclick: () => navigate(`#/times/learn?t=${n}`) }, t("📖 學")),
          el("button", { class: "btn", onclick: () => navigate(`#/times/recite?t=${n}`) }, t("🗣️ 背")),
          el("button", { class: "btn", onclick: () => navigate(`#/times/drill?t=${n}`) }, t("✏️ 練"))));
    })),
    el("div", { class: "tc-tip" }, t(TT_SWAP_TIP)),
    el("button", { class: "btn btn--full btn--xl", onclick: () => navigate("#/times/chart") }, t("🔢 整張九九表")),
    ttUnit() ? el("button", { class: "btn btn--full btn--xl", style: "margin-top: 10px;", onclick: () => navigate(`#/mathplay/mix?u=${ttUnit().id}`) }, t("🔀 全部混在一起練")) : null);
  return root;
}

// 一張表的 9 句；opts.hide：蓋住後面的答案（點一下看）
function ttTable(n, { hide = false, onTap } = {}) {
  const rows = [];
  const list = el("div", { class: "tt-table" }, Array.from({ length: 9 }, (_, i) => {
    const b = i + 1;
    const tail = el("span", { class: `tt-row__tail${hide ? " tt-row__tail--hide" : ""}` }, ttRuby(ttTail(n, b)));
    const row = el("button", { class: "tt-row" },
      el("span", { class: "tt-row__eq", "data-nobopo": "" }, `${n} × ${b} = `, el("b", { class: hide ? "tt-row__ans--hide" : "" }, String(n * b))),
      el("span", { class: "tt-row__say" }, ttRuby(ttHead(n, b)), tail));
    row.addEventListener("click", () => { row.querySelectorAll(".tt-row__tail--hide, .tt-row__ans--hide").forEach(x => x.classList.add("tt-peek")); speakZh(ttLine(n, b)); onTap?.(b, row); });
    rows.push(row);
    return row;
  }));
  list.rows = rows;
  return list;
}

// 從頭念：一句一句亮起來
function ttPlayer(n, table) {
  let timer = 0, i = 0;
  const btn = el("button", { class: "btn btn--accent btn--full btn--xl" }, t("🔊 從頭念一次（跟著念）"));
  const stop = () => { clearTimeout(timer); timer = 0; table.rows.forEach(r => r.classList.remove("tt-row--now")); btn.replaceChildren(t("🔊 從頭念一次（跟著念）")); };
  const step = () => {
    if (!document.body.contains(table) || i >= 9) return stop();
    table.rows.forEach((r, k) => r.classList.toggle("tt-row--now", k === i));
    table.rows[i].scrollIntoView({ block: "nearest", behavior: "smooth" });
    speakZh(ttLine(n, i + 1)); i++;
    timer = setTimeout(step, 2300);
  };
  btn.addEventListener("click", () => { if (timer) return stop(); i = 0; btn.replaceChildren(t("⏸ 停")); step(); });
  return btn;
}

// #/times/learn?t=3
function renderTimesLearn(n) {
  n = Math.min(9, Math.max(1, +n || 2));
  const root = el("div", {});
  root.appendChild(renderHeader(`📖 ${TT_CN[n]}的乘法`, { back: "#/times" }));
  const app = el("main", { class: "app" });
  root.appendChild(app);
  const pic = el("div", { class: "tt-pic" }, ttDots(n, 1));
  let hide = false;
  const holder = el("div", {});
  const draw = () => {
    const table = ttTable(n, { hide, onTap: b => pic.replaceChildren(ttDots(n, b)) });
    holder.replaceChildren(table, ttPlayer(n, table));
  };
  const hideBtn = el("button", { class: "btn btn--full btn--xl", style: "margin-top: 10px;" }, t("🙈 蓋起來念"));
  hideBtn.addEventListener("click", () => { hide = !hide; hideBtn.replaceChildren(t(hide ? "👀 打開答案" : "🙈 蓋起來念")); draw(); });
  draw();
  app.append(
    el("div", { class: "tc-tip" }, t("點一句聽一句，下面會出現圖。先跟著念三次，再按「蓋起來念」自己念，忘記了點那一句看答案。")),
    holder, hideBtn, pic,
    el("section", { class: "section" }, el("div", { class: "section__title" }, t("🧠 怎麼記")),
      (TT_TIPS[n] || []).map(s => tipLine(s)), tipLine(TT_SWAP_TIP)),
    el("div", { class: "tt-next" },
      el("button", { class: "btn btn--accent btn--xl", onclick: () => navigate(`#/times/recite?t=${n}`) }, t("🗣️ 背誦過關")),
      el("button", { class: "btn btn--xl", onclick: () => navigate(`#/times/drill?t=${n}`) }, t("✏️ 練這一張"))));
  return root;
}
const tipLine = s => el("div", { class: "tt-tip" }, el("span", {}, t(s)), el("button", { class: "icon-btn icon-btn--accent", onclick: () => speakZh(s), "aria-label": "念" }, "🔊"));

// #/times/recite?t=3：背誦過關（第一關有提示、第二關全部蓋起來）
function renderTimesRecite(n) {
  n = Math.min(9, Math.max(1, +n || 2));
  const root = el("div", {});
  const header = renderHeader(`🗣️ 背${TT_CN[n]}的乘法`, { back: "#/times" });
  root.appendChild(header);
  const progress = $(".header__progress", header);
  const app = el("main", { class: "app tc" });
  root.appendChild(app);
  const level = lv => {
    progress.textContent = `第${lv}關`;
    let t0 = 0;
    const rows = Array.from({ length: 9 }, (_, i) => {
      const b = i + 1;
      return el("div", { class: "tt-rrow" },
        el("span", { class: "tt-rrow__no" }, `${b}.`),
        lv === 1 ? ttRuby(ttHead(n, b)) : el("span", { class: "tt-rrow__blank" }, "？"),
        el("span", { class: "tt-rrow__blank" }, "……"));
    });
    const startBtn = el("button", { class: "btn btn--accent btn--full btn--xl" }, t("開始念（會計時）▶"));
    const doneBtn = el("button", { class: "btn btn--accent btn--full btn--xl", style: "display:none" }, t("念完了，看答案"));
    const timer = el("div", { class: "tt-timer" }, "");
    let tick = 0;
    startBtn.addEventListener("click", () => { t0 = Date.now(); startBtn.style.display = "none"; doneBtn.style.display = ""; tick = setInterval(() => { if (!document.body.contains(timer)) return clearInterval(tick); timer.textContent = `⏱ ${Math.round((Date.now() - t0) / 1000)} 秒`; }, 500); });
    doneBtn.addEventListener("click", () => {
      clearInterval(tick);
      const secs = Math.round((Date.now() - t0) / 1000);
      const marks = Array(9).fill(true);
      const list = el("div", { class: "tt-table" }, Array.from({ length: 9 }, (_, i) => {
        const b = i + 1;
        const chip = el("button", { class: "dc-chip dc-chip--ok" }, "⭕");
        chip.addEventListener("click", () => { marks[i] = !marks[i]; chip.className = `dc-chip ${marks[i] ? "dc-chip--ok" : "dc-chip--bad"}`; chip.textContent = marks[i] ? "⭕" : "❌"; });
        return el("div", { class: "tt-rrow tt-rrow--ans" }, el("span", { class: "tt-rrow__no" }, `${b}.`),
          el("span", { class: "tt-rrow__mid" }, ttRuby(ttLine(n, b)), el("span", { class: "tt-row__eq tt-rrow__eq", "data-nobopo": "" }, `${n}×${b}=${n * b}`)), chip);
      }));
      app.replaceChildren(el("div", { class: "tc-card" },
        el("div", { class: "tc-tag tc-tag--chk" }, t(`✅ 答案（念了 ${secs} 秒）`)),
        el("div", { class: "tc-tip" }, t("對一對：哪一句念錯或想不起來，就點一下變成❌")),
        list,
        el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => {
          const bad = marks.map((m, i) => m ? null : i + 1).filter(Boolean);
          bad.forEach(b => ttRecord(n, b, false));
          logAnswer("math", `背${n}的乘法第${lv}關`, !bad.length);
          if (bad.length) return app.replaceChildren(el("div", { class: "tc-card" },
            el("div", { class: "tc-end__icon" }, "💪"), el("div", { class: "tc-end__msg" }, t(`還有${bad.length}句要再念：`)),
            el("div", { class: "tt-table" }, bad.map(b => el("button", { class: "tt-row", onclick: () => speakZh(ttLine(n, b)) }, el("span", { class: "tt-row__eq", "data-nobopo": "" }, `${n} × ${b} = ${n * b}`), ttRuby(ttLine(n, b))))),
            el("div", { class: "tc-tip" }, t("點一句聽三次、跟著念三次，再挑戰一次。")),
            el("div", { class: "tc-end__btns" }, teachBtn("🔁 再挑戰這一關", `#/times/recite?t=${n}&lv=${lv}&r=${Date.now()}`, true), teachBtn("📖 回去學一學", `#/times/learn?t=${n}`))));
          if (lv === 1) return level(2);
          const p = getProfile(); if (p) { p.times = p.times || {}; p.times.pass = p.times.pass || {}; p.times.pass[n] = dayISO(); p.times.best = p.times.best || {}; p.times.best[n] = Math.min(p.times.best[n] || 999, secs); saveStore(); }
          teachEnd(app, `${TT_CN[n]}的乘法背好了！⭐（${secs}秒）`, [
            n < 9 ? teachBtn(`➡️ 下一張：${TT_CN[n + 1]}的乘法`, `#/times/learn?t=${n + 1}`, true) : null,
            teachBtn("✏️ 練這一張", `#/times/drill?t=${n}`), teachBtn("✖️ 回九九乘法表", "#/times")].filter(Boolean));
        } }, t(lv === 1 ? "下一關：全部蓋起來 ▶" : "✅ 算過關"))));
    });
    app.replaceChildren(el("div", { class: "tc-card" },
      el("div", { class: "tc-tag" }, t(lv === 1 ? "第一關：看提示念" : "第二關：全部蓋起來念")),
      el("div", { class: "tc-tip" }, t(lv === 1 ? "看著「三一、三二……」，把整句大聲念出來，像考試一樣從頭念到尾。" : "什麼都不看，從第一句念到第九句。念錯沒關係，念完再對答案。")),
      el("div", { class: "tt-table" }, rows), timer, startBtn, doneBtn));
  };
  const lv0 = +(new URLSearchParams(location.hash.split("?")[1] || "").get("lv")) || 0;
  if (lv0) level(lv0);
  else app.appendChild(el("div", { class: "tc-card" },
    el("div", { class: "tc-end__icon" }, "🗣️"), el("div", { class: "tc-end__msg" }, t(`背${TT_CN[n]}的乘法：兩關`)),
    el("div", { class: "tc-tip" }, t("找家人當老師聽你念。第一關看提示念，第二關全部蓋起來念；念完看答案，全對就過關得到一顆星。")),
    ttPassed(n) ? el("div", { class: "tc-tip" }, t(`⭐ 已經過關（最快 ${getProfile()?.times?.best?.[n] || "?"} 秒）`)) : null,
    el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => level(1) }, t("開始 ▶"))));
  return root;
}

// #/times/drill?t=3：照順序 9 題 → 打亂 9 題
function renderTimesDrill(n) {
  n = Math.min(9, Math.max(1, +n || 2));
  const u = ttUnit() || { id: "t99", topics: ["times"] };
  const order = Array.from({ length: 9 }, (_, i) => i + 1);
  const make = b => () => { const q = genTimes(n, b); return q; };
  return renderMath2Run(u, `✏️ ${TT_CN[n]}的乘法`, `#/times/learn?t=${n}`, `#/times/drill?t=${n}&r=${Date.now()}`, [...order.map(make), ...shuffle(order.slice()).map(make)]);
}

// #/times/chart：整張九九表
function renderTimesChart() {
  const root = el("div", {});
  root.appendChild(renderHeader("🔢 整張九九表", { back: "#/times" }));
  const app = el("main", { class: "app" });
  root.appendChild(app);
  const say = el("div", { class: "tt-chart__say" }, t("點一格，聽那一句"));
  const cells = [];
  const grid = el("div", { class: "tt-chart", "data-nobopo": "" },
    el("span", { class: "tt-chart__h" }, "×"), ...Array.from({ length: 9 }, (_, j) => el("span", { class: "tt-chart__h" }, String(j + 1))),
    ...Array.from({ length: 9 }, (_, i) => [el("span", { class: "tt-chart__h" }, String(i + 1)), ...Array.from({ length: 9 }, (_, j) => {
      const a = i + 1, b = j + 1;
      const c = el("button", { class: "tt-chart__c" }, String(a * b));
      c.addEventListener("click", () => {
        cells.forEach(x => x.el.classList.toggle("tt-chart__c--line", x.a === a || x.b === b));
        cells.forEach(x => x.el.classList.toggle("tt-chart__c--on", x.el === c));
        say.replaceChildren(el("span", { "data-nobopo": "" }, `${a} × ${b} = ${a * b}　`), ttRuby(ttLine(a, b)));
        speakZh(ttLine(a, b));
      });
      cells.push({ el: c, a, b });
      return c;
    })]).flat());
  app.append(say, grid, el("div", { class: "tc-tip" }, t(TT_SWAP_TIP)));
  return root;
}
