/**
 * @swagger
 * tags:
 *   name: Utility
 *   description: Utility endpoints for system monitoring and health checks
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Utility]
 *     description: Returns the health status of the API and its dependencies
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: '2023-06-15T10:00:00.000Z'
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 environment:
 *                   type: string
 *                   example: development
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 database:
 *                   type: string
 *                   example: Connected
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: number
 *                       example: 45.12
 *                     total:
 *                       type: number
 *                       example: 128.34
 *       503:
 *         description: System is not healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ERROR
 *                 message:
 *                   type: string
 *                   example: Database connection failed
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: '2023-06-15T10:00:00.000Z'
 */
