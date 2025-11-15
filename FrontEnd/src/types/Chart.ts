export interface ChartData {
  success: boolean;
  data: any[];
  message: string;
}

export interface ChartConfig {
  type: 'pie' | 'bar' | 'line' | 'doughnut' | 'scatter' | 'bubble';
  title: string;
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
  responsive?: boolean;
  legend?: boolean;
}

export interface AnalyticsFilters {
  // Year/Date Filters
  year?: string;  // Single year, range (2020-2023), or multiple (2020,2021,2023)
  startYear?: string;
  endYear?: string;
  startDate?: string;  // ISO date format
  endDate?: string;    // ISO date format
  
  // Platform Filters
  platform?: string | string[];  // Single or comma-separated
  
  // Content Type Filters
  type?: string | string[];      // Movie, Series, Documentary, etc.
  format?: string | string[];    // Alias for type
  
  // Genre Filters
  genre?: string | string[];     // Single or comma-separated
  
  // Language/Region Filters
  language?: string | string[];  // Primary language
  region?: string | string[];    // Alias for language
  
  // Rating Filters
  ageRating?: string | string[]; // PG, PG-13, R, etc.
  
  // Source Filters
  source?: string | string[];    // In-House, Commissioned, Co-Production
  
  // Duration Filters
  minDuration?: number;          // Minimum duration in hours
  maxDuration?: number;          // Maximum duration in hours
  
  // Popularity Filters
  minPopularity?: number;        // Minimum dubbing count
  maxPopularity?: number;        // Maximum dubbing count
  
  // Dubbing Filters
  hasDubbing?: boolean;          // Filter by dubbing availability
  dubbingLanguage?: string | string[];  // Specific dubbing language(s)
  
  // Seasons Filters (for Series)
  minSeasons?: number;
  maxSeasons?: number;
  
  // Sorting & Pagination
  sortBy?: string;               // Field to sort by (default: count)
  sortOrder?: 'asc' | 'desc';    // Sort order (default: desc)
  page?: number;                 // Page number (default: 1)
  limit?: number;                // Items per page (default: 100, max: 1000)
  
  // Grouping (for advanced slicing)
  groupBy?: string;              // Primary grouping dimension
  secondaryGroupBy?: string;     // Secondary grouping dimension
  
  // Multi-dimensional Analysis
  dimensions?: string | string[]; // Dimensions for multi-dimensional analysis
  
  // Comparative Analysis
  compareBy?: string;            // Dimension for comparison
  metric?: string;               // Primary metric for comparison
  
  // Legacy month filters (for backward compatibility)
  startMonth?: string;
  endMonth?: string;
}

export interface CustomChartConfig {
  chartType: string;
  xAxis: string;
  yAxis: string;
  groupBy?: string;
  filters?: AnalyticsFilters;
  aggregation?: 'count' | 'sum' | 'avg';
}
