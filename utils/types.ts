import { User, TwitchAuth, YouTubeAuth } from "@prisma/client";

export type UserWithoutId = Omit<User, "id">;
export type TwitchAuthWithoutId = Omit<TwitchAuth, "userId">;
export type YouTubeAuthWithoutId = Omit<YouTubeAuth, "userId">;

export interface TwitchUserReturn {
  userData: UserWithoutId;
  twitchAuth: TwitchAuthWithoutId;
}

export interface YouTubeUserReturn {
  userData: UserWithoutId;
  youtubeAuth: YouTubeAuthWithoutId;
}
