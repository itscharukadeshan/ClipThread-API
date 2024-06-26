/** @format */

import axios, { AxiosError, AxiosResponse } from "axios";
import { TWITCH_CLIENT_ID, YOUTUBE_API_KRY } from "../config/config";
import ApplicationError from "../errors/applicationError";

const TWITCH_CLIP_INFO_URL = "https://api.twitch.tv/helix/clips";
const YOUTUBE_CLIP_INFO_URL = "https://www.googleapis.com/youtube/v3/videos";

/**
 * @openapi
 * components:
 *   schemas:
 *     Twitch_clip_info:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         url:
 *           type: string
 *         embed_url:
 *           type: string
 *         broadcaster_id:
 *           type: string
 *         broadcaster_name:
 *           type: string
 *         creator_id:
 *           type: string
 *         creator_name:
 *           type: string
 *         video_id:
 *           type: string
 *         game_id:
 *           type: string
 *         language:
 *           type: string
 *         title:
 *           type: string
 *         view_count:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         thumbnail_url:
 *           type: string
 *         duration:
 *           type: number
 *           format: float
 *         vod_offset:
 *           type: integer
 *           nullable: true
 *         is_featured:
 *           type: boolean
 */

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

/**
 * @openapi
 * components:
 *   schemas:
 *     YouTube_clip_info:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         snippet:
 *           type: object
 *           properties:
 *             publishedAt:
 *               type: string
 *               format: date-time
 *             channelId:
 *               type: string
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             thumbnails:
 *               type: object
 *               properties:
 *                 default:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     width:
 *                       type: integer
 *                     height:
 *                       type: integer
 *             channelTitle:
 *               type: string
 *         contentDetails:
 *           type: object
 *           properties:
 *             duration:
 *               type: string
 *         statistics:
 *           type: object
 *           properties:
 *             viewCount:
 *               type: string
 *             likeCount:
 *               type: string
 *         player:
 *           type: object
 *           properties:
 *             embedHtml:
 *               type: string
 */

export const getYoutubeClipInfo = async (clipId: string) => {
  try {
    const response: AxiosResponse = await axios.get(YOUTUBE_CLIP_INFO_URL, {
      params: {
        id: clipId,
        key: YOUTUBE_API_KRY,
        part: "snippet , statistics,contentDetails",
      },
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
