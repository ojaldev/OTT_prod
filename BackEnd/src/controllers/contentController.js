const Content = require('../models/Content');
const csvService = require('../services/csvService');
const { successResponse, errorResponse } = require('../utils/responses');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class ContentController {
  async getContent(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        platform,
        genre,
        language,
        year,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = { isActive: true };
      
      // Apply filters
      if (platform) filter.platform = platform;
      if (genre) filter.assignedGenre = genre;
      if (language) filter.primaryLanguage = language;
      if (year) filter.year = year;
      if (search) {
        filter.$text = { $search: search };
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
        populate: { path: 'createdBy', select: 'username' }
      };

      const result = await Content.paginate(filter, options);
      
      return successResponse(res, 'Content retrieved successfully', result);
    } catch (error) {
      logger.error(`Get content error: ${error.message}`);
      return errorResponse(res, 'Error retrieving content', error);
    }
  }

  async getContentById(req, res) {
    try {
      const { id } = req.params;

      const content = await Content.findById(id)
        .populate('createdBy', 'username')
        .where('isActive', true);

      if (!content) {
        return errorResponse(res, 'Content not found', null, 404);
      }

      return successResponse(res, 'Content retrieved successfully', content);
    } catch (error) {
      logger.error(`Get content by ID error: ${error.message}`);
      return errorResponse(res, 'Error retrieving content', error);
    }
  }

  async createContent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', errors.array(), 400);
      }

      // Check for duplicates
      const existingContent = await Content.findOne({
        platform: req.body.platform,
        title: req.body.title,
        year: req.body.year,
        isActive: true
      });

      if (existingContent) {
        return errorResponse(res, 'Content already exists with same platform, title and year', null, 409);
      }

      const contentData = {
        ...req.body,
        createdBy: req.user._id
      };

      const content = new Content(contentData);
      await content.save();

      await content.populate('createdBy', 'username');

      logger.info(`Content created: ${content.title} by ${req.user.username}`);

      return successResponse(res, 'Content created successfully', content, 201);
    } catch (error) {
      logger.error(`Create content error: ${error.message}`);
      return errorResponse(res, 'Error creating content', error);
    }
  }

  async updateContent(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', errors.array(), 400);
      }

      // Check if content exists
      const existingContent = await Content.findById(id).where('isActive', true);
      if (!existingContent) {
        return errorResponse(res, 'Content not found', null, 404);
      }

      // Check for duplicates (excluding current content)
      if (req.body.platform || req.body.title || req.body.year) {
        const duplicateCheck = await Content.findOne({
          _id: { $ne: id },
          platform: req.body.platform || existingContent.platform,
          title: req.body.title || existingContent.title,
          year: req.body.year || existingContent.year,
          isActive: true
        });

        if (duplicateCheck) {
          return errorResponse(res, 'Content already exists with same platform, title and year', null, 409);
        }
      }

      const updatedContent = await Content.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('createdBy', 'username');

      logger.info(`Content updated: ${updatedContent.title} by ${req.user.username}`);

      return successResponse(res, 'Content updated successfully', updatedContent);
    } catch (error) {
      logger.error(`Update content error: ${error.message}`);
      return errorResponse(res, 'Error updating content', error);
    }
  }

  async deleteContent(req, res) {
    try {
      const { id } = req.params;

      const content = await Content.findById(id).where('isActive', true);
      if (!content) {
        return errorResponse(res, 'Content not found', null, 404);
      }

      // Soft delete
      content.isActive = false;
      await content.save();

      logger.info(`Content deleted: ${content.title} by ${req.user.username}`);

      return successResponse(res, 'Content deleted successfully');
    } catch (error) {
      logger.error(`Delete content error: ${error.message}`);
      return errorResponse(res, 'Error deleting content', error);
    }
  }

  async importCSV(req, res) {
    let tempFilePath;
    try {
      console.log('[DEBUG] Import CSV request received');
      if (!req.file) {
        return errorResponse(res, 'No CSV file uploaded', null, 400);
      }

      console.log(`[DEBUG] File details: ${req.file.originalname}, ${req.file.size || 'unknown'} bytes, ${req.file.mimetype}`);
      
      let filePath;
      
      if (req.file.buffer) {
        console.log('[DEBUG] File is in memory, writing to temp file');
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        
        tempFilePath = path.join(os.tmpdir(), `csv-import-${Date.now()}.csv`);
        fs.writeFileSync(tempFilePath, req.file.buffer);
        filePath = tempFilePath;
        
        console.log(`[DEBUG] Wrote ${req.file.buffer.length} bytes to temp file: ${tempFilePath}`);
      } else {
        filePath = req.file.path;
      }
      
      const result = await csvService.processCSVFile(filePath, req.user._id);
      
      logger.info(`CSV imported by ${req.user.username}: ${result.processed} processed, ${result.duplicates} duplicates, ${result.errors} errors`);
      return successResponse(res, 'CSV imported successfully', result);

    } catch (error) {
      logger.error(`CSV import error: ${error.message}`);
      return errorResponse(res, 'Error importing CSV', error);
    } finally {
      // Clean up temp file if it was created
      if (tempFilePath) {
        try {
          const fs = require('fs');
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log(`[DEBUG] Deleted temp file: ${tempFilePath}`);
          }
        } catch (cleanupError) {
          logger.error(`Failed to clean up temp file ${tempFilePath}: ${cleanupError.message}`);
        }
      }
    }
  }

  async exportCSV(req, res) {
    try {
      const { platform, genre, language, year } = req.query;
      
      const filter = { isActive: true };
      if (platform) filter.platform = platform;
      if (genre) filter.assignedGenre = genre;
      if (language) filter.primaryLanguage = language;
      if (year) filter.year = year;

      const content = await Content.find(filter)
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 });

      // Convert to CSV format
      const csvData = content.map(item => ({
        Platform: item.platform,
        Title: item.title,
        'Self Declared Genre': item.selfDeclaredGenre,
        'Assigned Genre': item.assignedGenre,
        'Primary Language': item.primaryLanguage,
        'Self Declared Format': item.selfDeclaredFormat,
        'Assigned Format': item.assignedFormat,
        Year: item.year,
        'Release Date': item.releaseDate ? item.releaseDate.toISOString().split('T')[0] : '',
        Seasons: item.seasons,
        Episodes: item.episodes,
        'Duration (hours)': item.durationHours,
        Source: item.source,
        'Tamil dub': item.dubbing.tamil ? '1' : '0',
        'Telugu dub': item.dubbing.telugu ? '1' : '0',
        'Kannada dub': item.dubbing.kannada ? '1' : '0',
        'Malayalam dub': item.dubbing.malayalam ? '1' : '0',
        'Hindi dub': item.dubbing.hindi ? '1' : '0',
        'Punjabi dub': item.dubbing.punjabi ? '1' : '0',
        'Bengali dub': item.dubbing.bengali ? '1' : '0',
        'Marathi dub': item.dubbing.marathi ? '1' : '0',
        'Bhojpuri dub': item.dubbing.bhojpuri ? '1' : '0',
        'Gujarati dub': item.dubbing.gujarati ? '1' : '0',
        'English Dub': item.dubbing.english ? '1' : '0',
        'Haryanvi Dub': item.dubbing.haryanvi ? '1' : '0',
        'Rajasthani Dub': item.dubbing.rajasthani ? '1' : '0',
        'Deccani Dub': item.dubbing.deccani ? '1' : '0',
        'Arabic Dub': item.dubbing.arabic ? '1' : '0',
        'Age Ratings': item.ageRating,
        'Total Dubbings': item.totalDubbings,
        'Created By': item.createdBy.username,
        'Created At': item.createdAt.toISOString().split('T')[0]
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=ott-content-${Date.now()}.csv`);

      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');

      logger.info(`CSV exported by ${req.user.username}: ${content.length} records`);

      return res.send(csvString);
    } catch (error) {
      logger.error(`CSV export error: ${error.message}`);
      return errorResponse(res, 'Error exporting CSV', error);
    }
  }

  async checkDuplicate(req, res) {
    try {
      const { platform, title, year } = req.body;

      if (!platform || !title || !year) {
        return errorResponse(res, 'Platform, title, and year are required', null, 400);
      }

      const existingContent = await Content.findOne({
        platform,
        title,
        year,
        isActive: true
      });

      return successResponse(res, 'Duplicate check completed', {
        isDuplicate: !!existingContent,
        existingContent: existingContent || null
      });
    } catch (error) {
      logger.error(`Duplicate check error: ${error.message}`);
      return errorResponse(res, 'Error checking for duplicates', error);
    }
  }

  async getCSVImportErrors(req, res) {
    try {
      const { session = 'all', page = 1, limit = 100 } = req.query;
      const logPath = path.join(process.cwd(), 'csv-import-errors.log');

      if (!fs.existsSync(logPath)) {
        return successResponse(res, 'No CSV import error log found', {
          total: 0,
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 100,
          totalPages: 0,
          sessions: [],
          errors: []
        });
      }

      const fileContent = fs.readFileSync(logPath, 'utf8');
      const lines = fileContent.split(/\r?\n/);

      const sessions = [];
      const errors = [];
      let currentSession = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const sessionMatch = line.match(/^--- New Import Process Started at (.+) ---$/);
        if (sessionMatch) {
          currentSession = { startedAt: sessionMatch[1], file: null };
          sessions.push(currentSession);
          continue;
        }

        const fileMatch = line.match(/^File: (.+)$/);
        if (fileMatch && currentSession) {
          currentSession.file = fileMatch[1];
          continue;
        }

        const rowMatch = line.match(/^Row (\d+):\s*(.+)$/);
        if (rowMatch) {
          const row = parseInt(rowMatch[1]);
          const errorMsg = rowMatch[2];

          // Next line contains Data: {...}
          let data = null;
          const nextLine = lines[i + 1] || '';
          const dataMatch = nextLine.match(/^Data:\s*(\{.*\})/);
          if (dataMatch) {
            try {
              data = JSON.parse(dataMatch[1]);
              i++; // skip the data line
            } catch (e) {
              // ignore JSON parse errors for malformed lines
            }
          }

          errors.push({
            row,
            error: errorMsg,
            data,
            sessionStartedAt: currentSession ? currentSession.startedAt : null,
            file: currentSession ? currentSession.file : null,
          });
        }
      }

      // Filter by session
      let filtered = errors;
      if (session === 'latest' && sessions.length > 0) {
        const latestStartedAt = sessions[sessions.length - 1].startedAt;
        filtered = errors.filter(e => e.sessionStartedAt === latestStartedAt);
      } else if (session && session !== 'all') {
        filtered = errors.filter(e => e.sessionStartedAt === session);
      }

      // Pagination
      const p = Math.max(1, parseInt(page) || 1);
      const l = Math.max(1, Math.min(500, parseInt(limit) || 100));
      const total = filtered.length;
      const totalPages = Math.ceil(total / l);
      const start = (p - 1) * l;
      const paginated = filtered.slice(start, start + l);

      return successResponse(res, 'CSV import errors retrieved', {
        total,
        page: p,
        limit: l,
        totalPages,
        sessions,
        errors: paginated,
      });
    } catch (error) {
      logger.error(`Get CSV import errors error: ${error.message}`);
      return errorResponse(res, 'Error retrieving CSV import errors', error);
    }
  }
}

module.exports = new ContentController();
