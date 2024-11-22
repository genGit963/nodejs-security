const fs = require("fs");
const path = require("path");
const https = require("https");
const helmet = require("helmet");
const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const { Strategy } = require("passport-google-oauth20");

require("dotenv").config();
const app = express();

let userData = null;

passport.use(
  new Strategy(
    {
      callbackURL: "/auth/google/callback",
      clientID: process.env.OATUH_CLIENT_ID,
      clientSecret: process.env.OATUH_CLIENT_SECRET,
    },
    function (accessToken, refreshToken, profile, done) {
      console.log("google account detail:", accessToken, refreshToken, profile);
      userData = profile;
      done(null, profile);
    }
  )
);

app.use(helmet());
app.use(passport.initialize());

const port = process.env.PORT;
app.use(bodyParser.json());

app.get("/", (req, res) =>
  res.sendFile(path.resolve(__dirname, "public", "index.html"))
);

// auth
const loginCheck = (req, res, next) => {
  if (userData) next();
  else res.redirect("/");
};

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/main-page",
    session: false,
  }),
  (req, res) => {
    console.log("Google called us back !");
  }
);

app.get("/main-page", loginCheck, (req, res) => {
  res.send(
    userData
      ? `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
    <title>${userData?.displayName}</title>
  </head>
  <body>
    <h1 class="my-5 text-center text-red-600 text-4xl">You are in, ${userData?.displayName}</h1>
    <img src=${userData?.photos[0].value} alt=${userData?.displayName} style="object-fit: cover; height: 400px; width: 400px;">
    <p>${userData?.emails[0].value}</p>
    <p>verified: ${userData?.emails[0].verified}</p>
  </body>
</html>
`
      : "User Data loading failed !!"
  );
});

app.get("/failure", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "failure.html"));
});

app.use("/secret", loginCheck, (req, res) => {
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
