// Pulsing "Click Me" indicator for mindmap nodes
// Location: src/components/NodeClickIndicator.tsx

'use client';

import { MousePointer2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NodeClickIndicatorProps {
  show: boolean; // Only show for first-time users
  nodeId?: string; // Optionally target specific node
}

export default function NodeClickIndicator({ show }: NodeClickIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // Show indicator after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      // Auto-hide after 10 seconds (user probably saw it)
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 12000);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
      {/* Pulsing rings */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-20 h-20 rounded-full border-4 border-purple-500 animate-ping opacity-75" />
        <div className="absolute w-24 h-24 rounded-full border-4 border-purple-400 animate-ping opacity-50" 
             style={{ animationDelay: '0.5s' }} />
        <div className="absolute w-28 h-28 rounded-full border-4 border-purple-300 animate-ping opacity-25" 
             style={{ animationDelay: '1s' }} />
        
        {/* Animated pointer */}
        <div className="relative z-10 animate-bounce">
          <MousePointer2 className="w-10 h-10 text-purple-400 drop-shadow-lg" />
        </div>
      </div>

      {/* "Click me" text bubble */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse whitespace-nowrap">
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 rotate-45" />
        <span className="relative z-10 font-semibold">👆 Click any node!</span>
      </div>
    </div>
  );
}

