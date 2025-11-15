import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { analyticsService } from '../../services/analytics';
import { AnalyticsFilters } from '../../types/Chart';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import ChartCard from './ChartCard';
import logger from '../../utils/logger';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface DubbingAnalysisProps {
  filters?: AnalyticsFilters;
  height?: number;
}

const DubbingAnalysis: React.FC<DubbingAnalysisProps> = ({ 
  filters, 
  height = 300 
}) => {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    logger.info('DubbingAnalysis component mounted or filters changed', { filters });
    loadChartData();
    
    return () => {
      logger.info('DubbingAnalysis component unmounting');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), theme]); // Re-fetch data when filters or theme changes

  const loadChartData = async () => {
    logger.time('DubbingAnalysis:loadChartData');
    try {
      setLoading(true);
      setError(null);
      
      logger.info('DubbingAnalysis: Fetching dubbing analysis data', { filters });
      
      // Pass filters directly to API for server-side filtering
      const response = await analyticsService.getDubbingAnalysis(filters);
      
      logger.debug('DubbingAnalysis: Raw data received', { 
        response,
        dataType: typeof response.data,
        hasNestedStructure: typeof response.data === 'object' && !Array.isArray(response.data)
      });
      
      // Process the response data safely - handle potential envelopes
      const resp: any = response;
      const payload = Array.isArray(resp) ? resp : (resp?.data?.data ?? resp?.data ?? []);
      
      // The API might return an object with a `languageBreakdown` property
      const languageBreakdown: any[] = Array.isArray(payload) 
        ? payload 
        : (Array.isArray(payload?.languageBreakdown) ? payload.languageBreakdown : []);
      
      if (!Array.isArray(languageBreakdown) || languageBreakdown.length === 0) {
        logger.warn('DubbingAnalysis: No valid language breakdown data received', { 
          responseData: response.data,
          languageBreakdown
        });
        setChartData(null);
        setError('No data available for the selected filters');
        return;
      }
      
      logger.debug('DubbingAnalysis: Data received from server', {
        dataCount: languageBreakdown.length
      });
      
      const labels = languageBreakdown.map((item: any) => {
        // The API response uses 'language' instead of '_id' for the label
        const label = item.language || item._id;
        if (typeof label === 'string' && label) {
          return label.charAt(0).toUpperCase() + label.slice(1);
        }
        return 'Unknown';
      });
      const data = languageBreakdown.map((item: any) => item.count);
      
      logger.debug('DubbingAnalysis: Processed data', { labels, data });
      
      const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
        '#4BC0C0', '#9966FF', '#FF9F40', '#36A2EB',
        '#FFCE56', '#FF6384', '#C9CBCF'
      ];

      setChartData({
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, data.length),
          borderColor: colors.slice(0, data.length).map(color => color + '80'),
          borderWidth: 2
        }]
      });
      
      logger.info('DubbingAnalysis: Chart data set successfully', { 
        labelsCount: labels.length,
        dataPoints: data.length
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chart data';
      logger.error('DubbingAnalysis: Error loading chart data', { error: errorMessage, err });
      setError(errorMessage);
    } finally {
      setLoading(false);
      logger.timeEnd('DubbingAnalysis:loadChartData');
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          color: theme === 'dark' ? '#fff' : '#000'
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: theme === 'dark' ? '#fff' : '#000',
        bodyColor: theme === 'dark' ? '#fff' : '#000',
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  const handleConfigChange = (config: any) => {
    // Handle configuration changes
    console.log('Chart config updated:', config);
  };

  if (loading) return <LoadingSpinner />;
  if (!chartData) return (
    <EmptyState
      title={error ? 'No data for the selected filters' : 'No data available'}
      description="Try broadening your date range, removing some filters, or selecting additional platforms/genres/languages."
    />
  );

  // Advanced configuration removed for now to match ChartCard props
  
  return (
    <>
      {error && chartData && (
        <div className="text-yellow-500 text-center p-2 mb-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          {error}
        </div>
      )}
      <ChartCard
        title="Dubbing Language Analysis"
        description="Distribution of content across different dubbing languages. This chart shows the percentage of content available in each dubbing language."
        chartData={chartData}
        chartOptions={options}
        height={height}
        allowedChartTypes={['pie', 'doughnut', 'bar']}
        defaultChartType="doughnut"
        onConfigChange={handleConfigChange}
        className="p-6 border-purple-500 dark:border-purple-700"
      />
    </>
  );
};

export default DubbingAnalysis;
