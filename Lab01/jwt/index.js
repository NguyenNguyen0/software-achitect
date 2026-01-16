const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());

// ===== CONFIG =====
const PORT = 3000;
const ACCESS_TOKEN_SECRET = "ACCESS_TOKEN_SECRET_KEY";
const REFRESH_TOKEN_SECRET = "REFRESH_TOKEN_SECRET_KEY";

// Demo user (giả lập database)
const users = [
  {
    id: 1,
    username: "admin",
    password: "123456",
    role: "admin",
  },
];

// Lưu refresh token (demo – thực tế nên lưu DB/Redis)
let refreshTokens = [];

// ===== LOGIN =====
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Sai username hoặc password" });
  }

  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  refreshTokens.push(refreshToken);

  res.json({
    user: payload,
    accessToken,
    refreshToken,
  });
});

// ===== REFRESH TOKEN =====
app.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Refresh token expired" });
    }

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      accessToken: newAccessToken,
    });
  });
});

// ===== MIDDLEWARE VERIFY ACCESS TOKEN =====
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Missing access token" });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid access token" });
    }

    req.user = user;
    next();
  });
}

// ===== PROTECTED API =====
app.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Access token hợp lệ",
    user: req.user,
  });
});

// ===== LOGOUT =====
app.post("/logout", (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.json({ message: "Logout thành công" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
