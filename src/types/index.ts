export interface AppData {
  name: string;
  description: string;
  platform: 'web' | 'mobile';
  template: 'ShipFast' | 'Gravity' | 'React Native Starter';
  features: string[];
  techStack: string[];
}

export interface Config {
  appName: string;
  primaryColor: string;
  database: string;
  authProviders: string[];
  paymentProvider: string;
  features: {
    dashboard: boolean;
    userProfiles: boolean;
    notifications: boolean;
    analytics: boolean;
    api: boolean;
    adminPanel: boolean;
  };
}

export interface Node {
  id: number;
  x: number;
  y: number;
  label: string;
  type: 'user' | 'feature' | 'backend' | 'core' | 'integration';
  icon: string;
}

export interface Edge {
  from: number;
  to: number;
}

export type Stage = 
  | 'welcome' 
  | 'input' 
  | 'processing' 
  | 'mindmap' 
  | 'prd' 
  | 'template' 
  | 'config' 
  | 'generating' 
  | 'deploying' 
  | 'success';
