// lib/landing-page-data-fetcher.ts
import 'server-only';
import { LandingPageData, DataFetcherConfig } from './types';

/**
 * Mock data sources for different landing page types
 */
const MOCK_DATA_SOURCES = {
  'tech-startup': {
    title: 'Revolutionary Tech Startup',
    description: 'Building the future with cutting-edge technology solutions',
    data: {
      hero: {
        headline: 'Transform Your Business with AI',
        subheadline: 'Leverage artificial intelligence to streamline operations and boost productivity',
        cta: 'Get Started Today'
      },
      features: [
        {
          title: 'AI-Powered Analytics',
          description: 'Get insights from your data with advanced machine learning algorithms',
          icon: 'chart'
        },
        {
          title: 'Automated Workflows',
          description: 'Streamline your processes with intelligent automation',
          icon: 'workflow'
        },
        {
          title: '24/7 Support',
          description: 'Round-the-clock assistance from our expert team',
          icon: 'support'
        }
      ],
      testimonials: [
        {
          name: 'Sarah Johnson',
          role: 'CEO, TechCorp',
          content: 'This platform has revolutionized how we handle data analysis.',
          rating: 5
        },
        {
          name: 'Michael Chen',
          role: 'CTO, InnovateLab',
          content: 'The automation features saved us countless hours of manual work.',
          rating: 5
        }
      ],
      pricing: {
        plans: [
          {
            name: 'Starter',
            price: 29,
            features: ['Basic Analytics', 'Email Support', '5 Workflows']
          },
          {
            name: 'Professional',
            price: 99,
            features: ['Advanced Analytics', 'Priority Support', 'Unlimited Workflows', 'API Access']
          }
        ]
      }
    },
    metadata: {
      category: 'technology',
      tags: ['ai', 'automation', 'analytics'],
      lastUpdated: new Date().toISOString()
    }
  },
  'creative-agency': {
    title: 'Creative Design Agency',
    description: 'Bringing your brand vision to life with stunning design and creative solutions',
    data: {
      hero: {
        headline: 'Design That Speaks Volumes',
        subheadline: 'We create memorable brand experiences that connect with your audience',
        cta: 'View Our Work'
      },
      services: [
        {
          title: 'Brand Identity',
          description: 'Complete brand development from concept to execution',
          image: '/api/placeholder/400/300'
        },
        {
          title: 'Web Design',
          description: 'Modern, responsive websites that convert visitors into customers',
          image: '/api/placeholder/400/300'
        },
        {
          title: 'Digital Marketing',
          description: 'Strategic campaigns that amplify your brand reach',
          image: '/api/placeholder/400/300'
        }
      ],
      portfolio: [
        {
          title: 'Tech Startup Rebrand',
          category: 'Branding',
          image: '/api/placeholder/600/400'
        },
        {
          title: 'E-commerce Platform',
          category: 'Web Design',
          image: '/api/placeholder/600/400'
        }
      ],
      team: [
        {
          name: 'Alex Rivera',
          role: 'Creative Director',
          bio: 'Award-winning designer with 10+ years of experience'
        },
        {
          name: 'Jordan Smith',
          role: 'UX Designer',
          bio: 'Specialist in user-centered design and conversion optimization'
        }
      ]
    },
    metadata: {
      category: 'creative',
      tags: ['design', 'branding', 'marketing'],
      lastUpdated: new Date().toISOString()
    }
  },
  'ecommerce-store': {
    title: 'Premium E-commerce Store',
    description: 'Discover high-quality products with exceptional customer service',
    data: {
      hero: {
        headline: 'Premium Quality, Unbeatable Prices',
        subheadline: 'Shop our curated collection of premium products with fast, free shipping',
        cta: 'Shop Now'
      },
      categories: [
        {
          name: 'Electronics',
          description: 'Latest gadgets and tech accessories',
          productCount: 150,
          image: '/api/placeholder/300/200'
        },
        {
          name: 'Fashion',
          description: 'Trendy clothing and accessories',
          productCount: 300,
          image: '/api/placeholder/300/200'
        },
        {
          name: 'Home & Garden',
          description: 'Everything for your home and outdoor space',
          productCount: 200,
          image: '/api/placeholder/300/200'
        }
      ],
      featuredProducts: [
        {
          name: 'Wireless Headphones',
          price: 199.99,
          originalPrice: 249.99,
          rating: 4.8,
          reviews: 1250,
          image: '/api/placeholder/250/250'
        },
        {
          name: 'Smart Watch',
          price: 299.99,
          rating: 4.9,
          reviews: 890,
          image: '/api/placeholder/250/250'
        }
      ],
      benefits: [
        {
          title: 'Free Shipping',
          description: 'On orders over $50',
          icon: 'shipping'
        },
        {
          title: '30-Day Returns',
          description: 'Hassle-free return policy',
          icon: 'return'
        },
        {
          title: 'Secure Payment',
          description: 'SSL encrypted checkout',
          icon: 'security'
        }
      ]
    },
    metadata: {
      category: 'ecommerce',
      tags: ['shopping', 'products', 'retail'],
      lastUpdated: new Date().toISOString()
    }
  }
};

/**
 * Fetches data from external API based on slug
 */
async function fetchFromAPI(config: DataFetcherConfig): Promise<any> {
  if (!config.apiEndpoint) {
    throw new Error('API endpoint not configured for this slug');
  }

  try {
    const response = await fetch(config.apiEndpoint, {
      cache: 'force-cache',
      next: {
        revalidate: config.cacheOptions?.revalidate || 300,
        tags: config.cacheOptions?.tags || [config.slug]
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API fetch error for slug "${config.slug}":`, error);
    throw error;
  }
}

/**
 * Gets mock data based on slug
 */
function getMockData(slug: string): any {
  const mockData = MOCK_DATA_SOURCES[slug as keyof typeof MOCK_DATA_SOURCES];
  if (!mockData) {
    // Return generic mock data for unknown slugs
    return {
      title: `Landing Page: ${slug.charAt(0).toUpperCase() + slug.slice(1)}`,
      description: `Dynamic landing page for ${slug}`,
      data: {
        hero: {
          headline: `Welcome to ${slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          subheadline: 'This is a dynamically generated landing page',
          cta: 'Learn More'
        },
        features: [
          {
            title: 'Feature One',
            description: 'Description of the first key feature',
            icon: 'star'
          },
          {
            title: 'Feature Two',
            description: 'Description of the second key feature',
            icon: 'heart'
          }
        ]
      },
      metadata: {
        category: 'generic',
        tags: [slug],
        lastUpdated: new Date().toISOString()
      }
    };
  }
  return mockData;
}

/**
 * Main data fetcher function for landing pages
 */
export async function fetchLandingPageData(config: DataFetcherConfig): Promise<LandingPageData> {
  try {
    let fetchedData: any;

    // Try API first, fall back to mock data
    try {
      if (config.apiEndpoint) {
        fetchedData = await fetchFromAPI(config);
      } else {
        fetchedData = getMockData(config.slug);
      }
    } catch (apiError) {
      console.warn(`API fetch failed for slug "${config.slug}", using mock data:`, apiError);
      fetchedData = config.fallbackData || getMockData(config.slug);
    }

    return {
      slug: config.slug,
      title: fetchedData.title,
      description: fetchedData.description,
      data: fetchedData.data,
      metadata: fetchedData.metadata
    };
  } catch (error) {
    console.error(`Data fetching failed for slug "${config.slug}":`, error);
    
    // Return minimal fallback data
    return {
      slug: config.slug,
      title: `Error Loading ${config.slug}`,
      description: 'Failed to load landing page data',
      data: {
        error: true,
        message: 'Data fetching failed',
        slug: config.slug
      },
      metadata: {
        category: 'error',
        tags: ['error'],
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

/**
 * Get available landing page slugs (for static generation or navigation)
 */
export function getAvailableSlugs(): string[] {
  return Object.keys(MOCK_DATA_SOURCES);
}
