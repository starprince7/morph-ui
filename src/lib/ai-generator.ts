// lib/ai-generator.ts
import 'server-only';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AIComponentResponse, APIDataResponse, ComponentGenerationOptions, ThemeOption } from './types';
import { validateComponentCode } from './security';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Fetches data from external API with caching
 */
async function fetchAPIData(cacheOptions: ComponentGenerationOptions): Promise<APIDataResponse> {
  const apiUrl = cacheOptions.apiEndpoint;

  console.log('APi url:', apiUrl)

  try {
    const response = await fetch(apiUrl, {
      cache: 'force-cache',
      next: {
        revalidate: cacheOptions?.revalidate || 300 // 5 minutes default
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      data,
      timestamp: new Date().toISOString(),
      source: apiUrl,
    };
  } catch (error) {
    console.error('API fetch error:', error);
    throw new Error(`Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a fallback component when OpenAI is not available
 */
function generateFallbackComponent(data: any, apiEndpoint: string): string {
  return `function GeneratedDataComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/get-data?endpoint=' + encodeURIComponent('` + apiEndpoint + `'));
        if (!response.ok) {
          throw new Error('Failed to fetch data from API');
        }
        const result = await response.json();
        // Handle the response structure from /api/get-data
        setData(result.data || result);
      } catch (err) {
        console.error('Fetch error:', err);
        const mockData = [
          {
            id: 1,
            make: 'Toyota',
            model: 'Camry',
            year: 2023,
            images: ['https://via.placeholder.com/400x300?text=Toyota+Camry'],
            location: { city: 'San Francisco', country: 'USA' },
            rentalPricePerDay: 99,
            availability: true,
            description: 'Reliable and fuel-efficient sedan perfect for city driving.',
            basicFeatures: { numberOfSeats: 5, doors: 4 },
            owner: { name: 'John Doe', contact: 'john@example.com' }
          },
          {
            id: 2,
            make: 'Honda',
            model: 'Civic',
            year: 2024,
            images: ['https://via.placeholder.com/400x300?text=Honda+Civic'],
            location: { city: 'New York', country: 'USA' },
            rentalPricePerDay: 149,
            availability: false,
            description: 'Compact and sporty vehicle with modern features.',
            basicFeatures: { numberOfSeats: 5, doors: 4 },
            owner: { name: 'Jane Smith', contact: 'jane@example.com' }
          }
        ];
        setData(mockData);
        setError('Using demo data - API unavailable');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading vehicle data...</span>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800">
      {error && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ {error}
          </p>
        </div>
      )}
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Vehicle Rental Showcase</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
            <img 
              src={item.images && item.images[0] ? item.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'} 
              alt={\`\${item.make} \${item.model}\`} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {item.make} {item.model} ({item.year})
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Location: {item.location?.city}, {item.location?.country}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Price: $\{item.rentalPricePerDay}/day
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Status: {item.availability ? 'Available' : 'Unavailable'}
              </p>
              <button
                onClick={() => handleSelectItem(item)}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2 overflow-hidden relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-200 text-2xl hover:text-gray-800 dark:hover:text-white z-10"
              aria-label="Close"
            >
              &times;
            </button>
            <img 
              src={selectedItem.images && selectedItem.images[0] ? selectedItem.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'} 
              alt={\`\${selectedItem.make} \${selectedItem.model}\`} 
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedItem.make} {selectedItem.model} ({selectedItem.year})
              </h2>
              <p className="text-gray-700 dark:text-gray-300">{selectedItem.description}</p>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Details</h3>
                <p className="text-gray-700 dark:text-gray-300">Seats: {selectedItem.basicFeatures?.numberOfSeats}</p>
                <p className="text-gray-700 dark:text-gray-300">Doors: {selectedItem.basicFeatures?.doors}</p>
                <p className="text-gray-700 dark:text-gray-300">Price: $\{selectedItem.rentalPricePerDay}/day</p>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Owner Information</h3>
              <p className="text-gray-700 dark:text-gray-300">Name: {selectedItem.owner?.name}</p>
              <p className="text-gray-700 dark:text-gray-300">Contact: {selectedItem.owner?.contact}</p>
              <button
                onClick={() => setSelectedItem(null)}
                className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeneratedDataComponent;`;
}

/**
 * Determines the system prompt file path based on the selected theme
 */
function getSystemPromptPath(theme: ThemeOption = 'purple-night'): string {
  switch (theme) {
    case 'ocean-blue':
      return join(process.cwd(), 'src', 'lib', 'system-prompts', 'gpt-system-prompt-2-oceanblue.txt');
    case 'purple-night':
    default:
      return join(process.cwd(), 'src', 'lib', 'system-prompts', 'gpt-system-prompt-3-purple.txt');
  }
}

/**
 * Generates AI component code using OpenAI
 */
async function generateAiCode(data: any, apiEndpoint: string, theme: ThemeOption = 'purple-night'): Promise<string> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key_here')) {
    console.warn('OpenAI API key not configured, using fallback component');
    return generateFallbackComponent(data, apiEndpoint);
  }

  try {
    // Get the appropriate system prompt based on the theme
    const systemPromptPath = getSystemPromptPath(theme);
    console.log(`Using theme: ${theme}, system prompt: ${systemPromptPath}`);
    const systemPrompt = readFileSync(systemPromptPath, 'utf-8');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      // model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Generate a React component that fetches and displays data from this API endpoint:

Original API Endpoint: ${apiEndpoint}

IMPORTANT: You must fetch data using the proxy route:
/api/get-data?endpoint=${encodeURIComponent(apiEndpoint)}

NEVER call the original endpoint directly. Always use the /api/get-data proxy.

Sample data structure (for reference only - the actual data will be fetched from /api/get-data):
${JSON.stringify(data, null, 2)}

Create a component that:
- Fetches data from '/api/get-data?endpoint=' + encodeURIComponent('${apiEndpoint}') using useEffect and fetch()
- Handles the response structure: { data: actualData, metadata: { source, timestamp, status } }
- Extracts the actual data from response.data field
- Includes proper loading states while fetching
- Handles errors gracefully with user-friendly error messages
- Displays the data in an organized, visually appealing way
- Is fully responsive (mobile-first)
- Uses proper Tailwind CSS styling
- Follows accessibility best practices
- Has interactive elements where appropriate
- Shows empty state if no data is returned

Remember: Use '/api/get-data?endpoint=' + encodeURIComponent('${apiEndpoint}') for the fetch URL.`,
        },
      ],
      // temperature: 0.7,
      // max_tokens: 4000,
      // temperature: 1,
      // max_completion_tokens: 4000,
    });

    const generatedCode = completion.choices[0].message.content;

    if (!generatedCode) {
      throw new Error('No code generated by AI');
    }

    return generatedCode.trim();
  } catch (error) {
    console.error('OpenAI generation error:', error);
    throw new Error(`Failed to generate component: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main function to generate AI component with full error handling and security
 */
export async function generateAIComponent(options: ComponentGenerationOptions): Promise<AIComponentResponse> {
  const startTime = Date.now();

  try {
    // Step 1: Fetch data from API
    console.log('Fetching API data...');
    const apiData = await fetchAPIData(options);

    // Step 2: Generate component code using AI
    console.log('Generating component code...');
    // Pass the original API endpoint so AI can construct /api/get-data?endpoint=ORIGINAL_ENDPOINT
    // Use theme from options or default to 'purple-night'
    const componentCode = await generateAiCode(apiData.data, options.apiEndpoint, options.theme);
    console.log('Component Code:', componentCode)

    // Step 3: Validate and sanitize the generated code
    console.log('Validating component code...');
    const validation = validateComponentCode(componentCode);

    if (!validation.isValid) {
      console.error('Component validation failed:', validation.errors);
      console.error('Full generated code:', componentCode);
      return {
        success: false,
        component: '',
        componentName: 'GeneratedDataComponent',
        error: `Component validation failed: ${validation.errors.join(', ')}`,
        metadata: {
          generatedAt: new Date().toISOString(),
          dataSource: apiData.source,
          cacheKey: options?.cacheKey || 'default',
        },
      };
    }

    const generationTime = Date.now() - startTime;
    console.log(`Component generated successfully in ${generationTime}ms`);

    return {
      success: true,
      component: validation.sanitizedCode!,
      componentName: 'GeneratedDataComponent',
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: apiData.source,
        cacheKey: options?.cacheKey || 'default',
      },
    };
  } catch (error) {
    // If error occurs, do these below.
    console.error('Component generation failed:', error);

    return {
      success: false,
      component: '',
      componentName: 'GeneratedDataComponent',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: 'unknown',
        cacheKey: options?.cacheKey || 'default',
      },
    };
  }
}

/**
 * Fallback component code for when AI generation fails
 */
export const FALLBACK_COMPONENT = `'use client';

function GeneratedDataComponent() {
  const React = require('react');
  
  return React.createElement('div', {
    className: 'p-6 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20'
  },
    React.createElement('div', {
      className: 'text-center'
    },
      React.createElement('h3', {
        className: 'text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'
      }, 'Component Generation Failed'),
      React.createElement('p', {
        className: 'text-sm text-gray-600 dark:text-gray-400'
      }, 'Unable to generate dynamic content. Please try again later.')
    )
  );
}`;
