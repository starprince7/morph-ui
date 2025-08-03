// app/ai-landing/[slug]/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getAvailableSlugs } from '@/lib/landing-page-data-fetcher';

export default function LandingPageNotFound() {
  const availableSlugs = getAvailableSlugs();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#171717] dark:text-[#ededed] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        <div className="mb-8">
          {/* 404 illustration */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          
          <h1 className="text-6xl sm:text-7xl font-bold mb-4 text-gray-300 dark:text-gray-700">
            404
          </h1>
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Landing Page Not Found
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            The landing page you're looking for doesn't exist or hasn't been generated yet.
          </p>
        </div>
        
        {/* Available landing pages */}
        {availableSlugs.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">
              Try one of these available landing pages:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              {availableSlugs.map((slug) => (
                <Link
                  key={slug}
                  href={`/ai-landing/${slug}`}
                  className="p-3 border border-black/[.08] dark:border-white/[.145] rounded-lg hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors text-sm"
                >
                  {slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button
              variant="primary"
              size="default"
              className="min-w-[140px]"
            >
              Go Home
            </Button>
          </Link>
          
          <Link href="/ai-landing/tech-startup">
            <Button
              variant="secondary"
              size="default"
              className="min-w-[140px]"
            >
              View Demo
            </Button>
          </Link>
        </div>
        
        {/* Help text */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            <strong>Want to create a custom landing page?</strong>
          </p>
          <p>
            Landing pages are generated dynamically based on the URL slug. 
            You can create new ones by adding data sources or using our API.
          </p>
        </div>
      </div>
    </div>
  );
}
