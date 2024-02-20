const { PrismaClient } = require("@prisma/client");

import { User } from "./types";

const prisma = new PrismaClient();
export async function createUser(userData: Omit<User, "id">): Promise<User> {
  try {
    const newUser = await prisma.user.create({
      data: userData,
    });
    return newUser;
  } catch (error: any) {
    throw new Error(`Failed to create user:${error}`);
  }
}

module.exports = { createUser };
