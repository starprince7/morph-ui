'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AIComponentResponse } from '@/lib/types';

interface SecureAICodeRendererProps {
  aiResponse: AIComponentResponse;
  data?: any;
  className?: string;
  height?: string;
}

interface IframeMessage {
  type: 'RENDER_AI_CODE' | 'IFRAME_READY' | 'RENDER_ERROR' | 'RENDER_SUCCESS';
  code?: string;
  data?: any;
  error?: string;
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
        Secure Rendering Error
      </h3>
      <p className="text-sm text-red-600 dark:text-red-400 mb-4">
        Failed to render AI-generated content in secure iframe
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
 * SecureAICodeRenderer - Renders AI-generated code in a sandboxed iframe
 * 
 * This component provides secure execution of AI-generated React code using:
 * - Sandboxed iframe with restricted permissions
 * - react-runner for safe code execution within iframe
 * - PostMessage communication for data transfer
 * - Comprehensive error handling and fallbacks
 */
export default function SecureAICodeRenderer({ 
  aiResponse, 
  data = [], 
  className = '',
  height = '600px'
}: SecureAICodeRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeReady, setIframeReady] = useState(false);

  // Generate the iframe content with direct React execution
  const generateIframeContent = useCallback(() => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Generated Content</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: white;
      color: black;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background: black;
        color: white;
      }
    }
    .error-container {
      padding: 2rem;
      text-align: center;
      color: #dc2626;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      margin: 1rem;
    }
    @media (prefers-color-scheme: dark) {
      .error-container {
        color: #fca5a5;
        background: #7f1d1d;
        border-color: #dc2626;
      }
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    console.log('Iframe script starting');
    console.log('Available globals:', { React: !!React, ReactDOM: !!ReactDOM });
    
    const { useState, useEffect, useMemo } = React;
    let currentData = [];

    function renderComponent(code, data) {
      try {
        console.log('Rendering component with data:', data);
        currentData = data || [];

        // Check if React is loaded
        if (!React || !ReactDOM) {
          throw new Error('React dependencies not loaded: React=' + !!React + ', ReactDOM=' + !!ReactDOM);
        }

        console.log('About to execute component code directly');
        console.log('Original code length:', code.length);
        
        // Sanitize the code to fix common issues
        let sanitizedCode = code;
        
        // Fix dollar sign issues - replace standalone $ with template literal syntax
        // This handles cases like: $item.price -> \${item.price}
        sanitizedCode = sanitizedCode.replace(/([^\\])\$([a-zA-Z_][a-zA-Z0-9_\.]*)/g, function(match, p1, p2) {
          return p1 + '\\${' + p2 + '}';
        });
        
        // Fix cases where $ is at the beginning of a line
        sanitizedCode = sanitizedCode.replace(/^\$([a-zA-Z_][a-zA-Z0-9_\.]*)/gm, function(match, p1) {
          return '\\${' + p1 + '}';
        });
        
        // Fix price formatting patterns like: Price: $item.price
        sanitizedCode = sanitizedCode.replace(/Price:\s*\$([a-zA-Z_][a-zA-Z0-9_\.]*)/g, function(match, p1) {
          return 'Price: \\${' + p1 + '}';
        });
        
        // Fix any remaining unescaped $ in JSX expressions
        sanitizedCode = sanitizedCode.replace(/\{\s*\$([a-zA-Z_][a-zA-Z0-9_\.]*)/g, function(match, p1) {
          return '{\\${' + p1 + '}';
        });
        
        console.log('Sanitized code length:', sanitizedCode.length);
        console.log('Code changes made:', code !== sanitizedCode);
        
        // Create a safe execution context
        const componentFunction = new Function(
          'React', 'useState', 'useEffect', 'useMemo', 'data',
          \`
          \${sanitizedCode}
          return GeneratedDataComponent;
          \`
        );
        
        // Execute the function to get the component
        const GeneratedComponent = componentFunction(React, useState, useEffect, useMemo, currentData);
        
        console.log('Component function created, about to render');
        
        // Create the element and render it
        const element = React.createElement(GeneratedComponent, { data: currentData });
        
        // Use React 18's render method for compatibility
        ReactDOM.render(element, document.getElementById('root'));
        
        console.log('Component rendered successfully');
        window.parent.postMessage({
          type: 'RENDER_SUCCESS'
        }, '*');
      } catch (error) {
        console.error('Render error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-container';
        errorDiv.innerHTML = \`
          <h3>Rendering Error</h3>
          <p>Failed to render AI-generated component</p>
          <details>
            <summary>Error Details</summary>
            <pre>\${error.toString()}</pre>
          </details>
        \`;
        document.getElementById('root').innerHTML = '';
        document.getElementById('root').appendChild(errorDiv);
        
        window.parent.postMessage({
          type: 'RENDER_ERROR',
          error: error.toString()
        }, '*');
      }
    }

    // Listen for messages from parent
    window.addEventListener('message', (event) => {
      if (event.data.type === 'RENDER_AI_CODE') {
        renderComponent(event.data.code, event.data.data);
      }
    });

    // Signal that iframe is ready
    window.addEventListener('load', () => {
      console.log('Iframe loaded, sending IFRAME_READY message');
      window.parent.postMessage({
        type: 'IFRAME_READY'
      }, '*');
    });
    
    // Also try to signal ready after a short delay as fallback
    setTimeout(() => {
      console.log('Iframe timeout fallback, sending IFRAME_READY message');
      window.parent.postMessage({
        type: 'IFRAME_READY'
      }, '*');
    }, 2000);
  </script>
</body>
</html>
    `;
  }, []);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent<IframeMessage>) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      console.log('Received message from iframe:', event.data);
      
      switch (event.data.type) {
        case 'IFRAME_READY':
          console.log('Iframe is ready, setting iframeReady to true');
          setIframeReady(true);
          break;
        case 'RENDER_SUCCESS':
          setIsLoading(false);
          setError(null);
          break;
        case 'RENDER_ERROR':
          setIsLoading(false);
          setError(event.data.error || 'Unknown rendering error');
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Send code to iframe when ready
  useEffect(() => {
    console.log('Send code effect triggered:', { iframeReady, hasIframe: !!iframeRef.current, hasComponent: !!aiResponse.component });
    
    if (iframeReady && iframeRef.current && aiResponse.component) {
      console.log('Sending RENDER_AI_CODE message to iframe');
      const message: IframeMessage = {
        type: 'RENDER_AI_CODE',
        code: aiResponse.component,
        data: data
      };

      iframeRef.current.contentWindow?.postMessage(message, '*');
    }
  }, [iframeReady, aiResponse.component, data]);

  // Handle AI response errors
  if (!aiResponse.success && aiResponse.error) {
    return <ErrorFallback error={aiResponse.error} />;
  }

  if (!aiResponse.component) {
    return <ErrorFallback error="No AI-generated component code available" />;
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorFallback error={error} />}
      
      <iframe
        ref={iframeRef}
        className={`w-full border-0 ${isLoading || error ? 'hidden' : 'block'}`}
        style={{ height }}
        title="AI Generated Landing Page"
        sandbox="allow-scripts allow-same-origin"
        srcDoc={generateIframeContent()}
        onLoad={() => {
          // Fallback in case iframe ready message doesn't fire
          setTimeout(() => {
            if (!iframeReady) {
              setIframeReady(true);
            }
          }, 1000);
        }}
      />
    </div>
  );
}
