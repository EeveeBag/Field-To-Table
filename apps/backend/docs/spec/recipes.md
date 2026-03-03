# Recipes API

路徑前綴：`/api/recipes`

## Enum 值域

### `type`

- `main`
- `side`
- `soup`
- `dessert`
- `drink`
- `other`

### `mainIngredient`

- `pork`
- `beef`
- `chicken`
- `lamb`
- `seafood`
- `egg`
- `vegetable`
- `tofu`
- `mushroom`
- `fruit`
- `dairy`
- `flour`
- `tea`
- `other`

## `GET /api/recipes`

取得菜譜列表（需登入）。

Query Parameters:

- `search`?: `string`
- `type`?: `RecipeType`
- `mainIngredient`?: `MainIngredient`
- `page`?: `number`（預設 `1`）
- `limit`?: `number`（預設 `20`，最大 `100`）

Response `200`:

```json
{
  "data": [
    {
      "id": "r1",
      "name": "紅蘿蔔炒蛋",
      "type": "side",
      "mainIngredient": "vegetable",
      "servings": 4,
      "ingredientsText": "紅蘿蔔 2個\n雞蛋 3個",
      "steps": "1. 紅蘿蔔切絲",
      "notes": "可加入蔥花提味",
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

## `GET /api/recipes/{id}`

取得單一菜譜（需登入）。

Response `200`:

```json
{
  "data": {
    "id": "r1",
    "name": "紅蘿蔔炒蛋",
    "type": "side",
    "mainIngredient": "vegetable",
    "servings": 4,
    "ingredientsText": "紅蘿蔔 2個\n雞蛋 3個",
    "steps": "1. 紅蘿蔔切絲",
    "notes": "可加入蔥花提味",
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:00:00Z"
  }
}
```

Response `404`:

```json
{
  "error": "Recipe not found"
}
```

## `POST /api/recipes`

新增菜譜（需登入）。

Request Body:

```json
{
  "name": "蒜炒豬肉義大利麵",
  "type": "main",
  "mainIngredient": "pork",
  "servings": 2,
  "ingredientsText": "義大利麵 200公克\n豬肉片 150公克",
  "steps": "1. 煮義大利麵",
  "notes": "可依喜好調整蒜量"
}
```

驗證規則：

- `name`: 必填，1-200 字
- `type`: 必填，值需在 `RecipeType` 中
- `mainIngredient`: 必填，值需在 `MainIngredient` 中
- `servings`: 必填，正整數
- `ingredientsText`: 選填，最多 5000 字
- `steps`: 選填，最多 10000 字
- `notes`: 選填，最多 1000 字

Response `201`:

```json
{
  "data": {
    "id": "r123",
    "name": "蒜炒豬肉義大利麵",
    "type": "main",
    "mainIngredient": "pork",
    "servings": 2,
    "ingredientsText": "義大利麵 200公克\n豬肉片 150公克",
    "steps": "1. 煮義大利麵",
    "notes": "可依喜好調整蒜量",
    "createdAt": "2025-12-12T10:00:00Z",
    "updatedAt": "2025-12-12T10:00:00Z"
  }
}
```

## `PUT /api/recipes/{id}`

更新菜譜（需登入，所有欄位 optional）。

Response `200`:

```json
{
  "data": {
    "id": "r123",
    "name": "蒜炒豬肉義大利麵（改良版）",
    "type": "main",
    "mainIngredient": "pork",
    "servings": 3,
    "ingredientsText": "義大利麵 200公克\n豬肉片 150公克",
    "steps": "1. 煮義大利麵",
    "notes": "加入辣椒更有風味",
    "createdAt": "2025-12-12T10:00:00Z",
    "updatedAt": "2025-12-12T11:00:00Z"
  }
}
```

Response `404`:

```json
{
  "error": "Recipe not found"
}
```

## `DELETE /api/recipes/{id}`

刪除菜譜（需登入）。

- Response `204`: No Content
- Response `404`:

```json
{
  "error": "Recipe not found"
}
```
