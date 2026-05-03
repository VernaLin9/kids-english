// 再興小學一年級下學期 (114-2 / 2026 Spring) 英文單字 + 每週一句
// 資料來源：學校單字表 PDF + 每週一句 PDF

const WORDS = {
  // 玩具 Toys
  "bike":        { zh: "腳踏車",   emoji: "🚲", category: "toys" },
  "computer":    { zh: "電腦",     emoji: "💻", category: "toys" },
  "game":        { zh: "遊戲",     emoji: "🎮", category: "toys" },
  "teddy bear":  { zh: "泰迪熊",   emoji: "🧸", category: "toys" },
  "robot":       { zh: "機器人",   emoji: "🤖", category: "toys" },
  "kite":        { zh: "風箏",     emoji: "🪁", category: "toys" },

  // 顏色 Colors
  "red":         { zh: "紅色",     emoji: "🔴", category: "colors" },
  "blue":        { zh: "藍色",     emoji: "🔵", category: "colors" },
  "white":       { zh: "白色",     emoji: "⚪", category: "colors" },
  "green":       { zh: "綠色",     emoji: "🟢", category: "colors" },
  "pink":        { zh: "粉紅色",   emoji: "🌸", category: "colors" },
  "gray":        { zh: "灰色",     emoji: "🩶", category: "colors" },
  "black":       { zh: "黑色",     emoji: "⚫", category: "colors" },
  "yellow":      { zh: "黃色",     emoji: "🟡", category: "colors" },
  "orange":      { zh: "橘色",     emoji: "🟠", category: "colors" },
  "brown":       { zh: "棕色",     emoji: "🟤", category: "colors" },

  // 動物 Animals
  "bird":        { zh: "鳥",       emoji: "🐦", category: "animals" },
  "rabbit":      { zh: "兔子",     emoji: "🐰", category: "animals" },
  "turtle":      { zh: "烏龜",     emoji: "🐢", category: "animals" },
  "mouse":       { zh: "老鼠",     emoji: "🐭", category: "animals" },
  "horse":       { zh: "馬",       emoji: "🐴", category: "animals" },
  "snake":       { zh: "蛇",       emoji: "🐍", category: "animals" },
  "spider":      { zh: "蜘蛛",     emoji: "🕷️", category: "animals" },
  "frog":        { zh: "青蛙",     emoji: "🐸", category: "animals" },
  "iguana":      { zh: "鬣蜥",     emoji: "🦎", category: "animals" },
  "hamster":     { zh: "倉鼠",     emoji: "🐹", category: "animals" },

  // 身體 Body
  "hair":        { zh: "頭髮",     emoji: "💇", category: "body" },
  "mouth":       { zh: "嘴巴",     emoji: "👄", category: "body" },
  "eye":         { zh: "眼睛",     emoji: "👁️", category: "body" },
  "ear":         { zh: "耳朵",     emoji: "👂", category: "body" },
  "nose":        { zh: "鼻子",     emoji: "👃", category: "body" },
  "tooth/teeth": { zh: "牙齒",     emoji: "🦷", category: "body", speak: "tooth, teeth" },
  "toe":         { zh: "腳趾",     emoji: "🦶", category: "body" },
  "finger":      { zh: "手指",     emoji: "👆", category: "body" },
  "hand":        { zh: "手",       emoji: "✋", category: "body" },
  "foot/feet":   { zh: "腳",       emoji: "🦶", category: "body", speak: "foot, feet" },
  "arm":         { zh: "手臂",     emoji: "💪", category: "body" },
  "leg":         { zh: "腿",       emoji: "🦵", category: "body" },

  // 地方 Places
  "school":      { zh: "學校",     emoji: "🏫", category: "places" },
  "mall":        { zh: "購物中心", emoji: "🏬", category: "places" },
  "pool":        { zh: "游泳池",   emoji: "🏊", category: "places" },
  "stadium":     { zh: "體育場",   emoji: "🏟️", category: "places" },
  "lake":        { zh: "湖",       emoji: "🏞️", category: "places" },
  "beach":       { zh: "海灘",     emoji: "🏖️", category: "places" },
  "park":        { zh: "公園",     emoji: "🌳", category: "places" },

  // 大自然 Nature
  "tree":        { zh: "樹",       emoji: "🌳", category: "nature" },
  "river":       { zh: "河",       emoji: "🏞️", category: "nature" },
  "mountain":    { zh: "山",       emoji: "⛰️", category: "nature" },
  "flower":      { zh: "花",       emoji: "🌺", category: "nature" },

  // 水果 Fruits
  "banana":      { zh: "香蕉",     emoji: "🍌", category: "fruits" },
  "watermelon":  { zh: "西瓜",     emoji: "🍉", category: "fruits" },
  "pineapple":   { zh: "鳳梨",     emoji: "🍍", category: "fruits" },
  "pear":        { zh: "梨子",     emoji: "🍐", category: "fruits" },

  // 數字 Numbers
  "eleven":      { zh: "十一",     emoji: "1️⃣1️⃣", category: "numbers" },
  "twelve":      { zh: "十二",     emoji: "1️⃣2️⃣", category: "numbers" },
  "thirteen":    { zh: "十三",     emoji: "1️⃣3️⃣", category: "numbers" },
  "fifteen":     { zh: "十五",     emoji: "1️⃣5️⃣", category: "numbers" },
  "twenty":      { zh: "二十",     emoji: "2️⃣0️⃣", category: "numbers" },

  // 家具 Furniture
  "bed":         { zh: "床",       emoji: "🛏️", category: "furniture" },
  "sofa":        { zh: "沙發",     emoji: "🛋️", category: "furniture" },
  "closet":      { zh: "衣櫃",     emoji: "🚪", category: "furniture" },
  "chair":       { zh: "椅子",     emoji: "🪑", category: "furniture" },
  "table":       { zh: "桌子",     emoji: "🪟", category: "furniture" },

  // 房間 Rooms
  "bedroom":     { zh: "臥室",     emoji: "🛏️", category: "rooms" },
  "bathroom":    { zh: "浴室",     emoji: "🛁", category: "rooms" },
  "garage":      { zh: "車庫",     emoji: "🚗", category: "rooms" },
  "yard":        { zh: "院子",     emoji: "🌿", category: "rooms" },
  "living room": { zh: "客廳",     emoji: "🛋️", category: "rooms" },
  "kitchen":     { zh: "廚房",     emoji: "🍳", category: "rooms" },
};

const WEEKS = [
  { num: 1,  dateRange: "1/20-1/22", start: "2026-01-20", end: "2026-01-22", progress: "Review 1-4",         words: ["bike","computer","game","teddy bear","robot"] },
  { num: 2,  dateRange: "2/15-2/21", start: "2026-02-15", end: "2026-02-21", progress: "Review 1-4",         words: ["kite","red","blue","white"] },
  { num: 3,  dateRange: "2/22-2/28", start: "2026-02-22", end: "2026-02-28", progress: "Unit 5",             words: ["green","pink","gray","black"] },
  { num: 4,  dateRange: "3/1-3/7",   start: "2026-03-01", end: "2026-03-07", progress: "Unit 5",             words: ["yellow","orange","brown","bird"] },
  { num: 5,  dateRange: "3/8-3/14",  start: "2026-03-08", end: "2026-03-14", progress: "Unit 5/6 Quiz",      words: ["rabbit","turtle","mouse","horse"] },
  { num: 6,  dateRange: "3/15-3/21", start: "2026-03-15", end: "2026-03-21", progress: "Unit 6",             words: ["snake","spider","frog","iguana"] },
  { num: 7,  dateRange: "3/22-3/28", start: "2026-03-22", end: "2026-03-28", progress: "Unit 6/7 Quiz",      words: ["hamster","hair","mouth","eye"] },
  { num: 8,  dateRange: "3/29-4/4",  start: "2026-03-29", end: "2026-04-04", progress: "Unit 7",             words: ["ear","nose","tooth/teeth","toe"] },
  { num: 9,  dateRange: "4/5-4/11",  start: "2026-04-05", end: "2026-04-11", progress: "Unit 7/8 Quiz",      words: ["finger","hand","foot/feet","arm"] },
  { num: 10, dateRange: "4/12-4/18", start: "2026-04-12", end: "2026-04-18", progress: "Midterm (Unit 5-7)", words: [] },
  { num: 11, dateRange: "4/19-4/25", start: "2026-04-19", end: "2026-04-25", progress: "Unit 8",             words: ["leg","school","mall","pool"] },
  { num: 12, dateRange: "4/26-5/2",  start: "2026-04-26", end: "2026-05-02", progress: "Unit 8",             words: ["stadium","lake","beach","park"] },
  { num: 13, dateRange: "5/3-5/9",   start: "2026-05-03", end: "2026-05-09", progress: "Unit 8/9 Quiz",      words: ["tree","river","mountain","flower"] },
  { num: 14, dateRange: "5/10-5/16", start: "2026-05-10", end: "2026-05-16", progress: "Unit 9",             words: ["banana","watermelon","pineapple","pear"] },
  { num: 15, dateRange: "5/17-5/23", start: "2026-05-17", end: "2026-05-23", progress: "Unit 9",             words: ["eleven","twelve","thirteen","fifteen"] },
  { num: 16, dateRange: "5/24-5/30", start: "2026-05-24", end: "2026-05-30", progress: "Unit 9 Quiz",        words: ["twenty","bed","sofa","closet"] },
  { num: 17, dateRange: "5/31-6/6",  start: "2026-05-31", end: "2026-06-06", progress: "Unit 10",            words: ["chair","table","bedroom","bathroom"] },
  { num: 18, dateRange: "6/7-6/13",  start: "2026-06-07", end: "2026-06-13", progress: "Unit 10",            words: ["garage","yard","living room","kitchen"] },
  { num: 19, dateRange: "6/14-6/20", start: "2026-06-14", end: "2026-06-20", progress: "Review Unit 8-10",   words: [] },
  { num: 20, dateRange: "6/21-6/27", start: "2026-06-21", end: "2026-06-27", progress: "Final (Unit 8-10)",  words: [] },
  { num: 21, dateRange: "6/28-6/30", start: "2026-06-28", end: "2026-06-30", progress: "Review Unit 1-10",   words: [] },
];

const SENTENCES = [
  { week: 1,  en: "I feel great today.",                zh: "我今天覺得很好" },
  { week: 2,  en: "I don't feel well.",                 zh: "我覺得不太舒服" },
  { week: 3,  en: "My ___ hurts.",                      zh: "我的___痛",
    blank: { hint: "身體部位", suggest: ["head","tooth","arm","leg","foot","hand","ear","eye"] } },
  { week: 4,  en: "I feel okay now.",                   zh: "我現在覺得還好" },
  { week: 5,  en: "Can I come in?",                     zh: "我可以進來嗎?" },
  { week: 6,  en: "Can I go to my locker?",             zh: "我可以去置物櫃嗎?" },
  { week: 7,  en: "Can ___ help me?",                   zh: "___可以幫我嗎?",
    blank: { hint: "人", suggest: ["you","Mom","Dad","Teacher","he","she"] } },
  { week: 8,  en: "Can I go to the restroom?",          zh: "我可以去廁所嗎?" },
  { week: 9,  en: "Can I go get some water?",           zh: "我可以去拿水嗎?" },
  { week: 10, en: "Can ___ go with me?",                zh: "___可以跟我去嗎?",
    blank: { hint: "人", suggest: ["you","he","she","Mom","Dad"] } },
  { week: 11, en: "Just a minute.",                     zh: "等一下" },
  { week: 12, en: "I put it away.",                     zh: "我收起來了" },
  { week: 13, en: "Teacher, can I help you?",           zh: "老師，我可以幫你嗎?" },
  { week: 14, en: "I want to help!",                    zh: "我想要幫忙!" },
  { week: 15, en: "I have a question.",                 zh: "我有一個問題" },
  { week: 16, en: "Where are we going?",                zh: "我們要去哪裡?" },
  { week: 17, en: "Help, ___ hit me!",                  zh: "救命，___打我!",
    blank: { hint: "人", suggest: ["he","she","they","someone"] } },
  { week: 18, en: "He / She took my ___.",              zh: "他/她拿了我的___",
    blank: { hint: "東西", suggest: ["pencil","book","bag","toy","game"] } },
  { week: 19, en: "It's not my fault.",                 zh: "不是我的錯" },
  { week: 20, en: "I'm sorry. I didn't mean to ___.",   zh: "對不起，我不是故意___",
    blank: { hint: "動作", suggest: ["do it","push you","break it","hurt you"] } },
];

const CATEGORIES = [
  { id: "toys",      name: "玩具",     nameEn: "Toys",      emoji: "🧸", color: "#ffd6e0",
    words: ["bike","computer","game","teddy bear","robot","kite"] },
  { id: "colors",    name: "顏色",     nameEn: "Colors",    emoji: "🎨", color: "#ffe5b4",
    words: ["red","blue","white","green","pink","gray","black","yellow","orange","brown"] },
  { id: "animals",   name: "動物",     nameEn: "Animals",   emoji: "🐰", color: "#d0f4de",
    words: ["bird","rabbit","turtle","mouse","horse","snake","spider","frog","iguana","hamster"] },
  { id: "body",      name: "身體",     nameEn: "Body",      emoji: "👀", color: "#fcd5ce",
    words: ["hair","mouth","eye","ear","nose","tooth/teeth","toe","finger","hand","foot/feet","arm","leg"] },
  { id: "places",    name: "地方",     nameEn: "Places",    emoji: "🏫", color: "#cdeafe",
    words: ["school","mall","pool","stadium","lake","beach","park"] },
  { id: "nature",    name: "大自然",   nameEn: "Nature",    emoji: "🌳", color: "#b8e0d2",
    words: ["tree","river","mountain","flower"] },
  { id: "fruits",    name: "水果",     nameEn: "Fruits",    emoji: "🍌", color: "#fff5ba",
    words: ["banana","watermelon","pineapple","pear"] },
  { id: "numbers",   name: "數字",     nameEn: "Numbers",   emoji: "🔢", color: "#e0c3fc",
    words: ["eleven","twelve","thirteen","fifteen","twenty"] },
  { id: "furniture", name: "家具",     nameEn: "Furniture", emoji: "🛏️", color: "#f5d0c5",
    words: ["bed","sofa","closet","chair","table"] },
  { id: "rooms",     name: "房間",     nameEn: "Rooms",     emoji: "🚪", color: "#c1e7e3",
    words: ["bedroom","bathroom","garage","yard","living room","kitchen"] },
];
