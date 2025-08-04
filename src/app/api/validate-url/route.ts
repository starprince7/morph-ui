import { NextRequest, NextResponse } from 'next/server';

interface ValidateUrlRequest {
  url: string;
}

interface ValidateUrlResponse {
  valid: boolean;
  error?: string;
  contentType?: string;
  status?: number;
}

/**
 * Validates if a URL is accessible and returns JSON data
 */
export async function POST(request: NextRequest): Promise<NextResponse<ValidateUrlResponse>> {
  try {
    const body: ValidateUrlRequest = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { valid: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return NextResponse.json(
        { valid: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Only allow HTTP and HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' },
        { status: 400 }
      );
    }

    // Test URL accessibility with HEAD request
    try {
      console.log('🔍 Validating URL accessibility:', url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'MorphUI-Validator/1.0',
        },
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      
      console.log('✅ URL validation result:', {
        url,
        status: response.status,
        contentType,
        ok: response.ok
      });

      if (!response.ok) {
        return NextResponse.json({
          valid: false,
          error: `URL returned status ${response.status}`,
          status: response.status
        });
      }

      // Check if it's likely to return JSON data
      const isJsonApi = contentType.includes('application/json') || 
                       contentType.includes('text/json') ||
                       url.includes('/api/') ||
                       url.includes('.json');

      if (!isJsonApi) {
        console.log('⚠️ URL may not return JSON data:', { url, contentType });
        // Still allow it, but warn the user
      }

      return NextResponse.json({
        valid: true,
        contentType,
        status: response.status
      });

    } catch (error) {
      console.error('❌ URL validation failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return NextResponse.json({
            valid: false,
            error: 'URL request timed out (10 seconds)'
          });
        }
        
        return NextResponse.json({
          valid: false,
          error: `Network error: ${error.message}`
        });
      }

      return NextResponse.json({
        valid: false,
        error: 'Unknown error occurred while validating URL'
      });
    }

  } catch (error) {
    console.error('❌ URL validation endpoint error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}