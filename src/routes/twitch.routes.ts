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
 *     summary: Get Twitch login url
 *     tags:
 *       - Auth
 *     description: Get Twitch authentication url to validate user, userRole and log in user.
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

/**
 * @openapi
 * /twitch/callback:
 *   get:
 *     summary: Twitch OAuth callback
 *     description: Handles the callback from Twitch OAuth, processes the authorization code, returns user data, and sets a refresh token cookie
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The authorization code received from Twitch OAuth
 *     responses:
 *       200:
 *         description: Successful authentication
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: Sets a refresh_token cookie (HttpOnly, Secure, SameSite=Strict, Max-Age=30 days)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: Bearer token for API access
 *                 username:
 *                   type: string
 *                   description: User's display name
 *                 userId:
 *                   type: string
 *                   description: User's ID
 *                 profileImage:
 *                   type: string
 *                   description: URL of user's profile image
 *                 twitchId:
 *                   type: string
 *                   description: User's Twitch ID
 *                 role:
 *                   type: string
 *                   description: User's role or login
 *                 followers:
 *                   type: number
 *                   description: Number of followers
 *
 *       400:
 *         description: Invalid query / validation failed
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
 */

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
