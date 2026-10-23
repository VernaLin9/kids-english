// 🧠 遊樂場的學習引擎：不是只考試，而是「先學、玩中練、錯了馬上教、等一下再考一次」
// 1. 專注組：每一局只挑 6 個要學的（先挑答錯過、還沒學會的），一局裡重複出現 → 真的記住
// 2. 先學一學：開始前看 6 張卡（圖、聲音、記憶小撇步），點卡片聽一次
// 3. 答錯就教：第一次錯會暫停遊戲，跳出「記一記」卡（正確答案＋記憶方法），2 題後再考一次
// 4. 結束時：列出要再記一記的，並教一個記憶方法（分段念、找部首、拆字、驗算…）

// 二年級第六課生字的拆字記憶（照課本部首）
const ZH2_MNEMONIC = {
  "自": "像鼻子的樣子👃，指著鼻子說：「我自己」",
  "己": "開口在右上，最後一筆往上鉤；己（開口）、已（開一半）、巳（關起來）要分清楚",
  "沙": "水（氵）＋少：水邊一小粒一小粒的，就是沙",
  "撿": "手（扌）＋僉：用手把垃圾撿起來；檢查的「檢」是木字旁",
  "垃": "土＋立：垃圾都是土部，垃圾掉在地上（土）",
  "圾": "土＋及：垃圾都是土部，垃圾掉在地上（土）",
  "眼": "目＋艮：「目」就是眼睛",
  "膠": "左邊的「月」是肉字旁，以前的膠是用動物的皮熬出來的",
  "對": "右邊是部首「寸」，先寫左邊，最後寫寸",
  "牠": "牛＋也：動物用「牠」，男生用「他」，女生用「她」",
  "安": "宀＋女：女生在屋子（宀）裡，很安全",
  "吧": "口＋巴：用嘴巴說的「吧」",
  "如": "女＋口：如果的「如」",
  "該": "言＋亥：言部，和說話有關（該怎麼做呢？）",
  "留": "上面是卯，下面是田；第三筆是「點」，不要忘了寫",
  "便": "人（亻）＋更；兩個音：ㄅㄧㄢˋ（便當、便條）、ㄆㄧㄢˊ（便宜）",
  "減": "左邊是三點水（氵），不是兩點；減少的「減」",
  "少": "「小」下面加一撇，就是「少」",
};
const RADICAL_MEANING = {
  "水": "和水有關", "手": "和手的動作有關", "土": "和泥土、地上有關", "目": "和眼睛有關", "肉": "和身體有關",
  "口": "和嘴巴有關", "言": "和說話有關", "人": "和人有關", "宀": "和房子有關", "女": "和女生有關", "牛": "和動物有關", "田": "和田地有關",
};

const MEMORY_TECHNIQUES = {
  en: [
    ["👏 拍手分段念", "長的字切成小段，一段拍一下手：pen · cil、e · ras · er"],
    ["🖼️ 想畫面", "念 apple 的時候，腦中想著一顆紅蘋果 🍎，字和圖連在一起就記得住"],
    ["🙈 看、蓋、寫、對", "先看字念一次，蓋起來自己拼拼看，再打開對答案"],
    ["📅 明天再玩一次", "隔一天再複習一次，記得最牢；錯過的字會先出來"],
  ],
  zh1: [
    ["🔤 拼讀口訣", "聲母＋韻母，再加上聲調：ㄌ＋ㄨ＋ㄛ＋ˊ＝ㄌㄨㄛˊ"],
    ["✋ 手比聲調", "一聲平平、二聲往上、三聲彎下再上、四聲往下，邊念邊用手比"],
    ["🗣️ 造句記", "用這個詞說一句話，例如：「菜園裡長出大蘿蔔」"],
    ["📅 明天再玩一次", "隔一天再複習一次，記得最牢；錯過的詞會先出來"],
  ],
  zh2: [
    ["🔍 找部首", "部首告訴你字的意思：扌和手有關、氵和水有關、土和地上有關"],
    ["✂️ 拆字記", "把字拆成兩半編故事：安＝宀＋女，女生在家裡很安全"],
    ["👀 比一比", "長得像的字找不一樣的地方：撿（用手）、檢（木頭）"],
    ["🙈 看、蓋、寫、對", "看一次、蓋起來寫、再打開對答案，錯的再寫一次"],
  ],
  math: [
    ["📏 先畫線段圖", "知道全部和其中一段，就用減法找另一段"],
    ["✅ 驗算", "減法的答案＋減掉的數＝原來的數，對了就放心"],
    ["🔟 借一當十", "個位不夠減，就向十位借 1 個十，變成 10 再減"],
    ["🖐️ 湊十", "8＋5：把 5 分成 2 和 3，8＋2＝10，再加 3＝13"],
  ],
  math1: [
    ["🖐️ 用手指數數", "加法往上數，減法往回數"],
    ["🔟 湊十", "9＋3：先拿 1 湊成 10，再加 2，就是 12"],
    ["🔗 加減是一家人", "3＋4＝7，所以 7−4＝3、7−3＝4"],
  ],
};

// === 每一種「要學的東西」：卡片、記憶小撇步、念出來、出題 ===
function learnTip(item) {
  if (item.kind === "en") {
    const w = item.key, info = WORDS[w];
    if (/^[A-Z][a-z]$/.test(w)) return `大寫 ${w[0]}、小寫 ${w[1]}，${info.emoji || ""} 念 ${info.speak || w[0]}`;
    if (SYLLABLES[w]) return `拍手分段念：${SYLLABLES[w].split("·").join(" · ")}`;
    if (w.includes(" ")) return `一個字一個字念：${w.split(" ").join(" · ")}`;
    return `看著 ${info.emoji || "圖"} 大聲念三次：${w}，再閉上眼睛拼一次`;
  }
  if (item.kind === "zh1") {
    return "拼一拼：" + item.w.bopo.split(" ").map(r => { const { symbols, tone } = splitSyl(r); return symbols.join("＋") + (tone ? `＋${tone}` : ""); }).join("　");
  }
  const c = item.c;
  const base = ZH2_MNEMONIC[c.zh] || `「${c.zh}」是${radicalLabel(c.radical)}部${RADICAL_MEANING[c.radical] ? "，" + RADICAL_MEANING[c.radical] : ""}`;
  return base;
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
  const tech = el("div", { class: "l-tech" }, el("div", { class: "l-tech__title" }, t(`記憶小撇步：${L.technique[0]}`)), el("div", { class: "l-tech__body" }, t(L.technique[1])));
  let body;
  if (L.subject === "math") {
    const ex = L.next(); L.asked = 0; L.retry.unshift({ q: ex, at: 1 }); // 範例題等一下第一題就考
    body = el("div", { class: "l-mathex" }, el("div", { class: "l-mathex__q", "data-nobopo": "1" }, ex.prompt.cloneNode(true)), el("div", { class: "l-mathex__steps" }, t(ex.explain || "")));
  } else {
    body = el("div", { class: "l-cards" }, L.focus.map(item => {
      const tip = el("div", { class: "l-card__tip" }, t(learnTip(item)));
      const card = el("button", { class: "l-card" }, learnCard(item), tip);
      card.addEventListener("click", () => { learnSay(item); card.classList.add("l-card--seen"); });
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
      el("div", { class: "l-mathex__ans" }, t("答案是 "), right.node.cloneNode(true)), el("div", { class: "l-mathex__steps" }, t(q.explain || "")));
  } else {
    body = el("div", { class: "l-card l-card--big" }, learnCard(q.item), el("div", { class: "l-card__tip" }, t(learnTip(q.item))));
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
  const tech = el("div", { class: "l-tech" }, el("div", { class: "l-tech__title" }, t(`今天學一招：${L.technique[0]}`)), el("div", { class: "l-tech__body" }, t(L.technique[1])));
  if (!missed.length) return el("div", { class: "l-summary" }, el("div", { class: "l-summary__title" }, t("全部都記住了，太棒了！🌟")), tech);
  return el("div", { class: "l-summary" },
    el("div", { class: "l-summary__title" }, t("這幾個要再記一記（點一下聽）：")),
    el("div", { class: "l-summary__list" }, missed.map(q => {
      if (L.subject === "math") return el("div", { class: "l-summary__chip l-summary__chip--math", "data-nobopo": "1" }, q.prompt.cloneNode(true));
      const b = el("button", { class: "l-summary__chip" }, learnCard(q.item), el("div", { class: "l-card__tip" }, t(learnTip(q.item))));
      b.addEventListener("click", () => learnSay(q.item));
      return b;
    })), tech);
}
