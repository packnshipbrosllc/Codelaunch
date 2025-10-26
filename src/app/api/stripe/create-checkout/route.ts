import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Add GET for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'POST endpoint is working. Use POST method to create checkout.' 
  });
}

export async function POST(request: Request) {
  console.log('🚀 Checkout POST endpoint called');
  
  try {
    // Get auth
    const { userId } = await auth();
    console.log('User ID:', userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    console.log('Body:', body);

    // For now, just return success to test routing
    return NextResponse.json({ 
      success: true,
      message: 'Endpoint works!',
      userId,
      body 
    });
    
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
