
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

    // ✅ NOTE: Limit is enforced at GENERATION, not save
    // Counter is incremented when user clicks "Generate", not when they save
    // This protects your OpenAI API costs - you pay for generation, not saving

    const body = await request.json();
    console.log('Received mindmap data:', body);

    // Extract the actual mindmap data (supports both { mindmapData } and raw object)
    const mindmapData = body?.mindmapData ?? body;

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
      console.error('Project creation error:', projectError);
      return NextResponse.json({
        error: 'Failed to create project',
        details: projectError.message,
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
      console.error('Mindmap save error:', mindmapError);
      // Project exists but mindmap failed
      return NextResponse.json({
        error: 'Failed to save mindmap',
        details: mindmapError.message,
        project,
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      project, 
      mindmap: savedMindmap,
    });
  } catch (error) {
    console.error('Error saving mindmap:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
