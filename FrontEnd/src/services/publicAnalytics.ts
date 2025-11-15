import { apiService } from './api';
import { ChartData, AnalyticsFilters } from '../types/Chart';

class PublicAnalyticsService {
  async getMonthlyReleaseTrend(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`/public/analytics/monthly-release-trend?${params}`);
  }

  async getPlatformDistribution(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`/public/analytics/platform-distribution?${params}`);
  }

  async getLanguagePlatformMatrix(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`/public/analytics/language-platform-matrix?${params}`);
  }

  async getGenreTrends(filters?: AnalyticsFilters): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiService.get(`/public/analytics/genre-trends?${params}`);
  }

  private buildQueryParams(filters?: AnalyticsFilters): string {
    if (!filters) return '';
    
    const params = new URLSearchParams();
    
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
        }
      } else if (typeof value === 'boolean') {
        // Handle boolean values
        params.append(key, value.toString());
      } else if (typeof value === 'number') {
        // Handle numeric values
        params.append(key, value.toString());
      } else {
        // Handle string values
        params.append(key, value.toString());
      }
    });
    
    return params.toString();
  }
}

export const publicAnalyticsService = new PublicAnalyticsService();
