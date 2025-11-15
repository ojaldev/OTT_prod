const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage - use memory storage instead of disk storage
const storage = multer.memoryStorage();

// File filter for CSV files - extremely permissive
const fileFilter = (req, file, cb) => {
  console.log(`[UPLOAD] Received file: ${file.originalname}, mimetype: ${file.mimetype}, size: ${req.headers['content-length']} bytes`);
  
  // Accept any file with .csv extension or CSV-like mimetype
  const isCSV = path.extname(file.originalname).toLowerCase() === '.csv' || 
                file.mimetype.includes('csv') || 
                file.mimetype.includes('excel') || 
                file.mimetype === 'application/octet-stream' || 
                file.mimetype === 'text/plain';
  
  if (isCSV) {
    console.log(`[UPLOAD] File accepted: ${file.originalname}`);
    cb(null, true);
  } else {
    console.log(`[UPLOAD] File rejected: ${file.originalname} - not a CSV`);
    cb(null, false); // Accept anyway, we'll handle it in the controller
  }
};

// Create a custom error handler for multer
const multerErrorHandler = (err, req, res, next) => {
  if (err) {
    console.error(`[UPLOAD ERROR] ${err.message}`);
    console.error(err.stack);
    
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }
  next();
};

// Configure multer with no limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: Infinity, // No file size limit
    files: 1           // Only 1 file at a time
  },
  fileFilter: fileFilter
});

// Log configuration
console.log(`[CONFIG] File upload size limit: UNLIMITED`);

// Export both the upload middleware and the error handler
module.exports = upload;
module.exports.multerErrorHandler = multerErrorHandler;
