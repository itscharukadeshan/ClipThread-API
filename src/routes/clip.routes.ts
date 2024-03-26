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

import { validateHeaders } from "../joi_schemas/clipSchemas";

const router = Router();
router.get(
  "/info",
  authHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader: string | undefined = req.headers.authorization;
    const url = req.body.url;

    if (!authHeader) {
      return res.status(401).json({ message: "Missing access Token" });
    } else if (!url) {
      return res.status(401).json({ message: "Missing clip url" });
    } else {
      const { error } = validateHeaders(authHeader);
      if (error) {
        return res.status(401).json({ message: error.message });
      }
    }

    const [platform, videoId] = await checkUrlOrigin(url);

    if (platform === "Invalid" || videoId === "") {
      return res.status(401).json({ message: "Missing or invalid clip url" });
    }
    try {
      const token: string = authHeader.split(" ")[1];

      const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
      const { userId } = decodedToken as TokenPayload;

      if (userId) {
        if (platform === "Twitch") {
          const twitchAccessToken: string | null =
            await getTwitchAccessTokenById(userId);
          if (!twitchAccessToken) {
            return res.status(400).json({ message: `Something went wrong !` });
          }

          const clipInfo = await getTwitchClipInfo(videoId, twitchAccessToken);
          if (!clipInfo) {
            return res.status(400).json({ message: `Something went wrong !` });
          }
        } else if (platform === "Youtube") {
          const clipInfo = await getYoutubeClipInfo(videoId);
          if (!clipInfo) {
            return res.status(400).json({ message: `Something went wrong !` });
          }
        } else {
          return res.status(400).json({ message: `Something went wrong !` });
        }
      }
    } catch (error) {
      return res.status(400).json({ message: `Something went wrong !` });
    }
  }
);
export default router;
