import { NextRequest, NextResponse } from 'next/server';

const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.BIRDEYE_API_KEY;
    if (!apiKey) {
      console.error('Birdeye API key not found in environment variables');
      return NextResponse.json(
        { error: 'API configuration error', success: false },
        { status: 500 }
      );
    }

    // Get the path and query parameters from the request
    const { searchParams } = new URL(request.url);
    const path = request.url.split('/api/birdeye')[1] || '';
    
    if (!path) {
      return NextResponse.json(
        { error: 'Invalid API path', success: false },
        { status: 400 }
      );
    }

    // Construct the Birdeye API URL
    const birdeyeUrl = new URL(BIRDEYE_BASE_URL + path);
    searchParams.forEach((value, key) => {
      birdeyeUrl.searchParams.append(key, value);
    });

    // Make the request to Birdeye
    const response = await fetch(birdeyeUrl.toString(), {
      headers: {
        'accept': 'application/json',
        'x-chain': 'solana',
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Birdeye API error:', {
        status: response.status,
        statusText: response.statusText,
        path
      });
      return NextResponse.json(
        { 
          error: `Birdeye API error: ${response.statusText}`,
          success: false 
        },
        { status: response.status }
      );
    }

    // Get the response data
    const data = await response.json();

    // Add cache headers based on the endpoint type
    const cacheControl = path.includes('/price') ? 
      'public, s-maxage=10, stale-while-revalidate=30' : // Price data: 10s cache, 30s stale
      'public, s-maxage=300, stale-while-revalidate=600'; // Other data: 5m cache, 10m stale

    // Return the response
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': cacheControl
      }
    });
  } catch (error) {
    console.error('Birdeye API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
