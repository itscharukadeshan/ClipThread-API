/** @format */

import { Router, Response, Request, NextFunction } from "express";

import {
  getAuthUrl,
  getAccessToken,
  getUser,
  getChannelData,
} from "../services/youtubeAuth.services";

import { formatUserDataFromYouTube } from "../utils/formatUserData";

import handelYoutubeUser from "../utils/handleYoutubeUser";
import ApplicationError from "../errors/applicationError";

const router = Router();

/**
 * @openapi
 * /youtube/auth:
 *   get:
 *     summary: Get youtube authentication url
 *     tags:
 *       - Auth
 *     description: Get Youtube authentication url to validate user, userRole and log in user.
 *     security: []
 *     responses:
 *       200:
 *         description: URL to Youtube authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL to Youtube authentication
 *       401:
 *         description: Missing, invalid, or not found user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *       404:
 *         description: User data not found / not available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 */

router.get("/auth", (req: Request, res: Response) => {
  const url = getAuthUrl([
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
  ]);
  res.status(200).json({ url });
});

router.get(
  "/callback",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.query.code as string;

      let authData = null;

      if (code) {
        authData = await getAccessToken(code);
      } else {
        throw new ApplicationError("Missing scope", 400);
      }

      if (authData) {
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
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
