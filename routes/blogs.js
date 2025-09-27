const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const authenticateToken = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/getBlogs", authenticateToken, blogController.getBlogs);
router.post(
  "/getBlogsByCategory",
  authenticateToken,
  blogController.getBlogsByCategory
);
router.post("/searchBlogs", authenticateToken, blogController.searchBlogs);
router.post("/getBlog", authenticateToken, blogController.getBlog);
router.post(
  "/getBlogWithComments",
  authenticateToken,
  blogController.getBlogWithComments
);

router.post(
  "/uploadBlog",
  authenticateToken,
  upload.single("image"),
  blogController.createBlog
);
router.post(
  "/updateBlog",
  authenticateToken,
  upload.single("image"),
  blogController.updateBlog
);
router.post("/deleteBlog", authenticateToken, blogController.deleteBlog);
router.post("/toggleLike", authenticateToken, blogController.toggleLike);
router.post("/addComment", authenticateToken, blogController.addComment);
router.post("/test", authenticateToken, (req, res) => {
  console.log("Test endpoint - User:", req.user);
  res.json({ success: true, message: "API is working", user: req.user });
});
module.exports = router;
