import Link from "next/link";

export default function Navigation() {
  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link 
            href="/"
            className="text-2xl font-bold text-black dark:text-white hover:opacity-80 transition-opacity"
          >
            MorphUI
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/visualize"
              className="text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
            >
              Visualize
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
