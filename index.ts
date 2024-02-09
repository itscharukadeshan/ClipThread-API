/** @format */

const express = require("express");
const axios = require("axios");

const app = express();

app.get("/", (req, res) => {
  res.send(`Welcome to clip thread api`);
});

app.get("/data", async (req, res) => {
  try {
    const response = await axios.get("http://example.com/api");
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data");
  }
});

const port = 3000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
