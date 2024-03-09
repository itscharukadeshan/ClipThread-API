import { encryptData } from "./encryptDecryptUtils";
import {
  TwitchUserReturn,
  YouTubeUserReturn,
  TwitchAuthWithoutId,
  YouTubeAuthWithoutId,
  UserWithoutId,
} from "./types";

import { getScopeType } from "./checkScope";
import moment from "moment";

export function formatUserDataFromTwitch(
  userAuthData: any,
  userDataResponse: any
): TwitchUserReturn {
  const accessToken = userAuthData.access_token;
  const refreshToken = userAuthData.refresh_token;
  const expires_in = userAuthData.expires_in;
  const userData = userDataResponse.data[0];
  const email = userData.email;
  const id = userData.id;
  const scope = userAuthData.scope;
  const scopeType = getScopeType(scope);

  const {
    display_name,
    type,
    broadcaster_type,
    description,
    profile_image_url,
    offline_image_url,
    view_count,
    created_at,
    followers,
  } = userData;

  if (!email || !accessToken || !refreshToken) {
    console.log(email, accessToken, refreshToken);
    throw new Error("Email, accessToken, or refreshToken missing");
  }

  const encryptedAccessToken = encryptData(accessToken);
  const encryptedRefreshToken = encryptData(refreshToken);
  const encryptedEmail = encryptData(email);

  const expiryTimeInSeconds = expires_in;
  const expirationTime = new Date(Date.now() + expiryTimeInSeconds * 1000);

  const userDataObject: UserWithoutId = {
    twitchId: id,
    displayName: display_name,
    type,
    broadcasterType: broadcaster_type,
    description,
    profileImageUrl: profile_image_url,
    offlineImageUrl: offline_image_url,
    viewCount: view_count,
    createdAt: created_at,
    updatedAt: moment().toDate(),
    followers: followers || 0,
    email: encryptedEmail,
    youtubeId: null,
    login: scopeType,
    moderatedChannels: [],
    blockedUsers: [],
    blockedTerms: [],
    whitelist: [],
    blacklist: [],
    refreshToken: "",
  };

  const authDataObject: TwitchAuthWithoutId = {
    accessToken: encryptedAccessToken,
    refreshToken: encryptedRefreshToken,
    expiryTime: expirationTime,
  };

  return { userData: userDataObject, twitchAuth: authDataObject };
}

export function formatUserDataFromYouTube(
  authData: any,
  userDataResponse: any,
  channelData: any
) {
  const encryptedEmail = encryptData(userDataResponse.email);
  const refreshToken = encryptData(authData.refresh_token);
  const accessToken = encryptData(authData.access_token);
  const userData = channelData.items[0];

  const expiryTimeInSeconds = authData.expires_in;
  const expirationTime = new Date(Date.now() + expiryTimeInSeconds * 1000);

  const { id, customUrl, publishedAt } = userData;

  const { title, description } = userData.snippet;
  const profileImageUrl = userDataResponse.picture;

  const userDataObject: UserWithoutId = {
    twitchId: null,
    displayName: title,
    type: customUrl,
    broadcasterType: "",
    description,
    profileImageUrl: profileImageUrl,
    offlineImageUrl: profileImageUrl,
    viewCount: 0,
    createdAt: publishedAt,
    updatedAt: moment().toDate(),
    followers: 0,
    email: encryptedEmail,
    youtubeId: id,
    login: "user",
    moderatedChannels: [],
    blockedUsers: [],
    blockedTerms: [],
    whitelist: [],
    blacklist: [],
    refreshToken: "",
  };

  const authDataObject: YouTubeAuthWithoutId = {
    accessToken: accessToken,
    refreshToken: refreshToken,
    expiryTime: expirationTime,
  };

  return { userData: userDataObject, youtubeAuth: authDataObject };
}
