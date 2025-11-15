import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { analyticsService } from '../../services/analytics';
import { AnalyticsFilters } from '../../types/Chart';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import ChartCard, { ChartType } from './ChartCard';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface PlatformDistributionProps {
  filters?: AnalyticsFilters;
  height?: number;
}

const PlatformDistribution: React.FC<PlatformDistributionProps> = ({ 
  filters, 
  height = 300 
}) => {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChartType] = useState<ChartType>('pie');

  useEffect(() => {
    console.log('PlatformDistribution: Filters changed, reloading data', filters);
    loadChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]); // Re-fetch data when filters change

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Log filters to help with debugging
      console.log('Loading platform distribution with filters:', filters);
      
      // Pass filters directly to API for server-side filtering
      const response = await analyticsService.getPlatformDistribution(filters);
      
      console.log('🔍 Full API Response:', response);
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Response.data:', response?.data);
      console.log('🔍 Is Array?', Array.isArray(response));
      
      // Handle different response structures
      const resp: any = response;
      const items = Array.isArray(resp) ? resp : (resp?.data?.data ?? resp?.data ?? []);

      if (!items || items.length === 0) {
        console.warn('⚠️ No data available for filters:', filters);
        setChartData(null);
        setError('No data available for the selected filters');
        return;
      }

      console.log('✅ Filtered data from API:', items);

      const labels = items.map((item: any) => item.platform || item._id);
      const data = items.map((item: any) => item.count);
      
      const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
      ];

      setChartData({
        labels,
        datasets: [{
          label: 'Content Count',
          data,
          backgroundColor: colors.slice(0, data.length).map(color => color + 'CC'),
          borderColor: colors.slice(0, data.length),
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverBackgroundColor: colors.slice(0, data.length),
          hoverBorderColor: '#ffffff',
          borderRadius: 4,
          barThickness: 40,
          maxBarThickness: 60
        }]
      });
    } catch (err) {
      console.error('Error loading platform distribution:', err);
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
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
          title: (tooltipItems: any[]) => {
            return tooltipItems[0].label;
          },
          footer: (tooltipItems: any[]) => {
            const item = tooltipItems[0];
            const total = item.dataset.data.reduce((a: number, b: number) => a + b, 0);
            return `Total: ${total}`;
          }
        },
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        footerFont: {
          size: 12,
          style: 'italic'
        },
        padding: 10,
        displayColors: true,
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true
      }
    },
    scales: selectedChartType === 'bar' ? {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Content Count',
          color: theme === 'dark' ? '#fff' : '#000'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Platform',
          color: theme === 'dark' ? '#fff' : '#000'
        }
      }
    } : undefined
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
        title="Platform Distribution"
        description="Distribution of content across different streaming platforms"
        chartData={chartData}
        chartOptions={options}
        height={height}
        allowedChartTypes={['pie', 'doughnut', 'bar']}
        defaultChartType={selectedChartType}
        onConfigChange={(config) => {
          console.log('PlatformDistribution config changed:', config);
          // Configuration changes like chart type switching are handled by ChartCard
          // Data-related configurations would require API changes
        }}
        className="border-purple-500 dark:border-purple-700"
      />
    </>
  );
};

export default PlatformDistribution;
