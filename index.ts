/** @format */

import express, { Request, Response } from "express";

import axios, { AxiosResponse } from "axios";

import {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
} from "./config/config";

import { prisma } from "./prisma/utils/client";
const { User } = require("./prisma/models/User");

import passport from "passport";
import { Strategy as TwitchStrategy } from "passport-twitch-latest";
import { OAuth2Strategy as YouTubeStrategy } from "passport-google-oauth";

import authRoutes from "./routes/auth.routes";

const app: express.Application = express();

passport.use(
  new TwitchStrategy(
    {
      clientID: TWITCH_CLIENT_ID,
      clientSecret: TWITCH_CLIENT_SECRET,
      callbackURL: "/auth/twitch/callback",
    },
    verifyCallback
  )
);

passport.use(
  new YouTubeStrategy(
    {
      clientID: YOUTUBE_CLIENT_ID,
      clientSecret: YOUTUBE_CLIENT_SECRET,
      callbackURL: "/auth/youtube/callback",
    },
    verifyCallback
  )
);

// Auth routes
app.use("/auth", authRoutes);

function verifyCallback(accessToken, refreshToken, profile, done) {
  User.findOrCreate({ profile }, function (err, user) {
    if (err) {
      return done(err);
    }

    done(null, user);
  });
}

app.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to clip thread api`);
});

const port = 3000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
