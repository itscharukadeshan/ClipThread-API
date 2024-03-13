import { User, PrismaClient } from "@prisma/client";
import {} from "./types";

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
