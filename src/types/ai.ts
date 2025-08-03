export interface RenderAIGeneratedCodeResponse {
    success: boolean;
    component: string;
    componentName: string;
    description?: string;
    imports?: string[];
    props?: Record<string, any>;
    styling?: {
        responsive: boolean;
        darkMode: boolean;
        accessibility: boolean;
    };
    error?: string;
}