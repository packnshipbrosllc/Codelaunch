// src/app/api/projects/duplicate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get original project
    const { data: original, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Create duplicate
    const { data: duplicate, error: createError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        project_name: `${original.project_name} (Copy)`,
        idea: original.idea,
        mindmap_data: original.mindmap_data,
        status: 'draft',
        tech_stack: original.tech_stack,
        competitors_analysis: original.competitors_analysis,
        monetization_model: original.monetization_model,
        target_audience: original.target_audience,
      })
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({
      success: true,
      data: duplicate,
    });

  } catch (error: any) {
    console.error('Error duplicating project:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to duplicate project' 
      },
      { status: 500 }
    );
  }
}
