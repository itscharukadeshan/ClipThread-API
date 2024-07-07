/** @format */

import { Router, Response, Request, NextFunction } from "express";
import { formatUserDataFromTwitch } from "../utils/formatUserData";
import { UserRole } from "@prisma/client";
import {
  getAuthUrl,
  getUserAuth,
  getUserData,
} from "../services/twitchAuth.services";
import handleTwitchUser from "../utils/handleTwitchUser";
import { querySchema } from "../joi_schemas/authSchemas";
import ApplicationError from "../errors/applicationError";

const router = Router();

/**
 * @openapi
 * /twitch/auth:
 *   get:
 *     summary: Login with Twitch
 *     tags:
 *       - Auth
 *     description: Redirects to Twitch authentication handlers to validate user and role data and log in the user.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: scope
 *         description: User role scope
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, moderator, creator]
 *     responses:
 *       200:
 *         description: URL to Twitch authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL to Twitch authentication
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

router.get("/auth", (req: Request, res: Response, next: NextFunction) => {
  try {
    const scopeParam = req.query.scope as UserRole;

    let scope: UserRole = scopeParam;

    const url = getAuthUrl(scope);
    res.status(200).json({ url });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/callback",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query;
      const { error } = querySchema.validate(query);

      if (error) {
        throw new ApplicationError(error.message, 400);
      }

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
