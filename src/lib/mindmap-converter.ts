// Data Converter Utility
// Location: src/lib/mindmap-converter.ts

import { 
  EnhancedMindmapData,
  EnhancedFeature,
  EnhancedCompetitor,
  EnhancedPersona,
  EnhancedTechStack,
  ProjectOverview,
  UserStory,
  TechnicalImplementation,
  FeatureScore
} from '@/types/enhanced-mindmap';

// Old mindmap data structure (your current format)
interface OldMindmapData {
  projectName: string;
  projectDescription?: string;
  description: string;
  competitors: Array<{
    name: string;
    url?: string;
    strength?: string;
    ourAdvantage?: string;
  }>;
  techStack: {
    frontend?: string;
    backend?: string;
    database?: string;
    auth?: string;
    payments?: string;
    hosting?: string;
  };
  features: Array<{
    id?: string;
    title?: string;
    name: string;
    description: string;
    priority?: string;
  }>;
  monetization?: {
    model: string;
    pricing?: string;
  };
  userPersona?: {
    name?: string;
    title?: string;
    description: string;
    painPoint?: string;
    painPoints?: string[];
    goal?: string;
  };
  targetAudience?: string;
}

/**
 * Converts old mindmap format to enhanced format with full PRD details
 */
export function convertToEnhancedMindmap(oldData: OldMindmapData): EnhancedMindmapData {
  const now = new Date().toISOString();

  // Convert competitors with enhanced details
  const enhancedCompetitors: EnhancedCompetitor[] = oldData.competitors.map((comp, idx) => ({
    id: `comp-${idx}`,
    type: 'competitor',
    title: comp.name,
    description: `Competitor analysis for ${comp.name}`,
    url: comp.url,
    strengths: comp.strength ? [comp.strength] : [],
    weaknesses: ['To be analyzed'],
    keyFeatures: [],
    ourAdvantage: comp.ourAdvantage || 'Better user experience and pricing',
    status: 'planned',
    createdAt: now,
    updatedAt: now,
  }));

  // Convert features with full PRD structure
  const enhancedFeatures: EnhancedFeature[] = oldData.features.map((feature, idx) => {
    const featureName = feature.title || feature.name;
    const featureDescription = feature.description || '';
    
    // Generate user stories based on feature
    const userStories: UserStory[] = [
      {
        id: `story-${idx}-1`,
        persona: oldData.userPersona?.name || oldData.userPersona?.title || 'End User',
        need: featureName.toLowerCase(),
        goal: 'accomplish their task efficiently',
      }
    ];

    // Generate technical implementation
    const techImpl: TechnicalImplementation = {
      frontend: oldData.techStack.frontend ? [oldData.techStack.frontend] : ['React components', 'State management', 'API integration'],
      backend: oldData.techStack.backend ? [oldData.techStack.backend] : ['REST API endpoints', 'Database queries', 'Business logic'],
      database: oldData.techStack.database ? [oldData.techStack.database] : ['Schema design', 'Relationships', 'Indexes'],
      steps: [
        'Design database schema',
        'Create API endpoints',
        'Build frontend components',
        'Add validation and error handling',
        'Write tests',
        'Deploy and monitor',
      ],
    };

    // Calculate feature scoring
    const complexity = feature.priority === 'high' ? 8 : feature.priority === 'medium' ? 5 : 3;
    const impact = feature.priority === 'high' ? 9 : feature.priority === 'medium' ? 6 : 4;
    const effort = complexity;
    
    const scoring: FeatureScore = {
      complexity,
      impact,
      effort,
      roi: impact / effort,
    };

    return {
      id: feature.id || `feat-${idx}`,
      type: 'feature',
      title: featureName,
      description: featureDescription,
      overview: `${featureName}: ${featureDescription}`,
      userStories,
      acceptanceCriteria: [
        'Feature functions as expected',
        'User interface is intuitive',
        'Performance meets requirements',
        'Error handling works correctly',
        'Tests pass successfully',
      ],
      technicalImplementation: techImpl,
      complexity: complexity > 7 ? 'complex' : complexity > 4 ? 'moderate' : 'simple',
      estimatedHours: complexity * 8,
      priority: (feature.priority as any) || 'medium',
      status: 'planned',
      scoring,
      databaseSchema: [
        {
          tableName: `${featureName.toLowerCase().replace(/\s+/g, '_')}`,
          columns: [
            { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY' },
            { name: 'user_id', type: 'UUID', constraints: 'REFERENCES users(id)' },
            { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
            { name: 'updated_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
          ],
        },
      ],
      apiEndpoints: [
        { method: 'GET', path: `/api/${featureName.toLowerCase().replace(/\s+/g, '-')}`, description: 'Fetch items', auth: true },
        { method: 'POST', path: `/api/${featureName.toLowerCase().replace(/\s+/g, '-')}`, description: 'Create item', auth: true },
        { method: 'PUT', path: `/api/${featureName.toLowerCase().replace(/\s+/g, '-')}/:id`, description: 'Update item', auth: true },
        { method: 'DELETE', path: `/api/${featureName.toLowerCase().replace(/\s+/g, '-')}/:id`, description: 'Delete item', auth: true },
      ],
      createdAt: now,
      updatedAt: now,
    };
  });

  // Convert persona with psychographics
  const enhancedPersonas: EnhancedPersona[] = oldData.userPersona ? [{
    id: 'persona-1',
    type: 'persona',
    title: oldData.userPersona.title || oldData.userPersona.name || 'Target User',
    description: oldData.userPersona.description,
    demographics: {
      ageRange: '25-45',
      location: oldData.targetAudience || 'United States',
      occupation: 'Professional',
      education: "Bachelor's degree or higher",
    },
    psychographics: {
      painPoints: oldData.userPersona.painPoints || (oldData.userPersona.painPoint ? [oldData.userPersona.painPoint] : ['Inefficient processes', 'Lack of automation']),
      motivations: ['Increase productivity', 'Save time', 'Improve workflow'],
      goals: oldData.userPersona.goal ? [oldData.userPersona.goal] : ['Achieve better results', 'Work more efficiently', 'Reduce manual tasks'],
      frustrations: ['Complex tools', 'Steep learning curves', 'Poor support'],
    },
    behavior: {
      techSavviness: 'High',
      preferredChannels: ['Email', 'In-app notifications', 'Mobile'],
    },
    status: 'planned',
    createdAt: now,
    updatedAt: now,
  }] : [];

  // Convert tech stack
  const enhancedTechStack: EnhancedTechStack[] = [];
  if (oldData.techStack.frontend) {
    enhancedTechStack.push({
      id: 'tech-frontend',
      type: 'techstack',
      title: oldData.techStack.frontend,
      description: `Frontend framework: ${oldData.techStack.frontend}`,
      category: 'frontend',
      learning_curve: 'moderate',
      pros: ['Popular', 'Well documented', 'Active community'],
      cons: ['Learning curve', 'Potential performance considerations'],
      status: 'planned',
      createdAt: now,
      updatedAt: now,
    });
  }
  if (oldData.techStack.backend) {
    enhancedTechStack.push({
      id: 'tech-backend',
      type: 'techstack',
      title: oldData.techStack.backend,
      description: `Backend framework: ${oldData.techStack.backend}`,
      category: 'backend',
      learning_curve: 'moderate',
      pros: ['Scalable', 'Reliable', 'Good performance'],
      cons: ['Setup complexity'],
      status: 'planned',
      createdAt: now,
      updatedAt: now,
    });
  }
  if (oldData.techStack.database) {
    enhancedTechStack.push({
      id: 'tech-database',
      type: 'techstack',
      title: oldData.techStack.database,
      description: `Database: ${oldData.techStack.database}`,
      category: 'database',
      learning_curve: 'moderate',
      pros: ['Robust', 'Feature-rich', 'Good performance'],
      cons: ['Management overhead'],
      status: 'planned',
      createdAt: now,
      updatedAt: now,
    });
  }
  if (oldData.techStack.auth) {
    enhancedTechStack.push({
      id: 'tech-auth',
      type: 'techstack',
      title: oldData.techStack.auth,
      description: `Authentication: ${oldData.techStack.auth}`,
      category: 'services',
      learning_curve: 'simple',
      pros: ['Easy integration', 'Secure', 'Well documented'],
      cons: ['Dependency on service'],
      status: 'planned',
      createdAt: now,
      updatedAt: now,
    });
  }
  if (oldData.techStack.payments) {
    enhancedTechStack.push({
      id: 'tech-payments',
      type: 'techstack',
      title: oldData.techStack.payments,
      description: `Payment processor: ${oldData.techStack.payments}`,
      category: 'services',
      learning_curve: 'simple',
      pros: ['Secure', 'Reliable', 'Easy integration'],
      cons: ['Transaction fees'],
      status: 'planned',
      createdAt: now,
      updatedAt: now,
    });
  }
  if (oldData.techStack.hosting) {
    enhancedTechStack.push({
      id: 'tech-hosting',
      type: 'techstack',
      title: oldData.techStack.hosting,
      description: `Hosting platform: ${oldData.techStack.hosting}`,
      category: 'infrastructure',
      learning_curve: 'simple',
      pros: ['Scalable', 'Fast', 'Easy deployment'],
      cons: ['Cost at scale'],
      status: 'planned',
      createdAt: now,
      updatedAt: now,
    });
  }

  // Create project overview
  const overview: ProjectOverview = {
    id: 'overview',
    type: 'overview',
    title: oldData.projectName,
    description: oldData.projectDescription || oldData.description,
    elevatorPitch: `${oldData.projectName} helps users ${(oldData.projectDescription || oldData.description).toLowerCase()}`,
    problemStatement: 'Users need a better solution for their current challenges',
    solutionStatement: `${oldData.projectName} provides an innovative approach to solve this problem`,
    valueProposition: 'Faster, easier, and more efficient than alternatives',
    targetMarket: oldData.targetAudience || 'Professionals and businesses looking to improve their workflow',
    successMetrics: [
      'User adoption rate',
      'Daily active users',
      'User satisfaction score',
      'Revenue growth',
      'Feature usage',
    ],
    status: 'planned',
    createdAt: now,
    updatedAt: now,
  };

  return {
    id: `mindmap-${Date.now()}`,
    projectName: oldData.projectName,
    description: oldData.projectDescription || oldData.description,
    overview,
    features: enhancedFeatures,
    competitors: enhancedCompetitors,
    personas: enhancedPersonas,
    techStack: enhancedTechStack,
    monetization: oldData.monetization ? {
      id: 'monetization-1',
      type: 'monetization',
      title: `${oldData.monetization.model} Model`,
      description: `Monetization through ${oldData.monetization.model}`,
      model: oldData.monetization.model as any,
      revenueStreams: [oldData.monetization.model],
      tiers: oldData.monetization.pricing ? [
        {
          name: 'Basic',
          price: oldData.monetization.pricing,
          features: ['Core features', 'Email support'],
        },
      ] : [],
      status: 'planned',
      createdAt: now,
      updatedAt: now,
    } : undefined,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Generate enhanced mindmap from AI-generated content
 */
export function enhanceAIGeneratedMindmap(
  projectName: string,
  description: string,
  aiContent: any
): EnhancedMindmapData {
  // This function would take AI output and structure it into the enhanced format
  // You can customize this based on your AI's output structure
  
  return convertToEnhancedMindmap({
    projectName,
    description,
    projectDescription: description,
    competitors: aiContent.competitors || [],
    techStack: aiContent.techStack || {},
    features: aiContent.features || [],
    monetization: aiContent.monetization,
    userPersona: aiContent.userPersona,
    targetAudience: aiContent.targetAudience,
  });
}

