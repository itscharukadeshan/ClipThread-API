import { User, UserRole } from "@prisma/client";
import { UserWithoutId, YouTubeAuthWithoutId } from "./interface/types/types";
import {
  createUser,
  getUserByYoutubeId,
  revokeCurrentToken,
  updateUser,
} from "../controllers/usersController";
import { generateAccessToken, generateRefreshToken } from "./generateTokens";
import ApplicationError from "../errors/applicationError";

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
        throw new ApplicationError("Failed to create user", 400);
      }

      newAccessToken = generateAccessToken(user.id, user.login);
      newRefreshToken = generateRefreshToken();

      user = await updateUser(user.id, {
        refreshToken: newRefreshToken,
      });

      // deepcode ignore DuplicateIfBody: <For future impletion>
    } else if (scope === UserRole.moderator) {
      user = await createUser(userData, undefined, youtubeAuth);
      if (user === null) {
        throw new ApplicationError("Failed to create user", 400);
      }

      newAccessToken = generateAccessToken(user.id, user.login);
      newRefreshToken = generateRefreshToken();

      user = await updateUser(user.id, {
        refreshToken: newRefreshToken,
      });

      // deepcode ignore DuplicateIfBody: <For future impletion>
    } else if (scope === UserRole.creator) {
      user = await createUser(userData, undefined, youtubeAuth);

      if (user === null) {
        throw new ApplicationError("Failed to create user", 400);
      }

      newAccessToken = generateAccessToken(user.id, user.login);
      newRefreshToken = generateRefreshToken();

      user = await updateUser(user.id, {
        refreshToken: newRefreshToken,
      });
    } else {
      throw new ApplicationError(`Invalid user role`, 401);
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
      throw error;
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
      throw new ApplicationError("Failed to update user", 400);
    }
  } else {
    throw new ApplicationError(
      `Something went wrong while trying to create user`,
      400
    );
  }

  return { newAccessToken, user };
};

export default handelYoutubeUser;
