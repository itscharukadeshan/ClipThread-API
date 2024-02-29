import { NextFunction } from "express";
function errorHandler(err: Error, req: Request, res: any, next: NextFunction) {
  console.error(err);
  res.status(500);
  if (!res.headersSent) {
    res.json({ message: err.message });
  } else {
    next(err);
  }
}

module.exports = errorHandler;
