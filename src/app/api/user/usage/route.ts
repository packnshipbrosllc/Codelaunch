import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's subscription status and mindmap count
    const { data: user, error } = await supabase
      .from('users')
      .select('subscription_status, mindmaps_created')
      .eq('id', userId)
      .single();

    if (error || !user) {
      // User doesn't exist yet, return default values
      return NextResponse.json({
        subscription_status: 'inactive',
        mindmaps_created: 0,
      });
    }

    return NextResponse.json({
      subscription_status: user.subscription_status || 'inactive',
      mindmaps_created: user.mindmaps_created || 0,
    });
  } catch (error) {
    console.error('Error fetching user usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

