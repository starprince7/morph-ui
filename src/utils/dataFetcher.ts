import 'server-only';
import { generateAIComponent } from '@/lib/ai-generator';
import { AIComponentResponse } from '@/lib/types';
import SessionManager from '@/lib/session-manager';
import AIResponseCache from '@/lib/ai-response-cache';
import logger from '@/utils/logger';

export interface DataFetchOptions {
  cacheKey?: string;
  revalidate?: number;
  fallbackOnError?: boolean;
  apiEndpoint: string;
  sessionId?: string;
  enableCaching?: boolean;
  cacheTtlHours?: number;
}

export interface DataFetchResult {
  success: boolean;
  data?: any;
  aiResponse?: AIComponentResponse;
  error?: string;
}

/**
 * Fetches data and generates AI component with session management and database caching
 * This is the main integration point with caching and session management
 */
export async function fetchAiGeneratedUiComponent(
  options: DataFetchOptions
): Promise<DataFetchResult> {
  const {
    cacheKey = 'default-data-fetch',
    revalidate = 300,
    fallbackOnError = true,
    apiEndpoint,
    enableCaching = true,
    cacheTtlHours = 24
  } = options;

  try {
    logger.info('🚀 Starting data fetch and AI generation flow...', {
      apiEndpoint,
      cacheKey,
      enableCaching
    });

    // Step 1: Get or generate session ID (compatible with Server Components)
    const sessionManager = SessionManager.getInstance();
    let sessionId = options.sessionId;
    
    if (!sessionId) {
      // Try to get existing session from cookies
      const existingSessionId = await sessionManager.getSessionId();
      
      // If no session exists, generate a temporary one for this request
      if (existingSessionId) {
        sessionId = existingSessionId;
      } else {
        sessionId = sessionManager.generateSessionId();
        logger.info('Generated temporary session for request', { sessionId });
      }
    }
    
    // Step 2: Store API endpoint for this session
    sessionManager.storeApiEndpointForSession(sessionId, apiEndpoint, cacheKey);
    
    // Step 3: Check cache if enabled
    if (enableCaching) {
      logger.info('🔍 Checking database cache before AI API call...', {
        apiEndpoint,
        sessionId,
        cacheKey
      });
      
      const cache = AIResponseCache.getInstance();
      const cacheResult = await cache.getCachedResponse({
        sessionId,
        cacheKey,
        apiEndpoint,
        ttlHours: cacheTtlHours
      });
      
      if (cacheResult.found && cacheResult.data) {
        logger.info('✅ CACHE HIT - Found existing AI response in database! No AI API call needed.', {
          apiEndpoint,
          sessionId,
          cacheKey,
          accessCount: cacheResult.metadata?.accessCount,
          createdAt: cacheResult.metadata?.createdAt
        });
        
        return {
          success: true,
          data: cacheResult.data.metadata?.dataSource !== 'fallback' ? 'API data available (cached)' : null,
          aiResponse: cacheResult.data,
        };
      }
      
      logger.info('❌ CACHE MISS - No existing AI response found in database. Will generate new one.', { 
        apiEndpoint, 
        sessionId,
        cacheKey 
      });
    } else {
      logger.info('⚠️ Caching disabled - skipping database check', { apiEndpoint });
    }

    // Step 4: Generate new AI component using existing function
    logger.info('🤖 Making AI API call to generate new component...', {
      apiEndpoint,
      sessionId,
      cacheKey
    });
    
    const aiResponse = await generateAIComponent({
      cacheKey,
      revalidate,
      apiEndpoint,
      sessionId,
      enableCaching,
      cacheTtlHours
    });

    // Step 5: Store in cache if successful and caching is enabled
    if (aiResponse.success && enableCaching) {
      logger.info('💾 Storing new AI response in database cache...', {
        apiEndpoint,
        sessionId,
        cacheKey,
        ttlHours: cacheTtlHours
      });
      
      const cache = AIResponseCache.getInstance();
      const cacheStored = await cache.storeCachedResponse(
        {
          sessionId,
          cacheKey,
          apiEndpoint,
          ttlHours: cacheTtlHours
        },
        aiResponse
      );
      
      if (cacheStored) {
        logger.info('✅ AI response cached successfully', { apiEndpoint, sessionId });
      } else {
        logger.warn('⚠️ Failed to cache AI response', { apiEndpoint, sessionId });
      }
    }

    if (aiResponse.success) {
      logger.info('✅ Data fetch and AI generation successful');
      return {
        success: true,
        data: aiResponse.metadata?.dataSource !== 'fallback' ? 'API data available' : null,
        aiResponse,
      };
    } else {
      logger.warn('⚠️ AI generation failed, using fallback');
      return {
        success: fallbackOnError,
        data: null,
        aiResponse,
        error: aiResponse.error
      };
    }
  } catch (error) {
    logger.error('❌ Data fetch and AI generation failed:', error);
    
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
