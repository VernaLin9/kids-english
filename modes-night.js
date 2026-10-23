// 🏮 夜市遊戲（家長要求：不要太急、適合慢慢回答，而且要能教、幫助記憶）
// 三個攤位都不計時：🎯 套圈圈、🐟 撈金魚、🧸 夾娃娃
// 每一輪一題四選一：選對 → 拿一張彩票 🎟️；選錯 → 先看「記一記」再選一次（改對也有彩票，只是第一次就對多一張）
// 錯的 2 輪後再考一次；10 輪結束用彩票換獎品（獎品櫃 profile.quest.prizes）
// 英文／國語用這一課的字（questItems）；數學只在加減單元出現（makeMathGen，錯了看 🧱 積木）

const NIGHT_BOOTHS = [
  { id: "ring", emoji: "🎯", name: "套圈圈", desc: "把圈圈丟到對的答案上", color: "candy-1" },
  { id: "fish", emoji: "🐟", name: "撈金魚", desc: "金魚慢慢游，撈起對的那一條（不計時）", color: "candy-2" },
  { id: "claw", emoji: "🧸", name: "夾娃娃", desc: "把夾子移到對的娃娃上面，按「夾」", color: "candy-3" },
];
const NIGHT_PRIZES = ["🧸", "🪀", "🎏", "🍭", "🎐", "🪁", "🧩", "🏀", "🎨", "🦄", "🚗", "🌈", "🐳", "🦖", "🍡", "🎠"];
const NIGHT_ROUNDS = 10;
const nightMathOk = (subject, c) => subject !== "math" || (typeof mathUnit === "function" && questMathIsCalc(mathUnit(c)) && mathUnit(c).topics.includes("vert"));

// 這一章的題目（四選一）
function nightDeck(subject, c) {
  if (subject === "math") {
    const gen = makeMathGen();
    const retry = [];
    let asked = 0;
    return {
      next() { asked++; const d = retry.findIndex(r => r.at <= asked); if (d >= 0) return retry.splice(d, 1)[0].q; return gen(); },
      missed(q) { if (!retry.some(r => r.q.key === q.key)) retry.push({ q: { ...q, options: shuffle(q.options.map(o => ({ ...o, node: o.node.cloneNode(true) }))) }, at: asked + 2 }); },
    };
  }
  const items = questItems(subject, c);
  const retry = [];
  let order = [], asked = 0;
  return {
    next() {
      asked++;
      const d = retry.findIndex(r => r.at <= asked);
      const item = d >= 0 ? retry.splice(d, 1)[0].item : (order.length ? order : (order = shuffle(items))).shift();
      return learnQuestion(item, items, subject);
    },
    missed(q) { if (!retry.some(r => r.item.key === q.item.key)) retry.push({ item: q.item, at: asked + 2 }); },
  };
}
const nightRecord = (subject, q, ok) => subject === "en" ? recordWord(q.key, ok) : subject === "math" ? recordMath("game", ok) : recordZh(q.key, ok);
// 答錯時的「記一記」：英文／國語是圖卡＋小撇步；數學是積木一步一步看
function nightTeach(subject, q) {
  if (subject === "math") {
    const right = q.options.find(o => o.ok);
    return el("div", { class: "l-mathex" }, el("div", { class: "l-mathex__ans" }, t("答案是 "), right.node.cloneNode(true)),
      q.calc ? blocksTeachEl(q.calc, null) : mathStepsEl(q.explain));
  }
  learnSay(q.item);
  return el("div", { class: "l-card l-card--big" }, el("button", { class: "l-card__hear", onclick: () => learnSay(q.item) }, learnCard(q.item)), learnTipEl(q.item));
}

// === 三個攤位的場景：stage(options, onPick) → { el, play(i, ok, done) } ===
function ringStage(opts, onPick) {
  const pegs = opts.map((o, i) => el("button", { class: "nm-peg" }, el("span", { class: "nm-peg__bottle" }, ["🍾", "🧃", "🥤", "🍶"][i % 4]), el("span", { class: "nm-peg__label" }, o.node.cloneNode(true))));
  const ring = el("div", { class: "nm-ring" });
  const wrap = el("div", { class: "nm-stage nm-stage--ring" }, el("div", { class: "nm-shelf" }, pegs), ring, el("div", { class: "nm-hand" }, "✋"));
  pegs.forEach((p, i) => p.addEventListener("click", () => onPick(i, p)));
  return { el: wrap, play(i, ok, done) {
    const p = pegs[i], wr = wrap.getBoundingClientRect(), r = p.getBoundingClientRect();
    ring.style.setProperty("--tx", `${r.left + r.width / 2 - wr.left}px`); ring.style.setProperty("--ty", `${r.top - wr.top + 10}px`);
    ring.className = `nm-ring nm-ring--throw ${ok ? "nm-ring--in" : "nm-ring--miss"}`;
    setTimeout(() => { if (ok) p.classList.add("nm-peg--win"); else p.classList.add("nm-peg--bad"); ring.className = "nm-ring"; done(); }, 900);
  } };
}
function fishStage(opts, onPick) {
  const COLORS = ["#ff8f5e", "#ffcf3f", "#ff6fa3", "#7fb2ff"];
  const fish = opts.map((o, i) => el("button", { class: "nm-fish", style: `--d:${14 + i * 3}s; --delay:${-i * 3.5}s; --row:${i}; --fc:${COLORS[i % 4]}` },
    el("span", { class: "nm-fish__body" }, "🐟"), el("span", { class: "nm-fish__label" }, o.node.cloneNode(true))));
  const wrap = el("div", { class: "nm-stage nm-stage--fish" }, el("div", { class: "nm-pool" }, fish, el("div", { class: "nm-bubbles", "aria-hidden": "true" }, "° ˚ ° ˚")), el("div", { class: "nm-bowl" }, "🥣"));
  fish.forEach((f, i) => f.addEventListener("click", () => onPick(i, f)));
  return { el: wrap, play(i, ok, done) {
    const f = fish[i];
    f.classList.add(ok ? "nm-fish--caught" : "nm-fish--escape");
    if (!ok) fxPop(f, "💦", true);
    setTimeout(done, ok ? 1000 : 700);
  } };
}
function clawStage(opts, onPick) {
  let sel = -1, busy = false;
  const toys = opts.map((o, i) => el("button", { class: "nm-toy" }, el("span", { class: "nm-toy__body" }, ["🧸", "🐰", "🐶", "🐼"][i % 4]), el("span", { class: "nm-toy__label" }, o.node.cloneNode(true))));
  const claw = el("div", { class: "nm-claw" }, el("div", { class: "nm-claw__rope" }), el("div", { class: "nm-claw__hand" }, "🪝"));
  const grab = el("button", { class: "btn btn--accent btn--xl btn--full nm-grab", disabled: true }, t("👇 夾！"));
  const hint = el("div", { class: "nm-claw-hint" }, t("先點一隻娃娃，夾子會移過去"));
  const box = el("div", { class: "nm-machine" }, claw, el("div", { class: "nm-toys" }, toys));
  const wrap = el("div", { class: "nm-stage nm-stage--claw" }, box, hint, grab);
  const move = i => { sel = i; toys.forEach((x, k) => x.classList.toggle("nm-toy--sel", k === i)); const br = box.getBoundingClientRect(), r = toys[i].getBoundingClientRect(); claw.style.left = `${r.left + r.width / 2 - br.left}px`; grab.disabled = false; };
  toys.forEach((x, i) => x.addEventListener("click", () => { if (!busy) move(i); }));
  grab.addEventListener("click", () => { if (sel < 0 || busy) return; busy = true; onPick(sel, toys[sel]); });
  return { el: wrap, play(i, ok, done) {
    claw.classList.add("nm-claw--down");
    setTimeout(() => {
      if (ok) { toys[i].classList.add("nm-toy--up"); claw.classList.add("nm-claw--carry"); }
      else { toys[i].classList.add("nm-toy--slip"); }
      claw.classList.remove("nm-claw--down");
      setTimeout(() => { busy = false; grab.disabled = true; sel = -1; toys.forEach(x => x.classList.remove("nm-toy--sel")); done(); }, 900);
    }, 700);
  } };
}
const NIGHT_STAGES = { ring: ringStage, fish: fishStage, claw: clawStage };

function renderNightBooth(id, subject, c) {
  const booth = NIGHT_BOOTHS.find(b => b.id === id) || NIGHT_BOOTHS[0];
  const ch = questChapter(subject, c); c = ch?.id;
  const sh = questShell(`${booth.emoji} ${booth.name}`, subject, c);
  if (!nightMathOk(subject, c)) { sh.app.appendChild(el("div", { class: "empty" }, t("這個單元請玩陀螺對戰或養寵物"))); return sh.root; }
  const deck = nightDeck(subject, c);
  const qp = questProfile();
  let round = 0, tickets = 0, first = 0;
  const missed = [];
  const hud = el("div", { class: "nm-hud" });
  const drawHud = () => hud.replaceChildren(el("span", { class: "nm-hud__tix" }, `🎟️ × ${tickets}`), el("span", {}, t(`第 ${Math.min(round, NIGHT_ROUNDS)} / ${NIGHT_ROUNDS} 輪`)));
  const area = el("div", {});
  sh.app.replaceChildren(el("div", { class: "nm-banner" }, el("span", {}, "🏮"), t(`夜市・${booth.name}`), el("span", {}, "🏮")),
    el("div", { class: "qs-chapter" }, t("這一攤練："), questChapterTitle(subject, ch)), hud, area);
  const next = () => {
    if (round >= NIGHT_ROUNDS) return end();
    round++; drawHud();
    const q = deck.next();
    let tries = 0, locked = false;
    const feedback = el("div", { class: "quiz-feedback" });
    const teach = el("div", {});
    const stage = NIGHT_STAGES[booth.id](q.options, (i, node) => {
      if (locked || node.disabled) return;
      locked = true;
      const ok = q.options[i].ok;
      stage.play(i, ok, () => {
        if (ok) {
          dingCorrect(); q.sayAnswer?.();
          if (tries === 0) { nightRecord(subject, q, true); first++; tickets += 2; } else tickets += 1;
          fxHit(node, tries === 0 ? 2 : 1);
          feedback.textContent = tries === 0 ? "答對了！拿 2 張彩票 🎟️🎟️" : "改對了！拿 1 張彩票 🎟️"; feedback.className = "quiz-feedback quiz-feedback--correct pop";
          drawHud();
          area.append(el("button", { class: "btn btn--accent btn--xl btn--full nm-next", onclick: next }, t(round >= NIGHT_ROUNDS ? "去換獎品 🎁" : "下一輪 ▶")));
        } else {
          if (tries === 0) { nightRecord(subject, q, false); missed.push(q); deck.missed(q); }
          tries++; buzzWrong(); node.disabled = true; node.classList.add("nm-off");
          feedback.textContent = "沒關係！先記一記，再試一次（不計時）"; feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          teach.replaceChildren(nightTeach(subject, q));
          locked = false;
        }
      });
    });
    area.replaceChildren(el("div", { class: "qz-prompt" }, el("div", { class: "qz-prompt__q" }, q.prompt),
      el("button", { class: "icon-btn icon-btn--accent qz-speak", onclick: () => q.say(), "aria-label": "念題目" }, "🔊")), stage.el, feedback, teach);
    setTimeout(() => q.say(), 250);
  };
  const end = () => {
    sh.progress.textContent = "";
    const n = Math.floor(tickets / 3);
    const got = Array.from({ length: n }, () => NIGHT_PRIZES[Math.floor(Math.random() * NIGHT_PRIZES.length)]);
    qp.prizes = [...(qp.prizes || []), ...got].slice(-60);
    const p = getProfile(); if (p) { p.stars = (p.stars || 0) + first; saveStore(); }
    if (n) setTimeout(() => confetti(), 200);
    sh.app.replaceChildren(el("div", { class: "g-over pop" },
      el("div", { class: "g-over__emoji" }, "🎁"),
      el("div", { class: "g-over__score" }, t(`彩票 ${tickets} 張`)),
      el("div", { class: "g-over__msg" }, t(`第一次就答對 ${first} / ${NIGHT_ROUNDS}・3 張彩票換 1 個獎品`)),
      got.length ? el("div", { class: "nm-got" }, t("換到："), got.map(g => el("span", { class: "nm-prize nm-prize--new" }, g))) : null,
      el("div", { class: "nm-cabinet" }, el("div", { class: "nm-cabinet__title" }, t("🗄️ 我的獎品櫃")), el("div", { class: "nm-cabinet__items" }, (qp.prizes || []).map(g => el("span", { class: "nm-prize" }, g)))),
      subject === "math"
        ? (missed.length ? el("div", { class: "l-summary" }, el("div", { class: "l-summary__title" }, t("這幾題要再算一次：")), el("div", { class: "l-summary__list" }, missed.map(q => el("button", { class: "l-summary__chip l-summary__chip--math", onclick: () => q.calc && openBlocksTeach(q.calc) }, q.prompt.cloneNode(true))))) : null)
        : questMissedList(subject, missed.map(q => ({ key: q.key, item: q.item }))),
      el("div", { class: "g-over__btns" },
        el("button", { class: "btn btn--accent btn--xl", onclick: () => navigate(`#/night/${booth.id}?s=${subject}&c=${encodeURIComponent(c)}&r=${Date.now()}`) }, t("🔁 再玩一次")),
        el("button", { class: "btn btn--ghost", onclick: () => navigate(questBack(subject, c)) }, t("換別攤")))));
  };
  next();
  return sh.root;
}
