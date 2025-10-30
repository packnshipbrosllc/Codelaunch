// src/app/api/save-prd/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 90;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [Save PRD] Starting save process');

    const { userId } = await auth();
    
    if (!userId) {
      console.log('❌ [Save PRD] No user ID found');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📦 [Save PRD] Request body keys:', Object.keys(body));
    
    const { projectId, content, rawText, metadata } = body;

    if (!projectId) {
      console.log('❌ [Save PRD] Missing project ID');
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!content && !rawText) {
      console.log('❌ [Save PRD] Missing content');
      return NextResponse.json(
        { success: false, error: 'PRD content is required' },
        { status: 400 }
      );
    }

    // Structure the PRD content properly
    const prdContent = {
      content: content || rawText,
      rawText: rawText || content,
      metadata: metadata || {
        generatedAt: new Date().toISOString(),
        model: 'claude-sonnet-4-5'
      }
    } as const;

    console.log('💾 [Save PRD] Saving for project:', projectId);

    // Check if PRD already exists for this project
    const { data: existing } = await supabase
      .from('prds')
      .select('id, version')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    let result;
    const newVersion = existing ? (existing as any).version + 1 : 1;

    console.log(`📝 [Save PRD] Creating version ${newVersion}`);

    const { data, error } = await supabase
      .from('prds')
      .insert({
        project_id: projectId,
        user_id: userId,
        content: prdContent,
        version: newVersion,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [Save PRD] Supabase error:', error);
      throw error;
    }

    result = data;
    console.log('✅ [Save PRD] Successfully saved PRD:', (result as any).id);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('❌ [Save PRD] Error:', error);
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
