'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLDivElement>;
  fromRef: React.RefObject<HTMLDivElement>;
  toRef: React.RefObject<HTMLDivElement>;
  curvature?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  gradientStartColor = '#9333ea',
  gradientStopColor = '#ec4899',
  duration = 3,
  delay = 0,
  className,
}: AnimatedBeamProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current || !pathRef.current || !svgRef.current) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();

      const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
      const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
      const toX = toRect.left + toRect.width / 2 - containerRect.left;
      const toY = toRect.top + toRect.height / 2 - containerRect.top;

      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;

      const controlX1 = midX + curvature;
      const controlY1 = fromY;
      const controlX2 = midX - curvature;
      const controlY2 = toY;

      const path = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;
      pathRef.current.setAttribute('d', path);

      // Update SVG dimensions
      svgRef.current.setAttribute('width', containerRect.width.toString());
      svgRef.current.setAttribute('height', containerRect.height.toString());
    };

    updatePath();

    const resizeObserver = new ResizeObserver(updatePath);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updatePath);
    window.addEventListener('scroll', updatePath, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePath);
      window.removeEventListener('scroll', updatePath, true);
    };
  }, [containerRef, fromRef, toRef, curvature]);

  return (
    <svg
      ref={svgRef}
      className={cn('pointer-events-none absolute left-0 top-0', className)}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <defs>
        <linearGradient id={`gradient-${fromRef.current?.id || 'default'}`} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="50%" stopColor={gradientStartColor} stopOpacity="0.5" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`gradient-full-${fromRef.current?.id || 'default'}`} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={gradientStartColor} />
          <stop offset="100%" stopColor={gradientStopColor} />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d=""
        fill="none"
        stroke={`url(#gradient-full-${fromRef.current?.id || 'default'})`}
        strokeWidth="2"
        className="drop-shadow-2xl"
        style={{
          filter: 'drop-shadow(0 0 4px rgba(147, 51, 234, 0.5))',
        }}
      >
        <animate
          attributeName="stroke-dasharray"
          values="0 1000;1000 0"
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

