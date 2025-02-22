import { NextRequest, NextResponse } from 'next/server';
import { COINGECKO_API_KEY } from '@/config/env';

const BASE_URL = 'https://pro-api.coingecko.com/api/v3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint parameter is required' }, { status: 400 });
    }

    // Remove the endpoint param from the forwarded request
    searchParams.delete('endpoint');
    
    const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'x-cg-pro-api-key': COINGECKO_API_KEY
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `CoinGecko API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('CoinGecko API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
