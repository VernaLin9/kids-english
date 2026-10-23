// === 📍 聲調放哪裡（一年級特訓）===
// 小孩常把聲調寫在錯的位置。台灣課本規則：
//   ˊ ˇ ˋ 寫在「最後一個注音符號」的右上角；輕聲 ˙ 寫在最上面（教育部《國語注音符號手冊》調號說明）。
// 三種題型輪流：
//   place 放聲調：點虛線框，把聲調放到對的位置（錯了要自己再放一次對的）
//   pick  哪個對：同一個字三種寫法，選寫對的那個
//   find  抓錯字：一個詞裡有一個字的聲調寫錯了，把它找出來
// 一輪 12 題；錯的字 2 題後再考一次；上一輪錯過的字下一輪優先出。
// 紀錄存在 profile.toneDrill = { rounds, best, missed: { "字|注音": 次數 } }

const TP_ROUND = 12;
const TP_RULE = "聲調寫在最後一個注音的右上角";
const TP_RULE_NEUTRAL = "輕聲是小圓點，寫在最上面";
const tpRuleOf = (tone) => tone === "˙" ? TP_RULE_NEUTRAL : TP_RULE;
const tpCorrectPos = (it) => it.tone === "˙" ? "top" : "ur";

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
// pos："top" = 最上面；數字 i = 第 i 個符號（不是最後一個）的右邊；
//      "ur" = 最後一個符號的右上角（二三四聲的正確位置）；"lr" = 最後一個符號的右下角
// onSlot 有給的話，每個位置變成可以點的虛線框
function tpSylEl(symbols, { tone = "", pos = null, onSlot = null, cls = "" } = {}) {
  const box = el("span", { class: `tp-syl ${onSlot ? "tp-syl--slots" : ""} ${cls}`, "data-nobopo": "" });
  const n = symbols.length;
  const slot = (where, row, col, extra = "") => {
    const node = el("button", { class: `tp-slot ${where === "top" ? "tp-slot--top" : ""} ${extra}`, "aria-label": "放這裡", onclick: (e) => onSlot(where, e.currentTarget) }, pos === where && tone ? toneGlyph(tone) : null);
    node.dataset.pos = String(where); node.style.gridRow = String(row); node.style.gridColumn = String(col);
    return node;
  };
  const mark = (where, extra = "") => {
    const node = el("span", { class: `tp-mark ${extra}` }, pos === where && tone ? toneGlyph(tone) : null);
    node.dataset.pos = String(where);
    return node;
  };
  if (onSlot) {
    box.appendChild(slot("top", 1, 1));
    symbols.forEach((s, i) => {
      const last = i === n - 1;
      const sym = el("span", { class: "tp-sym" }, s);
      // 最後一個符號佔兩列：右邊分成右上角、右下角兩個框
      sym.style.gridRow = last ? `${i + 2} / span 2` : String(i + 2); sym.style.gridColumn = "1";
      box.appendChild(sym);
      if (!last) box.appendChild(slot(i, i + 2, 2));
      else { box.appendChild(slot("ur", i + 2, 2, "tp-ur")); box.appendChild(slot("lr", i + 3, 2, "tp-lr")); }
    });
    return box;
  }
  // 只是畫出來：聲調貼在符號的右上角／右下角／旁邊／最上面
  const top = mark("top", "tp-mark--top"); top.style.gridRow = "1"; top.style.gridColumn = "1";
  box.appendChild(top);
  symbols.forEach((s, i) => {
    const last = i === n - 1;
    const sym = el("span", { class: "tp-sym tp-sym--rel" }, s);
    if (last) sym.append(mark("ur", "tp-mark--abs tp-ur"), mark("lr", "tp-mark--abs tp-lr"));
    else sym.append(mark(i, "tp-mark--abs tp-mid"));
    sym.style.gridRow = String(i + 2); sym.style.gridColumn = "1";
    box.appendChild(sym);
  });
  return box;
}
// 聲調符號：輕聲畫成圓點（有些字型的 ˙ 看起來像短橫線）
function toneGlyph(tone) {
  return tone === "˙" ? el("span", { class: "tp-dotglyph", "aria-label": "輕聲" }) : tone;
}
// 這個字所有「寫錯」的位置
const tpWrongPositions = (it) => {
  const mids = it.symbols.slice(0, -1).map((_, i) => i);
  return it.tone === "˙" ? [...mids, "ur", "lr"] : ["top", ...mids, "lr"];
};

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
  const rec = tpStore();
  const intro = () => {
    const a = { symbols: [..."ㄒㄧㄠ"], tone: "ˇ" }, b = { symbols: ["ㄗ"], tone: "˙" };
    app.replaceChildren(el("section", { class: "tp-intro" },
      el("div", { class: "tp-intro__title" }, t("聲調要寫在哪裡？")),
      el("div", { class: "tp-intro__rules" },
        el("div", { class: "tp-intro__rule" },
          el("div", { class: "tp-intro__ex" },
            el("div", { class: "tp-rule__cell" }, tpSylEl(a.symbols, { tone: "ˇ", pos: "ur", cls: "tp-syl--ok" }), el("span", { class: "tp-rule__tag tp-rule__tag--ok" }, "✓")),
            el("div", { class: "tp-rule__cell" }, tpSylEl(a.symbols, { tone: "ˇ", pos: "lr", cls: "tp-syl--bad" }), el("span", { class: "tp-rule__tag tp-rule__tag--bad" }, "✗")),
            el("div", { class: "tp-rule__cell" }, tpSylEl(a.symbols, { tone: "ˇ", pos: 1, cls: "tp-syl--bad" }), el("span", { class: "tp-rule__tag tp-rule__tag--bad" }, "✗"))),
          el("div", { class: "tp-intro__say" }, t("ˊ ˇ ˋ：找最後一個注音，寫在它的右上角"))),
        el("div", { class: "tp-intro__rule" },
          el("div", { class: "tp-intro__ex" },
            el("div", { class: "tp-rule__cell" }, tpSylEl(b.symbols, { tone: "˙", pos: "top", cls: "tp-syl--ok" }), el("span", { class: "tp-rule__tag tp-rule__tag--ok" }, "✓")),
            el("div", { class: "tp-rule__cell" }, tpSylEl(b.symbols, { tone: "˙", pos: "ur", cls: "tp-syl--bad" }), el("span", { class: "tp-rule__tag tp-rule__tag--bad" }, "✗"))),
          el("div", { class: "tp-intro__say" }, t("˙ 輕聲：小圓點戴在頭頂上"))),
        el("div", { class: "tp-intro__tip" }, t("🧠 記憶法：寫完注音，手指先摸最後一個，再把聲調寫在它的右上角（不是右下角）。"))),
      el("button", { class: "btn btn--accent btn--xl btn--full", onclick: start }, t("開始練習 ▶")),
      el("button", { class: "btn btn--xl btn--full tp-write-btn", onclick: () => renderToneWrite(app, progressLabel, pool, intro) }, t("✍️ 手寫過關考（自己寫聲調）")),
      rec?.writeBest != null ? el("div", { class: "progress-note", style: "text-align: center;" }, t(`手寫過關考最好 ${rec.writeBest} / ${TW_ROUND}${rec.writePass ? `・過關 ${rec.writePass} 次 🏅` : ""}`)) : null));
    progressLabel.textContent = "";
    speakZh("聲調寫在最後一個注音的右上角。輕聲寫在最上面。");
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
        locked = true; btn.replaceChildren(toneGlyph(it.tone)); btn.classList.add("tp-slot--ok");
        syl.classList.add("tp-syl--done");
        feedback.textContent = wrongOnce ? "對了！記住這個位置 👍" : "答對了！🎉";
        feedback.className = "quiz-feedback quiz-feedback--correct pop";
        if (!wrongOnce && !q.retry) firstTry++; speakZh(it.zh);
        done(!wrongOnce);
      } else {
        if (!wrongOnce) miss(it);
        wrongOnce = true; buzzWrong();
        btn.replaceChildren(toneGlyph(it.tone)); btn.classList.add("tp-slot--bad");
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
      el("div", { class: "tp-place" }, el("span", { class: "tp-chip", "data-nobopo": "" }, toneGlyph(it.tone)), el("span", { class: "tp-arrow" }, "➜"), syl)),
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
    el("span", { class: "tp-home__icon", "data-nobopo": "" }, tpSylEl([..."ㄒㄧㄠ"], { tone: "ˇ", pos: "ur", cls: "tp-syl--xs" })),
    el("span", { class: "tp-home__text" }, t("📍 聲調放哪裡？特訓"),
      el("span", { class: "tp-home__sub" }, t(rec?.rounds ? `練過 ${rec.rounds} 輪・最好 ${rec.best} 題${weak ? `・常錯 ${weak} 個` : ""}` : "每輪12題，錯的會再考"))),
    el("span", { class: "tp-home__go" }, "▶"));
}

// =====================================================================
// ✍️ 手寫過關考：聽字，用手指把聲調「寫」上去；程式判斷寫的是幾聲、寫在哪裡
// 一輪 10 題，第一次就寫對 8 題以上算過關（紀錄 profile.toneDrill.writePass / writeBest）
// =====================================================================
const TW_ROUND = 10, TW_PASS = 8;
const TW_NAME = { "ˊ": "二聲", "ˇ": "三聲", "ˋ": "四聲", "˙": "輕聲" };

// 判斷筆畫的形狀：˙ 很小一點；ˇ 中間低兩邊高；ˊ 往右上；ˋ 往右下
function twShape(strokes, symH) {
  const pts = strokes.flat();
  if (!pts.length) return null;
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
  if (Math.max(bw, bh) < symH * 0.3) return "˙";
  const main = strokes.reduce((m, st) => st.length > m.length ? st : m, []);
  const my = Math.max(...main.map(p => p.y)), k = main.findIndex(p => p.y === my);
  const y0 = main[0].y, yN = main[main.length - 1].y;
  if (k > main.length * 0.15 && k < main.length * 0.85 && my - y0 > bh * 0.35 && my - yN > bh * 0.35) return "ˇ";
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length, mY = ys.reduce((a, b) => a + b, 0) / ys.length;
  const cov = pts.reduce((c, p) => c + (p.x - mx) * (p.y - mY), 0);
  return cov < 0 ? "ˊ" : "ˋ";
}
// 判斷寫的位置：rects 是每個注音符號的方框（跟畫布同一個座標）
function twPos(strokes, rects) {
  const pts = strokes.flat();
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const left = Math.min(...rects.map(r => r.left)), right = Math.max(...rects.map(r => r.right));
  const w = right - left, first = rects[0], last = rects[rects.length - 1], h = first.bottom - first.top;
  if (cy < first.top + h * 0.15 && cx >= left - w * 0.5 && cx <= right + w * 0.15) return "top";
  if (cx < left - w * 0.2) return "left";
  if (cx < right - w * 0.15) return "on";
  // 右邊：看跟哪一個符號同高
  if (cy < first.top - h * 0.45) return "high";
  const lastMid = (last.top + last.bottom) / 2;
  if (cy >= last.top - h * 0.45 && cy <= lastMid + h * 0.08) return "ur";
  if (cy > lastMid + h * 0.08) return "lr";
  for (let i = 0; i < rects.length - 1; i++) if (cy <= rects[i].bottom + h * 0.1) return i;
  return "ur";
}
const TW_POS_MSG = {
  top: "寫到最上面了", left: "寫到左邊了", on: "寫到注音上面了", high: "寫得太高了",
  lr: "寫到右下角了", ur: "寫在右上角", mid: "寫在中間那個注音的旁邊了",
};

function renderToneWrite(app, progressLabel, pool, back) {
  // 題目：多數是 2、3 個符號的字，加上 1～2 個輕聲
  const multi = shuffle(pool.syls.filter(s => s.symbols.length >= 2 && s.tone !== "˙"));
  const neutral = shuffle(pool.syls.filter(s => s.tone === "˙"));
  const single = shuffle(pool.syls.filter(s => s.symbols.length === 1 && s.tone !== "˙"));
  const items = shuffle([...neutral.slice(0, 2), ...single.slice(0, 1), ...multi].slice(0, TW_ROUND));
  while (items.length < TW_ROUND && pool.syls.length) items.push(pool.syls[items.length % pool.syls.length]);
  let i = 0, first = 0;
  const missed = [];

  const ask = () => {
    if (i >= items.length) return done();
    const it = items[i];
    progressLabel.textContent = `${i + 1}/${items.length}`;
    let tries = 0, hinted = false, locked = false;
    const strokes = [];
    const syl = el("div", { class: "tw-syl", "data-nobopo": "" }, it.symbols.map(c => el("span", { class: "tw-sym" }, c)));
    const canvas = el("canvas", { class: "tw-canvas" });
    const ghost = el("div", { class: "tw-ghost", "data-nobopo": "" });
    const board = el("div", { class: "tw-board" }, syl, ghost, canvas);
    const feedback = el("div", { class: "quiz-feedback" });
    const toneHint = el("div", { class: "tw-tonehint" });
    const ctx = canvas.getContext("2d");
    const fit = () => {
      const r = board.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 7; ctx.strokeStyle = "#ff3d8b";
      redraw();
    };
    const redraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      strokes.forEach(st => { ctx.beginPath(); st.forEach((p, k) => k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); if (st.length === 1) ctx.lineTo(st[0].x + 0.1, st[0].y + 0.1); ctx.stroke(); });
    };
    const at = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    let drawing = null;
    canvas.addEventListener("pointerdown", e => { if (locked) return; e.preventDefault(); canvas.setPointerCapture?.(e.pointerId); drawing = [at(e)]; strokes.push(drawing); redraw(); });
    canvas.addEventListener("pointermove", e => { if (!drawing) return; e.preventDefault(); drawing.push(at(e)); redraw(); });
    const up = () => { drawing = null; };
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
    const clear = () => { strokes.length = 0; ghost.replaceChildren(); ghost.className = "tw-ghost"; redraw(); };
    const rectsRel = () => { const b = canvas.getBoundingClientRect(); return [...syl.children].map(c => { const r = c.getBoundingClientRect(); return { left: r.left - b.left, right: r.right - b.left, top: r.top - b.top, bottom: r.bottom - b.top }; }); };
    // 寫錯時：在正確的位置閃一個聲調給他看
    const showGhost = () => {
      const rs = rectsRel(), last = rs[rs.length - 1], h = rs[0].bottom - rs[0].top;
      const right = Math.max(...rs.map(r => r.right)), left = Math.min(...rs.map(r => r.left));
      ghost.replaceChildren(toneGlyph(it.tone)); ghost.className = "tw-ghost tw-ghost--on";
      if (it.tone === "˙") { ghost.style.left = `${(left + right) / 2}px`; ghost.style.top = `${rs[0].top - h * 0.35}px`; }
      else { ghost.style.left = `${right + h * 0.28}px`; ghost.style.top = `${last.top + h * 0.12}px`; }
    };
    const check = () => {
      if (locked) return;
      if (!strokes.length) { feedback.textContent = "還沒寫喔，用手指寫上聲調"; feedback.className = "quiz-feedback quiz-feedback--wrong shake"; return; }
      const rs = rectsRel(), h = rs[0].bottom - rs[0].top;
      const shape = twShape(strokes, h), pos = twPos(strokes, rs);
      const wantPos = tpCorrectPos(it);
      const shapeOk = shape === it.tone, posOk = pos === wantPos;
      if (shapeOk && posOk) {
        locked = true;
        if (tries === 0) first++;
        dingCorrect(); speakZh(it.zh);
        feedback.textContent = tries === 0 ? "寫對了！位置也對 🎉" : "對了！記住這個位置 👍"; feedback.className = "quiz-feedback quiz-feedback--correct pop";
        board.classList.add("tw-board--ok");
        setTimeout(() => { i++; ask(); }, 1300);
        return;
      }
      if (tries === 0) missed.push(it);
      tries++; buzzWrong();
      const msgs = [];
      if (!shapeOk) msgs.push(shape ? `你寫的像${TW_NAME[shape]}，這個字是${TW_NAME[it.tone]}` : `這個字是${TW_NAME[it.tone]}`);
      if (!posOk) msgs.push(`${TW_POS_MSG[typeof pos === "number" ? "mid" : pos] || "位置不對"}。${tpRuleOf(it.tone)}`);
      feedback.textContent = msgs.join("；"); feedback.className = "quiz-feedback quiz-feedback--wrong shake";
      speakZh(msgs.join("。"));
      showGhost();
      setTimeout(() => { strokes.length = 0; redraw(); }, 900);
    };
    app.replaceChildren(el("div", { class: "tp-card" },
      el("button", { class: "tp-word", onclick: () => speakZh(it.word) },
        el("span", { class: "tp-word__emoji" }, it.emoji || "🔊"),
        el("span", { class: "tp-word__zh", "data-nobopo": "" }, [...it.word].map(c => el("span", { class: c === it.zh ? "tp-word__hit" : "" }, c))), " 🔊"),
      el("div", { class: "tp-ask" }, t("✍️ 聽一聽，用手指把聲調寫在對的位置")),
      board, toneHint,
      el("div", { class: "tw-btns" },
        el("button", { class: "btn btn--ghost", onclick: clear }, t("🧹 擦掉")),
        el("button", { class: "btn btn--ghost", onclick: () => { hinted = true; toneHint.replaceChildren(t(`提示：這個字是${TW_NAME[it.tone]} `), el("span", { class: "tw-tonehint__mark", "data-nobopo": "" }, toneGlyph(it.tone))); } }, t("💡 是幾聲？")),
        el("button", { class: "btn btn--accent", onclick: check }, t("✓ 寫好了")))),
      feedback);
    requestAnimationFrame(fit);
    setTimeout(() => speakZh(it.word), 250);
  };

  const done = () => {
    progressLabel.textContent = "";
    const pass = first >= TW_PASS;
    const rec = tpStore();
    if (rec) {
      rec.writeBest = Math.max(rec.writeBest || 0, first);
      if (pass) rec.writePass = (rec.writePass || 0) + 1;
      missed.forEach(it => { const k = it.key; rec.missed[k] = (rec.missed[k] || 0) + 1; });
      const p = getProfile(); p.stars = (p.stars || 0) + first + (pass ? 5 : 0); saveStore();
    }
    if (pass && typeof confetti === "function") confetti();
    app.replaceChildren(el("div", { class: "result pop" },
      el("div", { class: "result__emoji" }, pass ? "🏅" : "💪"),
      el("div", { class: "result__score" }, t(`第一次就寫對 ${first} / ${items.length}`)),
      el("div", { class: "result__msg" }, t(pass ? `過關了！聲調的位置你都會了` : `要寫對 ${TW_PASS} 題才過關，差一點點！先練一練再來`)),
      el("div", { class: "tp-rule" }, el("div", { class: "tp-rule__text" }, t(`📌 ${TP_RULE}`)), el("div", { class: "tp-rule__text" }, t(`📌 ${TP_RULE_NEUTRAL}`))),
      missed.length ? el("div", { class: "zh-missed" }, el("div", { class: "zh-missed__title" }, t("寫錯過的（點一下聽）：")),
        el("div", { class: "tp-missed" }, missed.map(it => el("button", { class: "tp-missed__item", onclick: () => speakZh(it.word) },
          el("span", { class: "tp-find__zh", "data-nobopo": "" }, it.zh), tpSylEl(it.symbols, { tone: it.tone, pos: tpCorrectPos(it), cls: "tp-syl--sm tp-syl--ok" }))))) : null,
      el("div", { style: "display: grid; gap: 10px; max-width: 320px; margin: 12px auto 0;" },
        el("button", { class: "btn btn--accent", onclick: () => renderToneWrite(app, progressLabel, pool, back) }, t("✍️ 再考一次")),
        el("button", { class: "btn", onclick: back }, t("📍 回去練習")))));
  };
  ask();
}
