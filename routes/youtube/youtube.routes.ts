import { Router, Response, Request } from "express";

import {
  getAuthUrl,
  getAccessToken,
  getUser,
} from "../../services/youtube/youtubeAuth.service";

const router = Router();

router.get("/login", (req: Request, res: Response) => {
  const url = getAuthUrl("https://www.googleapis.com/auth/youtube.readonly");
  res.redirect(url);
});

router.get("/callback", async (req: Request, res: Response) => {
  try {
    const code = req.query.code;
    const data = req.query;

    if (!code) {
      throw new Error("No code in request");
    }

    const token = await getAccessToken(code);

    return res.json(token);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;
