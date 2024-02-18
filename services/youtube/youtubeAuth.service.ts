import axios from "axios";
import {
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  YOUTUBE_REDIRECT_URI,
} from "../../config/config";

const CLIENT_ID = YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = YOUTUBE_REDIRECT_URI;

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USER_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export const getAuthUrl = (scope: string) => {
  const query = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope,
    access_type: "offline",
  });

  return `${AUTH_URL}?${query}`;
};

export const getAccessToken = async (code: any) => {
  const response = await axios.post(TOKEN_URL, {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
  });

  return response.data.access_token;
};

export const getUser = async (accessToken: string) => {
  const response = await axios.get(USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};
