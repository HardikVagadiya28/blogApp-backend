const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const authenticateToken = require("../middleware/auth");

router.post("/contact", contactController.createContact);
router.post("/getContacts", authenticateToken, contactController.getContacts);

module.exports = router;
