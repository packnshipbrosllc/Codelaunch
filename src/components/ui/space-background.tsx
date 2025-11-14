// src/components/ui/space-background.tsx
'use client';

import { ShootingStars } from '@/components/ui/shooting-stars';

interface SpaceBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'intense' | 'subtle';
}

export function SpaceBackground({ children, variant = 'default' }: SpaceBackgroundProps) {
  const variants = {
    default: {
      minSpeed: 20,
      maxSpeed: 40,
      minDelay: 1200,
      maxDelay: 4200,
      starColor: '#FFFFFF',      // Changed to white
      trailColor: '#60A5FA',     // Bright blue trail
    },
    intense: {
      minSpeed: 25,
      maxSpeed: 50,
      minDelay: 400,
      maxDelay: 1500,
      starColor: '#FFFFFF',
      trailColor: '#60A5FA',
    },
    subtle: {
      minSpeed: 15,
      maxSpeed: 30,
      minDelay: 2000,
      maxDelay: 6000,
      starColor: '#FFFFFF',
      trailColor: '#60A5FA',
    },
  };

  const config = variants[variant];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dark background - NO purple */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a14] via-[#0f0f1a] to-[#050508]" />

      {/* Shooting Stars Layer - Now WHITE and more visible */}
      <div className="absolute inset-0 pointer-events-none">
        <ShootingStars
          minSpeed={config.minSpeed}
          maxSpeed={config.maxSpeed}
          minDelay={config.minDelay}
          maxDelay={config.maxDelay}
          starColor={config.starColor}
          trailColor={config.trailColor}
          starWidth={15}        // Increased from 12
          starHeight={2}        // Increased from 1.5
          className="w-full h-full"
        />
      </div>

      {/* Static stars background - Brighter */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-60"  // Increased from 40
          style={{
            backgroundImage: `
              radial-gradient(2px 2px at 20% 30%, white, transparent),
              radial-gradient(2px 2px at 60% 70%, white, transparent),
              radial-gradient(1px 1px at 50% 50%, white, transparent),
              radial-gradient(1px 1px at 80% 10%, white, transparent),
              radial-gradient(2px 2px at 90% 60%, white, transparent),
              radial-gradient(1px 1px at 33% 80%, white, transparent),
              radial-gradient(1px 1px at 15% 60%, white, transparent),
              radial-gradient(2px 2px at 70% 40%, white, transparent),
              radial-gradient(1px 1px at 45% 15%, white, transparent),
              radial-gradient(2px 2px at 85% 85%, white, transparent)
            `,
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* Subtle blue accent glows (not purple) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
