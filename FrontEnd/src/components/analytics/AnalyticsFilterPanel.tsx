import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { AnalyticsFilters } from '../../types/Chart';
import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';

interface AnalyticsFilterPanelProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  availableFilters?: {
    platform?: boolean;
    type?: boolean;
    genre?: boolean;
    language?: boolean;
    year?: boolean;
    yearRange?: boolean;
    dateRange?: boolean;
    ageRating?: boolean;
    source?: boolean;
    duration?: boolean;
    popularity?: boolean;
    dubbing?: boolean;
    seasons?: boolean;
    sorting?: boolean;
    pagination?: boolean;
    grouping?: boolean;
  };
  compact?: boolean;
}

const AnalyticsFilterPanel: React.FC<AnalyticsFilterPanelProps> = ({
  filters,
  onFiltersChange,
  availableFilters = {},
  compact = false
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [internalFilters, setInternalFilters] = useState<AnalyticsFilters>(filters);

  const debouncedFilters = useDebounce(internalFilters, 500);

  useEffect(() => {
    onFiltersChange(debouncedFilters);
  }, [debouncedFilters]);

  // Sync internal state if external filters change (e.g., from URL params)
  useEffect(() => {
    setInternalFilters(filters);
  }, [filters]);

  // Enable all filters by default if not specified
  const enabled = {
    platform: availableFilters.platform !== false,
    type: availableFilters.type !== false,
    genre: availableFilters.genre !== false,
    language: availableFilters.language !== false,
    year: availableFilters.year !== false,
    yearRange: availableFilters.yearRange !== false,
    dateRange: availableFilters.dateRange !== false,
    ageRating: availableFilters.ageRating !== false,
    source: availableFilters.source !== false,
    duration: availableFilters.duration !== false,
    popularity: availableFilters.popularity !== false,
    dubbing: availableFilters.dubbing !== false,
    seasons: availableFilters.seasons !== false,
    sorting: availableFilters.sorting !== false,
    pagination: availableFilters.pagination !== false,
    grouping: availableFilters.grouping !== false,
  };

  const handleFilterChange = (key: keyof AnalyticsFilters, value: any) => {
    setInternalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiSelectChange = (key: keyof AnalyticsFilters, value: string) => {
    const newValues = value ? value.split(',').map(v => v.trim()).filter(v => v) : [];
    setInternalFilters(prev => ({ ...prev, [key]: newValues.length > 0 ? newValues : undefined }));
  };

  const clearFilters = () => {
    setInternalFilters({});
    onFiltersChange({}); // Also clear immediately
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

  const activeFilterCount = Object.values(filters).filter(v => 
    v !== undefined && v !== null && v !== '' && 
    !(Array.isArray(v) && v.length === 0)
  ).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Analytics Filters
          </h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Platform Filter */}
        {enabled.platform && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Platform
            </label>
            <Input
              type="text"
              placeholder="Netflix, Prime Video"
              value={Array.isArray(internalFilters.platform) ? internalFilters.platform.join(', ') : (internalFilters.platform || '')}
              onChange={(e) => handleMultiSelectChange('platform', e.target.value)}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Comma-separated for multiple
            </p>
          </div>
        )}

        {/* Type/Format Filter */}
        {enabled.type && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content Type
            </label>
            <Input
              type="text"
              placeholder="Movie, Series"
              value={Array.isArray(internalFilters.type) ? internalFilters.type.join(', ') : (internalFilters.type || '')}
              onChange={(e) => handleMultiSelectChange('type', e.target.value)}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Comma-separated for multiple
            </p>
          </div>
        )}

        {/* Genre Filter */}
        {enabled.genre && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Genre
            </label>
            <Input
              type="text"
              placeholder="Action, Drama"
              value={Array.isArray(internalFilters.genre) ? internalFilters.genre.join(', ') : (internalFilters.genre || '')}
              onChange={(e) => handleMultiSelectChange('genre', e.target.value)}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Comma-separated for multiple
            </p>
          </div>
        )}

        {/* Language Filter */}
        {enabled.language && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language
            </label>
            <Input
              type="text"
              placeholder="Hindi, English"
              value={Array.isArray(internalFilters.language) ? internalFilters.language.join(', ') : (internalFilters.language || '')}
              onChange={(e) => handleMultiSelectChange('language', e.target.value)}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Comma-separated for multiple
            </p>
          </div>
        )}

        {/* Year Filter (Single or Range) */}
        {enabled.year && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year
            </label>
            <Input
              type="text"
              placeholder="2023 or 2020-2023"
              value={internalFilters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Single, range, or comma-separated
            </p>
          </div>
        )}

        {/* Age Rating Filter */}
        {enabled.ageRating && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Age Rating
            </label>
            <Input
              type="text"
              placeholder="U, U/A 13+"
              value={Array.isArray(internalFilters.ageRating) ? internalFilters.ageRating.join(', ') : (internalFilters.ageRating || '')}
              onChange={(e) => handleMultiSelectChange('ageRating', e.target.value)}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Comma-separated for multiple
            </p>
          </div>
        )}

        {/* Source Filter */}
        {enabled.source && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Source
            </label>
            <Input
              type="text"
              placeholder="In-House, Commissioned"
              value={Array.isArray(internalFilters.source) ? internalFilters.source.join(', ') : (internalFilters.source || '')}
              onChange={(e) => handleMultiSelectChange('source', e.target.value)}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Comma-separated for multiple
            </p>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {(showAdvanced || compact) && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Advanced Filters
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Year Range */}
            {enabled.yearRange && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Year
                  </label>
                  <Select
                    value={internalFilters.startYear || ''}
                    onChange={(value) => handleFilterChange('startYear', value)}
                    placeholder="From Year"
                    options={years.map(year => ({ value: year.toString(), label: year.toString() }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Year
                  </label>
                  <Select
                    value={internalFilters.endYear || ''}
                    onChange={(value) => handleFilterChange('endYear', value)}
                    placeholder="To Year"
                    options={years.map(year => ({ value: year.toString(), label: year.toString() }))}
                  />
                </div>
              </>
            )}

            {/* Date Range */}
            {enabled.dateRange && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={internalFilters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={internalFilters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* Duration Range */}
            {enabled.duration && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Duration (hours)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="0.5"
                    value={internalFilters.minDuration || ''}
                    onChange={(e) => handleFilterChange('minDuration', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Duration (hours)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="3.0"
                    value={internalFilters.maxDuration || ''}
                    onChange={(e) => handleFilterChange('maxDuration', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* Popularity Range */}
            {enabled.popularity && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Popularity
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="3"
                    value={internalFilters.minPopularity || ''}
                    onChange={(e) => handleFilterChange('minPopularity', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Popularity
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="10"
                    value={internalFilters.maxPopularity || ''}
                    onChange={(e) => handleFilterChange('maxPopularity', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* Dubbing Filters */}
            {enabled.dubbing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Has Dubbing
                  </label>
                  <Select
                    value={internalFilters.hasDubbing === undefined ? '' : internalFilters.hasDubbing.toString()}
                    onChange={(value) => handleFilterChange('hasDubbing', value === '' ? undefined : value === 'true')}
                    placeholder="Any"
                    options={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dubbing Language
                  </label>
                  <Input
                    type="text"
                    placeholder="tamil, telugu"
                    value={Array.isArray(internalFilters.dubbingLanguage) ? internalFilters.dubbingLanguage.join(', ') : (internalFilters.dubbingLanguage || '')}
                    onChange={(e) => handleMultiSelectChange('dubbingLanguage', e.target.value)}
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Comma-separated for multiple
                  </p>
                </div>
              </>
            )}

            {/* Seasons Range */}
            {enabled.seasons && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Seasons
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={internalFilters.minSeasons || ''}
                    onChange={(e) => handleFilterChange('minSeasons', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Seasons
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="5"
                    value={internalFilters.maxSeasons || ''}
                    onChange={(e) => handleFilterChange('maxSeasons', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* Sorting */}
            {enabled.sorting && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort By
                  </label>
                  <Select
                    value={internalFilters.sortBy || ''}
                    onChange={(value) => handleFilterChange('sortBy', value)}
                    placeholder="Default"
                    options={[
                      { value: 'count', label: 'Count' },
                      { value: 'avgDuration', label: 'Average Duration' },
                      { value: 'year', label: 'Year' },
                      { value: 'platform', label: 'Platform' },
                      { value: 'genre', label: 'Genre' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort Order
                  </label>
                  <Select
                    value={internalFilters.sortOrder || ''}
                    onChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
                    placeholder="Descending"
                    options={[
                      { value: 'desc', label: 'Descending' },
                      { value: 'asc', label: 'Ascending' }
                    ]}
                  />
                </div>
              </>
            )}

            {/* Pagination */}
            {enabled.pagination && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Page
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={internalFilters.page || ''}
                    onChange={(e) => handleFilterChange('page', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Limit
                  </label>
                  <Select
                    value={internalFilters.limit?.toString() || ''}
                    onChange={(value) => handleFilterChange('limit', value ? parseInt(value) : undefined)}
                    placeholder="100"
                    options={[
                      { value: '10', label: '10' },
                      { value: '25', label: '25' },
                      { value: '50', label: '50' },
                      { value: '100', label: '100' },
                      { value: '250', label: '250' },
                      { value: '500', label: '500' },
                      { value: '1000', label: '1000' }
                    ]}
                  />
                </div>
              </>
            )}

            {/* Grouping */}
            {enabled.grouping && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Group By
                  </label>
                  <Select
                    value={internalFilters.groupBy || ''}
                    onChange={(value) => handleFilterChange('groupBy', value)}
                    placeholder="None"
                    options={[
                      { value: 'platform', label: 'Platform' },
                      { value: 'genre', label: 'Genre' },
                      { value: 'language', label: 'Language' },
                      { value: 'year', label: 'Year' },
                      { value: 'type', label: 'Type' },
                      { value: 'ageRating', label: 'Age Rating' },
                      { value: 'source', label: 'Source' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Secondary Group By
                  </label>
                  <Select
                    value={internalFilters.secondaryGroupBy || ''}
                    onChange={(value) => handleFilterChange('secondaryGroupBy', value)}
                    placeholder="None"
                    options={[
                      { value: 'platform', label: 'Platform' },
                      { value: 'genre', label: 'Genre' },
                      { value: 'language', 'label': 'Language' },
                      { value: 'year', label: 'Year' },
                      { value: 'type', label: 'Type' },
                      { value: 'ageRating', label: 'Age Rating' },
                      { value: 'source', label: 'Source' }
                    ]}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {Object.entries(internalFilters).map(([key, value]) => {
              if (value === undefined || value === null || value === '' || 
                  (Array.isArray(value) && value.length === 0)) {
                return null;
              }
              
              const displayValue = Array.isArray(value) 
                ? value.join(', ') 
                : typeof value === 'boolean'
                  ? value ? 'Yes' : 'No'
                  : value.toString();

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300"
                >
                  <span className="font-semibold">{key}:</span>
                  <span className="ml-1">{displayValue}</span>
                  <button
                    onClick={() => handleFilterChange(key as keyof AnalyticsFilters, undefined)}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-bold"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsFilterPanel;
