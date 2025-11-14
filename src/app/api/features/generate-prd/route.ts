// app/api/features/generate-prd/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { featureTitle, featureDescription, appContext, allFeatures, priority, complexity } = body;

    const prompt = `You are a senior product manager and technical architect. Generate a comprehensive Product Requirements Document (PRD) for the following feature.

FEATURE DETAILS:
Title: ${featureTitle}
Description: ${featureDescription}
Priority: ${priority}
Complexity: ${complexity}

APP CONTEXT:
${appContext}

OTHER FEATURES IN THIS APP:
${allFeatures?.map((f: any) => `- ${f.title}: ${f.description}`).join('\n') || 'None yet'}

Generate a detailed PRD with the following structure. Return ONLY valid JSON with no markdown formatting:

{
  "overview": "Comprehensive overview of what this feature does, why it's important, and how it fits into the overall app (3-4 paragraphs)",
  "userStories": [
    {
      "id": "unique-id",
      "role": "user type (e.g., 'registered user', 'admin', 'visitor')",
      "action": "what they want to do",
      "benefit": "why they want to do it",
      "acceptanceCriteria": ["testable criteria", "another criteria"]
    }
  ],
  "technicalSpecs": {
    "frontend": {
      "description": "Detailed frontend approach",
      "components": ["ComponentName1.tsx", "ComponentName2.tsx"],
      "libraries": ["library-name", "another-library"],
      "files": ["path/to/file.tsx"]
    },
    "backend": {
      "description": "Detailed backend approach",
      "files": ["path/to/api.ts", "path/to/service.ts"],
      "libraries": ["library-name"]
    },
    "database": {
      "tables": [
        {
          "name": "table_name",
          "fields": [
            {
              "name": "field_name",
              "type": "VARCHAR(255)",
              "constraints": ["PRIMARY KEY", "NOT NULL"]
            }
          ],
          "relationships": ["foreign key relationships"]
        }
      ],
      "indexes": ["index descriptions"]
    },
    "apis": [
      {
        "method": "POST",
        "path": "/api/endpoint",
        "description": "What this endpoint does",
        "requestBody": {"field": "type"},
        "responseBody": {"field": "type"},
        "authentication": true
      }
    ],
    "thirdPartyIntegrations": ["Stripe", "SendGrid", "etc"]
  },
  "acceptanceCriteria": [
    "Specific, testable criteria for this feature to be considered complete"
  ],
  "edgeCases": [
    "Edge case scenarios to handle"
  ],
  "securityConsiderations": [
    "Security concerns and how to address them"
  ],
  "testingStrategy": [
    "Unit tests needed",
    "Integration tests needed",
    "E2E test scenarios"
  ],
  "implementationSteps": [
    "Step 1: Detailed first step",
    "Step 2: Next step with specifics"
  ],
  "estimatedEffort": "2-3 hours" or "1-2 days" etc,
  "risks": [
    "Potential risks or blockers"
  ]
}

IMPORTANT:
- Be extremely detailed and specific
- Include actual file names, component names, API paths
- Think through the complete implementation
- Consider dependencies on other features
- Make it production-ready, not a tutorial
- Return ONLY the JSON object, no markdown code blocks or additional text`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
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

    // Parse the JSON response
    let prdData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      prdData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse PRD JSON:', responseText);
      throw new Error('Invalid JSON response from AI');
    }

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
    console.error('Error generating PRD:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate PRD' 
      },
      { status: 500 }
    );
  }
}

