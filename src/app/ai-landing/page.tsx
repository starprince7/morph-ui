// app/ai-landing/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getAvailableSlugs } from '@/lib/landing-page-data-fetcher';

export const metadata: Metadata = {
  title: 'AI-Generated Landing Pages',
  description: 'Explore our collection of dynamically generated landing pages powered by AI',
  keywords: 'AI, landing pages, dynamic content, Next.js, React',
};

const LANDING_PAGE_DESCRIPTIONS = {
  'tech-startup': {
    title: 'Tech Startup',
    description: 'Modern SaaS platform with AI-powered features and analytics',
    category: 'Technology',
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  },
  'creative-agency': {
    title: 'Creative Agency',
    description: 'Design studio showcasing portfolio and creative services',
    category: 'Creative',
    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
  },
  'ecommerce-store': {
    title: 'E-commerce Store',
    description: 'Online retail platform with product showcase and shopping features',
    category: 'E-commerce',
    color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
  }
};

export default function AILandingIndex() {
  const availableSlugs = getAvailableSlugs();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#171717] dark:text-[#ededed]">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            AI-Generated Landing Pages
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Explore our collection of dynamically generated landing pages. Each page is created 
            in real-time using AI, showcasing different industries and use cases.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ai-landing/tech-startup">
              <Button variant="primary" size="default">
                View Demo
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" size="default">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Available Landing Pages */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Available Landing Pages
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {availableSlugs.map((slug) => {
              const info = LANDING_PAGE_DESCRIPTIONS[slug as keyof typeof LANDING_PAGE_DESCRIPTIONS] || {
                title: slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                description: `Dynamic landing page for ${slug}`,
                category: 'Generic',
                color: 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
              };

              return (
                <Link
                  key={slug}
                  href={`/ai-landing/${slug}`}
                  className="group block"
                >
                  <div className={`p-6 border rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${info.color}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 group-hover:underline">
                          {info.title}
                        </h3>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-black/[.05] dark:bg-white/[.06] rounded-full">
                          {info.category}
                        </span>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {info.description}
                    </p>
                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      AI-Generated
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-[#f2f2f2] dark:bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white dark:bg-[#0a0a0a] flex items-center justify-center border border-black/[.08] dark:border-white/[.145]">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-3">Data Fetching</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Server-side data fetching from APIs or mock data sources based on the URL slug
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white dark:bg-[#0a0a0a] flex items-center justify-center border border-black/[.08] dark:border-white/[.145]">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-3">AI Generation</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                GPT-4 generates React components following our design system and best practices
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white dark:bg-[#0a0a0a] flex items-center justify-center border border-black/[.08] dark:border-white/[.145]">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semtml-semibold mb-3">Safe Rendering</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Secure code execution with validation and sanitization for safe rendering
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Technical Implementation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border border-black/[.08] dark:border-white/[.145] rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Server-Side Rendering</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>True SSR with Next.js 15 App Router</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Server-side data fetching and AI generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>SEO-optimized with metadata generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Caching and performance optimization</span>
                </li>
              </ul>
            </div>
            
            <div className="p-6 border border-black/[.08] dark:border-white/[.145] rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Security & Safety</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Code validation and sanitization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Safe component execution context</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Error boundaries and fallback components</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Input validation and security checks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
