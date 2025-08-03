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
  apiEndpoint: string;
}

// Landing page specific types
export interface LandingPageData {
  slug: string;
  title: string;
  description: string;
  data: any;
  metadata?: {
    category?: string;
    tags?: string[];
    lastUpdated?: string;
  };
}

export interface LandingPageGenerationOptions extends ComponentGenerationOptions {
  slug: string;
  dataSource?: 'api' | 'mock' | 'database';
  landingPageType?: 'product' | 'service' | 'portfolio' | 'generic';
}

export interface DataFetcherConfig {
  slug: string;
  apiEndpoint?: string;
  fallbackData?: any;
  cacheOptions?: {
    revalidate?: number;
    tags?: string[];
  };
}
