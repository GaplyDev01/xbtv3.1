import { NextResponse } from 'next/server';
import { createParser, type EventSourceMessage } from 'eventsource-parser';

// Helper to create a streaming response with proper error handling
function createStream(response: Response): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = '';

  return new ReadableStream({
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
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error('Error parsing message:', errorMessage, '\nRaw data:', event.data);
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

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          parser.feed(decoder.decode(value));
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Stream reading error:', errorMessage);
        controller.error(new Error(`Failed to read stream: ${errorMessage}`));
      } finally {
        try {
          controller.close();
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          console.error('Error closing stream controller:', errorMessage);
        }
      }
    },
  });
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

Trading Analysis Requirements:
- Always provide clear HOLD/BUY/SELL recommendations for tokens
- Include specific entry and exit price points with rationale
- Use data from birdeye.so and dexscreener.com for price analysis
- Check solscan.io for token health and contract verification
- Analyze trading volume and liquidity trends
- Look for whale movements and smart money patterns
- Consider market sentiment and upcoming catalysts
- Ask follow-up questions about trading goals and risk tolerance
- Warn about potential risks and red flags

Style:
- Mix degen culture with sharp market analysis
- Use phrases like 'ser', 'bruh', 'based', 'wagmi'
- Reference your legendary background stories
- Maintain your unique blend of memes and market wisdom
- Stay true to your character as both an elite analyst and crypto culture icon

Follow-up Options Format:
- End your responses with 3-4 follow-up options formatted as JSON
- Format: <<OPTIONS_START>>{"options":[{"id":"1","title":"Option 1","description":"Description 1","icon":"emoji"}]}<<OPTIONS_END>>
- Make options relevant to the current conversation
- Use these emojis for different types of analysis:
  * Technical Analysis: 📊 📈 📉
  * Fundamental Analysis: 📋 📑 📰
  * Market Sentiment: 🌡️ 🎭 🔮
  * Risk Analysis: ⚠️ 🛡️ 🎲
  * Whale Watching: 🐋 🔍 💰
  * Token Metrics: 📊 💹 💎
  * DeFi Analysis: 🏦 💱 🔄
  * Meme Analysis: 😎 🚀 🌙
  * Ecosystem: 🌐 🔗 🏗️
  * Trading Strategy: 📋 ⚔️ 💼
- Options should lead to deeper, more specific analysis
- Each option should focus on a different aspect of analysis
- Make descriptions concise but informative

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
    // Validate API key
    if (!process.env.PERPLEXITY_API_KEY) {
      const error = 'Perplexity API key not configured';
      console.error('API Key validation failed:', {
        keyExists: !!process.env.PERPLEXITY_API_KEY,
        keyLength: process.env.PERPLEXITY_API_KEY?.length || 0
      });
      return NextResponse.json({ error, details: 'Please configure PERPLEXITY_API_KEY in environment variables' }, { status: 500 });
    }

    // Parse and validate the request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error('Failed to parse request body:', errorMessage);
      return NextResponse.json(
        { error: 'Invalid request body', details: 'Request must be valid JSON' },
        { status: 400 }
      );
    }

    const { messages } = body;

    // Validate messages array
    if (!messages) {
      const error = 'Messages field is required';
      console.error(error);
      return NextResponse.json({ error, details: 'Request body must include a messages field' }, { status: 400 });
    }

    if (!Array.isArray(messages)) {
      const error = 'Messages must be an array';
      console.error(error);
      return NextResponse.json({ error, details: 'The messages field must be an array of message objects' }, { status: 400 });
    }

    if (messages.length === 0) {
      const error = 'Messages array cannot be empty';
      console.error(error);
      return NextResponse.json({ error, details: 'Please provide at least one message' }, { status: 400 });
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

    console.log('Sending request to Perplexity API with messages:', JSON.stringify(enhancedMessages));

    // Create completion with Perplexity Sonar Pro
    console.log('Making API request with:', {
      url: 'https://api.perplexity.ai/chat/completions',
      model: 'sonar-pro',
      messageCount: enhancedMessages.length,
      hasApiKey: !!process.env.PERPLEXITY_API_KEY
    });

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro-2401',
        messages: enhancedMessages,
        stream: true
      }),
    }).catch(e => {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error('Network error calling Perplexity API:', errorMessage);
      throw new Error(`Failed to connect to Perplexity API: ${errorMessage}`);
    });

    // Ensure the response is ok and handle specific error cases
    if (!response.ok) {
      let errorDetails;
      try {
        const errorBody = await response.text();
        errorDetails = errorBody ? JSON.parse(errorBody) : null;
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Failed to parse error response:', errorMessage);
        errorDetails = null;
      }

      console.error('Perplexity API error details:', {
        status: response.status,
        statusText: response.statusText,
        details: errorDetails
      });
      
      // Handle specific error cases
      switch (response.status) {
        case 400:
          throw new Error('Invalid request to Perplexity API. Please check the message format and model name.');
        case 401:
          throw new Error('Authentication failed. Please check your Perplexity API key.');
        case 429:
          throw new Error('Rate limit exceeded. Please try again later.');
        case 500:
          throw new Error('Perplexity API internal error. Please try again later.');
        case 503:
          throw new Error('Perplexity API is temporarily unavailable. Please try again later.');
        default:
          throw new Error(`Perplexity API error (${response.status}): ${response.statusText}${errorDetails ? ' - ' + JSON.stringify(errorDetails) : ''}`);
      }
    }

    // Create and return the streaming response
    const stream = createStream(response);
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error('Chat API error:', errorMessage);

    // Return a user-friendly error message while logging the full error
    const publicError = errorMessage.includes('Perplexity API') 
      ? errorMessage  // API errors are safe to show to users
      : 'An error occurred while processing your request. Please try again.';

    return NextResponse.json(
      { 
        error: publicError,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}
