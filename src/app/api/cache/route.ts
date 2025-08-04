import { NextRequest, NextResponse } from 'next/server';
import CacheManager from '@/lib/cache-utils';
import logger from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sessionId = searchParams.get('sessionId');

    const cacheManager = CacheManager.getInstance();

    switch (action) {
      case 'stats':
        const stats = await cacheManager.getCacheStats();
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'hit-rate':
        const timeRange = parseInt(searchParams.get('hours') || '24');
        const hitRate = await cacheManager.getCacheHitRate(timeRange);
        return NextResponse.json({
          success: true,
          data: hitRate
        });

      case 'session-endpoints':
        if (!sessionId) {
          return NextResponse.json({
            success: false,
            error: 'sessionId is required for session-endpoints action'
          }, { status: 400 });
        }
        
        // This would need to be implemented in SessionManager
        return NextResponse.json({
          success: true,
          data: { endpoints: [] } // Placeholder
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: stats, hit-rate, session-endpoints'
        }, { status: 400 });
    }
  } catch (error) {
    logger.error('Cache API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sessionId = searchParams.get('sessionId');

    const cacheManager = CacheManager.getInstance();

    switch (action) {
      case 'session':
        if (!sessionId) {
          return NextResponse.json({
            success: false,
            error: 'sessionId is required for session cache clearing'
          }, { status: 400 });
        }

        const clearResult = await cacheManager.clearSessionCache(sessionId);
        return NextResponse.json({
          success: true,
          data: clearResult
        });

      case 'expired':
        const deletedCount = await cacheManager.cleanupExpiredCache();
        return NextResponse.json({
          success: true,
          data: { deletedCount }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: session, expired'
        }, { status: 400 });
    }
  } catch (error) {
    logger.error('Cache DELETE API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
