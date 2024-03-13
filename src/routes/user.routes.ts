import { Router, Response, Request, NextFunction } from "express";
import { getPublicUserDataById } from "../controllers/usersController";
import { User } from "@prisma/client";

const router = Router();

router.get(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    let userData: Partial<User> | null;

    try {
      userData = await getPublicUserDataById(userId);
      if (userData === null) {
        return res.status(400).json({ message: `User not found` });
      }

      return res.status(200).json({ userData });
    } catch (error) {
      return res.status(400).json({ message: `Something went wrong !` });
    }
  }
);

export default router;
