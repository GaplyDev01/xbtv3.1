import { NextResponse } from 'next/server';
import { perplexity } from '@/services/PerplexityService';

export async function POST(request: Request) {
  try {
    const { query, userId } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // TODO: Add actual Perplexity API call here
    const response = "Sample response from Perplexity API";
    const tokenCount = response.split(' ').length;

    // Save the query and response
    const result = await perplexity.saveQuery(
      query,
      response,
      tokenCount,
      userId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Perplexity API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    const history = await perplexity.getQueryHistory(
      userId || undefined,
      limit
    );

    return NextResponse.json(history);
  } catch (error) {
    console.error('Perplexity history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
