const User = require('../models/User');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/responses');
const activityService = require('../services/activityService');

class UserController {
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select('-password');
      
      if (!user) {
        return errorResponse(res, 'User not found', null, 404);
      }

      return successResponse(res, 'Profile retrieved successfully', user);
    } catch (error) {
      logger.error(`Get profile error: ${error.message}`);
      return errorResponse(res, 'Error retrieving profile', error);
    }
  }

  async updateProfile(req, res) {
    try {
      const { username, email } = req.body;
      const userId = req.user._id;

      // Check if username or email already exists (excluding current user)
      if (username || email) {
        const existingUser = await User.findOne({
          _id: { $ne: userId },
          $or: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : [])
          ]
        });

        if (existingUser) {
          return errorResponse(res, 'Username or email already exists', null, 409);
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { username, email },
        { new: true, runValidators: true }
      ).select('-password');

      logger.info(`Profile updated for user: ${updatedUser.email}`);

      return successResponse(res, 'Profile updated successfully', updatedUser);
    } catch (error) {
      logger.error(`Update profile error: ${error.message}`);
      return errorResponse(res, 'Error updating profile', error);
    }
  }

  async getAllUsers(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        role, 
        isActive, 
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        lastLoginStart,
        lastLoginEnd,
        createdStart,
        createdEnd
      } = req.query;

      const filter = {};
      
      // Basic filters
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      
      // Search functionality
      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Date range filters
      if (lastLoginStart || lastLoginEnd) {
        filter.lastLogin = {};
        if (lastLoginStart) filter.lastLogin.$gte = new Date(lastLoginStart);
        if (lastLoginEnd) filter.lastLogin.$lte = new Date(lastLoginEnd);
      }
      
      if (createdStart || createdEnd) {
        filter.createdAt = {};
        if (createdStart) filter.createdAt.$gte = new Date(createdStart);
        if (createdEnd) filter.createdAt.$lte = new Date(createdEnd);
      }

      // Sorting
      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      const sortOptions = {};
      sortOptions[sortBy] = sortDirection;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sortOptions,
        select: '-password'
      };

      const users = await User.paginate(filter, options);

      return successResponse(res, 'Users retrieved successfully', users);
    } catch (error) {
      logger.error(`Get all users error: ${error.message}`);
      return errorResponse(res, 'Error retrieving users', error);
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id).select('-password');

      if (!user) {
        return errorResponse(res, 'User not found', null, 404);
      }

      return successResponse(res, 'User retrieved successfully', user);
    } catch (error) {
      logger.error(`Get user by ID error: ${error.message}`);
      return errorResponse(res, 'Error retrieving user', error);
    }
  }

  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['user', 'admin'].includes(role)) {
        return errorResponse(res, 'Invalid role. Must be user or admin', null, 400);
      }

      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return errorResponse(res, 'User not found', null, 404);
      }

      // Track activity
      await activityService.trackActivity({
        userId: req.user._id,
        action: 'role_change',
        details: {
          targetUser: user._id,
          oldRole: user.role,
          newRole: role
        }
      }, req);

      logger.info(`User role updated: ${user.email} -> ${role} by ${req.user.username}`);

      return successResponse(res, 'User role updated successfully', user);
    } catch (error) {
      logger.error(`Update user role error: ${error.message}`);
      return errorResponse(res, 'Error updating user role', error);
    }
  }
  
  /**
   * Bulk update user roles
   */
  async bulkUpdateRoles(req, res) {
    try {
      const { userIds, role } = req.body;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return errorResponse(res, 'User IDs must be a non-empty array', null, 400);
      }
      
      if (!['user', 'admin'].includes(role)) {
        return errorResponse(res, 'Invalid role. Must be user or admin', null, 400);
      }
      
      // Validate all IDs are valid ObjectIds
      const validIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id));
      if (validIds.length !== userIds.length) {
        return errorResponse(res, 'One or more invalid user IDs provided', null, 400);
      }
      
      // Update users
      const result = await User.updateMany(
        { _id: { $in: validIds } },
        { role }
      );
      
      // Track activity
      await activityService.trackActivity({
        userId: req.user._id,
        action: 'role_change',
        details: {
          bulkOperation: true,
          targetUsers: validIds,
          newRole: role,
          affectedCount: result.modifiedCount
        }
      }, req);
      
      logger.info(`Bulk role update: ${result.modifiedCount} users updated to ${role} by ${req.user.username}`);
      
      return successResponse(res, `Role updated for ${result.modifiedCount} users`, {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      logger.error(`Bulk update roles error: ${error.message}`);
      return errorResponse(res, 'Error updating user roles', error);
    }
  }

  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);

      if (!user) {
        return errorResponse(res, 'User not found', null, 404);
      }
      
      const previousStatus = user.isActive;
      user.isActive = !previousStatus;
      await user.save();

      const updatedUser = await User.findById(id).select('-password');
      
      // Track activity
      await activityService.trackActivity({
        userId: req.user._id,
        action: 'status_change',
        details: {
          targetUser: user._id,
          oldStatus: previousStatus,
          newStatus: user.isActive
        }
      }, req);

      logger.info(`User status toggled: ${user.email} -> ${user.isActive ? 'active' : 'inactive'} by ${req.user.username}`);

      return successResponse(res, 'User status updated successfully', updatedUser);
    } catch (error) {
      logger.error(`Toggle user status error: ${error.message}`);
      return errorResponse(res, 'Error updating user status', error);
    }
  }
  
  /**
   * Bulk toggle user status (activate/deactivate)
   */
  async bulkToggleStatus(req, res) {
    try {
      const { userIds, setActive } = req.body;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return errorResponse(res, 'User IDs must be a non-empty array', null, 400);
      }
      
      if (typeof setActive !== 'boolean') {
        return errorResponse(res, 'setActive must be a boolean value', null, 400);
      }
      
      // Validate all IDs are valid ObjectIds
      const validIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id));
      if (validIds.length !== userIds.length) {
        return errorResponse(res, 'One or more invalid user IDs provided', null, 400);
      }
      
      // Update users
      const result = await User.updateMany(
        { _id: { $in: validIds } },
        { isActive: setActive }
      );
      
      // Track activity
      await activityService.trackActivity({
        userId: req.user._id,
        action: 'status_change',
        details: {
          bulkOperation: true,
          targetUsers: validIds,
          newStatus: setActive,
          affectedCount: result.modifiedCount
        }
      }, req);
      
      const statusText = setActive ? 'activated' : 'deactivated';
      logger.info(`Bulk status update: ${result.modifiedCount} users ${statusText} by ${req.user.username}`);
      
      return successResponse(res, `${result.modifiedCount} users ${statusText} successfully`, {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      logger.error(`Bulk toggle status error: ${error.message}`);
      return errorResponse(res, 'Error updating user status', error);
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (id === req.user._id.toString()) {
        return errorResponse(res, 'Cannot delete your own account', null, 400);
      }

      const user = await User.findByIdAndDelete(id);

      if (!user) {
        return errorResponse(res, 'User not found', null, 404);
      }
      
      // Track activity
      await activityService.trackActivity({
        userId: req.user._id,
        action: 'delete',
        details: {
          deletedUser: {
            id: user._id,
            email: user.email,
            username: user.username
          }
        }
      }, req);

      logger.info(`User deleted: ${user.email} by ${req.user.username}`);

      return successResponse(res, 'User deleted successfully');
    } catch (error) {
      logger.error(`Delete user error: ${error.message}`);
      return errorResponse(res, 'Error deleting user', error);
    }
  }
  
  /**
   * Get user activity logs
   */
  async getUserActivities(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      // Verify user exists
      const user = await User.findById(id).select('_id');
      if (!user) {
        return errorResponse(res, 'User not found', null, 404);
      }
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit)
      };
      
      const activities = await activityService.getUserActivities(id, options);
      
      return successResponse(res, 'User activities retrieved successfully', activities);
    } catch (error) {
      logger.error(`Get user activities error: ${error.message}`);
      return errorResponse(res, 'Error retrieving user activities', error);
    }
  }
  
  /**
   * Get all user activities (admin only)
   */
  async getAllActivities(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20,
        userId,
        action,
        startDate,
        endDate
      } = req.query;
      
      const filter = {};
      
      if (userId) filter.user = userId;
      if (action) filter.action = action;
      
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit)
      };
      
      const activities = await activityService.getActivities(filter, options);
      
      return successResponse(res, 'Activities retrieved successfully', activities);
    } catch (error) {
      logger.error(`Get all activities error: ${error.message}`);
      return errorResponse(res, 'Error retrieving activities', error);
    }
  }
}

module.exports = new UserController();
