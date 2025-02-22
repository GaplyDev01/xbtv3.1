import { NextResponse } from 'next/server';
import { db } from '@/services/DatabaseService';

export async function GET() {
  try {
    const history = await db.query(
      `SELECT * FROM chat_history 
       ORDER BY created_at DESC 
       LIMIT 50`
    );
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userMessage, assistantMessage, tokenCount } = await request.json();
    
    const result = await db.query(
      `INSERT INTO chat_history (user_message, assistant_message, token_count)
       VALUES ($1, $2, $3)
       RETURNING *`,
      userMessage,
      assistantMessage,
      tokenCount
    );
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to save chat message:', error);
    return NextResponse.json(
      { error: 'Failed to save chat message' },
      { status: 500 }
    );
  }
}
