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
        } else if (platform === "Youtube" && videoId) {
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
