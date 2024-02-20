import { Prisma } from "@prisma/client";

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const userEmail: Prisma.UserSelect = {
  email: true,
};
async function createUser(userData: Omit<User, "id">): Promise<User> {
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
      throw new Error(`User with same Twitch ID or YouTube ID already exists`);
    }

    const userDataWithType = {
      ...userData,
    };

    const newUser = await prisma.user.create({
      data: userDataWithType,
    });
    return newUser;
  } catch (error) {
    throw new Error(`Failed to create user:`);
  }
}

module.exports = { createUser };
