const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

// Import Swagger documentation
const swaggerDocs = require('./config/swagger');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const analyticsRoutes = require('./routes/analytics');
const publicAnalyticsRoutes = require('./routes/publicAnalytics');
const userRoutes = require('./routes/users');
const healthRoutes = require('./routes/health');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration with preflight support
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:3000',
  'https://nitrogen-lifestyle-followed-nuclear.trycloudflare.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle OPTIONS requests
app.options('*', cors());

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log('-------------------------');
  console.log(`[DEBUG] ${new Date().toISOString()}`);
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  //console.log('[DEBUG] Headers:', JSON.stringify(req.headers, null, 2));
  //console.log('[DEBUG] Query:', JSON.stringify(req.query, null, 2));
  console.log('[DEBUG] Body:', JSON.stringify(req.body, null, 2));
  console.log('-------------------------');
  next();
});

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware, conditionally applied
const jsonParser = express.json({ limit: '100mb' });
const urlencodedParser = express.urlencoded({ extended: true, limit: '100mb' });

app.use((req, res, next) => {
  if (req.path.startsWith('/api/content/import-csv')) {
    console.log('[DEBUG] File upload route detected, skipping body parsers.');
    return next();
  }
  jsonParser(req, res, (err) => {
    if (err) return next(err);
    urlencodedParser(req, res, next);
  });
});

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public/analytics', publicAnalyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api', healthRoutes);

// Initialize Swagger
swaggerDocs(app);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to OTT Dashboard API',
    version: '1.0.0',
    status: 'Active',
    documentation: '/api/docs',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
