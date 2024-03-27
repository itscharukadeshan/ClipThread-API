import { NextFunction, Request, Response } from "express";
import ApplicationError from "../errors/applicationError";
function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ApplicationError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default errorHandler;
