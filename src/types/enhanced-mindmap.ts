// Enhanced Mindmap Types for CodeLaunch
// Location: src/types/enhanced-mindmap.ts

export type NodeStatus = 'planned' | 'in-progress' | 'completed' | 'blocked';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type ComplexityLevel = 'simple' | 'moderate' | 'complex';

// Base interface for all enhanced nodes
export interface BaseEnhancedNode {
  id: string;
  type: string;
  title: string;
  description: string;
  status?: NodeStatus;
  priority?: PriorityLevel;
  tags?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Enhanced Feature Node with PRD details
export interface EnhancedFeature extends BaseEnhancedNode {
  type: 'feature';
  overview: string;
  userStories: UserStory[];
  acceptanceCriteria: string[];
  technicalImplementation: TechnicalImplementation;
  complexity: ComplexityLevel;
  estimatedHours?: number;
  dependencies?: string[]; // IDs of other features
  databaseSchema?: DatabaseSchema[];
  apiEndpoints?: APIEndpoint[];
  scoring?: FeatureScore;
}

export interface UserStory {
  id: string;
  persona: string;
  need: string;
  goal: string;
  // Format: "As a [persona], I want to [need] so that [goal]"
}

export interface TechnicalImplementation {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  thirdParty?: string[];
  steps?: string[];
}

export interface DatabaseSchema {
  tableName: string;
  columns: Array<{
    name: string;
    type: string;
    constraints?: string;
  }>;
  relationships?: string[];
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth?: boolean;
}

export interface FeatureScore {
  complexity: number; // 1-10
  impact: number; // 1-10
  effort: number; // 1-10
  roi?: number; // Calculated: impact / effort
}

// Enhanced Competitor Node
export interface EnhancedCompetitor extends BaseEnhancedNode {
  type: 'competitor';
  url?: string;
  strengths: string[];
  weaknesses: string[];
  pricing?: string;
  marketShare?: string;
  keyFeatures: string[];
  ourAdvantage: string;
  screenshotUrl?: string;
}

// Enhanced User Persona Node
export interface EnhancedPersona extends BaseEnhancedNode {
  type: 'persona';
  demographics: {
    ageRange?: string;
    location?: string;
    income?: string;
    occupation?: string;
    education?: string;
  };
  psychographics: {
    painPoints: string[];
    motivations: string[];
    goals: string[];
    frustrations: string[];
  };
  behavior: {
    techSavviness?: string;
    preferredChannels?: string[];
    purchaseDrivers?: string[];
  };
  quote?: string;
  avatarUrl?: string;
}

// Enhanced Tech Stack Node
export interface EnhancedTechStack extends BaseEnhancedNode {
  type: 'techstack';
  category: 'frontend' | 'backend' | 'database' | 'infrastructure' | 'tools' | 'services';
  version?: string;
  cost?: string;
  learning_curve?: ComplexityLevel;
  documentation?: string;
  alternatives?: string[];
  pros?: string[];
  cons?: string[];
}

// Project Overview Node
export interface ProjectOverview extends BaseEnhancedNode {
  type: 'overview';
  elevatorPitch: string;
  problemStatement: string;
  solutionStatement: string;
  valueProposition: string;
  targetMarket: string;
  successMetrics: string[];
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate?: string;
  status: NodeStatus;
  dependencies?: string[];
}

// Monetization Node
export interface EnhancedMonetization extends BaseEnhancedNode {
  type: 'monetization';
  model: 'subscription' | 'one-time' | 'freemium' | 'ads' | 'marketplace' | 'hybrid';
  tiers?: PricingTier[];
  revenueStreams: string[];
  projectedMRR?: string;
  paybackPeriod?: string;
}

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
  limitations?: string[];
  mostPopular?: boolean;
}

// Main Enhanced Mindmap Data Structure
export interface EnhancedMindmapData {
  id: string;
  projectName: string;
  description: string;
  overview?: ProjectOverview;
  features: EnhancedFeature[];
  competitors: EnhancedCompetitor[];
  personas: EnhancedPersona[];
  techStack: EnhancedTechStack[];
  monetization?: EnhancedMonetization;
  createdAt: string;
  updatedAt: string;
}

// Node Size Configuration
export interface NodeSize {
  width: number;
  height: number;
  expanded?: {
    width: number;
    height: number;
  };
}

export const NODE_SIZES: Record<string, NodeSize> = {
  overview: { width: 400, height: 300, expanded: { width: 600, height: 500 } },
  feature: { width: 350, height: 250, expanded: { width: 700, height: 600 } },
  competitor: { width: 300, height: 200, expanded: { width: 500, height: 400 } },
  persona: { width: 300, height: 250, expanded: { width: 500, height: 500 } },
  techstack: { width: 250, height: 150, expanded: { width: 400, height: 300 } },
  monetization: { width: 300, height: 200, expanded: { width: 500, height: 350 } },
};

// Node Expansion State
export interface NodeExpansionState {
  [nodeId: string]: boolean;
}

// Detail Panel State
export interface DetailPanelState {
  isOpen: boolean;
  nodeId: string | null;
  nodeType: string | null;
}

// Add Node Action
export interface AddNodeAction {
  type: 'feature' | 'competitor' | 'persona' | 'techstack';
  parentId?: string;
}

