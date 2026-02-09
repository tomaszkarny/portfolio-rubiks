"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "./shared";
import { scribbleFillVariants } from "./scribbleFillData";
import type { ScribbleFillVariant } from "./scribbleFillData";

interface ScribbleFillProps {
  id: string;
  variant: ScribbleFillVariant;
  isHovered: boolean;
  accentColor: string;
}

export function ScribbleFill({
  id,
  variant,
  isHovered,
  accentColor,
}: ScribbleFillProps) {
  const prefersReducedMotion = useReducedMotion();
  const data = scribbleFillVariants[variant];
  const filterId = `${id}-scribble-wobble`;

  if (prefersReducedMotion) {
    return (
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full z-[5]"
        viewBox="0 0 500 550"
        preserveAspectRatio="xMidYMid slice"
        style={{
          opacity: isHovered ? 0.85 : 0,
          transition: "opacity 400ms ease",
        }}
      >
        <path
          d={data.fillPath}
          fill="none"
          stroke={accentColor}
          strokeWidth={data.fillStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={data.borderPath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={data.borderStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full z-[5]"
      viewBox="0 0 500 550"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id={filterId}>
          <feTurbulence
            type="turbulence"
            baseFrequency="0.03"
            numOctaves={3}
            seed={data.filterSeed}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* Layer 1: Border/outline path (draws first) */}
      <motion.path
        d={data.borderPath}
        fill="none"
        stroke="rgba(255, 255, 255, 0.12)"
        strokeWidth={data.borderStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${filterId})`}
        style={{ willChange: "stroke-dashoffset" }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={
          isHovered
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
        }
        transition={
          isHovered
            ? {
                pathLength: { duration: 0.6, ease: "easeInOut" },
                opacity: { duration: 0.2 },
              }
            : {
                pathLength: { duration: 0.4, ease: "easeIn" },
                opacity: { duration: 0.4, ease: "easeIn" },
              }
        }
      />

      {/* Layer 2: Fill path (colored, draws slightly after border) */}
      <motion.path
        d={data.fillPath}
        fill="none"
        stroke={accentColor}
        strokeWidth={data.fillStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${filterId})`}
        style={{ willChange: "stroke-dashoffset" }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={
          isHovered
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
        }
        transition={
          isHovered
            ? {
                pathLength: {
                  duration: 0.8,
                  ease: "easeInOut",
                  delay: 0.05,
                },
                opacity: { duration: 0.2, delay: 0.05 },
              }
            : {
                pathLength: { duration: 0.4, ease: "easeIn" },
                opacity: { duration: 0.4, ease: "easeIn" },
              }
        }
      />
    </svg>
  );
}
