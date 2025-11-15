import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analytics';
import { AnalyticsFilters, ChartData } from '../types/Chart';

interface UseChartDataOptions {
  filters?: AnalyticsFilters;
  refreshInterval?: number;
  enabled?: boolean;
}

export const useChartData = (
  chartType: keyof typeof analyticsService,
  options: UseChartDataOptions = {}
) => {
  const { filters, refreshInterval, enabled = true } = options;
  
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const service = analyticsService[chartType] as Function;
      const result = await service(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [chartType, JSON.stringify(filters), enabled]);

  useEffect(() => {
    if (refreshInterval && enabled) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, enabled]);

  return { data, loading, error, refetch: fetchData };
};
