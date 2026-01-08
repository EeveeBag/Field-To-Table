import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db/index.js' // your drizzle instance

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg'
  }),
  secret: process.env.BETTER_AUTH_SECRET as string,
  baseURL: process.env.BETTER_AUTH_URL as string,
  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3000'],
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET as string
    }
  },
  advanced: {
    // 根據環境自動判斷是否使用 Secure Cookie
    useSecureCookies: process.env.BETTER_AUTH_URL?.startsWith('https://') ?? false,
    // Cookie 設定
    cookiePrefix: 'better-auth'
  }
})
