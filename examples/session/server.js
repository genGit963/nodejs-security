const fs = require("fs");
const cors = require("cors");
const path = require("path");
const https = require("https");
const helmet = require("helmet");
const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const { Strategy } = require("passport-google-oauth20");

require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.use(helmet());
app.use(cors({ allowedHeaders: "*" }));

app.use(
  cookieSession({
    name: "session",
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_SESSION_KEY_1, process.env.COOKIE_SESSION_KEY_2], // all keys of cookies
  })
);

passport.use(
  new Strategy(
    {
      callbackURL: "/auth/google/callback",
      clientID: process.env.OATUH_CLIENT_ID,
      clientSecret: process.env.OATUH_CLIENT_SECRET,
    },
    function (accessToken, refreshToken, profile, done) {
      // use these accessToken and refreshToken now
      console.log("google account detail:", profile);
      done(null, profile);
    }
  )
);

// serialize: save the session to cookie
passport.serializeUser((user, done) => {
  done(null, user);
});

// deserialize: read the session from cookie
passport.deserializeUser((obj, done) => {
  done(null, obj); // req.user = obj
});

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());

// own middlewares
const loginCheck = (req, res, next) => {
  const isLoggedIn = req.user && req.isAuthenticated();
  if (isLoggedIn) {
    next();
  } else res.redirect("/");
};

// routes
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

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
    session: true,
  }),
  (req, res) => {
    console.log("Google called us back !");
  }
);

app.get("/failure", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "failure.html"));
});

app.get("/main-page", loginCheck, (req, res) => {
  res.send(
    req.user
      ? `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
    <title>${req.user?.displayName}</title>
  </head>
  <body>
    <h1 class="my-5 text-center text-red-600 text-4xl">You are in, ${req.user?.displayName}</h1>
    <img src=${req.user?.photos[0].value} alt=${req.user?.displayName} srcset="https://www.google.com" style="object-fit: cover; height: 400px; width: 400px;">
    <p>${req.user?.emails[0].value}</p>
    <p>verified: ${req.user?.emails[0].verified}</p>
    <div style="
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 50%;
        border: 1px;">
    <a
        href="/secret"
        class="p-2 hover:cursor hover:bg-teal-800 hover:text-white border border-teal-700 rounded-md"
        >My Detail</a
      >
      <a
        href="/auth/google"
        class="p-2 hover:cursor hover:bg-teal-800 hover:text-white border border-teal-700 rounded-md"
        >Google Continue</a
      >
      <a
        href="/auth/logout"
        class="p-2 hover:cursor hover:bg-teal-800 hover:text-white border border-teal-700 rounded-md"
        >Sign Out</a
      >
    </div>
  </body>
</html>
`
      : "User Data loading failed !!"
  );
});

app.use("/secret", loginCheck, (req, res) => {
  res.json({ Google_UserID: req.user.id, ...req.user });
});

app.use("/auth/logout", loginCheck, (req, res) => {
  req.logOut();
  return res.redirect("/");
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
    console.log(`examples/session: app listening on port ${port}!`)
  );

module.exports = { app };
