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
  if (err instanceof ApplicationError) {
    res.status(err.statusCode).json({ error: err.message });
  } else if (
    err instanceof PrismaClientInitializationError ||
    err instanceof PrismaClientKnownRequestError ||
    err instanceof PrismaClientUnknownRequestError ||
    err instanceof PrismaClientValidationError
  ) {
    if (process.env.NODE_ENV === "development") {
      console.error(`${chalk.red(err.message)} => ${chalk.yellow(err.stack)}`);
    }
    res.status(500).json({ error: "Internal Server Error" });
  } else {
    if (process.env.NODE_ENV === "development") {
      console.error(`${chalk.red(err.message)} => ${chalk.yellow(err.stack)}`);
    }
    res.status(500).json({ error: "Internal Server Error : Undefined" });
  }
}

export default errorHandler;
