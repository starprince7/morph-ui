'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeOption } from '@/lib/types';

interface ThemeContextType {
  theme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeOption>('purple-night');

  // Load theme from localStorage on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('ui-theme-preference') as ThemeOption | null;
    if (savedTheme && (savedTheme === 'purple-night' || savedTheme === 'ocean-blue')) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage whenever it changes
  const handleThemeChange = (newTheme: ThemeOption) => {
    setTheme(newTheme);
    localStorage.setItem('ui-theme-preference', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
