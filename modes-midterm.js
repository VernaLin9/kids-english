// 📄 期中考複習卷：11/1 課後照顧「考前到校複習日」老師發的考卷＋解答（家長放在 Drive「期中考複習-一上／二上」）
// 題目、注音、順序照原卷；答案照老師的解答（紅字）。原卷沒寫配分 → 照題數給，共 100 分。
// 作答：聽寫、看圖填字用「點注音拼出來」（mpSpell，跟拼注音一樣：選符號＋聲調，一個字一個字拼）；其他是選擇題。
// 練習版：選完按「下一題」馬上對答案，錯了看答案和怎麼記；模擬考版：寫完才看分數（renderChoiceExam）。

// 一年級：課照國語期中複習卷（注音符號總評量練習卷），題目卷 PDF＋第一、二頁解答照片
// 第六大題第 6 題（青蛙在狂歡會表演什麼節目）老師解答沒有寫答案 → 先不放
const MID_G1_ZH = {
  id: "g1zh", grade: "g1", title: "注音符號總評量練習卷", sub: "課照 國語期中複習卷（11/1 複習日）",
  sections: [
    { no: "一", name: "聽寫", pts: 3, qs: [
      ["國歌", "ㄍㄨㄛˊ ㄍㄜ"], ["炒麵", "ㄔㄠˇ ㄇㄧㄢˋ"], ["上學", "ㄕㄤˋ ㄒㄩㄝˊ"], ["松鼠", "ㄙㄨㄥ ㄕㄨˇ"], ["球鞋", "ㄑㄧㄡˊ ㄒㄧㄝˊ"],
      ["帆船", "ㄈㄢˊ ㄔㄨㄢˊ"], ["黑熊", "ㄏㄟ ㄒㄩㄥˊ"], ["打針", "ㄉㄚˇ ㄓㄣ"], ["蘋果", "ㄆㄧㄥˊ ㄍㄨㄛˇ"], ["旅行", "ㄌㄩˇ ㄒㄧㄥˊ"],
    ].map(([zh, bopo], k) => ({ kind: "spell", n: k + 1, zh, bopo, prompt: "聽一聽，把注音拼出來" })) },
    // 造詞：原卷是自己寫一個詞；這裡改成選出「有這個音」的詞，對的選項用老師解答寫的詞
    { no: "二", name: "造詞", pts: 2, qs: [
      { syl: "ㄅㄛˊ", say: "博，博愛", options: ["ㄅㄛˊ ㄞˋ", "ㄆㄛˊ ㄆㄛ˙", "ㄅㄛ ㄌㄧˊ", "ㄅㄨˋ ㄉㄧㄥ"] },
      { syl: "ㄊㄨㄟˋ", say: "退，退步", options: ["ㄊㄨㄟˋ ㄅㄨˋ", "ㄊㄨㄟ ㄔㄜ", "ㄉㄨㄟˋ ㄇㄧㄢˋ", "ㄊㄞˋ ㄧㄤˊ"] },
      { syl: "ㄒㄧㄚˋ", say: "下，夏天", options: ["ㄒㄧㄚˋ ㄊㄧㄢ", "ㄒㄧㄚ ㄗ˙", "ㄐㄧㄚ ㄖㄣˊ", "ㄒㄧㄝˋ ㄒㄧㄝ˙"] },
      { syl: "ㄅㄣˇ", say: "本，課本", options: ["ㄎㄜˋ ㄅㄣˇ", "ㄅㄣ ㄆㄠˇ", "ㄆㄣˊ ㄗ˙", "ㄅㄥˋ ㄊㄧㄠˋ"] },
      { syl: "ㄨㄥ", say: "翁，大富翁", options: ["ㄉㄚˋ ㄈㄨˋ ㄨㄥ", "ㄉㄚˋ ㄨㄤˊ", "ㄨㄣ ㄋㄨㄢˇ", "ㄏㄨㄥˊ ㄙㄜˋ"] },
    ].map((x, k) => ({ kind: "choice", n: k + 1, shuffle: true, line: `${x.syl} ：`, hint: `哪一個詞裡面有「${x.syl}」？`, say: `哪一個詞裡面有${x.say.split("，")[0]}`, options: x.options, answer: 0,
      tip: `「${x.syl}」可以造「${x.options[0]}」。先念「${x.syl}」，再一個一個念選項，聲音和聲調都要一樣。` })) },
    { no: "三", name: "填入適合的字或詞", pts: 3, qs: [
      { line: "ㄐㄧㄥ ㄍㄨㄛˋ （　） ㄧㄠˋ ㄒㄧㄠˇ ㄒㄧㄣ", say: "經過什麼要小心？", options: ["ㄕㄢ ㄧㄞˊ", "ㄌㄨˋ ㄧㄥˊ"], answer: 0, tip: "經過山崖要小心：山崖很高很危險。露營是在外面搭帳篷住。" },
      { line: "ㄗㄞˋ ㄧㄝˇ ㄨㄞˋ （　） ㄧㄠˋ ㄓㄨˋ ㄧˋ ㄑㄧˋ ㄏㄡˋ ㄅㄧㄢˋ ㄏㄨㄚˋ", say: "在野外做什麼要注意氣候變化？", options: ["ㄕㄢ ㄧㄞˊ", "ㄌㄨˋ ㄧㄥˊ"], answer: 1, tip: "在野外露營要注意氣候變化：露營要住在外面，下雨颳風都要小心。" },
      { line: "ㄉㄨ ㄕˋ ㄌㄧˇ ㄉㄠˋ ㄔㄨˋ ㄕˋ （　） ㄌㄡˊ ㄉㄚˋ ㄒㄧㄚˋ", say: "都市裡到處是什麼樓大廈？", options: ["ㄉㄠˋ", "ㄍㄠ"], answer: 1, tip: "都市裡到處是高樓大廈：很高的樓。ㄍㄠ是高，ㄉㄠˋ是到。" },
      { line: "ㄨ （　） （　） ㄓㄜ˙ ㄊㄨˋ ㄗ˙ ㄆㄠˇ", say: "烏什麼什麼著兔子跑？", options: ["ㄍㄨㄟ ㄓㄨㄟ", "ㄓㄨㄟ ㄍㄨㄟ"], answer: 0, tip: "烏龜追著兔子跑：先是烏龜的「ㄍㄨㄟ」，再是追的「ㄓㄨㄟ」。" },
      { line: "ㄨㄛˇ ㄇㄣ˙ ㄒㄧˇ ㄏㄨㄢ （　） ㄐㄧㄝ", say: "我們喜歡什麼街？", options: ["ㄏㄨㄤˋ", "ㄍㄨㄤˋ"], answer: 1, tip: "我們喜歡逛街：ㄍㄨㄤˋ ㄐㄧㄝ。ㄏㄨㄤˋ是搖晃的晃。" },
    ].map((x, k) => ({ kind: "choice", n: k + 1, hint: "選出適合的字或詞", ...x })) },
    { no: "四", name: "連連看", pts: 2, qs: [
      { line: "ㄈㄟ ㄐㄧ ㄏㄣˇ （　）", say: "飛機很什麼？", options: ["ㄎㄜˇ ㄞˋ", "ㄕㄤˋ ㄒㄩㄝˊ", "ㄉㄚˋ"], answer: 2, tip: "飛機很大。" },
      { line: "ㄊㄨˋ ㄗ˙ ㄏㄣˇ （　）", say: "兔子很什麼？", options: ["ㄎㄜˇ ㄞˋ", "ㄕㄤˋ ㄒㄩㄝˊ", "ㄉㄚˋ"], answer: 0, tip: "兔子很可愛。" },
      { line: "ㄨㄛˇ ㄒㄧˇ ㄏㄨㄢ （　）", say: "我喜歡什麼？", options: ["ㄎㄜˇ ㄞˋ", "ㄕㄤˋ ㄒㄩㄝˊ", "ㄉㄚˋ"], answer: 1, tip: "我喜歡上學。" },
      { line: "ㄅㄧㄢˋ （　）", say: "變什麼？", options: ["ㄉㄚˋ ㄍㄨˇ", "ㄉㄚˋ ㄑㄧㄡˊ", "ㄇㄛˊ ㄕㄨˋ"], answer: 2, tip: "變魔術。" },
      { line: "ㄑㄧㄠ （　）", say: "敲什麼？", options: ["ㄉㄚˋ ㄍㄨˇ", "ㄉㄚˋ ㄑㄧㄡˊ", "ㄇㄛˊ ㄕㄨˋ"], answer: 0, tip: "敲大鼓：咚咚咚。" },
      { line: "ㄍㄨㄣˇ （　）", say: "滾什麼？", options: ["ㄉㄚˋ ㄍㄨˇ", "ㄉㄚˋ ㄑㄧㄡˊ", "ㄇㄛˊ ㄕㄨˋ"], answer: 1, tip: "滾大球：球圓圓的會滾。" },
    ].map((x, k) => ({ kind: "choice", n: k + 1, hint: "連連看：上面接哪一個？", ...x })) },
    { no: "五", name: "看圖填字", pts: 3, qs: [
      ["🐠", "金魚", "ㄐㄧㄣ ㄩˊ"], ["⛄", "雪人", "ㄒㄩㄝˇ ㄖㄣˊ"], ["🦚", "孔雀", "ㄎㄨㄥˇ ㄑㄩㄝˋ"], ["🦌", "馴鹿", "ㄒㄩㄣˊ", "ㄌㄨˋ"], ["🛞", "車輪", "ㄔㄜ ㄌㄨㄣˊ"],
    ].map(([emoji, zh, bopo, after], k) => ({ kind: "spell", n: k + 1, zh, bopo, emoji, after, prompt: after ? `ㄓㄜˋ ㄕˋ （　） ${after}` : `ㄓㄜˋ ㄕˋ ${bopo.split(" ").map(() => "（　）").join(" ")}` })) },
    { no: "六", name: "選擇題", pts: 3, qs: [
      { line: "ㄅㄚˇ ㄉㄨㄟˋ ㄉㄜ˙ □ ㄑㄧˇ ㄌㄞˊ", say: "把對的什麼起來？", options: ["ㄐㄧㄢ", "ㄑㄧㄢ", "ㄑㄩㄢ", "ㄒㄩㄢ"], answer: 2, tip: "把對的圈起來：ㄑㄩㄢ。ㄑ和ㄐ、ㄒ不一樣，ㄩ要嘟嘴。" },
      { line: "ㄌㄠˇ ㄕ ㄗㄞˋ ㄏㄟ ㄅㄢˇ ㄕㄤˋ ㄏㄨㄚˋ ㄙㄢ ㄍㄜ˙ □ □", say: "老師在黑板上畫三個什麼？", options: ["ㄩㄢˊ ㄑㄩㄢ", "ㄨㄣˊ ㄐㄩㄢ", "ㄩㄢˊ ㄒㄩㄢ", "ㄨㄣˊ ㄑㄩㄢ"], answer: 0, tip: "老師畫三個圓圈：ㄩㄢˊ ㄑㄩㄢ。" },
      { line: "ㄨㄛˇ ㄉㄜ˙ □ ㄨㄤˋ ㄕˋ ㄧㄤˇ ㄧˋ ㄓ ㄍㄡˇ", say: "我的什麼望是養一隻狗？", options: ["ㄩㄢˊ", "ㄧㄢˋ", "ㄩㄢˋ", "ㄨㄢˋ"], answer: 2, tip: "願望：ㄩㄢˋ ㄨㄤˋ，第四聲。" },
      { line: "ㄨㄛˇ ㄏㄢˋ ㄆㄥˊ ㄧㄡˇ □ ㄕㄡˇ", say: "我和朋友什麼手？", options: ["ㄨㄚˋ", "ㄨㄥˋ", "ㄨㄢˋ", "ㄨㄛˋ"], answer: 3, tip: "握手：ㄨㄛˋ ㄕㄡˇ。" },
      { line: "ㄏㄜˊ ㄌㄧˊ ㄇㄤˊ ㄓㄜ˙ □ □", say: "河狸忙著什麼？", options: ["ㄗㄨˇ ㄔㄜ", "ㄓㄨˊ ㄔㄠˊ", "ㄓㄠˋ ㄌㄨˋ", "ㄇㄧˋ ㄗㄠˇ"], answer: 1, tip: "河狸忙著築巢：ㄓㄨˊ ㄔㄠˊ，蓋自己的家。" },
      { line: "ㄒㄧㄚˋ ㄇㄧㄢˋ ㄋㄚˇ ㄧˊ ㄍㄜ˙ ㄕˋ ㄑㄧㄥ ㄨㄚ ㄔㄤˋ ㄍㄜ ㄉㄜ˙ ㄕㄥ ㄧㄣ ？", say: "下面哪一個是青蛙唱歌的聲音？", options: ["ㄍㄨㄤ ㄍㄨㄤ ㄍㄨㄤ", "ㄏㄨㄤ ㄏㄨㄤ ㄏㄨㄤ", "ㄍㄨㄛ ㄍㄨㄛ ㄍㄨㄛ", "ㄎㄨㄤ ㄎㄨㄤ ㄎㄨㄤ"], answer: 2, tip: "青蛙唱歌：ㄍㄨㄛ ㄍㄨㄛ ㄍㄨㄛ（嘓嘓嘓）。" },
    ].map((x, k) => ({ kind: "choice", n: [1, 2, 3, 4, 5, 7][k], hint: "選出對的答案", ...x })) },
  ],
};
const MID_PAPERS = { g1zh: MID_G1_ZH };

// 注音一句話（原卷只有注音）：空白分開；（　）、□ 畫成空格
const mpSylRe = /^[ㄅ-ㄩ]+[ˊˇˋ˙]?$/;
function mpBopoLine(line) {
  return el("div", { class: "mp-line" }, line.split(/\s+/).filter(Boolean).map(tok =>
    tok === "（　）" ? el("span", { class: "mp-blank" }, "（　）") : tok === "□" ? el("span", { class: "mp-box" }) : mpSylRe.test(tok) ? bopoColEl(tok) : el("span", { class: "mp-punct" }, tok)));
}
const mpNorm = bopo => bopo.trim().split(/\s+/).map(s => { const tn = (s.match(/[ˊˇˋ˙]/) || [""])[0]; return s.replace(/[ˊˇˋ˙]/g, "") + tn; }).join(" ");

// 點注音拼出來（考試用，不會說對錯）：一個字一個字，選符號再選聲調；拼完回傳整個詞的注音
function mpSpell(bopo, onAnswer) {
  const syls = bopo.split(" ").map(splitSyl);
  const done = [];
  const wrap = el("div", { class: "mp-spell" });
  const doneRow = el("div", { class: "bopo-word bopo-word--xl mp-spell__done" });
  const stage = el("div", {});
  const redo = el("button", { class: "btn btn--ghost", onclick: () => { done.length = 0; doneRow.replaceChildren(); onAnswer(null); next(); } }, t("🧹 重拼"));
  const next = () => {
    if (done.length >= syls.length) { stage.replaceChildren(el("div", { class: "mp-spell__ok" }, t("拼好了，可以按下一題；要改就按重拼"))); onAnswer(done.join(" ")); return; }
    const target = syls[done.length];
    const pool = new Set(target.symbols);
    target.symbols.forEach(c => confusableOf(c).forEach(x => pool.size < target.symbols.length + 3 && pool.add(x)));
    while (pool.size < target.symbols.length + 3) pool.add(ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]);
    const tiles = shuffle([...pool]);
    const filled = [];
    let tone = null;
    const slots = el("div", { class: "zh-slots" }), tileRow = el("div", { class: "spell-tiles" }), toneRow = el("div", { class: "zh-tones zh-tones--sm" });
    const draw = () => {
      slots.replaceChildren(...target.symbols.map((_, j) => el("button", { class: `spell-slot ${filled[j] ? "spell-slot--filled" : ""}`, onclick: () => { if (filled[j]) { filled.splice(j); draw(); } } }, filled[j] || "")),
        el("span", { class: `zh-tone-slot ${tone !== null ? "spell-slot--filled" : ""}` }, tone === null ? "？" : (tone || "ˉ")));
      tileRow.replaceChildren(...tiles.map(c => el("button", { class: "spell-tile", onclick: () => { if (filled.length < target.symbols.length) { filled.push(c); draw(); check(); } } }, c)));
      toneRow.replaceChildren(...TONES.map(([tn, name]) => el("button", { class: `zh-tone-btn ${tone === tn ? "zh-tone-btn--on" : ""}`, onclick: () => { tone = tn; draw(); check(); } }, el("span", { class: "zh-tone-btn__mark" }, tn || "ˉ"), t(name))));
    };
    const check = () => {
      if (filled.length < target.symbols.length || tone === null) return;
      const syl = filled.join("") + tone;
      done.push(syl); doneRow.appendChild(bopoColEl(syl)); next();
    };
    stage.replaceChildren(el("div", { class: "m-hint" }, t(`第${done.length + 1}個字：選注音，再選聲調`)), slots, tileRow, toneRow);
    draw();
  };
  wrap.append(doneRow, stage, redo);
  next();
  return wrap;
}

// 把卷子轉成 renderChoiceExam 的題目
function mpQuestions(P) {
  return P.sections.map(sec => ({ no: sec.no, name: sec.name, pts: sec.pts, qs: sec.qs.map(q => {
    if (q.kind === "spell") {
      const review = el("div", {}, q.emoji ? el("span", { class: "mp-emoji" }, q.emoji) : null, mpBopoLine(q.prompt));
      return { prompt: el("div", { class: "mp-q" }, el("div", { class: "mp-q__no" }, t(`${sec.no}・${q.n}`)), q.emoji ? el("div", { class: "mp-emoji" }, q.emoji) : null,
          mpBopoLine(q.emoji ? q.prompt : "（　） （　）"), el("div", { class: "m-hint" }, t(q.emoji ? "看圖，把注音拼出來" : "按🔊聽，把聽到的詞拼出來"))),
        say: () => speakZh(q.emoji ? `這是${q.zh}` : q.zh), review, tip: `答案是「${q.bopo}」。一個字一個字慢慢念，先聽第一個聲音，再聽聲調。`,
        mount: pick => mpSpell(q.bopo, ans => pick(ans == null ? null : { text: ans, ok: mpNorm(ans) === mpNorm(q.bopo) })),
        answerText: q.bopo, rec: ok => recordZh(`期中卷:${q.zh}`, ok) };
    }
    return { prompt: el("div", { class: "mp-q" }, el("div", { class: "mp-q__no" }, t(`${sec.no}・${q.n}`)), mpBopoLine(q.line), el("div", { class: "m-hint" }, t(q.hint))),
      say: () => speakZh(q.say), review: mpBopoLine(q.line), tip: q.tip,
      options: (q.shuffle ? shuffle : x => x)(q.options.map((o, k) => ({ label: bopoWordEl(o, { class: "bopo-word--lg" }), text: o, ok: k === q.answer }))), rec: ok => recordZh(`期中卷:${q.say}`, ok) };
  }) }));
}

function renderMidPaper(id, mode) {
  const P = MID_PAPERS[id];
  if (!P) return renderEmpty("#/midterm", "找不到這份考卷");
  const exam = mode === "exam";
  return renderChoiceExam({ title: exam ? `📝 ${P.title}・模擬考` : `📄 ${P.title}・練習`, back: "#/midterm", key: `mid:${id}`,
    practice: !exam, practiceHash: `#/midpaper/${id}`, retryHash: `#/midpaper/${id}${exam ? "?mode=exam" : ""}`, sections: mpQuestions(P) });
}
