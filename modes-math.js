// === 數學複習（一年級：比長短、高矮、厚薄）===
// 題目用 SVG 隨機畫，點圖作答；進度存在 profile.mathProgress（跟英文、國語分開）

const SVG_NS = "http://www.w3.org/2000/svg";
function svg(tag, attrs = {}, ...children) {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  children.flat().forEach(c => c != null && n.appendChild(c));
  return n;
}
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[rnd(0, arr.length - 1)];
const M_COLORS = [["#ff6fa3", "紅色"], ["#6b8cff", "藍色"], ["#4ec9a8", "綠色"], ["#ffb020", "黃色"], ["#b388ff", "紫色"]];

const mathUnit = (id) => MATH?.units.find(u => u.id === id);
const mathProgressOf = (p = getProfile()) => (p ? (p.mathProgress = p.mathProgress || {}) : {});
function recordMath(topic, hit) {
  const p = getProfile(); if (!p) return;
  const prog = mathProgressOf(p);
  const r = prog[topic] || { seen: 0, correct: 0, wrong: 0 };
  r.seen++;
  if (hit) { r.correct++; p.stars = (p.stars || 0) + 1; } else r.wrong++;
  prog[topic] = r;
  saveStore();
}

// === 畫東西（都回傳 <g>，並附上 bbox 給點擊區用）===
function drawPencil(x, y, len, color) {
  const h = 22;
  const g = svg("g", {},
    svg("rect", { x, y, width: Math.max(len - 24, 10), height: h, rx: 4, fill: color }),
    svg("rect", { x, y, width: 18, height: h, rx: 4, fill: "#ffd1d1" }),
    svg("polygon", { points: `${x + len - 24},${y} ${x + len},${y + h / 2} ${x + len - 24},${y + h}`, fill: "#f3d9b1" }),
    svg("polygon", { points: `${x + len - 8},${y + h / 2 - 4} ${x + len},${y + h / 2} ${x + len - 8},${y + h / 2 + 4}`, fill: "#3b3a4a" }));
  g.bbox = { x: x - 6, y: y - 10, w: len + 12, h: h + 20 };
  return g;
}
function drawTree(x, baseY, h, color) {
  const g = svg("g", {},
    svg("rect", { x: x - 8, y: baseY - h * 0.45, width: 16, height: h * 0.45, rx: 4, fill: "#b07a4a" }),
    svg("ellipse", { cx: x, cy: baseY - h * 0.65, rx: 34, ry: h * 0.36, fill: color }));
  g.bbox = { x: x - 44, y: baseY - h - 8, w: 88, h: h + 12 };
  return g;
}
function drawBottle(x, baseY, h, color) {
  const g = svg("g", {},
    svg("rect", { x: x - 10, y: baseY - h, width: 20, height: h * 0.25, rx: 4, fill: "#ddd" }),
    svg("rect", { x: x - 26, y: baseY - h * 0.78, width: 52, height: h * 0.78, rx: 10, fill: color }));
  g.bbox = { x: x - 36, y: baseY - h - 8, w: 72, h: h + 12 };
  return g;
}
function drawTower(x, baseY, h, color) {
  const g = svg("g", {},
    svg("rect", { x: x - 22, y: baseY - h * 0.75, width: 44, height: h * 0.75, rx: 4, fill: color }),
    svg("polygon", { points: `${x - 28},${baseY - h * 0.75} ${x},${baseY - h} ${x + 28},${baseY - h * 0.75}`, fill: "#ff6fa3" }),
    svg("rect", { x: x - 6, y: baseY - h * 0.5, width: 12, height: 18, fill: "#fff" }));
  g.bbox = { x: x - 34, y: baseY - h - 8, w: 68, h: h + 12 };
  return g;
}
function drawBook(x, baseY, thick, color, w = 110) {
  const d = 18; // 立體深度
  const g = svg("g", {},
    svg("polygon", { points: `${x},${baseY - thick} ${x + d},${baseY - thick - d * 0.6} ${x + w + d},${baseY - thick - d * 0.6} ${x + w},${baseY - thick}`, fill: color, opacity: 0.85 }),
    svg("polygon", { points: `${x + w},${baseY - thick} ${x + w + d},${baseY - thick - d * 0.6} ${x + w + d},${baseY - d * 0.6} ${x + w},${baseY}`, fill: "#f7f3e8", stroke: "#cbbfa6" }),
    svg("rect", { x, y: baseY - thick, width: w, height: thick, fill: color }));
  for (let i = 4; i < thick - 2; i += 5) g.appendChild(svg("line", { x1: x + w + 2, y1: baseY - thick + i, x2: x + w + d - 2, y2: baseY - thick + i - d * 0.6 * (1 - 0) , stroke: "#cbbfa6", "stroke-width": 1 }));
  g.bbox = { x: x - 6, y: baseY - thick - d - 8, w: w + d + 12, h: thick + d + 12 };
  return g;
}
function drawLine(x, y, w, straight) {
  const path = straight
    ? `M ${x} ${y + rnd(-30, 30)} L ${x + w} ${y + rnd(-30, 30)}`
    : `M ${x} ${y} C ${x + w * 0.3} ${y - rnd(30, 60)}, ${x + w * 0.5} ${y + rnd(30, 60)}, ${x + w * 0.7} ${y + rnd(-50, 50)} S ${x + w} ${y + rnd(-20, 20)}, ${x + w} ${y + rnd(-10, 10)}`;
  const g = svg("g", {}, svg("path", { d: path, fill: "none", stroke: "#3b3a4a", "stroke-width": 6, "stroke-linecap": "round" }));
  g.bbox = { x: x - 10, y: y - 70, w: w + 20, h: 140 };
  return g;
}

// 兩個或三個「不一樣」的數值：差距至少 diff
function distinct(n, min, max, diff) {
  for (let t = 0; t < 200; t++) {
    const v = Array.from({ length: n }, () => rnd(min, max));
    if (v.every((a, i) => v.every((b, j) => i === j || Math.abs(a - b) >= diff))) return v;
  }
  return Array.from({ length: n }, (_, i) => min + i * diff);
}

// === 題目產生器：回傳 { prompt, bopo?, svgNode, items:[{node, bbox, correct}], tf? } ===
const KINDS = {
  pencil: { name: "筆", unit: "枝", measure: ["長", "短"] },
  tree: { name: "樹", unit: "棵", measure: ["高", "矮"] },
  bottle: { name: "瓶子", unit: "個", measure: ["高", "矮"] },
  tower: { name: "塔", unit: "座", measure: ["高", "矮"] },
  book: { name: "書", unit: "本", measure: ["厚", "薄"] },
  toast: { name: "吐司", unit: "片", measure: ["厚", "薄"] },
};
const vertDraw = { tree: drawTree, bottle: drawBottle, tower: drawTower };

function layoutItems(kind, values, colors) {
  // 回傳畫好的 group 陣列（依 values 順序）與 svg 尺寸
  const n = values.length;
  const groups = [];
  if (kind === "pencil") {
    const ys = n === 2 ? [70, 170] : [45, 130, 215];
    values.forEach((len, i) => groups.push(drawPencil(30 + rnd(0, 40), ys[i], len, colors[i])));
    return { groups, h: n === 2 ? 260 : 290 };
  }
  if (kind === "book" || kind === "toast") {
    const xs = n === 2 ? [40, 230] : [15, 145, 275];
    const w = n === 2 ? 110 : 90;
    values.forEach((t, i) => groups.push(drawBook(xs[i], 200, t, kind === "toast" ? "#f3c98b" : colors[i], w)));
    return { groups, h: 240 };
  }
  const xs = n === 2 ? [120, 280] : [70, 200, 330];
  values.forEach((h, i) => groups.push(vertDraw[kind](xs[i], 240, h, colors[i])));
  return { groups, h: 260 };
}

function genCompare(kindList, topic) {
  const kind = pick(kindList);
  const K = KINDS[kind];
  const askIdx = rnd(0, 1);
  const ask = K.measure[askIdx];
  const range = kind === "pencil" ? [90, 300, 50] : (kind === "book" || kind === "toast") ? [12, 46, 12] : [90, 210, 45];
  const values = distinct(2, range[0], range[1], range[2]);
  const colors = shuffle(M_COLORS).slice(0, 2).map(c => c[0]);
  const { groups, h } = layoutItems(kind, values, colors);
  const target = askIdx === 0 ? Math.max(...values) : Math.min(...values);
  return {
    topic, prompt: `哪一${K.unit}${K.name}比較${ask}？`, h,
    items: groups.map((g, i) => ({ node: g, correct: values[i] === target })),
  };
}
function genMost() {
  const kind = pick(["pencil", "tree", "bottle", "tower", "book", "toast"]);
  const K = KINDS[kind];
  const askIdx = rnd(0, 1);
  const range = kind === "pencil" ? [80, 300, 45] : (kind === "book" || kind === "toast") ? [10, 46, 10] : [80, 210, 35];
  const values = distinct(3, range[0], range[1], range[2]);
  const colors = shuffle(M_COLORS).slice(0, 3).map(c => c[0]);
  const { groups, h } = layoutItems(kind, values, colors);
  const target = askIdx === 0 ? Math.max(...values) : Math.min(...values);
  return { topic: "most", prompt: `哪一${K.unit}${K.name}最${K.measure[askIdx]}？`, h, items: groups.map((g, i) => ({ node: g, correct: values[i] === target })) };
}
function genLine() {
  const askStraight = rnd(0, 1) === 1;
  const n = 4;
  const target = rnd(0, n - 1);
  const groups = [];
  const pos = [[20, 70], [210, 70], [20, 190], [210, 190]];
  for (let i = 0; i < n; i++) {
    const straight = i === target ? askStraight : !askStraight;
    groups.push(drawLine(pos[i][0], pos[i][1], 170, straight));
  }
  return { topic: "line", prompt: askStraight ? "哪一條是直線？" : "哪一條是曲線？", h: 260, items: groups.map((g, i) => ({ node: g, correct: i === target })) };
}
function genTF() {
  const kind = pick(["pencil", "tree", "book"]);
  const K = KINDS[kind];
  const range = kind === "pencil" ? [90, 280, 50] : kind === "book" ? [12, 46, 12] : [90, 210, 45];
  const equal = rnd(0, 2) === 0; // 1/3 機率一樣
  let values = equal ? [rnd(range[0], range[1]), 0] : distinct(2, range[0], range[1], range[2]);
  if (equal) values[1] = values[0];
  const cs = shuffle(M_COLORS).slice(0, 2);
  const { groups, h } = layoutItems(kind, values, cs.map(c => c[0]));
  let statement, truth;
  if (rnd(0, 1) === 0) {
    statement = `兩${K.unit}${K.name}一樣${K.measure[0]}`;
    truth = equal;
  } else {
    const m = pick(K.measure);
    statement = `${cs[0][1]}的${K.name}比${cs[1][1]}的${K.name}${m}`;
    truth = !equal && ((m === K.measure[0]) ? values[0] > values[1] : values[0] < values[1]);
  }
  return { topic: "tf", prompt: `對不對？「${statement}」`, h, tf: truth, items: groups.map(g => ({ node: g, correct: null })) };
}

const MATH_TOPICS = {
  line:   { name: "直線和曲線", emoji: "〰️", gen: genLine },
  length: { name: "比長短",     emoji: "✏️", gen: () => genCompare(["pencil"], "length") },
  height: { name: "比高矮",     emoji: "🌳", gen: () => genCompare(["tree", "bottle", "tower"], "height") },
  thick:  { name: "比厚薄",     emoji: "📚", gen: () => genCompare(["book", "toast"], "thick") },
  most:   { name: "三個比一比", emoji: "🥇", gen: genMost },
  tf:     { name: "對不對",     emoji: "✅", gen: genTF },
};

// === 首頁區塊 ===
function renderMathHomeSection() {
  const wrap = el("div", {});
  const prog = mathProgressOf();
  MATH.units.forEach(u => {
    const done = u.topics.reduce((s, tp) => s + (prog[tp]?.correct || 0), 0);
    wrap.appendChild(el("section", { class: "hero" },
      el("div", { class: "hero__head" },
        el("h1", { class: "hero__title" }, `${u.emoji} `, rubyEl(u.title, u.titleBopo, "span")),
        el("div", { class: "hero__sub" }, `${u.topics.length} 種題型・已答對 ${done} 題`)),
      el("div", { class: "zh-chips" }, u.topics.map(tp => { const T = (u.kind === "calc" ? MATH2_TOPICS : MATH_TOPICS)[tp]; return el("div", { class: "zh-chip" }, el("span", { class: "zh-chip__emoji" }, T.emoji), t(T.name)); })),
      el("button", { class: "btn btn--accent btn--full btn--xl", style: "margin-top: 12px;", onclick: () => navigate(`#/math/${u.id}`) }, t("▶ 開始練習"))
    ));
  });
  return wrap;
}

// === 單元頁：選題型 / 小考 ===
function renderMathUnit(id) {
  const u = mathUnit(id);
  if (!u) return renderEmpty("#/", "找不到這個單元");
  if (u.kind === "calc") return renderMath2Unit(u);
  const prog = mathProgressOf();
  const root = el("div", {});
  root.appendChild(renderHeader(`${u.emoji} ${u.title}`, { back: "#/" }));
  const app = el("main", { class: "app" });
  app.appendChild(questEntryBtn("math", u.id));
  app.appendChild(el("section", { class: "section" },
    el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => navigate(`#/mathplay/sheet?u=${u.id}`) }, t(u.sheetLabel || "📄 評量卷原題（第6、7頁）")),
    el("div", { class: "progress-note", style: "text-align: center;" }, t(u.sheetNote || "跟學校的評量卷一樣的題目和順序")),
    el("button", { class: "btn btn--full btn--xl", style: "margin-top: 10px;", onclick: () => navigate(`#/mathplay/mix?u=${u.id}`) }, t("📝 小考（隨機 12 題）")),
    el("div", { class: "progress-note", style: "text-align: center;" }, "每次都不一樣的題目，練熟概念")));
  app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t("🎯 一種一種練")),
    el("div", { class: "mode-grid" }, u.topics.map(tp => {
      const r = prog[tp];
      return el("button", { class: "mode-btn", onclick: () => navigate(`#/mathplay/${tp}?u=${u.id}`) },
        el("span", { class: "mode-btn__emoji" }, MATH_TOPICS[tp].emoji), t(MATH_TOPICS[tp].name),
        el("span", { class: "mode-btn__sub" }, r ? `答對 ${r.correct} / ${r.seen}` : "還沒練"));
    }))));
  root.appendChild(app);
  return root;
}

// 一題（一年級畫圖題）放進 container；答對時呼叫 onDone(第一次就對)；不限時間，答錯可以再選
function mountMathQ(q, container, onDone, tp = q.topic, onWrong) {
  let locked = false, tries = 0;
  const feedback = el("div", { class: "quiz-feedback" });
  const finish = (ok) => {
    if (ok) {
      feedback.textContent = "答對了！🎉"; feedback.className = "quiz-feedback quiz-feedback--correct pop";
      recordMath(tp, true); dingCorrect(); locked = true; onDone(tries === 0);
    } else {
      tries++; recordMath(tp, false); buzzWrong();
      feedback.textContent = "再看一次，仔細比比看"; feedback.className = "quiz-feedback quiz-feedback--wrong shake";
      onWrong?.();
    }
  };
  const board = svg("svg", { viewBox: `0 0 400 ${q.h}`, class: "m-board" });
  if (q.extra) board.appendChild(q.extra); // 題目的圖（不能點，例如分合圖）
  q.items.forEach(it => {
    const b = it.node.bbox;
    it.node.classList.add("m-item");
    const hit = svg("rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: 14, class: "m-hit" });
    it.node.insertBefore(hit, it.node.firstChild);
    board.appendChild(it.node);
    if (q.topic === "tf") return;
    it.node.addEventListener("click", () => {
      if (locked) return;
      if (it.correct) { it.node.classList.add("m-item--ok"); finish(true); }
      else { it.node.classList.add("m-item--bad"); finish(false); }
    });
  });
  const parts = [el("div", { class: "m-card" }, el("div", { class: "m-prompt" }, q.prompt),
    el("button", { class: "icon-btn icon-btn--accent m-speak", onclick: () => speakZh(q.prompt), "aria-label": "念題目" }, "🔊"),
    board)];
  if (q.topic === "tf") {
    parts.push(el("div", { class: "m-tf" }, [[true, "✓ 對"], [false, "✗ 不對"]].map(([v, label]) => {
      const b = el("button", { class: `m-tf__btn ${v ? "m-tf__btn--yes" : "m-tf__btn--no"}` }, t(label));
      b.addEventListener("click", () => {
        if (locked) return;
        if (v === q.tf) { b.classList.add("m-tf__btn--ok"); finish(true); }
        else { b.disabled = true; finish(false); }
      });
      return b;
    })));
  } else parts.push(el("div", { class: "m-hint" }, t("點一下你的答案")));
  container.replaceChildren(...parts, feedback);
  setTimeout(() => speakZh(q.prompt), 250);
}

// === 練習：一題一題畫 ===
function renderMathPlay(topic, unitId) {
  const u = mathUnit(unitId) || MATH?.units[0];
  if (!u) return renderEmpty("#/", "找不到這個單元");
  if (u.kind === "calc") return renderMath2Play(topic, u);
  if (topic === "sheet") return typeof FILL_SHEETS !== "undefined" && FILL_SHEETS[u.id] ? renderFillSheet(u) : renderMathSheet(u.id);
  const isMix = topic === "mix";
  const total = isMix ? 12 : 8;
  const topics = isMix ? u.topics : [topic];
  if (!isMix && !MATH_TOPICS[topic]) return renderEmpty(`#/math/${u.id}`, "找不到這種題型");
  const title = isMix ? "📝 小考" : `${MATH_TOPICS[topic].emoji} ${MATH_TOPICS[topic].name}`;
  const root = el("div", {});
  const header = renderHeader(title, { back: `#/math/${u.id}` });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);
  let i = 0, score = 0;
  const wrongTopics = new Set();

  function render() {
    if (i >= total) {
      app.replaceChildren(renderResultBlock(`答對 ${score} / ${total}`, score === total ? "🌟" : score >= total * 0.7 ? "🎉" : "💪", "再來一次", () => navigate(`#/mathplay/${topic}?u=${u.id}`),
        wrongTopics.size ? el("div", { class: "zh-missed" }, el("div", { class: "zh-missed__title" }, t("要再練的：")), [...wrongTopics].map(tp =>
          el("button", { class: "zh-chip", onclick: () => navigate(`#/mathplay/${tp}?u=${u.id}`) }, MATH_TOPICS[tp].emoji, t(MATH_TOPICS[tp].name)))) : null));
      return;
    }
    const tp = isMix ? u.topics[i % u.topics.length] : topic;
    const q = MATH_TOPICS[tp].gen();
    progressLabel.textContent = `${i + 1}/${total}・${score}分`;
    mountMathQ(q, app, firstTry => {
      if (firstTry) score++; else wrongTopics.add(tp);
      setTimeout(() => { i++; render(); }, 1100);
    }, tp);
  }
  render();
  return root;
}

// =====================================================================
// 📄 評量卷原題：一上第3回（p.6-7）22 小題，順序、圖、答案都照卷子
// =====================================================================
const WOOD = "#c9a26b", INK = "#3b3a4a";
function wsRope(x, y, len, wavy) {
  const d = wavy
    ? `M ${x} ${y} ` + Array.from({ length: 4 }, (_, i) => `q ${len / 8} -28 ${len / 4} 0`).join(" ")
    : `M ${x} ${y} L ${x + len} ${y}`;
  const g = svg("g", {}, svg("path", { d, fill: "none", stroke: WOOD, "stroke-width": 9, "stroke-linecap": "round" }),
    svg("rect", { x: x - 6, y: y - 9, width: 10, height: 18, rx: 3, fill: INK }), svg("rect", { x: x + len - 4, y: y - 9, width: 10, height: 18, rx: 3, fill: INK }));
  g.bbox = { x: x - 12, y: y - 40, w: len + 24, h: 80 }; return g;
}
function wsClip(x, y, len, h) {
  const r = h / 2;
  const g = svg("g", {}, svg("rect", { x, y, width: len, height: h, rx: r, fill: "none", stroke: "#8a8fa3", "stroke-width": 5 }),
    svg("rect", { x: x + 10, y: y + 8, width: len - 24, height: h - 16, rx: (h - 16) / 2, fill: "none", stroke: "#8a8fa3", "stroke-width": 5 }));
  g.bbox = { x: x - 8, y: y - 8, w: len + 16, h: h + 16 }; return g;
}
function wsPants(x, y, legLen, color) {
  const g = svg("g", {}, svg("rect", { x, y, width: 70, height: 14, rx: 3, fill: "#555" }),
    svg("rect", { x, y: y + 12, width: 32, height: legLen, rx: 4, fill: color }), svg("rect", { x: x + 38, y: y + 12, width: 32, height: legLen, rx: 4, fill: color }));
  g.bbox = { x: x - 8, y: y - 8, w: 86, h: legLen + 28 }; return g;
}
function wsSignpost(x, baseY, h) {
  const g = svg("g", {}, svg("rect", { x: x - 5, y: baseY - h, width: 10, height: h, fill: WOOD }));
  [0, 18, 36].forEach((dy, i) => g.appendChild(svg("rect", { x: x - 30 + (i % 2) * 8, y: baseY - h + 6 + dy, width: 52, height: 12, rx: 3, fill: "#ffb020" })));
  g.bbox = { x: x - 40, y: baseY - h - 8, w: 80, h: h + 12 }; return g;
}
function wsTable(x, baseY, h, w) {
  const g = svg("g", {}, svg("rect", { x, y: baseY - h, width: w, height: 12, rx: 3, fill: WOOD }));
  [4, w - 14].forEach(dx => g.appendChild(svg("rect", { x: x + dx, y: baseY - h + 12, width: 10, height: h - 12, fill: "#a07c4a" })));
  g.bbox = { x: x - 8, y: baseY - h - 8, w: w + 16, h: h + 12 }; return g;
}
function wsLighthouse(x, baseY, h) {
  const g = svg("g", {}, svg("polygon", { points: `${x - 26},${baseY} ${x + 26},${baseY} ${x + 18},${baseY - h * 0.8} ${x - 18},${baseY - h * 0.8}`, fill: "#f7f3e8", stroke: INK, "stroke-width": 2 }),
    svg("rect", { x: x - 22, y: baseY - h * 0.8 - 10, width: 44, height: 10, fill: "#6b8cff" }),
    svg("path", { d: `M ${x - 14} ${baseY - h * 0.8 - 10} a 14 14 0 0 1 28 0 z`, fill: "#ff6fa3" }),
    svg("rect", { x: x - 6, y: baseY - h * 0.35, width: 12, height: 18, fill: INK }));
  g.bbox = { x: x - 36, y: baseY - h - 8, w: 72, h: h + 12 }; return g;
}
function wsVase(x, baseY, h, color) {
  const g = svg("g", {}, svg("path", { d: `M ${x - 14} ${baseY - h} h 28 c -4 ${h * 0.25} 24 ${h * 0.35} 14 ${h * 0.75} q -4 ${h * 0.25} -28 ${h * 0.25} q -24 0 -28 ${-h * 0.25} c -10 ${-h * 0.4} 18 ${-h * 0.5} 14 ${-h * 0.75} z`, fill: color }));
  [[-6, 0.45], [8, 0.65]].forEach(([dx, dy]) => g.appendChild(svg("circle", { cx: x + dx, cy: baseY - h * dy, r: 7, fill: "#fff", opacity: 0.8 })));
  g.bbox = { x: x - 40, y: baseY - h - 8, w: 80, h: h + 12 }; return g;
}
function wsPizza(x, y, thick) {
  const g = svg("g", {}, svg("polygon", { points: `${x},${y + 60} ${x + 100},${y + 60} ${x + 50},${y}`, fill: "#ffd166", stroke: "#e0952e", "stroke-width": 3 }),
    svg("rect", { x, y: y + 60, width: 100, height: thick, fill: "#e0952e" }));
  [[35, 38], [60, 45], [48, 22]].forEach(([dx, dy]) => g.appendChild(svg("circle", { cx: x + dx, cy: y + dy, r: 6, fill: "#d64545" })));
  g.bbox = { x: x - 8, y: y - 8, w: 116, h: 60 + thick + 16 }; return g;
}
function wsBurger(x, baseY, patties) {
  const g = svg("g", {});
  let y = baseY;
  g.appendChild(svg("rect", { x: x - 40, y: y - 14, width: 80, height: 14, rx: 5, fill: "#f2c177" })); y -= 14;
  for (let i = 0; i < patties; i++) { g.appendChild(svg("rect", { x: x - 42, y: y - 12, width: 84, height: 12, rx: 4, fill: "#7a4b2a" })); y -= 12; g.appendChild(svg("rect", { x: x - 38, y: y - 6, width: 76, height: 6, rx: 3, fill: "#ffd166" })); y -= 6; }
  g.appendChild(svg("path", { d: `M ${x - 42} ${y} a 42 22 0 0 1 84 0 z`, fill: "#f2c177" }));
  g.bbox = { x: x - 50, y: y - 30, w: 100, h: baseY - y + 38 }; return g;
}
function wsStarPencil(x, y, len) { const g = drawPencil(x, y, len, "#ff6fa3"); [20, 36, 52].forEach(dx => g.appendChild(svg("text", { x: x + dx, y: y + 17, "font-size": 14, fill: "#fff" }, document.createTextNode("★")))); return g; }
function wsPen(x, y, len) {
  const g = svg("g", {}, svg("rect", { x, y, width: len - 16, height: 16, rx: 8, fill: "#6b8cff" }), svg("polygon", { points: `${x + len - 16},${y + 2} ${x + len},${y + 8} ${x + len - 16},${y + 14}`, fill: "#3b3a4a" }),
    svg("rect", { x: x + 6, y: y + 14, width: 40, height: 5, rx: 2, fill: "#3b3a4a" }));
  g.bbox = { x: x - 6, y: y - 10, w: len + 12, h: 36 }; return g;
}
function wsBookUp(x, baseY, thick, h, color) {
  const g = svg("g", {}, svg("rect", { x, y: baseY - h, width: thick, height: h, rx: 3, fill: color }), svg("rect", { x: x + thick, y: baseY - h + 4, width: 6, height: h - 8, fill: "#f7f3e8" }),
    svg("rect", { x: x + 6, y: baseY - h * 0.75, width: Math.max(thick - 12, 6), height: 22, rx: 3, fill: "#fff", opacity: 0.8 }));
  g.bbox = { x: x - 8, y: baseY - h - 8, w: thick + 22, h: h + 12 }; return g;
}
function wsKid(x, baseY, h, color, stool) {
  const g = svg("g", {});
  let base = baseY;
  if (stool) { g.appendChild(svg("rect", { x: x - 22, y: baseY - stool, width: 44, height: 8, fill: WOOD })); [-18, 12].forEach(dx => g.appendChild(svg("rect", { x: x + dx, y: baseY - stool + 8, width: 6, height: stool - 8, fill: WOOD }))); base = baseY - stool; }
  g.appendChild(svg("rect", { x: x - 10, y: base - h * 0.35, width: 8, height: h * 0.35, fill: "#555" })); g.appendChild(svg("rect", { x: x + 2, y: base - h * 0.35, width: 8, height: h * 0.35, fill: "#555" }));
  g.appendChild(svg("rect", { x: x - 16, y: base - h * 0.7, width: 32, height: h * 0.36, rx: 6, fill: color }));
  g.appendChild(svg("circle", { cx: x, cy: base - h * 0.85, r: h * 0.15, fill: "#ffe0bd" }));
  g.appendChild(svg("path", { d: `M ${x - h * 0.15} ${base - h * 0.87} a ${h * 0.15} ${h * 0.15} 0 0 1 ${h * 0.3} 0 z`, fill: "#5a3a1e" }));
  g.bbox = { x: x - 30, y: base - h - 8, w: 60, h: (baseY - base) + h + 12 }; return g;
}
function wsLineItem(kind) {
  const paths = {
    wave: "M 60 60 q 20 -40 40 0 t 40 0 t 40 0 t 40 0",
    vert: "M 200 10 L 200 110",
    diag: "M 130 15 L 250 100 Q 268 114 290 80", // 卷子上是斜斜往下、最後往上彎的曲線
    loop: "M 40 70 c 30 -60 70 -60 60 -10 c -10 40 40 40 50 0 c 10 -50 60 -40 80 10",
  };
  const g = svg("g", {}, svg("path", { d: paths[kind], fill: "none", stroke: INK, "stroke-width": 7, "stroke-linecap": "round" }));
  g.bbox = { x: 20, y: 0, w: 360, h: 130 }; return g;
}
// 虛線（卷子上用來對齊的參考線）
const dash = (x1, y1, x2, y2) => svg("line", { x1, y1, x2, y2, stroke: "#aaa", "stroke-width": 2, "stroke-dasharray": "6 6" });

// 評量卷：每一大題 { no, instr(照卷子的說明), points, how, qs:[...] }
//   how: "mark2" 在(　)裡打✓或畫○（一）、"paren" 點括弧寫記號（二、四）、"circle" 圈起來（三、五）、"box" 方框打✓✗（六）
//   小題 { n, prompt?, w?, h, extra?, items:[{ node, correct }], answer? }
//   paren 記號位置由 items 的 bbox 自動算（parenPos: "right" / "below"）
const SHEET_U2 = {
  id: "u2", title: "一上 第3回", sub: "2-1 比長短　2-2 高矮與厚薄",
  sections: [
    { no: "一", instr: "哪些是直線？在(　)裡打✓，哪些是曲線？在(　)裡畫○：每題4分，共16分", points: 4, how: "mark2", marks: ["✓", "○"], parenPos: "below", qs: [
      { n: 1, h: 180, items: [{ node: () => wsLineItem("wave") }], answer: "○" },
      { n: 2, h: 180, items: [{ node: () => wsLineItem("vert") }], answer: "✓" },
      { n: 3, h: 180, items: [{ node: () => wsLineItem("diag") }], answer: "○" },
      { n: 4, h: 180, items: [{ node: () => wsLineItem("loop") }], answer: "○" },
    ] },
    { no: "二", instr: "比一比，比較長的在(　)裡畫○：每題5分，共20分", points: 5, how: "paren", mark: "○", parenPos: "right", qs: [
      { n: 1, w: 470, h: 200, extra: () => [dash(40, 20, 40, 180), dash(360, 20, 360, 180)], items: [{ node: () => wsRope(40, 60, 320, false), correct: false }, { node: () => wsRope(40, 140, 320, true), correct: true }] },
      { n: 2, w: 470, h: 200, items: [{ node: () => wsClip(60, 30, 260, 60), correct: true }, { node: () => wsClip(60, 120, 150, 50), correct: false }] },
      { n: 3, w: 470, h: 200, extra: () => [dash(40, 20, 40, 180)], items: [{ node: () => drawPencil(40, 50, 300, "#ffb020"), correct: true }, { node: () => drawPencil(40, 130, 170, "#ffb020"), correct: false }] },
      { n: 4, h: 260, parenPos: "below", extra: () => [svg("rect", { x: 20, y: 20, width: 360, height: 8, rx: 3, fill: WOOD })], items: [{ node: () => wsPants(90, 30, 70, "#6b8cff"), correct: false }, { node: () => wsPants(240, 30, 170, "#4a64c9"), correct: true }] },
    ] },
    { no: "三", instr: "圈出比較高的物件：每題5分，共20分", points: 5, how: "circle", qs: [
      { n: 1, h: 250, extra: () => [dash(20, 230, 380, 230)], items: [{ node: () => wsSignpost(130, 230, 190), correct: true }, { node: () => wsSignpost(270, 230, 130), correct: false }] },
      { n: 2, h: 250, extra: () => [dash(20, 230, 380, 230)], items: [{ node: () => wsTable(40, 230, 70, 140), correct: false }, { node: () => wsTable(220, 230, 130, 140), correct: true }] },
      { n: 3, h: 250, extra: () => [dash(20, 230, 380, 230)], items: [{ node: () => wsLighthouse(130, 230, 140), correct: false }, { node: () => wsLighthouse(270, 230, 200), correct: true }] },
      { n: 4, h: 250, extra: () => [dash(20, 230, 380, 230)], items: [{ node: () => wsVase(130, 230, 200, "#b388ff"), correct: true }, { node: () => wsVase(270, 230, 140, "#4ec9a8"), correct: false }] },
    ] },
    { no: "四", instr: "哪一個比較薄？在(　)裡打✓：每題5分，共20分", points: 5, how: "paren", mark: "✓", parenPos: "below", qs: [
      { n: 1, h: 215, items: [{ node: () => wsPizza(40, 40, 12), correct: true }, { node: () => wsPizza(240, 40, 34), correct: false }] }, // 卷子：左邊薄、右邊厚
      { n: 2, h: 215, items: [{ node: () => drawBook(30, 160, 14, WOOD, 130), correct: true }, { node: () => drawBook(220, 160, 44, WOOD, 130), correct: false }] },
      { n: 3, h: 225, items: [{ node: () => drawBook(30, 170, 60, "#6b8cff", 130), correct: false }, { node: () => drawBook(220, 170, 16, "#ff6fa3", 130), correct: true }] },
      { n: 4, h: 245, extra: () => [svg("rect", { x: 20, y: 190, width: 360, height: 10, rx: 4, fill: "#ddd" })], items: [{ node: () => wsBurger(120, 190, 3), correct: false }, { node: () => wsBurger(280, 190, 1), correct: true }] },
    ] },
    { no: "五", instr: "比一比，圈圈看：每題5分，共20分", points: 5, how: "circle", qs: [
      { n: 1, prompt: "哪一枝筆最短？", h: 260, extra: () => [dash(30, 20, 30, 240)], items: [{ node: () => wsStarPencil(30, 40, 210), correct: false }, { node: () => drawPencil(30, 115, 150, "#ffb020"), correct: true }, { node: () => wsPen(30, 195, 330), correct: false }] },
      { n: 2, prompt: "哪一棵樹最高？", h: 260, extra: () => [dash(20, 245, 380, 245)], items: [{ node: () => drawTree(80, 245, 220, "#4ec9a8"), correct: true }, { node: () => drawTree(200, 245, 150, "#4ec9a8"), correct: false }, { node: () => drawTree(320, 245, 185, "#4ec9a8"), correct: false }] },
      { n: 3, prompt: "哪一塊吐司最厚？", h: 240, items: [{ node: () => drawBook(15, 210, 90, "#f3c98b", 95), correct: true }, { node: () => drawBook(145, 210, 14, "#f3c98b", 95), correct: false }, { node: () => drawBook(275, 210, 40, "#f3c98b", 95), correct: false }] },
      { n: 4, prompt: "哪一本書最薄？", h: 240, extra: () => [dash(20, 225, 380, 225)], items: [{ node: () => wsBookUp(40, 225, 70, 170, "#6b8cff"), correct: false }, { node: () => wsBookUp(160, 225, 70, 170, "#4ec9a8"), correct: false }, { node: () => wsBookUp(290, 225, 40, 170, "#ff6fa3"), correct: true }] },
    ] },
    { no: "六", instr: "比一比，對的打✓，不對的打✗：每題2分，共4分", points: 2, how: "box", marks: ["✓", "✗"], qs: [
      { n: 1, prompt: "兩枝筆一樣長", h: 280, answer: "✗", hint: "斜放的那枝比較長，兩邊對齊不代表一樣長",
        extra: () => [dash(40, 20, 40, 200), dash(330, 20, 330, 200)], items: [{ node: () => { const g = drawPencil(40, 60, 310, "#ffb020"); g.setAttribute("transform", "rotate(-14 40 71)"); g.bbox = { x: 30, y: 0, w: 330, h: 90 }; return g; } }, { node: () => drawPencil(40, 150, 290, "#ffb020") }] },
      { n: 2, prompt: "小珊比小玉高", h: 320, answer: "✓", hint: "小玉是站在椅子上，所以小珊比較高",
        extra: () => [dash(20, 30, 380, 30), dash(20, 245, 380, 245), svg("text", { x: 140, y: 300, "text-anchor": "middle", "font-size": 26, "font-weight": 800, fill: INK }, document.createTextNode("小珊")), svg("text", { x: 260, y: 300, "text-anchor": "middle", "font-size": 26, "font-weight": 800, fill: INK }, document.createTextNode("小玉"))], items: [{ node: () => wsKid(140, 245, 215, "#6b8cff", 0) }, { node: () => wsKid(260, 245, 165, "#ff6fa3", 50) }] },
    ] },
  ],
};
const SHEETS = { u2: SHEET_U2 };
const SHEET_TOTAL = s => s.sections.reduce((n, sec) => n + sec.qs.length, 0);

const RED = "#e0393e", GREEN = "#1b9e6a";
// (　) 括弧：回傳 <g>，有 setMark(text, color)
function parenSlot(cx, cy) {
  const g = svg("g", { class: "ws-paren" },
    svg("rect", { x: cx - 34, y: cy - 24, width: 68, height: 48, rx: 10, class: "ws-paren__hit" }),
    svg("text", { x: cx, y: cy + 9, "text-anchor": "middle", "font-size": 30, fill: INK, "font-weight": 700 }, document.createTextNode("(　)")));
  const mark = svg("text", { x: cx, y: cy + 10, "text-anchor": "middle", "font-size": 30, "font-weight": 900, fill: RED });
  g.appendChild(mark);
  g.setMark = (txt, color = RED) => { mark.textContent = txt || ""; mark.setAttribute("fill", color); };
  return g;
}
function parenPosFor(b, pos) { return pos === "right" ? { cx: b.x + b.w + 44, cy: b.y + b.h / 2 } : { cx: b.x + b.w / 2, cy: b.y + b.h + 26 }; }
function circleMark(b, color) {
  return svg("ellipse", { cx: b.x + b.w / 2, cy: b.y + b.h / 2, rx: b.w / 2 + 10, ry: b.h / 2 + 10, fill: "none", stroke: color, "stroke-width": 5, class: "ws-circle pop" });
}

function renderMathSheet(unitId) {
  const u = mathUnit(unitId) || MATH?.units[0];
  const S = SHEETS[u.id] || SHEET_U2;
  const total = SHEET_TOTAL(S);
  const root = el("div", {});
  const header = renderHeader("📄 評量卷原題", { back: `#/math/${u.id}` });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app ws" });
  root.appendChild(app);

  const scoreBox = el("span", { class: "ws-score__num" }, "");
  app.appendChild(el("div", { class: "ws-title" },
    el("div", { class: "ws-title__main" }, t(S.title)),
    el("div", { class: "ws-title__sub" }, t(S.sub)),
    el("div", { class: "ws-score" }, t("得分"), scoreBox)));
  app.appendChild(el("div", { class: "ws-howto" }, t("跟考卷一樣寫：點(　)寫記號、點圖把它圈起來。全部寫完按「交卷」")));

  const answered = {}; // key -> 使用者答案
  const graders = []; // 每小題 { key, points, check(), showAnswer(ok) }
  let locked = false;
  const update = () => { progressLabel.textContent = `寫了 ${Object.keys(answered).length}/${total} 題`; };

  S.sections.forEach(sec => {
    const secEl = el("section", { class: "ws-sec" });
    secEl.appendChild(el("div", { class: "ws-sec__head" },
      el("span", { class: "ws-sec__no" }, sec.no),
      el("div", { class: "ws-sec__instr" }, t(sec.instr)),
      el("button", { class: "icon-btn icon-btn--accent m-speak", onclick: () => speakZh(sec.instr.replace(/[(　)]/g, "括弧").replace(/✓/g, "勾").replace(/○/g, "圈").replace(/✗/g, "叉")), "aria-label": "念題目" }, "🔊")));
    const grid = el("div", { class: "ws-grid" });
    sec.qs.forEach(q => {
      const key = `${sec.no}-${q.n}`;
      const w = q.w || 400;
      const board = svg("svg", { viewBox: `0 0 ${w} ${q.h}`, class: "ws-board" });
      (q.extra ? q.extra() : []).forEach(n => board.appendChild(n));
      const nodes = q.items.map(it => { const node = it.node(); node.classList.add("m-item"); node.insertBefore(svg("rect", { x: node.bbox.x, y: node.bbox.y, width: node.bbox.w, height: node.bbox.h, rx: 14, class: "m-hit" }), node.firstChild); board.appendChild(node); return node; });
      const badge = el("span", { class: "ws-q__badge" });
      const card = el("div", { class: "ws-q" }, el("div", { class: "ws-q__head" }, el("span", { class: "ws-q__no" }, `${q.n}.`), q.prompt ? el("span", { class: "ws-q__prompt" }, t(q.prompt)) : null, badge));
      const marksRow = el("div", { class: "ws-marks" });
      let correctFn, showAnswer;
      const pos = q.parenPos || sec.parenPos;

      if (sec.how === "paren") {
        const slots = q.items.map((it, i) => { const p = parenPosFor(nodes[i].bbox, pos); const s = parenSlot(p.cx, p.cy); board.appendChild(s); return s; });
        const choose = i => { if (locked) return; slots.forEach((s, j) => s.setMark(j === i ? sec.mark : "")); answered[key] = i; update(); };
        slots.forEach((s, i) => s.addEventListener("click", () => choose(i)));
        nodes.forEach((n, i) => n.addEventListener("click", () => choose(i)));
        correctFn = () => q.items[answered[key]]?.correct === true;
        showAnswer = ok => { if (!ok) q.items.forEach((it, i) => { if (it.correct) slots[i].setMark(sec.mark, GREEN); }); };
      } else if (sec.how === "circle") {
        let ring = null;
        const choose = i => { if (locked) return; ring?.remove(); ring = circleMark(nodes[i].bbox, RED); board.appendChild(ring); answered[key] = i; update(); };
        nodes.forEach((n, i) => n.addEventListener("click", () => choose(i)));
        correctFn = () => q.items[answered[key]]?.correct === true;
        showAnswer = ok => { if (!ok) q.items.forEach((it, i) => { if (it.correct) board.appendChild(circleMark(nodes[i].bbox, GREEN)); }); };
      } else { // mark2 / box：一個括弧或方框 + 兩個記號按鈕
        let slot;
        if (sec.how === "box") {
          slot = svg("g", { class: "ws-paren" }, svg("rect", { x: w / 2 - 26, y: q.h - 56, width: 52, height: 52, rx: 8, fill: "#fff", stroke: INK, "stroke-width": 3 }));
          const mark = svg("text", { x: w / 2, y: q.h - 17, "text-anchor": "middle", "font-size": 36, "font-weight": 900, fill: RED });
          slot.appendChild(mark); slot.setMark = (txt, color = RED) => { mark.textContent = txt || ""; mark.setAttribute("fill", color); };
          // 讓圖不要壓到方框：圖已在上方，方框放最下面
        } else {
          const b = nodes[0].bbox; const p = parenPosFor(b, "below"); slot = parenSlot(p.cx, p.cy);
        }
        board.appendChild(slot);
        const btns = sec.marks.map(m => el("button", { class: "ws-mark" }, m));
        const choose = m => { if (locked) return; slot.setMark(m); btns.forEach(b => b.classList.toggle("ws-mark--on", b.textContent === m)); answered[key] = m; update(); };
        btns.forEach(b => b.addEventListener("click", () => choose(b.textContent)));
        slot.addEventListener("click", () => { // 點括弧：輪流切換
          const i = sec.marks.indexOf(answered[key]); choose(sec.marks[(i + 1) % sec.marks.length]);
        });
        marksRow.append(...btns);
        correctFn = () => answered[key] === q.answer;
        showAnswer = ok => { if (!ok) { slot.setMark(q.answer, GREEN); btns.forEach(b => b.classList.toggle("ws-mark--ok", b.textContent === q.answer)); } };
      }
      card.appendChild(board);
      if (marksRow.childElementCount) card.appendChild(marksRow);
      if (q.hint) { const h = el("div", { class: "ws-q__hint" }, t(`💡 ${q.hint}`)); h.hidden = true; card.appendChild(h); q._hintEl = h; }
      graders.push({ key, points: sec.points, check: correctFn, show: ok => { showAnswer(ok); badge.textContent = ok ? "⭕" : "❌"; card.classList.add(ok ? "ws-q--ok" : "ws-q--bad"); if (!ok && q._hintEl) q._hintEl.hidden = false; } });
      grid.appendChild(card);
    });
    secEl.appendChild(grid);
    app.appendChild(secEl);
  });

  const result = el("div", { class: "ws-result" });
  const submit = el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => {
    const left = total - Object.keys(answered).length;
    if (left > 0 && !submit.dataset.confirm) { submit.dataset.confirm = "1"; submit.replaceChildren(t(`還有${left}題沒寫，確定要交卷？`)); return; }
    locked = true; submit.hidden = true; submit.style.display = "none";
    let score = 0, got = 0; const wrong = [];
    graders.forEach(g => { const ok = g.check(); g.show(ok); if (ok) { score += g.points; got++; } else wrong.push(g.key); recordMath("sheet", ok); });
    scoreBox.textContent = String(score); scoreBox.classList.add("pop");
    if (got === total) dingCorrect(); else buzzWrong();
    result.replaceChildren(
      el("div", { class: "ws-result__big" }, `${score} 分`),
      el("div", { class: "ws-result__msg" }, got === total ? t("全對！太厲害了 🌟") : t(`答對 ${got} 題，錯的題目看一下綠色的正確答案 💪`)),
      el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => navigate(`#/mathplay/sheet?u=${u.id}`) }, t("🔁 再寫一次")),
      el("button", { class: "btn btn--ghost btn--full", onclick: () => navigate(`#/math/${u.id}`) }, t("回數學")));
    result.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => app.querySelector(".ws-q--bad")?.scrollIntoView({ behavior: "smooth", block: "center" }), 1200);
  } }, t("✅ 交卷"));
  app.appendChild(el("div", { class: "ws-submit" }, submit, result));
  update();
  return root;
}
