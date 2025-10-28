// src/app/api/generate-code/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      projectName, 
      idea, 
      techStack, 
      codeType, // 'component', 'api', 'database', 'fullstack'
      specificFeature 
    } = body;

    if (!projectName || !idea || !codeType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prompts = {
      component: `Generate a React/Next.js component for: ${specificFeature || projectName}
      
Project: ${projectName}
Description: ${idea}
${techStack ? `Tech Stack: ${JSON.stringify(techStack)}` : ''}

Create a fully functional, production-ready component with:
- TypeScript types
- Proper prop interfaces
- Error handling
- Loading states
- Responsive design with Tailwind CSS
- Comments explaining key logic
- Best practices and patterns

Provide the code in a structured JSON format with file paths and content.`,

      api: `Generate API endpoints for: ${specificFeature || projectName}

Project: ${projectName}
Description: ${idea}
${techStack ? `Tech Stack: ${JSON.stringify(techStack)}` : ''}

Create production-ready API routes with:
- Input validation
- Error handling
- Type safety
- Authentication/authorization
- Database operations
- Response formatting
- Comments

Provide multiple related API endpoints in a structured format.`,

      database: `Generate database schema and models for: ${projectName}

Project: ${projectName}
Description: ${idea}
${techStack ? `Tech Stack: ${JSON.stringify(techStack)}` : ''}

Create comprehensive database schema including:
- Table definitions with proper types
- Relationships and foreign keys
- Indexes for performance
- Constraints and validations
- Sample data/migrations
- ORM/query examples

Provide SQL and ORM code as needed.`,

      fullstack: `Generate a complete full-stack boilerplate for: ${projectName}

Project: ${projectName}
Description: ${idea}
${techStack ? `Tech Stack: ${JSON.stringify(techStack)}` : ''}

Create a production-ready starter including:
- Project structure
- Frontend components (key pages/features)
- Backend API routes
- Database schema
- Authentication setup
- Configuration files
- README with setup instructions
- Environment variables template

Provide all files in a structured format with clear organization.`,
    };

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompts[codeType as keyof typeof prompts],
        },
      ],
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Parse the code output
    let codeOutput;
    try {
      codeOutput = JSON.parse(responseText);
    } catch {
      // If not JSON, structure it as a single file
      codeOutput = {
        files: [
          {
            path: `${codeType}.${techStack?.frontend?.framework === 'React' ? 'tsx' : 'js'}`,
            content: responseText,
            language: 'typescript',
          },
        ],
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        codeType,
        files: codeOutput.files || codeOutput,
        metadata: {
          projectName,
          techStack,
          generatedAt: new Date().toISOString(),
          model: 'claude-sonnet-4-5',
        },
      },
    });

  } catch (error: any) {
    console.error('Error generating code:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate code' 
      },
      { status: 500 }
    );
  }
}
