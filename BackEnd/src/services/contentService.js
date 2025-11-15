const Content = require('../models/Content');
const logger = require('../utils/logger');

class ContentService {
  async createContent(contentData, userId) {
    try {
      const content = new Content({
        ...contentData,
        createdBy: userId
      });

      await content.save();
      await content.populate('createdBy', 'username');

      return content;
    } catch (error) {
      logger.error(`Create content service error: ${error.message}`);
      throw error;
    }
  }

  async getContentWithFilters(filters, options) {
    try {
      const result = await Content.paginate(filters, options);
      return result;
    } catch (error) {
      logger.error(`Get content with filters error: ${error.message}`);
      throw error;
    }
  }

  async checkDuplicate(platform, title, year, excludeId = null) {
    try {
      const query = {
        platform,
        title,
        year,
        isActive: true
      };

      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const existingContent = await Content.findOne(query);
      return !!existingContent;
    } catch (error) {
      logger.error(`Check duplicate error: ${error.message}`);
      throw error;
    }
  }

  async updateContent(contentId, updateData) {
    try {
      const updatedContent = await Content.findByIdAndUpdate(
        contentId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('createdBy', 'username');

      return updatedContent;
    } catch (error) {
      logger.error(`Update content service error: ${error.message}`);
      throw error;
    }
  }

  async deleteContent(contentId) {
    try {
      const content = await Content.findByIdAndUpdate(
        contentId,
        { isActive: false },
        { new: true }
      );

      return content;
    } catch (error) {
      logger.error(`Delete content service error: ${error.message}`);
      throw error;
    }
  }

  async getContentStats() {
    try {
      const totalContent = await Content.countDocuments({ isActive: true });
      
      const platformStats = await Content.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$platform', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const genreStats = await Content.aggregate([
        { $match: { isActive: true, assignedGenre: { $exists: true, $ne: null } } },
        { $group: { _id: '$assignedGenre', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const languageStats = await Content.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$primaryLanguage', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return {
        totalContent,
        platformStats,
        genreStats,
        languageStats
      };
    } catch (error) {
      logger.error(`Get content stats error: ${error.message}`);
      throw error;
    }
  }

  async searchContent(searchTerm, filters = {}) {
    try {
      const searchFilter = {
        ...filters,
        isActive: true,
        $text: { $search: searchTerm }
      };

      const content = await Content.find(searchFilter)
        .populate('createdBy', 'username')
        .sort({ score: { $meta: 'textScore' } })
        .limit(50);

      return content;
    } catch (error) {
      logger.error(`Search content error: ${error.message}`);
      throw error;
    }
  }

  async getContentByYear(year) {
    try {
      const content = await Content.find({ year, isActive: true })
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 });

      return content;
    } catch (error) {
      logger.error(`Get content by year error: ${error.message}`);
      throw error;
    }
  }

  async getContentByPlatform(platform) {
    try {
      const content = await Content.find({ platform, isActive: true })
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 });

      return content;
    } catch (error) {
      logger.error(`Get content by platform error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ContentService();
