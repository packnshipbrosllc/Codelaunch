// API route to get existing PRD and code for a feature
// Location: src/app/api/features/[featureId]/prd-code/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

function getSupabase() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { featureId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mindmapId = searchParams.get('mindmapId');
    
    if (!mindmapId) {
      return NextResponse.json(
        { error: 'mindmapId is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const featureId = params.featureId;

    // Fetch PRD
    const { data: prdData, error: prdError } = await supabase
      .from('feature_prds')
      .select('prd_data, updated_at')
      .eq('mindmap_id', mindmapId)
      .eq('feature_id', featureId)
      .single();

    // Fetch Code
    const { data: codeData, error: codeError } = await supabase
      .from('feature_code')
      .select('code_data, updated_at')
      .eq('mindmap_id', mindmapId)
      .eq('feature_id', featureId)
      .single();

    return NextResponse.json({
      success: true,
      prd: prdData?.prd_data || null,
      prdUpdatedAt: prdData?.updated_at || null,
      code: codeData?.code_data || null,
      codeUpdatedAt: codeData?.updated_at || null,
    });
  } catch (error: any) {
    console.error('Error fetching PRD/code:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch PRD/code' 
      },
      { status: 500 }
    );
  }
}

