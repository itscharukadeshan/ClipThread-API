import { Router, Response, Request, NextFunction } from "express";
import authHandler from "../middlewares/authHandler";
import { verifyToken } from "../utils/authUtils";
import { ACCESS_TOKEN_SECRET } from "../config/config";
import { TokenPayload } from "./types";
import { getTwitchAccessTokenById } from "../controllers/clipsControllers";
import { getTwitchClipInfo } from "../services/clip.services";
import { checkUrlOrigin } from "../utils/checkUrlOrigin";

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
        const twitchAccessToken: string | null =
          await getTwitchAccessTokenById(userId);
        if (!twitchAccessToken) {
          return res.status(400).json({ message: `Something went wrong !` });
        } else {
          if (platform === "Twitch") {
            const clipInfo = await getTwitchClipInfo(
              videoId,
              twitchAccessToken
            );
            if (!clipInfo) {
              return res
                .status(400)
                .json({ message: `Something went wrong !` });
            }
          } else if (platform === "YouTube") {
            return res.status(200).json({ TODO: `` });
          }
        }
      }
    } catch (error) {
      return res.status(400).json({ message: `Something went wrong !` });
    }
  }
);
export default router;
