import { NextFunction, Request, Response } from "express";
import ApplicationError from "../errors/applicationError";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import chalk from "chalk";

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    console.error(`${chalk.red(err.message)} => ${chalk.yellow(err.stack)}`);
  } else {
    console.error(chalk.red(err.message));
  }

  let statusCode = 500;
  let errorMessage = "Internal Server Error";

  if (err instanceof ApplicationError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  } else if (
    err instanceof PrismaClientInitializationError ||
    err instanceof PrismaClientKnownRequestError ||
    err instanceof PrismaClientUnknownRequestError ||
    err instanceof PrismaClientValidationError
  ) {
    errorMessage = isProduction ? "Internal Server Error" : err.message;
  }

  res.status(statusCode).json({ error: errorMessage });
}

export default errorHandler;
