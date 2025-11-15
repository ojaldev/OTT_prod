import React, { useState } from 'react';
import { AnalyticsFilters } from '../types/Chart';
import AnalyticsFilterPanel from '../components/analytics/AnalyticsFilterPanel';
import PlatformDistribution from '../components/charts/PlatformDistribution';
import GenreTrends from '../components/charts/GenreTrends';
import YearlyReleases from '../components/charts/YearlyReleases';
import MonthlyReleaseTrend from '../components/charts/MonthlyReleaseTrend';
import PlatformGrowth from '../components/charts/PlatformGrowth';
import DubbingAnalysis from '../components/charts/DubbingAnalysis';
import TopDubbedLanguages from '../components/charts/TopDubbedLanguages';
import AgeRatingDistribution from '../components/charts/AgeRatingDistribution';
import GenrePlatformHeatmap from '../components/charts/GenrePlatformHeatmap';
import LanguagePlatformMatrix from '../components/charts/LanguagePlatformMatrix';

const AnalyticsDashboard: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Comprehensive analytics with rich data slicing across multiple parameters
          </p>
        </div>

        {/* Global Filter Panel */}
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
            pagination: true,
            grouping: true,
          }}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Distribution */}
          <div className="lg:col-span-1">
            <PlatformDistribution filters={filters} height={350} />
          </div>

          {/* Yearly Releases */}
          <div className="lg:col-span-1">
            <YearlyReleases filters={filters} height={350} />
          </div>

          {/* Genre Trends */}
          <div className="lg:col-span-2">
            <GenreTrends filters={filters} height={400} />
          </div>

          {/* Monthly Release Trend */}
          <div className="lg:col-span-2">
            <MonthlyReleaseTrend filters={filters} height={350} />
          </div>

          {/* Platform Growth */}
          <div className="lg:col-span-2">
            <PlatformGrowth filters={filters} height={400} />
          </div>

          {/* Age Rating Distribution */}
          <div className="lg:col-span-1">
            <AgeRatingDistribution filters={filters} height={350} />
          </div>

          {/* Dubbing Analysis */}
          <div className="lg:col-span-1">
            <DubbingAnalysis filters={filters} height={350} />
          </div>

          {/* Top Dubbed Languages */}
          <div className="lg:col-span-2">
            <TopDubbedLanguages filters={filters} height={350} />
          </div>

          {/* Genre Platform Heatmap */}
          <div className="lg:col-span-2">
            <GenrePlatformHeatmap filters={filters} height={500} />
          </div>

          {/* Language Platform Matrix */}
          <div className="lg:col-span-2">
            <LanguagePlatformMatrix filters={filters} height={500} />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 Filter Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
            <li>
              <strong>Multiple Values:</strong> Use comma-separated values for platform, genre, language, etc. 
              (e.g., "Netflix, Prime Video")
            </li>
            <li>
              <strong>Year Ranges:</strong> Use the Year field with formats like "2023", "2020-2023", or "2020,2021,2023"
            </li>
            <li>
              <strong>Advanced Filters:</strong> Click "Show Advanced" to access duration, popularity, dubbing, and other filters
            </li>
            <li>
              <strong>Server-Side Filtering:</strong> All filters are processed on the server for optimal performance
            </li>
            <li>
              <strong>Active Filters:</strong> View and remove active filters from the tags displayed below the filter panel
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
