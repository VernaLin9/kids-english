// 📄 期中考複習卷：11/1 課後照顧「考前到校複習日」老師發的考卷＋解答（家長放在 Drive「期中考複習-一上／二上」）
// 題目、注音、順序照原卷；答案照老師的解答（紅字）。原卷沒寫配分 → 照題數給，共 100 分。
// 作答：聽寫、看圖填字用「點注音拼出來」（mpSpell，跟拼注音一樣：選符號＋聲調，一個字一個字拼）；其他是選擇題。
// 練習版：選完按「下一題」馬上對答案，錯了看答案和怎麼記；模擬考版：寫完才看分數（renderChoiceExam）。

// 一年級：課照國語期中複習卷（注音符號總評量練習卷），題目卷 PDF＋第一、二頁解答照片
// 第六大題第 6 題（青蛙在狂歡會時表演什麼節目）：解答照片沒寫，弟弟批改過的考卷（11/2 家長上傳）老師寫 ③ 大合唱
// school：弟弟 11/1 在學校寫錯的題目 id（照批改過的考卷：聽寫 6、造詞 2、填入 4、看圖填字 3）→ #/midpaper/g1zh?mode=school
const MID_G1_ZH = {
  id: "g1zh", grade: "g1", title: "注音符號總評量練習卷", sub: "課照 國語期中複習卷（11/1 複習日）", percent: true, vertical: true, // vertical：題目照紙本直排
  school: { label: "11/1學校考卷寫錯的", ids: ["一-0", "一-2", "一-4", "一-5", "一-8", "一-9", "二-1", "二-2", "三-0", "三-1", "三-3", "三-4", "五-1", "五-2", "五-3"] },
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
    ].map((x, k) => ({ kind: "choice", paper: "fill", n: k + 1, hint: "選出適合的字或詞", ...x })) },
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
      { line: "ㄑㄧㄥ ㄨㄚ ㄗㄞˋ ㄎㄨㄤˊ ㄏㄨㄢ ㄏㄨㄟˋ ㄕˊ ㄅㄧㄠˇ ㄧㄢˇ ㄕㄣˊ ˙ㄇㄜ ㄐㄧㄝˊ ㄇㄨˋ ？", say: "青蛙在狂歡會時表演什麼節目？", options: ["ㄅㄧㄢˋ ㄇㄛˊ ㄕㄨˋ", "ㄍㄨㄣˇ ㄉㄚˋ ㄑㄧㄡˊ", "ㄉㄚˋ ㄏㄜˊ ㄔㄤˋ", "ㄑㄧㄠ ㄉㄚˋ ㄍㄨˇ"], answer: 2, tip: "青蛙在狂歡會表演大合唱：ㄉㄚˋ ㄏㄜˊ ㄔㄤˋ，大家一起唱歌。" },
      { line: "ㄒㄧㄚˋ ㄇㄧㄢˋ ㄋㄚˇ ㄧˊ ㄍㄜ˙ ㄕˋ ㄑㄧㄥ ㄨㄚ ㄔㄤˋ ㄍㄜ ㄉㄜ˙ ㄕㄥ ㄧㄣ ？", say: "下面哪一個是青蛙唱歌的聲音？", options: ["ㄍㄨㄤ ㄍㄨㄤ ㄍㄨㄤ", "ㄏㄨㄤ ㄏㄨㄤ ㄏㄨㄤ", "ㄍㄨㄛ ㄍㄨㄛ ㄍㄨㄛ", "ㄎㄨㄤ ㄎㄨㄤ ㄎㄨㄤ"], answer: 2, tip: "青蛙唱歌：ㄍㄨㄛ ㄍㄨㄛ ㄍㄨㄛ（嘓嘓嘓）。" },
    ].map((x, k) => ({ kind: "choice", paper: "num", n: k + 1, hint: "選出對的答案", ...x })) },
  ],
};
// === 11/10 注音符號總結性評量：老師 11/7 發回的兩張國卷（弟弟寫的 85 分、91 分），老師說題型差不多 ===
// 題目照考卷抄；照片看不清楚的句子、詞換成首冊程度、同一種考法的（家長要確認）
// 寫聲調：syls 一句話的注音，boxes 要寫聲調的字（第幾個）→ 一個格子一題，其他格子先填好
const MP_TONE_OPTS = ["一聲", "ˊ 二聲", "ˇ 三聲", "ˋ 四聲", "˙ 輕聲"], MP_TONES = ["", "ˊ", "ˇ", "ˋ", "˙"], MP_TONE_NAMES = ["一聲", "二聲", "三聲", "四聲", "輕聲"];
function mpToneQs(list) {
  const qs = [];
  list.forEach(({ syls, boxes, zh }) => {
    const arr = syls.split(/\s+/);
    boxes.forEach(bi => {
      const syl = arr[bi], tn = (syl.match(/[ˊˇˋ˙]/) || [""])[0], base = syl.replace(/[ˊˇˋ˙]/g, "");
      const line = arr.map((x, i) => i === bi ? `${base}□` : x).join(" ");
      // 念題目只念說明，不念句子（念出來就聽到聲調了）
      qs.push({ kind: "choice", plain: true, line, say: "方框裡要寫哪一個聲調？", recKey: `${zh}${base}`, hint: "□ 裡要寫哪一個聲調？",
        options: MP_TONE_OPTS, answer: MP_TONES.indexOf(tn),
        tip: `「${zh}」，□ 這個字念「${syl}」，是${MP_TONE_NAMES[MP_TONES.indexOf(tn)]}。整句小聲念出來，聽聽看這個字的聲音是平平的、往上、先下再上、往下，還是輕輕短短的。` });
    });
  });
  return qs.map((q, k) => ({ ...q, n: k + 1 }));
}
// 看圖找出正確的語詞：[圖, 國字, 對的注音, 錯的注音, 怎麼分]
const mpPicQs = list => list.map(([emoji, zh, ok, bad, how], k) => ({ kind: "choice", n: k + 1, shuffle: true, emoji, say: `這是${zh}`, hint: "看圖，哪一個注音才對？只能選一個",
  options: [ok, bad], answer: 0, tip: `${zh}：${ok}。${how}只能打一個✓，兩個都打就沒有分數。` }));
// 讀一讀：對的打✓（或畫○），錯的打✗
const mpTFQs = (list, mark) => list.map(([line, zh, ok, why], k) => ({ kind: "choice", n: k + 1, plain: true, line, say: zh, hint: `對的${mark === "○" ? "畫○" : "打✓"}，錯的打✗`,
  options: [mark, "✗"], answer: ok ? 0 : 1, tip: `${ok ? `這句話是對的，要${mark === "○" ? "畫○" : "打✓"}` : "這句話是錯的，要打✗"}。${why}` }));
// 找出適當的語詞，把號碼填在 ( ) 裡
const mpBankQs = (bank, list) => list.map(([line, zh, ans], k) => ({ kind: "choice", n: k + 1, nums: true, bank, line, say: zh, hint: "上面框框裡哪一個詞放進 ( ) 最對？",
  options: bank, answer: ans - 1, tip: `答案是${ans}「${bank[ans - 1]}」。把詞放進句子整句念一次，念起來通順的就對。( ) 裡寫號碼${ans}，不是寫注音喔。` }));
// 連連看：上面一個字，連到下面的詞
const mpLinkQs = (tops, bottoms, hint) => tops.map(([top, ans, zh], k) => ({ kind: "choice", n: k + 1, line: `${top} → （　）`, say: zh, hint, options: bottoms, answer: ans, tip: `「${top}」連「${bottoms[ans]}」：${zh}。` }));

const MID_G1_ZH10A = {
  id: "g1zh10a", grade: "g1", title: "注音總結評量練習卷（一）", sub: "老師11/7發回的國卷・85分那張", percent: true, vertical: true,
  formatSecs: ["二", "三"], formatIntro: () => mpZh10Intro(),
  school: { label: "11/7發回考卷寫錯的", ids: ["一-5", "三-7", "三-8", "四-1", "五-0", "五-2", "七-0"] },
  sections: [
    { no: "一", name: "完成聽寫", pts: 2, qs: [
      ["螞蟻", "ㄇㄚˇ ㄧˇ"], ["寶寶", "ㄅㄠˇ ㄅㄠ˙"], ["巫婆", "ㄨ ㄆㄛˊ"], ["樹下", "ㄕㄨˋ ㄒㄧㄚˋ"], ["大家", "ㄉㄚˋ ㄐㄧㄚ"],
      ["逃跑", "ㄊㄠˊ ㄆㄠˇ"], ["魔法", "ㄇㄛˊ ㄈㄚˇ"], ["帽子", "ㄇㄠˋ ㄗ˙"], ["魚缸", "ㄩˊ ㄍㄤ"], ["老師", "ㄌㄠˇ ㄕ"],
    ].map(([zh, bopo], k) => ({ kind: "spell", n: k + 1, zh, bopo, prompt: "聽一聽，把注音拼出來" })) },
    { no: "二", name: "讀一讀，對的打✓，錯的打✗", pts: 2, qs: mpTFQs([
      ["ㄎㄢˋ ㄉㄠˋ ㄅㄧㄝˊ ㄖㄣˊ ㄉㄜ˙ ㄘㄞˇ ㄙㄜˋ ㄅㄧˇ ㄏㄣˇ ㄆㄧㄠˋ ㄌㄧㄤ˙ ， ㄎㄜˇ ㄧˇ ㄊㄡ ㄊㄡ ㄋㄚˊ ㄌㄞˊ ㄩㄥˋ 。", "看到別人的彩色筆很漂亮，可以偷偷拿來用。", false, "別人的東西要先問過，不能偷偷拿。"],
      ["ㄨㄛˇ ㄇㄣ˙ ㄧㄠˋ ㄓㄨㄢ ㄒㄧㄣ ㄕㄤˋ ㄎㄜˋ ， ㄒㄧㄤˇ ㄏㄨㄟˊ ㄉㄚˊ ㄨㄣˋ ㄊㄧˊ ㄕˊ ， ㄧㄠˋ ㄐㄩˇ ㄕㄡˇ 。", "我們要專心上課，想回答問題時，要舉手。", true, "上課想說話要先舉手。"],
      ["ㄔㄨㄢ ㄓˋ ㄈㄨˊ ㄨㄞˋ ㄊㄠˋ ㄕˊ ， ㄧㄠˋ ㄅㄚˇ ㄎㄡˋ ㄗ˙ ㄎㄡˋ ㄏㄠˇ 。", "穿制服外套時，要把扣子扣好。", true, "扣子扣好才整齊。"],
      ["ㄆㄞˊ ㄉㄨㄟˋ ㄕˊ ， ㄏㄢˋ ㄊㄨㄥˊ ㄒㄩㄝˊ ㄧˋ ㄅㄧㄢ ㄗㄡˇ ㄌㄨˋ ㄧˋ ㄅㄧㄢ ㄉㄚˇ ㄋㄠˋ ， ㄘㄞˊ ㄏㄠˇ ㄨㄢˊ 。", "排隊時，和同學一邊走路一邊打鬧，才好玩。", false, "排隊要安靜，打鬧會跌倒。"],
      ["ㄕㄤˋ ㄎㄜˋ ㄕˊ ， ㄧㄠˋ ㄗㄨㄛˋ ㄏㄠˇ ， ㄅㄨˋ ㄆㄚ ㄓㄜ˙ ， ㄧㄝˇ ㄅㄨˊ ㄑㄧㄠˋ ㄐㄧㄠˇ 。", "上課時，要坐好，不趴著，也不翹腳。", true, "上課要坐好。"],
      ["ㄨˇ ㄒㄧㄡ ㄕˊ ㄐㄧㄢ ， ㄧㄠˋ ㄅㄧˋ ㄕㄤˋ ㄧㄢˇ ㄐㄧㄥ ， ㄢ ㄐㄧㄥˋ ㄉㄜ˙ ㄆㄚ ㄓㄜ˙ ㄒㄧㄡ ㄒㄧ˙ 。", "午休時間，要閉上眼睛，安靜的趴著休息。", true, "午休要安靜休息。"],
    ], "✓") },
    { no: "三", name: "看圖找出正確的語詞", pts: 2, qs: mpPicQs([
      ["🐸", "青蛙", "ㄑㄧㄥ ㄨㄚ", "ㄑㄧㄣ ㄨㄚ", "青是ㄥ，嘴巴張開、聲音從鼻子後面出來。"],
      ["🦇", "蝙蝠", "ㄅㄧㄢ ㄈㄨˊ", "ㄅㄧㄢ ㄏㄨˊ", "蝠是ㄈ，上面牙齒碰下嘴唇。"],
      ["🧅", "洋蔥", "ㄧㄤˊ ㄘㄨㄥ", "ㄧㄤˊ ㄔㄨㄥ", "蔥是ㄘ，舌頭不翹起來。"],
      ["🍒", "櫻桃", "ㄧㄥ ㄊㄠˊ", "ㄧㄣ ㄊㄠˊ", "櫻是ㄥ。"],
      ["🍙", "飯糰", "ㄈㄢˋ ㄊㄨㄢˊ", "ㄏㄨㄢˋ ㄊㄨㄢˊ", "飯是ㄈ，上面牙齒碰下嘴唇。"],
      ["👀", "眼睛", "ㄧㄢˇ ㄐㄧㄥ", "ㄧㄢˇ ㄐㄧㄣ", "睛是ㄥ。"],
      ["🐝", "蜜蜂", "ㄇㄧˋ ㄈㄥ", "ㄇㄧˋ ㄈㄣ", "蜂是ㄥ。"],
      ["🐠", "金魚", "ㄐㄧㄣ ㄩˊ", "ㄐㄧㄥ ㄩˊ", "金是ㄣ，嘴巴快閉起來、舌頭往前。"],
      ["🚗", "汽車", "ㄑㄧˋ ㄔㄜ", "ㄑㄧˋ ㄘㄜ", "車是ㄔ，舌頭要翹起來。"],
      ["🧀", "乳酪", "ㄖㄨˇ ㄌㄨㄛˋ", "ㄌㄨˇ ㄌㄨㄛˋ", "乳是ㄖ，舌頭翹起來；酪才是ㄌ。"],
    ]) },
    { no: "四", name: "找出適當的語詞，把號碼填在 ( ) 裡", pts: 2, qs: mpBankQs(["ㄒㄧˇ ㄕㄡˇ", "ㄔˊ ㄉㄠˋ", "ㄉㄚˇ ㄙㄠˇ", "ㄧㄝˇ ㄘㄢ", "ㄓㄨㄢ ㄒㄧㄣ", "ㄌㄧˇ ㄇㄠˋ"], [
      ["ㄨㄛˇ ㄏㄨㄟˋ ㄓㄨㄣˇ ㄕˊ ㄕㄤˋ ㄒㄩㄝˊ ， ㄅㄨˊ ㄏㄨㄟˋ （　） 。", "我會準時上學，不會什麼？", 2],
      ["ㄨㄛˇ ㄏㄨㄟˋ ㄅㄤ ㄇㄤˊ （　） ， ㄅㄠˇ ㄔˊ ㄏㄨㄢˊ ㄐㄧㄥˋ ㄓㄥˇ ㄐㄧㄝˊ 。", "我會幫忙什麼，保持環境整潔？", 3],
      ["ㄕㄤˋ ㄨㄢˊ ㄘㄜˋ ㄙㄨㄛˇ ㄧㄠˋ ㄐㄧˋ ㄉㄜ˙ （　） 。", "上完廁所要記得什麼？", 1],
      ["ㄕㄤˋ ㄎㄜˋ ㄧㄠˋ （　） ㄊㄧㄥ ㄌㄠˇ ㄕ ㄕㄨㄛ ㄏㄨㄚˋ 。", "上課要怎樣聽老師說話？", 5],
      ["ㄐㄧㄢˋ ㄉㄠˋ ㄖㄣˊ ㄧㄠˋ ㄉㄚˇ ㄓㄠ ㄏㄨ˙ ， ㄗㄨㄛˋ ㄍㄜ˙ ㄧㄡˇ （　） ㄉㄜ˙ ㄏㄠˇ ㄏㄞˊ ㄗ˙ 。", "見到人要打招呼，做個有什麼的好孩子？", 6],
      ["ㄒㄧㄥ ㄑㄧˊ ㄊㄧㄢ ㄨㄛˇ ㄇㄣ˙ ㄑㄩㄢˊ ㄐㄧㄚ ㄑㄩˋ ㄍㄨㄥ ㄩㄢˊ （　） 。", "星期天我們全家去公園做什麼？", 4],
    ]) },
    { no: "五", name: "在□中寫出正確的聲調", pts: 1, qs: mpToneQs([
      { zh: "課本放在抽屜裡。", syls: "ㄎㄜˋ ㄅㄣˇ ㄈㄤˋ ㄗㄞˋ ㄔㄡ ㄊㄧ˙ ㄌㄧˇ 。", boxes: [0, 1, 5] },
      { zh: "袋鼠喜歡在草地上跑步。", syls: "ㄉㄞˋ ㄕㄨˇ ㄒㄧˇ ㄏㄨㄢ ㄗㄞˋ ㄘㄠˇ ㄉㄧˋ ㄕㄤˋ ㄆㄠˇ ㄅㄨˋ 。", boxes: [0, 1, 4] },
      { zh: "我喜歡在公園裡搖呼啦圈。", syls: "ㄨㄛˇ ㄒㄧˇ ㄏㄨㄢ ㄗㄞˋ ㄍㄨㄥ ㄩㄢˊ ㄌㄧˇ ㄧㄠˊ ㄏㄨ ㄌㄚ ㄑㄩㄢ 。", boxes: [0, 1, 5, 7] },
      { zh: "寫完考卷要記得檢查。", syls: "ㄒㄧㄝˇ ㄨㄢˊ ㄎㄠˇ ㄐㄩㄢˋ ㄧㄠˋ ㄐㄧˋ ㄉㄜ˙ ㄐㄧㄢˇ ㄔㄚˊ 。", boxes: [0, 2, 5, 8] },
    ]) },
    { no: "六", name: "連連看", pts: 2, qs: mpLinkQs([["ㄒㄧㄝˇ", 0, "寫功課"], ["ㄔㄤˋ", 1, "唱國歌"], ["ㄊㄢˊ", 2, "彈鋼琴"], ["ㄉㄚˇ", 3, "打籃球"], ["ㄏㄜ", 4, "喝奶茶"], ["ㄔ", 5, "吃午餐"]],
      ["ㄍㄨㄥ ㄎㄜˋ", "ㄍㄨㄛˊ ㄍㄜ", "ㄍㄤ ㄑㄧㄣˊ", "ㄌㄢˊ ㄑㄧㄡˊ", "ㄋㄞˇ ㄔㄚˊ", "ㄨˇ ㄘㄢ"], "上面這個字，連到下面哪一個？") },
    { no: "七", name: "閱讀測驗", pts: 3, qs: (() => {
      const passage = "ㄍㄨㄥ ㄩㄢˊ ㄌㄧˇ ㄧㄡˇ ㄏㄣˇ ㄉㄨㄛ ㄧㄡˊ ㄒㄧˋ ㄑㄧˋ ㄘㄞˊ ， ㄧㄡˇ ㄌㄧㄡ ㄏㄨㄚˊ ㄊㄧ 、 ㄉㄤˋ ㄑㄧㄡ ㄑㄧㄢ 、 ㄑㄧㄠˋ ㄑㄧㄠˋ ㄅㄢˇ ㄏㄢˋ ㄧㄠˊ ㄧㄠˊ ㄇㄚˇ 。 ㄧㄡˇ ㄏㄣˇ ㄉㄨㄛ ㄒㄧㄠˇ ㄆㄥˊ ㄧㄡˇ ㄏㄢˋ ㄐㄧㄚ ㄖㄣˊ ㄧˋ ㄑㄧˇ ㄉㄠˋ ㄍㄨㄥ ㄩㄢˊ ㄨㄢˊ 。";
      return [
        { line: "ㄍㄨㄥ ㄩㄢˊ ㄌㄧˇ ㄧㄡˇ ㄐㄧˇ ㄧㄤˋ ㄧㄡˊ ㄒㄧˋ ㄑㄧˋ ㄘㄞˊ ？", say: "公園裡有幾樣遊戲器材？", options: ["ㄌㄧㄤˇ ㄧㄤˋ", "ㄙㄢ ㄧㄤˋ", "ㄙˋ ㄧㄤˋ"], answer: 2,
          tip: "用手指一個一個數：溜滑梯、盪鞦韆、翹翹板、搖搖馬，一共四樣。數完再選。" },
        { line: "ㄨㄣˊ ㄓㄤ ㄌㄧˇ ㄇㄟˊ ㄧㄡˇ ㄕㄨㄛ ㄉㄠˋ ㄋㄚˇ ㄧˊ ㄍㄜ˙ ？", say: "文章裡沒有說到哪一個？", options: ["ㄌㄧㄡ ㄏㄨㄚˊ ㄊㄧ", "ㄉㄤˋ ㄑㄧㄡ ㄑㄧㄢ", "ㄏㄨㄚˊ ㄅㄢˇ ㄔㄜ"], answer: 2,
          tip: "回去文章裡找：溜滑梯有、盪鞦韆有，滑板車沒有。" },
        { line: "ㄒㄧㄠˇ ㄆㄥˊ ㄧㄡˇ ㄏㄢˋ ㄕㄟˊ ㄧˋ ㄑㄧˇ ㄉㄠˋ ㄍㄨㄥ ㄩㄢˊ ㄨㄢˊ ？", say: "小朋友和誰一起到公園玩？", options: ["ㄌㄠˇ ㄕ", "ㄐㄧㄚ ㄖㄣˊ", "ㄊㄨㄥˊ ㄒㄩㄝˊ"], answer: 1,
          tip: "文章最後一句：小朋友和家人一起到公園玩。" },
      ].map((x, k) => ({ kind: "choice", n: k + 1, nums: "circle", passage, passageTitle: "公園", hint: "先讀完文章，再選答案", ...x }));
    })() },
  ],
};

const MID_G1_ZH10B = {
  id: "g1zh10b", grade: "g1", title: "注音總結評量練習卷（二）", sub: "老師11/7發回的國卷・91分那張", percent: true, vertical: true,
  formatSecs: ["二", "三"], formatIntro: () => mpZh10Intro(),
  school: { label: "11/7發回考卷寫錯的", ids: ["一-1", "一-2", "二-0", "二-3", "三-0", "三-1", "三-2"] },
  sections: [
    { no: "一", name: "完成聽寫", pts: 2, qs: [
      ["山洞", "ㄕㄢ ㄉㄨㄥˋ"], ["可愛", "ㄎㄜˇ ㄞˋ"], ["魔術", "ㄇㄛˊ ㄕㄨˋ"], ["寶貝", "ㄅㄠˇ ㄅㄟˋ"], ["慶祝", "ㄑㄧㄥˋ ㄓㄨˋ"],
      ["秋天", "ㄑㄧㄡ ㄊㄧㄢ"], ["泥巴", "ㄋㄧˊ ㄅㄚ"], ["卡車", "ㄎㄚˇ ㄔㄜ"], ["山羊", "ㄕㄢ ㄧㄤˊ"], ["月亮", "ㄩㄝˋ ㄌㄧㄤ˙"],
    ].map(([zh, bopo], k) => ({ kind: "spell", n: k + 1, zh, bopo, prompt: "聽一聽，把注音拼出來" })) },
    { no: "二", name: "讀一讀，對的畫○，錯的打✗", pts: 2, qs: mpTFQs([
      ["ㄨㄟˋ ㄌㄜ˙ ㄑㄩㄢˊ ㄅㄢ ㄉㄜ˙ ㄐㄧㄢˋ ㄎㄤ ， ㄕㄥ ㄅㄧㄥˋ ㄕˊ ㄧㄠˋ ㄗㄞˋ ㄐㄧㄚ ㄒㄧㄡ ㄒㄧ˙ ， ㄅㄨˊ ㄕㄤˋ ㄒㄩㄝˊ 。", "為了全班的健康，生病時要在家休息，不上學。", true, "生病在家休息，才不會傳染給同學。"],
      ["ㄒㄧㄚˋ ㄎㄜˋ ㄕˊ ㄎㄜˇ ㄧˇ ㄗㄞˋ ㄗㄡˇ ㄌㄤˊ ㄕㄤˋ ㄅㄣ ㄆㄠˇ ， ㄨㄢˊ ㄍㄨㄟˇ ㄓㄨㄚ ㄖㄣˊ 。", "下課時可以在走廊上奔跑，玩鬼抓人。", false, "走廊上不能跑，會撞到人。"],
      ["ㄕㄨㄚ ㄧㄚˊ ㄏㄣˇ ㄇㄚˊ ㄈㄢ˙ ， ㄙㄨㄛˇ ㄧˇ ㄨㄛˇ ㄅㄨˊ ㄧㄠˋ ㄕㄨㄚ ㄧㄚˊ 。", "刷牙很麻煩，所以我不要刷牙。", false, "每天都要刷牙，牙齒才不會壞掉。"],
      ["ㄗㄠˇ ㄕㄤ˙ ㄗㄡˇ ㄐㄧㄣˋ ㄐㄧㄠˋ ㄕˋ ， ㄧㄠˋ ㄒㄧㄢ ㄍㄣ ㄌㄠˇ ㄕ ㄕㄨㄛ ㄗㄠˇ ㄢ 。", "早上走進教室，要先跟老師說早安。", true, "見到老師要問好。"],
      ["ㄎㄞ ㄓㄡ ㄏㄨㄟˋ ㄕˊ ， ㄎㄜˇ ㄧˇ ㄏㄢˋ ㄆㄤˊ ㄅㄧㄢ ㄉㄜ˙ ㄊㄨㄥˊ ㄒㄩㄝˊ ㄌㄧㄠˊ ㄊㄧㄢ 。", "開週會時，可以和旁邊的同學聊天。", false, "開週會要安靜聽。"],
    ], "○") },
    { no: "三", name: "看圖找出正確的語詞", pts: 2, qs: mpPicQs([
      ["🪁", "風箏", "ㄈㄥ ㄓㄥ", "ㄈㄥ ㄓㄣ", "箏是ㄥ。"],
      ["🐧", "企鵝", "ㄑㄧˋ ㄜˊ", "ㄑㄧˋ ㄦˊ", "鵝是ㄜ，不是兒子的ㄦ。"],
      ["⏰", "時鐘", "ㄕˊ ㄓㄨㄥ", "ㄕˊ ㄓㄥ", "鐘是ㄓㄨㄥ，中間有ㄨ。"],
      ["🍬", "軟糖", "ㄖㄨㄢˇ ㄊㄤˊ", "ㄌㄨㄢˇ ㄊㄤˊ", "軟是ㄖ，舌頭翹起來。"],
      ["👨‍🌾", "農夫", "ㄋㄨㄥˊ ㄈㄨ", "ㄋㄨㄥˊ ㄏㄨ", "夫是ㄈ，上面牙齒碰下嘴唇。"],
      ["🐛", "蠶", "ㄘㄢˊ", "ㄔㄢˊ", "蠶寶寶的蠶是ㄘ，舌頭不翹。"],
      ["🕷️", "蜘蛛", "ㄓ ㄓㄨ", "ㄗ ㄓㄨ", "蜘是ㄓ，舌頭要翹起來。"],
      ["🪱", "蚯蚓", "ㄑㄧㄡ ㄧㄣˇ", "ㄑㄧㄡ ㄧㄥˇ", "蚓是ㄣ。"],
      ["🌸", "花朵", "ㄏㄨㄚ ㄉㄨㄛˇ", "ㄈㄚ ㄉㄨㄛˇ", "花是ㄏㄨㄚ，不是ㄈㄚ。"],
      ["✈️", "飛機", "ㄈㄟ ㄐㄧ", "ㄏㄨㄟ ㄐㄧ", "飛是ㄈㄟ，不是ㄏㄨㄟ。"],
    ]) },
    { no: "四", name: "找出適當的語詞，把號碼填在 ( ) 裡", pts: 2, qs: mpBankQs(["ㄌㄧˋ ㄗ˙", "ㄐㄧㄣ ㄩˊ", "ㄩˇ ㄙㄢˇ", "ㄆㄧˊ ㄑㄧㄡˊ", "ㄓㄨˇ ㄈㄢˋ", "ㄧㄢˇ ㄐㄧㄥ"], [
      ["ㄇㄟˋ ㄇㄟ˙ ㄗㄞˋ ㄍㄨㄥ ㄩㄢˊ ㄆㄞ （　） 。", "妹妹在公園拍什麼？", 4],
      ["ㄩˊ ㄍㄤ ㄌㄧˇ ㄧㄡˇ ㄧˋ ㄓ ㄒㄧㄠˇ （　） 。", "魚缸裡有一隻小什麼？", 2],
      ["ㄒㄧㄚˋ ㄩˇ ㄌㄜ˙ ， ㄐㄧˋ ㄉㄜ˙ ㄉㄞˋ （　） 。", "下雨了，記得帶什麼？", 3],
      ["ㄑㄧㄡ ㄊㄧㄢ ㄉㄠˋ ㄌㄜ˙ ， ㄍㄜ ㄍㄜ˙ ㄗㄞˋ ㄕㄨˋ ㄒㄧㄚˋ ㄐㄧㄢˇ （　） 。", "秋天到了，哥哥在樹下撿什麼？", 1],
      ["ㄇㄠ ㄇㄧ ㄉㄜ˙ （　） ㄩㄢˊ ㄩㄢˊ ㄌㄧㄤˋ ㄌㄧㄤˋ ㄉㄜ˙ 。", "貓咪的什麼圓圓亮亮的？", 6],
      ["ㄇㄚ ㄇㄚ˙ ㄗㄞˋ ㄔㄨˊ ㄈㄤˊ ㄌㄧˇ （　） 。", "媽媽在廚房裡做什麼？", 5],
    ]) },
    { no: "五", name: "讀一讀，加上聲調符號", pts: 1, qs: mpToneQs([
      { zh: "狐狸和大象一起去郊遊。", syls: "ㄏㄨˊ ㄌㄧ˙ ㄏㄢˋ ㄉㄚˋ ㄒㄧㄤˋ ㄧˋ ㄑㄧˇ ㄑㄩˋ ㄐㄧㄠ ㄧㄡˊ 。", boxes: [0, 3, 4, 6] },
      { zh: "姐姐和爸爸去海邊釣魚。", syls: "ㄐㄧㄝˇ ㄐㄧㄝ˙ ㄏㄢˋ ㄅㄚˋ ㄅㄚ˙ ㄑㄩˋ ㄏㄞˇ ㄅㄧㄢ ㄉㄧㄠˋ ㄩˊ 。", boxes: [0, 5, 6, 9] },
      { zh: "我每天回家寫功課。", syls: "ㄨㄛˇ ㄇㄟˇ ㄊㄧㄢ ㄏㄨㄟˊ ㄐㄧㄚ ㄒㄧㄝˇ ㄍㄨㄥ ㄎㄜˋ 。", boxes: [1, 3, 5, 7] },
    ]) },
    { no: "六", name: "念一念，連一連", pts: 2, qs: [
      ...mpLinkQs([["ㄐㄩㄢˇ ㄑㄧˇ", 0, "捲起袖子"], ["ㄖㄤˋ ㄔㄨ", 1, "讓出座位"], ["ㄉㄚˇ ㄎㄞ", 2, "打開窗戶"]], ["ㄒㄧㄡˋ ㄗ˙", "ㄗㄨㄛˋ ㄨㄟˋ", "ㄔㄨㄤ ㄏㄨ˙"], "連成短語：接哪一個？"),
      ...mpLinkQs([["ㄏㄨㄛˇ", 0, "火車"], ["ㄎㄜ", 1, "蝌蚪"], ["ㄆㄥˊ", 2, "朋友"], ["ㄕㄨ", 3, "書包"]], ["ㄔㄜ", "ㄉㄡˇ", "ㄧㄡ˙", "ㄅㄠ"], "連成詞語：接哪一個？"),
    ].map((q, k) => ({ ...q, n: k + 1 })) },
    { no: "七", name: "閱讀測驗", pts: 3, qs: (() => {
      const passage = "ㄒㄧㄠˇ ㄏㄨㄚ ㄇㄠ ㄆㄚˊ ㄕㄤˋ ㄓㄨㄛ ， ㄒㄧㄤˇ ㄔ ㄒㄧㄤ ㄆㄣ ㄆㄣ ㄉㄜ˙ ㄒㄧㄠˇ ㄩˊ 。 ㄒㄧㄠˇ ㄍㄡˇ ㄌㄞˊ ㄌㄜ˙ ， ㄒㄧㄠˇ ㄏㄨㄚ ㄇㄠ ㄉㄨㄥ ㄆㄠˇ ㄒㄧ ㄆㄠˇ ， ㄐㄧ ㄌㄧ ㄍㄨ ㄌㄨ ㄍㄨㄣˇ ㄒㄧㄚˋ ㄌㄞˊ 。";
      return [
        { line: "ㄒㄧㄠˇ ㄏㄨㄚ ㄇㄠ ㄒㄧㄤˇ ㄔ ㄕㄣˊ ㄇㄜ˙ ？", say: "小花貓想吃什麼？", options: ["ㄅㄧㄥˇ ㄍㄢ", "ㄒㄧㄠˇ ㄩˊ", "ㄐㄧ ㄖㄡˋ"], answer: 1, tip: "文章說：想吃香噴噴的小魚。" },
        { line: "ㄕㄟˊ ㄍㄨㄣˇ ㄒㄧㄚˋ ㄌㄞˊ ㄌㄜ˙ ？", say: "誰滾下來了？", options: ["ㄒㄧㄠˇ ㄩˊ", "ㄒㄧㄠˇ ㄍㄡˇ", "ㄒㄧㄠˇ ㄏㄨㄚ ㄇㄠ"], answer: 2, tip: "小狗來了，小花貓東跑西跑，滾下來的是小花貓。" },
      ].map((x, k) => ({ kind: "choice", n: k + 1, nums: "circle", passage, hint: "先讀完文章，再選答案", ...x }));
    })() },
  ],
};

// ✏️ 這兩張考卷怎麼寫（弟弟丟分的地方：看圖題兩個都打✓、「畫○」的題目打了✓）
function mpZh10Intro() {
  const step = (no, text) => el("div", { class: "mp-how__step" }, el("span", { class: "mp-how__no" }, no), el("span", {}, t(text)),
    el("button", { class: "l-say__btn", "aria-label": "念給我聽", onclick: () => speakZh(text) }, "🔊"));
  return el("div", { class: "mp-how" },
    el("div", { class: "section__title" }, t("☝️ 先看題目要你怎麼寫")),
    step("1", "題目寫「對的打✓」，對的就打✓。"),
    step("2", "題目寫「對的畫○」，對的就要畫○，打✓會沒有分數！"),
    step("3", "錯的都打✗。"),
    el("div", { class: "mp-how__ex" }, el("div", { class: "mp-how__marks", "data-nobopo": "1" }, el("span", {}, "✓"), el("span", {}, "○"), el("span", {}, "✗"))),
    el("div", { class: "section__title", style: "margin-top: 14px;" }, t("✌️ 看圖找出正確的語詞")),
    step("1", "兩個注音都念念看，只有一個是對的。"),
    step("2", "只能打一個✓。兩個都打✓，就沒有分數。"),
    step("3", "小心長得像的：ㄣㄥ、ㄔㄘ、ㄓㄗ、ㄈㄏ、ㄖㄌ。"),
    el("div", { class: "mp-how__check" }, t("✅ 寫完檢查：每一題都有寫，看圖題每一題只有一個✓。")));
}

const MID_PAPERS = { g1zh10a: MID_G1_ZH10A, g1zh10b: MID_G1_ZH10B, g1zh: MID_G1_ZH };

// 注音一句話（原卷只有注音）：空白分開；（　）、□ 畫成空格
const mpSylRe = /^[ㄅ-ㄩ]+[ˊˇˋ˙]?$/;
// vertical：照紙本考卷直排（由上往下、一行一行從右往左）
function mpBopoLine(line, vertical = false) {
  const VF = { "（": "︵", "）": "︶", "：": "︰" }; // 直排用直的括號、冒號
  return el("div", { class: `mp-line${vertical ? " mp-line--v" : ""}` }, line.split(/\s+/).filter(Boolean).map(tok =>
    tok === "（　）" ? (vertical ? el("span", { class: "mp-blank mp-blank--v" }, el("span", {}, "︵"), el("span", { class: "mp-blank__gap" }), el("span", {}, "︶")) : el("span", { class: "mp-blank" }, "（　）")) :
    vertical && VF[tok] ? el("span", { class: "mp-punct" }, VF[tok]) : tok === "□" ? el("span", { class: "mp-box" }) :
    /^[ㄅ-ㄩ]+□$/.test(tok) ? el("span", { class: "mp-tbox" }, bopoColEl(tok.slice(0, -1)), el("span", { class: "mp-box mp-box--q" }, "？")) : // 在□中寫聲調
    mpSylRe.test(tok) ? bopoColEl(tok) : el("span", { class: "mp-punct" }, tok)));
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
function mpQuestions(P, pen = false) {
  const V = !!P.vertical;
  return P.sections.map(sec => ({ no: sec.no, name: sec.name, pts: sec.pts, qs: sec.qs.map(q => {
    if (q.kind === "spell") {
      const review = el("div", {}, q.emoji ? el("span", { class: "mp-emoji" }, q.emoji) : null, mpBopoLine(q.prompt));
      return { prompt: el("div", { class: "mp-q" }, el("div", { class: "mp-q__no" }, t(`${sec.no}・${q.n}`)), q.emoji ? el("div", { class: "mp-emoji" }, q.emoji) : null,
          mpBopoLine(q.emoji ? q.prompt : V ? "□ □" : "（　） （　）", V), el("div", { class: "m-hint" }, t(q.emoji ? `看圖，把注音拼出來${pen ? "，再照著描一次" : ""}` : `按🔊聽，把聽到的詞拼出來${pen ? "，再照著描一次" : ""}`))),
        listen: !q.emoji, say: () => speakZh(q.emoji ? `這是${q.zh}` : q.zh), review, tip: `答案是「${q.bopo}」。一個字一個字慢慢念，先聽第一個聲音，再聽聲調。`,
        mount: pen ? pick => spellTrace(q.bopo, pick) : pick => mpSpell(q.bopo, ans => pick(ans == null ? null : { text: ans, ok: mpNorm(ans) === mpNorm(q.bopo) })), pen,
        answerText: q.bopo, rec: ok => recordZh(`期中卷:${q.zh}`, ok) };
    }
    // 照紙本考卷的寫法：選擇題點號碼放進 ( ) 裡；填入題從括號裡的詞選一個，再照著描一次注音（手寫辨識不準，家長要求改回用選的＋描寫不算分）
    if (pen && q.paper === "num") {
      const opts = el("div", { class: "mp-popts" }, q.options.map((o, i) => el("span", { class: "mp-popt" }, el("span", { class: "mp-popt__no" }, "①②③④"[i]), bopoWordEl(o, { class: "bopo-word--sm" }))));
      // 直排：選項跟在題目後面同一行往下（跟紙本一樣）
      const body = V ? mpBopoLine(`${q.line} ${q.options.map((o, i) => `${"①②③④"[i]} ${o}`).join(" ")}`, true) : el("div", {}, mpBopoLine(q.line), opts);
      return { prompt: el("div", { class: "mp-q" }, el("div", { class: "mp-q__no" }, t(`${sec.no}・${q.n}`)), body, el("div", { class: "m-hint" }, t("想一想哪一個對，點那個答案的號碼，放進下面的 (　) 裡"))),
        say: () => speakZh(q.say), review: el("div", {}, mpBopoLine(q.line), opts.cloneNode(true)), tip: `答案是${"①②③④"[q.answer]}。${q.tip}`, pen: true,
        mount: pick => parenPick(q.answer + 1, pick), answerText: "①②③④"[q.answer], rec: ok => recordZh(`期中卷:${q.say}`, ok) };
    }
    if (pen && q.paper === "fill") {
      const line = V ? mpBopoLine(`（ ${q.options.join(" ／ ")} ） ・ ${q.line}`, true) : el("div", {}, mpBopoLine(q.line), el("div", { class: "mp-pchoice" }, t("（"), q.options.map((o, i) => [i ? t(" ／ ") : null, bopoWordEl(o, { class: "bopo-word--sm" })]).flat().filter(Boolean), t("）")));
      return { prompt: el("div", { class: "mp-q" }, el("div", { class: "mp-q__no" }, t(`${sec.no}・${q.n}`)), line, el("div", { class: "m-hint" }, t("括號裡選一個對的，再照著描一次注音"))),
        say: () => speakZh(q.say), review: line.cloneNode(true), tip: q.tip, pen: true,
        mount: pick => pickTrace(q.options.map((o, k) => ({ label: bopoWordEl(o, { class: "bopo-word--lg" }), text: o, ok: k === q.answer, trace: o.split(" ") })), "bopo", pick), answerText: q.options[q.answer], rec: ok => recordZh(`期中卷:${q.say}`, ok) };
    }
    const NUMS = q.nums === "circle" ? "①②③④⑤⑥" : "123456";
    const optLabel = (o, k) => q.plain ? el("span", { class: "mp-mark", "data-nobopo": "1" }, o)
      : q.nums ? el("span", { class: "mp-numopt" }, el("b", { "data-nobopo": "1" }, NUMS[k]), bopoWordEl(o, { class: "bopo-word--lg" })) : bopoWordEl(o, { class: "bopo-word--lg" });
    const bank = q.bank ? el("div", { class: "mp-bank" }, q.bank.map((w, k) => el("span", { class: "mp-bank__w" }, el("b", { "data-nobopo": "1" }, NUMS[k]), bopoWordEl(w, { class: "bopo-word--sm" })))) : null;
    const passage = q.passage ? el("div", { class: "mp-passage" }, q.passageTitle ? el("div", { class: "mp-passage__title" }, t(q.passageTitle)) : null, mpBopoLine(q.passage, V)) : null;
    return { prompt: el("div", { class: "mp-q" }, el("div", { class: "mp-q__no" }, t(`${sec.no}・${q.n}`)), passage, bank, q.emoji ? el("div", { class: "mp-emoji" }, q.emoji) : null,
        q.line ? mpBopoLine(q.line, V) : null, el("div", { class: "m-hint" }, t(q.hint))),
      say: () => speakZh(q.say), review: el("div", {}, q.emoji ? el("span", { class: "mp-emoji" }, q.emoji) : null, q.line ? mpBopoLine(q.line) : null), tip: q.tip,
      answerText: q.nums ? `${NUMS[q.answer]} ${q.options[q.answer]}` : undefined,
      options: (q.shuffle ? shuffle : x => x)(q.options.map((o, k) => ({ label: optLabel(o, k), text: q.nums ? `${NUMS[k]} ${o}` : o, ok: k === q.answer }))), rec: ok => recordZh(`期中卷:${q.recKey || q.say}`, ok) };
  }) }));
}

// ✏️ 考卷題目怎麼寫（家長：弟弟不知道選擇題要把號碼寫進 ( )，在答案上畫圈、括號空白；填入題也空白）
function mpFormatIntro() {
  const step = (no, text) => el("div", { class: "mp-how__step" }, el("span", { class: "mp-how__no" }, no), el("span", {}, t(text)),
    el("button", { class: "l-say__btn", "aria-label": "念給我聽", onclick: () => speakZh(text) }, "🔊"));
  // 範例照紙本直排：( 3 ) 寫在題目最上面，選項跟在題目後面往下
  const ex1 = el("div", { class: "mp-how__ex" }, el("div", { class: "mp-how__vcol" },
    el("span", { class: "mp-how__paren" }, "(", el("b", {}, "3"), ")"),
    mpBopoLine("ㄅㄚˇ ㄉㄨㄟˋ ㄉㄜ˙ □ ㄑㄧˇ ㄌㄞˊ ： ① ㄐㄧㄢ ② ㄑㄧㄢ ③ ㄑㄩㄢ ④ ㄒㄩㄢ", true)),
    el("div", { class: "m-hint" }, t("答案是③，所以在最上面的括號裡寫3")));
  const ex2 = el("div", { class: "mp-how__ex" }, mpBopoLine("（ ㄉㄠˋ ／ ㄍㄠ ） ・ ㄉㄨ ㄕˋ ㄌㄧˇ ㄉㄠˋ ㄔㄨˋ ㄕˋ （　） ㄌㄡˊ ㄉㄚˋ ㄒㄧㄚˋ", true),
    el("div", { class: "mp-how__write" }, t("ㄍㄠ（高）念起來才對，空格裡寫："), bopoWordEl("ㄍㄠ", { class: "bopo-word--lg" })));
  return el("div", { class: "mp-how" },
    el("div", { class: "section__title" }, t("☝️ 選擇題怎麼寫")),
    step("1", "先把題目念一遍。"), step("2", "把①②③④四個答案都念一遍。"), step("3", "想一想，哪一個放進題目裡最對。"),
    step("4", "把那個答案前面的號碼，寫在題目前面的括號裡。不是在答案上畫圈喔！"), ex1,
    el("div", { class: "section__title", style: "margin-top: 14px;" }, t("✌️ 填入適合的字或詞")),
    step("1", "括號裡有兩個詞，兩個都放進句子念念看。"), step("2", "選念起來對的那一個，把它的注音寫在空格裡。"), ex2,
    el("div", { class: "mp-how__check" }, t("✅ 寫完檢查：每個括號、每個空格都有寫嗎？")));
}

// 📒 錯題本：profile.wrongBook["mid:<id>"]＝錯過的題目 id（大題-第幾題）；之後答對了就拿掉
const mpBookKey = id => `mid:${id}`;
const mpBook = (id, p = getProfile()) => p?.wrongBook?.[mpBookKey(id)] || [];
function mpBookSave(id, qs, picks) {
  const p = getProfile(); if (!p) return;
  const set = new Set(mpBook(id, p));
  qs.forEach((q, k) => { if (q.noScore || !q.id || !picks[k]) return; if (picks[k].ok) set.delete(q.id); else set.add(q.id); });
  p.wrongBook = p.wrongBook || {}; p.wrongBook[mpBookKey(id)] = [...set]; saveStore();
}
function renderMidPaper(id, mode) {
  const P = MID_PAPERS[id];
  if (!P) return renderEmpty("#/midterm", "找不到這份考卷");
  const exam = mode === "exam", book = mode === "book", school = mode === "school" && !!P.school, format = mode === "format" && !P.g2;
  // 模擬考：要寫的題目用手寫（像拿筆寫考卷）；練習、錯題本用點的比較快；學校考卷寫錯的（多半是聽寫）用手寫再練
  const pen = exam || school || format;
  let sections = P.math ? mpMathQuestions(P, pen) : P.g2 ? mpG2Questions(P, pen) : mpQuestions(P, pen);
  sections.forEach(sec => sec.qs.forEach((q, k) => { q.id = `${sec.no}-${k}`; }));
  if (format) sections = sections.filter(sec => (P.formatSecs || ["三", "六"]).includes(sec.no));
  if (book || school) {
    const ids = new Set(book ? mpBook(id) : P.school.ids);
    sections = sections.map(sec => ({ ...sec, qs: sec.qs.filter(q => ids.has(q.id)) })).filter(sec => sec.qs.length);
    if (!sections.length) return renderEmpty("#/midterm", "錯題本是空的，錯的題目都會了 🌟");
  }
  return renderChoiceExam({ title: exam ? `📝 ${P.title}・模擬考` : book ? `📒 ${P.title}・錯題本` : school ? `🏫 ${P.school.label}・再練` : format ? "✏️ 考卷題目怎麼寫" : `📄 ${P.title}・練習`, back: "#/midterm", key: `mid:${id}`,
    practice: !exam, review: book || school || format, intro: format ? (P.formatIntro || mpFormatIntro)() : null, percent: !!P.percent && !book && !school, practiceHash: `#/midpaper/${id}`, retryHash: `#/midpaper/${id}${exam ? "?mode=exam" : book ? "?mode=book" : school ? "?mode=school" : format ? "?mode=format" : ""}`,
    sections, onFinish: ({ qs, picks }) => mpBookSave(id, qs, picks) });
}

// === 二年級用的作答方式 ===
// 寫國字 → 選國字：用 CHAR_BOPO 找同音字（同注音不同聲調也算），考的就是同音字別寫錯
let mpBopoIndex = null;
function mpHomophones(ch, n = 3, avoid = []) {
  if (!mpBopoIndex) { mpBopoIndex = {}; Object.entries(CHAR_BOPO).forEach(([c, b]) => { const k = b.replace(/[ˊˇˋ˙]/g, ""); (mpBopoIndex[k] = mpBopoIndex[k] || []).push(c); }); }
  const b = CHAR_BOPO[ch] || "";
  const same = (mpBopoIndex[b.replace(/[ˊˇˋ˙]/g, "")] || []).filter(c => c !== ch && !avoid.includes(c));
  return shuffle(same).slice(0, n);
}
// 一個詞（可能好幾個字）的錯誤選項：把其中一個字換成同音字；extra 是卷子／老師的形近字，優先用
function mpWordDistractors(word, extra = []) {
  const out = new Set(extra.filter(x => x !== word));
  [...word].forEach((ch, i) => mpHomophones(ch, 3).forEach(h => out.add(word.slice(0, i) + h + word.slice(i + 1))));
  return shuffle([...out]).slice(0, 3);
}
// 數字作答（數學）：數字鍵盤，按 ✓ 才算作答；可以再改
function mpNumInput(ans, unit, pick) {
  const shown = el("div", { class: "mp-num__shown" }, t("還沒作答"));
  const pad = numPad((v, reset) => { shown.replaceChildren(t(`你寫：${v}${unit || ""}（要改就重新按數字）`)); pick({ text: `${v}${unit || ""}`, ok: v === ans }); reset(); });
  return el("div", { class: "mp-num" }, unit ? el("div", { class: "b2-unit" }, t(`答：□ ${unit}`)) : null, pad, shown);
}

// === 二年級國語卷（資料在 data-midterm.js 的 MID_G2_ZH）===
// segs：['c', 文字, 注音]＝一般字（注音照卷子，沒有就自動注音）、['t', 顯示]＝這一題要寫的格子、['b', 顯示]＝別題的空格（只給注音或國字，不洩答案）
const mpIsBopo = s => /[ㄅ-ㄩ]/.test(s);
function mpSegsEl(segs, kind) {
  return el("div", { class: "mp-sent" }, segs.map(([k, s, b]) => {
    if (k === "c") return b ? rubyEl(s, b, "span") : t(s);
    if (k === "t") return kind === "bopow" ? el("span", { class: "mp-tgt mp-tgt--char", "data-nobopo": "1" }, s, el("span", { class: "mp-tgt__q" }, "？"))
      : el("span", { class: "mp-tgt" }, el("span", { class: "mp-tgt__q" }, "？"), bopoWordEl(s));
    return mpIsBopo(s) ? el("span", { class: "mp-oth" }, bopoWordEl(s)) : el("span", { class: "mp-oth", "data-nobopo": "1" }, s);
  }));
}
// 標點符號：點空格，再點符號
const MP_PUNCT = ["，", "。", "？", "！", "：", "「", "」", "、"];
function mpPunct(text, ans, pick) {
  const parts = text.split("(＿)"), val = ans.map(() => null);
  let cur = 0;
  const line = el("div", { class: "mp-sent mp-punct-line" });
  const draw = () => {
    line.replaceChildren(...parts.flatMap((p, i) => [t(p), i < ans.length ? el("button", { class: `mp-pslot ${i === cur ? "mp-pslot--on" : ""}`, "data-nobopo": "1", onclick: () => { cur = i; draw(); } }, val[i] || "　") : null]).filter(Boolean));
    pick(val.every(Boolean) ? { text: val.join(" "), ok: val.every((v, i) => v === ans[i]) } : null);
  };
  const pal = el("div", { class: "mp-ppal" }, MP_PUNCT.map(p => el("button", { class: "mp-pkey", "data-nobopo": "1", onclick: () => { val[cur] = p; cur = Math.min(cur + 1, ans.length - 1); draw(); } }, p)));
  draw();
  return el("div", { class: "mp-punct" }, line, el("div", { class: "m-hint" }, t("點空格，再點要填的標點符號")), pal);
}
// 照樣寫短語、造句：沒有標準答案 → 想一想、說說看，再看老師的參考答案（不計分）
function mpOpen(q, pick) {
  const box = el("div", { class: "mp-open" });
  box.append(q.ex ? el("div", { class: "mp-open__ex" }, t(`範例：${q.ex}`)) : null,
    el("div", { class: "m-hint" }, t("先想一想、說說看，再按下面看老師的參考答案（這題不計分）")),
    el("button", { class: "btn btn--ghost btn--full", onclick: e => { e.currentTarget.replaceWith(el("div", { class: "mp-open__ans" }, t(`參考答案：${q.sample}`))); pick({ text: "看過了", ok: true }); } }, t("💡 想好了，看參考答案")));
  return box;
}
function mpG2Questions(P, pen = false) {
  const pool = P.sections.flatMap(s => s.qs).filter(q => q.k === "zhw").map(q => q.ans);
  return P.sections.map(sec => ({ no: sec.no, name: sec.name, pts: 1, qs: sec.qs.map((q, k) => {
    const no = el("div", { class: "mp-q__no" }, t(`${sec.no}・${q.n || k + 1}`));
    if (q.k === "zhw") {
      const opts = [q.ans, ...mpWordDistractors(q.ans, shuffle(pool.filter(a => a.length === q.ans.length && a !== q.ans)).slice(0, 2))];
      while (opts.length < 4) { const x = shuffle(pool.filter(a => a.length === q.ans.length && !opts.includes(a)))[0]; if (!x) break; opts.push(x); }
      const memo = q.ans.length === 1 && typeof ZH2_MNEMONIC !== "undefined" && ZH2_MNEMONIC[q.ans] ? `。${ZH2_MNEMONIC[q.ans]}` : "";
      if (pen) return { prompt: el("div", { class: "mp-q" }, no, mpSegsEl(q.segs, "zhw"), el("div", { class: "m-hint" }, t("看注音，選出「？」要寫的國字，再照著描一次"))),
        say: () => speakZh(q.full), review: mpSegsEl(q.segs, "zhw"), tip: `${q.full}（「${q.ans}」）${memo}`, pen: true,
        mount: pick => pickTrace(shuffle(opts).map(o => ({ label: el("span", { class: "c-opt__zh", "data-nobopo": "1" }, o), text: o, ok: o === q.ans, trace: [...o] })), "zh", pick), answerText: q.ans, rec: ok => recordZh(`期中卷:${q.ans}`, ok) };
      return { prompt: el("div", { class: "mp-q" }, no, mpSegsEl(q.segs, "zhw"), el("div", { class: "m-hint" }, t("看注音，選出「？」要寫的國字"))),
        say: () => speakZh(q.full), review: mpSegsEl(q.segs, "zhw"), tip: `${q.full}（「${q.ans}」）${memo}`,
        options: shuffle(opts).map(o => ({ label: el("span", { class: "c-opt__zh", "data-nobopo": "1" }, o), text: o, ok: o === q.ans })), rec: ok => recordZh(`期中卷:${q.ans}`, ok) };
    }
    if (q.k === "bopow") {
      const ch = q.segs.find(s => s[0] === "t")[1];
      return { prompt: el("div", { class: "mp-q" }, no, mpSegsEl(q.segs, "bopow"), el("div", { class: "m-hint" }, t(`看國字，把「？」的注音${pen ? "寫" : "拼"}出來`))),
        say: () => speakZh(`看國字，把它的注音${pen ? "寫" : "拼"}出來`), review: mpSegsEl(q.segs, "bopow"), tip: `「${ch}」念「${q.ans}」，${q.full}`, pen,
        mount: pen ? pick => spellTrace(q.ans, pick) : pick => mpSpell(q.ans, a => pick(a == null ? null : { text: a, ok: mpNorm(a) === mpNorm(q.ans) })), answerText: q.ans, rec: ok => recordZh(`期中卷:${ch}`, ok) };
    }
    if (q.k === "punct") return { prompt: el("div", { class: "mp-q" }, no, el("div", { class: "m-hint" }, t("填入標點符號"))), say: () => speakZh(q.text),
      review: t(q.text), tip: `答案：${q.ans.join(" ")}。說話的話用「」，問句用？，驚訝或高興用！，句子說完用。`,
      mount: pick => mpPunct(q.text, q.ans, pick), answerText: q.ans.join(" "), rec: ok => recordZh(`期中卷:標點${sec.no}${q.n}`, ok) };
    if (q.k === "open") return { noScore: true, prompt: el("div", { class: "mp-q" }, no, el("div", { class: "mp-sent" }, t(q.text))), say: () => speakZh(`${q.text}。${q.ex || ""}`),
      review: t(q.text), tip: `參考答案：${q.sample}`, mount: pick => mpOpen(q, pick), answerText: q.sample };
    return { prompt: el("div", { class: "mp-q" }, no, el("div", { class: "mp-sent" }, t(q.text))), say: () => speakZh(q.text), review: t(q.text),
      tip: `答案是「${q.opts[q.ans]}」。`, options: q.opts.map((o, i) => ({ label: t(o), text: o, ok: i === q.ans })), rec: ok => recordZh(`期中卷:${q.text.slice(0, 12)}`, ok) };
  }) }));
}
Object.entries(MID_G2_ZH).forEach(([id, P]) => { MID_PAPERS[id] = { ...P, id, grade: "g2", g2: true, percent: true }; });

// === 二年級數學：課照數學期中複習卷(二)（tools/midterm/m2.json，答案照老師紅字）===
// 原卷前兩題沒有大題標題，這裡叫「早餐店」「驗算」；寫算式的題目在網站上只填最後答案（數字鍵盤）
const MP_MENU = () => el("div", { class: "mp-menu" }, [["🥛", "豆漿", 20], ["🍼", "牛奶", 28], ["🥪", "三明治", 35], ["🍔", "漢堡", 60]].map(([e, n, p]) => el("div", { class: "mp-menu__item" }, el("span", { class: "mp-menu__e" }, e), t(n), el("b", { "data-nobopo": "1" }, `${p}元`))));
const MP_VEG = () => el("div", { class: "mp-menu" }, [["🥬", "高麗菜", "95元"], ["🥦", "花椰菜", "●元"], ["🥒", "絲瓜", "●元"], ["🌽", "玉米", "18元"]].map(([e, n, p]) => el("div", { class: "mp-menu__item" }, el("span", { class: "mp-menu__e" }, e), t(n), el("b", { "data-nobopo": "1" }, p))));
function MP_RULER() {
  const g = svg("svg", { viewBox: "0 0 340 90", class: "mp-ruler" });
  g.appendChild(svg("rect", { x: 10, y: 20, width: 320, height: 40, fill: "#fff6d6", stroke: "#3b3a4a", "stroke-width": 2 }));
  for (let i = 0; i <= 15; i++) { const x = 20 + i * 20; g.appendChild(svg("line", { x1: x, y1: 20, x2: x, y2: 38, stroke: "#3b3a4a", "stroke-width": 2 })); g.appendChild(svg("text", { x, y: 54, "text-anchor": "middle", "font-size": 12, fill: "#3b3a4a" }, document.createTextNode(String(i)))); }
  g.appendChild(svg("line", { x1: 80, y1: 12, x2: 160, y2: 12, stroke: "#e0393e", "stroke-width": 4 }));
  [80, 160].forEach(x => g.appendChild(svg("line", { x1: x, y1: 6, x2: x, y2: 20, stroke: "#e0393e", "stroke-width": 3 })));
  g.appendChild(svg("rect", { x: 300, y: 66, width: 20, height: 20, fill: "#fff", stroke: "#3b3a4a", "stroke-width": 2 }));
  g.appendChild(svg("text", { x: 296, y: 81, "text-anchor": "end", "font-size": 12, fill: "#3b3a4a" }, document.createTextNode("1cm")));
  return g;
}
function MP_CUPS() {
  const g = svg("svg", { viewBox: "0 0 260 130", class: "mp-cups" });
  [[40, 1, "甲"], [160, 0.5, "乙"]].forEach(([x, f, n]) => {
    g.appendChild(svg("rect", { x, y: 20 + 80 * (1 - f), width: 60, height: 80 * f, fill: "#9ec9ff" }));
    g.appendChild(svg("path", { d: `M ${x} 20 L ${x} 100 L ${x + 60} 100 L ${x + 60} 20`, fill: "none", stroke: "#3b3a4a", "stroke-width": 3 }));
    g.appendChild(svg("text", { x: x + 30, y: 122, "text-anchor": "middle", "font-size": 16, fill: "#3b3a4a" }, document.createTextNode(n)));
  });
  return g;
}
const MID_G2_MATH = { id: "g2m2", grade: "g2", g2: true, math: true, percent: true, title: "數學期中複習卷(二)", sections: [
  { no: "一", name: "早餐店", qs: [
    { n: "(1)", text: "超好吃早餐店的簡易菜單。(1)小明有80元，買了一瓶牛奶後，小明還剩下幾元？", vis: MP_MENU, num: 52, unit: "元", tip: "80−28＝52，還剩52元。" },
    { n: "(2)", text: "(2)小莉有64元，買了一個三明治後，小莉還剩下幾元？", vis: MP_MENU, num: 29, unit: "元", tip: "64−35＝29，還剩29元。" },
    { n: "(3)", text: "(3)早餐店打算開始賣蛋餅。老闆想把蛋餅的價格訂得比漢堡便宜35元，請問蛋餅賣多少元？", vis: MP_MENU, num: 25, unit: "元", tip: "漢堡60元，便宜35元：60−35＝25。" },
  ] },
  { no: "二", name: "驗算", qs: [
    { n: "1", text: "用驗算檢查，算對了嗎？阿力：34−18＝16", opts: ["○ 對", "× 錯"], ans: 0, tip: "驗算：16＋18＝34，跟34一樣，所以算對了，畫○。" },
    { n: "2", text: "用驗算檢查，算對了嗎？阿宏：65−47＝13", opts: ["○ 對", "× 錯"], ans: 1, tip: "驗算：13＋47＝60，不是65，所以算錯了，打×（正確是18）。" },
  ] },
  { no: "四", name: "應用題", qs: [
    { n: "1", text: "參加露營的男生有89人，女生比男生多26人，參加露營的女生有幾人？", num: 115, unit: "人", tip: "女生比男生多，用加：89＋26＝115。" },
    { n: "2", text: "柳丁園開放免費摘柳丁，媽媽摘了73個，妹妹摘了15個，媽媽比妹妹多摘幾個柳丁？", num: 58, unit: "個", tip: "比多少，用減：73−15＝58。" },
    { n: "3", text: "哥哥有45元，弟弟有20元，爸爸給弟弟20元後，誰的錢比較多？", opts: ["哥哥", "弟弟", "一樣多"], ans: 0, tip: "弟弟變成20＋20＝40元，45＞40，哥哥比較多。" },
    { n: "4(1)", text: "一個花椰菜比一個高麗菜便宜26元，一個花椰菜是幾元？", vis: MP_VEG, num: 69, unit: "元", tip: "高麗菜95元，便宜26元：95−26＝69。" },
    { n: "4(2)", text: "一條絲瓜比一根玉米貴45元，一條絲瓜是幾元？", vis: MP_VEG, num: 63, unit: "元", tip: "玉米18元，貴45元：18＋45＝63。" },
    { n: "5", text: "袋子裡原有28片餅乾，小悅再放進一些後，全部有34片，小悅放進幾片餅乾？", num: 6, unit: "片", tip: "全部減原來的：34−28＝6。個位4不夠減8，要向十位借1。" },
    { n: "6(1)", text: "商店裡有牛奶和果汁共31罐，其中果汁有13罐，牛奶有幾罐？", num: 18, unit: "罐", tip: "全部減果汁：31−13＝18。" },
    { n: "6(2)", text: "31−13＝18，要怎麼驗算？", opts: ["18＋13＝31", "31＋13＝44", "18−13＝5"], ans: 0, tip: "減法用加法驗算：答案加減掉的數，18＋13＝31。" },
  ] },
  { no: "五", name: "填入＞、＜或＝", qs: [
    ["12＋9 ◯ 21", 2, "12＋9＝21，一樣大，用＝。"], ["269 ◯ 266", 0, "百位、十位一樣，比個位：9比6大，用＞。"], ["104 ◯ 207", 1, "比百位：1比2小，用＜。"],
    ["16＋18 ◯ 24", 0, "16＋18＝34，34比24大，用＞。"], ["14＋15 ◯ 39−10", 2, "14＋15＝29，39−10＝29，一樣大，用＝。"],
  ].map(([text, ans, tip], k) => ({ n: String(k + 1), text, opts: ["＞", "＜", "＝"], ans, tip })) },
  { no: "六", name: "選擇題", qs: [
    { n: "1", text: "鉛筆的長度約多少公分？", opts: ["200公分", "20公分", "2公分"], ans: 1, tip: "一枝鉛筆大約20公分（差不多一個手掌再長一點）。" },
    { n: "2", text: "一個□是1公分，從刻度3到刻度7的長度是幾公分？", vis: MP_RULER, opts: ["3公分", "4公分", "5公分"], ans: 1, tip: "7−3＝4，從3數到7有4格，是4公分。" },
    { n: "3", text: "下面哪個容器可以再裝水？", vis: MP_CUPS, opts: ["甲", "乙", "都可以"], ans: 1, tip: "甲已經裝滿了；乙只裝一半，還可以再裝。" },
  ] },
] };
MID_PAPERS.g2m2 = MID_G2_MATH;

// === 二年級數學：115-1 二上複習卷 單元1～5（家長 11/4 拍照，A-1、A-2 九大題共 100 分）===
// 題目、數字、順序、配分照卷子；圖照卷子重畫（容器、杯子、尺、方格繩子的長度照卷子數過：ㄅ12、ㄆ10、ㄇ13）
// 原卷要打 V／X、畫圖、寫算式的題目，網站改成選答案或填最後的數字（算式在提示裡）
function M15_BOTTLES(k) {
  const g = svg("svg", { viewBox: "0 0 260 162", class: "mp-cups" });
  const bottle = (cx, w, h, level, label) => {
    const x = cx - w / 2, top = 140 - h;
    g.appendChild(svg("rect", { x: x + 2, y: 140 - h * level, width: w - 4, height: h * level, fill: "#9ec9ff" }));
    g.appendChild(svg("path", { d: `M ${cx - 10} ${top - 14} L ${cx - 10} ${top} Q ${x} ${top} ${x} ${top + 16} L ${x} 140 L ${x + w} 140 L ${x + w} ${top + 16} Q ${x + w} ${top} ${cx + 10} ${top} L ${cx + 10} ${top - 14}`, fill: "none", stroke: "#3b3a4a", "stroke-width": 3 }));
    g.appendChild(svg("text", { x: cx, y: 160, "text-anchor": "middle", "font-size": 17, fill: "#3b3a4a" }, document.createTextNode(label)));
  };
  if (k === 1) { bottle(70, 48, 104, 0.55, "①"); bottle(190, 100, 104, 0.55, "②"); }
  else { bottle(70, 56, 104, 0.72, "①"); bottle(190, 56, 104, 0.42, "②"); }
  return g;
}
const M15_CUPS = () => el("div", { class: "mp15-cups" }, [["①", "☕", 9], ["②", "🏺", 7]].map(([no, e, n]) =>
  el("div", { class: "mp15-cups__row" }, el("b", { "data-nobopo": "1" }, no), el("span", { class: "mp15-cups__big" }, e), t("倒滿 →"), el("span", { class: "mp15-cups__small" }, "🥛".repeat(n)))));
function M15_RULER(ok) { // 五：量東西要從 0 開始
  const g = svg("svg", { viewBox: "0 0 300 120", class: "mp-ruler" }), u = 46, x0 = 40;
  g.appendChild(svg("rect", { x: 14, y: 70, width: 272, height: 40, fill: "#fff6d6", stroke: "#3b3a4a", "stroke-width": 2 }));
  for (let i = 0; i <= 10; i++) { const x = x0 + i * u / 2; g.appendChild(svg("line", { x1: x, y1: 70, x2: x, y2: i % 2 ? 80 : 88, stroke: "#3b3a4a", "stroke-width": 2 })); if (i % 2 === 0) g.appendChild(svg("text", { x, y: 104, "text-anchor": "middle", "font-size": 13, fill: "#3b3a4a" }, document.createTextNode(String(i / 2)))); }
  const left = ok ? x0 : 14;
  [0, 1, 2].forEach(r => g.appendChild(svg("rect", { x: left, y: 16 + r * 16, width: 120, height: 16, fill: "#fff", stroke: "#3b3a4a", "stroke-width": 2 })));
  g.appendChild(svg("rect", { x: left + 120, y: 32, width: 32, height: 38, fill: "#fff", stroke: "#3b3a4a", "stroke-width": 2 }));
  g.appendChild(svg("line", { x1: left, y1: 8, x2: left, y2: 112, stroke: "#e0393e", "stroke-width": 2, "stroke-dasharray": "4 3" }));
  return g;
}
function M15_ROPE() { // 六(1)：繩子從刻度 5 到 13
  const g = svg("svg", { viewBox: "0 0 300 110", class: "mp-ruler" }), x = c => 20 + (c - 2) * 20;
  g.appendChild(svg("rect", { x: 10, y: 60, width: 282, height: 36, fill: "#fff6d6", stroke: "#3b3a4a", "stroke-width": 2 }));
  for (let c = 2; c <= 15; c++) { g.appendChild(svg("line", { x1: x(c), y1: 60, x2: x(c), y2: 74, stroke: "#3b3a4a", "stroke-width": 2 })); g.appendChild(svg("text", { x: x(c), y: 90, "text-anchor": "middle", "font-size": 12, fill: "#3b3a4a" }, document.createTextNode(String(c)))); }
  g.appendChild(svg("rect", { x: x(5), y: 28, width: x(13) - x(5), height: 12, fill: "#c98b5a", stroke: "#3b3a4a", "stroke-width": 1.5 }));
  [5, 13].forEach(c => g.appendChild(svg("line", { x1: x(c), y1: 14, x2: x(c), y2: 60, stroke: "#3b3a4a", "stroke-width": 1.5, "stroke-dasharray": "4 3" })));
  return g;
}
// 六(2)：10×4 方格，一格 1cm；繩子照卷子畫
const M15_PATHS = {
  "ㄅ": [[0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [1, 3], [1, 4], [3, 4], [3, 1], [2, 1]],
  "ㄆ": [[2, 0], [9, 0], [9, 1], [10, 1], [10, 2]],
  "ㄇ": [[5, 1], [4, 1], [4, 2], [5, 2], [5, 3], [6, 3], [6, 4], [8, 4], [8, 2], [7, 2], [7, 1], [6, 1]],
};
const m15Len = k => M15_PATHS[k].reduce((n, p, i) => i ? n + Math.abs(p[0] - M15_PATHS[k][i - 1][0]) + Math.abs(p[1] - M15_PATHS[k][i - 1][1]) : 0, 0);
function M15_GRID(hi) {
  const c = 28, ox = 10, oy = 26, g = svg("svg", { viewBox: `0 0 ${ox * 2 + c * 10} ${oy + c * 4 + 8}`, class: "mp-ruler" });
  for (let i = 0; i <= 10; i++) g.appendChild(svg("line", { x1: ox + i * c, y1: oy, x2: ox + i * c, y2: oy + 4 * c, stroke: "#c9c2b6", "stroke-width": 1 }));
  for (let j = 0; j <= 4; j++) g.appendChild(svg("line", { x1: ox, y1: oy + j * c, x2: ox + 10 * c, y2: oy + j * c, stroke: "#c9c2b6", "stroke-width": 1 }));
  Object.entries(M15_PATHS).forEach(([k, pts]) => g.appendChild(svg("polyline", { points: pts.map(([x, y]) => `${ox + x * c},${oy + y * c}`).join(" "), fill: "none", stroke: k === hi ? "#c2306b" : "#3b3a4a", "stroke-width": k === hi ? 5 : 3.5, "stroke-linejoin": "round" })));
  [["ㄅ", 0.5, 1.6], ["ㄆ", 5.5, -0.25], ["ㄇ", 6.5, 2.65]].forEach(([k, x, y]) => g.appendChild(svg("text", { x: ox + x * c, y: oy + y * c, "text-anchor": "middle", "font-size": 16, "font-weight": 700, fill: k === hi ? "#c2306b" : "#3b3a4a" }, document.createTextNode(k))));
  return g;
}
const m15Seq = k => ["294", "295", "296", "297", "298", "299", "300"].map((v, i) => [1, 3, 4, 6].includes(i) ? (i === k ? "(？)" : "(　)") : v).join(" → ");
const MID_G2_REVIEW15 = { id: "g2m15", grade: "g2", g2: true, math: true, title: "二上複習卷 單元1～5", sections: [
  { no: "一", name: "哪一個容器的水比較多", pts: 2, qs: [
    { n: "(1)", text: "哪一個容器裡裝的水比較多？（卷子上：多的打V，少的打X）", vis: () => M15_BOTTLES(1), opts: ["①", "②"], ans: 1, tip: "水一樣高，瓶子比較粗的裝得比較多，所以②比較多。" },
    { n: "(2)", text: "哪一個容器裡裝的水比較多？（卷子上：多的打V，少的打X）", vis: () => M15_BOTTLES(2), opts: ["①", "②"], ans: 0, tip: "兩個瓶子一樣大，水比較高的裝得比較多，所以①比較多。" },
  ] },
  { no: "二", name: "填填看", pts: 2, qs: [
    ...[295, 297, 298, 300].map((num, k) => ({ n: "(1)", text: m15Seq([1, 3, 4, 6][k]), num, tip: "一個一個往上數，每次多1：294、295、296、297、298、299、300。" })),
    { n: "(2)", text: "107的百位數字是(？)。", num: 1, tip: "107：百位是1，十位是0，個位是7。" },
    { n: "(2)", text: "107的十位數字是(？)。", num: 0, tip: "107：百位是1，十位是0，個位是7。十位沒有，要寫0。" },
    { n: "(2)", text: "107的個位數字是(？)。", num: 7, tip: "107：百位是1，十位是0，個位是7。" },
    { n: "(3)", text: "2個百和17個一，可以換成2個百、1個十和(？)個一。", num: 7, tip: "17個一＝1個十和7個一，所以是7。" },
    { n: "(4)", text: "2個百和9個一合起來是(？)。", num: 209, tip: "2個百是200，加9個一是209；十位沒有，要寫0。" },
    { n: "(5)", text: "1個百、8個十和13個一合起來是(？)。", num: 193, tip: "13個一＝1個十和3個一，所以是1個百、9個十、3個一＝193。" },
    { n: "(6)①", text: "44＋29＝73，73−44＝(？)", num: 29, tip: "加法和減法是一家人：44＋29＝73，所以73−44＝29。" },
    { n: "(6)②", text: "44＋29＝73，73−29＝(？)", num: 44, tip: "加法和減法是一家人：44＋29＝73，所以73−29＝44。" },
  ] },
  { no: "三", name: "填入＞、＜或＝", pts: 2, qs: [
    ["199 ◯ 299", 1, "百位1比2小，用＜。"], ["300 ◯ 200", 0, "百位3比2大，用＞。"], ["156 ◯ 165", 1, "百位一樣，比十位：5比6小，用＜。"],
    ["25＋9 ◯ 34", 2, "25＋9＝34，一樣大，用＝。"], ["84−7 ◯ 78", 1, "84−7＝77，77比78小，用＜。"], ["70−15 ◯ 40＋15", 2, "70−15＝55，40＋15＝55，一樣大，用＝。"],
  ].map(([text, ans, tip], k) => ({ n: `(${k + 1})`, text, opts: ["＞", "＜", "＝"], ans, tip })) },
  { no: "四", name: "哪個容器容量比較多", pts: 2, qs: [
    { n: "", text: "倒滿相同的小杯子，哪個容器容量比較多？（卷子上：在比較多的打V）", vis: M15_CUPS, opts: ["①", "②"], ans: 0, tip: "①倒滿9杯，②倒滿7杯，9比7多，所以①容量比較多。" },
  ] },
  { no: "五", name: "哪一種量法是正確的", pts: 2, qs: [
    { n: "(1)", text: "這樣量正確嗎？（卷子上：正確打V，錯誤打X）", vis: () => M15_RULER(true), opts: ["正確（V）", "錯誤（X）"], ans: 0, tip: "東西的一頭對齊尺的0，這樣量是正確的。" },
    { n: "(2)", text: "這樣量正確嗎？（卷子上：正確打V，錯誤打X）", vis: () => M15_RULER(false), opts: ["正確（V）", "錯誤（X）"], ans: 1, tip: "東西沒有對齊0，是對齊尺的邊邊，這樣量是錯誤的。" },
  ] },
  { no: "六", name: "看圖填填看", pts: 2, qs: [
    { n: "(1)", text: "繩子大約長幾公分？", vis: M15_ROPE, num: 8, unit: "公分", tip: "繩子從5到13：13−5＝8，大約長8公分。" },
    ...["ㄅ", "ㄆ", "ㄇ"].map((k, i) => ({ n: `(2)${"①②③"[i]}`, text: `數數看，一格是1公分，${k}繩長幾公分？`, vis: () => M15_GRID(k), num: m15Len(k), unit: "公分", tip: `沿著${k}繩一段一段數格子的邊，一格1公分，加起來是${m15Len(k)}公分。` })),
  ] },
  { no: "七", name: "畫畫看", pts: 2, qs: [
    { n: "", text: "用100、⑩和①表示289，要畫幾個？", opts: ["2個100、8個⑩、9個①", "2個100、9個⑩、8個①", "8個100、2個⑩、9個①"], ans: 0, tip: "289：百位2、十位8、個位9，所以畫2個100、8個⑩、9個①。" },
  ] },
  { no: "八", name: "用直式算算看", pts: 3, qs: [
    [34, "＋", 28, 62], [28, "＋", 91, 119], [54, "＋", 76, 130], [47, "＋", 86, 133], [38, "−", 5, 33], [67, "−", 26, 41], [81, "−", 53, 28], [93, "−", 75, 18],
  ].map(([a, op, b, num], k) => ({ n: `(${k + 1})`, text: `${a}${op}${b}＝(？)`, num,
    tip: op === "＋" ? `直式：個位先加，${a % 10}＋${b % 10}＝${a % 10 + b % 10}${a % 10 + b % 10 >= 10 ? "，滿10要進位到十位" : ""}；再加十位。答案${num}。`
      : `直式：個位先減，${a % 10}${a % 10 < b % 10 ? `不夠減${b % 10}，向十位借1變成${a % 10 + 10}` : `−${b % 10}`}；再減十位。答案${num}。` })) },
  { no: "九", name: "把做法用算式記下來", pts: 4, qs: [
    { n: "(1)", text: "丸藤買了1塊65元的蛋糕和1杯88元的咖啡，他共要付幾元？", num: 153, unit: "元", tip: "合起來用加法：65＋88＝153，答：153元。" },
    { n: "(2)", text: "立香有64顆彈珠，送給朋友49顆後，她還剩下幾顆彈珠？", num: 15, unit: "顆", tip: "送出去用減法：64−49＝15，答：15顆。個位4不夠減9，要向十位借1。" },
    { n: "(3)", text: "一條71公分的紅繩和一條48公分的黃繩，相差幾公分？", num: 23, unit: "公分", tip: "相差用減法：71−48＝23，答：23公分。" },
    { n: "(4)", text: "公車上原有35個人，有一些人下車後，剩下16個人，有幾個人下車？", vis: () => barModel([{ label: "下車", val: null }, { label: "剩下", val: 16 }], { label: "原有", val: 35 }, "個"), num: 19, unit: "人", tip: "原有的減剩下的：35−16＝19，答：19人。" },
    { n: "(5)", text: "小瑪已經收集37張遊戲卡，還要再收集幾張，才能有90張遊戲卡？", vis: () => barModel([{ label: "已收集", val: 37 }, { label: "再收集", val: null }], { label: "共有", val: 90 }, "張"), num: 53, unit: "張", tip: "全部的減已經有的：90−37＝53，答：53張。" },
  ] },
] };
MID_PAPERS.g2m15 = MID_G2_REVIEW15;
function mpMathQuestions(P, pen = false) {
  return P.sections.map(sec => ({ no: sec.no, name: sec.name, pts: sec.pts || 1, qs: sec.qs.map(q => {
    const prompt = el("div", { class: "mp-q" }, el("div", { class: "mp-q__no" }, t(q.n ? `${sec.no}・${q.n}` : sec.no)), q.vis ? q.vis() : null, el("div", { class: "b2-text mp-mtext" }, t(q.text)));
    const base = { prompt, say: () => speakZh(q.text.replace(/◯/g, "，填大於、小於還是等於")), review: t(q.text), tip: q.tip, rec: ok => recordMath("midpaper", ok) };
    if (q.num != null) return { ...base, mount: pick => mpNumInput(q.num, q.unit, pick), answerText: `${q.num}${q.unit || ""}` };
    return { ...base, options: q.opts.map((o, i) => ({ label: /[一-鿿]/.test(o) ? t(o) : el("span", { class: "ex-en", "data-nobopo": "1" }, o), text: o, ok: i === q.ans })) };
  }) }));
}
