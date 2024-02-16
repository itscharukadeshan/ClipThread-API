/** @format */

import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID as string;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET as string;
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID as string;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET as string;
const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI as string;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;

export {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  TWITCH_REDIRECT_URI,
  ENCRYPTION_KEY,
};
