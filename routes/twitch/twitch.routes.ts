// auth.routes.ts

import { Router, Response, Request } from "express";
import {
  getAuthUrl,
  getAccessToken,
} from "../../services/twitch/twitchAuth.service";
import { TwitchScope } from "./types";
import { TWITCH_CLIENT_ID } from "../../config/config";
import axios from "axios";

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

    const userDataResponse = await axios.get(
      "https://api.twitch.tv/helix/users",
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userData = userDataResponse.data.data[0];

    // ? Handle the data

    res.json(userData);
  } catch (error) {
    console.error("Error getting access token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
