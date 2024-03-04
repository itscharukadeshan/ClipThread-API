import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const depopulateDatabase = async () => {
  await prisma.twitchAuth.deleteMany({});
  await prisma.youTubeAuth.deleteMany({});
  await prisma.thread.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("Database depopulated");
};

async function depopulate() {
  await depopulateDatabase();
  await prisma.$disconnect();
}

export default depopulate;
