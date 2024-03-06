import { Router, Response, Request, NextFunction } from "express";
import { verifyRefreshToken } from "../utils/authUtils";
import { REFRESH_TOKEN_SECRET } from "../config/config";
import { decryptData } from "../utils/encryptDecryptUtils";
import { getUserByRefreshToken } from "../controllers/usersController";
import { generateAccessToken } from "../utils/generateTokens";

const router = Router();

router.get(
  "/access-token",
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken: string = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ message: "Missing refresh token" });
    }

    let decryptRefreshToken;

    try {
      decryptRefreshToken = decryptData(refreshToken);
    } catch (error) {
      return res.status(401).json({ message: "Problem with decrypting" });
    }

    if (!verifyRefreshToken(decryptRefreshToken, REFRESH_TOKEN_SECRET)) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await getUserByRefreshToken(refreshToken);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid refresh token : Unable to find user" });
    }

    const accessToken = generateAccessToken(user.id, user.login);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 900000,
    });

    return res.status(200).json({ message: "Send access Token " });
  }
);

export default router;
