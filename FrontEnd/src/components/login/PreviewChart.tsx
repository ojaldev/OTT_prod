import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
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
  ChartOptions,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { ChartData } from '../../types/Chart';
import { publicAnalyticsService } from '../../services/publicAnalytics';

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

interface PreviewChartProps {
  chartType: 'monthly-release-trend' | 'platform-distribution' | 'language-platform-matrix' | 'genre-trends';
  height?: number;
  title: string;
}

const PreviewChart: React.FC<PreviewChartProps> = ({ chartType, height = 250, title }) => {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  useEffect(() => {
    loadChartData();
  }, [chartType, theme]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      let response: ChartData;

      switch (chartType) {
        case 'monthly-release-trend':
          response = await publicAnalyticsService.getMonthlyReleaseTrend();
          break;
        case 'platform-distribution':
          response = await publicAnalyticsService.getPlatformDistribution();
          break;
        case 'language-platform-matrix':
          response = await publicAnalyticsService.getLanguagePlatformMatrix();
          break;
        case 'genre-trends':
          response = await publicAnalyticsService.getGenreTrends();
          break;
        default:
          throw new Error('Invalid chart type');
      }

      if (response && response.data) {
        setChartData(processChartData(response.data, chartType));
      } else {
        setError('No data available');
      }
    } catch (err) {
      console.error('Error loading chart data:', err);
      setError('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data: any, type: string) => {
    // Different processing based on chart type
    switch (type) {
      case 'monthly-release-trend': {
        // Handle array of period-count objects
        if (Array.isArray(data)) {
          const periods = data.map(item => item.period).slice(0, 12);
          const counts = data.map(item => item.count).slice(0, 12);
          
          return {
            labels: periods,
            datasets: [{
              label: 'Releases',
              data: counts,
              backgroundColor: getColorByIndex(0, 0.7),
              borderColor: getColorByIndex(0, 1),
              borderWidth: 2,
            }],
          };
        }
        return { labels: [], datasets: [] };
      }
      
      case 'platform-distribution': {
        // Handle array of platform-count objects
        if (Array.isArray(data)) {
          const platforms = data.map((item: any) => item._id).slice(0, 8);
          const counts = data.map((item: any) => item.count).slice(0, 8);
          
          return {
            labels: platforms,
            datasets: [{
              data: counts,
              backgroundColor: platforms.map((_: any, i: number) => getColorByIndex(i, 0.7)),
              borderColor: platforms.map((_: any, i: number) => getColorByIndex(i, 1)),
              borderWidth: 1,
            }],
          };
        }
        return { labels: [], datasets: [] };
      }
      
      case 'genre-trends': {
        // Handle array of genre objects with year-count data
        if (Array.isArray(data)) {
          // Extract unique years from all genres
          const allYears = new Set<string>();
          data.forEach((genre: any) => {
            if (genre.data && Array.isArray(genre.data)) {
              genre.data.forEach((yearData: any) => {
                if (yearData.year) allYears.add(yearData.year.toString());
              });
            }
          });
          
          const years = Array.from(allYears).sort();
          const datasets = data.slice(0, 5).map((genre, index) => {
            const yearCounts = years.map(year => {
              const yearData = genre.data?.find((d: any) => d.year.toString() === year);
              return yearData ? yearData.count : 0;
            });
            
            return {
              label: genre._id || `Genre ${index + 1}`,
              data: yearCounts,
              backgroundColor: getColorByIndex(index, 0.7),
              borderColor: getColorByIndex(index, 1),
              borderWidth: 2,
            };
          });
          
          return {
            labels: years,
            datasets: datasets,
          };
        }
        return { labels: [], datasets: [] };
      }
      
      case 'language-platform-matrix': {
        // Handle array of language-platform-count objects
        if (Array.isArray(data)) {
          // Extract unique languages and platforms
          const languages = Array.from(new Set(data.map(item => item.language))).slice(0, 5);
          const platforms = Array.from(new Set(data.map(item => item.platform))).slice(0, 3);
          
          // Create datasets for each platform
          const datasets = platforms.map((platform, index) => {
            const platformData = languages.map(lang => {
              const match = data.find(item => item.platform === platform && item.language === lang);
              return match ? match.count : 0;
            });
            
            return {
              label: platform,
              data: platformData,
              backgroundColor: getColorByIndex(index, 0.7),
              borderColor: getColorByIndex(index, 1),
              borderWidth: 2,
            };
          });
          
          return {
            labels: languages,
            datasets: datasets,
          };
        }
        return { labels: [], datasets: [] };
      }
      
      default:
        return { labels: [], datasets: [] };
    }
  };

  const getColorByIndex = (index: number, alpha: number = 1) => {
    const colors = [
      `rgba(54, 162, 235, ${alpha})`,
      `rgba(255, 99, 132, ${alpha})`,
      `rgba(255, 206, 86, ${alpha})`,
      `rgba(75, 192, 192, ${alpha})`,
      `rgba(153, 102, 255, ${alpha})`,
      `rgba(255, 159, 64, ${alpha})`,
      `rgba(199, 199, 199, ${alpha})`,
      `rgba(83, 102, 255, ${alpha})`,
      `rgba(40, 159, 64, ${alpha})`,
      `rgba(210, 199, 199, ${alpha})`,
    ];
    return colors[index % colors.length];
  };

  const getChartOptions = (): ChartOptions<any> => {
    const baseOptions: ChartOptions<any> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartType !== 'monthly-release-trend',
          position: 'top' as const,
          labels: {
            color: textColor,
            font: {
              size: 11
            }
          }
        },
        title: {
          display: false
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColor,
            font: {
              size: 10
            },
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            color: gridColor
          }
        },
        y: {
          ticks: {
            color: textColor,
            font: {
              size: 10
            }
          },
          grid: {
            color: gridColor
          }
        }
      }
    };

    // Customize based on chart type
    if (chartType === 'platform-distribution') {
      return {}; // For pie chart, no scales needed
    }

    return baseOptions;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error || !chartData) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500 dark:text-red-400 text-sm">
            {error || 'No data available'}
          </p>
        </div>
      );
    }

    switch (chartType) {
      case 'platform-distribution':
        return <Pie data={chartData} options={getChartOptions()} />;
      case 'monthly-release-trend':
      case 'genre-trends':
        return <Line data={chartData} options={getChartOptions()} />;
      case 'language-platform-matrix':
        return <Bar data={chartData} options={getChartOptions()} />;
      default:
        return null;
    }
  };

  return (
    <div className={`rounded-lg shadow-md overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
      </div>
      <div className="p-4" style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
      <div className={`p-3 bg-opacity-50 text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
          Sign up for full analytics access
        </p>
      </div>
    </div>
  );
};

export default PreviewChart;
