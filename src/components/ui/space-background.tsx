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
      minDelay: 600,
      maxDelay: 2000,
      starColor: '#FFFFFF',
      trailColor: '#60A5FA',
    },
    subtle: {
      minSpeed: 15,
      maxSpeed: 25,
      minDelay: 2500,
      maxDelay: 6000,
      starColor: '#60A5FA',
      trailColor: '#3B82F6',
    },
  };

  const config = variants[variant];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a0a14] via-[#1a1a2e] to-[#0a0a14] overflow-hidden">
      {/* Shooting Stars */}
      <ShootingStars
        {...config}
        starWidth={variant === 'intense' ? 15 : 12}
        starHeight={variant === 'intense' ? 2 : 1.5}
        className="absolute inset-0 z-0"
      />

      {/* Static Stars */}
      <div className="absolute inset-0 z-0">
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
              radial-gradient(2px 2px at 70% 40%, white, transparent),
              radial-gradient(1px 1px at 45% 20%, white, transparent),
              radial-gradient(2px 2px at 85% 80%, white, transparent)
            `,
            backgroundSize: '200% 200%',
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      {/* Ambient Glow */}
      <div className="absolute inset-0 z-0">
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

