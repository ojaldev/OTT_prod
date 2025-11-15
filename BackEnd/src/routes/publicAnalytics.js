const express = require('express');
const publicAnalyticsController = require('../controllers/publicAnalyticsController');

const router = express.Router();

// Monthly release trend - publicly accessible
router.get('/monthly-release-trend', publicAnalyticsController.getMonthlyReleaseTrend);

// Platform distribution - publicly accessible
router.get('/platform-distribution', publicAnalyticsController.getPlatformDistribution);

// Language-platform matrix - publicly accessible
router.get('/language-platform-matrix', publicAnalyticsController.getLanguagePlatformMatrix);

// Genre trends - publicly accessible
router.get('/genre-trends', publicAnalyticsController.getGenreTrends);

module.exports = router;
