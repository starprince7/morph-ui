// app/ai-landing/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AIComponentRenderer from '@/components/AIComponentRenderer';
import { fetchLandingPageData } from '@/lib/landing-page-data-fetcher';
import { generateLandingPageComponent } from '@/lib/landing-page-ai-generator';
import { LandingPageData, AIComponentResponse } from '@/lib/types';

interface LandingPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate metadata for the landing page
 */
export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  try {
    const landingPageData = await fetchLandingPageData({
      slug: params.slug,
      cacheOptions: {
        revalidate: 3600, // 1 hour
        tags: [`landing-page-${params.slug}`]
      }
    });

    return {
      title: landingPageData.title,
      description: landingPageData.description,
      keywords: landingPageData.metadata?.tags?.join(', '),
      openGraph: {
        title: landingPageData.title,
        description: landingPageData.description,
        type: 'website',
        url: `/ai-landing/${params.slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: landingPageData.title,
        description: landingPageData.description,
      },
    };
  } catch (error) {
    console.error(`Metadata generation failed for slug "${params.slug}":`, error);
    return {
      title: `Landing Page - ${params.slug}`,
      description: `Dynamic landing page for ${params.slug}`,
    };
  }
}

/**
 * Server-side landing page generation
 */
async function generateServerSideLandingPage(slug: string): Promise<{
  landingPageData: LandingPageData;
  aiResponse: AIComponentResponse;
}> {
  try {
    console.log(`🚀 Starting server-side landing page generation for slug: ${slug}`);
    
    // Fetch data for the landing page
    const landingPageData = await fetchLandingPageData({
      slug,
      cacheOptions: {
        revalidate: 300, // 5 minutes
        tags: [`landing-page-${slug}`]
      }
    });

    // Generate AI component with caching
    const aiResponse = await generateLandingPageComponent(landingPageData, {
      slug,
      cacheKey: `landing-page-${slug}`,
      revalidate: 300,
      landingPageType: landingPageData.metadata?.category as any || 'generic'
    });
    
    console.log(`✅ Landing page generation completed for slug: ${slug}`, {
      success: aiResponse.success,
      hasComponent: !!aiResponse.component,
      error: aiResponse.error,
    });
    
    return { landingPageData, aiResponse };
  } catch (error) {
    console.error(`❌ Server-side landing page generation failed for slug "${slug}":`, error);
    
    // Create minimal fallback data
    const fallbackData: LandingPageData = {
      slug,
      title: `Error Loading ${slug}`,
      description: 'Failed to load landing page data',
      data: {
        error: true,
        message: 'Landing page generation failed',
        slug
      },
      metadata: {
        category: 'error',
        tags: ['error'],
        lastUpdated: new Date().toISOString()
      }
    };

    const fallbackResponse: AIComponentResponse = {
      success: false,
      component: `'use client';

function GeneratedDataComponent({ data }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#171717] dark:text-[#ededed] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-red-600 dark:text-red-400">
          Landing Page Error
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Failed to generate landing page for "${slug}". Please try again later.
        </p>
        <div className="p-6 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error: ${error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    </div>
  );
}`,
      componentName: 'GeneratedDataComponent',
      error: error instanceof Error ? error.message : 'Unknown server error',
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: 'error-fallback',
        cacheKey: 'error-fallback',
      },
    };

    return { landingPageData: fallbackData, aiResponse: fallbackResponse };
  }
}

/**
 * Main landing page component with true SSR implementation
 */
export default async function LandingPage({ params }: LandingPageProps) {
  const { slug } = await params;

  // Validate slug format
  if (!slug || typeof slug !== 'string' || slug.length === 0) {
    notFound();
  }

  // Generate the landing page server-side
  const { landingPageData, aiResponse } = await generateServerSideLandingPage(slug);

  // If data fetching completely failed, show 404
  if (landingPageData.data?.error && !aiResponse.component) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      {/* SEO-friendly structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: landingPageData.title,
            description: landingPageData.description,
            url: `/ai-landing/${slug}`,
            dateModified: landingPageData.metadata?.lastUpdated,
            keywords: landingPageData.metadata?.tags?.join(', '),
          }),
        }}
      />

      {/* Render the AI-generated landing page */}
      <AIComponentRenderer
        aiResponse={aiResponse}
        data={landingPageData.data}
        className="w-full"
      />

      {/* Development info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white text-xs rounded-lg max-w-xs">
          <div className="font-semibold mb-2">Debug Info</div>
          <div>Slug: {slug}</div>
          <div>Success: {aiResponse.success ? '✅' : '❌'}</div>
          <div>Category: {landingPageData.metadata?.category}</div>
          <div>Generated: {new Date(aiResponse.metadata?.generatedAt || '').toLocaleTimeString()}</div>
        </div>
      )}
    </main>
  );
}

/**
 * Generate static params for known landing pages (optional)
 * This enables static generation for common landing pages
 */
export async function generateStaticParams() {
  // Import here to avoid circular dependencies
  const { getAvailableSlugs } = await import('@/lib/landing-page-data-fetcher');
  
  const slugs = getAvailableSlugs();
  
  return slugs.map((slug) => ({
    slug,
  }));
}
