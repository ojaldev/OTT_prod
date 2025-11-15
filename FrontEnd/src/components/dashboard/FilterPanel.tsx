import React from 'react';
import { useData } from '../../context/DataContext';
import { useDebounce } from '../../hooks/useDebounce';
import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';
import { PLATFORMS, GENRES, LANGUAGES, AGE_RATINGS } from '../../utils/constants';

const FilterPanel: React.FC = () => {
  const { state, setFilters } = useData();
  const { filters } = state;

  const debouncedSearch = useDebounce(filters.search || '', 500);

  React.useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, filters.search, setFilters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      platform: '',
      genre: '',
      language: '',
      year: '',
      search: '',
      ageRating: '',
      source: ''
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
        >
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="col-span-1 md:col-span-2">
          <Input
            type="text"
            placeholder="Search content..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Platform Filter */}
        <Select
          value={filters.platform || ''}
          onChange={(value) => handleFilterChange('platform', value)}
          placeholder="All Platforms"
          options={PLATFORMS.map(platform => ({ value: platform, label: platform }))}
        />

        {/* Genre Filter */}
        <Select
          value={filters.genre || ''}
          onChange={(value) => handleFilterChange('genre', value)}
          placeholder="All Genres"
          options={GENRES.map(genre => ({ value: genre, label: genre }))}
        />

        {/* Language Filter */}
        <Select
          value={filters.language || ''}
          onChange={(value) => handleFilterChange('language', value)}
          placeholder="All Languages"
          options={LANGUAGES.map(language => ({ value: language, label: language }))}
        />

        {/* Year Filter */}
        <Select
          value={filters.year || ''}
          onChange={(value) => handleFilterChange('year', value)}
          placeholder="All Years"
          options={years.map(year => ({ value: year.toString(), label: year.toString() }))}
        />

        {/* Age Rating Filter */}
        <Select
          value={filters.ageRating || ''}
          onChange={(value) => handleFilterChange('ageRating', value)}
          placeholder="All Ratings"
          options={AGE_RATINGS.map(rating => ({ value: rating, label: rating }))}
        />
      </div>

      {/* Active Filters Display */}
      {Object.entries(filters).some(([_, value]) => value) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => 
              value ? (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300"
                >
                  {key}: {value}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    ×
                  </button>
                </span>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
