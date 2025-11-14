// src/app/sparkle-test/page.tsx
'use client';

import { SparklesCore } from '@/components/ui/sparkles-core';

export default function SparkleTestPage() {
  return (
    <div className="relative w-screen h-screen bg-black">
      <SparklesCore
        id="test-sparkles"
        background="transparent"
        minSize={1}
        maxSize={3}
        particleDensity={200}
        className="w-full h-full"
        particleColor="#FFFFFF"
        speed={1}
      />
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1 className="text-white text-6xl font-bold">
          DO YOU SEE FLOATING PARTICLES?
        </h1>
      </div>
    </div>
  );
}

