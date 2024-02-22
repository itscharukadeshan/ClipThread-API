import { User, TwitchAuth } from "@prisma/client";

export type UserWithoutId = Omit<User, "id">;
export type TwitchAuthWithoutId = Omit<TwitchAuth, "id">;

export interface CreateUserReturn {
  userData: UserWithoutId;
  twitchAuth: TwitchAuthWithoutId;
}
