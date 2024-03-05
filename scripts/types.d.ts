import { User, TwitchAuth, YouTubeAuth } from "@prisma/client";

export type UserWithoutId = Omit<User, "id">;
export type TwitchAuthWithoutId = Omit<TwitchAuth, "userId">;
export type YoutubeAuthWithoutId = Omit<YouTubeAuth, "userId">;

export type UserWithAuth = User & {
  twitchAuth: TwitchAuth | undefined;
  youtubeAuth: YouTubeAuth | undefined;
};

export type AuthData = {
  twitchAuthData:
    | {
        refreshToken: string;
        accessToken: string;
        expiryTime: Date;
      }
    | undefined;
  youtubeAuthData:
    | {
        refreshToken: string;
        accessToken: string;
        expiryTime: Date;
      }
    | undefined;
};

export type FakeData = Array<{ userData: UserWithoutId; authData: AuthData }>;
