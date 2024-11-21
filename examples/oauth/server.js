const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 4001;

app.use(bodyParser.json());

app.get("/", (req, res) =>
  res.sendFile(path.resolve(__dirname, "public", "index.html"))
);

app.use("/secure", (req, res) => {
  res.json({ key: "This is secret_key !!" });
});

https
  .createServer(
    // self-signed ssl certificate
    {
      key: fs.readFileSync("../../certificate/key.pem"),
      cert: fs.readFileSync("../../certificate/cert.pem"),
    },
    app // request listener
  )
  .listen(port, () =>
    console.log(`examples/oauth: app listening on port ${port}!`)
  );

module.exports = { app };
