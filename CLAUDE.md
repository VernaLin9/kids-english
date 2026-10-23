# kids-english — 再興小學英文・國語複習網站

給一年級、二年級小孩在平板／手機上複習用的靜態網站，部署在 GitHub Pages：
https://vernalin9.github.io/kids-english/ （合併到 `main` 後約 1-2 分鐘更新）

## 使用者與設計原則
- 使用者是國小一、二年級的小孩，**用平板或手機**，不用電腦。家長用「家長模式」管理。
- 小孩看不懂的國字一定要有注音：畫面上所有國字都會自動加注音（`autoBopo` MutationObserver），
  新增介面文字時，字要查得到 `CHAR_BOPO`（data.js），查不到就補。
- 注音標法照台灣課本：ˊˇˋ 在**最後一個注音符號右邊**，輕聲 ˙ 在**最上方**（`bopoColEl`）。
  國語課本會標變調（例：一朵 ㄧˋ），國語資料照課本標。
- 按鈕至少 44px；版面不能左右捲動；白色卡片＋淡色邊框為主，顏色只留給主要按鈕。
- 家長偏好：回覆用繁體中文、直接、不要客套；英數字與中文不加空格；括弧用半形。

## 檔案
| 檔案 | 內容 |
|---|---|
| `index.html` | 載入順序：data-g1 → data → data-zh → data-math → app → modes-play → modes-extra → modes-zh → modes-zh2 → modes-games → modes-math → modes-math2 → parent。改 JS/CSS 後要更新 `?v=` 版本號，避免平板讀到快取的舊檔 |
| `data-g1.js` | 一年級英文 `GRADE1`（115-1：字母 A-Z、Unit 0-4、每週一句 20 句） |
| `data.js` | 二年級英文 `GRADE2`（115-1，144 字）、`GRADES` 年級切換、`CHAR_BOPO` 注音表、`MOVEMENT_BREAKS` |
| `data-zh.js` | 國語 `ZH_DATA`（一年級第六課〈謝謝老師〉課文 + 18 個複習詞；第七課〈龜兔賽跑〉習作 p.62-69：`symbols` 符號、`text` 猜謎（`textTitle` 自訂標題）、29 個詞、`sentences` 連句子；第八課〈拔蘿蔔〉聽寫本 18 題，第 8 題 ㄨㄢˇ ㄒㄩㄥˊ 國字待確認放在 `pending`，沒有課文 `text: []`）。課有 `exam:{date,label,mode}` 首頁會出提醒卡（mode `lesson` 進課的頁面）。二年級 `ZH_DATA.g2`：第六課〈從自己開始〉`kind:"chars"`，`chars` 18 個生字 `{ zh, bopo, radical, extra 部首外筆畫, strokes 總筆畫, word, wordBopo, confuse 長得像的字 }`（照課本 p.52）、`words` 詞語、`text` 課文 |
| `data-math.js` | 數學 `MATH_DATA`（一年級上 第 3 回：比長短、高矮與厚薄；只列單元與題型，題目由程式隨機畫）。二年級 `MATH_DATA.g2`（南一二上）：第4單元 加減的關係與應用（`bookId:"u4"` 課本原題 p.54-63）、第5單元 容量（只有 p.68 開頭頁，題目照觀念出，待補課本頁）；`kind:"calc"` 的單元交給 modes-math2 |
| `modes-math.js` | 數學：SVG 畫圖題（直線曲線、比長短、比高矮、比厚薄、三個比一比、對不對）、小考混合 12 題；`MATH_TOPICS` 每個題型一個 `gen()`，回傳 `{ prompt, items:[{node, correct}], tf? }`。`SHEET_U2` 是評量卷原題（p.6-7，六大題 22 小題；老師會考一模一樣的題目，所以版面和作答方式都照原卷：在 (　) 裡打 ✓／畫 ○、把圖圈起來、方框打 ✓✗，寫完按「交卷」照卷子配分算得分），`renderMathSheet()` 一頁顯示整張卷子 |
| `modes-math2.js` | 二年級數學：題目 `{ text, visual, steps:[choice|num|pick3], hint, topic|page }`，數字鍵盤作答、線段圖 `barModel`、分合圖 `bondEl`、直式 `vertEl`。`MATH2_TOPICS`：解題、加減的關係、驗算、直式加減、大於小於等於、神機妙算（3 張湊 15）、容量 4 種。`BOOK_U4` 是課本原題（照頁碼、數字、順序） |
| `app.js` | 共用工具、STORE（localStorage `partygo:store:v1`）、注音元件、首頁、設定面板、間隔重複、考前範圍 `nextExam()`、拆音節 `SYLLABLES` |
| `modes-play.js` | 自選複習、單字卡、選擇題、聽力、字母拼拼樂、翻牌配對、跟著念 |
| `modes-extra.js` | 手寫（描寫／默寫）、每週一句 |
| `modes-zh.js` | 國語（一年級注音課）：注音卡、聽音選注音、加聲調、拼注音（聽寫）、寫注音、連句子（課有 `sentences` 才出現）；`kind:"chars"` 的課轉給 modes-zh2 |
| `modes-zh2.js` | 國語（二年級生字課）：生字卡、聽寫國字（看→蓋→寫→對）、選國字（長得像的字四選一，選項用 `data-nobopo` 不自動加注音）、部首、筆畫數（總筆畫＋部首外筆畫）、小考 |
| `modes-games.js` | 🎮 遊樂場（首頁英文／國語／數學分頁都有入口，`#/games?s=en|zh|math`）：打地鼠（60 秒）、戳氣球（3 條命，氣球 9-13 秒才飄完，小朋友反應原本太快）、兔子賽跑（10 題贏烏龜）、賽車（15 個拱門，點車道開進對的答案，連續答對變快）。題目由 `makeQuestionGen(subject)` 產生四選一：英文用本週＋前兩週＋答錯的字，一年級國語用注音詞（`bopoVariants` 當干擾）、二年級用生字（`confuse`），數學用 `makeMathGen()`（一年級 10 以內加減、二年級兩位數加減／大於小於等於／湊 15）。最高分存 `profile.games[gameId][subject]`，分數÷50 換 ⭐。計時器都用 `gameShell` 的 `every/after`，離開頁面自動停 |
| `parent.js` | 家長模式（PIN、每個小孩的年級／切換／統計）、router `route()` |

## 資料格式
- 英文單字：`"word": { zh, bopo, emoji, category, speak? }`，`bopo` 每個國字一段、空白分隔，數量必須等於國字數。
- 週次：`{ num, dateRange, start, end, progress, words }`；`progress` 寫 `Unit N Quiz N` / `Midterm (Unit a-b)` 讓 `nextExam()` 找到考試範圍。
- 年級存在每個小孩的 `profile.grade`（g1/g2），載入時決定全域 `WORDS/WEEKS/UNITS/SENTENCES/CATEGORIES`，換年級會重新載入頁面。
- 國語進度存在 `profile.zhProgress`，英文在 `profile.progress`（含間隔重複的 `box/due/lastDay`）。

## 語音
- 國語語音 `speakZh()`（modes-zh.js）只用台灣聲音（zh-TW／名稱含 Taiwan、臺灣、美佳等），每次重找、找不到就只設 lang=zh-TW，絕不退回大陸聲音。
- 台灣和大陸讀法不同的字，念之前在 `ZH_TW_READING` 換成台灣讀法的同音字（例：垃圾→樂色，念 ㄌㄜˋ ㄙㄜˋ），畫面文字不變。新增課文遇到讀法不同的字就加進這個表。

## 新增資料時
- 新學期／新年級單字表：照 `data-g1.js` 的 IIFE 格式新增，週次日期要對 PDF。
- 國語新的一課：一年級在 `ZH_DATA.g1.lessons` 加 `{ id, title, titleBopo, emoji, text, words }`；二年級在 `ZH_DATA.g2.lessons` 加 `{ id, kind:"chars", chars, words, text }`，注音、部首、筆畫照課本逐字核對。
- 數學新的單元：二年級在 `MATH_DATA.g2.units` 加 `{ id, kind:"calc", title, titleBopo, emoji, topics }`，題型加在 `MATH2_TOPICS`；一年級在 `MATH_DATA.g1.units` 加 `{ id, title, titleBopo, emoji, topics }`；新題型在 `modes-math.js` 的 `MATH_TOPICS` 加 `gen()`，用 SVG 畫、點圖作答，畫面文字要能查到 `CHAR_BOPO`。
- 數學／國語進度分別存在 `profile.mathProgress`、`profile.zhProgress`；科目分頁記在 `profile.subject`（en/zh/math）。
- 中文翻譯是自己配的，交付時要跟家長說明哪些可能需要確認。

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
