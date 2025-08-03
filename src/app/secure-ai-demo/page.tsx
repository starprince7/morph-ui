import { Suspense } from "react";
import Link from "next/link";
import { fetchAiGeneratedUiComponent } from "@/utils/dataFetcher";
import ReactRunnerRenderer from "@/components/ReactRunnerRenderer";

/**
 * Server-side data fetching and AI generation
 * This demonstrates the requested flow:
 * 1. Server-side data fetching
 * 2. AI integration only when data is successful
 * 3. Secure iframe rendering
 */
async function generateSecureAIComponent() {
  const isDev = process.env.NODE_ENV === "development";
  const apiEndpoint = isDev
    ? "http://localhost:3000/api/get-data"
    : "https://api.starprince.dev/api/vehicle/listing";

  try {
    console.log("🚀 Starting secure AI component generation demo...");

    // Use the data fetcher that integrates with existing generateAIComponent
    // You can pass a custom API endpoint here:
    // apiEndpoint: 'https://your-custom-api.com/endpoint'
    const result = await fetchAiGeneratedUiComponent({
      cacheKey: "secure-demo-component",
      revalidate: 300, // 5 minutes
      fallbackOnError: true,
      apiEndpoint: apiEndpoint, // Custom endpoint (optional)
    });

    console.log("✅ Secure AI generation result:", {
      success: result.success,
      hasAIResponse: !!result.aiResponse,
      hasData: !!result.data,
      error: result.error,
    });

    return result;
  } catch (error) {
    console.error("❌ Secure AI component generation failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown server error",
      aiResponse: {
        success: false,
        component: "",
        componentName: "ErrorComponent",
        error: "Server-side generation failed",
        metadata: {
          generatedAt: new Date().toISOString(),
          dataSource: "error",
          cacheKey: "error",
        },
      },
    };
  }
}

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4 p-8">
    <div className="h-8 bg-black/[.05] dark:bg-white/[.06] rounded w-3/4"></div>
    <div className="h-4 bg-black/[.05] dark:bg-white/[.06] rounded w-1/2"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="border border-black/[.08] dark:border-white/[.145] rounded-lg p-6"
        >
          <div className="h-4 bg-black/[.05] dark:bg-white/[.06] rounded mb-4"></div>
          <div className="h-3 bg-black/[.05] dark:bg-white/[.06] rounded mb-2"></div>
          <div className="h-3 bg-black/[.05] dark:bg-white/[.06] rounded w-2/3"></div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Secure AI Demo Page
 *
 * This page demonstrates the requested implementation:
 * - Integration with existing generateAIComponent function
 * - Server-side data fetching with AI generation
 * - Secure iframe-based rendering using react-runner
 * - No new routes - works within existing page structure
 */
export default async function SecureAIDemoPage() {
  // Server-side data fetching and AI generation
  const result = await generateSecureAIComponent();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="border-b border-black/[.08] dark:border-white/[.145]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-black dark:text-white">
                Secure AI Component Demo
              </h1>
              <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                AI-generated content rendered securely in sandboxed iframe
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-black dark:text-white hover:bg-black/[.05] dark:hover:bg-white/[.06] rounded-full border border-black/[.08] dark:border-white/[.145] transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Information */}
        <div className="mb-8 p-4 rounded-lg border border-black/[.08] dark:border-white/[.145]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-black dark:text-white">
                Generation Status
              </h3>
              <p className="text-sm text-black/60 dark:text-white/60">
                {result.success
                  ? "AI component generated successfully and ready for secure rendering"
                  : "AI generation failed - showing fallback content"}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                result.success
                  ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                  : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
              }`}
            >
              {result.success ? "Success" : "Error"}
            </div>
          </div>
          {result.error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-300">
              <strong>Error:</strong> {result.error}
            </div>
          )}
        </div>

        {/* Secure AI Component Renderer */}
        <div className="border border-black/[.08] dark:border-white/[.145] rounded-lg overflow-hidden">
          <div className="bg-black/[.02] dark:bg-white/[.02] px-4 py-3 border-b border-black/[.08] dark:border-white/[.145]">
            <h3 className="font-medium text-black dark:text-white">
              AI-Generated Content (React Runner)
            </h3>
            <p className="text-xs text-black/60 dark:text-white/60 mt-1">
              Content below is rendered using React Runner for safe execution
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
                    No AI Response Available
                  </h3>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Unable to generate AI component. Please try again later.
                  </p>
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

// Metadata for SEO
export const metadata = {
  title: "Secure AI Component Demo | Portfolio AI",
  description:
    "Demonstration of secure AI-generated component rendering using sandboxed iframes and react-runner",
};
