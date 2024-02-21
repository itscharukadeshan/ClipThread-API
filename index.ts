/** @format */

import express, { Request, Response } from "express";
import twitchRoutes from "./routes/twitch/twitch.routes";
import youtubeRoutes from "./routes/youtube/youtube.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app: express.Application = express();

app.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to clip thread api`);
});

const port = 3000;

app.use(errorHandler);

app.use("/twitch", twitchRoutes);
app.use("/youtube", youtubeRoutes);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
