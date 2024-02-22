import { encryptData } from "./encryptDecryptUtils";
import { CreateUserReturn } from "./types";

export function formatUserDataFromTwitch(
  userAuthData: any,
  userDataResponse: any
): CreateUserReturn {
  const accessToken = userAuthData.access_token;
  const refreshToken = userAuthData.refresh_token;
  const expires_in = userAuthData.expires_in;
  const userData = userDataResponse.data.data[0];
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

  const userDataObject = {
    twitchId: id,
    displayName: display_name,
    type,
    broadcasterType: broadcaster_type,
    description,
    profileImageUrl: profile_image_url,
    offlineImageUrl: offline_image_url,
    viewCount: view_count,
    createdAt: created_at,
    followers: followers || 0,
    email: encryptedEmail,
    youtubeId: "",
    login: "",
  };

  const authDataObject = {
    accessToken: encryptedAccessToken,
    refreshToken: encryptedRefreshToken,
    expiryTime: expires_in,
    userId: id,
  };

  return { userData: userDataObject, twitchAuth: authDataObject };
}
