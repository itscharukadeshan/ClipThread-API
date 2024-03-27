import { Router, Response, Request, NextFunction } from "express";
import { formatUserDataFromTwitch } from "../utils/formatUserData";
import { UserRole } from "@prisma/client";
import {
  getAuthUrl,
  getUserAuth,
  getUserData,
} from "../services/twitchAuth.services";
import handleTwitchUser from "../utils/handleTwitchUser";
import { roleSchema } from "../joi_schemas/twitchSchemas";
const router = Router();

router.get("/auth", (req: Request, res: Response, next: NextFunction) => {
  const scopeParam = req.query.scope as UserRole;

  let scope: UserRole = scopeParam;

  const url = getAuthUrl(scope);
  res.redirect(url);
});

router.get(
  "/callback",
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const { error } = roleSchema.validate(query);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      let userAuthData;

      if (query.code) {
        const code = query.code as string;
        userAuthData = await getUserAuth(code);
      }

      const accessToken = userAuthData.access_token;

      const userDataResponse = await getUserData(accessToken);

      const { userData, twitchAuth } = formatUserDataFromTwitch(
        userAuthData,
        userDataResponse
      );
      const scope = userData.login;

      const { newAccessToken, user } = await handleTwitchUser(
        userData,
        twitchAuth,
        accessToken,
        scope
      );

      res.cookie("refresh_token", user?.refreshToken, {
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
        twitchId: user?.twitchId,
        role: user?.login,
        followers: user?.followers,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
