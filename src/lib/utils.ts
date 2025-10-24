import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateAppData(userInput: string) {
  const input = userInput.toLowerCase();
  const isTherapy = input.includes('therap');
  const isAI = input.includes('ai') || input.includes('chatbot');
  const isMobile = input.includes('mobile') || input.includes('habit');

  return {
    name: isTherapy ? 'TherapyConnect' : isAI ? 'AI Support Hub' : isMobile ? 'HabitTracker' : 'My SaaS Platform',
    description: userInput,
    platform: (isMobile ? 'mobile' : 'web') as 'web' | 'mobile',
    template: (isMobile ? 'React Native Starter' : isAI ? 'Gravity' : 'ShipFast') as 'ShipFast' | 'Gravity' | 'React Native Starter',
    features: isTherapy 
      ? ['Appointment Scheduling', 'Client Management', 'Secure Messaging', 'Notes & Records']
      : isAI
      ? ['AI Chat Interface', 'Conversation History', 'Analytics Dashboard', 'Multi-language Support']
      : ['User Dashboard', 'Progress Tracking', 'Reminders', 'Charts & Analytics'],
    techStack: isMobile 
      ? ['React Native', 'Expo', 'Firebase', 'RevenueCat'] 
      : isAI 
      ? ['Next.js', 'Supabase', 'OpenAI', 'Stripe'] 
      : ['Next.js', 'PostgreSQL', 'NextAuth', 'Stripe']
  };
}
