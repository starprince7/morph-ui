# Dynamic API Endpoints for AI Component Generation

The secure AI component rendering system now supports dynamic API endpoints, making it flexible and future-proof for any JSON API.

## Overview

Instead of embedding data directly in AI-generated components, the system now instructs the AI to generate components that:
- Fetch data using `useEffect` and `fetch()` API
- Include proper loading states and error handling
- Work with any JSON API endpoint
- Handle empty states gracefully

## Usage

### Basic Usage (Default Endpoint)
```typescript
const result = await fetchDataAndGenerateAI({
  cacheKey: 'my-component',
  revalidate: 300,
  fallbackOnError: true
});
```

### Custom API Endpoint
```typescript
const result = await fetchDataAndGenerateAI({
  cacheKey: 'custom-api-component',
  revalidate: 300,
  fallbackOnError: true,
  apiEndpoint: 'https://your-api.com/data' // Your custom endpoint
});
```

### Direct AI Component Generation
```typescript
const aiResponse = await generateAIComponent({
  cacheKey: 'direct-generation',
  revalidate: 600,
  apiEndpoint: 'https://jsonplaceholder.typicode.com/posts'
});
```

## How It Works

1. **Data Sampling**: The system first fetches sample data from your API endpoint
2. **AI Analysis**: The AI analyzes the data structure and response format
3. **Component Generation**: The AI generates a React component that:
   - Fetches data from the specified endpoint using `useEffect`
   - Includes loading spinners and error states
   - Renders the data in an intuitive, responsive UI
   - Handles edge cases (empty data, network errors)

## Generated Component Structure

The AI will generate components following this pattern:

```jsx
'use client';

function GeneratedDataComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('YOUR_API_ENDPOINT');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result.data || result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Loading, error, and data rendering logic...
}
```

## API Requirements

Your API endpoint should:
- Return valid JSON
- Be accessible via GET request
- Handle CORS if called from browser
- Return consistent data structure

### Supported Response Formats

```json
// Direct array
[
  { "id": 1, "name": "Item 1" },
  { "id": 2, "name": "Item 2" }
]

// Wrapped in data property
{
  "data": [
    { "id": 1, "name": "Item 1" }
  ],
  "status": "success"
}

// Any JSON structure - AI will adapt
{
  "results": [...],
  "pagination": {...},
  "metadata": {...}
}
```

## Benefits

- **Future-Proof**: Easily change API endpoints without code modifications
- **Realistic**: Generated components behave like real applications
- **Flexible**: Works with any JSON API structure
- **Robust**: Includes proper error handling and loading states
- **Maintainable**: Single configuration point for API endpoints

## Examples

### E-commerce API
```typescript
apiEndpoint: 'https://api.shop.com/products'
```

### Blog Posts API
```typescript
apiEndpoint: 'https://jsonplaceholder.typicode.com/posts'
```

### User Data API
```typescript
apiEndpoint: 'https://reqres.in/api/users'
```

The AI will automatically adapt to the data structure and create appropriate UI components for any of these endpoints.
