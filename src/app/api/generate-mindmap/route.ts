// src/app/api/generate-mindmap/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { idea } = await req.json();

    if (!idea || idea.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a detailed app idea (at least 10 characters)' },
        { status: 400 }
      );
    }

    console.log('🤖 Generating mindmap for idea:', idea);

    // Call GPT-4o-mini for cost-effective generation
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert product strategist and technical architect. Generate a concise, structured mindmap for a SaaS application idea.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "projectName": "string (2-4 words)",
  "projectDescription": "string (1 sentence, max 150 chars)",
  "targetAudience": "string (1 sentence, max 100 chars)",
  "competitors": [
    {
      "name": "string",
      "strength": "string (1 sentence)",
      "ourAdvantage": "string (1 sentence)"
    }
  ],
  "techStack": {
    "frontend": "string (e.g., Next.js 14, React)",
    "backend": "string (e.g., Node.js, Next.js API)",
    "database": "string (e.g., PostgreSQL, Supabase)",
    "auth": "string (e.g., Clerk, Auth0)",
    "payments": "string (e.g., Stripe, Paddle)",
    "hosting": "string (e.g., Vercel, AWS)"
  },
  "features": [
    {
      "id": "string",
      "title": "string (2-5 words)",
      "description": "string (1 sentence)",
      "priority": "high|medium|low"
    }
  ],
  "monetization": {
    "model": "subscription|one-time|freemium|usage-based",
    "pricing": "string (e.g., $29/month)",
    "freeTier": "string (optional)",
    "paidTier": "string (optional)"
  },
  "userPersona": {
    "name": "string (e.g., Solo Founders)",
    "description": "string (1 sentence)",
    "painPoint": "string (1 sentence)",
    "goal": "string (1 sentence)"
  }
}

Rules:
- Max 3 competitors
- Exactly 6 tech stack items
- 5-8 core MVP features only
- Keep all text concise
- Prioritize high-value features
- Be specific and actionable`
        },
        {
          role: 'user',
          content: `Analyze this SaaS idea and generate a comprehensive mindmap: "${idea}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    console.log('✅ GPT-4o-mini response received');

    const mindmapData = JSON.parse(content);

    // Validate the response has required fields
    if (!mindmapData.projectName || !mindmapData.features) {
      throw new Error('Invalid mindmap structure received from AI');
    }

    console.log('✅ Mindmap generated:', mindmapData.projectName);

    return NextResponse.json({
      success: true,
      data: mindmapData
    });

  } catch (error: any) {
    console.error('❌ Error generating mindmap:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate mindmap'
      },
      { status: 500 }
    );
  }
}

