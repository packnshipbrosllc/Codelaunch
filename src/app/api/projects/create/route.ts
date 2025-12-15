// src/app/api/projects/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Force dynamic rendering - prevents static analysis at build time
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes - Vercel Pro

// Lazy initialization for OpenAI
function getOpenAI() {
  const { default: OpenAI } = require('openai');
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({ apiKey });
}

// Lazy initialization for Supabase
function getSupabase() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { description } = body;

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    console.log('Generating mindmap for:', description);

    // Generate mindmap structure using GPT-4o mini
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert product manager and software architect. Generate a comprehensive feature mindmap for app ideas.

Return ONLY valid JSON with no markdown formatting. Structure:

{
  "projectName": "Short, catchy name for the app",
  "projectDescription": "2-3 sentence description of the app",
  "features": [
    {
      "id": "feature-1",
      "title": "Feature Name",
      "description": "What this feature does",
      "priority": "must-have",
      "complexity": "moderate",
      "estimatedTime": "2-3 days",
      "dependencies": [],
      "category": "Authentication"
    }
  ],
  "competitors": [
    {
      "name": "Competitor Name",
      "url": "https://example.com",
      "strength": "What they do well",
      "ourAdvantage": "How we're better"
    }
  ],
  "techStack": {
    "frontend": ["Next.js", "React", "TailwindCSS"],
    "backend": ["Node.js"],
    "database": ["PostgreSQL"],
    "other": ["Clerk Auth"]
  },
  "targetAudience": "Primary target users",
  "userPersona": {
    "name": "Persona Name",
    "description": "Description",
    "painPoint": "Main pain point"
  },
  "monetization": {
    "model": "subscription",
    "pricing": "$29/month"
  }
}

Rules:
- Include 8-15 features
- Categorize features: Authentication, Database, Core Features, UI, API, Payment, etc
- Set realistic priorities: must-have, should-have, nice-to-have
- Set complexity: simple, moderate, complex
- Include dependencies (e.g., "User Dashboard" depends on "Authentication")
- Use clear, professional language`
        },
        {
          role: "user",
          content: `Generate a comprehensive feature mindmap for: "${description}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0].message.content || '';
    
    let mindmapData;
    try {
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      mindmapData = JSON.parse(cleanedText);
      console.log('Parsed mindmap data:', mindmapData);
    } catch (parseError) {
      console.error('Failed to parse mindmap JSON:', responseText);
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Create project in database using existing schema
    // Note: Using both name/project_name and description/idea for compatibility
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        project_name: mindmapData.projectName,
        name: mindmapData.projectName, // Also set name for compatibility
        idea: mindmapData.projectDescription,
        description: mindmapData.projectDescription, // Also set description for compatibility
        mindmap_data: {
          projectName: mindmapData.projectName,
          projectDescription: mindmapData.projectDescription,
          features: mindmapData.features || [],
          competitors: mindmapData.competitors || [],
          techStack: mindmapData.techStack || {},
          targetAudience: mindmapData.targetAudience || '',
          userPersona: mindmapData.userPersona || null,
          monetization: mindmapData.monetization || null,
        },
        status: 'draft',
        created_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (projectError) {
      console.error('Failed to create project:', projectError);
      return NextResponse.json(
        { success: false, error: 'Failed to create project in database' },
        { status: 500 }
      );
    }

    console.log('✅ Created project:', project.id);
    console.log('📊 Project data structure:', {
      id: project.id,
      project_name: project.project_name,
      idea: project.idea,
      has_mindmap_data: !!project.mindmap_data,
      mindmap_data_keys: project.mindmap_data ? Object.keys(project.mindmap_data) : [],
    });

    return NextResponse.json({
      success: true,
      projectId: project.id,
      project: {
        id: project.id,
        name: project.project_name,
        description: project.idea,
        techStack: mindmapData.techStack,
      },
    });

  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}

