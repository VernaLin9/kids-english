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
};
// 目前年級的數學資料（沒有就是 null，首頁不顯示數學）
const MATH = MATH_DATA[CURRENT_GRADE] || null;
