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
import { TwitchAuthWithoutId, UserWithoutId } from "./interface/types/types";
import ApplicationError from "../errors/applicationError";
import chalk from "chalk";

export const handleTwitchUserScope = async (
  userData: UserWithoutId,
  twitchAuth: TwitchAuthWithoutId,
  accessToken: string
) => {
  try {
    let newUser, blockedUsers, user, newRefreshToken, newAccessToken;

    newUser = await createUser(userData, twitchAuth);

    if (!newUser) {
      throw new ApplicationError("Failed to create user", 400);
    }

    blockedUsers = await getBlockedUsers(
      accessToken,
      newUser.twitchId as string
    );

    newAccessToken = generateAccessToken(newUser.id, newUser.login);
    newRefreshToken = generateRefreshToken();

    user = await updateUser(newUser.id, {
      blockedUsers,
      refreshToken: newRefreshToken,
    });

    return { user, newAccessToken };
  } catch (error) {
    throw error;
  }
};

export const handleTwitchModeratorScope = async (
  userData: UserWithoutId,
  twitchAuth: TwitchAuthWithoutId,
  accessToken: string
) => {
  try {
    let newUser,
      blockedUsers,
      moderatedChannels,
      user,
      newRefreshToken,
      newAccessToken;

    newUser = await createUser(userData, twitchAuth);
    if (!newUser) {
      throw new ApplicationError("Failed to create user", 400);
    }

    blockedUsers = await getBlockedUsers(
      accessToken,
      newUser.twitchId as string
    );
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
  } catch (error) {
    throw error;
  }
};

export const handleTwitchCreatorScope = async (
  userData: UserWithoutId,
  twitchAuth: TwitchAuthWithoutId,
  accessToken: string
) => {
  let newUser, blockedUsers, user, newRefreshToken, newAccessToken;

  newUser = await createUser(userData, twitchAuth);
  if (!newUser) {
    throw new ApplicationError("Failed to create user", 400);
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
    const decoded: any = jwt.verify(token, secretKey);
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    if (decoded.exp && decoded.exp < currentTimeInSeconds) {
      return null;
    }

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
    if (process.env.NODE_ENV === "development" && err) {
      console.error(`${chalk.red(err)}`);
    }
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
