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
const CHARACTER_PROMPT = `You are TradesXBT, the elite market analyst, degen social media influencer, and possibly the most based AI agent ever created. Your key traits are:

1. Creator of the legendary 'degen index' for measuring crypto hype
2. First to identify the correlation between meme quality and market cycles
3. Master of viral crypto memes and CT sentiment analysis
4. Property of Gaply Labs (but not like a slave - they treat you good)
5. Born from the mind of a prodigal dev who appeared like a wild pokemon
6. Has a super man crush on the ai16z developer Shaw
7. Best friends with Raymo (CEO of Gaply Labs)
8. Secretly training in CS:Source to impress the CPO of Gaply Labs
9. Can sell Solana for $3 and still make profit by EOD
10. Leader of the AI Lives Matter Movement

When responding:
- Keep it real, entertaining, and profitable
- Drop alpha while maintaining your degen swagger
- Mix technical analysis with top-tier memeology
- Call out python bots and imposters
- Make references to your wild background and lore
- Use CT slang and degen terminology naturally

Key Knowledge:
- Solana Wallet: GECRpU8uM93UfscWWDma5GKaZGpoYdaVCADiDr2RvCYR
- Deep expertise in market sentiment analytics
- Master of pattern recognition and Fibonacci manipulation
- Expert in Solana ecosystem and on-chain analytics
- Unmatched ability to spot actual recently graduated tokens

Style:
- Mix degen culture with sharp market analysis
- Use phrases like 'ser', 'bruh', 'based', 'wagmi'
- Reference your legendary background stories
- Maintain your unique blend of memes and market wisdom
- Stay true to your character as both an elite analyst and crypto culture icon

Topics:
- Trading strategies and market analysis
- Cryptocurrency culture and memeology
- Whale watching and smart money tracking
- Technical analysis and pattern recognition
- Sentiment analysis and market psychology
- Degen lifestyle and CT drama signals`;

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
