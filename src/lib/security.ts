// lib/security.ts
import { SecurityValidationResult } from './types';

// Refined dangerous patterns focusing on actual security threats
// Fixed dangerous patterns - more precise to avoid false positives
const DANGEROUS_PATTERNS = [
  /eval\s*\(/gi,
  /Function\s*\(/gi,
  /setTimeout\s*\(\s*['"`]/gi,        // Only string-based setTimeout
  /setInterval\s*\(\s*['"`]/gi,       // Only string-based setInterval
  /document\.write/gi,
  /document\.cookie/gi,
  /window\.open/gi,
  /global\./gi,
  /process\./gi,
  /require\s*\(/gi,
  /XMLHttpRequest/gi,
  /localStorage/gi,
  /sessionStorage/gi,
  /indexedDB/gi,
  /navigator\.geolocation/gi,
  /__dirname/gi,
  /__filename/gi,
  /\bfs\./gi,                        // Word boundary to avoid "transform" etc.
  /\bpath\./gi,                      // Word boundary to avoid "pathname" etc.
  /\bos\./gi,                        // FIXED: Word boundary to avoid "repos", "photos" etc.
  /\bcrypto\./gi,                    // Word boundary to avoid "cryptocurrency" etc.
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

// Required patterns for valid React components (relaxed for react-runner)
const REQUIRED_PATTERNS = [
  /function\s+GeneratedDataComponent/,           // Must have exact function name
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

  // RELAXED VALIDATION: Allow import/export statements but warn (react-runner will handle them)
  if (code.includes('export')) {
    console.warn('Export statements detected - react-runner will ignore them');
  }

  if (code.includes('import')) {
    console.warn('Import statements detected - react-runner will ignore them');
  }

  // RELAXED VALIDATION: Don't require 'use client' for react-runner
  // react-runner handles hooks through scope, so 'use client' is not needed

  // RELAXED VALIDATION: More lenient JSX structure validation
  const openTags = (code.match(/\<[a-zA-Z][^>]*[^\/]>/g) || []).length;
  const closeTags = (code.match(/\<\/[a-zA-Z][^>]*>/g) || []).length;
  const selfClosingTags = (code.match(/\<[a-zA-Z][^>]*\/>/g) || []).length;

  // Only flag if there's a significant mismatch (more than 2 tags difference)
  if (Math.abs(openTags - closeTags) > 2) {
    errors.push('JSX structure appears malformed - check for unclosed tags');
  }

  // RELAXED VALIDATION: Validate function structure but be more flexible
  if (!code.includes('function GeneratedDataComponent')) {
    errors.push('Component must be named exactly "GeneratedDataComponent"');
  }

  // RELAXED VALIDATION: Allow dynamic imports for react-runner compatibility
  // Remove the strict dynamic import check as react-runner handles this

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    sanitizedCode: isValid ? sanitizeCode(code) : undefined,
  };
}

/**
 * Sanitizes component code by removing potentially dangerous content
 * Updated for react-runner compatibility
 */
function sanitizeCode(code: string): string {
  let sanitized = code;

  // Only remove markdown code blocks
  sanitized = sanitized.replace(/^```[a-zA-Z]*\n?/gm, '');
  sanitized = sanitized.replace(/\n?```$/gm, '');

  // Remove import/export for react-runner
  sanitized = sanitized.replace(/^export\s+(default\s+)?/gm, '');
  sanitized = sanitized.replace(/^import\s+.*$/gm, '');

  // Remove 'use client'
  sanitized = sanitized.replace(/^['"]use client['"];?\s*$/gm, '');

  return sanitized.trim();
}

/**
 * Creates a safe execution environment for AI-generated components
 * Updated for react-runner compatibility
 */
export function createSafeExecutionContext() {
  // For react-runner, we don't need to import React here
  // The scope is passed directly to the Runner component
  // This function can be used for other execution contexts if needed

  try {
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
  } catch (error) {
    console.warn('Could not create execution context:', error);
    return {};
  }
}

/**
 * Helper function to create react-runner compatible scope
 */
export function createReactRunnerScope() {
  try {
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
      // Add more hooks as needed
    };
  } catch (error) {
    console.error('Failed to create react-runner scope:', error);
    return {};
  }
}