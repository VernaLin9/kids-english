// === Generic empty / result blocks ===
function renderEmpty(back, msg) {
  const root = el("div", {});
  root.appendChild(renderHeader("沒有資料", { back }));
  root.appendChild(el("main", { class: "app" },
    el("div", { class: "empty" }, msg),
    el("button", { class: "btn btn--full", onclick: () => navigate(back) }, "回上一頁")
  ));
  return root;
}
function renderResultBlock(score, emoji, btnText, onClick) {
  return el("div", { class: "result pop" },
    el("div", { class: "result__emoji" }, emoji),
    el("div", { class: "result__score" }, score),
    el("div", { class: "result__msg" }, t("你好棒！繼續加油 💪")),
    el("div", { style: "display: grid; gap: 10px; max-width: 320px; margin: 0 auto;" },
      el("button", { class: "btn btn--accent", onclick: onClick }, typeof btnText === "string" ? t(btnText) : btnText),
      el("button", { class: "btn btn--ghost", onclick: () => navigate("#/") }, t("🏠 回首頁"))
    )
  );
}

// === Parent mode ===
let parentSession = false;       // 記憶體變數，重整後就消失要重輸 PIN
let parentLockUntil = 0;          // 連錯後鎖定到何時（timestamp ms）
let parentTries = 0;

function unitMasteryStats(unitId, profile) {
  const u = UNITS.find(x => x.id === unitId);
  if (!u) return { mastered: 0, total: 0, pct: 0 };
  let m = 0;
  u.words.forEach(w => { if (profile?.progress?.[w]?.mastered) m++; });
  return { mastered: m, total: u.words.length, pct: Math.round((m / u.words.length) * 100) };
}
function categoryMasteryStats(catId, profile) {
  const c = CATEGORIES.find(x => x.id === catId);
  if (!c) return { mastered: 0, total: 0, pct: 0 };
  let m = 0;
  c.words.forEach(w => { if (profile?.progress?.[w]?.mastered) m++; });
  return { mastered: m, total: c.words.length, pct: Math.round((m / c.words.length) * 100) };
}
function struggleList(profile, n = 10) {
  if (!profile?.progress) return [];
  return Object.entries(profile.progress)
    .filter(([w, r]) => r.wrong > 0 && WORDS[w])
    .map(([w, r]) => ({ word: w, wrong: r.wrong, seen: r.seen, ratio: r.wrong / Math.max(r.seen, 1) }))
    .sort((a, b) => b.ratio - a.ratio || b.wrong - a.wrong)
    .slice(0, n);
}
function totalAttempts(profile) {
  if (!profile?.progress) return { correct: 0, wrong: 0, total: 0, pct: 0 };
  let correct = 0, wrong = 0;
  Object.values(profile.progress).forEach(r => { correct += r.correct || 0; wrong += r.wrong || 0; });
  const total = correct + wrong;
  return { correct, wrong, total, pct: total ? Math.round((correct / total) * 100) : 0 };
}
function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}
function modeName(m) {
  return ({ quiz: "選擇題", listening: "聽力", spelling: "拼字", handwrite: "手寫", "sentence-listen": "句子聽力" })[m] || m;
}
function exportProfileText(name) {
  const p = STORE.profiles[name]; if (!p) return "";
  const masteredCount = Object.values(p.progress || {}).filter(x => x.mastered).length;
  const total = Object.keys(WORDS).length;
  const att = totalAttempts(p);
  const lines = [];
  lines.push(`📚 ${name} 的英文學習進度`);
  lines.push(`⭐ 星數：${p.stars || 0}`);
  lines.push(`✅ 已學會：${masteredCount} / ${total}（${Math.round(masteredCount * 100 / total)}%）`);
  lines.push(`📊 答對率：${att.pct}%（共 ${att.total} 題）`);
  lines.push(`🕒 最後使用：${fmtDate(p.lastVisit)}`);
  lines.push("");
  lines.push("📝 單元進度：");
  UNITS.forEach(u => {
    const s = unitMasteryStats(u.id, p);
    lines.push(`  ${u.emoji} ${u.name}：${s.mastered}/${s.total}（${s.pct}%）`);
  });
  lines.push("");
  const sl = struggleList(p, 10);
  if (sl.length) {
    lines.push("💪 需要加強的字（常答錯）：");
    sl.forEach(s => lines.push(`  ${s.word}（${WORDS[s.word]?.zh || ""}） 答錯 ${s.wrong} 次 / 共 ${s.seen} 次`));
  }
  return lines.join("\n");
}
function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => alert("已複製到剪貼簿！"), () => fallbackCopy(text));
  } else fallbackCopy(text);
}
function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); alert("已複製！"); } catch { alert("複製失敗，請手動選取"); }
  document.body.removeChild(ta);
}

function renderParentGate() {
  const isFirstTime = !STORE.settings.parentPin;
  const root = el("div", { class: "profile-gate" });
  const card = el("div", { class: "profile-card" });
  card.appendChild(el("div", { style: "font-size: 56px; line-height: 1;" }, "👪"));
  card.appendChild(rubyEl(isFirstTime ? "設定家長 PIN" : "家長模式", null, "h1"));
  card.appendChild(rubyEl(isFirstTime ? "請設定 4 位數 PIN，下次進入要輸入" : "請輸入 4 位數家長 PIN", null, "p"));

  const input = el("input", { type: "tel", inputmode: "numeric", pattern: "[0-9]*", maxlength: 4, placeholder: "○ ○ ○ ○", style: "letter-spacing: 18px; font-size: 32px;" });
  card.appendChild(input);

  const msg = el("div", { style: "min-height: 22px; margin-top: 8px; color: var(--danger); font-weight: 700;" });
  card.appendChild(msg);

  const lockedNow = () => Date.now() < parentLockUntil;
  const submit = () => {
    if (lockedNow()) {
      const sec = Math.ceil((parentLockUntil - Date.now()) / 1000);
      msg.textContent = `鎖定中，請等 ${sec} 秒`;
      return;
    }
    const pin = (input.value || "").trim();
    if (!/^\d{4}$/.test(pin)) {
      msg.textContent = "請輸入 4 位數字";
      input.classList.add("shake");
      setTimeout(() => input.classList.remove("shake"), 400);
      return;
    }
    if (isFirstTime) {
      STORE.settings.parentPin = pin;
      saveStore();
      parentSession = true;
      parentTries = 0;
      navigate("#/parent");
      return;
    }
    if (pin === STORE.settings.parentPin) {
      parentSession = true;
      parentTries = 0;
      navigate("#/parent");
    } else {
      parentTries++;
      msg.textContent = parentTries >= 3 ? "錯太多次，鎖定 30 秒" : `PIN 不對 (${parentTries}/3)`;
      input.classList.add("shake");
      setTimeout(() => input.classList.remove("shake"), 400);
      input.value = "";
      if (parentTries >= 3) {
        parentLockUntil = Date.now() + 30000;
        parentTries = 0;
      }
    }
  };
  input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
  card.appendChild(el("button", { class: "btn btn--accent btn--full", style: "margin-top: 14px;", onclick: submit }, isFirstTime ? "設定 PIN" : "進入"));
  card.appendChild(el("button", { class: "btn btn--ghost btn--full", style: "margin-top: 8px;", onclick: () => navigate("#/") }, "↩️ 取消"));

  if (!isFirstTime) {
    card.appendChild(el("div", { style: "margin-top: 14px; font-size: 12px; color: var(--ink-soft);" },
      "忘記 PIN？清除瀏覽器網站資料即可重設（連同所有進度也會清空）"));
  }
  setTimeout(() => input.focus(), 100);
  root.appendChild(card);
  return root;
}

function renderParentDashboard() {
  const root = el("div", {});
  const header = el("header", { class: "header" },
    el("button", { class: "header__back", onclick: () => navigate("#/"), "aria-label": "回首頁" }, "←"),
    el("div", { class: "header__title" }, t("家長模式")),
    el("button", { class: "header__progress", style: "color: var(--accent); cursor: pointer; font-weight: 800;", onclick: () => { parentSession = false; navigate("#/"); } }, t("登出"))
  );
  root.appendChild(header);
  const app = el("main", { class: "app" });

  // Per-kid summary cards
  const kidNames = Object.keys(STORE.profiles);
  if (!kidNames.length) {
    app.appendChild(el("div", { class: "empty" }, t("還沒有任何小孩的紀錄")));
  } else {
    const list = el("div", { class: "kid-grid" });
    kidNames.forEach(name => {
      const p = STORE.profiles[name];
      const masteredCount = Object.values(p.progress || {}).filter(x => x.mastered).length;
      const totalWords = Object.keys(WORDS).length;
      const pct = Math.round((masteredCount / totalWords) * 100);
      const att = totalAttempts(p);
      const card = el("button", { class: "kid-card", onclick: () => navigate(`#/parent/kid/${encodeURIComponent(name)}`) });
      card.appendChild(el("div", { class: "kid-card__name" }, "👤 " + name));
      const stats = el("div", { class: "kid-card__stats" });
      stats.appendChild(el("div", {}, "⭐ " + (p.stars || 0)));
      stats.appendChild(el("div", {}, `✅ ${masteredCount}/${totalWords}`));
      stats.appendChild(el("div", {}, `📊 ${att.pct}%`));
      card.appendChild(stats);
      const dateRow = el("div", { class: "kid-card__date" });
      dateRow.appendChild(t("最後使用："));
      dateRow.appendChild(document.createTextNode(fmtDate(p.lastVisit)));
      card.appendChild(dateRow);
      const bar = el("div", { class: "progress-bar", style: "margin-top: 10px;" },
        el("div", { class: "progress-bar__fill", style: `width: ${pct}%;` }));
      card.appendChild(bar);
      list.appendChild(card);
    });
    app.appendChild(el("div", { class: "section__title" }, t("👤 小孩列表")));
    app.appendChild(list);
  }

  // Settings
  app.appendChild(el("div", { class: "section section--hide-on-focus" },
    el("div", { class: "section__title" }, t("⚙️ 設定")),
    el("button", {
      class: "btn btn--ghost btn--full",
      onclick: () => {
        const oldPin = prompt("請輸入目前的 PIN");
        if (oldPin !== STORE.settings.parentPin) { alert("PIN 不對"); return; }
        const newPin = prompt("請輸入新的 4 位數 PIN");
        if (!/^\d{4}$/.test(newPin || "")) { alert("PIN 必須是 4 位數字"); return; }
        STORE.settings.parentPin = newPin;
        saveStore();
        alert("PIN 已更換");
      }
    }, t("🔑 更換 PIN"))
  ));

  // Export all
  if (kidNames.length) {
    app.appendChild(el("div", { class: "section section--hide-on-focus" },
      el("button", { class: "btn btn--full", onclick: () => copyToClipboard(kidNames.map(exportProfileText).join("\n\n———\n\n")) },
        t("📤 複製所有小孩的進度報告"))
    ));
  }

  root.appendChild(app);
  return root;
}

function renderParentKidDetail(name) {
  const p = STORE.profiles[name];
  if (!p) return renderEmpty("#/parent", "找不到這個小孩");
  const masteredCount = Object.values(p.progress || {}).filter(x => x.mastered).length;
  const totalWords = Object.keys(WORDS).length;
  const att = totalAttempts(p);

  const root = el("div", {});
  root.appendChild(el("header", { class: "header" },
    el("button", { class: "header__back", onclick: () => navigate("#/parent"), "aria-label": "回家長首頁" }, "←"),
    el("div", { class: "header__title" }, "👤 " + name),
    el("div", { class: "header__progress" }, `⭐${p.stars || 0}`)
  ));
  const app = el("main", { class: "app" });

  // Stats card
  const stats = el("div", { class: "kid-stats" });
  const statBox = (icon, label, value) => {
    const box = el("div", { class: "kid-stats__box" });
    box.appendChild(el("div", { style: "font-size: 24px;" }, icon));
    box.appendChild(rubyEl(label, null, "div", { style: "font-size: 12px; color: var(--ink-soft);" }));
    box.appendChild(el("div", { style: "font-size: 22px; font-weight: 900;" }, value));
    return box;
  };
  stats.appendChild(statBox("⭐", "星數", String(p.stars || 0)));
  stats.appendChild(statBox("✅", "已學會", `${masteredCount}/${totalWords}`));
  stats.appendChild(statBox("📊", "答對率", `${att.pct}%`));
  stats.appendChild(statBox("📝", "總題數", String(att.total)));
  app.appendChild(stats);
  const lastVisitRow = el("div", { style: "color: var(--ink-soft); font-size: 13px; text-align: center; margin-bottom: 8px;" });
  lastVisitRow.appendChild(document.createTextNode("🕒 "));
  lastVisitRow.appendChild(t("最後使用："));
  lastVisitRow.appendChild(document.createTextNode(fmtDate(p.lastVisit)));
  app.appendChild(lastVisitRow);

  // Unit progress
  app.appendChild(el("div", { class: "section__title" }, t("📊 單元進度")));
  const unitBox = el("div", { class: "unit-bars" });
  UNITS.forEach(u => {
    const s = unitMasteryStats(u.id, p);
    const row = el("div", { class: "unit-bar" });
    row.appendChild(el("div", { class: "unit-bar__head" },
      el("span", {}, u.emoji + " "),
      rubyEl(u.name, u.bopo, "span"),
      el("span", { class: "unit-bar__count" }, ` ${s.mastered}/${s.total} (${s.pct}%)`)
    ));
    const bar = el("div", { class: "progress-bar" },
      el("div", { class: `progress-bar__fill ${s.pct < 50 ? "progress-bar__fill--warn" : ""}`, style: `width: ${s.pct}%;` }));
    row.appendChild(bar);
    unitBox.appendChild(row);
  });
  app.appendChild(unitBox);

  // Category progress
  app.appendChild(el("div", { class: "section__title" }, t("🎨 主題進度")));
  const catBox = el("div", { class: "unit-bars" });
  CATEGORIES.forEach(c => {
    const s = categoryMasteryStats(c.id, p);
    const row = el("div", { class: "unit-bar" });
    row.appendChild(el("div", { class: "unit-bar__head" },
      el("span", {}, c.emoji + " "),
      rubyEl(c.name, c.bopo, "span"),
      el("span", { class: "unit-bar__count" }, ` ${s.mastered}/${s.total} (${s.pct}%)`)
    ));
    const bar = el("div", { class: "progress-bar" },
      el("div", { class: `progress-bar__fill ${s.pct < 50 ? "progress-bar__fill--warn" : ""}`, style: `width: ${s.pct}%;` }));
    row.appendChild(bar);
    catBox.appendChild(row);
  });
  app.appendChild(catBox);

  // Struggle list
  const sl = struggleList(p, 10);
  if (sl.length) {
    app.appendChild(el("div", { class: "section__title" }, t("💪 需要加強")));
    const list = el("div", { style: "display: grid; gap: 6px;" });
    sl.forEach(s => {
      const info = WORDS[s.word] || {};
      const row = el("div", { class: "struggle-row" });
      row.appendChild(el("span", { style: "font-size: 22px;" }, info.emoji || "❓"));
      row.appendChild(el("span", { class: "struggle-row__en" }, s.word));
      row.appendChild(rubyEl(info.zh || "", info.bopo || "", "span", { class: "struggle-row__zh" }));
      row.appendChild(el("span", { class: "struggle-row__count" }, `❌ ${s.wrong}/${s.seen}`));
      list.appendChild(row);
    });
    app.appendChild(list);
  }

  // Mastered list (compact)
  const masteredWords = Object.entries(p.progress || {}).filter(([w, r]) => r.mastered).map(([w]) => w);
  if (masteredWords.length) {
    app.appendChild(el("div", { class: "section__title" }, `⭐ 已學會（${masteredWords.length}）`));
    const wrap = el("div", { style: "display: flex; flex-wrap: wrap; gap: 6px;" });
    masteredWords.forEach(w => {
      const info = WORDS[w] || {};
      const chip = el("span", { class: "hero__chip", style: "font-size: 14px;" });
      chip.appendChild(document.createTextNode(`${info.emoji || ""} ${w}`));
      wrap.appendChild(chip);
    });
    app.appendChild(wrap);
  }

  // Sessions
  const sessions = (p.sessions || []).slice().reverse().slice(0, 20);
  if (sessions.length) {
    app.appendChild(el("div", { class: "section__title" }, t("📝 最近練習紀錄")));
    const list = el("div", { style: "display: grid; gap: 6px;" });
    sessions.forEach(s => {
      const row = el("div", { class: "session-row" });
      row.appendChild(el("span", { class: "session-row__date" }, fmtDate(s.date)));
      row.appendChild(rubyEl(modeName(s.mode), null, "span", { class: "session-row__mode" }));
      row.appendChild(el("span", { class: "session-row__set" }, s.setKey));
      const sc = `${s.score}/${s.total}`;
      row.appendChild(el("span", { class: `session-row__score ${s.score === s.total ? "session-row__score--full" : ""}` }, sc));
      list.appendChild(row);
    });
    app.appendChild(list);
  }

  // Actions
  app.appendChild(el("div", { class: "section parent-danger" },
    el("button", { class: "btn btn--full", onclick: () => copyToClipboard(exportProfileText(name)) },
      t("📤 複製這個小孩的進度報告")),
    el("button", {
      class: "btn btn--full btn--danger",
      style: "margin-top: 10px;",
      onclick: () => {
        if (!confirm(`真的要清空 ${name} 的所有進度？這個動作無法還原。`)) return;
        const word = prompt('請輸入「重設」二字以確認');
        if (word !== "重設") { alert("沒有輸入正確，已取消"); return; }
        STORE.profiles[name] = ensureProfileFields({ progress: {}, stars: 0, lastVisit: null, sessions: [] });
        saveStore();
        alert(`${name} 的進度已清空`);
        navigate("#/parent");
      }
    }, t("🗑️ 重設這個小孩的進度"))
  ));

  root.appendChild(app);
  return root;
}

// === Router ===
function route() {
  applySettings();
  // Profile gate first — except for parent mode (PIN gate) which works without active child
  if (!STORE.active && location.hash !== "#/profile" && !location.hash.startsWith("#/parent")) {
    const root = $("#app");
    root.replaceChildren(renderProfileGate());
    return;
  }
  const { path, query } = parseHash();
  let view;
  if (path.length === 0) { view = renderHome(); touchProfileVisit(); }
  else if (path[0] === "profile") view = renderProfilePage();
  else if (path[0] === "parent") {
    if (!parentSession) {
      view = renderParentGate();
    } else if (path[1] === "kid" && path[2]) {
      view = renderParentKidDetail(decodeURIComponent(path[2]));
    } else {
      view = renderParentDashboard();
    }
  }
  else if (path[0] === "exam") view = renderExam();
  else if (path[0] === "week" && path[1]) view = renderListPage(`week-${path[1]}`);
  else if (path[0] === "category" && path[1]) view = renderListPage(`category-${path[1]}`);
  else if (path[0] === "sentences") view = renderSentences();
  else if (path[0] === "play") {
    const setKey = query.set;
    const week = query.week;
    if (path[1] === "flashcard") view = renderFlashcard(setKey);
    else if (path[1] === "quiz") view = renderQuiz(setKey);
    else if (path[1] === "listening") view = renderListening(setKey);
    else if (path[1] === "spelling") view = renderSpelling(setKey);
    else if (path[1] === "handwrite") view = renderHandwrite(setKey);
    else if (path[1] === "sentence-card") view = renderSentenceCard(week);
    else if (path[1] === "sentence-listen") view = renderSentenceListen(week);
    else if (path[1] === "sentence-blank") view = renderSentenceBlank(week);
    else view = renderHome();
  } else view = renderHome();

  const root = $("#app");
  root.replaceChildren(view);
  window.scrollTo({ top: 0, behavior: "instant" });
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);
if (document.readyState !== "loading") route();
