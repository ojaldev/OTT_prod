const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OTT Platform API',
      version: '1.0.0',
      description: 'API documentation for OTT Platform backend services',
      contact: {
        name: 'API Support',
        email: 'support@ottplatform.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'Development server'
      },
      {
        url: 'https://api.ottplatform.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'Unauthorized access',
                  },
                  statusCode: {
                    type: 'integer',
                    example: 401,
                  },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions to access resource',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'Access forbidden',
                  },
                  statusCode: {
                    type: 'integer',
                    example: 403,
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'Resource not found',
                  },
                  statusCode: {
                    type: 'integer',
                    example: 404,
                  },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'Validation error',
                  },
                  error: {
                    type: 'object',
                    properties: {
                      details: {
                        type: 'array',
                        items: {
                          type: 'string',
                        },
                        example: ['Email is required', 'Password must be at least 8 characters'],
                      },
                    },
                  },
                  statusCode: {
                    type: 'integer',
                    example: 400,
                  },
                },
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'Internal server error',
                  },
                  statusCode: {
                    type: 'integer',
                    example: 500,
                  },
                },
              },
            },
          },
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85',
            },
            username: {
              type: 'string',
              example: 'johndoe',
            },
            email: {
              type: 'string',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              example: 'user',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              example: '2023-06-15T10:00:00.000Z',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-15T08:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-06-15T10:00:00.000Z',
            },
          },
        },
        UserActivity: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60d21b4667d0d8992e610d85',
            },
            user: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85',
            },
            action: {
              type: 'string',
              enum: ['login', 'logout', 'create', 'update', 'delete', 'import', 'export', 'role_change', 'status_change', 'register'],
              example: 'login',
            },
            details: {
              type: 'object',
              example: {
                ip: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
              },
            },
            ipAddress: {
              type: 'string',
              example: '192.168.1.1',
            },
            userAgent: {
              type: 'string',
              example: 'Mozilla/5.0...',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-06-15T10:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-06-15T10:00:00.000Z',
            },
          },
        },
        Content: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60d21b4667d0d8992e610c86',
            },
            title: {
              type: 'string',
              example: 'Sample Movie',
            },
            description: {
              type: 'string',
              example: 'A sample movie description',
            },
            type: {
              type: 'string',
              enum: ['movie', 'series', 'documentary'],
              example: 'movie',
            },
            genre: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['action', 'thriller'],
            },
            releaseYear: {
              type: 'integer',
              example: 2023,
            },
            duration: {
              type: 'integer',
              example: 120,
            },
            rating: {
              type: 'number',
              example: 4.5,
            },
            isPublished: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-15T08:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-06-15T10:00:00.000Z',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            docs: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
            totalDocs: {
              type: 'integer',
              example: 100,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            totalPages: {
              type: 'integer',
              example: 10,
            },
            page: {
              type: 'integer',
              example: 1,
            },
            pagingCounter: {
              type: 'integer',
              example: 1,
            },
            hasPrevPage: {
              type: 'boolean',
              example: false,
            },
            hasNextPage: {
              type: 'boolean',
              example: true,
            },
            prevPage: {
              type: 'integer',
              nullable: true,
              example: null,
            },
            nextPage: {
              type: 'integer',
              example: 2,
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API routes files
};

const specs = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  // Swagger page
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'OTT Platform API Documentation'
  }));

  // Docs in JSON format
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log(`Swagger docs available at /api/docs`);
};

module.exports = swaggerDocs;
