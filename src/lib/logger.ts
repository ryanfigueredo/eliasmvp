import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: undefined,
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

export default logger
