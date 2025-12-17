// API route to get usage stats
// Location: src/app/api/usage/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

function getSupabase() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabase();
    const monthYear = new Date().toISOString().slice(0, 7); // "2025-12"
    
    // Fetch usage stats for current month
    const { data: usage, error } = await supabase
      .from('user_usage')
      .select('prd_count, code_gen_count')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine - user hasn't used any yet
      console.error('Error fetching usage stats:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Failed to fetch usage stats' 
        },
        { status: 500 }
      );
    }
    
    // Return stats (default to 0 if no record exists)
    const stats = {
      prd: {
        used: usage?.prd_count || 0,
        limit: 20,
      },
      code: {
        used: usage?.code_gen_count || 0,
        limit: 10,
      },
    };
    
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch usage stats' 
      },
      { status: 500 }
    );
  }
}

