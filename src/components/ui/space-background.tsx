'use client';

import { ShootingStars } from '@/components/ui/shooting-stars';

interface SpaceBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'intense' | 'subtle';
}

export function SpaceBackground({ children, variant = 'default' }: SpaceBackgroundProps) {
  const variants = {
    default: {
      minSpeed: 15,
      maxSpeed: 35,
      minDelay: 800,
      maxDelay: 3000,
      starColor: '#60A5FA',
      trailColor: '#3B82F6',
    },
    intense: {
      minSpeed: 20,
      maxSpeed: 45,
      minDelay: 400,
      maxDelay: 1500,
      starColor: '#A78BFA',
      trailColor: '#8B5CF6',
    },
    subtle: {
      minSpeed: 10,
      maxSpeed: 20,
      minDelay: 2000,
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
        starWidth={12}
        starHeight={2}
        className="absolute inset-0 z-0"
      />

      {/* Static Stars */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                             radial-gradient(2px 2px at 60% 70%, white, transparent),
                             radial-gradient(1px 1px at 50% 50%, white, transparent),
                             radial-gradient(1px 1px at 80% 10%, white, transparent),
                             radial-gradient(2px 2px at 90% 60%, white, transparent),
                             radial-gradient(1px 1px at 33% 80%, white, transparent),
                             radial-gradient(1px 1px at 65% 20%, white, transparent)`,
            backgroundSize: '200% 200%',
            backgroundPosition: '0% 0%, 40% 40%, 50% 50%, 80% 10%, 90% 60%, 33% 80%, 65% 20%',
          }}
        />
      </div>

      {/* Ambient Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

