export const PLATFORMS = [
  'Netflix',
  'Amazon Prime Video',
  'Disney+',
  'Hotstar',
  'Zee5',
  'SonyLIV',
  'Voot',
  'ALTBalaji',
  'MX Player',
  'YouTube',
  'Jio Cinema',
  'Aha',
  'Sun NXT'
];

export const GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sport',
  'Thriller',
  'War',
  'Western'
];

export const LANGUAGES = [
  'Hindi',
  'English',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Bhojpuri',
  'Haryanvi',
  'Rajasthani',
  'Deccani',
  'Arabic'
];

export const FORMATS = [
  'Movie',
  'TV Series',
  'Web Series',
  'Documentary',
  'Short Film',
  'Mini Series',
  'Reality Show',
  'Talk Show',
  'News',
  'Sports'
];

export const AGE_RATINGS = [
  'U',
  'U/A 7+',
  'U/A 13+',
  'U/A 16+',
  'A',
  'Not Rated'
];

export const SOURCES = [
  'In-House',
  'Commissioned',
  'Co-Production',
  'Acquired',
  'Licensed',
  'TBD'
];

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_TOKEN: '/auth/verify-token',
    REFRESH_TOKEN: '/auth/refresh-token',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  SYSTEM: {
    HEALTH: '/health'
  },
  CONTENT: {
    BASE: '/content',
    IMPORT_CSV: '/content/import-csv',
    IMPORT_CSV_ERRORS: '/content/import-csv/errors',
    EXPORT_CSV: '/content/export/csv',
    CHECK_DUPLICATE: '/content/check-duplicate'
  },
  ANALYTICS: {
    // Existing endpoints
    PLATFORM_DISTRIBUTION: '/analytics/platform-distribution',
    GENRE_TRENDS: '/analytics/genre-trends',
    LANGUAGE_STATS: '/analytics/language-stats',
    YEARLY_RELEASES: '/analytics/yearly-releases',
    MONTHLY_RELEASE_TREND: '/analytics/monthly-release-trend',
    PLATFORM_GROWTH: '/analytics/platform-growth',
    GENRE_PLATFORM_HEATMAP: '/analytics/genre-platform-heatmap',
    LANGUAGE_PLATFORM_MATRIX: '/analytics/language-platform-matrix',
    DURATION_BY_FORMAT_GENRE: '/analytics/duration-by-format-genre',
    DUBBING_ANALYSIS: '/analytics/dubbing-analysis',
    TOP_DUBBED_LANGUAGES: '/analytics/top-dubbed-languages',
    SOURCE_BREAKDOWN: '/analytics/source-breakdown',
    DURATION_ANALYSIS: '/analytics/duration-analysis',
    AGE_RATING_DISTRIBUTION: '/analytics/age-rating-distribution',
    DASHBOARD_SUMMARY: '/analytics/dashboard-summary',
    CUSTOM: '/analytics/custom',
    DUBBING_PENETRATION: '/analytics/dubbing-penetration',
    
    // New comprehensive endpoints
    MULTI_DIMENSIONAL: '/analytics/multi-dimensional',
    ADVANCED_SLICING: '/analytics/advanced-slicing',
    COMPARATIVE: '/analytics/comparative'
  },
  USERS: {
    PROFILE: '/users/profile',
    BASE: '/users'
  }
};

export const CHART_COLORS = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#FF6384',
  '#C9CBCF'
];

export const PAGINATION_LIMITS = [10, 20, 50, 100];

export const DEBOUNCE_DELAY = 500;

export const TOKEN_STORAGE_KEY = 'ott_dashboard_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'ott_dashboard_refresh_token';
export const USER_STORAGE_KEY = 'ott_dashboard_user';
