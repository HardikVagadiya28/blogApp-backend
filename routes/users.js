const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/auth");

router.post("/getProfile", authenticateToken, userController.getProfile);
router.post("/updateProfile", authenticateToken, userController.updateProfile);
router.post(
  "/changePassword",
  authenticateToken,
  userController.changePassword
);

module.exports = router;
