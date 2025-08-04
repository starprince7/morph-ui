import Navigation from '@/components/Navigation';
import URLInputForm from '@/components/URLInputForm';

/**
 * Main page with Google search-like UI for URL input
 */
export default function HomePage() {
  return (
    <div className="font-sans min-h-screen bg-white dark:bg-black">
      <Navigation />
      
      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 sm:px-6 lg:px-8">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-black dark:text-white mb-4">
            MorphUI
          </h1>
          <p className="text-lg sm:text-xl text-black/60 dark:text-white/60 max-w-2xl mx-auto">
            The UI builds itself — just give it an API
          </p>
        </div>
        
        {/* URL Input Form */}
        <URLInputForm />
        
        {/* Tagline */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed">
            Enter any JSON API endpoint and watch as AI automatically generates a beautiful, 
            interactive UI component tailored to your data structure. Perfect for rapid prototyping, 
            data visualization, and API testing.
          </p>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-black/[.08] dark:border-white/[.145] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-black/40 dark:text-white/40">
            <span>Powered by OpenAI & Next.js v15</span>
            <span className="hidden sm:inline">•</span>
            <span>MorphUI &copy; 2025</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Metadata for SEO
export const metadata = {
  title: "MorphUI | The UI builds itself",
  description: "Enter any JSON API endpoint and watch as AI automatically generates a beautiful, interactive UI component tailored to your data structure. Perfect for rapid prototyping, data visualization, and API testing.",
  keywords: "AI, UI generation, API visualization, dynamic components, React, Next.js",
  openGraph: {
    title: "MorphUI",
    description: "The UI builds itself — just give it an API",
    type: "website",
  },
};
