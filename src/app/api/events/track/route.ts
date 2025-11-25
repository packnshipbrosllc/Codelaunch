import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { event_name, event_data } = await req.json();

    if (!event_name) {
      return NextResponse.json(
        { error: 'event_name is required' },
        { status: 400 }
      );
    }

    // Enrich event data with server-side metadata
    const enrichedEventData = {
      ...(event_data || {}),
      // Server-side metadata (backup in case client-side metadata is missing)
      server_timestamp: new Date().toISOString(),
      server_received_at: new Date().toISOString(),
    };

    // Insert event into user_events table
    const { error } = await supabase
      .from('user_events')
      .insert({
        user_id: userId, // CRITICAL: User ID from auth session
        event_name,
        event_data: enrichedEventData,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error tracking event:', error);
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Error in track route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

