// API Route for Generating PRD for Individual Feature
// Location: src/app/api/generate-feature-prd/route.ts

export const maxDuration = 90;
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
  console.log('🚀 [Backend] Feature PRD generation request received');
  
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

    // Build comprehensive prompt for feature-specific PRD
    const prompt = `You are a senior product manager and technical architect creating a detailed Product Requirements Document (PRD) for a single feature.

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON (no markdown, no code blocks, no explanations)
- Do NOT include any references to AI models, Claude, Anthropic, or how the document was generated
- Focus only on the feature requirements
- Make it detailed enough that a developer can implement it directly

FEATURE DETAILS:
- Feature Name: ${featureName}
- Description: ${featureDescription || 'No description provided'}
${projectContext ? `- Project Context: ${JSON.stringify(projectContext, null, 2)}` : ''}

Generate a comprehensive PRD as a JSON object with this EXACT structure:

{
  "featureName": "${featureName}",
  "overview": "2-3 sentence overview of what this feature does and why it's valuable",
  "userStories": [
    {
      "persona": "User type (e.g., 'End User', 'Admin', 'Developer')",
      "story": "As a [persona], I want to [action] so that [benefit]",
      "acceptanceCriteria": [
        "Specific, testable criterion 1",
        "Specific, testable criterion 2",
        "Specific, testable criterion 3"
      ]
    }
  ],
  "technicalRequirements": {
    "frontend": {
      "components": [
        "Component name 1 (e.g., 'UserDashboard.tsx')",
        "Component name 2",
        "Component name 3"
      ],
      "libraries": ["Library 1", "Library 2"],
      "stateManagement": "How state is managed (e.g., 'React Context + Zustand')",
      "styling": "Styling approach (e.g., 'Tailwind CSS with custom theme')"
    },
    "backend": {
      "apiEndpoints": [
        {
          "method": "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
          "path": "/api/endpoint/path",
          "description": "What this endpoint does",
          "requestBody": {
            "example": {},
            "schema": {}
          },
          "responseBody": {
            "example": {},
            "schema": {}
          },
          "authRequired": true | false
        }
      ],
      "services": ["Service name 1", "Service name 2"],
      "libraries": ["Library 1", "Library 2"]
    },
    "database": {
      "tables": [
        {
          "tableName": "table_name",
          "description": "What this table stores",
          "columns": [
            {
              "name": "column_name",
              "type": "VARCHAR(255)" | "INTEGER" | "UUID" | "TIMESTAMP" | "BOOLEAN" | "TEXT" | "JSONB",
              "constraints": "PRIMARY KEY" | "NOT NULL" | "UNIQUE" | "FOREIGN KEY REFERENCES table(id)",
              "description": "What this column stores"
            }
          ],
          "relationships": [
            "Has many relationship to other_table",
            "Belongs to parent_table"
          ],
          "indexes": ["index_name on column_name"]
        }
      ],
      "migrations": ["Migration description 1", "Migration description 2"]
    },
    "security": [
      "Security consideration 1 (e.g., 'JWT tokens for authentication')",
      "Security consideration 2"
    ],
    "performance": [
      "Performance consideration 1 (e.g., 'Database indexes on frequently queried columns')",
      "Performance consideration 2"
    ],
    "edgeCases": [
      "Edge case 1 to handle",
      "Edge case 2 to handle"
    ]
  },
  "dependencies": [
    "npm package 1 with version",
    "npm package 2 with version"
  ],
  "implementationSteps": [
    "Step 1: Description of what to do first",
    "Step 2: Description of what to do next",
    "Step 3: Continue with detailed steps..."
  ],
  "testing": {
    "unitTests": [
      "Test case 1 description",
      "Test case 2 description"
    ],
    "integrationTests": [
      "Integration test 1 description",
      "Integration test 2 description"
    ],
    "e2eTests": [
      "E2E test scenario 1",
      "E2E test scenario 2"
    ]
  },
  "estimations": {
    "complexity": "simple" | "moderate" | "complex",
    "engineeringHours": 40,
    "breakdown": {
      "frontend": 16,
      "backend": 20,
      "database": 4
    }
  }
}

IMPORTANT:
- Include 3-5 detailed user stories with acceptance criteria
- Provide ALL API endpoints with complete request/response examples
- Include complete database schema with all tables, columns, and relationships
- List all UI components needed
- Specify all npm dependencies with versions
- Provide numbered implementation steps (8-12 steps)
- Include testing considerations
- Estimate hours realistically based on complexity
- Include security and performance considerations
- Think through edge cases that need handling

Return ONLY the JSON object, no markdown, no code blocks, no explanations.`;

    console.log('📦 [Backend] Feature PRD request validated:', {
      featureId,
      featureName,
      hasDescription: !!featureDescription,
      hasProjectContext: !!projectContext,
    });

    console.log('🤖 [Backend] Calling Anthropic API for feature PRD...');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      temperature: 0.7,
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
          throw new Error('Failed to parse PRD JSON response');
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
      prd: cleanedContent,
      metadata: {
        featureId,
        featureName,
        generatedAt: new Date().toISOString(),
        processingTime: duration,
      },
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ [Backend] Feature PRD generation failed:', {
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
        error: error?.message || 'Failed to generate feature PRD',
      },
      { status: 500 }
    );
  }
}

