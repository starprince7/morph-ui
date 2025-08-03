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

        {/* Features Navigation */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-6 text-center">
            Explore AI Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Link
              href="/ai-landing"
              className="group p-4 border border-black/[.08] dark:border-white/[.145] rounded-lg hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-black dark:text-white group-hover:underline">
                  AI Landing Pages
                </h3>
              </div>
              <p className="text-sm text-black/60 dark:text-white/60">
                Dynamic landing pages generated with AI for different industries and use cases
              </p>
            </Link>
            
            <Link
              href="/components"
              className="group p-4 border border-black/[.08] dark:border-white/[.145] rounded-lg hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-medium text-black dark:text-white group-hover:underline">
                  UI Components
                </h3>
              </div>
              <p className="text-sm text-black/60 dark:text-white/60">
                Design system components with variants, sizes, and comprehensive documentation
              </p>
            </Link>
            
            <Link
              href="/secure-ai-demo"
              className="group p-4 border border-black/[.08] dark:border-white/[.145] rounded-lg hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-medium text-black dark:text-white group-hover:underline">
                  Secure AI Demo
                </h3>
              </div>
              <p className="text-sm text-black/60 dark:text-white/60">
                AI-generated content rendered securely using react-runner with dynamic data fetching
              </p>
            </Link>
            
            <Link
              href="/api-endpoint-test"
              className="group p-4 border border-black/[.08] dark:border-white/[.145] rounded-lg hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <h3 className="font-medium text-black dark:text-white group-hover:underline">
                  Dynamic API Test
                </h3>
              </div>
              <p className="text-sm text-black/60 dark:text-white/60">
                Test AI component generation with different API endpoints (JSONPlaceholder demo)
              </p>
            </Link>
          </div>
        </section>

        {/* Documentation Link */}
        <section className="text-center">
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
