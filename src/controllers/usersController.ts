/** @format */

import { User, PrismaClient, RevokedTokens } from "@prisma/client";
import {
  UserWithoutId,
  TwitchAuthWithoutId,
  YoutubeAuthWithoutId,
  UserWithAuth,
} from "./interface/types";
import moment from "moment";
import ApplicationError from "../errors/applicationError";

const prisma = new PrismaClient();
export async function createUser(
  userData: UserWithoutId,
  twitchAuth?: TwitchAuthWithoutId | undefined,
  youtubeAuth?: YoutubeAuthWithoutId | undefined
): Promise<UserWithAuth | null> {
  if (!twitchAuth && !youtubeAuth) {
    throw new ApplicationError("Missing auth data", 401);
  }

  try {
    const user = await prisma.user.create({
      data: userData,
    });

    if (!user) {
      throw new ApplicationError("Unable to create user", 400);
    }

    if (twitchAuth && userData.twitchId) {
      const auth = await prisma.twitchAuth.create({
        data: {
          user: { connect: { id: user.id } },
          ...twitchAuth,
        },
      });
      if (!auth) {
        throw new ApplicationError("Unable to create user", 400);
      }
    } else if (youtubeAuth && userData.youtubeId) {
      const auth = await prisma.youTubeAuth.create({
        data: {
          user: { connect: { id: user.id } },
          ...youtubeAuth,
        },
      });

      if (!auth) {
        throw new ApplicationError("Unable to create user", 400);
      }
    } else {
      throw new ApplicationError("Missing auth data", 401);
    }

    const userWithAuthData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        twitchAuth: true,
        youtubeAuth: true,
      },
    });

    if (!userWithAuthData) {
      return null;
    }

    return userWithAuthData;
  } catch (error) {
    throw error;
  }
}

export async function updateUser(
  userId: string,
  userData: Partial<User>
): Promise<User | null> {
  try {
    const updatedUserData = {
      ...userData,
      updatedAt: moment().toDate(),
    };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatedUserData,
    });
    if (!updatedUser) {
      throw new ApplicationError("Unable to update user data", 400);
    }
    return updatedUser;
  } catch (error) {
    throw error;
  }
}
export async function getUserById(userId: string) {
  try {
    const foundUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!foundUser) {
      return null;
    }

    return foundUser;
  } catch (error) {
    throw error;
  }
}

/**
 * @openapi
 * components:
 *   schemas:
 *     Public_User_Data:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         displayName:
 *           type: string
 *         description:
 *           type: string
 *         profileImageUrl:
 *           type: string
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         login:
 *           type: string
 *         followers:
 *           type: integer
 *         viewCount:
 *           type: integer
 */

export async function getPublicUserDataById(userId: string) {
  try {
    const foundUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        description: true,
        profileImageUrl: true,
        updatedAt: true,
        login: true,
        followers: true,
        viewCount: true,
      },
    });

    if (!foundUser) {
      return null;
    }

    return foundUser;
  } catch (error) {
    throw error;
  }
}

export async function getUserByRefreshToken(refreshToken: string) {
  try {
    const foundUser = await prisma.user.findUnique({
      where: { refreshToken: refreshToken },
    });
    if (!foundUser) {
      return null;
    }
    return foundUser;
  } catch (error) {
    throw error;
  }
}

export async function getUserByTwitchId(twitchId: string | null) {
  try {
    if (twitchId === null) {
      return null;
    }

    const foundUser = await prisma.user.findUnique({
      where: { twitchId: twitchId },
    });

    if (!foundUser) {
      return null;
    }

    return foundUser;
  } catch (error) {
    throw error;
  }
}

export async function getUserByYoutubeId(youtubeId: string | null) {
  try {
    if (youtubeId === null) {
      return null;
    }

    const foundUser = await prisma.user.findUnique({
      where: { youtubeId: youtubeId },
    });

    if (!foundUser) {
      return null;
    }

    return foundUser;
  } catch (error) {
    throw error;
  }
}

export async function revokeCurrentToken(
  refreshToken: string
): Promise<RevokedTokens | null> {
  try {
    if (refreshToken.length === 0) {
      return null;
    }
    const token = await prisma.revokedTokens.create({
      data: { id: refreshToken, expired: false },
    });

    if (!token) {
      throw new ApplicationError("Internal Server Error", 500);
    }

    return token;
  } catch (error) {
    throw error;
  }
}

export async function getRevokedTokens(): Promise<Partial<RevokedTokens>[]> {
  try {
    const revokedTokens = await prisma.revokedTokens.findMany({
      where: { expired: false },
      select: {
        id: true,
      },
    });

    if (!revokedTokens) {
      throw new ApplicationError("No revoked token found", 400);
    }
    return revokedTokens;
  } catch (error) {
    throw error;
  }
}
