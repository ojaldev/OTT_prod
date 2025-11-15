const express = require('express');
const contentController = require('../controllers/contentController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { multerErrorHandler } = require('../middleware/upload');
const { validateContent } = require('../middleware/validation');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Get all content with filtering and pagination
router.get('/', authenticate, contentController.getContent);

// Get single content by ID
router.get('/:id', authenticate, contentController.getContentById);

// Create new content (Admin only)
router.post('/', [
  authenticate, 
  requireAdmin, 
  validateContent
], contentController.createContent);

// Update content (Admin only)
router.put('/:id', [
  authenticate, 
  requireAdmin, 
  validateContent
], contentController.updateContent);

// Delete content (Admin only)
router.delete('/:id', [
  authenticate, 
  requireAdmin
], contentController.deleteContent);

// Bulk CSV import (Admin only)
// Special route for CSV imports with unlimited file size
router.post('/import-csv', 
  authenticate, 
  requireAdmin, 
  uploadLimiter,
  (req, res, next) => {
    console.log('[DEBUG] Processing CSV file upload request');
    console.log('[DEBUG] Content-Length:', req.headers['content-length'], 'bytes');
    next();
  },
  upload.single('csvFile'),
  multerErrorHandler,
  contentController.importCSV
);

// Get CSV import errors (Admin only)
router.get('/import-csv/errors', [
  authenticate,
  requireAdmin
], contentController.getCSVImportErrors);

// Test upload endpoint - no authentication required for testing
router.post('/test-upload', 
  (req, res, next) => {
    console.log('[TEST] Received test upload request');
    console.log('[TEST] Content-Length:', req.headers['content-length'], 'bytes');
    console.log('[TEST] Content-Type:', req.headers['content-type']);
    next();
  },
  upload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    console.log('[TEST] File received:', req.file.originalname);
    console.log('[TEST] File size:', req.file.size, 'bytes');
    console.log('[TEST] File mimetype:', req.file.mimetype);
    
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        name: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  }
);

// Export data as CSV
router.get('/export/csv', [
  authenticate
], contentController.exportCSV);

// Duplicate check
router.post('/check-duplicate', [
  authenticate, 
  requireAdmin
], contentController.checkDuplicate);

module.exports = router;
