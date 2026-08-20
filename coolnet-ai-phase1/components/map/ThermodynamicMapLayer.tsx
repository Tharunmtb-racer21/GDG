"use client";

import React, { useEffect, useRef, useState } from "react";

export interface ThermodynamicMapLayerProps {
  isActive: boolean;
  showSurfaceMesh?: boolean;
  showStreamlines?: boolean;
}

// Regional Thermal Control Knots across India [lat, lon, baselineLST_temp]
const THERMAL_KNOTS: { lat: number; lon: number; temp: number; name: string }[] = [
  { lat: 26.9124, lon: 75.7873, temp: 42.5, name: "Rajasthan Arid Core" },
  { lat: 23.0225, lon: 72.5714, temp: 41.0, name: "Gujarat Heat Dome" },
  { lat: 21.1458, lon: 79.0882, temp: 40.2, name: "Nagpur Vidarbha Core" },
  { lat: 26.8467, lon: 80.9462, temp: 38.5, name: "Gangetic Plain UP" },
  { lat: 28.6139, lon: 77.2090, temp: 39.8, name: "Delhi NCR Thermal Island" },
  { lat: 17.3850, lon: 78.4867, temp: 37.6, name: "Deccan Plateau Telangana" },
  { lat: 13.0827, lon: 80.2707, temp: 36.8, name: "Coromandel Coast Chennai" },
  { lat: 11.0168, lon: 76.9558, temp: 35.4, name: "Coimbatore Gap" },
  { lat: 19.0760, lon: 72.8777, temp: 34.5, name: "Konkan Coast Mumbai" },
  { lat: 22.5726, lon: 88.3639, temp: 36.2, name: "Bengal Delta Kolkata" },
  { lat: 12.9716, lon: 77.5946, temp: 31.5, name: "Bengaluru Uplands" },
  { lat: 31.1048, lon: 77.1734, temp: 18.2, name: "Himachal Foot-hills" },
  { lat: 34.0837, lon: 74.7973, temp: 4.5, name: "Kashmir Himalayan Sink" },
  { lat: 34.1526, lon: 77.5771, temp: -2.0, name: "Ladakh Cold Sink" },
  { lat: 27.5330, lon: 88.5122, temp: 8.4, name: "Sikkim Eastern Himalaya" },
  { lat: 26.1584, lon: 91.7783, temp: 24.5, name: "Assam Brahmaputra Valley" },
];

// Exact WRI India / ECMWF ERA5 Thermal Color Ramp Helper
export function getWRITemperatureColor(temp: number): string {
  if (temp < 5) return "#1e3a8a"; // Alpine / Cold Sink (< 5°C) -> Deep Blue
  if (temp < 12) return "#3b82f6"; // Cold Zone (5°C - 11°C) -> Sky Blue
  if (temp < 20) return "#93c5fd"; // Moderate Zone (12°C - 19°C) -> Light Cyan
  if (temp < 24) return "#fef08a"; // Transition Zone (20°C - 23°C) -> Soft Yellow
  if (temp < 27) return "#fde047"; // Elevated Heat (24°C - 26°C) -> Yellow
  if (temp < 30) return "#f97316"; // High LST (27°C - 29°C) -> Bright Orange
  if (temp < 33) return "#ea580c"; // Severe LST (30°C - 32°C) -> Vivid Orange-Red
  if (temp < 38) return "#dc2626"; // Extreme LST (33°C - 37°C) -> Bright Red
  return "#7f1d1d"; // Severe Thermal Core (> 38°C) -> Deep Blood Crimson
}

export function ThermodynamicMapLayer({
  isActive,
  showSurfaceMesh = true,
  showStreamlines = true,
}: ThermodynamicMapLayerProps) {
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

    // Map latitude/longitude to canvas 2D screen coordinates (India Viewport Approximation)
    const latToY = (lat: number) => {
      // Lat range: 6°N (bottom) to 37°N (top)
      const pct = (37.0 - lat) / (37.0 - 6.0);
      return pct * height * 0.85 + height * 0.08;
    };

    const lonToX = (lon: number) => {
      // Lon range: 68°E (left) to 98°E (right)
      const pct = (lon - 68.0) / (98.0 - 68.0);
      return pct * width * 0.82 + width * 0.09;
    };

    // Calculate Scalar Temperature Field at screen position (x, y) using Inverse Distance Weighting (IDW)
    const sampleTemperatureField = (x: number, y: number): { temp: number; dx: number; dy: number } => {
      let weightSum = 0;
      let tempSum = 0;
      let gradX = 0;
      let gradY = 0;

      const pX = 0.005; // Spatial gradient delta
      const pY = 0.005;

      for (const knot of THERMAL_KNOTS) {
        const kX = lonToX(knot.lon);
        const kY = latToY(knot.lat);
        const distSq = (x - kX) * (x - kX) + (y - kY) * (y - kY) + 100; // Avoid divide-by-zero
        const w = 1 / Math.pow(distSq, 1.25);

        weightSum += w;
        tempSum += knot.temp * w;

        // Vector gradient force components (high temperature pushes away)
        const dX = x - kX;
        const dY = y - kY;
        gradX += dX * w * (knot.temp / 35);
        gradY += dY * w * (knot.temp / 35);
      }

      const temp = weightSum > 0 ? tempSum / weightSum : 28.0;
      return { temp, dx: gradX, dy: gradY };
    };

    // Initialize 2,000 Continuous Thermodynamic Streamline Particles
    const STREAMLINE_COUNT = 2000;
    interface StreamlineParticle {
      x: number;
      y: number;
      speed: number;
      life: number;
      maxLife: number;
      temp: number;
    }

    const particles: StreamlineParticle[] = Array.from({ length: STREAMLINE_COUNT }).map(() => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const field = sampleTemperatureField(x, y);
      return {
        x,
        y,
        speed: Math.random() * 1.8 + 0.8,
        life: Math.random() * 120,
        maxLife: Math.random() * 140 + 60,
        temp: field.temp,
      };
    });

    // Generate Background IDW Raster Heat Mesh (Offscreen Texture Buffer)
    const offscreen = document.createElement("canvas");
    offscreen.width = Math.floor(width / 6); // Downsampled for smooth 60fps performance
    offscreen.height = Math.floor(height / 6);
    const offCtx = offscreen.getContext("2d");

    if (offCtx && showSurfaceMesh) {
      const imgData = offCtx.createImageData(offscreen.width, offscreen.height);
      const data = imgData.data;

      for (let py = 0; py < offscreen.height; py++) {
        for (let px = 0; px < offscreen.width; px++) {
          const screenX = (px / offscreen.width) * width;
          const screenY = (py / offscreen.height) * height;

          const { temp } = sampleTemperatureField(screenX, screenY);
          const colorHex = getWRITemperatureColor(temp);

          // Convert HEX to RGB
          const r = parseInt(colorHex.substring(1, 3), 16);
          const g = parseInt(colorHex.substring(3, 5), 16);
          const b = parseInt(colorHex.substring(5, 7), 16);

          const idx = (py * offscreen.width + px) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 160; // 0.62 Opacity
        }
      }
      offCtx.putImageData(imgData, 0, 0);
    }

    // MAIN ANIMATION RENDER LOOP
    const render = () => {
      // Subtle background trail clearing for smooth streamline motion trails
      ctx.fillStyle = "rgba(2, 6, 23, 0.15)";
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Interpolated Background Surface Mesh
      if (showSurfaceMesh && offscreen) {
        ctx.globalAlpha = 0.55;
        ctx.drawImage(offscreen, 0, 0, width, height);
        ctx.globalAlpha = 1.0;
      }

      // 2. Draw Thermodynamic Streamline Particles (Vector Flow along Heat Gradients)
      if (showStreamlines) {
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const field = sampleTemperatureField(p.x, p.y);
          p.temp = field.temp;

          // Velocity vector: angle follows thermal pressure gradient tangents with subtle fluid swirl
          const flowAngle =
            Math.atan2(field.dy, field.dx) + Math.sin(p.x * 0.012 + p.y * 0.012) * 0.35;

          // Speed accelerates in high-heat core regions (> 35°C)
          const accel = 1.0 + Math.max(0, (field.temp - 25) / 18);
          const stepSpeed = p.speed * accel;

          const nextX = p.x + Math.cos(flowAngle) * stepSpeed * 2.2;
          const nextY = p.y + Math.sin(flowAngle) * stepSpeed * 2.2;

          // Render glowing line segment matching local temperature color
          ctx.beginPath();
          ctx.strokeStyle = getWRITemperatureColor(field.temp);
          ctx.globalAlpha = Math.min(1.0, (1 - p.life / p.maxLife) * 0.85);
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nextX, nextY);
          ctx.stroke();

          // Advance particle position & lifecycle
          p.x = nextX;
          p.y = nextY;
          p.life += 1;

          // Reset particle when life expires or strays offscreen
          if (p.life >= p.maxLife || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.life = 0;
            p.maxLife = Math.random() * 120 + 60;
          }
        }
        ctx.globalAlpha = 1.0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isActive, showSurfaceMesh, showStreamlines]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full mix-blend-screen opacity-90"
    />
  );
}
