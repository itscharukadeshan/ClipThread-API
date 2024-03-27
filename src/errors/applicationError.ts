import fs from "fs";
import winston from "winston";

const logDirectory = "logs";
const logFilePath = `${logDirectory}/error.log`;

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: logFilePath,
      maxsize: 1024 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

export default class ApplicationError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
    logger.error(`${this.name}: ${message}`, { statusCode: this.statusCode });
  }
}
