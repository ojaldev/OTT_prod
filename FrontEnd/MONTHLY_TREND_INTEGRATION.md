# Monthly Release Trend Page - Integration Guide

## Quick Start

### 1. Add Route to Your Application

**File:** `src/App.tsx` or your router configuration

```tsx
import MonthlyReleaseTrendPage from './pages/MonthlyReleaseTrendPage';
import PrivateRoute from './components/auth/PrivateRoute';

// In your Routes component
<Routes>
  {/* Existing routes */}
  
  {/* Add this new route */}
  <Route 
    path="/analytics/monthly-trend" 
    element={
      <PrivateRoute>
        <MonthlyReleaseTrendPage />
      </PrivateRoute>
    } 
  />
</Routes>
```

### 2. Add Navigation Link

**Option A: In Sidebar Navigation**

```tsx
// In your Sidebar component
<NavLink to="/analytics/monthly-trend">
  <Calendar className="w-5 h-5" />
  <span>Monthly Trends</span>
</NavLink>
```

**Option B: In Analytics Dashboard**

```tsx
// In your Analytics page
<Button onClick={() => navigate('/analytics/monthly-trend')}>
  View Monthly Trends
</Button>
```

**Option C: In Top Navigation**

```tsx
// In your header/navbar
<DropdownMenu>
  <DropdownMenuItem onClick={() => navigate('/analytics/monthly-trend')}>
    Monthly Release Trend
  </DropdownMenuItem>
</DropdownMenu>
```

### 3. Verify Dependencies

Ensure these packages are installed:

```bash
npm install chart.js react-chartjs-2 lucide-react
```

### 4. Test the Page

1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/analytics/monthly-trend`
3. You should see:
   - Header with title and icon
   - Filter panel
   - Statistics cards
   - Chart (line chart by default)
   - Applied filters display

## API Endpoint Configuration

### Verify Endpoint in Constants

**File:** `src/utils/constants.ts`

Ensure this endpoint exists:

```typescript
export const API_ENDPOINTS = {
  ANALYTICS: {
    // ... other endpoints
    MONTHLY_RELEASE_TREND: '/analytics/monthly-release-trend',
  }
};
```

### Verify Service Method

**File:** `src/services/analytics.ts`

Ensure this method exists:

```typescript
async getMonthlyReleaseTrend(filters?: AnalyticsFilters): Promise<ChartData> {
  const params = this.buildQueryParams(filters);
  return apiService.get(`${API_ENDPOINTS.ANALYTICS.MONTHLY_RELEASE_TREND}?${params}`);
}
```

## Usage Examples

### Example 1: Basic Navigation

```tsx
// From any component
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  
  return (
    <button onClick={() => navigate('/analytics/monthly-trend')}>
      View Monthly Trends
    </button>
  );
};
```

### Example 2: With Pre-Applied Filters

```tsx
// Navigate with query parameters
const navigate = useNavigate();

const viewNetflixTrends = () => {
  navigate('/analytics/monthly-trend?platform=Netflix&year=2024');
};
```

### Example 3: Embedded in Dashboard

```tsx
// Embed as a card in your dashboard
import MonthlyReleaseTrendPage from './pages/MonthlyReleaseTrendPage';

const Dashboard = () => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="col-span-2">
        <MonthlyReleaseTrendPage />
      </div>
      {/* Other dashboard components */}
    </div>
  );
};
```

## Customization Options

### 1. Change Default Chart Type

**File:** `src/pages/MonthlyReleaseTrendPage.tsx`

```typescript
// Line 86 - Change default from 'line' to 'bar'
const [chartType, setChartType] = useState<'line' | 'bar'>('bar');
```

### 2. Adjust Default Date Range

```typescript
// Line 73-77 - Change from 12 months to 6 months
function getDefaultDateRange(): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - 5, 1); // Changed from -11 to -5
  return { start, end };
}
```

### 3. Customize Color Scheme

```typescript
// Line 153 - Change primary color
const primaryColor = '#3B82F6'; // Blue instead of purple
```

### 4. Modify Chart Height

```typescript
// Line 406 - Change height
<div className="relative" style={{ height: '600px' }}> {/* Changed from 500px */}
```

### 5. Hide/Show Specific Filters

```typescript
// Lines 330-345 - Customize available filters
<AnalyticsFilterPanel
  filters={filters}
  onFiltersChange={setFilters}
  availableFilters={{
    platform: true,
    type: true,
    genre: true,
    language: true,
    // Hide these filters
    duration: false,
    popularity: false,
    dubbing: false,
    // Keep others as needed
  }}
/>
```

## Common Integration Patterns

### Pattern 1: Analytics Menu

```tsx
// Create an analytics submenu
const AnalyticsMenu = () => {
  return (
    <div className="space-y-2">
      <NavLink to="/analytics/dashboard">Overview</NavLink>
      <NavLink to="/analytics/monthly-trend">Monthly Trends</NavLink>
      <NavLink to="/analytics/platform-comparison">Platform Comparison</NavLink>
      <NavLink to="/analytics/genre-analysis">Genre Analysis</NavLink>
    </div>
  );
};
```

### Pattern 2: Quick Access Card

```tsx
// Add a quick access card to your main analytics page
const AnalyticsOverview = () => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card onClick={() => navigate('/analytics/monthly-trend')}>
        <Calendar className="w-8 h-8" />
        <h3>Monthly Trends</h3>
        <p>Track release patterns over time</p>
      </Card>
      {/* Other cards */}
    </div>
  );
};
```

### Pattern 3: Breadcrumb Navigation

```tsx
// Add breadcrumbs for better navigation
<Breadcrumbs>
  <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
  <BreadcrumbItem href="/analytics">Analytics</BreadcrumbItem>
  <BreadcrumbItem active>Monthly Trends</BreadcrumbItem>
</Breadcrumbs>
```

## Testing Checklist

After integration, verify:

- [ ] Route is accessible
- [ ] Page loads without errors
- [ ] Authentication is required
- [ ] Filters work correctly
- [ ] Charts render properly
- [ ] Export CSV works
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Navigation works
- [ ] Back button works

## Troubleshooting

### Issue: 404 Not Found

**Solution:** Check that the route is properly added to your router configuration.

### Issue: Authentication Error

**Solution:** Ensure the route is wrapped with `PrivateRoute` or equivalent authentication guard.

### Issue: Chart Not Rendering

**Solution:** 
1. Check browser console for errors
2. Verify Chart.js is installed
3. Check that canvas element is present

### Issue: Filters Not Working

**Solution:**
1. Verify `AnalyticsFilterPanel` component exists
2. Check that `analyticsService.getMonthlyReleaseTrend` is defined
3. Verify API endpoint is correct

### Issue: No Data Displayed

**Solution:**
1. Check backend is running
2. Verify authentication token is valid
3. Check that backend has data for the date range
4. Look at network tab for API response

## Performance Tips

### 1. Lazy Load the Page

```tsx
// Use React.lazy for code splitting
const MonthlyReleaseTrendPage = lazy(() => import('./pages/MonthlyReleaseTrendPage'));

// In your routes
<Route 
  path="/analytics/monthly-trend" 
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <PrivateRoute>
        <MonthlyReleaseTrendPage />
      </PrivateRoute>
    </Suspense>
  } 
/>
```

### 2. Preload Data

```tsx
// Preload data when hovering over navigation link
<NavLink 
  to="/analytics/monthly-trend"
  onMouseEnter={() => {
    // Prefetch the page component
    import('./pages/MonthlyReleaseTrendPage');
  }}
>
  Monthly Trends
</NavLink>
```

### 3. Cache API Responses

```tsx
// Add caching to analytics service
const cache = new Map();

async getMonthlyReleaseTrend(filters?: AnalyticsFilters): Promise<ChartData> {
  const cacheKey = JSON.stringify(filters);
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const params = this.buildQueryParams(filters);
  const result = await apiService.get(`${API_ENDPOINTS.ANALYTICS.MONTHLY_RELEASE_TREND}?${params}`);
  
  cache.set(cacheKey, result);
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000); // 5 min cache
  
  return result;
}
```

## Security Considerations

### 1. Authentication Required

The page uses the authenticated endpoint, so ensure:

```tsx
// Wrap with authentication guard
<PrivateRoute>
  <MonthlyReleaseTrendPage />
</PrivateRoute>
```

### 2. Token Refresh

Ensure your API service handles token refresh:

```typescript
// In api.ts - should already be implemented
if (error.response?.status === 401) {
  // Refresh token logic
  // Retry request
}
```

### 3. Rate Limiting

Consider adding rate limiting for API calls:

```typescript
// Debounce filter changes
const debouncedSetFilters = useMemo(
  () => debounce(setFilters, 500),
  []
);
```

## Accessibility Enhancements

### 1. Add Page Title

```tsx
useEffect(() => {
  document.title = 'Monthly Release Trend - Analytics';
}, []);
```

### 2. Add Skip Link

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
<main id="main-content">
  {/* Page content */}
</main>
```

### 3. Add ARIA Labels

```tsx
<button 
  aria-label="Switch to line chart"
  onClick={() => setChartType('line')}
>
  Line
</button>
```

## Summary

To integrate the Monthly Release Trend Page:

1. ✅ Add route to router configuration
2. ✅ Add navigation link(s)
3. ✅ Verify dependencies installed
4. ✅ Test the page
5. ✅ Customize as needed

The page is now ready to use with full filtering, charting, and export capabilities! 🎉
