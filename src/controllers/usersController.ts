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
    throw new ApplicationError("Missing auth data", 400);
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
      throw new ApplicationError("Missing auth data", 400);
    }

    const userWithAuthData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        twitchAuth: true,
        youtubeAuth: true,
      },
    });

    return userWithAuthData;
  } catch (error) {
    throw new Error(`Failed to create user: ${error}`);
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
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}
export async function getUserById(userId: string) {
  try {
    const foundUser = await prisma.user.findUnique({ where: { id: userId } });

    return foundUser;
  } catch (error) {
    return null;
  }
}

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

    return foundUser;
  } catch (error) {
    return null;
  }
}

export async function getUserByRefreshToken(refreshToken: string) {
  try {
    const foundUser = await prisma.user.findUnique({
      where: { refreshToken: refreshToken },
    });

    return foundUser;
  } catch (error) {
    return null;
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

    return foundUser;
  } catch (error) {
    return null;
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

    return foundUser;
  } catch (error) {
    return null;
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

    return token;
  } catch (error) {
    return null;
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
    return revokedTokens;
  } catch (error) {
    throw new Error(`Internal server Error : ${error}`);
  }
}
