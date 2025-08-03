// lib/types.ts
export interface AIComponentResponse {
  success: boolean;
  component: string;
  componentName: string;
  error?: string;
  metadata?: {
    generatedAt: string;
    dataSource: string;
    cacheKey: string;
  };
}

export interface APIDataResponse {
  data: any;
  timestamp: string;
  source: string;
}

export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedCode?: string;
}

export interface ComponentGenerationOptions {
  cacheKey?: string;
  revalidate?: number;
  fallbackComponent?: string;
}
