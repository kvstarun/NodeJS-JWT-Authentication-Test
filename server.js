const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");

const { expressjwt: exjwt } = require("express-jwt");

const bodyParser = require("body-parser");

const path = require("path");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "Content-type,Authorization");
  next();
});

const PORT = 3000;

const secretKey = "My Secret Key";
const jwtMW = exjwt({
  secret: secretKey,
  algorithms: ["HS256"],
});

let users = [
  {
    id: 1,
    username: "tarun",
    password: "tarun123",
  },
  {
    id: 2,
    username: "kandikunta",
    password: "tarun456",
  },
];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  let token;
  for (let user of users) {
    if (username == user.username && password == user.password) {
      token = jwt.sign({ id: user.id, username: user.username }, secretKey, {
        expiresIn: "180s",
      });
      break;
    }
  }
  if (token) {
    res.json({
      success: true,
      err: null,
      token,
    });
  } else {
    res.status(401).json({
      success: false,
      token: null,
      err: "Username or password is incorrect",
    });
  }
});

app.get("/api/dashboard", jwtMW, (req, res) => {
  console.log(req);
  res.json({
    success: true,
    myContent: "Secret Content that only logged in people can see",
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use((err, req, res, next) => {
  console.log(err.name === "UnauthorizedError");
  console.log(err);
  if (err.name === "UnauthorizedError") {
    res.status(401).json({
      success: false,
      officialErr: err,
      err: "2. Username or password is incorrect",
    });
  } else {
    next(err);
  }
});

app.get("/api/setting", jwtMW, (req, res) => {
  res.json({
    success: true,
    myContent: "Setting page works",
  });
});

app.listen(PORT, () => {
  console.log(`Serving on port ${PORT}`);
});
