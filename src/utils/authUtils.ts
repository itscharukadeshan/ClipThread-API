import { createUser, updateUser } from "../controllers/usersController";
import {
  getBlockedUsers,
  getModeratedChannels,
} from "../services/twitch/twitchAuth.service";
import { generateAccessToken, generateRefreshToken } from "./generateTokens";
import { TwitchAuthWithoutId, UserWithoutId } from "./types";

export const handleUserScope = async (
  userData: UserWithoutId,
  twitchAuth: TwitchAuthWithoutId,
  accessToken: string
) => {
  let newUser, blockedUsers, user, newRefreshToken, newAccessToken;

  newUser = await createUser(userData, twitchAuth);
  if (newUser === null) {
    throw new Error("Failed to create user");
  }
  blockedUsers = await getBlockedUsers(accessToken, newUser.twitchId as string);
  newAccessToken = generateAccessToken(newUser.id, newUser.login);
  newRefreshToken = generateRefreshToken();

  user = await updateUser(newUser.id, {
    blockedUsers,
    refreshToken: newRefreshToken,
  });

  return { user, newAccessToken };
};

export const handleModeratorScope = async (
  userData: UserWithoutId,
  twitchAuth: TwitchAuthWithoutId,
  accessToken: string
) => {
  let newUser,
    blockedUsers,
    moderatedChannels,
    user,
    newRefreshToken,
    newAccessToken;

  newUser = await createUser(userData, twitchAuth);
  if (newUser === null) {
    throw new Error("Failed to create user");
  }
  blockedUsers = await getBlockedUsers(accessToken, newUser.twitchId as string);
  moderatedChannels = await getModeratedChannels(
    accessToken,
    newUser.twitchId as string
  );
  newAccessToken = generateAccessToken(newUser.id, newUser.login);
  newRefreshToken = generateRefreshToken();

  user = await updateUser(newUser.id, {
    blockedUsers,
    moderatedChannels,
    refreshToken: newRefreshToken,
  });

  return { user, newAccessToken };
};

export const handleCreatorScope = async (
  userData: UserWithoutId,
  twitchAuth: TwitchAuthWithoutId,
  accessToken: string
) => {
  let newUser, blockedUsers, user, newRefreshToken, newAccessToken;

  newUser = await createUser(userData, twitchAuth);
  if (newUser === null) {
    throw new Error("Failed to create user");
  }
  blockedUsers = await getBlockedUsers(accessToken, newUser.twitchId as string);
  newAccessToken = generateAccessToken(newUser.id, newUser.login);
  newRefreshToken = generateRefreshToken();

  user = await updateUser(newUser.id, {
    blockedUsers,
    refreshToken: newRefreshToken,
  });

  return { user, newAccessToken };
};
