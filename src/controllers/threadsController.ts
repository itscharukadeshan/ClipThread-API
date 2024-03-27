import { PrismaClient, Thread, Broadcasters, Clip } from "@prisma/client";

import moment from "moment";
import ApplicationError from "../errors/applicationError";

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
      throw new ApplicationError("Thread data not found / not published", 404);
    }

    return foundThread;
  } catch (error) {
    throw error;
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
      throw new ApplicationError("No threads found", 404);
    }

    return { published, unPublished };
  } catch (error) {
    throw error;
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
      throw new ApplicationError("Failed to create new thread", 500);
    }

    return newThread;
  } catch (error) {
    throw error;
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

    if (!updatedThread) {
      throw new ApplicationError("Failed to update thread", 500);
    }

    const broadcasterUpdates = broadcasters.map(async (broadcaster) => {
      await prisma.broadcasters.upsert({
        where: { id: broadcaster.id },
        update: { ...broadcaster },
        create: { ...broadcaster },
      });
    });

    await Promise.all(broadcasterUpdates);

    if (!broadcasterUpdates) {
      throw new ApplicationError("Failed to update broadcasters", 500);
    }

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

    if (!clipUpdates) {
      throw new ApplicationError("Failed to update clips", 500);
    }

    return updatedThread;
  } catch (error) {
    throw error;
  }
}
