import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin check here if needed
    // For now, any authenticated user can view metrics

    // Get total signups (users who have any events)
    const { data: totalSignups } = await supabase
      .from('user_events')
      .select('user_id', { count: 'exact', head: true })
      .not('user_id', 'is', null);

    // Get unique users for each event type
    const eventTypes = [
      'onboarding_demo_started',
      'onboarding_demo_completed',
      'onboarding_user_mindmap_started',
      'onboarding_completed',
      'onboarding_skipped',
    ];

    const metrics: Record<string, number> = {
      totalSignups: totalSignups?.length || 0,
    };

    for (const eventType of eventTypes) {
      const { data, error } = await supabase
        .from('user_events')
        .select('user_id', { count: 'exact' })
        .eq('event_name', eventType);

      if (!error && data) {
        // Count unique users
        const uniqueUsers = new Set(data.map((row: any) => row.user_id));
        metrics[eventType] = uniqueUsers.size;
      } else {
        metrics[eventType] = 0;
      }
    }

    // Rename keys for better readability
    return NextResponse.json({
      totalSignups: metrics.totalSignups,
      demoStarted: metrics.onboarding_demo_started || 0,
      demoCompleted: metrics.onboarding_demo_completed || 0,
      userMindmapCreated: metrics.onboarding_user_mindmap_started || 0,
      onboardingCompleted: metrics.onboarding_completed || 0,
      skipped: metrics.onboarding_skipped || 0,
    });
  } catch (error: any) {
    console.error('Error in onboarding-metrics route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

