import { Router, Response, Request, NextFunction } from "express";

import {
  getAuthUrl,
  getAccessToken,
  getUser,
  getChannelData,
} from "../../services/youtube/youtubeAuth.service";

import { formatUserDataFromYouTube } from "../../utils/userUtils";

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
      const userDataResponse = await getUser(authData.access_token);
      const channelData = await getChannelData(authData.access_token);
      const formatUserData = formatUserDataFromYouTube(
        authData,
        userDataResponse,
        channelData
      );

      return res.json({ formatUserData });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
