const User = require('../models/User');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/responses');
const logger = require('../utils/logger');
const activityService = require('../services/activityService');

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return errorResponse(res, 'User already exists with this email or username', null, 409);
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        role: role || 'user'
      });

      await user.save();
      
      // Track registration activity
      await activityService.trackActivity({
        userId: user._id,
        action: 'register',
        details: {
          username,
          email,
          role: role || 'user',
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      }, req);

      // Generate tokens
      const token = generateToken({ id: user._id, email: user.email, role: user.role });
      const refreshToken = generateRefreshToken({ id: user._id });

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      logger.info(`New user registered: ${email}`);

      return successResponse(res, 'User registered successfully', {
        user: userResponse,
        token,
        refreshToken
      }, 201);

    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      return errorResponse(res, 'Error registering user', error);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email, isActive: true }).select('+password');

      if (!user) {
        return errorResponse(res, 'Invalid email or password', null, 401);
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return errorResponse(res, 'Invalid email or password', null, 401);
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Track login activity
      await activityService.trackActivity({
        userId: user._id,
        action: 'login',
        details: {
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      }, req);

      // Generate tokens
      const token = generateToken({ id: user._id, email: user.email, role: user.role });
      const refreshToken = generateRefreshToken({ id: user._id });

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      logger.info(`User logged in: ${email}`);

      return successResponse(res, 'Login successful', {
        user: userResponse,
        token,
        refreshToken
      });

    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      return errorResponse(res, 'Error logging in', error);
    }
  }

  async verifyToken(req, res) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return errorResponse(res, 'No token provided', null, 401);
      }

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user || !user.isActive) {
        return errorResponse(res, 'Invalid token or user not found', null, 401);
      }

      return successResponse(res, 'Token is valid', { user });

    } catch (error) {
      return errorResponse(res, 'Invalid token', error, 401);
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return errorResponse(res, 'Refresh token is required', null, 400);
      }

      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id).select('-password');

      if (!user || !user.isActive) {
        return errorResponse(res, 'Invalid refresh token', null, 401);
      }

      // Generate new tokens
      const newToken = generateToken({ id: user._id, email: user.email, role: user.role });
      const newRefreshToken = generateRefreshToken({ id: user._id });

      return successResponse(res, 'Token refreshed successfully', {
        token: newToken,
        refreshToken: newRefreshToken
      });

    } catch (error) {
      return errorResponse(res, 'Invalid refresh token', error, 401);
    }
  }

  async logout(req, res) {
    try {
      // Track logout activity
      await activityService.trackActivity({
        userId: req.user._id,
        action: 'logout',
        details: {
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      }, req);
      
      // In a more sophisticated implementation, you might want to blacklist the token
      // For now, we'll just return a success response
      logger.info(`User logged out: ${req.user.email}`);
      return successResponse(res, 'Logout successful');
    } catch (error) {
      logger.error(`Logout error: ${error.message}`);
      return errorResponse(res, 'Error logging out', error);
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user._id;

      const user = await User.findById(userId).select('+password');

      if (!user) {
        return errorResponse(res, 'User not found', null, 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);

      if (!isCurrentPasswordValid) {
        return errorResponse(res, 'Current password is incorrect', null, 400);
      }

      // Update password
      user.password = newPassword;
      await user.save();
      
      // Track password change activity
      await activityService.trackActivity({
        userId: user._id,
        action: 'password_change',
        details: {
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      }, req);

      logger.info(`Password changed for user: ${user.email}`);

      return successResponse(res, 'Password changed successfully');

    } catch (error) {
      logger.error(`Change password error: ${error.message}`);
      return errorResponse(res, 'Error changing password', error);
    }
  }
}

module.exports = new AuthController();
