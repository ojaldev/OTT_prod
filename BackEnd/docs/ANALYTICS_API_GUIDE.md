# Analytics API - Rich Data Slicing Guide

## Overview

The Analytics API has been redesigned to support **rich data slicing** across multiple parameters, enabling powerful and flexible content analysis. All analytics endpoints now support comprehensive filtering capabilities.

## Supported Filter Parameters

All analytics endpoints support the following filter parameters:

### Platform Filters
- **`platform`**: Filter by platform (single or comma-separated)
  - Example: `?platform=Netflix` or `?platform=Netflix,Prime Video,Hotstar`

### Content Type Filters
- **`type`** or **`format`**: Filter by content type/format
  - Example: `?type=Movie` or `?type=Movie,Series,Documentary`

### Year/Date Filters
- **`year`**: Filter by year (single, range, or multiple)
  - Single: `?year=2023`
  - Range: `?year=2020-2023`
  - Multiple: `?year=2020,2021,2023`
- **`startYear`** & **`endYear`**: Alternative year range filter
  - Example: `?startYear=2020&endYear=2023`
- **`startDate`** & **`endDate`**: Filter by release date range
  - Example: `?startDate=2023-01-01&endDate=2023-12-31`

### Genre Filters
- **`genre`**: Filter by genre (single or comma-separated)
  - Example: `?genre=Action` or `?genre=Action,Drama,Thriller`

### Language/Region Filters
- **`language`** or **`region`**: Filter by primary language
  - Example: `?language=Hindi` or `?language=Hindi,English,Tamil`

### Rating Filters
- **`ageRating`**: Filter by age rating
  - Example: `?ageRating=PG-13` or `?ageRating=PG,PG-13,R`

### Source Filters
- **`source`**: Filter by content source
  - Example: `?source=In-House` or `?source=In-House,Commissioned`

### Duration Filters
- **`minDuration`**: Minimum duration in hours
  - Example: `?minDuration=1.5`
- **`maxDuration`**: Maximum duration in hours
  - Example: `?maxDuration=3`

### Popularity Filters
- **`minPopularity`**: Minimum dubbing count (as popularity proxy)
  - Example: `?minPopularity=3`
- **`maxPopularity`**: Maximum dubbing count
  - Example: `?maxPopularity=10`

### Dubbing Filters
- **`hasDubbing`**: Filter by dubbing availability
  - Example: `?hasDubbing=true`
- **`dubbingLanguage`**: Filter by specific dubbing language
  - Example: `?dubbingLanguage=tamil` or `?dubbingLanguage=tamil,telugu`

### Seasons Filters (for Series)
- **`minSeasons`**: Minimum number of seasons
  - Example: `?minSeasons=2`
- **`maxSeasons`**: Maximum number of seasons
  - Example: `?maxSeasons=5`

### Sorting & Pagination
- **`sortBy`**: Field to sort by (default: `count`)
  - Example: `?sortBy=avgDuration`
- **`sortOrder`**: Sort order - `asc` or `desc` (default: `desc`)
  - Example: `?sortOrder=asc`
- **`page`**: Page number for pagination (default: 1)
  - Example: `?page=2`
- **`limit`**: Items per page (default: 100, max: 1000)
  - Example: `?limit=50`

## Endpoint Examples

### 1. Platform Distribution with Filters

**Basic Usage:**
```
GET /api/analytics/platform-distribution
```

**With Filters:**
```
GET /api/analytics/platform-distribution?year=2023&genre=Action&language=Hindi
```

**Response:**
```json
{
  "success": true,
  "message": "Platform distribution retrieved",
  "data": {
    "data": [
      { "platform": "Netflix", "count": 45 },
      { "platform": "Prime Video", "count": 32 }
    ],
    "filters": {
      "year": 2023,
      "genre": "Action",
      "language": "Hindi"
    },
    "total": 77
  }
}
```

### 2. Genre Trends with Multiple Filters

```
GET /api/analytics/genre-trends?platform=Netflix,Hotstar&startYear=2020&endYear=2023&language=Hindi
```

### 3. Multi-Dimensional Analytics

Analyze across multiple dimensions simultaneously:

```
GET /api/analytics/multi-dimensional?platform=Netflix&year=2020-2023&dimensions=genre,language,type
```

**Response:**
```json
{
  "success": true,
  "data": {
    "genre": [
      { "assignedGenre": "Action", "count": 120 },
      { "assignedGenre": "Drama", "count": 95 }
    ],
    "language": [
      { "primaryLanguage": "Hindi", "count": 150 },
      { "primaryLanguage": "English", "count": 85 }
    ],
    "type": [
      { "assignedFormat": "Movie", "count": 180 },
      { "assignedFormat": "Series", "count": 55 }
    ],
    "summary": {
      "totalContent": 235,
      "avgDuration": 2.3,
      "platformCount": 1,
      "genreCount": 8,
      "languageCount": 5
    },
    "filters": { ... },
    "dimensions": ["genre", "language", "type"]
  }
}
```

### 4. Advanced Slicing

Flexible grouping with pagination:

```
GET /api/analytics/advanced-slicing?groupBy=platform&secondaryGroupBy=assignedGenre&year=2023&sortBy=count&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": { "primary": "Netflix", "secondary": "Action" },
        "count": 45,
        "avgDuration": 2.1,
        "totalDuration": 94.5,
        "avgDubbings": 3.2,
        "minYear": 2020,
        "maxYear": 2023
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    },
    "filters": { ... },
    "groupBy": { "primary": "platform", "secondary": "assignedGenre" }
  }
}
```

### 5. Comparative Analytics

Compare segments with insights:

```
GET /api/analytics/comparative?compareBy=platform&metric=dubbingPenetration&year=2023
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "segment": "Netflix",
        "count": 120,
        "avgDuration": 2.3,
        "totalDuration": 276,
        "avgDubbings": 4.2,
        "dubbingPenetration": 85.5,
        "yearRange": { "min": 2020, "max": 2023 },
        "formatCount": 5,
        "genreCount": 12,
        "languageCount": 8
      }
    ],
    "insights": {
      "totalSegments": 5,
      "topPerformer": { ... },
      "averages": {
        "count": 95.2,
        "avgDuration": 2.1,
        "dubbingPenetration": 72.3
      }
    },
    "compareBy": "platform",
    "metric": "dubbingPenetration"
  }
}
```

## Complex Query Examples

### Example 1: Netflix Action Movies from 2020-2023 in Hindi with Dubbing
```
GET /api/analytics/platform-distribution?platform=Netflix&type=Movie&genre=Action&year=2020-2023&language=Hindi&hasDubbing=true
```

### Example 2: Compare Platforms for Series Content with High Dubbing
```
GET /api/analytics/comparative?compareBy=platform&type=Series&minPopularity=5&metric=avgDubbings
```

### Example 3: Multi-dimensional Analysis of Recent Content
```
GET /api/analytics/multi-dimensional?startYear=2022&dimensions=platform,genre,language,source&minDuration=1&sortBy=count
```

### Example 4: Advanced Slicing by Genre and Year with Pagination
```
GET /api/analytics/advanced-slicing?groupBy=assignedGenre&secondaryGroupBy=year&platform=Netflix,Prime Video&page=1&limit=50&sortBy=count&sortOrder=desc
```

## Updated Existing Endpoints

All existing analytics endpoints now support the full filter parameter set:

1. **`/analytics/platform-distribution`** - Platform distribution with filters
2. **`/analytics/genre-trends`** - Genre trends with filters
3. **`/analytics/language-stats`** - Language statistics with filters
4. **`/analytics/yearly-releases`** - Yearly releases with filters
5. **`/analytics/dubbing-analysis`** - Dubbing analysis with filters
6. **`/analytics/source-breakdown`** - Source breakdown with filters
7. **`/analytics/duration-analysis`** - Duration analysis with filters
8. **`/analytics/age-rating-distribution`** - Age rating distribution with filters
9. **`/analytics/monthly-release-trend`** - Monthly trends with filters
10. **`/analytics/platform-growth`** - Platform growth with filters
11. **`/analytics/genre-platform-heatmap`** - Heatmap with filters
12. **`/analytics/language-platform-matrix`** - Matrix with filters
13. **`/analytics/duration-by-format-genre`** - Duration analysis with filters
14. **`/analytics/dubbing-penetration`** - Dubbing penetration with filters
15. **`/analytics/top-dubbed-languages`** - Top languages with filters

## New Comprehensive Endpoints

### 1. Multi-Dimensional Analytics
**Endpoint:** `GET /api/analytics/multi-dimensional`

Analyze content across multiple dimensions simultaneously with faceted results.

**Key Parameters:**
- `dimensions`: Comma-separated list of dimensions (platform, genre, language, type, source, ageRating, year)
- All standard filter parameters

### 2. Advanced Slicing
**Endpoint:** `GET /api/analytics/advanced-slicing`

Flexible grouping with single or nested dimensions, multiple metrics, and pagination.

**Key Parameters:**
- `groupBy`: Primary grouping dimension
- `secondaryGroupBy`: Optional secondary grouping dimension
- `page`, `limit`: Pagination controls
- All standard filter parameters

### 3. Comparative Analytics
**Endpoint:** `GET /api/analytics/comparative`

Compare different segments with comprehensive metrics and insights.

**Key Parameters:**
- `compareBy`: Dimension to compare (platform, genre, language, etc.)
- `metric`: Primary metric for ranking (count, avgDuration, dubbingPenetration, etc.)
- All standard filter parameters

## Response Format

All endpoints now return a consistent response format:

```json
{
  "success": true,
  "message": "Description of the result",
  "data": {
    "data": [...],           // Main result data
    "filters": {...},        // Applied filters for transparency
    "total": 150,            // Total count (where applicable)
    "pagination": {...}      // Pagination info (where applicable)
  }
}
```

## Best Practices

1. **Combine Filters**: Use multiple filters to narrow down results
   ```
   ?platform=Netflix&year=2023&genre=Action&language=Hindi
   ```

2. **Use Pagination**: For large result sets, use pagination
   ```
   ?page=1&limit=50
   ```

3. **Sort Results**: Specify sorting for better insights
   ```
   ?sortBy=count&sortOrder=desc
   ```

4. **Multi-dimensional Analysis**: Use the multi-dimensional endpoint for comprehensive overviews
   ```
   ?dimensions=platform,genre,language
   ```

5. **Comparative Insights**: Use comparative endpoint to benchmark segments
   ```
   ?compareBy=platform&metric=dubbingPenetration
   ```

## Performance Considerations

- All endpoints use MongoDB aggregation pipelines for optimal performance
- Indexes are in place for common filter fields (platform, year, genre, language)
- Pagination limits are capped at 1000 items per page
- Complex multi-dimensional queries may take longer for large datasets

## Error Handling

All endpoints return standard error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid parameters)
- `401`: Unauthorized (missing or invalid token)
- `500`: Server error
