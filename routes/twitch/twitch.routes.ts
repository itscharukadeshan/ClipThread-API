import { Router, Response, Request, NextFunction } from "express";
import {
  getAuthUrl,
  getUserAuth,
  getUserData,
} from "../../services/twitch/twitchAuth.service";
import { formatUserDataFromTwitch } from "../../utils/userUtils";
import { createUser } from "../../controllers/usersController";
import { UserRole } from "@prisma/client";

const router = Router();

router.get("/login", (req: Request, res: Response, next: NextFunction) => {
  const scopeParam = (req.query.scope as UserRole) || UserRole.user;

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
      const newUser = await createUser(userData, twitchAuth);

      return res.json(newUser);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
