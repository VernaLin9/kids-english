// 數學複習資料（依年級分）
// 一年級上學期 第3回：2-1 比長短、2-2 高矮與厚薄（評量卷 p.6-7）
// 題目由 modes-math.js 依主題隨機畫圖產生，不是固定題庫
const MATH_DATA = {
  g1: {
    units: [
      {
        id: "u2", title: "第3回 比長短・高矮與厚薄", titleBopo: "ㄉㄧˋ ㄙㄢ ㄏㄨㄟˊ ㄅㄧˇ ㄔㄤˊ ㄉㄨㄢˇ ㄍㄠ ㄞˇ ㄩˇ ㄏㄡˋ ㄅㄛˊ", emoji: "📏",
        exam: { date: "2026-10-13", label: "小考 第6、7頁", mode: "sheet" },
        topics: ["line", "length", "height", "thick", "most", "tf"],
      },
      {
        // 小A本 第9回 p.18-19（照片 Drive「一年級數學小A本」IMG_8819），老師會考一模一樣的題目
        id: "u4", title: "第9回 0的認識・分與合", titleBopo: "ㄉㄧˋ ㄐㄧㄡˇ ㄏㄨㄟˊ ㄌㄧㄥˊ ㄉㄜ˙ ㄖㄣˋ ㄕˋ ㄈㄣ ㄩˇ ㄏㄜˊ", emoji: "🔀",
        exam: { date: "2026-10-27", label: "小考 小A本第18、19頁", mode: "sheet" },
        sheetLabel: "📄 小A本原題（第18、19頁）", sheetNote: "跟小A本一樣的題目、圖和配分",
        topics: ["split", "make10", "zero"],
      },
      {
        // 小A本 第10回 p.20-21（照片 Drive「一年級數學小A本」IMG_5099），老師會考一模一樣的題目
        id: "u5", title: "第10回 堆疊與分類・認識形狀", titleBopo: "ㄉㄧˋ ㄕˊ ㄏㄨㄟˊ ㄉㄨㄟ ㄉㄧㄝˊ ㄩˇ ㄈㄣ ㄌㄟˋ ㄖㄣˋ ㄕˋ ㄒㄧㄥˊ ㄓㄨㄤˋ", emoji: "🔺",
        exam: { date: "2026-11-02", label: "小考 小A本第20、21頁", mode: "exam" },
        sheetLabel: "📄 小A本原題（第20、21頁）", sheetNote: "跟小A本一樣的題目、圖和配分",
        topics: ["shapeName", "shapeTrace", "shapeRoll"],
      },
    ],
  },
  // 二年級上學期（南一版）：題目由 modes-math2.js 產生；kind:"calc" 用數字鍵盤／選項作答
  g2: {
    units: [
      {
        id: "u4", kind: "calc", bookId: "u4", pages: "54-67",
        title: "第4單元 加減的關係與應用", titleBopo: "ㄉㄧˋ ㄙˋ ㄉㄢ ㄩㄢˊ ㄐㄧㄚ ㄐㄧㄢˇ ㄉㄜ˙ ㄍㄨㄢ ㄒㄧˋ ㄩˇ ㄧㄥˋ ㄩㄥˋ", emoji: "➕",
        topics: ["word", "bond", "check", "vert", "cmp", "fifteen"],
      },
      {
        id: "u5", kind: "calc", bookId: "u5", pages: "71-78",
        title: "第5單元 容量", titleBopo: "ㄉㄧˋ ㄨˇ ㄉㄢ ㄩㄢˊ ㄖㄨㄥˊ ㄌㄧㄤˋ", emoji: "🫙",
        note: "題目照課本 p.70-78 容量的題型出（倒水比高低、用杯子量、裝得下裝不下、對不對）",
        topics: ["capPour", "capCups", "capOverflow", "capTF"],
      },
    ],
  },
};
// 目前年級的數學資料（沒有就是 null，首頁不顯示數學）
const MATH = MATH_DATA[CURRENT_GRADE] || null;
