// src/components/ui/space-background.tsx
'use client';

import { memo } from 'react';
import { ShootingStars } from '@/components/ui/shooting-stars';
import { SparklesCore } from '@/components/ui/sparkles-core';

interface SpaceBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'intense' | 'subtle';
}

export const SpaceBackground = memo(function SpaceBackground({ children, variant = 'default' }: SpaceBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-black" />

      {/* SPARKLES - Should see tiny white dots floating */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="space-sparkles"
          background="transparent"
          minSize={0.8}
          maxSize={2}
          particleDensity={150}
          className="w-full h-full"
          particleColor="#FFFFFF"
          speed={0.5}
        />
      </div>

      {/* SHOOTING STARS - Should see white streaks */}
      <div className="absolute inset-0 w-full h-full">
        <ShootingStars
          minSpeed={20}
          maxSpeed={40}
          minDelay={1000}
          maxDelay={3000}
          starColor="#FFFFFF"
          trailColor="#60A5FA"
          starWidth={20}
          starHeight={3}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});
