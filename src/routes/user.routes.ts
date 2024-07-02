/** @format */

import { Router, Response, Request, NextFunction } from "express";
import { getPublicUserDataById } from "../controllers/usersController";
import { User } from "@prisma/client";
import { userIdSchema } from "../joi_schemas/userSchemas";
import ApplicationError from "../errors/applicationError";

const router = Router();

/**
 * @openapi
 * /user/{userId}:
 *   get:
 *     summary: Get public user info by userId
 *     tags:
 *       - User
 *     description: Get public user data using the userId in the path.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: Valid user id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Send public user data with status
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *       401:
 *         description: Missing, Invalid or not found threadId information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *
 *       404:
 *         description: Thread data not found / not published
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *
 *       500:
 *         description:  Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *
 */

router.get(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    const params = req.params;

    if (params) {
      const { error } = userIdSchema.validate(params);

      if (error) {
        throw new ApplicationError(error.message, 401);
      }
    }

    const userId = req.params.userId;

    let userData: Partial<User> | null;

    try {
      userData = await getPublicUserDataById(userId);
      if (userData === null) {
        throw new ApplicationError("User not found", 400);
      }

      return res.status(200).json({ userData });
    } catch (error) {
      throw new ApplicationError("Something went wrong !", 400);
    }
  }
);

export default router;
