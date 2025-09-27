var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  res.json({
    success: true,
    message: "Blog API is running!",
    timestamp: new Date().toISOString(),
  });
});

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
