// FILE PATH: src/app/api/chat/route.ts
// AI Chat API endpoint with streaming support

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - prevents static analysis at build time
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes - Vercel Pro

// Lazy initialization for Anthropic
function getAnthropic() {
  const { default: Anthropic } = require('@anthropic-ai/sdk');
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return new Anthropic({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const { message, mode } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const anthropic = getAnthropic();

    // Create a readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: [
              {
                role: 'user',
                content: message,
              },
            ],
            stream: true,
          });

          for await (const event of response) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const text = event.delta.text;
              controller.enqueue(encoder.encode(text));
            }
          }

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
