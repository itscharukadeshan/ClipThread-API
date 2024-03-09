import {
  createUser,
  updateUser,
  getRevokedTokens,
} from "../controllers/usersController";
import {
  getBlockedUsers,
  getModeratedChannels,
} from "../services/twitchAuth.services";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "./generateTokens";
import { TwitchAuthWithoutId, UserWithoutId } from "./types";

export const handleTwitchUserScope = async (
  userData: UserWithoutId,
  twitchAuth: TwitchAuthWithoutId,
  accessToken: string
) => {
  let newUser, blockedUsers, user, newRefreshToken, newAccessToken;

  newUser = await createUser(userData, twitchAuth);

  if (!newUser) {
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

export const handleTwitchModeratorScope = async (
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
  if (!newUser) {
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

export const handleTwitchCreatorScope = async (
  userData: UserWithoutId,
  twitchAuth: TwitchAuthWithoutId,
  accessToken: string
) => {
  let newUser, blockedUsers, user, newRefreshToken, newAccessToken;

  newUser = await createUser(userData, twitchAuth);
  if (!newUser) {
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

export function verifyToken(token: string, secretKey: string) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(refreshToken: string, secretKey: string) {
  try {
    jwt.verify(refreshToken, secretKey);
    return true;
  } catch (err) {
    return false;
  }
}

export async function checkRefTokenValidity(
  refreshToken: string
): Promise<boolean> {
  const revokedTokens = await getRevokedTokens();

  for (const revokedToken of revokedTokens) {
    if (revokedToken.id === refreshToken) {
      return false;
    }
  }

  return true;
}
