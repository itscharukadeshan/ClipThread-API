/** @format */

import express, { Request, Response } from "express";

import axios, { AxiosResponse } from "axios";

import { prisma } from "./prisma/utils/client";

const app: express.Application = express();

app.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to clip thread api`);
});

app.get("/data", async (req: Request, res: Response) => {
  try {
    const response: AxiosResponse = await axios.get("http://example.com/api");

    res.json(response.data);
  } catch (error) {
    console.error(error);

    res.status(500).send("Error fetching data");
  }
});

app.get("/users", async (req: Request, res: Response) => {
  try {
    const response = await prisma.user.findMany();

    res.json(response);
  } catch (error) {
    console.log(error);

    res.status(500).send("Error fetching data");
  }
});

const port = 3000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
