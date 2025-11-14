'use client';

import { useEffect, useRef } from 'react';

interface ShootingStarsProps {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  starHeight?: number;
  className?: string;
}

export function ShootingStars({
  minSpeed = 15,
  maxSpeed = 35,
  minDelay = 800,
  maxDelay = 3000,
  starColor = '#60A5FA',
  trailColor = '#3B82F6',
  starWidth = 12,
  starHeight = 2,
  className = '',
}: ShootingStarsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const stars: Array<{
      element: HTMLDivElement;
      animation: Animation;
    }> = [];

    const createStar = () => {
      const star = document.createElement('div');
      star.style.position = 'absolute';
      star.style.width = `${starWidth}px`;
      star.style.height = `${starHeight}px`;
      star.style.background = `linear-gradient(90deg, ${starColor} 0%, ${trailColor} 50%, transparent 100%)`;
      star.style.borderRadius = '50%';
      star.style.boxShadow = `0 0 ${starWidth * 2}px ${starColor}, 0 0 ${starWidth * 4}px ${starColor}`;
      star.style.opacity = '0';
      star.style.pointerEvents = 'none';
      star.style.zIndex = '1';
      
      container.appendChild(star);

      // Random starting position (top of screen, slight angle)
      const startX = Math.random() * 100;
      const startY = -2;
      const angle = (Math.random() * 30 - 15) * (Math.PI / 180); // -15 to 15 degrees
      const distance = 120; // Distance to travel
      const endX = startX + Math.cos(angle) * distance;
      const endY = startY + Math.sin(angle) * distance;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      const duration = 2000 / speed; // Duration based on speed

      star.style.left = `${startX}%`;
      star.style.top = `${startY}%`;

      // Animate using Web Animations API
      const keyframes = [
        {
          opacity: '0',
          transform: `translate(0, 0) scale(0.5)`,
        },
        {
          opacity: '1',
          transform: `translate(0, 0) scale(1)`,
          offset: 0.05,
        },
        {
          opacity: '1',
          transform: `translate(${endX - startX}%, ${endY - startY}%) scale(1)`,
          offset: 0.95,
        },
        {
          opacity: '0',
          transform: `translate(${endX - startX}%, ${endY - startY}%) scale(0.5)`,
        },
      ];

      const animation = star.animate(keyframes, {
        duration: duration * 1000,
        easing: 'linear',
        fill: 'forwards',
      });

      stars.push({ element: star, animation });

      animation.onfinish = () => {
        if (star.parentNode) {
          star.parentNode.removeChild(star);
        }
        const index = stars.findIndex(s => s.element === star);
        if (index > -1) {
          stars.splice(index, 1);
        }
        // Create a new star after a delay
        const delay = minDelay + Math.random() * (maxDelay - minDelay);
        setTimeout(() => createStar(), delay);
      };
    };

    // Create initial stars with staggered delays
    const numStars = 3;
    for (let i = 0; i < numStars; i++) {
      const delay = (minDelay + Math.random() * (maxDelay - minDelay)) * (i / numStars);
      setTimeout(() => createStar(), delay);
    }

    return () => {
      stars.forEach(star => {
        try {
          star.animation.cancel();
        } catch (e) {
          // Ignore errors
        }
        if (star.element.parentNode) {
          star.element.parentNode.removeChild(star.element);
        }
      });
    };
  }, [minSpeed, maxSpeed, minDelay, maxDelay, starColor, trailColor, starWidth, starHeight]);

  return <div ref={containerRef} className={className} style={{ pointerEvents: 'none' }} />;
}
