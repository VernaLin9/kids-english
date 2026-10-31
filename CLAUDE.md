# kids-english — 再興小學英文・國語複習網站

給一年級、二年級小孩在平板／手機上複習用的靜態網站，部署在 GitHub Pages：
https://vernalin9.github.io/kids-english/ （合併到 `main` 後約 1-2 分鐘更新）

## 使用者與設計原則
- 使用者是國小一、二年級的小孩，**用平板或手機**，不用電腦。家長用「家長模式」管理。
- 小孩看不懂的國字一定要有注音：畫面上所有國字都會自動加注音（`autoBopo` MutationObserver），
  新增介面文字時，字要查得到 `CHAR_BOPO`（data.js），查不到就補。
- 注音標法照台灣課本：ˊˇˋ 在**最後一個注音符號右上角**，輕聲 ˙ 在**最上方**（教育部《國語注音符號手冊》調號說明；`bopoColEl`）。
  國語課本會標變調（例：一朵 ㄧˋ），國語資料照課本標。
- 按鈕至少 44px；版面不能左右捲動；白色卡片＋淡色邊框為主，顏色只留給主要按鈕。
- 家長偏好：回覆用繁體中文、直接、不要客套；英數字與中文不加空格；括弧用半形。

## 檔案
| 檔案 | 內容 |
|---|---|
| `index.html` | 載入順序：data-g1 → data → data-zh → data-math → app → modes-guard → modes-play → modes-extra → modes-zh → modes-tone → modes-bopo → modes-zh2 → modes-games → modes-learn → modes-blocks → modes-quest → modes-night → modes-math → modes-math2 → modes-sheet → parent。改 JS/CSS 後要更新 `?v=` 版本號，避免平板讀到快取的舊檔；app.js 結尾 `checkNewVersion()` 打開網頁、切回網頁、每 3 分鐘抓最新 index.html，版本號不同就自動重新載入（家長要求強制更新） |
| `data-g1.js` | 一年級英文 `GRADE1`（115-1：字母 A-Z、Unit 0-4、每週一句 20 句） |
| `data.js` | 二年級英文 `GRADE2`（115-1，144 字）、`GRADES` 年級切換、`CHAR_BOPO` 注音表、`MOVEMENT_BREAKS` |
| `data-zh.js` | 國語 `ZH_DATA`（一年級第六課〈謝謝老師〉課文 + 18 個複習詞；第七課〈龜兔賽跑〉習作 p.62-69：`symbols` 符號、`text` 猜謎（`textTitle` 自訂標題）、29 個詞、`sentences` 連句子；第八課〈拔蘿蔔〉聽寫本 18 題，第 8 題 ㄨㄢˇ ㄒㄩㄥˊ 國字待確認放在 `pending`，沒有課文 `text: []`）。課有 `exam:{date,label,mode}` 首頁會出提醒卡（mode `lesson` 進課的頁面）。二年級 `ZH_DATA.g2`：第六課〈從自己開始〉`kind:"chars"`，課文照課本分段 `{ para:"一", zh, bopo }`（p.48-50 共四段），便條 `{ note, lines:[{zh,bopo,right?}] }`（p.51 照課本分行）；`chars` 18 個生字 `{ zh, bopo, radical, extra 部首外筆畫, strokes 總筆畫, word, wordBopo, confuse 長得像的字 }`（照課本 p.52）、`words` 詞語、`text` 課文 |
| `data-math.js` | 數學 `MATH_DATA`（一年級上 第 3 回：比長短、高矮與厚薄；只列單元與題型，題目由程式隨機畫）。二年級 `MATH_DATA.g2`（南一二上）：第4單元 加減的關係與應用（`bookId:"u4"` 課本原題 p.54-63）、第5單元 容量（只有 p.68 開頭頁，題目照觀念出，待補課本頁）；`kind:"calc"` 的單元交給 modes-math2 |
| `modes-math.js` | 數學：SVG 畫圖題（直線曲線、比長短、比高矮、比厚薄、三個比一比、對不對）、小考混合 12 題；`MATH_TOPICS` 每個題型一個 `gen()`，回傳 `{ prompt, items:[{node, correct}], tf? }`。`SHEET_U2` 是評量卷原題（p.6-7，六大題 22 小題；老師會考一模一樣的題目，所以版面和作答方式都照原卷：在 (　) 裡打 ✓／畫 ○、把圖圈起來、方框打 ✓✗，寫完按「交卷」照卷子配分算得分），`renderMathSheet()` 一頁顯示整張卷子 |
| 📝 模擬小考 | 一年級數學每個原題卷單元都有（`#/mathplay/exam?u=`，modes-math.js `mockGate`/`mockResult`）：先看說明按「開始考試」才出題，交卷才看分數，顯示用了多久、跟上次比、每一大題得分；圈圈看／填代號／三欄連連看的圖會換位置（`fsShuffled`，考觀念不是背位置）。紀錄存 `profile.mockExams["math:單元"]`（最近 20 次），單元頁和家長模式小孩頁看得到。考試提醒 `exam.mode:"exam"` 會直接開模擬小考 |
| `modes-math2.js` | 二年級數學：題目 `{ text, visual, steps:[choice|num|pick3], hint, topic|page, calc? }`，一題的畫面是 `mountMath2Q(q, container, onDone)`（練習和遊戲共用），數字鍵盤作答、線段圖 `barModel`、分合圖 `bondEl`、直式 `vertEl`。`MATH2_TOPICS`：解題、加減的關係、驗算、直式加減、大於小於等於、神機妙算（3 張湊 15）、容量 4 種。`BOOK_U4` 是課本原題（p.54-67，照頁碼、數字、順序、題目文字），`BOOK_U5` 是第5單元容量 p.71-78 能用文字表達的原題 |
| `modes-sheet.js` | 📄 要填數字／連連看的原題卷（`FILL_SHEETS`，`renderFillSheet`）：一上第9回小A本 p.18-19（4-3 0的認識、4-4 分與合，照片 Drive「一年級數學小A本」IMG_8819）。(　)／□ 點一下跳出 0～10 數字鍵、連連看先點上面再點下面畫線，交卷照原卷配分（共 100 分）。圖的數量照照片（湯圓 9/5/0、番茄 3/0/2、串好的香腸 4/1/0）。另外加了第9回的練習題型 `MATH_TOPICS.split/make10/zero`（不是原題）。一上第10回小A本 p.20-21（5-1 堆疊與分類、5-2 認識形狀，照片 IMG_5099）：`kind:"circle"` 圈圈看（可圈好幾個，每小題全對才給分）、`codes` 填代號（點方框跳出 ㄅ～ㄌ 可複選）、`match3` 三欄連連看（左右的東西連到中間的形狀）；圖畫在 `FS10`（SVG 不放國字），第四大題圖形照照片大小方向 `fsShape`；練習題型 `shapeName/shapeTrace/shapeRoll`。單元有 `sheetLabel` 就顯示在單元頁 |
| `app.js` | 共用工具、STORE（localStorage `partygo:store:v1`）、注音元件、首頁、設定面板、間隔重複、考前範圍 `nextExam()`、拆音節 `SYLLABLES` |
| `modes-guard.js` | 🛡️ 認真作答（家長：小孩會亂點、點到對就按下一題）：document 層攔截所有選項（`GUARD_OPT`：.zh-opt、.quiz-option、.m-item、.tp-opt…；考卷 `.ws` 和計時遊戲 `#/game/` 不套）。新題目出來 1 秒內點不算（提醒＋記「太快亂點」）；答錯（選項被加上 --bad/--wrong）→ 選項停 2.5 秒、跳出「💡 小技巧」`guardTip()`（照頁面給怎麼想、怎麼記的白話短句＋🔊），同一題再錯停 4 秒並念出小技巧；1.5 秒內作答在學習紀錄標「太快」。新增選擇題時，選項 class 要在 `GUARD_OPT` 裡、答錯要加 --bad，且答錯後不能直接跳下一題（要自己再選對；英文選擇題／聽力已改成這樣） |
| `modes-bopo.js` | 🔤 注音總複習・大會考（一年級期中考考全部 37 個注音，`#/bopo`，國語首頁入口）：`BP_WORDS` 每個注音一個代表詞（注音照教育部）、`BP_PAIR_TIPS` 容易搞混的怎麼分（ㄅㄆ 送不送氣、ㄓㄗ 翹不翹舌…）。練習 `#/bopo/init|final|tone|word`（聲母 21、韻母 16 全部、聲調、聽詞選注音），答錯要自己再選對並出現「📌 記一記」，錯的 3 題後再考；`#/bopo/chart` 37 個注音表；`#/bopo/exam` 模擬考 25 題（聲母 8、韻母 8、聲調 5、聽詞 4，每題 4 分），選好按「下一題」才換（一定要作答、不能跳過），交卷後列出錯題和記法，紀錄 `profile.mockExams["zh:bopo"]` |
| 📋 學習紀錄 | `logAnswer()`（app.js）在 recordWord／recordZh／recordMath 和聲調特訓每次作答記一筆到 `profile.log`（`[時間, 科目, 頁面hash, 題目, 對1/錯0/亂點-1, 間隔ms, 太快1/0]`，留 4000 筆；答錯後改對不重算）。家長模式小孩頁 →「📋 學習紀錄」`#/parent/log/<名字>?days=7|30|90`：照日期、每一次練習（同一頁、間隔 15 分鐘內）列題數、答對率、⚡太快次數、❌錯的題目，模擬考分數也列在裡面 |
| 📝 二年級模擬小考 | 國語每課 `#/zhplay/exam?l=`（選國字 10、部首 5、筆畫 5）、英文考試範圍 `#/play/mock?set=`（看中文選英文 10、聽音選英文 10，首頁「下次考試」卡有按鈕）都用 `renderChoiceExam(cfg)`（modes-math.js：一題一題選，選好按「下一題」才換、不能跳過，交卷列出你選的／答案／📌怎麼記；紀錄 `profile.mockExams["zh:L6"]`、`["en:<setKey>"]`）。數學 `#/mathplay/exam?u=` `renderMath2Exam`：課本原題 10＋練習題 10，`mountMath2Q(..., exam=true)` 不給提示、答錯直接下一題，錯題附提示和 🧱 積木。數學數字鍵答錯也會鎖住出小技巧（`guardOnWrong(box, true)`）；手寫題「寫好了」要先在畫布寫字（`inkGate(pen, fn)`，`setupCanvas` 有 `ink()`） |
| `modes-play.js` | 自選複習、單字卡、選擇題、聽力、字母拼拼樂、翻牌配對、跟著念 |
| `modes-extra.js` | 手寫（描寫／默寫）、每週一句 |
| `modes-zh.js` | 國語（一年級注音課）：注音卡、聽音選注音、加聲調、拼注音（聽寫）、寫注音、連句子（課有 `sentences` 才出現）；`kind:"chars"` 的課轉給 modes-zh2 |
| `modes-tone.js` | 📍 聲調放哪裡（一年級特訓，`#/tonedrill`，國語首頁入口＋每課「聲調位置」）：放聲調（點虛線框）、哪個對（三種寫法選一）、抓錯字（詞裡有一個字放錯），一輪 12 題，錯的 2 題後再考，上次錯的下一輪先考；位置選項有「右上角（對）／右下角（錯）」。✍️ 手寫過關考 `renderToneWrite`：用手指在畫布寫聲調，`twShape` 判斷形狀（˙ 小點、ˇ 中間低、ˊ 往右上、ˋ 往右下）、`twPos` 判斷位置，10 題第一次就寫對 8 題過關；紀錄 `profile.toneDrill`（`writeBest`/`writePass`） |
| `modes-blocks.js` | 🧱 積木圖解（數學要用圖理解，不是只看文字）：`blocksSteps({op,a,b})` 一位數用十格框（湊十法、破十法），兩位數用十條＋小方塊（進位＝10 個換 1 條、退位＝1 條拆 10 個），一步一步按「下一步」、每步有 🔊。`openBlocksTeach(calc)` 跳出來看；二年級每題下面都有「🧱 用積木看」（`mountMath2Q` 用 `calcOf(q)` 找算式） |
| `modes-zh2.js` | 國語（二年級生字課）：生字卡、聽寫國字（看→蓋→寫→對）、選國字（長得像的字四選一，選項用 `data-nobopo` 不自動加注音）、部首、筆畫數（總筆畫＋部首外筆畫）、小考 |
| `modes-games.js` | 🎮 遊樂場（首頁英文／國語／數學分頁都有入口，`#/games?s=en|zh|math`）：打地鼠、戳氣球、兔子賽跑（計時挑戰，只給英文／國語；數學不放計時遊戲；賽車家長覺得無聊已拿掉）。題目由 `makeQuestionGen(subject)` 產生四選一：英文用本週＋前兩週＋答錯的字，一年級國語用注音詞（`bopoVariants` 當干擾）、二年級用生字（`confuse`），數學用 `makeMathGen()`（一年級 10 以內加減、二年級兩位數加減／大於小於等於／湊 15）。最高分存 `profile.games[gameId][subject]`，分數÷50 換 ⭐，結束畫面依分數給 1-3 顆星（`STAR_LEVELS`）。每個遊戲有自己的場景（草地、天空、跑道、路邊樹），答對冒分數和彩色碎片（`fxHit`），答錯冒 ✗（`fxMiss`）。計時器都用 `gameShell` 的 `every/after/afterPlay`，離開頁面自動停、暫停時不跑。右上 ⏸ 暫停鍵（`pause(on, why)`，答錯教學和暫停鍵分開記）：不擋畫面，只在上面一條提示，點了答案自動繼續。數學比較慢：氣球 22-28 秒、烏龜 130-170 秒跑完、賽車 13-16 秒到門、地鼠待 5 秒 |
| `modes-learn.js` | 🧠 遊樂場的學習引擎（家長要求：遊戲不能只是考試，要幫助記憶、教記憶方法）：每局只挑 6 個專注組（先挑答錯過、還沒學會的）重複出現；開始前「先學一學」卡片（圖、聲音、記憶小撇步：英文拍手分段念、注音拼一拼、生字拆字 `ZH2_MNEMONIC`、數學算法步驟）；第一次答錯暫停遊戲跳「記一記」卡，2 題後再考同一個；結束畫面列出要再記的並教一招 `MEMORY_TECHNIQUES`。小撇步要白話、短句，每段都有 🔊 朗讀（`tipEl`/`mathStepsEl`/`sayable` 把 +−= 換成字）；數學說明是一行一步的陣列。遊戲用 `makeLearnSession` / `learnFirst` / `teachMiss` / `learnSummary`，`gameShell` 有 `pause()` |
| `modes-quest.js` | 🎮 遊戲（家長要求：不用時間逼、要跟著每一課、幫助記憶）。`#/games?s=&c=` 先選章節（英文＝週 `week-N`、國語＝課、數學＝單元；預設是要考的那一課），每一課／單元／週的頁面都有「🎮 用遊戲練這一課」（`questEntryBtn`）。題庫 `questDeck(subject, c)`：英文／國語四選一 `mountChoiceCard`（答錯先看圖卡＋小撇步再選），數學直接用單元自己的圖形題（`mountMath2Q`／`mountMathQ`，有 onWrong），錯的 2 題後再出。學習遊戲（不計時）：🌀 陀螺對戰 `#/quest/top`（答對攻擊，第一次答對＝必殺技，改對也有攻擊，贏了解鎖新陀螺 `profile.quest.topWins`）、🐾 養寵物 `#/quest/pet`（教寵物一題餵一次，錯的存 `pet.memory` 明天先問＝間隔重複，請孩子念給寵物聽＝教學者效應，`profile.quest.pet`）、🗺️ 記憶地圖 `#/mindmap`（生字照部首、英文照類別、注音詞照聲調分群，可遮起來考自己）、🧱 積木教室 `#/blocks`（數學加減單元）。計時遊戲放在「練熟了再挑戰」，也只出那一章 |
| `modes-night.js` | 🏮 夜市遊戲（不計時，`#/night/ring|fish|claw?s=&c=`）：套圈圈、撈金魚（金魚慢慢游、不會游走）、夾娃娃。一輪一題四選一，答對拿彩票（第一次對 2 張、改對 1 張），答錯先看「記一記」（數學是 🧱 積木）再選，錯的 2 輪後再出；10 輪後 3 張彩票換 1 個獎品（`profile.quest.prizes` 獎品櫃）。數學只在加減單元（u4）出現 |
| `parent.js` | 家長模式（PIN、每個小孩的年級／切換／統計）、router `route()` |

## 資料格式
- 英文單字：`"word": { zh, bopo, emoji, category, speak? }`，`bopo` 每個國字一段、空白分隔，數量必須等於國字數。
- 週次：`{ num, dateRange, start, end, progress, words }`；`progress` 寫 `Unit N Quiz N` / `Midterm (Unit a-b)` 讓 `nextExam()` 找到考試範圍。
- 年級存在每個小孩的 `profile.grade`（g1/g2），載入時決定全域 `WORDS/WEEKS/UNITS/SENTENCES/CATEGORIES`，換年級會重新載入頁面。
- 國語進度存在 `profile.zhProgress`，英文在 `profile.progress`（含間隔重複的 `box/due/lastDay`）。

## 語音
- 國語 `speakZh()`、英文 `speak()` 都用 Google 翻譯的聲音 `speakGoogle(text, tl)`（`tl=zh-TW` 台灣國語、`tl=en` 英文），平板還沒解鎖播放時先記住、點一下畫面再用 Google 念（不換成平板聲音）；國語，長句照標點切段；連不到或播放失敗就退回平板內建的台灣聲音（`speakZhDevice`，只找 zh-TW、絕不退回大陸聲音），一分鐘後再試 Google。iPad 要使用者先點一下畫面才能自動播放（第一次 pointerdown 解鎖）。
- 念之前 `zhSpeechText()`（modes-zh.js）整理文字，只影響聲音：多音字照畫面上的注音念（先找資料裡有標注音的詞句 `zhSayBopo`，找不到用 `autoReadings`），Google 會念錯的讀法在 `ZH_SAY_FIX` 換同音字（課本連接詞「和」ㄏㄢˋ→汗、數數 ㄕㄨˇ→鼠、長大 ㄓㄤˇ→掌…；新增多音字詞時要確認這裡有沒有）；符號 `zhSaySymbols`：注音和表情符號拿掉、＿＿ 變停頓、□ 念方框、(　) 念括弧、＋−＝＞＜ 念成字、①念「第1題」、11/2 念「11月2日」。國語句子裡夾的英文單字（兩個字母以上）`zhSplitLang` 分段改用英文聲音念。注音卡的子音用同音國字念（`ZH_SYMBOL_SAY`：ㄅ玻、ㄍ哥、ㄓ知…）。
- 台灣和大陸讀法不同的字，念之前在 `ZH_TW_READING` 換成台灣讀法的同音字（例：垃圾→樂色，念 ㄌㄜˋ ㄙㄜˋ），畫面文字不變。新增課文遇到讀法不同的字就加進這個表。
- 英文 `speak()`／國語 `speakZhDevice()` 用 `pickEnVoice`／`pickZhVoice` 挑聲音，排除 iPhone／iPad 的機器人聲音 `ODD_VOICES`（Albert、Bad News、Eddy、Flo、Grandma…，排在清單前面），英文優先 Samantha／Ava，國語優先美佳；iOS 用靜音音檔真的播一次才算解鎖（不然自動念題目會一下 Google 一下平板聲音）；`speakUtterance` 在 cancel 後等一下再念（iOS 會吃掉）。
- 這個環境連不到 Google，測試時要 `page.route('**/translate.google.com/**', r => r.abort())`，console 會出現 ERR_FAILED（正常）。

## 自動注音的多音字與變調
- `autoReadings()`（app.js）：先查 `PHRASE_BOPO`（data.js，照詞決定多音字，例：比較長 ㄔㄤˊ、長大 ㄓㄤˇ、倒水 ㄉㄠˋ、部分 ㄅㄨˋ ㄈㄣˋ），再查 `CHAR_BOPO` 單字，最後照課本標「一」「不」變調（一個 ㄧˊ、一枝 ㄧˋ、不對 ㄅㄨˊ；第一、一年級、一上、一聲等序數不變）。
- 課本連接詞「和」讀 ㄏㄢˋ、「個」讀 ˙ㄍㄜ。新增介面文字有多音字時，要在 PHRASE_BOPO 加詞。

## 新增資料時
- 新學期／新年級單字表：照 `data-g1.js` 的 IIFE 格式新增，週次日期要對 PDF。
- 國語新的一課：一年級在 `ZH_DATA.g1.lessons` 加 `{ id, title, titleBopo, emoji, text, words }`；二年級在 `ZH_DATA.g2.lessons` 加 `{ id, kind:"chars", chars, words, text }`，注音、部首、筆畫照課本逐字核對。
- 數學新的單元：二年級在 `MATH_DATA.g2.units` 加 `{ id, kind:"calc", title, titleBopo, emoji, topics }`，題型加在 `MATH2_TOPICS`；一年級在 `MATH_DATA.g1.units` 加 `{ id, title, titleBopo, emoji, topics }`；新題型在 `modes-math.js` 的 `MATH_TOPICS` 加 `gen()`，用 SVG 畫、點圖作答，畫面文字要能查到 `CHAR_BOPO`。
- 考卷（原題卷、模擬小考）每一題都要寫完才能交卷，沒寫的標黃色 `.fs-need` 並捲過去。
- 數學／國語進度分別存在 `profile.mathProgress`、`profile.zhProgress`；科目分頁記在 `profile.subject`（en/zh/math）。
- 中文翻譯是自己配的，交付時要跟家長說明哪些可能需要確認。
- **多音字、變調、標點、順序一律照家長拍的課本照片**（小孩會跟著學、考試照課本）。一年級國語課本只有注音沒有國字：課文用 `bopoOnly: true` 只顯示注音；聽寫詞的國字是配的，照片上看不到的國字放 `pending`。
- 照片核對（2026-10-23 全面核對過一次）：上傳照片在對話 uploads，二年級數學課本在 Drive「數學-二上-南一」（IMG_8771＝p.52-53、8772～8781＝p.54～63、8782～8801＝p.64～83）。

## 測試（沒有建置步驟，也沒有測試框架）
- `python3 -m http.server 8765` 後用 Playwright（`/opt/node-tools/node_modules/playwright`，Chromium 在 `/opt/pw-browsers/chromium`）開 `http://localhost:8765/index.html`。
- 每次改動至少檢查：沒有 console 錯誤、375×667 / 390×844 / 768×1024 / 1024×768 不會左右捲動、
  一年級和二年級所有頁面沒有「沒注音的國字」（掃 `.zh-pair` 的空注音與沒包起來的中文字）。
- 這個環境連不到 `vernalin9.github.io`，線上結果要請家長確認。

## 照片來源
- 家長把課本照片放在 Google Drive「kids-english」資料夾（`1MvaeRwPrCHFi99sXUIAH_lEas5OerwUq`），底下分「一年級／二年級」→「國語／數學／英文」。
- iPhone 的 HEIC 照片：環境沒有 HEIC 解碼器、也連不到 pip/npm，用 `tools/heic2jpg.py`（自己解析 HEIF grid，再用 ffmpeg 的 HEVC 解碼拼圖）轉成 JPG。

## 流程
- 在 `claude/grade1-to-grade2-vocab-wtgb2j` 分支開發 → push → 開 PR；合併由家長在 GitHub 按（環境不允許自動合併）。
- PR 合併後，下一個改動要從最新 `main` 重開同名分支。
