# Favorites API

路徑前綴：`/api/favorites`

## `GET /api/favorites`

取得收藏列表（需登入）。

Query Parameters:

- `page`?: `number`（預設 `1`）
- `limit`?: `number`（預設 `20`，最大 `100`）

Response `200`:

```json
{
  "data": [
    {
      "recipeId": "r1",
      "recipe": {
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
      },
      "createdAt": "2025-12-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

## `POST /api/favorites`

新增收藏（需登入）。

Request Body:

```json
{
  "recipeId": "r1"
}
```

Response `201`:

```json
{
  "data": {
    "recipeId": "r1",
    "createdAt": "2025-12-20T10:00:00Z"
  }
}
```

Response `400`（菜譜不存在）：

```json
{
  "error": "Recipe not found"
}
```

Response `409`（重複收藏）：

```json
{
  "error": "Recipe already in favorites"
}
```

## `DELETE /api/favorites/{recipeId}`

移除收藏（需登入）。

- Response `204`: No Content
- Response `404`:

```json
{
  "error": "Favorite not found"
}
```
