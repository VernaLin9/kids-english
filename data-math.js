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
    ],
  },
  // 二年級上學期（南一版）：題目由 modes-math2.js 產生；kind:"calc" 用數字鍵盤／選項作答
  g2: {
    units: [
      {
        id: "u4", kind: "calc", bookId: "u4", pages: "54-63",
        title: "第4單元 加減的關係與應用", titleBopo: "ㄉㄧˋ ㄙˋ ㄉㄢ ㄩㄢˊ ㄐㄧㄚ ㄐㄧㄢˇ ㄉㄜ˙ ㄍㄨㄢ ㄒㄧˋ ㄩˇ ㄧㄥˋ ㄩㄥˋ", emoji: "➕",
        topics: ["word", "bond", "check", "vert", "cmp", "fifteen"],
      },
      {
        id: "u5", kind: "calc",
        title: "第5單元 容量", titleBopo: "ㄉㄧˋ ㄨˇ ㄉㄢ ㄩㄢˊ ㄖㄨㄥˊ ㄌㄧㄤˋ", emoji: "🫙",
        note: "課本只拍到第68頁開頭頁，題目是照容量的觀念出的；拍到後面的頁數後會照課本原題補上",
        topics: ["capPour", "capCups", "capOverflow", "capTF"],
      },
    ],
  },
};
// 目前年級的數學資料（沒有就是 null，首頁不顯示數學）
const MATH = MATH_DATA[CURRENT_GRADE] || null;
