const Blog = require("../models/Blog");
const User = require("../models/User");

const blogController = {
  createBlog: async (req, res) => {
    try {
      const { title, desc, content, category, subcategory } = req.body;
      const image = req.file ? req.file.filename : null;

      if (!image) {
        return res.status(400).json({
          success: false,
          msg: "Image is required",
        });
      }

      const blog = await Blog.create({
        title,
        desc,
        content,
        image,
        category: category || "All",
        subcategory: subcategory || "",
        user: req.user.userId,
      });

      await blog.populate("user", "name username");

      res.status(201).json({
        success: true,
        msg: "Blog created successfully",
        blog: blog,
      });
    } catch (error) {
      console.error("Create blog error:", error);
      res.status(500).json({
        success: false,
        msg: "Error creating blog",
      });
    }
  },

  getBlog: async (req, res) => {
    try {
      const { blogId } = req.body;
      const blog = await Blog.findById(blogId).populate(
        "user",
        "name username"
      );

      if (!blog) {
        return res.status(404).json({
          success: false,
          msg: "Blog not found",
        });
      }

      res.json({
        success: true,
        msg: "Blog fetched successfully",
        blog: blog,
      });
    } catch (error) {
      console.error("Get blog error:", error);
      res.status(500).json({
        success: false,
        msg: "Error fetching blog",
      });
    }
  },

  updateBlog: async (req, res) => {
    try {
      const { blogId, title, desc, content } = req.body;
      const image = req.file ? req.file.filename : undefined;

      if (!blogId) {
        return res.status(400).json({
          success: false,
          msg: "Blog ID is required",
        });
      }

      let blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({
          success: false,
          msg: "Blog not found",
        });
      }

      if (!blog.user) {
        blog.user = req.user.userId;
        await blog.save();
      }

      if (blog.user.toString() !== req.user.userId.toString()) {
        return res.status(403).json({
          success: false,
          msg: "Not authorized to update this blog",
        });
      }

      const updateData = {
        title: title || blog.title,
        desc: desc || blog.desc,
        content: content || blog.content,
      };

      if (image) {
        updateData.image = image;
      }

      blog = await Blog.findByIdAndUpdate(blogId, updateData, {
        new: true,
      }).populate("user", "name username");

      res.json({
        success: true,
        msg: "Blog updated successfully",
        blog: blog,
      });
    } catch (error) {
      console.error("Update blog error:", error);
      res.status(500).json({
        success: false,
        msg: "Error updating blog",
      });
    }
  },

  deleteBlog: async (req, res) => {
    try {
      const { blogId } = req.body;

      // First, check if blogId is provided
      if (!blogId) {
        return res.status(400).json({
          success: false,
          msg: "Blog ID is required",
        });
      }

      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({
          success: false,
          msg: "Blog not found",
        });
      }

      // Debug logging to check the blog object
      console.log("Blog found:", blog);
      console.log("Blog user:", blog.user);
      console.log("Request user ID:", req.user.userId);

      // Check if user owns the blog - with proper null checks
      if (!blog.user) {
        return res.status(400).json({
          success: false,
          msg: "Blog user information is missing",
        });
      }

      // Convert both to string for comparison
      const blogUserId = blog.user.toString();
      const requestUserId = req.user.userId.toString();

      if (blogUserId !== requestUserId) {
        return res.status(403).json({
          success: false,
          msg: "Not authorized to delete this blog",
        });
      }

      await Blog.findByIdAndDelete(blogId);

      res.json({
        success: true,
        msg: "Blog deleted successfully",
      });
    } catch (error) {
      console.error("Delete blog error:", error);
      res.status(500).json({
        success: false,
        msg: "Error deleting blog",
      });
    }
  },

  getBlogs: async (req, res) => {
    try {
      const { page = 1, limit = 8 } = req.body;
      const skip = (page - 1) * limit;

      const totalBlogs = await Blog.countDocuments();
      const blogs = await Blog.find()
        .populate("user", "name username")
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        success: true,
        msg: "Blogs fetched successfully",
        blogs: blogs,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBlogs / limit),
        totalBlogs: totalBlogs,
        hasNext: page < Math.ceil(totalBlogs / limit),
        hasPrev: page > 1,
      });
    } catch (error) {
      console.error("Get blogs error:", error);
      res.status(500).json({
        success: false,
        msg: "Error fetching blogs",
      });
    }
  },

  getBlogsByCategory: async (req, res) => {
    try {
      const { category, subcategory, page = 1, limit = 8 } = req.body;
      const skip = (page - 1) * limit;

      let query = {};
      if (category && category !== "All") {
        query.category = category;
        if (subcategory && subcategory !== "") {
          query.subcategory = subcategory;
        }
      }

      const totalBlogs = await Blog.countDocuments(query);
      const blogs = await Blog.find(query)
        .populate("user", "name username")
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        success: true,
        msg: "Blogs fetched successfully",
        blogs: blogs,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBlogs / limit),
        totalBlogs: totalBlogs,
        hasNext: page < Math.ceil(totalBlogs / limit),
        hasPrev: page > 1,
      });
    } catch (error) {
      console.error("Get blogs by category error:", error);
      res.status(500).json({
        success: false,
        msg: "Error fetching blogs",
      });
    }
  },

  searchBlogs: async (req, res) => {
    try {
      const { searchQuery, page = 1, limit = 8 } = req.body;
      const skip = (page - 1) * limit;

      const searchRegex = new RegExp(searchQuery, "i");
      const query = {
        $or: [
          { title: { $regex: searchRegex } },
          { desc: { $regex: searchRegex } },
          { content: { $regex: searchRegex } },
          { category: { $regex: searchRegex } },
          { subcategory: { $regex: searchRegex } },
        ],
      };

      const totalBlogs = await Blog.countDocuments(query);
      const blogs = await Blog.find(query)
        .populate("user", "name username")
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        success: true,
        msg: "Blogs fetched successfully",
        blogs: blogs,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBlogs / limit),
        totalBlogs: totalBlogs,
        hasNext: page < Math.ceil(totalBlogs / limit),
        hasPrev: page > 1,
        searchQuery: searchQuery,
      });
    } catch (error) {
      console.error("Search blogs error:", error);
      res.status(500).json({
        success: false,
        msg: "Error searching blogs",
      });
    }
  },

  getBlogWithComments: async (req, res) => {
    try {
      const { blogId } = req.body;

      const blog = await Blog.findById(blogId)
        .populate("user", "name username")
        .populate("likes", "name username")
        .populate("comments.user", "name username");

      if (!blog) {
        return res.status(404).json({
          success: false,
          msg: "Blog not found",
        });
      }

      const userLiked = blog.likes.some(
        (like) => like._id.toString() === req.user.userId
      );

      res.json({
        success: true,
        blog: blog,
        userLiked: userLiked,
      });
    } catch (error) {
      console.error("Get blog with comments error:", error);
      res.status(500).json({
        success: false,
        msg: "Error fetching blog",
      });
    }
  },

  toggleLike: async (req, res) => {
    try {
      const { blogId } = req.body;
      console.log("Toggle Like Request - Blog ID:", blogId);
      console.log("User ID:", req.user.userId);

      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({
          success: false,
          msg: "Blog not found",
        });
      }

      // Check if blog has user field, if not, assign it
      if (!blog.user) {
        console.log("Blog missing user field, assigning current user");
        blog.user = req.user.userId;
      }

      const likeIndex = blog.likes.indexOf(req.user.userId);
      let liked = false;

      if (likeIndex === -1) {
        blog.likes.push(req.user.userId);
        liked = true;
      } else {
        blog.likes.splice(likeIndex, 1);
        liked = false;
      }

      await blog.save();
      await blog.populate("likes", "name username");

      res.json({
        success: true,
        msg: liked ? "Blog liked" : "Blog unliked",
        likes: blog.likes,
        liked: liked,
        likesCount: blog.likes.length,
      });
    } catch (error) {
      console.error("Toggle like error:", error);

      // More specific error response
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          msg: "Database validation error",
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        msg: "Error toggling like",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  addComment: async (req, res) => {
    try {
      const { blogId, comment } = req.body;

      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({
          success: false,
          msg: "Blog not found",
        });
      }

      blog.comments.push({
        user: req.user.userId,
        text: comment,
      });

      await blog.save();
      await blog.populate("comments.user", "name username");

      res.json({
        success: true,
        msg: "Comment added successfully",
        comments: blog.comments,
      });
    } catch (error) {
      console.error("Add comment error:", error);
      res.status(500).json({
        success: false,
        msg: "Error adding comment",
      });
    }
  },
};

module.exports = blogController;
