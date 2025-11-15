# Analytics Filter Setup Guide

## Issue: Filters Not Showing on Analytics Dashboard

### ✅ Solution Applied

I've updated the **Analytics.tsx** page to include the `AnalyticsFilterPanel` component.

### Changes Made

**File:** `src/pages/Analytics.tsx`

1. **Added Import:**
```typescript
import AnalyticsFilterPanel from '../components/analytics/AnalyticsFilterPanel';
```

2. **Updated State Management:**
```typescript
// Changed from:
const [filters] = useState<AnalyticsFilters>({});

// To:
const [filters, setFilters] = useState<AnalyticsFilters>({});
```

3. **Added Filter Panel** (between header and charts):
```typescript
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
```

## How to Verify

1. **Start the development server:**
```bash
npm run dev
```

2. **Navigate to the Analytics page** in your browser

3. **You should now see:**
   - A filter panel with the heading "Analytics Filters"
   - Basic filters: Platform, Content Type, Genre, Language, Year, Age Rating, Source
   - A "Show Advanced" button to reveal more filters
   - A "Clear All" button to reset filters
   - Active filter count badge when filters are applied

## Filter Panel Features

### Basic Filters (Always Visible)
- ✅ **Platform** - Enter comma-separated platforms (e.g., "Netflix, Prime Video")
- ✅ **Content Type** - Enter comma-separated types (e.g., "Movie, Series")
- ✅ **Genre** - Enter comma-separated genres (e.g., "Action, Drama")
- ✅ **Language** - Enter comma-separated languages (e.g., "Hindi, English")
- ✅ **Year** - Single year, range, or multiple (e.g., "2023" or "2020-2023")
- ✅ **Age Rating** - Enter comma-separated ratings (e.g., "U, U/A 13+")
- ✅ **Source** - Enter comma-separated sources (e.g., "In-House, Commissioned")

### Advanced Filters (Click "Show Advanced")
- ✅ **Year Range** - Start Year and End Year dropdowns
- ✅ **Date Range** - Start Date and End Date pickers
- ✅ **Duration Range** - Min/Max duration in hours
- ✅ **Popularity Range** - Min/Max popularity scores
- ✅ **Dubbing Filters** - Has Dubbing (Yes/No) and Dubbing Languages
- ✅ **Seasons Range** - Min/Max seasons for series
- ✅ **Sorting** - Sort By and Sort Order
- ✅ **Pagination** - Page number and Limit
- ✅ **Grouping** - Primary and Secondary grouping dimensions

## Usage Examples

### Example 1: Filter by Platform
```
Platform: Netflix, Prime Video
```
This will show data only for Netflix and Prime Video.

### Example 2: Filter by Year Range
```
Start Year: 2020
End Year: 2023
```
This will show data from 2020 to 2023.

### Example 3: Filter by Genre and Language
```
Genre: Action, Thriller
Language: Hindi, English
```
This will show Action and Thriller content in Hindi and English.

### Example 4: Advanced Dubbing Filter
```
Has Dubbing: Yes
Dubbing Language: tamil, telugu
```
This will show content that has dubbing in Tamil or Telugu.

## Troubleshooting

### If filters still don't appear:

1. **Check Browser Console** for any errors:
   - Press F12 to open Developer Tools
   - Look for red error messages in the Console tab

2. **Verify File Structure:**
```
src/
  components/
    analytics/
      AnalyticsFilterPanel.tsx ✓
      ChartWithFilters.tsx ✓
  pages/
    Analytics.tsx ✓
```

3. **Check Import Paths:**
   - Make sure the import path is correct: `'../components/analytics/AnalyticsFilterPanel'`
   - Verify the file exists at that location

4. **Clear Build Cache:**
```bash
# Stop the dev server (Ctrl+C)
# Then restart:
npm run dev
```

5. **Check for TypeScript Errors:**
   - Look for red squiggly lines in your IDE
   - Run: `npm run build` to see all TypeScript errors

### Common Issues

**Issue:** "Module not found"
- **Solution:** Verify the import path and file location

**Issue:** Filters appear but don't work
- **Solution:** Check that `setFilters` is being called in `onFiltersChange`

**Issue:** Styling looks broken
- **Solution:** Ensure Tailwind CSS is properly configured

**Issue:** Dark mode colors are wrong
- **Solution:** Check that `ThemeContext` is properly set up

## Visual Guide

When working correctly, you should see:

```
┌─────────────────────────────────────────────────────────┐
│ Analytics Dashboard                                      │
│ Detailed insights and trends analysis                   │
│                                    [Refresh] [Grid/List] │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Analytics Filters                    [Show Advanced]    │
│                                      [Clear All]         │
├─────────────────────────────────────────────────────────┤
│ Platform          Content Type      Genre      Language │
│ [Netflix, ...]    [Movie, ...]      [Action]   [Hindi]  │
│                                                          │
│ Year              Age Rating        Source               │
│ [2023]            [U, U/A 13+]      [In-House]          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [Chart 1]                          [Chart 2]            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Next Steps

1. **Test the filters** by entering some values
2. **Verify charts update** when filters change
3. **Try advanced filters** by clicking "Show Advanced"
4. **Check active filter tags** appear below the filter panel
5. **Test "Clear All"** button to reset filters

## Additional Resources

- **Full Documentation:** See `ANALYTICS_FILTER_UI.md`
- **Chart Updates:** See `CHART_FILTERING_UPDATE.md`
- **Component Code:** `src/components/analytics/AnalyticsFilterPanel.tsx`

## Support

If you continue to have issues:
1. Check the browser console for errors
2. Verify all dependencies are installed: `npm install`
3. Restart the development server
4. Clear browser cache and reload the page
