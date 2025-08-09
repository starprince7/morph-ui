'use client';

import { useState, useEffect } from 'react';
import { ThemeOption } from '@/lib/types';

interface ThemeSwitcherProps {
  initialTheme?: ThemeOption;
  onThemeChange: (theme: ThemeOption) => void;
}

export default function ThemeSwitcher({ initialTheme = 'purple-night', onThemeChange }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<ThemeOption>(initialTheme);

  // Update the theme when changed
  const handleThemeChange = (newTheme: ThemeOption) => {
    setTheme(newTheme);
    onThemeChange(newTheme);
    // Store the theme preference in localStorage
    localStorage.setItem('ui-theme-preference', newTheme);
  };

  // Load theme preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('ui-theme-preference') as ThemeOption | null;
    if (savedTheme && (savedTheme === 'purple-night' || savedTheme === 'ocean-blue')) {
      setTheme(savedTheme);
      onThemeChange(savedTheme);
    }
  }, [onThemeChange]);

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
          onClick={() => handleThemeChange('purple-night')}
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
          onClick={() => handleThemeChange('ocean-blue')}
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
