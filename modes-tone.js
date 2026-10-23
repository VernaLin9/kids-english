// === 📍 聲調放哪裡（一年級特訓）===
// 小孩常把聲調寫在錯的位置。台灣課本規則：
//   ˊ ˇ ˋ 寫在「最後一個注音符號」的右邊；輕聲 ˙ 寫在最上面。
// 三種題型輪流：
//   place 放聲調：點虛線框，把聲調放到對的位置（錯了要自己再放一次對的）
//   pick  哪個對：同一個字三種寫法，選寫對的那個
//   find  抓錯字：一個詞裡有一個字的聲調寫錯了，把它找出來
// 一輪 12 題；錯的字 2 題後再考一次；上一輪錯過的字下一輪優先出。
// 紀錄存在 profile.toneDrill = { rounds, best, missed: { "字|注音": 次數 } }

const TP_ROUND = 12;
const TP_RULE = "聲調寫在最後一個注音的右邊";
const TP_RULE_NEUTRAL = "輕聲是小圓點，寫在最上面";
const tpRuleOf = (tone) => tone === "˙" ? TP_RULE_NEUTRAL : TP_RULE;
const tpCorrectPos = (it) => it.tone === "˙" ? "top" : it.symbols.length - 1;

// 從一年級國語各課的詞語拆出每個字的注音（一聲沒有聲調，不考）
function tpItems(lessonId) {
  const lessons = (ZH_DATA.g1?.lessons || []).filter(l => l.kind !== "chars");
  const pick = lessons.filter(l => !lessonId || l.id === lessonId);
  const build = (ls) => {
    const syls = new Map(), words = [];
    ls.forEach(l => (l.words || []).forEach(w => {
      const chars = [...w.zh].filter(c => /[一-鿿]/.test(c));
      const bopo = (w.bopo || "").split(/\s+/).filter(Boolean);
      if (!chars.length || chars.length !== bopo.length) return;
      const parts = chars.map((zh, i) => ({ zh, word: w.zh, emoji: w.emoji, syl: bopo[i], ...splitSyl(bopo[i]) }));
      parts.forEach(it => { if (it.tone) { const key = `${it.zh}|${it.syl}`; if (!syls.has(key)) syls.set(key, { ...it, key }); } });
      if (parts.length >= 2 && parts.some(it => it.tone)) words.push({ zh: w.zh, emoji: w.emoji, parts });
    }));
    return { syls: [...syls.values()], words };
  };
  const res = build(pick);
  return res.syls.length >= 8 ? res : build(lessons);
}

// 一個字的注音直欄，聲調可以放在任何位置（用來畫「寫錯的樣子」）
// pos："top" = 最上面；數字 i = 第 i 個符號的右邊；null = 不放
// onSlot 有給的話，每個位置變成可以點的虛線框
function tpSylEl(symbols, { tone = "", pos = null, onSlot = null, cls = "" } = {}) {
  const box = el("span", { class: `tp-syl ${onSlot ? "tp-syl--slots" : ""} ${cls}`, "data-nobopo": "" });
  const cell = (where, row, col) => {
    const has = pos === where && tone;
    const node = onSlot
      ? el("button", { class: `tp-slot ${where === "top" ? "tp-slot--top" : ""}`, "aria-label": "放這裡", onclick: (e) => onSlot(where, e.currentTarget) }, has ? tone : "")
      : el("span", { class: `tp-mark ${where === "top" ? "tp-mark--top" : ""} ${tone === "˙" ? "tp-mark--dot" : ""}` }, has ? tone : "");
    node.dataset.pos = String(where);
    node.style.gridRow = String(row); node.style.gridColumn = String(col);
    return node;
  };
  box.appendChild(cell("top", 1, 1));
  symbols.forEach((s, i) => {
    const sym = el("span", { class: "tp-sym" }, s);
    sym.style.gridRow = String(i + 2); sym.style.gridColumn = "1";
    box.appendChild(sym);
    box.appendChild(cell(i, i + 2, 2));
  });
  return box;
}
// 這個字所有「寫錯」的位置
const tpWrongPositions = (it) => it.tone === "˙"
  ? it.symbols.map((_, i) => i)
  : ["top", ...it.symbols.map((_, i) => i).filter(i => i !== it.symbols.length - 1)];

// 規則小卡：寫對的例子＋常見寫錯的例子
function tpRuleCard(it) {
  const ok = tpSylEl(it.symbols, { tone: it.tone, pos: tpCorrectPos(it), cls: "tp-syl--sm tp-syl--ok" });
  const wrongs = tpWrongPositions(it);
  const bad = tpSylEl(it.symbols, { tone: it.tone, pos: wrongs[wrongs.length - 1], cls: "tp-syl--sm tp-syl--bad" });
  return el("div", { class: "tp-rule" },
    el("div", { class: "tp-rule__text" }, t(`📌 ${tpRuleOf(it.tone)}`)),
    el("div", { class: "tp-rule__ex" },
      el("div", { class: "tp-rule__cell" }, ok, el("span", { class: "tp-rule__tag tp-rule__tag--ok" }, "✓")),
      el("div", { class: "tp-rule__cell" }, bad, el("span", { class: "tp-rule__tag tp-rule__tag--bad" }, "✗"))));
}

function tpStore() {
  const p = getProfile(); if (!p) return null;
  return (p.toneDrill = p.toneDrill || { rounds: 0, best: 0, missed: {} });
}

// 出一輪題目：上次錯過的字優先；多數是 2、3 個符號的字（比較容易放錯）
function tpBuildRound(pool) {
  const rec = tpStore();
  const missedKeys = Object.keys(rec?.missed || {}).sort((a, b) => rec.missed[b] - rec.missed[a]);
  const byKey = new Map(pool.syls.map(s => [s.key, s]));
  const chosen = [];
  missedKeys.forEach(k => { if (byKey.has(k) && chosen.length < 5) chosen.push(byKey.get(k)); });
  const multi = shuffle(pool.syls.filter(s => s.symbols.length >= 2 && !chosen.includes(s)));
  const neutral = shuffle(pool.syls.filter(s => s.tone === "˙" && !chosen.includes(s)));
  const single = shuffle(pool.syls.filter(s => s.symbols.length === 1 && s.tone !== "˙" && !chosen.includes(s)));
  if (neutral.length && !chosen.some(s => s.tone === "˙")) chosen.push(neutral[0]);
  if (single.length) chosen.push(single[0]);
  for (const s of multi) { if (chosen.length >= 9) break; chosen.push(s); }
  for (const s of shuffle(pool.syls)) { if (chosen.length >= 9) break; if (!chosen.includes(s)) chosen.push(s); }
  // 題型：前兩題一定是「放聲調」，之後 place / pick 輪流，再插 3 題「抓錯字」
  const qs = shuffle(chosen).map((it, i) => ({ type: i < 2 || i % 2 === 0 ? "place" : "pick", it }));
  const words = shuffle(pool.words).slice(0, TP_ROUND - qs.length);
  words.forEach((w, i) => qs.splice(Math.min(qs.length, 3 + i * 3), 0, { type: "find", w }));
  return qs.slice(0, TP_ROUND);
}

function renderToneDrill(lessonId) {
  const l = lessonId ? zhLesson(lessonId) : null;
  const back = l ? `#/zh/${l.id}` : "#/";
  const root = el("div", {});
  const header = renderHeader("📍 聲調放哪裡", { back });
  root.appendChild(header);
  const app = el("main", { class: "app tp" });
  root.appendChild(app);
  const progressLabel = $(".header__progress", header);
  const pool = tpItems(l?.id);
  if (!pool.syls.length) { app.appendChild(el("div", { class: "b2-note" }, t("這一課還沒有可以練的字"))); return root; }

  // 開場：先看規則
  const intro = () => {
    const a = { symbols: [..."ㄒㄧㄠ"], tone: "ˇ" }, b = { symbols: ["ㄗ"], tone: "˙" };
    app.replaceChildren(el("section", { class: "tp-intro" },
      el("div", { class: "tp-intro__title" }, t("聲調要寫在哪裡？")),
      el("div", { class: "tp-intro__rules" },
        el("div", { class: "tp-intro__rule" },
          el("div", { class: "tp-intro__ex" },
            el("div", { class: "tp-rule__cell" }, tpSylEl(a.symbols, { tone: "ˇ", pos: 2, cls: "tp-syl--ok" }), el("span", { class: "tp-rule__tag tp-rule__tag--ok" }, "✓")),
            el("div", { class: "tp-rule__cell" }, tpSylEl(a.symbols, { tone: "ˇ", pos: 1, cls: "tp-syl--bad" }), el("span", { class: "tp-rule__tag tp-rule__tag--bad" }, "✗")),
            el("div", { class: "tp-rule__cell" }, tpSylEl(a.symbols, { tone: "ˇ", pos: 0, cls: "tp-syl--bad" }), el("span", { class: "tp-rule__tag tp-rule__tag--bad" }, "✗"))),
          el("div", { class: "tp-intro__say" }, t("ˊ ˇ ˋ：找最後一個注音，寫在它的右邊"))),
        el("div", { class: "tp-intro__rule" },
          el("div", { class: "tp-intro__ex" },
            el("div", { class: "tp-rule__cell" }, tpSylEl(b.symbols, { tone: "˙", pos: "top", cls: "tp-syl--ok" }), el("span", { class: "tp-rule__tag tp-rule__tag--ok" }, "✓")),
            el("div", { class: "tp-rule__cell" }, tpSylEl(b.symbols, { tone: "˙", pos: 0, cls: "tp-syl--bad" }), el("span", { class: "tp-rule__tag tp-rule__tag--bad" }, "✗"))),
          el("div", { class: "tp-intro__say" }, t("˙ 輕聲：小圓點戴在頭頂上"))),
        el("div", { class: "tp-intro__tip" }, t("🧠 記憶法：寫完注音，手指先摸最後一個，再把聲調寫在它右邊。"))),
      el("button", { class: "btn btn--accent btn--xl btn--full", onclick: start }, t("開始練習 ▶"))));
    progressLabel.textContent = "";
    speakZh("聲調寫在最後一個注音的右邊。輕聲寫在最上面。");
  };

  let qs = [], i = 0, score = 0, firstTry = 0;
  const missedNow = new Map();
  const start = () => { qs = tpBuildRound(pool); i = 0; score = 0; firstTry = 0; missedNow.clear(); next(); };
  const miss = (it) => {
    missedNow.set(it.key || `${it.zh}|${it.syl}`, it);
    // 2 題後再考一次（放聲調），最多重考到 18 題
    if (qs.length < TP_ROUND + 6) qs.splice(Math.min(qs.length, i + 3), 0, { type: "place", it, retry: true });
  };
  const done = (ok) => { if (ok) { score++; dingCorrect(); } setTimeout(() => { i++; next(); }, ok ? 1100 : 1600); };

  const prompt = (emoji, text) => el("div", { class: "tp-ask" }, emoji ? el("span", { class: "tp-ask__emoji" }, emoji) : null, t(text));
  const wordLine = (it) => el("button", { class: "tp-word", onclick: () => speakZh(it.word) },
    el("span", { class: "tp-word__emoji" }, it.emoji || "🔊"),
    el("span", { class: "tp-word__zh", "data-nobopo": "" }, [...it.word].map(c => el("span", { class: c === it.zh ? "tp-word__hit" : "" }, c))), " 🔊");

  // 題型 1：放聲調
  const askPlace = (q) => {
    const it = q.it; let wrongOnce = false, locked = false;
    const feedback = el("div", { class: "quiz-feedback" });
    const rule = el("div", {});
    const target = tpCorrectPos(it);
    const syl = tpSylEl(it.symbols, { onSlot: (where, btn) => {
      if (locked) return;
      if (String(where) === String(target)) {
        locked = true; btn.textContent = it.tone; btn.classList.add("tp-slot--ok");
        syl.classList.add("tp-syl--done");
        feedback.textContent = wrongOnce ? "對了！記住這個位置 👍" : "答對了！🎉";
        feedback.className = "quiz-feedback quiz-feedback--correct pop";
        if (!wrongOnce && !q.retry) firstTry++; speakZh(it.zh);
        done(!wrongOnce);
      } else {
        if (!wrongOnce) miss(it);
        wrongOnce = true; buzzWrong();
        btn.textContent = it.tone; btn.classList.add("tp-slot--bad");
        setTimeout(() => { btn.textContent = ""; btn.classList.remove("tp-slot--bad"); }, 700);
        syl.querySelector(`.tp-slot[data-pos="${target}"]`)?.classList.add("tp-slot--hint");
        feedback.textContent = "不是這裡喔，看閃閃的框"; feedback.className = "quiz-feedback quiz-feedback--wrong shake";
        rule.replaceChildren(tpRuleCard(it));
        speakZh(tpRuleOf(it.tone));
      }
    } });
    app.replaceChildren(el("div", { class: "tp-card" },
      q.retry ? el("div", { class: "tp-retry" }, t("🔁 剛剛錯的，再一次")) : null,
      wordLine(it),
      prompt(null, "把聲調放到對的位置"),
      el("div", { class: "tp-place" }, el("span", { class: "tp-chip", "data-nobopo": "" }, it.tone), el("span", { class: "tp-arrow" }, "➜"), syl)),
      feedback, rule);
    setTimeout(() => speakZh(it.word), 250);
  };

  // 題型 2：哪個對（同一個字三種寫法）
  const askPick = (q) => {
    const it = q.it; let wrongOnce = false, locked = false;
    const feedback = el("div", { class: "quiz-feedback" });
    const rule = el("div", {});
    const wrongs = shuffle(tpWrongPositions(it)).slice(0, 2);
    const opts = shuffle([tpCorrectPos(it), ...wrongs]);
    const row = el("div", { class: "tp-opts" }, opts.map(pos => {
      const b = el("button", { class: "tp-opt" }, tpSylEl(it.symbols, { tone: it.tone, pos }));
      b.addEventListener("click", () => {
        if (locked) return;
        if (pos === tpCorrectPos(it)) {
          locked = true; b.classList.add("tp-opt--ok");
          feedback.textContent = wrongOnce ? "對了！記住這個位置 👍" : "答對了！🎉";
          feedback.className = "quiz-feedback quiz-feedback--correct pop";
          if (!wrongOnce && !q.retry) firstTry++; speakZh(it.zh);
          done(!wrongOnce);
        } else {
          if (!wrongOnce) miss(it);
          wrongOnce = true; b.disabled = true; b.classList.add("tp-opt--bad"); buzzWrong();
          feedback.textContent = "這個寫錯了，再找找"; feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          rule.replaceChildren(el("div", { class: "tp-rule" }, el("div", { class: "tp-rule__text" }, t(`📌 ${tpRuleOf(it.tone)}`))));
        }
      });
      return b;
    }));
    app.replaceChildren(el("div", { class: "tp-card" }, wordLine(it), prompt(null, "哪一個寫對了？"), row), feedback, rule);
    setTimeout(() => speakZh(it.word), 250);
  };

  // 題型 3：抓錯字（一個詞裡有一個字的聲調寫錯）
  const askFind = (q) => {
    const w = q.w; let wrongOnce = false, locked = false;
    const feedback = el("div", { class: "quiz-feedback" });
    const rule = el("div", {});
    const cand = w.parts.map((p, k) => k).filter(k => w.parts[k].tone);
    const bad = cand[Math.floor(Math.random() * cand.length)];
    const badIt = w.parts[bad];
    const badPos = shuffle(tpWrongPositions(badIt))[0];
    const row = el("div", { class: "tp-find" }, w.parts.map((p, k) => {
      const pos = k === bad ? badPos : (p.tone ? tpCorrectPos(p) : null);
      const b = el("button", { class: "tp-find__col" }, el("span", { class: "tp-find__zh", "data-nobopo": "" }, p.zh), tpSylEl(p.symbols, { tone: p.tone, pos, cls: "tp-syl--sm" }));
      b.addEventListener("click", () => {
        if (locked) return;
        if (k === bad) {
          locked = true; b.classList.add("tp-find__col--ok");
          b.replaceChildren(el("span", { class: "tp-find__zh", "data-nobopo": "" }, p.zh), tpSylEl(p.symbols, { tone: p.tone, pos: tpCorrectPos(p), cls: "tp-syl--sm tp-syl--fixed" }));
          feedback.textContent = wrongOnce ? "找到了！已經幫你改好 👍" : "抓到了！改成這樣才對 🎉";
          feedback.className = "quiz-feedback quiz-feedback--correct pop";
          if (!wrongOnce && !q.retry) firstTry++; speakZh(w.zh);
          rule.replaceChildren(el("div", { class: "tp-rule" }, el("div", { class: "tp-rule__text" }, t(`📌 ${tpRuleOf(p.tone)}`))));
          done(!wrongOnce);
        } else {
          if (!wrongOnce) miss({ ...badIt, key: `${badIt.zh}|${badIt.syl}` });
          wrongOnce = true; b.disabled = true; b.classList.add("tp-find__col--fine"); buzzWrong();
          feedback.textContent = "這個字寫對了喔，看別的字"; feedback.className = "quiz-feedback quiz-feedback--wrong shake";
        }
      });
      return b;
    }));
    app.replaceChildren(el("div", { class: "tp-card" },
      el("button", { class: "tp-word", onclick: () => speakZh(w.zh) }, el("span", { class: "tp-word__emoji" }, w.emoji || "🔊"), " 🔊"),
      prompt("🔍", "哪一個字的聲調寫錯了？"), row), feedback, rule);
    setTimeout(() => speakZh(w.zh), 250);
  };

  const finish = () => {
    progressLabel.textContent = "";
    const rec = tpStore();
    if (rec) {
      rec.rounds++; rec.best = Math.max(rec.best || 0, firstTry);
      // 這一輪全對的字從「常錯」移掉，錯的加一次
      qs.forEach(q => { const it = q.it; if (it && !missedNow.has(it.key) && rec.missed[it.key]) { rec.missed[it.key]--; if (rec.missed[it.key] <= 0) delete rec.missed[it.key]; } });
      missedNow.forEach((_, k) => { rec.missed[k] = (rec.missed[k] || 0) + 1; });
      const p = getProfile(); p.stars = (p.stars || 0) + firstTry; saveStore();
    }
    const total = TP_ROUND;
    if (firstTry >= total && typeof confetti === "function") confetti();
    const list = [...missedNow.values()];
    app.replaceChildren(renderResultBlock(`第一次就對 ${Math.min(firstTry, total)} / ${total}`, firstTry >= total ? "🌟" : firstTry >= total * 0.7 ? "🎉" : "💪", "🔁 再練一輪", start,
      el("div", {},
        el("div", { class: "tp-rule" }, el("div", { class: "tp-rule__text" }, t(`📌 ${TP_RULE}`)), el("div", { class: "tp-rule__text" }, t(`📌 ${TP_RULE_NEUTRAL}`))),
        list.length ? el("div", { class: "zh-missed" }, el("div", { class: "zh-missed__title" }, t("這幾個要再看一次（下一輪會先考）：")),
          el("div", { class: "tp-missed" }, list.map(it => el("button", { class: "tp-missed__item", onclick: () => speakZh(it.word) },
            el("span", { class: "tp-find__zh", "data-nobopo": "" }, it.zh), tpSylEl(it.symbols, { tone: it.tone, pos: tpCorrectPos(it), cls: "tp-syl--sm tp-syl--ok" }))))) : null)));
  };

  const next = () => {
    if (i >= qs.length) return finish();
    progressLabel.textContent = `${Math.min(i + 1, qs.length)}/${qs.length}`;
    const q = qs[i];
    ({ place: askPlace, pick: askPick, find: askFind })[q.type](q);
  };

  intro();
  return root;
}

// 一年級國語首頁的特訓入口
function renderToneDrillEntry() {
  const rec = getProfile()?.toneDrill;
  const weak = Object.keys(rec?.missed || {}).length;
  return el("button", { class: "tp-home", onclick: () => navigate("#/tonedrill") },
    el("span", { class: "tp-home__icon", "data-nobopo": "" }, tpSylEl([..."ㄒㄧㄠ"], { tone: "ˇ", pos: 2, cls: "tp-syl--xs" })),
    el("span", { class: "tp-home__text" }, t("📍 聲調放哪裡？特訓"),
      el("span", { class: "tp-home__sub" }, t(rec?.rounds ? `練過 ${rec.rounds} 輪・最好 ${rec.best} 題${weak ? `・常錯 ${weak} 個` : ""}` : "每輪12題，錯的會再考"))),
    el("span", { class: "tp-home__go" }, "▶"));
}
