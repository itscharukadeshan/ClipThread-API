import { Router, Response, Request, NextFunction } from "express";
import { Prisma, Thread } from "@prisma/client";
import {
  getPublicThreadDataById,
  getThreadStatus,
} from "../controllers/threadsController";

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

export default router;
