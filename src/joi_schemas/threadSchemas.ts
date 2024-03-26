import Joi from "joi";

const clipSchema = Joi.object({
  id: Joi.string().required(),
  order: Joi.number().integer().default(1),
  clipId: Joi.string().required(),
  creatorName: Joi.string().required(),
  creatorId: Joi.string().required(),
  broadcasterId: Joi.string().required(),
  broadcasterName: Joi.string().required(),
  gameId: Joi.string().required(),
  viewCount: Joi.number().integer().required(),
  thumbUrl: Joi.string().required(),
  embedUrl: Joi.string().required(),
  description: Joi.string().allow(null).optional(),
  url: Joi.string().required(),
  tagId: Joi.string().default(""),
});

export const threadSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().allow(null).optional(),
  published: Joi.boolean().default(false),
  publishedTime: Joi.date().iso().default(Date.now),
  createdAt: Joi.date().iso().default(Date.now),
  updatedAt: Joi.date().iso().optional().default(null),
  authorId: Joi.string().required(),
  broadcasters: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      profileUrl: Joi.string().uri().required(),
      platform: Joi.string().required(),
      profilePic: Joi.string().uri().required(),
    })
  ),
  clips: Joi.array().items(clipSchema),
});

export const threadIdSchema = Joi.object({
  threadId: Joi.string().required(),
});

export const threadTitleSchema = Joi.object({ title: Joi.string().required() });
