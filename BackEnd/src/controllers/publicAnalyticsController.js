const Content = require('../models/Content');
const { successResponse, errorResponse } = require('../utils/responses');
const logger = require('../utils/logger');

class PublicAnalyticsController {
  // Monthly release trend using releaseDate
  async getMonthlyReleaseTrend(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end.getFullYear(), end.getMonth() - 11, 1);

      const pipeline = [
        { $match: { isActive: true, releaseDate: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$releaseDate' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, period: '$_id', count: 1 } }
      ];

      const result = await Content.aggregate(pipeline);
      return successResponse(res, 'Monthly release trend retrieved', result);
    } catch (error) {
      logger.error(`Public monthly release trend error: ${error.message}`);
      return errorResponse(res, 'Error retrieving monthly release trend', error);
    }
  }

  // Platform distribution
  async getPlatformDistribution(req, res) {
    try {
      const pipeline = [
        { $match: { isActive: true } },
        { $group: { _id: '$platform', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ];

      const result = await Content.aggregate(pipeline);
      
      return successResponse(res, 'Platform distribution retrieved', result);
    } catch (error) {
      logger.error(`Public platform distribution error: ${error.message}`);
      return errorResponse(res, 'Error retrieving platform distribution', error);
    }
  }

  // Language-platform matrix
  async getLanguagePlatformMatrix(req, res) {
    try {
      const pipeline = [
        { $match: { isActive: true, primaryLanguage: { $nin: [null, ''] } } },
        { $group: { _id: { language: '$primaryLanguage', platform: '$platform' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, language: '$_id.language', platform: '$_id.platform', count: 1 } }
      ];

      const result = await Content.aggregate(pipeline);
      return successResponse(res, 'Language-platform matrix retrieved', result);
    } catch (error) {
      logger.error(`Public language-platform matrix error: ${error.message}`);
      return errorResponse(res, 'Error retrieving language-platform matrix', error);
    }
  }

  // Genre trends
  async getGenreTrends(req, res) {
    try {
      const { startYear, endYear } = req.query;
      
      const matchStage = { isActive: true };
      if (startYear || endYear) {
        matchStage.year = {};
        if (startYear) matchStage.year.$gte = parseInt(startYear);
        if (endYear) matchStage.year.$lte = parseInt(endYear);
      }

      const pipeline = [
        { $match: matchStage },
        { 
          $group: { 
            _id: { 
              genre: '$assignedGenre', 
              year: '$year' 
            }, 
            count: { $sum: 1 } 
          } 
        },
        { 
          $group: {
            _id: '$_id.genre',
            data: { 
              $push: { 
                year: '$_id.year', 
                count: '$count' 
              } 
            },
            total: { $sum: '$count' }
          }
        },
        { $sort: { total: -1 } }
      ];

      const result = await Content.aggregate(pipeline);
      
      return successResponse(res, 'Genre trends retrieved', result);
    } catch (error) {
      logger.error(`Public genre trends error: ${error.message}`);
      return errorResponse(res, 'Error retrieving genre trends', error);
    }
  }
}

module.exports = new PublicAnalyticsController();
