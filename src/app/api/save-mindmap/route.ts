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
        details: (projectError as any).message,
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
        details: (mindmapError as any).message,
        project,
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, project, mindmap: savedMindmap });

  } catch (error) {
    console.error('Error saving mindmap:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

