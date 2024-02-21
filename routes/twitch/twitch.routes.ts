// auth.routes.ts

import { Router, Response, Request } from "express";
import axios from "axios";

import {
  getAuthUrl,
  getUserAuth,
} from "../../services/twitch/twitchAuth.service";

import { TWITCH_CLIENT_ID } from "../../config/config";
import { encryptData, decryptData } from "../../utils/utils";

import { createUser } from "../../controllers/usersController";

import { TwitchScope, UserWithoutId, TwitchAuthWithoutId } from "./types";

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
    const expires_in = userAuthData.expires_in;

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

    const {
      email,
      id,
      display_name,
      type,
      broadcaster_type,
      description,
      profile_image_url,
      offline_image_url,
      view_count,
      created_at,
      followers,
    } = user.data[0];

    if (!email || !accessToken || !refreshToken) {
      console.log(email, accessToken, refreshToken);
      throw new Error("Email , accessToken or refreshToken missing ");
    }

    const encryptedAccessToken = encryptData(accessToken);
    const encryptedRefreshToken = encryptData(refreshToken);
    const encryptedEmail = encryptData(email);
    const dateTimeInput = new Date("2024-02-21T12:30:00Z");

    const userData: UserWithoutId = {
      twitchId: id,
      displayName: display_name,
      type: type,
      broadcasterType: broadcaster_type,
      description: description,
      profileImageUrl: profile_image_url,
      offlineImageUrl: offline_image_url,
      viewCount: view_count,
      createdAt: created_at,
      followers: followers || 0,
      email: encryptedEmail,
      youtubeId: null,
      login: null,
    };

    const authData: TwitchAuthWithoutId = {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expiryTime: dateTimeInput,
      userId: id,
    };

    const newUser = createUser(userData, authData);

    return res.json(newUser);
  } catch (error) {
    console.error("Error getting access token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
