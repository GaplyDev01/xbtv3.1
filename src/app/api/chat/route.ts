import { NextResponse } from 'next/server';
import { createParser, type EventSourceMessage } from 'eventsource-parser';

// Helper to convert a ReadableStream to a string
async function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value);
  }

  return result;
}

// Helper to create a streaming response
function createStream(response: Response) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const parser = createParser({
        onEvent: (event: EventSourceMessage) => {
          try {
            const parsed = JSON.parse(event.data);
            const text = parsed.choices?.[0]?.delta?.content || '';
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        }, // Added missing comma here
        onError: (error: Error) => {
          console.error('Parser error:', error);
          controller.error(error);
        },
      });

      try {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          parser.feed(chunk);
        }
      } catch (e) {
        console.error('Stream reading error:', e);
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return stream;
}



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
      console.error('Perplexity API key not configured');
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
        { status: 500 }
      );
    }

    // Parse and validate the request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Add system message for character context with domain filtering
    const SOLANA_DOMAINS = [
      'solana.com',
      'coingecko.com', 
      'birdeye.so',
      'dexscreener.com',
      'raydium.io',
      'orca.so',
      'marinade.finance',
      'jup.ag',
      'solscan.io',
      'explorer.solana.com'
    ];

    const enhancedPrompt = `${CHARACTER_PROMPT}\n\nOnly use information from these trusted Solana domains: ${SOLANA_DOMAINS.join(', ')}. Focus on providing accurate market data and analysis from these sources.`;

    const enhancedMessages = [
      { role: 'system', content: enhancedPrompt },
      ...messages
    ];

    console.log('Processing chat request with messages:', JSON.stringify(enhancedMessages));

    // Create completion with Perplexity Sonar Pro
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: enhancedMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    // Ensure the response is ok
    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    // Create and return the streaming response
    const stream = createStream(response);
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
