import Image from "next/image";
import Link from "next/link";
import { generateAIComponent, FALLBACK_COMPONENT } from "@/lib/ai-generator";
import AIComponentRenderer from "@/components/AIComponentRenderer";
import { AIComponentResponse } from "@/lib/types";

/**
 * Server-side AI component generation with full SSR
 * This is the ONLY function that performs data fetching and AI generation
 */
async function generateServerSideComponent(): Promise<AIComponentResponse> {
  try {
    console.log('🚀 Starting server-side AI component generation...');
    
    // Generate AI component with caching
    const result = await generateAIComponent({
      cacheKey: 'main-page-component',
      revalidate: 300, // 5 minutes
    });
    
    console.log('✅ AI component generation completed:', {
      success: result.success,
      hasComponent: !!result.component,
      error: result.error,
    });
    
    return result;
  } catch (error) {
    console.error('❌ Server-side component generation failed:', error);
    
    // Return fallback component on error
    return {
      success: false,
      component: FALLBACK_COMPONENT,
      componentName: 'GeneratedDataComponent',
      error: error instanceof Error ? error.message : 'Unknown server error',
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: 'fallback',
        cacheKey: 'fallback',
      },
    };
  }
}

/**
 * Main page component with true SSR implementation
 * All data fetching and AI generation happens server-side
 */
export default async function HomePage() {
  // Server-side AI component generation - no client-side loading states
  const aiComponentResponse = await generateServerSideComponent();
  
  return (
    <div className="font-sans min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="border-b border-black/[.08] dark:border-white/[.145]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-black dark:text-white">
              AI Portfolio Dashboard
            </h1>
            <div className="text-sm text-black/60 dark:text-white/60">
              Server-Side Rendered • Next.js v15
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className="mb-8 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {aiComponentResponse.success 
                ? '✅ AI Component Generated Successfully (SSR)' 
                : '⚠️ Using Fallback Component'}
            </span>
          </div>
          {aiComponentResponse.metadata && (
            <div className="mt-2 text-xs text-green-600 dark:text-green-400">
              Generated: {new Date(aiComponentResponse.metadata.generatedAt).toLocaleString()}
              {' • '}
              Source: {aiComponentResponse.metadata.dataSource}
            </div>
          )}
        </div>

        {/* AI-Generated Component Area */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
              Dynamic AI-Generated Content
            </h2>
            <p className="text-sm text-black/60 dark:text-white/60">
              This component is generated server-side using AI and real-time data.
              No client-side loading states - everything is pre-rendered.
            </p>
          </div>
          
          {/* Render AI Component */}
          <AIComponentRenderer 
            aiResponse={aiComponentResponse}
            className="w-full"
          />
        </section>

        {/* Navigation */}
        <section className="flex gap-4 justify-center">
          <Link 
            href="/components" 
            className="inline-flex items-center px-4 py-2 border border-black/[.08] dark:border-white/[.145] rounded-lg text-sm font-medium text-black dark:text-white hover:bg-black/[.05] dark:hover:bg-white/[.06] transition-colors"
          >
            View Components
          </Link>
          <Link 
            href="/docs" 
            className="inline-flex items-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-black/90 dark:hover:bg-white/90 transition-colors"
          >
            Documentation
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/[.08] dark:border-white/[.145] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-sm text-black/60 dark:text-white/60"
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  aria-hidden
                  src="/globe.svg"
                  alt="Globe icon"
                  width={16}
                  height={16}
                />
                Built with Next.js v15
              </a>
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-sm text-black/60 dark:text-white/60"
                href="https://openai.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  aria-hidden
                  src="/window.svg"
                  alt="AI icon"
                  width={16}
                  height={16}
                />
                Powered by OpenAI
              </a>
            </div>
            <div className="text-xs text-black/40 dark:text-white/40">
              PortfolioAI &copy; 2025 • Server-Side Rendered
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
