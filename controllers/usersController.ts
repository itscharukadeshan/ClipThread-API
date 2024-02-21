const { PrismaClient } = require("@prisma/client");
import { User } from "../prisma/client";

const prisma = new PrismaClient();
export async function createUser(userData: User): Promise<User> {
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
