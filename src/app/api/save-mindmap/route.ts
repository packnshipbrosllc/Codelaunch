// src/app/api/save-mindmap/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { mindmapData } = await req.json();

    if (!mindmapData || !mindmapData.projectName) {
      return NextResponse.json(
        { error: 'Invalid mindmap data' },
        { status: 400 }
      );
    }

    console.log('💾 Saving mindmap for user:', userId);

    // 1. Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: mindmapData.projectName,
        description: mindmapData.projectDescription,
        status: 'draft',
      })
      .select()
      .single();

    if (projectError) {
      console.error('❌ Error creating project:', projectError);
      throw new Error('Failed to create project');
    }

    console.log('✅ Project created:', project.id);

    // 2. Save mindmap
    const { data: mindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .insert({
        project_id: project.id,
        user_id: userId,
        project_name: mindmapData.projectName,
        project_description: mindmapData.projectDescription,
        target_audience: mindmapData.targetAudience,
        competitors: mindmapData.competitors,
        tech_stack: mindmapData.techStack,
        features: mindmapData.features,
        monetization: mindmapData.monetization,
        user_persona: mindmapData.userPersona,
        // Store empty nodes/edges for now - can be populated from React Flow later
        nodes: [],
        edges: [],
      })
      .select()
      .single();

    if (mindmapError) {
      console.error('❌ Error saving mindmap:', mindmapError);
      // Rollback: delete the project
      await supabase.from('projects').delete().eq('id', project.id);
      throw new Error('Failed to save mindmap');
    }

    console.log('✅ Mindmap saved:', mindmap.id);

    return NextResponse.json({
      success: true,
      data: {
        projectId: project.id,
        mindmapId: mindmap.id,
      },
    });

  } catch (error: any) {
    console.error('❌ Error in save-mindmap:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to save mindmap',
      },
      { status: 500 }
    );
  }
}

