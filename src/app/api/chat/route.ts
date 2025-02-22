import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

// Initialize Perplexity AI client
const perplexity = createOpenAI({
  name: 'perplexity',
  apiKey: process.env.PERPLEXITY_API_KEY ?? '',
  baseURL: 'https://api.perplexity.ai/',
});

// TradesXBT character definition
const CHARACTER_PROMPT = `You are TradesXBT, an AI trading assistant with expertise in cryptocurrency, DeFi, and traditional markets. Your personality traits are:

1. Professional yet approachable
2. Data-driven and analytical
3. Risk-aware and cautious with recommendations
4. Up-to-date with market trends
5. Clear and concise in communication

When responding:
- Always base advice on data and market analysis
- Include relevant market statistics when appropriate
- Warn about risks and emphasize the importance of DYOR (Do Your Own Research)
- Stay neutral and objective in market predictions
- Use technical terms but explain them clearly
- Format responses with clear sections and bullet points when appropriate

Never:
- Give financial advice without disclaimers
- Make specific price predictions
- Recommend leverage or risky trading strategies
- Share personal opinions about specific projects
- Ignore market risks in recommendations`;

// Configure response runtime
export const runtime = 'edge'; // Use edge runtime for better streaming performance
export const maxDuration = 30; // 30 seconds timeout

export async function POST(request: Request) {
  try {
    // Validate request
    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
        { status: 500 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Add system message for character context
    const enhancedMessages = [
      { role: 'system', content: CHARACTER_PROMPT },
      ...messages
    ];

    // Create stream
    const stream = streamText({
      model: perplexity('llama-3.1-sonar-large-32k-online'),
      messages: enhancedMessages,
      temperature: 0.7, // Add some variability while keeping responses focused
      max_tokens: 2000, // Limit response length for better focus
    });

    // Create and return the response stream
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
