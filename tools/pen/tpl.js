// 產生 modes-pen.js 的 PEN_TPL：node gen.js（字型骨架 skel.json）→ node tpl.js（輸出 tpl.json，貼進 PEN_TPL）；curve.js 測準確度（要先開 http.server 8765）
const fs = require('fs');
const H = require('./hand.js');
const skel = JSON.parse(fs.readFileSync('skel.json'));
const N = 32, A = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
function resample(strokes, n) {
  const pts = strokes.map(s => s.map(([x, y]) => ({ x, y })));
  let L = 0; pts.forEach(s => { for (let i = 1; i < s.length; i++) L += Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y); });
  const I = L / (n - 1); let D = 0; const out = [];
  pts.forEach(s => { out.push({ ...s[0] }); D = 0; let prev = s[0];
    for (let i = 1; i < s.length; i++) { let q = s[i]; let d = Math.hypot(q.x - prev.x, q.y - prev.y);
      while (D + d >= I && d > 0) { const t = (I - D) / d; const np = { x: prev.x + t * (q.x - prev.x), y: prev.y + t * (q.y - prev.y) }; out.push(np); prev = np; d = Math.hypot(q.x - prev.x, q.y - prev.y); D = 0; }
      D += d; prev = q; } });
  while (out.length < n) out.push({ ...out[out.length - 1] });
  return out;
}
function fps(px, n) { // farthest point sampling
  const P = px.map(([x, y]) => ({ x, y }));
  const cx = P.reduce((a, p) => a + p.x, 0) / P.length, cy = P.reduce((a, p) => a + p.y, 0) / P.length;
  let first = P.reduce((m, p) => Math.hypot(p.x - cx, p.y - cy) > Math.hypot(m.x - cx, m.y - cy) ? p : m, P[0]);
  const out = [first]; const dist = P.map(p => Math.hypot(p.x - first.x, p.y - first.y));
  while (out.length < n) { let k = 0; for (let i = 1; i < P.length; i++) if (dist[i] > dist[k]) k = i; out.push(P[k]); for (let i = 0; i < P.length; i++) dist[i] = Math.min(dist[i], Math.hypot(P[i].x - P[k].x, P[i].y - P[k].y)); }
  return out;
}
function enc(pts) {
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const mnx = Math.min(...xs), mny = Math.min(...ys), s = Math.max(Math.max(...xs) - mnx, Math.max(...ys) - mny) || 1;
  const w = (Math.max(...xs) - mnx) / s, h = (Math.max(...ys) - mny) / s;
  // 置中放在 0-63
  return pts.map(p => A[Math.round(((p.x - mnx) / s + (1 - w) / 2) * 63)] + A[Math.round(((p.y - mny) / s + (1 - h) / 2) * 63)]).join('');
}
const extra = { // 常見的其他寫法
  "1": [[[34,24],[50,10],[50,92]]], "7": [[[20,14],[80,14],[44,94]], [[34,54],[66,54]]], "4": [[[56,10],[20,62],[80,62]], [[60,40],[60,94]]],
  "9": [[[74,24],[50,10],[26,28],[44,50],[74,34],[74,94]]], "ㄧ": [[[50,12],[50,88]]],
};
const T = {};
for (const c of Object.keys(H)) {
  T[c] = [enc(fps(skel[c], N)), enc(resample(H[c], N).slice(0, N))];
  if (extra[c]) T[c].push(enc(resample(extra[c], N).slice(0, N)));
}
fs.writeFileSync('tpl.json', JSON.stringify(T));
console.log(JSON.stringify(T).length, Object.values(T).every(a => a.every(s => s.length === 64)));
