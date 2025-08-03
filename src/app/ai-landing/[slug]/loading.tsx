// app/ai-landing/[slug]/loading.tsx
export default function LandingPageLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#171717] dark:text-[#ededed]">
      {/* Hero Section Skeleton */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse">
            {/* Title skeleton */}
            <div className="h-12 sm:h-16 md:h-20 bg-black/[.05] dark:bg-white/[.06] rounded-lg mb-6 max-w-4xl mx-auto"></div>
            
            {/* Subtitle skeleton */}
            <div className="h-6 sm:h-8 bg-black/[.05] dark:bg-white/[.06] rounded-lg mb-8 max-w-3xl mx-auto"></div>
            <div className="h-6 sm:h-8 bg-black/[.05] dark:bg-white/[.06] rounded-lg mb-8 max-w-2xl mx-auto"></div>
            
            {/* CTA button skeleton */}
            <div className="h-12 w-40 bg-black/[.05] dark:bg-white/[.06] rounded-full mx-auto"></div>
          </div>
        </div>
      </section>
      
      {/* Content Section Skeleton */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            {/* Section title skeleton */}
            <div className="h-8 bg-black/[.05] dark:bg-white/[.06] rounded-lg mb-12 max-w-md mx-auto"></div>
            
            {/* Cards grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="p-6 border border-black/[.08] dark:border-white/[.145] rounded-lg"
                >
                  <div className="h-6 bg-black/[.05] dark:bg-white/[.06] rounded mb-4"></div>
                  <div className="h-4 bg-black/[.05] dark:bg-white/[.06] rounded mb-2"></div>
                  <div className="h-4 bg-black/[.05] dark:bg-white/[.06] rounded mb-2"></div>
                  <div className="h-4 bg-black/[.05] dark:bg-white/[.06] rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section Skeleton */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-[#f2f2f2] dark:bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-black/[.05] dark:bg-white/[.06] rounded-lg mb-6 max-w-lg mx-auto"></div>
            <div className="h-6 bg-black/[.05] dark:bg-white/[.06] rounded-lg mb-8 max-w-md mx-auto"></div>
            <div className="h-14 w-48 bg-black/[.05] dark:bg-white/[.06] rounded-full mx-auto"></div>
          </div>
        </div>
      </section>
      
      {/* Loading indicator */}
      <div className="fixed bottom-4 left-4 flex items-center gap-2 px-4 py-2 bg-black/80 text-white text-sm rounded-full">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        Generating landing page...
      </div>
    </div>
  );
}
