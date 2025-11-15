/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and reporting endpoints
 */

/**
 * @swagger
 * /analytics/monthly-release-trend:
 *   get:
 *     summary: Monthly release trend
 *     tags: [Analytics]
 *     description: Returns number of releases per month based on releaseDate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Inclusive start date (YYYY-MM-DD). Defaults to 11 months before endDate.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Inclusive end date (YYYY-MM-DD). Defaults to today.
 *     responses:
 *       200:
 *         description: Monthly release trend retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   period:
 *                     type: string
 *                     example: "2025-08"
 *                   count:
 *                     type: integer
 *                     example: 12
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/platform-growth:
 *   get:
 *     summary: Platform growth over time
 *     tags: [Analytics]
 *     description: Number of releases per year per platform
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startYear
 *         schema:
 *           type: integer
 *         description: Inclusive start year (default 2010)
 *       - in: query
 *         name: endYear
 *         schema:
 *           type: integer
 *         description: Inclusive end year (default current year)
 *     responses:
 *       200:
 *         description: Platform growth data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   year:
 *                     type: integer
 *                     example: 2024
 *                   platform:
 *                     type: string
 *                     example: "Web"
 *                   count:
 *                     type: integer
 *                     example: 18
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/genre-platform-heatmap:
 *   get:
 *     summary: Genre-platform heatmap
 *     tags: [Analytics]
 *     description: Counts by assignedGenre and platform
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Heatmap data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   genre:
 *                     type: string
 *                     example: "Action"
 *                   platform:
 *                     type: string
 *                     example: "Mobile"
 *                   count:
 *                     type: integer
 *                     example: 27
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/language-platform-matrix:
 *   get:
 *     summary: Language-platform matrix
 *     tags: [Analytics]
 *     description: Distribution of primaryLanguage across platforms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Matrix data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   language:
 *                     type: string
 *                     example: "Hindi"
 *                   platform:
 *                     type: string
 *                     example: "TV"
 *                   count:
 *                     type: integer
 *                     example: 14
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/duration-by-format-genre:
 *   get:
 *     summary: Duration by format and genre
 *     tags: [Analytics]
 *     description: Average, min, max durationHours grouped by assignedFormat and assignedGenre
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Duration stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   format:
 *                     type: string
 *                     example: "Series"
 *                   genre:
 *                     type: string
 *                     example: "Drama"
 *                   avgDuration:
 *                     type: number
 *                     example: 5.2
 *                   minDuration:
 *                     type: number
 *                     example: 0.5
 *                   maxDuration:
 *                     type: number
 *                     example: 10.0
 *                   count:
 *                     type: integer
 *                     example: 22
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/dubbing-penetration:
 *   get:
 *     summary: Dubbing penetration
 *     tags: [Analytics]
 *     description: Overall and per-platform dubbing penetration statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dubbing penetration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overall:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     dubbed:
 *                       type: integer
 *                       example: 90
 *                     pctDubbed:
 *                       type: number
 *                       example: 60.0
 *                     avgDubbings:
 *                       type: number
 *                       example: 1.8
 *                 byPlatform:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       platform:
 *                         type: string
 *                         example: "Web"
 *                       total:
 *                         type: integer
 *                         example: 50
 *                       dubbed:
 *                         type: integer
 *                         example: 35
 *                       pctDubbed:
 *                         type: number
 *                         example: 70.0
 *                       avgDubbings:
 *                         type: number
 *                         example: 2.1
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/top-dubbed-languages:
 *   get:
 *     summary: Top dubbed languages
 *     tags: [Analytics]
 *     description: Most frequent dubbing languages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top languages to return
 *     responses:
 *       200:
 *         description: Top dubbed languages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   language:
 *                     type: string
 *                     example: "tamil"
 *                   count:
 *                     type: integer
 *                     example: 40
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/platform-distribution:
 *   get:
 *     summary: Get platform distribution
 *     tags: [Analytics]
 *     description: Retrieves content distribution across different platforms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering data
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering data
 *     responses:
 *       200:
 *         description: Platform distribution data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Platform distribution retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     platforms:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: Web
 *                           count:
 *                             type: integer
 *                             example: 45
 *                           percentage:
 *                             type: number
 *                             example: 30.0
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/genre-trends:
 *   get:
 *     summary: Get genre trends
 *     tags: [Analytics]
 *     description: Retrieves trends in content genres over time
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, quarter, year]
 *           default: month
 *         description: Time period for trend analysis
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top genres to include
 *     responses:
 *       200:
 *         description: Genre trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Genre trends retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period:
 *                             type: string
 *                             example: "2023-01"
 *                           genres:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: "Action"
 *                                 count:
 *                                   type: integer
 *                                   example: 12
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/language-stats:
 *   get:
 *     summary: Get language statistics
 *     tags: [Analytics]
 *     description: Retrieves statistics about content languages
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Language statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Language statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     languages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           language:
 *                             type: string
 *                             example: "English"
 *                           count:
 *                             type: integer
 *                             example: 75
 *                           percentage:
 *                             type: number
 *                             example: 50.0
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/yearly-releases:
 *   get:
 *     summary: Get yearly releases
 *     tags: [Analytics]
 *     description: Retrieves content release statistics by year
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startYear
 *         schema:
 *           type: integer
 *         description: Start year for filtering data
 *       - in: query
 *         name: endYear
 *         schema:
 *           type: integer
 *         description: End year for filtering data
 *     responses:
 *       200:
 *         description: Yearly releases retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Yearly releases retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     years:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           year:
 *                             type: integer
 *                             example: 2023
 *                           count:
 *                             type: integer
 *                             example: 35
 *                           byType:
 *                             type: object
 *                             properties:
 *                               movie:
 *                                 type: integer
 *                                 example: 20
 *                               series:
 *                                 type: integer
 *                                 example: 10
 *                               documentary:
 *                                 type: integer
 *                                 example: 5
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/dubbing-analysis:
 *   get:
 *     summary: Get dubbing analysis
 *     tags: [Analytics]
 *     description: Retrieves analysis of content dubbing in different languages
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dubbing analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Dubbing analysis retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     dubbingStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           language:
 *                             type: string
 *                             example: "Spanish"
 *                           count:
 *                             type: integer
 *                             example: 45
 *                           percentage:
 *                             type: number
 *                             example: 30.0
 *                     averageDubbingsPerContent:
 *                       type: number
 *                       example: 3.5
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/source-breakdown:
 *   get:
 *     summary: Get source breakdown
 *     tags: [Analytics]
 *     description: Retrieves breakdown of content by source
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Source breakdown retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Source breakdown retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     sources:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           source:
 *                             type: string
 *                             example: "Original"
 *                           count:
 *                             type: integer
 *                             example: 50
 *                           percentage:
 *                             type: number
 *                             example: 33.3
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/duration-analysis:
 *   get:
 *     summary: Get duration analysis
 *     tags: [Analytics]
 *     description: Retrieves analysis of content duration
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [movie, series, documentary]
 *         description: Filter by content type
 *     responses:
 *       200:
 *         description: Duration analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Duration analysis retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     averageDuration:
 *                       type: number
 *                       example: 105.5
 *                     distribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           range:
 *                             type: string
 *                             example: "90-120 min"
 *                           count:
 *                             type: integer
 *                             example: 35
 *                           percentage:
 *                             type: number
 *                             example: 23.3
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/age-rating-distribution:
 *   get:
 *     summary: Get age rating distribution
 *     tags: [Analytics]
 *     description: Retrieves distribution of content by age rating
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Age rating distribution retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Age rating distribution retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     ratings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           rating:
 *                             type: string
 *                             example: "PG-13"
 *                           count:
 *                             type: integer
 *                             example: 45
 *                           percentage:
 *                             type: number
 *                             example: 30.0
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/dashboard-summary:
 *   get:
 *     summary: Get dashboard summary
 *     tags: [Analytics]
 *     description: Retrieves summary statistics for the dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Dashboard summary retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalContent:
 *                       type: integer
 *                       example: 150
 *                     totalPlatforms:
 *                       type: integer
 *                       example: 7
 *                     contentThisYear:
 *                       type: integer
 *                       example: 42
 *                     totalGenres:
 *                       type: integer
 *                       example: 12
 *                     recentContent:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Sample Movie"
 *                           platform:
 *                             type: string
 *                             example: "Web"
 *                           year:
 *                             type: integer
 *                             example: 2024
 *                           releaseDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-08-01T10:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/custom:
 *   post:
 *     summary: Get custom analytics
 *     tags: [Analytics]
 *     description: Retrieves custom analytics based on specified filters
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dimensions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [type, genre, releaseYear, language, platform, ageRating]
 *                 example: ["type", "genre"]
 *               filters:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [movie, series, documentary]
 *                   releaseYearStart:
 *                     type: integer
 *                   releaseYearEnd:
 *                     type: integer
 *                   genres:
 *                     type: array
 *                     items:
 *                       type: string
 *                   languages:
 *                     type: array
 *                     items:
 *                       type: string
 *               metrics:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [count, averageDuration, averageRating]
 *                 example: ["count", "averageRating"]
 *     responses:
 *       200:
 *         description: Custom analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Custom analytics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                       example: [
 *                         {
 *                           "type": "movie",
 *                           "genre": "action",
 *                           "count": 25,
 *                           "averageRating": 4.2
 *                         },
 *                         {
 *                           "type": "movie",
 *                           "genre": "comedy",
 *                           "count": 18,
 *                           "averageRating": 3.9
 *                         }
 *                       ]
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/content-freshness:
 *   get:
 *     summary: Content freshness analytics
 *     tags: [Analytics]
 *     description: Overall and per-platform freshness metrics computed from releaseDate or year.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Content freshness retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overall:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     avgAgeDays:
 *                       type: number
 *                       example: 320.5
 *                     minAgeDays:
 *                       type: number
 *                       example: 0
 *                     maxAgeDays:
 *                       type: number
 *                       example: 3650
 *                     last7:
 *                       type: integer
 *                       example: 12
 *                     last30:
 *                       type: integer
 *                       example: 38
 *                     last90:
 *                       type: integer
 *                       example: 80
 *                     releasedThisYear:
 *                       type: integer
 *                       example: 42
 *                 byPlatform:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       platform:
 *                         type: string
 *                         example: "Web"
 *                       total:
 *                         type: integer
 *                         example: 50
 *                       avgAgeDays:
 *                         type: number
 *                         example: 210.3
 *                       last30:
 *                         type: integer
 *                         example: 15
 *                       last90:
 *                         type: integer
 *                         example: 30
 *                       releasedThisYear:
 *                         type: integer
 *                         example: 18
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/data-quality-score:
 *   get:
 *     summary: Content data quality score
 *     tags: [Analytics]
 *     description: Computes weighted data quality scores and aggregates overall stats, distribution buckets, platform averages, top missing-field issues, and low-quality samples.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data quality score retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overall:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     avgScore:
 *                       type: number
 *                       example: 76.4
 *                     minScore:
 *                       type: number
 *                       example: 35
 *                     maxScore:
 *                       type: number
 *                       example: 100
 *                 distribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       range:
 *                         type: string
 *                         enum: ["0-39", "40-59", "60-79", "80-100", "other"]
 *                         example: "60-79"
 *                       count:
 *                         type: integer
 *                         example: 55
 *                 byPlatform:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       platform:
 *                         type: string
 *                         example: "Mobile"
 *                       avgScore:
 *                         type: number
 *                         example: 72.1
 *                       total:
 *                         type: integer
 *                         example: 40
 *                 topIssues:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   example:
 *                     missingTitle: 8
 *                     missingReleaseDate: 15
 *                     missingAssignedGenre: 20
 *                 lowQualitySamples:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Untitled"
 *                       platform:
 *                         type: string
 *                         example: "TV"
 *                       score:
 *                         type: number
 *                         example: 48
 *                       missingFields:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["releaseDate", "assignedGenre"]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/multi-dimensional:
 *   get:
 *     summary: Multi-dimensional analytics with rich data slicing
 *     tags: [Analytics]
 *     description: Analyze content across multiple dimensions simultaneously with flexible filtering by platform, type, year, genre, language, ratings, and more
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filter by platform (comma-separated for multiple, e.g., "Netflix,Prime Video")
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by content type/format (comma-separated, e.g., "Movie,Series")
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: Filter by year (single year, range "2020-2023", or comma-separated)
 *       - in: query
 *         name: startYear
 *         schema:
 *           type: integer
 *         description: Start year for range filter
 *       - in: query
 *         name: endYear
 *         schema:
 *           type: integer
 *         description: End year for range filter
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre (comma-separated for multiple)
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by primary language (comma-separated for multiple)
 *       - in: query
 *         name: ageRating
 *         schema:
 *           type: string
 *         description: Filter by age rating (comma-separated for multiple)
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter by source (In-House, Commissioned, Co-Production)
 *       - in: query
 *         name: minDuration
 *         schema:
 *           type: number
 *         description: Minimum duration in hours
 *       - in: query
 *         name: maxDuration
 *         schema:
 *           type: number
 *         description: Maximum duration in hours
 *       - in: query
 *         name: hasDubbing
 *         schema:
 *           type: boolean
 *         description: Filter by dubbing availability (true/false)
 *       - in: query
 *         name: dubbingLanguage
 *         schema:
 *           type: string
 *         description: Filter by specific dubbing language availability
 *       - in: query
 *         name: dimensions
 *         schema:
 *           type: string
 *         description: Dimensions to analyze (comma-separated, e.g., "platform,genre,language,type")
 *     responses:
 *       200:
 *         description: Multi-dimensional analytics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/advanced-slicing:
 *   get:
 *     summary: Advanced data slicing with flexible grouping and pagination
 *     tags: [Analytics]
 *     description: Slice and dice content data with custom grouping, multiple metrics, and pagination. Supports all filter parameters.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           default: platform
 *         description: Primary dimension to group by
 *       - in: query
 *         name: secondaryGroupBy
 *         schema:
 *           type: string
 *         description: Secondary dimension for nested grouping
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filter by platform (comma-separated for multiple)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: count
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Advanced slicing data retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /analytics/comparative:
 *   get:
 *     summary: Comparative analytics across segments
 *     tags: [Analytics]
 *     description: Compare different segments with comprehensive metrics and insights
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: compareBy
 *         schema:
 *           type: string
 *           default: platform
 *         description: Dimension to compare
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           default: count
 *         description: Primary metric for comparison
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filter by platform
 *     responses:
 *       200:
 *         description: Comparative analytics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
