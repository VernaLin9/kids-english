// 🧱 積木圖解：用圖一步一步看加減法怎麼算（具體→圖像→算式）
// - 10 以內、或一位數加一位數：十格框點點（湊十法、破十法）
// - 兩位數：十條＋小方塊（一條＝10，一個小方塊＝1），進位就是「10 個小方塊換 1 條」，退位就是「1 條拆成 10 個」
// 每一步都有文字＋🔊，自己按「下一步」，不計時
// calc = { op: "add" | "sub", a, b }

const BK_A = "#6b8cff", BK_B = "#ff9f43", BK_NEW = "#4ec9a8";

// 一組積木：tens / ones 是 [{ color, cross, glow }]
function bkGroup(tens, ones, label, cls = "") {
  return el("div", { class: `bk-num ${cls}` },
    el("div", { class: "bk-blocks" },
      el("div", { class: "bk-tens" }, tens.map(r => el("span", { class: `bk-rod ${r.cross ? "bk-x" : ""} ${r.glow ? "bk-glow" : ""}`, style: `--c:${r.color}` }))),
      el("div", { class: "bk-ones" }, ones.map(c => el("span", { class: `bk-cube ${c.cross ? "bk-x" : ""} ${c.glow ? "bk-glow" : ""}`, style: `--c:${c.color}` })))),
    label != null ? el("div", { class: "bk-label", "data-nobopo": "" }, String(label)) : null);
}
const bkN = (n, color, extra = {}) => Array.from({ length: n }, () => ({ color, ...extra }));

// 十格框：dots = [{ color, cross, glow }]，最多 10 個
function bkFrame(dots, label) {
  const cells = Array.from({ length: 10 }, (_, i) => {
    const d = dots[i];
    return el("span", { class: "bk-cell" }, d ? el("span", { class: `bk-dot ${d.cross ? "bk-x" : ""} ${d.glow ? "bk-glow" : ""}`, style: `--c:${d.color}` }) : null);
  });
  return el("div", { class: "bk-num" }, el("div", { class: "bk-frame" }, cells), label != null ? el("div", { class: "bk-label", "data-nobopo": "" }, String(label)) : null);
}
const bkRow = (...kids) => el("div", { class: "bk-row" }, kids.filter(Boolean));
const bkOp = (s) => el("span", { class: "bk-op", "data-nobopo": "" }, s);

// 產生步驟：[{ text, stage: () => Element }]
function blocksSteps({ op, a, b }) {
  const small = op === "add" ? (a <= 9 && b <= 9) || a + b <= 10 : a <= 18 && b <= 9 && a - b <= 9;
  return small ? frameSteps(op, a, b) : baseTenSteps(op, a, b);
}

function frameSteps(op, a, b) {
  if (op === "add") {
    const sum = a + b;
    if (sum <= 10) return [
      { text: `用點點排出 ${a} 和 ${b}`, stage: () => bkRow(bkFrame(bkN(a, BK_A), a), bkOp("+"), bkFrame(bkN(b, BK_B), b)) },
      { text: `把點點放在一起`, stage: () => bkRow(bkFrame([...bkN(a, BK_A), ...bkN(b, BK_B, { glow: true })])) },
      { text: `數一數，一共 ${sum} 個。${a} + ${b} = ${sum}`, stage: () => bkRow(bkFrame([...bkN(a, BK_A), ...bkN(b, BK_B)], sum)) },
    ];
    const give = 10 - a, rest = b - give;
    return [
      { text: `用點點排出 ${a} 和 ${b}`, stage: () => bkRow(bkFrame(bkN(a, BK_A), a), bkOp("+"), bkFrame(bkN(b, BK_B), b)) },
      { text: `${a} 還差 ${give} 個就滿 10。從 ${b} 拿 ${give} 個過去`, stage: () => bkRow(bkFrame([...bkN(a, BK_A), ...bkN(give, BK_B, { glow: true })], 10), bkOp("+"), bkFrame(bkN(rest, BK_B), rest)) },
      { text: `湊成 10 了！10 再加 ${rest}，就是 ${sum}`, stage: () => bkRow(bkFrame([...bkN(a, BK_A), ...bkN(give, BK_B)], 10), bkOp("+"), bkFrame(bkN(rest, BK_B), rest), bkOp("="), el("span", { class: "bk-ans", "data-nobopo": "" }, String(sum))) },
    ];
  }
  const r = a - b;
  if (a <= 10) return [
    { text: `用點點排出 ${a}`, stage: () => bkRow(bkFrame(bkN(a, BK_A), a)) },
    { text: `拿走 ${b} 個`, stage: () => bkRow(bkFrame([...bkN(r, BK_A), ...bkN(b, BK_A, { cross: true })])) },
    { text: `數一數，還剩 ${r} 個。${a} − ${b} = ${r}`, stage: () => bkRow(bkFrame([...bkN(r, BK_A), ...bkN(b, BK_A, { cross: true })], r)) },
  ];
  const ones = a - 10, left = 10 - b;
  return [
    { text: `用點點排出 ${a}：10 和 ${ones}`, stage: () => bkRow(bkFrame(bkN(10, BK_A), 10), bkOp("+"), bkFrame(bkN(ones, BK_A), ones)) },
    { text: `${ones} 個不夠拿 ${b} 個，就從 10 裡面拿走 ${b} 個`, stage: () => bkRow(bkFrame([...bkN(left, BK_A), ...bkN(b, BK_A, { cross: true })], left), bkOp("+"), bkFrame(bkN(ones, BK_A), ones)) },
    { text: `10 拿走 ${b} 剩 ${left}，再加上 ${ones}，就是 ${r}`, stage: () => bkRow(bkFrame([...bkN(left, BK_A), ...bkN(b, BK_A, { cross: true })], left), bkOp("+"), bkFrame(bkN(ones, BK_A), ones), bkOp("="), el("span", { class: "bk-ans", "data-nobopo": "" }, String(r))) },
  ];
}

function baseTenSteps(op, a, b) {
  const a10 = Math.floor(a / 10), a1 = a % 10, b10 = Math.floor(b / 10), b1 = b % 10;
  const legend = el("div", { class: "bk-legend" }, el("span", { class: "bk-rod bk-rod--mini", style: `--c:${BK_A}` }), t("一條是 10"), el("span", { class: "bk-cube", style: `--c:${BK_A}` }), t("一個是 1"));
  if (op === "add") {
    const s1 = a1 + b1, carry = s1 >= 10 ? 1 : 0, s10 = a10 + b10 + carry, sum = a + b;
    const steps = [
      { text: `用積木排出 ${a} 和 ${b}`, stage: () => el("div", {}, legend.cloneNode(true), bkRow(bkGroup(bkN(a10, BK_A), bkN(a1, BK_A), a), bkOp("+"), bkGroup(bkN(b10, BK_B), bkN(b1, BK_B), b))) },
      { text: `先算個位（小方塊）：${a1} + ${b1} = ${s1}`, stage: () => bkRow(bkGroup([...bkN(a10, BK_A), ...bkN(b10, BK_B)], [...bkN(a1, BK_A, { glow: true }), ...bkN(b1, BK_B, { glow: true })], null, "bk-num--ones")) },
    ];
    if (carry) steps.push({ text: `小方塊有 ${s1} 個，滿 10 了！10 個小方塊換成 1 條，個位剩 ${s1 - 10}`, stage: () => bkRow(bkGroup([...bkN(a10, BK_A), ...bkN(b10, BK_B), { color: BK_NEW, glow: true }], [...bkN(Math.max(0, a1 - 10), BK_A), ...bkN(s1 - 10, BK_B)], null)) });
    steps.push({ text: carry ? `再算十位（長條）：${a10} + ${b10} + 換來的 1 = ${s10}` : `再算十位（長條）：${a10} + ${b10} = ${s10}`,
      stage: () => bkRow(bkGroup([...bkN(a10, BK_A, { glow: true }), ...bkN(b10, BK_B, { glow: true }), ...(carry ? [{ color: BK_NEW, glow: true }] : [])], [...bkN(carry ? 0 : a1, BK_A), ...bkN(carry ? s1 - 10 : b1, BK_B)], null)) });
    steps.push({ text: `${s10} 條和 ${s1 % 10} 個，就是 ${sum}。${a} + ${b} = ${sum}`, stage: () => bkRow(bkGroup(bkN(s10, BK_A), bkN(s1 % 10, BK_A), sum)) });
    return steps;
  }
  const r = a - b, borrow = a1 < b1;
  const t10 = borrow ? a10 - 1 : a10, t1 = borrow ? a1 + 10 : a1;
  const steps = [{ text: `用積木排出 ${a}`, stage: () => el("div", {}, legend.cloneNode(true), bkRow(bkGroup(bkN(a10, BK_A), bkN(a1, BK_A), a))) }];
  if (borrow) {
    steps.push({ text: `個位只有 ${a1} 個，要拿走 ${b1} 個，不夠拿！`, stage: () => bkRow(bkGroup(bkN(a10, BK_A), bkN(a1, BK_A, { glow: true }), null)) });
    steps.push({ text: `把 1 條拆開，變成 10 個小方塊。現在個位有 ${t1} 個`, stage: () => bkRow(bkGroup(bkN(t10, BK_A), [...bkN(a1, BK_A), ...bkN(10, BK_NEW, { glow: true })], null)) });
  }
  const onesAfter = [...bkN(borrow ? a1 : 0, BK_A), ...bkN(borrow ? 10 : a1, borrow ? BK_NEW : BK_A)];
  const crossOnes = arr => arr.map((c, i) => i >= arr.length - b1 ? { ...c, cross: true } : c);
  steps.push({ text: `個位拿走 ${b1} 個：${t1} − ${b1} = ${t1 - b1}`, stage: () => bkRow(bkGroup(bkN(t10, BK_A), crossOnes(onesAfter), null)) });
  steps.push({ text: `十位拿走 ${b10} 條：${t10} − ${b10} = ${t10 - b10}`, stage: () => bkRow(bkGroup([...bkN(t10 - b10, BK_A), ...bkN(b10, BK_A, { cross: true })], crossOnes(onesAfter), null)) });
  steps.push({ text: `剩下 ${t10 - b10} 條和 ${t1 - b1} 個，就是 ${r}。檢查：${r} + ${b} = ${a}`, stage: () => bkRow(bkGroup(bkN(t10 - b10, BK_A), bkN(t1 - b1, BK_A), r)) });
  return steps;
}

// 步驟播放器（可以放在任何地方）；最後一步按「我懂了」呼叫 onDone
function blocksTeachEl(calc, onDone) {
  const steps = blocksSteps(calc);
  let k = 0;
  const title = el("div", { class: "bk-title", "data-nobopo": "" }, `${calc.a} ${calc.op === "add" ? "+" : "−"} ${calc.b} = ?`);
  const stage = el("div", { class: "bk-stage" });
  const text = el("div", { class: "l-say__text bk-text" });
  const dots = el("div", { class: "bk-dots" });
  const prev = el("button", { class: "btn btn--ghost bk-nav" }, t("◀ 上一步"));
  const next = el("button", { class: "btn btn--accent bk-nav" });
  const say = () => speakZh(sayable(steps[k].text));
  const show = () => {
    stage.replaceChildren(steps[k].stage());
    text.replaceChildren(t(`${k + 1}. ${steps[k].text}`));
    dots.replaceChildren(...steps.map((_, i) => el("span", { class: `bk-dotnav ${i === k ? "bk-dotnav--on" : ""}` })));
    prev.disabled = k === 0;
    next.replaceChildren(t(k === steps.length - 1 ? "我懂了 👍" : "下一步 ▶"));
    say();
  };
  prev.addEventListener("click", () => { if (k > 0) { k--; show(); } });
  next.addEventListener("click", () => { if (k < steps.length - 1) { k++; show(); } else onDone?.(); });
  const wrap = el("div", { class: "bk" }, title, stage, el("div", { class: "l-say bk-say" }, text, sayBtn(say)), dots, el("div", { class: "bk-navrow" }, prev, next));
  show();
  return wrap;
}
// 跳出來看（題目旁邊的「🧱 用積木看」）
function openBlocksTeach(calc, onClose) {
  const ov = el("div", { class: "g-teach bk-overlay" });
  const close = () => { ov.remove(); onClose?.(); };
  ov.append(el("div", { class: "g-teach__panel" },
    el("div", { class: "g-teach__head" }, t("🧱 用積木一步一步看")),
    blocksTeachEl(calc, close),
    el("button", { class: "btn btn--ghost btn--full", onclick: close }, t("關掉"))));
  document.body.appendChild(ov);
}
