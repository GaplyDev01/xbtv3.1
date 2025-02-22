import { NextResponse } from 'next/server';
import { TokenService } from '@/services/TokenService';



export async function GET(request: Request) {
  try {
    // Verify API key if needed
    const authHeader = request.headers.get('authorization');
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update token prices using TokenService
    await TokenService.updateTokenPrices();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${tokenPrices.length} token prices`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error updating token prices:', error);
    return NextResponse.json(
      { error: 'Failed to update token prices' },
      { status: 500 }
    );
  }
}
