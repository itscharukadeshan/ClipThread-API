const { PrismaClient } = require("@prisma/client");
import { User } from "../prisma/client";
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

    // TODO - Fix the auth  flow

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

    // TODO - Find a way to get the users data before update the user auth

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
