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
| `index.html` | 載入順序：data-g1 → data → data-zh → data-math → app → modes-play → modes-extra → modes-zh → modes-math → parent。改 JS/CSS 後要更新 `?v=` 版本號，避免平板讀到快取的舊檔 |
| `data-g1.js` | 一年級英文 `GRADE1`（115-1：字母 A-Z、Unit 0-4、每週一句 20 句） |
| `data.js` | 二年級英文 `GRADE2`（115-1，144 字）、`GRADES` 年級切換、`CHAR_BOPO` 注音表、`MOVEMENT_BREAKS` |
| `data-zh.js` | 國語 `ZH_DATA`（一年級第六課〈謝謝老師〉課文 + 18 個複習詞；第 7 題「數一數」待家長確認） |
| `data-math.js` | 數學 `MATH_DATA`（一年級上 第 3 回：比長短、高矮與厚薄；只列單元與題型，題目由程式隨機畫） |
| `modes-math.js` | 數學：SVG 畫圖題（直線曲線、比長短、比高矮、比厚薄、三個比一比、對不對）、小考混合 12 題；`MATH_TOPICS` 每個題型一個 `gen()`，回傳 `{ prompt, items:[{node, correct}], tf? }`。`SHEET_U2` 是評量卷原題（p.6-7，六大題 22 小題；老師會考一模一樣的題目，所以版面和作答方式都照原卷：在 (　) 裡打 ✓／畫 ○、把圖圈起來、方框打 ✓✗，寫完按「交卷」照卷子配分算得分），`renderMathSheet()` 一頁顯示整張卷子 |
| `app.js` | 共用工具、STORE（localStorage `partygo:store:v1`）、注音元件、首頁、設定面板、間隔重複、考前範圍 `nextExam()`、拆音節 `SYLLABLES` |
| `modes-play.js` | 自選複習、單字卡、選擇題、聽力、字母拼拼樂、翻牌配對、跟著念 |
| `modes-extra.js` | 手寫（描寫／默寫）、每週一句 |
| `modes-zh.js` | 國語：注音卡、聽音選注音、加聲調、拼注音（聽寫）、寫注音 |
| `parent.js` | 家長模式（PIN、每個小孩的年級／切換／統計）、router `route()` |

## 資料格式
- 英文單字：`"word": { zh, bopo, emoji, category, speak? }`，`bopo` 每個國字一段、空白分隔，數量必須等於國字數。
- 週次：`{ num, dateRange, start, end, progress, words }`；`progress` 寫 `Unit N Quiz N` / `Midterm (Unit a-b)` 讓 `nextExam()` 找到考試範圍。
- 年級存在每個小孩的 `profile.grade`（g1/g2），載入時決定全域 `WORDS/WEEKS/UNITS/SENTENCES/CATEGORIES`，換年級會重新載入頁面。
- 國語進度存在 `profile.zhProgress`，英文在 `profile.progress`（含間隔重複的 `box/due/lastDay`）。

## 新增資料時
- 新學期／新年級單字表：照 `data-g1.js` 的 IIFE 格式新增，週次日期要對 PDF。
- 國語新的一課：在 `ZH_DATA.g1.lessons` 加一筆 `{ id, title, titleBopo, emoji, text, words }`，注音照課本逐字核對。
- 數學新的單元：在 `MATH_DATA.g1.units` 加 `{ id, title, titleBopo, emoji, topics }`；新題型在 `modes-math.js` 的 `MATH_TOPICS` 加 `gen()`，用 SVG 畫、點圖作答，畫面文字要能查到 `CHAR_BOPO`。
- 數學／國語進度分別存在 `profile.mathProgress`、`profile.zhProgress`；科目分頁記在 `profile.subject`（en/zh/math）。
- 中文翻譯是自己配的，交付時要跟家長說明哪些可能需要確認。

## 測試（沒有建置步驟，也沒有測試框架）
- `python3 -m http.server 8765` 後用 Playwright（`/opt/node-tools/node_modules/playwright`，Chromium 在 `/opt/pw-browsers/chromium`）開 `http://localhost:8765/index.html`。
- 每次改動至少檢查：沒有 console 錯誤、375×667 / 390×844 / 768×1024 / 1024×768 不會左右捲動、
  一年級和二年級所有頁面沒有「沒注音的國字」（掃 `.zh-pair` 的空注音與沒包起來的中文字）。
- 這個環境連不到 `vernalin9.github.io`，線上結果要請家長確認。

## 流程
- 在 `claude/grade1-to-grade2-vocab-wtgb2j` 分支開發 → push → 開 PR；合併由家長在 GitHub 按（環境不允許自動合併）。
- PR 合併後，下一個改動要從最新 `main` 重開同名分支。
