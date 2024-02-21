import { User, TwitchAuth, YouTubeAuth } from "@prisma/client";

export type UserWithoutId = Omit<User, "id">;
export type TwitchAuthWithoutId = Omit<TwitchAuth, "id">;
export type YoutubeAuthWithoutId = Omit<YouTubeAuth, "id">;
