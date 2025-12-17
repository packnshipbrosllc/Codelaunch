// API route to get existing PRD and code for a feature
// Location: src/app/api/features/[featureId]/prd-code/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ featureId: string }> }
) {
  try {
    const { userId } = await auth();
    const { featureId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get mindmapId from query params
    const searchParams = request.nextUrl.searchParams;
    const mindmapId = searchParams.get('mindmapId');

    if (!mindmapId) {
      return NextResponse.json({ error: 'mindmapId required' }, { status: 400 });
    }

    // Fetch PRD
    const { data: prdData } = await supabase
      .from('feature_prds')
      .select('*')
      .eq('mindmap_id', mindmapId)
      .eq('feature_id', featureId)
      .single();

    // Fetch Code
    const { data: codeData } = await supabase
      .from('feature_code')
      .select('*')
      .eq('mindmap_id', mindmapId)
      .eq('feature_id', featureId)
      .single();

    return NextResponse.json({
      success: true,
      prd: prdData?.prd_data || null,
      prdUpdatedAt: prdData?.updated_at || null,
      code: codeData?.code_data || null,
      codeUpdatedAt: codeData?.updated_at || null
    });

  } catch (error) {
    console.error('Error fetching PRD/code:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

