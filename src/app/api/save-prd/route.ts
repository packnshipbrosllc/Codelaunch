// src/app/api/save-prd/route.ts
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
    const { projectId, content, status = 'draft' } = body;

    if (!projectId || !content) {
      return NextResponse.json(
        { success: false, error: 'Project ID and content are required' },
        { status: 400 }
      );
    }

    // Check if PRD already exists for this project
    const { data: existing } = await supabase
      .from('prds')
      .select('id, version')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    let result;

    if (existing) {
      // Create new version
      const { data, error } = await supabase
        .from('prds')
        .insert({
          project_id: projectId,
          user_id: userId,
          content,
          version: existing.version + 1,
          status,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create first version
      const { data, error } = await supabase
        .from('prds')
        .insert({
          project_id: projectId,
          user_id: userId,
          content,
          version: 1,
          status,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('Error saving PRD:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to save PRD' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve PRD
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get latest PRD for project
    const { data, error } = await supabase
      .from('prds')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || null,
    });

  } catch (error: any) {
    console.error('Error retrieving PRD:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to retrieve PRD' 
      },
      { status: 500 }
    );
  }
}
