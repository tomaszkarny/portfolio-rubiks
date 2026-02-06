"use client";

import { useEffect, useState, useRef, useMemo, useSyncExternalStore } from "react";
import { useSpring, useTransform, useScroll, motion, AnimatePresence } from "framer-motion";
import { Scene } from "./Scene";

// Cube position keyframes based on scroll progress
// Each section gets the cube positioned to complement content
// HERO: Cube centered and LARGE for dramatic first impression
// Positive X = right side, Negative X = left side (Three.js convention)
const POSITION_KEYFRAMES = {
  scrollPoints: [0, 0.08, 0.25, 0.45, 0.65, 0.85],
  x: [0, 0, -3, 3.5, -3.5, 0],        // Hero: CENTERED, then alternates sides
  y: [0.2, 0, -0.3, 0.5, 0, 0],       // Hero: slightly elevated, natural flow
  z: [1, 0, -3, -5, -2, 0],           // Hero: z=1 (closer!), then moves back
  scale: [1.8, 1.6, 1.3, 1.5, 1.2, 0.9], // Hero: 1.8x LARGER for impact
};

// Simple mount detection without setState in effect
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

// Shared ref type for passing animation values without React re-renders
export interface AnimationRefs {
  progress: React.MutableRefObject<number>;
  cubePosition: React.MutableRefObject<{ x: number; y: number; z: number; scale: number }>;
  scrollVelocity: React.MutableRefObject<number>;
}

export function CubeBackground() {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { scrollYProgress } = useScroll();

  // Transform scroll to progress (0 to 1) over first 85% of scroll
  const progress = useTransform(scrollYProgress, [0, 0.85], [0, 1]);

  // Apple-style ultra-smooth spring
  const smoothProgress = useSpring(progress, {
    stiffness: 35,
    damping: 20,
    restDelta: 0.0001,
    mass: 1.2,
  });

  // Cube position transforms
  const cubeX = useTransform(scrollYProgress, POSITION_KEYFRAMES.scrollPoints, POSITION_KEYFRAMES.x);
  const cubeY = useTransform(scrollYProgress, POSITION_KEYFRAMES.scrollPoints, POSITION_KEYFRAMES.y);
  const cubeZ = useTransform(scrollYProgress, POSITION_KEYFRAMES.scrollPoints, POSITION_KEYFRAMES.z);
  const cubeScale = useTransform(scrollYProgress, POSITION_KEYFRAMES.scrollPoints, POSITION_KEYFRAMES.scale);

  // Smooth cube position with springs
  const smoothCubeX = useSpring(cubeX, { stiffness: 50, damping: 25, mass: 1 });
  const smoothCubeY = useSpring(cubeY, { stiffness: 50, damping: 25, mass: 1 });
  const smoothCubeZ = useSpring(cubeZ, { stiffness: 50, damping: 25, mass: 1 });
  const smoothCubeScale = useSpring(cubeScale, { stiffness: 50, damping: 25, mass: 1 });

  // ==========================================
  // OPTIMIZATION: Refs instead of state for per-frame values
  // Eliminates ~60 React reconciliation passes/sec during scroll
  // ==========================================
  const progressRef = useRef(0);
  const cubePositionRef = useRef({
    x: POSITION_KEYFRAMES.x[0],
    y: POSITION_KEYFRAMES.y[0],
    z: POSITION_KEYFRAMES.z[0],
    scale: POSITION_KEYFRAMES.scale[0],
  });
  const scrollVelocityRef = useRef(0);
  const lastScrollRef = useRef(0);

  // Entry animation state - only state that actually needs React re-render
  const [showCube, setShowCube] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCube(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Update progress ref from Framer Motion spring - no setState
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (value) => {
      const clamped = Math.min(1, Math.max(0, value));
      scrollVelocityRef.current = (clamped - lastScrollRef.current) * 10;
      lastScrollRef.current = clamped;
      progressRef.current = clamped;
    });
    return unsubscribe;
  }, [smoothProgress]);

  // Update cube position ref from Framer Motion springs - no setState
  useEffect(() => {
    const handleChange = () => {
      const pos = cubePositionRef.current;
      pos.x = smoothCubeX.get();
      pos.y = smoothCubeY.get();
      pos.z = smoothCubeZ.get();
      pos.scale = smoothCubeScale.get();
    };

    const unsubs = [
      smoothCubeX.on("change", handleChange),
      smoothCubeY.on("change", handleChange),
      smoothCubeZ.on("change", handleChange),
      smoothCubeScale.on("change", handleChange),
    ];

    return () => { unsubs.forEach(u => u()); };
  }, [smoothCubeX, smoothCubeY, smoothCubeZ, smoothCubeScale]);

  // Stable refs object - useMemo with empty deps ensures stable identity
  const animationRefs = useMemo<AnimationRefs>(() => ({
    progress: progressRef,
    cubePosition: cubePositionRef,
    scrollVelocity: scrollVelocityRef,
  }), []);

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

      {/* Depth gradient - darker toward center for 3D depth illusion */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(
              ellipse 70% 50% at 50% 45%,
              rgba(180, 170, 155, 0.08) 0%,
              rgba(200, 190, 175, 0.04) 40%,
              transparent 70%
            )
          `,
        }}
      />

      {/* Three.js Canvas with entry animation */}
      <AnimatePresence>
        {showCube && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Scene animationRefs={animationRefs} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
