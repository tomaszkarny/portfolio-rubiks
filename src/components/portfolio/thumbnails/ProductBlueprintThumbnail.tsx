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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ProductBlueprintThumbnail(props: ThumbnailProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Centering Frame */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          top: "18%",
          left: "18%",
          right: "18%",
          bottom: "18%",
          border: `1px solid ${accent(0.12)}`,
        }}
      />

      {/* Registration Marks - Top Left */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          top: "18%",
          left: "18%",
          width: "10px",
          height: "1px",
          backgroundColor: accent(0.2),
          transform: "translate(-11px, 0)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          top: "18%",
          left: "18%",
          width: "1px",
          height: "10px",
          backgroundColor: accent(0.2),
          transform: "translate(0, -11px)",
        }}
      />

      {/* Registration Marks - Top Right */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          top: "18%",
          right: "18%",
          width: "10px",
          height: "1px",
          backgroundColor: accent(0.2),
          transform: "translate(11px, 0)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          top: "18%",
          right: "18%",
          width: "1px",
          height: "10px",
          backgroundColor: accent(0.2),
          transform: "translate(0, -11px)",
        }}
      />

      {/* Registration Marks - Bottom Left */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          bottom: "18%",
          left: "18%",
          width: "10px",
          height: "1px",
          backgroundColor: accent(0.2),
          transform: "translate(-11px, 0)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          bottom: "18%",
          left: "18%",
          width: "1px",
          height: "10px",
          backgroundColor: accent(0.2),
          transform: "translate(0, 11px)",
        }}
      />

      {/* Registration Marks - Bottom Right */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          bottom: "18%",
          right: "18%",
          width: "10px",
          height: "1px",
          backgroundColor: accent(0.2),
          transform: "translate(11px, 0)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          bottom: "18%",
          right: "18%",
          width: "1px",
          height: "10px",
          backgroundColor: accent(0.2),
          transform: "translate(0, 11px)",
        }}
      />

      {/* Product Silhouette and Material Swatches - SVG Container */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Product Silhouette - Abstract Bottle Shape */}
        <path
          d="M 55 60 L 55 55 Q 55 50 60 50 L 75 50 Q 80 50 80 55 L 80 60 L 82 65 Q 85 70 85 80 L 85 130 Q 85 140 75 140 L 60 140 Q 50 140 50 130 L 50 80 Q 50 70 53 65 Z"
          stroke={accent(0.25)}
          strokeWidth="1"
          strokeDasharray="4 3"
          fill="none"
        />

        {/* Connection Lines */}
        <line
          x1="85"
          y1="75"
          x2="130"
          y2="65"
          stroke={accent(0.1)}
          strokeWidth="1"
        />
        <line
          x1="85"
          y1="100"
          x2="130"
          y2="100"
          stroke={accent(0.1)}
          strokeWidth="1"
        />
        <line
          x1="85"
          y1="125"
          x2="130"
          y2="135"
          stroke={accent(0.1)}
          strokeWidth="1"
        />

        {/* Material Swatch 1 (Top) */}
        <circle
          cx="140"
          cy="65"
          r="9"
          fill={accent(0.06)}
          stroke={accent(0.2)}
          strokeWidth="1"
        />

        {/* Material Swatch 2 (Middle - Selected) */}
        <g>
          {/* Outer Ring with Pulse */}
          {prefersReducedMotion ? (
            <circle
              cx="140"
              cy="100"
              r="12"
              fill="none"
              stroke={accent(0.5)}
              strokeWidth="1"
              opacity={0.55}
            />
          ) : (
            <motion.circle
              cx="140"
              cy="100"
              r="12"
              fill="none"
              stroke={accent(0.5)}
              strokeWidth="1"
              animate={{
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          {/* Inner Circle */}
          <circle
            cx="140"
            cy="100"
            r="9"
            fill={accent(0.1)}
            stroke={accent(0.2)}
            strokeWidth="1"
          />
        </g>

        {/* Material Swatch 3 (Bottom) */}
        <circle
          cx="140"
          cy="135"
          r="9"
          fill={accent(0.06)}
          stroke={accent(0.2)}
          strokeWidth="1"
        />
      </svg>

      {/* Annotation Text */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, 45%)",
        }}
      >
        {/* Small horizontal line above text */}
        <div
          className="mx-auto mb-1"
          style={{
            width: "20px",
            height: "1px",
            backgroundColor: accent(0.2),
          }}
        />
        <div
          style={{
            fontSize: "9px",
            fontFamily: sketchFont,
            color: accent(0.3),
            textAlign: "center",
            letterSpacing: "0.5px",
          }}
        >
          MAT-01
        </div>
      </div>

      {/* Noise Overlay */}
      <NoiseOverlay id="noise-03" />

      {/* Shimmer Line */}
      <ShimmerLine direction="diagonal" duration={10} opacity={0.10} />
    </div>
  );
}
