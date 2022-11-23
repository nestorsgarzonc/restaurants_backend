import winston from "winston";
import morgan from 'morgan';
import { S3StreamLogger } from 's3-streamlogger'

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
}

const s3stream = new S3StreamLogger({
    bucket: "mys3bucket",
    folder: "logs/",
    access_key_id: "...",
    secret_access_key: "..."
});

let transport = new (winston.transports.Stream)({
    stream: s3stream
});

transport.on('error', function (err) {
    console.log("Winston transport error: " + err);
});

winston.addColors(colors)

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.level}: ${info.timestamp} ${info.message}`,
    ),
)

export const logger = winston.createLogger({
    level: 'info',
    format: format,
    transports: [
        transport,
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ],
});
