"use client";

/**
 * Ambient background: slow crimson/rose gradient blooms plus a light drifting
 * particle field. Pure CSS transforms and a throttled canvas keep it cheap,
 * and it disables itself for users who prefer reduced motion.
 */
import { useEffect, useRef } from "react";

const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  hue: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Particle count scales with viewport area, capped for weak devices.
      const count = Math.min(70, Math.round((width * height) / 26000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(Math.random() * 0.22 + 0.05),
        a: Math.random() * 0.4 + 0.1,
        hue: Math.random() > 0.65 ? 350 : 28, // rose or gold
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grd.addColorStop(0, `hsla(${p.hue}, 60%, 78%, ${p.a})`);
        grd.addColorStop(1, "hsla(0, 0%, 0%, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    build();
    draw();
    window.addEventListener("resize", build);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-900">
      {/* Base vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#1a0508_0%,#0b0b0b_55%,#060606_100%)]" />
      {/* Slow crimson blooms */}
      <div className="absolute -left-40 top-[10%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(139,0,0,0.30),transparent_65%)] blur-3xl animate-float-slow" />
      <div
        className="absolute -right-52 top-[45%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.16),transparent_65%)] blur-3xl animate-shimmer"
        style={{ animationDelay: "-3s" }}
      />
      <div
        className="absolute bottom-[-12rem] left-1/3 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(212,175,122,0.10),transparent_65%)] blur-3xl animate-float-slow"
        style={{ animationDelay: "-8s" }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-70" />
      {/* Fine grain keeps the large black areas from banding on OLED screens */}
      <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: GRAIN_URL }} />
    </div>
  );
}
