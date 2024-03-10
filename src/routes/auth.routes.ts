import { Router, Response, Request, NextFunction } from "express";
import { verifyRefreshToken } from "../utils/authUtils";
import { REFRESH_TOKEN_SECRET } from "../config/config";
import { getUserByRefreshToken } from "../controllers/usersController";
import { generateAccessToken } from "../utils/generateTokens";
import revokedTokenHandler from "../middlewares/revokedTokenHandler";

const router = Router();

router.get(
  "/access-token",
  revokedTokenHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken: string = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ message: "Missing refresh token" });
    }

    if (!verifyRefreshToken(refreshToken, REFRESH_TOKEN_SECRET)) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await getUserByRefreshToken(refreshToken);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid refresh token : Unable to find user" });
    }

    const accessToken = generateAccessToken(user.id, user.login);

    return res.status(200).json({ access_token: `'Bearer ${accessToken}` });
  }
);

export default router;
