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

interface MonthlyReleaseTrendProps {
  filters?: AnalyticsFilters;
  height?: number;
}

interface ApiItem {
  period: string; // YYYY-MM
  count: number;
}

interface EnrichedItem extends ApiItem {
  year: number;
  month: number; // 1-12
}

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const formatPeriodLabel = (period: string) => {
  // expects YYYY-MM
  const [y, m] = period.split('-');
  const monthIndex = Math.max(1, Math.min(12, parseInt(m, 10))) - 1;
  return `${monthNames[monthIndex]} ${y}`;
};

const MonthlyReleaseTrend: React.FC<MonthlyReleaseTrendProps> = ({
  filters,
  height = 300
}) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('MonthlyReleaseTrend: Filters changed, reloading data', filters);
    loadChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pass filters directly to API for server-side filtering
      const response = await analyticsService.getMonthlyReleaseTrend(filters);
      const raw: any = (response as any)?.data ?? response;
      const items: ApiItem[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);

      if (!items || items.length === 0) {
        setChartData(null);
        setError('No data available for the selected filters');
        return;
      }

      // Enrich with year/month numeric for sorting
      let enriched: EnrichedItem[] = items
        .filter((i) => typeof i.period === 'string' && /\d{4}-\d{2}/.test(i.period))
        .map((i) => {
          const [y, m] = i.period.split('-');
          return {
            ...i,
            year: parseInt(y, 10),
            month: parseInt(m, 10)
          };
        });

      // Sort by period ascending
      enriched.sort((a, b) => (a.year - b.year) || (a.month - b.month));

      const labels = enriched.map((i) => formatPeriodLabel(i.period));
      const data = enriched.map((i) => i.count);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Releases',
            data,
            borderColor: '#9966FF',
            backgroundColor: '#9966FF20',
            tension: 0.2,
            fill: true
          }
        ]
      });
    } catch (err: any) {
      console.error('MonthlyReleaseTrend: Failed to load data', err);
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
        title: { display: true, text: 'Number of Releases' }
      },
      x: {
        title: { display: true, text: 'Month' }
      }
    }
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
        title="Monthly Release Trend"
        description="Trend of content releases by month. This chart shows the number of titles released per month."
        chartData={chartData}
        chartOptions={options}
        height={height}
        allowedChartTypes={['line', 'bar']}
        defaultChartType="line"
        onConfigChange={(config) => {
          console.log('MonthlyReleaseTrend config changed', config);
          // Configuration changes like chart type switching are handled by ChartCard
        }}
        className="p-6 border-indigo-500 dark:border-indigo-700"
      />
    </>
  );
};

export default MonthlyReleaseTrend;
