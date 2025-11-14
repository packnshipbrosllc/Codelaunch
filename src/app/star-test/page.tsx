// src/app/star-test/page.tsx
'use client';

import { ShootingStars } from '@/components/ui/shooting-stars';

export default function StarTestPage() {
  return (
    <div className="relative w-screen h-screen bg-purple-900">
      <ShootingStars
        minSpeed={20}
        maxSpeed={40}
        minDelay={500}
        maxDelay={2000}
        starColor="#FFFFFF"
        trailColor="#60A5FA"
        starWidth={20}
        starHeight={3}
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h1 className="text-white text-6xl font-bold mb-4">
          SHOOTING STARS TEST
        </h1>
        <p className="text-white text-xl mt-4">
          You should see white shooting stars every 0.5-2 seconds
        </p>
        <p className="text-gray-300 text-sm mt-2">
          If you see stars here, they should also work on the dashboard!
        </p>
      </div>
    </div>
  );
}

