const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Platform distribution
router.get('/platform-distribution', authenticate, analyticsController.getPlatformDistribution);

// Genre trends
router.get('/genre-trends', authenticate, analyticsController.getGenreTrends);

// Language statistics
router.get('/language-stats', authenticate, analyticsController.getLanguageStats);

// Yearly releases
router.get('/yearly-releases', authenticate, analyticsController.getYearlyReleases);

// Dubbing analysis
router.get('/dubbing-analysis', authenticate, analyticsController.getDubbingAnalysis);

// Source breakdown
router.get('/source-breakdown', authenticate, analyticsController.getSourceBreakdown);

// Duration analysis
router.get('/duration-analysis', authenticate, analyticsController.getDurationAnalysis);

// Age rating distribution
router.get('/age-rating-distribution', authenticate, analyticsController.getAgeRatingDistribution);

// Dashboard summary
router.get('/dashboard-summary', authenticate, analyticsController.getDashboardSummary);

// Custom analytics with filters
router.post('/custom', authenticate, analyticsController.getCustomAnalytics);

// Monthly release trend
router.get('/monthly-release-trend', authenticate, analyticsController.getMonthlyReleaseTrend);

// Platform growth over time
router.get('/platform-growth', authenticate, analyticsController.getPlatformGrowthOverTime);

// Genre-platform heatmap
router.get('/genre-platform-heatmap', authenticate, analyticsController.getGenrePlatformHeatmap);

// Language-platform matrix
router.get('/language-platform-matrix', authenticate, analyticsController.getLanguagePlatformMatrix);

// Duration by format and genre
router.get('/duration-by-format-genre', authenticate, analyticsController.getDurationByFormatGenre);

// Dubbing penetration
router.get('/dubbing-penetration', authenticate, analyticsController.getDubbingPenetration);

// Top dubbed languages
router.get('/top-dubbed-languages', authenticate, analyticsController.getTopDubbedLanguages);

// Content freshness analytics
router.get('/content-freshness', authenticate, analyticsController.getContentFreshness);

// Data quality score analytics
router.get('/data-quality-score', authenticate, analyticsController.getDataQualityScore);

// New comprehensive analytics endpoints with rich data slicing
// Multi-dimensional analytics - analyze across multiple dimensions simultaneously
router.get('/multi-dimensional', authenticate, analyticsController.getMultiDimensionalAnalytics);

// Advanced slicing - flexible grouping with pagination and multiple metrics
router.get('/advanced-slicing', authenticate, analyticsController.getAdvancedSlicing);

// Comparative analytics - compare segments across different dimensions
router.get('/comparative', authenticate, analyticsController.getComparativeAnalytics);

module.exports = router;
