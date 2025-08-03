import { fetchDataAndGenerateAI } from '@/utils/dataFetcher';
import ReactRunnerRenderer from '@/components/ReactRunnerRenderer';

/**
 * Test page to demonstrate dynamic API endpoint functionality
 * This shows how to use different API endpoints with the AI generation system
 */
async function generateTestComponent() {
  try {
    console.log('🧪 Testing dynamic API endpoint functionality...');
    
    // Test with JSONPlaceholder API (different structure than default)
    const result = await fetchDataAndGenerateAI({
      cacheKey: 'jsonplaceholder-test',
      revalidate: 300,
      fallbackOnError: true,
      apiEndpoint: 'https://jsonplaceholder.typicode.com/posts' // Different API endpoint
    });
    
    console.log('✅ JSONPlaceholder API test result:', {
      success: result.success,
      hasAIResponse: !!result.aiResponse,
      error: result.error,
    });
    
    return result;
  } catch (error) {
    console.error('❌ API endpoint test failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      aiResponse: {
        success: false,
        component: '',
        componentName: 'ErrorComponent',
        error: 'Test failed',
        metadata: {
          generatedAt: new Date().toISOString(),
          dataSource: 'error',
          cacheKey: 'error',
        },
      }
    };
  }
}

export default async function APIEndpointTestPage() {
  const result = await generateTestComponent();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Dynamic API Endpoint Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            This page demonstrates the AI component generation system using a different API endpoint 
            (JSONPlaceholder) to show the flexibility of the dynamic endpoint feature.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Configuration
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <code className="text-sm text-gray-800 dark:text-gray-200">
              <div>API Endpoint: https://jsonplaceholder.typicode.com/posts</div>
              <div>Cache Key: jsonplaceholder-test</div>
              <div>Revalidate: 300 seconds</div>
              <div>Fallback on Error: true</div>
            </code>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            AI-Generated Component Result
          </h2>
          
          {result.success && result.aiResponse ? (
            <div>
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✅ Successfully generated component using JSONPlaceholder API
                </p>
              </div>
              
              <ReactRunnerRenderer 
                aiResponse={result.aiResponse}
                className="border border-gray-200 dark:border-gray-700 rounded-lg"
              />
            </div>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Generation Failed
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                {result.error || 'Unknown error occurred during component generation'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How This Works
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• The system fetches sample data from the JSONPlaceholder API</li>
            <li>• AI analyzes the data structure (posts with id, title, body, userId)</li>
            <li>• AI generates a React component that fetches from this endpoint using useEffect</li>
            <li>• The component includes loading states, error handling, and responsive UI</li>
            <li>• react-runner safely executes the AI-generated component code</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
