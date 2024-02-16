// auth.routes.ts

import { Router, Response, Request } from "express";

import {
  getAuthUrl,
  getUserAuth,
} from "../../services/twitch/twitchAuth.service";

import { TwitchScope } from "./types";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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
    const userAuthData = await getUserAuth(code);
    const accessToken = userAuthData.access_token;

    const userDataResponse = await axios.get(
      "https://api.twitch.tv/helix/users",
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const user = userDataResponse.data;

    // ? Store the data in database
    // ? Fix the en / de cryptData

    res.json({ user, userAuthData });
  } catch (error) {
    console.error("Error getting access token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
