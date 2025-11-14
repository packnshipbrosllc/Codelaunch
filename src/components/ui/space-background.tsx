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
      starColor: '#9E00FF',
      trailColor: '#2EB9DF',
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
      starColor: '#9E00FF',
      trailColor: '#2EB9DF',
    },
  };

  const config = variants[variant];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Purple gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-gray-900 to-black" />

      {/* Shooting Stars Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <ShootingStars
          minSpeed={config.minSpeed}
          maxSpeed={config.maxSpeed}
          minDelay={config.minDelay}
          maxDelay={config.maxDelay}
          starColor={config.starColor}
          trailColor={config.trailColor}
          starWidth={12}
          starHeight={1.5}
          className="w-full h-full"
        />
      </div>

      {/* Static stars background */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(2px 2px at 20% 30%, white, transparent),
              radial-gradient(2px 2px at 60% 70%, white, transparent),
              radial-gradient(1px 1px at 50% 50%, white, transparent),
              radial-gradient(1px 1px at 80% 10%, white, transparent),
              radial-gradient(2px 2px at 90% 60%, white, transparent),
              radial-gradient(1px 1px at 33% 80%, white, transparent),
              radial-gradient(1px 1px at 15% 60%, white, transparent),
              radial-gradient(2px 2px at 70% 40%, white, transparent)
            `,
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
