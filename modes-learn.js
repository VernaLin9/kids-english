// 🧠 遊樂場的學習引擎：不是只考試，而是「先學、玩中練、錯了馬上教、等一下再考一次」
// 1. 專注組：每一局只挑 6 個要學的（先挑答錯過、還沒學會的），一局裡重複出現 → 真的記住
// 2. 先學一學：開始前看 6 張卡（圖、聲音、記憶小撇步），點卡片聽一次
// 3. 答錯就教：第一次錯會暫停遊戲，跳出「記一記」卡（正確答案＋記憶方法），2 題後再考一次
// 4. 結束時：列出要再記一記的，並教一個記憶方法（分段念、找部首、拆字、驗算…）

// 二年級第六課生字的拆字記憶（照課本部首）
const ZH2_MNEMONIC = {
  "自": "像鼻子👃。指著鼻子說：「我自己」",
  "己": "最後一筆往上勾。己的口是打開的，不要寫成已",
  "沙": "氵是水，加上少。水邊一小粒一小粒的，就是沙",
  "撿": "扌是手。用手把東西撿起來",
  "垃": "左邊是土。垃圾會掉在地上",
  "圾": "左邊是土。垃圾會掉在地上",
  "眼": "左邊的目，就是眼睛",
  "膠": "左邊的月是肉。以前的膠，是用動物的皮做的",
  "對": "部首是右邊的寸。先寫左邊，最後寫寸",
  "牠": "左邊是牛。動物用這個牠",
  "安": "宀像屋頂，下面是女。女生在家裡，很安全",
  "吧": "口加巴。用嘴巴說：好吧",
  "如": "女加口。如果的如",
  "該": "左邊是言，和說話有關",
  "留": "下面是田。上面中間有一點，不要忘了寫",
  "便": "亻加更。便當、便宜，兩個念法不一樣",
  "減": "左邊是三點水，不是兩點",
  "少": "小的下面加一撇，就是少",
};
const RADICAL_MEANING = {
  "水": "和水有關", "手": "和手的動作有關", "土": "和泥土、地上有關", "目": "和眼睛有關", "肉": "和身體有關",
  "口": "和嘴巴有關", "言": "和說話有關", "人": "和人有關", "宀": "和房子有關", "女": "和女生有關", "牛": "和動物有關", "田": "和田地有關",
};

const MEMORY_TECHNIQUES = {
  en: [
    ["👏 拍手念", "長的字分開念，念一段拍一下手：pen（拍）cil（拍）"],
    ["🖼️ 想圖片", "念 apple 的時候，想一顆紅紅的蘋果 🍎"],
    ["🙈 看一看、蓋起來", "先看字念一次，再蓋起來拼拼看，最後打開對對看"],
    ["📅 明天再玩", "明天再玩一次，會記得更久"],
  ],
  zh1: [
    ["🔤 拼拼看", "注音一個一個念，再連起來，最後加聲調"],
    ["✋ 用手比聲調", "一聲平平走，二聲往上爬，三聲下去再上來，四聲往下跳"],
    ["🗣️ 說一句話", "用這個詞說一句話，例如：菜園裡長出大蘿蔔"],
    ["📍 聲調寫在哪", "聲調寫在最後一個注音的右邊，輕聲寫在最上面"],
  ],
  zh2: [
    ["🔍 看部首", "部首會告訴你意思：扌是手，氵是水，土是地上"],
    ["✂️ 拆開來記", "安是宀加女：女生在家裡，很安全"],
    ["👀 找不一樣", "長得像的字，找找看哪裡不一樣"],
    ["🙈 看一看、蓋起來", "看一次，蓋起來寫，再打開對對看"],
  ],
  math: [
    ["✅ 再檢查一次", "減完以後，把答案加回去，看是不是一樣"],
    ["🔟 借十", "個位不夠減，就跟十位借一個十"],
    ["🖐️ 湊成十", "8 + 5：先拿 2 給 8 湊成 10，剩下 3，10 + 3 = 13"],
    ["✏️ 個位先算", "直式加減，先算個位，再算十位"],
  ],
  math1: [
    ["🖐️ 數手指", "加法往前數，減法往回數"],
    ["🔟 湊成十", "9 + 3：先拿 1 給 9 湊成 10，剩下 2，就是 12"],
    ["🔗 加減是一家人", "3 + 4 = 7，所以 7 − 4 = 3"],
  ],
};

// 念給小朋友聽：把算式符號換成字，拿掉注音和表情符號
function sayable(text) {
  return String(text || "").replace(/[＋+]/g, "加").replace(/[−－]/g, "減").replace(/[＝=]/g, "等於").replace(/>/g, "大於").replace(/</g, "小於")
    .replace(/✓/g, "").replace(/[ㄅ-ㄩˊˇˋ˙]+/g, "").replace(/\p{Extended_Pictographic}/gu, "").replace(/·/g, "").trim();
}
// 小撇步：文字＋🔊 朗讀按鈕（看不懂可以按來聽）
function sayBtn(say) {
  return el("button", { class: "l-say__btn", "aria-label": "念給我聽", onclick: (e) => { e.stopPropagation(); say(); } }, "🔊");
}
function tipEl(text, cls = "l-card__tip", say = null) {
  return el("div", { class: `${cls} l-say` }, el("div", { class: "l-say__text" }, t(text)), sayBtn(say || (() => speakZh(sayable(text)))));
}
function mathStepsEl(steps) {
  const list = Array.isArray(steps) ? steps : [steps || ""];
  return el("div", { class: "l-mathex__steps l-say" },
    el("ol", { class: "l-steps" }, list.map(s => el("li", {}, t(s)))),
    sayBtn(() => speakZh(list.map(sayable).join("。"))));
}
function techEl(tech, label) {
  return el("div", { class: "l-tech" }, el("div", { class: "l-tech__title" }, t(`${label}${tech[0]}`)),
    el("div", { class: "l-say" }, el("div", { class: "l-tech__body l-say__text" }, t(tech[1])), sayBtn(() => speakZh(sayable(`${tech[0]}。${tech[1]}`)))));
}

// === 每一種「要學的東西」：卡片、記憶小撇步、念出來、出題 ===
function learnTip(item) {
  if (item.kind === "en") {
    const w = item.key, info = WORDS[w];
    if (/^[A-Z][a-z]$/.test(w)) return `大寫 ${w[0]}、小寫 ${w[1]}，${info.emoji || ""} 念 ${info.speak || w[0]}`;
    if (SYLLABLES[w]) return `分開念，一段拍一下手：${SYLLABLES[w].split("·").join(" · ")}`;
    if (w.includes(" ")) return `一個字一個字念：${w.split(" ").join(" · ")}`;
    return `看著 ${info.emoji || "圖"}，大聲念三次 ${w}`;
  }
  if (item.kind === "zh1") {
    return "拼一拼：" + item.w.bopo.split(" ").map(r => { const { symbols, tone } = splitSyl(r); return symbols.join("＋") + (tone ? `＋${tone}` : ""); }).join("　");
  }
  const c = item.c;
  const base = ZH2_MNEMONIC[c.zh] || `${c.zh}的部首是${radicalLabel(c.radical)}${RADICAL_MEANING[c.radical] ? "，" + RADICAL_MEANING[c.radical] : ""}`;
  return base;
}
function learnTipEl(item, cls) {
  const tip = learnTip(item);
  return tipEl(tip, cls, item.kind === "zh1" ? () => speakZh(item.w.zh) : () => speakZh(sayable(tip)));
}
function learnSay(item) {
  if (item.kind === "en") return speak(WORDS[item.key].speak || item.key);
  if (item.kind === "zh1") return speakZh(item.w.zh);
  return speakZh(`${item.c.zh}，${item.c.word}`);
}
function learnCard(item) {
  if (item.kind === "en") {
    const w = item.key, info = WORDS[w];
    return el("div", { class: "l-card__main" }, el("div", { class: "l-card__emoji" }, info.emoji || "🔤"),
      el("div", { class: "l-card__word", "data-nobopo": "1" }, SYLLABLES[w] ? syllableEl(w) : w), rubyEl(info.zh, info.bopo, "div", { class: "l-card__zh" }));
  }
  if (item.kind === "zh1") {
    const w = item.w;
    return el("div", { class: "l-card__main" }, el("div", { class: "l-card__emoji" }, w.emoji || "📖"), rubyEl(w.zh, w.bopo, "div", { class: "l-card__zhbig" }));
  }
  const c = item.c;
  return el("div", { class: "l-card__main" }, rubyEl(c.zh, c.bopo, "div", { class: "l-card__char" }),
    el("div", { class: "l-card__meta" }, t(`${radicalLabel(c.radical)}部・${c.strokes}畫`)), rubyEl(c.word, c.wordBopo, "div", { class: "l-card__zh" }));
}
function learnQuestion(item, focus, subject) {
  if (item.kind === "en") {
    const w = item.key, info = WORDS[w];
    const fromFocus = shuffle(focus.filter(f => f.key !== w).map(f => f.key)).slice(0, 2);
    const ds = [...new Set([...fromFocus, ...distractors(w)])].filter(x => x !== w).slice(0, 3);
    if (Math.random() < 0.6) {
      return { item, key: w, subject, prompt: el("span", { class: "g-prompt__inner" }, el("span", { class: "g-prompt__emoji" }, info.emoji || ""), rubyEl(info.zh, info.bopo, "span")),
        say: () => speakZh(info.zh), sayAnswer: () => speak(info.speak || w),
        options: shuffle([w, ...ds]).map(x => ({ node: el("span", { class: "g-opt__en", "data-nobopo": "1" }, x), ok: x === w })) };
    }
    return { item, key: w, subject, prompt: el("span", { class: "g-prompt__inner" }, el("span", { class: "g-prompt__en", "data-nobopo": "1" }, w)),
      say: () => speak(info.speak || w), sayAnswer: () => speakZh(info.zh),
      options: shuffle([w, ...ds]).map(x => ({ node: el("span", { class: "g-opt__zh" }, (WORDS[x].emoji || "") + " ", rubyEl(WORDS[x].zh, WORDS[x].bopo, "span")), ok: x === w })) };
  }
  if (item.kind === "zh1") {
    const w = item.w;
    const variants = bopoVariants(w.bopo).slice(0, 3);
    return { item, key: w.zh, subject, prompt: el("span", { class: "g-prompt__inner" }, el("span", { class: "g-prompt__emoji" }, w.emoji), el("span", { class: "g-prompt__zhword", "data-nobopo": "1" }, w.zh)),
      say: () => speakZh(w.zh), sayAnswer: () => speakZh(w.zh),
      options: shuffle([w.bopo, ...variants]).map(b => ({ node: bopoWordEl(b, { class: "bopo-word--sm" }), ok: b === w.bopo })) };
  }
  const c = item.c;
  const pool = shuffle([...new Set([...c.confuse.split(""), ...focus.map(f => f.c.zh)])].filter(z => z !== c.zh)).slice(0, 3);
  return { item, key: c.zh, subject, prompt: charPromptEl(c, true), say: () => speakZh(c.word), sayAnswer: () => speakZh(`${c.zh}，${c.word}`),
    options: shuffle([c.zh, ...pool]).map(z => ({ node: el("span", { class: "g-opt__char", "data-nobopo": "1" }, z), ok: z === c.zh })) };
}

// 挑這一局要學的 6 個：先挑答錯過的、再挑還沒學會的，最後隨機補滿
function pickFocus(subject, n = 6) {
  if (subject === "en") {
    const prog = getProfile()?.progress || {};
    const pool = gameWordPool();
    const wrong = shuffle(pool.filter(w => (prog[w]?.wrong || 0) > 0 && !prog[w]?.mastered));
    const todo = shuffle(pool.filter(w => !prog[w]?.mastered && !wrong.includes(w)));
    const rest = shuffle(pool.filter(w => !wrong.includes(w) && !todo.includes(w)));
    return [...wrong, ...todo, ...rest].slice(0, n).map(key => ({ kind: "en", key }));
  }
  const prog = zhProgressOf();
  const charLessons = ZH.lessons.filter(l => l.kind === "chars");
  if (charLessons.length) {
    const chars = charLessons.flatMap(l => l.chars);
    const todo = shuffle(chars.filter(c => !prog[c.zh]?.mastered)), done = shuffle(chars.filter(c => prog[c.zh]?.mastered));
    return [...todo, ...done].slice(0, n).map(c => ({ kind: "zh2", key: c.zh, c }));
  }
  // 一年級：最新的一課優先
  const lessons = [...ZH.lessons].reverse();
  const words = lessons.flatMap(l => l.words);
  const todo = words.filter(w => !prog[w.zh]?.mastered), done = words.filter(w => prog[w.zh]?.mastered);
  const latest = new Set(lessons[0].words.map(w => w.zh));
  const ordered = [...shuffle(todo.filter(w => latest.has(w.zh))), ...shuffle(todo.filter(w => !latest.has(w.zh))), ...shuffle(done)];
  return ordered.slice(0, n).map(w => ({ kind: "zh1", key: w.zh, w }));
}

// === 一局的學習紀錄 ===
function makeLearnSession(subject) {
  const S = { subject, missed: new Map(), retry: [], asked: 0, taught: new Set() };
  if (subject === "math") {
    const gen = makeMathGen();
    S.focus = [];
    S.next = () => { S.asked++; const due = S.retry.findIndex(r => r.at <= S.asked); if (due >= 0) return S.retry.splice(due, 1)[0].q; return gen(); };
  } else {
    S.focus = pickFocus(subject);
    let order = [];
    S.next = () => {
      S.asked++;
      const due = S.retry.findIndex(r => r.at <= S.asked);
      const item = due >= 0 ? S.retry.splice(due, 1)[0].item : (order.length ? order : (order = shuffle(S.focus))).shift();
      return learnQuestion(item, S.focus, subject);
    };
  }
  // 答錯：記下來，2 題後再考一次（數學是同一題再算一次）
  S.miss = q => {
    const k = q.key;
    S.missed.set(k, q);
    if (!S.retry.some(r => (r.item ? r.item.key : r.q.key) === k)) S.retry.push(subject === "math"
      ? { q: { ...q, prompt: q.prompt.cloneNode(true), options: shuffle(q.options.map(o => ({ ...o, node: o.node.cloneNode(true) }))) }, at: S.asked + 2 }
      : { item: q.item, at: S.asked + 2 });
    const first = !S.taught.has(k); S.taught.add(k);
    return first;
  };
  const techList = MEMORY_TECHNIQUES[subject === "math" ? (CURRENT_GRADE === "g1" ? "math1" : "math") : subject === "en" ? "en" : (S.focus[0]?.kind === "zh2" ? "zh2" : "zh1")];
  S.technique = techList[Math.floor(Math.random() * techList.length)];
  return S;
}

// === 開始前：先學一學 ===
function learnFirst(sh, L, start) {
  const ov = el("div", { class: "g-teach g-teach--intro" });
  const close = () => { ov.remove(); start(); };
  const tech = techEl(L.technique, "記憶小撇步：");
  let body;
  if (L.subject === "math") {
    const ex = L.next(); L.asked = 0; L.retry.unshift({ q: ex, at: 1 }); // 範例題等一下第一題就考
    body = el("div", { class: "l-mathex" }, el("div", { class: "l-mathex__q", "data-nobopo": "1" }, ex.prompt.cloneNode(true)), mathStepsEl(ex.explain));
  } else {
    body = el("div", { class: "l-cards" }, L.focus.map(item => {
      const card = el("div", { class: "l-card" });
      card.append(el("button", { class: "l-card__hear", onclick: () => { learnSay(item); card.classList.add("l-card--seen"); } }, learnCard(item)), learnTipEl(item));
      return card;
    }));
  }
  ov.append(el("div", { class: "g-teach__panel" },
    el("div", { class: "g-teach__head" }, t(L.subject === "math" ? "🧠 先看怎麼算" : "🧠 先學一學：點卡片聽聽看")),
    el("div", { class: "g-teach__sub" }, t(L.subject === "math" ? "看完步驟再開始，等一下第一題就是它" : "這一局只會考這幾個，記住它們再開始！")),
    body, tech,
    el("button", { class: "btn btn--accent btn--xl btn--full", onclick: close }, t("我記好了，開始玩！ ▶"))));
  sh.root.appendChild(ov);
}

// === 答錯了：暫停，教一次正確答案和記憶方法 ===
function teachMiss(sh, L, q, cont) {
  const first = L.miss(q);
  if (!first) { cont(); return; }
  sh.pause(true);
  const ov = el("div", { class: "g-teach" });
  let body;
  if (L.subject === "math") {
    const right = q.options.find(o => o.ok);
    body = el("div", { class: "l-mathex" }, el("div", { class: "l-mathex__q", "data-nobopo": "1" }, q.prompt.cloneNode(true)),
      el("div", { class: "l-mathex__ans" }, t("答案是 "), right.node.cloneNode(true)), mathStepsEl(q.explain));
  } else {
    body = el("div", { class: "l-card l-card--big" }, learnCard(q.item), learnTipEl(q.item));
    learnSay(q.item);
  }
  const done = () => { ov.remove(); sh.pause(false); cont(); };
  ov.append(el("div", { class: "g-teach__panel" },
    el("div", { class: "g-teach__head" }, t("🧠 記一記")),
    el("div", { class: "g-teach__sub" }, t("沒關係！看一看、念一念，等一下會再考一次")),
    body,
    L.subject === "math" ? null : el("button", { class: "btn btn--ghost btn--full", onclick: () => learnSay(q.item) }, t("🔊 再聽一次")),
    el("button", { class: "btn btn--accent btn--xl btn--full", onclick: done }, t("記住了，繼續 👍"))));
  sh.root.appendChild(ov);
}

// === 結束時：要再記一記的＋記憶方法 ===
function learnSummary(L) {
  const missed = [...L.missed.values()];
  const tech = techEl(L.technique, "今天學一招：");
  if (!missed.length) return el("div", { class: "l-summary" }, el("div", { class: "l-summary__title" }, t("全部都記住了，太棒了！🌟")), tech);
  return el("div", { class: "l-summary" },
    el("div", { class: "l-summary__title" }, t("這幾個要再記一記（點一下聽）：")),
    el("div", { class: "l-summary__list" }, missed.map(q => {
      if (L.subject === "math") return el("div", { class: "l-summary__chip l-summary__chip--math", "data-nobopo": "1" }, q.prompt.cloneNode(true));
      return el("div", { class: "l-summary__chip" }, el("button", { class: "l-card__hear", onclick: () => learnSay(q.item) }, learnCard(q.item)), learnTipEl(q.item));
    })), tech);
}
