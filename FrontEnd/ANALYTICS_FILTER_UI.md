# Analytics Filter UI Components

## Overview
Comprehensive UI components for filtering analytics charts with support for all available API parameters. These components provide users with intuitive controls to slice and dice data across multiple dimensions.

## Components Created

### 1. AnalyticsFilterPanel
**Location:** `src/components/analytics/AnalyticsFilterPanel.tsx`

A comprehensive filter panel component that supports all analytics filter parameters.

#### Features
- ✅ **30+ Filter Parameters** - Support for all AnalyticsFilters interface parameters
- ✅ **Configurable Filters** - Enable/disable specific filters per chart type
- ✅ **Basic & Advanced Modes** - Toggle between simple and advanced filtering
- ✅ **Multi-Value Support** - Comma-separated input for arrays (platform, genre, language, etc.)
- ✅ **Active Filter Display** - Visual tags showing active filters with remove buttons
- ✅ **Dark Mode Support** - Full theme support with Tailwind classes
- ✅ **Responsive Design** - Grid layout adapts to screen size

#### Props
```typescript
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
```

#### Usage Example
```tsx
import AnalyticsFilterPanel from '../components/analytics/AnalyticsFilterPanel';

const MyComponent = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  return (
    <AnalyticsFilterPanel
      filters={filters}
      onFiltersChange={setFilters}
      availableFilters={{
        platform: true,
        genre: true,
        year: true,
        yearRange: true,
      }}
    />
  );
};
```

### 2. ChartWithFilters
**Location:** `src/components/analytics/ChartWithFilters.tsx`

A wrapper component that combines any chart with its appropriate filter panel.

#### Features
- ✅ **Pre-configured Filters** - Each chart type has optimal filter configuration
- ✅ **Unified Interface** - Consistent API across all chart types
- ✅ **Optional Filters** - Show/hide filter panel as needed
- ✅ **State Management** - Built-in filter state handling

#### Props
```typescript
interface ChartWithFiltersProps {
  chartType: ChartType;
  initialFilters?: AnalyticsFilters;
  showFilters?: boolean;
  height?: number;
}
```

#### Supported Chart Types
- `platformDistribution`
- `genreTrends`
- `languageStats`
- `yearlyReleases`
- `monthlyReleaseTrend`
- `platformGrowth`
- `genrePlatformHeatmap`
- `languagePlatformMatrix`
- `durationByFormatGenre`
- `dubbingAnalysis`
- `topDubbedLanguages`
- `ageRatingDistribution`

#### Usage Example
```tsx
import ChartWithFilters from '../components/analytics/ChartWithFilters';

const MyPage = () => {
  return (
    <ChartWithFilters
      chartType="platformDistribution"
      initialFilters={{ year: '2023' }}
      showFilters={true}
      height={400}
    />
  );
};
```

### 3. AnalyticsDashboard
**Location:** `src/pages/AnalyticsDashboard.tsx`

A complete analytics dashboard page demonstrating all charts with a global filter panel.

#### Features
- ✅ **Global Filtering** - Single filter panel controls all charts
- ✅ **Responsive Grid** - Charts arranged in responsive grid layout
- ✅ **Filter Tips** - Built-in user guidance
- ✅ **Dark Mode** - Full theme support

#### Usage
Import and use as a page component:
```tsx
import AnalyticsDashboard from '../pages/AnalyticsDashboard';

// In your router
<Route path="/analytics" element={<AnalyticsDashboard />} />
```

## Filter Parameters Reference

### Basic Filters (Always Visible)

| Filter | Type | Input Type | Example |
|--------|------|------------|---------|
| **Platform** | `string \| string[]` | Text Input | `Netflix, Prime Video` |
| **Content Type** | `string \| string[]` | Text Input | `Movie, Series` |
| **Genre** | `string \| string[]` | Text Input | `Action, Drama` |
| **Language** | `string \| string[]` | Text Input | `Hindi, English` |
| **Year** | `string` | Text Input | `2023` or `2020-2023` |
| **Age Rating** | `string \| string[]` | Text Input | `U, U/A 13+` |
| **Source** | `string \| string[]` | Text Input | `In-House, Commissioned` |

### Advanced Filters (Toggle to Show)

#### Year/Date Range
| Filter | Type | Input Type | Example |
|--------|------|------------|---------|
| **Start Year** | `string` | Select | `2020` |
| **End Year** | `string` | Select | `2023` |
| **Start Date** | `string` | Date Input | `2023-01-01` |
| **End Date** | `string` | Date Input | `2023-12-31` |

#### Duration Range
| Filter | Type | Input Type | Example |
|--------|------|------------|---------|
| **Min Duration** | `number` | Number Input | `1.5` (hours) |
| **Max Duration** | `number` | Number Input | `3.0` (hours) |

#### Popularity Range
| Filter | Type | Input Type | Example |
|--------|------|------------|---------|
| **Min Popularity** | `number` | Number Input | `3` |
| **Max Popularity** | `number` | Number Input | `10` |

#### Dubbing Filters
| Filter | Type | Input Type | Example |
|--------|------|------------|---------|
| **Has Dubbing** | `boolean` | Select (Yes/No) | `Yes` |
| **Dubbing Language** | `string \| string[]` | Text Input | `tamil, telugu` |

#### Seasons Range (for Series)
| Filter | Type | Input Type | Example |
|--------|------|------------|---------|
| **Min Seasons** | `number` | Number Input | `2` |
| **Max Seasons** | `number` | Number Input | `5` |

#### Sorting & Pagination
| Filter | Type | Input Type | Example |
|--------|------|------------|---------|
| **Sort By** | `string` | Select | `count`, `avgDuration` |
| **Sort Order** | `'asc' \| 'desc'` | Select | `desc` |
| **Page** | `number` | Number Input | `1` |
| **Limit** | `number` | Select | `100` |

#### Grouping (Advanced Analytics)
| Filter | Type | Input Type | Example |
|--------|------|------------|---------|
| **Group By** | `string` | Select | `platform`, `genre` |
| **Secondary Group By** | `string` | Select | `year`, `type` |

## Chart-Specific Filter Configurations

### Platform Distribution
**Recommended Filters:**
- Platform ✅
- Type ✅
- Genre ✅
- Language ✅
- Year/Year Range ✅
- Age Rating ✅
- Source ✅

**Example:**
```tsx
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
    ageRating: true,
    source: true,
  }}
/>
```

### Genre Trends
**Recommended Filters:**
- Platform ✅
- Type ✅
- Genre ✅
- Language ✅
- Year/Year Range ✅
- Age Rating ✅
- Source ✅

### Dubbing Analysis
**Recommended Filters:**
- Platform ✅
- Type ✅
- Genre ✅
- Language ✅
- Year/Year Range ✅
- **Dubbing Filters** ✅ (Has Dubbing, Dubbing Language)
- Age Rating ✅
- Source ✅

**Example:**
```tsx
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
    dubbing: true, // Enables Has Dubbing + Dubbing Language
    ageRating: true,
    source: true,
  }}
/>
```

### Duration Analysis
**Recommended Filters:**
- Platform ✅
- Type ✅
- Genre ✅
- Language ✅
- Year/Year Range ✅
- **Duration Range** ✅ (Min/Max Duration)
- Age Rating ✅
- Source ✅

**Example:**
```tsx
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
    duration: true, // Enables Min/Max Duration
    ageRating: true,
    source: true,
  }}
/>
```

### Top Dubbed Languages
**Recommended Filters:**
- Platform ✅
- Type ✅
- Genre ✅
- Language ✅
- Year/Year Range ✅
- Dubbing Filters ✅
- Age Rating ✅
- Source ✅
- **Sorting** ✅ (Sort By, Sort Order)
- **Pagination** ✅ (Page, Limit)

**Example:**
```tsx
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
    dubbing: true,
    ageRating: true,
    source: true,
    sorting: true,    // Enables Sort By + Sort Order
    pagination: true, // Enables Page + Limit
  }}
/>
```

## User Guide

### How to Use Multi-Value Filters

Multi-value filters (Platform, Genre, Language, etc.) accept comma-separated values:

```
✅ Correct:
- "Netflix, Prime Video"
- "Action, Drama, Thriller"
- "Hindi, English, Tamil"

❌ Incorrect:
- "Netflix;Prime Video" (use comma, not semicolon)
- "Action|Drama" (use comma, not pipe)
```

### Year Filter Formats

The Year filter supports multiple formats:

```
✅ Single Year:
- "2023"

✅ Year Range:
- "2020-2023"

✅ Multiple Years:
- "2020,2021,2023"
```

### Date Range Filters

Use the Start Date and End Date filters for precise date filtering:

```
✅ Format: YYYY-MM-DD
- Start Date: "2023-01-01"
- End Date: "2023-12-31"
```

### Duration Filters

Duration is specified in hours:

```
✅ Examples:
- Min Duration: 1.5 (90 minutes)
- Max Duration: 3.0 (3 hours)
```

### Sorting and Pagination

Control result ordering and pagination:

```
✅ Sort By: count, avgDuration, year, platform, genre
✅ Sort Order: asc (ascending), desc (descending)
✅ Page: 1, 2, 3, ...
✅ Limit: 10, 25, 50, 100, 250, 500, 1000
```

## Integration Examples

### Example 1: Simple Chart with Basic Filters
```tsx
import React, { useState } from 'react';
import { AnalyticsFilters } from '../types/Chart';
import AnalyticsFilterPanel from '../components/analytics/AnalyticsFilterPanel';
import PlatformDistribution from '../components/charts/PlatformDistribution';

const SimpleDashboard = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  return (
    <div>
      <AnalyticsFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        availableFilters={{
          platform: true,
          genre: true,
          year: true,
        }}
      />
      <PlatformDistribution filters={filters} />
    </div>
  );
};
```

### Example 2: Multiple Charts with Shared Filters
```tsx
import React, { useState } from 'react';
import { AnalyticsFilters } from '../types/Chart';
import AnalyticsFilterPanel from '../components/analytics/AnalyticsFilterPanel';
import PlatformDistribution from '../components/charts/PlatformDistribution';
import GenreTrends from '../components/charts/GenreTrends';
import YearlyReleases from '../components/charts/YearlyReleases';

const MultiChartDashboard = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  return (
    <div>
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
        }}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <PlatformDistribution filters={filters} />
        <YearlyReleases filters={filters} />
        <GenreTrends filters={filters} className="col-span-2" />
      </div>
    </div>
  );
};
```

### Example 3: Chart-Specific Filters
```tsx
import React, { useState } from 'react';
import ChartWithFilters from '../components/analytics/ChartWithFilters';

const DubbingPage = () => {
  return (
    <div>
      <h1>Dubbing Analytics</h1>
      
      {/* This chart will have dubbing-specific filters */}
      <ChartWithFilters
        chartType="dubbingAnalysis"
        initialFilters={{ hasDubbing: true }}
        showFilters={true}
      />
      
      <ChartWithFilters
        chartType="topDubbedLanguages"
        initialFilters={{ hasDubbing: true }}
        showFilters={false} // Reuse filters from above
      />
    </div>
  );
};
```

### Example 4: Programmatic Filter Control
```tsx
import React, { useState } from 'react';
import { AnalyticsFilters } from '../types/Chart';
import AnalyticsFilterPanel from '../components/analytics/AnalyticsFilterPanel';
import PlatformDistribution from '../components/charts/PlatformDistribution';
import Button from '../components/common/Button';

const PresetFilters = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  const applyNetflixPreset = () => {
    setFilters({
      platform: ['Netflix'],
      year: '2023',
      type: ['Movie', 'Series']
    });
  };

  const applyActionPreset = () => {
    setFilters({
      genre: ['Action', 'Thriller'],
      year: '2020-2023',
      minDuration: 1.5
    });
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button onClick={applyNetflixPreset}>Netflix 2023</Button>
        <Button onClick={applyActionPreset}>Action Movies</Button>
        <Button onClick={() => setFilters({})}>Clear</Button>
      </div>

      <AnalyticsFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      <PlatformDistribution filters={filters} />
    </div>
  );
};
```

## Styling and Theming

All components support dark mode and use Tailwind CSS classes:

```tsx
// Light mode
className="bg-white text-gray-900"

// Dark mode
className="dark:bg-gray-800 dark:text-gray-100"

// Responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
```

## Best Practices

### 1. Filter Configuration
- Only enable filters relevant to the chart type
- Use `compact` mode for embedded charts
- Provide sensible `initialFilters` for better UX

### 2. Performance
- Debounce filter changes if needed
- Use pagination for large datasets
- Limit the number of active filters

### 3. User Experience
- Show active filter count
- Provide clear filter labels
- Include helper text for complex filters
- Allow easy filter removal

### 4. Accessibility
- Use semantic HTML
- Provide proper labels
- Support keyboard navigation
- Include ARIA attributes

## Future Enhancements

### Planned Features
- [ ] **Multi-Select Dropdowns** - Replace text inputs with proper multi-select components
- [ ] **Date Range Picker** - Visual date range selection
- [ ] **Filter Presets** - Save and load filter combinations
- [ ] **Filter Sharing** - Share filter configurations via URL
- [ ] **Advanced Query Builder** - Visual query builder for complex filters
- [ ] **Filter History** - Recently used filters
- [ ] **Auto-Complete** - Suggestions for text inputs
- [ ] **Filter Validation** - Real-time validation feedback

## Files Created

1. **AnalyticsFilterPanel.tsx** - Main filter panel component
2. **ChartWithFilters.tsx** - Chart wrapper with filters
3. **AnalyticsDashboard.tsx** - Complete dashboard example
4. **ANALYTICS_FILTER_UI.md** - This documentation

## Summary

The analytics filter UI components provide a comprehensive, user-friendly interface for filtering analytics data across all available parameters. The components are:

- ✅ **Fully Featured** - Support for 30+ filter parameters
- ✅ **Flexible** - Configurable per chart type
- ✅ **Responsive** - Works on all screen sizes
- ✅ **Theme-Aware** - Dark mode support
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Well-Documented** - Comprehensive examples and guides

Users can now slice and dice analytics data with ease, leveraging the full power of the redesigned backend APIs!
