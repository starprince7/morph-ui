// lib/security.ts
import { SecurityValidationResult } from './types';

// Refined dangerous patterns focusing on actual security threats
const DANGEROUS_PATTERNS = [
  /eval\s*\(/gi,
  /Function\s*\(/gi,
  /setTimeout\s*\(\s*['"`]/gi,        // Only string-based setTimeout (not function-based)
  /setInterval\s*\(\s*['"`]/gi,       // Only string-based setInterval (not function-based)
  /document\.write/gi,
  /document\.cookie/gi,
  /window\.open/gi,
  /global\./gi,
  /process\./gi,
  /require\s*\(/gi,
  /import\s*\(/gi,                    // Dynamic imports
  /XMLHttpRequest/gi,
  /localStorage/gi,                   // Not supported in Claude artifacts
  /sessionStorage/gi,                 // Not supported in Claude artifacts
  /indexedDB/gi,
  /navigator\.geolocation/gi,
  /__dirname/gi,
  /__filename/gi,
  /fs\./gi,
  /path\./gi,
  /os\./gi,
  /crypto\./gi,
  /child_process/gi,
  /innerHTML\s*=/gi,
  /outerHTML\s*=/gi,
  /dangerouslySetInnerHTML/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:.*script/gi,
  /on\w+\s*=\s*['"`]/gi,             // Inline event handlers
  /\<script/gi,
  /\<iframe/gi,
  /\<object/gi,
  /\<embed/gi,
];

// Required patterns for valid React components
const REQUIRED_PATTERNS = [
  /function\s+GeneratedDataComponent/,           // Must have exact function name
  /\{\s*data\s*\}/,                             // Must accept data prop
  /(return\s*\(|return\s+\<|return\s+React)/,  // Must have return statement with JSX or React
];

/**
 * Validates AI-generated component code for security and correctness
 */
export function validateComponentCode(code: string): SecurityValidationResult {
  const errors: string[] = [];

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(`Dangerous pattern detected: ${pattern.source}`);
    }
  }

  // Check for required patterns
  for (const pattern of REQUIRED_PATTERNS) {
    if (!pattern.test(code)) {
      errors.push(`Required pattern missing: ${pattern.source}`);
    }
  }

  // Additional validation rules
  if (code.includes('export')) {
    errors.push('Export statements are not allowed in generated components');
  }

  if (code.includes('import')) {
    errors.push('Import statements are not allowed in generated components');
  }

  // Allow JSX syntax - remove the JSX blocking validation
  // The original validation was too restrictive for modern React development

  // Validate React hooks usage requires 'use client'
  const hasHooks = /use(State|Effect|Context|Reducer|Callback|Memo|Ref|ImperativeHandle|LayoutEffect|DebugValue)/g.test(code);
  if (hasHooks && !code.includes("'use client'") && !code.includes('"use client"')) {
    errors.push("Components using React hooks must include 'use client' directive");
  }

  // Basic JSX structure validation
  const openTags = (code.match(/\<[a-zA-Z][^>]*[^\/]>/g) || []).length;
  const closeTags = (code.match(/\<\/[a-zA-Z][^>]*>/g) || []).length;
  const selfClosingTags = (code.match(/\<[a-zA-Z][^>]*\/>/g) || []).length;

  if (openTags !== closeTags && Math.abs(openTags - closeTags - selfClosingTags) > 1) {
    errors.push('JSX structure appears malformed - check for unclosed tags');
  }

  // Validate function structure
  if (!code.includes('function GeneratedDataComponent')) {
    errors.push('Component must be named exactly "GeneratedDataComponent"');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    sanitizedCode: isValid ? sanitizeCode(code) : undefined,
  };
}

/**
 * Sanitizes component code by removing potentially dangerous content
 */
function sanitizeCode(code: string): string {
  // Remove comments that might contain dangerous code
  let sanitized = code.replace(/\/\*[\s\S]*?\*\//g, '');
  sanitized = sanitized.replace(/\/\/.*$/gm, '');

  // Ensure proper component structure - only add 'use client' if hooks are detected
  const hasHooks = /use(State|Effect|Context|Reducer|Callback|Memo|Ref|ImperativeHandle|LayoutEffect|DebugValue)/g.test(sanitized);
  if (hasHooks && !sanitized.includes('use client')) {
    sanitized = `'use client';\n\n${sanitized}`;
  }

  return sanitized.trim();
}

/**
 * Creates a safe execution environment for AI-generated components
 */
export function createSafeExecutionContext() {
  // Import React dynamically to work with Next.js
  const React = require('react');

  return {
    React,
    useState: React.useState,
    useEffect: React.useEffect,
    useMemo: React.useMemo,
    useCallback: React.useCallback,
    useRef: React.useRef,
    useReducer: React.useReducer,
    useContext: React.useContext,
    useImperativeHandle: React.useImperativeHandle,
    useLayoutEffect: React.useLayoutEffect,
    useDebugValue: React.useDebugValue,
    // Add other safe React hooks as needed
  };
}