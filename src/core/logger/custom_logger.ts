import winston from "winston";

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.printf(
        (info) => `${info.level}: ${info.timestamp} ${info.message}`,
    ),
)

export const logger = winston.createLogger({
    level: 'info',
    format: format,
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ],
});

logger.info.bind(logger)