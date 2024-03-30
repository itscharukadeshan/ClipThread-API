import axios, { AxiosError, AxiosResponse } from "axios";
import { TWITCH_CLIENT_ID, YOUTUBE_CLIENT_ID } from "../config/config";
import ApplicationError from "../errors/applicationError";

const TWITCH_CLIP_INFO_URL = "https://api.twitch.tv/helix/clips";
const YOUTUBE_CLIP_INFO_URL = "https://www.googleapis.com/youtube/v3/videos";

export const getTwitchClipInfo = async (
  clipId: string,
  accessToken: string
) => {
  try {
    const response: AxiosResponse = await axios.get(TWITCH_CLIP_INFO_URL, {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      params: { id: clipId },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.message || "Unknown error";
        throw new ApplicationError(message, status);
      } else if (axiosError.request) {
        throw new ApplicationError("No response received from server", 500);
      } else {
        throw new ApplicationError(axiosError.message, 500);
      }
    } else {
      throw error;
    }
  }
};
export const getYoutubeClipInfo = async (clipId: string) => {
  try {
    const response: AxiosResponse = await axios.get(YOUTUBE_CLIP_INFO_URL, {
      params: { id: clipId, key: YOUTUBE_CLIENT_ID },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.message || "Unknown error";
        throw new ApplicationError(message, status);
      } else if (axiosError.request) {
        throw new ApplicationError("No response received from server", 500);
      } else {
        throw new ApplicationError(axiosError.message, 500);
      }
    } else {
      throw error;
    }
  }
};
