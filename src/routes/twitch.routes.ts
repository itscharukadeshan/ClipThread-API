import { Router, Response, Request, NextFunction } from "express";
import { formatUserDataFromTwitch } from "../utils/formatUserData";
import { UserRole } from "@prisma/client";
import {
  handleCreatorScope,
  handleModeratorScope,
  handleUserScope,
} from "../utils/authUtils";
import {
  getAuthUrl,
  getUserAuth,
  getUserData,
} from "../services/twitchAuth.services";
const router = Router();

router.get("/login", (req: Request, res: Response, next: NextFunction) => {
  const scopeParam = req.query.scope as UserRole;

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

      let user, newAccessToken;

      if (scope === UserRole.user) {
        ({ user, newAccessToken } = await handleUserScope(
          userData,
          twitchAuth,
          accessToken
        ));
      } else if (scope === UserRole.moderator) {
        ({ user, newAccessToken } = await handleModeratorScope(
          userData,
          twitchAuth,
          accessToken
        ));
      } else if (scope === UserRole.creator) {
        ({ user, newAccessToken } = await handleCreatorScope(
          userData,
          twitchAuth,
          accessToken
        ));
      } else {
        throw new Error("Invalid user role");
      }

      res.status(200).json({ access_token: newAccessToken });

      res.cookie("refresh_token", user?.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 2592000000,
      });

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
