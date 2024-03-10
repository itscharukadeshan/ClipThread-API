/** @format */

import express, { Request, Response } from "express";
import chalk from "chalk";
import cors from "cors";

import twitchRoutes from "./routes/twitch.routes";
import youtubeRoutes from "./routes/youtube.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import { API_PORT, FRONT_END_URL } from "./config/config";
import authHandler from "./middlewares/authHandler";
import roleHandler from "./middlewares/roleHandler";
import { UserRole } from "@prisma/client";

import errorHandler from "./middlewares/errorHandler";
import requestLogger from "./middlewares/requestLogger";
import cookieParser from "cookie-parser";

import expiredTokenCleanup from "../cron/expiredTokenCleanup";

const app: express.Application = express();

app.use(
  cors({
    origin: FRONT_END_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use(requestLogger);
app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to clip thread api`);
});

app.use("/twitch", twitchRoutes);
app.use("/youtube", youtubeRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

expiredTokenCleanup();

app.listen(API_PORT, () => {
  console.log(`${chalk.bgBlue.bold(" App is successfully deployed ! ")}`);
});
