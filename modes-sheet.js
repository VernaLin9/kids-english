// 📄 小A本／評量卷原題：要「填數字」和「連連看」的卷子（老師會考一模一樣的題目）
// 版面、題目文字、圖裡的數量、配分都照家長拍的照片；作答方式也照卷子：
//   (　)、□ 點一下選數字；連連看先點上面再點下面畫線；寫完按「交卷」照配分算分
// 一上 第9回（4-3 0的認識、4-4 分與合，小A本 p.18-19，照片 Drive IMG_8819）
// 一上 第10回（5-1 堆疊與分類、5-2 認識形狀，小A本 p.20-21，照片 Drive IMG_5099）：圈圈看、填代號、三欄連連看

const FS_INK = "#3b3a4a", FS_RED = "#e0393e", FS_GREEN = "#1b9e6a";
const fsvg = (tag, attrs = {}, ...kids) => svg(tag, attrs, ...kids.map(k => typeof k === "string" ? document.createTextNode(k) : k));

// --- 卷子上的圖 ---
// 碗裡的湯圓（k 顆）
function fsBowl(k) {
  const pos = [[30, 40], [52, 37], [74, 41], [22, 55], [44, 57], [66, 58], [86, 60], [36, 71], [60, 72]].slice(0, k);
  return fsvg("svg", { viewBox: "0 0 110 100", class: "fs-pic fs-pic--bowl" },
    fsvg("line", { x1: 62, y1: 50, x2: 80, y2: 4, stroke: FS_INK, "stroke-width": 6, "stroke-linecap": "round" }),
    fsvg("path", { d: "M 6 48 Q 55 112 104 48 Z", fill: "#e6e6e6", stroke: FS_INK, "stroke-width": 3 }),
    fsvg("ellipse", { cx: 55, cy: 52, rx: 48, ry: 26, fill: "#cfcfcf", stroke: FS_INK, "stroke-width": 3 }),
    ...pos.map(([x, y]) => fsvg("circle", { cx: x, cy: y, r: 9, fill: "#fff", stroke: FS_INK, "stroke-width": 2 })));
}
// 一串番茄（k 顆）
function fsSkewer(k) {
  return fsvg("svg", { viewBox: "0 0 80 110", class: "fs-pic fs-pic--skewer" },
    fsvg("line", { x1: 12, y1: 6, x2: 66, y2: 104, stroke: "#999", "stroke-width": 4, "stroke-linecap": "round" }),
    ...Array.from({ length: k }, (_, i) => fsvg("circle", { cx: 18 + i * 11, cy: 18 + i * 20, r: 12, fill: "#e0393e", stroke: "#8c1d20", "stroke-width": 2 })));
}
// 香腸：on 根串在竹籤上、off 根沒串（散在旁邊）
function fsSausages(on, off) {
  const sausage = (x, y, rot) => fsvg("rect", { x: x - 17, y: y - 7, width: 34, height: 14, rx: 7, fill: "#c97b5a", stroke: "#7a3e26", "stroke-width": 2, transform: `rotate(${rot} ${x} ${y})` });
  const onPos = [[24, 20], [36, 36], [48, 52], [60, 68]].slice(0, on);
  const offPos = [[96, 18, 70], [110, 40, 80], [16, 78, 20], [24, 98, 15], [6, 40, 75]].slice(0, off);
  return fsvg("svg", { viewBox: "0 0 125 115", class: "fs-pic fs-pic--sausage" },
    fsvg("line", { x1: 12, y1: 4, x2: 92, y2: 108, stroke: "#999", "stroke-width": 4, "stroke-linecap": "round" }),
    ...onPos.map(([x, y]) => sausage(x, y, 52)), ...offPos.map(([x, y, r]) => sausage(x, y, r)));
}
// 小朋友投籃：籃子裡 inN 顆、地上 outN 顆
function fsBasket(kid, inN, outN) {
  return el("div", { class: "fs-basket" },
    el("span", { class: "fs-basket__kid" }, kid),
    el("div", { class: "fs-basket__box" }, el("div", { class: "fs-basket__in", "data-nobopo": "" }, "🏐".repeat(inN))),
    el("div", { class: "fs-basket__out", "data-nobopo": "" }, "🏐".repeat(outN)));
}

// --- 卷子資料 ---
const FILL_SHEETS = {
  u4: {
    title: "一上 第9回", sub: "4-3 0的認識　4-4 分與合", pages: "第18、19頁",
    sections: [
      { no: "1", instr: "填填看：每格3分，共18分", pts: 3, items: [
        { n: 1, pic: "🍍🍍🍍🍍🍍　🍍🍍🍍", lines: [["5顆和", { a: 3 }, "顆合起來是8顆，"], ["8顆可以分成5顆和", { a: 3 }, "顆。"]] },
        { n: 2, pic: "🍰🍰　🍥🍥🍥🍥", lines: [["2塊和", { a: 4 }, "塊合起來是6塊，"], ["6塊可以分成2塊和", { a: 4 }, "塊。"]] },
        { n: 3, pic: "⚾⚾　⚫⚫⚫⚫⚫⚫⚫⚫", lines: [[{ a: 2 }, "顆和8顆合起來是10顆，"], [{ a: 10 }, "顆可以分成2顆和8顆。"]] },
      ] },
      { no: "2", instr: "有3位小朋友，每位小朋友投5顆球，看圖填填看：每格4分，共24分", pts: 4, kind: "basket", items: [
        { n: 1, kid: "👧", in: 3, out: 2 }, { n: 2, kid: "👦", in: 1, out: 4 }, { n: 3, kid: "🧒", in: 5, out: 0 },
      ] },
      { no: "3", instr: "把合起來是10的數連起來：每題3分，共15分", pts: 3, kind: "match",
        top: [6, 8, 3, 0, 1], bottom: [["ㄅ", 2], ["ㄆ", 4], ["ㄇ", 9], ["ㄈ", 7], ["ㄉ", 10]] },
      { no: "4", instr: "數數看，填填看：每格3分，共18分", pts: 3, kind: "count", groups: [
        { label: "1. 碗裡有幾顆湯圓？", unit: "顆", items: [9, 5, 0].map(k => ({ pic: () => fsBowl(k), a: k })) },
        { label: "2. 一串有幾顆番茄？", unit: "顆", items: [3, 0, 2].map(k => ({ pic: () => fsSkewer(k), a: k })) },
      ] },
      { no: "5", instr: "把已經串好的香腸數量填入□裡：每題3分，共9分", pts: 3, kind: "count", groups: [
        { label: "", unit: "個", items: [[4, 1], [1, 4], [0, 5]].map(([on, off], i) => ({ n: i + 1, pic: () => fsSausages(on, off), a: on })) },
      ] },
      { no: "6", instr: "灰色色塊上的數字可以怎麼分與合？填填看：每格4分，共16分", pts: 4, kind: "bond",
        // top: 上面一列；bot: 下面一列；灰色那一格是「全部」
        items: [{ gray: "top", total: 9, parts: [2, { a: 7 }] }, { gray: "bot", total: 9, parts: [5, { a: 4 }] }, { gray: "top", total: 7, parts: [7, { a: 0 }] }, { gray: "bot", total: 7, parts: [4, { a: 3 }] }] },
    ],
  },
};

// 選數字的小鍵盤（0～10），點空格時跳出來；不擋題目，放在畫面最下面
let fsPadEl = null;
function fsOpenPad(onPick) {
  fsPadEl?.remove();
  const close = () => { fsPadEl?.remove(); fsPadEl = null; };
  fsPadEl = el("div", { class: "fs-pad" },
    el("div", { class: "fs-pad__keys" }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => el("button", { class: "fs-pad__key", onclick: () => { onPick(n); close(); } }, String(n))),
      el("button", { class: "fs-pad__key fs-pad__key--soft", onclick: () => { onPick(null); close(); } }, "⌫"),
      el("button", { class: "fs-pad__key fs-pad__key--soft", onclick: close }, "✕")));
  document.body.appendChild(fsPadEl);
}

function renderFillSheet(u) {
  const S = FILL_SHEETS[u.id];
  const root = el("div", {});
  const header = renderHeader("📄 小A本原題", { back: `#/math/${u.id}` });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app ws fs" });
  root.appendChild(app);
  const scoreBox = el("span", { class: "ws-score__num" }, "");
  app.appendChild(el("div", { class: "ws-title" },
    el("div", { class: "ws-title__main" }, t(S.title)),
    el("div", { class: "ws-title__sub" }, t(S.sub)),
    el("div", { class: "ws-score" }, t("得分"), scoreBox)));
  app.appendChild(el("div", { class: "ws-howto" }, t(`跟小A本${S.pages}一樣寫：${S.howto || "點(　)或□選數字，連連看先點上面再點下面"}。寫完按「交卷」`)));

  const blanks = []; // { get, ans, pts, show(ok) }
  let locked = false;
  const update = () => { const done = blanks.filter(b => b.get() != null).length; progressLabel.textContent = `寫了 ${done}/${blanks.length} ${S.unitWord || "格"}`; };
  // 一個要填數字的空格；style: "paren" (　)、"box" □
  const blank = (ans, pts, style = "paren") => {
    let val = null;
    const b = el("button", { class: `fs-blank fs-blank--${style}`, "aria-label": "填數字" });
    const draw = () => b.replaceChildren(style === "paren" ? el("span", { class: "fs-blank__p" }, "(") : "", el("span", { class: "fs-blank__v", "data-nobopo": "" }, val == null ? "　" : String(val)), style === "paren" ? el("span", { class: "fs-blank__p" }, ")") : "");
    draw();
    b.addEventListener("click", () => { if (locked) return; app.querySelectorAll(".fs-blank--on").forEach(x => x.classList.remove("fs-blank--on")); b.classList.add("fs-blank--on"); fsOpenPad(n => { val = n; draw(); b.classList.remove("fs-blank--on"); update(); }); });
    blanks.push({ get: () => val, ans, pts, show: ok => { b.classList.add(ok ? "fs-blank--ok" : "fs-blank--bad"); if (!ok) b.append(el("span", { class: "fs-blank__ans", "data-nobopo": "" }, String(ans))); } });
    return b;
  };
  const sectionHead = sec => el("div", { class: "ws-sec__head" }, el("span", { class: "ws-sec__no" }, sec.no),
    el("div", { class: "ws-sec__instr" }, t(sec.instr)),
    el("button", { class: "icon-btn icon-btn--accent m-speak", onclick: () => speakZh(sec.instr.replace(/□/g, "方框")), "aria-label": "念題目" }, "🔊"));

  S.sections.forEach(sec => {
    const secEl = el("section", { class: "ws-sec" }, sectionHead(sec));
    if (!sec.kind) {
      sec.items.forEach(it => secEl.appendChild(el("div", { class: "ws-q fs-fill" },
        el("div", { class: "ws-q__head" }, el("span", { class: "ws-q__no" }, `${it.n}.`)),
        el("div", { class: "fs-pics", "data-nobopo": "" }, it.pic),
        it.lines.map(line => el("div", { class: "fs-line" }, line.map(p => typeof p === "string" ? t(p) : blank(p.a, sec.pts, "paren")))))));
    } else if (sec.kind === "basket") {
      secEl.appendChild(el("div", { class: "fs-row3" }, sec.items.map(it => el("div", { class: "ws-q fs-bk" },
        el("div", { class: "ws-q__head" }, el("span", { class: "ws-q__no" }, `${it.n}.`)),
        fsBasket(it.kid, it.in, it.out),
        el("div", { class: "fs-bond" }, el("div", { class: "fs-bond__top fs-bond__gray", "data-nobopo": "" }, "5"),
          el("div", { class: "fs-bond__row" }, blank(it.in, sec.pts, "box"), blank(it.out, sec.pts, "box"))),
        el("div", { class: "fs-bond__labels" }, t("有投進"), t("沒投進"))))));
    } else if (sec.kind === "match") {
      secEl.appendChild(fsMatch(sec, (key, getter, ans, show) => blanks.push({ get: getter, ans, pts: sec.pts, show }), () => locked, update));
    } else if (sec.kind === "count") {
      sec.groups.forEach(g => secEl.appendChild(el("div", { class: "ws-q" }, g.label ? el("div", { class: "ws-q__head" }, el("span", { class: "ws-q__prompt" }, t(g.label))) : null,
        el("div", { class: "fs-row3" }, g.items.map(it => el("div", { class: "fs-count" }, it.n ? el("span", { class: "ws-q__no" }, `${it.n}.`) : null, it.pic(),
          el("div", { class: "fs-count__ans" }, blank(it.a, sec.pts, "box"), t(g.unit))))))));
    } else if (sec.kind === "bond") {
      secEl.appendChild(el("div", { class: "fs-bonds" }, sec.items.map(it => {
        const parts = el("div", { class: "fs-bond__row" }, it.parts.map(p => typeof p === "object" ? blank(p.a, sec.pts, "box") : el("div", { class: "fs-bond__cell", "data-nobopo": "" }, String(p))));
        const total = el("div", { class: "fs-bond__top fs-bond__gray", "data-nobopo": "" }, String(it.total));
        return el("div", { class: "fs-bond fs-bond--box" }, it.gray === "top" ? [total, parts] : [parts, total]);
      })));
    } else if (sec.kind === "circle") {
      sec.qs.forEach(q => secEl.appendChild(fsCircleQ(q, sec.pts, x => blanks.push(x), () => locked, update)));
    } else if (sec.kind === "codes") {
      secEl.appendChild(fsCodesQ(sec, x => blanks.push(x), () => locked, update));
    } else if (sec.kind === "match3") {
      secEl.appendChild(fsMatch3(sec, x => blanks.push(x), () => locked, update));
    }
    app.appendChild(secEl);
  });

  const result = el("div", { class: "ws-result" });
  const total = blanks.length;
  const submit = el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => {
    const left = blanks.filter(b => b.get() == null).length;
    if (left > 0 && !submit.dataset.confirm) { submit.dataset.confirm = "1"; submit.replaceChildren(t(`還有${left}${S.unitWord || "格"}沒寫，確定要交卷？`)); return; }
    locked = true; submit.hidden = true; submit.style.display = "none"; fsPadEl?.remove();
    let score = 0, got = 0;
    blanks.forEach(b => { const ok = b.get() === b.ans; b.show(ok); if (ok) { score += b.pts; got++; } recordMath("sheet", ok); });
    scoreBox.textContent = String(score); scoreBox.classList.add("pop");
    if (got === total) { dingCorrect(); confetti(); } else buzzWrong();
    result.replaceChildren(
      el("div", { class: "ws-result__big" }, `${score} 分`),
      el("div", { class: "ws-result__msg" }, got === total ? t("全對！太厲害了 🌟") : t(`答對 ${got} ${S.unitWord || "格"}，錯的地方看綠色的正確答案 💪`)),
      el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => navigate(`#/mathplay/sheet?u=${u.id}&r=${Date.now()}`) }, t("🔁 再寫一次")),
      el("button", { class: "btn btn--ghost btn--full", onclick: () => navigate(`#/math/${u.id}`) }, t("回數學")));
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  } }, t("✅ 交卷"));
  app.appendChild(el("div", { class: "ws-submit" }, submit, result));
  update();
  return root;
}

// 連連看：上面一排（青蛙）點一下、下面一排點一下，就畫一條線
function fsMatch(sec, addBlank, isLocked, update) {
  const wrap = el("div", { class: "ws-q fs-match" });
  const topRow = el("div", { class: "fs-match__row" }), botRow = el("div", { class: "fs-match__row" });
  const lines = fsvg("svg", { class: "fs-match__lines" });
  const pairs = {}; // top index -> bottom index
  let pick = null;
  const draw = () => {
    const wr = wrap.getBoundingClientRect();
    lines.setAttribute("viewBox", `0 0 ${wr.width} ${wr.height}`); lines.setAttribute("width", wr.width); lines.setAttribute("height", wr.height);
    lines.replaceChildren(...Object.entries(pairs).map(([ti, bi]) => {
      const a = topDots[ti].getBoundingClientRect(), b = botDots[bi].getBoundingClientRect();
      const st = pairStatus[ti];
      return fsvg("line", { x1: a.left + a.width / 2 - wr.left, y1: a.top + a.height / 2 - wr.top, x2: b.left + b.width / 2 - wr.left, y2: b.top + b.height / 2 - wr.top, stroke: st === "ok" ? FS_GREEN : st === "bad" ? FS_RED : "#3b6bff", "stroke-width": 5, "stroke-linecap": "round" });
    }));
  };
  const pairStatus = {};
  const topDots = sec.top.map((n, i) => {
    const dot = el("span", { class: "fs-match__dot" });
    const b = el("button", { class: "fs-match__item fs-match__item--top" }, el("span", { class: "fs-match__no" }, `${i + 1}.`), el("span", { class: "fs-frog" }, el("span", { class: "fs-frog__face" }, "🐸"), el("span", { class: "fs-frog__n", "data-nobopo": "" }, String(n))), dot);
    b.addEventListener("click", () => { if (isLocked()) return; pick = i; topRow.querySelectorAll(".fs-match__item").forEach((x, j) => x.classList.toggle("fs-match__item--on", j === i)); });
    topRow.appendChild(b);
    const ans = sec.bottom.findIndex(([, v]) => v + n === 10);
    addBlank(i, () => pairs[i] ?? null, ans, ok => { pairStatus[i] = ok ? "ok" : "bad"; if (!ok) pairs[i] = ans; draw(); });
    return dot;
  });
  const botDots = sec.bottom.map(([label, v], j) => {
    const dot = el("span", { class: "fs-match__dot" });
    const b = el("button", { class: "fs-match__item fs-match__item--bot" }, dot, el("span", { class: "fs-match__label" }, label), el("span", { class: "fs-match__circle", "data-nobopo": "" }, String(v)));
    b.addEventListener("click", () => { if (isLocked() || pick == null) return; Object.keys(pairs).forEach(k => { if (pairs[k] === j) delete pairs[k]; }); pairs[pick] = j; pick = null; topRow.querySelectorAll(".fs-match__item").forEach(x => x.classList.remove("fs-match__item--on")); draw(); update(); });
    botRow.appendChild(b);
    return dot;
  });
  wrap.append(el("div", { class: "fs-match__hint" }, t("先點上面的青蛙，再點下面的圓圈，就會連一條線")), topRow, el("div", { class: "fs-match__gap" }), botRow, lines);
  new ResizeObserver(draw).observe(wrap);
  return wrap;
}

// === 第9回的練習題型（不是原題，用來練觀念；遊戲也會用）===
const FS_NUM_CARD = (x, y, n) => { const g = fsvg("g", {}, fsvg("rect", { x, y, width: 90, height: 70, rx: 14, fill: "#fff", stroke: FS_INK, "stroke-width": 3 }), fsvg("text", { x: x + 45, y: y + 50, "text-anchor": "middle", "font-size": 40, "font-weight": 900, fill: FS_INK }, String(n))); g.bbox = { x, y, w: 90, h: 70 }; return g; };
function fsChoices(ans, max) {
  const set = new Set([ans]);
  for (const d of shuffle([1, -1, 2, -2, 3])) { if (set.size >= 3) break; const v = ans + d; if (v >= 0 && v <= max) set.add(v); }
  while (set.size < 3) set.add(rnd(0, max));
  return shuffle([...set]);
}
// 分與合：數字分合圖，下面一格是空的
function genSplit() {
  const T = rnd(3, 10), a = rnd(0, T), ans = T - a;
  const bond = fsvg("g", {},
    fsvg("rect", { x: 130, y: 10, width: 140, height: 56, rx: 8, fill: "#bdbdbd", stroke: FS_INK, "stroke-width": 3 }),
    fsvg("text", { x: 200, y: 50, "text-anchor": "middle", "font-size": 34, "font-weight": 900, fill: FS_INK }, String(T)),
    fsvg("rect", { x: 130, y: 66, width: 70, height: 56, fill: "#fff", stroke: FS_INK, "stroke-width": 3 }),
    fsvg("text", { x: 165, y: 106, "text-anchor": "middle", "font-size": 32, "font-weight": 900, fill: FS_INK }, String(a)),
    fsvg("rect", { x: 200, y: 66, width: 70, height: 56, fill: "#fff8d6", stroke: FS_INK, "stroke-width": 3 }),
    fsvg("text", { x: 235, y: 106, "text-anchor": "middle", "font-size": 32, "font-weight": 900, fill: FS_RED }, "?"));
  const opts = fsChoices(ans, 10);
  const items = opts.map((n, i) => ({ node: FS_NUM_CARD(30 + i * 125, 150, n), correct: n === ans }));
  return { topic: "split", prompt: `${T}可以分成${a}和多少？`, h: 240, items: [...items], extra: bond };
}
// 合起來是10
function genMake10() {
  const a = rnd(0, 10), ans = 10 - a;
  const opts = fsChoices(ans, 10);
  return { topic: "make10", prompt: `${a}和多少合起來是10？`, h: 110, items: opts.map((n, i) => ({ node: FS_NUM_CARD(30 + i * 125, 20, n), correct: n === ans })) };
}
// 0的認識：哪一個是0個？
function genZero() {
  const kinds = [["bowl", "哪一碗沒有湯圓？", fsBowl], ["skewer", "哪一串沒有番茄？", fsSkewer]];
  const [, prompt, draw] = kinds[rnd(0, 1)];
  const counts = shuffle([0, rnd(1, 4), rnd(5, 9)]);
  const items = counts.map((k, i) => {
    const pic = draw(k);
    const g = fsvg("g", { transform: `translate(${12 + i * 130},10)` });
    [...pic.childNodes].forEach(c => g.appendChild(c));
    const s = 110 / (pic.viewBox.baseVal.width || 110);
    g.setAttribute("transform", `translate(${12 + i * 130},10) scale(${s})`);
    g.bbox = { x: 12 + i * 130, y: 8, w: 115, h: 115 };
    return { node: g, correct: k === 0 };
  });
  return { topic: "zero", prompt, h: 135, items };
}
MATH_TOPICS.split = { name: "分與合", emoji: "🔀", gen: genSplit };
MATH_TOPICS.make10 = { name: "合起來是10", emoji: "🔟", gen: genMake10 };
MATH_TOPICS.zero = { name: "0的認識", emoji: "0️⃣", gen: genZero };

// === 一上 第10回（小A本 p.20-21）===
// 卷子上的東西：照照片畫成簡單的線條圖（viewBox 0 0 100 100；不放國字，避免自動注音塞進 SVG）
const FS_LINE = { stroke: FS_INK, "stroke-width": 3, "stroke-linejoin": "round" };
const fsPic = (...kids) => fsvg("svg", { viewBox: "0 0 100 100", class: "fs-pic fs-obj" }, ...kids);
const fsPoly = (pts, fill, extra = {}) => fsvg("polygon", { points: pts, fill, ...FS_LINE, ...extra });
const fsBox3 = (x, y, w, h, d, fills) => [ // 長方體：正面、上面、側面（d＝往右上的深度）
  fsPoly(`${x},${y} ${x + d},${y - d * 0.7} ${x + w + d},${y - d * 0.7} ${x + w},${y}`, fills[1]),
  fsPoly(`${x + w},${y} ${x + w + d},${y - d * 0.7} ${x + w + d},${y + h - d * 0.7} ${x + w},${y + h}`, fills[2]),
  fsvg("rect", { x, y, width: w, height: h, fill: fills[0], ...FS_LINE })];
const fsCyl = (cx, top, rx, h, fill, topFill) => [ // 圓柱：身體＋上面的橢圓
  fsvg("path", { d: `M ${cx - rx} ${top} L ${cx - rx} ${top + h} A ${rx} ${rx * 0.32} 0 0 0 ${cx + rx} ${top + h} L ${cx + rx} ${top}`, fill, ...FS_LINE }),
  fsvg("ellipse", { cx, cy: top, rx, ry: rx * 0.32, fill: topFill, ...FS_LINE })];
const fsDots = (pts, r = 5, fill = FS_INK) => pts.map(([cx, cy]) => fsvg("circle", { cx, cy, r, fill }));
const FS10 = {
  baseball: () => fsPic(fsvg("circle", { cx: 50, cy: 52, r: 36, fill: "#fff", ...FS_LINE }),
    fsvg("path", { d: "M 26 26 Q 42 52 26 78 M 74 26 Q 58 52 74 78", fill: "none", stroke: FS_RED, "stroke-width": 3, "stroke-dasharray": "4 3" })),
  triChoco: () => fsPic(fsPoly("38,40 78,20 98,70 68,90", "#d9bf94"), fsPoly("8,90 38,40 68,90", "#ecd6b2"), fsPoly("28,82 38,64 48,82", "#8a6a3a")),
  can: () => fsPic(...fsCyl(50, 20, 21, 64, "#d8434b", "#ddd"), fsvg("path", { d: "M 34 40 Q 52 52 40 66 Q 56 74 62 86", fill: "none", stroke: "#fff", "stroke-width": 4 })),
  cookieBox: () => fsPic(...fsBox3(4, 46, 74, 38, 20, ["#f6c7d3", "#fbe0e7", "#eeb0c1"]), ...fsDots([[60, 66], [70, 66]], 6, "#a0522d")),
  volleyball: () => fsPic(fsvg("circle", { cx: 50, cy: 52, r: 38, fill: "#fff", ...FS_LINE }),
    fsvg("path", { d: "M 18 34 Q 50 46 62 88 M 30 22 Q 66 34 84 72 M 14 60 Q 40 64 44 90", fill: "none", stroke: "#e0a020", "stroke-width": 7 })),
  pencilBox: () => fsPic(...fsBox3(4, 56, 76, 22, 20, ["#c9d3e0", "#e3e9f1", "#aebccd"]), fsvg("line", { x1: 40, y1: 48, x2: 76, y2: 46, stroke: FS_INK, "stroke-width": 2 })),
  teaCarton: () => fsPic(...fsBox3(26, 36, 38, 54, 16, ["#f3e3c3", "#fbf0dc", "#e4cfa6"]), fsvg("rect", { x: 34, y: 20, width: 34, height: 6, fill: "#fbf0dc", ...FS_LINE }), ...fsDots([[38, 62], [48, 70]], 5, "#c98b6b")),
  chipsTube: () => fsPic(...fsCyl(50, 14, 19, 74, "#cfe6b5", "#9ac27a"), fsvg("path", { d: "M 40 50 Q 50 36 60 50 Q 50 64 40 50 Z", fill: "#7fae5a", stroke: FS_INK, "stroke-width": 2 })),
  giftCube: () => fsPic(...fsBox3(14, 40, 50, 50, 22, ["#e9e9e9", "#f6f6f6", "#d4d4d4"]), ...[22, 30, 38, 46, 54].map(x => fsvg("line", { x1: x, y1: 40, x2: x, y2: 90, stroke: "#888", "stroke-width": 2 })),
    fsvg("ellipse", { cx: 50, cy: 33, rx: 11, ry: 5, fill: "#fff", stroke: FS_INK, "stroke-width": 2 })),
  hexTube: () => fsPic(fsPoly("26,20 38,28 38,94 26,86", "#d6d6d6"), fsPoly("38,28 62,28 62,94 38,94", "#ececec"), fsPoly("62,28 74,20 74,86 62,94", "#d6d6d6"),
    fsPoly("26,20 38,12 62,12 74,20 62,28 38,28", "#f7f7f7"), fsvg("circle", { cx: 50, cy: 58, r: 8, fill: "#fff", stroke: FS_INK, "stroke-width": 2 })),
  dice3D: () => fsPic(...fsBox3(30, 48, 32, 32, 16, ["#fff", "#fff", "#eee"]), ...fsDots([[37, 55], [46, 64], [55, 73]], 3), ...fsDots([[54, 42]], 3), ...fsDots([[67, 50], [73, 66]], 3)),
  beachBall: () => fsPic(fsvg("circle", { cx: 50, cy: 52, r: 44, fill: "#fff", ...FS_LINE }),
    fsvg("path", { d: "M 26 16 Q 70 30 72 92 M 50 8 Q 96 30 92 66 M 10 44 Q 30 80 50 96", fill: "none", stroke: "#9aa", "stroke-width": 9 }),
    fsvg("ellipse", { cx: 24, cy: 50, rx: 8, ry: 13, fill: "#fff", stroke: FS_INK, "stroke-width": 2 })),
  cd: () => fsPic(fsvg("circle", { cx: 50, cy: 50, r: 42, fill: "#e4e4ea", ...FS_LINE }), fsvg("circle", { cx: 50, cy: 50, r: 15, fill: "#fff", stroke: FS_INK, "stroke-width": 2 }), fsvg("circle", { cx: 50, cy: 50, r: 6, fill: "#bbb", stroke: FS_INK, "stroke-width": 2 })),
  envelope: () => fsPic(fsvg("rect", { x: 4, y: 22, width: 92, height: 58, fill: "#fff", ...FS_LINE }), fsvg("path", { d: "M 4 22 Q 50 72 96 22 M 4 80 L 38 52 M 96 80 L 62 52", fill: "none", stroke: FS_INK, "stroke-width": 2.5 })),
  triRuler: () => fsPic(fsvg("path", { d: "M 4 86 L 50 22 L 96 86 Z M 30 76 L 70 76 L 50 46 Z", fill: "#e2e2e2", "fill-rule": "evenodd", ...FS_LINE }),
    ...Array.from({ length: 15 }, (_, i) => fsvg("line", { x1: 12 + i * 5.4, y1: 86, x2: 12 + i * 5.4, y2: i % 5 ? 82 : 79, stroke: FS_INK, "stroke-width": 1.5 }))),
  postcard: () => fsPic(fsvg("rect", { x: 26, y: 4, width: 48, height: 92, fill: "#fff", ...FS_LINE }), fsvg("rect", { x: 30, y: 8, width: 10, height: 12, fill: "#bbb", stroke: FS_INK, "stroke-width": 1.5 }),
    ...[52, 58, 64].map(x => fsvg("rect", { x, y: 9, width: 5, height: 5, fill: "#fff", stroke: FS_INK, "stroke-width": 1.2 })), fsvg("rect", { x: 44, y: 26, width: 16, height: 60, fill: "#fff", stroke: FS_INK, "stroke-width": 2 })),
  flowerTile: () => fsPic(fsvg("rect", { x: 8, y: 8, width: 84, height: 84, fill: "#f2f2f2", ...FS_LINE }),
    ...[[28, 26], [62, 24], [44, 46], [24, 58], [74, 56], [32, 80], [56, 78], [78, 82]].map(([x, y]) => fsvg("g", {}, ...[0, 72, 144, 216, 288].map(a => fsvg("circle", { cx: x + 5 * Math.cos(a * Math.PI / 180), cy: y + 5 * Math.sin(a * Math.PI / 180), r: 3.5, fill: "#fff", stroke: FS_INK, "stroke-width": 1.2 }))))),
  clock: () => fsPic(fsvg("circle", { cx: 50, cy: 50, r: 44, fill: "#fff", ...FS_LINE }),
    ...Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return fsvg("line", { x1: 50 + 38 * Math.sin(a), y1: 50 - 38 * Math.cos(a), x2: 50 + 42 * Math.sin(a), y2: 50 - 42 * Math.cos(a), stroke: FS_INK, "stroke-width": 2 }); }),
    ...[[12, 50, 23], [3, 80, 54], [6, 50, 85], [9, 20, 54]].map(([n, x, y]) => fsvg("text", { x, y, "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: FS_INK }, String(n))),
    fsvg("line", { x1: 50, y1: 50, x2: 50, y2: 82, stroke: FS_INK, "stroke-width": 3.5, "stroke-linecap": "round" }), fsvg("line", { x1: 50, y1: 50, x2: 68, y2: 60, stroke: FS_INK, "stroke-width": 4.5, "stroke-linecap": "round" })),
  nameCard: () => fsPic(fsvg("rect", { x: 4, y: 28, width: 92, height: 48, fill: "#fff", ...FS_LINE }), fsvg("rect", { x: 10, y: 34, width: 36, height: 5, fill: "#999" }), fsvg("rect", { x: 26, y: 50, width: 34, height: 6, fill: "#666" }),
    fsvg("line", { x1: 48, y1: 66, x2: 88, y2: 66, stroke: "#666", "stroke-width": 2 }), fsvg("circle", { cx: 80, cy: 42, r: 8, fill: "#e8c39e", stroke: FS_INK, "stroke-width": 1.5 })),
  diceFace: () => fsPic(fsvg("rect", { x: 14, y: 14, width: 72, height: 72, rx: 3, fill: "#fff", ...FS_LINE }), ...fsDots([[32, 32], [68, 32], [50, 50], [32, 68], [68, 68]], 6)),
  cdBunny: () => fsPic(fsvg("circle", { cx: 50, cy: 50, r: 42, fill: "#eee", ...FS_LINE }), fsvg("path", { d: "M 9 60 A 42 42 0 0 0 91 60 Z", fill: "#c7c7c7" }),
    fsvg("circle", { cx: 50, cy: 50, r: 9, fill: "#fff", stroke: FS_INK, "stroke-width": 2 }), fsvg("circle", { cx: 50, cy: 24, r: 7, fill: "#fff", stroke: FS_INK, "stroke-width": 1.5 }),
    fsvg("path", { d: "M 46 18 L 44 6 M 54 18 L 56 6", stroke: FS_INK, "stroke-width": 2 })),
  triDots: () => fsPic(fsPoly("6,92 50,8 94,92", "#d9d9d9"), ...[[50, 30], [42, 46], [58, 46], [34, 62], [50, 62], [66, 62], [26, 78], [42, 78], [58, 78], [74, 78]].map(([x, y]) => fsvg("circle", { cx: x, cy: y, r: 2.2, fill: FS_INK }))),
  squarePic: () => fsPic(fsvg("rect", { x: 8, y: 8, width: 84, height: 84, fill: "#fff", ...FS_LINE }), fsvg("path", { d: "M 8 78 Q 50 58 92 72 L 92 92 L 8 92 Z", fill: "#cfcfcf" }),
    fsvg("ellipse", { cx: 28, cy: 22, rx: 11, ry: 5, fill: "#bbb" }), fsvg("ellipse", { cx: 66, cy: 22, rx: 13, ry: 5, fill: "#bbb" }), fsvg("circle", { cx: 80, cy: 82, r: 5, fill: "#fff", stroke: FS_INK, "stroke-width": 1.5 })),
  warning: () => fsPic(fsPoly("6,90 50,10 94,90", "#fff", { "stroke-width": 7 }), fsvg("rect", { x: 46, y: 38, width: 8, height: 30, rx: 3, fill: FS_INK }), fsvg("circle", { cx: 50, cy: 77, r: 5, fill: FS_INK })),
  puppetBook: () => fsPic(fsvg("rect", { x: 24, y: 4, width: 52, height: 92, fill: "#fff", ...FS_LINE }), fsvg("rect", { x: 30, y: 10, width: 40, height: 8, fill: "#ddd" }),
    fsvg("path", { d: "M 34 50 Q 50 30 66 50 Z", fill: "#888", stroke: FS_INK, "stroke-width": 2 }), fsvg("circle", { cx: 50, cy: 64, r: 13, fill: "#f3d2b5", stroke: FS_INK, "stroke-width": 2 }),
    fsvg("line", { x1: 50, y1: 64, x2: 72, y2: 64, stroke: FS_INK, "stroke-width": 3, "stroke-linecap": "round" })),
  coin10: () => fsPic(fsvg("circle", { cx: 50, cy: 50, r: 42, fill: "#d9d9d9", ...FS_LINE }), fsvg("circle", { cx: 50, cy: 50, r: 32, fill: "none", stroke: FS_INK, "stroke-width": 2 }),
    fsvg("text", { x: 50, y: 64, "text-anchor": "middle", "font-size": 36, "font-weight": 900, fill: FS_INK }, "10")),
};
// 第四大題的平面圖形（照片上的大小、方向；單位＝照片的 1/3）：pts 多邊形、sq 正方形邊長＋旋轉、rect 長方形、c 圓的直徑
function fsShape(s, k = 1.6) {
  let pts;
  if (s.c) {
    const d = s.c * k;
    return fsvg("svg", { viewBox: `0 0 ${d + 8} ${d + 8}`, width: d + 8, height: d + 8, class: "fs-shape" }, fsvg("circle", { cx: d / 2 + 4, cy: d / 2 + 4, r: d / 2, fill: "#d8d8d8", ...FS_LINE, "stroke-width": 2 }));
  }
  if (s.sq || s.rect) {
    const [w, h] = s.rect || [s.sq, s.sq], a = (s.rot || 0) * Math.PI / 180;
    pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]);
  } else pts = s.pts;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys);
  const W = (Math.max(...xs) - x0) * k + 8, H = (Math.max(...ys) - y0) * k + 8;
  return fsvg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: "fs-shape" },
    fsPoly(pts.map(([x, y]) => `${(x - x0) * k + 4},${(y - y0) * k + 4}`).join(" "), "#d8d8d8", { "stroke-width": 2 }));
}
const fsShapes = (list) => list.map(([s, not]) => ({ pic: () => fsShape(s), correct: !!not }));

FILL_SHEETS.u5 = {
  title: "一上 第10回", sub: "5-1 堆疊與分類　5-2 認識形狀", pages: "第20、21頁", unitWord: "題",
  howto: "點圖把它圈起來（再點一次取消），點方框選代號，連連看先點圖再點中間的形狀",
  sections: [
    { no: "1", instr: "圈圈看：每題12分，共36分", pts: 12, kind: "circle", qs: [
      { n: 1, prompt: "哪些東西比較容易滾動？", items: [["baseball", 1], ["triChoco"], ["can", 1], ["cookieBox"]].map(([k, ok]) => ({ pic: FS10[k], correct: !!ok })) },
      { n: 2, prompt: "哪個東西有平平的面，也有彎彎的面？", items: [["volleyball"], ["pencilBox"], ["teaCarton"], ["chipsTube", 1]].map(([k, ok]) => ({ pic: FS10[k], correct: !!ok })) },
      { n: 3, prompt: "哪一個東西看起來和左邊的圖很像？", ref: FS10.giftCube, items: [["hexTube"], ["dice3D", 1], ["beachBall"]].map(([k, ok]) => ({ pic: FS10[k], correct: !!ok })) },
    ] },
    { no: "2", instr: "用下面這些東西可以描出什麼形狀？填入代號：每題5分，共20分", pts: 5, kind: "codes",
      pics: [["ㄅ", "cd"], ["ㄆ", "envelope"], ["ㄇ", "triRuler"], ["ㄈ", "postcard"], ["ㄉ", "flowerTile"], ["ㄊ", "clock"], ["ㄋ", "nameCard"], ["ㄌ", "diceFace"]],
      boxes: [["1. 正方形", "ㄉㄌ"], ["2. 圓形", "ㄅㄊ"], ["3. 長方形", "ㄆㄈㄋ"], ["4. 三角形", "ㄇ"]] },
    { no: "3", instr: "連連看，下面的東西像哪一種形狀？每題4分，共32分", pts: 4, kind: "match3",
      labels: ["三角形", "正方形", "圓形", "長方形"],
      left: [["①", "cdBunny", 2], ["②", "triDots", 0], ["③", "postcard", 3], ["④", "squarePic", 1]],
      right: [["⑤", "flowerTile", 1], ["⑥", "warning", 0], ["⑦", "puppetBook", 3], ["⑧", "coin10", 2]] },
    { no: "4", instr: "圈圈看：每題4分，共12分", pts: 4, kind: "circle", qs: [
      { n: 1, prompt: "哪些不是三角形？", shapes: true, items: fsShapes([
        [{ pts: [[29, 43], [56, 18], [56, 70]] }], [{ pts: [[83, 33], [106, 7], [128, 33]] }], [{ sq: 21, rot: 40 }, 1], [{ pts: [[63, 87], [92, 69], [92, 87]] }],
        [{ pts: [[136, 61], [136, 86], [168, 73]] }], [{ pts: [[208, 43], [208, 67], [298, 55]] }], [{ pts: [[256, 32], [297, 7], [339, 32]] }],
        [{ pts: [[283, 86], [312, 61], [340, 86]] }], [{ pts: [[340, 59], [354, 34], [379, 59]] }], [{ rect: [94, 29] }, 1], [{ pts: [[406, 70], [462, 70], [434, 87]] }]]) },
      { n: 2, prompt: "哪些不是正方形？", shapes: true, items: fsShapes([
        [{ sq: 37 }], [{ pts: [[0, 0], [0, 25], [26, 25]] }, 1], [{ sq: 18, rot: 40 }], [{ sq: 19 }], [{ sq: 52 }], [{ sq: 27 }], [{ rect: [74, 28] }, 1], [{ sq: 20, rot: 30 }], [{ sq: 34, rot: 45 }]]) },
      { n: 3, prompt: "哪些不是圓形？", shapes: true, items: fsShapes([
        [{ c: 48 }], [{ c: 13 }], [{ rect: [26, 13], rot: 15 }, 1], [{ c: 37 }], [{ c: 40 }], [{ c: 33 }], [{ pts: [[0, 12], [25, 0], [23, 28]] }, 1], [{ c: 23 }], [{ c: 52 }], [{ c: 53 }]]) },
    ] },
  ],
};

// 圈圈看（可以圈好幾個）：每小題全部圈對才給分
function fsCircleQ(q, pts, addBlank, isLocked, update) {
  const on = new Set();
  const badge = el("span", { class: "ws-q__badge" });
  const card = el("div", { class: "ws-q" }, el("div", { class: "ws-q__head" }, el("span", { class: "ws-q__no" }, `${q.n}.`), el("span", { class: "ws-q__prompt" }, t(q.prompt)),
    el("button", { class: "icon-btn icon-btn--accent m-speak", onclick: () => speakZh(q.prompt), "aria-label": "念題目" }, "🔊"), badge));
  const btns = q.items.map((it, i) => {
    const b = el("button", { class: `fs-pick${q.shapes ? " fs-pick--shape" : ""}`, "aria-label": "圈起來" }, it.pic());
    b.addEventListener("click", () => { if (isLocked()) return; on.has(i) ? on.delete(i) : on.add(i); b.classList.toggle("fs-pick--on", on.has(i)); update(); });
    return b;
  });
  const row = el("div", { class: `fs-picks${q.shapes ? " fs-picks--shapes" : ""}` }, btns);
  card.append(q.ref ? el("div", { class: "fs-picks-ref" }, el("div", { class: "fs-ref" }, q.ref()), row) : row);
  const ans = q.items.map((it, i) => it.correct ? i : -1).filter(i => i >= 0).join(",");
  addBlank({ get: () => on.size ? [...on].sort((a, b) => a - b).join(",") : null, ans, pts,
    show: ok => { badge.textContent = ok ? "⭕" : "❌"; card.classList.add(ok ? "ws-q--ok" : "ws-q--bad");
      if (!ok) btns.forEach((b, i) => { if (q.items[i].correct) b.classList.add("fs-pick--ans"); else if (on.has(i)) b.classList.add("fs-pick--bad"); }); } });
  return card;
}

// 填代號：上面是東西（ㄅ～ㄌ），下面四個方框；點方框跳出代號鍵（可以選好幾個）
function fsCodesQ(sec, addBlank, isLocked, update) {
  const wrap = el("div", { class: "ws-q fs-codes" },
    el("div", { class: "fs-codes__pics" }, sec.pics.map(([code, k]) => el("div", { class: "fs-codes__pic" }, el("span", { class: "fs-codes__code" }, code), FS10[k]()))));
  const boxes = el("div", { class: "fs-codes__boxes" });
  sec.boxes.forEach(([label, ans]) => {
    let val = [];
    const v = el("span", { class: "fs-codes__val" });
    const box = el("button", { class: "fs-codes__box", "aria-label": "填代號" }, v);
    const draw = () => v.textContent = val.join(" ");
    box.addEventListener("click", () => {
      if (isLocked()) return;
      wrap.querySelectorAll(".fs-codes__box--on").forEach(x => x.classList.remove("fs-codes__box--on")); box.classList.add("fs-codes__box--on");
      fsOpenCodePad(sec.pics.map(p => p[0]), val, picked => { val = picked; draw(); box.classList.remove("fs-codes__box--on"); update(); });
    });
    boxes.appendChild(el("div", { class: "fs-codes__cell" }, el("div", { class: "fs-codes__label" }, t(label)), box));
    const order = sec.pics.map(p => p[0]);
    addBlank({ get: () => val.length ? val.join("") : null, ans: [...ans].sort((a, b) => order.indexOf(a) - order.indexOf(b)).join(""), pts: sec.pts,
      show: ok => { box.classList.add(ok ? "fs-codes__box--ok" : "fs-codes__box--bad"); if (!ok) box.append(el("span", { class: "fs-codes__ans" }, [...ans].join(" "))); } });
  });
  wrap.appendChild(boxes);
  return wrap;
}
function fsOpenCodePad(codes, current, onDone) {
  fsPadEl?.remove();
  const sel = new Set(current);
  const close = () => { fsPadEl?.remove(); fsPadEl = null; };
  const keys = codes.map(c => { const b = el("button", { class: `fs-pad__key${sel.has(c) ? " fs-pad__key--on" : ""}` }, c);
    b.addEventListener("click", () => { sel.has(c) ? sel.delete(c) : sel.add(c); b.classList.toggle("fs-pad__key--on", sel.has(c)); }); return b; });
  fsPadEl = el("div", { class: "fs-pad" },
    el("div", { class: "fs-pad__tip" }, t("可以選好幾個，選好按「好了」")),
    el("div", { class: "fs-pad__keys fs-pad__keys--codes" }, keys,
      el("button", { class: "fs-pad__key fs-pad__key--done", onclick: () => { onDone(codes.filter(c => sel.has(c))); close(); } }, t("好了"))));
  document.body.appendChild(fsPadEl);
}

// 三欄連連看：左邊、右邊的東西連到中間的形狀（先點圖再點形狀，或先點形狀再點圖）
function fsMatch3(sec, addBlank, isLocked, update) {
  const wrap = el("div", { class: "ws-q fs-m3" });
  const lines = fsvg("svg", { class: "fs-match__lines" });
  const links = {}; // "L0" / "R2" -> 形狀 index
  const status = {};
  let pick = null; // { pic: "L0" } 或 { label: 1 }
  const picDots = {}, labelDots = [];
  const clearOn = () => wrap.querySelectorAll(".fs-m3--on").forEach(x => x.classList.remove("fs-m3--on"));
  const draw = () => {
    const wr = wrap.getBoundingClientRect();
    lines.setAttribute("viewBox", `0 0 ${wr.width} ${wr.height}`); lines.setAttribute("width", wr.width); lines.setAttribute("height", wr.height);
    const c = d => { const r = d.getBoundingClientRect(); return [r.left + r.width / 2 - wr.left, r.top + r.height / 2 - wr.top]; };
    lines.replaceChildren(...Object.entries(links).map(([key, li]) => {
      const [x1, y1] = c(picDots[key]), [x2, y2] = c(labelDots[li][key[0] === "L" ? 0 : 1]);
      return fsvg("line", { x1, y1, x2, y2, stroke: status[key] === "ok" ? FS_GREEN : status[key] === "bad" ? FS_RED : "#3b6bff", "stroke-width": 4, "stroke-linecap": "round" });
    }));
  };
  const link = (key, li) => { links[key] = li; pick = null; clearOn(); draw(); update(); };
  const picBtn = (side, [no, k, ans], i) => {
    const key = side + i, dot = el("span", { class: "fs-match__dot" });
    picDots[key] = dot;
    const b = el("button", { class: `fs-m3__pic fs-m3__pic--${side}` }, el("span", { class: "fs-m3__no" }, no), FS10[k](), dot);
    b.addEventListener("click", () => { if (isLocked()) return; if (pick?.label != null) return link(key, pick.label); pick = { pic: key }; clearOn(); b.classList.add("fs-m3--on"); });
    addBlank({ get: () => links[key] ?? null, ans, pts: sec.pts, show: ok => { status[key] = ok ? "ok" : "bad"; if (!ok) links[key] = ans; draw(); } });
    return b;
  };
  const grid = el("div", { class: "fs-m3__grid" });
  sec.labels.forEach((label, li) => {
    const dl = el("span", { class: "fs-match__dot" }), dr = el("span", { class: "fs-match__dot" });
    labelDots.push([dl, dr]);
    const lb = el("button", { class: "fs-m3__label" }, dl, t(label), dr);
    lb.addEventListener("click", () => { if (isLocked()) return; if (pick?.pic) return link(pick.pic, li); pick = { label: li }; clearOn(); lb.classList.add("fs-m3--on"); });
    grid.append(picBtn("L", sec.left[li], li), lb, picBtn("R", sec.right[li], li));
  });
  wrap.append(el("div", { class: "fs-match__hint" }, t("先點一個東西，再點中間的形狀，就會連一條線")), grid, lines);
  new ResizeObserver(draw).observe(wrap);
  return wrap;
}

// === 第10回的練習題型（不是原題，用來練觀念；遊戲也會用）===
// 把卷子上的圖放進 400 寬的題目板
function fsPlace(pic, x, y, size) {
  const g = fsvg("g", { transform: `translate(${x},${y}) scale(${size / 100})` });
  [...pic.childNodes].forEach(c => g.appendChild(c));
  g.bbox = { x: x - 4, y: y - 4, w: size + 8, h: size + 8 };
  return g;
}
const FS_SHAPE_NAMES = ["三角形", "正方形", "長方形", "圓形"];
function fsShapePic(name) {
  const rot = [0, 0, 15, 30, 45][rnd(0, 4)];
  const s = name === "三角形" ? { pts: shuffle([[[0, 40], [24, 0], [48, 40]], [[0, 0], [0, 40], [44, 40]], [[0, 0], [48, 20], [0, 40]], [[0, 0], [60, 14], [10, 36]]])[0] }
    : name === "正方形" ? { sq: rnd(28, 40), rot } : name === "長方形" ? { rect: [rnd(48, 60), rnd(18, 26)], rot } : { c: rnd(30, 44) };
  const sv = fsShape(s, 2);
  const vb = sv.viewBox.baseVal, sc = 100 / Math.max(vb.width, vb.height);
  const pic = fsvg("svg", { viewBox: "0 0 100 100" });
  const g = fsvg("g", { transform: `translate(${(100 - vb.width * sc) / 2},${(100 - vb.height * sc) / 2}) scale(${sc})` }, ...[...sv.childNodes]);
  pic.appendChild(g);
  return pic;
}
// 哪一個是○○形？（正方形和長方形最容易搞混，一起出）
function genShapeName() {
  const ans = FS_SHAPE_NAMES[rnd(0, 3)];
  const others = shuffle(FS_SHAPE_NAMES.filter(n => n !== ans));
  if (ans === "正方形" && !others.slice(0, 2).includes("長方形")) others.unshift("長方形");
  if (ans === "長方形" && !others.slice(0, 2).includes("正方形")) others.unshift("正方形");
  const names = shuffle([ans, others[0], others[1]]);
  return { topic: "shapeName", prompt: `哪一個是${ans}？`, h: 130, items: names.map((n, i) => ({ node: fsPlace(fsShapePic(n), 22 + i * 130, 14, 100), correct: n === ans })) };
}
// 用這個東西可以描出什麼形狀？
const FS_TRACE = [["cd", "圓形"], ["clock", "圓形"], ["coin10", "圓形"], ["envelope", "長方形"], ["postcard", "長方形"], ["nameCard", "長方形"], ["puppetBook", "長方形"], ["flowerTile", "正方形"], ["diceFace", "正方形"], ["triRuler", "三角形"], ["warning", "三角形"]];
function genShapeTrace() {
  const [k, ans] = FS_TRACE[rnd(0, FS_TRACE.length - 1)];
  const names = shuffle([ans, ...shuffle(FS_SHAPE_NAMES.filter(n => n !== ans)).slice(0, 2)]);
  const obj = fsPlace(FS10[k](), 150, 6, 100);
  return { topic: "shapeTrace", prompt: "用這個東西可以描出什麼形狀？", h: 250, extra: obj, items: names.map((n, i) => ({ node: fsPlace(fsShapePic(n), 22 + i * 130, 130, 100), correct: n === ans })) };
}
// 會滾動嗎？／有平平的面也有彎彎的面
function genShapeRoll() {
  const roll = ["baseball", "can", "chipsTube", "volleyball", "beachBall"], flatCurve = ["can", "chipsTube"];
  const boxes = ["triChoco", "cookieBox", "pencilBox", "teaCarton", "giftCube", "hexTube", "dice3D"];
  const both = rnd(0, 1) === 1;
  const ans = shuffle(both ? flatCurve : roll)[0];
  const wrongs = shuffle(both ? [...boxes, "baseball", "volleyball", "beachBall"] : boxes).slice(0, 2);
  const keys = shuffle([ans, ...wrongs]);
  return { topic: "shapeRoll", prompt: both ? "哪個東西有平平的面，也有彎彎的面？" : "哪一個東西比較容易滾動？", h: 130,
    items: keys.map((k, i) => ({ node: fsPlace(FS10[k](), 22 + i * 130, 14, 100), correct: k === ans })) };
}
MATH_TOPICS.shapeName = { name: "認識形狀", emoji: "🔺", gen: genShapeName };
MATH_TOPICS.shapeTrace = { name: "描出形狀", emoji: "✏️", gen: genShapeTrace };
MATH_TOPICS.shapeRoll = { name: "會滾動嗎", emoji: "⚽", gen: genShapeRoll };
