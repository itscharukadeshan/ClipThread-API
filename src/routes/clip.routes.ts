/** @format */

import { Router, Response, Request, NextFunction } from "express";
import authHandler from "../middlewares/authHandler";
import { verifyToken } from "../utils/authUtils";
import { checkUrlOrigin } from "../utils/checkUrlOrigin";
import { ACCESS_TOKEN_SECRET } from "../config/config";
import { TokenPayload } from "./interface";
import { getTwitchAccessTokenById } from "../controllers/clipsControllers";
import {
  getTwitchClipInfo,
  getYoutubeClipInfo,
} from "../services/clip.services";
import { accessTokenSchema } from "../joi_schemas/authSchemas";
import { urlSchema } from "../joi_schemas/clipSchemas";
import ApplicationError from "../errors/applicationError";

const router = Router();

/**
 * @openapi
 * /clip/info:
 *   get:
 *     summary: Get clip info from youtube/twitch using video url
 *     tags:
 *       - Info
 *     description: Identify video url origin (twitch / youtube) and get necessary data using users twitch or youtube access_token.
 *     parameters:
 *       - in: query
 *         name: url
 *         description: |
 *             Valid youtube video or twitch clip url.
 *             - Examples
 *               - [Standard youtube url](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
 *               - [Shortened youtu.be embed url](https://youtu.be/dQw4w9WgXcQ)
 *               - [Standard twitch clip urls](https://www.twitch.tv/crystalst/clip/HonorableCleanPidgeonPRChase-juOlyNN7VKJ-fSBl)
 *               - [Twitch clip url with channel name](https://clips.twitch.tv/HonorableCleanPidgeonPRChase-juOlyNN7VKJ-fSBl)
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: |
 *             Identify video URL origin (Twitch / YouTube) and get necessary data using user's Twitch or YouTube access_token.
 *             - [YouTube API docs](https://developers.google.com/youtube/v3/docs/videos)
 *             - [Twitch API docs](https://dev.twitch.tv/docs/api/reference#get-clips)
 *         content:
 *           application/json:
 *              schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Twitch_clip_info'
 *                 - $ref: '#/components/schemas/YouTube_clip_info'
 *
 *       400:
 *         description: Missing, Invalid or not found clip information trow this error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *
 *       401:
 *         description: Invalid, Expired or Revoked access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *
 */

router.get(
  "/info",
  authHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access_token: string | undefined = req.headers.authorization;
      const url = req.query.url as string;

      if (!access_token) {
        throw new ApplicationError("Missing access Token", 401);
      }

      if (!url) {
        throw new ApplicationError("Missing clip url", 400);
      }

      const { error: tokenError } = accessTokenSchema.validate(access_token);
      if (tokenError) {
        throw new ApplicationError(tokenError.message, 401);
      }

      const { error: urlError } = urlSchema.validate(url);
      if (urlError) {
        throw new ApplicationError(urlError.message, 400);
      }

      const urlsData = await checkUrlOrigin(url);

      let platform, videoId, startTime: string | undefined;

      if (!urlsData) {
        throw new ApplicationError("Fail to get clip data", 400);
      } else {
        platform = urlsData[0];
        videoId = urlsData[1];
        startTime = urlsData[2];
      }

      if (platform === "Invalid" || videoId === "") {
        throw new ApplicationError("Invalid clip url", 400);
      }

      const token: string = access_token.split(" ")[1];
      const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
      const { userId } = decodedToken as TokenPayload;

      let clipInfo;

      if (userId) {
        if (platform === "Twitch" && videoId) {
          const twitchAccessToken: string | null =
            await getTwitchAccessTokenById(userId);
          if (!twitchAccessToken) {
            throw new ApplicationError("Something went wrong !", 500);
          }
          clipInfo = await getTwitchClipInfo(videoId, twitchAccessToken);
        } else if (platform === "YouTube" && videoId) {
          clipInfo = await getYoutubeClipInfo(videoId);
        } else {
          throw new ApplicationError("Invalid platform", 400);
        }
      }

      if (!clipInfo) {
        throw new ApplicationError("Clip information not found", 404);
      }

      return res.json(clipInfo);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
