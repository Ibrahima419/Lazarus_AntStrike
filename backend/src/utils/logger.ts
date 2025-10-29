/**
 * 📝 Logger Configuration
 * Winston structured logging
 */

import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'antstrike-backend' },
  transports: [
    // Console output (dev)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(meta).length > 0) {
            try {
              // Éviter circular structure errors
              const cleanMeta = JSON.parse(JSON.stringify(meta, (key, value) => {
                if (key === 'config' || key === 'request' || key === 'response') {
                  return '[Circular]';
                }
                return value;
              }));
              msg += ` ${JSON.stringify(cleanMeta)}`;
            } catch (e: any) {
              msg += ` [Logging error: ${e?.message || 'Unknown'}]`;
            }
          }
          return msg;
        })
      )
    })
  ]
});

// Production: Add file transports
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  );
  logger.add(
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
}


