import { Router, Response, Request, NextFunction } from "express";
import {
  getAuthUrl,
  getBlockedTerms,
  getBlockedUsers,
  getModeratedChannels,
  getUserAuth,
  getUserData,
} from "../../services/twitch/twitchAuth.service";
import { formatUserDataFromTwitch } from "../../utils/userUtils";
import { createUser } from "../../controllers/usersController";
import { UserRole } from "@prisma/client";

const router = Router();

router.get("/login", (req: Request, res: Response, next: NextFunction) => {
  const scopeParam = (req.query.scope as UserRole) || UserRole.moderator;

  let scope: UserRole = scopeParam;

  const url = getAuthUrl(scope);
  res.redirect(url);
});

router.get(
  "/callback",
  async (req: Request, res: Response, next: NextFunction) => {
    const code = req.query.code;

    if (!code || typeof code !== "string") {
      return res
        .status(400)
        .json({ error: "Authorization code is missing or invalid" });
    }

    try {
      const userAuthData = await getUserAuth(code);
      const accessToken = userAuthData.access_token;

      const userDataResponse = await getUserData(accessToken);

      const { userData, twitchAuth } = formatUserDataFromTwitch(
        userAuthData,
        userDataResponse
      );
      const scope = userData.login;

      let newUser, blockedUsers, moderatedChannels;

      if (scope === UserRole.user) {
        newUser = await createUser(userData, twitchAuth);
        blockedUsers = await getBlockedUsers(
          accessToken,
          newUser.twitchId as string
        );
      } else if (scope === UserRole.moderator) {
        newUser = await createUser(userData, twitchAuth);
        moderatedChannels = await getModeratedChannels(
          accessToken,
          newUser.twitchId as string
        );
        blockedUsers = await getBlockedUsers(
          accessToken,
          newUser.twitchId as string
        );
      } else if (scope === UserRole.creator) {
        newUser = await createUser(userData, twitchAuth);
        blockedUsers = await getBlockedUsers(
          accessToken,
          newUser.twitchId as string
        );
      }

      return res.json({ newUser, blockedUsers, moderatedChannels });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
