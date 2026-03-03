# API Spec（模組化）

> 最後更新：2026-03-03
> 來源：`apps/backend/src/routes/*.openapi.ts`、`apps/backend/src/schemas/*.schema.ts`

本資料夾為 FieldToTable Backend 的 API 規格主入口，依功能模組拆分，避免單一文件過大與規格漂移。

## 文件清單

- [common.md](./common.md)：共用規則（認證、分頁、錯誤格式、時間格式）
- [auth.md](./auth.md)：認證相關（Better Auth + 開發測試端點）
- [recipes.md](./recipes.md)：菜譜 API
- [menu-sets.md](./menu-sets.md)：菜單組 API
- [favorites.md](./favorites.md)：收藏 API
- [options.md](./options.md)：選項資料 API

## 維護規範

- 規格變更以程式碼為準：先改 `src/routes` / `src/schemas`，再更新本資料夾。
- 所有範例欄位必須與實際 schema 一致（含 enum 值）。
- 若回應結構有共通樣式，優先更新 `common.md` 後再同步各模組。
