import { PrismaClient, TwitchAuth, YouTubeAuth } from "@prisma/client";
import moment from "moment";
import { getTwitchAccessTokenByRefToken } from "../services/twitchAuth.services";
import { RefreshTokenResponse } from "./interface/types";
import { getYoutubeAccessTokenByRefToken } from "../services/youtubeAuth.services";
import { decryptData } from "../utils/encryptDecryptUtils";

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
  const refreshToken = decryptData(twitchAuth?.refreshToken as string);

  const refreshTokenResponse: RefreshTokenResponse =
    await getTwitchAccessTokenByRefToken(refreshToken);

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

export async function getYoutubeAccessTokenById(userId: string) {
  const youTubeAuth: YouTubeAuth | null = await prisma.youTubeAuth.findUnique({
    where: { userId: userId },
  });
  const expiryTime = youTubeAuth?.expiryTime;
  const isExpired: boolean = moment(expiryTime).isBefore(moment());

  if (isExpired) {
    if (!youTubeAuth?.refreshToken) {
      return null;
    }
  }
  const refreshToken = decryptData(youTubeAuth?.refreshToken as string);

  const refreshTokenResponse =
    await getYoutubeAccessTokenByRefToken(refreshToken);

  if (!refreshTokenResponse) {
    return null;
  }

  const updatedYoutubeAuth = await prisma.youTubeAuth.update({
    where: { userId },
    data: {
      accessToken: refreshTokenResponse.access_token,
      refreshToken: refreshTokenResponse.refresh_token,
      expiryTime: moment().add(3.5, "hours").toString(),
    },
  });

  if (!updatedYoutubeAuth) {
    return null;
  }

  return updatedYoutubeAuth.accessToken;
}
