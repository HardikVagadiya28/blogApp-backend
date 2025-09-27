const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || "secret";

const authController = {
  signUp: async (req, res) => {
    try {
      const { username, name, email, password } = req.body;
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          msg: "User with this email or username already exists",
        });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await User.create({
        username,
        name,
        email,
        password: hashedPassword,
      });

      res.status(201).json({
        success: true,
        msg: "User created successfully",
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({
        success: false,
        msg: "Server error during signup",
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          msg: "Invalid email or password",
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          msg: "Invalid email or password",
        });
      }

      const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "7d" });

      res.json({
        success: true,
        msg: "Login successful",
        token: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        msg: "Server error during login",
      });
    }
  },
};

module.exports = authController;
