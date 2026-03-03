# Menu Sets API

路徑前綴：`/api/menu-sets`

## 資料結構

### `MenuSetDish`（回應）

```json
{
  "recipeId": "r1",
  "multiplier": 1,
  "type": "side",
  "name": "紅蘿蔔炒蛋",
  "ingredientsText": "紅蘿蔔 2個\n雞蛋 3個"
}
```

說明：

- `type` 由關聯 `recipes.type` 自動帶入。
- `name`、`ingredientsText` 由關聯 `recipes` 查詢帶入。

### `Create/Update dishes`（請求）

```json
{
  "recipeId": "r1",
  "multiplier": 1.5
}
```

- `recipeId`: 必填
- `multiplier`: 選填，> 0，預設 `1.0`

## `GET /api/menu-sets`

取得菜單組列表（需登入）。

Query Parameters:

- `page`?: `number`（預設 `1`）
- `limit`?: `number`（預設 `20`，最大 `100`）

Response `200`:

```json
{
  "data": [
    {
      "id": "m1",
      "name": "週三暖胃餐桌",
      "description": "下班後 30 分鐘即可完成",
      "servings": 2,
      "dishes": [
        {
          "recipeId": "r1",
          "multiplier": 1,
          "type": "side",
          "name": "紅蘿蔔炒蛋",
          "ingredientsText": "紅蘿蔔 2個\n雞蛋 3個"
        }
      ],
      "createdAt": "2025-12-20T10:00:00Z",
      "updatedAt": "2025-12-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

## `GET /api/menu-sets/{id}`

取得單一菜單組（需登入）。

Response `200`:

```json
{
  "data": {
    "id": "m1",
    "name": "週三暖胃餐桌",
    "description": "下班後 30 分鐘即可完成",
    "servings": 2,
    "dishes": [
      {
        "recipeId": "r1",
        "multiplier": 1,
        "type": "side",
        "name": "紅蘿蔔炒蛋",
        "ingredientsText": "紅蘿蔔 2個\n雞蛋 3個"
      }
    ],
    "createdAt": "2025-12-20T10:00:00Z",
    "updatedAt": "2025-12-20T10:00:00Z"
  }
}
```

Response `404`:

```json
{
  "error": "Menu set not found"
}
```

## `POST /api/menu-sets`

新增菜單組（需登入）。

Request Body:

```json
{
  "name": "家常四菜一湯",
  "description": "適合 4-6 人的家庭晚餐",
  "servings": 4,
  "dishes": [
    { "recipeId": "r1", "multiplier": 1 },
    { "recipeId": "r2", "multiplier": 1.5 }
  ]
}
```

驗證規則：

- `name`: 必填，1-200 字
- `description`: 選填，最多 1000 字
- `servings`: 必填，正整數（預設 4）
- `dishes`: 必填，1~20 筆

Response `201`:

```json
{
  "data": {
    "id": "m123",
    "name": "家常四菜一湯",
    "description": "適合 4-6 人的家庭晚餐",
    "servings": 4,
    "dishes": [
      {
        "recipeId": "r1",
        "multiplier": 1,
        "type": "main",
        "name": "紅燒牛肉",
        "ingredientsText": "牛腱 600g"
      }
    ],
    "createdAt": "2025-12-20T10:00:00Z",
    "updatedAt": "2025-12-20T10:00:00Z"
  }
}
```

## `PUT /api/menu-sets/{id}`

更新菜單組（需登入，欄位皆 optional；`dishes` 若提供則整包覆寫）。

Request Body（範例）：

```json
{
  "name": "週三暖胃餐桌（更新）",
  "servings": 3,
  "dishes": [
    { "recipeId": "r1", "multiplier": 1 },
    { "recipeId": "r3", "multiplier": 2 }
  ]
}
```

Response `200`:

```json
{
  "data": {
    "id": "m123",
    "name": "週三暖胃餐桌（更新）",
    "description": "下班後 30 分鐘即可完成",
    "servings": 3,
    "dishes": [
      {
        "recipeId": "r3",
        "multiplier": 2,
        "type": "side",
        "name": "清炒時蔬",
        "ingredientsText": null
      }
    ],
    "createdAt": "2025-12-20T10:00:00Z",
    "updatedAt": "2025-12-20T11:00:00Z"
  }
}
```

Response `404`:

```json
{
  "error": "Menu set not found"
}
```

## `DELETE /api/menu-sets/{id}`

刪除菜單組（需登入）。

- Response `204`: No Content
- Response `404`:

```json
{
  "error": "Menu set not found"
}
```
