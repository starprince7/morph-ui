// components/AIComponentRenderer.tsx
'use client';

import React, { useMemo, Suspense } from 'react';
import { AIComponentResponse } from '@/lib/types';

interface AIComponentRendererProps {
  aiResponse: AIComponentResponse;
  data?: any;
  className?: string;
}

const ComponentSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="border border-black/[.08] dark:border-white/[.145] rounded-lg p-6"
        >
          <div className="h-4 bg-black/[.05] dark:bg-white/[.06] rounded mb-4"></div>
          <div className="h-3 bg-black/[.05] dark:bg-white/[.06] rounded mb-2"></div>
          <div className="h-3 bg-black/[.05] dark:bg-white/[.06] rounded w-2/3"></div>
        </div>
      ))}
    </div>
  </div>
);

const ErrorFallback = ({ error }: { error: string }) => (
  <div className="flex flex-col items-center justify-center p-8 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
    <div className="text-center">
      <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
        Component Render Error
      </h3>
      <p className="text-sm text-red-600 dark:text-red-400 mb-4">
        Failed to render the AI-generated component
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

class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: (error: string) => React.ReactNode },
  { hasError: boolean; error: string | null }
> {
  constructor(props: { children: React.ReactNode; fallback: (error: string) => React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AI Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error || 'Unknown error');
    }

    return this.props.children;
  }
}

export default function AIComponentRenderer({ 
  aiResponse, 
  data = [], 
  className = '' 
}: AIComponentRendererProps) {
  const { RenderedComponent, error } = useMemo(() => {
    if (!aiResponse.success || !aiResponse.component) {
      return { 
        RenderedComponent: null, 
        error: aiResponse.error || 'Unknown error' 
      };
    }

    try {
      const executionContext = {
        React: React,
        useState: React.useState,
        useEffect: React.useEffect,
        useMemo: React.useMemo,
        useCallback: React.useCallback,
        useRef: React.useRef,
        useReducer: React.useReducer,
        useContext: React.useContext,
        Fragment: React.Fragment,
        StrictMode: React.StrictMode,
        console: {
          log: (...args: any[]) => console.log('[AI Component]:', ...args),
          error: (...args: any[]) => console.error('[AI Component]:', ...args),
          warn: (...args: any[]) => console.warn('[AI Component]:', ...args),
          info: (...args: any[]) => console.info('[AI Component]:', ...args),
        },
        JSON: JSON,
        Object: Object,
        Array: Array,
        Math: Math,
        Date: Date,
        String: String,
        Number: Number,
        Boolean: Boolean,
        window: undefined,
        document: undefined,
        global: undefined,
        process: undefined,
        require: undefined,
        module: undefined,
        exports: undefined,
      };

      let cleanCode = aiResponse.component.trim();

      if (process.env.NODE_ENV === 'development') {
        console.log('Raw AI Component Code:', cleanCode);
      }

      const syntaxIssues: string[] = [];

      const dollarMatches = cleanCode.match(/\$/g);
      if (dollarMatches) {
        cleanCode = cleanCode.replace(/\$([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '{$1}');
        cleanCode = cleanCode.replace(/\$(\d+)/g, '$$$1');
        cleanCode = cleanCode.replace(/\$(?![{`$])/g, '');
        syntaxIssues.push('Fixed $ character syntax');
      }

      cleanCode = cleanCode.replace(/\`([^`]*)\$([^{`]*)\`/g, '`$1\\${$2}`');
      cleanCode = cleanCode.replace(/\{\$\{([^}]+)\}\}/g, '`${$1}`');
      cleanCode = cleanCode.replace(/\$\{([^}]+)\}\/day/g, '`${$1}/day`');

      const openBraces = (cleanCode.match(/\{/g) || []).length;
      const closeBraces = (cleanCode.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        syntaxIssues.push(`Unmatched braces: ${openBraces} open, ${closeBraces} close`);
      }

      const openParens = (cleanCode.match(/\(/g) || []).length;
      const closeParens = (cleanCode.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        syntaxIssues.push(`Unmatched parentheses: ${openParens} open, ${closeParens} close`);
      }

      if (syntaxIssues.length > 0 && process.env.NODE_ENV === 'development') {
        console.warn('Syntax issues found and fixed:', syntaxIssues);
        console.log('Cleaned code:', cleanCode);
      }

      try {
        new Function(cleanCode);
      } catch (syntaxError) {
        console.error('Syntax validation failed after cleaning:', syntaxError);
        console.error('Final problematic code:', cleanCode);

        const functionMatch = cleanCode.match(/function GeneratedDataComponent[\s\S]*?^}/m);
        if (functionMatch) {
          cleanCode = functionMatch[0];
          try {
            new Function(cleanCode);
          } catch (finalError) {
            throw new Error(`Unable to fix syntax errors: ${(finalError as Error).message}`);
          }
        } else {
          throw new Error(`Invalid JavaScript syntax in generated code: ${(syntaxError as Error).message}`);
        }
      }

      if (!cleanCode.includes('function GeneratedDataComponent')) {
        throw new Error('Component must contain a function named "GeneratedDataComponent"');
      }

      const wrappedCode = `
        try {
          ${cleanCode}

          if (typeof GeneratedDataComponent !== 'function') {
            throw new Error('GeneratedDataComponent is not a function');
          }

          return GeneratedDataComponent;
        } catch (error) {
          console.error('Component code execution error:', error);
          throw new Error('Failed to execute component code: ' + error.message);
        }
      `;

      const componentFunction = new Function(
        ...Object.keys(executionContext),
        wrappedCode
      );

      const GeneratedComponent = componentFunction(...Object.values(executionContext));

      if (typeof GeneratedComponent !== 'function') {
        throw new Error('Generated code did not return a valid React component function');
      }

      try {
        React.createElement(GeneratedComponent, { data: [] });
      } catch (testError) {
        console.warn('Component test render failed:', testError);
      }

      return { RenderedComponent: GeneratedComponent, error: null };

    } catch (executionError) {
      console.error('Component execution error:', executionError);
      return { 
        RenderedComponent: null, 
        error: (executionError as Error).message || 'Component execution failed'
      };
    }
  }, [aiResponse]);

  if (error || !RenderedComponent) {
    return <ErrorFallback error={error || 'Failed to create component'} />;
  }

  return (
    <div className={`ai-component-container ${className}`}>
      <ComponentErrorBoundary fallback={(err: string) => <ErrorFallback error={err} />}>
        <Suspense fallback={<ComponentSkeleton />}>
          <RenderedComponent data={data} />
        </Suspense>
      </ComponentErrorBoundary>

      {process.env.NODE_ENV === 'development' && aiResponse.metadata && (
        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
          <div>Generated: {aiResponse.metadata.generatedAt}</div>
          <div>Source: {aiResponse.metadata.dataSource}</div>
          <div>Cache Key: {aiResponse.metadata.cacheKey}</div>
          <div>Data Items: {Array.isArray(data) ? data.length : typeof data}</div>
        </div>
      )}
    </div>
  );
}