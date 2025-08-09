"use client";

import React, { useState } from "react";
import { ThemeOption } from "@/lib/types";
import ThemeSwitcher from "./ThemeSwitcher";
import ReactRunnerRenderer from "./ReactRunnerRenderer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Runner } from "react-runner";
import { TestStringComponent } from "./TestStringComponent";

interface VisualizerClientWrapperProps {
  initialData: any;
  apiEndpoint: string;
}

export default function VisualizerClientWrapper({
  initialData,
  apiEndpoint,
}: VisualizerClientWrapperProps) {
  const [theme, setTheme] = useState<ThemeOption>("purple-night");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);

  // Function to regenerate component with new theme
  const regenerateComponent = async (newTheme: ThemeOption) => {
    setTheme(newTheme);
    setIsLoading(true);
    setError(null);

    try {
      // Call the API to generate a new component with the selected theme
      const response = await fetch(
        `/api/regenerate?endpoint=${encodeURIComponent(
          apiEndpoint
        )}&theme=${newTheme}`
      );

      if (!response.ok) {
        throw new Error(`Failed to regenerate component: ${response.status}`);
      }

      const newData = await response.json();
      setData(newData);
    } catch (err) {
      console.error("Error regenerating component:", err);
      setError(
        err instanceof Error ? err.message : "Failed to regenerate component"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme: ThemeOption) => {
    if (theme !== newTheme) {
      regenerateComponent(newTheme);
    }
  };

  // Pass scope for TestStringComponent
  const scope = {
    React,
    useState: React.useState,
    useEffect: React.useEffect,
    useMemo: React.useMemo,
    useCallback: React.useCallback,
  };

  return (
    <div className="w-full">
      {/* Theme Switcher */}
      <div className="flex justify-end mb-4 px-4">
        <ThemeSwitcher initialTheme={theme} onThemeChange={handleThemeChange} />
      </div>

      {/* <Runner code={TestStringComponent} scope={scope} /> */}

      {/* Component Display Area */}
      <div className="relative">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Component Generation Failed
            </h3>
            <p className="text-sm text-black/60 dark:text-white/60 mb-4">
              Unable to regenerate AI component with the selected theme.
            </p>
            <code className="text-xs bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded text-red-700 dark:text-red-300">
              {error}
            </code>
          </div>
        ) : data?.success ? (
          <ReactRunnerRenderer
            aiResponse={data}
            className="w-full min-h-[600px] p-4"
          />
        ) : (
          <div className="p-8 text-center">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
              No component data available
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
