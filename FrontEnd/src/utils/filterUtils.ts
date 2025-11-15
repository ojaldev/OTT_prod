import { AnalyticsFilters } from '../types/Chart';

/**
 * Filters chart data based on the provided filters
 * @param data The original data array to filter
 * @param filters The filters to apply
 * @param mappings Object that maps filter keys to data object properties
 * @returns Filtered data array
 */
export const filterChartData = <T extends Record<string, any>>(
  data: T[],
  filters?: AnalyticsFilters,
  mappings: Partial<Record<keyof AnalyticsFilters, string>> = {
    platform: 'platform',
    genre: 'genre',
    language: 'language',
    startYear: 'year',
    endYear: 'year',
    startMonth: 'month',
    endMonth: 'month'
  }
): T[] => {
  if (!filters || Object.keys(filters).length === 0 || !data || data.length === 0) {
    return data;
  }

  console.log('Filtering data client-side with filters:', filters);
  
  const filteredData = data.filter(item => {
    // Check each filter
    for (const [filterKey, filterValue] of Object.entries(filters)) {
      if (filterValue === undefined || filterValue === null || filterValue === '') {
        continue; // Skip empty filters
      }

      const dataKey = mappings[filterKey as keyof AnalyticsFilters] || filterKey;
      
      // Handle array values (like platform)
      if (Array.isArray(filterValue)) {
        if (filterValue.length === 0) continue;
        
        // If the item doesn't have this property or it's not in the filter array, exclude it
        if (!item[dataKey] || !filterValue.includes(item[dataKey])) {
          console.log(`Item excluded by array filter ${filterKey}:`, item);
          return false;
        }
      } 
      // Handle year range
      else if (filterKey === 'startYear' && item[dataKey]) {
        const itemYear = parseInt(item[dataKey].toString());
        const startYear = parseInt(filterValue.toString());
        if (itemYear < startYear) {
          console.log(`Item excluded by startYear filter:`, item);
          return false;
        }
      }
      else if (filterKey === 'endYear' && item[dataKey]) {
        const itemYear = parseInt(item[dataKey].toString());
        const endYear = parseInt(filterValue.toString());
        if (itemYear > endYear) {
          console.log(`Item excluded by endYear filter:`, item);
          return false;
        }
      }
      // Handle month range
      else if (filterKey === 'startMonth' && item[dataKey]) {
        const itemMonth = parseInt(item[dataKey].toString());
        const startMonth = parseInt(filterValue.toString());
        if (itemMonth < startMonth) {
          console.log(`Item excluded by startMonth filter:`, item);
          return false;
        }
      }
      else if (filterKey === 'endMonth' && item[dataKey]) {
        const itemMonth = parseInt(item[dataKey].toString());
        const endMonth = parseInt(filterValue.toString());
        if (itemMonth > endMonth) {
          console.log(`Item excluded by endMonth filter:`, item);
          return false;
        }
      }
      // Handle simple string equality
      else if (item[dataKey] !== filterValue) {
        console.log(`Item excluded by string filter ${filterKey}:`, item);
        return false;
      }
    }
    
    return true;
  });
  
  // If no data matches the filter criteria, provide a placeholder
  if (filteredData.length === 0 && data.length > 0) {
    console.log(`No data matches the filter criteria. Using placeholder data.`);
    
    // Create a placeholder item based on the first item in the original dataset
    // This ensures the structure is compatible with the chart components
    if (data[0]) {
      const placeholder = { ...data[0] } as T;
      
      // Set a special flag to indicate this is placeholder data
      (placeholder as any)._isPlaceholder = true;
      
      // If the item has a count property, set it to 0
      if ('count' in placeholder) {
        (placeholder as any).count = 0;
      }
      
      // If the item has a year property and filters include startYear, use that
      if ('year' in placeholder && filters?.startYear) {
        (placeholder as any).year = parseInt(filters.startYear.toString());
      }
      
      // If the item has an _id property, set it to indicate no data
      if ('_id' in placeholder) {
        (placeholder as any)._id = 'No data for selected filters';
      }
      
      return [placeholder];
    }
  }
  
  return filteredData;
};
