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
import { useTheme } from '../../context/ThemeContext';

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

interface TopDubbedLanguagesProps {
  filters?: AnalyticsFilters;
  height?: number;
}

interface TopDubbedLangItem {
  count: number;
  language: string;
}

const toTitleCase = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const TopDubbedLanguages: React.FC<TopDubbedLanguagesProps> = ({ filters, height = 300 }) => {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pass filters directly to API for server-side filtering
      const resp = await analyticsService.getTopDubbedLanguages(filters);
      const raw: any = (resp as any)?.data ?? resp;
      const arr: TopDubbedLangItem[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);

      if (!arr || arr.length === 0) {
        setChartData(null);
        setError('No data available for the selected filters');
        return;
      }

      const labels = arr.map(i => toTitleCase(i.language));
      const dataValues = arr.map(i => i.count);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Dubbed Content Count',
            data: dataValues,
            backgroundColor: theme === 'dark' ? '#8B5CF6' : '#6366F1',
            borderColor: theme === 'dark' ? '#8B5CF6' : '#6366F1',
            borderWidth: 1,
          },
        ],
      });
    } catch (err) {
      console.error('Error loading top dubbed languages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
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
        position: 'bottom' as const,
      },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed.y ?? context.parsed ?? 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Count' },
      },
      x: {
        title: { display: true, text: 'Language' },
      },
    },
  };

  if (loading) return <LoadingSpinner />;
  if (!chartData) return (
    <EmptyState
      title={error ? 'No data for the selected filters' : 'No data available'}
      description="Try broadening your date range, removing some filters, or selecting additional platforms/genres/languages."
    />
  );

  return (
    <ChartCard
      title="Top Dubbed Languages"
      description="Top languages by count of dubbed content. Use the legend to toggle languages."
      chartData={chartData}
      chartOptions={options}
      height={height}
      allowedChartTypes={["bar", "pie", "doughnut"]}
      defaultChartType="bar"
      legendMode="xAxis"
      className="p-6 border-purple-500 dark:border-purple-700"
    />
  );
};

export default TopDubbedLanguages;
