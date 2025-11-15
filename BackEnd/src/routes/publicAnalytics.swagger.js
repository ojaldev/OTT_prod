/**
 * @swagger
 * tags:
 *   name: PublicAnalytics
 *   description: Publicly accessible analytics endpoints that don't require authentication
 */

/**
 * @swagger
 * /public/analytics/monthly-release-trend:
 *   get:
 *     summary: Monthly release trend (Public)
 *     tags: [PublicAnalytics]
 *     description: Returns number of releases per month based on releaseDate. No authentication required.
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
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /public/analytics/platform-distribution:
 *   get:
 *     summary: Platform distribution (Public)
 *     tags: [PublicAnalytics]
 *     description: Retrieves content distribution across different platforms. No authentication required.
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
 *                   example: Platform distribution retrieved
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "Netflix"
 *                       count:
 *                         type: integer
 *                         example: 45
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /public/analytics/language-platform-matrix:
 *   get:
 *     summary: Language-platform matrix (Public)
 *     tags: [PublicAnalytics]
 *     description: Distribution of primaryLanguage across platforms. No authentication required.
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
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /public/analytics/genre-trends:
 *   get:
 *     summary: Genre trends (Public)
 *     tags: [PublicAnalytics]
 *     description: Retrieves trends in content genres over time. No authentication required.
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
 *                   example: Genre trends retrieved
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "Action"
 *                       data:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 2023
 *                             count:
 *                               type: integer
 *                               example: 12
 *                       total:
 *                         type: integer
 *                         example: 45
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

module.exports = {};
