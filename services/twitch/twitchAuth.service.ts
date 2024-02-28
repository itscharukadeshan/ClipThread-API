// twitch.service.ts

import axios, { AxiosResponse } from "axios";
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
const USER_URL = "https://api.twitch.tv/helix/users";
const MODERATED_URL = "https://api.twitch.tv/helix/moderation/channels";
const TERMS_URL = "https://api.twitch.tv/helix/moderation/blocked_terms";
const BLOCKED_USERS_URL = "https://api.twitch.tv/helix/users/blocks";

export const getAuthUrl = (scopeType: string) => {
  let scope = "";

  switch (scopeType) {
    case "user":
      scope =
        "user:edit user:read:follows user:read:blocked_users user:read:email";
      break;
    case "moderator":
      scope =
        "user:edit user:read:follows user:read:email user:read:moderated_channels user:read:blocked_users moderation:read";
      break;
    case "creator":
      scope =
        "user:edit user:read:follows user:read:blocked_users user:read:email user:read:moderated_channels moderation:read channel:read:editors";
      break;
    default:
      scope =
        "user:edit user:read:follows user:read:blocked_users user:read:email ";
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

export const getUserData = async (accessToken: string) => {
  const response = await axios.get(USER_URL, {
    headers: {
      "Client-ID": TWITCH_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const getModeratedChannels = async (
  accessToken: string,
  user_id: string
) => {
  let allModeratedChannels = [];
  let cursor = null;

  while (true) {
    const response: AxiosResponse = await axios.get(MODERATED_URL, {
      params: {
        user_id: user_id,
        first: 100,
        after: cursor,
      },
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { data, pagination } = response.data;

    allModeratedChannels.push(...data);

    if (!pagination || Object.keys(pagination).length === 0) break;

    cursor = pagination.cursor;
  }

  return allModeratedChannels;
};

export const getBlockedUsers = async (
  accessToken: string,
  broadcaster_id: string
) => {
  let allBlockedUsers = [];
  let cursor = null;

  while (true) {
    const response: AxiosResponse = await axios.get(BLOCKED_USERS_URL, {
      params: {
        broadcaster_id: broadcaster_id,
        first: 100,
        after: cursor,
      },
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { data, pagination } = response.data;

    allBlockedUsers.push(...data);

    if (!pagination || Object.keys(pagination).length === 0) break;

    cursor = pagination.cursor;
  }

  return allBlockedUsers;
};

export const getBlockedTerms = async (
  accessToken: string,
  broadcaster_id: string,
  moderator_id: string
) => {
  let allBlockedTerms = [];
  let cursor = null;

  while (true) {
    const response: AxiosResponse = await axios.get(TERMS_URL, {
      params: {
        broadcaster_id: broadcaster_id,
        moderator_id: moderator_id,
        first: 100,
        after: cursor,
      },
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { data, pagination } = response.data;

    allBlockedTerms.push(...data);

    if (!pagination || Object.keys(pagination).length === 0) break;

    cursor = pagination.cursor;
  }

  return allBlockedTerms;
};
