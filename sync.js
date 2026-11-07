// ☁️ 雲端同步（家長：用手機看小孩做題的狀況；小孩換平板也要有之前的紀錄）
// 用家長自己 Google 帳號開的免費 Firebase 專案：Firestore 存資料、匿名登入，只用 REST API（不用載 SDK）。
// 家庭代碼：10 個字（31 種字元，約 8×10^14 種，猜不到）。
//   families/{代碼}               → { kids: [名字…], updatedAt }
//   families/{代碼}/kids/{名字}   → { data: profile 的 JSON 字串, updatedAt }
// 規則（tools/firebase-rules.txt）：一定要用完整代碼讀寫，不能列出所有家庭、不能刪除。
// 什麼時候同步：打開網頁、切回網頁、進家長模式時拿最新的；存檔後 4 秒、離開網頁時把這台改過的小孩送上去。
// 合併：學習紀錄 log、模擬考 mockExams 兩邊合起來（同一筆不重複）；其他（進度、星星、錯題本…）用比較新的那一邊（profile.updatedAt）。
// 設定（PIN、朗讀規則…）不同步，每台自己設。
const SYNC_CONFIG = window.SYNC_TEST_CONFIG || { apiKey: "AIzaSyDVJHqSMdrcusyWFkGz98xKCnzvqBz1z0g", projectId: "kids-english-c2a55" }; // 家長的 Firebase 專案（網頁設定碼的 apiKey 本來就是公開的；安全靠 tools/firebase-rules.txt）；SYNC_TEST_CONFIG 給自動測試用

const SYNC_AUTH_KEY = "kids-english:sync-auth";
const SYNC_CODE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const sync = { dirty: new Set(), timer: 0, busy: false, last: 0, error: "", applying: false };
const syncReady = () => !!(SYNC_CONFIG && STORE.settings.familyCode);
const syncFmtCode = c => (c || "").replace(/(.{4})(.{4})(.{2})/, "$1-$2-$3");
const syncNormCode = s => (s || "").toUpperCase().replace(/[^0-9A-Z]/g, "");

// 存檔時記下這台改了哪個小孩，4 秒後送上去
const syncOrigSave = saveStore;
saveStore = function () {
  if (!sync.applying && STORE.active && STORE.profiles[STORE.active]) {
    STORE.profiles[STORE.active].updatedAt = Date.now();
    sync.dirty.add(STORE.active);
    clearTimeout(sync.timer);
    if (syncReady()) sync.timer = setTimeout(() => syncPush(), 4000);
  }
  syncOrigSave();
};

// === 匿名登入（Identity Toolkit），token 一小時過期就用 refreshToken 換 ===
async function syncToken() {
  let a = null;
  try { a = JSON.parse(localStorage.getItem(SYNC_AUTH_KEY)); } catch {}
  if (a?.idToken && a.exp > Date.now() + 60000) return a.idToken;
  const key = SYNC_CONFIG.apiKey;
  let r, j;
  if (a?.refreshToken) {
    r = await fetch(`https://securetoken.googleapis.com/v1/token?key=${key}`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(a.refreshToken)}` });
    if (r.ok) { j = await r.json(); a = { idToken: j.id_token, refreshToken: j.refresh_token, exp: Date.now() + (+j.expires_in || 3600) * 1000 }; }
    else a = null;
  }
  if (!a?.idToken || a.exp <= Date.now()) {
    r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ returnSecureToken: true }) });
    if (!r.ok) throw new Error("登入雲端失敗（Firebase 的「匿名」登入可能還沒啟用）");
    j = await r.json();
    a = { idToken: j.idToken, refreshToken: j.refreshToken, exp: Date.now() + (+j.expiresIn || 3600) * 1000 };
  }
  try { localStorage.setItem(SYNC_AUTH_KEY, JSON.stringify(a)); } catch {}
  return a.idToken;
}
const syncDocUrl = path => `https://firestore.googleapis.com/v1/projects/${SYNC_CONFIG.projectId}/databases/(default)/documents/${path}`;
const syncKidPath = (code, name) => `families/${code}/kids/${encodeURIComponent(name)}`;
async function syncGet(path) {
  const r = await fetch(syncDocUrl(path), { headers: { Authorization: `Bearer ${await syncToken()}` } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`讀取失敗（${r.status}）${syncHint(r.status)}`);
  return (await r.json()).fields || {};
}
async function syncPatch(path, fields, keepalive = false) {
  const r = await fetch(syncDocUrl(path), { method: "PATCH", keepalive, headers: { Authorization: `Bearer ${await syncToken()}`, "Content-Type": "application/json" }, body: JSON.stringify({ fields }) });
  if (!r.ok) throw new Error(`寫入失敗（${r.status}）${syncHint(r.status)}`);
}
// 家長設定漏了哪一步：403＝規則還沒發布、404＝Firestore 資料庫還沒建立
const syncHint = st => st === 403 ? "：Firestore 規則可能還沒發布" : st === 404 ? "：Firestore 資料庫可能還沒建立" : "";
const syncKidsOf = f => (f?.kids?.arrayValue?.values || []).map(v => v.stringValue).filter(Boolean);

// === 合併兩邊的同一個小孩 ===
function syncMerge(local, remote) {
  if (!local) return remote;
  if (!remote) return local;
  const newer = (remote.updatedAt || 0) > (local.updatedAt || 0) ? remote : local;
  const out = structuredClone(newer);
  const logs = new Map();
  [...(local.log || []), ...(remote.log || [])].forEach(e => logs.set(`${e[0]}|${e[3]}|${e[2]}`, e));
  out.log = [...logs.values()].sort((a, b) => a[0] - b[0]).slice(-(typeof LOG_MAX !== "undefined" ? LOG_MAX : 4000));
  const keys = new Set([...Object.keys(local.mockExams || {}), ...Object.keys(remote.mockExams || {})]);
  if (keys.size) {
    out.mockExams = {};
    keys.forEach(k => {
      const m = new Map();
      [...(local.mockExams?.[k] || []), ...(remote.mockExams?.[k] || [])].forEach(r => m.set(r.at, r));
      out.mockExams[k] = [...m.values()].sort((a, b) => a.at - b.at).slice(-20);
    });
  }
  out.updatedAt = Math.max(local.updatedAt || 0, remote.updatedAt || 0);
  return out;
}

// === 拿最新的（每個小孩合併進來），合併後跟雲端不一樣的再送上去 ===
async function syncPull() {
  if (!syncReady() || !navigator.onLine || sync.busy) return false;
  sync.busy = true;
  let changed = false;
  try {
    const code = STORE.settings.familyCode;
    const fam = await syncGet(`families/${code}`);
    if (!fam) throw new Error("雲端找不到這個家庭代碼");
    for (const name of syncKidsOf(fam)) {
      const doc = await syncGet(syncKidPath(code, name));
      if (!doc?.data?.stringValue) continue;
      const remote = JSON.parse(doc.data.stringValue);
      const local = STORE.profiles[name];
      const merged = syncMerge(local, remote);
      if (JSON.stringify(merged) !== JSON.stringify(local)) { STORE.profiles[name] = merged; changed = true; }
      if (JSON.stringify(merged) !== JSON.stringify(remote)) sync.dirty.add(name);
    }
    Object.keys(STORE.profiles).forEach(n => { if (!syncKidsOf(fam).includes(n)) sync.dirty.add(n); });
    if (changed) { sync.applying = true; syncOrigSave(); sync.applying = false; }
    sync.last = Date.now(); sync.error = "";
  } catch (e) { sync.error = e.message || "同步失敗"; }
  sync.busy = false;
  if (sync.dirty.size) await syncPush();
  return changed;
}
// === 把這台改過的小孩送上去 ===
async function syncPush(keepalive = false) {
  if (!syncReady() || !navigator.onLine || !sync.dirty.size) return;
  if (sync.busy && !keepalive) { clearTimeout(sync.timer); sync.timer = setTimeout(() => syncPush(), 3000); return; }
  sync.busy = true;
  const names = [...sync.dirty];
  try {
    const code = STORE.settings.familyCode;
    for (const name of names) {
      const p = STORE.profiles[name];
      if (!p) continue;
      await syncPatch(syncKidPath(code, name), { data: { stringValue: JSON.stringify(p) }, updatedAt: { integerValue: String(p.updatedAt || Date.now()) } }, keepalive);
      sync.dirty.delete(name);
    }
    const kids = [...new Set([...Object.keys(STORE.profiles)])];
    await syncPatch(`families/${code}`, { kids: { arrayValue: { values: kids.map(k => ({ stringValue: k })) } }, updatedAt: { integerValue: String(Date.now()) } }, keepalive);
    sync.last = Date.now(); sync.error = "";
  } catch (e) { sync.error = e.message || "同步失敗"; }
  sync.busy = false;
}
// 首頁、家長模式拿到新資料就重畫（做題目到一半不打斷）
const syncRefreshView = () => { if (/^#\/(parent|profile)?($|\/|\?)/.test(location.hash || "#/") && typeof route === "function") route(); };
async function syncNow() { const changed = await syncPull(); if (changed) syncRefreshView(); return changed; }

// === 家長模式：☁️ 雲端同步 ===
function renderSyncSection() {
  const box = el("div", { class: "section" }, el("div", { class: "section__title" }, "☁️ 雲端同步（手機、平板都看得到紀錄）"));
  if (!SYNC_CONFIG) { box.append(el("div", { class: "log-legend" }, "還沒設定：家長開好 Firebase 專案、把設定碼給工程師以後就能用。")); return box; }
  const status = el("div", { class: "log-legend" });
  const showStatus = () => status.textContent = sync.error ? `⚠️ ${sync.error}` : sync.last ? `✅ 最後同步：${new Date(sync.last).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}` : "同步中…";
  const code = STORE.settings.familyCode;
  if (!code) {
    box.append(el("div", { class: "log-legend" }, "第一台（小孩平時用的平板）按「建立家庭代碼」；其他裝置（家長手機、新平板）按「輸入家庭代碼」，就會拿到同一份紀錄。"),
      el("button", { class: "btn btn--accent btn--full", onclick: async () => {
        let c = ""; const rnd = crypto.getRandomValues(new Uint32Array(10));
        rnd.forEach(n => c += SYNC_CODE_CHARS[n % SYNC_CODE_CHARS.length]);
        STORE.settings.familyCode = c; Object.keys(STORE.profiles).forEach(n => sync.dirty.add(n)); syncOrigSave();
        await syncPush(); route();
      } }, "這台是第一台：建立家庭代碼"),
      el("button", { class: "btn btn--ghost btn--full", style: "margin-top: 8px;", onclick: async () => {
        const c = syncNormCode(prompt("請輸入家庭代碼（10個字，在第一台的家長模式看得到）"));
        if (c.length !== 10) { if (c) alert("代碼要10個字"); return; }
        STORE.settings.familyCode = c; syncOrigSave();
        sync.error = ""; await syncPull();
        if (sync.error) { alert(`${sync.error}，請檢查代碼`); STORE.settings.familyCode = ""; syncOrigSave(); }
        route();
      } }, "已經有代碼：輸入家庭代碼"));
    return box;
  }
  box.append(el("div", { class: "sync-code", "data-nobopo": "1" }, syncFmtCode(code)),
    el("div", { class: "log-legend" }, "家庭代碼：在家長手機或新平板的家長模式按「輸入家庭代碼」，打這10個字。代碼不要給別人。"),
    status,
    el("button", { class: "btn btn--ghost btn--full", onclick: async () => { status.textContent = "同步中…"; await syncNow(); showStatus(); if (!sync.error) route(); } }, "🔄 立刻同步"),
    el("button", { class: "btn btn--ghost btn--full", style: "margin-top: 8px;", onclick: () => { if (!confirm("這台不再同步？（這台的紀錄留著，雲端的也不會刪）")) return; STORE.settings.familyCode = ""; syncOrigSave(); route(); } }, "這台不再同步"));
  showStatus();
  if (!sync.busy && Date.now() - sync.last > 15000) syncNow().then(showStatus);
  return box;
}

// 打開網頁、切回網頁拿最新的；離開網頁把改過的送上去
window.addEventListener("load", () => { if (syncReady()) setTimeout(syncNow, 800); });
document.addEventListener("visibilitychange", () => {
  if (!syncReady()) return;
  if (document.visibilityState === "hidden") { clearTimeout(sync.timer); syncPush(true); }
  else syncNow();
});
window.addEventListener("online", () => { if (syncReady()) syncNow(); });
