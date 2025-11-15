import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Film, Users } from 'lucide-react';
import { analyticsService } from '../services/analytics';
import { useTheme } from '../context/ThemeContext';
import PlatformDistribution from '../components/charts/PlatformDistribution';
import GenreTrends from '../components/charts/GenreTrends';
import LanguageStats from '../components/charts/LanguageStats';
import AgeRatingDistribution from '../components/charts/AgeRatingDistribution';
import YearlyReleases from '../components/charts/YearlyReleases';
import MonthlyReleaseTrend from '../components/charts/MonthlyReleaseTrend';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface DashboardSummary {
  totalContent: number;
  totalPlatforms: number;
  contentThisYear: number;
  totalGenres: number;
  recentContent: Array<{
    _id: string;
    title: string;
    platform: string;
    year: number;
    releaseDate: string;
    createdBy: { _id: string; username: string };
  }>;
}

const Dashboard: React.FC = () => {
  useTheme(); // Keep the hook to ensure context subscription for dark mode
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsService.getDashboardSummary();
      setSummary(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <div className="text-red-500 dark:text-red-400 text-center p-8">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Analytics and insights for OTT content management</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Content"
          value={summary?.totalContent || 0}
          icon={Film}
          color="blue"
        />
        <SummaryCard
          title="Platforms"
          value={summary?.totalPlatforms || 0}
          icon={BarChart3}
          color="green"
        />
        <SummaryCard
          title="This Year"
          value={summary?.contentThisYear || 0}
          icon={TrendingUp}
          color="purple"
        />
        <SummaryCard
          title="Genres"
          value={summary?.totalGenres || 0}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PlatformDistribution height={350} />
        <LanguageStats height={350} />
        <YearlyReleases height={350} />
        <GenreTrends height={350} />
        <AgeRatingDistribution height={350} />
        <MonthlyReleaseTrend height={350} />
      </div>

      {/* Recent Content */}
      {summary?.recentContent && summary.recentContent.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Recently Added Content</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Release Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Added By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {summary.recentContent.slice(0, 5).map((content) => (
                  <tr key={content._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {content.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {content.platform}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {content.releaseDate ? new Date(content.releaseDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {content.createdBy.username}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-100',
    green: 'bg-green-500 text-green-100',
    purple: 'bg-purple-500 text-purple-100',
    orange: 'bg-orange-500 text-orange-100'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
