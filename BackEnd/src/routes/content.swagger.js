/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Content management operations
 */

/**
 * @swagger
 * /content/import-csv/errors:
 *   get:
 *     summary: Get CSV import errors
 *     tags: [Content]
 *     description: Returns errored records from all CSV import sessions by default, or a specified session (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: session
 *         schema:
 *           type: string
 *           description: Session startedAt ISO string to filter, 'latest' for the most recent session, or 'all' for all sessions
 *           default: all
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: CSV import errors retrieved
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
 *                   example: CSV import errors retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 12
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 100
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           startedAt:
 *                             type: string
 *                             example: 2025-08-25T10:23:45.123Z
 *                           file:
 *                             type: string
 *                             example: /tmp/csv-import-1692871823.csv
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: integer
 *                             example: 3
 *                           error:
 *                             type: string
 *                             example: Platform, Title, and Year are required fields
 *                           data:
 *                             type: object
 *                           sessionStartedAt:
 *                             type: string
 *                             example: 2025-08-25T10:23:45.123Z
 *                           file:
 *                             type: string
 *                             example: /tmp/csv-import-1692871823.csv
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
/**
 * @swagger
 * /content:
 *   get:
 *     summary: Get all content
 *     tags: [Content]
 *     description: Retrieves a paginated list of content with filtering options
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title or description
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [movie, series, documentary]
 *         description: Filter by content type
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: releaseYear
 *         schema:
 *           type: integer
 *         description: Filter by release year
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Content retrieved successfully
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
 *                   example: Content retrieved successfully
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/PaginatedResponse'
 *                     - type: object
 *                       properties:
 *                         docs:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Content'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     summary: Create new content
 *     tags: [Content]
 *     description: Creates a new content item (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 description: Content title
 *                 example: Sample Movie
 *               description:
 *                 type: string
 *                 description: Content description
 *                 example: A sample movie description
 *               type:
 *                 type: string
 *                 enum: [movie, series, documentary]
 *                 description: Content type
 *                 example: movie
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Content genres
 *                 example: [action, thriller]
 *               releaseYear:
 *                 type: integer
 *                 description: Year of release
 *                 example: 2023
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *                 example: 120
 *               rating:
 *                 type: number
 *                 description: Content rating (0-5)
 *                 example: 4.5
 *               isPublished:
 *                 type: boolean
 *                 description: Whether the content is published
 *                 example: true
 *     responses:
 *       201:
 *         description: Content created successfully
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
 *                   example: Content created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/Content'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /content/{id}:
 *   get:
 *     summary: Get content by ID
 *     tags: [Content]
 *     description: Retrieves a specific content item by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content retrieved successfully
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
 *                   example: Content retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/Content'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   put:
 *     summary: Update content
 *     tags: [Content]
 *     description: Updates a specific content item (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Content title
 *                 example: Updated Movie Title
 *               description:
 *                 type: string
 *                 description: Content description
 *                 example: An updated movie description
 *               type:
 *                 type: string
 *                 enum: [movie, series, documentary]
 *                 description: Content type
 *                 example: movie
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Content genres
 *                 example: [action, thriller, drama]
 *               releaseYear:
 *                 type: integer
 *                 description: Year of release
 *                 example: 2023
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *                 example: 130
 *               rating:
 *                 type: number
 *                 description: Content rating (0-5)
 *                 example: 4.7
 *               isPublished:
 *                 type: boolean
 *                 description: Whether the content is published
 *                 example: true
 *     responses:
 *       200:
 *         description: Content updated successfully
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
 *                   example: Content updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/Content'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Delete content
 *     tags: [Content]
 *     description: Deletes a specific content item (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content deleted successfully
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
 *                   example: Content deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /content/import-csv:
 *   post:
 *     summary: Import content from CSV
 *     tags: [Content]
 *     description: Imports multiple content items from a CSV file (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - csvFile
 *             properties:
 *               csvFile:
 *                 type: string
 *                 format: binary
 *                 description: CSV file with content data
 *     responses:
 *       200:
 *         description: Content imported successfully
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
 *                   example: Content imported successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     imported:
 *                       type: integer
 *                       example: 10
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: integer
 *                             example: 3
 *                           error:
 *                             type: string
 *                             example: Invalid content type
 *       400:
 *         description: Invalid CSV file or format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid CSV file or format
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Too many upload requests, please try again later
 *                 statusCode:
 *                   type: integer
 *                   example: 429
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /content/export/csv:
 *   get:
 *     summary: Export content as CSV
 *     tags: [Content]
 *     description: Exports all content as a CSV file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [movie, series, documentary]
 *         description: Filter by content type
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *     responses:
 *       200:
 *         description: CSV file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /content/check-duplicate:
 *   post:
 *     summary: Check for duplicate content
 *     tags: [Content]
 *     description: Checks if content with the same title already exists (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Content title to check
 *                 example: Sample Movie
 *               excludeId:
 *                 type: string
 *                 description: ID to exclude from the check (for updates)
 *                 example: 60d21b4667d0d8992e610c86
 *     responses:
 *       200:
 *         description: Duplicate check result
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
 *                   example: Duplicate check completed
 *                 data:
 *                   type: object
 *                   properties:
 *                     exists:
 *                       type: boolean
 *                       example: false
 *                     content:
 *                       type: object
 *                       nullable: true
 *                       description: The duplicate content if exists
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /content/test-upload:
 *   post:
 *     summary: Test file upload
 *     tags: [Content]
 *     description: Test endpoint for file uploads (for development purposes)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
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
 *                   example: File uploaded successfully
 *                 file:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: test.jpg
 *                     size:
 *                       type: integer
 *                       example: 12345
 *                     mimetype:
 *                       type: string
 *                       example: image/jpeg
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No file uploaded
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
