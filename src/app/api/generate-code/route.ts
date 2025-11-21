// API Route for Generating Code from PRD
// Location: src/app/api/generate-code/route.ts

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 [Backend] Code generation request received');
  
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
    const { prdContent, techStack, featureName } = body;

    // Validate required inputs
    if (!prdContent) {
      return NextResponse.json(
        { success: false, error: 'PRD content is required' },
        { status: 400 }
      );
    }

    const techStackStr = techStack || 'React, Next.js, TypeScript, Node.js, PostgreSQL';
    const featureNameStr = featureName || 'Feature';

    console.log('📦 [Backend] Code generation request validated:', {
      hasPRD: !!prdContent,
      techStack: techStackStr,
      featureName: featureNameStr,
      prdLength: typeof prdContent === 'string' ? prdContent.length : JSON.stringify(prdContent).length,
    });

    // Build comprehensive prompt for code generation
    const prompt = `You are a senior full-stack developer generating production-ready code based on a Product Requirements Document.

CRITICAL REQUIREMENTS:
- Generate production-ready, well-commented code
- Follow best practices and industry standards
- Include proper error handling
- Use TypeScript for type safety
- Include proper imports and exports
- Code should be immediately usable

TECH STACK: ${techStackStr}

FEATURE: ${featureNameStr}

PRD CONTENT:
${typeof prdContent === 'string' ? prdContent : JSON.stringify(prdContent, null, 2)}

Generate a complete implementation as a JSON object with this structure:

{
  "files": [
    {
      "path": "src/components/FeatureName.tsx",
      "content": "// Complete React component code with TypeScript",
      "type": "component"
    },
    {
      "path": "src/app/api/feature-name/route.ts",
      "content": "// Complete API route code",
      "type": "api"
    },
    {
      "path": "prisma/schema.prisma",
      "content": "// Prisma schema definitions",
      "type": "schema"
    },
    {
      "path": "README.md",
      "content": "// Setup and deployment instructions",
      "type": "documentation"
    }
  ],
  "structure": {
    "frontend": {
      "components": ["Component1.tsx", "Component2.tsx"],
      "hooks": ["useFeature.ts"],
      "utils": ["featureUtils.ts"]
    },
    "backend": {
      "routes": ["api/feature/route.ts"],
      "services": ["featureService.ts"],
      "types": ["featureTypes.ts"]
    },
    "database": {
      "tables": ["table_name"],
      "migrations": ["migration_description"]
    }
  },
  "dependencies": {
    "npm": ["package1@version", "package2@version"],
    "devDependencies": ["@types/package1@version"]
  },
  "setupInstructions": [
    "Step 1: Install dependencies",
    "Step 2: Set up environment variables",
    "Step 3: Run database migrations",
    "Step 4: Start development server"
  ],
  "environmentVariables": {
    "DATABASE_URL": "postgresql://...",
    "API_KEY": "your-api-key"
  }
}

IMPORTANT:
- Generate ALL necessary files for a complete implementation
- Include frontend components with proper TypeScript types
- Include backend API routes with error handling
- Include database schema (Prisma format)
- Include proper imports and exports
- Add comments explaining complex logic
- Include error handling and validation
- Make code production-ready (not just examples)
- Include a comprehensive README with setup steps
- List all npm dependencies with versions
- Include environment variable requirements

Return ONLY the JSON object, no markdown, no code blocks, no explanations.`;

    console.log('🤖 [Backend] Calling Anthropic API for code generation...');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 16000, // Large token limit for multiple files
      temperature: 0.3, // Lower temperature for more consistent code
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [Backend] Anthropic responded in ${duration}ms`);

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Extract JSON from response
    let jsonContent = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonContent.startsWith('```')) {
      const lines = jsonContent.split('\n');
      jsonContent = lines.slice(1, -1).join('\n');
    }
    
    // Parse JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('❌ [Backend] JSON parse error:', parseError);
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedContent = JSON.parse(jsonMatch[0]);
        } catch (e) {
          throw new Error('Failed to parse code generation JSON response');
        }
      } else {
        throw new Error('No valid JSON found in response');
      }
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
