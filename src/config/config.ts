/** @format */

import * as dotenv from "dotenv";

dotenv.config();

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID as string;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET as string;
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID as string;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET as string;
const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI as string;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;
const SECRET_IV = process.env.SECRET_IV as string;
const ENCRYPTION_METHOD = process.env.ENCRYPTION_METHOD as string;
const YOUTUBE_REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI as string;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const AUTH_TOKEN_EXPIRATION = process.env.AUTH_TOKEN_EXPIRATION as string;
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION as string;
const API_PORT = process.env.API_PORT as string;
const FRONT_END_URL = process.env.FRONT_END_URL as string;
/*
console.log(`SECRET_IV length = ${SECRET_IV.length} || Should be 16 `);
console.log(
  `Encryption key length = ${ENCRYPTION_KEY.length} || Should be 32 `
);
*/

// Use this to build strong SECRET_IV
// ENCRYPTION_KEY should be 32 bit

/*
const crypto = require("crypto");
const iv = crypto.randomBytes(16);
console.log(iv.toString("hex"));
*/

export {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  TWITCH_REDIRECT_URI,
  ENCRYPTION_KEY,
  ENCRYPTION_METHOD,
  SECRET_IV,
  YOUTUBE_REDIRECT_URI,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  AUTH_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  API_PORT,
  FRONT_END_URL,
};
