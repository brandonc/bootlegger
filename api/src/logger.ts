import * as winston from "winston";

const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple(),
);

const defaultLogLevel = process.env.LOG_LEVEL || "info";
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      level: defaultLogLevel,
    }),
  ],
});

export { logger as default };
