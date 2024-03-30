import { User, UserRole } from "@prisma/client";
import { UserWithoutId, YouTubeAuthWithoutId } from "./interface/types/types";
import {
  createUser,
  getUserByYoutubeId,
  revokeCurrentToken,
  updateUser,
} from "../controllers/usersController";
import { generateAccessToken, generateRefreshToken } from "./generateTokens";

const handelYoutubeUser = async (
  userData: UserWithoutId,
  youtubeAuth: YouTubeAuthWithoutId,
  scope: UserRole
) => {
  let user: User | null;
  let newAccessToken: string = "";
  let newRefreshToken: string;
  const existingUser = await getUserByYoutubeId(userData.youtubeId);

  if (!existingUser) {
    if (scope === UserRole.user) {
      user = await createUser(userData, undefined, youtubeAuth);
      if (user === null) {
        throw new Error("Failed to create user");
      }
      // deepcode ignore DuplicateIfBody: <For future impletion>
    } else if (scope === UserRole.moderator) {
      user = await createUser(userData, undefined, youtubeAuth);
      if (user === null) {
        throw new Error("Failed to create user");
      }

      // deepcode ignore DuplicateIfBody: <For future impletion>
    } else if (scope === UserRole.creator) {
      user = await createUser(userData, undefined, youtubeAuth);
      if (user === null) {
        throw new Error("Failed to create user");
      }
    } else {
      throw new Error(`Invalid user role`);
    }
  } else if (existingUser && scope === existingUser.login) {
    try {
      newAccessToken = generateAccessToken(existingUser.id, existingUser.login);
      newRefreshToken = generateRefreshToken();

      await revokeCurrentToken(existingUser.refreshToken);

      user = await updateUser(existingUser.id, {
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      throw new Error("Failed to update user");
    }
  } else if (existingUser && scope !== existingUser.login) {
    try {
      existingUser.login = scope;
      newAccessToken = generateAccessToken(existingUser.id, existingUser.login);
      newRefreshToken = generateRefreshToken();

      await revokeCurrentToken(existingUser.refreshToken);

      user = await updateUser(existingUser.id, {
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      throw new Error("Failed to update user");
    }
  } else {
    throw new Error(`Something went wrong while trying to create user`);
  }

  return { newAccessToken, user };
};

export default handelYoutubeUser;
