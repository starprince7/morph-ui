import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const endpoint = searchParams.get('endpoint');
        
        // Use provided endpoint or fallback to default
        const destinationApiEndpoint = endpoint || 'https://api.starprince.dev/api/vehicle/listing';
        
        // Validate the endpoint
        if (!destinationApiEndpoint.startsWith('http://') && !destinationApiEndpoint.startsWith('https://')) {
            return NextResponse.json(
                { error: 'Invalid endpoint. Must be a valid HTTP or HTTPS URL.' },
                { status: 400 }
            );
        }
        
        console.log('Fetching data from:', destinationApiEndpoint);
        
        // Fetch data from the specified endpoint
        const response = await fetch(destinationApiEndpoint, {
            method: 'GET',
            headers: {
                'User-Agent': 'MorphUI/1.0',
                'Accept': 'application/json',
            },
            // Add timeout
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (!response.ok) {
            return NextResponse.json(
                { error: `API returned ${response.status}: ${response.statusText}` },
                { status: response.status }
            );
        }
        
        const data = await response.json();
        // console.log('Fetched data:', data);
        
        // Add metadata about the request
        return NextResponse.json({
            data,
            metadata: {
                source: destinationApiEndpoint,
                timestamp: new Date().toISOString(),
                status: response.status
            }
        });
        
    } catch (error) {
        console.error('Error fetching data:', error);
        
        if (error instanceof Error && error.name === 'TimeoutError') {
            return NextResponse.json(
                { error: 'Request timeout. The API took too long to respond.' },
                { status: 408 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to fetch data from the specified endpoint.' },
            { status: 500 }
        );
    }
}
