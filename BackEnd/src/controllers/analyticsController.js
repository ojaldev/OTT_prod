const Content = require('../models/Content');
const { successResponse, errorResponse } = require('../utils/responses');
const logger = require('../utils/logger');
const AnalyticsFilterBuilder = require('../utils/analyticsFilters');

class AnalyticsController {
  async getPlatformDistribution(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
      const { sortBy, sortOrder } = params;

      const pipeline = [
        { $match: matchStage },
        { $group: { _id: '$platform', count: { $sum: 1 } } },
        { $sort: AnalyticsFilterBuilder.buildSort(sortBy, sortOrder) },
        { $project: { _id: 0, platform: '$_id', count: 1 } }
      ];

      const result = await Content.aggregate(pipeline);
      
      return successResponse(res, 'Platform distribution retrieved', {
        data: result,
        filters: params,
        total: result.reduce((sum, item) => sum + item.count, 0)
      });
    } catch (error) {
      logger.error(`Platform distribution error: ${error.message}`);
      return errorResponse(res, 'Error retrieving platform distribution', error);
    }
  }

  async getGenreTrends(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
      
      // Ensure genres are not null/empty
      matchStage.assignedGenre = { ...matchStage.assignedGenre, $nin: [null, ''] };

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
        { $sort: { total: -1 } },
        { $project: { _id: 0, genre: '$_id', data: 1, total: 1 } }
      ];

      const result = await Content.aggregate(pipeline);
      
      return successResponse(res, 'Genre trends retrieved', {
        data: result,
        filters: params
      });
    } catch (error) {
      logger.error(`Genre trends error: ${error.message}`);
      return errorResponse(res, 'Error retrieving genre trends', error);
    }
  }

  async getLanguageStats(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
      const { sortBy, sortOrder } = params;

      const pipeline = [
        { $match: matchStage },
        { $group: { _id: '$primaryLanguage', count: { $sum: 1 } } },
        { $sort: AnalyticsFilterBuilder.buildSort(sortBy, sortOrder) },
        { $project: { _id: 0, language: '$_id', count: 1 } }
      ];

      const result = await Content.aggregate(pipeline);
      
      return successResponse(res, 'Language statistics retrieved', {
        data: result,
        filters: params,
        total: result.reduce((sum, item) => sum + item.count, 0)
      });
    } catch (error) {
      logger.error(`Language stats error: ${error.message}`);
      return errorResponse(res, 'Error retrieving language statistics', error);
    }
  }

  async getYearlyReleases(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);

      // Set default year range if not specified
      if (!matchStage.year) {
        matchStage.year = { 
          $gte: parseInt(params.startYear || 2010), 
          $lte: parseInt(params.endYear || new Date().getFullYear()) 
        };
      }

      const pipeline = [
        { $match: matchStage },
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, year: '$_id', count: 1 } }
      ];

      const result = await Content.aggregate(pipeline);
      
      return successResponse(res, 'Yearly releases retrieved', {
        data: result,
        filters: params,
        total: result.reduce((sum, item) => sum + item.count, 0)
      });
    } catch (error) {
      logger.error(`Yearly releases error: ${error.message}`);
      return errorResponse(res, 'Error retrieving yearly releases', error);
    }
  }

  async getDubbingAnalysis(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);

      const pipeline = [
        { $match: matchStage },
        {
          $project: {
            platform: 1,
            title: 1,
            totalDubbings: 1,
            dubbingLanguages: {
              $objectToArray: '$dubbing'
            }
          }
        },
        { $unwind: '$dubbingLanguages' },
        { $match: { 'dubbingLanguages.v': true } },
        {
          $group: {
            _id: '$dubbingLanguages.k',
            count: { $sum: 1 },
            platforms: { $addToSet: '$platform' }
          }
        },
        { $sort: { count: -1 } },
        { $project: { _id: 0, language: '$_id', count: 1, platforms: 1 } }
      ];

      const result = await Content.aggregate(pipeline);
      
      // Also get dubbing distribution stats
      const dubbingDistribution = await Content.aggregate([
        { $match: matchStage },
        { $group: { _id: '$totalDubbings', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, dubbingCount: '$_id', contentCount: '$count' } }
      ]);

      return successResponse(res, 'Dubbing analysis retrieved', {
        languageBreakdown: result,
        dubbingDistribution,
        filters: params
      });
    } catch (error) {
      logger.error(`Dubbing analysis error: ${error.message}`);
      return errorResponse(res, 'Error retrieving dubbing analysis', error);
    }
  }

  async getSourceBreakdown(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
      const { sortBy, sortOrder } = params;

      const pipeline = [
        { $match: matchStage },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: AnalyticsFilterBuilder.buildSort(sortBy, sortOrder) },
        { $project: { _id: 0, source: '$_id', count: 1 } }
      ];

      const result = await Content.aggregate(pipeline);
      
      return successResponse(res, 'Source breakdown retrieved', {
        data: result,
        filters: params,
        total: result.reduce((sum, item) => sum + item.count, 0)
      });
    } catch (error) {
      logger.error(`Source breakdown error: ${error.message}`);
      return errorResponse(res, 'Error retrieving source breakdown', error);
    }
  }

  async getDurationAnalysis(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
      matchStage.durationHours = { ...matchStage.durationHours, $exists: true, $ne: null };

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$durationHours' },
            minDuration: { $min: '$durationHours' },
            maxDuration: { $max: '$durationHours' },
            totalContent: { $sum: 1 }
          }
        }
      ];

      const stats = await Content.aggregate(pipeline);

      // Duration ranges
      const rangesPipeline = [
        { $match: matchStage },
        {
          $bucket: {
            groupBy: '$durationHours',
            boundaries: [0, 1, 2, 3, 5, 10, 20, 50],
            default: '50+',
            output: {
              count: { $sum: 1 }
            }
          }
        },
        {
          $project: {
            _id: 0,
            range: {
              $cond: [
                { $eq: ['$_id', '50+'] },
                '50+',
                { $concat: [{ $toString: '$_id' }, '-', { $toString: { $add: ['$_id', 1] } }, ' hrs'] }
              ]
            },
            count: 1
          }
        }
      ];

      const ranges = await Content.aggregate(rangesPipeline);

      return successResponse(res, 'Duration analysis retrieved', {
        statistics: stats[0] || {},
        ranges,
        filters: params
      });
    } catch (error) {
      logger.error(`Duration analysis error: ${error.message}`);
      return errorResponse(res, 'Error retrieving duration analysis', error);
    }
  }

  async getAgeRatingDistribution(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
      const { sortBy, sortOrder } = params;

      const pipeline = [
        { $match: matchStage },
        { $group: { _id: '$ageRating', count: { $sum: 1 } } },
        { $sort: AnalyticsFilterBuilder.buildSort(sortBy, sortOrder) },
        { $project: { _id: 0, ageRating: '$_id', count: 1 } }
      ];

      const result = await Content.aggregate(pipeline);
      
      return successResponse(res, 'Age rating distribution retrieved', {
        data: result,
        filters: params,
        total: result.reduce((sum, item) => sum + item.count, 0)
      });
    } catch (error) {
      logger.error(`Age rating distribution error: ${error.message}`);
      return errorResponse(res, 'Error retrieving age rating distribution', error);
    }
  }

  async getCustomAnalytics(req, res) {
    try {
      const { 
        groupBy, 
        aggregationType = 'count',
        metric = 'count'
      } = req.body;

      if (!groupBy) {
        return errorResponse(res, 'groupBy field is required', null, 400);
      }

      // Parse filters from query or body
      const params = AnalyticsFilterBuilder.parseQueryParams({ ...req.query, ...req.body });
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
      const { sortBy, sortOrder } = params;

      // Build aggregation pipeline
      const pipeline = [
        { $match: matchStage }
      ];

      // Build group stage based on groupBy (can be single or multiple fields)
      const groupId = AnalyticsFilterBuilder.buildGroupBy(groupBy);
      const groupStage = { _id: groupId };

      // Handle different aggregation types
      if (aggregationType === 'count' || metric === 'count') {
        groupStage.count = { $sum: 1 };
      }
      
      if (metric === 'avgDuration' || aggregationType === 'avg') {
        pipeline.splice(1, 0, { $match: { durationHours: { $exists: true, $ne: null } } });
        groupStage.avgDuration = { $avg: '$durationHours' };
      }

      if (metric === 'totalDuration') {
        pipeline.splice(1, 0, { $match: { durationHours: { $exists: true, $ne: null } } });
        groupStage.totalDuration = { $sum: '$durationHours' };
      }

      if (metric === 'avgDubbings') {
        groupStage.avgDubbings = { $avg: '$totalDubbings' };
      }

      pipeline.push(
        { $group: groupStage },
        { $sort: AnalyticsFilterBuilder.buildSort(sortBy, sortOrder) }
      );

      const result = await Content.aggregate(pipeline);
      
      return successResponse(res, 'Custom analytics retrieved', {
        data: result,
        filters: params,
        groupBy,
        metric
      });
    } catch (error) {
      logger.error(`Custom analytics error: ${error.message}`);
      return errorResponse(res, 'Error retrieving custom analytics', error);
    }
  }

  async getDashboardSummary(req, res) {
    try {
      // Total active content
      const totalContent = await Content.countDocuments({ isActive: true });

      // Total platforms (distinct count)
      const platforms = await Content.distinct('platform', { isActive: true });
      const totalPlatforms = platforms.length;

      // Content released this year (by 'year' field)
      const now = new Date();
      const currentYear = now.getFullYear();
      const contentThisYear = await Content.countDocuments({
        isActive: true,
        year: currentYear
      });

      // Total genres (distinct assignedGenre, excluding null/empty)
      const genres = await Content.distinct('assignedGenre', { isActive: true });
      const totalGenres = genres.filter(g => g && String(g).trim().length > 0).length;

      // Recent content released (by releaseDate desc)
      const recentContent = await Content.find({ isActive: true, releaseDate: { $ne: null } })
        .sort({ releaseDate: -1 })
        .limit(5)
        .populate('createdBy', 'username')
        .select('title platform year releaseDate');

      return successResponse(res, 'Dashboard summary retrieved', {
        totalContent,
        totalPlatforms,
        contentThisYear,
        totalGenres,
        recentContent
      });
    } catch (error) {
      logger.error(`Dashboard summary error: ${error.message}`);
      return errorResponse(res, 'Error retrieving dashboard summary', error);
    }
  }

  // Monthly release trend using releaseDate
  async getMonthlyReleaseTrend(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
      
      const { startDate, endDate } = req.query;
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end.getFullYear(), end.getMonth() - 11, 1);

      matchStage.releaseDate = { $gte: start, $lte: end };

      const pipeline = [
        { $match: matchStage },
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
      return successResponse(res, 'Monthly release trend retrieved', {
        data: result,
        filters: params
      });
    } catch (error) {
      logger.error(`Monthly release trend error: ${error.message}`);
      return errorResponse(res, 'Error retrieving monthly release trend', error);
    }
  }

  // Platform growth over time (releases per year per platform)
  async getPlatformGrowthOverTime(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
      
      const currentYear = new Date().getFullYear();
      const { startYear = 2010, endYear = currentYear } = req.query;

      if (!matchStage.year) {
        matchStage.year = { $gte: parseInt(startYear), $lte: parseInt(endYear) };
      }

      const pipeline = [
        { $match: matchStage },
        { $group: { _id: { year: '$year', platform: '$platform' }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, count: -1 } },
        { $project: { _id: 0, year: '$_id.year', platform: '$_id.platform', count: 1 } }
      ];

      const result = await Content.aggregate(pipeline);
      return successResponse(res, 'Platform growth over time retrieved', {
        data: result,
        filters: params
      });
    } catch (error) {
      logger.error(`Platform growth over time error: ${error.message}`);
      return errorResponse(res, 'Error retrieving platform growth over time', error);
    }
  }

  // Genre-platform heatmap
  async getGenrePlatformHeatmap(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
      matchStage.assignedGenre = { ...matchStage.assignedGenre, $nin: [null, ''] };

      const pipeline = [
        { $match: matchStage },
        { $group: { _id: { genre: '$assignedGenre', platform: '$platform' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, genre: '$_id.genre', platform: '$_id.platform', count: 1 } }
      ];

      const result = await Content.aggregate(pipeline);
      return successResponse(res, 'Genre-platform heatmap retrieved', {
        data: result,
        filters: params
      });
    } catch (error) {
      logger.error(`Genre-platform heatmap error: ${error.message}`);
      return errorResponse(res, 'Error retrieving genre-platform heatmap', error);
    }
  }

  // Language-platform matrix
  async getLanguagePlatformMatrix(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
      matchStage.primaryLanguage = { ...matchStage.primaryLanguage, $nin: [null, ''] };

      const pipeline = [
        { $match: matchStage },
        { $group: { _id: { language: '$primaryLanguage', platform: '$platform' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, language: '$_id.language', platform: '$_id.platform', count: 1 } }
      ];

      const result = await Content.aggregate(pipeline);
      return successResponse(res, 'Language-platform matrix retrieved', {
        data: result,
        filters: params
      });
    } catch (error) {
      logger.error(`Language-platform matrix error: ${error.message}`);
      return errorResponse(res, 'Error retrieving language-platform matrix', error);
    }
  }

  // Duration by format and genre
  async getDurationByFormatGenre(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
      matchStage.durationHours = { ...matchStage.durationHours, $exists: true, $ne: null };

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: { format: '$assignedFormat', genre: '$assignedGenre' },
            avgDuration: { $avg: '$durationHours' },
            minDuration: { $min: '$durationHours' },
            maxDuration: { $max: '$durationHours' },
            count: { $sum: 1 }
          }
        },
        { $sort: { avgDuration: -1 } },
        { $project: { _id: 0, format: '$_id.format', genre: '$_id.genre', avgDuration: 1, minDuration: 1, maxDuration: 1, count: 1 } }
      ];

      const result = await Content.aggregate(pipeline);
      return successResponse(res, 'Duration by format/genre retrieved', {
        data: result,
        filters: params
      });
    } catch (error) {
      logger.error(`Duration by format/genre error: ${error.message}`);
      return errorResponse(res, 'Error retrieving duration by format/genre', error);
    }
  }

  // Dubbing penetration (overall and by platform)
  async getDubbingPenetration(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);

      const overall = await Content.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            dubbed: { $sum: { $cond: [{ $gt: ['$totalDubbings', 0] }, 1, 0] } },
            avgDubbings: { $avg: '$totalDubbings' }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1,
            dubbed: 1,
            pctDubbed: {
              $cond: [
                { $gt: ['$total', 0] },
                { $multiply: [{ $divide: ['$dubbed', '$total'] }, 100] },
                0
              ]
            },
            avgDubbings: 1
          }
        }
      ]);

      const byPlatform = await Content.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$platform',
            total: { $sum: 1 },
            dubbed: { $sum: { $cond: [{ $gt: ['$totalDubbings', 0] }, 1, 0] } },
            avgDubbings: { $avg: '$totalDubbings' }
          }
        },
        {
          $project: {
            _id: 0,
            platform: '$_id',
            total: 1,
            dubbed: 1,
            pctDubbed: {
              $cond: [
                { $gt: ['$total', 0] },
                { $multiply: [{ $divide: ['$dubbed', '$total'] }, 100] },
                0
              ]
            },
            avgDubbings: 1
          }
        },
        { $sort: { pctDubbed: -1 } }
      ]);

      return successResponse(res, 'Dubbing penetration retrieved', {
        overall: overall[0] || { total: 0, dubbed: 0, pctDubbed: 0, avgDubbings: 0 },
        byPlatform,
        filters: params
      });
    } catch (error) {
      logger.error(`Dubbing penetration error: ${error.message}`);
      return errorResponse(res, 'Error retrieving dubbing penetration', error);
    }
  }

  // Top dubbed languages
  async getTopDubbedLanguages(req, res) {
    try {
      const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
      const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
      const limit = parseInt(req.query.limit) || 10;
      
      const pipeline = [
        { $match: matchStage },
        {
          $project: {
            dubbingLanguages: { $objectToArray: '$dubbing' }
          }
        },
        { $unwind: '$dubbingLanguages' },
        { $match: { 'dubbingLanguages.v': true } },
        { $group: { _id: '$dubbingLanguages.k', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { _id: 0, language: '$_id', count: 1 } }
      ];

      const result = await Content.aggregate(pipeline);
      return successResponse(res, 'Top dubbed languages retrieved', {
        data: result,
        filters: params,
        limit
      });
    } catch (error) {
      logger.error(`Top dubbed languages error: ${error.message}`);
      return errorResponse(res, 'Error retrieving top dubbed languages', error);
    }
  }
}

// Content freshness and data quality analytics
AnalyticsController.prototype.getContentFreshness = async function(req, res) {
  try {
    const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
    const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
    const now = new Date();
    const currentYear = now.getFullYear();

    const pipeline = [
      { $match: matchStage },
      {
        $project: {
          platform: 1,
          year: 1,
          effectiveReleaseDate: {
            $ifNull: [
              '$releaseDate',
              { $dateFromParts: { year: '$year', month: 1, day: 1 } }
            ]
          }
        }
      },
      {
        $project: {
          platform: 1,
          year: 1,
          ageDays: {
            $trunc: {
              $divide: [
                { $subtract: [now, '$effectiveReleaseDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          },
          isThisYear: { $cond: [ { $eq: ['$year', currentYear] }, 1, 0 ] }
        }
      },
      {
        $project: {
          platform: 1,
          year: 1,
          ageDays: { $cond: [{ $lt: ['$ageDays', 0] }, 0, '$ageDays'] },
          isThisYear: 1,
          last7: { $cond: [ { $lte: ['$ageDays', 7] }, 1, 0 ] },
          last30: { $cond: [ { $lte: ['$ageDays', 30] }, 1, 0 ] },
          last90: { $cond: [ { $lte: ['$ageDays', 90] }, 1, 0 ] }
        }
      },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                avgAgeDays: { $avg: '$ageDays' },
                minAgeDays: { $min: '$ageDays' },
                maxAgeDays: { $max: '$ageDays' },
                last7: { $sum: '$last7' },
                last30: { $sum: '$last30' },
                last90: { $sum: '$last90' },
                releasedThisYear: { $sum: '$isThisYear' }
              }
            },
            { $project: { _id: 0 } }
          ],
          byPlatform: [
            {
              $group: {
                _id: '$platform',
                total: { $sum: 1 },
                avgAgeDays: { $avg: '$ageDays' },
                last30: { $sum: '$last30' },
                last90: { $sum: '$last90' },
                releasedThisYear: { $sum: '$isThisYear' }
              }
            },
            {
              $project: {
                _id: 0,
                platform: '$_id',
                total: 1,
                avgAgeDays: 1,
                last30: 1,
                last90: 1,
                releasedThisYear: 1
              }
            },
            { $sort: { avgAgeDays: 1 } }
          ]
        }
      }
    ];

    const [result] = await Content.aggregate(pipeline);
    const payload = {
      overall: (result && result.overall && result.overall[0]) || {
        total: 0, avgAgeDays: 0, minAgeDays: 0, maxAgeDays: 0, last7: 0, last30: 0, last90: 0, releasedThisYear: 0
      },
      byPlatform: (result && result.byPlatform) || [],
      filters: params
    };

    return successResponse(res, 'Content freshness retrieved', payload);
  } catch (error) {
    logger.error(`Content freshness error: ${error.message}`);
    return errorResponse(res, 'Error retrieving content freshness', error);
  }
};

AnalyticsController.prototype.getDataQualityScore = async function(req, res) {
  try {
    const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
    const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
    
    const pipeline = [
      { $match: matchStage },
      {
        $project: {
          title: 1,
          platform: 1,
          primaryLanguage: 1,
          assignedGenre: 1,
          assignedFormat: 1,
          year: 1,
          releaseDate: 1,
          durationHours: 1,
          ageRating: 1,
          source: 1,
          totalDubbings: 1,

          hasPlatform: { $cond: [ { $gt: [ { $strLenCP: { $ifNull: ['$platform', ''] } }, 0 ] }, 1, 0 ] },
          hasTitle: { $cond: [ { $gt: [ { $strLenCP: { $ifNull: ['$title', ''] } }, 0 ] }, 1, 0 ] },
          hasPrimaryLanguage: { $cond: [ { $gt: [ { $strLenCP: { $ifNull: ['$primaryLanguage', ''] } }, 0 ] }, 1, 0 ] },
          hasYear: { $cond: [ { $and: [ { $ne: ['$year', null] }, { $gte: ['$year', 1900] } ] }, 1, 0 ] },
          hasAssignedGenre: { $cond: [ { $gt: [ { $strLenCP: { $ifNull: ['$assignedGenre', ''] } }, 0 ] }, 1, 0 ] },
          hasAssignedFormat: { $cond: [ { $gt: [ { $strLenCP: { $ifNull: ['$assignedFormat', ''] } }, 0 ] }, 1, 0 ] },
          hasReleaseDate: { $cond: [ { $ne: ['$releaseDate', null] }, 1, 0 ] },
          hasDurationHours: { $cond: [ { $and: [ { $ne: ['$durationHours', null] }, { $gte: ['$durationHours', 0] } ] }, 1, 0 ] },
          hasAgeRating: { $cond: [ { $gt: [ { $strLenCP: { $ifNull: ['$ageRating', ''] } }, 0 ] }, 1, 0 ] },
          hasSource: { $cond: [ { $gt: [ { $strLenCP: { $ifNull: ['$source', ''] } }, 0 ] }, 1, 0 ] },
          hasDubbingData: { $cond: [ { $gt: ['$totalDubbings', 0] }, 1, 0 ] }
        }
      },
      {
        $project: {
          title: 1,
          platform: 1,
          // weighted score out of 100
          score: {
            $add: [
              { $multiply: ['$hasPlatform', 10] },
              { $multiply: ['$hasTitle', 10] },
              { $multiply: ['$hasPrimaryLanguage', 10] },
              { $multiply: ['$hasYear', 15] },
              { $multiply: ['$hasAssignedGenre', 10] },
              { $multiply: ['$hasAssignedFormat', 10] },
              { $multiply: ['$hasReleaseDate', 10] },
              { $multiply: ['$hasDurationHours', 10] },
              { $multiply: ['$hasAgeRating', 5] },
              { $multiply: ['$hasSource', 5] },
              { $multiply: ['$hasDubbingData', 5] }
            ]
          },
          missingFields: {
            $setUnion: [
              { $cond: [ { $eq: ['$hasPlatform', 0] }, ['platform'], [] ] },
              { $cond: [ { $eq: ['$hasTitle', 0] }, ['title'], [] ] },
              { $cond: [ { $eq: ['$hasPrimaryLanguage', 0] }, ['primaryLanguage'], [] ] },
              { $cond: [ { $eq: ['$hasYear', 0] }, ['year'], [] ] },
              { $cond: [ { $eq: ['$hasAssignedGenre', 0] }, ['assignedGenre'], [] ] },
              { $cond: [ { $eq: ['$hasAssignedFormat', 0] }, ['assignedFormat'], [] ] },
              { $cond: [ { $eq: ['$hasReleaseDate', 0] }, ['releaseDate'], [] ] },
              { $cond: [ { $eq: ['$hasDurationHours', 0] }, ['durationHours'], [] ] },
              { $cond: [ { $eq: ['$hasAgeRating', 0] }, ['ageRating'], [] ] },
              { $cond: [ { $eq: ['$hasSource', 0] }, ['source'], [] ] },
              { $cond: [ { $eq: ['$hasDubbingData', 0] }, ['dubbingLanguages'], [] ] }
            ]
          },
          indicators: {
            platform: '$hasPlatform',
            title: '$hasTitle',
            primaryLanguage: '$hasPrimaryLanguage',
            year: '$hasYear',
            assignedGenre: '$hasAssignedGenre',
            assignedFormat: '$hasAssignedFormat',
            releaseDate: '$hasReleaseDate',
            durationHours: '$hasDurationHours',
            ageRating: '$hasAgeRating',
            source: '$hasSource',
            dubbing: '$hasDubbingData'
          }
        }
      },
      {
        $facet: {
          overall: [
            { $group: { _id: null, total: { $sum: 1 }, avgScore: { $avg: '$score' }, minScore: { $min: '$score' }, maxScore: { $max: '$score' } } },
            { $project: { _id: 0 } }
          ],
          distribution: [
            {
              $bucket: {
                groupBy: '$score',
                boundaries: [0, 40, 60, 80, 101],
                default: 'other',
                output: { count: { $sum: 1 } }
              }
            },
            {
              $project: {
                _id: 0,
                range: {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$_id', 0] }, then: '0-39' },
                      { case: { $eq: ['$_id', 40] }, then: '40-59' },
                      { case: { $eq: ['$_id', 60] }, then: '60-79' },
                      { case: { $eq: ['$_id', 80] }, then: '80-100' }
                    ],
                    default: 'other'
                  }
                },
                count: 1
              }
            }
          ],
          byPlatform: [
            { $group: { _id: '$platform', avgScore: { $avg: '$score' }, total: { $sum: 1 } } },
            { $project: { _id: 0, platform: '$_id', avgScore: 1, total: 1 } },
            { $sort: { avgScore: 1 } }
          ],
          topIssues: [
            {
              $group: {
                _id: null,
                missingPlatform: { $sum: { $cond: [ { $eq: ['$indicators.platform', 0] }, 1, 0 ] } },
                missingTitle: { $sum: { $cond: [ { $eq: ['$indicators.title', 0] }, 1, 0 ] } },
                missingPrimaryLanguage: { $sum: { $cond: [ { $eq: ['$indicators.primaryLanguage', 0] }, 1, 0 ] } },
                missingYear: { $sum: { $cond: [ { $eq: ['$indicators.year', 0] }, 1, 0 ] } },
                missingAssignedGenre: { $sum: { $cond: [ { $eq: ['$indicators.assignedGenre', 0] }, 1, 0 ] } },
                missingAssignedFormat: { $sum: { $cond: [ { $eq: ['$indicators.assignedFormat', 0] }, 1, 0 ] } },
                missingReleaseDate: { $sum: { $cond: [ { $eq: ['$indicators.releaseDate', 0] }, 1, 0 ] } },
                missingDurationHours: { $sum: { $cond: [ { $eq: ['$indicators.durationHours', 0] }, 1, 0 ] } },
                missingAgeRating: { $sum: { $cond: [ { $eq: ['$indicators.ageRating', 0] }, 1, 0 ] } },
                missingSource: { $sum: { $cond: [ { $eq: ['$indicators.source', 0] }, 1, 0 ] } },
                missingDubbing: { $sum: { $cond: [ { $eq: ['$indicators.dubbing', 0] }, 1, 0 ] } }
              }
            },
            { $project: { _id: 0 } }
          ],
          lowQualitySamples: [
            { $match: { score: { $lt: 60 } } },
            { $project: { _id: 0, title: 1, platform: 1, score: 1, missingFields: 1 } },
            { $sort: { score: 1 } },
            { $limit: 10 }
          ]
        }
      }
    ];

    const [result] = await Content.aggregate(pipeline);
    const payload = {
      overall: (result && result.overall && result.overall[0]) || { total: 0, avgScore: 0, minScore: 0, maxScore: 0 },
      distribution: result?.distribution || [],
      byPlatform: result?.byPlatform || [],
      topIssues: (result && result.topIssues && result.topIssues[0]) || {},
      lowQualitySamples: result?.lowQualitySamples || [],
      filters: params
    };

    return successResponse(res, 'Data quality score retrieved', payload);
  } catch (error) {
    logger.error(`Data quality score error: ${error.message}`);
    return errorResponse(res, 'Error retrieving data quality score', error);
  }
};

// New comprehensive multi-dimensional analytics endpoint
AnalyticsController.prototype.getMultiDimensionalAnalytics = async function(req, res) {
  try {
    const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
    const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
    
    // Get dimensions to analyze from query
    const dimensions = req.query.dimensions 
      ? (Array.isArray(req.query.dimensions) ? req.query.dimensions : req.query.dimensions.split(','))
      : ['platform', 'genre', 'language', 'type'];

    // Build facet pipeline for multi-dimensional analysis
    const facets = AnalyticsFilterBuilder.buildFacetPipeline(dimensions.map(d => {
      // Map friendly names to actual field names
      const fieldMap = {
        'platform': 'platform',
        'genre': 'assignedGenre',
        'language': 'primaryLanguage',
        'type': 'assignedFormat',
        'format': 'assignedFormat',
        'source': 'source',
        'ageRating': 'ageRating',
        'year': 'year'
      };
      return fieldMap[d] || d;
    }));

    // Add summary statistics
    facets.summary = [
      {
        $group: {
          _id: null,
          totalContent: { $sum: 1 },
          avgDuration: { $avg: '$durationHours' },
          avgDubbings: { $avg: '$totalDubbings' },
          totalPlatforms: { $addToSet: '$platform' },
          totalGenres: { $addToSet: '$assignedGenre' },
          totalLanguages: { $addToSet: '$primaryLanguage' }
        }
      },
      {
        $project: {
          _id: 0,
          totalContent: 1,
          avgDuration: 1,
          avgDubbings: 1,
          platformCount: { $size: '$totalPlatforms' },
          genreCount: { $size: '$totalGenres' },
          languageCount: { $size: '$totalLanguages' }
        }
      }
    ];

    const pipeline = [
      { $match: matchStage },
      { $facet: facets }
    ];

    const [result] = await Content.aggregate(pipeline);

    return successResponse(res, 'Multi-dimensional analytics retrieved', {
      ...result,
      filters: params,
      dimensions
    });
  } catch (error) {
    logger.error(`Multi-dimensional analytics error: ${error.message}`);
    return errorResponse(res, 'Error retrieving multi-dimensional analytics', error);
  }
};

// Advanced filtering and slicing endpoint
AnalyticsController.prototype.getAdvancedSlicing = async function(req, res) {
  try {
    const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
    const matchStage = AnalyticsFilterBuilder.buildMatchStage(params);
    const { page, limit, sortBy, sortOrder } = params;
    const pagination = AnalyticsFilterBuilder.buildPagination(page, limit);

    // Get grouping dimensions
    const groupBy = req.query.groupBy || 'platform';
    const secondaryGroupBy = req.query.secondaryGroupBy;

    // Build group ID
    let groupId;
    if (secondaryGroupBy) {
      groupId = {
        primary: `$${groupBy}`,
        secondary: `$${secondaryGroupBy}`
      };
    } else {
      groupId = `$${groupBy}`;
    }

    // Build metrics
    const metrics = {
      count: { $sum: 1 },
      avgDuration: { $avg: '$durationHours' },
      totalDuration: { $sum: '$durationHours' },
      avgDubbings: { $avg: '$totalDubbings' },
      minYear: { $min: '$year' },
      maxYear: { $max: '$year' }
    };

    const pipeline = [
      { $match: matchStage },
      { $group: { _id: groupId, ...metrics } },
      { $sort: AnalyticsFilterBuilder.buildSort(sortBy, sortOrder) },
      { $skip: pagination.skip },
      { $limit: pagination.limit }
    ];

    // Get total count for pagination
    const countPipeline = [
      { $match: matchStage },
      { $group: { _id: groupId } },
      { $count: 'total' }
    ];

    const [result, countResult] = await Promise.all([
      Content.aggregate(pipeline),
      Content.aggregate(countPipeline)
    ]);

    const total = countResult[0]?.total || 0;

    return successResponse(res, 'Advanced slicing retrieved', {
      data: result,
      pagination: {
        page: pagination.skip / pagination.limit + 1,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit)
      },
      filters: params,
      groupBy: secondaryGroupBy ? { primary: groupBy, secondary: secondaryGroupBy } : groupBy
    });
  } catch (error) {
    logger.error(`Advanced slicing error: ${error.message}`);
    return errorResponse(res, 'Error retrieving advanced slicing', error);
  }
};

// Comparative analytics across segments
AnalyticsController.prototype.getComparativeAnalytics = async function(req, res) {
  try {
    const params = AnalyticsFilterBuilder.parseQueryParams(req.query);
    const baseMatch = AnalyticsFilterBuilder.buildMatchStage(params);

    // Define segments to compare
    const compareBy = req.query.compareBy || 'platform';
    const metric = req.query.metric || 'count';

    const pipeline = [
      { $match: baseMatch },
      {
        $group: {
          _id: `$${compareBy}`,
          count: { $sum: 1 },
          avgDuration: { $avg: '$durationHours' },
          totalDuration: { $sum: '$durationHours' },
          avgDubbings: { $avg: '$totalDubbings' },
          dubbedContent: { $sum: { $cond: [{ $gt: ['$totalDubbings', 0] }, 1, 0] } },
          yearRange: { 
            min: { $min: '$year' }, 
            max: { $max: '$year' } 
          },
          formats: { $addToSet: '$assignedFormat' },
          genres: { $addToSet: '$assignedGenre' },
          languages: { $addToSet: '$primaryLanguage' }
        }
      },
      {
        $project: {
          _id: 0,
          segment: '$_id',
          count: 1,
          avgDuration: { $round: ['$avgDuration', 2] },
          totalDuration: { $round: ['$totalDuration', 2] },
          avgDubbings: { $round: ['$avgDubbings', 2] },
          dubbingPenetration: {
            $cond: [
              { $gt: ['$count', 0] },
              { $round: [{ $multiply: [{ $divide: ['$dubbedContent', '$count'] }, 100] }, 2] },
              0
            ]
          },
          yearRange: 1,
          formatCount: { $size: '$formats' },
          genreCount: { $size: '$genres' },
          languageCount: { $size: '$languages' }
        }
      },
      { $sort: { [metric]: -1 } }
    ];

    const result = await Content.aggregate(pipeline);

    // Calculate comparative insights
    const insights = {
      totalSegments: result.length,
      topPerformer: result[0],
      averages: {
        count: result.reduce((sum, s) => sum + s.count, 0) / result.length,
        avgDuration: result.reduce((sum, s) => sum + (s.avgDuration || 0), 0) / result.length,
        dubbingPenetration: result.reduce((sum, s) => sum + (s.dubbingPenetration || 0), 0) / result.length
      }
    };

    return successResponse(res, 'Comparative analytics retrieved', {
      data: result,
      insights,
      filters: params,
      compareBy,
      metric
    });
  } catch (error) {
    logger.error(`Comparative analytics error: ${error.message}`);
    return errorResponse(res, 'Error retrieving comparative analytics', error);
  }
};

module.exports = new AnalyticsController();
