import { User, TwitchAuth, YouTubeAuth } from "@prisma/client";

export type UserWithoutId = Omit<User, "id">;
export type TwitchAuthWithoutId = Omit<TwitchAuth, "userId">;
export type YoutubeAuthWithoutId = Omit<YouTubeAuth, "userId">;

export type UserWithAuth = User & {
  twitchAuth: TwitchAuth | null;
  youtubeAuth: YouTubeAuth | null;
};
