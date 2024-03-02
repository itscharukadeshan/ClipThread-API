/** @format */

import express, { Request, Response } from "express";
import chalk from "chalk";
import twitchRoutes from "./routes/twitch/twitch.routes";
import youtubeRoutes from "./routes/youtube/youtube.routes";
import { API_PORT } from "./config/config";
import authHandler from "./middlewares/authHandler";

const errorHandler = require("./middlewares/errorHandler");
const requestLogger = require("./middlewares/requestLogger");
const cookieParser = require("cookie-parser");

const app: express.Application = express();

app.use(cookieParser());

app.use(requestLogger);
app.use(errorHandler);

app.get("/", authHandler, (req: Request, res: Response) => {
  res.send(`Welcome to clip thread api`);
});

app.use("/twitch", twitchRoutes);
app.use("/youtube", youtubeRoutes);

app.listen(API_PORT, () => {
  console.log(`${chalk.bgBlue.bold(" App is successfully deployed ! ")}`);
});
