/**
 * Analytics Filter Builder Utility
 * Provides flexible data slicing across multiple dimensions
 */

// Helper: split comma-separated values into trimmed array
function toList(value) {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(Boolean);
  return [];
}

// Helper: Title Case each word (e.g., "movie" -> "Movie", "prime video" -> "Prime Video")
function toTitleCase(s) {
  return String(s)
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

class AnalyticsFilterBuilder {
  /**
   * Build MongoDB match stage from query parameters
   * @param {Object} params - Query parameters
   * @returns {Object} MongoDB match stage
   */
  static buildMatchStage(params = {}) {
    const matchStage = { isActive: true };

    // Platform filter (supports single or multiple)
    if (params.platform) {
      const platforms = toList(params.platform);
      matchStage.platform = platforms.length === 1 ? platforms[0] : { $in: platforms };
    }

    // Type/Format filter (movie, series, documentary, etc.)
    if (params.type || params.format) {
      const rawTypes = toList(params.type || params.format);
      // Normalize to Title Case to match stored values (e.g., "movie" -> "Movie")
      const types = rawTypes.map(toTitleCase);
      matchStage.assignedFormat = types.length === 1 ? types[0] : { $in: types };
    }

    // Year filter (single year, range, or multiple years) + intersection with startYear/endYear if provided
    let yearCond = null;
    if (params.year) {
      if (typeof params.year === 'string' && params.year.includes('-')) {
        const [start, end] = params.year.split('-').map(y => parseInt(y.trim()));
        yearCond = { ...(yearCond || {}), $gte: start, $lte: end };
      } else if (Array.isArray(params.year)) {
        const years = params.year.map(y => parseInt(y));
        yearCond = { ...(yearCond || {}), $in: years };
      } else {
        const y = parseInt(params.year);
        yearCond = { ...(yearCond || {}), $in: [y] };
      }
    }

    if (params.startYear || params.endYear) {
      yearCond = { ...(yearCond || {}) };
      if (params.startYear) yearCond.$gte = parseInt(params.startYear);
      if (params.endYear) yearCond.$lte = parseInt(params.endYear);
    }

    if (yearCond) {
      matchStage.year = yearCond;
    }

    // Release date filter
    if (params.startDate || params.endDate) {
      matchStage.releaseDate = {};
      if (params.startDate) matchStage.releaseDate.$gte = new Date(params.startDate);
      if (params.endDate) matchStage.releaseDate.$lte = new Date(params.endDate);
    }

    // Genre filter (supports single or multiple)
    if (params.genre) {
      const genres = toList(params.genre);
      const base = genres.length === 1 ? { $in: [genres[0]] } : { $in: genres };
      // Exclude null/empty genres safely
      matchStage.assignedGenre = { ...base, $nin: [null, ''] };
    }

    // Language filter (supports single or multiple)
    if (params.language) {
      const languages = toList(params.language);
      matchStage.primaryLanguage = languages.length === 1 ? languages[0] : { $in: languages };
    }

    // Region/Language filter (alias for language)
    if (params.region && !params.language) {
      const regions = Array.isArray(params.region) 
        ? params.region 
        : params.region.split(',').map(r => r.trim());
      matchStage.primaryLanguage = regions.length === 1 ? regions[0] : { $in: regions };
    }

    // Popularity filter (based on dubbing count as proxy)
    if (params.minPopularity || params.maxPopularity) {
      const minPop = params.minPopularity ? parseInt(params.minPopularity) : undefined;
      const maxPop = params.maxPopularity ? parseInt(params.maxPopularity) : undefined;
      matchStage.totalDubbings = { ...(matchStage.totalDubbings || {}) };
      if (minPop !== undefined) matchStage.totalDubbings.$gte = minPop;
      if (maxPop !== undefined) matchStage.totalDubbings.$lte = maxPop;
    }

    // Age rating filter
    if (params.ageRating) {
      const ratings = Array.isArray(params.ageRating) 
        ? params.ageRating 
        : params.ageRating.split(',').map(r => r.trim());
      matchStage.ageRating = ratings.length === 1 ? ratings[0] : { $in: ratings };
    }

    // Source filter (In-House, Commissioned, Co-Production)
    if (params.source) {
      const sources = Array.isArray(params.source) 
        ? params.source 
        : params.source.split(',').map(s => s.trim());
      matchStage.source = sources.length === 1 ? sources[0] : { $in: sources };
    }

    // Duration filters
    if (params.minDuration) {
      matchStage.durationHours = { $gte: parseFloat(params.minDuration) };
    }
    if (params.maxDuration) {
      matchStage.durationHours = { 
        ...matchStage.durationHours, 
        $lte: parseFloat(params.maxDuration) 
      };
    }

    // Seasons filter (for series)
    if (params.minSeasons) {
      matchStage.seasons = { $gte: parseInt(params.minSeasons) };
    }
    if (params.maxSeasons) {
      matchStage.seasons = { 
        ...matchStage.seasons, 
        $lte: parseInt(params.maxSeasons) 
      };
    }

    // Dubbing availability filter (merge with popularity if present)
    if (params.hasDubbing !== undefined) {
      const hasDubbing = params.hasDubbing === 'true' || params.hasDubbing === true;
      matchStage.totalDubbings = { ...(matchStage.totalDubbings || {}) };
      if (hasDubbing) {
        // Ensure strictly greater than 0; keep other bounds if set
        matchStage.totalDubbings.$gt = 0;
      } else {
        // Explicitly zero dubbings
        matchStage.totalDubbings = { $eq: 0 };
      }
    }

    // Specific dubbing language filter
    if (params.dubbingLanguage) {
      const languages = toList(params.dubbingLanguage).map(l => l.toLowerCase());
      languages.forEach(lang => {
        matchStage[`dubbing.${lang}`] = true;
      });
    }

    return matchStage;
  }

  /**
   * Build group by configuration
   * @param {String|Array} groupBy - Fields to group by
   * @returns {Object} Group stage configuration
   */
  static buildGroupBy(groupBy) {
    if (!groupBy) return null;

    const fields = Array.isArray(groupBy) ? groupBy : [groupBy];
    const groupId = {};

    fields.forEach(field => {
      groupId[field] = `$${field}`;
    });

    return fields.length === 1 ? `$${fields[0]}` : groupId;
  }

  /**
   * Parse sort parameters
   * @param {String} sortBy - Field to sort by
   * @param {String} sortOrder - Sort order (asc/desc)
   * @returns {Object} Sort stage
   */
  static buildSort(sortBy = 'count', sortOrder = 'desc') {
    const order = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
    return { [sortBy]: order };
  }

  /**
   * Build pagination configuration
   * @param {Number} page - Page number
   * @param {Number} limit - Items per page
   * @returns {Object} Pagination config
   */
  static buildPagination(page = 1, limit = 100) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(1000, Math.max(1, parseInt(limit)));
    return {
      skip: (pageNum - 1) * limitNum,
      limit: limitNum
    };
  }

  /**
   * Extract common query parameters
   * @param {Object} query - Request query object
   * @returns {Object} Parsed parameters
   */
  static parseQueryParams(query) {
    return {
      // Filters
      platform: query.platform,
      type: query.type,
      format: query.format,
      year: query.year,
      startYear: query.startYear,
      endYear: query.endYear,
      startDate: query.startDate,
      endDate: query.endDate,
      genre: query.genre,
      language: query.language,
      region: query.region,
      ageRating: query.ageRating,
      source: query.source,
      minDuration: query.minDuration,
      maxDuration: query.maxDuration,
      minSeasons: query.minSeasons,
      maxSeasons: query.maxSeasons,
      minPopularity: query.minPopularity,
      maxPopularity: query.maxPopularity,
      hasDubbing: query.hasDubbing,
      dubbingLanguage: query.dubbingLanguage,

      // Grouping & Aggregation
      groupBy: query.groupBy,
      
      // Sorting
      sortBy: query.sortBy || 'count',
      sortOrder: query.sortOrder || 'desc',

      // Pagination
      page: query.page,
      limit: query.limit
    };
  }

  /**
   * Build facet pipeline for multi-dimensional analysis
   * @param {Object} dimensions - Dimensions to analyze
   * @returns {Object} Facet stage
   */
  static buildFacetPipeline(dimensions = []) {
    const facets = {};

    dimensions.forEach(dim => {
      facets[dim] = [
        { $group: { _id: `$${dim}`, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, [dim]: '$_id', count: 1 } }
      ];
    });

    return facets;
  }
}

module.exports = AnalyticsFilterBuilder;
