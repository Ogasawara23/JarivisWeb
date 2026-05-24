'use client';

import React, { useEffect, useRef } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  phase: number;
  speed: number;
  color: string;
}

export function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isListening, isSpeaking } = useJarvisStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Particle[] = [];
    const particleCount = 45;
    const connectionDistance = 110;

    // Pulse state trackers for audio synthesis feedback simulation
    let speakPulse = 0;
    let listeningEffect = 0;

    // Initialize particles clustered mostly around the center for a organic brain look
    const createParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        // Core vs outer particles
        const isCore = i < 15;
        const angle = Math.random() * Math.PI * 2;
        const dist = isCore ? Math.random() * 80 : 80 + Math.random() * 140;

        const x = width / 2 + Math.cos(angle) * dist;
        const y = height / 2 + Math.sin(angle) * dist;

        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          baseRadius: isCore ? 2.5 + Math.random() * 2 : 1.2 + Math.random() * 1.5,
          radius: 0,
          phase: Math.random() * Math.PI * 2,
          speed: 0.01 + Math.random() * 0.015,
          color: isCore ? 'rgba(255, 43, 43, 0.85)' : 'rgba(122, 0, 0, 0.65)',
        });
      }
    };

    createParticles();

    // Handle Resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth interpolation of states
      if (isSpeaking) {
        speakPulse += 0.08;
      } else {
        speakPulse = 0;
      }

      if (isListening) {
        listeningEffect = Math.min(listeningEffect + 0.05, 1);
      } else {
        listeningEffect = Math.max(listeningEffect - 0.05, 0);
      }

      const centerPulse = 1.0 + Math.sin(Date.now() * 0.002) * 0.06;
      const ttsCorePulse = isSpeaking ? 1.2 + Math.sin(speakPulse) * 0.15 : 1.0;
      const micPulseScale = 1.0 + listeningEffect * 0.35;

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw background red glow
      const radialGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        150 + (isSpeaking ? Math.sin(speakPulse) * 30 : 0) + listeningEffect * 50
      );
      radialGlow.addColorStop(0, 'rgba(122, 0, 0, 0.15)');
      radialGlow.addColorStop(0.5, 'rgba(36, 0, 0, 0.05)');
      radialGlow.addColorStop(1, 'rgba(5, 5, 5, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Draw connections
      ctx.lineWidth = 0.55;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.22 * (isListening ? 1.6 : 1);
            ctx.strokeStyle = `rgba(255, 43, 43, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p, idx) => {
        p.phase += p.speed;
        const breathe = Math.sin(p.phase) * 0.2;

        // Apply state transforms: attract/repel slightly
        let tx = p.vx;
        let ty = p.vy;

        if (isListening) {
          // Add micro jitter to simulate speech audio feed
          tx += (Math.random() - 0.5) * 0.6;
          ty += (Math.random() - 0.5) * 0.6;
        }

        // Apply velocity
        p.x += tx * micPulseScale;
        p.y += ty * micPulseScale;

        // Constraint to central zone
        const distFromCenter = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
        if (distFromCenter > 220) {
          const angle = Math.atan2(p.y - centerY, p.x - centerX);
          p.x = centerX + Math.cos(angle) * 220;
          p.y = centerY + Math.sin(angle) * 220;
          p.vx *= -1;
          p.vy *= -1;
        }

        // Dynamic scale
        const scale = centerPulse * ttsCorePulse * micPulseScale;
        p.radius = p.baseRadius * (1 + breathe) * scale;

        // Core points glow
        const isCore = idx < 15;
        if (isCore) {
          ctx.shadowBlur = 8 + (isSpeaking ? 6 : 0) + (isListening ? 8 : 0);
          ctx.shadowColor = '#ff2b2b';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset shadow blur
      ctx.shadowBlur = 0;

      // Draw central energy core (glowing orb)
      const coreRadius = 14 * centerPulse * ttsCorePulse;
      const coreGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        2,
        centerX,
        centerY,
        coreRadius
      );
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.3, '#ff2b2b');
      coreGradient.addColorStop(1, 'rgba(122, 0, 0, 0)');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Outer revolving orbits representing processing states
      if (isSpeaking || isListening) {
        ctx.strokeStyle = 'rgba(255, 43, 43, 0.15)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 60 * scaleFactor(), 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 43, 43, 0.08)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 100 * scaleFactor(), 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const scaleFactor = () => {
      return 1.0 + Math.sin(Date.now() * 0.003) * 0.05 + (isListening ? 0.1 : 0);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, isSpeaking]);

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-0">
      <canvas ref={canvasRef} className="w-full h-full max-w-[650px] max-h-[650px] opacity-80" />
    </div>
  );
}
