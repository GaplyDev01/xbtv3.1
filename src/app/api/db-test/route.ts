import { NextResponse } from 'next/server';
import { db } from '@/services/DatabaseService';

export async function GET() {
  try {
    // Test database connection
    const result = await db.query<{ now: Date }>('SELECT NOW()');
    
    return NextResponse.json({
      status: 'success',
      timestamp: result[0]?.now,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
