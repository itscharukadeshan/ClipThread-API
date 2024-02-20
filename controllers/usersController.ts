const { PrismaClient } = require("@prisma/client");

import { User } from "./types";

const prisma = new PrismaClient();
export async function createUser(userData: Omit<User, "id">): Promise<User> {
  try {
    const existingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { twitchId: userData.twitchId },
          { youtubeId: userData.youtubeId },
        ],
      },
    });

    if (existingUsers.length > 0) {
      throw new Error(`User with same Twitch or YouTube already exists`);
    }

    const newUser = await prisma.user.create({
      data: userData,
    });
    return newUser;
  } catch (error) {
    throw new Error(`Failed to create user:`);
  }
}

module.exports = { createUser };
