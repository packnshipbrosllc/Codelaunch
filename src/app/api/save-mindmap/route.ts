// src/app/api/save-mindmap/route.ts

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FREE_MINDMAP_LIMIT = 3;

export async function POST(request: Request) {
  try {
    // Get Clerk user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received mindmap data:', body);

    // Extract the actual mindmap data (supports both { mindmapData } and raw object)
    const mindmapData = body?.mindmapData ?? body;

    // Check user's subscription status and mindmap count
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscription_status, mindmaps_created')
      .eq('id', userId)
      .single();

    // If user doesn't exist, create them
    if (userError || !user) {
      console.log('User not found, creating user profile...');
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          subscription_status: 'inactive',
          subscription_tier: 'free',
          mindmaps_created: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create user:', createError);
        return NextResponse.json({
          error: 'Failed to create user profile',
          details: (createError as any).message,
        }, { status: 500 });
      }

      // Use the newly created user
      const isSubscribed = newUser.subscription_status === 'active';
      const mindmapsCreated = newUser.mindmaps_created || 0;

      // Check free limit
      if (!isSubscribed && mindmapsCreated >= FREE_MINDMAP_LIMIT) {
        return NextResponse.json({
          error: 'FREE_LIMIT_REACHED',
          message: `You've reached your free limit of ${FREE_MINDMAP_LIMIT} mindmaps. Please upgrade to Pro to create unlimited mindmaps.`,
          remainingFreeMindmaps: 0,
        }, { status: 403 });
      }

      // Increment counter before creating project
      const { error: incrementError } = await supabase
        .from('users')
        .update({ mindmaps_created: mindmapsCreated + 1 })
        .eq('id', userId);

      if (incrementError) {
        console.error('Failed to increment mindmap counter:', incrementError);
      }

      // Create project and mindmap
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

      const { data: savedMindmap, error: mindmapError } = await supabase
        .from('mindmaps')
        .insert({
          user_id: userId,
          project_id: project.id,
          data: mindmapData,
        })
        .select()
        .single();

      if (mindmapError) {
        console.error('Mindmap save error:', mindmapError);
        return NextResponse.json({
          error: 'Failed to save mindmap',
          details: (mindmapError as any).message,
          project,
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        project,
        mindmap: savedMindmap,
        remainingFreeMindmaps: isSubscribed ? null : Math.max(0, FREE_MINDMAP_LIMIT - (mindmapsCreated + 1)),
      });
    }

    // User exists - check limits
    const isSubscribed = user.subscription_status === 'active';
    const mindmapsCreated = user.mindmaps_created || 0;

    // Check free limit
    if (!isSubscribed && mindmapsCreated >= FREE_MINDMAP_LIMIT) {
      return NextResponse.json({
        error: 'FREE_LIMIT_REACHED',
        message: `You've reached your free limit of ${FREE_MINDMAP_LIMIT} mindmaps. Please upgrade to Pro to create unlimited mindmaps.`,
        remainingFreeMindmaps: 0,
      }, { status: 403 });
    }

    // Increment counter before creating project
    const { error: incrementError } = await supabase
      .from('users')
      .update({ mindmaps_created: mindmapsCreated + 1 })
      .eq('id', userId);

    if (incrementError) {
      console.error('Failed to increment mindmap counter:', incrementError);
    }

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

    return NextResponse.json({
      success: true,
      project,
      mindmap: savedMindmap,
      remainingFreeMindmaps: isSubscribed ? null : Math.max(0, FREE_MINDMAP_LIMIT - (mindmapsCreated + 1)),
    });

  } catch (error) {
    console.error('Error saving mindmap:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
