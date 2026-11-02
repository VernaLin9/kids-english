const { chromium } = require('/opt/node-tools/node_modules/playwright');
const H = require('./hand.js');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.route('**/translate.google.com/**', r => r.abort());
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800);
  const r = await p.evaluate(({ H, only }) => {
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const T = penTemplates(); if (only != null) Object.keys(T).forEach(c => T[c] = [T[c][only]]);
    const perturb = (ss, J) => {
      const sx = 0.85 + rnd() * 0.3, sy = 0.85 + rnd() * 0.3, rot = (rnd() - 0.5) * 0.3, sh = (rnd() - 0.5) * 0.2;
      const tf = ([x, y]) => { x -= 50; y -= 50; x += sh * y; const X = x * Math.cos(rot) - y * Math.sin(rot), Y = x * Math.sin(rot) + y * Math.cos(rot); return [X * sx + 50, Y * sy + 50]; };
      return ss.map(s => { const pts = s.map(([x, y]) => [x + (rnd() - 0.5) * J, y + (rnd() - 0.5) * J]).map(tf);
        const out = []; for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 8; k++) { const t = k / 8; out.push({ x: pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, y: pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t }); }
        out.push({ x: pts.at(-1)[0], y: pts.at(-1)[1] }); return out; });
    };
    const Ls = [1.0, 1.05, 1.1, 1.15, 1.2, 1.25];
    const out = {};
    for (const [name, set] of [["sym", PEN_SYMS], ["dig", PEN_DIGITS]]) {
      const good = Ls.map(() => 0), bad = Ls.map(() => 0); let ng = 0, nb = 0;
      for (const c of set) for (let k = 0; k < 20; k++) { const rs = penRank(perturb(H[c], 8), set); const d1 = rs[0].d, dc = rs.find(x => x.c === c).d; ng++; Ls.forEach((L, i) => { if (dc <= d1 * L) good[i]++; }); }
      for (let k = 0; k < 300; k++) { const ns = 1 + Math.floor(rnd() * 3); const s = Array.from({ length: ns }, () => { let x = rnd() * 100, y = rnd() * 100; return Array.from({ length: 12 }, () => ({ x: x += (rnd() - 0.5) * 40, y: y += (rnd() - 0.5) * 40 })); });
        const rs = penRank(s, set), e = set[k % set.length], d1 = rs[0].d, de = rs.find(x => x.c === e).d; nb++; Ls.forEach((L, i) => { if (de <= d1 * L) bad[i]++; }); }
      out[name] = Ls.map((L, i) => `${L}: ok ${(good[i] / ng * 100).toFixed(1)}% scribble ${(bad[i] / nb * 100).toFixed(1)}%`);
    }
    return out;
  }, { H, only: process.argv[2] === undefined ? null : +process.argv[2] });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
