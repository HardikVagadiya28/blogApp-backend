const User = require("../models/User");
const bcrypt = require("bcryptjs");

const userController = {
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          msg: "User not found",
        });
      }

      res.json({
        success: true,
        user: user,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        msg: "Error fetching profile",
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { name, location, bio, website } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { name, location, bio, website },
        { new: true }
      ).select("-password");

      res.json({
        success: true,
        msg: "Profile updated successfully",
        user: user,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        msg: "Error updating profile",
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          msg: "User not found",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          msg: "Current password is incorrect",
        });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await User.findByIdAndUpdate(req.user.userId, {
        password: hashedPassword,
      });

      res.json({
        success: true,
        msg: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        msg: "Error changing password",
      });
    }
  },
};

module.exports = userController;
