// FILE PATH: src/app/api/user/onboarding-status/route.ts
// Check if user has completed onboarding

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
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

    // Check if user exists and has onboarding_completed flag
    // Note: Using 'id' field to match existing codebase pattern
    const { data: user, error } = await supabase
      .from('users')
      .select('onboarding_completed, mindmaps_created')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // If user doesn't exist yet, they need onboarding
    if (!user) {
      return NextResponse.json({
        completed: false,
        isNewUser: true,
      });
    }

    // User has completed onboarding if flag is true OR they've created mindmaps
    const completed = user.onboarding_completed === true || (user.mindmaps_created && user.mindmaps_created > 0);

    return NextResponse.json({
      completed,
      isNewUser: false,
    });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
