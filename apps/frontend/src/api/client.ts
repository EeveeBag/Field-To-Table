import { hc } from 'hono/client'
import type { AppType } from '@repo/backend/index'

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const client = hc<AppType>(baseUrl, {
  init: {
    credentials: 'include',
  },
})
