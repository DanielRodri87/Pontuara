"use client";

import { useEffect, useRef } from 'react';
import styles from './ParticleBackground.module.css';

/**
 * Componente de fundo animado utilizando partículas em um canvas HTML5.
 * Renderiza pontos flutuantes com interatividade com o mouse e conexões
 * quando próximos uns dos outros.
 * 
 * @returns {JSX.Element} Fundo com efeito de partículas.
 */
export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    const mouse = { x: null as number | null, y: null as number | null };

    const PARTICLE_COUNT = 80;
    const CONNECTION_DISTANCE = 130;
    const MOUSE_REPEL_RADIUS = 150;
    const PARTICLE_COLOR = '71, 85, 105';   // #475569
    const LINE_COLOR = '31, 79, 204';        // #1f4fcc

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => { mouse.x = null; mouse.y = null; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2; // Velocidade base extremamente lenta
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: vx,
        vy: vy,
        baseVx: vx,
        baseVy: vy,
        radius: Math.random() * 2 + 1.5,
      };
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // Interação com mouse fluida (afeta a velocidade)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_REPEL_RADIUS && dist > 0) {
            const force = (MOUSE_REPEL_RADIUS - dist) / MOUSE_REPEL_RADIUS;
            p.vx += (dx / dist) * force * 0.4;
            p.vy += (dy / dist) * force * 0.4;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Damping: retorna suavemente para a velocidade base
        p.vx = p.vx * 0.95 + p.baseVx * 0.05;
        p.vy = p.vy * 0.95 + p.baseVy * 0.05;

        // Quicar nas bordas
        if (p.x < 0 || p.x > canvas.width) {
          p.vx *= -1;
          p.baseVx *= -1;
        }
        if (p.y < 0 || p.y > canvas.height) {
          p.vy *= -1;
          p.baseVy *= -1;
        }
        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));

        // Desenhar partícula
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PARTICLE_COLOR}, 0.2)`;
        ctx.fill();
      }

      // Desenhar conexões
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${LINE_COLOR}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.particleCanvas} />;
}
