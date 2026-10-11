// 國語複習資料（注音 + 國字），依年級分
// 一年級上學期 第六課〈謝謝老師〉：課文 + 老師圈起來的複習詞語（課本 p.60-63、習作 p.32-35，編號 1-18）
// 第 7 題在照片上只看得到筆壓痕，暫定為課本 p.63「數一數」，待家長確認
// bopo：每個字一段注音（空白分隔），輕聲 ˙ 寫在最後

const ZH_DATA = {
  g1: {
    lessons: [
      {
        id: "L6", exam: { date: "2026-10-16", label: "圈詞聽寫", mode: "spell" },
        title: "第六課 謝謝老師", titleBopo: "ㄉㄧˋ ㄌㄧㄡˋ ㄎㄜˋ ㄒㄧㄝˋ ㄒㄧㄝ˙ ㄌㄠˇ ㄕ", emoji: "🌺",
        text: [
          { zh: "我要送老師", bopo: "ㄨㄛˇ ㄧㄠˋ ㄙㄨㄥˋ ㄌㄠˇ ㄕ" },
          { zh: "一朵小紅花", bopo: "ㄧˋ ㄉㄨㄛˇ ㄒㄧㄠˇ ㄏㄨㄥˊ ㄏㄨㄚ" },
          { zh: "謝謝老師", bopo: "ㄒㄧㄝˋ ㄒㄧㄝ˙ ㄌㄠˇ ㄕ" },
          { zh: "教我讀書", bopo: "ㄐㄧㄠ ㄨㄛˇ ㄉㄨˊ ㄕㄨ" },
          { zh: "也謝謝老師", bopo: "ㄧㄝˇ ㄒㄧㄝˋ ㄒㄧㄝ˙ ㄌㄠˇ ㄕ" },
          { zh: "教我畫畫", bopo: "ㄐㄧㄠ ㄨㄛˇ ㄏㄨㄚˋ ㄏㄨㄚˋ" },
        ],
        words: [
          { no: 1, zh: "小紅花", bopo: "ㄒㄧㄠˇ ㄏㄨㄥˊ ㄏㄨㄚ", emoji: "🌺", from: "課本" },
          { no: 2, zh: "謝謝", bopo: "ㄒㄧㄝˋ ㄒㄧㄝ˙", emoji: "🙏", from: "課本" },
          { no: 3, zh: "老師", bopo: "ㄌㄠˇ ㄕ", emoji: "🧑‍🏫", from: "課本" },
          { no: 4, zh: "讀書", bopo: "ㄉㄨˊ ㄕㄨ", emoji: "📖", from: "課本" },
          { no: 5, zh: "畫畫", bopo: "ㄏㄨㄚˋ ㄏㄨㄚˋ", emoji: "🎨", from: "課本" },
          { no: 6, zh: "一二三", bopo: "ㄧ ㄦˋ ㄙㄢ", emoji: "🔢", from: "課本" },
          { no: 7, zh: "數一數", bopo: "ㄕㄨˇ ㄧˋ ㄕㄨˇ", emoji: "✋", from: "課本", note: "待確認" },
          { no: 8, zh: "蜜蜂", bopo: "ㄇㄧˋ ㄈㄥ", emoji: "🐝", from: "課本" },
          { no: 9, zh: "來做工", bopo: "ㄌㄞˊ ㄗㄨㄛˋ ㄍㄨㄥ", emoji: "🛠️", from: "課本" },
          { no: 10, zh: "飛翔", bopo: "ㄈㄟ ㄒㄧㄤˊ", emoji: "🕊️", from: "課本" },
          { no: 11, zh: "懶惰蟲", bopo: "ㄌㄢˇ ㄉㄨㄛˋ ㄔㄨㄥˊ", emoji: "🐛", from: "課本" },
          { no: 12, zh: "計算機", bopo: "ㄐㄧˋ ㄙㄨㄢˋ ㄐㄧ", emoji: "🧮", from: "習作" },
          { no: 13, zh: "掃把", bopo: "ㄙㄠˋ ㄅㄚˇ", emoji: "🧹", from: "習作" },
          { no: 14, zh: "月曆", bopo: "ㄩㄝˋ ㄌㄧˋ", emoji: "📅", from: "習作" },
          { no: 15, zh: "戒指", bopo: "ㄐㄧㄝˋ ㄓˇ", emoji: "💍", from: "習作" },
          { no: 16, zh: "襪子", bopo: "ㄨㄚˋ ㄗ˙", emoji: "🧦", from: "習作" },
          { no: 17, zh: "果凍", bopo: "ㄍㄨㄛˇ ㄉㄨㄥˋ", emoji: "🍮", from: "習作" },
          { no: 18, zh: "松鼠", bopo: "ㄙㄨㄥ ㄕㄨˇ", emoji: "🐿️", from: "習作" },
        ],
      },
    ],
  },
};

// 目前年級的國語資料（沒有就是 null，首頁不顯示國語）
const ZH = ZH_DATA[CURRENT_GRADE] || null;
