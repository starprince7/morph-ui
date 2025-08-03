// Hook for using the AI component renderer with data fetching

import React from "react";

interface RenderAIGeneratedCodeResponse {
  success: boolean;
  component: string;
  componentName: string;
  description?: string;
  imports?: string[];
  props?: Record<string, any>;
  styling?: {
    responsive: boolean;
    darkMode: boolean;
    accessibility: boolean;
  };
  error?: string;
}

export function useAiGeneratedJsx(
  generateUIFunction: () => Promise<RenderAIGeneratedCodeResponse>
) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [aiResponse, setAiResponse] =
    React.useState<RenderAIGeneratedCodeResponse | null>(null);

  const generateComponent = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await generateUIFunction();
      setAiResponse(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate component"
      );
    } finally {
      setLoading(false);
    }
  }, [generateUIFunction]);

  return {
    aiResponse,
    loading,
    error,
    generateComponent,
  };
}