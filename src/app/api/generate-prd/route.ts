// src/app/api/generate-prd/route.ts
export const maxDuration = 120; // Increased for Claude processing time
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { parseAIJsonResponse, JSON_ONLY_INSTRUCTION } from '@/lib/json-parser';

// Lazy initialization for Anthropic (Claude)
function getAnthropic() {
  console.log('🔑 [Backend] Initializing Anthropic client...');
  const { default: Anthropic } = require('@anthropic-ai/sdk');
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('🔑 [Backend] ANTHROPIC_API_KEY exists:', !!apiKey);
  console.log('🔑 [Backend] ANTHROPIC_API_KEY length:', apiKey?.length || 0);
  console.log('🔑 [Backend] ANTHROPIC_API_KEY starts with:', apiKey?.substring(0, 10) + '...');
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
  const supabase = getSupabase();
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

    // Build EXCEPTIONAL comprehensive prompt for production-ready PRD generation
    const systemPrompt = `You are a senior product manager and technical architect with 15+ years of experience. 

Create an EXCEPTIONALLY detailed Product Requirement Document that is production-ready and can be handed directly to a development team.

The PRD must include:

# 1. EXECUTIVE SUMMARY
- Feature overview (2-3 paragraphs)
- Business value and impact
- Success metrics

# 2. USER STORIES (Minimum 5-7 detailed stories)
Format each as:
- As a [user type]
- I want to [action]
- So that [benefit]
- Acceptance criteria (3-5 bullet points per story)

# 3. TECHNICAL REQUIREMENTS
- Specific technologies and frameworks to use
- Architecture patterns (e.g., MVC, microservices)
- Performance requirements (response times, load capacity)
- Security requirements (authentication, authorization, data protection)
- Scalability considerations

# 4. API DESIGN (RESTful)
For each endpoint provide:
- Method and path (e.g., POST /api/users/signup)
- Request headers
- Request body (JSON schema)
- Response codes (200, 400, 401, 500, etc.)
- Response body (JSON schema)
- Error handling
- Example requests and responses

Minimum 5-8 endpoints per feature.

# 5. DATABASE SCHEMA
- Table name and purpose
- All columns with:
  * Column name
  * Data type (be specific: VARCHAR(255), UUID, TIMESTAMP, etc.)
  * Constraints (PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE)
  * Default values
  * Indexes for performance
- Relationships between tables (one-to-many, many-to-many)
- Migration script example

# 6. UI/UX SPECIFICATIONS
- Component hierarchy
- Component names (React/Next.js style)
- Props for each component
- State management approach
- User flows and interactions
- Validation rules
- Error states
- Loading states
- Responsive design considerations

# 7. DEPENDENCIES & TECH STACK
- Frontend packages (with versions)
- Backend packages (with versions)
- External APIs or services
- Development tools needed

# 8. IMPLEMENTATION ROADMAP
Break down into phases:
- Phase 1: Core functionality (what to build first)
- Phase 2: Enhanced features
- Phase 3: Polish and optimization

For each phase:
- Estimated time
- Specific tasks (numbered list)
- Dependencies

# 9. TESTING STRATEGY
- Unit tests to write
- Integration tests needed
- E2E test scenarios
- Performance testing requirements
- Security testing checklist

# 10. EDGE CASES & ERROR HANDLING
- What happens when... (minimum 8-10 scenarios)
- Error messages (user-friendly)
- Fallback behaviors
- Retry logic

# 11. SECURITY CONSIDERATIONS
- Authentication approach
- Authorization rules
- Data encryption
- Input validation
- Rate limiting
- CORS configuration

# 12. PERFORMANCE OPTIMIZATION
- Caching strategy
- Database query optimization
- Code splitting (frontend)
- Lazy loading
- CDN usage

# 13. MONITORING & ANALYTICS
- Metrics to track
- Logging requirements
- Error tracking setup
- User analytics events

Make this so detailed that a developer could start coding immediately without asking clarifying questions.

Use technical language. Be specific. Include code examples where helpful.

This should be a 3,000-5,000 word document.

CRITICAL FORMATTING REQUIREMENTS:
${JSON_ONLY_INSTRUCTION}
- Do NOT include any references to AI models, Claude, Anthropic, or how the document was generated
- Do NOT add metadata about generation
- Focus only on the product requirements
- Make it detailed enough that a developer can copy sections directly into an AI code generator and get production-ready code`;

    // Build user prompt with project context
    const userPrompt = `Generate a comprehensive PRD for this project:

Project Name: ${extractedProjectName}
Description: ${extractedIdea || 'No description provided'}
${extractedFeatures ? `Features: ${JSON.stringify(extractedFeatures, null, 2)}` : ''}
${extractedCompetitors ? `Competitors: ${JSON.stringify(extractedCompetitors, null, 2)}` : ''}
${extractedTechStack ? `Tech Stack: ${JSON.stringify(extractedTechStack, null, 2)}` : ''}
${mindmapData?.targetAudience ? `Target Audience: ${mindmapData.targetAudience}` : ''}
${mindmapData?.userPersona ? `User Persona: ${JSON.stringify(mindmapData.userPersona, null, 2)}` : ''}
${mindmapData?.monetization ? `Monetization: ${JSON.stringify(mindmapData.monetization, null, 2)}` : ''}

Target Tech Stack: React/Next.js frontend, Node.js/Express backend, PostgreSQL database

Make this EXCEPTIONAL - production-ready quality. Include all 13 sections listed in the system prompt.

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
          "components": ["ComponentName.tsx"],
          "libraries": ["Library 1", "Library 2"],
          "stateManagement": "How state is managed"
        },
        "backend": {
          "businessLogic": "Description of core business logic (2-3 sentences)",
          "apiEndpoints": [
            {
              "method": "GET | POST | PUT | DELETE | PATCH",
              "path": "/api/endpoint/path",
              "description": "What this endpoint does",
              "requestBody": { "example": {}, "schema": {} },
              "responseBody": { "example": {}, "schema": {} },
              "authRequired": true
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
                  "type": "VARCHAR(255)",
                  "constraints": "PRIMARY KEY",
                  "description": "What this column stores"
                }
              ],
              "relationships": ["Has many relationship to other_table"],
              "indexes": ["index_name on column_name"]
            }
          ],
          "migrations": ["Migration description 1"]
        },
        "security": ["Security consideration 1"],
        "performance": ["Performance consideration 1"],
        "edgeCases": ["Edge case 1 to handle"]
      },
      "estimations": {
        "complexity": "simple | moderate | complex",
        "engineeringHours": 40,
        "breakdown": { "frontend": 16, "backend": 20, "database": 4 }
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
        "techSavviness": "High | Medium | Low"
      },
      "psychographics": {
        "goals": ["Goal 1", "Goal 2"],
        "painPoints": ["Pain point 1"],
        "motivations": ["Motivation 1"],
        "frustrations": ["Frustration 1"]
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
    "systemOverview": "High-level description of the system architecture",
    "techStack": {
      "frontend": ["Technology 1"],
      "backend": ["Technology 1"],
      "database": ["Database name"],
      "hosting": ["Hosting platform"],
      "ciCd": ["CI/CD tool"],
      "monitoring": ["Monitoring tool"]
    },
    "dataFlow": "Description of how data flows through the system",
    "securityArchitecture": "Security measures and architecture",
    "scalability": "How the system scales",
    "deployment": "Deployment strategy and process"
  },
  "monetization": {
    "revenueModel": "Description of revenue model",
    "pricingStrategy": {
      "tiers": [
        {
          "name": "Tier name",
          "price": "$X/month",
          "features": ["Feature 1", "Feature 2"],
          "targetUser": "Who this tier is for"
        }
      ],
      "justification": "Why these prices are set"
    }
  },
  "competitorAnalysis": [
    {
      "competitor": "Competitor name",
      "strengths": ["Strength 1"],
      "weaknesses": ["Weakness 1"],
      "differentiators": ["How we're different"],
      "pricing": "Their pricing model",
      "marketShare": "Their estimated market share"
    }
  ],
  "roadmap": {
    "mvp": {
      "timeline": "Months 1-3",
      "features": ["MVP Feature 1"],
      "goals": ["Goal 1"]
    },
    "phase2": {
      "timeline": "Months 4-6",
      "features": ["Phase 2 Feature 1"],
      "goals": ["Goal 1"]
    },
    "phase3": {
      "timeline": "Months 7-12",
      "features": ["Phase 3 Feature 1"],
      "goals": ["Goal 1"]
    }
  },
  "risksAndMitigation": [
    {
      "risk": "Risk description",
      "impact": "high | medium | low",
      "probability": "high | medium | low",
      "mitigation": "How to mitigate this risk"
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

Return ONLY the JSON object, no markdown, no code blocks, no explanations. Start with { and end with }.`;

    console.log('📦 [Backend] Request validated:', {
      projectName: extractedProjectName,
      idea: extractedIdea?.substring(0, 100) + '...',
      featuresCount: extractedFeatures?.length || 0,
      competitorsCount: extractedCompetitors?.length || 0,
      hasTechStack: !!extractedTechStack,
      mindmapSize: JSON.stringify(mindmapData).length,
    });

    console.log('🤖 [Backend] Calling Claude API for exceptional PRD generation...');
    
    let anthropic;
    try {
      anthropic = getAnthropic();
      console.log('✅ [Backend] Anthropic client initialized successfully');
    } catch (initError: any) {
      console.error('❌ [Backend] Failed to initialize Anthropic client:', initError.message);
      throw new Error(`Anthropic initialization failed: ${initError.message}`);
    }
    
    console.log('📤 [Backend] Sending request to Claude with model: claude-sonnet-4-20250514');
    console.log('📤 [Backend] System prompt length:', systemPrompt.length);
    console.log('📤 [Backend] User prompt length:', userPrompt.length);
    
    let message;
    try {
      message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000, // Claude supports larger outputs
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });
      console.log('✅ [Backend] Claude API call successful');
    } catch (claudeError: any) {
      console.error('❌ [Backend] Claude API call failed');
      console.error('❌ [Backend] Error name:', claudeError.name);
      console.error('❌ [Backend] Error message:', claudeError.message);
      console.error('❌ [Backend] Error status:', claudeError.status);
      console.error('❌ [Backend] Error type:', claudeError.type);
      console.error('❌ [Backend] Full error:', JSON.stringify(claudeError, null, 2));
      throw claudeError;
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [Backend] Claude responded in ${duration}ms`);
    console.log('📊 [Backend] Token usage:', {
      input_tokens: message.usage?.input_tokens,
      output_tokens: message.usage?.output_tokens,
    });
    console.log('📊 [Backend] Response content type:', message.content[0]?.type);
    console.log('📊 [Backend] Response content length:', message.content[0]?.type === 'text' ? message.content[0].text.length : 0);

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';
    
    console.log('📄 [Backend] Response text first 200 chars:', responseText.substring(0, 200));

    // Parse JSON using bulletproof parser
    const parsedContent = parseAIJsonResponse(responseText, 'PRD generation (Claude)');

    // Clean any accidental model references from string fields
    const cleanObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj
          .replace(/#{1,6}\s*Model:?\s*[^\n]*/gi, '')
          .replace(/#{1,6}\s*Generated by:?\s*[^\n]*/gi, '')
          .replace(/Model:\s*(claude|gpt|openai|anthropic)[^\n]*/gi, '')
          .replace(/Generated by (Claude|GPT|OpenAI|Anthropic)[^\n]*/gi, '')
          .replace(/(Anthropic's Claude|OpenAI's GPT)[^\n]*/gi, '')
          .split('\n')
          .filter((line) => !line.toLowerCase().includes('claude-sonnet') && !line.toLowerCase().includes('gpt-4'))
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
          model: 'claude-sonnet-4-20250514',
          tokensUsed: message.usage,
          processingTime: duration,
        },
      },
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ [Backend] PRD generation failed after', duration, 'ms');
    console.error('❌ [Backend] Error name:', error?.name);
    console.error('❌ [Backend] Error message:', error?.message);
    console.error('❌ [Backend] Error status:', error?.status);
    console.error('❌ [Backend] Error code:', error?.code);
    console.error('❌ [Backend] Error type:', error?.type);
    console.error('❌ [Backend] Error stack:', error?.stack);
    
    // Try to get more error details
    if (error?.error) {
      console.error('❌ [Backend] Nested error:', error.error);
    }
    if (error?.response) {
      console.error('❌ [Backend] Response data:', error.response);
    }

    if (error?.status === 401 || error?.message?.includes('authentication') || error?.message?.includes('API key')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API authentication failed. Check ANTHROPIC_API_KEY.',
          details: error?.message,
        },
        { status: 500 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error?.status === 400 || error?.type === 'invalid_request_error') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request to Claude API',
          details: error?.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Failed to generate PRD',
        code: error?.code || 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}
