import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
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
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface GenreTrendsProps {
  filters?: AnalyticsFilters;
  height?: number;
}

const GenreTrends: React.FC<GenreTrendsProps> = ({ 
  filters, 
  height = 300 
}) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    logger.info('GenreTrends component mounted or filters changed', { filters });
    loadChartData();
    
    return () => {
      logger.info('GenreTrends component unmounting');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]); // Re-fetch data when filters change

  const loadChartData = async () => {
    logger.time('GenreTrends:loadChartData');
    try {
      setLoading(true);
      setError(null);
      
      logger.info('GenreTrends: Fetching genre trends data', { filters });
      
      // Pass filters directly to API for server-side filtering
      const response = await analyticsService.getGenreTrends(filters);
      const resp: any = response;
      const items = Array.isArray(resp) ? resp : (resp?.data?.data ?? resp?.data ?? []);

      if (!items || items.length === 0) {
        setChartData(null);
        setError('No data available for the selected filters');
        return;
      }

      logger.debug('GenreTrends: Data received from server', { 
        genreCount: items.length 
      });
      
      const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40'
      ];

      // Get all unique years from the data and sort them
      const allYears = new Set<number>();
      items.forEach((genre: any) => {
        genre.data.forEach((item: any) => {
          allYears.add(parseInt(item.year));
        });
      });
      
      // Convert to array and sort numerically
      const sortedYears = Array.from(allYears).sort((a, b) => a - b);
      logger.debug('GenreTrends: Years extracted and sorted', { 
        years: sortedYears,
        yearCount: sortedYears.length 
      });
      
      // Create datasets with properly sorted data
      const datasets = items.map((genre: any, index: number) => {
        // Create a map of year to count for this genre
        const yearCountMap = new Map<number, number>();
        genre.data.forEach((item: any) => {
          yearCountMap.set(parseInt(item.year), item.count);
        });
        
        // Create data points for all years, using 0 for missing years
        const dataPoints = sortedYears.map(year => ({
          x: year,
          y: yearCountMap.has(year) ? yearCountMap.get(year) : 0
        }));
        
        return {
          label: genre.genre || 'Unknown Genre',
          data: dataPoints,
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + '20',
          tension: 0.1
        };
      });

      logger.info('GenreTrends: Chart data processed successfully', { 
        genreCount: datasets.length,
        yearRange: sortedYears.length > 0 ? 
          `${sortedYears[0]}-${sortedYears[sortedYears.length-1]}` : 'none'
      });

      setChartData({
        // Provide x-axis labels (years) explicitly for legend generation
        labels: sortedYears,
        datasets
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chart data';
      logger.error('GenreTrends: Error loading chart data', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setLoading(false);
      logger.timeEnd('GenreTrends:loadChartData');
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
            const value = context.parsed.y || 0;
            return `${label}: ${value}`;
          },
          title: function(context: any) {
            // Display the year as a whole number without decimal places
            return `Year: ${context[0].parsed.x}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: 'Year'
        },
        ticks: {
          // Ensure only whole years are displayed
          stepSize: 1,
          callback: function(value: any) {
            return Math.floor(value);
          }
        },
        // Ensure the axis includes all years in the dataset
        min: chartData ? Math.min(...chartData.datasets.flatMap((d: any) => d.data.map((p: any) => p.x))) : undefined,
        max: chartData ? Math.max(...chartData.datasets.flatMap((d: any) => d.data.map((p: any) => p.x))) : undefined
      },
      y: {
        title: {
          display: true,
          text: 'Count'
        },
        beginAtZero: true
      }
    }
  };
  
  const handleConfigChange = (config: any) => {
    console.log('GenreTrends config updated:', config);
    // Configuration changes like chart type switching are handled by ChartCard
    // Data-related configurations would require API changes
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
        title="Genre Trends Over Time"
        description="This chart shows how different genres have trended over the years. The data represents the count of content released in each genre per year."
        chartData={chartData}
        chartOptions={options}
        height={height}
        allowedChartTypes={['line', 'bar']}
        defaultChartType="line"
        legendMode="dataset"
        onConfigChange={handleConfigChange}
        className="p-6 border-purple-500 dark:border-purple-700"
      />
    </>
  );
};

export default GenreTrends;
