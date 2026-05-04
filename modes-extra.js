// === Handwriting mode (canvas trace) ===
function setupCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.floor(r.width * dpr);
    canvas.height = Math.floor(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#3b3a4a";
  };
  resize();
  let drawing = false, lastX = 0, lastY = 0;
  const point = e => {
    const r = canvas.getBoundingClientRect();
    const t = e.touches?.[0] || e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };
  const down = e => { e.preventDefault(); drawing = true; const p = point(e); lastX = p.x; lastY = p.y; };
  const move = e => {
    if (!drawing) return;
    e.preventDefault();
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x; lastY = p.y;
  };
  const up = () => { drawing = false; };
  canvas.addEventListener("mousedown", down);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
  canvas.addEventListener("touchstart", down, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", up);
  return {
    clear: () => { const r = canvas.getBoundingClientRect(); ctx.clearRect(0, 0, r.width, r.height); },
    resize
  };
}

function renderHandwrite(setKey) {
  const words = resolveSet(setKey);
  if (!words.length) return renderEmpty(`#/`, "沒有單字");
  const queue = withSpacedRepetition(words);
  const total = words.length;
  let i = 0, doneCount = 0, streak = 0;

  const root = el("div", {});
  const header = renderHeader(`✍️ ${setLabel(setKey)}`, { back: backHashFor(setKey) });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

  function render() {
    if (i >= queue.length) {
      recordSession("handwrite", setKey, doneCount, total);
      app.replaceChildren(renderResultBlock(`寫完 ${doneCount} / ${total} 個字！`, "🌟", "再寫一次", () => navigate(`#/play/handwrite?set=${setKey}`)));
      return;
    }
    const w = queue[i];
    const info = WORDS[w] || { emoji: "❓", zh: "", bopo: "" };
    progressLabel.textContent = `${i + 1}/${queue.length}`;

    const promptCard = el("div", { class: "write-card" });
    const promptRow = el("div", { class: "write-prompt" });
    promptRow.appendChild(document.createTextNode(`${info.emoji} `));
    promptRow.appendChild(rubyEl(info.zh || "", info.bopo || "", "span"));
    promptCard.appendChild(promptRow);
    promptCard.appendChild(el("div", { style: "color: var(--ink-soft); font-size: calc(14px * var(--font-scale)); margin-bottom: 8px;" }, "用手指描寫底下的字 ✍️"));
    promptCard.appendChild(el("button", { class: "icon-btn icon-btn--big icon-btn--accent", onclick: () => speakWord(w), "aria-label": "念出" }, "🔊"));

    const wrap = el("div", { class: "write-canvas-wrap" });
    const canvas = el("canvas", { class: "write-canvas" });
    const guideClass = w.length > 7 ? "write-guide write-guide--small" : "write-guide";
    const guide = el("div", { class: guideClass }, w);
    wrap.appendChild(guide);
    wrap.appendChild(canvas);
    promptCard.appendChild(wrap);

    const actions = el("div", { class: "write-actions" });
    const clearBtn = el("button", { class: "btn btn--ghost" }, "🧹 清除重寫");
    const doneBtn = el("button", { class: "btn btn--success" }, "✅ 寫好了！");
    actions.appendChild(clearBtn);
    actions.appendChild(doneBtn);
    promptCard.appendChild(actions);

    app.replaceChildren(promptCard);
    const pen = setupCanvas(canvas);
    clearBtn.addEventListener("click", () => pen.clear());
    doneBtn.addEventListener("click", () => {
      doneCount++; streak++;
      setMastered(w, true);
      dingCorrect();
      speakWord(w);
      setTimeout(() => maybeMovementBreak(streak, () => { i++; render(); }), 800);
    });
    setTimeout(() => { pen.resize(); speakWord(w); }, 100);
  }
  render();
  return root;
}

// === Sentences overview ===
function renderSentences() {
  const cw = getCurrentWeek();
  const root = el("div", {});
  root.appendChild(renderHeader("💬 每週一句", { back: "#/" }));
  const app = el("main", { class: "app" });

  const list = el("div", { class: "sentence-list" });
  SENTENCES.forEach(s => {
    const isCurrent = s.week === cw.num;
    const dr = weekDateRange(s.week);
    const wp = weekProgress(s.week);
    const row = el("div", { class: `sentence-row ${isCurrent ? "sentence-row--current" : ""}` });
    row.appendChild(el("div", { class: "sentence-row__week" },
      `第 ${s.week} 週・${dr}${wp ? "・" + wp : ""}${isCurrent ? " 👈 本週" : ""}`));
    row.appendChild(el("div", { class: "sentence-row__en" }, s.en));
    row.appendChild(rubyEl(s.zh, s.bopo, "div", { class: "sentence-row__zh" }));
    row.appendChild(el("div", { style: "display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;" },
      el("button", { class: "icon-btn", style: "width: 44px; height: 44px; font-size: 20px;", onclick: () => speak(s.en.replace(/_+/g, "blank")), "aria-label": "念句子" }, "🔊"),
      el("button", { class: "btn btn--ghost", style: "min-height: 44px; font-size: calc(16px * var(--font-scale));", onclick: () => navigate(`#/play/sentence-card?week=${s.week}`) }, "🃏 句卡"),
      s.blank
        ? el("button", { class: "btn btn--ghost", style: "min-height: 44px; font-size: calc(16px * var(--font-scale));", onclick: () => navigate(`#/play/sentence-blank?week=${s.week}`) }, "✏️ 填空")
        : null
    ));
    list.appendChild(row);
  });
  app.appendChild(list);

  app.appendChild(el("div", { style: "margin-top: 16px;" },
    el("button", { class: "btn btn--full btn--xl btn--success", onclick: () => navigate("#/play/sentence-listen?week=all") },
      "👂 全部句子聽力測驗")
  ));

  root.appendChild(app);
  return root;
}

// === Sentence card mode ===
function renderSentenceCard(weekNum) {
  const list = weekNum === "all" ? SENTENCES : SENTENCES.filter(s => s.week === +weekNum);
  if (!list.length) return renderEmpty("#/sentences", "沒有句子");
  let i = 0, flipped = false;

  const root = el("div", {});
  const header = renderHeader("🃏 句卡", { back: "#/sentences" });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

  const wrap = el("div", { class: "flashcard-wrap" });
  const card = el("div", { class: "flashcard" });
  const front = el("div", { class: "flashcard__face" });
  const back = el("div", { class: "flashcard__face flashcard__face--back" });
  card.append(front, back);
  card.addEventListener("click", () => { flipped = !flipped; card.classList.toggle("flipped", flipped); });
  wrap.appendChild(card);
  app.appendChild(wrap);

  const controls = el("div", { class: "flash-controls" },
    el("button", { class: "icon-btn", "aria-label": "上一張" }, "←"),
    el("button", { class: "icon-btn icon-btn--big icon-btn--accent", "aria-label": "念出句子" }, "🔊"),
    el("button", { class: "icon-btn", "aria-label": "下一張" }, "→")
  );
  controls.children[0].addEventListener("click", e => { e.stopPropagation(); if (i > 0) { i--; render(); } });
  controls.children[1].addEventListener("click", e => { e.stopPropagation(); speak(list[i].en.replace(/_+/g, "blank")); });
  controls.children[2].addEventListener("click", e => { e.stopPropagation(); if (i < list.length - 1) { i++; render(); } });
  app.appendChild(controls);

  function render() {
    flipped = false;
    card.classList.remove("flipped");
    const s = list[i];
    front.replaceChildren(
      el("div", { class: "flashcard__emoji" }, "💬"),
      el("div", { class: "flashcard__en", style: "font-size: calc(28px * var(--font-scale)); line-height: 1.4;" }, s.en),
      el("div", { class: "flashcard__hint" }, t("點卡片看中文"))
    );
    back.replaceChildren(
      el("div", { class: "flashcard__emoji" }, "💬"),
      rubyEl(s.zh, s.bopo, "div", { class: "flashcard__zh", style: "font-size: calc(26px * var(--font-scale)); line-height: 1.4;" }),
      el("div", { class: "flashcard__hint" }, `第 ${s.week} 週・${weekDateRange(s.week)}`)
    );
    progressLabel.textContent = `${i + 1}/${list.length}`;
    controls.children[0].disabled = i === 0;
    controls.children[2].disabled = i === list.length - 1;
    setTimeout(() => speak(s.en.replace(/_+/g, "blank")), 200);
  }
  render();
  return root;
}

// === Sentence listening mode ===
function renderSentenceListen(weekArg) {
  const pool = weekArg === "all" ? SENTENCES : SENTENCES.filter(s => s.week === +weekArg);
  if (pool.length < 3) return renderEmpty("#/sentences", "句子太少，無法做聽力題");
  const order = shuffle(pool);
  let i = 0, score = 0, streak = 0, locked = false;

  const root = el("div", {});
  const header = renderHeader("👂 句子聽力", { back: "#/sentences" });
  root.appendChild(header);
  const progressLabel = $(".header__progress", header);
  const app = el("main", { class: "app" });
  root.appendChild(app);

  function render() {
    if (i >= order.length) {
      recordSession("sentence-listen", `week=${weekArg}`, score, order.length);
      app.replaceChildren(renderResultBlock(`答對 ${score} / ${order.length}`, score === order.length ? "🌟" : "🎉", "再來一次", () => navigate(`#/play/sentence-listen?week=${weekArg}`)));
      return;
    }
    locked = false;
    const s = order[i];
    progressLabel.textContent = `${i + 1}/${order.length}・${score}分`;

    const distractorsZ = shuffle(SENTENCES.filter(x => x.zh !== s.zh)).slice(0, 2);
    const opts = shuffle([s, ...distractorsZ]);
    const feedback = el("div", { class: "quiz-feedback" }, "");
    const optionsWrap = el("div", { class: "quiz-options", style: "grid-template-columns: 1fr;" });
    opts.forEach(opt => {
      const btn = el("button", { class: "quiz-option", style: "font-size: calc(20px * var(--font-scale)); min-height: 64px; text-align: left; padding-left: 18px;" });
      btn.appendChild(rubyEl(opt.zh, opt.bopo, "span"));
      btn.addEventListener("click", () => {
        if (locked) return;
        locked = true;
        if (opt.zh === s.zh) {
          btn.classList.add("quiz-option--correct");
          feedback.textContent = "答對了！🎉";
          feedback.className = "quiz-feedback quiz-feedback--correct pop";
          score++; streak++;
          dingCorrect();
        } else {
          btn.classList.add("quiz-option--wrong");
          [...optionsWrap.children].forEach(b => { if (b.textContent === s.zh) b.classList.add("quiz-option--correct"); });
          feedback.textContent = `正確：${s.en}`;
          feedback.className = "quiz-feedback quiz-feedback--wrong shake";
          streak = 0;
          buzzWrong();
        }
        setTimeout(() => maybeMovementBreak(streak, () => { i++; render(); }), 1500);
      });
      optionsWrap.appendChild(btn);
    });

    app.replaceChildren(
      el("div", { class: "quiz-prompt" },
        el("div", { class: "quiz-prompt__emoji" }, "🎧"),
        el("div", { class: "quiz-prompt__zh", style: "font-size: calc(24px * var(--font-scale));" }, "聽聽看，選出正確的中文"),
        el("button", { class: "icon-btn icon-btn--big icon-btn--accent", style: "margin-top: 12px;", onclick: () => speak(s.en.replace(/_+/g, "blank")), "aria-label": "重聽" }, "🔊")
      ),
      optionsWrap,
      feedback
    );
    setTimeout(() => speak(s.en.replace(/_+/g, "blank")), 300);
  }
  render();
  return root;
}

// === Sentence blank fill ===
function renderSentenceBlank(weekNum) {
  const s = SENTENCES.find(x => x.week === +weekNum && x.blank);
  if (!s) return renderEmpty("#/sentences", "這句沒有填空");

  const root = el("div", {});
  root.appendChild(renderHeader("✏️ 填空練習", { back: "#/sentences" }));
  const app = el("main", { class: "app" });
  root.appendChild(app);

  let chosen = null;
  const display = el("div", { class: "sentence-card__en" });
  const renderDisplay = () => {
    display.innerHTML = "";
    const parts = s.en.split(/(_+)/);
    parts.forEach(p => {
      if (/^_+$/.test(p)) {
        display.appendChild(el("span", {
          style: "display: inline-block; min-width: 90px; padding: 2px 10px; margin: 0 4px; background: var(--candy-4); border-radius: 8px; border-bottom: 3px solid var(--warn);"
        }, chosen || "____"));
      } else {
        display.appendChild(document.createTextNode(p));
      }
    });
  };
  renderDisplay();

  const suggest = el("div", { class: "blank-suggest" });
  s.blank.suggest.forEach(word => {
    const b = el("button", {}, word);
    b.addEventListener("click", () => {
      chosen = word;
      [...suggest.children].forEach(x => x.classList.remove("picked"));
      b.classList.add("picked");
      renderDisplay();
      dingCorrect();
      speak(s.en.replace(/_+/g, word));
    });
    suggest.appendChild(b);
  });

  const sCard = el("div", { class: "sentence-card" });
  sCard.appendChild(display);
  sCard.appendChild(rubyEl(s.zh, s.bopo, "div", { class: "sentence-card__zh" }));
  sCard.appendChild(el("div", { style: "margin-top: 8px; font-size: calc(14px * var(--font-scale)); color: var(--ink-soft);" }, `提示：${s.blank.hint}`));
  sCard.appendChild(el("div", { style: "margin-top: 16px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;" },
    el("button", { class: "icon-btn icon-btn--big icon-btn--accent", onclick: () => speak((chosen ? s.en.replace(/_+/g, chosen) : s.en.replace(/_+/g, "blank"))), "aria-label": "念句子" }, "🔊")
  ));
  app.appendChild(sCard);
  app.appendChild(el("div", { class: "section__title" }, "👇 點選一個詞填入"));
  app.appendChild(suggest);

  return root;
}
