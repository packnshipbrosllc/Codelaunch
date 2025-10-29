// src/app/api/save-mindmap/route.ts

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received mindmap data:', body);

    // Insert into mindmaps table (store full JSON in data column)
    const { data: mindmapData, error } = await supabase
      .from('mindmaps')
      .insert({
        user_id: user.id,
        project_id: null, // or link to a project if available
        data: body,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to save mindmap', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, mindmap: mindmapData });

  } catch (error: any) {
    console.error('Error saving mindmap:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

