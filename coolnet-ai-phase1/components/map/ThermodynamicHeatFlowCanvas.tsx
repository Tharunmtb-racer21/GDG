"use client";

import React, { useEffect, useRef } from "react";

export function ThermodynamicHeatFlowCanvas({ isActive }: { isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    // Create Thermodynamic Heat Flux Streamline Particles
    const PARTICLE_COUNT = 65;
    const particles = Array.from({ length: PARTICLE_COUNT }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.8 + height * 0.2, // Originating from warmer south/central
      length: Math.random() * 40 + 20,
      speed: Math.random() * 1.5 + 0.8,
      angle: -Math.PI / 2 + (Math.random() * 0.4 - 0.2), // Flowing northwards
      size: Math.random() * 2.5 + 1.2,
      opacity: Math.random() * 0.6 + 0.3,
      hue: Math.random() < 0.7 ? 15 : 40, // Warm orange/red hues
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(p.y * 0.02) * 0.8;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        const gradient = ctx.createLinearGradient(
          p.x,
          p.y,
          p.x + Math.cos(p.angle) * p.length,
          p.y + Math.sin(p.angle) * p.length
        );

        gradient.addColorStop(0, `hsla(${p.hue}, 100%, 55%, ${p.opacity})`);
        gradient.addColorStop(1, `hsla(${p.hue + 20}, 100%, 50%, 0)`);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(p.angle) * p.length, p.y + Math.sin(p.angle) * p.length);
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-70 mix-blend-screen"
    />
  );
}
