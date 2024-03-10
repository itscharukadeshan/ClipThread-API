import { PrismaClient } from "@prisma/client";
import chalk from "chalk";

const prisma = new PrismaClient();

const depopulateDatabase = async () => {
  await prisma.twitchAuth.deleteMany({});
  await prisma.youTubeAuth.deleteMany({});
  await prisma.thread.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.revokedTokens.deleteMany({});
  console.log(chalk.green(`Depopulated database`));
};

depopulateDatabase();
