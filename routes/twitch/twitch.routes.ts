// auth.routes.ts

import { Router, Response, Request } from "express";
import {
  getAuthUrl,
  getAccessToken,
} from "../../services/twitch/twitchAuth.service";
import { TwitchScope } from "./types";

const router = Router();

router.get("/login", (req: Request, res: Response) => {
  const scopeParam = req.query.scope;

  let scope: TwitchScope = "user";

  if (scopeParam) {
    if (
      typeof scopeParam === "string" &&
      (scopeParam === "user" ||
        scopeParam === "moderator" ||
        scopeParam === "creator")
    ) {
      scope = scopeParam as TwitchScope;
    }
  }

  const url = getAuthUrl(scope);
  res.redirect(url);
});

router.get("/callback", async (req: Request, res: Response) => {
  const code = req.query.code;

  if (!code || typeof code !== "string") {
    return res
      .status(400)
      .json({ error: "Authorization code is missing or invalid" });
  }

  try {
    const accessToken = await getAccessToken(code);

    // ? Handle the access token, for example, you can send it in the response
    res.json({ accessToken });
  } catch (error) {
    console.error("Error getting access token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
