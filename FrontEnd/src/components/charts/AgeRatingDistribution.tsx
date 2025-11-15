import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import { analyticsService } from '../../services/analytics';
import { AnalyticsFilters } from '../../types/Chart';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import ChartCard from './ChartCard';
import { CHART_COLORS } from '../../utils/constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface AgeRatingDistributionProps {
  filters?: AnalyticsFilters;
  height?: number;
}

const AgeRatingDistribution: React.FC<AgeRatingDistributionProps> = ({
  filters,
  height = 300
}) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AgeRatingDistribution: Filters changed, reloading data', filters);
    loadChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const buildColors = (n: number) => {
    if (n <= 0) return [] as string[];
    const colors: string[] = [];
    for (let i = 0; i < n; i++) {
      colors.push(CHART_COLORS[i % CHART_COLORS.length]);
    }
    return colors;
  };

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pass filters directly to API for server-side filtering
      const response = await analyticsService.getAgeRatingDistribution(filters);
      const resp: any = response;

      // Handle potential API response envelope
      const items = Array.isArray(resp) ? resp : (resp?.data?.data ?? resp?.data ?? []);

      if (!items || items.length === 0) {
        setChartData(null);
        setError('No data available for the selected filters');
        return;
      }

      const labels = items.map((item: any) => item.ageRating || item._id || 'Unrated');
      const data = items.map((item: any) => item.count);
      const colors = buildColors(labels.length);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Content Count',
            data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
          }
        ]
      });
    } catch (err: any) {
      console.error('Error loading age rating distribution:', err);
      setError(err?.message || 'Failed to load chart data');
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || context.dataset.label || '';
            const value = context.parsed || context.parsed.y || 0;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Count' }
      },
      x: {
        title: { display: true, text: 'Age Rating' }
      }
    }
  };

  const handleConfigChange = (config: any) => {
    console.log('AgeRatingDistribution config updated:', config);
  };

  if (loading) return <LoadingSpinner />;
  if (!chartData) return (
    <EmptyState
      title={error ? 'No data for the selected filters' : 'No data available'}
      description="Try broadening your date range, removing some filters, or selecting additional platforms/genres/languages."
    />
  );

  // Advanced configuration props removed to match ChartCard definition

  return (
    <>
      {error && chartData && (
        <div className="text-yellow-500 text-center p-2 mb-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          {error}
        </div>
      )}
      <ChartCard
        title="Age Rating Distribution"
        description="Distribution of content by age rating. Shows the count of titles in each rating category."
        chartData={chartData}
        chartOptions={options}
        height={height}
        allowedChartTypes={['bar', 'pie', 'doughnut']}
        defaultChartType="doughnut"
        onConfigChange={handleConfigChange}
        className="p-6 border-green-500 dark:border-green-700"
      />
    </>
  );
};

export default AgeRatingDistribution;
