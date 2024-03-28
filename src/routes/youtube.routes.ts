import { Router, Response, Request, NextFunction } from "express";

import {
  getAuthUrl,
  getAccessToken,
  getUser,
  getChannelData,
} from "../services/youtubeAuth.services";

import { formatUserDataFromYouTube } from "../utils/formatUserData";

import { querySchema } from "../joi_schemas/authSchemas";

import handelYoutubeUser from "../utils/handleYoutubeUser";
import ApplicationError from "../errors/applicationError";

const router = Router();

router.get("/auth", (req: Request, res: Response) => {
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
      const query = req.query;
      const { error } = querySchema.validate(query);

      if (error) {
        throw new ApplicationError(error.message, 400);
      }

      let authData;

      if (query.code) {
        const code = query.code as string;
        authData = await getAccessToken(code);
      }

      const userDataResponse = await getUser(authData.access_token);
      const channelData = await getChannelData(authData.access_token);
      const { userData, youtubeAuth } = formatUserDataFromYouTube(
        authData,
        userDataResponse,
        channelData
      );
      const scope = userData.login;

      const { newAccessToken, user } = await handelYoutubeUser(
        userData,
        youtubeAuth,
        scope
      );

      const newRefreshToken = user?.refreshToken;

      res.cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 2592000000,
      });

      res.status(200).json({
        access_token: `Bearer ${newAccessToken}`,
        username: user?.displayName,
        userId: user?.id,
        profileImage: user?.profileImageUrl,
        youtubeId: user?.youtubeId,
        role: user?.login,
        followers: user?.followers,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
