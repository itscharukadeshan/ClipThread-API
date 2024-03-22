import { PrismaClient, TwitchAuth } from "@prisma/client";
import moment from "moment";
import { getTwitchAccessTokenByRef } from "../services/twitchAuth.services";
import { RefreshTokenResponse } from "./types";

const prisma = new PrismaClient();

export async function getTwitchAccessTokenById(userId: string) {
  const twitchAuth: TwitchAuth | null = await prisma.twitchAuth.findUnique({
    where: { userId: userId },
  });
  const expiryTime = twitchAuth?.expiryTime;
  const isExpired: boolean = moment(expiryTime).isBefore(moment());

  if (isExpired) {
    if (!twitchAuth?.refreshToken) {
      return null;
    }
  }
  const refreshToken = twitchAuth?.refreshToken as string;

  const refreshTokenResponse: RefreshTokenResponse =
    await getTwitchAccessTokenByRef(refreshToken);

  if (!refreshTokenResponse) {
    return null;
  }

  const updatedTwitchAuth = await prisma.twitchAuth.update({
    where: { userId },
    data: {
      accessToken: refreshTokenResponse.access_token,
      refreshToken: refreshTokenResponse.refresh_token,
      expiryTime: moment().add(3.5, "hours").toString(),
    },
  });

  if (!updatedTwitchAuth) {
    return null;
  }

  return updatedTwitchAuth.accessToken;
}
