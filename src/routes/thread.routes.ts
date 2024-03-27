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

const router = Router();

router.get(
  "/status",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await getThreadStatus();

      return res.status(200).json({ status });
    } catch (error) {
      return res.status(400).json({ message: `Something went wrong !` });
    }
  }
);

router.get(
  "/:threadId",
  async (req: Request, res: Response, next: NextFunction) => {
    const params = req.params;

    if (params) {
      const { error } = threadIdSchema.validate(params);

      if (error) {
        return res.status(401).json({ message: error.message });
      }
    }

    const threadId: string = req.params.threadId;

    let thread: Partial<Thread> | null;

    try {
      thread = await getPublicThreadDataById(threadId);
      if (thread === null) {
        return res
          .status(400)
          .json({ message: `Thread not found or not published` });
      }

      return res.status(200).json({ thread });
    } catch (error) {
      return res.status(400).json({ message: `Something went wrong !` });
    }
  }
);

router.post(
  "/create",
  authHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token: string | undefined = req.headers.authorization;
    const body = req.body;

    if (body) {
      const { error } = threadTitleSchema.validate(body);

      if (error) {
        return res.status(401).json({ message: error.message });
      }
    }

    const title = req.body.title;

    if (!access_token) {
      return res.status(401).json({ message: "Missing access Token" });
    } else {
      const { error } = accessTokenSchema.validate(access_token);
      if (error) {
        return res.status(401).json({ message: error.message });
      }
    }

    const token: string = access_token.split(" ")[1];

    const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
    const { userId, role } = decodedToken as TokenPayload;

    let thread: Partial<Thread> | null;

    try {
      thread = await createNewThread(userId, title);
      if (thread === null) {
        return res.status(400).json({ message: `Something went wrong` });
      }

      return res.status(200).json({ thread });
    } catch (error) {
      return res.status(400).json({ message: `Something went wrong !` });
    }
  }
);

router.put(
  "update/:threadId",
  authHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token: string | undefined = req.headers.authorization;
    const threadId = req.params.threadId;
    const threadData: Thread = req.body;

    if (threadData) {
      const { error } = threadSchema.validate(threadData);

      if (error) {
        return res.status(401).json({ message: error.message });
      }
    }

    if (!access_token) {
      return res.status(401).json({ message: "Missing access Token" });
    } else {
      const { error } = accessTokenSchema.validate(access_token);
      if (error) {
        return res.status(401).json({ message: error.message });
      }
    }

    const token: string = access_token.split(" ")[1];

    const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
    const { userId, role } = decodedToken as TokenPayload;

    const thread = await getPublicThreadDataById(threadId);

    let hasPermission: Boolean = false;

    if (!thread) {
      return res.status(401).json({ message: "Thread is not found" });
    } else if (thread.authorId !== userId) {
      hasPermission = false;
    } else if (role === UserRole.creator) {
      let broadcasters = thread.broadcasters;
      const user = await getUserById(userId);

      if (!user) {
        return res.status(401).json({ message: "user not found" });
      }
      hasPermission = creatorPermission(broadcasters, user);
    } else if (role === UserRole.moderator) {
      const user = await getUserById(userId);
      let broadcasters = thread.broadcasters;

      if (!user) {
        return res.status(401).json({ message: "Something went wrong" });
      }

      hasPermission = moderatorPermission(broadcasters, user);
    }

    if (!hasPermission) {
      return res.status(401).json({ message: "Permission denied" });
    } else {
      try {
        const updatedThread = await updateThread(
          threadId,
          threadData,
          thread.broadcasters,
          thread.clips
        );

        return updateThread;
      } catch (error) {
        return res.status(401).json({ message: "Something went wrong" });
      }
    }
  }
);

router.delete(
  "delete/:threadId",
  authHandler,
  (req: Request, res: Response, next: NextFunction) => {}
);

export default router;
