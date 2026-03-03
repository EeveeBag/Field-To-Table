# Options API

路徑前綴：`/api/options`

## `GET /api/options/recipe-types`

取得菜譜類型選項（需登入）。

Response `200`:

```json
{
  "data": [
    { "value": "main", "label": "主菜" },
    { "value": "side", "label": "配菜" },
    { "value": "soup", "label": "湯" },
    { "value": "dessert", "label": "甜點" },
    { "value": "drink", "label": "飲料" },
    { "value": "other", "label": "其他" }
  ]
}
```

## `GET /api/options/main-ingredients`

取得主食材選項（需登入）。

Response `200`:

```json
{
  "data": [
    { "value": "pork", "label": "豬肉" },
    { "value": "beef", "label": "牛肉" },
    { "value": "chicken", "label": "雞肉" },
    { "value": "lamb", "label": "羊肉" },
    { "value": "seafood", "label": "海鮮" },
    { "value": "egg", "label": "蛋" },
    { "value": "vegetable", "label": "蔬菜" },
    { "value": "tofu", "label": "豆腐" },
    { "value": "mushroom", "label": "菇類" },
    { "value": "fruit", "label": "水果" },
    { "value": "dairy", "label": "乳製品" },
    { "value": "flour", "label": "麵粉" },
    { "value": "tea", "label": "茶" },
    { "value": "other", "label": "其他" }
  ]
}
```

## `GET /api/options/menu-ingredients`

取得菜單篩選映射（需登入）。

Response `200`:

```json
{
  "data": {
    "types": {
      "main": "主菜",
      "side": "配菜",
      "soup": "湯",
      "dessert": "甜點",
      "drink": "飲料",
      "other": "其他"
    },
    "ingredients": {
      "main": {
        "pork": "豬肉",
        "beef": "牛肉",
        "chicken": "雞肉",
        "lamb": "羊肉",
        "seafood": "海鮮",
        "tofu": "豆腐",
        "egg": "蛋",
        "other": "其他"
      },
      "side": {
        "pork": "豬肉",
        "beef": "牛肉",
        "chicken": "雞肉",
        "lamb": "羊肉",
        "seafood": "海鮮",
        "vegetable": "蔬菜",
        "mushroom": "菇類",
        "egg": "蛋",
        "tofu": "豆腐",
        "other": "其他"
      },
      "soup": {
        "pork": "豬肉",
        "beef": "牛肉",
        "chicken": "雞肉",
        "lamb": "羊肉",
        "seafood": "海鮮",
        "vegetable": "蔬菜",
        "other": "其他"
      },
      "dessert": {
        "fruit": "水果",
        "dairy": "乳製品",
        "flour": "麵粉",
        "other": "其他"
      },
      "drink": {
        "tea": "茶",
        "fruit": "水果",
        "dairy": "乳製品",
        "other": "其他"
      },
      "other": {
        "other": "其他"
      }
    }
  }
}
```
