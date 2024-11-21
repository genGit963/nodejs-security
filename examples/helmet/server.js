const fs = require("fs");
const https = require("https");
const express = require("express");
const helmet = require("helmet");
const app = express();
const port = 4000;

app.use(helmet());
app.get("/", (req, res) => res.send("Hello World!"));

https
  .createServer(
    {
      key: fs.readFileSync("../../certificate/key.pem"),
      cert: fs.readFileSync("../../certificate/cert.pem"),
    },
    app
  )
  .listen(port, () =>
    console.log(`examples/helmet: app listening on port ${port}!`)
  );
