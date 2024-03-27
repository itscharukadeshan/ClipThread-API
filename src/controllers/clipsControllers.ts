import { PrismaClient, TwitchAuth, YouTubeAuth } from "@prisma/client";
import moment from "moment";
import { getTwitchAccessTokenByRefToken } from "../services/twitchAuth.services";
import { RefreshTokenResponse } from "./interface/types";
import { getYoutubeAccessTokenByRefToken } from "../services/youtubeAuth.services";
import { decryptData } from "../utils/encryptDecryptUtils";
import ApplicationError from "../errors/applicationError";

const prisma = new PrismaClient();

export async function getTwitchAccessTokenById(userId: string) {
  try {
    const twitchAuth: TwitchAuth | null = await prisma.twitchAuth.findUnique({
      where: { userId: userId },
    });

    if (!twitchAuth) {
      throw new ApplicationError("Twitch authentication data not found", 404);
    }

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
      throw new ApplicationError("Failed to refresh twitch access token", 500);
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
      throw new ApplicationError(
        "Failed to update twitch authentication data",
        500
      );
    }

    return updatedTwitchAuth.accessToken;
  } catch (error) {
    throw error;
  }
}

export async function getYoutubeAccessTokenById(userId: string) {
  try {
    const youTubeAuth: YouTubeAuth | null = await prisma.youTubeAuth.findUnique(
      {
        where: { userId: userId },
      }
    );

    if (!youTubeAuth) {
      throw new ApplicationError("YouTube authentication data not found", 404);
    }

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
      throw new ApplicationError("Failed to refresh youtube access token", 500);
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
      throw new ApplicationError(
        "Failed to update youtube authentication data",
        500
      );
    }

    return updatedYoutubeAuth.accessToken;
  } catch (error) {
    throw error;
  }
}
