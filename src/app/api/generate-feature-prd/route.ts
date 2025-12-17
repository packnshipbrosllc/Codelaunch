// API Route for Generating PRD for Individual Feature
// Location: src/app/api/generate-feature-prd/route.ts

export const maxDuration = 300; // 5 minutes - Vercel Pro
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { parseAIJsonResponse, JSON_ONLY_INSTRUCTION } from '@/lib/json-parser';

// Lazy initialization for Anthropic
function getAnthropic() {
  console.log('🔑 [Backend] Initializing Anthropic client...');
  const { default: Anthropic } = require('@anthropic-ai/sdk');
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('🔑 [Backend] ANTHROPIC_API_KEY exists:', !!apiKey);
  console.log('🔑 [Backend] ANTHROPIC_API_KEY length:', apiKey?.length || 0);
  console.log('🔑 [Backend] ANTHROPIC_API_KEY prefix:', apiKey?.substring(0, 10) + '...');
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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 [Backend] Feature PRD generation request received');
  
  const supabase = getSupabase();
  
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check subscription status - PRD generation is Pro feature
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', userId)
      .single();

    const isSubscribed = user?.subscription_status === 'active';
    
    if (!isSubscribed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'PRD generation is a Pro feature',
          requiresUpgrade: true,
          message: 'Upgrade to Pro to unlock full PRD generation, AI code generation, and export features.'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { featureId, featureName, featureDescription, projectContext } = body;

    // Validate required inputs
    if (!featureId || !featureName) {
      return NextResponse.json(
        { success: false, error: 'Feature ID and name are required' },
        { status: 400 }
      );
    }

    // Simplify project context to reduce prompt size
    const simplifiedContext = projectContext ? {
      projectName: projectContext.projectName || 'Unknown Project',
      techStack: projectContext.techStack ? 'React/Next.js, Node.js, PostgreSQL' : undefined,
    } : null;

    // Build a more concise prompt for feature-specific PRD
    const prompt = `Generate a detailed PRD for this feature as valid JSON.

FEATURE: ${featureName}
DESCRIPTION: ${featureDescription || 'No description provided'}
${simplifiedContext ? `PROJECT: ${simplifiedContext.projectName}` : ''}

${JSON_ONLY_INSTRUCTION}

Return this exact JSON structure:
{
  "featureName": "${featureName}",
  "overview": "2-3 sentence overview",
  "userStories": [
    {
      "persona": "User type",
      "story": "As a [persona], I want to [action] so that [benefit]",
      "acceptanceCriteria": ["criterion 1", "criterion 2", "criterion 3"]
    }
  ],
  "technicalRequirements": {
    "frontend": {
      "components": ["Component1.tsx", "Component2.tsx"],
      "libraries": ["react", "tailwindcss"],
      "stateManagement": "React hooks"
    },
    "backend": {
      "apiEndpoints": [
        {
          "method": "POST",
          "path": "/api/example",
          "description": "What it does",
          "authRequired": true
        }
      ],
      "services": ["ServiceName"]
    },
    "database": {
      "tables": [
        {
          "tableName": "table_name",
          "columns": [
            {"name": "id", "type": "UUID", "constraints": "PRIMARY KEY"}
          ]
        }
      ]
    },
    "security": ["Security consideration"],
    "edgeCases": ["Edge case to handle"]
  },
  "implementationSteps": ["Step 1", "Step 2", "Step 3"],
  "estimations": {
    "complexity": "moderate",
    "engineeringHours": 20
  }
}

Include 3 user stories, 2-3 API endpoints, relevant database tables, and 5-8 implementation steps.`;

    console.log('📏 [Backend] Prompt length:', prompt.length, 'characters');
    console.log('📦 [Backend] Feature PRD request:', {
      featureId,
      featureName,
      hasDescription: !!featureDescription,
      hasProjectContext: !!projectContext,
      promptLength: prompt.length,
    });

    console.log('🤖 [Backend] Calling Claude API for feature PRD...');
    
    let anthropic;
    try {
      anthropic = getAnthropic();
      console.log('✅ [Backend] Anthropic client initialized');
    } catch (initError: any) {
      console.error('❌ [Backend] Anthropic init failed:', initError.message);
      throw initError;
    }

    let message;
    try {
      message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514', // Fixed model name
        max_tokens: 4096, // Reduced from 8192
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      console.log('✅ [Backend] Claude API call successful');
    } catch (claudeError: any) {
      console.error('❌ [Backend] Claude API error:', claudeError.message);
      console.error('❌ [Backend] Error status:', claudeError.status);
      console.error('❌ [Backend] Error type:', claudeError.type);
      throw claudeError;
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [Backend] Claude responded in ${duration}ms`);
    console.log('📊 [Backend] Token usage:', message.usage);

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    console.log('📄 [Backend] Response length:', responseText.length);
    console.log('📄 [Backend] Response preview:', responseText.substring(0, 100));

    // Parse JSON using bulletproof parser
    const parsedContent = parseAIJsonResponse(responseText, 'Feature PRD generation');

    // Clean any accidental model references
    const cleanObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj
          .replace(/#{1,6}\s*Model:?\s*[^\n]*/gi, '')
          .replace(/#{1,6}\s*Generated by:?\s*[^\n]*/gi, '')
          .replace(/Model:\s*claude[^\n]*/gi, '')
          .replace(/Generated by Claude[^\n]*/gi, '')
          .split('\n')
          .filter((line) => !line.toLowerCase().includes('claude-sonnet'))
          .join('\n')
          .trim();
      } else if (Array.isArray(obj)) {
        return obj.map(cleanObject);
      } else if (obj && typeof obj === 'object') {
        const cleaned: any = {};
        for (const key in obj) {
          cleaned[key] = cleanObject(obj[key]);
        }
        return cleaned;
      }
      return obj;
    };

    const cleanedContent = cleanObject(parsedContent);

    // Save PRD to Supabase for persistence
    const mindmapId = body.mindmapId || body.projectId;
    if (mindmapId) {
      try {
        console.log('💾 [Backend] Saving PRD to Supabase...');
        const { error: saveError } = await supabase
          .from('feature_prds')
          .upsert({
            user_id: userId,
            mindmap_id: mindmapId,
            feature_id: featureId,
            feature_name: featureName,
            prd_data: cleanedContent,
            updated_at: new Date().toISOString(),
          }, { 
            onConflict: 'mindmap_id,feature_id',
            ignoreDuplicates: false 
          });
        
        if (saveError) {
          console.warn('⚠️ [Backend] PRD save warning (non-blocking):', saveError.message);
          // Don't fail the request if save fails - PRD is still returned
        } else {
          console.log('✅ [Backend] PRD saved to Supabase');
          
          // Increment usage count after successful PRD generation and save
          const monthYear = new Date().toISOString().slice(0, 7); // "2025-12"
          const { error: usageError } = await supabase.rpc('increment_usage', {
            p_user_id: userId,
            p_month_year: monthYear,
            p_column: 'prd_count'
          });
          
          if (usageError) {
            console.error('❌ Failed to increment usage:', usageError);
          } else {
            console.log('📊 Usage incremented for PRD');
          }
        }
      } catch (saveErr: any) {
        console.warn('⚠️ [Backend] PRD save error (non-blocking):', saveErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      prd: cleanedContent,
      metadata: {
        featureId,
        featureName,
        generatedAt: new Date().toISOString(),
        processingTime: duration,
        saved: !!mindmapId,
      },
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ [Backend] Feature PRD generation failed after', duration, 'ms');
    console.error('❌ [Backend] Error:', error?.message);
    console.error('❌ [Backend] Error status:', error?.status);
    console.error('❌ [Backend] Error type:', error?.type);

    if (error?.status === 401 || error?.message?.includes('API key')) {
      return NextResponse.json(
        { success: false, error: 'API authentication failed. Check ANTHROPIC_API_KEY.' },
        { status: 500 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Failed to generate feature PRD',
        details: error?.type || 'unknown_error',
      },
      { status: 500 }
    );
  }
}
