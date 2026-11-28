// 二年級數學 第7單元 2、5、4、8的乘法、第8單元 幾時幾分（南一 2上 數學隨堂演練，家長 11/28 拍照）
// 原題：BOOK_DR7（隨堂演練 p.42、43、46、47；p.44、45 沒照片）、BOOK_DR8（p.48～53）；題目、數字、順序照隨堂演練
// 二年級乘法算式的寫法：「每一份的數量 × 份數」（1個盤子放2個，4個盤子 → 2×4），前後寫反算錯（選項會放反過來的當錯的）
// 時鐘 clockSvg(h, m)：照鐘面畫 60 小格、12 個數字，時針會跟著分鐘走（4時35分 時針在 4 和 5 中間）

const SVGNS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}, ...kids) => { const n = document.createElementNS(SVGNS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); kids.forEach(k => k && n.appendChild(k)); return n; };

// === 🕐 時鐘 ===
function clockSvg(h, m, { size = 170, label } = {}) {
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
  parts.push(hand(((h % 12) + m / 60) * 30, 50, 6, "#2a2622"), hand(m * 6, 76, 3.5, "#3d5fc9"), svgEl("circle", { cx: c, cy: c, r: 5, fill: "#2a2622" }));
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

// === 第7單元 原題（隨堂演練 p.42、43、46、47）===
const dr = o => ({ src: "隨堂演練", ...o });
const BOOK_DR7 = [
  dr({ page: 42, text: "2+2+2+2+2+2+2+2 表示有幾個2相加？是2的幾倍？", steps: [nq("有（　）個2相加", 8), nq("是2的（　）倍", 8)], hint: "數一數有幾個2：有幾個2相加，就是2的幾倍" }),
  dr({ page: 42, text: "2的5倍是多少？", steps: [nq("2的5倍是（　）", 10)], hint: "2的5倍＝2×5，念「二五一十」" }),
  dr({ page: 42, text: "2+2+2+2+2+2+2=14，是2的幾倍？用乘法算式記下來。", steps: [nq("是2的（　）倍", 7), nq("（　）× 7 = 14", 2), nq("2 ×（　）= 14", 7), nq("2 × 7 =（　）", 14)], hint: "有7個2相加，就是2的7倍，寫成 2×7" }),
  dr({ page: 42, text: "2+2+2+2+2+2 = 2 ×（　）=（　）", steps: [nq("2 ×（　）", 6), nq("2 × 6 =（　）", 12)], hint: "數一數有幾個2：6個，2×6，念「二六十二」" }),
  dr(mulQ({ page: 42, text: "1個盤子放2個橘子，4個盤子共放幾個橘子？", a: 2, b: 4, unit: "個", visual: () => groupsPic("🍊", 2, 4) })),
  dr(mulQ({ page: 42, text: "下圖共有幾個氣球？", a: 2, b: 3, unit: "個", visual: () => groupsPic("🎈", 2, 3) })),
  dr(mulQ({ page: 42, text: "1隻雞有2隻腳，9隻雞共有幾隻腳？", a: 2, b: 9, unit: "隻" })),
  dr(mulQ({ page: 42, text: "妹妹每天吃2顆糖果，8天共吃了幾顆糖果？", a: 2, b: 8, unit: "顆" })),
  dr(mulQ({ page: 43, text: "用乘法算式算算看：5的5倍", a: 5, b: 5 })),
  dr(mulQ({ page: 43, text: "用乘法算式算算看：有7個5相加", a: 5, b: 7 })),
  dr(mulQ({ page: 43, text: "用乘法算式算算看：5的8倍", a: 5, b: 8 })),
  dr(mulQ({ page: 43, text: "用乘法算式算算看：有3個5相加", a: 5, b: 3 })),
  dr(mulQ({ page: 43, text: "1把尺賣5元，萱萱買2把，共要付幾元？", a: 5, b: 2, unit: "元" })),
  dr(mulQ({ page: 43, text: "1隻手有5根手指頭，4隻手共有幾根手指頭？", a: 5, b: 4, unit: "根", visual: () => groupsPic("🖐️", 1, 4) })),
  dr(mulQ({ page: 43, text: "1組杯子有5個，9組共有幾個杯子？", a: 5, b: 9, unit: "個" })),
  dr(mulQ({ page: 43, text: "1盒香皂有5個，媽媽買6盒，共有幾個香皂？", a: 5, b: 6, unit: "個" })),
  dr({ page: 46, text: "把答案一樣的連起來：「有9個8相加」跟哪一個一樣？", steps: [cq("選一個", "8的9倍", ["5×4", "2×7", "7個4相加"])], hint: "9個8相加＝8的9倍＝8×9" }),
  dr({ page: 46, text: "把答案一樣的連起來：「5+5+5+5」跟哪一個一樣？", steps: [cq("選一個", "5×4", ["2×7", "7個4相加", "8的9倍"])], hint: "4個5相加＝5×4" }),
  dr({ page: 46, text: "把答案一樣的連起來：「2的7倍」跟哪一個一樣？", steps: [cq("選一個", "2×7", ["5×4", "7個4相加", "8的9倍"])], hint: "2的7倍＝2×7" }),
  dr({ page: 46, text: "把答案一樣的連起來：「4×7」跟哪一個一樣？", steps: [cq("選一個", "7個4相加", ["5×4", "2×7", "8的9倍"])], hint: "4×7＝4的7倍＝7個4相加" }),
  dr(mulQ({ page: 46, text: "把4個小朋友分成1組，3組共有幾個小朋友？", a: 4, b: 3, unit: "個" })),
  dr(mulQ({ page: 46, text: "1隻章魚有8隻腳，6隻章魚共有幾隻腳？", a: 8, b: 6, unit: "隻" })),
  dr(mulQ({ page: 46, text: "媽媽買了6包雞蛋糕，每包有5個，媽媽買了幾個雞蛋糕？", a: 5, b: 6, unit: "個" })),
  dr(mulQ({ page: 46, text: "弟弟每天吃2顆泡芙，一星期共吃了幾顆泡芙？（一星期有7天）", a: 2, b: 7, unit: "顆" })),
  dr({ page: 47, text: "5×6 表示有幾個5？是5的幾倍？", steps: [nq("有（　）個5", 6), nq("是5的（　）倍", 6)], hint: "5×6＝6個5相加＝5的6倍" }),
  dr({ page: 47, text: "4×4 比 4×1 多幾個4？多多少？", steps: [nq("多（　）個4", 3), nq("是多（　）", 12)], hint: "4個4比1個4多3個4，3個4是12" }),
  dr({ page: 47, text: "8×4 比 8×5 少幾個8？8×4=32，8×5是多少？", steps: [nq("少（　）個8", 1), nq("8×5 =（　）", 40)], hint: "8×5比8×4多1個8：32＋8＝40" }),
  dr({ page: 47, text: "5+5+5+5=20，是5的幾倍？用乘法算式記下來。", steps: [nq("是5的（　）倍", 4), nq("（　）× 4 = 20", 5), nq("5 ×（　）= 20", 4), nq("5 × 4 =（　）", 20)], hint: "4個5相加＝5×4＝20（哥哥在練習本寫成26，要再算一次）" }),
  dr({ page: 47, text: "把意思一樣的連起來：「8+8+8+8」是哪一個算式？", steps: [cq("選一個", "8×4", ["4×8"])], hint: "4個8相加：每一份是8，有4份 → 8×4" }),
  dr({ page: 47, text: "把意思一樣的連起來：「8個4相加」是哪一個算式？", steps: [cq("選一個", "4×8", ["8×4"])], hint: "每一份是4，有8份 → 4×8" }),
  dr({ page: 47, text: "把意思一樣的連起來：「8的4倍」是哪一個算式？", steps: [cq("選一個", "8×4", ["4×8"])], hint: "8的4倍 → 8×4" }),
  dr({ page: 47, text: "把意思一樣的連起來：「4的8倍」是哪一個算式？", steps: [cq("選一個", "4×8", ["8×4"])], hint: "4的8倍 → 4×8" }),
  dr(mulQ({ page: 47, text: "小軍口袋裡有7個5元，共是幾元？", a: 5, b: 7, unit: "元" })),
  dr(mulQ({ page: 47, text: "二年甲班分組，共分成6組，每組有4個人，二年甲班共有幾個人？", a: 4, b: 6, unit: "個人" })),
];

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

// === 第8單元 原題（隨堂演練 p.48～53）===
const ck = (h, m) => () => clockSvg(h, m);
const BOOK_DR8 = [
  dr({ page: 48, text: "看圖回答問題：鐘面時刻是幾時幾分？分針再走1小格呢？", visual: ck(3, 0), steps: [nq("鐘面是（　）時", 3), nq("（　）分", 0), nq("分針再走1小格，經過（　）分鐘", 1), nq("是（　）時", 3), nq("（　）分", 1)], hint: "分針走1小格是1分鐘" }),
  dr({ page: 48, text: "看圖回答問題：鐘面時刻是幾時幾分？分針再走3小格呢？", visual: ck(5, 5), steps: [nq("鐘面是（　）時", 5), nq("（　）分", 5), nq("分針再走3小格，經過（　）分鐘", 3), nq("是（　）時", 5), nq("（　）分", 8)], hint: "分針指在1是5分；再走3小格是5＋3＝8分" }),
  dr({ page: 48, text: "看圖回答問題：鐘面時刻是幾時幾分？分針再走5小格，寫成數字鐘是 8:15，表示幾時幾分？", visual: ck(8, 10), steps: [nq("鐘面是（　）時", 8), nq("（　）分", 10), nq("8:15 表示（　）時", 8), nq("（　）分", 15)], hint: "分針指在2是10分（一大格5分：5、10）" }),
  dr({ page: 49, text: "分針指在鐘面的數字上，是幾分？（數字1是5分）", visual: ck(12, 5), steps: [nq("數字2是（　）分", 10), nq("數字3是（　）分", 15), nq("數字4是（　）分", 20), nq("數字6是（　）分", 30), nq("數字7是（　）分", 35), nq("數字9是（　）分", 45), nq("數字10是（　）分", 50), nq("數字11是（　）分", 55)], hint: "一大格是5分鐘：5、10、15、20……用五的乘法：數字幾就是5×幾" }),
  dr({ page: 49, text: "看圖填填看：時針指在哪兩個數字中間？分針指在哪裡？是幾時幾分？", visual: ck(4, 35), steps: [nq("時針指在（　）", 4), nq("和（　）之間", 5), nq("分針指在數字（　）", 7), nq("是（　）時", 4), nq("（　）分", 35)], hint: "時針在4和5中間是4時多；分針指在7是5×7＝35分" }),
  dr({ page: 49, text: "看圖填填看：鐘面上是幾時幾分？分針再走2大格是幾時幾分？", visual: ck(8, 20), steps: [nq("鐘面是（　）時", 8), nq("（　）分", 20), nq("再走2大格是（　）時", 8), nq("（　）分", 30)], hint: "1大格是5分鐘，2大格是10分鐘：20＋10＝30分。時針還在8和9中間，所以還是8時（不是6時）" }),
  dr({ page: 50, text: "鐘面上是幾時幾分？", visual: ck(11, 25), steps: [nq("（　）時", 11), nq("（　）分", 25)], hint: "時針在11和12中間是11時多；分針指在5是25分" }),
  dr({ page: 50, text: "鐘面上是幾時幾分？", visual: ck(1, 50), steps: [nq("（　）時", 1), nq("（　）分", 50)], hint: "時針快到2但還沒到，是1時多；分針指在10是50分" }),
  dr({ page: 50, text: "鐘面上是幾時幾分？", visual: ck(2, 45), steps: [nq("（　）時", 2), nq("（　）分", 45)], hint: "時針快到3但還沒到，是2時多；分針指在9是45分" }),
  dr({ page: 50, text: "媽媽想搭火車到外婆家，她到火車站一看，已經快要2時了。哪一個時刻是對的？", visual: () => clockRow([[12, 55, "①"], [1, 55, "②"], [2, 55, "③"]]), steps: [cq("選出正確的時刻", "②", ["①", "③"])], hint: "快要2時：時針快到2但還沒到，分針快到12" }),
  dr({ page: 50, text: "接續上一題，媽媽到外婆家一看，已經超過5時了。哪一個時刻是對的？", visual: () => clockRow([[4, 58, "①"], [4, 5, "②"], [5, 2, "③"]]), steps: [cq("選出正確的時刻", "③", ["①", "②"])], hint: "超過5時：時針剛走過5一點點，分針剛走過12" }),
  dr({ page: 51, text: "上午6時到上午7時，共經過幾小時？", visual: () => clockRow([[6, 0, "上午6時"], [7, 0, "上午7時"]], true), steps: [nq("共經過（　）小時", 1)], hint: "時針走1大格是1小時" }),
  dr({ page: 51, text: "下午4時到下午4點半，共經過幾分鐘？", visual: () => clockRow([[4, 0, "下午4時"], [4, 30, "下午4點半"]], true), steps: [nq("共經過（　）分鐘", 30)], hint: "分針走6大格是30分鐘，也就是半小時" }),
  dr({ page: 51, text: "左圖是小偉的爸爸下班回到家的時刻，1小時後全家開始享用晚餐，開始享用晚餐的時刻是下午幾時幾分？", visual: ck(5, 30), steps: [nq("下午（　）時", 6), nq("（　）分", 30)], hint: "鐘面是5時30分，1小時後時針走1大格：6時30分" }),
  dr({ page: 51, text: "接續上一題，左圖是全家享用完晚餐的時刻，全家聊天休息30分鐘，聊天休息完的時刻是下午幾時幾分？", visual: ck(7, 30), steps: [nq("下午（　）時", 8), nq("（　）分", 0)], hint: "7時30分再過30分鐘，分針走到12，是8時整（8時0分）" }),
  dr({ page: 52, text: "小南和媽媽在星期日上午11時20分出發，30分鐘後到達兒童樂園，他們在上午幾時幾分到達？", visual: ck(11, 20), steps: [nq("上午（　）時", 11), nq("（　）分", 50)], hint: "30分鐘是分針走6大格：20＋30＝50分" }),
  dr({ page: 52, text: "接續上一題，兩人先到戶外遊戲區，從中午12時玩到下午3時，共玩了幾小時？", visual: () => clockRow([[12, 0, "中午12時"], [3, 0, "下午3時"]], true), steps: [nq("共玩了（　）小時", 3)], hint: "時針從12走到3，走了3大格，是3小時" }),
  dr({ page: 52, text: "接續上一題，後來兩人到室內遊戲區玩了1小時，在下午4時20分離開，他們是在下午幾時幾分進到室內遊戲區玩？", visual: ck(4, 20), steps: [nq("下午（　）時", 3), nq("（　）分", 20)], hint: "離開前1小時：時針往回走1大格，4時20分 → 3時20分" }),
  dr({ page: 52, text: "接續上一題，最後兩人在下午4時40分進入飲食部吃點心，共花了1小時才離開，離開時是下午幾時幾分？", visual: ck(4, 40), steps: [nq("下午（　）時", 5), nq("（　）分", 40)], hint: "1小時後：4時40分 → 5時40分" }),
  dr({ page: 53, text: "填填看：鐘面時刻30分鐘前是幾時幾分？2小時後是幾時幾分？", visual: ck(9, 50), steps: [nq("30分鐘前是（　）時", 9), nq("（　）分", 20), nq("2小時後是（　）時", 11), nq("（　）分", 50)], hint: "鐘面是9時50分。30分鐘前：50−30＝20分；2小時後：時針走2大格，11時50分" }),
  dr({ page: 53, text: "看圖填填看：分針再走2小格是幾時幾分？接著分針再走6大格是幾時幾分？", visual: ck(7, 8), steps: [nq("再走2小格是（　）時", 7), nq("（　）分", 10), nq("再走6大格是（　）時", 7), nq("（　）分", 40)], hint: "鐘面是7時8分。2小格＝2分鐘 → 7時10分；6大格＝30分鐘 → 7時40分" }),
  dr({ page: 53, text: "哥哥上午睡過頭，醒來時已經超過8點了。下面哪個時刻是正確的？", visual: () => clockRow([[8, 0, "①"], [7, 57, "②"], [8, 2, "③"]]), steps: [cq("選出正確的時刻", "③", ["①", "②"])], hint: "超過8點：時針剛過8一點點，分針剛過12。①是剛好8點，②是快要8點" }),
];

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
(MATH_DATA.g2?.units || []).forEach(u => { if (u.bookId === "dr7") u.book = BOOK_DR7; if (u.bookId === "dr8") u.book = BOOK_DR8; });
