// src/types/mindmap.ts

export interface Competitor {
  name: string;
  url?: string;
  strength: string;
  ourAdvantage: string;
}

export interface TechStack {
  frontend: string;
  backend: string;
  database: string;
  auth: string;
  payments: string;
  hosting: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Monetization {
  model: 'subscription' | 'one-time' | 'freemium' | 'usage-based';
  pricing: string;
  freeTier?: string;
  paidTier?: string;
}

export interface UserPersona {
  name: string;
  description: string;
  painPoint: string;
  goal: string;
}

export interface MindmapData {
  projectName: string;
  projectDescription: string;
  targetAudience: string;
  competitors: Competitor[];
  techStack: TechStack;
  features: Feature[];
  monetization: Monetization;
  userPersona: UserPersona;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Mindmap {
  id: string;
  project_id: string;
  user_id: string;
  project_name: string;
  project_description: string;
  target_audience: string;
  competitors: Competitor[];
  tech_stack: TechStack;
  features: Feature[];
  monetization: Monetization;
  user_persona: UserPersona;
  nodes: any[];
  edges: any[];
  created_at: string;
  updated_at: string;
}

export interface GenerateMindmapRequest {
  idea: string;
  userId: string;
}

export interface GenerateMindmapResponse {
  success: boolean;
  data?: MindmapData;
  error?: string;
}

