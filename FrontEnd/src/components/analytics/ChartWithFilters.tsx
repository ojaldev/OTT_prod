import React, { useState } from 'react';
import { AnalyticsFilters } from '../../types/Chart';
import AnalyticsFilterPanel from './AnalyticsFilterPanel';

// Import chart components
import PlatformDistribution from '../charts/PlatformDistribution';
import GenreTrends from '../charts/GenreTrends';
import LanguageStats from '../charts/LanguageStats';
import YearlyReleases from '../charts/YearlyReleases';
import MonthlyReleaseTrend from '../charts/MonthlyReleaseTrend';
import PlatformGrowth from '../charts/PlatformGrowth';
import GenrePlatformHeatmap from '../charts/GenrePlatformHeatmap';
import LanguagePlatformMatrix from '../charts/LanguagePlatformMatrix';
import DurationByFormatGenre from '../charts/DurationByFormatGenre';
import DubbingAnalysis from '../charts/DubbingAnalysis';
import TopDubbedLanguages from '../charts/TopDubbedLanguages';
import AgeRatingDistribution from '../charts/AgeRatingDistribution';

type ChartType = 
  | 'platformDistribution'
  | 'genreTrends'
  | 'languageStats'
  | 'yearlyReleases'
  | 'monthlyReleaseTrend'
  | 'platformGrowth'
  | 'genrePlatformHeatmap'
  | 'languagePlatformMatrix'
  | 'durationByFormatGenre'
  | 'dubbingAnalysis'
  | 'topDubbedLanguages'
  | 'ageRatingDistribution';

interface ChartWithFiltersProps {
  chartType: ChartType;
  initialFilters?: AnalyticsFilters;
  showFilters?: boolean;
  height?: number;
}

// Define available filters for each chart type
const chartFilterConfig: Record<ChartType, any> = {
  platformDistribution: {
    platform: true,
    type: true,
    genre: true,
    language: true,
    year: true,
    yearRange: true,
    ageRating: true,
    source: true,
  },
  genreTrends: {
    platform: true,
    type: true,
    genre: true,
    language: true,
    year: true,
    yearRange: true,
    ageRating: true,
    source: true,
  },
  languageStats: {
    platform: true,
    type: true,
    genre: true,
    language: true,
    year: true,
    yearRange: true,
    ageRating: true,
    source: true,
  },
  yearlyReleases: {
    platform: true,
    type: true,
    genre: true,
    language: true,
    year: true,
    yearRange: true,
    ageRating: true,
    source: true,
  },
  monthlyReleaseTrend: {
    platform: true,
    type: true,
    genre: true,
    language: true,
    year: true,
    yearRange: true,
    dateRange: true,
    ageRating: true,
    source: true,
  },
  platformGrowth: {
    platform: true,
    type: true,
    genre: true,
    language: true,
    year: true,
    yearRange: true,
    ageRating: true,
    source: true,
  },
  genrePlatformHeatmap: {
    platform: true,
    type: true,
    genre: true,
    language: true,
    year: true,
    yearRange: true,
    ageRating: true,
    source: true,
  },
  languagePlatformMatrix: {
    platform: true,
    type: true,
    genre: true,
    language: true,
    year: true,
    yearRange: true,
    ageRating: true,
    source: true,
  },
  durationByFormatGenre: {
    platform: true,
    type: true,
    genre: true,
    language: true,
    year: true,
    yearRange: true,
    duration: true,
    ageRating: true,
    source: true,
  },
  dubbingAnalysis: {
    platform: true,
    type: true,
    genre: true,
    language: true,
    year: true,
    yearRange: true,
    dubbing: true,
    ageRating: true,
    source: true,
  },
  topDubbedLanguages: {
    platform: true,
    type: true,
    genre: true,
    language: true,
    year: true,
    yearRange: true,
    dubbing: true,
    ageRating: true,
    source: true,
    sorting: true,
    pagination: true,
  },
  ageRatingDistribution: {
    platform: true,
    type: true,
    genre: true,
    language: true,
    year: true,
    yearRange: true,
    ageRating: true,
    source: true,
  },
};

const ChartWithFilters: React.FC<ChartWithFiltersProps> = ({
  chartType,
  initialFilters = {},
  showFilters = true,
  height = 400
}) => {
  const [filters, setFilters] = useState<AnalyticsFilters>(initialFilters);

  const renderChart = () => {
    const commonProps = { filters, height };

    switch (chartType) {
      case 'platformDistribution':
        return <PlatformDistribution {...commonProps} />;
      case 'genreTrends':
        return <GenreTrends {...commonProps} />;
      case 'languageStats':
        return <LanguageStats {...commonProps} />;
      case 'yearlyReleases':
        return <YearlyReleases {...commonProps} />;
      case 'monthlyReleaseTrend':
        return <MonthlyReleaseTrend {...commonProps} />;
      case 'platformGrowth':
        return <PlatformGrowth {...commonProps} />;
      case 'genrePlatformHeatmap':
        return <GenrePlatformHeatmap {...commonProps} />;
      case 'languagePlatformMatrix':
        return <LanguagePlatformMatrix {...commonProps} />;
      case 'durationByFormatGenre':
        return <DurationByFormatGenre {...commonProps} />;
      case 'dubbingAnalysis':
        return <DubbingAnalysis {...commonProps} />;
      case 'topDubbedLanguages':
        return <TopDubbedLanguages {...commonProps} />;
      case 'ageRatingDistribution':
        return <AgeRatingDistribution {...commonProps} />;
      default:
        return <div>Unknown chart type</div>;
    }
  };

  return (
    <div className="space-y-6">
      {showFilters && (
        <AnalyticsFilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          availableFilters={chartFilterConfig[chartType]}
        />
      )}
      {renderChart()}
    </div>
  );
};

export default ChartWithFilters;
