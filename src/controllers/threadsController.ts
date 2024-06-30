/** @format */

import { PrismaClient, Thread, Broadcasters, Clip } from "@prisma/client";

import moment from "moment";
import ApplicationError from "../errors/applicationError";

const prisma = new PrismaClient();

/**
 * @openapi
 * components:
 *   schemas:
 *     Public_Thread:
 *       type: object
 *       properties:
 *         authorId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         id:
 *           type: string
 *         description:
 *           type: string
 *         published:
 *           type: boolean
 *         publishedTime:
 *           type: string
 *           format: date-time
 *         title:
 *           type: string
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *         broadcasters:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Broadcasters'
 *
 *         clips:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Clip'
 *
 *
 */

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

/**
 * @openapi
 * components:
 *   schemas:
 *     New_Thread:
 *       type: object
 *       properties:
 *         authorId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         id:
 *           type: string
 *         title:
 *           type: string
 */

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
/**
 * @openapi
 * components:
 *   schemas:
 *     Update_Thread_Req:
 *       type: object
 *       properties:
 *         authorId:
 *           type: string
 *         description:
 *           type: string
 *         published:
 *           type: boolean
 *         title:
 *           type: string
 *         broadcasters:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               profileUrl:
 *                 type: string
 *               platform:
 *                 type: string
 *               profilePic:
 *                 type: string
 *         clips:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               order:
 *                 type: integer
 *               clipId:
 *                 type: string
 *               creatorName:
 *                 type: string
 *               creatorId:
 *                 type: string
 *               broadcasterId:
 *                 type: string
 *               broadcasterName:
 *                 type: string
 *               gameId:
 *                 type: string
 *               viewCount:
 *                 type: integer
 *               thumbUrl:
 *                 type: string
 *               embedUrl:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               url:
 *                 type: string
 *               tags:
 *                 type: string
 */
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
