import { NextFunction, Request, Response } from "express";
import chalk from "chalk";

import fs from "fs";

import winston from "winston";

const logDirectory = "logs";
const logFilePath = `${logDirectory}/request.log`;

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logger = winston.createLogger({
  level: "request-info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: logFilePath,
      maxsize: 1024 * 1024 * 1024,
      maxFiles: 1,
    }),
  ],
});

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url } = req;
  const endpoint: string = url;

  let coloredMethod: string;
  switch (method) {
    case "GET":
      coloredMethod = chalk.green.bold(method);
      break;
    case "POST":
      coloredMethod = chalk.blue.bold(method);
      break;
    case "PUT":
      coloredMethod = chalk.yellow.bold(method);
      break;
    case "DELETE":
      coloredMethod = chalk.red.bold(method);
      break;
    default:
      coloredMethod = chalk.gray.bold(method);
  }

  next();

  res.on("finish", () => {
    const statusCode = res.statusCode;
    const time = Date.now() - start;

    logger.info({
      method,
      url,
      statusCode,
      responseTime: time,
    });

    const coloredStatus: string =
      statusCode >= 500
        ? chalk.red.bold(statusCode)
        : statusCode >= 400
          ? chalk.yellow(statusCode)
          : statusCode >= 300
            ? chalk.cyan(statusCode)
            : chalk.gray(statusCode);

    let coloredTime: string;
    if (time < 200) {
      coloredTime = chalk.gray(`(${time} ms)`);
    } else if (time < 300) {
      coloredTime = chalk.yellow(`(${time} ms)`);
    } else {
      coloredTime = chalk.red(`(${time} ms)`);
    }

    console.log(
      `${coloredMethod}  ${endpoint}  ${coloredStatus}  ${coloredTime}`
    );
  });
};

export default requestLogger;
