import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston that we want to link the colors
winston.addColors(colors);

// Custom format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use
// In production (Vercel), only use console logging to avoid filesystem issues
const transports = [];

// Only add file transports in development or when /tmp is available
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    // Write all logs with importance level of 'error' or less to 'error.log'
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // Write all logs with importance level of 'info' or less to 'combined.log'
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Always add console logging, but with different formats for different environments
logger.add(
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production'
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.simple()
        )
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
  })
);

export default logger;
