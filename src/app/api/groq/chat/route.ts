import { NextRequest, NextResponse } from 'next/server';
import { GroqService, ChatMessage } from '@/services/GroqService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const response = await GroqService.chat(body.messages as ChatMessage[]);
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Failed to get chat response' },
      { status: 500 }
    );
  }
}
