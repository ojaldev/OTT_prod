/**
 * Direct file upload middleware
 * A custom implementation to handle file uploads without size restrictions
 */
const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Direct file upload middleware that bypasses Express body parser
 * and handles file uploads directly using Busboy
 */
const directUpload = (fieldName) => {
  return (req, res, next) => {
    console.log('[DIRECT UPLOAD] Starting direct file upload process');
    
    // Skip if not a multipart request
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
      console.log('[DIRECT UPLOAD] Not a multipart request, skipping');
      return next();
    }

    // Create busboy instance with very generous limits
    const busboy = Busboy({ 
      headers: req.headers,
      limits: {
        fileSize: 1024 * 1024 * 1024, // 1GB limit (extremely generous)
        files: 1 // Only one file at a time
      }
    });

    // File object to store in req.file
    const fileObject = {};
    let fileStream = null;
    let filePath = null;

    // Handle file
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      console.log(`[DIRECT UPLOAD] File upload started: ${filename.filename}, mimetype: ${mimetype}`);
      
      // Skip if not the expected field name
      if (fieldname !== fieldName) {
        console.log(`[DIRECT UPLOAD] Skipping field ${fieldname}, expected ${fieldName}`);
        file.resume();
        return;
      }

      // Generate unique filename
      const uniqueFilename = `${fieldname}-${Date.now()}-${uuidv4()}${path.extname(filename.filename)}`;
      filePath = path.join(uploadDir, uniqueFilename);
      
      // Create file stream
      fileStream = fs.createWriteStream(filePath);
      
      // Set file object properties
      fileObject.originalname = filename.filename;
      fileObject.filename = uniqueFilename;
      fileObject.mimetype = mimetype;
      fileObject.encoding = encoding;
      fileObject.path = filePath;
      fileObject.destination = uploadDir;
      fileObject.size = 0;

      // Pipe file to disk and track size
      file.on('data', (data) => {
        fileObject.size += data.length;
      });

      file.pipe(fileStream);

      // Handle file stream errors
      fileStream.on('error', (err) => {
        console.error(`[DIRECT UPLOAD] File stream error: ${err.message}`);
        next(err);
      });
    });

    // Handle fields
    busboy.on('field', (fieldname, val) => {
      console.log(`[DIRECT UPLOAD] Field: ${fieldname}=${val}`);
      if (!req.body) req.body = {};
      req.body[fieldname] = val;
    });

    // Handle finish event
    busboy.on('finish', () => {
      console.log('[DIRECT UPLOAD] Busboy finished processing');
      
      if (fileObject.path) {
        console.log(`[DIRECT UPLOAD] File saved: ${fileObject.path}, size: ${fileObject.size} bytes`);
        req.file = fileObject;
        next();
      } else {
        console.log('[DIRECT UPLOAD] No file was uploaded');
        const error = new Error('No file was uploaded');
        error.status = 400;
        next(error);
      }
    });

    // Handle busboy errors
    busboy.on('error', (err) => {
      console.error(`[DIRECT UPLOAD] Busboy error: ${err.message}`);
      next(err);
    });

    // Pipe request to busboy
    req.pipe(busboy);
  };
};

module.exports = directUpload;
