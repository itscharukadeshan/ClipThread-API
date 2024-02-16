/** @format */

import express, { Request, Response } from "express";

const app: express.Application = express();

app.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to clip thread api`);
});

const port = 3000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
