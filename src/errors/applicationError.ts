/** @format */

import chalk from "chalk";
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
    if (process.env.NODE_ENV === "development") {
      console.error(`${chalk.red(this.name)}: ${chalk.yellow(this.message)}`);
    }
  }
}

/**
 * @openapi
 * components:
 *   schemas:
 *     ApplicationError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description:
 *         message:
 *           type: string
 *           description:
 *         statusCode:
 *           type: integer
 *           description:
 *           enum: [400, 401, 403, 404, 500]

 *       required:
 *         - name
 *         - message
 *         - statusCode
 *       description:
 * 
 *         Logging details:
 *         - Logs are stored in the 'logs/error.log' file
 *         - Maximum log file size: 1GB
 *         - Maximum number of log files: 5
 *
 *         In development mode, errors are also printed to the console with color coding:
 *         - Error name in red
 *         - Error message in yellow
 */
