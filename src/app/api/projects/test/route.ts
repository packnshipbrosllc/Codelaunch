// src/app/api/projects/test/route.ts
// Simple test endpoint to verify API is working
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    return NextResponse.json({
      success: true,
      message: 'API is working',
      userId: userId || 'Not authenticated',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

