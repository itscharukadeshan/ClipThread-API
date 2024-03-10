import { Router, Response, Request, NextFunction } from "express";

const router = Router();

router.get(
  "/trending",
  (req: Request, res: Response, next: NextFunction) => {}
);

router.get(
  "/collections/:userId",
  (req: Request, res: Response, next: NextFunction) => {}
);

export default router;
