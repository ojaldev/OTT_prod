import { apiService } from './api';
import { ChartData, AnalyticsFilters } from '../types/Chart';
import { API_ENDPOINTS } from '../utils/constants';

class AnalyticsService {
  async getPlatformDistribution(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.PLATFORM_DISTRIBUTION}?${params}`);
  }

  async getGenreTrends(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.GENRE_TRENDS}?${params}`);
  }

  async getLanguageStats(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.LANGUAGE_STATS}?${params}`);
  }

  async getYearlyReleases(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.YEARLY_RELEASES}?${params}`);
  }

  async getMonthlyReleaseTrend(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.MONTHLY_RELEASE_TREND}?${params}`);
  }

  async getPlatformGrowth(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.PLATFORM_GROWTH}?${params}`);
  }

  async getGenrePlatformHeatmap(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.GENRE_PLATFORM_HEATMAP}?${params}`);
  }

  async getLanguagePlatformMatrix(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.LANGUAGE_PLATFORM_MATRIX}?${params}`);
  }

  async getDurationByFormatGenre(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.DURATION_BY_FORMAT_GENRE}?${params}`);
  }

  async getDubbingAnalysis(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.DUBBING_ANALYSIS}?${params}`);
  }

  async getTopDubbedLanguages(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.TOP_DUBBED_LANGUAGES}?${params}`);
  }

  async getSourceBreakdown(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.SOURCE_BREAKDOWN}?${params}`);
  }

  async getDurationAnalysis(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.DURATION_ANALYSIS}?${params}`);
  }

  async getAgeRatingDistribution(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.AGE_RATING_DISTRIBUTION}?${params}`);
  }

  async getDashboardSummary(): Promise<any> {
    return apiService.get(API_ENDPOINTS.ANALYTICS.DASHBOARD_SUMMARY);
  }

  async getCustomAnalytics(config: any): Promise<ChartData> {
    return apiService.post(API_ENDPOINTS.ANALYTICS.CUSTOM, config);
  }

  async getDubbingPenetration(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.DUBBING_PENETRATION}?${params}`);
  }

  // New comprehensive analytics endpoints
  async getMultiDimensionalAnalytics(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.MULTI_DIMENSIONAL}?${params}`);
  }

  async getAdvancedSlicing(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.ADVANCED_SLICING}?${params}`);
  }

  async getComparativeAnalytics(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`${API_ENDPOINTS.ANALYTICS.COMPARATIVE}?${params}`);
  }
  
  private buildQueryParams(filters?: AnalyticsFilters): string {
    if (!filters) return '';
    
    const params = new URLSearchParams();
    
    console.log('Building query params with filters:', JSON.stringify(filters, null, 2));
    
    Object.entries(filters).forEach(([key, value]) => {
      // Skip undefined, null, and empty string values
      if (value === undefined || value === null || value === '') {
        return;
      }
      
      if (Array.isArray(value)) {
        // Handle array values - join with comma for backend
        const arrayValue = value.join(',');
        if (arrayValue) {
          params.append(key, arrayValue);
          console.log(`Added array param: ${key} = ${arrayValue}`);
        }
      } else if (typeof value === 'boolean') {
        // Handle boolean values
        params.append(key, value.toString());
        console.log(`Added boolean param: ${key} = ${value}`);
      } else if (typeof value === 'number') {
        // Handle numeric values
        params.append(key, value.toString());
        console.log(`Added numeric param: ${key} = ${value}`);
      } else {
        // Handle string values
        params.append(key, value.toString());
        console.log(`Added param: ${key} = ${value}`);
      }
    });
    
    const queryString = params.toString();
    console.log('Final query string:', queryString);
    return queryString;
  }
}

export const analyticsService = new AnalyticsService();
