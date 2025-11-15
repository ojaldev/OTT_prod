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

interface LanguageStatsProps {
  filters?: AnalyticsFilters;
  height?: number;
}

const LanguageStats: React.FC<LanguageStatsProps> = ({ 
  filters, 
  height = 300 
}) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('LanguageStats: Filters changed, reloading data', filters);
    loadChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]); // Re-fetch data when filters change

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading language stats with filters:', filters);
      
      // Pass filters directly to API for server-side filtering
      const response = await analyticsService.getLanguageStats(filters);
      const resp: any = response;
      
      console.log('🔍 LanguageStats - Full API Response:', resp);
      console.log('🔍 LanguageStats - Is Array?', Array.isArray(resp));
      
      // Handle different response structures
      // Prefer response.data.data (success envelope), then response.data if array, otherwise []
      const payload = Array.isArray(resp)
        ? resp
        : (resp?.data?.data ?? resp?.data ?? []);

      const items: any[] = Array.isArray(payload)
        ? payload
        : (Array.isArray((payload as any)?.data) ? (payload as any).data : []);
      
      if (!items || items.length === 0) {
        console.warn('⚠️ LanguageStats - No data available for filters:', filters);
        setChartData(null);
        setError('No data available for the selected filters');
        return;
      }
      
      console.log('✅ LanguageStats - Using data:', items);
      console.log('LanguageStats: Data received from server', {
        dataCount: items.length
      });
      
      // API returns objects like { language: 'Hindi', count: 941 }
      const labels = items.map((item: any) => item.language ?? item._id ?? item.name ?? 'Unknown');
      const data = items.map((item: any) => (typeof item.count === 'number' ? item.count : (item.value ?? 0)));
      
      setChartData({
        labels,
        datasets: [{
          label: 'Content Count',
          data,
          backgroundColor: '#36A2EB',
          borderColor: '#36A2EB',
          borderWidth: 1
        }]
      });
    } catch (err) {
      console.error('Error loading language stats:', err);
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
          text: 'Count'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Language'
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
        title="Language Statistics"
        description="Distribution of content across different languages. This chart shows the count of content available in each language."
        chartData={chartData}
        chartOptions={options}
        height={height}
        allowedChartTypes={['bar', 'pie', 'doughnut']}
        defaultChartType="bar"
        onConfigChange={(config) => {
          handleConfigChange(config);
        }}
        className="p-6 border-purple-500 dark:border-purple-700"
      />
    </>
  );
};

export default LanguageStats;
