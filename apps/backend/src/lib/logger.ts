import pino from 'pino'

const isDevelopment = process.env.NODE_ENV !== 'production'

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // 開發環境使用 pino-pretty，生產環境使用 JSON
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined,

  formatters: {
    level: (label) => ({ level: label.toUpperCase() })
  },

  timestamp: pino.stdTimeFunctions.isoTime
})

export type Logger = typeof logger
