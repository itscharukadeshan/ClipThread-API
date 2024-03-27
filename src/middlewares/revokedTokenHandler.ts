import { NextFunction, Request, Response } from "express";
import { checkRefTokenValidity } from "../utils/authUtils";
import ApplicationError from "../errors/applicationError";
async function revokedTokenHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const refreshToken: string = req.cookies.refresh_token;
  const isTokenValid = await checkRefTokenValidity(refreshToken);

  if (!isTokenValid) {
    throw new ApplicationError("Revoked refresh token token", 403);
  }

  next();
}

export default revokedTokenHandler;
