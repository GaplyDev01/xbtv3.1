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
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) {
              controller.enqueue(encoder.encode(text));
            } else if (parsed.error) {
              console.error('API returned error:', parsed.error);
              controller.error(new Error(parsed.error.message || 'Unknown API error'));
            }
          } catch (e) {
            console.error('Error parsing message:', e, '\nRaw data:', event.data);
            // Don't throw here - some messages might not be JSON
          }
        },
        onError: (error: Error) => {
          console.error('SSE Parser error:', error);
          controller.error(new Error(`Stream parsing failed: ${error.message}`));
        },
      });

      try {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body available from Perplexity API');
        }

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            if (buffer) {
              // Process any remaining data in buffer
              parser.feed(buffer);
            }
            break;
          }

          const chunk = decoder.decode(value);
          buffer += chunk;

          // Process complete messages from buffer
          const messages = buffer.split('\n\n');
          buffer = messages.pop() || ''; // Keep incomplete message in buffer
          
          for (const message of messages) {
            if (message.trim()) {
              parser.feed(message + '\n\n');
            }
          }
        }
      } catch (e) {
        console.error('Stream reading error:', e);
        controller.error(new Error(`Failed to read stream: ${e.message}`));
      } finally {
        try {
          controller.close();
        } catch (e) {
          console.error('Error closing stream controller:', e);
        }
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
        model: 'sonar-pro-2',
        messages: enhancedMessages,
        stream: true
      }),
    });

    // Ensure the response is ok and handle specific error cases
    if (!response.ok) {
      const errorBody = await response.text().catch(() => null);
      console.error('Perplexity API error details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      
      // Handle specific error cases
      if (response.status === 400) {
        throw new Error('Invalid request to Perplexity API. Please check the message format and model name.');
      } else if (response.status === 401) {
        throw new Error('Authentication failed. Please check your Perplexity API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`Perplexity API error (${response.status}): ${response.statusText}${errorBody ? ' - ' + errorBody : ''}`);
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
