const fs = require('fs');
const csv = require('csv-parser');
const Content = require('../models/Content');
const logger = require('../utils/logger');

class CSVService {
  async processCSVFile(filePath, userId) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      let processedCount = 0;
      let duplicateCount = 0;
      let errorCount = 0;
      const errorLogStream = fs.createWriteStream('csv-import-errors.log', { flags: 'a' });
      
      console.log(`[CSV] Processing file: ${filePath}, size: ${fs.statSync(filePath).size} bytes`);
      errorLogStream.write(`\n--- New Import Process Started at ${new Date().toISOString()} ---\n`);
      errorLogStream.write(`File: ${filePath}\n`);

      // Use high watermark for larger files
      fs.createReadStream(filePath, { highWaterMark: 64 * 1024 }) // 64KB chunks
        .pipe(csv({ strict: false })) // Less strict parsing
        .on('data', async (row) => {
          const rowNumber = processedCount + duplicateCount + errorCount + 1;
          try {
            const contentData = this.mapCSVRowToContent(row, userId);
            
            // Check for duplicates
            const existing = await Content.findOne({
              platform: contentData.platform,
              title: contentData.title,
              year: contentData.year,
              isActive: true
            });

            if (existing) {
              duplicateCount++;
              return;
            }

            const content = new Content(contentData);
            await content.save();
            processedCount++;
            
          } catch (error) {
            errorCount++;
            const errorDetail = {
              row: rowNumber,
              error: error.message,
              data: row
            };
            errors.push(errorDetail);
            
            // Log to console and file
            logger.warn(`[CSV Error] Row ${rowNumber}: ${error.message}`);
            errorLogStream.write(`Row ${rowNumber}: ${error.message}\nData: ${JSON.stringify(row)}\n`);
          }
        })
        .on('end', () => {
          errorLogStream.end(); // Close the stream
          resolve({
            processed: processedCount,
            duplicates: duplicateCount,
            errors: errorCount,
            errorDetails: errors
          });
        })
        .on('error', reject);
    });
  }

  mapCSVRowToContent(row, userId) {
    // Clean and validate data
    const platform = row.Platform?.trim();
    const title = row.Title?.trim();
    const year = parseInt(row.Year);

    if (!platform || !title || !year) {
      throw new Error('Platform, Title, and Year are required fields');
    }

    return {
      platform,
      title,
      selfDeclaredGenre: row['Self Declared Genre']?.trim() || '',
      assignedGenre: row['Assigned Genre']?.trim() || undefined,
      primaryLanguage: row['Primary Language']?.trim() || 'Other',
      selfDeclaredFormat: row['Self Declared Format']?.trim() || '',
      assignedFormat: row['Assigned Format']?.trim() || undefined,
      year,
      releaseDate: row['Release Date'] ? new Date(row['Release Date']) : null,
      seasons: parseInt(row.Seasons) || 1,
      episodes: parseInt(row.Episodes) || null,
      durationHours: parseFloat(row['Duration (hours)']) || null,
      source: row.Source?.trim() || 'TBD',
      dubbing: {
        tamil: row['Tamil dub'] === '1' || row['Tamil dub']?.toLowerCase() === 'true',
        telugu: row['Telugu dub'] === '1' || row['Telugu dub']?.toLowerCase() === 'true',
        kannada: row['Kannada dub'] === '1' || row['Kannada dub']?.toLowerCase() === 'true',
        malayalam: row['Malayalam dub'] === '1' || row['Malayalam dub']?.toLowerCase() === 'true',
        hindi: row['Hindi dub'] === '1' || row['Hindi dub']?.toLowerCase() === 'true',
        punjabi: row['Punjabi dub'] === '1' || row['Punjabi dub']?.toLowerCase() === 'true',
        bengali: row['Bengali dub'] === '1' || row['Bengali dub']?.toLowerCase() === 'true',
        marathi: row['Marathi dub'] === '1' || row['Marathi dub']?.toLowerCase() === 'true',
        bhojpuri: row['Bhojpuri dub'] === '1' || row['Bhojpuri dub']?.toLowerCase() === 'true',
        gujarati: row['Gujarati dub'] === '1' || row['Gujarati dub']?.toLowerCase() === 'true',
        english: row['English Dub'] === '1' || row['English Dub']?.toLowerCase() === 'true',
        haryanvi: row['Haryanvi Dub'] === '1' || row['Haryanvi Dub']?.toLowerCase() === 'true',
        rajasthani: row['Rajasthani Dub'] === '1' || row['Rajasthani Dub']?.toLowerCase() === 'true',
        deccani: row['Deccani Dub'] === '1' || row['Deccani Dub']?.toLowerCase() === 'true',
        arabic: row['Arabic Dub'] === '1' || row['Arabic Dub']?.toLowerCase() === 'true'
      },
      ageRating: row['Age Ratings']?.trim() || 'Not Rated',
      createdBy: userId
    };
  }

  async validateCSVStructure(filePath) {
    return new Promise((resolve, reject) => {
      const requiredHeaders = ['Platform', 'Title', 'Year'];
      const optionalHeaders = [
        'Self Declared Genre', 'Assigned Genre', 'Primary Language',
        'Self Declared Format', 'Assigned Format', 'Release Date',
        'Seasons', 'Episodes', 'Duration (hours)', 'Source',
        'Tamil dub', 'Telugu dub', 'Kannada dub', 'Malayalam dub',
        'Hindi dub', 'Punjabi dub', 'Bengali dub', 'Marathi dub',
        'Bhojpuri dub', 'Gujarati dub', 'English Dub', 'Haryanvi Dub',
        'Rajasthani Dub', 'Deccani Dub', 'Arabic Dub', 'Age Ratings'
      ];

      let headers = [];
      let isFirstRow = true;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headerList) => {
          headers = headerList;
        })
        .on('data', (row) => {
          if (isFirstRow) {
            isFirstRow = false;
            
            // Check for required headers
            const missingRequired = requiredHeaders.filter(header => !headers.includes(header));
            
            if (missingRequired.length > 0) {
              return reject(new Error(`Missing required headers: ${missingRequired.join(', ')}`));
            }

            resolve({
              isValid: true,
              headers,
              missingRequired: [],
              extraHeaders: headers.filter(h => ![...requiredHeaders, ...optionalHeaders].includes(h))
            });
          }
        })
        .on('error', reject);
    });
  }

  generateCSVTemplate() {
    const headers = [
      'Platform', 'Title', 'Self Declared Genre', 'Assigned Genre',
      'Primary Language', 'Self Declared Format', 'Assigned Format',
      'Year', 'Release Date', 'Seasons', 'Episodes', 'Duration (hours)',
      'Source', 'Tamil dub', 'Telugu dub', 'Kannada dub', 'Malayalam dub',
      'Hindi dub', 'Punjabi dub', 'Bengali dub', 'Marathi dub',
      'Bhojpuri dub', 'Gujarati dub', 'English Dub', 'Haryanvi Dub',
      'Rajasthani Dub', 'Deccani Dub', 'Arabic Dub', 'Age Ratings'
    ];

    const sampleRow = [
      'Netflix', 'Sample Movie', 'Action', 'Action', 'English',
      'Movie', 'Movie', '2023', '2023-01-01', '1', '1', '2.5',
      'In-House', '0', '0', '0', '0', '1', '0', '0', '0',
      '0', '0', '1', '0', '0', '0', '0', 'U/A 13+'
    ];

    return {
      headers,
      sampleData: [headers, sampleRow]
    };
  }
}

module.exports = new CSVService();
