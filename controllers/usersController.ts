const { PrismaClient } = require("@prisma/client");
import { User } from "@prisma/client";
import {
  UserWithoutId,
  TwitchAuthWithoutId,
  YoutubeAuthWithoutId,
} from "./types";

const prisma = new PrismaClient();
export async function createUser(
  userData: UserWithoutId,
  twitchAuth?: TwitchAuthWithoutId,
  youtubeAuth?: YoutubeAuthWithoutId
): Promise<User> {
  try {
    const user = await prisma.user.create({
      data: userData,
    });

    if (twitchAuth && youtubeAuth) {
      throw new Error(
        "Something went wrong please try again : Missing authCredentials"
      );
    }

    if (twitchAuth) {
      await prisma.twitchAuth.create({
        data: {
          user: { connect: { id: user.id } },
          ...twitchAuth,
        },
      });
    }

    if (youtubeAuth) {
      await prisma.youtubeAuth.create({
        data: {
          user: { connect: { id: user.id } },
          ...youtubeAuth,
        },
      });
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
