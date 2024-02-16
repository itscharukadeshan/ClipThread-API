/** @format */

import * as dotenv from "dotenv";

dotenv.config();

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID as string;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET as string;
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID as string;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET as string;
const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI as string;

export {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  TWITCH_REDIRECT_URI,
};
