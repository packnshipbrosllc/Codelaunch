// api/decision-tree/next/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { decisionTree, rootQuestion, platformQuestion } from '@/data/decision-tree';
import { AppPurpose, AppType } from '@/types/decision-tree';

export async function POST(req: NextRequest) {
  try {
    const { currentDecisions, appPurpose, appType } = await req.json();

    // If no decisions yet, return root question
    if (!currentDecisions || Object.keys(currentDecisions).length === 0) {
      return NextResponse.json({
        question: rootQuestion,
        progress: {
          currentStep: 1,
          totalSteps: 12, // Will be updated dynamically
          percentage: 0
        },
        completed: false
      });
    }

    // If root question answered, return platform question
    if (currentDecisions.root && !currentDecisions.platform) {
      return NextResponse.json({
        question: platformQuestion,
        progress: {
          currentStep: 2,
          totalSteps: 12,
          percentage: 16
        },
        completed: false
      });
    }

    // Get the path based on purpose and type
    const purpose = appPurpose as AppPurpose;
    const type = appType as AppType;

    if (!purpose || !type) {
      return NextResponse.json({ error: 'App purpose and type required' }, { status: 400 });
    }

    const path = decisionTree.paths[purpose]?.[type];
    if (!path) {
      return NextResponse.json({ 
        error: `Path not found for ${purpose} + ${type}`,
        message: 'This combination is not yet supported. Please choose a different option.'
      }, { status: 404 });
    }

    // Find the next question that hasn't been answered
    const answeredIds = Object.keys(currentDecisions);
    const nextQuestion = path.find((node) => {
      // Check if this question hasn't been answered
      if (answeredIds.includes(node.id)) {
        return false;
      }

      // Check if dependencies are met
      if (node.dependsOn) {
        return node.dependsOn.every((depId) => answeredIds.includes(depId));
      }

      return true;
    });

    // If all questions answered, return completion
    if (!nextQuestion) {
      const totalSteps = path.length + 2; // root + platform + path questions
      return NextResponse.json({
        completed: true,
        progress: {
          currentStep: totalSteps,
          totalSteps,
          percentage: 100
        }
      });
    }

    // Calculate progress
    const totalSteps = path.length + 2; // root + platform + path questions
    const currentStep = answeredIds.length + 1; // +1 for the next question
    const percentage = Math.round((currentStep / totalSteps) * 100);

    return NextResponse.json({
      question: nextQuestion,
      progress: {
        currentStep,
        totalSteps,
        percentage
      },
      completed: false
    });

  } catch (error: any) {
    console.error('Error getting next question:', error);
    return NextResponse.json(
      { error: 'Failed to get next question', details: error.message },
      { status: 500 }
    );
  }
}

