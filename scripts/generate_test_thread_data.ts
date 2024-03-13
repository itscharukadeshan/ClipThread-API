import { faker } from "@faker-js/faker";
import { PrismaClient, Thread } from "@prisma/client";
import chalk from "chalk";

import { BroadcasterIds, ThreadWithoutId } from "./types";

const prisma = new PrismaClient();

createThreads();

async function createThreads() {
  try {
    const users = await prisma.user.findMany({ select: { id: true } });

    for (const user of users) {
      const threads = await generateThreadsData(user.id);
    }

    console.log(chalk.green.bold(`Thread example data added`));
  } catch (error) {
    console.error(`Something went wrong: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function generateThreadsData(userId: string): Promise<Thread[]> {
  const threadsCount = Math.floor(Math.random() * 4) + 5;
  const threads: Thread[] = [];

  const broadcasters: BroadcasterIds = await prisma.broadcasters.findMany({
    select: { id: true },
  });
  const broadcastersLength = broadcasters.length - 1 || 100;

  for (let i = 0; i < threadsCount; i++) {
    const thread: ThreadWithoutId = {
      authorId: userId,
      createdAt: faker.date.recent(),
      description: faker.lorem.paragraph(),
      published: faker.datatype.boolean(),
      publishedTime: faker.date.recent(),
      title: faker.lorem.sentence(),
      updatedAt: faker.date.recent(),
    };

    try {
      const newThread = await prisma.thread.create({
        data: {
          ...thread,
          broadcasters: {
            connect: [
              {
                id: broadcasters[
                  faker.number.int({ min: 1, max: broadcastersLength })
                ].id,
              },
              {
                id: broadcasters[
                  faker.number.int({ min: 1, max: broadcastersLength })
                ].id,
              },
              {
                id: broadcasters[
                  faker.number.int({ min: 1, max: broadcastersLength })
                ].id,
              },
              {
                id: broadcasters[
                  faker.number.int({ min: 1, max: broadcastersLength })
                ].id,
              },
              {
                id: broadcasters[
                  faker.number.int({ min: 1, max: broadcastersLength })
                ].id,
              },
            ],
          },
        },
      });
      threads.push(newThread);
    } catch (error) {
      throw new Error(`Thread creation failed: ${error}`);
    }
  }

  return threads;
}
