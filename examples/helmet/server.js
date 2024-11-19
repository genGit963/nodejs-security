const fs = require("fs");
const https = require("https");
const express = require("express");

const app = express();
const port = 4000;

app.get("/", (req, res) => res.send("Hello World!"));

https
  .createServer({
    key: fs.readFileSync("../../key.pem"),
    cert: fs.readFileSync("../../cert.pem"),
  })
  .listen(port, () => console.log(`Helment/ app listening on port ${port}!`));
