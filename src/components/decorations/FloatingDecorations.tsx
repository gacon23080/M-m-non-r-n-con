import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { soundManager } from '../../lib/sound';

interface Bubble {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

interface Snowflake {
  id: number;
  x: number; // percentage 0 - 100
  size: number; // px 2 - 7
  opacity: number;
  duration: number; // seconds 10 - 24
  delay: number; // seconds 0 - 10
  sway: number; // px
}

export const FloatingDecorations: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([
    { id: 1, x: 12, size: 24, duration: 16, delay: 0 },
    { id: 2, x: 28, size: 36, duration: 20, delay: 4 },
    { id: 3, x: 50, size: 20, duration: 14, delay: 2 },
    { id: 4, x: 72, size: 32, duration: 18, delay: 5 },
    { id: 5, x: 88, size: 28, duration: 22, delay: 1 },
  ]);

  // Generate gentle pastel snowflakes
  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: 42 }).map((_, i) => ({
      id: i,
      x: Math.floor(Math.random() * 100),
      size: Math.floor(Math.random() * 5) + 3,
      opacity: Math.random() * 0.45 + 0.35,
      duration: Math.floor(Math.random() * 12) + 12,
      delay: Math.random() * 15,
      sway: Math.floor(Math.random() * 30) - 15,
    }));
  }, []);

  const popBubble = (id: number) => {
    soundManager.playPop();
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setTimeout(() => {
      setBubbles((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.floor(Math.random() * 88) + 6,
          size: Math.floor(Math.random() * 20) + 18,
          duration: Math.floor(Math.random() * 8) + 14,
          delay: 0,
        },
      ]);
    }, 5000);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic Animated Ambient Glowing Orbs: Lavender -> Blush Pink -> Champagne */}
      <motion.div
        className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-[#E0D4F7]/40 via-[#F3E8FF]/30 to-transparent blur-3xl"
        animate={{
          x: [0, 80, -40, 0],
          y: [0, 60, -30, 0],
          scale: [1, 1.12, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute top-1/3 -right-28 w-[580px] h-[580px] rounded-full bg-gradient-to-bl from-[#FDE2EC]/45 via-[#FFF1F6]/35 to-transparent blur-3xl"
        animate={{
          x: [0, -60, 40, 0],
          y: [0, -80, 50, 0],
          scale: [1, 0.92, 1.1, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute -bottom-32 left-1/4 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-[#FEF3DC]/40 via-[#FFF9EE]/30 to-transparent blur-3xl"
        animate={{
          x: [0, 70, -50, 0],
          y: [0, -50, 40, 0],
          scale: [1, 1.08, 0.94, 1],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Gentle Falling Snowflakes (Tuyết rơi nhẹ nhẹ mộng mơ) */}
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute rounded-full pointer-events-none shadow-xs"
          style={{
            left: `${flake.x}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
          }}
          initial={{ y: -30, opacity: 0 }}
          animate={{
            y: ['0vh', '105vh'],
            x: [0, flake.sway, -flake.sway, 0],
            opacity: [0, flake.opacity, flake.opacity * 0.9, 0],
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            delay: flake.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Subtle Ethereal Stardust Sparkles */}
      <div className="absolute top-1/4 left-1/6 opacity-40 animate-pulse">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" fill="#C4B5FD" />
        </svg>
      </div>

      <div className="absolute top-1/2 right-1/5 opacity-35 animate-pulse" style={{ animationDelay: '1.5s' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" fill="#FBCFE8" />
        </svg>
      </div>

      <div className="absolute bottom-1/3 left-1/3 opacity-30 animate-pulse" style={{ animationDelay: '3s' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" fill="#FDE68A" />
        </svg>
      </div>

      {/* Interactive Poppable Translucent Liquid Glass Bubbles */}
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className="absolute bottom-0 pointer-events-auto cursor-pointer"
          style={{ left: `${b.x}%` }}
          initial={{ y: 20, opacity: 0 }}
          animate={{
            y: -1100,
            x: [0, 20, -20, 0],
            opacity: [0, 0.65, 0.75, 0],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: 'easeOut',
          }}
          onClick={() => popBubble(b.id)}
          title="Chạm nhẹ để vỡ hạt sương ♡"
        >
          <div
            className="rounded-full bg-gradient-to-tr from-white/30 via-[#F3E8FF]/40 to-[#FFF1F6]/50 border border-white/70 shadow-sm relative group hover:scale-130 transition-transform backdrop-blur-[2px]"
            style={{ width: b.size, height: b.size }}
          >
            <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-white/90" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
