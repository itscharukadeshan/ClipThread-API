import { Router, Response, Request, NextFunction } from "express";
import { Thread, UserRole } from "@prisma/client";
import {
  getPublicThreadDataById,
  getThreadStatus,
  createNewThread,
  updateThread,
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

router.get(
  "/status",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await getThreadStatus();

      if (!status) {
        throw new ApplicationError("Unable to ger status", 400);
      }

      return res.status(200).json({ status });
    } catch (error) {
      next(error);
    }
  }
);

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

router.put(
  "update/:threadId",
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

      let hasPermission: Boolean = false;

      if (!thread) {
        throw new ApplicationError("Thread is not found", 401);
      } else if (thread.authorId !== userId) {
        hasPermission = false;
      } else if (role === UserRole.creator) {
        let broadcasters = thread.broadcasters;
        const user = await getUserById(userId);

        if (!user) {
          throw new ApplicationError("user not found", 401);
        }
        hasPermission = creatorPermission(broadcasters, user);
      } else if (role === UserRole.moderator) {
        const user = await getUserById(userId);
        let broadcasters = thread.broadcasters;

        if (!user) {
          throw new ApplicationError("user not found", 401);
        }

        hasPermission = moderatorPermission(broadcasters, user);
      }

      if (!hasPermission) {
        throw new ApplicationError("Permission denied", 401);
      } else {
        const updatedThread = await updateThread(
          threadId,
          threadData,
          thread.broadcasters,
          thread.clips
        );

        return updateThread;
      }
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "delete/:threadId",
  authHandler,
  (req: Request, res: Response, next: NextFunction) => {}
);

export default router;
