"use client";

import { motion, useReducedMotion } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ThumbnailProps {
  featured?: boolean;
}

// Re-export for use in thumbnail components
export { useReducedMotion };

// ── Sepia color palette (moved from WorkSection.tsx) ───────────────────────────

export const sepiaColors = {
  border: "rgba(45, 42, 38, 0.15)",
  glow: "0 4px 24px rgba(45, 42, 38, 0.08)",
  hoverGlow: "0 8px 32px rgba(45, 42, 38, 0.15)",
  number: "#635d56",
  gradient:
    "linear-gradient(135deg, rgba(45, 42, 38, 0.04) 0%, rgba(45, 42, 38, 0.01) 100%)",
  tagBg: "rgba(45, 42, 38, 0.1)",
  tagText: "#4a4540",
  tagBorder: "rgba(45, 42, 38, 0.15)",
};

// ── Shared thumbnail accent ────────────────────────────────────────────────────

export const accent = (opacity: number) => `rgba(184, 92, 56, ${opacity})`;

// ── Font shorthand ─────────────────────────────────────────────────────────────

export const sketchFont =
  'var(--font-space-grotesk, "Space Grotesk"), system-ui, sans-serif';

// ── NoiseOverlay ───────────────────────────────────────────────────────────────
// SVG feTurbulence overlay. Each thumbnail must pass a unique `id` to avoid
// filter-ID collisions in the DOM.

export function NoiseOverlay({ id }: { id: string }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ mixBlendMode: "overlay", opacity: 0.35 }}
    >
      <filter id={id}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves={3}
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}

// ── ShimmerLine ────────────────────────────────────────────────────────────────
// A thin gradient sweep that translates across the thumbnail.
// `direction` controls the axis: "horizontal" sweeps left→right,
// "diagonal" sweeps top-left → bottom-right.

export function ShimmerLine({
  direction = "horizontal",
  duration = 8,
  opacity = 0.08,
}: {
  direction?: "horizontal" | "diagonal";
  duration?: number;
  opacity?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const isHorizontal = direction === "horizontal";

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background: isHorizontal
          ? `linear-gradient(90deg, transparent 0%, ${accent(opacity)} 50%, transparent 100%)`
          : `linear-gradient(135deg, transparent 0%, ${accent(opacity)} 50%, transparent 100%)`,
        backgroundSize: isHorizontal ? "200% 100%" : "200% 200%",
      }}
      animate={{
        backgroundPosition: isHorizontal
          ? ["200% 0%", "-200% 0%"]
          : ["200% 200%", "-200% -200%"],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}
