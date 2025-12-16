// API Route for Generating Code from PRD
// Location: src/app/api/generate-code/route.ts

export const maxDuration = 300; // 5 minutes - Vercel Pro
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

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

// Repair truncated JSON by closing unclosed brackets/braces
function repairTruncatedJSON(text: string): string {
  let cleaned = text.trim();
  
  // Remove trailing incomplete string if we're mid-string
  // Check if we have an odd number of unescaped quotes
  const quoteMatches = cleaned.match(/(?<!\\)"/g) || [];
  if (quoteMatches.length % 2 !== 0) {
    // We're inside an unterminated string - try to close it
    cleaned += '"';
  }
  
  // Count open/close braces and brackets
  const openBraces = (cleaned.match(/{/g) || []).length;
  const closeBraces = (cleaned.match(/}/g) || []).length;
  const openBrackets = (cleaned.match(/\[/g) || []).length;
  const closeBrackets = (cleaned.match(/]/g) || []).length;
  
  // Remove trailing comma if present (invalid before closing bracket/brace)
  cleaned = cleaned.replace(/,\s*$/, '');
  
  // Add missing closing brackets first, then braces
  const missingBrackets = openBrackets - closeBrackets;
  const missingBraces = openBraces - closeBraces;
  
  if (missingBrackets > 0) {
    cleaned += ']'.repeat(missingBrackets);
  }
  if (missingBraces > 0) {
    cleaned += '}'.repeat(missingBraces);
  }
  
  return cleaned;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 [Backend] Code generation request received');
  
  const supabase = getSupabase();
  
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check subscription status - Code generation is Pro feature
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
          error: 'Code generation is a Pro feature',
          requiresUpgrade: true,
          message: 'Upgrade to Pro to unlock AI code generation, full PRDs, and export features.'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { prd, prdContent, techStack, featureName, featureDescription, projectContext, userStories, apiEndpoints, dataModels, uiComponents } = body;

    // Accept both 'prd' and 'prdContent' for backwards compatibility
    const prdData = prd || prdContent;

    // Build PRD content from available data
    let finalPrdContent = '';
    if (prdData) {
      finalPrdContent = typeof prdData === 'string' ? prdData : JSON.stringify(prdData, null, 2);
    } else {
      // Build PRD from individual fields if no full PRD provided
      finalPrdContent = `
Feature: ${featureName || 'Unknown Feature'}
Description: ${featureDescription || 'No description'}
${userStories ? `\nUser Stories:\n${userStories}` : ''}
${apiEndpoints ? `\nAPI Endpoints:\n${typeof apiEndpoints === 'string' ? apiEndpoints : JSON.stringify(apiEndpoints)}` : ''}
${dataModels ? `\nData Models:\n${typeof dataModels === 'string' ? dataModels : JSON.stringify(dataModels)}` : ''}
${uiComponents ? `\nUI Components:\n${Array.isArray(uiComponents) ? uiComponents.join(', ') : uiComponents}` : ''}
      `.trim();
    }

    if (!finalPrdContent || finalPrdContent.length < 50) {
      return NextResponse.json(
        { success: false, error: 'Please provide PRD content or feature details to generate code' },
        { status: 400 }
      );
    }

    const techStackStr = techStack || projectContext?.techStack || 'React, Next.js, TypeScript, Node.js, PostgreSQL';
    const featureNameStr = featureName || 'Feature';

    console.log('📦 [Backend] Code generation request validated:', {
      hasPRD: !!prdData,
      hasIndividualFields: !!(userStories || apiEndpoints),
      techStack: techStackStr,
      featureName: featureNameStr,
      prdLength: finalPrdContent.length,
    });

    // Simplified prompt requesting fewer, more focused files
    const prompt = `You are a senior full-stack developer. Generate production-ready code for this feature.

TECH STACK: ${techStackStr}
FEATURE: ${featureNameStr}

PRD:
${finalPrdContent.substring(0, 8000)}

Generate a JSON response with this EXACT structure. Keep code concise but complete:

{
  "files": [
    {
      "name": "ComponentName.tsx",
      "content": "// React component code here",
      "type": "component"
    },
    {
      "name": "api-route.ts",
      "content": "// API route code here",
      "type": "api"
    }
  ],
  "dependencies": ["package1", "package2"],
  "setup": ["Step 1", "Step 2"]
}

RULES:
- Generate 2-4 key files maximum (main component, API route, types if needed)
- Keep each file under 150 lines
- Include TypeScript types inline
- Include error handling
- Return ONLY valid JSON, no markdown

Start your response with { and end with }`;

    console.log('🤖 [Backend] Calling Claude API for code generation...');
    console.log('📏 [Backend] Prompt length:', prompt.length);
    
    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192, // Reduced for more reliable completion
      temperature: 0.2, // Lower temperature for consistent output
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [Backend] Claude responded in ${duration}ms`);
    
    // Log response metadata
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';
    
    console.log('📏 [Backend] Response length:', responseText.length);
    console.log('🛑 [Backend] Stop reason:', message.stop_reason);
    console.log('📊 [Backend] Token usage:', message.usage);
    
    // Check if response was truncated
    const wasTruncated = message.stop_reason === 'max_tokens';
    if (wasTruncated) {
      console.warn('⚠️ [Backend] Response was truncated due to max_tokens limit');
    }

    // Extract JSON from response
    let jsonContent = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonContent.startsWith('```')) {
      const lines = jsonContent.split('\n');
      // Remove first line (```json) and last line (```)
      if (lines[lines.length - 1].trim() === '```') {
        jsonContent = lines.slice(1, -1).join('\n');
      } else {
        // Last ``` might be missing if truncated
        jsonContent = lines.slice(1).join('\n');
      }
    }
    
    // Find JSON boundaries
    const firstBrace = jsonContent.indexOf('{');
    const lastBrace = jsonContent.lastIndexOf('}');
    
    if (firstBrace !== -1) {
      if (lastBrace > firstBrace) {
        jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
      } else {
        // JSON was truncated - extract from first brace and repair
        jsonContent = jsonContent.substring(firstBrace);
      }
    }
    
    // Parse JSON with repair fallback
    let parsedContent;
    try {
      parsedContent = JSON.parse(jsonContent);
      console.log('✅ [Backend] JSON parsed successfully');
    } catch (parseError: any) {
      console.warn('⚠️ [Backend] Initial JSON parse failed:', parseError.message);
      console.log('🔧 [Backend] Attempting JSON repair...');
      
      // Try to repair truncated JSON
      const repairedJson = repairTruncatedJSON(jsonContent);
      console.log('🔧 [Backend] Repaired JSON length:', repairedJson.length);
      
      try {
        parsedContent = JSON.parse(repairedJson);
        console.log('✅ [Backend] Repaired JSON parsed successfully');
      } catch (repairError: any) {
        console.error('❌ [Backend] JSON repair failed:', repairError.message);
        console.error('❌ [Backend] Raw response preview:', jsonContent.substring(0, 500));
        console.error('❌ [Backend] Raw response end:', jsonContent.substring(jsonContent.length - 500));
        
        // Return partial result with error info
        return NextResponse.json({
          success: false,
          error: 'Code generation produced incomplete output. Please try again with a simpler feature.',
          partialResponse: true,
          rawPreview: jsonContent.substring(0, 1000),
        }, { status: 500 });
      }
    }

    // Ensure we have the expected structure
    if (!parsedContent.files || !Array.isArray(parsedContent.files)) {
      console.warn('⚠️ [Backend] Response missing files array, wrapping content');
      parsedContent = {
        files: [{
          name: 'generated-code.tsx',
          content: JSON.stringify(parsedContent, null, 2),
          type: 'unknown'
        }],
        dependencies: parsedContent.dependencies || [],
        setup: parsedContent.setup || parsedContent.setupInstructions || []
      };
    }

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

    return NextResponse.json({
      success: true,
      code: cleanedContent,
      metadata: {
        featureName: featureNameStr,
        generatedAt: new Date().toISOString(),
        processingTime: duration,
        filesCount: cleanedContent.files?.length || 0,
        wasTruncated,
        stopReason: message.stop_reason,
      },
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ [Backend] Code generation failed:', {
      error: error?.message,
      duration,
      stack: error?.stack,
    });

    if (error?.status === 401) {
      return NextResponse.json(
        { success: false, error: 'API authentication failed' },
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
        error: error?.message || 'Failed to generate code',
      },
      { status: 500 }
    );
  }
}
