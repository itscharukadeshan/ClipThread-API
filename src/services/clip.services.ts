import axios from "axios";
import { TWITCH_CLIENT_ID } from "../config/config";

const CLIP_INFO_URL = "https://api.twitch.tv/helix/clips";

export const getTwitchClipInfo = async (
  clipId: string,
  accessToken: string
) => {
  const response = await axios.get(CLIP_INFO_URL, {
    headers: {
      "Client-ID": TWITCH_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
    params: { id: clipId },
  });
  return response.data;
};
export const getYoutubeClipInfo = async (clipId: string) => {};
