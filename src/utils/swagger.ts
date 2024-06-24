/** @format */

import { Express, Request, Response } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";
import chalk from "chalk";
import { API_PORT } from "../config/config";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ClipThread Api",
      version,
      description:
        "ClipThread allows to create,manage and explore collections of clips from Twitch and YouTube videos. ",
    },
    servers: [{ url: "http://localhost:3000" }],
  },

  apis: ["../routes/*.ts", "../index.ts"],
};

const swaggerSpecs = swaggerJSDoc(options);
function swaggerDocs(app: Express) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

  app.get("docs.js", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.send(swaggerSpecs);
  });

  console.log(
    `${chalk.bgGreen.bold(` Docs deployed at http://localhost:${API_PORT}/docs`)}`
  );
}

export default swaggerDocs;
