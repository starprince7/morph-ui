/**
 * Security utilities for iframe sandboxing and safe code execution
 * These utilities complement the existing security measures in /lib/security.ts
 */

export interface IframeSandboxConfig {
  allowScripts?: boolean;
  allowSameOrigin?: boolean;
  allowForms?: boolean;
  allowPopups?: boolean;
  allowModals?: boolean;
  allowOrientationLock?: boolean;
  allowPointerLock?: boolean;
  allowPresentation?: boolean;
}

export interface SecurityValidationResult {
  isValid: boolean;
  violations: string[];
  sanitizedCode?: string;
}

/**
 * Generates secure sandbox attributes for iframe
 */
export function generateSandboxAttributes(config: IframeSandboxConfig = {}): string {
  const {
    allowScripts = true,
    allowSameOrigin = true,
    allowForms = false,
    allowPopups = false,
    allowModals = false,
    allowOrientationLock = false,
    allowPointerLock = false,
    allowPresentation = false,
  } = config;

  const permissions: string[] = [];

  if (allowScripts) permissions.push('allow-scripts');
  if (allowSameOrigin) permissions.push('allow-same-origin');
  if (allowForms) permissions.push('allow-forms');
  if (allowPopups) permissions.push('allow-popups');
  if (allowModals) permissions.push('allow-modals');
  if (allowOrientationLock) permissions.push('allow-orientation-lock');
  if (allowPointerLock) permissions.push('allow-pointer-lock');
  if (allowPresentation) permissions.push('allow-presentation');

  return permissions.join(' ');
}

/**
 * Validates iframe communication messages for security
 */
export function validateIframeMessage(event: MessageEvent): boolean {
  // Basic validation - in production, you might want to validate origin
  if (!event.data || typeof event.data !== 'object') {
    return false;
  }

  // Check for required message type
  if (!event.data.type || typeof event.data.type !== 'string') {
    return false;
  }

  // Validate known message types
  const validTypes = [
    'RENDER_AI_CODE',
    'IFRAME_READY',
    'RENDER_ERROR',
    'RENDER_SUCCESS'
  ];

  return validTypes.includes(event.data.type);
}

/**
 * Sanitizes data before sending to iframe
 */
export function sanitizeIframeData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  // Remove functions and potentially dangerous objects
  const sanitized = JSON.parse(JSON.stringify(data, (key, value) => {
    // Remove functions
    if (typeof value === 'function') {
      return undefined;
    }

    // Remove potentially dangerous objects
    if (value && typeof value === 'object') {
      // Remove DOM elements
      if (value.nodeType) {
        return undefined;
      }

      // Remove objects with dangerous methods
      if (value.constructor && value.constructor.name === 'Function') {
        return undefined;
      }
    }

    return value;
  }));

  return sanitized;
}

/**
 * Additional validation for AI-generated code before iframe execution
 * This complements the existing security validation in /lib/security.ts
 */
export function validateCodeForIframeExecution(code: string): SecurityValidationResult {
  const violations: string[] = [];

  // Check for iframe-specific dangerous patterns
  const dangerousPatterns = [
    /window\.parent/g,
    /window\.top/g,
    /document\.domain/g,
    /postMessage\s*\(/g,
    /addEventListener\s*\(\s*['"]message['"]/, // Listening to messages (should be controlled)
    /eval\s*\(/g,
    /Function\s*\(/g,
    /setTimeout\s*\(\s*['"`]/g, // String-based setTimeout
    /setInterval\s*\(\s*['"`]/g, // String-based setInterval
    /import\s*\(/g, // Dynamic imports
    /require\s*\(/g, // CommonJS requires
  ];

  dangerousPatterns.forEach((pattern, index) => {
    if (pattern.test(code)) {
      const patternNames = [
        'window.parent access',
        'window.top access',
        'document.domain manipulation',
        'postMessage usage',
        'message event listeners',
        'eval usage',
        'Function constructor',
        'string-based setTimeout',
        'string-based setInterval',
        'dynamic imports',
        'require statements'
      ];
      violations.push(patternNames[index]);
    }
  });

  // Additional checks for React component structure
  if (!code.includes('React.createElement') && !code.includes('jsx')) {
    violations.push('No valid React component structure found');
  }

  const isValid = violations.length === 0;

  return {
    isValid,
    violations,
    sanitizedCode: isValid ? code : undefined
  };
}

/**
 * Creates a Content Security Policy for iframe content
 */
export function generateIframeCSP(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.tailwindcss.com",
    "style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com",
    "img-src 'self' data: https:",
    "font-src 'self' https:",
    "connect-src 'self'",
    "frame-ancestors 'self'",
    "form-action 'none'",
    "base-uri 'self'"
  ];

  return directives.join('; ');
}

/**
 * Timeout handler for iframe operations
 */
export class IframeTimeoutHandler {
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  setTimeout(key: string, callback: () => void, delay: number): void {
    // Clear existing timeout if any
    this.clearTimeout(key);

    const timeoutId = setTimeout(() => {
      callback();
      this.timeouts.delete(key);
    }, delay);

    this.timeouts.set(key, timeoutId);
  }

  clearTimeout(key: string): void {
    const timeoutId = this.timeouts.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(key);
    }
  }

  clearAllTimeouts(): void {
    this.timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.timeouts.clear();
  }
}

/**
 * Error boundary for iframe-related errors
 */
export function createIframeErrorHandler(onError: (error: string) => void) {
  return (event: ErrorEvent) => {
    const errorMessage = `Iframe Error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`;
    console.error(errorMessage, event.error);
    onError(errorMessage);
  };
}

/**
 * Validates iframe origin for security
 */
export function validateIframeOrigin(event: MessageEvent, allowedOrigins: string[] = ['null']): boolean {
  // For sandboxed iframes, origin is typically 'null'
  return allowedOrigins.includes(event.origin);
}
