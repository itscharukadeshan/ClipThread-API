import axios, { AxiosResponse } from "axios";
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
    throw error;
  }
};
export const getYoutubeClipInfo = async (clipId: string) => {
  try {
    const response: AxiosResponse = await axios.get(YOUTUBE_CLIP_INFO_URL, {
      params: { id: clipId, key: YOUTUBE_CLIENT_ID },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
