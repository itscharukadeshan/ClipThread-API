/** @format */

import express, { Request, Response } from "express";
import chalk from "chalk";
import cors from "cors";

import twitchRoutes from "./routes/twitch.routes";
import youtubeRoutes from "./routes/youtube.routes";
import { API_PORT, FRONT_END_URL } from "./config/config";
import authHandler from "./middlewares/authHandler";
import roleHandler from "./middlewares/roleHandler";
import { UserRole } from "@prisma/client";

import errorHandler from "./middlewares/errorHandler";
import requestLogger from "./middlewares/requestLogger";
import cookieParser from "cookie-parser";

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

app.get(
  "/",
  roleHandler(UserRole.creator),
  authHandler,
  (req: Request, res: Response) => {
    res.send(`Welcome to clip thread api`);
  }
);

app.use("/twitch", twitchRoutes);
app.use("/youtube", youtubeRoutes);

app.listen(API_PORT, () => {
  console.log(`${chalk.bgBlue.bold(" App is successfully deployed ! ")}`);
});
