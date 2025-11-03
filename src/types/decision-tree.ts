// types/decision-tree.ts

export type AppPurpose = 
  | 'ecommerce'
  | 'saas'
  | 'social'
  | 'content'
  | 'custom';

export type AppType = 
  | 'web'
  | 'mobile'
  | 'desktop'
  | 'pwa';

export type NodeType = 
  | 'decision'    // Clickable node that expands into choices
  | 'completed'   // User made a choice
  | 'locked'      // Not available yet (prerequisites not met)
  | 'info'        // Educational/explanatory node
  | 'generate';   // Final node to trigger generation

export interface Choice {
  id: string;
  label: string;
  value: string;
  description: string;           // Plain English explanation
  recommended?: boolean;         // Highlight as recommended choice
  learnMore?: string;           // Detailed educational content
  prerequisites?: string[];     // What needs to be decided first
  unlocks?: string[];          // What this choice unlocks
  estimatedTime?: string;      // "5 minutes setup"
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface DecisionNode {
  id: string;
  question: string;              // "How will customers pay?"
  category: string;              // "Payment", "Authentication", etc.
  explanation: string;           // Educational context
  nodeType: NodeType;
  choices: Choice[];
  dependsOn?: string[];         // Previous decisions required
  priority: number;             // Order in which to ask (1 = first)
}

export interface DecisionPath {
  userId: string;
  sessionId: string;
  appPurpose: AppPurpose;
  appType: AppType;
  decisions: Record<string, string>;  // { "payment": "stripe", "auth": "clerk", ... }
  currentStep: number;
  totalSteps: number;
  completedAt?: Date;
  generatedMindmap?: any;
}

export interface DecisionTree {
  rootQuestion: DecisionNode;
  paths: {
    [key in AppPurpose]?: {
      [key in AppType]?: DecisionNode[];
    };
  };
}

export interface EducationalTooltip {
  term: string;
  simpleExplanation: string;
  technicalExplanation?: string;
  example?: string;
  whyItMatters: string;
}

