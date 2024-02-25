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
  console.log({ userData, twitchAuth, youtubeAuth });

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

    const newUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    return newUser;
  } catch (error) {
    throw new Error(`Failed to create user: ${error}`);
  }
}

module.exports = { createUser };
