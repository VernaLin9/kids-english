// 🛡️ 認真作答（家長：小孩會亂點選項，點到對就按下一題）
// 自動套在所有「選一個答案」的題目上（國語、數學、英文、陀螺／寵物／夜市這些不計時的題目；計時遊戲和考卷不套）：
//  1. 新題目出來先看清楚：1 秒內點選項不算，提醒「先聽完題目」，記成「太快亂點」給家長看
//  2. 答錯：選項先停 2.5 秒，跳出「💡 小技巧」教怎麼想、怎麼記；同一題又錯，停 4 秒並把小技巧念出來
//  3. 題目出來 1.5 秒內就作答，學習紀錄會標「太快」
const GUARD_OPT = ".zh-opt, .quiz-option, .tp-opt, .tp-slot, .tp-find__col, .m-item, .nm-peg, .qz-opt, .bp-opt";
const GUARD_SKIP = ".ws, .g-stage, .g-arena";
const GUARD_WAIT = 1000, GUARD_FAST = 1500, GUARD_LOCK1 = 2500, GUARD_LOCK2 = 4000;
const guard = { shownAt: 0, wrongs: 0, lockUntil: 0, tipEl: null, lockedBox: null, timer: 0 };

// 依照現在在哪一頁，給「怎麼想、怎麼記」的小技巧（短句、白話）
function guardTip() {
  const h = location.hash;
  if (/#\/bopo/.test(h)) return null; // 注音總複習有自己的「記一記」
  if (/zhplay\/listen/.test(h)) return "把詞慢慢再聽一次：先聽第一個聲音是哪個注音，再聽後面的聲音，最後聽聲調是平平、往上、轉彎還是往下。";
  if (/zhplay\/tone/.test(h)) return "跟著念一次，用手比比看：一聲平平，二聲往上，三聲先下去再上來，四聲往下，輕聲輕輕短短的。";
  if (/zhplay\/spell|zhplay\/write/.test(h)) return "一個一個拼：先念聲母，再念韻母，拼在一起，最後加聲調。";
  if (/zhplay\/pick/.test(h)) return "看例詞想一想意思，再看部首；長得像的字要看清楚哪裡不一樣，例如己、已、巳的開口。";
  if (/zhplay\/radical/.test(h)) return "部首常常在字的左邊、上面或外框。想想這個字的意思跟什麼有關：跟水有關是氵，跟手有關是扌，跟說話有關是言。";
  if (/zhplay\/strokes/.test(h)) return "用手指在桌上一筆一筆寫，邊寫邊數；先數部首有幾畫，再數其他的部分，加起來就是總筆畫。";
  if (/zhplay\/sentence/.test(h)) return "先看圖：是誰？在哪裡？在做什麼？照順序一段一段選。";
  if (/tonedrill/.test(h)) return "聲調寫在最後一個注音的右上角；輕聲是小圓點，寫在最上面。";
  if (/mathplay\/shape|u=u5/.test(h)) return "數一數邊和角：三角形有3個邊；正方形4個邊一樣長；長方形2個長邊、2個短邊；圓形圓圓的，沒有角。會滾動的東西有彎彎的面。";
  if (/mathplay\/(split|make10)/.test(h)) return "用手指頭數：先比出前面的數，再一根一根加上去，數到總數，加了幾根就是答案。";
  if (/mathplay\/zero/.test(h)) return "什麼都沒有，就是0。先看看裡面是不是空空的。";
  if (/mathplay\/(line|length|height|thick|most|tf)|u=u2/.test(h)) return "比長短、高矮，要先看起點有沒有對齊，再看哪一個多出來比較多。";
  if (/mathplay|blocks/.test(h)) return "把題目再念一次：是合起來、多了（用加），還是拿走、比多少（用減）？可以用手指或積木數一數。";
  if (/play\/listening/.test(h)) return "再按🔊聽一次，注意第一個聲音，找開頭字母一樣的。";
  if (/play\/quiz/.test(h)) return "看圖想一想中文意思，再把每個英文念念看，哪一個聲音最像。";
  return "先看清楚題目，按🔊再聽一次，想一想再選。";
}
function guardClearTip() {
  clearTimeout(guard.timer);
  guard.tipEl?.remove(); guard.tipEl = null;
  guard.lockedBox?.classList.remove("guard-lock", "guard-lock--hard"); guard.lockedBox = null;
}
function guardRushLog() {
  const p = getProfile(); if (!p) return;
  const subj = /mathplay|blocks/.test(location.hash) ? "math" : /zh|tone|bopo/.test(location.hash) ? "zh" : /play/.test(location.hash) ? "en" : "";
  p.log = p.log || [];
  p.log.push([Date.now(), subj, location.hash.replace(/[&?]r=\d+/, "").slice(0, 60), "太快亂點", -1, 0, 1]);
  if (p.log.length > LOG_MAX) p.log = p.log.slice(-LOG_MAX);
  saveStore();
}
function guardToast(opt, text) {
  const box = opt.parentElement;
  if (!box) return;
  box.parentElement?.querySelector(".guard-toast")?.remove();
  const toast = el("div", { class: "guard-toast" }, t(text));
  box.after(toast);
  setTimeout(() => toast.remove(), 1600);
}
// 答錯：選項先停一下，出現小技巧（box＝選項外框；hard＝連點都不能點，給數字鍵這種不是選項的作答區用）
function guardOnWrong(box, hard = false) {
  guard.wrongs++;
  const ms = guard.wrongs >= 2 ? GUARD_LOCK2 : GUARD_LOCK1;
  guard.lockUntil = Date.now() + ms;
  guardClearTip();
  if (!box) return;
  const tip = guardTip();
  guard.lockedBox = box; box.classList.add("guard-lock");
  if (hard) box.classList.add("guard-lock--hard");
  if (!tip) { guard.timer = setTimeout(() => { guard.lockedBox?.classList.remove("guard-lock", "guard-lock--hard"); guard.lockedBox = null; }, ms); return; }
  guard.tipEl = el("div", { class: "guard-tip" },
    el("div", { class: "guard-tip__head" }, t(guard.wrongs >= 2 ? "🐢 慢慢來，不用急！先看小技巧" : "💡 小技巧")),
    el("div", { class: "guard-tip__body" }, el("div", { class: "guard-tip__text" }, t(tip)),
      el("button", { class: "l-say__btn", "aria-label": "念給我聽", onclick: e => { e.stopPropagation(); speakZh(tip); } }, "🔊")),
    el("div", { class: "guard-tip__bar" }, el("span", { style: `animation-duration: ${ms}ms` })));
  box.after(guard.tipEl);
  if (guard.wrongs >= 2) setTimeout(() => speakZh(tip), 700);
  guard.timer = setTimeout(() => { guard.lockedBox?.classList.remove("guard-lock", "guard-lock--hard"); guard.lockedBox = null; guard.tipEl?.querySelector(".guard-tip__bar")?.remove(); }, ms);
}

document.addEventListener("click", e => {
  const opt = e.target.closest?.(GUARD_OPT);
  if (!opt || opt.closest(GUARD_SKIP) || /^#\/game\//.test(location.hash) || opt.disabled) return;
  const now = Date.now();
  if (now - guard.shownAt < GUARD_WAIT) {
    e.stopImmediatePropagation(); e.preventDefault();
    guardToast(opt, "👂 先看清楚、聽完題目再選喔");
    guardRushLog();
    return;
  }
  if (now < guard.lockUntil) {
    e.stopImmediatePropagation(); e.preventDefault();
    guardToast(opt, "⏳ 先看小技巧，想一想再選");
    return;
  }
  if (now - guard.shownAt < GUARD_FAST && typeof logRushFlag !== "undefined") logRushFlag = true;
  // 看看這一下是不是答錯（各模式會在選項加 --bad / --wrong）
  setTimeout(() => {
    if (opt.matches('[class*="--bad"], [class*="--wrong"], [class*="--fine"]')) guardOnWrong(opt.parentElement);
    else if (typeof logRushFlag !== "undefined") logRushFlag = false;
  }, 0);
}, true);

// 新題目出現（畫面上多了一組選項）→ 重新計時
new MutationObserver(muts => {
  for (const m of muts) for (const n of m.addedNodes) {
    if (n.nodeType !== 1) continue;
    const hit = n.matches?.(GUARD_OPT) ? n : n.querySelector?.(GUARD_OPT);
    if (hit && !hit.closest(GUARD_SKIP)) { guard.shownAt = Date.now(); guard.wrongs = 0; guard.lockUntil = 0; guardClearTip(); return; }
  }
}).observe(document.documentElement, { childList: true, subtree: true });
