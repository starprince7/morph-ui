// lib/landing-page-ai-generator.ts
import 'server-only';
import OpenAI from 'openai';
import { LandingPageData, LandingPageGenerationOptions, AIComponentResponse } from './types';
import { validateComponentCode } from './security';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Landing page specific system prompt that follows the design system
 */
const LANDING_PAGE_SYSTEM_PROMPT = `You are an expert React component generator for Next.js SSR landing pages. Create beautiful, conversion-focused landing page components that strictly follow the established design system.

DESIGN SYSTEM COMPLIANCE (CRITICAL):
- Use ONLY the established color palette: white/black with grays
- Follow minimalist, modern design philosophy with generous whitespace
- Use Geist font family (already configured in CSS)
- Implement automatic light/dark theming with CSS variables
- Use rounded-full buttons (pill-shaped) following the design system
- Mobile-first responsive design with progressive enhancement
- Subtle hover effects and transitions

COLOR SYSTEM:
- Light theme: bg-white, text-[#171717]
- Dark theme: bg-[#0a0a0a], text-[#ededed]
- Interactive elements: Use foreground/background color inversion
- Hover states: bg-[#f2f2f2] dark:bg-[#1a1a1a] for light hover effects
- Borders: border-black/[.08] dark:border-white/[.145]

COMPONENT REQUIREMENTS:
1. NO import statements - React is available globally
2. NO export statements - component accessed by name
3. Add 'use client' directive for interactive components
4. Component must be named exactly "GeneratedDataComponent"
5. Use modern React patterns (hooks, functional components)
6. ONLY use Tailwind CSS for styling
7. Ensure responsive design and accessibility

LANDING PAGE STRUCTURE:
Create a comprehensive landing page with these sections:
- Hero section with compelling headline and CTA
- Features/benefits section with icons and descriptions
- Social proof (testimonials, reviews, or stats)
- Call-to-action section
- Optional: pricing, portfolio, team, or product showcase

STYLING GUIDELINES:
- Use consistent spacing: p-4, p-6, p-8 for sections
- Typography: text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl
- Buttons: Use the established button patterns with rounded-full
- Cards: Use subtle borders and backgrounds following the design system
- Icons: Use simple SVG icons or Unicode symbols
- Images: Use placeholder.com or similar for demo images

RESPONSIVE DESIGN:
- Mobile-first approach with sm:, md:, lg: breakpoints
- Grid layouts: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Flexible spacing: gap-4 md:gap-6 lg:gap-8
- Responsive text: text-sm sm:text-base md:text-lg

ACCESSIBILITY:
- Proper heading hierarchy (h1, h2, h3)
- Alt text for images
- Semantic HTML elements
- Focus states for interactive elements
- ARIA labels where appropriate

CRITICAL SYNTAX RULES:
- NEVER use $ as standalone identifier outside template literals
- For prices: \`$\${item.price}\` or "$" + item.price
- For dynamic content: {item.name} not $item.name
- Use proper JSX attribute syntax: className="value"

EXAMPLE STRUCTURE:
'use client';

function GeneratedDataComponent({ data }) {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#171717] dark:text-[#ededed]">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {data?.hero?.headline || 'Welcome to Our Platform'}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            {data?.hero?.subheadline || 'Transform your business with our innovative solutions'}
          </p>
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#171717] dark:bg-[#ededed] text-white dark:text-black px-6 py-3 text-base font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors">
            {data?.hero?.cta || 'Get Started'}
          </button>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {(data?.features || []).map((feature, index) => (
              <div key={index} className="p-6 border border-black/[.08] dark:border-white/[.145] rounded-lg">
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-[#f2f2f2] dark:bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of satisfied customers today
          </p>
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#171717] dark:bg-[#ededed] text-white dark:text-black px-8 py-4 text-lg font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors">
            Start Your Journey
          </button>
        </div>
      </section>
    </div>
  );
}

RESPONSE FORMAT: Return only valid JSX component code following the design system exactly.`;

/**
 * Generates AI landing page component code
 */
async function generateLandingPageCode(landingPageData: LandingPageData): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Generate a beautiful, conversion-focused landing page component for: "${landingPageData.title}"

Description: ${landingPageData.description}
Category: ${landingPageData.metadata?.category || 'generic'}
Tags: ${landingPageData.metadata?.tags?.join(', ') || 'none'}

Data to display:
${JSON.stringify(landingPageData.data, null, 2)}

Create a comprehensive landing page that showcases this data effectively while strictly following the design system guidelines. Make it visually impressive, conversion-focused, and fully responsive.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: LANDING_PAGE_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const generatedCode = completion.choices[0]?.message?.content;
    if (!generatedCode) {
      throw new Error('No code generated by OpenAI');
    }

    return generatedCode.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`AI code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a fallback landing page component
 */
function generateFallbackLandingPage(landingPageData: LandingPageData): string {
  return `'use client';

function GeneratedDataComponent({ data }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#171717] dark:text-[#ededed]">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            ${landingPageData.title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            ${landingPageData.description}
          </p>
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#171717] dark:bg-[#ededed] text-white dark:text-black px-6 py-3 text-base font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors">
            Get Started
          </button>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border border-black/[.08] dark:border-white/[.145] rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Fallback Mode</h3>
              <p className="text-gray-600 dark:text-gray-400">
                This is a fallback landing page for "${landingPageData.slug}". 
                AI generation was not available.
              </p>
            </div>
            <div className="p-6 border border-black/[.08] dark:border-white/[.145] rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Data Available</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Category: ${landingPageData.metadata?.category || 'Unknown'}
              </p>
            </div>
            <div className="p-6 border border-black/[.08] dark:border-white/[.145] rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Last Updated</h3>
              <p className="text-gray-600 dark:text-gray-400">
                ${landingPageData.metadata?.lastUpdated ? new Date(landingPageData.metadata.lastUpdated).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}`;
}

/**
 * Main function to generate AI landing page component
 */
export async function generateLandingPageComponent(
  landingPageData: LandingPageData,
  options?: LandingPageGenerationOptions
): Promise<AIComponentResponse> {
  const startTime = Date.now();
  
  try {
    console.log(`🚀 Generating landing page component for slug: ${landingPageData.slug}`);
    
    // Generate AI code
    let generatedCode: string;
    try {
      generatedCode = await generateLandingPageCode(landingPageData);
    } catch (aiError) {
      console.warn('AI generation failed, using fallback:', aiError);
      generatedCode = generateFallbackLandingPage(landingPageData);
    }
    
    // Validate and sanitize the generated code
    const validation = validateComponentCode(generatedCode);
    if (!validation.isValid) {
      console.warn('Generated code validation failed:', validation.errors);
      generatedCode = generateFallbackLandingPage(landingPageData);
    } else if (validation.sanitizedCode) {
      generatedCode = validation.sanitizedCode;
    }
    
    const endTime = Date.now();
    console.log(`✅ Landing page component generated in ${endTime - startTime}ms`);
    
    return {
      success: true,
      component: generatedCode,
      componentName: 'GeneratedDataComponent',
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: `landing-page-${landingPageData.slug}`,
        cacheKey: options?.cacheKey || `landing-page-${landingPageData.slug}`,
      },
    };
  } catch (error) {
    console.error(`❌ Landing page generation failed for slug "${landingPageData.slug}":`, error);
    
    // Return fallback component on error
    const fallbackCode = generateFallbackLandingPage(landingPageData);
    
    return {
      success: false,
      component: fallbackCode,
      componentName: 'GeneratedDataComponent',
      error: error instanceof Error ? error.message : 'Unknown generation error',
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: 'fallback',
        cacheKey: 'fallback',
      },
    };
  }
}
