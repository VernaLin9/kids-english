// 數學（二年級，南一版二上）：單元 kind:"calc"
// 第4單元 加減的關係與應用（課本 p.52-65）、第5單元 容量（課本 p.68 起）
// 每題：{ topic, text, visual?, steps:[{ type:"choice", label, options:[{label, ok}] } | { type:"num", label, answer, unit } | { type:"pick3" }], hint }
// 一題所有步驟第一次就對才算分；答錯會顯示提示，可以再試

const MATH2_NAMES = ["小可", "樂樂", "洋洋", "小悅", "芊芊", "青岳"];
const r2 = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick2 = arr => arr[r2(0, arr.length - 1)];

// 兩位數減法：一半有退位、一半沒有
function subPair(minT = 20, maxT = 99) {
  for (let k = 0; k < 50; k++) {
    const T = r2(minT, maxT), A = r2(10, T - 5);
    const borrow = (T % 10) < (A % 10);
    if (Math.random() < 0.55 ? borrow : !borrow) return [T, A];
  }
  return [52, 27];
}
function addPair(maxSum = 99) {
  for (let k = 0; k < 50; k++) {
    const A = r2(10, 70), B = r2(6, 45);
    if (A + B <= maxSum) return [A, B];
  }
  return [28, 16];
}

// === 線段圖（像課本：上面分兩段，下面括起來是全部）===
// parts: [{ label, val }]，val 是 null 就畫 □；total: { label, val }
function barModel(parts, total, unit) {
  const sum = parts.reduce((s, p) => s + (p.val ?? 0), 0) || 1;
  const known = parts.filter(p => p.val != null).reduce((s, p) => s + p.val, 0);
  const T = total.val ?? sum;
  const widths = parts.map(p => p.val != null ? p.val / T : Math.max(0.18, (T - known) / T));
  const norm = widths.reduce((a, b) => a + b, 0);
  const box = v => v == null ? el("span", { class: "b2-q" }, "?") : el("span", { class: "b2-v" }, String(v));
  return el("div", { class: "b2" },
    el("div", { class: "b2-row" }, parts.map((p, i) =>
      el("div", { class: `b2-seg b2-seg--${i}`, style: `flex: ${widths[i] / norm};` },
        el("div", { class: "b2-seg__label" }, t(p.label), " ", box(p.val), t(unit))))),
    el("div", { class: "b2-total" }, el("span", { class: "b2-brace" }), el("span", { class: "b2-total__label" }, t(total.label), " ", box(total.val), t(unit))));
}

const eqText = (a, op, b) => `${a} ${op} ${b}`;
// 減法題的算式選項：正確、改成加法、大減小顛倒（小朋友常犯）
function subEqOptions(T, A) {
  return shuffle([{ label: eqText(T, "−", A), ok: true }, { label: eqText(T, "+", A), ok: false }, { label: eqText(A, "−", T), ok: false }]);
}
function addEqOptions(A, B) {
  const big = Math.max(A, B), small = Math.min(A, B);
  return shuffle([{ label: eqText(A, "+", B), ok: true }, { label: eqText(big, "−", small), ok: false }]);
}

// === 第4單元 題型 ===
const WORD_TEMPLATES = [
  () => { const [T, A] = subPair(20, 60); return { text: `蒸籠裡有${A}個肉包和一些菜包，合起來有${T}個，蒸籠裡有幾個菜包？`, parts: [{ label: "肉包", val: A }, { label: "菜包", val: null }], total: { label: "合起來", val: T }, unit: "個", op: "sub", T, A }; },
  () => { const [T, A] = subPair(25, 60); return { text: `袋子裡原有${A}片餅乾，${pick2(MATH2_NAMES)}再放進一些後，全部有${T}片，放進幾片餅乾？`, parts: [{ label: "原有", val: A }, { label: "再放", val: null }], total: { label: "全部有", val: T }, unit: "片", op: "sub", T, A }; },
  () => { const [T, A] = subPair(40, 99); return { text: `${pick2(MATH2_NAMES)}有${A}元，最少要再存幾元，才可以買一個${T}元的蛋糕？`, parts: [{ label: "有", val: A }, { label: "再存", val: null }], total: { label: "蛋糕", val: T }, unit: "元", op: "sub", T, A }; },
  () => { const [T, B] = subPair(30, 99); return { text: `${pick2(MATH2_NAMES)}用${T}元買了一包色紙，找回${B}元，一包色紙是幾元？`, parts: [{ label: "色紙", val: null }, { label: "找回", val: B }], total: { label: "原有", val: T }, unit: "元", op: "sub", T, A: B }; },
  () => { const [T, B] = subPair(30, 90); return { text: `架子上有${T}包書套，賣掉一些後，還剩下${B}包，賣掉的書套有幾包？`, parts: [{ label: "賣掉", val: null }, { label: "剩下", val: B }], total: { label: "原有", val: T }, unit: "包", op: "sub", T, A: B }; },
  () => { const [T, B] = subPair(30, 80); return { text: `${pick2(MATH2_NAMES)}的集點卡有${T}點，兌換筆記本用掉一些後，還剩下${B}點，用掉幾點？`, parts: [{ label: "用掉", val: null }, { label: "剩下", val: B }], total: { label: "原有", val: T }, unit: "點", op: "sub", T, A: B }; },
  () => { const [T, A] = subPair(30, 99); return { text: `${pick2(MATH2_NAMES)}有${T}元，買餅乾花了${A}元，還剩下幾元？`, parts: [{ label: "花了", val: A }, { label: "剩下", val: null }], total: { label: "原有", val: T }, unit: "元", op: "sub", T, A }; },
  () => { const [T, A] = subPair(25, 70); return { text: `商店裡有牛奶和果汁共${T}罐，其中果汁有${A}罐，牛奶有幾罐？`, parts: [{ label: "果汁", val: A }, { label: "牛奶", val: null }], total: { label: "共", val: T }, unit: "罐", op: "sub", T, A }; },
  () => { const [T, A] = subPair(20, 99); return { text: `一條長${T}公分的繩子剪成兩段，一段是${A}公分，另一段是幾公分？`, parts: [{ label: "一段", val: A }, { label: "另一段", val: null }], total: { label: "全長", val: T }, unit: "公分", op: "sub", T, A }; },
  () => { const [A, B] = addPair(); return { text: `一條繩子剪成兩段，一段是${A}公分，另一段是${B}公分，繩子原來長幾公分？`, parts: [{ label: "一段", val: A }, { label: "另一段", val: B }], total: { label: "原來", val: null }, unit: "公分", op: "add", A, B }; },
  () => { const [A, B] = addPair(); return { text: `籃子裡有${A}個藍色球和${B}個紅色球，全部有幾個球？`, parts: [{ label: "藍色球", val: A }, { label: "紅色球", val: B }], total: { label: "全部", val: null }, unit: "個", op: "add", A, B }; },
];
function genWord() {
  const w = pick2(WORD_TEMPLATES)();
  const ans = w.op === "add" ? w.A + w.B : w.T - w.A;
  return {
    topic: "word", text: w.text, visual: barModel(w.parts, w.total, w.unit),
    steps: [
      { type: "choice", label: "① 要用哪一個算式？", options: w.op === "add" ? addEqOptions(w.A, w.B) : subEqOptions(w.T, w.A) },
      { type: "num", label: "② 答案是多少？", answer: ans, unit: w.unit },
    ],
    hint: w.op === "add" ? "兩段合起來就是全部，用加法" : "全部的數量減掉知道的那一段，就是不知道的那一段（大的數減小的數）",
  };
}

// 加減的關係：數字分合圖，一格是空的
function bondEl(top, left, right, hide) {
  const cell = (v, k) => el("div", { class: `b2-bond__cell ${hide === k ? "b2-bond__cell--q" : ""}` }, hide === k ? "?" : String(v));
  return el("div", { class: "b2-bond" }, el("div", { class: "b2-bond__top" }, cell(top, "top")), el("div", { class: "b2-bond__lines" }),
    el("div", { class: "b2-bond__bottom" }, cell(left, "left"), cell(right, "right")));
}
function genBond() {
  const [A, B] = addPair(90); const T = A + B;
  const hide = pick2(["top", "left", "right"]);
  const answer = hide === "top" ? T : hide === "left" ? A : B;
  const eq = hide === "top" ? `${A} + ${B} = ?` : hide === "left" ? `${T} − ${B} = ?` : `${T} − ${A} = ?`;
  return { topic: "bond", text: `看分合圖，?是多少？（${eq}）`, visual: bondEl(T, A, B, hide),
    steps: [{ type: "num", label: "?是多少？", answer }], hint: hide === "top" ? "兩個合起來是上面的數，用加法" : "上面的數減掉知道的那一個，就是另一個" };
}
// 加減關係：看一個算式，寫出另一個
function genFamily() {
  const [A, B] = addPair(90); const T = A + B;
  const k = r2(0, 3);
  const [given, ask, ans] = [
    [`${A} + ${B} = ${T}`, `${T} − ${A} = ?`, B],
    [`${A} + ${B} = ${T}`, `${T} − ${B} = ?`, A],
    [`${T} − ${A} = ${B}`, `${B} + ${A} = ?`, T],
    [`${T} − ${B} = ${A}`, `${A} + ? = ${T}`, B],
  ][k];
  return { topic: "bond", text: `已經知道「${given}」，`, visual: el("div", { class: "b2-eq" }, ask),
    steps: [{ type: "num", label: "?是多少？（不用重算，想想加減的關係）", answer: ans }], hint: "加法和減法是一家人：部分＋部分＝全部，全部−部分＝另一部分" };
}

// 驗算
function genCheck() {
  if (Math.random() < 0.5) {
    const [T, A] = subPair(); const C = T - A;
    return { topic: "check", text: `${T} − ${A} = ${C}，要怎麼驗算？`, visual: null,
      steps: [{ type: "choice", label: "選一個驗算的算式", options: shuffle([{ label: `${C} + ${A} = ${T}`, ok: true }, { label: `${C} − ${A} = ${Math.abs(C - A)}`, ok: false }, { label: `${T} + ${A} = ${T + A}`, ok: false }]) }],
      hint: "減法用加法驗算：答案＋減掉的數，要等於原來的數" };
  }
  const [T, A] = subPair(30, 99);
  const right = T - A;
  const wrongs = [right + 10, right - 10, right + 1, right - 1].filter(v => v > 0);
  const shown = Math.random() < 0.5 ? right : pick2(wrongs);
  const name = pick2(MATH2_NAMES);
  return { topic: "check", text: `${name}算出「${T} − ${A} = ${shown}」，用驗算檢查看看，算對了嗎？`, visual: el("div", { class: "b2-eq b2-eq--sm" }, `${shown} + ${A} = ?`),
    steps: [{ type: "num", label: `先算 ${shown} + ${A} = ?`, answer: shown + A }, { type: "choice", label: `要等於 ${T} 才對，所以${name}…`, options: [{ label: "✓ 算對了", ok: shown === right }, { label: "✗ 算錯了", ok: shown !== right }] }],
    hint: `${shown} + ${A} 要等於 ${T} 才算對` };
}

// 直式加減
function vertEl(a, op, b) {
  return el("div", { class: "b2-vert" }, el("div", { class: "b2-vert__row" }, el("span", {}, ""), el("span", {}, String(a))),
    el("div", { class: "b2-vert__row" }, el("span", {}, op), el("span", {}, String(b))), el("div", { class: "b2-vert__line" }));
}
function genVert() {
  if (Math.random() < 0.6) { const [T, A] = subPair(); return { topic: "vert", text: `用直式算算看：${T} − ${A}`, visual: vertEl(T, "−", A), steps: [{ type: "num", label: "答案", answer: T - A }], hint: "個位不夠減，要向十位借 1 個十（變成 10）" }; }
  const [A, B] = addPair(); return { topic: "vert", text: `用直式算算看：${A} + ${B}`, visual: vertEl(A, "+", B), steps: [{ type: "num", label: "答案", answer: A + B }], hint: "個位滿 10 要進位到十位" };
}

// 大於、小於、等於
function exprOf(v) {
  if (Math.random() < 0.5 && v > 12) { const a = r2(5, v - 5); return [`${a} + ${v - a}`, v]; }
  const b = r2(5, 40); return [`${v + b} − ${b}`, v];
}
function genCmp() {
  const rel = pick2([">", "<", "="]);
  const L = r2(15, 80);
  const R = rel === "=" ? L : rel === ">" ? L - r2(1, 5) : L + r2(1, 5);
  const [le] = exprOf(L);
  const right = Math.random() < 0.5 ? String(R) : exprOf(R)[0];
  return { topic: "cmp", text: "在□中填入 >、< 或 =", visual: el("div", { class: "b2-cmp" }, el("span", {}, le), el("span", { class: "b2-cmp__box" }, "□"), el("span", {}, right)),
    steps: [{ type: "choice", label: "", sym: true, options: [">", "<", "="].map(s => ({ label: s, ok: s === rel })) }],
    hint: "先把兩邊都算出來，再比大小" };
}

// 神機妙算：3 張加起來剛好 15
function genFifteen() {
  if (Math.random() < 0.5) {
    for (let k = 0; k < 50; k++) {
      const a = r2(1, 9), b = r2(1, 9), c = 15 - a - b;
      if (a === b || c < 1 || c > 9 || c === a || c === b) continue;
      const rest = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== a && x !== b && x !== c)).slice(0, 3);
      return { topic: "fifteen", text: `神機妙算：你手上有 ${a} 和 ${b}，再拿哪一張，3 張加起來剛好是 15，你就贏了？`, visual: el("div", { class: "b2-cards" }, [a, b].map(n => el("span", { class: "b2-card b2-card--mine" }, String(n)))),
        steps: [{ type: "choice", label: "拿哪一張？", options: shuffle([c, ...rest]).map(n => ({ label: String(n), ok: n === c })) }], hint: `${a} + ${b} = ${a + b}，還差幾才到 15？` };
    }
  }
  return { topic: "fifteen", text: "神機妙算：從 1～9 選 3 張卡，加起來剛好是 15", visual: null, steps: [{ type: "pick3" }], hint: "例如先選一張大的，再找兩張合起來補到 15" };
}

// === 第5單元 容量（課本只拍到 p.68 開頭頁，題型依課本主題：直接比較、倒水比較、用杯子量）===
const WATER = "#7fc8f8";
function jarSvg(x, baseY, w, h, fill, label) {
  const g = svg("g", {});
  g.appendChild(svg("rect", { x, y: baseY - h, width: w, height: h, rx: 12, fill: "#f4fbff", stroke: "#8aa", "stroke-width": 3 }));
  if (fill > 0) g.appendChild(svg("rect", { x: x + 3, y: baseY - h * fill + 3, width: w - 6, height: h * fill - 6, rx: 9, fill: WATER }));
  g.appendChild(svg("rect", { x: x - 4, y: baseY - h - 8, width: w + 8, height: 12, rx: 5, fill: "#cfe3ea", stroke: "#8aa", "stroke-width": 2 }));
  const tx = svg("text", { x: x + w / 2, y: baseY + 30, "text-anchor": "middle", "font-size": 24, "font-weight": 800, fill: "#3b3a4a" }); tx.textContent = label; g.appendChild(tx);
  return g;
}
function cupsSvg(n, y, color) {
  const g = svg("g", {});
  for (let i = 0; i < n; i++) {
    const x = 20 + (i % 10) * 36, yy = y + Math.floor(i / 10) * 40;
    g.appendChild(svg("path", { d: `M ${x} ${yy} h 26 l -4 30 h -18 z`, fill: color, stroke: "#557", "stroke-width": 1.5 }));
  }
  return g;
}
function genCapPour() {
  const h1 = r2(35, 85) / 100; let h2 = r2(35, 85) / 100; if (Math.abs(h1 - h2) < 0.12) h2 = h1 > 0.6 ? h1 - 0.2 : h1 + 0.2;
  const board = svg("svg", { viewBox: "0 0 400 250", class: "m-board" });
  board.appendChild(jarSvg(80, 200, 90, 170, h1, "甲")); board.appendChild(jarSvg(230, 200, 90, 170, h2, "乙"));
  return { topic: "capPour", text: "把甲、乙兩個罐子都裝滿水，再分別倒進兩個一樣大的瓶子裡，結果像下圖。哪一個罐子裝的水比較多？", visual: board,
    steps: [{ type: "choice", label: "", options: [{ label: "甲罐", ok: h1 > h2 }, { label: "乙罐", ok: h2 > h1 }] }], hint: "倒進一樣大的瓶子，水比較高的，原來裝的水比較多" };
}
function genCapCups() {
  const a = r2(3, 9); let b = r2(3, 9); if (a === b) b = a + 2;
  const [n1, n2] = pick2([["甲壺", "乙壺"], ["水桶", "水壺"], ["大碗", "鍋子"]]);
  const board = svg("svg", { viewBox: `0 0 400 ${a > 10 || b > 10 ? 260 : 170}`, class: "m-board" });
  const l1 = svg("text", { x: 20, y: 30, "font-size": 20, "font-weight": 800, fill: "#3b3a4a" }); l1.textContent = n1; board.appendChild(l1); board.appendChild(cupsSvg(a, 40, "#ffd166"));
  const l2 = svg("text", { x: 20, y: 110, "font-size": 20, "font-weight": 800, fill: "#3b3a4a" }); l2.textContent = n2; board.appendChild(l2); board.appendChild(cupsSvg(b, 120, "#b388ff"));
  const more = a > b ? n1 : n2;
  return { topic: "capCups", text: `用同樣大的杯子裝水，${n1}裝滿可以倒出${a}杯，${n2}裝滿可以倒出${b}杯。`, visual: board,
    steps: [{ type: "choice", label: "① 哪一個裝的水比較多？", options: [{ label: n1, ok: a > b }, { label: n2, ok: b > a }] }, { type: "num", label: `② ${more}多幾杯？`, answer: Math.abs(a - b), unit: "杯" }],
    hint: "杯子一樣大，倒出比較多杯的，裝的水比較多；多幾杯用減法" };
}
function genCapOverflow() {
  const over = Math.random() < 0.5;
  return { topic: "capOverflow", text: over ? "把甲罐裝滿水，全部倒進空的乙罐。乙罐滿了，甲罐的水還有剩下。哪一個罐子的容量比較大？" : "把甲罐裝滿水，全部倒進空的乙罐。甲罐的水倒完了，乙罐還沒有滿。哪一個罐子的容量比較大？",
    visual: el("div", { class: "b2-emoji" }, over ? "🫙➡️🫙💦" : "🫙➡️🫙"),
    steps: [{ type: "choice", label: "", options: [{ label: "甲罐", ok: over }, { label: "乙罐", ok: !over }] }], hint: over ? "乙裝不下甲的水，表示甲裝得比較多" : "甲的水全部倒進去乙都還沒滿，表示乙裝得比較多" };
}
function genCapTF() {
  const same = Math.random() < 0.5;
  const a = r2(4, 8), b = a + r2(1, 3);
  return { topic: "capTF", text: same ? `用同一個杯子量，水壺裝了${b}杯，水瓶裝了${a}杯。所以水壺裝的水比較多，對不對？` : `用大杯子量，水壺裝了${a}杯；用小杯子量，水瓶裝了${b}杯。所以水瓶裝的水比較多，對不對？`, visual: null,
    steps: [{ type: "choice", label: "", options: [{ label: "✓ 對", ok: same }, { label: "✗ 不對", ok: !same }] }], hint: same ? "杯子一樣大，杯數多的裝得多" : "杯子不一樣大，不能只比杯數" };
}

const MATH2_TOPICS = {
  word:        { emoji: "📖", name: "解題（線段圖）", gen: genWord },
  bond:        { emoji: "🔗", name: "加減的關係", gen: () => (Math.random() < 0.5 ? genBond() : genFamily()) },
  check:       { emoji: "✅", name: "驗算", gen: genCheck },
  vert:        { emoji: "🧮", name: "直式加減", gen: genVert },
  cmp:         { emoji: "⚖️", name: "大於小於等於", gen: genCmp },
  fifteen:     { emoji: "🃏", name: "神機妙算", gen: genFifteen },
  capPour:     { emoji: "🫙", name: "倒水比一比", gen: genCapPour },
  capCups:     { emoji: "🥤", name: "用杯子量", gen: genCapCups },
  capOverflow: { emoji: "💦", name: "誰裝得多", gen: genCapOverflow },
  capTF:       { emoji: "🤔", name: "對不對", gen: genCapTF },
};

// === 課本原題（第4單元 p.54-63，題目、數字、順序照課本）===
const BOOK_U4 = [
  { page: 54, text: "籃子裡有7個藍色球和5個紅色球，全部有幾個球？", visual: () => barModel([{ label: "藍", val: 7 }, { label: "紅", val: 5 }], { label: "全部", val: null }, "個"), steps: [{ type: "num", label: "7 + 5 = ?", answer: 12, unit: "個" }] },
  { page: 54, text: "籃子裡有12個球，拿走5個紅色球後，還有幾個球？", visual: () => bondEl(12, "?", 5, "left"), steps: [{ type: "num", label: "12 − 5 = ?", answer: 7, unit: "個" }] },
  { page: 55, text: "籃子裡有12個球，拿走7個藍色球後，還有幾個球？", visual: () => bondEl(12, 7, "?", "right"), steps: [{ type: "num", label: "12 − 7 = ?", answer: 5, unit: "個" }] },
  { page: 55, text: "一條長24公分的繩子剪成兩段，一段是8公分，另一段是幾公分？", visual: () => barModel([{ label: "", val: null }, { label: "", val: 8 }], { label: "", val: 24 }, "公分"), steps: [{ type: "num", label: "24 − 8 = ?", answer: 16, unit: "公分" }] },
  { page: 55, text: "一條長24公分的繩子剪成兩段，一段是16公分，另一段是幾公分？", visual: () => barModel([{ label: "", val: 16 }, { label: "", val: null }], { label: "", val: 24 }, "公分"), steps: [{ type: "num", label: "24 − 16 = ?", answer: 8, unit: "公分" }] },
  { page: 55, text: "繩子剪成16公分和8公分兩段，原來是幾公分？", visual: () => barModel([{ label: "", val: 16 }, { label: "", val: 8 }], { label: "", val: null }, "公分"), steps: [{ type: "num", label: "16 + 8 = ?", answer: 24, unit: "公分" }] },
  { page: 56, text: "蒸籠裡有13個肉包和一些菜包，合起來有28個，蒸籠裡有幾個菜包？", visual: () => barModel([{ label: "肉包", val: 13 }, { label: "菜包", val: null }], { label: "合起來", val: 28 }, "個"), steps: [{ type: "choice", label: "① 要用哪一個算式？", options: subEqOptions(28, 13) }, { type: "num", label: "② 28 − 13 = ?", answer: 15, unit: "個" }] },
  { page: 57, text: "袋子裡原有28片餅乾，小悅再放進一些後，全部有34片，小悅放進幾片餅乾？", visual: () => barModel([{ label: "原有", val: 28 }, { label: "再放", val: null }], { label: "全部有", val: 34 }, "片"), steps: [{ type: "choice", label: "① 要用哪一個算式？", options: subEqOptions(34, 28) }, { type: "num", label: "② 34 − 28 = ?", answer: 6, unit: "片" }] },
  { page: 57, text: "樂樂有65元，最少要再存幾元，才可以買一個90元的蛋糕？", visual: () => barModel([{ label: "有", val: 65 }, { label: "再存", val: null }], { label: "蛋糕", val: 90 }, "元"), steps: [{ type: "choice", label: "① 要用哪一個算式？（大的數減小的數）", options: subEqOptions(90, 65) }, { type: "num", label: "② 90 − 65 = ?", answer: 25, unit: "元" }] },
  { page: 58, text: "青岳用50元買了一包色紙，找回30元，一包色紙是幾元？", visual: () => barModel([{ label: "色紙", val: null }, { label: "找回", val: 30 }], { label: "原有", val: 50 }, "元"), steps: [{ type: "choice", label: "① 要用哪一個算式？", options: subEqOptions(50, 30) }, { type: "num", label: "② 50 − 30 = ?", answer: 20, unit: "元" }] },
  { page: 59, text: "架子上有58包書套，賣掉一些後，還剩下35包，賣掉的書套有幾包？", visual: () => barModel([{ label: "賣掉", val: null }, { label: "剩下", val: 35 }], { label: "原有", val: 58 }, "包"), steps: [{ type: "choice", label: "① 要用哪一個算式？", options: subEqOptions(58, 35) }, { type: "num", label: "② 答案是多少？", answer: 23, unit: "包" }] },
  { page: 59, text: "芊芊的集點卡有48點，兌換筆記本用掉一些後，還剩下17點，兌換筆記本用掉幾點？", visual: () => barModel([{ label: "用掉", val: null }, { label: "剩下", val: 17 }], { label: "原有", val: 48 }, "點"), steps: [{ type: "choice", label: "① 要用哪一個算式？", options: subEqOptions(48, 17) }, { type: "num", label: "② 答案是多少？", answer: 31, unit: "點" }] },
  { page: 60, text: "洋洋有50元，買餅乾花了38元，還剩下幾元？", visual: () => vertEl(50, "−", 38), steps: [{ type: "num", label: "50 − 38 = ?", answer: 12, unit: "元" }, { type: "choice", label: "驗算：要用哪一個？", options: shuffle([{ label: "12 + 38 = 50", ok: true }, { label: "50 + 38 = 88", ok: false }, { label: "38 − 12 = 26", ok: false }]) }] },
  { page: 61, text: "商店裡有牛奶和果汁共31罐，其中果汁有13罐，牛奶有幾罐？", visual: () => barModel([{ label: "果汁", val: 13 }, { label: "牛奶", val: null }], { label: "共", val: 31 }, "罐"), steps: [{ type: "num", label: "31 − 13 = ?", answer: 18, unit: "罐" }, { type: "choice", label: "驗算：18 + 13 和 13 + 18 都等於 31，兩個人都算對了嗎？", options: [{ label: "✓ 都對", ok: true }, { label: "✗ 只有一個對", ok: false }] }] },
  { page: 61, text: "試試看：先用直式算算看，再驗算。65 − 37 = ?", visual: () => vertEl(65, "−", 37), steps: [{ type: "num", label: "65 − 37 = ?", answer: 28 }, { type: "num", label: "驗算：28 + 37 = ?", answer: 65 }] },
  { page: 62, text: "小藍抽到7和8。7 + 8 比 12 大還是小？", visual: () => el("div", { class: "b2-cmp" }, el("span", {}, "7 + 8"), el("span", { class: "b2-cmp__box" }, "□"), el("span", {}, "12")), steps: [{ type: "choice", label: "", sym: true, options: [">", "<", "="].map(s => ({ label: s, ok: s === ">" })) }] },
  { page: 62, text: "小綠抽到9和2。9 + 2 比 12 大還是小？", visual: () => el("div", { class: "b2-cmp" }, el("span", {}, "9 + 2"), el("span", { class: "b2-cmp__box" }, "□"), el("span", {}, "12")), steps: [{ type: "choice", label: "", sym: true, options: [">", "<", "="].map(s => ({ label: s, ok: s === "<" })) }] },
  { page: 63, text: "小棕抽到10和5，小藍抽到7和8，誰的總分比較多？", visual: () => el("div", { class: "b2-cmp" }, el("span", {}, "10 + 5"), el("span", { class: "b2-cmp__box" }, "□"), el("span", {}, "7 + 8")), steps: [{ type: "choice", label: "", sym: true, options: [">", "<", "="].map(s => ({ label: s, ok: s === "=" })) }] },
  { page: 63, text: "總分比12大才能進入決賽（小藍7+8、小綠9+2、小棕10+5）。誰可以進入決賽？", visual: null, steps: [{ type: "choice", label: "", options: shuffle([{ label: "小藍和小棕", ok: true }, { label: "小綠和小棕", ok: false }, { label: "三個人都可以", ok: false }]) }] },
  ...[["9 + 8", "18", "<"], ["12 + 14", "25", ">"], ["26 + 17", "43", "="], ["11 + 39", "35 + 15", "="], ["69 − 15", "55", "<"], ["50 − 24", "25", ">"]].map(([l, r, s], i) => ({
    page: 63, text: `試試看 ${["①", "②", "③", "④", "⑤", "⑥"][i]}：在□中填入 >、< 或 =`, visual: () => el("div", { class: "b2-cmp" }, el("span", {}, l), el("span", { class: "b2-cmp__box" }, "□"), el("span", {}, r)),
    steps: [{ type: "choice", label: "", sym: true, options: [">", "<", "="].map(x => ({ label: x, ok: x === s })) }] })),
];

// === 數字鍵盤 ===
function numPad(onSubmit) {
  let val = "";
  const display = el("div", { class: "b2-pad__display" }, "");
  const show = () => { display.textContent = val || " "; };
  const key = (label, fn, cls = "") => { const b = el("button", { class: `b2-pad__key ${cls}` }, label); b.addEventListener("click", fn); return b; };
  const wrap = el("div", { class: "b2-pad" }, display,
    el("div", { class: "b2-pad__keys" },
      ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => key(String(n), () => { if (val.length < 3) { val += n; show(); } })),
      key("⌫", () => { val = val.slice(0, -1); show(); }, "b2-pad__key--soft"),
      key("0", () => { if (val && val.length < 3) { val += "0"; show(); } }),
      key("✓", () => { if (val) onSubmit(Number(val), () => { val = ""; show(); }); }, "b2-pad__key--ok")));
  show();
  wrap.flash = ok => { display.classList.remove("b2-pad__display--ok", "b2-pad__display--bad"); display.classList.add(ok ? "b2-pad__display--ok" : "b2-pad__display--bad"); };
  return wrap;
}

// === 三張卡湊 15 ===
function pick3El(onDone) {
  const chosen = new Set();
  const sumEl = el("div", { class: "b2-pick3__sum" }, "");
  const update = () => { const s = [...chosen].reduce((a, b) => a + b, 0); sumEl.textContent = chosen.size ? `${[...chosen].join(" + ")} = ${s}` : "選 3 張"; };
  const cards = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).map(n => {
    const b = el("button", { class: "b2-card b2-card--btn" }, String(n));
    b.addEventListener("click", () => {
      if (chosen.has(n)) { chosen.delete(n); b.classList.remove("b2-card--on"); }
      else if (chosen.size < 3) { chosen.add(n); b.classList.add("b2-card--on"); }
      update();
      if (chosen.size === 3) {
        const ok = [...chosen].reduce((a, c) => a + c, 0) === 15;
        onDone(ok, () => { chosen.clear(); cards.forEach(c => c.classList.remove("b2-card--on")); update(); });
      }
    });
    return b;
  });
  update();
  return el("div", { class: "b2-pick3" }, el("div", { class: "b2-pick3__grid" }, cards), sumEl);
}

// === 共用播放器 ===
function renderMath2Run(u, title, backHash, againHash, questions) {
  const root = el("div", {});
  const header = renderHeader(title, { back: backHash });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);
  let i = 0, score = 0;
  const wrongTopics = new Set(), wrongPages = [];
  const render = () => {
    if (i >= questions.length) {
      const extra = wrongTopics.size ? el("div", { class: "zh-missed" }, el("div", { class: "zh-missed__title" }, t("要再練的：")),
        [...wrongTopics].map(tp => el("button", { class: "zh-chip", onclick: () => navigate(`#/mathplay/${tp}?u=${u.id}`) }, MATH2_TOPICS[tp].emoji, t(MATH2_TOPICS[tp].name))))
        : wrongPages.length ? el("div", { class: "zh-missed" }, el("div", { class: "zh-missed__title" }, t("第一次沒答對的：")), wrongPages.map(p => el("span", { class: "zh-chip" }, t(`課本第${p}頁`)))) : null;
      app.replaceChildren(renderResultBlock(`答對 ${score} / ${questions.length}`, score === questions.length ? "🌟" : score >= questions.length * 0.7 ? "🎉" : "💪", "再來一次", () => navigate(againHash), extra));
      return;
    }
    const q = questions[i]();
    progressLabel.textContent = `${i + 1}/${questions.length}・${score}分`;
    let step = 0, missed = false;
    const feedback = el("div", { class: "quiz-feedback" });
    const stepWrap = el("div", { class: "b2-step" });
    const card = el("div", { class: "m-card b2-card-q" },
      q.page ? el("div", { class: "m-no" }, t(`課本第${q.page}頁`)) : null,
      el("div", { class: "b2-text" }, t(q.text)),
      el("button", { class: "icon-btn icon-btn--accent m-speak", onclick: () => speakZh(q.text), "aria-label": "念題目" }, "🔊"),
      q.visual || null);
    const fail = () => {
      missed = true; buzzWrong(); if (q.topic) recordMath(q.topic, false);
      feedback.textContent = q.hint ? `再想想：${q.hint}` : "再算一次看看"; feedback.className = "quiz-feedback quiz-feedback--wrong shake";
    };
    const pass = () => {
      dingCorrect(); feedback.textContent = "答對了！🎉"; feedback.className = "quiz-feedback quiz-feedback--correct pop";
      step++;
      if (step >= q.steps.length) {
        if (!missed) score++; else { if (q.topic) wrongTopics.add(q.topic); if (q.page) wrongPages.push(q.page); }
        if (q.topic) recordMath(q.topic, true);
        setTimeout(() => { i++; render(); }, 1100);
      } else setTimeout(showStep, 600);
    };
    const showStep = () => {
      const s = q.steps[step];
      feedback.textContent = ""; feedback.className = "quiz-feedback";
      const label = s.label ? el("div", { class: "b2-step__label" }, t(s.label)) : null;
      if (s.type === "choice") {
        let locked = false;
        stepWrap.replaceChildren(label || "", el("div", { class: `b2-opts ${s.sym ? "b2-opts--sym" : ""}` }, s.options.map(o => {
          const b = el("button", { class: `zh-opt b2-opt ${s.sym ? "b2-opt--sym" : ""}`, "data-nobopo": o.label.length <= 12 && !/[一-鿿]/.test(o.label) ? "1" : null }, /[一-鿿]/.test(o.label) ? t(o.label) : o.label);
          b.addEventListener("click", () => { if (locked) return; if (o.ok) { locked = true; b.classList.add("zh-opt--ok"); pass(); } else { b.classList.add("zh-opt--bad"); b.disabled = true; fail(); } });
          return b;
        })));
      } else if (s.type === "num") {
        const pad = numPad((v, reset) => {
          if (v === s.answer) { pad.flash(true); pass(); } else { pad.flash(false); fail(); setTimeout(reset, 600); }
        });
        stepWrap.replaceChildren(label || "", el("div", { class: "b2-num-row" }, s.unit ? el("span", { class: "b2-unit" }, t(`答：□ ${s.unit}`)) : null), pad);
      } else if (s.type === "pick3") {
        stepWrap.replaceChildren(pick3El((ok, reset) => { if (ok) pass(); else { fail(); setTimeout(reset, 800); } }));
      }
    };
    app.replaceChildren(card, stepWrap, feedback);
    showStep();
    setTimeout(() => speakZh(q.text), 250);
  };
  render();
  return root;
}

// === 單元頁與播放入口（renderMathUnit / renderMathPlay 遇到 kind:"calc" 會轉來這裡）===
function renderMath2Unit(u) {
  const prog = mathProgressOf();
  const root = el("div", {});
  root.appendChild(renderHeader(`${u.emoji} ${u.title}`, { back: "#/" }));
  const app = el("main", { class: "app" });
  const top = el("section", { class: "section" });
  if (u.book) top.append(
    el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => navigate(`#/mathplay/book?u=${u.id}`) }, t(`📗 課本原題（第${u.pages}頁）`)),
    el("div", { class: "progress-note", style: "text-align: center;" }, t("課本上的題目、數字和順序")));
  top.append(
    el("button", { class: `btn btn--full btn--xl ${u.book ? "" : "btn--accent"}`, style: u.book ? "margin-top: 10px;" : "", onclick: () => navigate(`#/mathplay/mix?u=${u.id}`) }, t("📝 小考（隨機 12 題）")),
    el("div", { class: "progress-note", style: "text-align: center;" }, t("每次都不一樣的數字，練熟方法")));
  if (u.note) top.append(el("div", { class: "b2-note" }, t(u.note)));
  app.appendChild(top);
  app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t("🎯 一種一種練")),
    el("div", { class: "mode-grid" }, u.topics.map(tp => {
      const r = prog[tp];
      return el("button", { class: "mode-btn", onclick: () => navigate(`#/mathplay/${tp}?u=${u.id}`) },
        el("span", { class: "mode-btn__emoji" }, MATH2_TOPICS[tp].emoji), t(MATH2_TOPICS[tp].name),
        el("span", { class: "mode-btn__sub" }, t(r ? `答對 ${r.correct} / ${r.seen}` : "還沒練")));
    }))));
  root.appendChild(app);
  return root;
}
function renderMath2Play(topic, u) {
  if (topic === "book" && u.book) return renderMath2Run(u, "📗 課本原題", `#/math/${u.id}`, `#/mathplay/book?u=${u.id}`, u.book.map(b => () => ({ ...b, visual: b.visual ? b.visual() : null })));
  if (topic === "mix") return renderMath2Run(u, "📝 小考", `#/math/${u.id}`, `#/mathplay/mix?u=${u.id}`, Array.from({ length: 12 }, (_, k) => () => MATH2_TOPICS[u.topics[k % u.topics.length]].gen()));
  const tp = MATH2_TOPICS[topic];
  if (!tp) return renderEmpty(`#/math/${u.id}`, "找不到這種題型");
  return renderMath2Run(u, `${tp.emoji} ${tp.name}`, `#/math/${u.id}`, `#/mathplay/${topic}?u=${u.id}`, Array.from({ length: 8 }, () => () => tp.gen()));
}

// 課本原題接到單元上（data-math.js 比這個檔先載入）
(MATH_DATA.g2?.units || []).forEach(u => { if (u.bookId === "u4") u.book = BOOK_U4; });
