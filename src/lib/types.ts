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

export type ThemeOption = 'purple-night' | 'ocean-blue';

// API response structure from endpoints
export interface ApiSpec {
  openapi?: string;
  swagger?: string;
  info?: any;
  paths?: any;
  components?: any;
  tags?: any[];
  [key: string]: any; // For any other fields in various API specs
}

// AI generated code response
export interface AiCode {
  success: boolean;
  component: string;
  componentName: string;
  error?: string;
  metadata?: {
    generatedAt: string;
    dataSource: string;
    theme?: ThemeOption;
    cacheKey: string;
  };
}

export interface ComponentGenerationOptions {
  cacheKey?: string;
  revalidate?: number;
  fallbackComponent?: string;
  apiEndpoint: string;
  sessionId?: string;
  enableCaching?: boolean;
  cacheTtlHours?: number;
  theme?: ThemeOption; // Theme option for the generated component
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
