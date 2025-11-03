// api/decision-tree/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, decisions, appPurpose, appType } = await req.json();

    if (!sessionId || !decisions || !appPurpose || !appType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build a comprehensive prompt for Claude/OpenAI
    const decisionsText = Object.entries(decisions)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');

    const prompt = `You are an expert app architect. Based on the user's decisions, create a comprehensive mindmap structure for their ${appPurpose} ${appType} app.

User Decisions:
${decisionsText}

App Purpose: ${appPurpose}
App Type: ${appType}

Create a detailed mindmap JSON structure that includes:
1. projectName - A descriptive name for the app
2. projectDescription - A clear description
3. targetAudience - Who will use this app
4. competitors - 3-5 similar apps/services
5. techStack - Based on the decisions (e.g., Stripe for payments, Clerk for auth, Supabase for database)
6. features - Array of features based on their choices
7. monetization - How the app will make money
8. userPersona - A typical user profile

Return ONLY valid JSON matching this structure:
{
  "projectName": "...",
  "projectDescription": "...",
  "targetAudience": "...",
  "competitors": ["...", "..."],
  "techStack": {
    "frontend": "...",
    "backend": "...",
    "database": "...",
    "authentication": "...",
    "payment": "...",
    "hosting": "..."
  },
  "features": [
    {
      "id": "feature1",
      "name": "...",
      "description": "...",
      "priority": "high|medium|low"
    }
  ],
  "monetization": {
    "model": "...",
    "pricing": "..."
  },
  "userPersona": {
    "name": "...",
    "age": "...",
    "occupation": "...",
    "goals": ["...", "..."],
    "painPoints": ["...", "..."]
  }
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert app architect. Generate detailed, actionable app structures based on user requirements. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Parse the JSON response
    let mindmapData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      mindmapData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Fallback: try to parse as-is
      mindmapData = JSON.parse(content);
    }

    // Validate structure
    if (!mindmapData.projectName || !mindmapData.features) {
      throw new Error('Invalid mindmap structure received from AI');
    }

    // Update decision path with generated mindmap
    const { error: updateError } = await supabase
      .from('decision_paths')
      .update({
        generated_mindmap: mindmapData,
        completed_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    if (updateError) {
      console.error('Error updating decision path with mindmap:', updateError);
      // Don't fail the request if DB update fails
    }

    return NextResponse.json({
      success: true,
      data: mindmapData,
      sessionId
    });

  } catch (error: any) {
    console.error('Error generating mindmap:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to generate mindmap',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

