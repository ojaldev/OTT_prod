import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Download, RefreshCw, Info } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { AnalyticsFilters } from '../types/Chart';
import { analyticsService } from '../services/analytics';
import AnalyticsFilterPanel from '../components/analytics/AnalyticsFilterPanel';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MonthlyDataPoint {
  period: string;
  count: number;
}


// Helper function to enumerate all months between two dates
function enumerateMonths(start: Date, end: Date): string[] {
  const months: string[] = [];
  const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));

  while (d <= last) {
    const y = d.getUTCFullYear();
    const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    months.push(`${y}-${m}`);
    d.setUTCMonth(d.getUTCMonth() + 1);
  }
  return months;
}

// Helper function to normalize series data with zero-fill
function normalizeSeries(
  apiData: MonthlyDataPoint[],
  start: Date,
  end: Date
): { labels: string[]; data: number[] } {
  const byPeriod = new Map(apiData.map(x => [x.period, x.count]));
  const allMonths = enumerateMonths(start, end);
  const normalizedData = allMonths.map(p => byPeriod.get(p) ?? 0);
  
  return {
    labels: allMonths,
    data: normalizedData
  };
}

// Get default date range (last 12 months)
function getDefaultDateRange(): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
  return { start, end };
}


const MonthlyReleaseTrendPage: React.FC = () => {
  const { theme } = useTheme();
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [appliedFilters, setAppliedFilters] = useState<AnalyticsFilters>({});
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    loadChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Loading monthly release trend with filters:', filters);

      // Call the authenticated analytics endpoint
      const response = await analyticsService.getMonthlyReleaseTrend(filters);

      console.log('🔍 Full API Response:', response);

      // Handle response structure: can be an array or an object like { data: [...] }
      let apiData: MonthlyDataPoint[];
      let responseFilters: AnalyticsFilters;

      if (Array.isArray(response)) {
        apiData = response;
        responseFilters = filters; // If response is just data, use original filters
      } else {
        apiData = (response as any)?.data?.data || (response as any)?.data || [];
        responseFilters = (response as any)?.data?.filters || filters;
      }

      console.log('✅ Monthly data points:', apiData);
      console.log('📋 Applied filters:', responseFilters);

      if (!apiData || apiData.length === 0) {
        console.warn('⚠️ No data available for the selected filters');
        setChartData(null);
        setError('No data available for the selected date range and filters');
        setAppliedFilters(responseFilters);
        return;
      }

      // Determine date range for zero-fill
      let startDate: Date;
      let endDate: Date;

      if (filters.startDate && filters.endDate) {
        startDate = new Date(filters.startDate);
        endDate = new Date(filters.endDate);
      } else {
        const defaultRange = getDefaultDateRange();
        startDate = defaultRange.start;
        endDate = defaultRange.end;
      }

      console.log('📅 Date range:', { startDate, endDate });

      // Normalize data with zero-fill
      const { labels, data } = normalizeSeries(apiData, startDate, endDate);

      console.log('📈 Normalized data:', { labels, data });

      // Calculate statistics
      const totalReleases = data.reduce((sum, val) => sum + val, 0);
      const avgPerMonth = totalReleases / data.length;
      const maxMonth = Math.max(...data);
      const minMonth = Math.min(...data);

      console.log('📊 Statistics:', { totalReleases, avgPerMonth, maxMonth, minMonth });

      // Prepare chart data
      const primaryColor = '#8B5CF6'; // Purple

      setChartData({
        labels,
        datasets: [
          {
            label: 'Monthly Releases',
            data,
            borderColor: primaryColor,
            backgroundColor: chartType === 'line' 
              ? `${primaryColor}33` 
              : `${primaryColor}CC`,
            borderWidth: 2,
            fill: chartType === 'line',
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: primaryColor,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: primaryColor,
            pointHoverBorderWidth: 2,
          }
        ],
        statistics: {
          totalReleases,
          avgPerMonth: avgPerMonth.toFixed(1),
          maxMonth,
          minMonth,
          monthsWithData: apiData.length,
          totalMonths: labels.length
        }
      });

      setAppliedFilters(responseFilters);
    } catch (err) {
      console.error('❌ Error loading monthly release trend:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!chartData) return;

    const { labels, datasets } = chartData;
    let csv = 'Month,Releases\n';
    
    labels.forEach((label: string, i: number) => {
      csv += `${label},${datasets[0].data[i]}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-release-trend-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: theme === 'dark' ? '#E5E7EB' : '#374151',
          font: {
            size: 12,
            weight: 'bold' as const
          },
          padding: 20,
          usePointStyle: true
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
        titleColor: theme === 'dark' ? '#F9FAFB' : '#111827',
        bodyColor: theme === 'dark' ? '#E5E7EB' : '#374151',
        borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            const total = chartData.statistics.totalReleases;
            const percentage = ((value / total) * 100).toFixed(1);
            return `Releases: ${value} (${percentage}% of total)`;
          },
          footer: () => {
            const avg = chartData.statistics.avgPerMonth;
            return `Average: ${avg} per month`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
          font: {
            size: 11
          },
          precision: 0
        }
      }
    }
  };

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-purple-700' : 'border-purple-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={`${cardBg} rounded-lg shadow-md p-6 border ${borderColor} mb-6`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${textColor} flex items-center gap-2`}>
                  <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
                    Monthly Release Trend
                  </span>
                </h1>
                <p className={`${textSecondary} mt-1`}>
                  Time-series analysis of content releases with advanced filtering
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowInfo(!showInfo)}
                className={`flex items-center gap-2 ${borderColor} text-purple-600 dark:text-purple-400`}
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">Info</span>
              </Button>
              <Button
                variant="outline"
                onClick={loadChartData}
                className={`flex items-center gap-2 ${borderColor} text-purple-600 dark:text-purple-400`}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Info Panel */}
          {showInfo && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                📊 About This Chart
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Shows monthly content release counts over time</li>
                <li>• Defaults to last 12 months if no date range specified</li>
                <li>• Zero-fills missing months for complete visualization</li>
                <li>• Supports comprehensive filtering across all dimensions</li>
                <li>• Uses authenticated endpoint for full data access</li>
              </ul>
            </div>
          )}
        </div>

        {/* Filter Panel */}
        <AnalyticsFilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          availableFilters={{
            platform: true,
            type: true,
            genre: true,
            language: true,
            year: true,
            yearRange: true,
            dateRange: true,
            ageRating: true,
            source: true,
            duration: true,
            popularity: true,
            dubbing: true,
            seasons: true,
            sorting: true,
          }}
        />

        {/* Statistics Cards */}
        {chartData?.statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`${cardBg} rounded-lg shadow-md p-4 border ${borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className={`text-sm ${textSecondary}`}>Total Releases</span>
              </div>
              <p className={`text-2xl font-bold ${textColor}`}>
                {chartData.statistics.totalReleases}
              </p>
            </div>

            <div className={`${cardBg} rounded-lg shadow-md p-4 border ${borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className={`text-sm ${textSecondary}`}>Avg per Month</span>
              </div>
              <p className={`text-2xl font-bold ${textColor}`}>
                {chartData.statistics.avgPerMonth}
              </p>
            </div>

            <div className={`${cardBg} rounded-lg shadow-md p-4 border ${borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className={`text-sm ${textSecondary}`}>Peak Month</span>
              </div>
              <p className={`text-2xl font-bold ${textColor}`}>
                {chartData.statistics.maxMonth}
              </p>
            </div>

            <div className={`${cardBg} rounded-lg shadow-md p-4 border ${borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className={`text-sm ${textSecondary}`}>Active Months</span>
              </div>
              <p className={`text-2xl font-bold ${textColor}`}>
                {chartData.statistics.monthsWithData}/{chartData.statistics.totalMonths}
              </p>
            </div>
          </div>
        )}

        {/* Chart Card */}
        <div className={`${cardBg} rounded-lg shadow-md p-6 border ${borderColor}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold ${textColor}`}>Release Timeline</h2>
            
            <div className="flex items-center gap-2">
              {/* Chart Type Toggle */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-1 flex">
                <button
                  className={`px-3 py-1 rounded text-sm ${
                    chartType === 'line'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                  onClick={() => setChartType('line')}
                >
                  Line
                </button>
                <button
                  className={`px-3 py-1 rounded text-sm ${
                    chartType === 'bar'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                  onClick={() => setChartType('bar')}
                >
                  Bar
                </button>
              </div>

              <Button
                variant="outline"
                onClick={exportCSV}
                disabled={!chartData}
                className={`flex items-center gap-2 ${borderColor} text-purple-600 dark:text-purple-400`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
            </div>
          </div>

          {/* Chart */}
          <div className="relative" style={{ height: '500px' }}>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <LoadingSpinner />
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
                  <Button onClick={loadChartData} variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {!loading && !error && chartData && (
              <>
                {chartType === 'line' ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <Bar data={chartData} options={chartOptions} />
                )}
              </>
            )}

            {!loading && !error && !chartData && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className={textSecondary}>No data available. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Applied Filters Display */}
        {Object.keys(appliedFilters).length > 0 && (
          <div className={`${cardBg} rounded-lg shadow-md p-4 border ${borderColor} mt-6`}>
            <h3 className={`text-sm font-semibold ${textColor} mb-2`}>Applied Filters:</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(appliedFilters).map(([key, value]) => {
                if (!value || value === '') return null;
                const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
                return (
                  <span
                    key={key}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm"
                  >
                    {key}: {displayValue}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReleaseTrendPage;
