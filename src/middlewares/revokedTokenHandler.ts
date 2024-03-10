import { NextFunction, Request, Response } from "express";
import { checkRefTokenValidity } from "../utils/authUtils";
async function revokedTokenHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const refreshToken: string = req.cookies.refresh_token;
  const isTokenValid = await checkRefTokenValidity(refreshToken);

  if (!isTokenValid) {
    return res.status(403).json({ message: "Revoked refresh token token" });
  }

  next();
}

export default revokedTokenHandler;
