import { User, PrismaClient, Thread, Broadcasters, Clip } from "@prisma/client";
import {} from "./types";
import moment from "moment";

const prisma = new PrismaClient();

export async function getPublicThreadDataById(threadId: string) {
  try {
    const foundThread = await prisma.thread.findUnique({
      where: { id: threadId },
      select: {
        authorId: true,
        broadcasters: true,
        clips: true,
        createdAt: true,
        id: true,
        description: true,
        published: true,
        publishedTime: true,
        title: true,
        updatedAt: true,
      },
    });

    if (!foundThread?.published) {
      return null;
    }

    return foundThread;
  } catch (error) {
    return null;
  }
}

export async function getThreadStatus() {
  try {
    const published: number | undefined = await prisma.thread.count({
      where: { published: true },
    });
    const unPublished: number | undefined = await prisma.thread.count({
      where: { published: false },
    });

    if (!published && !unPublished) {
      throw new Error("No threads found");
    }

    return { published, unPublished };
  } catch (error) {
    return null;
  }
}

export async function createNewThread(userId: string, title: string) {
  try {
    const newThread = await prisma.thread.create({
      data: {
        authorId: userId,
        title: title,
        updatedAt: moment().toISOString(),
      },
    });

    if (!newThread) {
      throw new Error(`Something went wrong`);
    }

    return newThread;
  } catch (error) {
    return null;
  }
}

export async function updateThread(
  threadId: string,
  threadData: Thread,
  broadcasters: Broadcasters[],
  clips: Clip[]
) {
  try {
    const updatedThread = await prisma.thread.update({
      where: { id: threadId },
      data: { ...threadData },
    });

    const broadcasterUpdates = broadcasters.map(async (broadcaster) => {
      await prisma.broadcasters.upsert({
        where: { id: broadcaster.id },
        update: { ...broadcaster },
        create: { ...broadcaster },
      });
    });

    await Promise.all(broadcasterUpdates);

    const clipUpdates = clips.map(async (clip) => {
      if (clip.id) {
        await prisma.clip.update({
          where: { id: clip.id },
          data: { ...clip },
        });
      } else {
        await prisma.clip.create({
          data: { ...clip },
        });
      }
    });

    await Promise.all(clipUpdates);

    return updatedThread;
  } catch (error) {
    return null;
  }
}
