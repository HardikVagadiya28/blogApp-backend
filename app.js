var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
require("dotenv").config();

var connectDB = require("./config/database");
connectDB();

var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var blogsRouter = require("./routes/blogs");
var usersRouter = require("./routes/users");
var contactsRouter = require("./routes/contacts");

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://blogapp-frontend-dz8q.onrender.com'
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.options("*", cors());

app.use("/", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/contacts", contactsRouter);

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API test route is working!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/*", function (req, res, next) {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

app.use(function (req, res, next) {
  if (req.accepts("html")) {
    res.status(404).send("Page not found");
  } else {
    res.status(404).json({
      success: false,
      message: "Endpoint not found",
    });
  }
});

app.use(function (err, req, res, next) {
  console.error("Detailed Error:", err);
  console.error("Error Stack:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
