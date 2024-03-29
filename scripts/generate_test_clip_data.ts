import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import chalk from "chalk";

import { ClipWithoutId } from "./types";

const prisma = new PrismaClient();

createClips();

async function createClips() {
  console.log(`${chalk.green("This takes while[1-4 minutes]")}`);
  console.log(
    `${chalk.green("you can start building now. some clips are already in the database")}`
  );

  try {
    const threads = await prisma.thread.findMany({ select: { id: true } });

    for (const thread of threads) {
      await generateClipsData(thread.id);
    }

    console.log(chalk.green.bold(`Clip example data added`));
  } catch (error) {
    console.error(`Something went wrong: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function generateClipsData(threadId: string): Promise<void> {
  const ClipsCount = Math.floor(Math.random() * 4) + 5;

  for (let i = 0; i < ClipsCount; i++) {
    const clip: ClipWithoutId = {
      broadcasterId: faker.string.numeric(8),
      broadcasterName: faker.person.firstName(),
      clipId: faker.string.numeric(5),
      creatorId: faker.string.numeric(5),
      creatorName: faker.string.numeric(6),
      description: faker.lorem.paragraph(),
      embedUrl: faker.internet.url(),
      gameId: faker.string.numeric(3),
      tagId: null,
      thumbUrl: faker.internet.url(),
      url: faker.internet.url(),
      viewCount: faker.number.int({ max: 10000 }),
      order: i + 1,
    };

    try {
      await prisma.clip.create({
        data: {
          ...clip,
          thread: {
            connect: [{ id: threadId }],
          },
        },
      });
    } catch (error) {
      throw new Error(`Clip creation failed: ${error}`);
    }
  }
}
