"use client";

import { useState } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import Navigation from '@/components/Navigation';
import WelcomeStage from '@/components/stages/WelcomeStage';
import InputStage from '@/components/stages/InputStage';
import ProcessingStage from '@/components/stages/ProcessingStage';
import MindmapStage from '@/components/stages/MindmapStage';
import PRDStage from '@/components/stages/PRDStage';
import TemplateStage from '@/components/stages/TemplateStage';
import ConfigStage from '@/components/stages/ConfigStage';
import GeneratingStage from '@/components/stages/GeneratingStage';
import DeployingStage from '@/components/stages/DeployingStage';
import SuccessStage from '@/components/stages/SuccessStage';
import { AppData, Config, Stage } from '@/types';
import { generateAppData } from '@/lib/utils';

const EXAMPLE_IDEAS = [
  "A SaaS platform where therapists can manage appointments and client notes with secure messaging",
  "An AI-powered chatbot for customer support with conversation history and analytics",
  "A mobile app for tracking daily habits with reminders and progress charts"
];

export default function CodeLaunchApp() {
  const [stage, setStage] = useState<Stage>('welcome');
  const [userInput, setUserInput] = useState('');
  const [appData, setAppData] = useState<AppData | null>(null);
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState<Config>({
    appName: 'My SaaS App',
    primaryColor: '#3b82f6',
    database: 'PostgreSQL',
    authProviders: ['Google', 'Email'],
    paymentProvider: 'Stripe',
    features: {
      dashboard: true,
      userProfiles: true,
      notifications: true,
      analytics: false,
      api: true,
      adminPanel: false
    }
  });

  const processIdea = () => {
    setStage('processing');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const data = generateAppData(userInput);
            setAppData(data);
            setConfig(prev => ({ ...prev, appName: data.name }));
            setStage('mindmap');
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handleRestart = () => {
    setStage('welcome');
    setUserInput('');
    setAppData(null);
    setProgress(0);
  };

  return (
    <>
      <SignedIn>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white pt-20">
          {stage === 'welcome' && <WelcomeStage onStart={() => setStage('input')} />}
          {stage === 'input' && (
            <InputStage 
              userInput={userInput} 
              setUserInput={setUserInput} 
              onSubmit={processIdea} 
              exampleIdeas={EXAMPLE_IDEAS} 
            />
          )}
          {stage === 'processing' && <ProcessingStage progress={progress} />}
          {stage === 'mindmap' && appData && (
            <MindmapStage 
              appData={appData} 
              onContinue={() => setStage('prd')} 
            />
          )}
          {stage === 'prd' && appData && (
            <PRDStage 
              appData={appData} 
              onContinue={() => setStage('template')} 
            />
          )}
          {stage === 'template' && appData && (
            <TemplateStage 
              appData={appData} 
              onContinue={() => setStage('config')} 
            />
          )}
          {stage === 'config' && appData && (
            <ConfigStage 
              config={config} 
              setConfig={setConfig} 
              appData={appData} 
              onContinue={() => setStage('generating')} 
            />
          )}
          {stage === 'generating' && (
            <GeneratingStage 
              onComplete={() => setStage('deploying')} 
            />
          )}
          {stage === 'deploying' && (
            <DeployingStage 
              onComplete={() => setStage('success')} 
            />
          )}
          {stage === 'success' && appData && (
            <SuccessStage 
              appData={appData} 
              onRestart={handleRestart} 
            />
          )}
        </div>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
