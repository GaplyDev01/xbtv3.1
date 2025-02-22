import { NextRequest, NextResponse } from 'next/server';
import { GroqService, TokenAnalysisRequest } from '@/services/GroqService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as TokenAnalysisRequest;
    
    if (!body.tokenSymbol || !body.tokenName) {
      return NextResponse.json(
        { error: 'Missing required token information' },
        { status: 400 }
      );
    }

    const analysis = await GroqService.analyzeToken(body);
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error in analyze route:', error);
    return NextResponse.json(
      { error: 'Failed to analyze token' },
      { status: 500 }
    );
  }
}
