// src/app/api/generate-mindmap/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FREE_MINDMAP_LIMIT = 3;

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

    // 🔒 STRICT: Check limit and increment counter BEFORE calling OpenAI
    // This protects your API costs - you pay for generation, not saving
    
    // Get user's subscription status and mindmap count
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscription_status, mindmaps_created')
      .eq('id', userId)
      .single();

    // If user doesn't exist yet, create them with 0 mindmaps
    if (userError && userError.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          subscription_status: 'inactive',
          mindmaps_created: 0,
        });

      if (insertError) {
        console.error('Error creating user:', insertError);
        return NextResponse.json({
          error: 'Failed to create user profile',
          details: insertError.message,
        }, { status: 500 });
      }
    } else if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({
        error: 'Failed to check user subscription',
        details: userError.message,
      }, { status: 500 });
    }

    // 🚨 ENFORCE 3 MINDMAP LIMIT FOR FREE USERS
    const isSubscribed = user?.subscription_status === 'active';
    const mindmapsCreated = user?.mindmaps_created || 0;

    if (!isSubscribed && mindmapsCreated >= FREE_MINDMAP_LIMIT) {
      return NextResponse.json({
        success: false,
        error: 'FREE_LIMIT_REACHED',
        message: 'You\'ve used all 3 free mindmap generations. Upgrade to continue building!',
        mindmapsCreated,
        limit: FREE_MINDMAP_LIMIT,
        upgradeUrl: '/#pricing',
      }, { status: 403 });
    }

    // 🔒 STRICT: INCREMENT COUNTER BEFORE GENERATION (locks the slot immediately)
    // This prevents users from spamming generate button or exploiting race conditions
    const newCounterValue = mindmapsCreated + 1;
    const { error: incrementError } = await supabase
      .from('users')
      .update({
        mindmaps_created: newCounterValue,
      })
      .eq('id', userId);

    if (incrementError) {
      console.error('Error incrementing mindmaps_created counter:', incrementError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update usage counter',
        details: incrementError.message,
      }, { status: 500 });
    }

    console.log(`✅ Counter incremented: ${mindmapsCreated} → ${newCounterValue} (STRICT: before generation)`);

    // Now proceed with generation (counter already locked)
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
          content: `You are an expert product strategist and technical architect. Generate a comprehensive, structured mindmap for a SaaS application idea with full PRD (Product Requirements Document) details.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "projectName": "string (2-4 words)",
  "projectDescription": "string (1 sentence, max 150 chars)",
  "targetAudience": "string (1 sentence, max 100 chars)",
  "competitors": [
    {
      "name": "string",
      "url": "string (optional)",
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
      "id": "string (unique, e.g., 'feature-1')",
      "title": "string (2-5 words)",
      "description": "string (2-3 sentences explaining the feature)",
      "priority": "high|medium|low",
      "userStories": [
        {
          "persona": "string (e.g., 'End User')",
          "need": "string (what they need)",
          "goal": "string (what they want to accomplish)"
        }
      ],
      "acceptanceCriteria": [
        "string (specific, testable criteria)",
        "string (another criterion)"
      ],
      "technicalImplementation": {
        "frontend": ["string (specific frontend tech/components)"],
        "backend": ["string (specific backend endpoints/services)"],
        "database": ["string (specific tables/schemas)"],
        "steps": [
          "string (step 1)",
          "string (step 2)",
          "string (step 3)"
        ]
      },
      "databaseSchema": [
        {
          "tableName": "string (e.g., 'users')",
          "columns": [
            {
              "name": "string",
              "type": "string (e.g., 'UUID', 'VARCHAR', 'INTEGER')",
              "constraints": "string (e.g., 'PRIMARY KEY', 'NOT NULL')"
            }
          ]
        }
      ],
      "apiEndpoints": [
        {
          "method": "GET|POST|PUT|DELETE",
          "path": "string (e.g., '/api/users')",
          "description": "string (what it does)",
          "auth": true|false
        }
      ],
      "complexity": "simple|moderate|complex",
      "estimatedHours": number (estimate in hours, 8-80),
      "scoring": {
        "complexity": number (1-10),
        "impact": number (1-10),
        "effort": number (1-10),
        "roi": number (impact/effort, calculated)
      }
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
    "description": "string (2-3 sentences)",
    "painPoint": "string (1-2 sentences)",
    "goal": "string (1 sentence)"
  }
}

Rules:
- Max 3 competitors (include URLs if known)
- Exactly 6 tech stack items
- 5-8 core MVP features only
- Each feature MUST include: userStories, acceptanceCriteria, technicalImplementation, databaseSchema, apiEndpoints, scoring
- Calculate ROI as impact/effort for scoring
- Be specific and actionable - no generic placeholders
- Database schema should be realistic (include id, created_at, updated_at for each table)
- API endpoints should cover CRUD operations for each feature
- Technical implementation should list actual technologies/components needed`
        },
        {
          role: 'user',
          content: `Analyze this SaaS idea and generate a comprehensive mindmap: "${idea}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
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

    // Return mindmap data with usage info
    return NextResponse.json({
      success: true,
      data: mindmapData,
      usage: {
        mindmapsCreated: newCounterValue,
        limit: isSubscribed ? 'unlimited' : FREE_MINDMAP_LIMIT,
        remaining: isSubscribed ? 'unlimited' : Math.max(0, FREE_MINDMAP_LIMIT - newCounterValue),
        isProUser: isSubscribed,
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating mindmap (counter already incremented):', error);
    
    // Counter already incremented - we don't roll it back (STRICT enforcement)
    // User "used" their slot even if generation failed
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate mindmap',
        note: 'Your usage counter was incremented. Contact support if this was an error.',
      },
      { status: 500 }
    );
  }
}

