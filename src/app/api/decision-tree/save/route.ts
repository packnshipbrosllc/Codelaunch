// api/decision-tree/save/route.ts
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, appPurpose, appType, decisions, currentStep, totalSteps } = await req.json();

    if (!sessionId || !appPurpose || !appType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if decision path already exists
    const { data: existing } = await supabase
      .from('decision_paths')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      // Update existing path
      const { error } = await supabase
        .from('decision_paths')
        .update({
          decisions,
          current_step: currentStep,
          total_steps: totalSteps,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error updating decision path:', error);
        return NextResponse.json(
          { error: 'Failed to save progress', details: error.message },
          { status: 500 }
        );
      }
    } else {
      // Create new path
      const { error } = await supabase
        .from('decision_paths')
        .insert({
          user_id: userId,
          session_id: sessionId,
          app_purpose: appPurpose,
          app_type: appType,
          decisions,
          current_step: currentStep,
          total_steps: totalSteps
        });

      if (error) {
        console.error('Error creating decision path:', error);
        return NextResponse.json(
          { error: 'Failed to save progress', details: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error saving decision path:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

