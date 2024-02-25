import { encryptData } from "./encryptDecryptUtils";
import {
  TwitchUserReturn,
  YouTubeUserReturn,
  TwitchAuthWithoutId,
  UserWithoutId,
} from "./types";

// TODO Add login type by checking the userData.scope [] and add login to enum => user | moderator | creator
// TODO Update the login to take enum in prisma and Update auth tables to take relevant data
// TODO ADD data to Twitch or youtube auth data

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
    updatedAt: created_at,
    followers: followers || 0,
    email: encryptedEmail,
    youtubeId: "",
    login: "",
  };

  const authDataObject: TwitchAuthWithoutId = {
    accessToken: encryptedAccessToken,
    refreshToken: encryptedRefreshToken,
    expiryTime: expirationTime,
  };

  return { userData: userDataObject, twitchAuth: authDataObject };
}

export function formatUserDataFromYouTube() {}
