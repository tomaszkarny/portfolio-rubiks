"use client";

import { motion } from "framer-motion";
import {
  NoiseOverlay,
  ShimmerLine,
  accent,
  sketchFont,
  useReducedMotion,
} from "./shared";
import type { ThumbnailProps } from "./shared";

// ── Isometric cube wireframe (small secondary element) ────────────────────────
// A tiny 3-axis isometric cube drawn at origin (0,0), sized ~28x32.
function IsoCubeSketch() {
  // Isometric cube vertices (front-face bottom-left at 0,28)
  const s = 14; // half-edge
  const dx = s * Math.cos(Math.PI / 6); // ~12.1
  const dy = s * Math.sin(Math.PI / 6); // 7

  const cx = 14;
  const cy = 16;

  const top = `${cx},${cy - s}`;
  const frontLeft = `${cx - dx},${cy - s + s + dy}`;
  const frontRight = `${cx + dx},${cy - s + s + dy}`;
  const bottom = `${cx},${cy - s + s + dy + dy}`;
  const backLeft = `${cx - dx},${cy - s + dy}`;
  const backRight = `${cx + dx},${cy - s + dy}`;

  return (
    <g>
      {/* back edges (dashed) */}
      <line
        x1={cx}
        y1={cy - s}
        x2={cx - dx}
        y2={cy - s + dy}
        stroke={accent(0.12)}
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      <line
        x1={cx}
        y1={cy - s}
        x2={cx + dx}
        y2={cy - s + dy}
        stroke={accent(0.12)}
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      <line
        x1={cx - dx}
        y1={cy - s + dy}
        x2={cx}
        y2={cy - s + 2 * dy}
        stroke={accent(0.12)}
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      <line
        x1={cx + dx}
        y1={cy - s + dy}
        x2={cx}
        y2={cy - s + 2 * dy}
        stroke={accent(0.12)}
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />

      {/* front edges (solid) */}
      <polyline
        points={`${backLeft} ${frontLeft} ${bottom} ${frontRight} ${backRight}`}
        fill="none"
        stroke={accent(0.2)}
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      {/* top edges */}
      <polyline
        points={`${backLeft} ${top} ${backRight}`}
        fill="none"
        stroke={accent(0.2)}
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      {/* vertical center */}
      <line
        x1={cx}
        y1={cy - s + 2 * dy}
        x2={cx}
        y2={cy - s + s + dy + dy}
        stroke={accent(0.2)}
        strokeWidth="0.7"
      />
      {/* connect front to top */}
      <line
        x1={cx - dx}
        y1={cy - s + s + dy}
        x2={cx - dx}
        y2={cy - s + dy}
        stroke={accent(0.2)}
        strokeWidth="0.7"
      />
      <line
        x1={cx + dx}
        y1={cy - s + s + dy}
        x2={cx + dx}
        y2={cy - s + dy}
        stroke={accent(0.2)}
        strokeWidth="0.7"
      />
    </g>
  );
}

// ── Dimension annotation lines (end-caps with connecting line) ─────────────
// Draws a horizontal or vertical dimension line between two points.
function DimensionLine({
  x1,
  y1,
  x2,
  y2,
  capSize = 3,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  capSize?: number;
}) {
  const isVertical = Math.abs(x2 - x1) < 1;

  return (
    <g>
      {/* Main line */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={accent(0.18)}
        strokeWidth="0.5"
      />
      {/* End caps */}
      {isVertical ? (
        <>
          <line
            x1={x1 - capSize}
            y1={y1}
            x2={x1 + capSize}
            y2={y1}
            stroke={accent(0.18)}
            strokeWidth="0.5"
          />
          <line
            x1={x2 - capSize}
            y1={y2}
            x2={x2 + capSize}
            y2={y2}
            stroke={accent(0.18)}
            strokeWidth="0.5"
          />
        </>
      ) : (
        <>
          <line
            x1={x1}
            y1={y1 - capSize}
            x2={x1}
            y2={y1 + capSize}
            stroke={accent(0.18)}
            strokeWidth="0.5"
          />
          <line
            x1={x2}
            y1={y2 - capSize}
            x2={x2}
            y2={y2 + capSize}
            stroke={accent(0.18)}
            strokeWidth="0.5"
          />
        </>
      )}
    </g>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CubeBlueprintThumbnail(props: ThumbnailProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Blueprint grid with radial fade */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        style={{
          transform: "rotate(2.5deg)",
          transformOrigin: "center",
        }}
      >
        <defs>
          {/* Grid pattern */}
          <pattern
            id="cube-bp-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke={accent(0.06)}
              strokeWidth="0.5"
            />
          </pattern>

          {/* Radial fade mask */}
          <radialGradient id="cube-bp-grid-fade">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="60%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          <mask id="cube-bp-grid-mask">
            <rect
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
              fill="url(#cube-bp-grid-fade)"
            />
          </mask>
        </defs>

        <rect
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          fill="url(#cube-bp-grid)"
          mask="url(#cube-bp-grid-mask)"
        />
      </svg>

      {/* Construction/projection lines (3 lines, bumped opacity) */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          left: "10%",
          top: "20%",
          width: "120%",
          height: "1px",
          background: accent(0.15),
          transform: "rotate(-30deg)",
          transformOrigin: "left center",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          left: "-10%",
          top: "60%",
          width: "130%",
          height: "1px",
          background: accent(0.15),
          transform: "rotate(15deg)",
          transformOrigin: "left center",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          left: "20%",
          top: "35%",
          width: "100%",
          height: "1px",
          background: accent(0.15),
          transform: "rotate(-55deg)",
          transformOrigin: "left center",
        }}
      />

      {/* Unfolded cube cross/T-shape — scales with container via viewBox */}
      <svg
        aria-hidden="true"
        viewBox="0 0 170 140"
        className="absolute"
        style={{
          left: "50%",
          top: "48%",
          transform: "translate(-50%, -50%)",
          width: "60%",
          maxWidth: "220px",
        }}
      >
        {/* Cube cross — repositioned: top-left of cross at (43, 0) */}
        {/* Top face */}
        <rect
          x="56"
          y="0"
          width="28"
          height="28"
          fill="transparent"
          stroke={accent(0.2)}
          strokeWidth="1"
        />
        {/* Dotted fold line between top and center */}
        <line
          x1="56"
          y1="28"
          x2="84"
          y2="28"
          stroke={accent(0.12)}
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />

        {/* Left face */}
        <rect
          x="0"
          y="28"
          width="28"
          height="28"
          fill="transparent"
          stroke={accent(0.2)}
          strokeWidth="1"
        />
        {/* Dotted fold line between left and center */}
        <line
          x1="28"
          y1="28"
          x2="28"
          y2="56"
          stroke={accent(0.12)}
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />

        {/* Left-center face */}
        <rect
          x="28"
          y="28"
          width="28"
          height="28"
          fill="transparent"
          stroke={accent(0.2)}
          strokeWidth="1"
        />

        {/* Center face (active with pulse) */}
        {prefersReducedMotion ? (
          <rect
            x="56"
            y="28"
            width="28"
            height="28"
            fill={accent(0.17)}
            stroke={accent(0.35)}
            strokeWidth="1"
          />
        ) : (
          <motion.rect
            x="56"
            y="28"
            width="28"
            height="28"
            fill={accent(0.12)}
            stroke={accent(0.35)}
            strokeWidth="1"
            animate={{
              fillOpacity: [0.12, 0.22, 0.12],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Dotted fold line between center and right */}
        <line
          x1="84"
          y1="28"
          x2="84"
          y2="56"
          stroke={accent(0.12)}
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />

        {/* Right face */}
        <rect
          x="84"
          y="28"
          width="28"
          height="28"
          fill="transparent"
          stroke={accent(0.2)}
          strokeWidth="1"
        />

        {/* Dotted fold line between center and bottom */}
        <line
          x1="56"
          y1="56"
          x2="84"
          y2="56"
          stroke={accent(0.12)}
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />

        {/* Bottom face */}
        <rect
          x="56"
          y="56"
          width="28"
          height="28"
          fill="transparent"
          stroke={accent(0.2)}
          strokeWidth="1"
        />

        {/* Dotted fold line between bottom faces */}
        <line
          x1="56"
          y1="84"
          x2="84"
          y2="84"
          stroke={accent(0.12)}
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />

        {/* Extra face (below bottom) */}
        <rect
          x="56"
          y="84"
          width="28"
          height="28"
          fill="transparent"
          stroke={accent(0.2)}
          strokeWidth="1"
        />

        {/* Dimension annotation lines */}
        {/* Vertical dimension — right side of cross */}
        <DimensionLine x1={120} y1={0} x2={120} y2={112} capSize={3} />
        {/* Horizontal dimension — bottom of cross */}
        <DimensionLine x1={0} y1={124} x2={112} y2={124} capSize={3} />

        {/* Small isometric cube wireframe in bottom-left */}
        <g transform="translate(132, 80)">
          <IsoCubeSketch />
        </g>
      </svg>

      {/* Dimension annotations — percentage-based positioning */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          left: "72%",
          top: "46%",
          fontFamily: sketchFont,
          fontSize: "10px",
          color: accent(0.45),
          letterSpacing: "0.5px",
        }}
      >
        3x3x3
      </div>

      {/* Tick marks */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          left: "28%",
          top: "35%",
          width: "6px",
          height: "1px",
          background: accent(0.3),
        }}
      />
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          left: "28%",
          top: "62%",
          width: "6px",
          height: "1px",
          background: accent(0.3),
        }}
      />
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          left: "58%",
          top: "72%",
          width: "1px",
          height: "6px",
          background: accent(0.3),
        }}
      />

      {/* Scroll indicator - double chevron */}
      <svg
        aria-hidden="true"
        className="absolute"
        style={{
          right: "12px",
          bottom: "12px",
          width: "12px",
          height: "16px",
        }}
      >
        <polyline
          points="2,4 6,8 10,4"
          fill="none"
          stroke={accent(0.25)}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="2,10 6,14 10,10"
          fill="none"
          stroke={accent(0.25)}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Noise overlay */}
      <NoiseOverlay id="noise-01" />

      {/* Shimmer line */}
      <ShimmerLine direction="horizontal" duration={8} opacity={0.06} />
    </div>
  );
}
