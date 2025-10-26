import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check subscription status in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking subscription:', error);
      // If user doesn't exist in DB yet, they need to subscribe
      return NextResponse.json({ hasSubscription: false });
    }

    // User has subscription if status is 'active'
    const hasSubscription = user?.subscription_status === 'active';

    return NextResponse.json({ hasSubscription });
  } catch (error) {
    console.error('Subscription check failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

