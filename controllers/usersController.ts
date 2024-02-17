// userController.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createUser(userData: {}) {
  try {
    const newUser = await prisma.user.create({
      data: userData,
    });
    return newUser;
  } catch (error) {
    throw new Error(`Failed to create user:`);
  }
}

module.exports = { createUser };
