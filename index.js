require("dotenv").config();

const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");

const { logger } = require("./src/server/utils/logger");
const { router } = require("./src/server/router");

const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "dist")));

app.use(router);

// setting up server
const port = process.env.HTTP_PORT;
app.listen(port, () => {
  logger.info("--SERVER STARTED--", { port });
});
