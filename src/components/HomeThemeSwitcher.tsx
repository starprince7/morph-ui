'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { ThemeOption } from '@/lib/types';

export default function HomeThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2 bg-white/10 dark:bg-black/20 p-2 rounded-lg shadow-sm">
      <span className="text-xs font-medium text-black/70 dark:text-white/70">Theme:</span>
      <div className="flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          className={`px-3 py-1.5 text-xs font-medium rounded-l-md ${
            theme === 'purple-night'
              ? 'bg-[#5A189A] text-white'
              : 'bg-white/20 dark:bg-black/20 text-black/60 dark:text-white/60 hover:bg-[#9D4EDD]/20'
          }`}
          onClick={() => setTheme('purple-night')}
        >
          <span className="flex items-center">
            <span className="w-2 h-2 mr-1.5 rounded-full bg-[#9D4EDD]"></span>
            Purple Night
          </span>
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 text-xs font-medium rounded-r-md ${
            theme === 'ocean-blue'
              ? 'bg-[#2F6690] text-white'
              : 'bg-white/20 dark:bg-black/20 text-black/60 dark:text-white/60 hover:bg-[#81C3D7]/20'
          }`}
          onClick={() => setTheme('ocean-blue')}
        >
          <span className="flex items-center">
            <span className="w-2 h-2 mr-1.5 rounded-full bg-[#81C3D7]"></span>
            Ocean Blue
          </span>
        </button>
      </div>
    </div>
  );
}
