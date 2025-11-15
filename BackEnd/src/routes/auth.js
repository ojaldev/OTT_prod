const express = require('express');
const authController = require('../controllers/authController');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Debug endpoint to test request handling
router.all('/debug', (req, res) => {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    query: req.query,
    body: req.body,
    cookies: req.cookies,
    ip: req.ip,
    path: req.path,
    protocol: req.protocol
  };
  
  console.log('[AUTH DEBUG]', JSON.stringify(debugInfo, null, 2));
  
  res.status(200).json({
    success: true,
    message: 'Debug information logged',
    debugInfo
  });
});

// Registration
router.post('/register', [
  authLimiter,
  validateUserRegistration
], authController.register);

// Handle GET requests to registration endpoint
router.get('/register', (req, res) => {
  res.status(405).json({
    success: false,
    message: 'Method not allowed. Please use POST for registration.'
  });
});

// Login
router.post('/login', [
  authLimiter,
  validateUserLogin
], authController.login);

// Token verification
router.get('/verify-token', authController.verifyToken);

// Logout
router.post('/logout', authController.logout);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

// Change password (requires authentication)
router.post('/change-password', [
  authenticate
], authController.changePassword);

module.exports = router;
