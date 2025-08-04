'use client';

import { useState } from 'react';
import { createOrGetSession } from '@/app/actions/session';

interface URLInputFormProps {
  onSubmit?: (url: string) => void;
}

const EXAMPLE_URLS = [
  'https://jsonplaceholder.typicode.com/posts',
  'https://jsonplaceholder.typicode.com/users',
  'https://api.github.com/users/octocat/repos',
  'https://httpbin.org/json'
];

export default function URLInputForm({ onSubmit }: URLInputFormProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid HTTP or HTTPS URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setIsValidating(true);

    try {
      // Validate URL accessibility
      const response = await fetch('/api/validate-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!result.valid) {
        setError(result.error || 'URL is not accessible');
        return;
      }

      // Create or get session before redirecting
      await createOrGetSession();
      
      // Redirect to visualize page
      window.location.href = `/visualize?source=${encodeURIComponent(url)}`;
      
      if (onSubmit) {
        onSubmit(url);
      }
    } catch (error) {
      console.error('URL validation error:', error);
      setError('Failed to validate URL. Please try again.');
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  };

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setError('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            placeholder="Enter your API endpoint URL..."
            className="w-full px-6 py-4 text-lg border border-black/[.08] dark:border-white/[.145] rounded-full bg-white dark:bg-black text-black dark:text-white placeholder:text-black/60 dark:placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-transparent transition-all duration-200"
            disabled={isLoading}
            required
          />
          {isValidating && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black dark:border-white"></div>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-black/80 dark:hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? 'Generating...' : 'Generate UI'}
          </button>
        </div>
      </form>

      {/* Example URLs */}
      <div className="mt-8">
        <p className="text-sm text-black/60 dark:text-white/60 text-center mb-4">
          Try these example APIs:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_URLS.map((exampleUrl, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(exampleUrl)}
              className="px-3 py-1 text-xs bg-black/[.05] dark:bg-white/[.06] text-black/70 dark:text-white/70 rounded-full hover:bg-black/[.08] dark:hover:bg-white/[.08] transition-colors duration-200"
              disabled={isLoading}
            >
              {exampleUrl.replace('https://', '').split('/')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}