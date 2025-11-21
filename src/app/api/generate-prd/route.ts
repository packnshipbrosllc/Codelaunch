// src/app/api/generate-prd/route.ts
export const maxDuration = 90;
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 [Backend] PRD generation request received');
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
    const { projectName, mindmapData, idea, features, competitors, techStack } = body;

    // Extract data from mindmapData if it's provided (handles decision tree format)
    let extractedProjectName = projectName;
    let extractedIdea = idea;
    let extractedFeatures = features;
    let extractedCompetitors = competitors;
    let extractedTechStack = techStack;

    if (mindmapData && typeof mindmapData === 'object' && Object.keys(mindmapData).length > 0) {
      // Extract from mindmapData structure (decision tree format)
      extractedProjectName = extractedProjectName || mindmapData.projectName;
      extractedIdea = extractedIdea || mindmapData.projectDescription || mindmapData.description;
      extractedFeatures = extractedFeatures || mindmapData.features;
      extractedCompetitors = extractedCompetitors || mindmapData.competitors;
      extractedTechStack = extractedTechStack || mindmapData.techStack;
      
      // Also extract other useful fields
      const targetAudience = mindmapData.targetAudience;
      const userPersona = mindmapData.userPersona;
      const monetization = mindmapData.monetization;
      
      console.log('📦 [Backend] Extracted from mindmapData:', {
        hasProjectName: !!extractedProjectName,
        hasIdea: !!extractedIdea,
        featuresCount: extractedFeatures?.length || 0,
        competitorsCount: extractedCompetitors?.length || 0,
        hasTechStack: !!extractedTechStack,
        hasTargetAudience: !!targetAudience,
        hasUserPersona: !!userPersona,
        hasMonetization: !!monetization,
      });
    }

    // Validate required inputs
    if (!extractedProjectName) {
      console.warn('⚠️ [Backend] Missing projectName');
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    if (!mindmapData || (typeof mindmapData === 'object' && Object.keys(mindmapData).length === 0)) {
      console.warn('⚠️ [Backend] Missing or empty mindmapData');
      return NextResponse.json(
        { success: false, error: 'Mindmap data is required' },
        { status: 400 }
      );
    }

    // Build comprehensive prompt for structured JSON PRD generation
    const prompt = `You are a senior product manager and technical architect creating a comprehensive Product Requirements Document (PRD) in JSON format.

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON (no markdown, no code blocks, no explanations)
- Do NOT include any references to AI models, Claude, Anthropic, or how the document was generated
- Do NOT add metadata about generation
- Focus only on the product requirements
- Make it detailed enough that a developer can copy sections directly into Claude/Cursor and get production-ready code

PROJECT DETAILS:
- Project Name: ${extractedProjectName}
- Description: ${extractedIdea || 'No description provided'}
${extractedFeatures ? `- Features: ${JSON.stringify(extractedFeatures, null, 2)}` : ''}
${extractedCompetitors ? `- Competitors: ${JSON.stringify(extractedCompetitors, null, 2)}` : ''}
${extractedTechStack ? `- Tech Stack: ${JSON.stringify(extractedTechStack, null, 2)}` : ''}
${mindmapData?.targetAudience ? `- Target Audience: ${mindmapData.targetAudience}` : ''}
${mindmapData?.userPersona ? `- User Persona: ${JSON.stringify(mindmapData.userPersona, null, 2)}` : ''}
${mindmapData?.monetization ? `- Monetization: ${JSON.stringify(mindmapData.monetization, null, 2)}` : ''}

Generate a comprehensive PRD as a JSON object with this EXACT structure:

{
  "projectName": "${extractedProjectName}",
  "executiveSummary": {
    "overview": "2-3 sentence overview of the project and its purpose",
    "problemStatement": "Clear description of the problem being solved",
    "valueProposition": "Why this solution is valuable and unique",
    "targetMarket": "Who will use this product",
    "successMetrics": [
      "Metric 1 (e.g., '10,000 active users in first 6 months')",
      "Metric 2",
      "Metric 3"
    ]
  },
  "features": [
    {
      "featureName": "Feature name from mindmap",
      "priority": "P0" | "P1" | "P2",
      "overview": "2-3 sentence description of what this feature does",
      "userStories": [
        {
          "persona": "User type (e.g., 'Solo Founder', 'End User')",
          "story": "As a [persona], I want to [action] so that [benefit]",
          "acceptanceCriteria": [
            "Specific, testable criterion 1",
            "Specific, testable criterion 2",
            "Specific, testable criterion 3"
          ]
        }
      ],
      "technicalImplementation": {
        "frontend": {
          "approach": "High-level frontend approach (1-2 sentences)",
          "components": [
            "Component name 1 (e.g., 'UserDashboard.tsx')",
            "Component name 2",
            "Component name 3"
          ],
          "libraries": ["Library 1", "Library 2"],
          "stateManagement": "How state is managed (e.g., 'React Context + Zustand')"
        },
        "backend": {
          "businessLogic": "Description of core business logic (2-3 sentences)",
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
                  "type": "VARCHAR(255)" | "INTEGER" | "UUID" | "TIMESTAMP" | "BOOLEAN" | "TEXT",
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
  ],
  "userPersonas": [
    {
      "name": "Persona name",
      "demographics": {
        "age": "25-45",
        "occupation": "Job title",
        "location": "Geographic location",
        "techSavviness": "High" | "Medium" | "Low"
      },
      "psychographics": {
        "goals": ["Goal 1", "Goal 2", "Goal 3"],
        "painPoints": ["Pain point 1", "Pain point 2"],
        "motivations": ["Motivation 1", "Motivation 2"],
        "frustrations": ["Frustration 1", "Frustration 2"]
      },
      "userJourney": {
        "awareness": "How they discover the product",
        "consideration": "What makes them consider it",
        "purchase": "What makes them sign up",
        "retention": "What keeps them using it"
      }
    }
  ],
  "technicalArchitecture": {
    "systemOverview": "High-level description of the system architecture (3-4 sentences)",
    "techStack": {
      "frontend": ["Technology 1", "Technology 2"],
      "backend": ["Technology 1", "Technology 2"],
      "database": ["Database name"],
      "hosting": ["Hosting platform"],
      "ciCd": ["CI/CD tool"],
      "monitoring": ["Monitoring tool"]
    },
    "dataFlow": "Description of how data flows through the system (2-3 sentences)",
    "securityArchitecture": "Security measures and architecture (2-3 sentences)",
    "scalability": "How the system scales (2-3 sentences)",
    "deployment": "Deployment strategy and process (2-3 sentences)"
  },
  "monetization": {
    "revenueModel": "Description of revenue model (e.g., 'Subscription-based SaaS')",
    "pricingStrategy": {
      "tiers": [
        {
          "name": "Tier name (e.g., 'Starter', 'Pro', 'Enterprise')",
          "price": "$X/month or $Y/year",
          "features": ["Feature 1", "Feature 2", "Feature 3"],
          "targetUser": "Who this tier is for"
        }
      ],
      "justification": "Why these prices are set (1-2 sentences)"
    }
  },
  "competitorAnalysis": [
    {
      "competitor": "Competitor name",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "differentiators": ["How we're different 1", "How we're different 2"],
      "pricing": "Their pricing model",
      "marketShare": "Their estimated market share"
    }
  ],
  "roadmap": {
    "mvp": {
      "timeline": "Months 1-3",
      "features": ["MVP Feature 1", "MVP Feature 2"],
      "goals": ["Goal 1", "Goal 2"]
    },
    "phase2": {
      "timeline": "Months 4-6",
      "features": ["Phase 2 Feature 1", "Phase 2 Feature 2"],
      "goals": ["Goal 1", "Goal 2"]
    },
    "phase3": {
      "timeline": "Months 7-12",
      "features": ["Phase 3 Feature 1", "Phase 3 Feature 2"],
      "goals": ["Goal 1", "Goal 2"]
    }
  },
  "risksAndMitigation": [
    {
      "risk": "Risk description",
      "impact": "high" | "medium" | "low",
      "probability": "high" | "medium" | "low",
      "mitigation": "How to mitigate this risk (2-3 sentences)"
    }
  ]
}

IMPORTANT:
- For EACH feature from the mindmap, provide ALL the details above (user stories, technical implementation, database schema, etc.)
- Make technical implementation DETAILED enough that a developer can copy-paste into an AI code generator
- Include 3-5 user stories per feature
- Include ALL database tables with complete column definitions
- Include ALL API endpoints with request/response examples
- Be specific about technologies, libraries, and approaches
- Estimate hours realistically based on complexity
- Include security and performance considerations for each feature
- Think through edge cases that need handling

Return ONLY the JSON object, no markdown, no code blocks, no explanations.`;

    console.log('📦 [Backend] Request validated:', {
      projectName: extractedProjectName,
      idea: extractedIdea?.substring(0, 100) + '...',
      featuresCount: extractedFeatures?.length || 0,
      competitorsCount: extractedCompetitors?.length || 0,
      hasTechStack: !!extractedTechStack,
      mindmapSize: JSON.stringify(mindmapData).length,
    });

    console.log('🤖 [Backend] Calling Anthropic API...');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192, // Increased for detailed PRDs
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
    // @ts-ignore usage may be present depending on SDK version
    if ((message as any)?.usage) {
      // @ts-ignore
      console.log('📊 [Backend] Token usage:', (message as any).usage);
    }

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Extract JSON from response (handle markdown code blocks if present)
    let jsonContent = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonContent.startsWith('```')) {
      const lines = jsonContent.split('\n');
      const firstLine = lines[0];
      const lastLine = lines[lines.length - 1];
      
      if (firstLine.includes('json') || firstLine.includes('JSON')) {
        jsonContent = lines.slice(1, -1).join('\n');
      } else {
        jsonContent = lines.slice(1, -1).join('\n');
      }
    }
    
    // Parse JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('❌ [Backend] JSON parse error:', parseError);
      // Try to extract JSON from text if parsing fails
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

    // Clean any accidental model references from string fields
    const cleanObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj
          .replace(/#{1,6}\s*Model:?\s*[^\n]*/gi, '')
          .replace(/#{1,6}\s*Generated by:?\s*[^\n]*/gi, '')
          .replace(/Model:\s*claude[^\n]*/gi, '')
          .replace(/Generated by Claude[^\n]*/gi, '')
          .replace(/Anthropic's Claude[^\n]*/gi, '')
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

    // Also create a readable text version for download
    const textVersion = JSON.stringify(cleanedContent, null, 2);

    return NextResponse.json({
      success: true,
      data: {
        content: cleanedContent, // Structured JSON for EnhancedPRDViewer
        rawText: textVersion, // Formatted JSON text for download
        metadata: {
          projectName: extractedProjectName,
          generatedAt: new Date().toISOString(),
          model: 'redacted',
          // @ts-ignore usage may be present
          tokensUsed: (message as any)?.usage,
          processingTime: duration,
        },
      },
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ [Backend] PRD generation failed:', {
      error: error?.message,
      duration,
      stack: error?.stack,
      status: error?.status,
      code: error?.code,
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
        error: error?.message || 'Failed to generate PRD',
        code: error?.code || 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
