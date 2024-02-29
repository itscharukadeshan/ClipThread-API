import { NextFunction, Request, Response } from "express";
import chalk from "chalk";

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url } = req;
  const endpoint: string = chalk.gray(url);

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
    const coloredStatus: string =
      statusCode >= 500
        ? chalk.red.bold(statusCode)
        : statusCode >= 400
          ? chalk.yellow(statusCode)
          : statusCode >= 300
            ? chalk.cyan(statusCode)
            : chalk.gray(statusCode);

    const time = Date.now() - start;
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

module.exports = requestLogger;
