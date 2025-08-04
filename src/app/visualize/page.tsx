import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ReactRunnerRenderer from '@/components/ReactRunnerRenderer';
import { fetchAiGeneratedUiComponent } from '@/utils/dataFetcher';

interface VisualizePageProps {
  searchParams: Promise<{ source?: string }>;
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="w-full min-h-[600px] p-8 animate-pulse">
      <div className="space-y-4">
        <div className="h-8 bg-black/[.05] dark:bg-white/[.06] rounded-lg w-3/4"></div>
        <div className="h-4 bg-black/[.05] dark:bg-white/[.06] rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-black/[.05] dark:bg-white/[.06] rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Server-side AI component generation for the visualize page
 */
async function generateVisualizationComponent(apiEndpoint: string) {
  try {
    console.log('🚀 Generating AI component for endpoint:', apiEndpoint);
    
    // Generate cache key from the API endpoint
    const cacheKey = `visualize-${apiEndpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    const result = await fetchAiGeneratedUiComponent({
      apiEndpoint,
      cacheKey,
      enableCaching: true,
      cacheTtlHours: 24,
      revalidate: 300, // 5 minutes
      fallbackOnError: true
    });
    
    console.log('✅ AI component generation completed:', {
      success: result.success,
      hasAiResponse: !!result.aiResponse,
      error: result.error,
    });
    
    return result;
  } catch (error) {
    console.error('❌ Visualization component generation failed:', error);
    throw error;
  }
}

export default async function VisualizePage({ searchParams }: VisualizePageProps) {
  const sourceUrl = await searchParams;
  
  // Redirect to home if no source URL provided
  if (!sourceUrl.source) {
    notFound();
  }
  
  // Validate URL format
  try {
    new URL(sourceUrl.source!);
  } catch {
    notFound();
  }
  
  // Generate AI component server-side
  const result = await generateVisualizationComponent(sourceUrl.source!);
  
  return (
    <div className="font-sans min-h-screen bg-white dark:bg-black">
      <Navigation />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* AI-Generated Component */}
        <div className="border border-black/[.08] dark:border-white/[.145] rounded-lg overflow-hidden">
          <div className="bg-black/[.02] dark:bg-white/[.02] px-4 py-3 border-b border-black/[.08] dark:border-white/[.145]">
            <h3 className="font-medium text-black dark:text-white">
              AI-Generated Component
            </h3>
            <p className="text-xs text-black/60 dark:text-white/60 mt-1">
              Component generated from your API endpoint data
            </p>
          </div>

          <div className="relative">
            <Suspense fallback={<LoadingSkeleton />}>
              {result.aiResponse ? (
                <ReactRunnerRenderer
                  aiResponse={result.aiResponse}
                  data={result.data}
                  className="w-full min-h-[600px] p-4"
                />
              ) : (
                <div className="p-8 text-center">
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                    Component Generation Failed
                  </h3>
                  <p className="text-sm text-black/60 dark:text-white/60 mb-4">
                    Unable to generate AI component from the provided endpoint.
                  </p>
                  {result.error && (
                    <code className="text-xs bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded text-red-700 dark:text-red-300">
                      {result.error}
                    </code>
                  )}
                </div>
              )}
            </Suspense>
          </div>
        </div>
        
        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
          >
            ← Try another API endpoint
          </a>
        </div>
      </main>
    </div>
  );
}

// Metadata for SEO
export async function generateMetadata({ searchParams }: VisualizePageProps) {
  const sourceUrl = await searchParams;
  
  if (!sourceUrl.source) {
    return {
      title: "Visualize API Data | MorphUI",
      description: "Generate beautiful UI components from any API endpoint"
    };
  }
  
  try {
    const url = new URL(sourceUrl.source!);
    return {
      title: `AI UI for ${url.hostname} | MorphUI`,
      description: `AI-generated UI component for ${sourceUrl.source} - automatically created from your API data structure`
    };
  } catch {
    return {
      title: "Visualize API Data | MorphUI",
      description: "Generate beautiful UI components from any API endpoint"
    };
  }
}
