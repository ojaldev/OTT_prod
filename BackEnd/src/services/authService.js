const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const logger = require('../utils/logger');

class AuthService {
  async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();
      
      // Remove password from returned user object
      const userObject = user.toObject();
      delete userObject.password;
      
      return userObject;
    } catch (error) {
      logger.error(`Create user error: ${error.message}`);
      throw error;
    }
  }

  async authenticateUser(email, password) {
    try {
      const user = await User.findOne({ email, isActive: true }).select('+password');
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Remove password from returned user object
      const userObject = user.toObject();
      delete userObject.password;

      return userObject;
    } catch (error) {
      logger.error(`Authenticate user error: ${error.message}`);
      throw error;
    }
  }

  generateTokens(user) {
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      id: user._id
    });

    return { token, refreshToken };
  }

  async validateUserExists(email, username) {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    return !!existingUser;
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      return user;
    } catch (error) {
      logger.error(`Get user by ID error: ${error.message}`);
      throw error;
    }
  }

  async updateUserPassword(userId, newPassword) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      user.password = newPassword;
      await user.save();

      return true;
    } catch (error) {
      logger.error(`Update password error: ${error.message}`);
      throw error;
    }
  }

  async deactivateUser(userId) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      ).select('-password');

      return user;
    } catch (error) {
      logger.error(`Deactivate user error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AuthService();
