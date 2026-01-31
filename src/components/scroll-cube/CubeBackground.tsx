"use client";

import { useEffect, useState } from "react";
import { useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { Scene } from "./Scene";

export function CubeBackground() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();

  // Transform scroll to progress (0 to 1) over first 85% of scroll
  // Extended range creates more dramatic, deliberate animation pacing
  const progress = useTransform(scrollYProgress, [0, 0.85], [0, 1]);

  // Apple-style ultra-smooth spring - animation "chases" scroll for premium feel
  const smoothProgress = useSpring(progress, {
    stiffness: 35,      // Slower response - animation gracefully follows scroll
    damping: 20,        // More momentum, smoother stop
    restDelta: 0.0001,  // Higher precision for subtle movements
    mass: 1.2,          // Heavier = more deliberate, luxurious motion
  });

  // Track the current progress value
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (value) => {
      setCurrentProgress(Math.min(1, Math.max(0, value)));
    });
    return unsubscribe;
  }, [smoothProgress]);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-0 bg-[#f5f0e6]" />
    );
  }

  return (
    <div className="fixed inset-0 z-0">
      {/* Cream paper background with subtle gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #f8f4eb, #f0ebe0)",
        }}
      />

      {/* Paper texture - fine grain pattern */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.02) 2px,
              rgba(0, 0, 0, 0.02) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.015) 2px,
              rgba(0, 0, 0, 0.015) 4px
            )
          `,
        }}
      />

      {/* Paper fiber texture - diagonal lines */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(139, 119, 101, 0.03) 10px,
              rgba(139, 119, 101, 0.03) 11px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 15px,
              rgba(139, 119, 101, 0.02) 15px,
              rgba(139, 119, 101, 0.02) 16px
            )
          `,
        }}
      />

      {/* Subtle vignette for sketchbook feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(139, 119, 101, 0.15) 100%)",
        }}
      />

      {/* Three.js Canvas */}
      <div className="absolute inset-0">
        <Scene progress={currentProgress} />
      </div>
    </div>
  );
}
