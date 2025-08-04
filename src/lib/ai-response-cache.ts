import 'server-only';
import { AIComponentResponse } from '@/lib/types';
import AiResponseModel, { IAiResponse } from '@/database/models/ai-response-schema';
import { db } from '@/database/connection';
import logger from '@/utils/logger';
import { Document } from 'mongoose';

export interface CacheOptions {
  sessionId?: string;
  cacheKey: string;
  apiEndpoint: string;
  ttlHours?: number; // Time to live in hours
}

export interface CacheResult {
  found: boolean;
  data?: AIComponentResponse;
  metadata?: {
    createdAt: Date;
    accessCount: number;
    lastAccessedAt: Date;
  };
}

class AIResponseCache {
  private static instance: AIResponseCache;
  private readonly DEFAULT_TTL_HOURS = 24;

  private constructor() {}

  public static getInstance(): AIResponseCache {
    if (!AIResponseCache.instance) {
      AIResponseCache.instance = new AIResponseCache();
    }
    return AIResponseCache.instance;
  }

  /**
   * Get cached AI response by API endpoint and session
   */
  public async getCachedResponse(options: CacheOptions): Promise<CacheResult> {
    try {
      await this.ensureConnection();

      const query: any = {
        apiEndpoint: options.apiEndpoint,
        // cacheKey: options.cacheKey
      };

      // Add session filter if provided
      if (options.sessionId) {
        query.sessionId = options.sessionId;
      }

      const cachedResponse = await AiResponseModel.findOne(query)
        .sort({ createdAt: -1 }) // Get the most recent
        .lean() as (IAiResponse & { _id: any }) | null;

      if (!cachedResponse) {
        logger.info(`Cache miss for endpoint: ${options.apiEndpoint}`);
        return { found: false };
      }

      // Check if cache has expired
      if (cachedResponse.expiresAt && new Date() > cachedResponse.expiresAt) {
        logger.info(`Cache expired for endpoint: ${options.apiEndpoint}`);
        // Optionally delete expired cache
        await this.deleteCachedResponse(options);
        return { found: false };
      }

      // Update access statistics
      await this.updateAccessStats(cachedResponse._id);

      logger.info(`Cache hit for endpoint: ${options.apiEndpoint}`);
      return {
        found: true,
        data: cachedResponse.aiResponse,
        metadata: {
          createdAt: cachedResponse.createdAt,
          accessCount: cachedResponse.accessCount + 1,
          lastAccessedAt: new Date()
        }
      };
    } catch (error) {
      logger.error('Error retrieving cached response:', error);
      return { found: false };
    }
  }

  /**
   * Store AI response in cache
   */
  public async storeCachedResponse(
    options: CacheOptions,
    aiResponse: AIComponentResponse
  ): Promise<boolean> {
    try {
      await this.ensureConnection();

      const ttlHours = options.ttlHours || this.DEFAULT_TTL_HOURS;
      const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

      const cacheData: Partial<IAiResponse> = {
        apiEndpoint: options.apiEndpoint,
        sessionId: options.sessionId,
        cacheKey: options.cacheKey,
        aiResponse,
        accessCount: 0,
        lastAccessedAt: new Date(),
        expiresAt
      };

      // Use upsert to handle duplicates
      await AiResponseModel.findOneAndUpdate(
        {
          apiEndpoint: options.apiEndpoint,
          cacheKey: options.cacheKey,
          sessionId: options.sessionId
        },
        cacheData,
        {
          upsert: true,
          new: true
        }
      );

      logger.info(`Cached AI response for endpoint: ${options.apiEndpoint}`);
      return true;
    } catch (error) {
      logger.error('Error storing cached response:', error);
      return false;
    }
  }

  /**
   * Delete cached response
   */
  public async deleteCachedResponse(options: CacheOptions): Promise<boolean> {
    try {
      await this.ensureConnection();

      const query: any = {
        apiEndpoint: options.apiEndpoint,
        cacheKey: options.cacheKey
      };

      if (options.sessionId) {
        query.sessionId = options.sessionId;
      }

      await AiResponseModel.deleteOne(query);
      logger.info(`Deleted cached response for endpoint: ${options.apiEndpoint}`);
      return true;
    } catch (error) {
      logger.error('Error deleting cached response:', error);
      return false;
    }
  }

  /**
   * Clear all cached responses for a session
   */
  public async clearSessionCache(sessionId: string): Promise<number> {
    try {
      await this.ensureConnection();

      const result = await AiResponseModel.deleteMany({ sessionId });
      logger.info(`Cleared ${result.deletedCount} cached responses for session: ${sessionId}`);
      return result.deletedCount || 0;
    } catch (error) {
      logger.error('Error clearing session cache:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  public async getCacheStats(): Promise<{
    totalCached: number;
    totalSessions: number;
    avgAccessCount: number;
    oldestCache: Date | null;
    newestCache: Date | null;
  }> {
    try {
      await this.ensureConnection();

      const [totalCount, sessionCount, avgAccess, oldestDoc, newestDoc] = await Promise.all([
        AiResponseModel.countDocuments(),
        AiResponseModel.distinct('sessionId').then(sessions => sessions.length),
        AiResponseModel.aggregate([
          { $group: { _id: null, avgAccess: { $avg: '$accessCount' } } }
        ]),
        AiResponseModel.findOne().sort({ createdAt: 1 }).select('createdAt'),
        AiResponseModel.findOne().sort({ createdAt: -1 }).select('createdAt')
      ]);

      return {
        totalCached: totalCount,
        totalSessions: sessionCount,
        avgAccessCount: avgAccess[0]?.avgAccess || 0,
        oldestCache: oldestDoc?.createdAt || null,
        newestCache: newestDoc?.createdAt || null
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return {
        totalCached: 0,
        totalSessions: 0,
        avgAccessCount: 0,
        oldestCache: null,
        newestCache: null
      };
    }
  }

  /**
   * Clean up expired cache entries
   */
  public async cleanupExpiredCache(): Promise<number> {
    try {
      await this.ensureConnection();

      const result = await AiResponseModel.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      const deletedCount = result.deletedCount || 0;
      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} expired cache entries`);
      }
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up expired cache:', error);
      return 0;
    }
  }

  /**
   * Update access statistics for a cached response
   */
  private async updateAccessStats(cacheId: any): Promise<void> {
    try {
      await AiResponseModel.findByIdAndUpdate(cacheId, {
        $inc: { accessCount: 1 },
        $set: { lastAccessedAt: new Date() }
      });
    } catch (error) {
      logger.error('Error updating access stats:', error);
    }
  }

  /**
   * Ensure database connection
   */
  private async ensureConnection(): Promise<void> {
    await db.start();
  }
}

export default AIResponseCache;
