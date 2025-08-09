import { Suspense } from "react";
import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation";
import VisualizerClientWrapper from "@/components/VisualizerClientWrapper";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { fetchAiGeneratedUiComponent } from "@/utils/dataFetcher";
import { ThemeOption } from "@/lib/types";

interface VisualizePageProps {
  params: Promise<{}>;
  searchParams: Promise<{ 
    source?: string;
    theme?: string;
  }>;
}

/**
 * Server-side AI component generation for the visualize page
 */
async function generateVisualizationComponent(apiEndpoint: string, theme?: string) {
  try {
    console.log("🚀 Generating AI component for endpoint:", apiEndpoint);

    // Generate cache key from the API endpoint
    const cacheKey = `visualize-${apiEndpoint.replace(/[^a-zA-Z0-9]/g, "_")}`;

    // Call fetchAiGeneratedUiComponent with options object
    const result = await fetchAiGeneratedUiComponent(
      apiEndpoint, 
      {
        theme: theme as ThemeOption | undefined,
        enableCaching: true,
        revalidate: 300, // 5 minutes
      }
    );

    console.log("✅ AI component generation completed:", {
      success: result.success,
      hasData: !!result.data,
      error: result.error,
    });

    return result;
  } catch (error) {
    console.error("❌ Visualization component generation failed:", error);
    throw error;
  }
}

export default async function VisualizePage({
  params,
  searchParams,
}: VisualizePageProps) {
  const searchParamsData = await searchParams;
  
  const sourceUrl = {
    source: searchParamsData.source || null,
  };
  
  // Get theme from query params (default to purple-night)
  const theme = searchParamsData.theme === 'ocean-blue' ? 'ocean-blue' : 'purple-night';

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

  // Generate component for visualization if source URL is provided
  // const result = await generateVisualizationComponent(sourceUrl.source, theme);
  const result = null

  return (
    <div className="font-sans min-h-screen bg-white dark:bg-black">
      <Navigation />
      {/* Main Content */}
      {/* AI-Generated Component with Theme Switcher */}
      <div className="relative">
        <Suspense fallback={<LoadingSkeleton />}>
          <VisualizerClientWrapper 
            initialData={result}
            apiEndpoint={sourceUrl.source!}
          />
        </Suspense>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
export async function generateMetadata({ params, searchParams }: VisualizePageProps) {
  const searchParamsData = await searchParams;

  if (!searchParamsData.source) {
    return {
      title: "Visualize API Data | MorphUI",
      description: "Generate beautiful UI components from any API endpoint",
    };
  }

  try {
    const url = new URL(searchParamsData.source!);
    return {
      title: `AI UI for ${url.hostname} | MorphUI`,
      description: `AI-generated UI component for ${searchParamsData.source} - automatically created from your API data structure`,
    };
  } catch {
    return {
      title: "Visualize API Data | MorphUI",
      description: "Generate beautiful UI components from any API endpoint",
    };
  }
}