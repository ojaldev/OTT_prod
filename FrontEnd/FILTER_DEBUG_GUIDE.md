# Filter Debug Guide - API Response Issues

## Current Issue

The API is being called with filters, but the filtered data is not displaying on the charts.

## Debugging Steps

### Step 1: Check Browser Console

Open the browser console (F12) and look for these logs when you apply a filter:

```
🔍 API Request: GET /public/analytics/platform-distribution
Full URL: http://localhost:5000/api/public/analytics/platform-distribution?platform=Netflix
URL query string: platform=Netflix

PlatformDistribution: Filters changed, reloading data {platform: "Netflix"}
Loading platform distribution with filters: {platform: "Netflix"}

🔍 Full API Response: [object]
🔍 Response type: object
🔍 Response.data: [array or undefined]
🔍 Is Array? true/false
✅ Filtered data from API: [...]
```

### Step 2: Identify Response Structure

The response structure can vary. Look at the console logs to determine which format your API returns:

**Format 1: Direct Array**
```javascript
response = [
  { _id: "Netflix", count: 150 },
  { _id: "Prime Video", count: 120 }
]
```

**Format 2: Wrapped in data property**
```javascript
response = {
  data: [
    { _id: "Netflix", count: 150 },
    { _id: "Prime Video", count: 120 }
  ]
}
```

**Format 3: Nested data**
```javascript
response = {
  success: true,
  data: {
    data: [
      { _id: "Netflix", count: 150 }
    ]
  }
}
```

### Step 3: Check What's Being Logged

Look for these specific console messages:

1. **"🔍 Full API Response:"** - Shows the complete response object
2. **"🔍 Is Array?"** - Tells you if response is directly an array
3. **"✅ Filtered data from API:"** - Shows the actual data being used
4. **"⚠️ No data available"** - Means the data extraction failed

### Step 4: Common Issues

#### Issue A: Response is wrapped differently

**Symptom:** Console shows `🔍 Is Array? false` and `⚠️ No data available`

**Solution:** The response structure doesn't match our code. Check the actual response structure and update the chart code.

**Example Fix:**
```typescript
// If response is { success: true, data: [...] }
const responseData = response?.data || [];

// If response is { result: { items: [...] } }
const responseData = response?.result?.items || [];

// If response is directly an array
const responseData = Array.isArray(response) ? response : [];
```

#### Issue B: Empty array returned

**Symptom:** Console shows `✅ Filtered data from API: []`

**Solution:** Backend is returning empty results. This could mean:
1. No data matches the filter criteria
2. Backend filter logic has a bug
3. Filter parameters aren't being parsed correctly by backend

**How to verify:**
- Test the API directly with curl or Postman
- Check backend logs
- Try with different filter values

#### Issue C: Data structure mismatch

**Symptom:** Console shows data but chart doesn't render

**Solution:** The data items don't have expected `_id` and `count` properties.

**How to fix:**
Check what properties the data actually has:
```typescript
console.log('First item:', responseData[0]);
// Might show: { platform: "Netflix", total: 150 }
// Instead of: { _id: "Netflix", count: 150 }
```

Then update the mapping:
```typescript
// Adjust based on actual property names
const labels = responseData.map((item: any) => item.platform || item._id);
const data = responseData.map((item: any) => item.total || item.count);
```

### Step 5: Network Tab Investigation

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by **Fetch/XHR**
4. Apply a filter in the UI
5. Click on the API request
6. Check:
   - **Headers → Query String Parameters** - Are filters being sent?
   - **Preview/Response** - What data is being returned?

**Example Good Request:**
```
Request URL: http://localhost:5000/api/public/analytics/platform-distribution?platform=Netflix
Status: 200 OK
Response: [
  { "_id": "Netflix", "count": 150 }
]
```

**Example Bad Request:**
```
Request URL: http://localhost:5000/api/public/analytics/platform-distribution
Status: 200 OK
Response: []  // Empty - filters not applied
```

### Step 6: Backend Verification

If the frontend is sending filters correctly but getting wrong data, check the backend:

**Test with curl:**
```bash
# Test without filters
curl http://localhost:5000/api/public/analytics/platform-distribution

# Test with filters
curl "http://localhost:5000/api/public/analytics/platform-distribution?platform=Netflix"

# Test with multiple filters
curl "http://localhost:5000/api/public/analytics/platform-distribution?platform=Netflix&year=2023"
```

**Expected backend behavior:**
- Without filters: Returns all data
- With filters: Returns only matching data
- Invalid filters: Returns empty array or error

## Quick Fix Checklist

- [ ] Console shows filter object when changed
- [ ] Console shows "Loading [chart] with filters"
- [ ] Network tab shows API request with query parameters
- [ ] API returns 200 status
- [ ] Response contains data array
- [ ] Data items have expected properties (_id, count)
- [ ] Chart data state is being set
- [ ] No errors in console

## Temporary Workaround

If you need to verify the filter UI works while debugging the API:

```typescript
// Add this to loadChartData for testing
const mockData = [
  { _id: "Netflix", count: 150 },
  { _id: "Prime Video", count: 120 },
  { _id: "Disney+", count: 90 }
];

// Use mock data if API returns empty
const responseData = Array.isArray(response) ? response : (response?.data || []);
const dataToUse = responseData.length > 0 ? responseData : mockData;

console.log('Using data:', dataToUse);
```

This will show mock data if the API returns nothing, helping you verify the filter UI works.

## Next Steps

Based on what you see in the console:

1. **If "🔍 Is Array? true"** - Response is direct array, code should work
2. **If "🔍 Is Array? false" and response.data exists** - Code should work
3. **If "⚠️ No data available"** - Check response structure or backend
4. **If data shows but chart is blank** - Check data property names

## Report Template

When reporting the issue, include:

```
1. Filter applied: platform=Netflix
2. Console log "🔍 Full API Response": [paste here]
3. Console log "🔍 Is Array?": true/false
4. Console log "✅ Filtered data": [paste here]
5. Network tab Response: [paste here]
6. Any errors: [paste here]
```

This will help identify exactly where the issue is!
