/** @format */

import { Router, Response, Request, NextFunction } from "express";
import { verifyRefreshToken } from "../utils/authUtils";
import { REFRESH_TOKEN_SECRET } from "../config/config";
import { getUserByRefreshToken } from "../controllers/usersController";
import { generateAccessToken } from "../utils/generateTokens";
import revokedTokenHandler from "../middlewares/revokedTokenHandler";
import { refreshTokenSchema } from "../joi_schemas/authSchemas";
import ApplicationError from "../errors/applicationError";

const router = Router();

/**
 * @openapi
 * /auth/access-token:
 *   get:
 *     summary: Get access token
 *     tags:
 *       - Security
 *     description: Check for revoked,expired or invalid token if all checks pass send a new access_token with 200 response
 *     responses:
 *       200:
 *         description: Response with new access_token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: Format "Bearer ${accessToken}"
 *       401:
 *         description: Invalid, Expired or Revoked token
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
 *
 */

router.get(
  "/access-token",
  revokedTokenHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = refreshTokenSchema.validate(req.cookies);

      if (error) {
        throw new ApplicationError(error.message, 401);
      }

      const refreshToken: string = req.cookies.refresh_token;

      if (!verifyRefreshToken(refreshToken, REFRESH_TOKEN_SECRET)) {
        throw new ApplicationError("Invalid refresh token", 401);
      }

      const user = await getUserByRefreshToken(refreshToken);

      if (!user) {
        throw new ApplicationError("Invalid refresh token", 401);
      }

      const accessToken = generateAccessToken(user.id, user.login);

      return res.status(200).json({ access_token: `'Bearer ${accessToken}` });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
