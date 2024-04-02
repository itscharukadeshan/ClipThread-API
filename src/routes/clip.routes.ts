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
router.get(
  "/info",
  authHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token: string | undefined = req.headers.authorization;
    const url = req.body.url;

    if (!access_token) {
      throw new ApplicationError("Missing access Token", 401);
    } else if (!url) {
      throw new ApplicationError("Missing clip url", 401);
    } else if (access_token) {
      const { error } = accessTokenSchema.validate(access_token);
      if (error) {
        throw new ApplicationError(error.message, 401);
      }
    } else if (url) {
      const { error } = urlSchema.validate(url);
      if (error) {
        throw new ApplicationError(error.message, 401);
      }
    }

    const [platform, videoId] = await checkUrlOrigin(url);

    if (platform === "Invalid" || videoId === "") {
      throw new ApplicationError("Missing or invalid clip url", 401);
    }
    try {
      const token: string = access_token.split(" ")[1];

      const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
      const { userId } = decodedToken as TokenPayload;

      let clipInfo;

      if (userId) {
        if (platform === "Twitch") {
          const twitchAccessToken: string | null =
            await getTwitchAccessTokenById(userId);
          if (!twitchAccessToken) {
            throw new ApplicationError("Something went wrong !", 400);
          }

          clipInfo = await getTwitchClipInfo(videoId, twitchAccessToken);
          if (!clipInfo) {
            throw new ApplicationError("Something went wrong !", 400);
          }
        } else if (platform === "Youtube") {
          clipInfo = await getYoutubeClipInfo(videoId);
          if (!clipInfo) {
            throw new ApplicationError("Something went wrong !", 400);
          }
        } else {
          throw new ApplicationError("Something went wrong !", 400);
        }
      }

      return clipInfo;
    } catch (error) {
      next(error);
    }
  }
);
export default router;
