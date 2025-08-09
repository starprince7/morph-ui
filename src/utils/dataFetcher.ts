import { cache } from 'react';
import { AiCode, ApiSpec, ThemeOption } from '@/lib/types';
import { generateAIComponent } from '@/lib/ai-generator';

// Simple localStorage-based cache helper functions for client components
const getFromCache = (key: string) => {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (err) {
    console.warn('Failed to get from cache:', err);
    return null;
  }
};

const setInCache = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Failed to store in cache:', err);
  }
};

interface DataFetchOptions {
  enableCaching?: boolean;
  revalidate?: number;
  theme?: ThemeOption;
  preferCache?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error?: string;
  success: boolean;
}

/**
 * Fetch data from an API endpoint with optional caching
 * @param url The URL to fetch from
 * @param options Options for data fetching
 */
export async function fetchData<T>(
  url: string, 
  options: DataFetchOptions = { enableCaching: true, revalidate: 3600 }
): Promise<ApiResponse<T>> {
  const cacheKey = `data-${url.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const { enableCaching = true, revalidate = 3600, preferCache = false } = options;
  const now = Date.now();

  // Check cache first if enabled
  if (enableCaching && typeof window !== 'undefined') {
    try {
      const cached = getFromCache(cacheKey);
      if (cached) {
        const { data, timestamp } = cached;
        
        // Use cache if not expired or prefer cache is set
        if (preferCache || now - timestamp < revalidate * 1000) {
          return { data, success: true };
        }
      }
    } catch (err) {
      console.warn('Failed to access cache:', err);
      // Continue with fetch if cache access fails
    }
  }

  // Fetch fresh data
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: revalidate },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    // Parse JSON response
    const data = await response.json() as T;

    // Store in cache if caching is enabled
    if (enableCaching && typeof window !== 'undefined') {
      try {
        setInCache(cacheKey, { data, timestamp: now });
      } catch (err) {
        console.warn('Failed to store in cache:', err);
      }
    }

    return { data, success: true };
  } catch (error: any) {
    console.error('Fetch error:', error);
    return { 
      data: null, 
      error: error.message || 'Failed to fetch data', 
      success: false 
    };
  }
}

/**
 * Fetch an API spec from an endpoint
 * @param apiEndpoint The API endpoint URL to fetch the spec from
 * @param options Options for data fetching
 */
export const fetchApiSpec = cache(async (
  apiEndpoint: string,
  options: DataFetchOptions = {}
): Promise<ApiResponse<ApiSpec>> => {
  return fetchData<ApiSpec>(apiEndpoint, options);
});

/**
 * Fetch AI generated UI component for a given API endpoint
 * This includes fetching the API spec and generating component code
 * @param apiEndpoint The API endpoint URL
 * @param options Options for data fetching
 */
export const fetchAiGeneratedUiComponent = cache(async (
  apiEndpoint: string,
  options: DataFetchOptions = {}
): Promise<ApiResponse<AiCode>> => {
  // Create a unique cache key from API endpoint and theme if present
  const theme = options?.theme || 'purple-night'; // Default to purple-night if not specified
  const cacheKey = `visualize-${apiEndpoint.replace(/[^a-zA-Z0-9]/g, "_")}-${theme}`;
  
  console.log(`Generating AI Component for endpoint: ${apiEndpoint} with theme: ${theme}`);
  
  try {
    // Generate AI component with theme parameter
    const result = await generateAIComponent({
      apiEndpoint,
      cacheKey,
      theme,
      enableCaching: options.enableCaching,
      revalidate: options.revalidate,
    });
    
    return { data: result, success: true };
  } catch (error: any) {
    console.error('AI Component generation failed:', error);
    return { 
      data: null, 
      error: error.message || 'Failed to generate UI component', 
      success: false 
    };
  }
});

/**
 * Regenerate AI component with a specific theme
 * Uses the regenerate API endpoint to get a fresh component
 * @param apiEndpoint The original API endpoint URL
 * @param theme The theme to use for regeneration
 */
export async function regenerateComponent(
  apiEndpoint: string,
  theme: ThemeOption
): Promise<ApiResponse<AiCode>> {
  try {
    const response = await fetch(
      `/api/regenerate?endpoint=${encodeURIComponent(apiEndpoint)}&theme=${theme}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store', // Ensure we don't get a cached response
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to regenerate component: ${response.status}`);
    }

    const data = await response.json();
    return { data, success: true };
  } catch (error: any) {
    console.error('Regeneration error:', error);
    return { 
      data: null, 
      error: error.message || 'Failed to regenerate component', 
      success: false 
    };
  }
}