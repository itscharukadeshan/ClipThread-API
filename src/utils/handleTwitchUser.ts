import { User, UserRole } from "@prisma/client";
import { TwitchAuthWithoutId, UserWithoutId } from "./types";
import {
  getUserByTwitchId,
  updateUser,
  revokeCurrentToken,
} from "../controllers/usersController";
import {
  handleTwitchCreatorScope,
  handleTwitchModeratorScope,
  handleTwitchUserScope,
} from "./authUtils";
import {
  getBlockedUsers,
  getModeratedChannels,
} from "../services/twitchAuth.services";
import { generateAccessToken, generateRefreshToken } from "./generateTokens";

const handleTwitchUser = async (
  userData: UserWithoutId,
  twitchAuth: TwitchAuthWithoutId,
  accessToken: string,
  scope: UserRole
) => {
  let newAccessToken: string = "";
  let user: User | null | undefined;
  let newRefreshToken, blockedUsers, moderatedChannels;

  const existingUser = await getUserByTwitchId(userData.twitchId);

  if (!existingUser) {
    if (scope === UserRole.user) {
      ({ user, newAccessToken } = await handleTwitchUserScope(
        userData,
        twitchAuth,
        accessToken
      ));
    } else if (scope === UserRole.moderator) {
      ({ user, newAccessToken } = await handleTwitchModeratorScope(
        userData,
        twitchAuth,
        accessToken
      ));
    } else if (scope === UserRole.creator) {
      ({ user, newAccessToken } = await handleTwitchCreatorScope(
        userData,
        twitchAuth,
        accessToken
      ));
    } else {
      throw new Error("Invalid user role");
    }
  } else if (existingUser && scope === existingUser.login) {
    if (existingUser.login === UserRole.user) {
      try {
        blockedUsers = await getBlockedUsers(
          accessToken,
          existingUser.twitchId as string
        );

        newAccessToken = generateAccessToken(
          existingUser.id,
          existingUser.login
        );
        newRefreshToken = generateRefreshToken();

        await revokeCurrentToken(existingUser.refreshToken);

        user = await updateUser(existingUser.id, {
          blockedUsers,
          refreshToken: newRefreshToken,
        });
      } catch (error) {
        throw new Error("User creating failed");
      }
    } else if (existingUser.login === UserRole.moderator) {
      try {
        blockedUsers = await getBlockedUsers(
          accessToken,
          existingUser.twitchId as string
        );
        moderatedChannels = await getModeratedChannels(
          accessToken,
          existingUser.twitchId as string
        );

        newAccessToken = generateAccessToken(
          existingUser.id,
          existingUser.login
        );
        newRefreshToken = generateRefreshToken();

        await revokeCurrentToken(existingUser.refreshToken);

        user = await updateUser(existingUser.id, {
          blockedUsers,
          moderatedChannels,
          refreshToken: newRefreshToken,
        });
      } catch (error) {
        throw new Error("User creating failed");
      }
    } else if (existingUser.login === UserRole.creator) {
      try {
        blockedUsers = await getBlockedUsers(
          accessToken,
          existingUser.twitchId as string
        );
        newAccessToken = generateAccessToken(
          existingUser.id,
          existingUser.login
        );
        newRefreshToken = generateRefreshToken();

        await revokeCurrentToken(existingUser.refreshToken);

        user = await updateUser(existingUser.id, {
          blockedUsers,
          refreshToken: newRefreshToken,
        });
      } catch (error) {
        throw new Error("User creating failed");
      }
    } else {
      throw new Error("Invalid user role");
    }
  } else if (existingUser && scope !== existingUser.login) {
    if (scope === UserRole.user) {
      try {
        blockedUsers = await getBlockedUsers(
          accessToken,
          existingUser.twitchId as string
        );

        newAccessToken = generateAccessToken(
          existingUser.id,
          existingUser.login
        );
        newRefreshToken = generateRefreshToken();

        await revokeCurrentToken(existingUser.refreshToken);

        user = await updateUser(existingUser.id, {
          login: scope,
          blockedUsers,
          refreshToken: newRefreshToken,
        });
      } catch (error) {
        throw new Error("User creating failed");
      }
    } else if (scope === UserRole.moderator) {
      try {
        blockedUsers = await getBlockedUsers(
          accessToken,
          existingUser.twitchId as string
        );
        moderatedChannels = await getModeratedChannels(
          accessToken,
          existingUser.twitchId as string
        );

        newAccessToken = generateAccessToken(
          existingUser.id,
          existingUser.login
        );
        newRefreshToken = generateRefreshToken();

        await revokeCurrentToken(existingUser.refreshToken);

        user = await updateUser(existingUser.id, {
          login: scope,
          blockedUsers,
          moderatedChannels,
          refreshToken: newRefreshToken,
        });
      } catch (error) {
        throw new Error("User creating failed");
      }
    } else if (scope === UserRole.creator) {
      try {
        blockedUsers = await getBlockedUsers(
          accessToken,
          existingUser.twitchId as string
        );
        newAccessToken = generateAccessToken(
          existingUser.id,
          existingUser.login
        );
        newRefreshToken = generateRefreshToken();

        await revokeCurrentToken(existingUser.refreshToken);

        user = await updateUser(existingUser.id, {
          login: scope,
          blockedUsers,
          refreshToken: newRefreshToken,
        });
      } catch (error) {
        throw new Error("User creating failed");
      }
    } else {
      throw new Error("Invalid user role");
    }
  } else {
    throw new Error(`Something went wrong while trying to create user`);
  }

  return { newAccessToken, user };
};

export default handleTwitchUser;
