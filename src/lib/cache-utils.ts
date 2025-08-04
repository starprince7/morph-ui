import 'server-only';
import SessionManager from '@/lib/session-manager';
import AIResponseCache from '@/lib/ai-response-cache';
import logger from '@/utils/logger';

export interface CacheManagerOptions {
  sessionId?: string;
  enableCaching?: boolean;
  cacheTtlHours?: number;
}

export interface CacheStats {
  sessionStats: {
    totalSessions: number;
    totalEndpoints: number;
  };
  databaseStats: {
    totalCached: number;
    totalSessions: number;
    avgAccessCount: number;
    oldestCache: Date | null;
    newestCache: Date | null;
  };
}

/**
 * Utility class for managing cache operations and session management
 */
class CacheManager {
  private static instance: CacheManager;
  private sessionManager: SessionManager;
  private cacheService: AIResponseCache;

  private constructor() {
    this.sessionManager = SessionManager.getInstance();
    this.cacheService = AIResponseCache.getInstance();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Generate a cache key based on API endpoint and optional parameters
   */
  public generateCacheKey(apiEndpoint: string, additionalParams?: Record<string, any>): string {
    const baseKey = apiEndpoint.replace(/[^a-zA-Z0-9]/g, '_');
    
    if (additionalParams && Object.keys(additionalParams).length > 0) {
      const paramString = Object.entries(additionalParams)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
      
      const hash = this.simpleHash(paramString);
      return `${baseKey}_${hash}`;
    }
    
    return baseKey;
  }

  /**
   * Get comprehensive cache statistics
   */
  public async getCacheStats(): Promise<CacheStats> {
    try {
      const [sessionStats, databaseStats] = await Promise.all([
        this.sessionManager.getSessionStats(),
        this.cacheService.getCacheStats()
      ]);

      return {
        sessionStats,
        databaseStats
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return {
        sessionStats: { totalSessions: 0, totalEndpoints: 0 },
        databaseStats: {
          totalCached: 0,
          totalSessions: 0,
          avgAccessCount: 0,
          oldestCache: null,
          newestCache: null
        }
      };
    }
  }

  /**
   * Clear all cache for a specific session
   */
  public async clearSessionCache(sessionId: string): Promise<{
    sessionCleared: boolean;
    databaseCleared: number;
  }> {
    try {
      // Clear session data
      this.sessionManager.clearSession(sessionId);
      
      // Clear database cache for session
      const deletedCount = await this.cacheService.clearSessionCache(sessionId);
      
      logger.info(`Cleared cache for session ${sessionId}`, {
        sessionId,
        deletedCount
      });
      
      return {
        sessionCleared: true,
        databaseCleared: deletedCount
      };
    } catch (error) {
      logger.error('Error clearing session cache:', error);
      return {
        sessionCleared: false,
        databaseCleared: 0
      };
    }
  }

  /**
   * Cleanup expired cache entries
   */
  public async cleanupExpiredCache(): Promise<number> {
    try {
      const deletedCount = await this.cacheService.cleanupExpiredCache();
      
      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} expired cache entries`);
      }
      
      return deletedCount;
    } catch (error) {
      logger.error('Error during cache cleanup:', error);
      return 0;
    }
  }

  /**
   * Validate cache configuration
   */
  public validateCacheOptions(options: CacheManagerOptions): {
    isValid: boolean;
    errors: string[];
    sanitized: CacheManagerOptions;
  } {
    const errors: string[] = [];
    const sanitized: CacheManagerOptions = { ...options };

    // Validate TTL
    if (options.cacheTtlHours !== undefined) {
      if (options.cacheTtlHours < 0.1 || options.cacheTtlHours > 168) { // 6 minutes to 1 week
        errors.push('cacheTtlHours must be between 0.1 and 168 hours');
        sanitized.cacheTtlHours = 24; // Default to 24 hours
      }
    }

    // Validate session ID format
    if (options.sessionId && !/^[a-f0-9-]{36}$/i.test(options.sessionId)) {
      errors.push('sessionId must be a valid UUID format');
      sanitized.sessionId = undefined;
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Get cache hit rate for monitoring
   */
  public async getCacheHitRate(timeRangeHours: number = 24): Promise<{
    hitRate: number;
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
  }> {
    try {
      // This would require additional tracking in a real implementation
      // For now, return basic stats from database
      const stats = await this.cacheService.getCacheStats();
      
      // Estimate based on access count (simplified)
      const estimatedRequests = stats.avgAccessCount * stats.totalCached;
      const estimatedHits = estimatedRequests * 0.7; // Assume 70% hit rate
      
      return {
        hitRate: estimatedRequests > 0 ? estimatedHits / estimatedRequests : 0,
        totalRequests: Math.round(estimatedRequests),
        cacheHits: Math.round(estimatedHits),
        cacheMisses: Math.round(estimatedRequests - estimatedHits)
      };
    } catch (error) {
      logger.error('Error calculating cache hit rate:', error);
      return {
        hitRate: 0,
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0
      };
    }
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Preload cache for common endpoints
   */
  public async preloadCommonEndpoints(endpoints: string[]): Promise<{
    preloaded: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      preloaded: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const endpoint of endpoints) {
      try {
        // Check if already cached
        const cacheKey = this.generateCacheKey(endpoint);
        const cached = await this.cacheService.getCachedResponse({
          apiEndpoint: endpoint,
          cacheKey
        });

        if (!cached.found) {
          logger.info(`Endpoint ${endpoint} not in cache - would need AI generation for preload`);
          // In a real implementation, you might trigger AI generation here
        } else {
          results.preloaded++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to preload ${endpoint}: ${error}`);
      }
    }

    return results;
  }
}

export default CacheManager;
