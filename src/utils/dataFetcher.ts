import 'server-only';
import { generateAIComponent } from '@/lib/ai-generator';
import { AIComponentResponse } from '@/lib/types';

export interface DataFetchOptions {
  cacheKey?: string;
  revalidate?: number;
  fallbackOnError?: boolean;
  apiEndpoint: string;
}

export interface DataFetchResult {
  success: boolean;
  data?: any;
  aiResponse?: AIComponentResponse;
  error?: string;
}

/**
 * Fetches data and generates AI component only when data fetching is successful
 * This is the main integration point with the existing generateAIComponent function
 */
export async function fetchAiGeneratedUiComponent(
  options: DataFetchOptions
): Promise<DataFetchResult> {
  const {
    cacheKey = 'default-data-fetch',
    revalidate = 300,
    fallbackOnError = true,
    apiEndpoint
  } = options;

  try {
    console.log('🚀 Starting data fetch and AI generation flow...');

    // Use the existing generateAIComponent function which handles:
    // 1. Data fetching from external API
    // 2. AI component generation
    // 3. Security validation
    // 4. Error handling and fallbacks
    const aiResponse = await generateAIComponent({
      cacheKey,
      revalidate,
      apiEndpoint
    });

    if (aiResponse.success) {
      console.log('✅ Data fetch and AI generation successful');
      return {
        success: true,
        data: aiResponse.metadata?.dataSource !== 'fallback' ? 'API data available' : null,
        aiResponse,
      };
    } else {
      console.warn('⚠️ AI generation failed, using fallback');
      return {
        success: fallbackOnError,
        data: null,
        aiResponse,
        error: aiResponse.error
      };
    }
  } catch (error) {
    console.error('❌ Data fetch and AI generation failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (fallbackOnError) {
      // Return a basic fallback response
      return {
        success: false,
        data: null,
        aiResponse: {
          success: false,
          component: `'use client';
const React = window.React || require('react');

function ErrorFallback() {
  return React.createElement('div', {
    className: 'flex flex-col items-center justify-center p-8 text-center'
  }, [
    React.createElement('h2', {
      key: 'title',
      className: 'text-xl font-semibold mb-4 text-red-600 dark:text-red-400'
    }, 'Data Fetch Failed'),
    React.createElement('p', {
      key: 'message',
      className: 'text-sm text-gray-600 dark:text-gray-400 mb-4'
    }, 'Unable to fetch data for AI component generation'),
    React.createElement('code', {
      key: 'error',
      className: 'text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded'
    }, '${errorMessage}')
  ]);
}

ErrorFallback;`,
          componentName: 'ErrorFallback',
          error: errorMessage,
          metadata: {
            generatedAt: new Date().toISOString(),
            dataSource: 'error-fallback',
            cacheKey: 'error-fallback',
          },
        },
        error: errorMessage
      };
    }

    return {
      success: false,
      data: null,
      error: errorMessage
    };
  }
}

/**
 * Specialized data fetcher for landing page generation
 * Only generates landing pages when data is successfully fetched
 */
export async function fetchDataForLandingPage(
  pageType: string = 'general',
  options: DataFetchOptions
): Promise<DataFetchResult> {
  const cacheKey = `landing-page-${pageType}`;
  
  return fetchAiGeneratedUiComponent({
    ...options,
    cacheKey
  });
}

/**
 * Batch data fetcher for multiple components
 * Useful when you need to generate multiple AI components based on different data sets
 */
export async function batchFetchDataAndGenerateAI(
  requests: Array<{ key: string; options: DataFetchOptions }>
): Promise<Record<string, DataFetchResult>> {
  const results: Record<string, DataFetchResult> = {};

  // Process requests sequentially to avoid overwhelming the AI API
  for (const request of requests) {
    try {
      results[request.key] = await fetchAiGeneratedUiComponent(request.options);
    } catch (error) {
      results[request.key] = {
        success: false,
        error: error instanceof Error ? error.message : 'Batch fetch failed'
      };
    }
  }

  return results;
}

/**
 * Validates that data fetching was successful before proceeding with AI generation
 */
export function validateDataFetchResult(result: DataFetchResult): boolean {
  return result.success && !!result.aiResponse;
}

/**
 * Extracts component code from a successful data fetch result
 */
export function extractComponentCode(result: DataFetchResult): string | null {
  if (!validateDataFetchResult(result) || !result.aiResponse) {
    return null;
  }

  return result.aiResponse.component;
}
