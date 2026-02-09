"use client";

import { motion } from "framer-motion";
import { NoiseOverlay, accent, sketchFont, useReducedMotion } from "./shared";
import type { ThumbnailProps } from "./shared";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DashboardPanelThumbnail(props: ThumbnailProps) {
  const prefersReducedMotion = useReducedMotion();

  // Chart data points (x, y) - upward trending with realistic variance
  const chartPoints = [
    [10, 85],
    [50, 70],
    [90, 75],
    [130, 55],
    [170, 60],
    [210, 40],
    [250, 45],
    [290, 30],
    [330, 25],
    [370, 15],
  ];

  // Convert points array to SVG polyline string
  const polylinePoints = chartPoints.map((p) => p.join(",")).join(" ");

  // Create polygon points for area fill (chart points + bottom corners)
  const polygonPoints = [
    ...chartPoints,
    [370, 100], // bottom-right
    [10, 100], // bottom-left
  ]
    .map((p) => p.join(","))
    .join(" ");

  // Mini sparkline data for sidebar metrics
  const sparkline1 = "0,8 10,5 20,6 30,3 40,2";
  const sparkline2 = "0,4 10,7 20,5 30,2 40,4";
  const sparkline3 = "0,10 10,6 20,7 30,4 40,1";

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Panel grid layout */}
      {/* Vertical divider at 70% */}
      <div
        aria-hidden="true"
        className="absolute left-[70%] top-0 h-full w-[1px]"
        style={{ backgroundColor: accent(0.1) }}
      />
      {/* Horizontal divider at 15% */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-[15%] h-[1px] w-full"
        style={{ backgroundColor: accent(0.08) }}
      />

      {/* Chart area (left 70%) */}
      <div className="absolute left-[5%] top-[20%] h-[70%] w-[60%]">
        {/* Horizontal grid lines */}
        <div
          aria-hidden="true"
          className="absolute left-0 top-[35%] h-[1px] w-full"
          style={{
            backgroundImage: `linear-gradient(to right, ${accent(0.06)} 50%, transparent 50%)`,
            backgroundSize: "8px 1px",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute left-0 top-[55%] h-[1px] w-full"
          style={{
            backgroundImage: `linear-gradient(to right, ${accent(0.06)} 50%, transparent 50%)`,
            backgroundSize: "8px 1px",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute left-0 top-[75%] h-[1px] w-full"
          style={{
            backgroundImage: `linear-gradient(to right, ${accent(0.06)} 50%, transparent 50%)`,
            backgroundSize: "8px 1px",
          }}
        />

        {/* SVG Chart */}
        <svg aria-hidden="true" viewBox="0 0 380 100" className="h-full w-full">
          <defs>
            <linearGradient id="dash-chart-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={accent(0.08)} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          {prefersReducedMotion ? (
            <polygon
              points={polygonPoints}
              fill="url(#dash-chart-gradient)"
              opacity={0.8}
            />
          ) : (
            <motion.polygon
              points={polygonPoints}
              fill="url(#dash-chart-gradient)"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Chart line */}
          {prefersReducedMotion ? (
            <polyline
              points={polylinePoints}
              fill="none"
              stroke={accent(0.4)}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <motion.polyline
              points={polylinePoints}
              fill="none"
              stroke={accent(0.4)}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, ease: "easeOut" }}
            />
          )}
        </svg>

        {/* Glow dots at peak points */}
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            left: "76%",
            top: "30%",
            width: "4px",
            height: "4px",
            backgroundColor: accent(0.5),
            boxShadow: `0 0 6px ${accent(0.3)}`,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            left: "87%",
            top: "25%",
            width: "4px",
            height: "4px",
            backgroundColor: accent(0.5),
            boxShadow: `0 0 6px ${accent(0.3)}`,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            left: "97%",
            top: "15%",
            width: "4px",
            height: "4px",
            backgroundColor: accent(0.5),
            boxShadow: `0 0 6px ${accent(0.3)}`,
          }}
        />
      </div>

      {/* Right sidebar metrics (30% area) */}
      <div aria-hidden="true" className="absolute right-0 top-[20%] w-[28%] space-y-3 px-3">
        {/* Metric 1: AVG */}
        <div>
          <div
            className="text-[8px] uppercase tracking-wide"
            style={{ color: accent(0.4), fontFamily: sketchFont }}
          >
            AVG
          </div>
          <div
            className="text-[14px] font-semibold"
            style={{ color: accent(0.6), fontFamily: sketchFont }}
          >
            847
          </div>
          <svg aria-hidden="true" viewBox="0 0 40 12" className="mt-1 h-3 w-10">
            <polyline
              points={sparkline1}
              fill="none"
              stroke={accent(0.15)}
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Metric 2: PEAK */}
        <div>
          <div
            className="text-[8px] uppercase tracking-wide"
            style={{ color: accent(0.4), fontFamily: sketchFont }}
          >
            PEAK
          </div>
          <div
            className="text-[14px] font-semibold"
            style={{ color: accent(0.6), fontFamily: sketchFont }}
          >
            1.2k
          </div>
          <svg aria-hidden="true" viewBox="0 0 40 12" className="mt-1 h-3 w-10">
            <polyline
              points={sparkline2}
              fill="none"
              stroke={accent(0.15)}
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Metric 3: DELTA */}
        <div>
          <div
            className="text-[8px] uppercase tracking-wide"
            style={{ color: accent(0.4), fontFamily: sketchFont }}
          >
            DELTA
          </div>
          <div
            className="text-[14px] font-semibold"
            style={{ color: accent(0.6), fontFamily: sketchFont }}
          >
            +12%
          </div>
          <svg aria-hidden="true" viewBox="0 0 40 12" className="mt-1 h-3 w-10">
            <polyline
              points={sparkline3}
              fill="none"
              stroke={accent(0.15)}
              strokeWidth="0.5"
            />
          </svg>
        </div>
      </div>

      {/* Live indicator dot (top-right) */}
      {prefersReducedMotion ? (
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            right: "16px",
            top: "16px",
            width: "6px",
            height: "6px",
            backgroundColor: accent(0.5),
            transform: "scale(1)",
            opacity: 0.5,
          }}
        />
      ) : (
        <motion.div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            right: "16px",
            top: "16px",
            width: "6px",
            height: "6px",
            backgroundColor: accent(0.5),
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Noise overlay */}
      <NoiseOverlay id="noise-04" />
    </div>
  );
}
