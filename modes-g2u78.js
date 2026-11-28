// 二年級數學 第7單元 2、5、4、8的乘法、第8單元 幾時幾分（南一 2上 數學隨堂演練，家長 11/28 拍照）
// 原題卷：FILL_SHEETS.m7（隨堂演練 p.42、43、46、47；p.44、45 沒照片）、FILL_SHEETS.m8（p.48～53）——版面、題目、( ) 的位置照隨堂演練（家長：樣式要跟課本一樣，不然會搞混）
// 二年級乘法算式的寫法：「每一份的數量 × 份數」（1個盤子放2個，4個盤子 → 2×4），前後寫反算錯（選項會放反過來的當錯的）
// 時鐘 clockSvg(h, m)：照鐘面畫 60 小格、12 個數字，時針會跟著分鐘走（4時35分 時針在 4 和 5 中間）

const SVGNS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}, ...kids) => { const n = document.createElementNS(SVGNS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); kids.forEach(k => k && n.appendChild(k)); return n; };

// === 🕐 時鐘 ===
function clockSvg(h, m, { size = 170, label, hands = true } = {}) {
  const c = 100, R = 92;
  const parts = [svgEl("circle", { cx: c, cy: c, r: R + 5, fill: "#e9e4dc" }), svgEl("circle", { cx: c, cy: c, r: R, fill: "#fff", stroke: "#8a8178", "stroke-width": 2 })];
  for (let i = 0; i < 60; i++) {
    const a = i * 6 * Math.PI / 180, big = i % 5 === 0, r1 = big ? R - 11 : R - 6;
    parts.push(svgEl("line", { x1: c + Math.sin(a) * r1, y1: c - Math.cos(a) * r1, x2: c + Math.sin(a) * (R - 1), y2: c - Math.cos(a) * (R - 1), stroke: "#4a443e", "stroke-width": big ? 2.4 : 1 }));
  }
  for (let n = 1; n <= 12; n++) {
    const a = n * 30 * Math.PI / 180, r = R - 24;
    const tx = svgEl("text", { x: c + Math.sin(a) * r, y: c - Math.cos(a) * r + 6, "text-anchor": "middle", "font-size": 17, "font-weight": 700, fill: "#2a2622" }); tx.textContent = n; parts.push(tx);
  }
  const hand = (deg, len, w, color) => { const a = deg * Math.PI / 180, x = c + Math.sin(a) * len, y = c - Math.cos(a) * len;
    const ax = c + Math.sin(a) * (len - 10), ay = c - Math.cos(a) * (len - 10), px = Math.cos(a) * 5, py = Math.sin(a) * 5;
    return svgEl("g", {}, svgEl("line", { x1: c, y1: c, x2: ax, y2: ay, stroke: color, "stroke-width": w, "stroke-linecap": "round" }), svgEl("polygon", { points: `${x},${y} ${ax + px},${ay + py} ${ax - px},${ay - py}`, fill: color })); };
  if (hands) parts.push(hand(((h % 12) + m / 60) * 30, 50, 6, "#2a2622"), hand(m * 6, 76, 3.5, "#3d5fc9"));
  parts.push(svgEl("circle", { cx: c, cy: c, r: 5, fill: "#2a2622" }));
  const svg = svgEl("svg", { viewBox: "0 0 200 200", width: size, height: size, class: "ck", role: "img", "aria-label": "時鐘" }, ...parts);
  return label ? el("div", { class: "ck-wrap" }, el("div", { class: "ck-label" }, t(label)), svg) : svg;
}
const clockRow = (list, arrows) => el("div", { class: "ck-row" }, list.map(([h, m, lb], i) => [i && arrows ? el("span", { class: "ck-arrow" }, "→") : null, clockSvg(h, m, { size: list.length > 2 ? 120 : 140, label: lb })]).flat());
const pad2 = n => String(n).padStart(2, "0");

// === 題目產生小工具 ===
const nq = (label, answer, unit) => ({ type: "num", label, answer, unit });
const cq = (label, right, wrong) => ({ type: "choice", label, options: shuffle([{ label: right, ok: true }, ...wrong.filter(w => w !== right).map(w => ({ label: w, ok: false }))]) });
// 乘法應用題：先選算式（每一份 × 份數），再算答案
function mulQ({ page, text, a, b, unit, visual, topic, src = "隨堂演練" }) {
  const wrong = [a !== b ? `${b} × ${a}` : null, `${a} + ${b}`].filter(Boolean);
  return { page, src, topic, text, visual, calc: null,
    steps: [cq("① 要用哪一個乘法算式？", `${a} × ${b}`, wrong), nq(`② ${a} × ${b} = ?`, a * b, unit)],
    hint: `每一份有${a}，有${b}份 → 寫成 ${a} × ${b}（每一份的數量寫在前面）。可以念${typeof ttLine === "function" ? `「${ttLine(a, b)}」` : "乘法表"}` };
}
const groupsPic = (emoji, a, b) => el("div", { class: "mul-groups", "data-nobopo": "" }, Array.from({ length: b }, () => el("span", { class: "mul-groups__g" }, emoji.repeat(a))));

// === 第7單元 練習題型（2、5、4、8）===
const MUL_A = [2, 5, 4, 8];
function genMul2548() { const a = pick2(MUL_A), b = r2(1, 9); const q = typeof genTimes === "function" ? genTimes(a, b) : { text: `${a} × ${b} = ?`, steps: [nq(`${a} × ${b} = ?`, a * b)] }; return { ...q, topic: "mul2548" }; }
function genMulMeaning() {
  const a = pick2(MUL_A), b = r2(2, 9), k = r2(0, 2);
  if (k === 0) return { topic: "mulMeaning", text: `${Array(b).fill(a).join("+")} 是${a}的幾倍？用乘法算式記下來。`,
    steps: [nq(`是${a}的（　）倍`, b), cq("乘法算式是哪一個？", `${a} × ${b}`, [`${b} × ${a}`, `${a} + ${b}`]), nq(`${a} × ${b} =（　）`, a * b)], hint: `數一數有幾個${a}：${b}個，就是${a}×${b}` };
  if (k === 1) return { topic: "mulMeaning", text: `「${b}個${a}相加」是哪一個乘法算式？`, steps: [cq("選一個", `${a} × ${b}`, [`${b} × ${a}`, `${a} + ${b}`]), nq(`${a} × ${b} =（　）`, a * b)], hint: `每一份是${a}，有${b}份 → ${a}×${b}` };
  return { topic: "mulMeaning", text: `「${a}的${b}倍」是多少？`, steps: [cq("乘法算式是哪一個？", `${a} × ${b}`, [`${b} × ${a}`, `${a} + ${b}`]), nq(`${a} × ${b} =（　）`, a * b)], hint: `${a}的${b}倍 → ${a}×${b}` };
}
const MUL_WORD = [
  [2, (b) => `1雙筷子有2枝，${b}雙共有幾枝筷子？`, "枝"], [2, (b) => `1輛腳踏車有2個輪子，${b}輛共有幾個輪子？`, "個"],
  [5, (b) => `1包糖果有5顆，${b}包共有幾顆？`, "顆"], [5, (b) => `1枝筆賣5元，買${b}枝要付幾元？`, "元"],
  [4, (b) => `1隻小狗有4隻腳，${b}隻小狗共有幾隻腳？`, "隻"], [4, (b) => `1張桌子坐4個人，${b}張桌子可以坐幾個人？`, "個人"],
  [8, (b) => `1隻章魚有8隻腳，${b}隻章魚共有幾隻腳？`, "隻"], [8, (b) => `1盒蠟筆有8枝，${b}盒共有幾枝蠟筆？`, "枝"],
];
function genMulWord() { const [a, f, unit] = pick2(MUL_WORD), b = r2(2, 9); return mulQ({ text: f(b), a, b, unit, topic: "mulWord", src: null }); }

// === 第8單元 練習題型 ===
function genClockRead() {
  const h = r2(1, 12), m = Math.random() < 0.6 ? r2(0, 11) * 5 : r2(0, 59);
  return { topic: "clockRead", text: "鐘面上是幾時幾分？", visual: clockSvg(h, m), steps: [nq("（　）時", h), nq("（　）分", m)],
    hint: `時針在${h}和${h % 12 + 1}中間（或剛好指在${h}），是${h}時多；分針一大格5分、一小格1分` };
}
function genClockAfter() {
  const h = r2(1, 12), big = Math.random() < 0.5, n = big ? r2(1, 6) : r2(1, 9), add = big ? n * 5 : n;
  const m = r2(0, Math.floor((59 - add) / 5)) * 5, m2 = m + add;
  return { topic: "clockAfter", text: `鐘面上是幾時幾分？分針再走${n}${big ? "大格" : "小格"}是幾時幾分？`, visual: clockSvg(h, m),
    steps: [nq("鐘面是（　）時", h), nq("（　）分", m), nq(`再走${n}${big ? "大格" : "小格"}是（　）時`, h), nq("（　）分", m2)],
    hint: `${big ? "1大格是5分鐘" : "1小格是1分鐘"}：${m}＋${add}＝${m2}分；分針沒有走過12，時針還在同一格，還是${h}時` };
}
function genClockHours() {
  const h = r2(1, 11), m = r2(0, 11) * 5, n = r2(1, 4), before = Math.random() < 0.4;
  const h2 = before ? ((h - n - 1 + 120) % 12) + 1 : ((h + n - 1) % 12) + 1;
  return { topic: "clockHours", text: `鐘面上是${h}時${m}分，${n}小時${before ? "前" : "後"}是幾時幾分？`, visual: clockSvg(h, m),
    steps: [nq("（　）時", h2), nq("（　）分", m)], hint: `${n}小時${before ? "前：時針往回" : "後：時針往前"}走${n}大格，分針轉${n}圈回到原來的地方，分不變` };
}
function genClockAbout() {
  const N = r2(2, 12), over = Math.random() < 0.5, prev = N === 1 ? 12 : N - 1, next = N % 12 + 1;
  const right = over ? [N, r2(1, 3)] : [prev, r2(56, 58)];
  const wrong = over ? [[prev, r2(56, 58)], [N, 0]] : [[N, r2(1, 3)], [N, 0]];
  wrong.push(over ? [next === 1 ? 12 : next - 1, 30] : [prev, 30]);
  const opts = shuffle([right, ...wrong.slice(0, 2)]), marks = ["①", "②", "③"], ri = opts.indexOf(right);
  return { topic: "clockAbout", text: `已經${over ? "超過" : "快要"}${N}時了，哪一個時刻是對的？`, visual: clockRow(opts.map((o, i) => [o[0], o[1], marks[i]])),
    steps: [cq("選出正確的時刻", marks[ri], marks.filter((_, i) => i !== ri))],
    hint: over ? `超過${N}時：時針剛過${N}一點點，分針剛過12` : `快要${N}時：時針快到${N}還沒到，分針快到12` };
}

if (typeof MATH2_TOPICS !== "undefined") Object.assign(MATH2_TOPICS, {
  mul2548: { emoji: "✖️", name: "2、5、4、8的乘法", gen: genMul2548 },
  mulMeaning: { emoji: "➕", name: "幾個幾相加・幾倍", gen: genMulMeaning },
  mulWord: { emoji: "📖", name: "乘法應用題", gen: genMulWord },
  clockRead: { emoji: "🕐", name: "幾時幾分", gen: genClockRead },
  clockAfter: { emoji: "⏩", name: "分針再走幾格", gen: genClockAfter },
  clockHours: { emoji: "⏳", name: "幾小時前後", gen: genClockHours },
  clockAbout: { emoji: "🔔", name: "快要／超過幾時", gen: genClockAbout },
});

// === 📄 原題卷（版面照隨堂演練：題目句子裡直接有 ( )，算式和「答：」分兩行）===
// 乘法算式照原書寫法「每一份 × 份數」，前後寫反算錯
const mulLines = (a, b, unit) => [[{ b: a }, "×", { b }, "=", { b: a * b }], ["答：", { b: a * b }, unit]];
const mulItem = (n, text, a, b, unit, pic) => ({ n, text, pic, lines: mulLines(a, b, unit) });
const ckp = (h, m) => () => clockSvg(h, m, { size: 150 });
const ckRowP = (list, arrows) => () => clockRow(list, arrows);
FILL_SHEETS.m7 = {
  title: "7　2、5、4、8的乘法", sub: "南一版 2上 數學隨堂演練 第42、43、46、47頁", pages: "第42、43、46、47頁", book: "隨堂演練", unitWord: "格", bigPad: true, percent: true,
  howto: "點(　)或□寫數字；□裡要寫符號的點一下換＋−×；算式照書上寫法：每一份的數量 × 份數（1個盤子2個，4個盤子 → 2×4）；連連看先點左邊再點右邊",
  sections: [
    { no: "1", instr: "題型一　2的乘法　①填填看。", pts: 1, kind: "g2", items: [
      { n: 1, lines: [["2+2+2+2+2+2+2+2 表示有", { a: 8 }, "個2相加，是2的", { a: 8 }, "倍。"]] },
      { n: 2, lines: [["2的5倍是", { a: 10 }, "。"]] },
      { n: 3, lines: [["2+2+2+2+2+2+2=14，是2的", { a: 7 }, "倍，"], ["用乘法算式記作", { a: 2 }, { o: "×" }, { a: 7 }, "=", { a: 14 }, "。"]] },
      { n: 4, lines: [["2+2+2+2+2+2=2×", { a: 6 }, "=", { a: 12 }]] },
    ] },
    { no: "2", instr: "題型一　②把做法用乘法算式記下來。", pts: 1, kind: "g2", items: [
      mulItem(1, "1個盤子放2個橘子，4個盤子共放幾個橘子？", 2, 4, "個"),
      mulItem(2, "下圖共有幾個氣球？", 2, 3, "個", "🎈🎈　🎈🎈　🎈🎈"),
      mulItem(3, "1隻雞有2隻腳，9隻雞共有幾隻腳？", 2, 9, "隻"),
      mulItem(4, "妹妹每天吃2顆糖果，8天共吃了幾顆糖果？", 2, 8, "顆"),
    ] },
    { no: "3", instr: "題型二　5的乘法　①用乘法算式算算看。", pts: 1, kind: "g2", items: [
      { n: 1, text: "5的5倍", lines: [[{ b: 5 }, "×", { b: 5 }, "=", { b: 25 }]] },
      { n: 2, text: "有7個5相加", lines: [[{ b: 5 }, "×", { b: 7 }, "=", { b: 35 }]] },
      { n: 3, text: "5的8倍", lines: [[{ b: 5 }, "×", { b: 8 }, "=", { b: 40 }]] },
      { n: 4, text: "有3個5相加", lines: [[{ b: 5 }, "×", { b: 3 }, "=", { b: 15 }]] },
    ] },
    { no: "4", instr: "題型二　②把做法用乘法算式記下來。", pts: 1, kind: "g2", items: [
      mulItem(1, "1把尺賣5元，萱萱買2把，共要付幾元？", 5, 2, "元"),
      mulItem(2, "1隻手有5根手指頭，4隻手共有幾根手指頭？", 5, 4, "根"),
      mulItem(3, "1組杯子有5個，9組共有幾個杯子？", 5, 9, "個"),
      mulItem(4, "1盒香皂有5個，媽媽買6盒，共有幾個香皂？", 5, 6, "個"),
    ] },
    { no: "5", instr: "題型五　乘法的應用　①把答案一樣的連起來。", pts: 1, kind: "match3", text: true, noNum: true, hint: "先點左邊，再點右邊，就會連一條線",
      labels: ["ㄅ. 5×4", "ㄆ. 2×7", "ㄇ. 7個4相加", "ㄈ. 8的9倍"],
      left: [["① 有9個8相加", 3], ["② 5+5+5+5", 0], ["③ 2的7倍", 1], ["④ 4×7", 2]], right: [] },
    { no: "6", instr: "題型五　②把做法用乘法算式記下來。", pts: 1, kind: "g2", items: [
      mulItem(1, "把4個小朋友分成1組，3組共有幾個小朋友？", 4, 3, "個"),
      mulItem(2, "1隻章魚有8隻腳，6隻章魚共有幾隻腳？", 8, 6, "隻"),
      mulItem(3, "媽媽買了6包雞蛋糕，每包有5個，媽媽買了幾個雞蛋糕？", 5, 6, "個"),
      mulItem(4, "弟弟每天吃2顆泡芙，一星期共吃了幾顆泡芙？", 2, 7, "顆"),
    ] },
    { no: "7", instr: "進階挑戰題　①填填看。", pts: 1, kind: "g2", items: [
      { n: 1, lines: [["5×6表示有", { a: 6 }, "個5，是5的", { a: 6 }, "倍。"]] },
      { n: 2, lines: [["4×4比4×1多", { a: 3 }, "個4，是多", { a: 12 }, "。"]] },
      { n: 3, lines: [["8×4比8×5少", { a: 1 }, "個8，8×4=32，"], ["8×5=", { a: 40 }, "。"]] },
      { n: 4, lines: [["5+5+5+5=20，是5的", { a: 4 }, "倍，"], ["用乘法算式記作", { a: 5 }, "×", { a: 4 }, "=", { a: 20 }, "。"]] },
    ] },
    { no: "8", instr: "進階挑戰題　②把意思一樣的連起來。", pts: 1, kind: "match3", text: true, noNum: true, hint: "先點旁邊的，再點中間的算式，就會連一條線",
      labels: ["① 4×8", "② 8×4"], left: [["ㄅ. 8+8+8+8", 1], ["ㄆ. 8個4相加", 0]], right: [["ㄇ. 8的4倍", 1], ["ㄈ. 4的8倍", 0]] },
    { no: "9", instr: "進階挑戰題　③把做法用乘法算式記下來。", pts: 1, kind: "g2", items: [
      mulItem(1, "小軍口袋裡有7個5元，共是幾元？", 5, 7, "元"),
      mulItem(2, "二年甲班分組，共分成6組，每組有4個人，二年甲班共有幾個人？", 4, 6, "個人"),
    ] },
  ],
};
FILL_SHEETS.m8 = {
  title: "8　幾時幾分", sub: "南一版 2上 數學隨堂演練 第48～53頁", pages: "第48～53頁", book: "隨堂演練", unitWord: "格", bigPad: true, percent: true,
  howto: "點(　)或□寫數字；要打✓的點□或(　)",
  sections: [
    { no: "1", instr: "題型一　幾時幾分（1小格一數）　看圖回答問題。", pts: 1, kind: "g2", items: [
      { n: 1, pic: ckp(3, 0), lines: [["① 鐘面時刻是", { a: 3 }, "時", { a: 0 }, "分。"], ["② 接續①，分針再走1小格，是經過", { a: 1 }, "分鐘，"], ["是", { a: 3 }, "時", { a: 1 }, "分。"]] },
      { n: 2, pic: ckp(5, 5), lines: [["① 鐘面時刻是", { a: 5 }, "時", { a: 5 }, "分。"], ["② 接續①，分針再走3小格，是經過", { a: 3 }, "分鐘，"], ["是", { a: 5 }, "時", { a: 8 }, "分。"]] },
      { n: 3, pic: ckp(8, 10), lines: [["① 鐘面時刻是", { a: 8 }, "時", { a: 10 }, "分。"], ["② 接續①，分針再走5小格，寫成數字鐘是 8:15，"], ["表示", { a: 8 }, "時", { a: 15 }, "分。"]] },
    ] },
    { no: "2", instr: "題型二　幾時幾分（1大格一數）　①在□中填入正確的分鐘數字。", pts: 1, kind: "g2", items: [
      { n: 1, dial: [{ num: 1, given: 5 }, { num: 2, a: 10 }, { num: 3, a: 15 }, { num: 4, a: 20 }, { num: 6, a: 30 }, { num: 7, a: 35 }, { num: 9, a: 45 }, { num: 10, a: 50 }, { num: 11, a: 55 }] },
    ] },
    { no: "3", instr: "題型二　②看圖填填看。", pts: 1, kind: "g2", items: [
      { n: 1, pic: ckp(4, 35), lines: [["時針指在", { a: 4 }, "和", { a: 5 }, "之間，"], ["分針指在", { a: 7 }, "，"], ["是", { a: 4 }, "時", { a: 35 }, "分。"]] },
      { n: 2, pic: ckp(8, 20), lines: [["鐘面上是", { a: 8 }, "時", { a: 20 }, "分，"], ["分針再走2大格是", { a: 8 }, "時", { a: 30 }, "分。"]] },
    ] },
    { no: "4", instr: "題型三　幾時幾分和大約幾點鐘　①鐘面上是幾時幾分？", pts: 1, kind: "g2", items: [
      { n: 1, pic: ckp(11, 25), lines: [[{ b: 11 }, "時", { b: 25 }, "分"]] },
      { n: 2, pic: ckp(1, 50), lines: [[{ b: 1 }, "時", { b: 50 }, "分"]] },
      { n: 3, pic: ckp(2, 45), lines: [[{ b: 2 }, "時", { b: 45 }, "分"]] },
    ] },
    { no: "5", instr: "題型三　②選出正確的時刻，並在□中打✓。", pts: 1, kind: "g2", items: [
      { n: 1, text: "媽媽想搭火車到外婆家，她到火車站一看，已經快要2時了。", pick: { clocks: [[12, 55], [1, 55], [2, 55]], a: 1 } },
      { n: 2, text: "接續(1)，媽媽到外婆家一看，已經超過5時了。", pick: { clocks: [[4, 58], [4, 5], [5, 2]], a: 2 } },
    ] },
    { no: "6", instr: "題型四　點數經過的時間(1)　①看圖填填看。", pts: 1, kind: "g2", items: [
      { n: 1, pic: ckRowP([[6, 0, "上午6時"], [7, 0, "上午7時"]], true), lines: [["共經過", { a: 1 }, "小時"]] },
      { n: 2, pic: ckRowP([[4, 0, "下午4時"], [4, 30, "下午4點半"]], true), lines: [["共經過", { a: 30 }, "分鐘"]] },
    ] },
    { no: "7", instr: "題型四　②讀一讀，填一填。", pts: 1, kind: "g2", items: [
      { n: 1, pic: ckp(5, 30), lines: [["左圖是小偉的爸爸下班回到家的時刻，1小時後全家開始享用晚餐，開始享用晚餐的時刻是下午", { a: 6 }, "時", { a: 30 }, "分。"]] },
      { n: 2, pic: ckp(7, 30), lines: [["接續(1)，左圖是全家享用完晚餐的時刻，全家聊天休息30分鐘，聊天休息完的時刻是下午", { a: 8 }, "時", { a: 0 }, "分。"]] },
    ] },
    { no: "8", instr: "題型五　點數經過的時間(2)　看圖填填看。", pts: 1, kind: "g2", items: [
      { n: 1, pic: ckp(11, 20), lines: [["小南和媽媽在星期日上午11時20分出發，30分鐘後到達兒童樂園，他們在上午", { a: 11 }, "時", { a: 50 }, "分到達兒童樂園。"]] },
      { n: 2, pic: ckRowP([[12, 0], [3, 0]], true), lines: [["接續(1)，兩人先到戶外遊戲區，從中午12時玩到下午3時，共玩了", { a: 3 }, "小時。"]] },
      { n: 3, pic: ckp(4, 20), lines: [["接續(2)，後來兩人到室內遊戲區玩了1小時，在下午4時20分離開，他們是在下午", { a: 3 }, "時", { a: 20 }, "分進到室內遊戲區玩。"]] },
      { n: 4, pic: ckp(4, 40), lines: [["接續(3)，最後兩人在下午4時40分進入飲食部吃點心，共花了1小時才離開，離開時是下午", { a: 5 }, "時", { a: 40 }, "分。"]] },
    ] },
    { no: "9", instr: "進階挑戰題　①填填看。", pts: 1, kind: "g2", items: [
      { n: 1, pic: ckp(9, 50), lines: [["30分鐘前：", { a: 9 }, "時", { a: 20 }, "分"], ["2小時後：", { a: 11 }, "時", { a: 50 }, "分"]] },
    ] },
    { no: "10", instr: "進階挑戰題　②看圖填填看。", pts: 1, kind: "g2", items: [
      { n: 1, pic: ckp(7, 8), lines: [["(1) 分針再走2小格，是", { a: 7 }, "時", { a: 10 }, "分。"], ["(2) 接續(1)，分針再走6大格，是", { a: 7 }, "時", { a: 40 }, "分。"]] },
    ] },
    { no: "11", instr: "進階挑戰題　③哥哥上午睡過頭，醒來時已經超過8點了。下面哪個時刻是正確的？在(　)裡打✓。", pts: 1, kind: "g2", items: [
      { n: 1, pick: { clocks: [[8, 0], [7, 57], [8, 2]], a: 2, mark: "paren" } },
    ] },
  ],
};
