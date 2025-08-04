'use client';

import React, { useState, useEffect } from 'react';
import { Runner } from 'react-runner';
import { AIComponentResponse } from '@/lib/types';
import { TestStringComponent } from './TestStringComponent';

interface ReactRunnerRendererProps {
  aiResponse: AIComponentResponse;
  data?: any;
  className?: string;
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
    <span className="ml-3 text-sm text-black/60 dark:text-white/60">
      Loading AI-generated content...
    </span>
  </div>
);

const ErrorFallback = ({ error }: { error: string }) => (
  <div className="flex flex-col items-center justify-center p-8 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
    <div className="text-center">
      <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
        React Runner Error
      </h3>
      <p className="text-sm text-red-600 dark:text-red-400 mb-4">
        Failed to render AI-generated component with React Runner
      </p>
      <details className="text-left">
        <summary className="cursor-pointer text-sm font-medium text-red-700 dark:text-red-300 mb-2">
          Error Details
        </summary>
        <code className="text-xs bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded text-red-800 dark:text-red-200 whitespace-pre-wrap block">
          {error}
        </code>
      </details>
    </div>
  </div>
);

/**
 * ReactRunnerRenderer - Renders AI-generated code using react-runner
 * 
 * This component provides secure execution of AI-generated React code using:
 * - react-runner for safe code execution
 * - Proper error handling and fallbacks
 * - Loading states and error boundaries
 */
export default function ReactRunnerRenderer({ 
  aiResponse, 
  data = [], 
  className = ''
}: ReactRunnerRendererProps) {
  const [error, setError] = useState<string | null>(null);

  // Handle AI response errors
  if (!aiResponse.success && aiResponse.error) {
    return <ErrorFallback error={aiResponse.error} />;
  }

  if (!aiResponse.component) {
    return <ErrorFallback error="No AI-generated component code available" />;
  }

  // Create simple scope with only React hooks - no data props needed
  // AI generates complete UI with actual data, doesn't need props
  const scope = {
    React,
    useState: React.useState,
    useEffect: React.useEffect,
    useMemo: React.useMemo,
    useCallback: React.useCallback,
  };

  // Test with simple code first
  const testCode = `
    function TestComponent() {
      return React.createElement('div', { style: { padding: '20px', background: 'lightblue' } }, 'Hello from React Runner!');
    }
    TestComponent;
  `;

  try {
    return (
      <div className={`relative ${className}`}>
        <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
          <strong>Debug Info:</strong> React Runner executing {aiResponse.component.length} chars of code
        </div>
        
        <div className="mb-4 p-4 border border-green-200 rounded">
          <h3 className="text-sm font-bold mb-2">React Runner Test:</h3>
          <Runner
            code={TestStringComponent}
            scope={scope}
          />
        </div>
        
        <div className="p-4 border border-gray-200 rounded">
          <h3 className="text-sm font-bold mb-2">AI Generated Component:</h3>
          <Runner
            code={aiResponse.component}
            scope={scope}
          />
        </div>
        
        {error && <ErrorFallback error={error} />}
      </div>
    );
  } catch (runnerError) {
    console.error('React Runner error:', runnerError);
    return <ErrorFallback error={runnerError instanceof Error ? runnerError.message : String(runnerError)} />;
  }
}
