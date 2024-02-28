import { Router, Response, Request, NextFunction } from "express";

import {
  getAuthUrl,
  getAccessToken,
  getUser,
  getChannelData,
} from "../../services/youtube/youtubeAuth.service";

import { encryptData, decryptData } from "../../utils/encryptDecryptUtils";

const router = Router();

router.get("/login", (req: Request, res: Response) => {
  const url = getAuthUrl([
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
  ]);
  res.redirect(url);
});

router.get(
  "/callback",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.query.code;
      const data = req.query;

      if (!code) {
        throw new Error("No code in request");
      }

      const authData = await getAccessToken(code);
      const user = await getUser(authData.access_token);
      const channelData = await getChannelData(authData.access_token);
      const encryptEmail = encryptData(user.email);
      const refreshToken = encryptData(authData.refresh_token);
      const accessToken = encryptData(authData.access_token);

      return res.json({
        channelData,
        refreshToken,
        accessToken,
        user,
        encryptEmail,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
