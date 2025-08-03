// app/ai-landing/[slug]/error.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LandingPageError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Landing page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#171717] dark:text-[#ededed] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        <div className="mb-8">
          {/* Error icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-red-600 dark:text-red-400">
            Landing Page Error
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Something went wrong while generating this landing page. This could be due to:
          </p>
          
          <ul className="text-left text-gray-600 dark:text-gray-400 mb-8 space-y-2 max-w-md mx-auto">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>AI service temporarily unavailable</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Invalid or missing data for this page</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Network connectivity issues</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Server overload or maintenance</span>
            </li>
          </ul>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            variant="primary"
            size="default"
            className="min-w-[140px]"
          >
            Try Again
          </Button>
          
          <Link href="/">
            <Button
              variant="secondary"
              size="default"
              className="min-w-[140px]"
            >
              Go Home
            </Button>
          </Link>
        </div>
        
        {/* Error details (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
              Developer Details
            </summary>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-sm space-y-2">
                <div>
                  <strong className="text-red-700 dark:text-red-300">Error:</strong>
                  <code className="ml-2 text-red-600 dark:text-red-400 text-xs">
                    {error.message}
                  </code>
                </div>
                {error.digest && (
                  <div>
                    <strong className="text-red-700 dark:text-red-300">Digest:</strong>
                    <code className="ml-2 text-red-600 dark:text-red-400 text-xs">
                      {error.digest}
                    </code>
                  </div>
                )}
                {error.stack && (
                  <div>
                    <strong className="text-red-700 dark:text-red-300">Stack:</strong>
                    <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto max-h-40 bg-red-100 dark:bg-red-900/40 p-2 rounded">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </details>
        )}
        
        {/* Help text */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          If this problem persists, please contact support or try a different landing page.
        </p>
      </div>
    </div>
  );
}
