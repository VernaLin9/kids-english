// 🎮 學習遊戲（家長要求：不要用時間逼，要循序漸進、幫助大腦記住；遊戲要跟著每一課／每一週）
// 設計依據（教育研究常用的做法）：
//  - 提取練習＋間隔重複：答錯的 2 題後再考，寵物明天還會再問一次
//  - 不計時、錯了先教再試（鷹架）：答錯會出現圖卡／積木圖解，再選一次，改對也有獎勵（成長型思維）
//  - 教別人學得最牢（教學者效應）：「教寵物」念給牠聽
//  - 數學先具體再圖像再算式：積木、十格框
//  - 記憶地圖：把一課的字分類畫成一張圖，遮起來自己考自己
// 每個遊戲都用「章節題庫」questDeck(subject, chapterId)：英文＝一週、國語＝一課、數學＝一個單元

// === 章節 ===
function questChapters(subject) {
  if (subject === "en") return WEEKS.filter(w => w.words.length).map(w => ({ id: `week-${w.num}`, title: `第 ${w.num} 週`, sub: w.progress || "", emoji: "🔤" }));
  if (subject === "zh") return (ZH?.lessons || []).map(l => ({ id: l.id, title: l.title, titleBopo: l.titleBopo, emoji: l.emoji }));
  if (subject === "math") return (MATH?.units || []).map(u => ({ id: u.id, title: u.title, titleBopo: u.titleBopo, emoji: u.emoji }));
  return [];
}
// 預設章節：有考試日期在今天以後的先，沒有就最新的那一章（英文是本週）
function questDefaultChapter(subject) {
  const list = questChapters(subject);
  if (!list.length) return null;
  if (subject === "en") {
    const cw = getCurrentWeek();
    const cur = WEEKS.filter(w => w.words.length && w.num <= cw.num).pop();
    return cur ? `week-${cur.num}` : list[0].id;
  }
  const src = subject === "zh" ? ZH.lessons : MATH.units;
  const today = todayISO();
  const upcoming = src.filter(x => x.exam?.date >= today).sort((a, b) => a.exam.date.localeCompare(b.exam.date))[0];
  return (upcoming || src[src.length - 1]).id;
}
function questChapter(subject, id) {
  const list = questChapters(subject);
  return list.find(c => c.id === id) || list.find(c => c.id === questDefaultChapter(subject)) || list[0] || null;
}
const questChapterTitle = (subject, c) => c ? (c.titleBopo ? rubyEl(c.title, c.titleBopo, "span") : t(`${c.title}${c.sub ? "・" + c.sub : ""}`)) : t("");

// 這一章的「要學的東西」（英文單字、國語詞語／生字）
function questItems(subject, chapterId) {
  if (subject === "en") return resolveSet(chapterId).filter(w => WORDS[w]).map(key => ({ kind: "en", key }));
  if (subject === "zh") {
    const l = zhLesson(chapterId);
    if (!l) return [];
    return l.kind === "chars" ? l.chars.map(c => ({ kind: "zh2", key: c.zh, c })) : l.words.map(w => ({ kind: "zh1", key: w.zh, w }));
  }
  return [];
}
// 數學單元能不能出「加減」題（計時挑戰、積木教室要用）
const questMathIsCalc = (u) => !!u && u.kind === "calc" && u.topics.some(tp => ["word", "bond", "check", "vert", "cmp", "fifteen"].includes(tp));

// === 章節題庫：next() 回傳一張題卡 { key, item?, mount(container, onDone(firstTry), onWrong) } ===
// 答錯的 2 題後再出一次；priority 是要先問的（寵物記得昨天錯的）
function questDeck(subject, chapterId, { priority = [] } = {}) {
  const retry = [];
  let asked = 0;
  if (subject === "math") {
    const u = mathUnit(chapterId) || MATH.units[0];
    const calc = u.kind === "calc";
    const T = calc ? MATH2_TOPICS : MATH_TOPICS;
    let order = [];
    const make = (tp) => {
      const q = T[tp].gen();
      return {
        key: tp, topic: tp,
        mount(container, onDone, onWrong) {
          if (calc) mountMath2Q(q, container, missed => onDone(!missed), onWrong);
          else mountMathQ(q, container, onDone, tp, onWrong);
        },
      };
    };
    return {
      subject, chapterId, unit: u,
      next() {
        asked++;
        const due = retry.findIndex(r => r.at <= asked);
        const tp = due >= 0 ? retry.splice(due, 1)[0].key : (order.length ? order : (order = shuffle(u.topics))).shift();
        return make(tp);
      },
      missed(key) { if (!retry.some(r => r.key === key)) retry.push({ key, at: asked + 2 }); },
    };
  }
  const items = questItems(subject, chapterId);
  const byKey = new Map(items.map(it => [it.key, it]));
  let order = [];
  const first = priority.filter(k => byKey.has(k));
  const make = (item) => ({
    key: item.key, item,
    mount(container, onDone, onWrong) { mountChoiceCard(item, items, subject, container, onDone, onWrong); },
  });
  return {
    subject, chapterId, items,
    next() {
      asked++;
      const due = retry.findIndex(r => r.at <= asked);
      if (due >= 0) return make(byKey.get(retry.splice(due, 1)[0].key));
      if (first.length) return make(byKey.get(first.shift()));
      if (!order.length) order = shuffle(items);
      return make(order.shift());
    },
    missed(key) { if (!retry.some(r => r.key === key)) retry.push({ key, at: asked + 2 }); },
  };
}
// 英文／國語：四選一；答錯先看圖卡和小撇步，再選一次（不扣時間）
function mountChoiceCard(item, items, subject, container, onDone, onWrong) {
  const q = learnQuestion(item, items, subject);
  let tries = 0, locked = false;
  const teach = el("div", {});
  const feedback = el("div", { class: "quiz-feedback" });
  const record = ok => { if (subject === "en") recordWord(item.key, ok); else recordZh(item.key, ok); };
  const opts = el("div", { class: "qz-opts" }, q.options.map(o => {
    const b = el("button", { class: "zh-opt qz-opt" }, o.node);
    b.addEventListener("click", () => {
      if (locked) return;
      if (o.ok) {
        locked = true; b.classList.add("zh-opt--ok"); dingCorrect(); q.sayAnswer?.();
        if (tries === 0) record(true);
        feedback.textContent = tries === 0 ? "答對了！🎉" : "改對了！很棒 👍"; feedback.className = "quiz-feedback quiz-feedback--correct pop";
        onDone(tries === 0);
      } else {
        if (tries === 0) record(false);
        tries++; b.classList.add("zh-opt--bad"); b.disabled = true; buzzWrong();
        feedback.textContent = "沒關係，看一看再選一次"; feedback.className = "quiz-feedback quiz-feedback--wrong shake";
        teach.replaceChildren(el("div", { class: "l-card l-card--big qz-teach" }, el("button", { class: "l-card__hear", onclick: () => learnSay(item) }, learnCard(item)), learnTipEl(item)));
        learnSay(item);
        onWrong?.();
      }
    });
    return b;
  }));
  container.replaceChildren(el("div", { class: "qz-prompt" }, el("div", { class: "qz-prompt__q" }, q.prompt),
    el("button", { class: "icon-btn icon-btn--accent qz-speak", onclick: () => q.say(), "aria-label": "念題目" }, "🔊")), opts, feedback, teach);
  setTimeout(() => q.say(), 250);
}

function questProfile() {
  const p = getProfile();
  if (!p) return { topWins: 0 };
  return (p.quest = p.quest || { topWins: 0 });
}
const questBack = (subject, c) => `#/games?s=${subject}&c=${encodeURIComponent(c)}`;
function questShell(title, subject, c) {
  const root = el("div", { class: "qs-root" });
  const header = renderHeader(title, { back: questBack(subject, c) });
  root.appendChild(header);
  const app = el("main", { class: "app qs-app" });
  root.appendChild(app);
  return { root, app, progress: $(".header__progress", header) };
}
// 結束時列出這一局錯過的（點一下聽）
function questMissedList(subject, missed) {
  if (!missed.length) return el("div", { class: "l-summary" }, el("div", { class: "l-summary__title" }, t("全部第一次就答對，太棒了！🌟")));
  return el("div", { class: "l-summary" }, el("div", { class: "l-summary__title" }, t("這幾個要再記一記（點一下聽）：")),
    el("div", { class: "l-summary__list" }, missed.map(card => card.item
      ? el("div", { class: "l-summary__chip" }, el("button", { class: "l-card__hear", onclick: () => learnSay(card.item) }, learnCard(card.item)), learnTipEl(card.item))
      : el("div", { class: "l-summary__chip l-summary__chip--math" }, t(`${(MATH2_TOPICS[card.key] || MATH_TOPICS[card.key])?.emoji || ""} ${(MATH2_TOPICS[card.key] || MATH_TOPICS[card.key])?.name || ""}`)))));
}

// =====================================================================
// 🌀 陀螺對戰：跟電腦 PK。答對＝陀螺攻擊；第一次就對是「必殺技」。不計時，錯了先學再答
// =====================================================================
const TOPS = [
  { id: "fire",   name: "火焰", emoji: "🔥", c1: "#ff5e5e", c2: "#ffb020", need: 0 },
  { id: "wave",   name: "海浪", emoji: "🌊", c1: "#3d8bff", c2: "#7fe3ff", need: 0 },
  { id: "leaf",   name: "旋風", emoji: "🍃", c1: "#2fb873", c2: "#c8f06b", need: 0 },
  { id: "bolt",   name: "雷電", emoji: "⚡", c1: "#7a4dff", c2: "#ffe14d", need: 3 },
  { id: "dragon", name: "神龍", emoji: "🐉", c1: "#ff3d8b", c2: "#6a2cff", need: 6 },
  { id: "star",   name: "星光", emoji: "🌟", c1: "#ffc400", c2: "#fff3a0", need: 10 },
];
const topEl = (tp, cls = "") => el("div", { class: `qt-top ${cls}`, style: `--c1:${tp.c1}; --c2:${tp.c2};` }, el("div", { class: "qt-top__disc" }), el("div", { class: "qt-top__core" }, tp.emoji));

function renderQuestTop(subject, c) {
  const ch = questChapter(subject, c); c = ch?.id;
  const sh = questShell("🌀 陀螺對戰", subject, c);
  const qp = questProfile();
  const pick = () => {
    sh.app.replaceChildren(
      el("div", { class: "qs-intro" }, t("選一顆你的陀螺！答對題目就能攻擊，第一次就答對會放「必殺技」。不用急，慢慢想。")),
      el("div", { class: "qs-chapter" }, t("這一局練："), questChapterTitle(subject, ch)),
      el("div", { class: "qt-pick" }, TOPS.map(tp => {
        const locked = (qp.topWins || 0) < tp.need;
        const b = el("button", { class: `qt-pick__item ${locked ? "qt-pick__item--locked" : ""}` }, topEl(tp, "qt-top--sm qt-top--spin"),
          el("span", { class: "qt-pick__name" }, t(tp.name)), locked ? el("span", { class: "qt-pick__lock" }, t(`🔒 贏 ${tp.need} 場`)) : null);
        b.addEventListener("click", () => { if (locked) { buzzWrong(); return; } qp.top = tp.id; saveStore(); battle(tp); });
        return b;
      })),
      el("div", { class: "progress-note", style: "text-align: center;" }, t(`已經贏了 ${qp.topWins || 0} 場`)));
  };
  const battle = (me) => {
    const cpu = shuffle(TOPS.filter(x => x.id !== me.id))[0];
    const deck = questDeck(subject, c);
    const MAX_ME = 12, MAX_CPU = 20;
    let hpMe = MAX_ME, hpCpu = MAX_CPU, round = 0, first = 0, total = 0;
    const missed = [];
    const bar = (cls) => el("div", { class: `qt-hp ${cls}` }, el("div", { class: "qt-hp__fill" }));
    const hpMeEl = bar("qt-hp--me"), hpCpuEl = bar("qt-hp--cpu");
    const meTop = topEl(me, "qt-top--me"), cpuTop = topEl(cpu, "qt-top--cpu");
    const say = el("div", { class: "qt-say" });
    const arena = el("div", { class: "qt-arena" }, el("div", { class: "qt-dish" }, meTop, cpuTop), say);
    const card = el("div", { class: "qt-card" });
    const hud = el("div", { class: "qt-hud" },
      el("div", { class: "qt-hud__side" }, el("span", { class: "qt-hud__name" }, t(`我 ${me.name}`)), hpMeEl),
      el("div", { class: "qt-hud__vs", "data-nobopo": "" }, "VS"),
      el("div", { class: "qt-hud__side qt-hud__side--cpu" }, el("span", { class: "qt-hud__name" }, t(`電腦 ${cpu.name}`)), hpCpuEl));
    const draw = () => {
      hpMeEl.firstChild.style.width = `${Math.max(0, hpMe) / MAX_ME * 100}%`;
      hpCpuEl.firstChild.style.width = `${Math.max(0, hpCpu) / MAX_CPU * 100}%`;
    };
    const anim = (node, cls, ms = 700) => { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); setTimeout(() => node.classList.remove(cls), ms); };
    const talk = (text) => { say.replaceChildren(t(text)); anim(say, "pop", 400); };
    const end = (win) => {
      sh.progress.textContent = "";
      const ratio = total ? first / total : 0;
      const stars = win ? (ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1) : 0;
      if (win) { qp.topWins = (qp.topWins || 0) + 1; const p = getProfile(); if (p) p.stars = (p.stars || 0) + stars * 2; saveStore(); setTimeout(() => confetti(), 200); }
      const unlocked = TOPS.find(tp => tp.need === qp.topWins);
      sh.app.replaceChildren(el("div", { class: "g-over pop" },
        el("div", { class: "g-over__emoji" }, win ? "🏆" : "💪"),
        el("div", { class: "g-over__rating" }, [0, 1, 2].map(i => el("span", { class: `g-over__star ${i < stars ? "g-over__star--on" : ""}`, style: `animation-delay:${0.25 + i * 0.25}s;` }, "★"))),
        el("div", { class: "g-over__score" }, t(win ? "你贏了！" : "陀螺停下來了")),
        el("div", { class: "g-over__msg" }, t(`第一次就答對 ${first} / ${total} 題`)),
        unlocked && win ? el("div", { class: "qt-unlock" }, topEl(unlocked, "qt-top--sm qt-top--spin"), t(`解鎖新陀螺：${unlocked.name}！`)) : null,
        questMissedList(subject, missed),
        el("div", { class: "g-over__btns" },
          el("button", { class: "btn btn--accent btn--xl", onclick: () => battle(me) }, t("🔁 再打一場")),
          el("button", { class: "btn", onclick: pick }, t("換陀螺")),
          el("button", { class: "btn btn--ghost", onclick: () => navigate(questBack(subject, c)) }, t("回到遊戲")))));
    };
    const nextRound = () => {
      if (hpCpu <= 0) return end(true);
      if (hpMe <= 0) return end(false);
      round++; total++;
      sh.progress.textContent = `第 ${round} 回合`;
      const q = deck.next();
      let wrongOnce = false;
      talk(round === 1 ? "回答題目來攻擊！不用急，慢慢想" : "下一題！");
      q.mount(card, firstTry => {
        if (firstTry) { first++; hpCpu -= 3; talk("必殺技！💥 第一次就答對"); anim(meTop, "qt-top--dash-me", 800); setTimeout(() => anim(cpuTop, "qt-top--hit", 600), 350); fxHit(cpuTop, 3); }
        else { hpCpu -= 2; talk("改對了！普通攻擊 👊"); anim(meTop, "qt-top--dash-me", 800); setTimeout(() => anim(cpuTop, "qt-top--hit", 600), 350); fxPop(cpuTop, "-2"); }
        draw();
        setTimeout(nextRound, 1700);
      }, () => {
        if (wrongOnce) return; wrongOnce = true;
        missed.push(q); deck.missed(q.key);
        hpMe -= 1; draw(); talk("電腦反擊了！看一看提示，再答一次");
        anim(cpuTop, "qt-top--dash-cpu", 800); setTimeout(() => anim(meTop, "qt-top--hit", 600), 350);
      });
    };
    sh.app.replaceChildren(hud, arena, card);
    draw();
    // 發射！
    const launch = el("button", { class: "btn btn--accent btn--xl btn--full qt-launch" }, t("3、2、1，發射！🚀"));
    card.replaceChildren(launch);
    meTop.classList.add("qt-top--wait"); cpuTop.classList.add("qt-top--wait");
    launch.addEventListener("click", () => {
      dingCorrect();
      meTop.classList.remove("qt-top--wait"); cpuTop.classList.remove("qt-top--wait");
      anim(meTop, "qt-top--launch", 700); anim(cpuTop, "qt-top--launch", 700);
      setTimeout(nextRound, 700);
    });
    talk(`我的${me.name} 對上 電腦的${cpu.name}！`);
  };
  pick();
  return sh.root;
}

// =====================================================================
// 🐾 養寵物：寵物不會的，你來教牠。教一題餵一次；錯的明天牠還會再問（間隔重複）
// =====================================================================
const PETS = [
  { id: "dog", name: "小狗", emoji: "🐶", food: "🦴" },
  { id: "cat", name: "小貓", emoji: "🐱", food: "🐟" },
  { id: "rabbit", name: "兔子", emoji: "🐰", food: "🥕" },
  { id: "panda", name: "熊貓", emoji: "🐼", food: "🎋" },
  { id: "fox", name: "狐狸", emoji: "🦊", food: "🍇" },
  { id: "hamster", name: "倉鼠", emoji: "🐹", food: "🌻" },
];
const PET_LEVELS = [0, 8, 20, 36, 56, 80, 110];
const PET_HATS = ["", "🎀", "🎀", "🎩", "🎩", "👑", "👑"];
const petLevel = (xp) => PET_LEVELS.filter(v => xp >= v).length; // 1..7
const PET_FEEDS = 8;

function renderQuestPet(subject, c) {
  const ch = questChapter(subject, c); c = ch?.id;
  const sh = questShell("🐾 養寵物", subject, c);
  const qp = questProfile();
  const today = todayISO();
  const tomorrow = (() => { const d = new Date(TODAY); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })();
  const choose = () => {
    sh.app.replaceChildren(
      el("div", { class: "qs-intro" }, t("選一隻你喜歡的小寵物！牠什麼都不會，要靠你教牠。你教牠一題，就可以餵牠吃一次東西。")),
      el("div", { class: "qp-pick" }, PETS.map(pt => el("button", { class: "qp-pick__item", onclick: () => { qp.pet = { kind: pt.id, xp: 0, day: today, fed: 0, memory: {} }; saveStore(); home(); } },
        el("span", { class: "qp-pick__emoji" }, pt.emoji), el("span", { class: "qp-pick__name" }, t(pt.name))))));
  };
  const petOf = () => PETS.find(x => x.id === qp.pet?.kind) || PETS[0];
  const petView = (cls = "") => {
    const lv = petLevel(qp.pet.xp);
    return el("div", { class: `qp-pet ${cls}`, style: `--size:${70 + lv * 10}px` }, PET_HATS[lv - 1] ? el("span", { class: "qp-pet__hat" }, PET_HATS[lv - 1]) : null, el("span", { class: "qp-pet__body" }, petOf().emoji));
  };
  const xpBar = () => {
    const lv = petLevel(qp.pet.xp), lo = PET_LEVELS[lv - 1], hi = PET_LEVELS[lv] ?? (lo + 40);
    return el("div", { class: "qp-xp" }, el("span", { class: "qp-xp__lv", "data-nobopo": "" }, `Lv ${lv}`),
      el("div", { class: "qp-xp__bar" }, el("div", { class: "qp-xp__fill", style: `width:${Math.min(100, (qp.pet.xp - lo) / (hi - lo) * 100)}%` })));
  };
  const belly = () => el("div", { class: "qp-belly" }, t("肚子："), el("span", { class: "qp-belly__food" }, Array.from({ length: PET_FEEDS }, (_, i) => el("span", { class: i < qp.pet.fed ? "qp-belly__on" : "qp-belly__off" }, petOf().food))));
  const memKey = `${subject}:${c}`;
  const dueKeys = () => Object.entries(qp.pet.memory?.[memKey] || {}).filter(([, d]) => d <= today).map(([k]) => k);
  const home = () => {
    if (qp.pet.day !== today) { qp.pet.day = today; qp.pet.fed = 0; saveStore(); }
    const pet = petOf(), due = dueKeys();
    const full = qp.pet.fed >= PET_FEEDS;
    sh.app.replaceChildren(el("div", { class: "qp-room" },
      el("div", { class: "qp-bubble" }, t(full ? "我今天吃飽了！明天再來教我好嗎？" : due.length ? `主人！昨天教我的 ${due.length} 個，我有點忘了，再教我一次好嗎？` : `主人，我肚子餓了！教我這一課，我就會長大喔`)),
      petView("qp-pet--idle"), xpBar(), belly()),
      el("div", { class: "qs-chapter" }, t("今天教牠："), questChapterTitle(subject, ch)),
      el("button", { class: "btn btn--accent btn--xl btn--full", onclick: () => teach() }, t(full ? "🍪 再陪牠學一下" : `📚 開始教${pet.name}`)),
      el("div", { class: "qs-tip" }, t("🧠 小祕訣：答對以後，大聲念給寵物聽一次。教別人的時候，自己會記得更牢！")),
      el("button", { class: "btn btn--ghost btn--full", style: "margin-top: 8px;", onclick: () => { if (confirm("要換一隻寵物嗎？現在這隻的等級會重新開始")) { qp.pet = null; saveStore(); choose(); } } }, t("換一隻寵物")));
  };
  const teach = () => {
    const pet = petOf();
    const due = dueKeys();
    const deck = questDeck(subject, c, { priority: subject === "math" ? [] : due });
    let n = 0, first = 0;
    const missed = [];
    const petBox = el("div", { class: "qp-mini" });
    const bubble = el("div", { class: "qp-bubble qp-bubble--sm" });
    const card = el("div", { class: "qp-card" });
    const drawPet = () => petBox.replaceChildren(petView("qp-pet--sm"), el("div", {}, xpBar(), belly()));
    const one = () => {
      if (n >= PET_FEEDS) return done();
      n++;
      sh.progress.textContent = `${n}/${PET_FEEDS}`;
      const q = deck.next();
      const isDue = due.includes(q.key);
      bubble.replaceChildren(t(isDue ? "這個昨天學過，我有點忘了，再教我一次？" : subject === "math" ? "這題要怎麼做？教教我！" : "這個要選哪一個？你教我好嗎？"));
      let wrongOnce = false;
      q.mount(card, firstTry => {
        const lvBefore = petLevel(qp.pet.xp);
        qp.pet.xp += firstTry ? 2 : 1; qp.pet.fed = Math.min(PET_FEEDS, qp.pet.fed + 1);
        if (firstTry) first++;
        // 記憶：錯過的明天再問；這次第一次就對的從記憶裡拿掉
        const mem = (qp.pet.memory[memKey] = qp.pet.memory[memKey] || {});
        if (subject !== "math") { if (wrongOnce) mem[q.key] = tomorrow; else if (firstTry) delete mem[q.key]; }
        saveStore();
        const food = el("span", { class: "qp-food" }, pet.food);
        petBox.appendChild(food);
        setTimeout(() => food.remove(), 900);
        drawPet();
        const leveled = petLevel(qp.pet.xp) > lvBefore;
        bubble.replaceChildren(t(leveled ? `我長大了！升到 Lv ${petLevel(qp.pet.xp)} 🎉` : firstTry ? "好好吃！謝謝你教我 😋" : "我懂了！謝謝你陪我一起想 😊"));
        if (leveled) confetti(40);
        petBox.querySelector(".qp-pet")?.classList.add("qp-pet--eat");
        // 教學者效應：請他念給寵物聽
        const sayIt = q.item ? el("button", { class: "btn btn--full qp-teachback", onclick: () => learnSay(q.item) }, t(`🗣️ 大聲念給${pet.name}聽一次（按這裡先聽）`)) : null;
        const nextBtn = el("button", { class: "btn btn--accent btn--xl btn--full", onclick: one }, t(n >= PET_FEEDS ? "看看寵物 ▶" : "下一題 ▶"));
        card.append(el("div", { class: "qp-after" }, sayIt, nextBtn));
      }, () => {
        if (wrongOnce) return; wrongOnce = true;
        missed.push(q); deck.missed(q.key);
        bubble.replaceChildren(t("沒關係，我們一起看看～"));
      });
    };
    const done = () => {
      sh.progress.textContent = "";
      const p = getProfile(); if (p) { p.stars = (p.stars || 0) + first; saveStore(); }
      sh.app.replaceChildren(el("div", { class: "g-over pop" },
        petView("qp-pet--happy"),
        el("div", { class: "g-over__score" }, t(qp.pet.fed >= PET_FEEDS ? "吃飽飽了！" : "學好多！")),
        el("div", { class: "g-over__msg" }, t(`你教了 ${PET_FEEDS} 題，第一次就答對 ${first} 題`)),
        missed.length && subject !== "math" ? el("div", { class: "qs-tip" }, t("錯過的，寵物明天會再問你一次，這樣會記得更久。")) : null,
        questMissedList(subject, missed),
        el("div", { class: "g-over__btns" },
          el("button", { class: "btn btn--accent btn--xl", onclick: home }, t("🏠 回寵物的家")),
          el("button", { class: "btn btn--ghost", onclick: () => navigate(questBack(subject, c)) }, t("回到遊戲")))));
    };
    sh.app.replaceChildren(el("div", { class: "qp-top" }, petBox, bubble), card);
    drawPet();
    one();
  };
  if (qp.pet && !qp.pet.memory) qp.pet.memory = {};
  if (!qp.pet) choose(); else home();
  return sh.root;
}

// =====================================================================
// 🗺️ 記憶地圖：一課的字分類畫成一張圖（部首、聲調、單字類別），點一下聽；可以遮起來自己考自己
// =====================================================================
const TONE_NAMES = [["", "一聲"], ["ˊ", "二聲"], ["ˇ", "三聲"], ["ˋ", "四聲"], ["˙", "輕聲"]];
function mindMapGroups(subject, c) {
  const items = questItems(subject, c);
  const groups = new Map();
  const add = (key, label, item) => { if (!groups.has(key)) groups.set(key, { label, items: [] }); groups.get(key).items.push(item); };
  if (subject === "en") items.forEach(it => { const cat = CATEGORIES.find(x => x.id === WORDS[it.key].category); add(cat?.id || "x", `${cat?.emoji || ""} ${cat?.name || "其他"}`, it); });
  else if (items[0]?.kind === "zh2") items.forEach(it => add(it.c.radical, `${radicalLabel(it.c.radical)}部${RADICAL_MEANING[it.c.radical] ? "・" + RADICAL_MEANING[it.c.radical] : ""}`, it));
  else items.forEach(it => { const tn = splitSyl(it.w.bopo.split(" ")[0]).tone; add(tn || "1", `第一個字是${TONE_NAMES.find(x => x[0] === tn)[1]}`, it); });
  return [...groups.values()].sort((a, b) => b.items.length - a.items.length);
}
function renderMindMap(subject, c) {
  const ch = questChapter(subject, c); c = ch?.id;
  const sh = questShell("🗺️ 記憶地圖", subject, c);
  const groups = mindMapGroups(subject, c);
  let hide = false;
  const COLORS = ["#ff8fb8", "#7fb2ff", "#5fd3a8", "#ffc15e", "#b892ff", "#7fd6e6", "#ff9f80"];
  const draw = () => {
    sh.app.replaceChildren(
      el("div", { class: "qs-intro" }, t(hide ? "🙈 遮起來了！先在心裡說答案，再點一下打開看對不對" : "把一課的字分成幾群，一群一群記比較容易。點一下聽聽看")),
      el("button", { class: `btn btn--full ${hide ? "btn--accent" : ""}`, onclick: () => { hide = !hide; draw(); } }, t(hide ? "👀 全部打開" : "🙈 遮起來考自己")),
      el("div", { class: "mm" },
        el("div", { class: "mm-center" }, el("span", { class: "mm-center__emoji" }, ch?.emoji || "📖"), questChapterTitle(subject, ch)),
        el("div", { class: "mm-branches" }, groups.map((g, gi) => el("div", { class: "mm-branch", style: `--bc:${COLORS[gi % COLORS.length]}` },
          el("div", { class: "mm-branch__head" }, t(g.label)),
          el("div", { class: "mm-leaves" }, g.items.map(it => mindLeaf(it, hide))))))));
  };
  draw();
  return sh.root;
}
function mindLeaf(it, hide) {
  let open = !hide;
  const b = el("button", { class: "mm-leaf" });
  const face = () => {
    if (it.kind === "en") { const w = WORDS[it.key]; return [el("span", { class: "mm-leaf__emoji" }, w.emoji || "🔤"), open ? el("span", { class: "mm-leaf__en", "data-nobopo": "" }, it.key) : el("span", { class: "mm-leaf__q" }, "？"), rubyEl(w.zh, w.bopo, "span", { class: "mm-leaf__sub" })]; }
    if (it.kind === "zh2") return [open ? rubyEl(it.c.zh, it.c.bopo, "span", { class: "mm-leaf__char" }) : el("span", { class: "mm-leaf__q" }, "？"), rubyEl(it.c.word, it.c.wordBopo, "span", { class: "mm-leaf__sub" })];
    return [el("span", { class: "mm-leaf__emoji" }, it.w.emoji || "📖"), open ? rubyEl(it.w.zh, it.w.bopo, "span", { class: "mm-leaf__zh" }) : el("span", { class: "mm-leaf__zh", "data-nobopo": "" }, it.w.zh)];
  };
  b.replaceChildren(...face());
  b.addEventListener("click", () => { if (!open) { open = true; b.replaceChildren(...face()); b.classList.add("mm-leaf--open"); } learnSay(it); });
  return b;
}

// =====================================================================
// 🧱 積木教室（數學）：先看積木怎麼算，再換你算一題；不計時
// =====================================================================
function renderBlocksClass(c) {
  const ch = questChapter("math", c); c = ch?.id;
  const sh = questShell("🧱 積木教室", "math", c);
  const g1 = CURRENT_GRADE === "g1";
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  // 範例：進位加法、退位減法、不用進退位的、湊十（一位數）
  const carryAdd = () => { const a = ri(1, 5) * 10 + ri(3, 9), a1 = a % 10, b1 = ri(Math.max(1, 10 - a1), 9), b = Math.min(ri(1, 3), Math.floor((99 - a - b1) / 10)) * 10 + b1; return { op: "add", a, b }; };
  const borrowSub = () => { const t10 = ri(3, 9), t1 = ri(0, 7), T = t10 * 10 + t1, b = ri(1, t10 - 1) * 10 + ri(t1 + 1, 9); return { op: "sub", a: T, b }; };
  const makeTen = () => { const a = ri(6, 9); return { op: "add", a, b: ri(11 - a, 9) }; };
  const breakTen = () => { const b = ri(4, 9); return { op: "sub", a: ri(11, 9 + b), b }; };
  const examples = g1
    ? [() => ({ op: "add", a: ri(2, 6), b: ri(1, 3) }), () => ({ op: "sub", a: ri(6, 10), b: ri(1, 5) }), makeTen, breakTen]
    : [carryAdd, borrowSub, makeTen, breakTen];
  let k = 0;
  const step = () => {
    const calc = examples[k % examples.length]();
    sh.progress.textContent = `第 ${k + 1} 題`;
    const area = el("div", {});
    sh.app.replaceChildren(el("div", { class: "qs-intro" }, t("先跟著積木看一次怎麼算，看懂了換你算")), area);
    area.appendChild(blocksTeachEl(calc, () => {
      // 換你算：同一種算法、不同數字
      const mine = examples[k % examples.length]();
      const ans = mine.op === "add" ? mine.a + mine.b : mine.a - mine.b;
      const q = { text: "換你算算看", visual: el("div", { class: "b2-eq" }, `${mine.a} ${mine.op === "add" ? "+" : "−"} ${mine.b} = ?`), calc: mine,
        steps: [{ type: "num", label: "答案是多少？（不會就按下面的積木看）", answer: ans }], hint: mine.op === "add" ? "個位先加，滿 10 換一條" : "個位不夠減，就拆一條變 10 個" };
      mountMath2Q(q, area, () => {
        area.append(el("button", { class: "btn btn--accent btn--xl btn--full", style: "margin-top: 12px;", onclick: () => { k++; step(); } }, t("下一題 ▶")));
      });
    }));
  };
  step();
  return sh.root;
}

// =====================================================================
// 🎮 遊戲首頁：先選章節（預設是要考的那一課）→ 學習遊戲（不計時）→ 練熟了再挑戰（計時）
// =====================================================================
function renderGames(subjectParam, chapterParam) {
  const profile = getProfile();
  const subjects = gameSubjects();
  const subject = subjects.some(([id]) => id === subjectParam) ? subjectParam : (subjects.some(([id]) => id === profile?.subject) ? profile.subject : "en");
  const chapters = questChapters(subject);
  const ch = questChapter(subject, chapterParam);
  const c = ch?.id;
  const root = el("div", {});
  root.appendChild(renderHeader("🎮 遊戲", { back: "#/" }));
  const app = el("main", { class: "app" });
  if (subjects.length > 1) app.appendChild(el("div", { class: `subject-tabs subject-tabs--${subjects.length}` },
    subjects.map(([id, label]) => el("button", { class: `subject-tab subject-tab--${id} ${subject === id ? "subject-tab--on" : ""}`, onclick: () => navigate(`#/games?s=${id}`) }, t(label)))));
  if (!ch) { app.appendChild(el("div", { class: "empty" }, t("這一科還沒有內容"))); root.appendChild(app); return root; }
  app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t("📚 練哪一課？")),
    el("div", { class: "qs-chips" }, chapters.map(x => el("button", { class: `qs-chip ${x.id === c ? "qs-chip--on" : ""}`, onclick: () => navigate(questBack(subject, x.id)) },
      el("span", {}, x.emoji), questChapterTitle(subject, x))))));
  const card = (emoji, name, desc, hash, cls) => el("button", { class: `g-card ${cls}`, onclick: () => navigate(hash) },
    el("span", { class: "g-card__emoji" }, emoji),
    el("span", { class: "g-card__body" }, el("span", { class: "g-card__name" }, t(name)), el("span", { class: "g-card__desc" }, t(desc))),
    el("span", { class: "g-card__go" }, "▶"));
  const q = `s=${subject}&c=${encodeURIComponent(c)}`;
  const u = subject === "math" ? mathUnit(c) : null;
  const learn = [
    card("🌀", "陀螺對戰", "跟電腦PK！答對就攻擊，第一次答對放必殺技。不計時", `#/quest/top?${q}`, "g-card--candy-2"),
    card("🐾", "養寵物", "寵物不會的你來教牠，教一題餵一次。錯的牠明天會再問", `#/quest/pet?${q}`, "g-card--candy-1"),
  ];
  if (subject !== "math") learn.push(card("🗺️", "記憶地圖", "把這一課的字分成幾群畫成一張圖，遮起來考自己", `#/mindmap?${q}`, "g-card--candy-3"));
  else if (questMathIsCalc(u)) learn.push(card("🧱", "積木教室", "用積木一步一步看加減法怎麼算，再換你算", `#/blocks?c=${encodeURIComponent(c)}`, "g-card--candy-3"));
  app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t("🧠 學習遊戲（不計時，慢慢想）")),
    el("div", { class: "g-list" }, learn)));
  if (typeof NIGHT_BOOTHS !== "undefined" && nightMathOk(subject, c)) app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t("🏮 夜市遊戲（不計時，答對拿彩票換獎品）")),
    el("div", { class: "g-list g-list--night" }, NIGHT_BOOTHS.map(b => card(b.emoji, b.name, b.desc, `#/night/${b.id}?${q}`, `g-card--${b.color} g-card--small`)))));
  const timedOk = subject !== "math"; // 數學要慢慢想，不放計時遊戲
  if (timedOk) app.appendChild(el("section", { class: "section" },
    el("div", { class: "section__title" }, t("⏱ 練熟了再挑戰（有時間限制）")),
    el("div", { class: "qs-tip" }, t("先用上面的學習遊戲練熟，再來挑戰速度，比較不會手忙腳亂。")),
    el("div", { class: "g-list g-list--timed" }, GAMES.map(g => {
      const best = gameBest(g.id, subject);
      return el("button", { class: `g-card g-card--small g-card--${g.color}`, onclick: () => navigate(`#/game/${g.id}?${q}`) },
        el("span", { class: "g-card__emoji" }, g.emoji),
        el("span", { class: "g-card__body" }, el("span", { class: "g-card__name" }, t(g.name)), el("span", { class: "g-card__best" }, best ? t(`🏆 最高分 ${best}`) : t("還沒玩過"))),
        el("span", { class: "g-card__go" }, "▶"));
    }))));
  root.appendChild(app);
  return root;
}
// 每一課／單元／週的頁面上放的入口
function questEntryBtn(subject, c) {
  return el("button", { class: "g-home qs-entry", onclick: () => navigate(questBack(subject, c)) },
    el("span", { class: "g-home__emoji" }, "🎮"),
    el("span", { class: "g-home__text" }, t("用遊戲練這一課"), el("span", { class: "g-home__sub" }, t("陀螺對戰・養寵物・夜市・記憶地圖"))),
    el("span", { class: "g-home__go" }, "▶"));
}
