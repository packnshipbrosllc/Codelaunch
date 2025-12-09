// FILE PATH: src/app/api/user/complete-onboarding/route.ts
// Mark user onboarding as completed

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user details from Clerk for new user creation
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress || '';

    // First, check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    let data, error;

    if (existingUser) {
      // User exists - just update onboarding_completed
      const result = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // User doesn't exist - create with required fields only
      const result = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          onboarding_completed: true,
          subscription_status: 'inactive',
          subscription_tier: 'free',
          mindmaps_created: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error completing onboarding:', error);
      // If column doesn't exist, still return success (graceful degradation)
      if (error.message?.includes('column') && error.message?.includes('onboarding_completed')) {
        console.warn('onboarding_completed column not found - migration may be needed');
        return NextResponse.json({
          success: true,
          note: 'Column not found - migration needed',
        });
      }
      return NextResponse.json(
        { error: 'Failed to update onboarding status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
