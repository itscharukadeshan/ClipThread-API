import { User, PrismaClient } from "@prisma/client";
import {
  UserWithoutId,
  TwitchAuthWithoutId,
  YoutubeAuthWithoutId,
  UserWithAuth,
} from "./types";

const prisma = new PrismaClient();
export async function createUser(
  userData: UserWithoutId,
  twitchAuth?: TwitchAuthWithoutId,
  youtubeAuth?: YoutubeAuthWithoutId
): Promise<UserWithAuth | null> {
  try {
    const user = await prisma.user.create({
      data: userData,
    });

    if (twitchAuth && userData.twitchId) {
      await prisma.twitchAuth.create({
        data: {
          user: { connect: { id: user.id } },
          ...twitchAuth,
        },
      });
    } else if (youtubeAuth && userData.youtubeId) {
      await prisma.youTubeAuth.create({
        data: {
          user: { connect: { id: user.id } },
          ...youtubeAuth,
        },
      });
    } else {
      throw new Error(`User auth data not found`);
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
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userData,
    });
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}
export async function getUser(userId: string) {
  try {
    const foundUser = await prisma.user.findUnique({ where: { id: userId } });

    return foundUser;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}
