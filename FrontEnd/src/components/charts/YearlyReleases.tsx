import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { analyticsService } from '../../services/analytics';
import { AnalyticsFilters } from '../../types/Chart';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import ChartCard from './ChartCard';
import logger from '../../utils/logger';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface YearlyReleasesProps {
  filters?: AnalyticsFilters;
  height?: number;
}

const YearlyReleases: React.FC<YearlyReleasesProps> = ({ 
  filters, 
  height = 300 
}) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    logger.info('YearlyReleases component mounted or filters changed', { filters });
    loadChartData();
    
    return () => {
      logger.info('YearlyReleases component unmounting');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]); // Re-fetch data when filters change

  const loadChartData = async () => {
    logger.time('YearlyReleases:loadChartData');
    try {
      setLoading(true);
      setError(null);
      
      logger.info('YearlyReleases: Fetching yearly releases data', { filters });
      
      // Pass filters directly to API for server-side filtering
      const response = await analyticsService.getYearlyReleases(filters);
      const resp: any = response;
      
      logger.debug('YearlyReleases: Raw data received', { 
        resp,
        hasDataProp: !!resp?.data,
        isArrayRoot: Array.isArray(resp)
      });
      
      // Extract data from the response supporting envelopes or arrays
      const payload = Array.isArray(resp) ? resp : (resp?.data?.data ?? resp?.data ?? []);
      const yearlyData: any[] = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      
      if (!yearlyData || yearlyData.length === 0) {
        logger.warn('YearlyReleases: No valid data received', { response });
        setChartData(null);
        setError('No data available for the selected filters');
        return;
      }
      
      logger.debug('YearlyReleases: Data received from server', {
        dataCount: yearlyData.length
      });
      
      const labels = yearlyData.map((item: any) => String(item.year ?? item._id ?? item.label ?? 'Unknown'));
      const data = yearlyData.map((item: any) => item.count);
      
      logger.debug('YearlyReleases: Processed data', { labels, data });
      
      setChartData({
        labels,
        datasets: [{
          label: 'Releases',
          data,
          borderColor: '#4BC0C0',
          backgroundColor: '#4BC0C0' + '20',
          tension: 0.1,
          fill: true
        }]
      });
      
      logger.info('YearlyReleases: Chart data set successfully', { 
        labelsCount: labels.length,
        dataPoints: data.length
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chart data';
      logger.error('YearlyReleases: Error loading chart data', { error: errorMessage, err });
      setError(errorMessage);
    } finally {
      setLoading(false);
      logger.timeEnd('YearlyReleases:loadChartData');
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || context.parsed || 0;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Releases'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Year'
        }
      }
    }
  };
  
  const handleConfigChange = (config: any) => {
    console.log('YearlyReleases config updated:', config);
    // Configuration changes like chart type switching are handled by ChartCard
  };

  if (loading) return <LoadingSpinner />;
  if (!chartData) return (
    <EmptyState
      title={error ? 'No data for the selected filters' : 'No data available'}
      description="Try broadening your date range, removing some filters, or selecting additional platforms/genres/languages."
    />
  );

  
  return (
    <>
      {error && chartData && (
        <div className="text-yellow-500 text-center p-2 mb-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          {error}
        </div>
      )}
      <ChartCard
        title="Yearly Content Releases"
        description="Trend of content releases over the years. This chart shows the number of titles released each year."
        chartData={chartData}
        chartOptions={options}
        height={height}
        allowedChartTypes={['line', 'bar']}
        defaultChartType="line"
        onConfigChange={handleConfigChange}
        className="p-6 border-purple-500 dark:border-purple-700"
      />
    </>
  );
};

export default YearlyReleases;
