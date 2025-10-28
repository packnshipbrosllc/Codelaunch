// src/app/api/tech-recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectName, idea, features, targetPlatforms } = body;

    if (!projectName || !idea) {
      return NextResponse.json(
        { success: false, error: 'Project name and idea are required' },
        { status: 400 }
      );
    }

    const prompt = `You are a senior software architect. Analyze this project and recommend the best technology stack.

PROJECT:
- Name: ${projectName}
- Description: ${idea}
${features ? `- Features: ${JSON.stringify(features)}` : ''}
${targetPlatforms ? `- Target Platforms: ${JSON.stringify(targetPlatforms)}` : ''}

Provide tech stack recommendations in this JSON format:
{
  "frontend": {
    "framework": "string (e.g., React, Vue, Svelte)",
    "reasoning": "string",
    "alternatives": ["string"],
    "libraries": ["string"],
    "styling": "string (e.g., Tailwind CSS)",
    "stateManagement": "string"
  },
  "backend": {
    "language": "string (e.g., Node.js, Python, Go)",
    "framework": "string (e.g., Next.js, Express, FastAPI)",
    "reasoning": "string",
    "alternatives": ["string"]
  },
  "database": {
    "primary": "string (e.g., PostgreSQL, MongoDB)",
    "reasoning": "string",
    "alternatives": ["string"],
    "caching": "string (e.g., Redis)"
  },
  "hosting": {
    "platform": "string (e.g., Vercel, AWS, Railway)",
    "reasoning": "string",
    "alternatives": ["string"]
  },
  "authentication": {
    "solution": "string (e.g., Clerk, Auth0, NextAuth)",
    "reasoning": "string"
  },
  "payments": {
    "solution": "string (e.g., Stripe, PayPal)",
    "reasoning": "string"
  },
  "additionalTools": [
    {
      "name": "string",
      "category": "string",
      "purpose": "string"
    }
  ],
  "developmentWorkflow": {
    "versionControl": "string",
    "cicd": "string",
    "testing": "string",
    "monitoring": "string"
  },
  "estimatedComplexity": "low|medium|high",
  "estimatedTimeline": "string",
  "teamSize": "string",
  "estimatedCost": {
    "development": "string",
    "monthly": "string"
  }
}

Be specific, practical, and explain your choices clearly. Consider scalability, developer experience, and cost.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a senior software architect providing tech stack recommendations. Always respond with valid JSON.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const recommendations = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({
      success: true,
      data: recommendations,
    });

  } catch (error: any) {
    console.error('Error generating tech recommendations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate recommendations' 
      },
      { status: 500 }
    );
  }
}
