// src/app/api/generate-prd/route.ts
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';

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

    const body = await request.json();
    const { projectName, mindmapData, idea, features, competitors, techStack } = body;

    // Validate required inputs
    if (!projectName) {
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

    // Build comprehensive prompt for PRD generation
    const prompt = `You are a senior product manager creating a comprehensive Product Requirements Document (PRD). 

PROJECT DETAILS:
- Project Name: ${projectName}
- Description: ${idea}
${features ? `- Key Features: ${JSON.stringify(features)}` : ''}
${competitors ? `- Competitors: ${JSON.stringify(competitors)}` : ''}
${techStack ? `- Suggested Tech Stack: ${JSON.stringify(techStack)}` : ''}

Create a detailed PRD that includes:

1. **Executive Summary**
   - Project overview
   - Vision and goals
   - Success metrics

2. **Problem Statement**
   - User pain points
   - Market opportunity
   - Why this solution is needed

3. **Target Users**
   - User personas (3-5 detailed personas)
   - User journey maps
   - Use cases

4. **Feature Requirements**
   - Core features (detailed, with user stories)
   - Nice-to-have features
   - Future roadmap ideas
   - Acceptance criteria for each feature

5. **Technical Requirements**
   - Architecture overview
   - Technology recommendations
   - Scalability considerations
   - Security requirements
   - Integration requirements

6. **User Experience**
   - Key user flows
   - Wireframe descriptions
   - Interaction patterns
   - Accessibility requirements

7. **Business Model**
   - Monetization strategy
   - Pricing model
   - Revenue projections
   - Go-to-market strategy

8. **Competitive Analysis**
   - Direct competitors
   - Indirect competitors
   - Competitive advantages
   - Market positioning

9. **Success Metrics (KPIs)**
   - User acquisition metrics
   - Engagement metrics
   - Revenue metrics
   - Technical metrics

10. **Implementation Roadmap**
    - MVP scope
    - Phase 1 (Months 1-3)
    - Phase 2 (Months 4-6)
    - Phase 3 (Months 7-12)

11. **Risk Assessment**
    - Technical risks
    - Market risks
    - Mitigation strategies

12. **Resources & Timeline**
    - Team requirements
    - Budget estimates
    - Timeline estimates

Return the PRD in a structured JSON format with clear sections and subsections. Make it professional, comprehensive, and actionable.`;

    console.log('📦 [Backend] Request validated:', {
      projectName,
      mindmapSize: JSON.stringify(mindmapData).length,
    });

    console.log('🤖 [Backend] Calling Anthropic API...');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
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

    // Parse the PRD content
    let prdContent;
    try {
      // Try to parse as JSON first
      prdContent = JSON.parse(responseText);
    } catch {
      // If not JSON, structure it as sections
      prdContent = {
        executiveSummary: responseText,
        sections: parseIntoSections(responseText),
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        content: prdContent,
        rawText: responseText,
        metadata: {
          projectName,
          generatedAt: new Date().toISOString(),
          model: 'claude-sonnet-4-5',
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

// Helper function to parse text into sections
function parseIntoSections(text: string) {
  const sections: { [key: string]: string } = {};
  
  // Split by main headers (##)
  const parts = text.split(/\n(?=##\s)/);
  
  parts.forEach(part => {
    const lines = part.trim().split('\n');
    const header = lines[0].replace(/^##\s*/, '').replace(/\*\*/g, '');
    const content = lines.slice(1).join('\n').trim();
    
    if (header && content) {
      const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
      sections[key] = content;
    }
  });
  
  return sections;
}

