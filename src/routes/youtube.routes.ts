import { Router, Response, Request, NextFunction } from "express";

import {
  getAuthUrl,
  getAccessToken,
  getUser,
  getChannelData,
} from "../services/youtubeAuth.services";

import { formatUserDataFromYouTube } from "../utils/formatUserData";
import { createUser, getUserByYoutubeId } from "../controllers/usersController";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens";

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
      const code = req.query.code;

      if (!code) {
        throw new Error("No code in request");
      }

      const authData = await getAccessToken(code);
      const userDataResponse = await getUser(authData.access_token);
      const channelData = await getChannelData(authData.access_token);
      const { userData, youtubeAuth } = formatUserDataFromYouTube(
        authData,
        userDataResponse,
        channelData
      );
      const newRefreshToken = generateRefreshToken();
      userData.refreshToken = newRefreshToken;

      let user, newUser, newAccessToken;

      user = await getUserByYoutubeId(userData.youtubeId);

      if (!user) {
        newUser = await createUser(userData, undefined, youtubeAuth);
        if (newUser === null) {
          throw new Error("Failed to create user");
        }
      }

      if (newUser) {
        newAccessToken = generateAccessToken(newUser.id, newUser.login);

        res.cookie("refresh_token", newUser.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 2592000000,
        });
      }

      res.status(200).json({
        access_token: `Bearer ${newAccessToken}`,
        username: newUser?.displayName,
        userId: newUser?.id,
        profileImage: newUser?.profileImageUrl,
        youtubeId: newUser?.youtubeId,
        role: newUser?.login,
        followers: newUser?.followers,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
