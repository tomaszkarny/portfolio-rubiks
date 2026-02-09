"use client";

import { motion } from "framer-motion";
import { accent, useReducedMotion } from "./shared";
import { blobVariants } from "./sketchBlobData";
import type { BlobVariant } from "./sketchBlobData";

interface SketchBlobProps {
  id: string;
  variant: BlobVariant;
  isHovered: boolean;
}

export function SketchBlob({ id, variant, isHovered }: SketchBlobProps) {
  const prefersReducedMotion = useReducedMotion();
  const data = blobVariants[variant];

  const filterId = `${id}-wobble`;

  // Reduced motion: simple opacity crossfade with static shapes
  if (prefersReducedMotion) {
    return (
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 380 260"
        preserveAspectRatio="xMidYMid slice"
        style={{
          opacity: isHovered ? 0.6 : 0,
          transition: "opacity 400ms ease",
        }}
      >
        <path
          d={data.primary}
          fill="none"
          stroke={accent(0.35)}
          strokeWidth={data.primaryStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={data.secondary}
          fill="none"
          stroke={accent(0.18)}
          strokeWidth={data.secondaryStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 380 260"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Wobble filter for organic displacement */}
      <defs>
        <filter id={filterId}>
          <feTurbulence
            type="turbulence"
            baseFrequency="0.04"
            numOctaves={4}
            seed={data.filterSeed}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* Layer 1: Primary flowing stroke */}
      <motion.path
        d={data.primary}
        fill="none"
        stroke={accent(0.35)}
        strokeWidth={data.primaryStrokeWidth}
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
                pathLength: { duration: 1.0, ease: "easeInOut" },
                opacity: { duration: 0.3 },
              }
            : {
                pathLength: { duration: 0.4, ease: "easeIn" },
                opacity: { duration: 0.4, ease: "easeIn" },
              }
        }
      />

      {/* Layer 2: Secondary flowing stroke (delayed) */}
      <motion.path
        d={data.secondary}
        fill="none"
        stroke={accent(0.18)}
        strokeWidth={data.secondaryStrokeWidth}
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
                  delay: 0.3,
                },
                opacity: { duration: 0.3, delay: 0.3 },
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
