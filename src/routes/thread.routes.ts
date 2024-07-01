/** @format */

import { Router, Response, Request, NextFunction } from "express";
import { Thread, UserRole } from "@prisma/client";
import {
  getPublicThreadDataById,
  getThreadStatus,
  createNewThread,
  updateThread,
  deleteThread,
} from "../controllers/threadsController";
import authHandler from "../middlewares/authHandler";
import { verifyToken } from "../utils/authUtils";
import { ACCESS_TOKEN_SECRET } from "../config/config";
import { TokenPayload } from "./interface";
import { getUserById } from "../controllers/usersController";
import {
  creatorPermission,
  moderatorPermission,
} from "../services/thread.services";
import { accessTokenSchema } from "../joi_schemas/authSchemas";
import {
  threadIdSchema,
  threadTitleSchema,
  threadSchema,
} from "../joi_schemas/threadSchemas";
import ApplicationError from "../errors/applicationError";

const router = Router();

/**
 * @openapi
 * /thread/status:
 *   get:
 *     summary: Get info about status of thread
 *     tags:
 *       - Threads
 *     description: Get count of published and un published thread with the status of the database.
 *     security: []
 *     responses:
 *       200:
 *         description: Response with published and unPublished thread count.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 published:
 *                   type: integer
 *                 unPublished:
 *                   type: integer
 *       400:
 *         description: Unable to ger status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *       404:
 *         description: No threads found
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
 *
 */

router.get(
  "/status",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await getThreadStatus();

      if (!status) {
        throw new ApplicationError("Unable to ger status", 400);
      }

      return res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /thread/{threadId}:
 *   get:
 *     summary: Get public thread info by id
 *     tags:
 *       - Threads
 *     description: Get public thread data using the threadId in the path.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: threadId
 *         description: Valid thread id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Send public thread data with status
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/Public_Thread'
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
  "/:threadId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = req.params;

      if (params) {
        const { error } = threadIdSchema.validate(params);

        if (error) {
          throw new ApplicationError(error.message, 401);
        }
      }

      const threadId: string = req.params.threadId;

      let thread: Partial<Thread> | null;
      thread = await getPublicThreadDataById(threadId);
      if (thread === null) {
        throw new ApplicationError("Thread not found or not published", 401);
      }

      return res.status(200).json({ thread });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /thread/create:
 *   post:
 *     summary: Create thread using thread title.
 *     tags:
 *       - Threads
 *     description: Create thread using thread title. Use to initialize the thread with validation of user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Valid title
 *             required:
 *               - title
 *     responses:
 *       200:
 *         description: Send new thread with thread id and basic information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/New_Thread'
 *       401:
 *         description: Missing, Invalid or not found access Token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *       403:
 *         description: Forbidden. ( Mismatch  or invalid csrf token )
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *       500:
 *         description: Failed to create new thread / Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 */

router.post(
  "/create",
  authHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access_token: string | undefined = req.headers.authorization;
      const body = req.body;

      if (body) {
        const { error } = threadTitleSchema.validate(body);

        if (error) {
          throw new ApplicationError(error.message, 401);
        }
      }

      const title = req.body.title;

      if (!access_token) {
        throw new ApplicationError("Missing access Token", 401);
      } else {
        const { error } = accessTokenSchema.validate(access_token);
        if (error) {
          throw new ApplicationError(error.message, 401);
        }
      }

      const token: string = access_token.split(" ")[1];

      const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
      const { userId, role } = decodedToken as TokenPayload;

      let thread: Partial<Thread> | null;

      thread = await createNewThread(userId, title);
      if (thread === null) {
        throw new ApplicationError("Something went wrong", 401);
      }

      return res.status(200).json({ thread });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /thread/{threadId}:
 *   put:
 *     summary: Update thread data using thread id.
 *     tags:
 *       - Threads
 *     description: Update thread data using thread id.Use to edit and update the thread content.
 *     parameters:
 *       - in: path
 *         name: threadId
 *         description: Valid thread id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Update_Thread_Req'
 *     responses:
 *       200:
 *         description: Send updated thread data with status.
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/Public_Thread'
 *       401:
 *         description: Missing / Invalid threadId or user information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *       402:
 *         description: Permission denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *       403:
 *         description: Forbidden. ( Mismatch  or invalid csrf token )
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *       500:
 *         description:  Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationError'
 *
 */

router.put(
  "/:threadId",
  authHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access_token: string | undefined = req.headers.authorization;
      const threadId = req.params.threadId;
      const threadData: Thread = req.body;

      if (threadData) {
        const { error } = threadSchema.validate(threadData);

        if (error) {
          throw new ApplicationError(error.message, 401);
        }
      }

      if (!access_token) {
        throw new ApplicationError("Missing access Token", 401);
      } else {
        const { error } = accessTokenSchema.validate(access_token);
        if (error) {
          throw new ApplicationError(error.message, 401);
        }
      }

      const token: string = access_token.split(" ")[1];

      const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
      const { userId, role } = decodedToken as TokenPayload;

      const thread = await getPublicThreadDataById(threadId);

      if (!thread) {
        throw new ApplicationError("Thread is not found", 401);
      }

      const user = await getUserById(userId);
      if (!user) {
        throw new ApplicationError("User not found", 401);
      }

      let hasPermission = false;

      if (thread.authorId === userId) {
        hasPermission = true;
      } else if (role === UserRole.creator || role === UserRole.moderator) {
        let broadcasters = thread.broadcasters;
        hasPermission =
          role === UserRole.creator
            ? creatorPermission(broadcasters, user)
            : moderatorPermission(broadcasters, user);
      }

      if (!hasPermission) {
        throw new ApplicationError("Permission denied", 403);
      } else {
        const updatedThread = await updateThread(
          threadId,
          threadData,
          thread.broadcasters,
          thread.clips
        );
        return updatedThread;
      }
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:threadId",
  authHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access_token: string | undefined = req.headers.authorization;
      const threadId = req.params.threadId;

      if (!access_token) {
        throw new ApplicationError("Missing access Token", 401);
      } else {
        const { error } = accessTokenSchema.validate(access_token);
        if (error) {
          throw new ApplicationError(error.message, 401);
        }
      }

      const token: string = access_token.split(" ")[1];

      const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
      const { userId, role } = decodedToken as TokenPayload;

      const thread = await getPublicThreadDataById(threadId);

      if (!thread) {
        throw new ApplicationError("Thread is not found", 401);
      }

      const user = await getUserById(userId);
      if (!user) {
        throw new ApplicationError("User not found", 401);
      }

      let hasPermission = false;

      if (thread.authorId === userId) {
        hasPermission = true;
      } else if (role === UserRole.creator || role === UserRole.moderator) {
        let broadcasters = thread.broadcasters;
        hasPermission =
          role === UserRole.creator
            ? creatorPermission(broadcasters, user)
            : moderatorPermission(broadcasters, user);
      }

      if (!hasPermission) {
        throw new ApplicationError("Permission denied", 403);
      } else {
        const thread = await deleteThread(threadId);
        return thread;
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
