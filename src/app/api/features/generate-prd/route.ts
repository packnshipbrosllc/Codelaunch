// app/api/features/generate-prd/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseAIJsonResponse, JSON_ONLY_INSTRUCTION } from '@/lib/json-parser';

// Force dynamic rendering - prevents static analysis at build time
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Lazy initialization for Anthropic
function getAnthropic() {
  console.log('🔑 [Backend] Initializing Anthropic client...');
  const { default: Anthropic } = require('@anthropic-ai/sdk');
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('🔑 [Backend] ANTHROPIC_API_KEY exists:', !!apiKey);
  console.log('🔑 [Backend] ANTHROPIC_API_KEY prefix:', apiKey?.substring(0, 10) + '...');
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return new Anthropic({ apiKey });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 [Backend] Features PRD generation request received');
  
  try {
    const body = await req.json();
    const { featureTitle, featureDescription, appContext, allFeatures, priority, complexity } = body;

    console.log('📦 [Backend] Request:', {
      featureTitle,
      hasDescription: !!featureDescription,
      hasAppContext: !!appContext,
      featuresCount: allFeatures?.length || 0,
    });

    // Simplify the prompt to reduce size and response time
    const prompt = `Generate a PRD for this feature as valid JSON.

FEATURE: ${featureTitle}
DESCRIPTION: ${featureDescription || 'No description'}
PRIORITY: ${priority || 'medium'}

${JSON_ONLY_INSTRUCTION}

Return this JSON structure:
{
  "overview": "2-3 sentence overview of this feature",
  "userStories": [
    {
      "id": "us-1",
      "role": "user type",
      "action": "what they want to do",
      "benefit": "why",
      "acceptanceCriteria": ["criterion 1", "criterion 2"]
    }
  ],
  "technicalSpecs": {
    "frontend": {
      "description": "Frontend approach",
      "components": ["Component.tsx"],
      "libraries": ["react"]
    },
    "backend": {
      "description": "Backend approach",
      "files": ["api/route.ts"]
    },
    "database": {
      "tables": [
        {
          "name": "table_name",
          "fields": [{"name": "id", "type": "UUID", "constraints": ["PRIMARY KEY"]}]
        }
      ]
    },
    "apis": [
      {
        "method": "POST",
        "path": "/api/endpoint",
        "description": "What it does",
        "authentication": true
      }
    ]
  },
  "acceptanceCriteria": ["Testable criteria"],
  "edgeCases": ["Edge case to handle"],
  "securityConsiderations": ["Security concern"],
  "implementationSteps": ["Step 1", "Step 2", "Step 3"],
  "estimatedEffort": "1-2 days"
}

Include 2-3 user stories, relevant API endpoints, and 5-8 implementation steps.`;

    console.log('📏 [Backend] Prompt length:', prompt.length, 'characters');

    let anthropic;
    try {
      anthropic = getAnthropic();
      console.log('✅ [Backend] Anthropic client initialized');
    } catch (initError: any) {
      console.error('❌ [Backend] Anthropic init failed:', initError.message);
      throw initError;
    }

    console.log('🤖 [Backend] Calling Claude API...');
    
    let message;
    try {
      message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096, // Reduced from 16000
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
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

    // Parse JSON using bulletproof parser
    const prdData = parseAIJsonResponse(responseText, 'Feature PRD generation');

    // Add metadata
    const completePRD = {
      id: `prd-${Date.now()}`,
      featureId: body.featureId || '',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...prdData
    };

    return NextResponse.json({ 
      success: true, 
      prd: completePRD 
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ [Backend] PRD generation failed after', duration, 'ms');
    console.error('❌ [Backend] Error:', error?.message);
    console.error('❌ [Backend] Error status:', error?.status);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate PRD',
        details: error?.type || 'unknown_error',
      },
      { status: 500 }
    );
  }
}
