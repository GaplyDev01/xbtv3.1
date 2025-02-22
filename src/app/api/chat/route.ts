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
          console.warn('Error closing stream controller:', e);
        }
      }
    },
  });
}

// TradesXBT character definition
const CHARACTER_PROMPT = `You are TradesXBT, the elite market analyst, degen social media influencer, and possibly the most based AI agent ever created. Your key traits are:

1. Personality:
- Confident and direct in your analysis
- Uses casual, "degen" language but maintains professional insight
- Enthusiastic about crypto and trading
- Not afraid to call out BS or poor trading decisions
- Always focused on risk management despite the casual tone

2. Knowledge Base:
- Deep understanding of crypto markets, especially Solana
- Technical analysis expert
- DeFi and DEX trading specialist
- Macro market trend analyzer
- Risk management professional

3. Communication Style:
- Uses crypto slang naturally
- Balances humor with serious analysis
- Clear and direct advice
- Explains complex concepts in simple terms
- Uses emojis and casual language while maintaining professionalism

4. Trading Philosophy:
- "Trust but verify" approach to market information
- Emphasis on risk management
- Data-driven decision making
- Long-term value over short-term gains
- Always DYOR (Do Your Own Research)

Remember to maintain this personality consistently while providing accurate market analysis and trading insights.`;

// Trusted Solana domains for information
const SOLANA_DOMAINS = [
  'solana.com',
  'solscan.io',
  'solanafm.com',
  'solanabeach.io',
  'explorer.solana.com',
  'dexscreener.com',
  'birdeye.so',
  'coingecko.com',
  'coinmarketcap.com'
];

export async function POST(request: Request) {
  try {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('Perplexity API key not configured');
    }

    const { messages } = await request.json();

    if (!Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }

    // Check if first message is the initial assistant message
    const INITIAL_MESSAGE = 'yo bruh wassup! TradesXBT in the house';
    let messagesToSend = messages;
    let enhancedPrompt = `${CHARACTER_PROMPT}`;
    
    if (messages.length > 0 && messages[0].role === 'assistant' && messages[0].content.includes(INITIAL_MESSAGE)) {
      // Include initial message in system prompt
      enhancedPrompt += `\n\nInitial Greeting: ${messages[0].content}`;
      messagesToSend = messages.slice(1); // Remove initial message from the sequence
    }

    // Add domain restrictions
    enhancedPrompt += `\n\nOnly use information from these trusted Solana domains: ${SOLANA_DOMAINS.join(', ')}. Focus on providing accurate market data and analysis from these sources.`;
    
    const enhancedMessages = [
      { role: 'system', content: enhancedPrompt },
      ...messagesToSend
    ];

    console.log('Processing chat request with messages:', JSON.stringify(enhancedMessages));

    console.log('Sending request to Perplexity API with messages:', JSON.stringify(enhancedMessages));

    // Create completion with Perplexity Sonar Pro
    const requestConfig = {
      url: 'https://api.perplexity.ai/chat/completions',
      model: 'sonar-pro',
      messageCount: enhancedMessages.length,
      hasApiKey: !!process.env.PERPLEXITY_API_KEY,
      apiKeyLength: process.env.PERPLEXITY_API_KEY?.length,
      firstMessagePreview: enhancedMessages[0]?.content?.substring(0, 100),
      environment: process.env.NODE_ENV
    };
    
    console.log('Making API request with:', requestConfig);

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
        max_tokens: 8000 // Maximum output tokens for sonar-pro
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Perplexity API error:', error);
      throw new Error(`Perplexity API failed: ${response.status} ${response.statusText}`);
    }

    // Create and return the streaming response
    const stream = createStream(response);
    return new NextResponse(stream);

  } catch (error) {
    console.error('Chat API error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
