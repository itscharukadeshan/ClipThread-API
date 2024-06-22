/** @format */

import express, { Request, Response } from "express";

import chalk from "chalk";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import helmet from "helmet";
import { doubleCsrf } from "csrf-csrf";

import twitchRoutes from "./routes/twitch.routes";
import youtubeRoutes from "./routes/youtube.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import threadRoutes from "./routes/thread.routes";
import clipRoutes from "./routes/clip.routes";

import { API_PORT, FRONT_END_URL, CSRF_KEY } from "./config/config";

import errorHandler from "./middlewares/errorHandler";
import requestLogger from "./middlewares/requestLogger";

import expiredTokenCleanup from "../cron/expiredTokenCleanup";

import ApplicationError from "./errors/applicationError";

import swaggerDocs from "./utils/swagger";

// deepcode ignore UseCsurfForExpress: <Basic CSRF Protection enabled>
const app: express.Express = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // API_RATE_LIMIT_WINDOW
  max: 100, // API_MAX_REQUEST_LIMIT
  message: "Too many requests from this IP, please try again later.",
  statusCode: 429,
});

app.use(limiter);
app.use(helmet());

app.use(
  cors({
    origin: FRONT_END_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => CSRF_KEY,
  size: 32,
});

app.use(doubleCsrfProtection);
app.use(requestLogger);

app.get("/csrf-token", (req, res) => {
  const csrfToken = generateToken(req, res);
  res.json({ csrfToken });
});

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to clip thread api`);
});

app.use("/twitch", twitchRoutes);
app.use("/youtube", youtubeRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/thread", threadRoutes);
app.use("/clip", clipRoutes);

swaggerDocs(app);

expiredTokenCleanup();

app.use(errorHandler);

app.all("*", (req: Request, res: Response) => {
  try {
    throw new ApplicationError(
      `Invalid method / wrong endpoint: [${req.method}] | [${req.url}]`,
      404
    );
  } catch (error) {
    throw error;
  }
});

app.listen(API_PORT, () => {
  console.log(
    `${chalk.bgBlue.bold(` App is successfully deployed at http://localhost:${API_PORT}`)}`
  );
});
