// 數學複習資料（依年級分）
// 一年級上學期 第3回：2-1 比長短、2-2 高矮與厚薄（評量卷 p.6-7）
// 題目由 modes-math.js 依主題隨機畫圖產生，不是固定題庫
const MATH_DATA = {
  g1: {
    units: [
      {
        id: "u2", title: "第3回 比長短・高矮與厚薄", titleBopo: "ㄉㄧˋ ㄏㄨㄟˊ ㄅㄧˇ ㄔㄤˊ ㄉㄨㄢˇ ㄍㄠ ㄞˇ ㄩˇ ㄏㄡˋ ㄅㄛˊ", emoji: "📏",
        exam: { date: "2026-10-13", label: "小考 第6、7頁", mode: "sheet" },
        topics: ["line", "length", "height", "thick", "most", "tf"],
      },
      {
        // 小A本 第9回 p.18-19（照片 Drive「一年級數學小A本」IMG_8819），老師會考一模一樣的題目
        id: "u4", title: "第9回 0的認識・分與合", titleBopo: "ㄉㄧˋ ㄏㄨㄟˊ ㄉㄜ˙ ㄖㄣˋ ㄕˋ ㄈㄣ ㄩˇ ㄏㄜˊ", emoji: "🔀",
        exam: { date: "2026-10-27", label: "小考 小A本第18、19頁", mode: "sheet" },
        sheetLabel: "📄 小A本原題（第18、19頁）", sheetNote: "跟小A本一樣的題目、圖和配分",
        topics: ["split", "make10", "zero"],
      },
      {
        // 小A本 第10回 p.20-21（照片 Drive「一年級數學小A本」IMG_5099），老師會考一模一樣的題目
        id: "u5", title: "第10回 堆疊與分類・認識形狀", titleBopo: "ㄉㄧˋ ㄏㄨㄟˊ ㄉㄨㄟ ㄉㄧㄝˊ ㄩˇ ㄈㄣ ㄌㄟˋ ㄖㄣˋ ㄕˋ ㄒㄧㄥˊ ㄓㄨㄤˋ", emoji: "🔺",
        exam: { date: "2026-11-02", label: "小考 小A本第20、21頁", mode: "exam" },
        sheetLabel: "📄 小A本原題（第20、21頁）", sheetNote: "跟小A本一樣的題目、圖和配分",
        topics: ["shapeName", "shapeTrace", "shapeRoll"],
      },
      {
        // 小A本 第11回 p.22-23（5-3 拼一拼，家長 11/7 拍照），老師會考一模一樣的題目
        id: "u6", title: "第11回 拼一拼", titleBopo: "ㄉㄧˋ ㄏㄨㄟˊ ㄆㄧㄣ ㄧˋ ㄆㄧㄣ", emoji: "🧩",
        exam: { date: "2026-11-09", label: "小考 小A本第22、23頁", mode: "exam" },
        sheetLabel: "📄 小A本原題（第22、23頁）", sheetNote: "跟小A本一樣的題目、圖和配分",
        topics: ["shapeCount", "shapeUsed", "shapeName"],
      },
      {
        // 小A本 第13回 p.26-27（6-1 加法算式，家長 11/13 拍照），11/16 考
        id: "u7", title: "第13回 加法算式", titleBopo: "ㄉㄧˋ ㄏㄨㄟˊ ㄐㄧㄚ ㄈㄚˇ ㄙㄨㄢˋ ㄕˋ", emoji: "➕",
        exam: { date: "2026-11-16", label: "小考 小A本第26、27頁", mode: "exam" },
        sheetLabel: "📄 小A本原題（第26、27頁）", sheetNote: "跟小A本一樣的題目、圖和配分",
        topics: ["addPic", "make10", "split"],
      },
      {
        id: "u8", title: "第14回 0的加法・加法練習", titleBopo: "ㄉㄧˋ ㄏㄨㄟˊ ㄉㄜ˙ ㄐㄧㄚ ㄈㄚˇ ㄐㄧㄚ ㄈㄚˇ ㄌㄧㄢˋ ㄒㄧˊ", emoji: "0️⃣",
        exam: { date: "2026-11-23", label: "小考 小A本第28、29頁", mode: "exam" },
        sheetLabel: "📄 小A本原題（第28、29頁）", sheetNote: "跟小A本一樣的題目、數字和配分（圖用表情符號畫）",
        topics: ["addZero", "addPic", "make10"],
      },
      {
        id: "u9", title: "第16回 減法算式・0的減法", titleBopo: "ㄉㄧˋ ㄏㄨㄟˊ ㄐㄧㄢˇ ㄈㄚˇ ㄙㄨㄢˋ ㄕˋ ㄉㄜ˙ ㄐㄧㄢˇ ㄈㄚˇ", emoji: "➖",
        exam: { date: "2026-11-30", label: "小考 小A本第32、33頁", mode: "exam" },
        sheetLabel: "📄 小A本原題（第32、33頁）", sheetNote: "跟小A本一樣的題目、數字和配分（圖用表情符號畫）",
        topics: ["subPic", "subZero", "split"],
      },
    ],
  },
  // 二年級上學期（南一版）：題目由 modes-math2.js 產生；kind:"calc" 用數字鍵盤／選項作答
  g2: {
    units: [
      {
        id: "u4", kind: "calc", bookId: "u4", pages: "54-67",
        title: "第4單元 加減的關係與應用", titleBopo: "ㄉㄧˋ ㄉㄢ ㄩㄢˊ ㄐㄧㄚ ㄐㄧㄢˇ ㄉㄜ˙ ㄍㄨㄢ ㄒㄧˋ ㄩˇ ㄧㄥˋ ㄩㄥˋ", emoji: "➕",
        topics: ["word", "bond", "check", "vert", "cmp", "fifteen"],
      },
      {
        id: "u5", kind: "calc", bookId: "u5", pages: "71-78",
        title: "第5單元 容量", titleBopo: "ㄉㄧˋ ㄉㄢ ㄩㄢˊ ㄖㄨㄥˊ ㄌㄧㄤˋ", emoji: "🫙",
        note: "題目照課本 p.70-78 容量的題型出（倒水比高低、用杯子量、裝得下裝不下、對不對）",
        topics: ["capPour", "capCups", "capOverflow", "capTF"],
      },
      {
        id: "u6", kind: "calc", bookId: "wb6", bookName: "習作", pages: "46-53",
        title: "第6單元 兩步驟的加減", titleBopo: "ㄉㄧˋ ㄉㄢ ㄩㄢˊ ㄌㄧㄤˇ ㄅㄨˋ ㄗㄡˋ ㄉㄜ˙ ㄐㄧㄚ ㄐㄧㄢˇ", emoji: "👣",
        note: "習作 p.46-53 原題（p.50 沒有照片）：先算、再算，再寫答",
        topics: ["twoStep", "word", "vert"],
      },
      {
        id: "m7", kind: "calc", sheetLabel: "📄 隨堂演練原題（第42、43、46、47頁）", sheetNote: "跟隨堂演練一樣的版面、題目和寫法",
        title: "第7單元 2、5、4、8的乘法", titleBopo: "ㄉㄧˋ ㄉㄢ ㄩㄢˊ ㄉㄜ˙ ㄔㄥˊ ㄈㄚˇ", emoji: "✖️",
        note: "隨堂演練 p.42、43、46、47 原題（p.44、45 沒有照片）。算式要寫「每一份的數量 × 份數」：1個盤子2個，4個盤子 → 2×4",
        topics: ["mul2548", "mulMeaning", "mulWord"],
      },
      {
        id: "m8", kind: "calc", sheetLabel: "📄 隨堂演練原題（第48～53頁）", sheetNote: "跟隨堂演練一樣的版面、題目和寫法",
        title: "第8單元 幾時幾分", titleBopo: "ㄉㄧˋ ㄉㄢ ㄩㄢˊ ㄐㄧˇ ㄕˊ ㄐㄧˇ ㄈㄣ", emoji: "🕐",
        note: "隨堂演練 p.48～53 原題：看鐘面、分針再走幾格、經過幾小時、快要／超過幾時",
        topics: ["clockRead", "clockAfter", "clockHours", "clockAbout"],
      },
      {
        id: "t99", kind: "calc", timesTable: true,
        title: "九九乘法表", titleBopo: "ㄐㄧㄡˇ ㄐㄧㄡˇ ㄔㄥˊ ㄈㄚˇ ㄅㄧㄠˇ", emoji: "✖️",
        note: "要考念九九乘法表：先在「學一學」一張一張聽、跟著念，再到「背誦過關」蓋起來念",
        topics: ["times", "timesBlank", "timesSay"],
      },
    ],
  },
};
// 目前年級的數學資料（沒有就是 null，首頁不顯示數學）
const MATH = MATH_DATA[CURRENT_GRADE] || null;
