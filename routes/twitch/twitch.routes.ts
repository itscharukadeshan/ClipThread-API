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
import { encryptData, decryptData } from "../../utils/utils";

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
    const refreshToken = userAuthData.refresh_token;

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

    // const email = userDataResponse.data[0].email;

    // if (!email || !accessToken || !refreshToken) {
    //   console.log(email, accessToken, refreshToken);
    //   throw new Error("Email , accessToken or refreshToken missing ");
    // }

    const encryptedAccessToken = encryptData(accessToken);
    const encryptedRefreshToken = encryptData(refreshToken);
    // const encryptedEmail = encryptData(email);

    return res.json({
      user,
      userAuthData,
      encryptedAccessToken,
      encryptedRefreshToken,
      // encryptedEmail,
    });
  } catch (error) {
    console.error("Error getting access token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
