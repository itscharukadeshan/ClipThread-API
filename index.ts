/** @format */

import express, { Request, Response } from "express";

import axios, { AxiosResponse } from "axios";

import {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
} from "./config/config";

import authRoutes from "./routes/auth.routes";

const app: express.Application = express();

app.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to clip thread api`);
});

const port = 3000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
