// 📄 小A本／評量卷原題：要「填數字」和「連連看」的卷子（老師會考一模一樣的題目）
// 版面、題目文字、圖裡的數量、配分都照家長拍的照片；作答方式也照卷子：
//   (　)、□ 點一下選數字；連連看先點上面再點下面畫線；寫完按「交卷」照配分算分
// 一上 第9回（4-3 0的認識、4-4 分與合，小A本 p.18-19，照片 Drive IMG_8819）

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
  app.appendChild(el("div", { class: "ws-howto" }, t(`跟小A本${S.pages}一樣寫：點(　)或□選數字，連連看先點上面再點下面。寫完按「交卷」`)));

  const blanks = []; // { get, ans, pts, show(ok) }
  let locked = false;
  const update = () => { const done = blanks.filter(b => b.get() != null).length; progressLabel.textContent = `寫了 ${done}/${blanks.length} 格`; };
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
    }
    app.appendChild(secEl);
  });

  const result = el("div", { class: "ws-result" });
  const total = blanks.length;
  const submit = el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => {
    const left = blanks.filter(b => b.get() == null).length;
    if (left > 0 && !submit.dataset.confirm) { submit.dataset.confirm = "1"; submit.replaceChildren(t(`還有${left}格沒寫，確定要交卷？`)); return; }
    locked = true; submit.hidden = true; submit.style.display = "none"; fsPadEl?.remove();
    let score = 0, got = 0;
    blanks.forEach(b => { const ok = b.get() === b.ans; b.show(ok); if (ok) { score += b.pts; got++; } recordMath("sheet", ok); });
    scoreBox.textContent = String(score); scoreBox.classList.add("pop");
    if (got === total) { dingCorrect(); confetti(); } else buzzWrong();
    result.replaceChildren(
      el("div", { class: "ws-result__big" }, `${score} 分`),
      el("div", { class: "ws-result__msg" }, got === total ? t("全對！太厲害了 🌟") : t(`答對 ${got} 格，錯的地方看綠色的正確答案 💪`)),
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
