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
import { CHART_COLORS } from '../../utils/constants';

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

interface PlatformGrowthProps {
  filters?: AnalyticsFilters;
  height?: number;
}

interface ApiItem {
  count: number;
  year: number;
  platform: string;
}

const PlatformGrowth: React.FC<PlatformGrowthProps> = ({ filters, height = 300 }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('PlatformGrowth: Filters changed, reloading data', filters);
    loadChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pass filters directly to API for server-side filtering
      const response = await analyticsService.getPlatformGrowth(filters);
      const raw: any = (response as any)?.data ?? response;
      const items: ApiItem[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);

      if (!items || items.length === 0) {
        setChartData(null);
        setError('No data available for the selected filters');
        return;
      }

      const data = items;

      // Build sorted unique year list
      const yearSet = new Set<number>();
      const platformSet = new Set<string>();
      data.forEach(d => { yearSet.add(+d.year); platformSet.add(String(d.platform)); });
      const years = Array.from(yearSet).sort((a, b) => a - b);
      const platforms = Array.from(platformSet).sort((a, b) => a.localeCompare(b));

      // Aggregate counts per (platform, year)
      const key = (p: string, y: number) => `${p}__${y}`;
      const map = new Map<string, number>();
      data.forEach(d => {
        const k = key(d.platform, +d.year);
        map.set(k, (map.get(k) || 0) + (Number.isFinite(d.count as number) ? +d.count : 0));
      });

      // Build datasets per platform aligned to years
      const datasets = platforms.map((p, idx) => {
        const color = CHART_COLORS[idx % CHART_COLORS.length];
        const series = years.map(y => map.get(key(p, y)) ?? 0);
        return {
          label: p,
          data: series,
          borderColor: color,
          backgroundColor: color + '33',
          borderWidth: 2,
          tension: 0.2,
          fill: false,
        };
      });

      setChartData({
        labels: years.map(String),
        datasets,
      });
    } catch (err: any) {
      console.error('Error loading platform growth data:', err);
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
        position: 'bottom' as const,
      },
      title: { display: false },
      tooltip: {
        mode: 'nearest' as const,
        intersect: false,
        callbacks: {
          title: (items: any[]) => (items?.[0]?.label ? `Year: ${items[0].label}` : ''),
          label: (ctx: any) => `${ctx.dataset?.label || ''}: ${ctx.parsed?.y ?? ctx.parsed ?? 0}`,
        },
      },
    },
    interaction: { mode: 'index' as const, intersect: false },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Content Count' },
      },
      x: {
        title: { display: true, text: 'Year' },
      },
    },
  } as const;

  if (loading) return <LoadingSpinner />;
  if (!chartData) return (
    <EmptyState
      title={error ? 'No data for the selected filters' : 'No data available'}
      description="Try broadening your date range, removing some filters, or selecting additional platforms/genres/languages."
    />
  );

  return (
    <ChartCard
      title="Platform Growth Over Time"
      description="Year-over-year content count by platform. Legend items represent platforms; click to toggle each platform."
      chartData={chartData}
      chartOptions={options}
      height={height}
      allowedChartTypes={['line', 'bar']}
      defaultChartType="line"
      className="p-6 border-blue-500 dark:border-blue-700"
      legendMode="dataset"
    />
  );
};

export default PlatformGrowth;
