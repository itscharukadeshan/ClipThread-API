/** @format */

import express, { Request, Response } from "express";
import chalk from "chalk";
import twitchRoutes from "./routes/twitch/twitch.routes";
import youtubeRoutes from "./routes/youtube/youtube.routes";
const errorHandler = require("./middlewares/errorHandler");
const requestLogger = require("./middlewares/requestLogger");

const app: express.Application = express();

app.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to clip thread api`);
});

const port = 3000;

app.use(requestLogger);
app.use(errorHandler);

app.use("/twitch", twitchRoutes);
app.use("/youtube", youtubeRoutes);

app.listen(port, () => {
  console.log(`${chalk.bgBlue.bold(" App is successfully deployed ! ")}`);
});
