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

    // Insert into mindmaps table using Clerk userId
    const { data: mindmapData, error } = await supabase
      .from('mindmaps')
      .insert({
        user_id: userId, // Clerk user ID
        project_id: null,
        data: body,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to save mindmap', 
        details: (error as any).message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, mindmap: mindmapData });

  } catch (error) {
    console.error('Error saving mindmap:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

