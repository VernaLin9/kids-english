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
      el("div", { class: "zh-chips" }, u.topics.map(tp => el("div", { class: "zh-chip" }, el("span", { class: "zh-chip__emoji" }, MATH_TOPICS[tp].emoji), t(MATH_TOPICS[tp].name)))),
      el("button", { class: "btn btn--accent btn--full btn--xl", style: "margin-top: 12px;", onclick: () => navigate(`#/math/${u.id}`) }, t("▶ 開始練習"))
    ));
  });
  return wrap;
}

// === 單元頁：選題型 / 小考 ===
function renderMathUnit(id) {
  const u = mathUnit(id);
  if (!u) return renderEmpty("#/", "找不到這個單元");
  const prog = mathProgressOf();
  const root = el("div", {});
  root.appendChild(renderHeader(`${u.emoji} ${u.title}`, { back: "#/" }));
  const app = el("main", { class: "app" });
  app.appendChild(el("section", { class: "section" },
    el("button", { class: "btn btn--accent btn--full btn--xl", onclick: () => navigate(`#/mathplay/mix?u=${u.id}`) }, t("📝 小考（混合 12 題）")),
    el("div", { class: "progress-note", style: "text-align: center;" }, "像評量卷一樣，每種題型都會出現")));
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

// === 練習：一題一題畫 ===
function renderMathPlay(topic, unitId) {
  const u = mathUnit(unitId) || MATH?.units[0];
  if (!u) return renderEmpty("#/", "找不到這個單元");
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
    let locked = false, tries = 0;
    const feedback = el("div", { class: "quiz-feedback" });
    const next = () => setTimeout(() => { i++; render(); }, 1100);
    const finish = (ok) => {
      if (ok) {
        feedback.textContent = "答對了！🎉"; feedback.className = "quiz-feedback quiz-feedback--correct pop";
        if (tries === 0) score++;
        recordMath(tp, true); dingCorrect(); locked = true; next();
      } else {
        tries++; wrongTopics.add(tp); recordMath(tp, false); buzzWrong();
        feedback.textContent = "再看一次，仔細比比看"; feedback.className = "quiz-feedback quiz-feedback--wrong shake";
      }
    };

    const board = svg("svg", { viewBox: `0 0 400 ${q.h}`, class: "m-board" });
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

    const promptEl = el("div", { class: "m-prompt" }, q.prompt);
    const parts = [el("div", { class: "m-card" }, promptEl,
      el("button", { class: "icon-btn icon-btn--accent m-speak", onclick: () => speakZh(q.prompt), "aria-label": "念題目" }, "🔊"),
      board)];
    if (q.topic === "tf") {
      const tfRow = el("div", { class: "m-tf" }, [[true, "✓ 對"], [false, "✗ 不對"]].map(([v, label]) => {
        const b = el("button", { class: `m-tf__btn ${v ? "m-tf__btn--yes" : "m-tf__btn--no"}` }, t(label));
        b.addEventListener("click", () => {
          if (locked) return;
          if (v === q.tf) { b.classList.add("m-tf__btn--ok"); finish(true); }
          else { b.disabled = true; finish(false); }
        });
        return b;
      }));
      parts.push(tfRow);
    } else {
      parts.push(el("div", { class: "m-hint" }, t("點一下你的答案")));
    }
    app.replaceChildren(...parts, feedback);
    setTimeout(() => speakZh(q.prompt), 250);
  }
  render();
  return root;
}
