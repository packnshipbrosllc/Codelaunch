// FILE PATH: src/app/api/user/complete-onboarding/route.ts
// Mark user onboarding as completed

import { auth } from '@clerk/nextjs/server';
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

    // Update or insert user with onboarding_completed = true
    // Note: Using 'id' field to match existing codebase pattern
    // If onboarding_completed column doesn't exist yet, this will fail gracefully
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      })
      .select()
      .single();

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
