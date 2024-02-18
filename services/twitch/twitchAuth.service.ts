// twitch.service.ts

import axios from "axios";
import {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  TWITCH_REDIRECT_URI,
} from "../../config/config";

const CLIENT_ID = TWITCH_CLIENT_ID;
const CLIENT_SECRET = TWITCH_CLIENT_SECRET;
const REDIRECT_URI = TWITCH_REDIRECT_URI;

// OAuth URLs
const AUTH_URL = "https://id.twitch.tv/oauth2/authorize";
const TOKEN_URL = "https://id.twitch.tv/oauth2/token";

export const getAuthUrl = (scopeType: string) => {
  let scope = "";

  switch (scopeType) {
    case "user":
      scope = "user:edit user:read:blocked_users user:read:email";
      break;
    case "moderator":
      scope =
        "user:edit user:read:blocked_users user:read:email user:read:moderated_channels moderator:read:blocked_terms";
      break;
    case "creator":
      scope =
        "user:edit user:read:blocked_users user:read:email user:read:moderated_channels moderator:read:blocked_terms";
      break;
    default:
      scope = "user:edit user:read:blocked_users user:read:email";
  }

  const encodedScope = encodeURIComponent(scope);
  const decodedScope = decodeURIComponent(encodedScope);

  const params = {
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: decodedScope,
  };

  const query = new URLSearchParams(params).toString();

  return `${AUTH_URL}?${query}`;
};

export const getUserAuth = async (code: string) => {
  const response = await axios.post(TOKEN_URL, {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
  });

  return response.data;
};
