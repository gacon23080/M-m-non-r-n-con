import React, { useEffect, useRef } from 'react';

export const SnowEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const isMobile = window.innerWidth < 768;
    const flakeCount = isMobile ? 30 : 60; 
    const flakes: Array<{
      x: number;
      y: number;
      r: number;
      d: number;
      opacity: number;
      speedY: number;
      speedX: number;
    }> = [];

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.5 + 1,
        d: Math.random() * flakeCount,
        opacity: Math.random() * 0.6 + 0.3,
        speedY: Math.random() * 0.8 + 0.3,
        speedX: Math.sin(Math.random() * Math.PI) * 0.4 - 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakeCount; i++) {
        const f = flakes[i];
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
        ctx.fill();

        f.y += f.speedY;
        f.x += f.speedX;

        if (f.y > height) {
          flakes[i] = {
            x: Math.random() * width,
            y: -5,
            r: f.r,
            d: f.d,
            opacity: f.opacity,
            speedY: f.speedY,
            speedX: f.speedX,
          };
        }

        if (f.x > width) f.x = 0;
        if (f.x < 0) f.x = width;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40 opacity-70"
    />
  );
};
