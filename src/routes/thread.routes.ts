import { Router, Response, Request, NextFunction } from "express";

const router = Router();

router.get(
  "/treading",
  (req: Request, res: Response, next: NextFunction) => {}
);

router.get("/filter", (req: Request, res: Response, next: NextFunction) => {});

export default router;
