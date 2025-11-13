'use client';

import { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: Star[] = [];
    const numStars = 600;
    let speed = 0.5;
    let animationFrameId: number;

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    class Star {
      x: number;
      y: number;
      z: number;
      pz: number;

      constructor() {
        this.x = Math.random() * (canvas?.width || 1920) - (canvas?.width || 1920) / 2;
        this.y = Math.random() * (canvas?.height || 1080) - (canvas?.height || 1080) / 2;
        this.z = Math.random() * (canvas?.width || 1920);
        this.pz = this.z;
      }

      update() {
        if (!canvas) return;
        this.z = this.z - speed;
        if (this.z < 1) {
          this.z = canvas.width;
          this.x = Math.random() * canvas.width - canvas.width / 2;
          this.y = Math.random() * canvas.height - canvas.height / 2;
          this.pz = this.z;
        }
      }

      draw() {
        if (!canvas || !ctx) return;
        const sx = (this.x / this.z) * canvas.width / 2 + canvas.width / 2;
        const sy = (this.y / this.z) * canvas.height / 2 + canvas.height / 2;
        
        const r = Math.max(0.1, (1 - this.z / canvas.width) * 2);

        const px = (this.x / this.pz) * canvas.width / 2 + canvas.width / 2;
        const py = (this.y / this.pz) * canvas.height / 2 + canvas.height / 2;

        this.pz = this.z;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.lineWidth = r * 1.5;
        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - this.z / canvas.width) * 0.6})`;
        ctx.stroke();
      }
    }

    function init() {
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
      }
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        star.update();
        star.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    function handleMouseMove(event: MouseEvent) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const distX = Math.abs(event.clientX - centerX);
      const distY = Math.abs(event.clientY - centerY);
      const dist = Math.sqrt(distX * distX + distY * distY);
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
      
      speed = 0.5 + (1 - dist / maxDist) * 4;
    }

    resizeCanvas();
    init();
    animate();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="starfield-canvas"
        className="fixed top-0 left-0 w-full h-full z-0"
      />
      <div className="fixed inset-0 bg-gradient-to-t from-[#0a0a0f]/90 via-transparent to-[#0a0a0f]/70 z-[1] pointer-events-none" />
    </>
  );
}

