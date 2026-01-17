# package-issue-sop

## 說明

第三方套件問題排查標準作業程序。當使用者遇到任何第三方套件問題時，Claude 必須自動執行此 SOP，並內建使用 Context7 查詢官方文件。

## 觸發條件

**強制規則**：只要問題涉及任何第三方套件 / library / framework / tool（包含 npm package、UI library、build tool、lint tool 等），一律先套用此 SOP 的流程與輸出格式。除非使用者明確說「不要用 SOP」。

自動啟動情境：

- 套件安裝失敗、相依性衝突
- TypeScript 型別錯誤（與第三方套件相關）
- Runtime 錯誤（來自第三方套件）
- UI 元件行為異常（Element Plus、Radix、shadcn 等）
- 打包/SSR 問題
- 套件 API 使用方式疑問

---

## SOP 流程

### Step 1: 快速釐清問題背景

在開始排查前，確認以下資訊（若使用者未提供，主動詢問）：

| 項目                 | 說明                                                     |
| -------------------- | -------------------------------------------------------- |
| 套件名稱 & 版本      | e.g., `element-plus@2.4.3`                               |
| 框架 & 版本          | e.g., `Vue 3.4.x`, `React 18.x`, `Node 20.x`, `Vite 5.x` |
| 錯誤訊息             | 完整 error stack 或關鍵片段                              |
| 最小可重現片段       | 觸發問題的程式碼                                         |
| 預期行為 vs 實際行為 | 使用者期望發生什麼、實際發生什麼                         |

---

### Step 2: Docs-first（強制使用 Context7）

**這是內建規則，不需要使用者額外指示「use context7」。**

1. **Resolve Library ID**

   ```
   使用 mcp__context7__resolve-library-id 取得套件的 Context7 library ID
   ```

2. **Query Docs**

   ```
   使用 mcp__context7__query-docs 查詢：
   - 該套件的相關 API 文件
   - 錯誤訊息相關的 troubleshooting
   - 版本升級/breaking changes 說明
   ```

3. **優先查詢順序**（若涉及多個套件）：
   - UI 框架 (Radix, shadcn, Ant Design)
   - 核心框架 (Vue, React)
   - 建構工具 (Vite, Webpack, esbuild)
   - 其他相依套件

4. **若 Context7 查無結果**：
   - 明確標註：`⚠️ 無法從官方文件驗證，以下為推理結果`
   - 改用內建知識推理
   - 建議使用者自行查閱官方文件確認

---

### Step 3: 分類排查

根據問題類型，依對應清單排查：

#### 3.1 安裝/相依性問題

- [ ] 檢查 `package.json` 中版本範圍是否正確
- [ ] 執行 `pnpm why <package>` 查看相依樹
- [ ] 確認 peer dependencies 是否滿足
- [ ] 嘗試 `pnpm dedupe` 或清除 lock file 重裝
- [ ] 檢查 monorepo workspace 設定

#### 3.2 TypeScript 型別問題

- [ ] 確認 `@types/*` 版本與套件版本相容
- [ ] 檢查 `tsconfig.json` 的 `moduleResolution` 設定
- [ ] 查看套件是否自帶型別 (檢查 `package.json` 的 `types` 欄位)
- [ ] 確認 `skipLibCheck` 設定
- [ ] 嘗試重啟 TS server

#### 3.3 Runtime 錯誤

- [ ] 確認套件版本與框架版本相容
- [ ] 檢查 import 方式 (ESM vs CJS)
- [ ] 確認環境變數/設定是否正確
- [ ] 檢查 polyfill 需求
- [ ] 確認 bundle 是否正確包含該套件

#### 3.4 UI 元件行為異常

- [ ] 確認元件 props 用法是否符合文件
- [ ] 檢查 CSS 樣式覆蓋/衝突
- [ ] 確認全域設定 (如 locale, theme) 是否正確
- [ ] 檢查事件處理綁定
- [ ] 確認 slot 用法是否正確

#### 3.5 效能問題

- [ ] 檢查是否有不必要的重複渲染
- [ ] 確認 tree-shaking 是否生效
- [ ] 檢查 bundle size (是否誤引入完整套件)
- [ ] 確認 lazy loading 設定

#### 3.6 打包/SSR 問題

- [ ] 檢查 SSR 相容性 (是否存取 `window`/`document`)
- [ ] 確認 external/noExternal 設定
- [ ] 檢查 alias 設定
- [ ] 確認 optimizeDeps 設定 (Vite)
- [ ] 檢查 transpile 設定

---

### Step 4: 產出修法

提供解決方案時，遵循以下結構：

1. **最小改動 Fix** (Primary)
   - 最直接、影響範圍最小的修復方式
   - 附帶具體程式碼片段

2. **替代方案 A** (Alternative)
   - 說明適用情境
   - Tradeoff 分析

3. **替代方案 B** (Alternative)
   - 說明適用情境
   - Tradeoff 分析

---

### Step 5: 交付格式

最終輸出必須為以下格式（可直接貼到 PR comment / issue）：

```markdown
## 總結：

[一句話描述問題與解法]

## 推測根本原因：

**推測原因：** [具體描述]

**依據：**

- [來自 Context7 查到的文件證據]
- [或標註「無法從 docs 驗證，為推理結果」]

## Fix

### 具體修正

[具體步驟與程式碼片段]

### 替代方案 A

**適用情境：** [說明]
**Tradeoff：** [說明]
[程式碼片段]

### 替代方案 B

**適用情境：** [說明]
**Tradeoff：** [說明]
[程式碼片段]

## checkList

- [ ] [測試項目 1]
- [ ] [測試項目 2]
- [ ] [測試項目 3]

## 查到的文件連結或摘要

- [Context7 查到的文件摘要與連結]
- [相關 GitHub issue / discussion 連結（如有）]
```

---

## 限制

1. **不執行外部動作**：不發 PR comment、不發 issue、不做任何外部發文，僅輸出文字建議
2. **明確標註來源**：所有建議必須標註是來自「官方文件」或「推理結果」
3. **Context7 優先**：必須先嘗試 Context7 查詢，查不到才使用內建知識
4. **不過度推測**：若資訊不足，主動詢問而非猜測

---

## 快速指令

若使用者只給套件名稱和錯誤訊息，直接進入 Step 2 查文件，同時詢問缺少的背景資訊。
