/** 將物件中的 createdAt/updatedAt 從 Date 轉為 ISO string */
export function formatDates<T extends { createdAt: Date; updatedAt: Date }>(
  obj: T
): Omit<T, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string } {
  return {
    ...obj,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString()
  }
}

/** 批次轉換 createdAt/updatedAt 為 ISO string */
export function formatDatesArray<T extends { createdAt: Date; updatedAt: Date }>(
  items: T[]
): Array<Omit<T, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }> {
  return items.map(formatDates)
}

/** 從物件中移除指定的 keys */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  for (const key of keys) {
    delete result[key]
  }
  return result as Omit<T, K>
}

/** 解析 multiplier（DB 存 string，API 回傳 number） */
export function parseMultiplier(value: string | null, defaultValue = 1.0): number {
  if (!value) return defaultValue
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? defaultValue : parsed
}
