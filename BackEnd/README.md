# OTT Dashboard Backend

A comprehensive backend API for managing OTT (Over-The-Top) content data with analytics capabilities.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Content Management** - CRUD operations for OTT content with advanced filtering
- **CSV Import/Export** - Bulk data operations with validation
- **Analytics Dashboard** - Comprehensive analytics with custom queries
- **Rate Limiting** - Protection against abuse with configurable limits
- **Data Validation** - Robust input validation and sanitization
- **Logging** - Structured logging with Winston
- **Health Monitoring** - Health check endpoints for monitoring

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **File Processing**: Multer + csv-parser
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   └── app.js           # Express app setup
├── uploads/             # File upload directory
├── logs/               # Log files
├── .env                # Environment variables
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
└── server.js           # Server entry point
```

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ott-dashboard-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update environment variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Create required directories**
   ```bash
   mkdir uploads logs
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/verify-token` - Verify JWT token
- `POST /auth/refresh-token` - Refresh JWT token
- `POST /auth/logout` - User logout
- `POST /auth/change-password` - Change password

### Content Management Endpoints
- `GET /content` - Get content with filters and pagination
- `GET /content/:id` - Get single content by ID
- `POST /content` - Create new content (Admin only)
- `PUT /content/:id` - Update content (Admin only)
- `DELETE /content/:id` - Delete content (Admin only)
- `POST /content/import-csv` - Import CSV file (Admin only)
- `GET /content/export/csv` - Export content as CSV
- `POST /content/check-duplicate` - Check for duplicate content

### Analytics Endpoints
- `GET /analytics/platform-distribution` - Platform distribution stats
- `GET /analytics/genre-trends` - Genre trends over time
- `GET /analytics/language-stats` - Language statistics
- `GET /analytics/yearly-releases` - Yearly release data
- `GET /analytics/dubbing-analysis` - Dubbing language analysis
- `GET /analytics/source-breakdown` - Content source breakdown
- `GET /analytics/duration-analysis` - Duration statistics
- `GET /analytics/age-rating-distribution` - Age rating distribution
- `GET /analytics/dashboard-summary` - Dashboard summary data
- `POST /analytics/custom` - Custom analytics queries

### User Management Endpoints
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update current user profile
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID (Admin only)
- `PUT /users/:id/role` - Update user role (Admin only)
- `PUT /users/:id/toggle-status` - Toggle user status (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

### Health Check
- `GET /health` - Application health status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **User**: Can view content and analytics
- **Admin**: Full access including content management and user administration

## 📊 Data Models

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: String (user|admin),
  isActive: Boolean,
  lastLogin: Date,
  timestamps: true
}
```

### Content Model
```javascript
{
  platform: String,
  title: String,
  selfDeclaredGenre: String,
  assignedGenre: String,
  primaryLanguage: String,
  selfDeclaredFormat: String,
  assignedFormat: String,
  year: Number,
  releaseDate: Date,
  seasons: Number,
  episodes: Number,
  durationHours: Number,
  source: String,
  dubbing: Object (language flags),
  totalDubbings: Number,
  ageRating: String,
  createdBy: ObjectId,
  isActive: Boolean,
  timestamps: true
}
```

## 📤 CSV Import Format

The CSV import feature expects the following columns:

| Column | Required | Description |
|--------|----------|-------------|
| Platform | Yes | Streaming platform name |
| Title | Yes | Content title |
| Year | Yes | Release year |
| Primary Language | Yes | Primary language |
| Self Declared Genre | No | Original genre classification |
| Assigned Genre | No | Standardized genre |
| Self Declared Format | No | Original format classification |
| Assigned Format | No | Standardized format |
| Release Date | No | Release date (YYYY-MM-DD) |
| Seasons | No | Number of seasons |
| Episodes | No | Number of episodes |
| Duration (hours) | No | Duration in hours |
| Source | No | Content source |
| [Language] dub | No | Dubbing availability (1/0) |
| Age Ratings | No | Age rating |

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request rate limiting
- **Input Sanitization** - NoSQL injection protection
- **Password Hashing** - bcrypt password hashing
- **JWT Authentication** - Secure token-based auth

## 📝 Logging

The application uses Winston for structured logging:
- **Console logs** - Development environment
- **File logs** - Production environment
- **Error logs** - Separate error log file
- **Request logs** - HTTP request logging

## 🚨 Error Handling

Comprehensive error handling with:
- **Global error handler** - Catches all unhandled errors
- **Validation errors** - Input validation error responses
- **Database errors** - MongoDB error handling
- **Authentication errors** - JWT and auth error handling

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📈 Monitoring

Health check endpoint provides:
- Application status
- Database connection status
- Memory usage
- Uptime information
- Environment details

Access at: `GET /api/health`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for OTT content management**
