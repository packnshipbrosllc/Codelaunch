// api/decision-tree/generate/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Force dynamic rendering - prevents static analysis at build time
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes - Vercel Pro

// Lazy initialization for Anthropic
function getAnthropic() {
  const { default: Anthropic } = require('@anthropic-ai/sdk');
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return new Anthropic({ apiKey });
}

// Lazy initialization for Supabase
function getSupabase() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();

    const body = await request.json();
    const { sessionId, decisions, appPurpose, appType } = body;

    if (!decisions || Object.keys(decisions).length === 0) {
      return NextResponse.json(
        { error: 'No decisions provided' },
        { status: 400 }
      );
    }

    // Build a detailed prompt based on user's decisions
    const prompt = buildPromptFromDecisions(decisions, appPurpose, appType);

    // Call Claude to generate the mindmap
    const anthropic = getAnthropic();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    let mindmapData;
    try {
      const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      mindmapData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse mindmap:', parseError);
      return NextResponse.json({
        error: 'Failed to parse generated mindmap',
        rawResponse: responseText
      }, { status: 500 });
    }

    // Save the generated mindmap to decision_paths table
    const { error: updateError } = await supabase
      .from('decision_paths')
      .update({
        generated_mindmap: mindmapData,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error saving mindmap:', updateError);
    }

    return NextResponse.json({
      success: true,
      data: mindmapData,
      message: 'App structure generated successfully!'
    });

  } catch (error: any) {
    console.error('Error generating app:', error);
    return NextResponse.json(
      { error: 'Failed to generate app', details: error.message },
      { status: 500 }
    );
  }
}

function buildPromptFromDecisions(
  decisions: Record<string, string>,
  appPurpose: string,
  appType: string
): string {
  const decisionsText = Object.entries(decisions)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');

  return `You are an expert software architect. Based on the user's decisions, create a detailed, production-ready mindmap for their app.

USER'S APP CONFIGURATION:
Purpose: ${appPurpose}
Platform: ${appType}

DECISIONS MADE:
${decisionsText}

Create a comprehensive mindmap that includes:
1. **Root Node**: The app name/purpose
2. **Core Features**: Based on their chosen functionality
3. **Technical Stack**: The exact technologies they selected (database, auth, payment, etc.)
4. **User Flow**: How users will interact with the app
5. **Database Schema**: Tables and relationships needed
6. **API Endpoints**: RESTful routes for backend
7. **Integrations**: External services (Stripe, email, etc.)
8. **Deployment**: Their chosen hosting platform
9. **Competitor Research**: 3-5 top competitors in this space with their key features and pricing
10. **Competitive Advantages**: What makes this app unique compared to competitors

IMPORTANT REQUIREMENTS:
- Include ALL user selections in the mindmap (e.g., if they chose Stripe, specify Stripe integration details)
- Add competitor research section with 3-5 real competitors
- List competitive advantages - what makes this app different
- Be specific about technologies chosen (don't use generic terms)
- Include pricing models if relevant
- Add unique value propositions

Return ONLY valid JSON matching this exact structure (no extra fields):
{
  "projectName": "App Name",
  "projectDescription": "Detailed description",
  "targetAudience": "Who will use this",
  "competitors": [
    {
      "name": "Competitor Name",
      "url": "https://competitor.com",
      "strength": "What they do well",
      "ourAdvantage": "How we're better"
    }
  ],
  "techStack": {
    "frontend": "Specific framework chosen",
    "backend": "Specific backend chosen",
    "database": "Specific database chosen (e.g., Supabase, Firebase)",
    "auth": "Specific auth provider chosen (e.g., Clerk, Auth0)",
    "payments": "Specific payment processor chosen (e.g., Stripe, PayPal)",
    "hosting": "Specific hosting platform chosen (e.g., Vercel, AWS)"
  },
  "features": [
    {
      "id": "feature1",
      "title": "Feature Name",
      "description": "What it does - be specific about the technology chosen",
      "priority": "high"
    }
  ],
  "monetization": {
    "model": "subscription|one-time|freemium|usage-based",
    "pricing": "Specific pricing based on their choices"
  },
  "userPersona": {
    "name": "Persona name",
    "description": "Brief description",
    "painPoint": "Main problem they face",
    "goal": "What they want to achieve"
  }
}

IMPORTANT: 
- Include specific technologies based on their choices. If they chose Stripe, mention Stripe. If they chose Clerk, mention Clerk. Be precise and actionable.
- Add real competitor research with actual competitor names and details
- Highlight competitive advantages that differentiate this app`;
}
