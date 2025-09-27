const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || "secret";

const authenticateToken = (req, res, next) => {
  let token = req.body.token || req.query.token || req.headers["authorization"];

  console.log("Raw token received:", token);
  console.log("Auth Debug - Token received:", token ? "Yes" : "No");
  console.log("Auth Debug - Headers:", req.headers);

  if (!token) {
    console.log("Auth Debug - No token provided");
    return res
      .status(401)
      .json({ success: false, msg: "Access token required" });
  }

  // Extract token from Bearer format
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  console.log("Token after processing:", token); // Debug log

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    console.log("Auth Debug - Token valid for user:", decoded.userId);
    next();
  } catch (error) {
    console.error("Auth Debug - Token verification failed:", error);
    return res.status(403).json({
      success: false,
      msg: "Invalid or expired token",
    });
  }
};

module.exports = authenticateToken;
