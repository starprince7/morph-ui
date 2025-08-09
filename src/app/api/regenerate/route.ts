import { NextRequest, NextResponse } from 'next/server';
import { generateAIComponent } from '@/lib/ai-generator';
import { ThemeOption } from '@/lib/types';

export async function GET(request: NextRequest) {
  // Extract endpoint and theme from query parameters
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');
  const theme = searchParams.get('theme') as ThemeOption | null;

  // Validate required parameters
  if (!endpoint) {
    return NextResponse.json(
      { error: 'Missing required parameter: endpoint' },
      { status: 400 }
    );
  }

  // Validate theme
  if (theme && theme !== 'purple-night' && theme !== 'ocean-blue') {
    return NextResponse.json(
      { error: 'Invalid theme option. Must be "purple-night" or "ocean-blue"' },
      { status: 400 }
    );
  }

  try {
    // Create cache key from the API endpoint and theme
    const cacheKey = `visualize-${endpoint.replace(/[^a-zA-Z0-9]/g, "_")}-${theme || 'default'}`;

    // Generate the component with the specified theme
    const result = await generateAIComponent({
      apiEndpoint: endpoint,
      cacheKey,
      theme: theme || 'purple-night',
      enableCaching: false, // Don't cache theme variations to ensure fresh generation
      revalidate: 0, // No revalidation needed for theme variations
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Component regeneration failed:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to regenerate component',
        success: false,
      },
      { status: 500 }
    );
  }
}