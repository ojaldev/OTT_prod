const UserActivity = require('../models/UserActivity');
const logger = require('../utils/logger');

class ActivityService {
  /**
   * Track user activity
   * @param {Object} activityData - Activity data
   * @param {Object} req - Express request object
   */
  async trackActivity(activityData, req) {
    try {
      const { userId, action, details = {} } = activityData;
      
      // Add IP and user agent if available
      if (req) {
        details.ip = req.ip || req.connection.remoteAddress;
        details.userAgent = req.headers['user-agent'];
      }
      
      const activity = new UserActivity({
        user: userId,
        action,
        details
      });
      
      await activity.save();
      logger.debug(`Activity tracked: ${action} by user ${userId}`);
      
      return activity;
    } catch (error) {
      logger.error(`Error tracking activity: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get all activities with filtering
   * @param {Object} filters - Query filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated activities
   */
  async getActivities(filters = {}, options = {}) {
    try {
      const defaultOptions = {
        page: 1,
        limit: 20,
        sort: { createdAt: -1 },
        populate: {
          path: 'user',
          select: 'username email role'
        }
      };

      const queryOptions = { ...defaultOptions, ...options };
      
      return await UserActivity.paginate(filters, queryOptions);
    } catch (error) {
      logger.error(`Error fetching activities: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get activities for a specific user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated user activities
   */
  async getUserActivities(userId, options = {}) {
    return this.getActivities({ user: userId }, options);
  }
}

module.exports = new ActivityService();
