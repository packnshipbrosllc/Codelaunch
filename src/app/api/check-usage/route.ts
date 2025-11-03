// src/app/api/check-usage/route.ts
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FREE_TIER_LIMIT = 3;

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('mindmaps_created, subscription_status')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // User doesn't exist yet - return default values
      return NextResponse.json({
        mindmapsCreated: 0,
        limit: FREE_TIER_LIMIT,
        remaining: FREE_TIER_LIMIT,
        isProUser: false,
      });
    }

    if (error) {
      console.error('Error fetching usage:', error);
      return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
    }

    const mindmapsCreated = userData?.mindmaps_created || 0;
    const isProUser = userData?.subscription_status === 'active';

    return NextResponse.json({
      mindmapsCreated,
      limit: isProUser ? 'unlimited' : FREE_TIER_LIMIT,
      remaining: isProUser ? 'unlimited' : Math.max(0, FREE_TIER_LIMIT - mindmapsCreated),
      isProUser,
    });

  } catch (error: any) {
    console.error('Error checking usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

