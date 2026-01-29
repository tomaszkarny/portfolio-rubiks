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
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]" />
    );
  }

  return (
    <div className="fixed inset-0 z-0">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0f0f1f] to-[#1a1a2e]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Neon glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
          style={{
            background: "radial-gradient(circle, #00ffff 0%, transparent 70%)",
            left: "10%",
            top: "30%",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-20"
          style={{
            background: "radial-gradient(circle, #ff00ff 0%, transparent 70%)",
            right: "10%",
            top: "40%",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-15"
          style={{
            background: "radial-gradient(circle, #00ff00 0%, transparent 70%)",
            left: "40%",
            bottom: "20%",
          }}
        />
      </div>

      {/* Three.js Canvas */}
      <div className="absolute inset-0">
        <Scene progress={currentProgress} />
      </div>
    </div>
  );
}
