import { faker } from "@faker-js/faker";
import { PrismaClient, Thread } from "@prisma/client";
import { ThreadWithoutId, ClipWithoutId, ThreadClipWithoutId } from "./types";

const prisma = new PrismaClient();

const generateThreadsData = async (user) => {
  const threadsCount = Math.floor(Math.random() * 4) + 5; // Generate random number of threads between 5 to 8
  const threads = [];

  for (let i = 0; i < threadsCount; i++) {
    const thread: ThreadWithoutId = {
      authorId: user.id,
      createdAt: faker.date.recent(),
      description: faker.lorem.paragraph(),
      published: faker.datatype.boolean(),
      publishedTime: faker.date.recent(),
      title: faker.lorem.sentence(),
      updatedAt: faker.date.recent(),
    };

    const threadWithId: Thread = await prisma.thread.create({
      data: thread,
    });

    // Push each created thread into the threads array
    threads.push(threadWithId);

    const clipsCount = Math.floor(Math.random() * 4) + 5;

    for (let j = 0; j < clipsCount; j++) {
      const clip: ClipWithoutId = {
        broadcasterId: user.id,
        broadcasterName: user.displayName,
        clipId: faker.string.numeric(9),
        creatorId: faker.string.numeric(9),
        creatorName: faker.person.fullName(),
        description: faker.lorem.paragraph(),
        embedUrl: faker.internet.url(),
        gameId: faker.string.numeric(4),
        tagId: faker.string.numeric(4),
        thumbUrl: faker.internet.url(),
        url: faker.internet.url(),
        viewCount: faker.datatype.number({ min: 10, max: 100 }),
      };

      const clipWithId = await prisma.clip.create({
        data: clip,
      });

      const threadClip: ThreadClipWithoutId = {
        clipId: clipWithId.id,
        threadId: threadWithId.id,
      };

      await prisma.threadClip.create({
        data: threadClip,
      });
    }
  }

  // Return the array of created threads
  return threads;
};

const main = async () => {
  const users = await prisma.user.findMany({
    select: { id: true, displayName: true },
  });

  for (const user of users) {
    await generateThreadsData(user);
  }

  await prisma.$disconnect();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
