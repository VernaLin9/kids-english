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
      // 第七課〈龜兔賽跑〉：習作 p.62-69（符號 ㄊㄎㄣㄟㄞㄥㄢ、看圖寫詞語、加聲調、連句子、猜一猜）
      // 詞語的國字是依習作圖片配的；p.65 大象玩偶那一格注音看不清楚，沒有收
      {
        id: "L7", exam: { date: "2026-10-22", label: "第七課 習作p.62-69", mode: "lesson" },
        title: "第七課 龜兔賽跑", titleBopo: "ㄉㄧˋ ㄑㄧ ㄎㄜˋ ㄍㄨㄟ ㄊㄨˋ ㄙㄞˋ ㄆㄠˇ", emoji: "🐢",
        symbols: ["ㄊ", "ㄎ", "ㄣ", "ㄟ", "ㄞ", "ㄥ", "ㄢ"],
        textTitle: "🔍 猜一猜（習作 p.69，點一句聽一句）",
        text: [
          { zh: "身穿綠外套", bopo: "ㄕㄣ ㄔㄨㄢ ㄌㄩˋ ㄨㄞˋ ㄊㄠˋ" },
          { zh: "肚皮白", bopo: "ㄉㄨˋ ㄆㄧˊ ㄅㄞˊ" },
          { zh: "眼睛大", bopo: "ㄧㄢˇ ㄐㄧㄥ ㄉㄚˋ" },
          { zh: "唱起歌來呱呱呱", bopo: "ㄔㄤˋ ㄑㄧˇ ㄍㄜ ㄌㄞˊ ㄍㄨㄚ ㄍㄨㄚ ㄍㄨㄚ" },
          { zh: "小時沒腳有尾巴", bopo: "ㄒㄧㄠˇ ㄕˊ ㄇㄟˊ ㄐㄧㄠˇ ㄧㄡˇ ㄨㄟˇ ㄅㄚ˙" },
          { zh: "長大有腳沒尾巴", bopo: "ㄓㄤˇ ㄉㄚˋ ㄧㄡˇ ㄐㄧㄠˇ ㄇㄟˊ ㄨㄟˇ ㄅㄚ˙" },
          { zh: "愛吃蟲子除害蟲", bopo: "ㄞˋ ㄔ ㄔㄨㄥˊ ㄗ˙ ㄔㄨˊ ㄏㄞˋ ㄔㄨㄥˊ" },
          { zh: "水邊就是我的家", bopo: "ㄕㄨㄟˇ ㄅㄧㄢ ㄐㄧㄡˋ ㄕˋ ㄨㄛˇ ㄉㄜ˙ ㄐㄧㄚ" },
          { zh: "答案是青蛙", bopo: "ㄉㄚˊ ㄢˋ ㄕˋ ㄑㄧㄥ ㄨㄚ" },
        ],
        words: [
          { no: 1, zh: "桃子", bopo: "ㄊㄠˊ ㄗ˙", emoji: "🍑", from: "習作p.62" },
          { no: 2, zh: "開水", bopo: "ㄎㄞ ㄕㄨㄟˇ", emoji: "🫖", from: "習作p.62" },
          { no: 3, zh: "噴水", bopo: "ㄆㄣ ㄕㄨㄟˇ", emoji: "⛲", from: "習作p.62" },
          { no: 4, zh: "水梨", bopo: "ㄕㄨㄟˇ ㄌㄧˊ", emoji: "🍐", from: "習作p.63" },
          { no: 5, zh: "筷子", bopo: "ㄎㄨㄞˋ ㄗ˙", emoji: "🥢", from: "習作p.63" },
          { no: 6, zh: "櫻桃", bopo: "ㄧㄥ ㄊㄠˊ", emoji: "🍒", from: "習作p.63" },
          { no: 7, zh: "麵包", bopo: "ㄇㄧㄢˋ ㄅㄠ", emoji: "🍞", from: "習作p.63" },
          { no: 8, zh: "陀螺", bopo: "ㄊㄨㄛˊ ㄌㄨㄛˊ", emoji: "🪀", from: "習作p.64" },
          { no: 9, zh: "跳繩", bopo: "ㄊㄧㄠˋ ㄕㄥˊ", emoji: "🪢", from: "習作p.64" },
          { no: 10, zh: "扣子", bopo: "ㄎㄡˋ ㄗ˙", emoji: "🧵", from: "習作p.64" },
          { no: 11, zh: "卡片", bopo: "ㄎㄚˇ ㄆㄧㄢˋ", emoji: "💌", from: "習作p.64" },
          { no: 12, zh: "鉛筆", bopo: "ㄑㄧㄢ ㄅㄧˇ", emoji: "✏️", from: "習作p.65" },
          { no: 13, zh: "剪刀", bopo: "ㄐㄧㄢˇ ㄉㄠ", emoji: "✂️", from: "習作p.65" },
          { no: 14, zh: "奶瓶", bopo: "ㄋㄞˇ ㄆㄧㄥˊ", emoji: "🍼", from: "習作p.65" },
          { no: 15, zh: "眼鏡", bopo: "ㄧㄢˇ ㄐㄧㄥˋ", emoji: "👓", from: "習作p.66" },
          { no: 16, zh: "拐杖", bopo: "ㄍㄨㄞˇ ㄓㄤˋ", emoji: "🦯", from: "習作p.66" },
          { no: 17, zh: "領帶", bopo: "ㄌㄧㄥˇ ㄉㄞˋ", emoji: "👔", from: "習作p.66" },
          { no: 18, zh: "項鍊", bopo: "ㄒㄧㄤˋ ㄌㄧㄢˋ", emoji: "📿", from: "習作p.67" },
          { no: 19, zh: "水壺", bopo: "ㄕㄨㄟˇ ㄏㄨˊ", emoji: "🫗", from: "習作p.67" },
          { no: 20, zh: "外套", bopo: "ㄨㄞˋ ㄊㄠˋ", emoji: "🧥", from: "習作p.67" },
          { no: 21, zh: "蝌蚪", bopo: "ㄎㄜ ㄉㄡˇ", emoji: "🐟", from: "習作p.68" },
          { no: 22, zh: "老鷹", bopo: "ㄌㄠˇ ㄧㄥ", emoji: "🦅", from: "習作p.68" },
          { no: 23, zh: "小鹿", bopo: "ㄒㄧㄠˇ ㄌㄨˋ", emoji: "🦌", from: "習作p.68" },
          { no: 24, zh: "外婆", bopo: "ㄨㄞˋ ㄆㄛˊ", emoji: "👵", from: "習作p.68" },
          { no: 25, zh: "飛翔", bopo: "ㄈㄟ ㄒㄧㄤˊ", emoji: "🕊️", from: "習作p.68" },
          { no: 26, zh: "奔跑", bopo: "ㄅㄣ ㄆㄠˇ", emoji: "🏃", from: "習作p.68" },
          { no: 27, zh: "游泳", bopo: "ㄧㄡˊ ㄩㄥˇ", emoji: "🏊", from: "習作p.68" },
          { no: 28, zh: "澆花", bopo: "ㄐㄧㄠ ㄏㄨㄚ", emoji: "🌷", from: "習作p.68" },
          { no: 29, zh: "青蛙", bopo: "ㄑㄧㄥ ㄨㄚ", emoji: "🐸", from: "習作p.69" },
        ],
        // 習作 p.68 連句子：誰 ＋ 在哪裡 ＋ 做什麼
        sentences: [
          { who: { zh: "蝌蚪", bopo: "ㄎㄜ ㄉㄡˇ" }, where: { zh: "在水裡", bopo: "ㄗㄞˋ ㄕㄨㄟˇ ㄌㄧˇ" }, what: { zh: "游泳", bopo: "ㄧㄡˊ ㄩㄥˇ" }, emoji: "🐟" },
          { who: { zh: "老鷹", bopo: "ㄌㄠˇ ㄧㄥ" }, where: { zh: "在天空中", bopo: "ㄗㄞˋ ㄊㄧㄢ ㄎㄨㄥ ㄓㄨㄥ" }, what: { zh: "飛翔", bopo: "ㄈㄟ ㄒㄧㄤˊ" }, emoji: "🦅" },
          { who: { zh: "小鹿", bopo: "ㄒㄧㄠˇ ㄌㄨˋ" }, where: { zh: "在山坡上", bopo: "ㄗㄞˋ ㄕㄢ ㄆㄛ ㄕㄤˋ" }, what: { zh: "奔跑", bopo: "ㄅㄣ ㄆㄠˇ" }, emoji: "🦌" },
          { who: { zh: "外婆", bopo: "ㄨㄞˋ ㄆㄛˊ" }, where: { zh: "在門前", bopo: "ㄗㄞˋ ㄇㄣˊ ㄑㄧㄢˊ" }, what: { zh: "澆花", bopo: "ㄐㄧㄠ ㄏㄨㄚ" }, emoji: "👵" },
        ],
      },
    ],
  },
};

// 目前年級的國語資料（沒有就是 null，首頁不顯示國語）
const ZH = ZH_DATA[CURRENT_GRADE] || null;
