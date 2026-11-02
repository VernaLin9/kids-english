// 用字型畫出注音、數字 → 細線化（Zhang-Suen）→ 取 32 點，存成模板
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent(`<body style="font-family:'WenQuanYi Zen Hei'">x</body>`);
  const syms = "ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ0123456789";
  const out = await p.evaluate(syms => {
    const S = 160, res = {};
    const cv = document.createElement('canvas'); cv.width = cv.height = S; const ctx = cv.getContext('2d');
    for (const c of syms) {
      ctx.clearRect(0, 0, S, S); ctx.fillStyle = '#000'; ctx.font = `${S * 0.8}px 'WenQuanYi Zen Hei'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(c, S / 2, S / 2);
      const d = ctx.getImageData(0, 0, S, S).data;
      let g = new Uint8Array(S * S); for (let i = 0; i < S * S; i++) g[i] = d[i * 4 + 3] > 100 ? 1 : 0;
      // Zhang-Suen thinning
      const at = (x, y) => (x < 0 || y < 0 || x >= S || y >= S) ? 0 : g[y * S + x];
      let changed = true;
      while (changed) {
        changed = false;
        for (const step of [0, 1]) {
          const del = [];
          for (let y = 1; y < S - 1; y++) for (let x = 1; x < S - 1; x++) {
            if (!g[y * S + x]) continue;
            const n = [at(x, y - 1), at(x + 1, y - 1), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1), at(x - 1, y), at(x - 1, y - 1)];
            const B = n.reduce((a, b) => a + b, 0); if (B < 2 || B > 6) continue;
            let A = 0; for (let k = 0; k < 8; k++) if (!n[k] && n[(k + 1) % 8]) A++;
            if (A !== 1) continue;
            if (step === 0 ? (n[0] * n[2] * n[4] || n[2] * n[4] * n[6]) : (n[0] * n[2] * n[6] || n[0] * n[4] * n[6])) continue;
            del.push(y * S + x);
          }
          del.forEach(i => g[i] = 0); if (del.length) changed = true;
        }
      }
      const pts = []; for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (g[y * S + x]) pts.push([x, y]);
      res[c] = pts;
    }
    return res;
  }, syms);
  fs.writeFileSync('skel.json', JSON.stringify(out));
  console.log(Object.entries(out).map(([c, p]) => c + p.length).join(' '));
  await b.close();
})();
