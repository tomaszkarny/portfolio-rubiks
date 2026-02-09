"use client";

import { motion } from "framer-motion";
import { NoiseOverlay, accent, useReducedMotion } from "./shared";
import type { ThumbnailProps } from "./shared";

// ── Sine wave equation ─────────────────────────────────────────────────────────
function sinePath(
  amplitude: number,
  frequency: number,
  phase: number,
  yCenter: number,
  width = 400
): string {
  const points: string[] = [];
  const steps = 100;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y = yCenter + amplitude * Math.sin(frequency * (x / width) * 2 * Math.PI + phase);
    points.push(`${i === 0 ? "M" : "L"} ${x} ${y}`);
  }

  return points.join(" ");
}

// ── Calculate particle position on sine wave ───────────────────────────────────
function particleOnWave(
  x: number,
  amplitude: number,
  frequency: number,
  phase: number,
  yCenter: number,
  width = 400
): { x: number; y: number } {
  const xNormalized = x / width;
  const y = yCenter + amplitude * Math.sin(frequency * xNormalized * 2 * Math.PI + phase);
  return { x: xNormalized * 100, y: (y / 200) * 100 };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ParticleConstellationThumbnail(props: ThumbnailProps) {
  const prefersReducedMotion = useReducedMotion();

  // ── Wave configurations ──────────────────────────────────────────────────────
  const waves = [
    { amplitude: 25, frequency: 1.5, phase: 0, yCenter: 80, color: accent(0.08) },
    { amplitude: 35, frequency: 1, phase: Math.PI / 3, yCenter: 110, color: accent(0.08) },
    { amplitude: 20, frequency: 2, phase: Math.PI / 2, yCenter: 140, color: accent(0.08) },
  ];

  // ── Generate particles along waves ───────────────────────────────────────────
  const particles: Array<{
    x: number;
    y: number;
    size: number;
    opacity: number;
    bright: boolean;
  }> = [];

  // Deterministic pseudo-random for consistent SSR/client renders
  const seeded = (i: number) => ((i * 9301 + 49297) % 233280) / 233280;

  // Wave 1: 10 particles
  for (let i = 0; i < 10; i++) {
    const xPos = (i / 9) * 400;
    const pos = particleOnWave(xPos, waves[0].amplitude, waves[0].frequency, waves[0].phase, waves[0].yCenter);
    particles.push({
      x: pos.x,
      y: pos.y,
      size: 2.5,
      opacity: 0.15 + seeded(i) * 0.1,
      bright: false,
    });
  }

  // Wave 2: 9 particles
  for (let i = 0; i < 9; i++) {
    const xPos = (i / 8) * 400;
    const pos = particleOnWave(xPos, waves[1].amplitude, waves[1].frequency, waves[1].phase, waves[1].yCenter);
    particles.push({
      x: pos.x,
      y: pos.y,
      size: 2,
      opacity: 0.18 + seeded(i + 10) * 0.07,
      bright: false,
    });
  }

  // Wave 3: 10 particles
  for (let i = 0; i < 10; i++) {
    const xPos = (i / 9) * 400;
    const pos = particleOnWave(xPos, waves[2].amplitude, waves[2].frequency, waves[2].phase, waves[2].yCenter);
    particles.push({
      x: pos.x,
      y: pos.y,
      size: 2.5,
      opacity: 0.2 + seeded(i + 20) * 0.05,
      bright: false,
    });
  }

  // ── Select bright particles ──────────────────────────────────────────────────
  const brightIndices = [3, 12, 18, 24, 27];
  const brightParticles = brightIndices.map((idx) => {
    const particle = particles[idx];
    particle.bright = true;
    particle.opacity = 0.5 + seeded(idx + 30) * 0.1;
    particle.size = 3;
    return { ...particle, idx };
  });

  // ── Frequency bars ───────────────────────────────────────────────────────────
  const frequencyBars = [
    { height: 8, opacity: 0.15 },
    { height: 14, opacity: 0.25 },
    { height: 6, opacity: 0.18 },
    { height: 18, opacity: 0.35 },
    { height: 10, opacity: 0.22 },
    { height: 12, opacity: 0.28 },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Radial glow hotspot */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          left: "25%",
          top: "40%",
          width: 150,
          height: 150,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${accent(0.12)} 0%, transparent 70%)`,
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      {/* Sine wave guide curves */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        style={{ pointerEvents: "none" }}
      >
        {waves.map((wave, idx) => (
          <path
            key={`wave-${idx}`}
            d={sinePath(wave.amplitude, wave.frequency, wave.phase, wave.yCenter)}
            stroke={wave.color}
            fill="none"
            strokeWidth={0.5}
          />
        ))}
      </svg>

      {/* Connection lines between bright particles */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      >
        {brightParticles.map((p1, i) => {
          if (i === brightParticles.length - 1) return null;
          const p2 = brightParticles[i + 1];
          return (
            <line
              key={`connection-${i}`}
              x1={`${p1.x}%`}
              y1={`${p1.y}%`}
              x2={`${p2.x}%`}
              y2={`${p2.y}%`}
              stroke={accent(0.1)}
              strokeWidth={0.5}
            />
          );
        })}
      </svg>

      {/* Dim particles */}
      {particles.map((particle, idx) => {
        if (particle.bright) return null;
        return (
          <div
            aria-hidden="true"
            key={`particle-${idx}`}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: accent(particle.opacity),
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Bright animated particles */}
      {brightParticles.map((particle, idx) => {
        const durations = [3, 4.5, 5.5, 6, 4];
        const duration = durations[idx] || 4;

        const sharedStyle = {
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size,
          height: particle.size,
          backgroundColor: accent(particle.opacity),
          boxShadow: `0 0 8px ${accent(0.3)}`,
          pointerEvents: "none" as const,
        };

        if (prefersReducedMotion) {
          return (
            <div
              aria-hidden="true"
              key={`bright-particle-${particle.idx}`}
              className="absolute rounded-full"
              style={sharedStyle}
            />
          );
        }

        return (
          <motion.div
            aria-hidden="true"
            key={`bright-particle-${particle.idx}`}
            className="absolute rounded-full"
            style={sharedStyle}
            animate={{
              x: [-3, 3, -3],
              y: [-2, 2, -2],
            }}
            transition={{
              duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Frequency bars in bottom-left */}
      <div
        aria-hidden="true"
        className="absolute flex items-end gap-1"
        style={{
          left: 16,
          bottom: 16,
          pointerEvents: "none",
        }}
      >
        {frequencyBars.map((bar, idx) => (
          <div
            key={`bar-${idx}`}
            style={{
              width: 2,
              height: bar.height,
              backgroundColor: accent(bar.opacity),
            }}
          />
        ))}
      </div>

      {/* Noise overlay */}
      <NoiseOverlay id="noise-02" />
    </div>
  );
}
