// types/feature.ts

export type FeatureStatus = 
  | 'planned'      // Just added to mindmap
  | 'detailed'     // PRD written
  | 'ready'        // PRD approved, ready to build
  | 'building'     // Code generation in progress
  | 'complete'     // Feature built and integrated
  | 'deployed';    // Live in production

export type FeaturePriority = 'must-have' | 'should-have' | 'nice-to-have';
export type FeatureComplexity = 'simple' | 'moderate' | 'complex';

export interface UserStory {
  id: string;
  role: string;        // "As a [role]"
  action: string;      // "I want to [action]"
  benefit: string;     // "So that [benefit]"
  acceptanceCriteria: string[];
}

export interface TechSpec {
  description: string;
  components?: string[];      // Frontend components
  files?: string[];          // Files to be created
  libraries?: string[];      // Required dependencies
  apis?: string[];          // API endpoints needed
}

export interface DatabaseSchema {
  tables: {
    name: string;
    fields: {
      name: string;
      type: string;
      constraints?: string[];
    }[];
    relationships?: string[];
  }[];
  indexes?: string[];
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requestBody?: Record<string, any>;
  responseBody?: Record<string, any>;
  authentication?: boolean;
}

export interface DetailedPRD {
  id: string;
  featureId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  
  // Core sections
  overview: string;
  userStories: UserStory[];
  
  // Technical specifications
  technicalSpecs: {
    frontend: TechSpec;
    backend: TechSpec;
    database: DatabaseSchema;
    apis: APIEndpoint[];
    thirdPartyIntegrations?: string[];
  };
  
  // Requirements and testing
  acceptanceCriteria: string[];
  edgeCases: string[];
  securityConsiderations: string[];
  testingStrategy: string[];
  
  // Implementation guidance
  implementationSteps: string[];
  estimatedEffort: string;
  risks?: string[];
}

export interface FeatureNode {
  id: string;
  type: 'feature';
  position: { x: number; y: number };
  status: FeatureStatus;
  
  data: {
    title: string;
    description: string;
    priority: FeaturePriority;
    complexity: FeatureComplexity;
    estimatedTime: string;
    dependencies: string[]; // IDs of other features this depends on
    
    // PRD data
    prd: DetailedPRD | null;
    hasPRD: boolean;
    
    // Code generation
    generatedCode?: {
      files: {
        path: string;
        content: string;
        language: string;
      }[];
      documentation: string;
      setupInstructions: string[];
    };
  };
}

// Status display configuration
export const STATUS_CONFIG: Record<FeatureStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  planned: {
    label: 'Planned',
    color: 'text-gray-400',
    bgColor: 'bg-gray-800',
    icon: '📋'
  },
  detailed: {
    label: 'Detailed',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30',
    icon: '📝'
  },
  ready: {
    label: 'Ready',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/30',
    icon: '⚡'
  },
  building: {
    label: 'Building',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
    icon: '🔨'
  },
  complete: {
    label: 'Complete',
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
    icon: '✅'
  },
  deployed: {
    label: 'Deployed',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/30',
    icon: '🚀'
  }
};

export const PRIORITY_CONFIG: Record<FeaturePriority, {
  label: string;
  color: string;
}> = {
  'must-have': { label: 'Must Have', color: 'text-red-400' },
  'should-have': { label: 'Should Have', color: 'text-orange-400' },
  'nice-to-have': { label: 'Nice to Have', color: 'text-blue-400' }
};

export const COMPLEXITY_CONFIG: Record<FeatureComplexity, {
  label: string;
  color: string;
}> = {
  simple: { label: 'Simple', color: 'text-green-400' },
  moderate: { label: 'Moderate', color: 'text-yellow-400' },
  complex: { label: 'Complex', color: 'text-red-400' }
};

