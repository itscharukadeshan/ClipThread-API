/** @format */

import express, { NextFunction, Request, Response } from "express";
import chalk from "chalk";
import cors from "cors";

import twitchRoutes from "./routes/twitch.routes";
import youtubeRoutes from "./routes/youtube.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import threadRoutes from "./routes/thread.routes";
import clipRoutes from "./routes/clip.routes";
import { API_PORT, FRONT_END_URL } from "./config/config";

import errorHandler from "./middlewares/errorHandler";
import requestLogger from "./middlewares/requestLogger";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import expiredTokenCleanup from "../cron/expiredTokenCleanup";
import bodyParser from "body-parser";
import helmet from "helmet";
import ApplicationError from "./errors/applicationError";

const app: express.Application = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // API_RATE_LIMIT_WINDOW
  max: 100, // API_MAX_REQUEST_LIMIT
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);
app.use(helmet());

app.use(
  cors({
    origin: FRONT_END_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());

app.use(requestLogger);

app.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to clip thread api`);
});

app.use("/twitch", twitchRoutes);
app.use("/youtube", youtubeRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/thread", threadRoutes);
app.use("/clip", clipRoutes);

expiredTokenCleanup();

app.use(errorHandler);

app.all("*", (req: Request, res: Response) => {
  res.status(404).json({
    error: `Invalid method / wrong endpoint: [${req.method}] | [${req.url}]`,
  });
});

// Centralized error handler

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ApplicationError) {
    res.status(error.statusCode).json({ error: error.message });
  } else {
    console.error("Unhandled error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(API_PORT, () => {
  console.log(`${chalk.bgBlue.bold(" App is successfully deployed ! ")}`);
});
