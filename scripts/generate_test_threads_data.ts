import { faker } from "@faker-js/faker";
import { PrismaClient, Thread, Clip } from "@prisma/client";
import chalk from "chalk";

import { ClipWithoutId, ThreadWithoutId, ThreadClipWithoutId } from "./types";

const prisma = new PrismaClient();

createThreads();

async function createThreads() {
  try {
    const users = await prisma.user.findMany({ select: { id: true } });

    for (const user of users) {
      const threads = await generateThreadsData(user.id);
      await generateClipsAndLinkThreads(threads);
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
      const newThread = await prisma.thread.create({ data: thread });
      threads.push(newThread);
    } catch (error) {
      throw new Error(`Thread creation failed: ${error}`);
    }
  }

  return threads;
}

async function generateClipsAndLinkThreads(threads: Thread[]) {
  for (const thread of threads) {
    const clip: ClipWithoutId = {
      broadcasterId: faker.string.numeric(9),
      broadcasterName: faker.person.fullName(),
      clipId: faker.string.numeric(5),
      creatorId: thread.authorId,
      creatorName: faker.person.fullName(),
      description: faker.lorem.paragraph(),
      embedUrl: faker.internet.url(),
      gameId: faker.string.numeric(4),
      tagId: faker.string.numeric(5),
      thumbUrl: faker.internet.url(),
      url: faker.internet.url(),
      viewCount: faker.number.int({ max: 10000 }),
    };

    const newClip: Clip = await prisma.clip.create({ data: clip });

    const threadClip: ThreadClipWithoutId = {
      clipId: newClip.id,
      threadId: thread.id,
    };

    await prisma.threadClip.create({ data: threadClip });
  }
}
