import { Router, Response, Request, NextFunction } from "express";
import { Thread } from "@prisma/client";
import {
  getPublicThreadDataById,
  getThreadStatus,
  createNewThread,
} from "../controllers/threadsController";
import authHandler from "../middlewares/authHandler";
import { verifyToken } from "../utils/authUtils";
import { ACCESS_TOKEN_SECRET } from "../config/config";
import { TokenPayload } from "./types";

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
    const threadId = req.params.threadId;

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
    const authHeader: string | undefined = req.headers.authorization;
    const title = req.body.title;

    if (!authHeader) {
      return res.status(401).json({ message: "Missing access Token" });
    } else if (!title) {
      return res.status(401).json({ message: "Missing thread tittle" });
    }

    const token: string = authHeader.split(" ")[1];

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
  "/update",
  authHandler,
  (req: Request, res: Response, next: NextFunction) => {}
);

router.delete(
  "/:threadId",
  authHandler,
  (req: Request, res: Response, next: NextFunction) => {}
);

export default router;
