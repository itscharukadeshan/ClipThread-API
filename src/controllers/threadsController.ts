import { User, PrismaClient } from "@prisma/client";
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
