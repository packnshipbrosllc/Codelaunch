
// src/app/api/save-mindmap/route.ts
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get Clerk user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🚨 CHECK FREE TIER LIMIT - Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscription_status, mindmaps_created')
      .eq('id', userId)
      .single();

    // If user doesn't exist yet, create them with 0 mindmaps
    if (userError && userError.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          subscription_status: 'inactive',
          mindmaps_created: 0,
        });

      if (insertError) {
        console.error('Error creating user:', insertError);
        return NextResponse.json({
          error: 'Failed to create user profile',
          details: insertError.message,
        }, { status: 500 });
      }
    } else if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({
        error: 'Failed to check user subscription',
        details: userError.message,
      }, { status: 500 });
    }

    // 🚨 ENFORCE 3 MINDMAP LIMIT FOR FREE USERS
    const isSubscribed = user?.subscription_status === 'active';
    const mindmapsCreated = user?.mindmaps_created || 0;

    if (!isSubscribed && mindmapsCreated >= 3) {
      return NextResponse.json({
        error: 'FREE_LIMIT_REACHED',
        message: 'You\'ve used all 3 free mindmaps. Upgrade to continue building!',
        mindmapsCreated,
        limit: 3,
      }, { status: 403 });
    }

    const body = await request.json();
    console.log('Received mindmap data:', body);

    // Extract the actual mindmap data (supports both { mindmapData } and raw object)
    const mindmapData = body?.mindmapData ?? body;

    // 🔒 STRICT: INCREMENT COUNTER BEFORE SAVE (locks the slot immediately)
    // This prevents users from spamming save button or exploiting race conditions
    const newCounterValue = mindmapsCreated + 1;
    const { error: incrementError } = await supabase
      .from('users')
      .update({
        mindmaps_created: newCounterValue,
      })
      .eq('id', userId);

    if (incrementError) {
      console.error('Error incrementing mindmaps_created counter:', incrementError);
      return NextResponse.json({
        error: 'Failed to update usage counter',
        details: incrementError.message,
      }, { status: 500 });
    }

    console.log(`✅ Counter incremented: ${mindmapsCreated} → ${newCounterValue} (STRICT: before save)`);

    // 1) Create a project entry first so it appears on the dashboard
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: mindmapData.projectName,
        description: mindmapData.projectDescription,
        status: 'active',
      })
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error (counter already incremented):', projectError);
      // Counter already incremented - we don't roll it back (STRICT enforcement)
      return NextResponse.json({
        error: 'Failed to create project',
        details: projectError.message,
        note: 'Your usage counter was incremented. Contact support if this was an error.',
        mindmapsCreated: newCounterValue,
      }, { status: 500 });
    }

    // 2) Save the mindmap linked to the newly created project
    const { data: savedMindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .insert({
        user_id: userId, // Clerk user ID (TEXT)
        project_id: project.id,
        data: mindmapData,
      })
      .select()
      .single();

    if (mindmapError) {
      console.error('Mindmap save error (counter already incremented):', mindmapError);
      // Counter already incremented - we don't roll it back (STRICT enforcement)
      // Project exists but mindmap failed
      return NextResponse.json({
        error: 'Failed to save mindmap',
        details: mindmapError.message,
        note: 'Your usage counter was incremented. Contact support if this was an error.',
        project,
        mindmapsCreated: newCounterValue,
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      project, 
      mindmap: savedMindmap,
      mindmapsCreated: newCounterValue,
      isSubscribed,
      remainingFreeMindmaps: isSubscribed ? null : Math.max(0, 3 - newCounterValue),
    });
  } catch (error) {
    console.error('Error saving mindmap:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
