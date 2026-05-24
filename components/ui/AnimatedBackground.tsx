'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Orb {
  id: number;
  x: string;
  y: string;
  size: string;
  duration: number;
  delay: number;
  color: string;
}

interface GridPoint {
  id: number;
  cx: string;
  cy: string;
  opacity: number;
  duration: number;
  delay: number;
}

export function AnimatedBackground() {
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [points, setPoints] = useState<GridPoint[]>([]);

  useEffect(() => {
    const newOrbs: Orb[] = [
      { id: 1, x: '15%', y: '25%', size: '350px', duration: 25, delay: 0, color: 'rgba(122,0,0,0.03)' },
      { id: 2, x: '75%', y: '65%', size: '450px', duration: 30, delay: -5, color: 'rgba(255,43,43,0.02)' },
      { id: 3, x: '45%', y: '85%', size: '280px', duration: 22, delay: -10, color: 'rgba(59,10,10,0.03)' },
      { id: 4, x: '80%', y: '15%', size: '320px', duration: 26, delay: -8, color: 'rgba(122,0,0,0.02)' },
    ];
    setOrbs(newOrbs);

    const newPoints: GridPoint[] = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      cx: `${(i % 4) * 30 + 10}%`,
      cy: `${Math.floor(i / 4) * 30 + 10}%`,
      opacity: Math.random() * 0.4 + 0.05,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 3,
    }));
    setPoints(newPoints);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(59,10,10,0.07) 0%, transparent 80%), linear-gradient(180deg, #050505 0%, #0f0f0f 50%, #050505 100%)',
        }}
      />

      {/* Animated orbs */}
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-3xl"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 20, -15, 5, 0],
            y: [0, -30, 15, -5, 0],
            scale: [1, 1.05, 0.98, 1.02, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Grid overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.02]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#ff2b2b" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Animated grid points */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {points.map((p) => (
          <motion.circle
            key={p.id}
            cx={p.cx}
            cy={p.cy}
            r="1"
            fill="#ff2b2b"
            initial={{ opacity: p.opacity }}
            animate={{ opacity: [p.opacity, p.opacity * 2.5, p.opacity] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </svg>

      {/* Scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px opacity-[0.03]"
        style={{ background: 'linear-gradient(90deg, transparent, #ff2b2b, transparent)' }}
        animate={{ y: ['-100%', '100vh'] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-15">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 15 L 0 0 L 15 0" stroke="#ff2b2b" strokeWidth="1" />
          <circle cx="2" cy="2" r="1" fill="#ff2b2b" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-15 rotate-180">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 15 L 0 0 L 15 0" stroke="#ff2b2b" strokeWidth="1" />
          <circle cx="2" cy="2" r="1" fill="#ff2b2b" />
        </svg>
      </div>
    </div>
  );
}
