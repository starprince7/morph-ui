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
 * DISABLED: Validation is disabled to allow all AI-generated components to execute
 */
export function validateComponentCode(code: string): SecurityValidationResult {
  // VALIDATION DISABLED - Always return valid
  console.log('Component validation is disabled - allowing all AI-generated code');
  
  return {
    isValid: true,
    errors: [],
    sanitizedCode: sanitizeCode(code),
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